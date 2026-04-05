"""
ml_model.py
─────────────────────────────────────────────────────────────────────────────
Loads the three .pkl files produced by your Jupyter notebook training and
exposes a single predict() function.

Expected pkl files (place all three in backend/models/):
  - credit_model.pkl      : trained classifier (RandomForest / XGBoost / etc.)
  - feature_names.pkl     : list of feature column names in training order
  - label_encoders.pkl    : dict {col_name: LabelEncoder} for categorical cols
─────────────────────────────────────────────────────────────────────────────
"""

import os
import pickle
import pandas as pd
import numpy as np

# ─────────────────────────────────────────────
# LOAD MODELS (once at import time)
# ─────────────────────────────────────────────

_MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

_model          = None
_feature_names  = None
_label_encoders = None
_load_error     = None


def _load_models():
    global _model, _feature_names, _label_encoders, _load_error
    try:
        with open(os.path.join(_MODELS_DIR, 'credit_model.pkl'), 'rb') as f:
            _model = pickle.load(f)

        with open(os.path.join(_MODELS_DIR, 'feature_names.pkl'), 'rb') as f:
            _feature_names = pickle.load(f)

        with open(os.path.join(_MODELS_DIR, 'label_encoders.pkl'), 'rb') as f:
            _label_encoders = pickle.load(f)

        print(f'[ML] Models loaded successfully. Features: {len(_feature_names)}')
    except FileNotFoundError as e:
        _load_error = str(e)
        print(f'[ML] WARNING — model file not found: {e}')
        print('[ML] Prediction endpoint will return scorecard-only results.')
    except Exception as e:
        _load_error = str(e)
        print(f'[ML] ERROR loading models: {e}')


_load_models()


# ─────────────────────────────────────────────
# FEATURE MAPPING
# ─────────────────────────────────────────────
# Maps frontend field names to the exact column names your model was trained on.
# If your training column names already match the frontend field names, this
# dict can stay empty — the code will use field names directly.

FIELD_MAP = {
    # frontend_field_name    : training_column_name
    # Example (uncomment and edit if your training columns differ):
    # 'marital_status'       : 'Marital Status',
    # 'total_members'        : 'Total member in family',
    # 'pct_earning_members'  : 'Percentage of Earning member in family',
    # 'spouse_working'       : 'Spouse Working',
    # 'total_dependents'     : 'Total Number of Dependents',
    # 'house_ownership'      : 'House ownership',
    # 'ownership_proof'      : 'Ownership proof validated',
    # 'residence_stability_months': 'Residence stability in months',
    # 'stability_proof'      : 'Stability proof validated',
    # 'residence_change_count': 'Number of times residence change in last 2 years',
    # 'stays_with_family'    : 'Stays with family',
    # 'resi_traceable'       : 'Resi location traceable',
    # 'pic_available'        : 'Pic of Resi available',
    # 'entry_easy'           : 'Entry to house is easy',
    # 'shared_accommodation' : 'Stays in shared accomodation',
    # 'total_rooms'          : 'Total number of rooms in the house',
    # 'floor'                : 'Floor of residence',
    # 'lift_available'       : 'Lift available',
    # 'residence_type'       : 'Residence Type',
    # 'resi_negative_location': 'Negative Location',
    # 'employment_type'      : 'Employment Type',
    # 'job_changes'          : 'Job change in last 2 years',
    # 'office_traceable'     : 'Office Loacation traceable',
    # 'office_building_type' : 'Type of office building',
    # 'office_entry_easy'    : 'Entry to office is easy ?',
    # 'office_negative_location': 'Negative Location',
    # 'inward_returns'       : 'Inward returns last 12 months',
    # 'utility_via_bank'     : 'Utility bills paid through bank',
    # 'uniform_utility_payment': 'Uniform utility payment across all months',
    # 'bank_transactions'    : 'Transaction through Bank',
    # 'salary_credit_bank'   : 'Salary Credit in the Bank',
    # 'uniform_credit'       : 'Uniform Credit for last 12 months',
    # 'total_credits'        : 'Total number of credit in last 12 months',
    # 'pct_cash_deposit'     : 'Percentage of cash deposit to total deposit',
    # 'intra_group'          : 'Intra group transaction',
    # 'abb_to_emi'           : 'Average Bank Balance (ABB) to Proposed EMI',
    # 'avg_credit_to_emi'    : 'Average Credit to Proposed EMI',
    # 'enquiries_6m'         : 'Total number of enquiry in last 6 months',
    # 'bureau_score'         : 'Score',
    # 'sma_status'           : 'SMA status in any account',
    # 'dpd_instance'         : 'DPD instance',
    # 'write_off'            : 'Write off instance',
    # 'informal_loans'       : 'Loans taken from family and friend not reflecting in Bureau',
    # 'hospitalisation'      : 'Hospitalisation in last 2 years',
    # 'smoker'               : 'Smoker',
    # 'drinker'              : 'Drinker',
    # 'criminal_history'     : 'Criminal History',
    # 'prosecution'          : 'Prosecution',
    # 'rbi_defaulter'        : 'Name in RBI defaulter list',
    # 'un_list'              : 'Name in UN security council Consoldiated list',
    # 'tax_default'          : 'Tax default history',
    # 'political_association': 'Political Association',
}


def _remap_fields(form_data: dict) -> dict:
    """Rename frontend fields to training column names using FIELD_MAP."""
    if not FIELD_MAP:
        return form_data  # names already match
    remapped = {}
    for k, v in form_data.items():
        remapped[FIELD_MAP.get(k, k)] = v
    return remapped


# ─────────────────────────────────────────────
# PREDICT
# ─────────────────────────────────────────────

def predict(form_data: dict) -> dict:
    """
    Run ML inference on the form data.

    Returns:
        {
            available        : bool   — False if pkl files are missing
            prediction       : int    — 0 = No Default, 1 = Default
            prediction_label : str    — 'Default' | 'No Default'
            default_probability : float  — probability of default (0-100)
            no_default_probability : float
            error            : str | None
        }
    """
    # ── Model not loaded ──
    if _model is None:
        return {
            'available'              : False,
            'prediction'             : None,
            'prediction_label'       : 'Unavailable',
            'default_probability'    : None,
            'no_default_probability' : None,
            'error'                  : _load_error or 'Model not loaded',
        }

    try:
        # ── Remap field names ──
        remapped = _remap_fields(form_data)

        # ── Build DataFrame in exact training column order ──
        row = {}
        for col in _feature_names:
            row[col] = remapped.get(col, None)

        df = pd.DataFrame([row], columns=_feature_names)

        # ── Apply label encoders for categorical columns ──
        for col in df.columns:
            if col in _label_encoders:
                le = _label_encoders[col]
                val = str(df[col].iloc[0]) if df[col].iloc[0] is not None else ''
                # Handle unseen categories gracefully
                if val in le.classes_:
                    df[col] = le.transform([val])
                else:
                    # Use the most frequent class (index 0) as fallback
                    df[col] = 0

        # ── Cast remaining columns to numeric ──
        for col in df.columns:
            if col not in (_label_encoders or {}):
                df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

        # ── Inference ──
        pred  = int(_model.predict(df)[0])
        proba = _model.predict_proba(df)[0]  # [P(no default), P(default)]

        default_prob    = round(float(proba[1]) * 100, 2)
        no_default_prob = round(float(proba[0]) * 100, 2)

        return {
            'available'              : True,
            'prediction'             : pred,
            'prediction_label'       : 'Default' if pred == 1 else 'No Default',
            'default_probability'    : default_prob,
            'no_default_probability' : no_default_prob,
            'error'                  : None,
        }

    except Exception as e:
        return {
            'available'              : True,
            'prediction'             : None,
            'prediction_label'       : 'Error',
            'default_probability'    : None,
            'no_default_probability' : None,
            'error'                  : str(e),
        }


def is_available() -> bool:
    """Return True if the ML model loaded successfully."""
    return _model is not None