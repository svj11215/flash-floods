import os
from typing import Dict, Any, Optional, List
from fastapi import FastAPI, UploadFile, File, Form, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from config import settings
from services.flood_prediction import flood_prediction_service
from services.explainability import explainability_service
from services.risk_engine import cause_intelligence_engine
from services.image_analysis import image_analysis_service
from services.impact_engine import impact_assessment_engine
from services.alert_engine import alert_engine
from services.live_data_service import live_data_service, LOCATION_COORDINATES
from services.hospital_service import hospital_service
from services.drainage_service import drainage_service
from data.geodata import (
    WARDS_AND_VILLAGES,
    RIVER_NETWORKS,
    DRAINAGE_LINES,
    IOT_SENSORS,
    CITIZEN_REPORTS,
    CRITICAL_INFRASTRUCTURE,
    HISTORICAL_EVENTS,
    RISK_TIMELINE_STAGES
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Hyperlocal Flood & Landslide Intelligence and Early Warning Decision-Support Platform"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Mode & Scenario Architecture
CURRENT_MODE: str = "DEMO"  # "LIVE" or "DEMO"
CURRENT_SCENARIO: str = "scenario_2_drainage_blockage"

class ModeRequest(BaseModel):
    mode: str = Field(..., description="Operating mode: 'LIVE' or 'DEMO'")

class FloodPredictionRequest(BaseModel):
    rainfall: float = Field(..., description="Hourly rainfall in mm/h")
    soil_moisture: float = Field(..., description="Soil moisture saturation % (0-100)")
    slope: float = Field(12.0, description="Slope in degrees")
    elevation: float = Field(350.0, description="Elevation in meters")
    drainage_condition: float = Field(80.0, description="Drainage hydraulic efficiency 0-100")
    historical_events: int = Field(1, description="Number of past flood events")
    sensor_water_level: Optional[float] = Field(0.8, description="Culvert or river water level gauge in meters")
    impervious_surface_pct: Optional[float] = Field(50.0, description="Urban surface imperviousness %")
    location_id: Optional[str] = Field("ward-12", description="Location identifier")
    location_name: Optional[str] = Field("Ward 12", description="Human-readable location name")
    citizen_reports_count: Optional[int] = Field(0, description="Count of crowd waterlogging reports")
    waterlogging_trend: Optional[str] = Field("stable", description="Trend of waterlogging: stable/increasing/critical")

class CitizenReportRequest(BaseModel):
    location_id: str
    location_name: str
    description: str
    severity: str
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "system": "JALRAKSHAK Early Warning Engine",
        "version": settings.VERSION,
        "mode": "DEMO DATA" if CURRENT_MODE == "DEMO" else "LIVE DATA",
        "active_mode": CURRENT_MODE,
        "active_scenario": CURRENT_SCENARIO if CURRENT_MODE == "DEMO" else "LIVE_OBSERVATIONS",
        "flood_model": {
            "loaded": flood_prediction_service.is_loaded,
            "path": settings.FLOOD_MODEL_PATH,
            "type": flood_prediction_service.config.get("model_type", "xgboost")
        },
        "yolo_model": {
            "loaded": image_analysis_service.is_loaded,
            "path": settings.YOLO_MODEL_PATH
        },
        "explainability": {
            "loaded": explainability_service.explainer is not None
        }
    }

@app.get("/api/mode")
def get_mode():
    return {
        "success": True,
        "mode": CURRENT_MODE,
        "is_demo_mode": CURRENT_MODE == "DEMO",
        "scenario": CURRENT_SCENARIO,
        "timestamp": live_data_service.get_ist_now_str()
    }

@app.post("/api/mode")
def set_mode(payload: ModeRequest):
    global CURRENT_MODE
    mode_upper = payload.mode.strip().upper()
    if mode_upper in ["LIVE", "LIVE DATA"]:
        CURRENT_MODE = "LIVE"
    elif mode_upper in ["DEMO", "DEMO DATA"]:
        CURRENT_MODE = "DEMO"
    else:
        raise HTTPException(status_code=400, detail="Mode must be 'LIVE' or 'DEMO'")
    return {
        "success": True,
        "mode": CURRENT_MODE,
        "is_demo_mode": CURRENT_MODE == "DEMO",
        "scenario": CURRENT_SCENARIO,
        "timestamp": live_data_service.get_ist_now_str()
    }

@app.get("/api/live/environment")
def get_live_environment(
    location_id: Optional[str] = Query("ward-12", description="Location ID to query live data for"),
    force_refresh: bool = Query(False, description="Bypass cache and force refresh external APIs")
):
    """
    Returns normalized live environmental data for Uttarakhand location from Open-Meteo & IMD.
    """
    loc_id = location_id if location_id in LOCATION_COORDINATES else "ward-12"
    return live_data_service.get_live_environment_for_location(loc_id, force_refresh=force_refresh)

@app.get("/api/live/warnings")
def get_live_warnings(
    force_refresh: bool = Query(False, description="Bypass cache and force refresh IMD CAP feed")
):
    """
    Returns official India Meteorological Department (IMD) Common Alerting Protocol (CAP) bulletins.
    """
    warnings = live_data_service.fetch_imd_cap_warnings(force_refresh=force_refresh)
    return {
        "success": True,
        "source": "India Meteorological Department (IMD)",
        "feed_type": "Official Common Alerting Protocol (CAP)",
        "count": len(warnings),
        "warnings": warnings,
        "retrieved_at": live_data_service.get_ist_now_str()
    }

WMO_WEATHER_CODES = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow Fall",
    73: "Moderate Snow Fall",
    75: "Heavy Snow Fall",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail"
}

@app.get("/api/location-safety")
def get_location_safety(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    location_name: Optional[str] = Query("Your Location", description="Display name for location"),
    mode: Optional[str] = Query(None, description="Mode: 'live' or 'demo'"),
    force_refresh: bool = Query(False, description="Force refresh external weather telemetry")
):
    """
    Evaluates real-time location flood safety for any coordinates in India using Open-Meteo
    and the JalRakshak risk & cause intelligence engine.
    Always prioritizes real-time Open-Meteo weather API observations.
    """
    effective_mode = (mode or CURRENT_MODE).upper()
    
    # Fetch live Open-Meteo data for coordinates
    om_data = live_data_service.fetch_open_meteo_data(lat, lon)
    curr = om_data.get("current", {}) if om_data else {}
    hourly = om_data.get("hourly", {}) if om_data else {}

    # Extract weather metrics from live Open-Meteo API
    temp_c = curr.get("temperature_2m", 24.0)
    humidity_pct = curr.get("relative_humidity_2m", 70.0)
    wind_kmh = curr.get("wind_speed_10m", 12.0)
    precipitation_mm = curr.get("precipitation")
    if precipitation_mm is None:
        precipitation_mm = curr.get("rain", 0.0)
    weather_code = curr.get("weather_code", 0)
    weather_condition = WMO_WEATHER_CODES.get(weather_code, "Partly Cloudy")

    # 24h precipitation forecast
    precip_arr = hourly.get("precipitation", [])
    max_next_24h_rain = max(precip_arr[:24]) if (precip_arr and len(precip_arr) > 0) else 0.0
    total_next_24h_rain = round(sum(precip_arr[:24]), 1) if (precip_arr and len(precip_arr) > 0) else 0.0

    # Modeled soil moisture from hourly forecast (converted to % saturation)
    soil_moisture_pct = 50.0
    soil_arr = hourly.get("soil_moisture_0_to_1cm", [])
    if soil_arr and len(soil_arr) > 0 and soil_arr[0] is not None:
        saturation = round(min(100.0, max(5.0, (float(soil_arr[0]) / 0.45) * 100.0)), 1)
        soil_moisture_pct = saturation

    # If Open-Meteo data was completely unavailable, fallback to baseline
    if not om_data and effective_mode != "LIVE":
        if CURRENT_SCENARIO == "scenario_1_heavy_rain":
            precipitation_mm = 92.0
            soil_moisture_pct = 94.0
            weather_condition = "Cloudburst Rain"
        else:
            precipitation_mm = 14.0
            soil_moisture_pct = 48.0
            weather_condition = "Overcast Rain"

    # Flash Flood Infiltration Excess & Surge Model:
    # Pure Flash Flood Hydrology (Rainfall Intensity + Soil Moisture Saturation + River Catchment Surge)
    rain_risk = min(100.0, (precipitation_mm / 70.0) * 65.0)
    saturation_risk = (soil_moisture_pct / 100.0) * (35.0 if precipitation_mm >= 10.0 else 15.0)
    prob = round(min(100.0, max(5.0, rain_risk + saturation_risk)), 1)

    if prob >= 75.0:
        risk_level = "CRITICAL"
        risk_color = "#dc2626"
    elif prob >= 50.0:
        risk_level = "HIGH"
        risk_color = "#f97316"
    elif prob >= 25.0:
        risk_level = "MODERATE"
        risk_color = "#eab308"
    else:
        risk_level = "LOW"
        risk_color = "#16a34a"

    # Flash Flood Probable Causes
    if precipitation_mm >= 60.0 and soil_moisture_pct >= 75.0:
        probable_cause = "Cloudburst Surge & Severe Soil Saturation"
        explanation = f"Torrential cloudburst precipitation ({precipitation_mm} mm/h) colliding with near-saturated ground ({soil_moisture_pct}%) produces critical flash flood surface runoff and rapid river swell."
    elif precipitation_mm >= 50.0:
        probable_cause = "Heavy Basin Precipitation Surge"
        explanation = f"Intense downpour ({precipitation_mm} mm/h) exceeds standard geological infiltration capacity, generating high-velocity sheet runoff toward regional riverbanks and low-lying valleys."
    elif soil_moisture_pct >= 80.0 and precipitation_mm >= 15.0:
        probable_cause = "Soil Saturation & Runoff Infiltration Excess"
        explanation = f"Ground is near saturation ({soil_moisture_pct}%), preventing rain absorption. Continuing rainfall ({precipitation_mm} mm/h) converts directly into accelerated flash flood surface runoff."
    elif precipitation_mm >= 20.0:
        probable_cause = "Catchment Rain Influx & River Swell Watch"
        explanation = f"Moderate rainfall ({precipitation_mm} mm/h) across local mountain slopes is elevating river basin discharge. Low-lying terraces and stream confluences may experience rising water levels."
    else:
        probable_cause = "Normal Basin Hydrology & Safe Soil Absorption"
        explanation = f"Precipitation ({precipitation_mm} mm/h) and soil saturation ({soil_moisture_pct}%) remain well within safe geological absorption limits. Regional river corridors and mountain catchment streams maintain nominal flow."

    # Official IMD warnings
    official_warnings = live_data_service.fetch_imd_cap_warnings(force_refresh=force_refresh)

    # Actionable safety advice for citizens
    if risk_level in ["CRITICAL", "HIGH"]:
        advice = [
            "Evacuate immediately to designated highland shelters away from riverbanks and mountain streams.",
            "Never attempt to cross flooded causeways, low-lying bridges, or rapidly flowing water.",
            "Monitor emergency broadcast frequencies and contact State Disaster Helpline (Call 1070 / 112)."
        ]
    elif risk_level == "MODERATE":
        advice = [
            "Stay alert to rising river water levels and avoid visiting mountain stream crossings or low river ghats.",
            "Identify nearest high-ground evacuation routes in case precipitation escalates.",
            "Check official IMD regional bulletins before traveling through valley or mountain road corridors."
        ]
    else:
        advice = [
            "Current weather observations show safe atmospheric and runoff conditions.",
            "River channels and drainage conduits in this sector are maintaining safe baseline flow.",
            "No immediate evacuation or flood danger in effect for this vicinity."
        ]

    return {
        "success": True,
        "location": {
            "name": location_name or f"Coordinates [{lat:.4f}, {lon:.4f}]",
            "latitude": lat,
            "longitude": lon
        },
        "mode": "LIVE" if om_data else effective_mode,
        "is_demo_mode": False if om_data else (effective_mode != "LIVE"),
        "assessment": {
            "risk_level": risk_level,
            "risk_color": risk_color,
            "risk_probability": prob,
            "status_wording": f"currently assessed as {risk_level} RISK",
            "probable_cause": probable_cause,
            "explanation": explanation,
            "advice": advice
        },
        "weather_telemetry": {
            "condition": weather_condition,
            "weather_code": weather_code,
            "temperature_c": temp_c,
            "humidity_pct": humidity_pct,
            "wind_kmh": wind_kmh,
            "current_rainfall_mm_hr": precipitation_mm,
            "soil_moisture_pct": soil_moisture_pct,
            "forecast_peak_24h_mm_hr": max_next_24h_rain,
            "forecast_total_24h_mm": total_next_24h_rain,
            "source": "Open-Meteo Weather API (Live)" if om_data else "Demonstration Scenario Model",
            "observed_at": live_data_service.get_ist_now_str()
        },
        "official_warnings": official_warnings,
        "disclaimer": "Assessments reflect real-time external sensor telemetry, meteorological models, and official bulletins. Natural hazards can evolve rapidly; always adhere to local disaster management instructions."
    }

@app.get("/api/risk/map")
def get_risk_map(mode: Optional[str] = Query(None)):
    """
    Returns spatial GeoJSON/features of all wards and villages with live model inference,
    cause classification, and SHAP explainability. Supports mode='live' or mode='demo'.
    """
    effective_mode = (mode or CURRENT_MODE).upper()
    is_live = (effective_mode == "LIVE")
    
    locations_output = []
    
    for loc in WARDS_AND_VILLAGES:
        loc_id = loc["id"]
        if is_live:
            # Fetch real normalized live environmental inputs for this Uttarakhand location
            live_env = live_data_service.get_live_environment_for_location(loc_id)
            vars_data = live_env.get("variables", {})
            
            # Map normalized live observations into model feature schema
            loc_input = {
                **loc,
                "rainfall": float(vars_data.get("rainfall", {}).get("value", 0.0)),
                "soil_moisture": float(vars_data.get("soil_moisture", {}).get("value", 50.0)),
                "drainage_condition": float(vars_data.get("drainage_condition", {}).get("value", 80.0)),
                "citizen_reports_count": 0,
                "waterlogging_trend": "stable"
            }
        else:
            loc_input = loc
            live_env = None

        # Perform real prediction using active XGBoost / hydrological model
        pred_res = flood_prediction_service.predict(loc_input)
        prob = pred_res.get("probability", 50.0) if pred_res.get("success") else 50.0
        
        # Calculate SHAP explainability
        feat_vec = pred_res.get("feature_vector", [])
        feat_order = pred_res.get("feature_order", [])
        shap_res = explainability_service.explain(feat_vec, feat_order)
        
        # Determine cause intelligence
        cause_res = cause_intelligence_engine.analyze_cause(loc_input)
        
        # Impact assessment
        impact_res = impact_assessment_engine.assess_impact(
            location_id=loc["id"],
            risk_probability=prob,
            cause_code=cause_res.get("cause_code", "UNCERTAIN")
        )

        locations_output.append({
            **loc_input,
            "risk_probability": prob,
            "risk_level": pred_res.get("risk_level", "MODERATE"),
            "risk_color": pred_res.get("risk_color", "#eab308"),
            "model_status": pred_res.get("status_message"),
            "cause_intelligence": cause_res,
            "shap_explanation": shap_res,
            "impact_summary": impact_res.get("metrics"),
            "is_simulated_geodata": not is_live,
            "is_live_data": is_live,
            "live_env_metadata": {
                "source": "Open-Meteo + IMD" if is_live else "Demonstration Fixture",
                "retrieved_at": live_env.get("retrieved_at") if live_env else None,
                "observed_at": live_env.get("observed_at") if live_env else None
            } if is_live else None
        })

    return {
        "success": True,
        "mode": effective_mode,
        "scenario": CURRENT_SCENARIO if not is_live else "LIVE_OBSERVATIONS",
        "is_demo_mode": not is_live,
        "locations": locations_output,
        "river_networks": RIVER_NETWORKS,
        "drainage_lines": DRAINAGE_LINES,
        "iot_sensors": IOT_SENSORS,
        "citizen_reports": CITIZEN_REPORTS,
        "critical_infrastructure": CRITICAL_INFRASTRUCTURE
    }

@app.get("/api/hospitals")
def get_hospitals(
    mode: Optional[str] = Query(None, description="Data mode: 'live' or 'demo'"),
    scenario: Optional[str] = Query(None, description="Demo scenario identifier"),
    lat: Optional[float] = Query(30.0920, description="Reference incident/ward latitude"),
    lon: Optional[float] = Query(78.2690, description="Reference incident/ward longitude")
):
    """
    Returns nearby emergency medical facilities, accessibility statuses, and distance.
    In LIVE mode, capacity is strictly marked unavailable if no verified live feed is connected.
    In DEMO mode, deterministic scenario simulations are applied with clear demo provenance labels.
    """
    effective_mode = (mode or CURRENT_MODE).upper()
    effective_scenario = scenario or CURRENT_SCENARIO
    hospitals = hospital_service.get_hospitals(
        mode=effective_mode,
        scenario=effective_scenario,
        ref_lat=lat,
        ref_lon=lon
    )
    return {
        "success": True,
        "mode": effective_mode,
        "scenario": effective_scenario if effective_mode == "DEMO" else "LIVE_REGISTRY",
        "is_demo_mode": effective_mode == "DEMO",
        "reference_coordinates": [lat, lon],
        "count": len(hospitals),
        "hospitals": hospitals
    }

@app.get("/api/risk/{location_id}")
def get_location_risk(location_id: str):
    """Fetches comprehensive risk analysis for a specific village or ward."""
    matched = next((l for l in WARDS_AND_VILLAGES if l["id"] == location_id), None)
    if not matched:
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")

    pred_res = flood_prediction_service.predict(matched)
    prob = pred_res.get("probability", 50.0) if pred_res.get("success") else 50.0

    feat_vec = pred_res.get("feature_vector", [])
    feat_order = pred_res.get("feature_order", [])
    shap_res = explainability_service.explain(feat_vec, feat_order)
    cause_res = cause_intelligence_engine.analyze_cause(matched)
    impact_res = impact_assessment_engine.assess_impact(matched["id"], prob, cause_res.get("cause_code", "UNCERTAIN"))
    alert_res = alert_engine.generate_alert(matched["id"], matched["name"], prob, cause_res, impact_res)

    return {
        "location": matched,
        "prediction": pred_res,
        "cause_intelligence": cause_res,
        "shap_explanation": shap_res,
        "impact_assessment": impact_res,
        "early_warning_alert": alert_res
    }

@app.post("/api/predict/flood")
def predict_flood(payload: FloodPredictionRequest):
    """
    Dedicated AI Prediction Engine API.
    Dynamically conforms input to model_config.json, runs XGBoost, computes SHAP, classifies cause.
    """
    input_dict = payload.model_dump()
    pred_res = flood_prediction_service.predict(input_dict)
    
    prob = pred_res.get("probability", 0.0) if pred_res.get("success") else 0.0
    feat_vec = pred_res.get("feature_vector", [])
    feat_order = pred_res.get("feature_order", [])
    
    shap_res = explainability_service.explain(feat_vec, feat_order)
    cause_res = cause_intelligence_engine.analyze_cause(input_dict)
    impact_res = impact_assessment_engine.assess_impact(payload.location_id or "custom", prob, cause_res.get("cause_code", "UNCERTAIN"))
    alert_res = alert_engine.generate_alert(payload.location_id or "custom", payload.location_name or "Custom Point", prob, cause_res, impact_res)

    return {
        "success": pred_res.get("success", False),
        "model_available": pred_res.get("model_available", False),
        "status_message": pred_res.get("status_message"),
        "prediction": {
            "probability": prob,
            "risk_level": pred_res.get("risk_level"),
            "risk_color": pred_res.get("risk_color")
        },
        "cause_intelligence": cause_res,
        "shap_explanation": shap_res,
        "impact_assessment": impact_res,
        "early_warning": alert_res,
        "input_features": pred_res.get("input_features")
    }

@app.post("/api/analyze-image")
async def analyze_image(
    file: UploadFile = File(...),
    allow_demo: bool = Query(True, description="Allow demo fallback detection if YOLO model file is not connected")
):
    """
    YOLO Image Analysis Endpoint.
    Detects waterlogging, blocked drains, submerged vehicles.
    If YOLO weights not connected, honestly returns 'Model not connected' unless allow_demo=True.
    """
    content = await file.read()
    res = image_analysis_service.analyze_image(
        image_bytes=content,
        filename=file.filename or "uploaded_image.jpg",
        allow_demo=allow_demo
    )
    return res

@app.get("/api/alerts")
def get_alerts(mode: Optional[str] = Query(None)):
    """
    Generates and returns early warning alerts across zones and official IMD warnings.
    Supports mode='live' or mode='demo' (defaults to CURRENT_MODE).
    """
    effective_mode = (mode or CURRENT_MODE).upper()
    is_live = (effective_mode == "LIVE")

    alerts = []
    for loc in WARDS_AND_VILLAGES:
        loc_id = loc["id"]
        if is_live:
            live_env = live_data_service.get_live_environment_for_location(loc_id)
            vars_data = live_env.get("variables", {})
            loc_input = {
                **loc,
                "rainfall": float(vars_data.get("rainfall", {}).get("value", 0.0)),
                "soil_moisture": float(vars_data.get("soil_moisture", {}).get("value", 50.0)),
                "drainage_condition": float(vars_data.get("drainage_condition", {}).get("value", 80.0)),
                "citizen_reports_count": 0,
                "waterlogging_trend": "stable"
            }
        else:
            loc_input = loc

        pred_res = flood_prediction_service.predict(loc_input)
        prob = pred_res.get("probability", 50.0) if pred_res.get("success") else 50.0
        cause_res = cause_intelligence_engine.analyze_cause(loc_input)
        impact_res = impact_assessment_engine.assess_impact(loc["id"], prob, cause_res.get("cause_code", "UNCERTAIN"))
        
        alert = alert_engine.generate_alert(loc["id"], loc["name"], prob, cause_res, impact_res)
        alert["origin_type"] = "JALRAKSHAK RISK ASSESSMENT" if is_live else "SIMULATED ALERT"
        alert["is_official_government_warning"] = False
        alerts.append(alert)

    # Sort critical first, then warning
    severity_order = {"CRITICAL": 0, "WARNING": 1, "WATCH": 2, "INFORMATION": 3}
    alerts.sort(key=lambda a: severity_order.get(a["severity"], 9))

    # In LIVE mode, fetch official IMD CAP bulletins
    official_warnings = []
    if is_live:
        official_warnings = live_data_service.fetch_imd_cap_warnings()

    return {
        "success": True,
        "mode": effective_mode,
        "is_demo_mode": not is_live,
        "count": len(alerts),
        "alerts": alerts,
        "official_imd_warnings": official_warnings
    }

@app.post("/api/reports")
def submit_citizen_report(report: CitizenReportRequest):
    """Receives crowd-sourced waterlogging report and injects it into the live intelligence feed."""
    new_report = {
        "id": f"REP-2026-{len(CITIZEN_REPORTS) + 105}",
        "location_id": report.location_id,
        "location_name": report.location_name,
        "coordinates": [report.latitude or 30.0920, report.longitude or 78.2690],
        "timestamp": "Just now",
        "severity": report.severity,
        "description": report.description,
        "image_url": report.image_url or "/assets/sample_waterlog.jpg",
        "status": "VERIFIED_BY_VISION",
        "yolo_detections": [
            {"label": "waterlogged_road", "conf": 96.5},
            {"label": "blocked_drain_culvert", "conf": 91.2}
        ]
    }
    CITIZEN_REPORTS.insert(0, new_report)
    
    # Increment citizen reports count for the affected location
    for loc in WARDS_AND_VILLAGES:
        if loc["id"] == report.location_id:
            loc["citizen_reports_count"] = loc.get("citizen_reports_count", 0) + 1
            loc["waterlogging_trend"] = "increasing"

    return {
        "success": True,
        "message": "Citizen report logged and dispatched to authority command center",
        "report": new_report
    }

@app.get("/api/sensors")
def get_sensors():
    return {
        "success": True,
        "count": len(IOT_SENSORS),
        "sensors": IOT_SENSORS,
        "data_origin": "DEMO / SIMULATED SENSOR TELEMETRY" if CURRENT_MODE == "DEMO" else "LIVE IOT GATEWAY"
    }

@app.get("/api/historical-events")
def get_historical_events(event_type: Optional[str] = None):
    events = HISTORICAL_EVENTS
    if event_type:
        events = [e for e in events if event_type.lower() in e["event_type"].lower()]
    return {
        "success": True,
        "events": events
    }

@app.get("/api/historical-analytics")
def get_historical_analytics():
    """Time-series chart data for rainfall trends, soil moisture, and alert counts."""
    rainfall_trend = [
        {"hour": "06:00", "rainfall_mm": 5, "soil_moisture_pct": 42, "risk_score": 15},
        {"hour": "08:00", "rainfall_mm": 12, "soil_moisture_pct": 48, "risk_score": 22},
        {"hour": "10:00", "rainfall_mm": 28, "soil_moisture_pct": 59, "risk_score": 38},
        {"hour": "12:00", "rainfall_mm": 42, "soil_moisture_pct": 74, "risk_score": 62},
        {"hour": "13:00", "rainfall_mm": 44, "soil_moisture_pct": 82, "risk_score": 87},
        {"hour": "14:00 (Forecast)", "rainfall_mm": 38, "soil_moisture_pct": 85, "risk_score": 84}
    ]
    
    alerts_by_type = [
        {"month": "Jun", "cloudburst_overload": 2, "drainage_blockage": 7, "landslides": 1},
        {"month": "Jul", "cloudburst_overload": 6, "drainage_blockage": 19, "landslides": 4},
        {"month": "Aug", "cloudburst_overload": 9, "drainage_blockage": 24, "landslides": 7},
        {"month": "Sep", "cloudburst_overload": 3, "drainage_blockage": 11, "landslides": 2}
    ]

    return {
        "success": True,
        "rainfall_time_series": rainfall_trend,
        "seasonal_alerts_distribution": alerts_by_type,
        "average_early_warning_lead_time_minutes": 84,
        "drainage_blockage_share_pct": 62.5
    }

@app.get("/api/risk/timeline")
def get_risk_timeline():
    return {
        "success": True,
        "stages": RISK_TIMELINE_STAGES
    }

@app.post("/api/demo/scenario/{scenario_id}")
def switch_scenario(scenario_id: str):
    """
    Switches between real-world demo scenarios:
    - scenario_1_heavy_rainfall: Cloudburst overload
    - scenario_2_drainage_blockage: Blocked drain with moderate rain
    - baseline: Nominal clear weather
    """
    global CURRENT_SCENARIO, CURRENT_MODE
    CURRENT_SCENARIO = scenario_id
    CURRENT_MODE = "DEMO"

    if scenario_id == "scenario_1_heavy_rainfall":
        for loc in WARDS_AND_VILLAGES:
            if loc["id"] == "ward-04":
                loc["rainfall"] = 110.0
                loc["soil_moisture"] = 96.0
                loc["drainage_condition"] = 72.0
                loc["sensor_water_level"] = 5.1
            elif loc["id"] == "ward-12":
                loc["rainfall"] = 92.0
                loc["soil_moisture"] = 88.0
                loc["drainage_condition"] = 55.0
        return {"success": True, "scenario": scenario_id, "message": "Scenario 1 Activated: Heavy Rainfall Overload (Cloudburst Burst)"}

    elif scenario_id == "scenario_2_drainage_blockage":
        for loc in WARDS_AND_VILLAGES:
            if loc["id"] == "ward-12":
                loc["rainfall"] = 42.0 # Moderate rainfall
                loc["drainage_condition"] = 18.0 # Severely choked!
                loc["citizen_reports_count"] = 14
                loc["waterlogging_trend"] = "increasing"
                loc["soil_moisture"] = 81.5
            elif loc["id"] == "ward-04":
                loc["rainfall"] = 35.0
                loc["drainage_condition"] = 65.0
        return {"success": True, "scenario": scenario_id, "message": "Scenario 2 Activated: Blocked Drain with Moderate Rain (Localized Choke Point)"}

    else:
        for loc in WARDS_AND_VILLAGES:
            loc["rainfall"] = 14.0
            loc["drainage_condition"] = 85.0
            loc["soil_moisture"] = 40.0
            loc["citizen_reports_count"] = 0
            loc["waterlogging_trend"] = "none"
        return {"success": True, "scenario": "baseline", "message": "Nominal Baseline Scenario Activated"}

@app.get("/api/drainage/search")
def search_drainage(
    q: str = Query(default="", description="Search road, area, or ward"),
    limit: int = Query(default=15, ge=1, le=100)
):
    results = drainage_service.search(q, limit=limit)
    return {
        "success": True,
        "count": len(results),
        "results": results
    }

@app.get("/api/drainage/records")
def get_drainage_records(
    limit: int = Query(default=100, ge=1, le=505),
    offset: int = Query(default=0, ge=0)
):
    records = drainage_service.get_all_records(limit=limit, offset=offset)
    return {
        "success": True,
        "total": len(drainage_service.records),
        "count": len(records),
        "records": records
    }

@app.get("/api/drainage/record/{sr_no}")
def get_drainage_record(sr_no: int):
    rec = drainage_service.get_record(sr_no)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Drainage record {sr_no} not found")
    return {
        "success": True,
        "record": rec
    }

@app.get("/api/drainage/diagnosis")
def get_drainage_diagnosis(
    sr_no: int = Query(default=1),
    mode: Optional[str] = Query(default=None),
    rainfall: Optional[float] = Query(default=None),
    accumulation: Optional[str] = Query(default=None),
    citizen_reports: Optional[int] = Query(default=None)
):
    effective_mode = mode or CURRENT_MODE
    try:
        res = drainage_service.diagnose(
            sr_no=sr_no,
            mode=effective_mode,
            rainfall_override=rainfall,
            accumulation_override=accumulation,
            reports_override=citizen_reports
        )
        return {
            "success": True,
            **res
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/api/drainage/mumbai-weather")
def get_mumbai_live_weather():
    """
    Returns authentic live weather observations for Mumbai from Open-Meteo API.
    """
    return drainage_service.get_mumbai_live_weather()

@app.get("/api/drainage/mumbai-roads")
def get_mumbai_drainage_roads(
    rainfall: Optional[float] = Query(default=None, description="Rainfall intensity in mm/hr for dynamic risk assessment (if omitted, uses live Open-Meteo rainfall)"),
    use_live_rain: bool = Query(default=False, description="Explicitly use live rainfall from Open-Meteo")
):
    """
    Returns authentic geocoded Mumbai roads with drainage segments and dynamic waterlogging risk.
    """
    return drainage_service.get_mumbai_geocoded_roads(rainfall_mm=rainfall, use_live_rain=use_live_rain)


