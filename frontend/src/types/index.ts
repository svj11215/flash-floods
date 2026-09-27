export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export * from './hospital';

export interface DrainageManholeRecord {
  sr_no: number;
  sewer_stretch_location: string;
  area: string;
  ward_or_zone: string;
  sewer_diameter_mm: number;
  sewer_length_m: number;
  manhole_depth_min_m: number;
  manhole_depth_max_m: number;
  estimated_manhole_count: number;
  typical_manhole_spacing_m: number;
  drainage_condition: 'GOOD' | 'NORMAL' | 'STRESSED' | 'CHOKED' | string;
  drainage_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  data_status: string;
  source_note: string;
}


export interface LocationData {
  id: string;
  name: string;
  type: 'WARD' | 'VILLAGE' | 'LANDSLIDE_ZONE';
  coordinates: [number, number];
  polygon: [number, number][];
  elevation: number;
  slope: number;
  soil_moisture: number;
  rainfall: number;
  drainage_condition: number;
  historical_events: number;
  sensor_water_level: number;
  impervious_surface_pct: number;
  citizen_reports_count: number;
  waterlogging_trend: string;
  expected_window: string;
  risk_trend: string;
  primary_drain_id: string;
  risk_probability?: number;
  risk_level?: RiskLevel;
  risk_color?: string;
  model_status?: string;
  cause_intelligence?: CauseIntelligence;
  shap_explanation?: ShapExplanation;
  impact_summary?: ImpactMetrics;
}

export interface CauseIntelligence {
  cause_code: 'RAINFALL_OVERLOAD' | 'DRAINAGE_BLOCKAGE' | 'COMBINED_RISK' | 'LANDSLIDE_TRIGGER' | 'UNCERTAIN';
  probable_cause: string;
  confidence: 'HIGH' | 'MODERATE' | 'LOW';
  badge_color: string;
  explanation: string;
  trigger_metrics?: Record<string, any>;
  key_signals?: string[];
}

export interface ShapContribution {
  feature_id: string;
  feature_name: string;
  shap_value: number;
  relative_contribution_pct: number;
  severity_score: number;
  direction: 'RISK_INCREASING' | 'RISK_REDUCING';
}

export interface ShapExplanation {
  available: boolean;
  engine?: string;
  status_message?: string;
  contributions: ShapContribution[];
  top_driver?: string;
  base_value?: number;
}

export interface ImpactMetrics {
  properties: number;
  residents: number;
  roads: number;
  schools: number;
  hospitals: number;
  bridges: number;
}

export interface CriticalFacility {
  type: string;
  name: string;
  capacity?: number;
  beds?: number;
  status?: string;
  type_detail?: string;
}

export interface ImpactAssessment {
  location_id: string;
  location_name: string;
  data_source: string;
  is_simulated_data: boolean;
  metrics: ImpactMetrics;
  affected_roads_list: string[];
  critical_facilities: CriticalFacility[];
  evacuation_priority: string;
}

export interface SopAction {
  action_id: string;
  title: string;
  department: string;
  urgency: 'CRITICAL' | 'HIGH' | 'IMMEDIATE' | 'ROUTINE';
  description: string;
  status: string;
}

export interface EarlyWarningAlert {
  alert_id: string;
  headline: string;
  severity: 'CRITICAL' | 'WARNING' | 'WATCH' | 'INFORMATION';
  severity_color: string;
  location_id: string;
  location_name: string;
  risk_probability: number;
  expected_window: string;
  probable_cause: string;
  cause_code: string;
  cause_explanation: string;
  potential_impact: ImpactMetrics;
  critical_facilities: CriticalFacility[];
  recommended_actions: SopAction[];
  timestamp: string;
  status: string;
}

export interface IoTSensor {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  current_value: string;
  raw_value: number;
  unit: string;
  normal_range: string;
  status: string;
  status_color: string;
  trend: string;
  last_update: string;
  is_simulated: boolean;
}

export interface CitizenReport {
  id: string;
  location_id: string;
  location_name: string;
  coordinates: [number, number];
  timestamp: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  description: string;
  image_url: string;
  status: string;
  yolo_detections?: { label: string; conf: number }[];
}

export interface HistoricalEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  coordinates: [number, number];
  event_type: string;
  severity: string;
  rainfall_conditions: string;
  affected_area: string;
  casualties: number;
  cause_analysis: string;
}

export interface RiverNetwork {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
  flow_rate_cumecs: number;
  danger_mark_m: number;
  current_level_m: number;
  status: string;
}

export interface DrainageLine {
  id: string;
  name: string;
  status: 'CHOKED' | 'RESTRICTED' | 'FUNCTIONAL';
  efficiency_pct: number;
  coordinates: [number, number][];
  cause_factor: string;
}

export interface YoloDetection {
  class_name: string;
  confidence: number;
  severity: string;
  box: {
    xmin_pct: number;
    ymin_pct: number;
    xmax_pct: number;
    ymax_pct: number;
    width_pct: number;
    height_pct: number;
  };
  notes?: string;
}

export interface ImageAnalysisResponse {
  success: boolean;
  model_connected: boolean;
  is_simulated: boolean;
  status_message: string;
  detections_count: number;
  detections: YoloDetection[];
  overall_severity: string;
  image_dimensions?: { width: number; height: number };
}

export type WarningStatus = 'NONE' | 'LOW' | 'SAFE' | 'NORMAL' | 'WATCH' | 'WARNING' | 'CRITICAL';

export interface WarningTimelineStep {
  label: string;
  subtext: string;
  isTriggered: boolean;
}

export interface FlashFloodWarning {
  id: string;
  status: WarningStatus;
  statusLabel: string; // e.g. "FLASH FLOOD WARNING"
  locationId: string;
  locationName: string;
  roadName: string;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  estimatedWindow: string; // e.g. "NEXT 1–3 HOURS"
  reason: string;
  affectedAreas: string[];
  actions: string[];
  timeline: WarningTimelineStep[];
  timestamp: string;
}

export interface LiveVariable {
  value: number | null;
  unit: string;
  source: string;
  data_type: 'OBSERVED' | 'MODELED' | 'UNAVAILABLE' | 'BASELINE_ESTIMATE';
  observed_at: string | null;
  status: string;
  note?: string;
}

export interface OfficialImdWarning {
  title: string;
  description: string;
  source: string;
  feed_type: string;
  link?: string;
  published_at: string;
  is_local_relevant?: boolean;
  retrieved_at?: string;
}

export interface LiveEnvironmentalData {
  mode: 'LIVE DATA' | 'DEMO DATA';
  location: {
    id: string;
    name: string;
    district: string;
    state: string;
    latitude: number;
    longitude: number;
    elevation_m: number;
    slope_deg: number;
    nearest_station: string;
  };
  retrieved_at: string;
  observed_at: string;
  sources: string[];
  variables: {
    rainfall: LiveVariable;
    temperature: LiveVariable;
    humidity: LiveVariable;
    soil_moisture: LiveVariable;
    river_level: LiveVariable;
    drainage_condition: LiveVariable;
  };
  official_warnings: OfficialImdWarning[];
  national_warnings_count?: number;
  data_freshness?: {
    is_stale: boolean;
    cache_ttl_seconds: number;
    retrieved_at: string;
  };
}

export interface LocationSafetyResult {
  success: boolean;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  mode: string;
  is_demo_mode: boolean;
  assessment: {
    risk_level: RiskLevel;
    risk_color: string;
    risk_probability: number;
    status_wording: string;
    probable_cause: string;
    explanation: string;
    advice: string[];
  };
  weather_telemetry: {
    condition?: string;
    weather_code?: number;
    temperature_c: number;
    humidity_pct: number;
    wind_kmh: number;
    current_rainfall_mm_hr: number;
    soil_moisture_pct: number;
    forecast_peak_24h_mm_hr: number;
    forecast_total_24h_mm: number;
    source: string;
    observed_at: string;
  };
  official_warnings: OfficialImdWarning[];
  disclaimer: string;
}


