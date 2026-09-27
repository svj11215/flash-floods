import React, { useState } from 'react';
import type { FlashFloodWarning, LocationData } from '../types';
import { useTranslation } from '../services/LanguageContext';
import {
  AlertTriangle,
  Clock,
  MapPin,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Bell,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertOctagon
} from 'lucide-react';

interface FlashFloodWarningCardProps {
  warning: FlashFloodWarning | null;
  onViewOnMap?: (locationId?: string) => void;
  showTimelineOnly?: boolean;
  warningScope?: 'village' | 'ward';
  onToggleScope?: (scope: 'village' | 'ward') => void;
  availableLocations?: LocationData[];
  onSelectLocation?: (locationId: string) => void;
}

export const FlashFloodWarningCard: React.FC<FlashFloodWarningCardProps> = ({
  warning,
  onViewOnMap,
  warningScope = 'village',
  onToggleScope,
  availableLocations,
  onSelectLocation
}) => {
  const { t, tr } = useTranslation();
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  // If no warning or status === 'NONE'
  if (!warning || warning.status === 'NONE') {
    return (
      <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wider mb-0.5">
              <span>{t.warningStatusNormal}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 font-mono">
              {t.noActiveFlashWarning}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t.noActiveFlashWarningDesc}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono shrink-0">
          {tr('Routine Telemetry Active')}
        </div>
      </div>
    );
  }

  // Visual styles for WATCH, WARNING, CRITICAL
  const getStatusVisuals = (status: string) => {
    switch (status) {
      case 'WATCH':
        return {
          bannerBg: 'bg-amber-500',
          badgeText: 'text-amber-950',
          badgeBg: 'bg-amber-100 border-amber-300',
          border: 'border-amber-400',
          icon: '🟡',
          headline: 'FLOOD WATCH',
          tagline: 'Conditions are becoming unfavorable. Continue monitoring.'
        };
      case 'WARNING':
        return {
          bannerBg: 'bg-orange-500',
          badgeText: 'text-orange-950',
          badgeBg: 'bg-orange-100 border-orange-300',
          border: 'border-orange-500',
          icon: '🟠',
          headline: 'FLOOD WARNING',
          tagline: 'Flooding may occur in vulnerable areas. Prepare to move away from affected locations.'
        };
      case 'CRITICAL':
      default:
        return {
          bannerBg: 'bg-red-600',
          badgeText: 'text-red-950',
          badgeBg: 'bg-red-100 border-red-300',
          border: 'border-red-500',
          icon: '🔴',
          headline: 'FLASH FLOOD WARNING',
          tagline: 'Immediate action may be required. Avoid affected roads and move to safer areas.'
        };
    }
  };

  const statusStyle = getStatusVisuals(warning.status);

  return (
    <div className={`bg-white rounded-3xl border-3 ${statusStyle.border} shadow-lg overflow-hidden`}>
      {/* Header Banner */}
      <div className={`${statusStyle.bannerBg} text-white px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-xl shrink-0 animate-pulse">
            🚨
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight font-mono uppercase">
                {tr(statusStyle.headline)}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-white text-slate-950">
                {t.activeWarningBadge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              {tr(statusStyle.tagline)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center px-3 py-1 bg-white text-slate-950 rounded-xl text-xs font-black font-mono shadow-xs">
            <span>🏡 Village-Wise</span>
          </div>

          <div className="text-right text-xs bg-black/20 px-3 py-1.5 rounded-xl">
            <div className="text-[10px] uppercase font-bold text-white/70">{t.estimatedTime}</div>
            <div className="text-base font-black text-white font-mono tracking-wide">
              {tr(warning.estimatedWindow)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Warning Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Location & Risk Level */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                AFFECTED FLOOD ZONE (VILLAGE-WISE)
              </span>
              <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-full border bg-sky-50 text-sky-800 border-sky-300">
                🏡 VILLAGE LEVEL
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600 shrink-0" />
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                  {tr(warning.locationName).toUpperCase()}
                </h3>
              </div>

              {availableLocations && availableLocations.length > 0 && onSelectLocation && (
                <select
                  value={warning.locationId}
                  onChange={(e) => onSelectLocation(e.target.value)}
                  className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 cursor-pointer focus:ring-2 focus:ring-blue-500"
                  title="Switch location warning"
                >
                  {availableLocations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.risk_level || 'ALERT'})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Risk:</span>
            <span className="px-3 py-1 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-xs">
              <span>{statusStyle.icon}</span>
              <span>{tr(warning.riskLevel)}</span>
            </span>
          </div>
        </div>

        {/* Reason & Affected Areas Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                {t.primaryCause}:
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {tr(warning.reason)}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                {t.impactedStreets}:
              </span>
              <div className="space-y-1">
                {warning.affectedAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>{tr(area)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WARNING TIMELINE */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>{t.warningTimelineTitle}</span>
            </span>

            <div className="relative pl-5 border-l-2 border-slate-300 space-y-3.5 text-xs text-slate-700">
              {warning.timeline && warning.timeline.length > 0 ? (
                warning.timeline.map((step, idx) => (
                  <div key={idx} className="relative">
                    <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                      step.isTriggered ? 'bg-red-600 ring-2 ring-red-300 animate-pulse' : 'bg-slate-400'
                    }`} />
                    <div className="font-bold text-slate-900">{tr(step.label)}</div>
                    <div className="text-[11px] text-slate-500">{tr(step.subtext)}</div>
                  </div>
                ))
              ) : null}
            </div>
          </div>
        </div>

        {/* What You Should Do */}
        <div className="bg-amber-50/90 rounded-2xl p-5 border border-amber-200">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-2.5 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>{t.whatYouShouldDoNow}</span>
          </span>

          <div className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm font-bold text-amber-950">
            {warning.actions.map((act, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-red-600 font-black">•</span>
                <span>{tr(act)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons: [ VIEW ON MAP ] & [ SAFETY INSTRUCTIONS ] */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Issued by <strong>SDMA / Municipal Early Warning Cell</strong> • Hotline: <strong>112</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSafetyModal(!showSafetyModal)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{showSafetyModal ? 'Hide Safety Details' : 'SAFETY INSTRUCTIONS'}</span>
              {showSafetyModal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onViewOnMap && onViewOnMap(warning.locationId)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>VIEW ON MAP</span>
              <ArrowRight className="w-4 h-4 text-sky-400" />
            </button>
          </div>
        </div>

        {/* Collapsible Safety Instructions Details */}
        {showSafetyModal && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 text-slate-700 mt-3">
            <div className="font-bold text-slate-900 text-sm mb-1">Detailed Public Safety Guidelines</div>
            <p>1. <strong>Shopkeepers & Business Owners:</strong> Elevate vulnerable inventory and electronics at least 3 feet above floor level. Switch off main circuit breakers if water approaches the threshold.</p>
            <p>2. <strong>Drivers & Commuters:</strong> Avoid driving through waterlogged underpasses or culvert roads. 6 inches of moving water can knock down an adult, and 12 inches can carry away a car.</p>
            <p>3. <strong>Vulnerable Persons:</strong> Assist elderly residents and children to move to upper floors or designate higher community shelter areas.</p>
            <p>4. <strong>Emergency Evacuation:</strong> Keep emergency torches, medicines, drinking water, and identity documents ready. Contact Disaster Control Room at <strong>112</strong>.</p>
          </div>
        )}
      </div>
    </div>
  );
};
