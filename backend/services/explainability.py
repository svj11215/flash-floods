import logging
from typing import Dict, Any, List
import numpy as np
try:
    import shap
except ImportError:
    shap = None
from services.flood_prediction import flood_prediction_service

logger = logging.getLogger("jalrakshak.explainability")

class ExplainabilityService:
    def __init__(self):
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        if flood_prediction_service.is_loaded and flood_prediction_service.model is not None:
            try:
                self.explainer = shap.TreeExplainer(flood_prediction_service.model)
                logger.info("SHAP TreeExplainer initialized successfully")
            except Exception as e:
                logger.warning(f"Failed to initialize SHAP TreeExplainer: {e}")
                self.explainer = None

    def explain(self, feature_vector: List[float], feature_order: List[str]) -> Dict[str, Any]:
        """
        Computes SHAP values and normalizes them into clear percentage feature contributions,
        strictly separating feature contribution from overall model probability.
        """
        if self.explainer is None:
            self._init_explainer()

        if self.explainer is None:
            return {
                "available": False,
                "status_message": "Explainability engine awaiting model initialization",
                "contributions": []
            }

        try:
            X = np.array([feature_vector], dtype=np.float32)
            shap_values = self.explainer.shap_values(X)
            
            # Handle 1D or 2D SHAP output
            if isinstance(shap_values, list):
                sv = shap_values[0][0]
            elif shap_values.ndim > 1:
                sv = shap_values[0]
            else:
                sv = shap_values

            # Map raw shap values to feature names
            raw_attributions = {}
            positive_impact_sum = 0.0
            
            for idx, feat in enumerate(feature_order):
                val = float(sv[idx]) if idx < len(sv) else 0.0
                raw_attributions[feat] = round(val, 3)
                if val > 0:
                    positive_impact_sum += val

            # Compute relative contribution percentage (0-100%) of positive hazard drivers
            contributions = []
            friendly_names = {
                "rainfall": "Rainfall Intensity",
                "soil_moisture": "Soil Moisture Saturation",
                "slope": "Terrain Slope Angle",
                "elevation": "Topographical Lowland Factor",
                "drainage_condition": "Drainage Choking / Inefficiency",
                "historical_events": "Historical Flash Flood Recurrence",
                "sensor_water_level": "Culvert / Gauge Water Surcharge",
                "impervious_surface_pct": "Urban Surface Runoff Coefficient"
            }

            for idx, feat in enumerate(feature_order):
                val = raw_attributions.get(feat, 0.0)
                # If drainage_condition is low, the choking contribution is positive
                # Compute contribution index
                if positive_impact_sum > 0 and val > 0:
                    pct = round((val / positive_impact_sum) * 100.0, 1)
                else:
                    pct = 0.0
                
                # Scaled severity index between 0-100 for visual bars
                norm_score = max(5.0, min(95.0, round(50.0 + (val * 4.0), 1)))

                contributions.append({
                    "feature_id": feat,
                    "feature_name": friendly_names.get(feat, feat.replace("_", " ").title()),
                    "shap_value": val,
                    "relative_contribution_pct": pct,
                    "severity_score": norm_score,
                    "direction": "RISK_INCREASING" if val > 0 else "RISK_REDUCING"
                })

            # Sort descending by impact
            contributions.sort(key=lambda x: x["shap_value"], reverse=True)

            return {
                "available": True,
                "engine": "shap.TreeExplainer",
                "status_message": "Feature attribution computed via SHAP TreeExplainer",
                "contributions": contributions,
                "top_driver": contributions[0]["feature_name"] if contributions else "Unknown",
                "base_value": float(self.explainer.expected_value) if hasattr(self.explainer, "expected_value") else 50.0
            }

        except Exception as e:
            logger.error(f"SHAP explanation failed: {e}")
            return {
                "available": False,
                "status_message": f"SHAP calculation error: {str(e)}",
                "contributions": []
            }

explainability_service = ExplainabilityService()
