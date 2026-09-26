import React, { useState } from 'react';
import type { LocationData, CitizenReport, IoTSensor } from '../types';
import { MUNICIPAL_ROADS, type MunicipalRoad } from '../data/municipalRoads';
import { useTranslation } from '../services/LanguageContext';
import { MumbaiStreetWaterloggingMap } from './Map/MumbaiStreetWaterloggingMap';
import { InverseHydraulicDiagnosisCard } from './InverseHydraulicDiagnosisCard';
import {
  Camera,
  Clock
} from 'lucide-react';



interface StreetWaterloggingPageProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelectLocation: (loc: LocationData) => void;
  drainageLines: any[];
  sensors: IoTSensor[];
  citizenReports: CitizenReport[];
  isDemoMode?: boolean;
  onOpenReportModal: () => void;
  onNavigateToSimulator?: () => void;
}

export const StreetWaterloggingPage: React.FC<StreetWaterloggingPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  drainageLines,
  sensors,
  citizenReports,
  isDemoMode = true,
  onOpenReportModal
}) => {
  const { t, tr } = useTranslation();
  const [roads, setRoads] = useState<MunicipalRoad[]>(MUNICIPAL_ROADS);
  const [selectedRoad, setSelectedRoad] = useState<MunicipalRoad>(MUNICIPAL_ROADS[0]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [waterloggingViewMode, setWaterloggingViewMode] = useState<'realtime' | 'predicted'>('predicted');

  const wards = locations.filter(l => l.type === 'WARD');
  const activeWard = (selectedLocation && selectedLocation.type === 'WARD')
    ? selectedLocation
    : (wards.find(w => w.id === 'ward-12') || wards[0] || locations[0]);

  const activeLayersState = {
    floodRisk: true,
    rainfall: false,
    drainage: true,
    iotSensors: false,
    citizenReports: true,
    historicalEvents: false,
    hospitals: false
  };
  const [activeLayers, setActiveLayers] = useState(activeLayersState);

  const handleToggleLayer = (layerKey: string) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey as keyof typeof prev]
    }));
  };


  // Combine live/backend citizen reports with rich demo feed
  const allReports: CitizenReport[] = citizenReports && citizenReports.length > 0 ? citizenReports : [
    {
      id: 'REP-104',
      location_id: 'ward-12',
      location_name: 'Main Market Road (Near Sharda Mandir)',
      coordinates: [30.0925, 78.2692],
      timestamp: '2 mins ago',
      severity: 'CRITICAL',
      description: 'Water entering shops on Station Road. Culvert choked with debris and silt. Water at knee height.',
      image_url: '/assets/street_waterlog_hero.jpg',
      status: 'VERIFIED_BY_VISION'
    },
    {
      id: 'REP-102',
      location_id: 'ward-12',
      location_name: 'Station Culvert Link Road',
      coordinates: [30.0915, 78.2685],
      timestamp: '8 mins ago',
      severity: 'HIGH',
      description: 'Curb line inundated with 10 inches of standing stormwater. Two-wheelers stalling.',
      image_url: '/assets/sample_waterlog.jpg',
      status: 'DISPATCHED'
    },
    {
      id: 'REP-098',
      location_id: 'ward-04',
      location_name: 'Riverfront Embankment Road',
      coordinates: [30.0845, 78.2618],
      timestamp: '15 mins ago',
      severity: 'CRITICAL',
      description: 'River backflow overflowing embankment steps onto road surface.',
      image_url: '/assets/hero.jpg',
      status: 'VERIFIED'
    }
  ];

  return (

    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. 🕳️ INVERSE HYDRAULIC DIAGNOSIS ENGINE */}
      <section>
        <InverseHydraulicDiagnosisCard
          onOpenReport={onOpenReportModal}
          isDemoMode={isDemoMode}
        />
      </section>



      {/* 2. LARGE STREET-LEVEL MAP (MUMBAI REGION FOCUSED) */}
      <section className="space-y-3">
        <MumbaiStreetWaterloggingMap
          selectedRoadName={selectedRoad?.name}
          onSelectRoad={(road) => {
            const matched = roads.find(r => r.name.toLowerCase().includes(road.road_name.toLowerCase()) || road.road_name.toLowerCase().includes(r.name.toLowerCase()));
            if (matched) setSelectedRoad(matched);
          }}
          onOpenReportModal={onOpenReportModal}
        />
      </section>


      {/* 5. RECENT CITIZEN REPORTS (Photo, Location, Time, Condition) */}
      <section className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[10px] font-black text-red-600 uppercase tracking-widest font-mono">
              {tr('CROWDSOURCED VERIFICATIONS')}
            </div>
            <h3 className="text-lg font-black text-slate-900 font-mono flex items-center gap-2">
              <span>{tr('RECENT CITIZEN WATERLOGGING REPORTS')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {tr('Photographic evidence and water depth logs submitted by drivers, shopkeepers and residents')}
            </p>
          </div>

          <button
            onClick={onOpenReportModal}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{tr('SUBMIT PHOTO REPORT')}</span>
          </button>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allReports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between shadow-xs"
            >
              {/* Photo */}
              <div className="relative h-40 bg-slate-200 overflow-hidden">
                <img
                  src={report.image_url || '/assets/sample_waterlog.jpg'}
                  alt={report.location_name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono font-bold rounded-md">
                  📍 {tr(report.location_name.split('(')[0].trim())}
                </span>
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black font-mono rounded-md">
                  {tr(report.severity || 'CRITICAL')}
                </span>
              </div>

              {/* Details */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {report.timestamp}
                    </span>
                    <span className="text-emerald-700 font-bold">
                      ✓ {tr('AI Verified')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    {tr(report.location_name)}
                  </h4>

                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                    {tr(report.description)}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-slate-500">ID: {report.id}</span>
                  <button
                    onClick={() => {
                      const matched = roads.find(r => report.location_name.toLowerCase().includes(r.name.toLowerCase()));
                      if (matched) setSelectedRoad(matched);
                    }}
                    className="text-sky-600 font-bold hover:underline cursor-pointer"
                  >
                    {tr('Inspect road →')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
