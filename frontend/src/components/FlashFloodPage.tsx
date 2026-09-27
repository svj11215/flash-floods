import React, { useState, useMemo, useEffect } from 'react';
import type {
  LocationData,
  FlashFloodWarning,
  RiskLevel,
  IoTSensor,
  HistoricalEvent,
  OfficialImdWarning,
  Hospital
} from '../types';
import { useTranslation } from '../services/LanguageContext';
import { DisasterMap } from './Map/DisasterMap';
import { FlashFloodWarningCard } from './FlashFloodWarningCard';
import { HospitalCapacityPanel } from './HospitalCapacityPanel';
import { LocationSafetyModal } from './LocationSafetyModal';
import {
  calculateFloodSpreadSimulation,
  type FloodSpreadStageKey,
  type FloodSpreadSimulation
} from '../services/floodSpreadService';
import {
  ShieldCheck,
  ArrowRight,
  Home,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface FlashFloodPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  riverNetworks: any[];
  sensors: IoTSensor[];
  activeFlashWarning: FlashFloodWarning | null;
  historicalEvents?: HistoricalEvent[];
  officialImdWarnings?: OfficialImdWarning[];
  hospitals?: Hospital[];
  isDemoMode?: boolean;
  onNavigateToReport: () => void;
  onNavigateToSimulator?: () => void;
}

export const FlashFloodPage: React.FC<FlashFloodPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  riverNetworks,
  sensors,
  activeFlashWarning,
  historicalEvents = [],
  officialImdWarnings = [],
  hospitals = [],
  isDemoMode = true,
  onNavigateToReport
}) => {
  const { t } = useTranslation();
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [warningScope, setWarningScope] = useState<'village' | 'ward'>('village');
  const [selectedVillageId, setSelectedVillageId] = useState<string>(
    selectedLocation?.type === 'VILLAGE' ? selectedLocation.id : 'village-sangam'
  );
  const [selectedWardId, setSelectedWardId] = useState<string>(
    selectedLocation?.type === 'WARD' ? selectedLocation.id : 'ward-04'
  );

  // Sync internal state when selectedLocation updates from parent (e.g. simulator)
  useEffect(() => {
    if (selectedLocation) {
      if (selectedLocation.type === 'VILLAGE') {
        setSelectedVillageId(selectedLocation.id);
      } else if (selectedLocation.type === 'WARD') {
        setSelectedWardId(selectedLocation.id);
      }
    }
  }, [selectedLocation]);

  const villages = useMemo(() => {
    const vList = locations.filter(l => l.type === 'VILLAGE');
    return vList.length > 0 ? vList : locations;
  }, [locations]);

  const wards = useMemo(() => {
    return locations.filter(l => l.type === 'WARD');
  }, [locations]);

  const activeVillage = useMemo(() => {
    return locations.find(l => l.id === selectedVillageId && l.type === 'VILLAGE')
      || (selectedLocation && selectedLocation.type === 'VILLAGE' ? selectedLocation : null)
      || villages.find(v => v.id === selectedVillageId)
      || villages[0]
      || ({
        id: 'village-sangam',
        name: 'Village Sangam (Tributary Confluence)',
        type: 'VILLAGE',
        risk_level: 'LOW',
        rainfall: 25,
        soil_moisture: 35,
        slope: 9.2,
        sensor_water_level: 1.8
      } as LocationData);
  }, [locations, selectedVillageId, selectedLocation, villages]);

  const activeFocusLocation = useMemo(() => {
    if (warningScope === 'village') {
      return locations.find(l => l.id === selectedVillageId && l.type === 'VILLAGE')
        || (selectedLocation && selectedLocation.type === 'VILLAGE' ? selectedLocation : null)
        || villages.find(v => v.id === selectedVillageId)
        || villages[0]
        || activeVillage;
    } else {
      return locations.find(l => l.id === selectedWardId && l.type === 'WARD')
        || (selectedLocation && selectedLocation.type === 'WARD' ? selectedLocation : null)
        || wards.find(w => w.id === selectedWardId)
        || wards[0]
        || locations[0];
    }
  }, [warningScope, locations, selectedVillageId, selectedWardId, selectedLocation, villages, wards, activeVillage]);

  // Construct dynamic warning for the selected location (Village-wise or Ward-wise)
  const displayedWarning: FlashFloodWarning | null = useMemo(() => {
    if (!isDemoMode) return null;
    if (!activeFocusLocation) return activeFlashWarning;

    const loc = activeFocusLocation;
    const isVillage = warningScope === 'village';

    // If an active simulator warning belongs to this exact location, respect its customized data
    if (activeFlashWarning && activeFlashWarning.locationId === loc.id) {
      return activeFlashWarning;
    }

    const risk: RiskLevel = ((loc.risk_level as RiskLevel) || 'LOW');
    const rainfall = typeof loc.rainfall === 'number' ? loc.rainfall : 25;
    const soilMoisture = typeof loc.soil_moisture === 'number' ? loc.soil_moisture : 35;
    const waterLevel = typeof loc.sensor_water_level === 'number' ? loc.sensor_water_level : (
      risk === 'CRITICAL' ? 4.8 : risk === 'HIGH' ? 3.8 : risk === 'MODERATE' ? 2.8 : 1.8
    );

    let status: 'LOW' | 'WATCH' | 'WARNING' | 'CRITICAL' = 'LOW';
    let statusLabel = isVillage ? 'NORMAL MONITORING / LOW RISK (VILLAGE-WISE)' : 'NORMAL MONITORING / LOW RISK (WARD-WISE)';
    let estimatedWindow = 'No Imminent Threat / Safe';
    let reason = '';
    let affectedAreas: string[] = [];
    let actions: string[] = [];
    let timeline: { label: string; subtext: string; isTriggered: boolean }[] = [];

    if (risk === 'CRITICAL') {
      status = 'CRITICAL';
      statusLabel = isVillage ? 'FLASH FLOOD WARNING (VILLAGE-WISE)' : 'FLASH FLOOD WARNING (WARD-WISE)';
      estimatedWindow = loc.expected_window || 'Immediate / Next 1–3 Hours';
      reason = isVillage
        ? `Torrential cloudburst rain (${rainfall.toFixed(0)} mm/hr) has triggered dangerous flash floods. Rivers and hill streams are rapidly overflowing their banks.`
        : `Extreme downpour (${rainfall.toFixed(0)} mm/hr) is causing severe flash flooding and rapid street torrents across low-lying roads.`;
      affectedAreas = isVillage
        ? [
            `${loc.name} (Lower Terraces & Floodplain Homes)`,
            'Tributary Sluice Channel & River Ghat (Submerged)',
            'Suspension bridge ingress approach'
          ]
        : [
            loc.name,
            'Low-lying riparian valley reach & underpasses',
            'Riverfront causeways'
          ];
      actions = isVillage
        ? [
            'Evacuate now: families near the river must move to upper shelters immediately',
            'Move cattle, family members, and essential belongings to higher safe ground',
            'Never try to cross rope bridges, flooded roads, or fast-moving river water',
            'Follow emergency announcements and call 112 if you need rescue help'
          ]
        : [
            'Move to upper floors or nearby safe community shelters immediately',
            'Stay completely away from flooded streets, underpasses, and open drains',
            'Switch off main electricity breakers if water enters your home',
            'Call 112 immediately for emergency rescue and help'
          ];
      timeline = [
        { label: 'NOW', subtext: isVillage ? `River gauge telemetry critical (${waterLevel.toFixed(1)}m surge)` : 'External telemetry active', isTriggered: true },
        { label: isVillage ? 'Tributary inflow rate monitored' : 'Inflow rate monitored', subtext: `${rainfall.toFixed(0)} mm/h cloudburst inflow recorded`, isTriggered: true },
        { label: 'Ground saturation', subtext: `Soil moisture at ${soilMoisture}% capacity (Fully saturated)`, isTriggered: true },
        { label: '🔴 CRITICAL FLOOD RISK', subtext: estimatedWindow, isTriggered: true }
      ];
    } else if (risk === 'HIGH') {
      status = 'WARNING';
      statusLabel = isVillage ? 'FLOOD WARNING (VILLAGE-WISE)' : 'FLOOD WARNING (WARD-WISE)';
      estimatedWindow = loc.expected_window || 'Next 1–3 Hours';
      reason = isVillage
        ? `Heavy rainfall (${rainfall.toFixed(0)} mm/hr) is causing rapid river surges. High chance of fast-moving flash floods along riverbanks and low crossings.`
        : `Heavy rainfall (${rainfall.toFixed(0)} mm/hr) is rapidly flooding roads, underpasses, and low areas.`;
      affectedAreas = isVillage
        ? [
            `${loc.name} (Lower Terraces & River Ghat)`,
            'Tributary Sluice Channel (Crest Level)',
            'Suspension bridge approach roads'
          ]
        : [
            loc.name,
            'Low-lying underpasses & arterial roads',
            'Riverfront causeways'
          ];
      actions = isVillage
        ? [
            'Get ready to move: families in low-lying river areas should prepare to evacuate',
            'Move cattle, stored grain, and vulnerable family members to higher ground',
            'Stay away from swollen river banks, low crossings, and footbridges',
            'Follow village Gram Panchayat alerts and call 112 for emergency help'
          ]
        : [
            'Avoid flooded roads and underpasses; use higher alternate roads',
            'Help elderly family members and move vehicles to higher parking areas',
            'Avoid unnecessary travel until road water recedes',
            'Follow city emergency alerts and call 112 if you need help'
          ];
      timeline = [
        { label: 'NOW', subtext: isVillage ? `River gauge surge alert (${waterLevel.toFixed(1)}m level)` : 'External telemetry alert', isTriggered: true },
        { label: isVillage ? 'Tributary inflow rate monitored' : 'Inflow rate monitored', subtext: `${rainfall.toFixed(0)} mm/h heavy inflow recorded`, isTriggered: true },
        { label: 'Ground saturation', subtext: `Soil moisture high at ${soilMoisture}% capacity`, isTriggered: true },
        { label: '🟠 HIGH FLOOD RISK', subtext: estimatedWindow, isTriggered: true }
      ];
    } else if (risk === 'MODERATE') {
      status = 'WATCH';
      statusLabel = isVillage ? 'FLOOD WATCH (VILLAGE-WISE)' : 'FLOOD WATCH (WARD-WISE)';
      estimatedWindow = loc.expected_window || 'Next 3–6 Hours';
      reason = isVillage
        ? `Steady rainfall (${rainfall.toFixed(0)} mm/hr) is causing river and hill streams to rise. Watch for sudden water flow in low-lying areas.`
        : `Steady rain (${rainfall.toFixed(0)} mm/hr) is causing slow water runoff and puddling on low roads.`;
      affectedAreas = isVillage
        ? [
            `${loc.name} (Riverbank Agricultural Terraces)`,
            'Tributary Sluice Channel & River Ghat (Caution Zone)',
            'Low-elevation village dip crossings'
          ]
        : [
            loc.name,
            'Curbside lanes and drainage grates',
            'Secondary low-elevation roads'
          ];
      actions = isVillage
        ? [
            'Stay away from river banks, bathing ghats, and fast-flowing water',
            'Move cattle and farm equipment away from the water edge to higher ground',
            'Listen for village loudspeaker announcements and weather updates',
            'Keep an emergency bag ready with drinking water, torch, and medicines'
          ]
        : [
            'Drive slowly and avoid driving through deep curbside puddles',
            'Clear trash and leaves from drain covers outside your home or shop',
            'Check city traffic and weather updates before traveling',
            'Keep flashlights and emergency helpline numbers handy'
          ];
      timeline = [
        { label: 'NOW', subtext: isVillage ? `River gauge telemetry active (${waterLevel.toFixed(1)}m level)` : 'External telemetry active', isTriggered: true },
        { label: isVillage ? 'Tributary inflow rate monitored' : 'Inflow rate monitored', subtext: `${rainfall.toFixed(0)} mm/h catchment inflow recorded`, isTriggered: true },
        { label: 'Ground saturation', subtext: `Soil moisture at ${soilMoisture}% capacity`, isTriggered: true },
        { label: '🟡 FLOOD WATCH ACTIVE', subtext: estimatedWindow, isTriggered: true }
      ];
    } else {
      // LOW / SAFE
      status = 'LOW';
      statusLabel = isVillage ? 'NORMAL MONITORING / LOW RISK (VILLAGE-WISE)' : 'NORMAL MONITORING / LOW RISK (WARD-WISE)';
      estimatedWindow = 'No Imminent Threat / Safe';
      reason = isVillage
        ? `Rainfall is light (${rainfall.toFixed(0)} mm/hr). River streams are flowing safely within their banks with zero flash flood risk.`
        : `Rainfall is light (${rainfall.toFixed(0)} mm/hr). Streets and drains are flowing normally with no flood risk.`;
      affectedAreas = isVillage
        ? [
            `${loc.name} (Upper & Lower Terraces - Nominal Flow)`,
            'Tributary Sluice Channel & River Ghat (Safe water flow)',
            'Suspension bridge approach (Fully open)'
          ]
        : [
            loc.name,
            'Stormwater drainage channels (Clear outflow)',
            'Underpasses and public transit corridors (Dry)'
          ];
      actions = isVillage
        ? [
            'Everything is safe. Continue your normal daily work and routine',
            'No flooding risk right now. Village authorities are monitoring weather updates',
            'Keep farm ditches and water drains clean so rainwater flows easily',
            'Call 112 if you notice any sudden water rise in your area'
          ]
        : [
            'Roads are clear and safe. Traffic is moving normally',
            'No waterlogging threat right now. Normal daily work can continue',
            'Keep roadside gutters clear of plastic and household waste',
            'Call 112 or local helpline if you spot water leaks or blocked drains'
          ];
      timeline = [
        { label: 'NOW', subtext: isVillage ? `River gauge telemetry stable (${waterLevel.toFixed(1)}m normal stage)` : 'External telemetry stable', isTriggered: true },
        { label: isVillage ? 'Tributary inflow rate monitored' : 'Inflow rate monitored', subtext: `${rainfall.toFixed(0)} mm/h nominal flow recorded`, isTriggered: true },
        { label: 'Ground saturation', subtext: `Soil moisture safe at ${soilMoisture}% capacity`, isTriggered: true },
        { label: '🟢 LOW RISK / SAFE', subtext: 'ROUTINE MONITORING ACTIVE', isTriggered: true }
      ];
    }

    return {
      id: `warn-${loc.id}`,
      status,
      statusLabel,
      locationId: loc.id,
      locationName: loc.name,
      roadName: isVillage ? 'Valley Riparian Corridor' : 'Riverfront Embankment & Main Road',
      riskLevel: risk,
      estimatedWindow,
      reason,
      affectedAreas,
      actions,
      timeline,
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
    };
  }, [isDemoMode, activeFocusLocation, warningScope, activeFlashWarning]);

  // 🌊 Flood Spread Prediction Simulation (Realistic hydrodynamic shape for selected village)
  const spreadSimulation: FloodSpreadSimulation = useMemo(() => {
    return calculateFloodSpreadSimulation(activeVillage, displayedWarning || activeFlashWarning);
  }, [activeVillage, displayedWarning, activeFlashWarning]);

  const [activeSpreadStageKey, setActiveSpreadStageKey] = useState<FloodSpreadStageKey>('NOW');
  const [animationState, setAnimationState] = useState<'idle' | 'running' | 'completed'>('idle');

  // Progressive animation driver: NOW -> +30 MIN -> +1 HR -> +2 HR (then finish at max spread)
  useEffect(() => {
    if (animationState !== 'running') return;

    const interval = setInterval(() => {
      setActiveSpreadStageKey(prev => {
        const order = spreadSimulation.stageOrder;
        const currentIdx = order.indexOf(prev);
        if (currentIdx >= order.length - 1) {
          // Reached final stage (+2 HR)
          setAnimationState('completed');
          return prev;
        }
        return order[currentIdx + 1];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [animationState, spreadSimulation.stageOrder]);

  const handleStartAnimation = () => {
    setActiveSpreadStageKey('NOW');
    setAnimationState('running');
  };

  const handleTogglePause = () => {
    setAnimationState(prev => (prev === 'running' ? 'idle' : 'running'));
  };

  const currentSpreadStage = spreadSimulation.stages[activeSpreadStageKey] || spreadSimulation.stages['NOW'];

  const [activeLayers, setActiveLayers] = useState({
    floodRisk: true,
    rainfall: true,
    drainage: false,
    iotSensors: true,
    citizenReports: false,
    historicalEvents: false,
    hospitals: true
  });

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };


  // Filter IoT Sensors strictly for Flash Flood factors (Rain gauge, river level, soil moisture)
  const floodSensors = sensors.filter(
    s => s.type === 'Rain Gauge' || s.type === 'Water Level' || s.type === 'Soil Moisture' || s.type === 'Slope Sensor'
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. 🏠 "IS MY LOCATION SAFE?" HERO ACTION BANNER */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-7 text-white shadow-xl border-2 border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-blue-500/20 text-blue-300 border border-blue-400/40">
              {t.locationSafetyTitle}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Open-Meteo + IMD
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>🏠 {t.checkLocationSafetyBtn}</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            {t.locationSafetyDesc}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsSafetyModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm transition flex items-center gap-2.5 cursor-pointer shadow-lg hover:shadow-amber-500/20 shrink-0 self-start md:self-auto z-10"
        >
          <Home className="w-4 h-4" />
          <span>{t.checkLocationSafetyBtn}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
      </div>

      {/* 2. DEDICATED FLASH FLOOD WARNING */}
      {isDemoMode && displayedWarning && displayedWarning.status !== 'NONE' ? (
        <FlashFloodWarningCard
          warning={displayedWarning}
          onViewOnMap={() => { }}
          warningScope="village"
          availableLocations={villages}
          onSelectLocation={(locId) => {
            const loc = locations.find(l => l.id === locId);
            if (loc) {
              setSelectedVillageId(locId);
              onSelectLocation(loc);
            }
          }}
        />
      ) : null}

      {/* 5. REGIONAL RISK MAP (Flash Flood Focus) */}
      <section className="space-y-4">
        {/* FLASH FLOOD RISK MAP — FLOOD SPREAD ANIMATION PROMINENT CONTROL HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-xl border-2 border-indigo-900/70 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {t.spreadSimulationTitle}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>🌊 {t.spreadSimulationTitle}</span>
              </h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {t.spreadSimulationDesc}
              </p>
            </div>

            {/* Prominent Action Button: START / PAUSE / REPLAY */}
            <div className="shrink-0 flex items-center gap-3">
              {animationState === 'completed' ? (
                <button
                  type="button"
                  onClick={handleStartAnimation}
                  className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm transition flex items-center gap-2.5 cursor-pointer shadow-xl hover:shadow-orange-500/25"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>↻ {t.replay}</span>
                </button>
              ) : animationState === 'running' ? (
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/50 font-black rounded-2xl text-xs sm:text-sm transition flex items-center gap-2.5 cursor-pointer shadow-lg"
                >
                  <Pause className="w-4 h-4" />
                  <span>⏸ {t.pause}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartAnimation}
                  className="px-7 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:via-orange-400 hover:to-red-500 text-slate-950 font-black rounded-2xl text-xs sm:text-sm md:text-base transition flex items-center gap-3 cursor-pointer shadow-2xl hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Play className="w-5 h-5 fill-slate-950 animate-pulse" />
                  <span>▶ {t.startSimulation}</span>
                </button>
              )}
            </div>
          </div>

          {/* Timeline Indicator & Visual Progression Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            {/* Small live timeline indicator: NOW | +30 MIN | +1 HR | +2 HR */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                Timeline:
              </span>
              <div className="flex items-center gap-1.5">
                {spreadSimulation.stageOrder.map((key) => {
                  const stage = spreadSimulation.stages[key];
                  const isActive = activeSpreadStageKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setActiveSpreadStageKey(key);
                        if (animationState === 'running') setAnimationState('idle');
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer ${isActive
                          ? 'text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                      style={isActive ? { backgroundColor: stage.color } : {}}
                    >
                      {isActive && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                      <span>{key}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Message / Completion Badge */}
            <div>
              {animationState === 'completed' || activeSpreadStageKey === '+2 HR' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/80 border border-red-500/60 rounded-xl text-red-200 font-mono text-[11px] font-black">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>Predicted Maximum Spread — +2 HR</span>
                </div>
              ) : animationState === 'running' ? (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-950/80 border border-amber-500/60 rounded-xl text-amber-200 font-mono text-[11px] font-black">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>Simulating Flood Wavefront ({activeSpreadStageKey})...</span>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <span>Color key:</span>
                  <span className="text-yellow-400 font-bold">● Yellow (Approaching)</span>
                  <span>→</span>
                  <span className="text-orange-400 font-bold">● Orange (Increasing)</span>
                  <span>→</span>
                  <span className="text-red-400 font-bold">● Red (Severe)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Village / Ward Inspection Selector Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-tight font-mono flex items-center gap-2">
                <span>{warningScope === 'village' ? 'VILLAGE-WISE FLASH FLOOD RISK VIEW' : 'WARD-WISE FLASH FLOOD RISK VIEW'}</span>
              </h3>
              <span className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border ${
                activeFocusLocation.risk_level === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-300' :
                activeFocusLocation.risk_level === 'HIGH' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                activeFocusLocation.risk_level === 'MODERATE' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}>
                OVERALL RISK: {activeFocusLocation.risk_level || 'EVALUATING'} ({activeFocusLocation.risk_probability || 78}%)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {warningScope === 'village'
                ? 'Showing overall flash flood risk for selected village with clean boundaries, river gauges, and hydrodynamic flow vectors'
                : 'Showing flash flood impact for selected municipal ward along river corridor and drainage catchment'}
            </p>
          </div>

          {/* Quick Village / Ward Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">
              {warningScope === 'village' ? 'Select Village:' : 'Select Ward:'}
            </span>
            <select
              value={activeFocusLocation.id}
              onChange={(e) => {
                const found = locations.find(l => l.id === e.target.value);
                if (found) {
                  if (warningScope === 'village') setSelectedVillageId(found.id);
                  else setSelectedWardId(found.id);
                  onSelectLocation(found);
                }
              }}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 cursor-pointer focus:ring-2 focus:ring-blue-500"
            >
              {(warningScope === 'village' ? villages : wards).map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.risk_level || 'EVALUATING'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Existing Map locked to Flash Flood System */}
        <DisasterMap
          locations={locations}
          selectedLocation={activeVillage}
          onSelectLocation={onSelectLocation}
          riverNetworks={riverNetworks}
          drainageLines={[]}
          sensors={floodSensors}
          citizenReports={[]}
          historicalEvents={historicalEvents}
          activeFlashWarning={activeFlashWarning}
          hospitals={hospitals}
          isDemoMode={isDemoMode}
          systemMode="flash-flood"
          activeSpreadStage={currentSpreadStage}
          allSpreadStages={spreadSimulation.stageOrder.map(k => spreadSimulation.stages[k])}
          animationActive={animationState === 'running'}
          animationFinished={animationState === 'completed'}
          onReplayAnimation={handleStartAnimation}
          onSelectSpreadStage={(stageKey) => {
            setActiveSpreadStageKey(stageKey);
            if (animationState === 'running') setAnimationState('idle');
          }}
          activeLayers={activeLayers}
          onToggleLayer={handleToggleLayer}
        />
      </section>

      {/* 6. EVACUATION & REGIONAL EMERGENCY HOSPITAL CAPACITY */}
      <section className="space-y-3">
        <HospitalCapacityPanel
          hospitals={hospitals}
          selectedLocationName={activeVillage.name}
          isDemoMode={isDemoMode}
          activeScenario={isDemoMode ? 'flash-flood' : undefined}
        />
      </section>

      {/* 7. OFFICIAL IMD METEOROLOGICAL WARNINGS */}
      {officialImdWarnings && officialImdWarnings.length > 0 && (
        <section className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-sky-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-mono">
              OFFICIAL WEATHER WARNINGS — INDIA METEOROLOGICAL DEPARTMENT (IMD)
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {officialImdWarnings.map((warn, i) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 font-mono">{warn.title}</span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-full font-mono uppercase">
                    {warn.feed_type || warn.source}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">{warn.description}</div>
                <div className="text-[10px] text-slate-400 font-mono">Published: {warn.published_at}</div>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* 9. 🏠 IS MY LOCATION SAFE? MODAL */}
      <LocationSafetyModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        isDemoMode={isDemoMode}
        locations={locations}
        officialImdWarnings={officialImdWarnings}
      />
    </div>
  );
};
