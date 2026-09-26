const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// 1. FIREBASE ADMIN SDK CONFIGURATION
// ==========================================
let firebaseAdminInitialized = false;

// Helper to safely parse FIREBASE_SERVICE_ACCOUNT (JSON string, escaped JSON, or Base64)
function parseServiceAccountString(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let str = raw.trim();

  // Strip enclosing single or double quotes
  if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1).trim();
  }

  // Handle escaped JSON string (e.g. \"type\": \"service_account\")
  if (str.includes('\\"')) {
    try {
      str = JSON.parse(`"${str}"`);
    } catch (_) {}
  }

  // Direct JSON
  if (str.startsWith('{')) {
    try {
      return JSON.parse(str);
    } catch (e) {
      try {
        const normalized = str.replace(/\r\n/g, '\\n').replace(/\n/g, '\\n');
        return JSON.parse(normalized);
      } catch (_) {}
    }
  }

  // Base64 encoded JSON
  try {
    const decoded = Buffer.from(str, 'base64').toString('utf8');
    if (decoded.trim().startsWith('{')) {
      return JSON.parse(decoded);
    }
  } catch (_) {}

  return null;
}

// Helper to resolve local service account file path
function resolveServiceAccountPath() {
  const candidates = [];
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const custom = process.env.FIREBASE_SERVICE_ACCOUNT_PATH.trim();
    candidates.push(custom);
    candidates.push(path.resolve(process.cwd(), custom));
    candidates.push(path.resolve(__dirname, custom));
  }
  candidates.push(path.join(__dirname, 'serviceAccountKey.json'));
  candidates.push(path.join(process.cwd(), 'serviceAccountKey.json'));
  candidates.push(path.join(__dirname, '..', 'serviceAccountKey.json'));

  for (const c of candidates) {
    try {
      if (c && fs.existsSync(c)) {
        return c;
      }
    } catch (_) {}
  }
  return null;
}

function initFirebaseAdmin() {
  if (admin.apps.length > 0) {
    firebaseAdminInitialized = true;
    return;
  }

  // 1. Production precedence: FIREBASE_SERVICE_ACCOUNT environment variable (JSON string or Base64)
  if (process.env.FIREBASE_SERVICE_ACCOUNT && process.env.FIREBASE_SERVICE_ACCOUNT.trim()) {
    try {
      const parsed = parseServiceAccountString(process.env.FIREBASE_SERVICE_ACCOUNT);
      if (parsed && (parsed.project_id || parsed.projectId)) {
        if (parsed.private_key && typeof parsed.private_key === 'string') {
          parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
        }
        admin.initializeApp({
          credential: admin.credential.cert(parsed)
        });
        firebaseAdminInitialized = true;
        console.log(`🔥 [Firebase Admin] Initialized from production FIREBASE_SERVICE_ACCOUNT (Project: ${parsed.project_id || parsed.projectId})`);
        return;
      }
    } catch (err) {
      console.warn(`⚠️ [Firebase Admin] Error initializing from FIREBASE_SERVICE_ACCOUNT:`, err.message);
    }
  }

  // 2. Local precedence: FIREBASE_SERVICE_ACCOUNT_PATH or local serviceAccountKey.json file
  const keyPath = resolveServiceAccountPath();
  if (keyPath && fs.existsSync(keyPath)) {
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdminInitialized = true;
      console.log(`🔥 [Firebase Admin] Initialized from ${path.basename(keyPath)} (Project: ${serviceAccount.project_id})`);
      return;
    } catch (err) {
      console.warn(`⚠️ [Firebase Admin] Error initializing from ${keyPath}:`, err.message);
    }
  }

  // 3. Fallback: Individual environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        })
      });
      firebaseAdminInitialized = true;
      console.log(`🔥 [Firebase Admin] Initialized from individual environment variables (Project: ${process.env.FIREBASE_PROJECT_ID})`);
      return;
    } catch (err) {
      console.warn('⚠️ [Firebase Admin] Error initializing from individual env vars:', err.message);
    }
  }

  // 4. Default Application Credentials fallback
  try {
    admin.initializeApp();
    firebaseAdminInitialized = true;
    console.log('🔥 [Firebase Admin] Initialized with Application Default Credentials');
  } catch (err) {
    console.warn('⚠️ [Firebase Admin] Notice: Firebase credentials not yet provided or invalid. Running in Simulation/Demo mode for hackathon testing.');
    console.warn('   Add serviceAccountKey.json to backend-node/ or set FIREBASE_SERVICE_ACCOUNT in Render / .env.');
    firebaseAdminInitialized = false;
  }
}

initFirebaseAdmin();

// ==========================================
// 2. MONGODB & IN-MEMORY STORAGE
// ==========================================
let isMongoConnected = false;
let UserModel = null;
const inMemoryUsers = new Map(); // fallback memory store keyed by phone

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resq_flood';

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
}).then(() => {
  isMongoConnected = true;
  console.log('🍃 [MongoDB] Connected to database at', MONGODB_URI);

  const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    fcmToken: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
  });

  UserModel = mongoose.model('User', UserSchema);
}).catch((err) => {
  console.log('ℹ️  [MongoDB] Not connected (' + err.message + '). Operating with in-memory store for instant demonstration.');
});

// Helper to save or update user
async function saveOrUpdateUser(userData) {
  const { name, phone, latitude, longitude, fcmToken } = userData;
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');

  if (isMongoConnected && UserModel) {
    return await UserModel.findOneAndUpdate(
      { phone: cleanPhone },
      { name, phone: cleanPhone, latitude, longitude, fcmToken, updatedAt: new Date() },
      { upsert: true, new: true }
    );
  } else {
    // In-memory fallback
    const record = {
      name,
      phone: cleanPhone,
      latitude: Number(latitude),
      longitude: Number(longitude),
      fcmToken,
      updatedAt: new Date().toISOString()
    };
    inMemoryUsers.set(cleanPhone, record);
    return record;
  }
}

// Helper to get all registered users
async function getAllUsers() {
  if (isMongoConnected && UserModel) {
    return await UserModel.find({});
  } else {
    return Array.from(inMemoryUsers.values());
  }
}

// ==========================================
// 3. GEOLOCATION RADIUS CHECK (Haversine)
// ==========================================
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==========================================
// 4. REUSABLE FCM NOTIFICATION FUNCTION
// ==========================================
/**
 * Sends a flood emergency alert to a specific registered user via Firebase Cloud Messaging
 */
async function sendFloodAlert(user, alertData = {}) {
  const token = user.fcmToken;
  if (!token) {
    throw new Error('User has no registered FCM token');
  }

  const title = alertData.title || '🚨 FLASH FLOOD WARNING';
  const body = alertData.body || 'Your current location is in a HIGH-RISK flood zone. Move to a safer location immediately.';
  const riskLevel = alertData.riskLevel || 'HIGH';
  const clickActionUrl = alertData.url || '/emergency-alert';

  // Construct standard FCM Multi-platform Message Payload
  const message = {
    token: token,
    notification: {
      title: title,
      body: body
    },
    data: {
      title: title,
      body: body,
      riskLevel: riskLevel,
      riskZone: alertData.riskZoneName || 'Lowland Valley Basin',
      url: clickActionUrl,
      timestamp: String(Date.now())
    },
    android: {
      priority: 'high',
      notification: {
        channelId: 'emergency_flood_alerts',
        title: title,
        body: body,
        sound: 'default',
        priority: 'max',
        defaultVibrateTimings: true,
        notificationPriority: 'PRIORITY_MAX',
        visibility: 'PUBLIC',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
      }
    },
    webpush: {
      headers: {
        Urgency: 'high'
      },
      notification: {
        title: title,
        body: body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'resq-flash-flood-warning',
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 400],
        data: {
          url: clickActionUrl,
          riskLevel: riskLevel
        }
      },
      fcmOptions: {
        link: clickActionUrl
      }
    }
  };

  if (!firebaseAdminInitialized) {
    console.log(`[Mock FCM Dispatch] Simulated push to user ${user.name} (${user.phone}) - Token: ${token.substring(0, 12)}...`);
    return {
      success: true,
      mode: 'SIMULATION_DISPATCH',
      messageId: `mock-msg-${Date.now()}`,
      user: user.name,
      phone: user.phone
    };
  }

  try {
    const response = await admin.messaging().send(message);
    console.log(`🔥 [FCM Sent] Notification dispatched to ${user.name} (${user.phone}) - ID: ${response}`);
    return {
      success: true,
      mode: 'FCM_LIVE',
      messageId: response,
      user: user.name,
      phone: user.phone
    };
  } catch (fcmError) {
    console.error(`❌ [FCM Error] Failed sending to ${user.name}:`, fcmError.message);
    return {
      success: false,
      error: fcmError.message,
      user: user.name,
      phone: user.phone
    };
  }
}

// ==========================================
// 5. API ROUTES
// ==========================================

// Health Checks: /, /health, /api/health
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'RESQ Emergency Flood Notification Server',
    firebaseAdmin: firebaseAdminInitialized ? 'ACTIVE' : 'SIMULATION_MODE',
    database: isMongoConnected ? 'MONGODB_CONNECTED' : 'IN_MEMORY_STORE',
    registeredUsersCount: inMemoryUsers.size
  });
});

// User Registration: POST /api/users/register
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, phone, latitude, longitude, fcmToken } = req.body;

    if (!name || !phone || latitude === undefined || longitude === undefined || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, phone, latitude, longitude, and fcmToken are required.'
      });
    }

    const savedUser = await saveOrUpdateUser({
      name,
      phone,
      latitude: Number(latitude),
      longitude: Number(longitude),
      fcmToken
    });

    console.log(`✅ [Registered User] ${name} | Phone: ${phone} | Loc: [${latitude}, ${longitude}]`);

    return res.status(200).json({
      success: true,
      message: 'User registered successfully for emergency flood alerts.',
      user: savedUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to register right now. Please try again.'
    });
  }
});

// Get Registered Users: GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger Emergency Flood Alert: POST /api/alerts/trigger
app.post('/api/alerts/trigger', async (req, res) => {
  try {
    const { riskLevel = 'HIGH', riskZone } = req.body;

    // Default reference risk zone if not provided: Village Sangam Lowlands (30.1040, 78.2830)
    // Or Mumbai Lowlands if Mumbai coordinates are sent
    const targetZone = riskZone || {
      name: 'Village Sangam / Lowland Basin',
      latitude: 30.1040,
      longitude: 78.2830,
      radiusKm: 25.0 // generous radius so local test device is in geofence
    };

    const users = await getAllUsers();
    const results = [];
    let usersInRiskZoneCount = 0;
    let notificationsSentCount = 0;

    for (const user of users) {
      // Calculate distance from user to the center of the risk zone
      const distKm = calculateDistanceKm(
        user.latitude,
        user.longitude,
        targetZone.latitude,
        targetZone.longitude
      );

      const radius = Number(targetZone.radiusKm || 25.0);
      const isInside = distKm <= radius;

      if (isInside) {
        usersInRiskZoneCount++;
        // Send FCM Notification
        const sendResult = await sendFloodAlert(user, {
          title: '🚨 FLASH FLOOD WARNING',
          body: 'Your current location is in a HIGH-RISK flood zone. Move to a safer location immediately.',
          riskLevel: riskLevel,
          riskZoneName: targetZone.name,
          url: '/emergency-alert'
        });

        if (sendResult.success) {
          notificationsSentCount++;
        }

        results.push({
          user: user.name,
          phone: user.phone,
          distanceKm: Number(distKm.toFixed(2)),
          insideZone: true,
          fcmResult: sendResult
        });
      } else {
        results.push({
          user: user.name,
          phone: user.phone,
          distanceKm: Number(distKm.toFixed(2)),
          insideZone: false,
          reason: `User is outside risk zone radius (${distKm.toFixed(1)} km > ${radius} km)`
        });
      }
    }

    console.log(`🚨 [Flood Alert Triggered] Risk Level: ${riskLevel} | Zone: ${targetZone.name} | Inside: ${usersInRiskZoneCount} | Sent: ${notificationsSentCount}`);

    return res.status(200).json({
      success: true,
      message: '🚨 Emergency Alert Triggered',
      riskLevel: riskLevel,
      riskZone: targetZone,
      totalRegisteredUsers: users.length,
      usersInRiskZone: usersInRiskZoneCount,
      notificationsSent: notificationsSentCount,
      results: results
    });
  } catch (error) {
    console.error('Trigger alert error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 RESQ Node.js Emergency Notification Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Endpoints available:`);
  console.log(`   - POST http://localhost:${PORT}/api/users/register`);
  console.log(`   - GET  http://localhost:${PORT}/api/users`);
  console.log(`   - POST http://localhost:${PORT}/api/alerts/trigger`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
});
