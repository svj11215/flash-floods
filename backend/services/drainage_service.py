"""
Drainage Manhole & Sewer Asset Intelligence Service for JalRakshak.
Loads and indexes jalrakshak_mumbai_drainage_manhole_450.json at startup.
Provides sub-millisecond search across Road, Area, and Ward, and dynamic
hydraulic diagnosis combining physical drainage properties with rainfall,
accumulation, and citizen report inputs.
"""
import os
import json
import time
import ssl
import urllib.request
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "jalrakshak_mumbai_drainage_manhole_450.json")

class DrainageService:
    def __init__(self, data_path: str = DATA_FILE):
        self.data_path = data_path
        self.records: List[Dict[str, Any]] = []
        self.records_by_sr: Dict[int, Dict[str, Any]] = {}
        self.loaded: bool = False
        self._load_data()

    def _load_data(self):
        if not os.path.exists(self.data_path):
            print(f"[DrainageService] Warning: Data file {self.data_path} not found.")
            return

        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                self.records = json.load(f)
            
            for item in self.records:
                sr = item.get("sr_no")
                if sr is not None:
                    self.records_by_sr[int(sr)] = item
            
            self.loaded = True
            print(f"[DrainageService] Successfully indexed {len(self.records)} drainage records from {self.data_path}.")
        except Exception as e:
            print(f"[DrainageService] Error loading data: {e}")

    def get_all_records(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return self.records[offset:offset + limit]

    def get_record(self, sr_no: int) -> Optional[Dict[str, Any]]:
        return self.records_by_sr.get(sr_no)

    def search(self, query: str, limit: int = 15) -> List[Dict[str, Any]]:
        """
        Fast tokenized / substring search across road location, area, and ward.
        """
        if not query or not query.strip():
            return self.records[:limit]

        q = query.strip().lower()
        terms = q.split()

        matches = []
        for r in self.records:
            loc = r.get("sewer_stretch_location", "").lower()
            area = r.get("area", "").lower()
            ward = r.get("ward_or_zone", "").lower()
            combined = f"{loc} {area} {ward}"

            # Check if all terms match
            if all(term in combined for term in terms):
                matches.append(r)
                if len(matches) >= limit:
                    break

        return matches

    def diagnose(
        self,
        sr_no: int,
        mode: str = "DEMO",
        rainfall_override: Optional[float] = None,
        accumulation_override: Optional[str] = None,
        reports_override: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Dynamic diagnostic engine based on physical sewer asset metrics and environmental inputs:
        - moderate rain + unusually high accumulation + stressed/choked drainage -> PROBABLE DRAINAGE BLOCKAGE
        - heavy rain + high accumulation + normal drainage -> RAINFALL-DRIVEN WATERLOGGING
        - low/moderate rain + normal drainage + low accumulation -> NORMAL DRAINAGE
        - high rain + poor drainage + high accumulation -> COMBINED WATERLOGGING RISK
        """
        rec = self.get_record(sr_no)
        if not rec and self.records:
            rec = self.records[0]

        if not rec:
            raise ValueError(f"No drainage record found for sr_no={sr_no}")

        road_segment = rec.get("sewer_stretch_location", "Main Corridor")
        area = rec.get("area", "Urban Catchment")
        ward = rec.get("ward_or_zone", "Zone 1")
        drainage_cond = (rec.get("drainage_condition") or "NORMAL").upper()
        drainage_risk = (rec.get("drainage_risk") or "MODERATE").upper()
        sewer_dia = rec.get("sewer_diameter_mm", 600)
        sewer_len = rec.get("sewer_length_m", 1000)
        manhole_count = rec.get("estimated_manhole_count", 30)
        manhole_spacing = rec.get("typical_manhole_spacing_m", 35)
        min_depth = rec.get("manhole_depth_min_m", 4.0)
        max_depth = rec.get("manhole_depth_max_m", 8.0)
        data_status = rec.get("data_status", "SYNTHETIC_PROTOTYPE_ESTIMATE")
        source_note = rec.get("source_note", "Prototype drainage model dataset")

        # In LIVE mode, values can be derived from live telemetry or query overrides.
        # In DEMO mode, values calibrate deterministically to the record's condition and risk.
        if mode.upper() == "LIVE":
            rainfall = rainfall_override if rainfall_override is not None else 32.0
            water_depth_text = accumulation_override or "Moderate (0.6 to 1.0 feet)"
            citizen_reports = reports_override if reports_override is not None else 6
        else:
            # Deterministic DEMO calibration
            if drainage_cond in ["CHOKED", "STRESSED"] and drainage_risk in ["HIGH", "CRITICAL", "MODERATE"]:
                # Classic blockage scenario: moderate rain (18-24 mm/h) with disproportionately high knee/waist depth
                rainfall = rainfall_override if rainfall_override is not None else 18.0
                water_depth_text = accumulation_override or "High (1.2 to 1.8 feet (Knee depth))"
                citizen_reports = reports_override if reports_override is not None else 14
            elif drainage_risk in ["CRITICAL", "HIGH"]:
                # High rain driven
                rainfall = rainfall_override if rainfall_override is not None else 78.0
                water_depth_text = accumulation_override or "High (1.5 to 2.2 feet)"
                citizen_reports = reports_override if reports_override is not None else 18
            else:
                # Nominal
                rainfall = rainfall_override if rainfall_override is not None else 8.0
                water_depth_text = accumulation_override or "Low (Normal road surface / Puddles)"
                citizen_reports = reports_override if reports_override is not None else 1

        is_stressed_or_choked = drainage_cond in ["STRESSED", "CHOKED"]
        is_high_accumulation = any(w in water_depth_text.lower() for w in ["high", "knee", "waist", "deep", "1.", "2."])
        is_moderate_rain = 12.0 <= rainfall < 45.0
        is_heavy_rain = rainfall >= 45.0
        is_low_rain = rainfall < 12.0

        # Classification matrix
        if is_moderate_rain and is_high_accumulation and is_stressed_or_choked:
            diag_state = "PROBABLE_BLOCKAGE"
            state_title = "PREDICTED DRAINAGE BLOCKAGE"
            status_label = "🟠 PREDICTED OBSTRUCTION"
            symbol = "🟠"
            bg_color = "bg-amber-500/15"
            border_color = "border-amber-400"
            text_color = "text-amber-900"
            headline = "Water is predicted to accumulate rapidly due to drainage obstruction."
            main_reason = "Probable Drainage Blockage — Field Verification Required"
            conclusion = "Water is predicted to accumulate unusually high for current rainfall."
            onset_time = "Starts in 20–35 minutes"
            peak_time = "Full backpressure in ~45 mins"
        elif is_heavy_rain and is_high_accumulation and not is_stressed_or_choked:
            diag_state = "RAINFALL_DRIVEN"
            state_title = "RAINFALL-DRIVEN WATERLOGGING"
            status_label = "🔴 EXTREME INTENSITY"
            symbol = "🔴"
            bg_color = "bg-red-500/15"
            border_color = "border-red-400"
            text_color = "text-red-900"
            headline = "High intensity precipitation exceeding gravity hydraulic design capacity."
            main_reason = "Precipitation Rate Exceeds Pipe Flow Capacity (No Blockage Detected)"
            conclusion = "Severe rainfall inundation occurs even while internal conduit flow remains clear."
            onset_time = "Starts in 10–20 minutes"
            peak_time = "Peak street surcharge in ~30 mins"
        elif (is_heavy_rain or is_moderate_rain) and is_stressed_or_choked and is_high_accumulation:
            diag_state = "COMBINED_RISK"
            state_title = "COMBINED WATERLOGGING RISK"
            status_label = "🔴 SEVERE DRAINAGE RESTRICTION"
            symbol = "🔴"
            bg_color = "bg-rose-500/15"
            border_color = "border-rose-400"
            text_color = "text-rose-900"
            headline = "Severe water accumulation driven by both intense rain and poor drainage condition."
            main_reason = "Probable Drainage Blockage & Hydraulic Overload — Field Verification Required"
            conclusion = "High rainfall combined with choked underground culvert leads to extensive street inundation."
            onset_time = "Immediate / Ongoing"
            peak_time = "Severe surcharge reaching crest in ~25 mins"
        else:
            diag_state = "NORMAL_DRAINAGE"
            state_title = "NORMAL DRAINAGE PREDICTED"
            status_label = "🟢 NORMAL DRAINAGE"
            symbol = "🟢"
            bg_color = "bg-emerald-500/10"
            border_color = "border-emerald-300"
            text_color = "text-emerald-900"
            headline = "Surface runoff is predicted to drain smoothly with no waterlogging expected."
            main_reason = "Nominal Gravity Flow — Clear Subsurface Conduits"
            conclusion = "Water accumulation is consistent with current rainfall."
            onset_time = "No waterlogging predicted"
            peak_time = "Clear flow maintained"

        # Probable Location identifier: Never invent manhole IDs
        probable_location = f"Drainage Point — {road_segment}"

        # Refined Actions including proper road details to avoid
        citizen_action = (
            f"Avoid {road_segment} in {area} (Ward {ward}) if possible. "
            f"Predicted runoff surcharge will pool in low-lying curb lanes. "
            f"Use alternate arterial corridors."
            if diag_state != "NORMAL_DRAINAGE"
            else f"{road_segment} in {area} is clear for normal transit."
        )

        authority_action = (
            f"Inspect nearby drainage nodes along {road_segment} ({probable_location}). "
            f"Check silt traps across {manhole_count} manholes and verify {sewer_dia}mm conduit clearance."
            if diag_state != "NORMAL_DRAINAGE"
            else f"Routine maintenance patrol along {road_segment}. {manhole_count} manholes at ~{manhole_spacing}m spacing nominal."
        )

        return {
            "record": {
                "sr_no": rec.get("sr_no"),
                "sewer_stretch_location": road_segment,
                "area": area,
                "ward_or_zone": ward,
                "sewer_diameter_mm": sewer_dia,
                "sewer_length_m": sewer_len,
                "manhole_depth_min_m": min_depth,
                "manhole_depth_max_m": max_depth,
                "estimated_manhole_count": manhole_count,
                "typical_manhole_spacing_m": manhole_spacing,
                "drainage_condition": drainage_cond,
                "drainage_risk": drainage_risk,
                "data_status": data_status,
                "source_note": source_note
            },
            "diagnosis": {
                "state": diag_state,
                "state_badge": {
                    "symbol": symbol,
                    "title": state_title,
                    "bg_class": bg_color,
                    "border_class": border_color,
                    "text_class": text_color
                },
                "status_label": status_label,
                "headline": headline,
                "main_reason": main_reason,
                "predicted_start_time": onset_time,
                "predicted_peak_time": peak_time,
                "probable_location": probable_location,
                "verification_notice": "Field verification required",
                "why": {
                    "rainfall_text": f"{'Light / Moderate' if rainfall < 30 else 'Heavy'} ({rainfall:.0f} mm/hr)",
                    "accumulation_text": water_depth_text,
                    "reports_text": f"Multiple ({citizen_reports} reports)" if citizen_reports > 1 else f"{citizen_reports} report",
                    "drainage_condition_text": f"{drainage_cond} ({sewer_dia}mm Ø)",
                    "summary": conclusion
                },
                "actions": {
                    "citizen": citizen_action,
                    "authority": authority_action
                }
            },
            "operating_mode": mode.upper()
        }

    def get_mumbai_live_weather(self) -> Dict[str, Any]:
        """
        Fetches real-time weather observations for Mumbai from Open-Meteo API.
        Cached for 300 seconds to respect rate limits.
        """
        now = time.time()
        if hasattr(self, "_mumbai_weather_cache") and self._mumbai_weather_cache:
            if (now - getattr(self, "_mumbai_weather_cache_time", 0)) < 300:
                return self._mumbai_weather_cache

        url = (
            "https://api.open-meteo.com/v1/forecast?"
            "latitude=19.0760&longitude=72.8777&"
            "current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m&"
            "hourly=precipitation&"
            "timezone=Asia%2FKolkata"
        )
        weather_descriptions = {
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
            65: "Heavy Monsoon Rain",
            80: "Slight Rain Showers",
            81: "Moderate Rain Showers",
            82: "Violent Rain Showers / Cloudburst",
            95: "Thunderstorm"
        }

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "JalRakshak-Mumbai-Disaster-Intelligence/1.0"}
            )
            ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE
            with urllib.request.urlopen(req, timeout=6, context=ssl_ctx) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            
            curr = data.get("current", {})
            precip = curr.get("precipitation")
            if precip is None:
                precip = curr.get("rain", 0.0)
            
            code = curr.get("weather_code", 0)
            condition_text = weather_descriptions.get(code, "Monsoon Atmosphere")
            
            weather_result = {
                "city": "Mumbai",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "precipitation_mm_hr": float(precip or 0.0),
                "temperature_c": float(curr.get("temperature_2m", 28.0)),
                "relative_humidity_pct": float(curr.get("relative_humidity_2m", 78)),
                "wind_speed_kmh": float(curr.get("wind_speed_10m", 8.0)),
                "weather_code": code,
                "condition": condition_text,
                "observed_at": curr.get("time", datetime.now(timezone(timedelta(hours=5, minutes=30))).strftime("%Y-%m-%d %H:%M")) + " IST",
                "source": "Open-Meteo Live Station (Mumbai)",
                "data_status": "AUTHENTIC_LIVE_OBSERVATION"
            }
            self._mumbai_weather_cache = weather_result
            self._mumbai_weather_cache_time = now
            return weather_result
        except Exception as e:
            fallback = {
                "city": "Mumbai",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "precipitation_mm_hr": 0.0,
                "temperature_c": 28.5,
                "relative_humidity_pct": 76.0,
                "wind_speed_kmh": 9.2,
                "weather_code": 2,
                "condition": "Partly Cloudy (Live Fallback)",
                "observed_at": datetime.now(timezone(timedelta(hours=5, minutes=30))).strftime("%H:%M:%S IST"),
                "source": "Open-Meteo Cached/Fallback",
                "data_status": "OFFLINE_FALLBACK"
            }
            return fallback

    def get_mumbai_geocoded_roads(
        self,
        rainfall_mm: Optional[float] = None,
        use_live_rain: bool = False
    ) -> Dict[str, Any]:
        """
        Returns all 101 geocoded Mumbai roads with infrastructure data from
        jalrakshak_mumbai_drainage_manhole_450.json and dynamically calculated
        waterlogging risk estimates based on rainfall intensity, sewer diameter,
        hydraulic capacity, manhole frequency, and maintenance condition.
        """
        geo_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "mumbai_geocoded_roads.json")
        if not os.path.exists(geo_file):
            return {"success": False, "count": 0, "roads": {}}

        # Resolve rainfall
        live_weather = self.get_mumbai_live_weather()
        is_live = False
        if use_live_rain or rainfall_mm is None:
            effective_rainfall = live_weather.get("precipitation_mm_hr", 0.0)
            is_live = True
        else:
            effective_rainfall = float(rainfall_mm)

        try:
            with open(geo_file, "r", encoding="utf-8") as f:
                roads_data = json.load(f)

            risk_counts = {"LOW": 0, "MODERATE": 0, "HIGH": 0, "SEVERE": 0}

            # Augment each road with dynamic hydraulic risk calculation
            for road_name, road_info in roads_data.items():
                segments = road_info.get("segments", [])
                
                # Analyze all segments to detect the most bottlenecked section
                worst_ratio = 0.0
                worst_segment = segments[0] if segments else {}
                total_len = 0
                total_manholes = 0
                min_dia = 99999
                conditions_set = set()

                for seg in segments:
                    dia = seg.get("sewer_diameter_mm", 600)
                    length = seg.get("sewer_length_m", 500)
                    condition = (seg.get("drainage_condition") or "NORMAL").upper()
                    conditions_set.add(condition)
                    total_len += length
                    total_manholes += seg.get("estimated_manhole_count", max(1, int(length / 30)))
                    min_dia = min(min_dia, dia)

                    # Dynamic hydraulic capacity threshold (Manning formula envelope)
                    # 450mm ~ 25mm/hr; 600mm ~ 35mm/hr; 800mm ~ 48mm/hr; 1200mm+ ~ 72mm/hr
                    cap = (dia / 1000.0) * 56.0
                    if condition in ["CHOKED", "COLLAPSED", "DAMAGED"]:
                        cap *= 0.32
                    elif condition in ["STRESSED", "POOR"]:
                        cap *= 0.62
                    elif condition in ["GOOD"]:
                        cap *= 1.22
                    
                    # Length surcharge factor (long runs with high friction accumulate backwater)
                    if length > 1000:
                        cap *= 0.88

                    ratio = effective_rainfall / max(cap, 8.0)
                    if ratio > worst_ratio:
                        worst_ratio = ratio
                        worst_segment = seg

                # Classify risk level
                if worst_ratio >= 1.55 or (effective_rainfall > 10 and worst_segment.get("drainage_condition") == "CHOKED"):
                    risk_level = "SEVERE"
                    cause = (
                        f"Precipitation ({effective_rainfall:.1f} mm/hr) vastly exceeds discharge capacity "
                        f"of {worst_segment.get('sewer_diameter_mm', 600)}mm conduit ({worst_segment.get('drainage_condition', 'NORMAL')}). "
                        f"Severe hydraulic surcharging and runoff backflow."
                    )
                    verification_required = True
                    verification_text = "⚠️ Urgent Field Patrol & Municipal Suction Desilting Required"
                elif worst_ratio >= 1.05:
                    risk_level = "HIGH"
                    cause = (
                        f"Surcharge warning: {effective_rainfall:.1f} mm/hr near maximum hydraulic envelope "
                        f"of {worst_segment.get('sewer_diameter_mm', 600)}mm drain ({worst_segment.get('drainage_condition', 'NORMAL')}). "
                        f"Pavement curb inundation expected."
                    )
                    verification_required = True
                    verification_text = "⚠️ Field verification required (Check silt traps & curb inlets)"
                elif worst_ratio >= 0.55:
                    risk_level = "MODERATE"
                    cause = (
                        f"Stormwater drain operating under partial strain ({effective_rainfall:.1f} mm/hr). "
                        f"Localized surface puddling in low depressions near {worst_segment.get('estimated_manhole_count', 12)} manhole chambers."
                    )
                    verification_required = False
                    verification_text = "Standard monitoring (Normal patrol frequency)"
                else:
                    risk_level = "LOW"
                    cause = (
                        f"Runoff within hydraulic envelope of {min_dia}mm sewer system ({effective_rainfall:.1f} mm/hr). "
                        f"Gravity discharge nominal across {total_len}m trunk line."
                    )
                    verification_required = False
                    verification_text = "No immediate verification needed (Conduit clear)"

                risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1

                # Construct rich, concise metadata matching card requirements
                min_depth = worst_segment.get("manhole_depth_min_m", 4.5)
                max_depth = worst_segment.get("manhole_depth_max_m", 7.5)
                spacing = worst_segment.get("typical_manhole_spacing_m", 30)

                road_info["dynamic_risk"] = {
                    "level": risk_level,
                    "rainfall_mm": effective_rainfall,
                    "is_live_rainfall": is_live,
                    "drainage_condition": worst_segment.get("drainage_condition", "NORMAL"),
                    "drainage_risk": worst_segment.get("drainage_risk", "MODERATE"),
                    "sewer_diameter_mm": worst_segment.get("sewer_diameter_mm", 600),
                    "sewer_length_m": total_len or worst_segment.get("sewer_length_m", 500),
                    "estimated_manhole_count": total_manholes or worst_segment.get("estimated_manhole_count", 15),
                    "typical_manhole_spacing_m": spacing,
                    "manhole_depth_range_m": f"{min_depth:.1f}m – {max_depth:.1f}m",
                    "manhole_info": f"~{total_manholes} chambers at ~{spacing}m spacing ({min_depth:.1f}m–{max_depth:.1f}m depth)",
                    "primary_contributing_factor": cause,
                    "field_verification_required": verification_required,
                    "field_verification_notice": verification_text,
                    "is_estimate": True,
                    "data_status": "SYNTHETIC_PROTOTYPE_ESTIMATE",
                    "disclaimer": "Prototype simulation based on jalrakshak_mumbai_drainage_manhole_450.json. Not official BMC municipal telemetry."
                }

            return {
                "success": True,
                "count": len(roads_data),
                "rainfall_evaluated_mm": effective_rainfall,
                "is_live_rainfall": is_live,
                "live_weather": live_weather,
                "risk_counts": risk_counts,
                "roads": roads_data
            }
        except Exception as e:
            return {"success": False, "error": str(e), "roads": {}}

drainage_service = DrainageService()

