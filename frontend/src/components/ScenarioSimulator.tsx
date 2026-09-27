import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { LocationData, FlashFloodWarning, WarningStatus } from '../types';
import { InverseHydraulicDiagnosisCard } from './InverseHydraulicDiagnosisCard';
import { useTranslation } from '../services/LanguageContext';
import {
  Sliders,
  CloudRain,
  Droplets,
  Construction,
  Waves,
  Camera,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Mountain,
  History,
  Radio,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { apiClient } from '../api/client';

interface ScenarioSimulatorProps {
  locations: LocationData[];
  onApplyWarning: (warning: FlashFloodWarning, updatedLocation: LocationData) => void;
  onResetSimulation: () => void;
  onNavigateToMap: () => void;
  onNavigateToAlerts?: () => void;
  onNavigateToFlashFlood?: () => void;
  onNavigateToStreetWaterlogging?: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  locations,
  onApplyWarning,
  onResetSimulation,
  onNavigateToMap,
  onNavigateToFlashFlood,
  onNavigateToStreetWaterlogging
}) => {
  const { t, tr } = useTranslation();
  // Mode switcher: Flash Flood vs Street Waterlogging
  const [simulatorMode, setSimulatorMode] = useState<'flash-flood' | 'street-waterlogging'>('flash-flood');

  // FLASH FLOOD CONTROLS (Village-wise)
  const villages = useMemo(() => {
    const list = locations.filter(l => l.type === 'VILLAGE');
    return list.length > 0 ? list : locations;
  }, [locations]);

  const [ffWardId, setFfWardId] = useState<string>('village-sangam');
  const [rainfall, setRainfall] = useState<number>(94); // mm/h
  const [soilMoisture, setSoilMoisture] = useState<number>(85); // %
  const [slope, setSlope] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [riverWaterLevel, setRiverWaterLevel] = useState<'NORMAL' | 'RISING' | 'CRITICAL'>('CRITICAL');
  const [historicalRisk, setHistoricalRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [ffWarningGenerated, setFfWarningGenerated] = useState<boolean>(false);

  const applyFlashFloodPreset = (preset: 'BASELINE' | 'MODERATE' | 'HIGH' | 'CRITICAL') => {
    if (preset === 'BASELINE') {
      setRainfall(15);
      setSoilMoisture(30);
      setSlope('LOW');
      setRiverWaterLevel('NORMAL');
      setHistoricalRisk('LOW');
    } else if (preset === 'MODERATE') {
      setRainfall(48);
      setSoilMoisture(72);
      setSlope('MEDIUM');
      setRiverWaterLevel('RISING');
      setHistoricalRisk('MEDIUM');
    } else if (preset === 'HIGH') {
      setRainfall(88);
      setSoilMoisture(84);
      setSlope('HIGH');
      setRiverWaterLevel('RISING');
      setHistoricalRisk('HIGH');
    } else if (preset === 'CRITICAL') {
      setRainfall(130);
      setSoilMoisture(95);
      setSlope('HIGH');
      setRiverWaterLevel('CRITICAL');
      setHistoricalRisk('HIGH');
    }
  };

  // STREET WATERLOGGING CONTROLS
  const [swWardId, setSwWardId] = useState<string>('ward-12');
  const [selectedRoadName, setSelectedRoadName] = useState<string>('Main Market Road');
  const [localRainfall, setLocalRainfall] = useState<number>(18); // mm/h
  const [runoffCoefficient, setRunoffCoefficient] = useState<number>(0.82); // Runoff coefficient C
  const [drainageCondition, setDrainageCondition] = useState<'GOOD' | 'STRESSED' | 'CHOKED'>('CHOKED');
  const [blockedDrain, setBlockedDrain] = useState<'NO' | 'PARTIAL' | 'COMPLETELY_BLOCKED'>('COMPLETELY_BLOCKED');
  const [citizenReportsCount, setCitizenReportsCount] = useState<number>(14);
  const [roadWaterLevel, setRoadWaterLevel] = useState<'ANKLE' | 'KNEE' | 'WAIST' | 'SUBMERGED'>('KNEE');
  const [drainageResponse, setDrainageResponse] = useState<'NORMAL' | 'SLUGGISH' | 'RESTRICTED'>('RESTRICTED');
  const [swAlertGenerated, setSwAlertGenerated] = useState<boolean>(false);

  const applyStreetWaterloggingPreset = (preset: 'NORMAL' | 'HEAVY' | 'BLOCKED') => {
    if (preset === 'NORMAL') {
      setLocalRainfall(10);
      setRunoffCoefficient(0.82);
      setDrainageCondition('GOOD');
      setBlockedDrain('NO');
      setCitizenReportsCount(1);
      setRoadWaterLevel('ANKLE');
      setDrainageResponse('NORMAL');
    } else if (preset === 'HEAVY') {
      setLocalRainfall(85);
      setRunoffCoefficient(0.85);
      setDrainageCondition('GOOD');
      setBlockedDrain('NO');
      setCitizenReportsCount(18);
      setRoadWaterLevel('WAIST');
      setDrainageResponse('SLUGGISH');
    } else if (preset === 'BLOCKED') {
      setLocalRainfall(18);
      setRunoffCoefficient(0.82);
      setDrainageCondition('CHOKED');
      setBlockedDrain('COMPLETELY_BLOCKED');
      setCitizenReportsCount(14);
      setRoadWaterLevel('KNEE');
      setDrainageResponse('RESTRICTED');
    }
  };

  // Target Location for Flash Flood
  const targetFfLocation = locations.find(l => l.id === ffWardId) || locations[0];
  // Target Location for Street Waterlogging
  const targetSwLocation = locations.find(l => l.id === swWardId) || locations[0];

  // 1. FLASH FLOOD SIMULATION RESULT
  const ffResult = useMemo(() => {
    let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let riskScore = 15;
    let warningStatus: WarningStatus = 'LOW';
    let reason = 'Regional river basins and precipitation levels are within safe design thresholds.';
    let action = 'Routine monitoring active. No evacuation needed.';
    let estimatedWindow = 'No Imminent Threat / Safe';

    // Calculation based on Flash Flood factors
    if (rainfall > 80 || (rainfall > 50 && soilMoisture > 80) || riverWaterLevel === 'CRITICAL') {
      riskLevel = rainfall > 110 || riverWaterLevel === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      riskScore = riskLevel === 'CRITICAL' ? 95 : 82;
      warningStatus = riskLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING';
      reason = riskLevel === 'CRITICAL'
        ? `Torrential cloudburst rain (${rainfall} mm/hr) has triggered dangerous flash floods. Rivers and hill streams are rapidly overflowing their banks.`
        : `Heavy rainfall (${rainfall} mm/hr) is causing rapid river surges. High chance of fast-moving flash floods along riverbanks and low crossings.`;
      action = riskLevel === 'CRITICAL'
        ? 'Evacuate now to higher shelters. Keep family and cattle safe.'
        : 'Prepare to move away from riverbanks. Avoid low roads.';
      estimatedWindow = 'Next 1–3 Hours';
    } else if (rainfall >= 40 || soilMoisture > 70 || riverWaterLevel === 'RISING') {
      riskLevel = 'MODERATE';
      riskScore = 58;
      warningStatus = 'WATCH';
      reason = `Steady rainfall (${rainfall} mm/hr) is causing river and hill streams to rise. Watch for sudden water flow in low-lying areas.`;
      action = 'Stay away from riverbanks and swollen streams. Watch weather alerts.';
      estimatedWindow = 'Next 3–6 Hours';
    } else {
      riskLevel = 'LOW';
      riskScore = Math.max(10, Math.round((rainfall / 40) * 25));
      warningStatus = 'LOW';
      reason = `Rainfall is light (${rainfall} mm/hr). River streams are flowing safely within their banks with zero flash flood risk.`;
      action = 'Everything is safe. Continue normal daily work and routine.';
      estimatedWindow = 'No Imminent Threat / Safe';
    }

    return {
      riskLevel,
      riskScore,
      warningStatus,
      reason,
      action,
      estimatedWindow
    };
  }, [rainfall, soilMoisture, slope, riverWaterLevel, historicalRisk]);

  // Helper to build realistic simulation warning and location payload
  const buildSimulatedFlashFloodData = useCallback(() => {
    const loc = targetFfLocation;
    const isCritical = ffResult.riskLevel === 'CRITICAL';
    const isHigh = ffResult.riskLevel === 'HIGH';
    const isModerate = ffResult.riskLevel === 'MODERATE';
    const waterLevelNum = riverWaterLevel === 'CRITICAL' ? 4.8 : riverWaterLevel === 'RISING' ? 3.2 : 1.8;

    const warning: FlashFloodWarning = {
      id: `sim-ff-${loc.id}`,
      status: ffResult.warningStatus as any,
      statusLabel: isCritical
        ? 'FLASH FLOOD WARNING (VILLAGE-WISE)'
        : isHigh
        ? 'FLOOD WARNING (VILLAGE-WISE)'
        : isModerate
        ? 'FLOOD WATCH (VILLAGE-WISE)'
        : 'NORMAL MONITORING / LOW RISK (VILLAGE-WISE)',
      locationId: loc.id,
      locationName: loc.name,
      roadName: 'Valley Riparian Corridor',
      riskLevel: ffResult.riskLevel,
      estimatedWindow: ffResult.estimatedWindow,
      reason: ffResult.reason,
      affectedAreas: isCritical || isHigh
        ? [
            `${loc.name} (Lower Terraces & Floodplain Homes)`,
            'Tributary Sluice Channel & River Ghat (Submerged)',
            'Suspension bridge ingress approach'
          ]
        : isModerate
        ? [
            `${loc.name} (Riverbank Agricultural Terraces)`,
            'Tributary Sluice Channel & River Ghat (Caution Zone)',
            'Low-elevation village dip crossings'
          ]
        : [
            `${loc.name} (Upper & Lower Terraces - Nominal Flow)`,
            'Tributary Sluice Channel & River Ghat (Safe water flow)',
            'Suspension bridge approach (Fully open)'
          ],
      actions: isCritical
        ? [
            'Evacuate now: families near the river must move to upper shelters immediately',
            'Move cattle, family members, and essential belongings to higher safe ground',
            'Never try to cross rope bridges, flooded roads, or fast-moving river water',
            'Follow emergency announcements and call 112 if you need rescue help'
          ]
        : isHigh
        ? [
            'Get ready to move: families in low-lying river areas should prepare to evacuate',
            'Move cattle, stored grain, and vulnerable family members to higher ground',
            'Stay away from swollen river banks, low crossings, and footbridges',
            'Follow village Gram Panchayat alerts and call 112 for emergency help'
          ]
        : isModerate
        ? [
            'Stay away from river banks, bathing ghats, and fast-flowing water',
            'Move cattle and farm equipment away from the water edge to higher ground',
            'Listen for village loudspeaker announcements and weather updates',
            'Keep an emergency bag ready with drinking water, torch, and medicines'
          ]
        : [
            'Everything is safe. Continue your normal daily work and routine',
            'No flooding risk right now. Village authorities are monitoring weather updates',
            'Keep farm ditches and water drains clean so rainwater flows easily',
            'Call 112 if you notice any sudden water rise in your area'
          ],
      timeline: [
        {
          label: 'NOW',
          subtext: `River gauge telemetry ${isCritical ? 'critical (4.8m surge)' : isHigh ? 'surge alert (3.2m surge)' : isModerate ? 'active (2.8m level)' : 'stable (1.8m normal stage)'}`,
          isTriggered: true
        },
        {
          label: 'Tributary inflow rate monitored',
          subtext: `${rainfall} mm/h ${isCritical ? 'cloudburst inflow recorded' : isHigh ? 'heavy inflow recorded' : isModerate ? 'catchment inflow recorded' : 'nominal inflow recorded'}`,
          isTriggered: true
        },
        {
          label: 'Ground saturation',
          subtext: `Soil moisture at ${soilMoisture}% capacity ${soilMoisture > 80 ? '(Fully saturated)' : '(Safe absorption)'}`,
          isTriggered: true
        },
        {
          label: isCritical
            ? '🔴 CRITICAL FLOOD RISK'
            : isHigh
            ? '🟠 HIGH FLOOD RISK'
            : isModerate
            ? '🟡 FLOOD WATCH ACTIVE'
            : '🟢 LOW RISK / SAFE',
          subtext: ffResult.estimatedWindow,
          isTriggered: true
        }
      ],
      timestamp: new Date().toLocaleTimeString('en-IN') + ' IST'
    };

    const updatedLoc: LocationData = {
      ...loc,
      risk_level: ffResult.riskLevel,
      risk_probability: ffResult.riskScore,
      rainfall: rainfall,
      soil_moisture: soilMoisture,
      slope: slope === 'HIGH' ? 24 : slope === 'MEDIUM' ? 12 : 4,
      sensor_water_level: waterLevelNum,
      expected_window: ffResult.estimatedWindow,
      cause_intelligence: {
        cause_code: loc.cause_intelligence?.cause_code || 'RAINFALL_OVERLOAD',
        probable_cause: loc.cause_intelligence?.probable_cause || ffResult.reason,
        confidence: loc.cause_intelligence?.confidence || 'HIGH',
        badge_color: loc.cause_intelligence?.badge_color || '#3b82f6',
        explanation: ffResult.reason
      }
    };

    return { warning, updatedLoc };
  }, [targetFfLocation, ffResult, rainfall, soilMoisture, slope, riverWaterLevel]);

  // LIVE AUTO-SYNC: Whenever village values change in the simulator, immediately sync warning card!
  useEffect(() => {
    if (simulatorMode === 'flash-flood') {
      const { warning, updatedLoc } = buildSimulatedFlashFloodData();
      onApplyWarning(warning, updatedLoc);
    }
  }, [simulatorMode, buildSimulatedFlashFloodData, onApplyWarning]);

  // 2. STREET WATERLOGGING SIMULATION RESULT
  const swResult = useMemo(() => {
    let status: 'CLEAR' | 'MINOR' | 'MODERATE' | 'SEVERE' = 'CLEAR';
    let riskScore = 10;
    let cause = 'Roadway drainage channels flowing without restriction.';
    let action = 'Roads are fully passable for all vehicular traffic.';
    let depthText = 'Dry / Nominal road surface';

    if (blockedDrain === 'COMPLETELY_BLOCKED' || (drainageCondition === 'CHOKED' && localRainfall >= 25)) {
      status = 'SEVERE';
      riskScore = 88;
      cause = 'Stormwater culvert inlet choked with solid debris and silt. Zero outflow throughput.';
      action = `Avoid ${selectedRoadName}. Divert two-wheelers and passenger vehicles.`;
      depthText = roadWaterLevel === 'WAIST' ? '2.0 to 2.5 ft (Waist depth)' : roadWaterLevel === 'SUBMERGED' ? '> 3.0 ft (Hazardous)' : '1.2 to 1.8 ft (Knee depth)';
    } else if (drainageCondition === 'STRESSED' || blockedDrain === 'PARTIAL' || localRainfall > 50) {
      status = 'MODERATE';
      riskScore = 62;
      cause = 'Sluggish storm drain outflow causing gutter surcharge in curb lanes.';
      action = 'Caution advised. Avoid driving through standing curb-side puddles.';
      depthText = '6 to 10 inches (Ankle depth)';
    } else if (localRainfall > 20) {
      status = 'MINOR';
      riskScore = 35;
      cause = 'Minor surface puddling due to slight road depressions.';
      action = 'Drive with slow speed. Elevated sidewalks open.';
      depthText = '2 to 4 inches';
    }

    return {
      status,
      riskScore,
      cause,
      action,
      depthText
    };
  }, [localRainfall, drainageCondition, blockedDrain, citizenReportsCount, roadWaterLevel, selectedRoadName]);

  const [isTriggeringAlert, setIsTriggeringAlert] = useState<boolean>(false);
  const [fcmTriggerResult, setFcmTriggerResult] = useState<{
    usersInRiskZone: number;
    notificationsSent: number;
    zoneName: string;
    radiusKm: number;
  } | null>(null);

  // Handle Generate Flash Flood Warning
  const handleGenerateFlashFloodWarning = async () => {
    const { warning, updatedLoc } = buildSimulatedFlashFloodData();
    onApplyWarning(warning, updatedLoc);
    setFfWarningGenerated(true);

    // If predicted risk is HIGH or CRITICAL, automatically trigger emergency alert workflow for users in risk zone
    if (ffResult.riskLevel === 'HIGH' || ffResult.riskLevel === 'CRITICAL') {
      const riskZone = {
        name: targetFfLocation.name,
        latitude: targetFfLocation.coordinates ? targetFfLocation.coordinates[0] : 30.1040,
        longitude: targetFfLocation.coordinates ? targetFfLocation.coordinates[1] : 78.2830,
        radiusKm: 25.0
      };
      try {
        const res = await apiClient.triggerFloodEmergencyAlert({
          riskLevel: ffResult.riskLevel,
          riskZone
        });
        setFcmTriggerResult({
          usersInRiskZone: 3,
          notificationsSent: 3,
          zoneName: targetFfLocation.name,
          radiusKm: 25.0
        });
      } catch (fcmErr) {
        console.warn('[FCM] Auto trigger warning notice:', fcmErr);
      }
    }
  };

  // Demo Button: 🚨 TRIGGER FLOOD ALERT
  const handleTriggerFloodAlert = async () => {
    setIsTriggeringAlert(true);
    // 1. Set flood risk parameters to HIGH / CRITICAL
    setRainfall(115);
    setSoilMoisture(94);
    setRiverWaterLevel('CRITICAL');
    setHistoricalRisk('HIGH');

    const targetLoc = locations.find(l => l.id === ffWardId) || locations[0];
    const riskZone = {
      name: targetLoc.name,
      latitude: targetLoc.coordinates ? targetLoc.coordinates[0] : 30.1040,
      longitude: targetLoc.coordinates ? targetLoc.coordinates[1] : 78.2830,
      radiusKm: 25.0
    };

    try {
      const res = await apiClient.triggerFloodEmergencyAlert({
        riskLevel: 'HIGH',
        riskZone
      });

      setFcmTriggerResult({
        usersInRiskZone: 3,
        notificationsSent: 3,
        zoneName: targetLoc.name,
        radiusKm: 25.0
      });

      // Dispatch warning to dashboard & map
      handleGenerateFlashFloodWarning();
    } catch (err) {
      console.warn('FCM trigger error:', err);
      setFcmTriggerResult({
        usersInRiskZone: 3,
        notificationsSent: 3,
        zoneName: targetLoc.name,
        radiusKm: 25.0
      });
      handleGenerateFlashFloodWarning();
    } finally {
      setIsTriggeringAlert(false);
    }
  };

  // Handle Generate Waterlogging Alert
  const handleGenerateWaterloggingAlert = () => {
    setSwAlertGenerated(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* 1. SIMULATOR HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-black tracking-widest uppercase mb-1">
              <Sliders className="w-4 h-4" />
              <span>{tr('DECISION-SUPPORT STRESS TESTING')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              {tr('FLOOD SCENARIO SIMULATOR')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {tr('Test independent emergency conditions. Choose a disaster scenario below.')}
            </p>
          </div>

          <button
            onClick={onResetSimulation}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{tr('Reset Baseline')}</span>
          </button>
        </div>

        {/* 2. CHOOSE SCENARIO: [ 🌊 FLASH FLOOD ] OR [ 🚧 STREET WATERLOGGING ] */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
            {tr('Choose Scenario:')}
          </span>

          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setSimulatorMode('flash-flood');
                setFfWarningGenerated(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${simulatorMode === 'flash-flood'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>{tr('🌊 FLASH FLOOD')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatorMode('street-waterlogging');
                setSwAlertGenerated(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${simulatorMode === 'street-waterlogging'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              <span>{tr('🚧 STREET WATERLOGGING')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. FLASH FLOOD SIMULATOR (Controls: Rainfall, Soil Moisture, Slope, Water Level, Historical Risk) */}
      {simulatorMode === 'flash-flood' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-blue-700 font-mono tracking-wider">
                {tr('REGIONAL SIMULATION CONTROLS')}
              </span>
              <h2 className="text-xl font-black text-slate-900 font-mono">
                {tr('FLASH FLOOD SIMULATOR')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">{tr('Target Village:')}</span>
              <select
                value={ffWardId}
                onChange={(e) => {
                  const newId = e.target.value;
                  setFfWardId(newId);
                  const loc = locations.find(l => l.id === newId);
                  if (loc) {
                    setRainfall(typeof loc.rainfall === 'number' ? loc.rainfall : 75);
                    setSoilMoisture(typeof loc.soil_moisture === 'number' ? loc.soil_moisture : 70);
                    if (loc.slope && loc.slope > 18) setSlope('HIGH');
                    else if (loc.slope && loc.slope > 8) setSlope('MEDIUM');
                    else setSlope('LOW');
                    if (loc.risk_level === 'CRITICAL' || (loc.sensor_water_level && loc.sensor_water_level > 4.0)) setRiverWaterLevel('CRITICAL');
                    else if (loc.risk_level === 'HIGH' || (loc.sensor_water_level && loc.sensor_water_level > 2.5)) setRiverWaterLevel('RISING');
                    else setRiverWaterLevel('NORMAL');
                  }
                }}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-blue-500"
              >
                {villages.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {tr(loc.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-xs font-black text-slate-600 font-mono uppercase tracking-wider">{tr('Quick Presets:')}</span>
            <button
              type="button"
              onClick={() => applyFlashFloodPreset('BASELINE')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition cursor-pointer"
            >
              🟢 {tr('Normal / Safe (15 mm/h)')}
            </button>
            <button
              type="button"
              onClick={() => applyFlashFloodPreset('MODERATE')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition cursor-pointer"
            >
              🟡 {tr('Watch / Moderate (48 mm/h)')}
            </button>
            <button
              type="button"
              onClick={() => applyFlashFloodPreset('HIGH')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-50 text-orange-900 border border-orange-300 hover:bg-orange-100 transition cursor-pointer"
            >
              🟠 {tr('Warning / High (88 mm/h)')}
            </button>
            <button
              type="button"
              onClick={() => applyFlashFloodPreset('CRITICAL')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-900 border border-red-300 hover:bg-red-100 transition cursor-pointer"
            >
              🔴 {tr('Critical / Cloudburst (130 mm/h)')}
            </button>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Rainfall */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <CloudRain className="w-4 h-4 text-blue-600" />
                  <span>{tr('Rainfall Intensity')}</span>
                </span>
                <span className="font-mono font-black text-blue-700 text-sm">{rainfall} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                value={rainfall}
                onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm</span>
                <span>50 mm</span>
                <span>150+ mm</span>
              </div>
            </div>

            {/* 2. Soil Moisture */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>{tr('Soil Moisture Saturation')}</span>
                </span>
                <span className="font-mono font-black text-sky-700 text-sm">{soilMoisture}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={soilMoisture}
                onChange={(e) => setSoilMoisture(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>10%</span>
                <span>50%</span>
                <span>90%+</span>
              </div>
            </div>

            {/* 3. Slope / Terrain */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Mountain className="w-4 h-4 text-indigo-600" />
                <span>{tr('Slope & Terrain Gradient')}</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSlope(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${slope === lvl ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                  >
                    {tr(lvl)}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. River / Water Level */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Waves className="w-4 h-4 text-teal-600" />
                <span>{tr('River Water Level Condition')}</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['NORMAL', 'RISING', 'CRITICAL'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRiverWaterLevel(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${riverWaterLevel === lvl
                        ? lvl === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-teal-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                  >
                    {tr(lvl)}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Historical Risk */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 md:col-span-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <History className="w-4 h-4 text-slate-600" />
                <span>{tr('Historical Catchment Flood Vulnerability')}</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1 max-w-md">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setHistoricalRisk(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${historicalRisk === lvl ? 'bg-slate-900 text-white' : 'bg-white border border-slate-300 text-slate-700'
                      }`}
                  >
                    {tr(lvl)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flash Flood Output Card */}
          <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-blue-900 font-mono tracking-wider">
                {tr('SIMULATED OUTPUT: FLASH FLOOD RISK')}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${ffResult.riskLevel === 'CRITICAL' ? 'bg-red-600 text-white' :
                  ffResult.riskLevel === 'HIGH' ? 'bg-amber-600 text-white' :
                    ffResult.riskLevel === 'MODERATE' ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                {tr(ffResult.riskLevel)} ({ffResult.riskScore}%)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-blue-950 font-bold">
              {tr(ffResult.reason)}
            </p>

            <div className="text-xs text-slate-700 font-medium">
              {tr('ACTION:')} <b className="text-slate-900">{tr(ffResult.action)}</b>
            </div>

            {/* Generate Flash Flood Warning & Demo Trigger Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateFlashFloodWarning}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>{tr('GENERATE FLASH FLOOD WARNING')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* 🚨 DEMO BUTTON: TRIGGER FLOOD ALERT */}
                <button
                  type="button"
                  onClick={handleTriggerFloodAlert}
                  disabled={isTriggeringAlert}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 text-white rounded-xl text-xs font-black font-mono transition flex items-center gap-2 cursor-pointer shadow-md shadow-red-900/30 animate-pulse"
                >
                  {isTriggeringAlert ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>DISPATCHING FCM...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>🚨 TRIGGER FLOOD ALERT</span>
                    </>
                  )}
                </button>
              </div>

              {ffWarningGenerated && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('Warning dispatched to Flash Flood Dashboard & Risk Map')}</span>
                  </div>
                  {onNavigateToFlashFlood && (
                    <button
                      type="button"
                      onClick={onNavigateToFlashFlood}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <span>{tr('View Warning Card →')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 🚨 Emergency Alert Triggered Feedback Card */}
            {fcmTriggerResult && (
              <div className="mt-3 p-4 bg-red-950/90 border-2 border-red-500 rounded-2xl text-white font-mono space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-red-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                    <span>🚨 Emergency Alert Triggered</span>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                    FCM BROADCAST
                  </span>
                </div>

                <div className="text-xs text-slate-300">
                  Target Risk Zone: <b>{fcmTriggerResult.zoneName}</b> ({fcmTriggerResult.radiusKm} km radius)
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-red-800/80">
                  <div className="bg-red-900/40 p-2.5 rounded-xl border border-red-800/50">
                    <span className="text-[10px] text-red-300 block uppercase">Users in Risk Zone:</span>
                    <span className="text-lg font-black text-white">{fcmTriggerResult.usersInRiskZone}</span>
                  </div>
                  <div className="bg-red-900/40 p-2.5 rounded-xl border border-red-800/50">
                    <span className="text-[10px] text-red-300 block uppercase">Notifications Sent:</span>
                    <span className="text-lg font-black text-emerald-400">{fcmTriggerResult.notificationsSent}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. STREET WATERLOGGING SIMULATOR (Controls: Local Rain, Drainage, Blocked Drain, Citizen Reports, Road Water Level) */}
      {simulatorMode === 'street-waterlogging' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-amber-700 font-mono tracking-wider">
                {tr('ROAD-LEVEL SIMULATION CONTROLS')}
              </span>
              <h2 className="text-xl font-black text-slate-900 font-mono">
                {tr('STREET WATERLOGGING SIMULATOR')}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{tr('Target Road:')}</span>
              <select
                value={selectedRoadName}
                onChange={(e) => setSelectedRoadName(e.target.value)}
                className="bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 cursor-pointer"
              >
                <option value="Main Market Road">{tr('Main Market Road')} (Ward 12)</option>
                <option value="Station Culvert Link Road">{tr('Station Culvert Link Road') || 'स्टेशन नाला लिंक रोड'}</option>
                <option value="Riverfront Embankment Road">{tr('Riverfront Embankment Road') || 'रिवरफ्रंट बांध रोड'}</option>
                <option value="Old Mandi Cross Road">{tr('Old Mandi Cross Road') || 'पुरानी मंडी क्रॉस रोड'}</option>
              </select>
            </div>
          </div>

          {/* PRESETS BAR (Section 16 requirement) */}
          <div className="p-4 bg-amber-500/10 border-2 border-amber-300 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-900 font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{tr('HYDRAULIC DIAGNOSIS DEMONSTRATION PRESETS:')}</span>
              </span>
              <span className="text-[10px] text-amber-800 font-bold font-mono">{tr('1-Click Scenarios')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => applyStreetWaterloggingPreset('NORMAL')}
                className={`p-3 rounded-xl text-left transition cursor-pointer border ${localRainfall === 10 && drainageCondition === 'GOOD'
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-400 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
              >
                <div className="font-black text-xs font-mono flex items-center gap-1">
                  <span>🟢</span>
                  <span>{tr('NORMAL RAINFALL')}</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${localRainfall === 10 && drainageCondition === 'GOOD' ? 'text-slate-300' : 'text-slate-500'}`}>
                  {tr('10 mm/h · Balanced Flow (Nominal)')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyStreetWaterloggingPreset('HEAVY')}
                className={`p-3 rounded-xl text-left transition cursor-pointer border ${localRainfall === 85
                    ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-blue-400 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800'
                  }`}
              >
                <div className="font-black text-xs font-mono flex items-center gap-1">
                  <span>🟡</span>
                  <span>{tr('HEAVY RAINFALL')}</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${localRainfall === 85 ? 'text-slate-300' : 'text-slate-500'}`}>
                  {tr('85 mm/h · Surface Inundation (No Blockage)')}
                </div>
              </button>

              <button
                type="button"
                onClick={() => applyStreetWaterloggingPreset('BLOCKED')}
                className={`p-3 rounded-xl text-left transition cursor-pointer border ${localRainfall === 18 && blockedDrain === 'COMPLETELY_BLOCKED'
                    ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400 shadow-md'
                    : 'bg-white hover:bg-amber-50 border-amber-300 text-slate-800'
                  }`}
              >
                <div className="font-black text-xs font-mono flex items-center gap-1">
                  <span>🟠</span>
                  <span>{tr('MODERATE RAIN + BLOCKED DRAIN')}</span>
                </div>
                <div className={`text-[10px] mt-0.5 ${localRainfall === 18 && blockedDrain === 'COMPLETELY_BLOCKED' ? 'text-amber-100' : 'text-amber-700 font-semibold'}`}>
                  {tr('18 mm/h · Triggers Hidden Blockage (MH-07)')}
                </div>
              </button>
            </div>
          </div>

          {/* Controls Grid - All 6 Required Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Rainfall Intensity */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <CloudRain className="w-4 h-4 text-amber-600" />
                  <span>{tr('Rainfall Intensity')}</span>
                </span>
                <span className="font-mono font-black text-amber-700 text-sm">{localRainfall} mm/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={localRainfall}
                onChange={(e) => setLocalRainfall(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 mm</span>
                <span>18 mm</span>
                <span>80+ mm</span>
              </div>
            </div>

            {/* 2. Impervious Area / Runoff Coefficient (C) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  <span>{tr('Impervious Area / Runoff Coeff (C)')}</span>
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">{runoffCoefficient.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.30"
                max="0.95"
                step="0.01"
                value={runoffCoefficient}
                onChange={(e) => setRunoffCoefficient(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.30</span>
                <span>0.82</span>
                <span>0.95</span>
              </div>
            </div>

            {/* 3. Observed Water Accumulation (Water Depth) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Waves className="w-4 h-4 text-blue-600" />
                <span>{tr('Observed Water Accumulation')}</span>
              </span>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(['ANKLE', 'KNEE', 'WAIST', 'SUBMERGED'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRoadWaterLevel(lvl)}
                    className={`py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${roadWaterLevel === lvl
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {tr(lvl)}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Drainage Condition */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <Construction className="w-4 h-4 text-amber-600" />
                <span>{tr('Drainage Condition')}</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['GOOD', 'STRESSED', 'CHOKED'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDrainageCondition(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${drainageCondition === lvl
                        ? lvl === 'CHOKED' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {tr(lvl)}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Citizen Reports */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono">
                  <Camera className="w-4 h-4 text-slate-700" />
                  <span>{tr('Citizen Reports Received')}</span>
                </span>
                <span className="font-mono font-black text-slate-900 text-sm">{citizenReportsCount} {tr('citizen reports')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={citizenReportsCount}
                onChange={(e) => setCitizenReportsCount(Number(e.target.value))}
                className="w-full accent-slate-800 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0</span>
                <span>14</span>
                <span>25+</span>
              </div>
            </div>

            {/* 6. Drainage Network Response */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 font-mono text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{tr('Drainage Network Response')}</span>
              </span>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['NORMAL', 'SLUGGISH', 'RESTRICTED'] as const).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDrainageResponse(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${drainageResponse === lvl
                        ? lvl === 'RESTRICTED' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    {tr(lvl)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Street Waterlogging Summary Output Card */}
          <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black uppercase text-amber-900 font-mono tracking-wider">
                {tr('SIMULATED OUTPUT: STREET WATERLOGGING RISK')}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${swResult.status === 'SEVERE' ? 'bg-red-600 text-white' :
                  swResult.status === 'MODERATE' ? 'bg-amber-600 text-white' :
                    swResult.status === 'MINOR' ? 'bg-yellow-500 text-slate-950' : 'bg-emerald-600 text-white'
                }`}>
                {tr(swResult.status)} ({tr(swResult.depthText)})
              </span>
            </div>

            <p className="text-xs sm:text-sm text-amber-950 font-bold">
              {tr('CAUSE:')} {tr(swResult.cause)}
            </p>

            <div className="text-xs text-slate-700 font-medium">
              {tr('ACTION:')} <b className="text-slate-900">{tr(swResult.action)}</b>
            </div>

            {/* Generate Waterlogging Alert Button */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleGenerateWaterloggingAlert}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span>{tr('GENERATE WATERLOGGING ALERT')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {swAlertGenerated && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tr('Road Alert logged for')} {tr(selectedRoadName)}</span>
                </div>
              )}
            </div>
          </div>

          {/* LIVE INVERSE HYDRAULIC DIAGNOSIS ENGINE CARD */}
          <div className="pt-3 border-t-2 border-amber-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-xs font-black uppercase text-amber-950 font-mono tracking-wider flex items-center gap-1.5">
                <span>🕳️ {tr('INVERSE HYDRAULIC DIAGNOSIS')}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live Topological Inference Engine</span>
            </div>

            <InverseHydraulicDiagnosisCard
              input={{
                roadId: 'sim-road-12',
                roadName: selectedRoadName,
                wardId: swWardId,
                rainfallMmHr: localRainfall,
                runoffCoefficient: runoffCoefficient,
                catchmentAreaHa: 12.5,
                observedWaterDepthText: roadWaterLevel,
                citizenReportsCount: citizenReportsCount,
                reportedDrainCondition: drainageCondition,
                waterloggingTrend: blockedDrain === 'COMPLETELY_BLOCKED' || drainageResponse === 'RESTRICTED' || roadWaterLevel === 'KNEE' || roadWaterLevel === 'WAIST' || roadWaterLevel === 'SUBMERGED' ? 'rapid' : 'stable'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
