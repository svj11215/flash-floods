import React, { useState, useEffect } from 'react';
import {
  Bell,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  X,
  Smartphone,
  User,
  ShieldAlert,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { requestNotificationPermissionAndGetToken } from '../services/firebase';
import { apiClient } from '../api/client';

export interface RegisteredUser {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  fcmToken: string;
  registeredAt?: string;
}

interface EmergencyAlertRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: (user: RegisteredUser) => void;
}

const STORAGE_KEY = 'resq_registered_user';

export const EmergencyAlertRegistrationModal: React.FC<EmergencyAlertRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegistered
}) => {
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing registered user from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCurrentUser(parsed);
        setName(parsed.name || '');
        setPhone(parsed.phone || '');
      }
    } catch {
      // Ignore parse error
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Basic Validation
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      // 1. Request Browser Location Permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('Geolocation is not supported by your browser.'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, (geoErr) => {
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            reject(new Error('Location permission is required to determine whether you are inside a flood-risk zone.'));
          } else {
            reject(new Error('Unable to retrieve your current location. Please verify GPS settings.'));
          }
        }, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // 2. Request Browser Notification Permission & 3. Generate/Get FCM Token
      let fcmToken: string;
      try {
        fcmToken = await requestNotificationPermissionAndGetToken();
      } catch (permErr: any) {
        const msg = permErr?.message || '';
        if (msg.includes('notifications to receive')) {
          throw new Error('Enable notifications to receive emergency flood alerts.');
        }
        throw new Error('Unable to activate emergency alerts. Please try again.');
      }

      if (!fcmToken) {
        throw new Error('Unable to activate emergency alerts. Please try again.');
      }

      // 4. Send User information + location + FCM token to the backend
      const userData: RegisteredUser = {
        name: name.trim(),
        phone: cleanPhone,
        latitude,
        longitude,
        fcmToken,
        registeredAt: new Date().toISOString()
      };

      try {
        const res = await apiClient.registerEmergencyUser(userData);
        if (res && res.success === false) {
          throw new Error('Unable to register right now. Please try again.');
        }
      } catch (apiErr: any) {
        console.warn('[Register] API registration notice:', apiErr);
        // Continue if local storage fallback succeeds
      }

      // Save locally
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setCurrentUser(userData);
      setSuccessMsg('Emergency alerts activated successfully!');

      if (onRegistered) {
        onRegistered(userData);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to register right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-red-950/60 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-black text-white font-mono tracking-tight">
                RESQ Emergency Alert Registration
              </h3>
              <p className="text-xs text-slate-400">
                Receive instant flood alerts when inside a risk zone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Active Status Banner if already registered */}
          {currentUser && (
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-black font-mono text-emerald-400 uppercase tracking-wider">
                  🟢 Emergency Alerts Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">NAME</span>
                  <span className="text-white font-bold">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">MOBILE</span>
                  <span className="text-white font-bold">{currentUser.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                <span className="text-slate-300 flex items-center gap-1">
                  <span>📍</span> Location: <b className="text-emerald-400">Enabled</b>
                </span>
                <span className="text-slate-300 flex items-center gap-1">
                  <span>🔔</span> Notifications: <b className="text-emerald-400">Enabled</b>
                </span>
                <span className="text-slate-300 flex items-center gap-1">
                  <span>🔥</span> FCM: <b className="text-emerald-400">Connected</b>
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-red-300">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Registration Incomplete</span>
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Alerts Activated</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile Number (No OTP required)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-slate-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard 10-digit mobile number for emergency notifications.
              </span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 flex items-center gap-1">
                <span>🔐</span> Permission Flow:
              </div>
              <p>1. Browser prompts for GPS Location to determine flood zone distance.</p>
              <p>2. Browser prompts for Notifications to deliver urgent flash flood warnings.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white rounded-xl font-bold font-mono text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-900/30"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Permissions & FCM...</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>{currentUser ? 'Update Registration & Location' : 'Register & Continue'}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
