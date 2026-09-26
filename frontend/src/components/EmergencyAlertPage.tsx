import React, { useState } from 'react';
import type { LocationData, FlashFloodWarning } from '../types';
import { DisasterMap } from './Map/DisasterMap';
import {
  ShieldAlert,
  AlertTriangle,
  MapPin,
  Compass,
  PhoneCall,
  Volume2,
  VolumeX,
  ArrowRight,
  Home,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface EmergencyAlertPageProps {
  locations: LocationData[];
  activeWarning?: FlashFloodWarning | null;
  onNavigateHome?: () => void;
  onNavigateToSimulator?: () => void;
}

export const EmergencyAlertPage: React.FC<EmergencyAlertPageProps> = ({
  locations,
  activeWarning,
  onNavigateHome,
  onNavigateToSimulator
}) => {
  const [isPlayingSiren, setIsPlayingSiren] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    floodRisk: true,
    rainfall: true,
    drainage: true,
    iotSensors: true,
    citizenReports: true,
    historicalEvents: false,
    hospitals: true
  });

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };

  const handleToggleSound = () => {
    setIsPlayingSiren(!isPlayingSiren);
    // Beep sound using Web Audio API
    if (!isPlayingSiren && typeof window !== 'undefined' && 'AudioContext' in window) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch {
        // Audio error ignore
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 px-3 sm:px-4">
      {/* 1. CRITICAL FLASH FLOOD WARNING BANNER */}
      <div className="rounded-3xl bg-red-600 border-2 border-red-500 shadow-2xl p-5 sm:p-7 text-white animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-black bg-black/30 border border-white/20 tracking-wider">
                  OFFICIAL EMERGENCY NOTIFICATION
                </span>
                <span className="text-xs font-mono font-bold bg-white text-red-700 px-2 py-0.5 rounded-full">
                  LIVE BROADCAST
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight mt-1.5">
                🚨 FLASH FLOOD WARNING
              </h1>
              <p className="text-sm text-red-100 font-medium mt-1">
                Your current location is in a <b>HIGH-RISK</b> flood zone. Move to a safer location immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleToggleSound}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-mono font-bold border border-white/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              {isPlayingSiren ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingSiren ? 'Mute Alert' : 'Test Siren'}</span>
            </button>
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/20 font-mono">
          <div className="bg-black/20 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] text-red-200 block uppercase">Risk Level</span>
            <span className="text-lg font-black text-white flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white animate-ping" />
              HIGH RISK
            </span>
          </div>

          <div className="bg-black/20 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] text-red-200 block uppercase">Your Location Status</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-amber-300" />
              You are inside the affected risk zone
            </span>
          </div>

          <div className="bg-black/20 rounded-2xl p-3.5 border border-white/10">
            <span className="text-[10px] text-red-200 block uppercase">Action Time Window</span>
            <span className="text-sm font-bold text-white mt-0.5 block">
              Immediate Action Required
            </span>
          </div>
        </div>
      </div>

      {/* 2. RECOMMENDED ACTION DIRECTIVE */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <h2 className="text-lg font-black text-slate-900 font-mono">
            ⚠️ Recommended Immediate Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-xl bg-red-100 text-red-700 font-mono font-black text-xs flex items-center justify-center mb-2">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Evacuate to High Ground</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Move to higher elevation immediately. Avoid riverbanks, culvert underpasses, and basement structures.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 font-mono font-black text-xs flex items-center justify-center mb-2">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Do Not Drive Through Water</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Never attempt to walk or drive across flowing stormwater. 6 inches of water can knock you down, and 12 inches can sweep away cars.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-mono font-black text-xs flex items-center justify-center mb-2">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Contact Emergency Response</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              If trapped or assisting vulnerable citizens, dial National Emergency Helpline <b>112</b> or State Disaster Control Room.
            </p>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE FLOOD RISK MAP */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black text-sky-700 uppercase font-mono tracking-widest">
              GEOSPATIAL SITUATION INTELLIGENCE
            </span>
            <h3 className="text-lg font-black text-slate-900 font-mono flex items-center gap-2">
              <span>🗺️ Active Flood-Risk Map & Surcharge Conduits</span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive map displaying live waterlogged sectors, sensors, and critical response infrastructure
            </p>
          </div>
          {onNavigateToSimulator && (
            <button
              onClick={onNavigateToSimulator}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <span>🧪 Simulator Controls</span>
            </button>
          )}
        </div>

        {/* Map Container */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
          <DisasterMap
            locations={locations}
            selectedLocation={locations[0]}
            onSelectLocation={() => {}}
            riverNetworks={[]}
            drainageLines={[]}
            sensors={[]}
            citizenReports={[]}
            historicalEvents={[]}
            hospitals={[]}
            isDemoMode={true}
            systemMode="flash-flood"
            activeLayers={activeLayers}
            onToggleLayer={handleToggleLayer}
          />
        </div>
      </div>

      {/* 4. EMERGENCY CONTACTS & SHELTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-red-400" />
            <h3 className="text-base font-black font-mono">Official Emergency Helplines</h3>
          </div>
          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span>National Disaster Helpline:</span>
              <a href="tel:112" className="text-emerald-400 font-black text-sm">📞 112</a>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span>State Disaster Management (SDMA):</span>
              <a href="tel:1070" className="text-emerald-400 font-black text-sm">📞 1070</a>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
              <span>District Emergency Center (DEOC):</span>
              <a href="tel:1077" className="text-emerald-400 font-black text-sm">📞 1077</a>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-sky-600" />
            <h3 className="text-base font-black text-slate-900 font-mono">Disaster Relief Shelters</h3>
          </div>
          <p className="text-xs text-slate-600">
            Emergency high-ground shelters and relief centres have been activated with clean drinking water and medical supplies.
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900">Government High School Hall</strong>
                <span className="text-[11px] text-slate-500">Cantonment Ridge (Elev. 420m)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="block text-slate-900">Community Sports Complex</strong>
                <span className="text-[11px] text-slate-500">Upper Foothills Bypass</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
