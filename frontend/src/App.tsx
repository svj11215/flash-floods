import React, { useState, useEffect } from 'react';
import { apiClient } from './api/client';
import type {
  LocationData,
  IoTSensor,
  CitizenReport,
  EarlyWarningAlert,
  HistoricalEvent,
  FlashFloodWarning,
  LiveEnvironmentalData,
  OfficialImdWarning,
  Hospital
} from './types';
import { Navbar } from './components/Navbar';
import { getHospitalsForState } from './data/demoHospitals';
import { LandingPage } from './components/LandingPage';
import { FlashFloodPage } from './components/FlashFloodPage';
import { StreetWaterloggingPage } from './components/StreetWaterloggingPage';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AboutHelpPage } from './components/AboutHelpPage';
import { CommandCenter } from './components/CommandCenter';
import { CitizenReportModal } from './components/CitizenReportModal';
import { ReportPage } from './components/ReportPage';
import { EmergencyAlertRegistrationModal } from './components/EmergencyAlertRegistrationModal';
import { EmergencyAlertPage } from './components/EmergencyAlertPage';
import { onForegroundMessage } from './services/firebase';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from './services/LanguageContext';
import { DataSyncProvider, useDataSync } from './services/DataSyncContext';
import { dataSyncService } from './services/dataSyncService';

const INITIAL_DEMO_WARNING_SCENARIO_2: FlashFloodWarning = {
  id: 'warn-village-sangam-initial',
  status: 'CRITICAL',
  statusLabel: 'FLASH FLOOD WARNING',
  locationId: 'village-sangam',
  locationName: 'Village Sangam (Tributary Confluence)',
  roadName: 'Valley Riparian Corridor',
  riskLevel: 'HIGH',
  estimatedWindow: 'NEXT 1–3 HOURS',
  reason: 'Extreme upstream catchment precipitation combined with rapid tributary inflow',
  affectedAreas: [
    'Village Sangam (Lower Terraces)',
    'Tributary Sluice Channel',
    'Ghat Approach Terraces'
  ],
  actions: [
    'Immediate evacuation of low-lying riverbank homes',
    'Move to designated highland emergency shelters',
    'Do not walk or drive through flowing water',
    'Follow instructions from municipal emergency personnel (Call 112)'
  ],
  timeline: [
    { label: 'NOW', subtext: 'Surface runoff rate escalating', isTriggered: true },
    { label: 'Rainfall increasing', subtext: '68.0 mm/h inflow recorded', isTriggered: true },
    { label: 'Soil moisture rising', subtext: 'Ground saturation at 74%', isTriggered: true },
    { label: 'Tributary stress detected', subtext: 'Water level surging to +3.2m', isTriggered: true },
    { label: '⚠️ HIGH FLOOD RISK', subtext: 'NEXT 1–3 HOURS', isTriggered: true }
  ],
  timestamp: '13:30:15 IST'
};

const INITIAL_DEMO_WARNING_SCENARIO_1: FlashFloodWarning = {
  id: 'warn-village-shivpuri-heavy-rain',
  status: 'CRITICAL',
  statusLabel: 'FLASH FLOOD WARNING',
  locationId: 'village-shivpuri',
  locationName: 'Village Shivpuri (Upper Valley Riparian)',
  roadName: 'Valley Riverside Road',
  riskLevel: 'CRITICAL',
  estimatedWindow: 'NEXT 1–3 HOURS',
  reason: 'Heavy rainfall overload exceeding local riparian drainage capacity',
  affectedAreas: [
    'Village Shivpuri Valley Terraces',
    'Lower Gorge Terraces',
    'Suspension Bridge Ingress Approach'
  ],
  actions: [
    'Avoid Valley Riverside Road and low-lying river ghats',
    'Move to designated highland emergency shelters',
    'Do not walk or drive through flowing water',
    'Follow instructions from municipal emergency personnel (Call 112)'
  ],
  timeline: [
    { label: 'NOW', subtext: 'Cloudburst precipitation at 110 mm/h', isTriggered: true },
    { label: 'Rainfall increasing', subtext: 'Runoff velocity surging', isTriggered: true },
    { label: 'Soil moisture rising', subtext: 'Pore pressure saturation at 96%', isTriggered: true },
    { label: 'River surge detected', subtext: 'Channel capacity overwhelmed', isTriggered: true },
    { label: '⚠️ CRITICAL FLOOD RISK', subtext: 'NEXT 1–3 HOURS', isTriggered: true }
  ],
  timestamp: '13:30:15 IST'
};

function AppMain() {
  const { t, tr } = useTranslation();
  const sync = useDataSync();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Environmental Data State
  const [liveEnvironment, setLiveEnvironment] = useState<LiveEnvironmentalData | null>(null);
  const [officialImdWarnings, setOfficialImdWarnings] = useState<OfficialImdWarning[]>([]);

  // Other Core Data States
  const [riverNetworks, setRiverNetworks] = useState<any[]>([]);
  const [drainageLines, setDrainageLines] = useState<any[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [infrastructure, setInfrastructure] = useState<any[]>([]);
  const [historicalEvents, setHistoricalEvents] = useState<HistoricalEvent[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>(() =>
    getHospitalsForState(true, 'scenario_2_drainage_blockage', [30.104, 78.283])
  );

  // Layer Toggles
  const [activeLayers, setActiveLayers] = useState({
    floodRisk: true,
    landslideRisk: false,
    rainfall: false,
    soilMoisture: false,
    drainage: false,
    iotSensors: false,
    citizenReports: true,
    infrastructure: false,
    historicalEvents: false,
    hospitals: false
  });

  // Modal & FCM Alert States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [foregroundAlert, setForegroundAlert] = useState<{
    title: string;
    body: string;
    riskLevel?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Listen for emergency-alert URL hash/path
  useEffect(() => {
    const handleUrlChange = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('emergency-alert') || path.includes('emergency-alert')) {
        setCurrentTab('emergency-alert');
      }
    };
    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  // Listen for Service Worker postMessage on notification click
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleSwMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NAVIGATE_TO_EMERGENCY') {
          setCurrentTab('emergency-alert');
        }
      };
      navigator.serviceWorker.addEventListener('message', handleSwMessage);
      return () => navigator.serviceWorker.removeEventListener('message', handleSwMessage);
    }
  }, []);

  // Listen for foreground FCM messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || '🚨 FLASH FLOOD WARNING';
      const body = payload.notification?.body || payload.data?.body || 'Your current location is in a HIGH-RISK flood zone. Move to a safer location immediately.';
      setForegroundAlert({
        title,
        body,
        riskLevel: payload.data?.riskLevel || 'HIGH'
      });
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Active selected location depending on tab context
  const activeFocusLocation = currentTab === 'street-waterlogging'
    ? sync.selectedWard
    : (sync.selectedVillage || sync.locations[0]);

  const fetchAllData = async (targetMode?: 'LIVE' | 'DEMO', forceRefresh: boolean = false) => {
    const effectiveMode = targetMode !== undefined ? targetMode : (sync.isDemoMode ? 'DEMO' : 'LIVE');
    setIsRefreshing(true);
    try {
      const [mapRes, alertsRes, sensorsRes, histRes, liveEnvRes, hospRes] = await Promise.all([
        apiClient.getRiskMap(effectiveMode.toLowerCase()),
        apiClient.getAlerts(effectiveMode.toLowerCase()),
        apiClient.getSensors(),
        apiClient.getHistoricalEvents(),
        effectiveMode === 'LIVE' ? apiClient.getLiveEnvironment(activeFocusLocation?.id || 'village-sangam', forceRefresh) : Promise.resolve(null),
        apiClient.getHospitals(
          effectiveMode,
          sync.activeScenario,
          activeFocusLocation ? [activeFocusLocation.coordinates[0], activeFocusLocation.coordinates[1]] : [30.104, 78.283]
        )
      ]);

      if (hospRes && hospRes.hospitals) {
        setHospitals(hospRes.hospitals);
      }

      if (mapRes && mapRes.locations && mapRes.locations.length > 0) {
        // Merge with existing rich village/ward data if backend returned partial list
        const mergedLocations = mapRes.locations.length >= sync.locations.length
          ? mapRes.locations
          : sync.locations.map(existing => {
              const fromBackend = mapRes.locations.find((l: any) => l.id === existing.id);
              return fromBackend ? { ...existing, ...fromBackend } : existing;
            });
        sync.setLocations(mergedLocations);
        setRiverNetworks(mapRes.river_networks || []);
        setDrainageLines(mapRes.drainage_lines || []);
        setInfrastructure(mapRes.critical_infrastructure || []);
      }

      if (alertsRes && alertsRes.alerts) {
        if (alertsRes.official_imd_warnings) {
          setOfficialImdWarnings(alertsRes.official_imd_warnings);
        }
      }

      if (effectiveMode === 'LIVE') {
        if (liveEnvRes) {
          setLiveEnvironment(liveEnvRes);
        }
        const criticalAlert = alertsRes?.alerts?.find((a: any) => a.severity === 'CRITICAL' || a.severity === 'WARNING');
        if (criticalAlert) {
          sync.setActiveFlashWarning({
            id: criticalAlert.alert_id,
            status: criticalAlert.severity as any,
            statusLabel: 'FLASH FLOOD WARNING',
            locationId: criticalAlert.location_id,
            locationName: criticalAlert.location_name,
            roadName: 'Main Valley Corridor',
            riskLevel: criticalAlert.severity as any,
            estimatedWindow: criticalAlert.expected_window,
            reason: criticalAlert.cause_explanation,
            affectedAreas: [criticalAlert.location_name, 'Low-lying riparian valley reach'],
            actions: criticalAlert.recommended_actions?.map((a: any) => a.title) || ['Avoid low-lying roadways', 'Follow safety guidelines'],
            timeline: [
              { label: 'NOW', subtext: 'External telemetry active', isTriggered: true },
              { label: 'Inflow rate monitored', subtext: 'Real-time observation', isTriggered: true }
            ],
            timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
          });
        }
      }

      if (sensorsRes && sensorsRes.sensors) {
        setSensors(sensorsRes.sensors);
      }

      if (histRes && histRes.events) {
        setHistoricalEvents(histRes.events);
      }
    } catch (err) {
      console.error('Error fetching disaster intelligence data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleModeChange = async (newModeIsDemo: boolean) => {
    sync.setMode(newModeIsDemo);
    setIsRefreshing(true);
    try {
      await apiClient.setMode(newModeIsDemo ? 'DEMO' : 'LIVE');
      await fetchAllData(newModeIsDemo ? 'DEMO' : 'LIVE', true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleScenarioChange = async (scenario: string) => {
    let warning: FlashFloodWarning | null = null;
    if (scenario === 'scenario_1_heavy_rainfall') {
      warning = INITIAL_DEMO_WARNING_SCENARIO_1;
    } else if (scenario === 'scenario_2_drainage_blockage') {
      warning = INITIAL_DEMO_WARNING_SCENARIO_2;
    }

    sync.setScenario(scenario, warning);

    try {
      await apiClient.switchScenario(scenario);
      fetchAllData();
    } catch (err) {
      console.error('Failed to switch scenario:', err);
    }
  };

  const handleApplySimulatorWarning = (warning: FlashFloodWarning, updatedLoc: LocationData) => {
    sync.applySimulatorWarning(warning, updatedLoc);
  };

  const handleResetSimulation = () => {
    sync.resetSimulation();
    handleScenarioChange('baseline');
  };

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };

  // Keep hospital distances synchronized with active focus location
  useEffect(() => {
    const coords: [number, number] = activeFocusLocation
      ? [activeFocusLocation.coordinates[0], activeFocusLocation.coordinates[1]]
      : [30.104, 78.283];
    apiClient.getHospitals(sync.isDemoMode ? 'DEMO' : 'LIVE', sync.activeScenario, coords).then(res => {
      if (res && res.hospitals) {
        setHospitals(res.hospitals);
      }
    });
  }, [activeFocusLocation?.id, sync.isDemoMode, sync.activeScenario]);

  // Calculate active alerts count including flash warning
  const activeAlertsCount = (sync.activeFlashWarning && sync.activeFlashWarning.status !== 'NONE' ? 1 : 0) +
    sync.alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'WARNING').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Streamlined Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDemoMode={sync.isDemoMode}
        setIsDemoMode={handleModeChange}
        activeScenario={sync.activeScenario}
        onScenarioChange={handleScenarioChange}
        activeAlertsCount={activeAlertsCount}
        lastUpdated={sync.lastUpdated}
        lastObservedTime={liveEnvironment?.observed_at}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchAllData(undefined, true)}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAlertRegistration={() => setIsAlertModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
            <div className="font-bold text-sm">{tr('Syncing Local Flood Risk & Sensor Network...')}</div>
          </div>
        ) : (
          <>
            {/* 1. HOME TAB */}
            {currentTab === 'home' && (
              <LandingPage
                locations={sync.locations}
                selectedLocation={sync.selectedVillage || sync.locations[0]}
                activeFlashWarning={sync.activeFlashWarning}
                lastUpdated={sync.lastUpdated}
                isDemoMode={sync.isDemoMode}
                liveEnvironment={liveEnvironment}
                onNavigateToFlashFlood={() => setCurrentTab('flash-flood')}
                onNavigateToStreetWaterlogging={() => setCurrentTab('street-waterlogging')}
                onNavigateToMap={() => setCurrentTab('flash-flood')}
                onNavigateToReport={() => setCurrentTab('report')}
              />
            )}

            {/* 2. FLASH FLOOD MONITORING TAB (Village-Wise) */}
            {currentTab === 'flash-flood' && (
              <FlashFloodPage
                locations={sync.locations}
                selectedLocation={sync.selectedVillage}
                onSelectLocation={(loc) => {
                  sync.setSelectedVillageId(loc.id);
                }}
                riverNetworks={riverNetworks}
                sensors={sensors}
                activeFlashWarning={sync.activeFlashWarning}
                historicalEvents={historicalEvents}
                officialImdWarnings={officialImdWarnings}
                hospitals={hospitals}
                isDemoMode={sync.isDemoMode}
                onNavigateToReport={() => setCurrentTab('report')}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
              />
            )}

            {/* 3. STREET WATERLOGGING TAB (Ward-Wise) */}
            {currentTab === 'street-waterlogging' && (
              <StreetWaterloggingPage
                locations={sync.locations}
                selectedLocation={sync.selectedWard}
                onSelectLocation={(loc) => {
                  sync.setSelectedWardId(loc.id);
                }}
                drainageLines={drainageLines}
                sensors={sensors}
                citizenReports={sync.citizenReports}
                isDemoMode={sync.isDemoMode}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
              />
            )}

            {/* 4. REPORT PAGE TAB */}
            {currentTab === 'report' && (
              <ReportPage
                locations={sync.locations}
                selectedLocation={activeFocusLocation}
                onReportSubmitted={fetchAllData}
                onNavigateToMap={() => setCurrentTab('flash-flood')}
                onNavigateHome={() => setCurrentTab('home')}
              />
            )}

            {/* 5. SIMULATOR TAB */}
            {currentTab === 'simulator' && (
              <ScenarioSimulator
                locations={sync.locations}
                onApplyWarning={handleApplySimulatorWarning}
                onResetSimulation={handleResetSimulation}
                onNavigateToMap={() => setCurrentTab('flash-flood')}
                onNavigateToFlashFlood={() => setCurrentTab('flash-flood')}
                onNavigateToStreetWaterlogging={() => setCurrentTab('street-waterlogging')}
              />
            )}

            {/* 6. EMERGENCY FLOOD ALERT TAB */}
            {currentTab === 'emergency-alert' && (
              <EmergencyAlertPage
                locations={sync.locations}
                activeWarning={sync.activeFlashWarning}
                onNavigateHome={() => setCurrentTab('home')}
                onNavigateToSimulator={() => setCurrentTab('simulator')}
              />
            )}

            {/* 7. ABOUT / HELP TAB */}
            {currentTab === 'about' && (
              <AboutHelpPage
                onNavigateToFlashFlood={() => setCurrentTab('flash-flood')}
                onNavigateToStreetWaterlogging={() => setCurrentTab('street-waterlogging')}
                onNavigateToReport={() => setCurrentTab('report')}
              />
            )}

            {/* 8. RESPONSE CENTER (AUTHORITY TAB: Operations Center + EOC) */}
            {currentTab === 'response-center' && (
              <CommandCenter
                locations={sync.locations}
                selectedLocation={activeFocusLocation || sync.locations[0]}
                onSelectLocation={(loc) => {
                  if (loc.type === 'VILLAGE') sync.setSelectedVillageId(loc.id);
                  else sync.setSelectedWardId(loc.id);
                }}
                riverNetworks={riverNetworks}
                drainageLines={drainageLines}
                sensors={sensors}
                citizenReports={sync.citizenReports}
                infrastructure={infrastructure}
                historicalEvents={historicalEvents}
                alerts={sync.alerts}
                activeFlashWarning={sync.activeFlashWarning}
                onApplyWarning={handleApplySimulatorWarning}
                onResetSimulation={handleResetSimulation}
                activeLayers={activeLayers}
                onToggleLayer={handleToggleLayer}
                onNavigateTab={setCurrentTab}
                onOpenReportModal={() => setIsReportModalOpen(true)}
                hospitals={hospitals}
                isDemoMode={sync.isDemoMode}
                activeScenario={sync.activeScenario}
              />
            )}
          </>
        )}
      </main>

      {/* Citizen Waterlogging Report Modal */}
      <CitizenReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        locations={sync.locations}
        onReportSubmitted={fetchAllData}
      />

      {/* RESQ Emergency Alert Registration Modal */}
      <EmergencyAlertRegistrationModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
      />

      {/* Foreground Notification Toast */}
      {foregroundAlert && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-red-600 text-white p-4 rounded-xl shadow-2xl border-2 border-red-400">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-black text-sm uppercase tracking-wide flex items-center gap-1.5">
                <span>🚨</span> {foregroundAlert.title}
              </div>
              <p className="text-xs text-red-100 mt-1 font-medium">{foregroundAlert.body}</p>
            </div>
            <button
              onClick={() => setForegroundAlert(null)}
              className="text-white hover:bg-red-700 p-1 rounded font-bold text-xs"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => {
                setForegroundAlert(null);
                setCurrentTab('emergency-alert');
              }}
              className="text-xs font-bold bg-white text-red-700 px-3 py-1.5 rounded-lg shadow hover:bg-red-50"
            >
              View Emergency Warning & Evacuation
            </button>
          </div>
        </div>
      )}

      {/* Professional Disaster Management Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="font-black text-white font-mono text-sm tracking-wide">JALRAKSHAK</span>
            <span>—</span>
            <span>{t.knowRiskActEarly}</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span>{tr('Emergency Helpline: 112')}</span>
            <span>•</span>
            <span>{tr('Municipal Disaster Management Cell')}</span>
            <span>•</span>
            <button
              onClick={() => setCurrentTab('response-center')}
              className="text-sky-400 hover:underline font-semibold cursor-pointer"
            >
              {tr('Authority Center (EOC / Simulator)')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <DataSyncProvider>
      <AppMain />
    </DataSyncProvider>
  );
}

export default App;
