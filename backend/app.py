"""
app.py
─────────────────────────────────────────────────────────────────────────────
CreditSense — Flask Backend
─────────────────────────────────────────────────────────────────────────────

API Routes
──────────
POST   /api/predict                  Run scorecard + ML on submitted form data
GET    /api/applications             List applications (paginated + filtered)
GET    /api/applications/<id>        Get a single application by ID
DELETE /api/applications/<id>        Delete an application
GET    /api/dashboard/stats          Aggregate stats for dashboard
GET    /api/health                   Health check (DB + ML model status)
─────────────────────────────────────────────────────────────────────────────
"""

import os
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from scorecard import calculate_score
from ml_model  import predict as ml_predict, is_available as ml_available
from db        import (
    ping               as db_ping,
    save_application,
    get_application_by_id,
    get_applications,
    get_dashboard_stats,
    delete_application,
)
from auth import auth_bp

load_dotenv()

# ─────────────────────────────────────────────
# APP INIT
# ─────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=['http://localhost:3000', 'http://127.0.0.1:3000'])
app.register_blueprint(auth_bp)


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _success(data: dict, status: int = 200):
    return jsonify({'status': 'success', **data}), status


def _error(message: str, status: int = 400):
    return jsonify({'status': 'error', 'message': message}), status


def _validate_required(data: dict, fields: list) -> list:
    """Return list of missing required field names."""
    return [f for f in fields if data.get(f) in (None, '')]


# Minimum required fields that must be present for a prediction
REQUIRED_FIELDS = [
    'marital_status', 'total_members', 'pct_earning_members',
    'spouse_working', 'total_dependents',
    'house_ownership', 'residence_stability_months',
    'employment_type', 'job_changes',
    'bureau_score',
]


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────
@app.route("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }

@app.route('/api/health', methods=['GET'])
def health():
    """
    Health check endpoint.
    Returns DB connectivity + ML model status.
    """
    db_ok = db_ping()
    ml_ok = ml_available()

    status_code = 200 if (db_ok and ml_ok) else 503

    return jsonify({
        'status'    : 'healthy' if (db_ok and ml_ok) else 'degraded',
        'timestamp' : datetime.utcnow().isoformat(),
        'services'  : {
            'database' : 'connected'    if db_ok else 'disconnected',
            'ml_model' : 'loaded'       if ml_ok else 'unavailable',
        }
    }), status_code


# ──────────────────────────────────────────────────────────────────
# POST /api/predict
# ──────────────────────────────────────────────────────────────────

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Main prediction endpoint.

    Request body (JSON): all 51 form fields from the React frontend.

    Response:
    {
        scorecard_score      : int
        scorecard_max        : int      (350)
        score_percentage     : float
        approval_level       : str
        approval_color       : str
        section_scores       : { family, residence, office, banking, bureau, health, caution }
        section_max          : { same keys }
        field_breakdown      : { field: pts }
        ml_available         : bool
        ml_prediction        : int | null      (0 or 1)
        prediction_label     : str
        default_probability  : float | null
        no_default_probability: float | null
        ml_error             : str | null
        application_id       : str            (MongoDB _id)
        timestamp            : str            (ISO 8601)
    }
    """
    data = request.get_json(silent=True)
    if not data:
        return _error('Request body must be JSON', 400)

    # Validate minimum required fields
    missing = _validate_required(data, REQUIRED_FIELDS)
    if missing:
        return _error(
            f'Missing required fields: {", ".join(missing)}',
            422
        )

    # ── 1. Scorecard ──
    scorecard = calculate_score(data)

    # ── 2. ML Model ──
    ml = ml_predict(data)

    # ── 3. Persist to MongoDB ──
    app_id = save_application(
        form_data        = data,
        scorecard_result = scorecard,
        ml_result        = ml,
    )

    # ── 4. Build response ──
    return _success({
        # Scorecard
        'scorecard_score'        : scorecard['total_score'],
        'scorecard_max'          : scorecard['max_score'],
        'score_percentage'       : scorecard['score_percentage'],
        'approval_level'         : scorecard['approval_level'],
        'approval_color'         : scorecard['approval_color'],
        'section_scores'         : scorecard['section_scores'],
        'section_max'            : scorecard['section_max'],
        'field_breakdown'        : scorecard['field_breakdown'],

        # ML
        'ml_available'           : ml['available'],
        'ml_prediction'          : ml['prediction'],
        'prediction_label'       : ml['prediction_label'],
        'default_probability'    : ml['default_probability'],
        'no_default_probability' : ml['no_default_probability'],
        'ml_error'               : ml['error'],

        # Meta
        'application_id'         : app_id,
        'timestamp'              : datetime.utcnow().isoformat(),
    }, 201)


# ──────────────────────────────────────────────────────────────────
# GET /api/applications
# ──────────────────────────────────────────────────────────────────

@app.route('/api/applications', methods=['GET'])
def list_applications():
    """
    Paginated list of all saved applications.

    Query params:
        page        int     default 1
        per_page    int     default 20 (max 100)
        approval    str     filter by approval_level
        ml_pred     int     filter by ML prediction (0 or 1)
    """
    try:
        page     = max(1, int(request.args.get('page', 1)))
        per_page = min(100, max(1, int(request.args.get('per_page', 20))))
    except ValueError:
        return _error('page and per_page must be integers', 400)

    approval = request.args.get('approval')
    ml_param = request.args.get('ml_pred')
    ml_pred  = int(ml_param) if ml_param in ('0', '1') else None

    result = get_applications(
        page     = page,
        per_page = per_page,
        approval = approval,
        ml_pred  = ml_pred,
    )

    return _success(result)


# ──────────────────────────────────────────────────────────────────
# GET /api/applications/<id>
# ──────────────────────────────────────────────────────────────────

@app.route('/api/applications/<app_id>', methods=['GET'])
def get_application(app_id):
    """Fetch a single application record by MongoDB _id."""
    doc = get_application_by_id(app_id)
    if doc is None:
        return _error('Application not found', 404)
    return _success({'application': doc})


# ──────────────────────────────────────────────────────────────────
# DELETE /api/applications/<id>
# ──────────────────────────────────────────────────────────────────

@app.route('/api/applications/<app_id>', methods=['DELETE'])
def remove_application(app_id):
    """Delete an application record."""
    deleted = delete_application(app_id)
    if not deleted:
        return _error('Application not found or already deleted', 404)
    return _success({'message': f'Application {app_id} deleted'})


# ──────────────────────────────────────────────────────────────────
# GET /api/dashboard/stats
# ──────────────────────────────────────────────────────────────────

@app.route('/api/dashboard/stats', methods=['GET'])
def dashboard_stats():
    """
    Aggregate statistics for a management dashboard.

    Returns:
        total           : int
        approval_dist   : { level: count }
        ml_dist         : { '0': count, '1': count }
        avg_score_pct   : float
        daily_counts    : [ { date, count } ]
    """
    stats = get_dashboard_stats()
    return _success({'stats': stats})


# ─────────────────────────────────────────────
# ERROR HANDLERS
# ─────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return _error('Endpoint not found', 404)


@app.errorhandler(405)
def method_not_allowed(e):
    return _error('Method not allowed', 405)


@app.errorhandler(500)
def internal_error(e):
    return _error(f'Internal server error: {str(e)}', 500)


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == '__main__':
    port  = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    print(f'\n🚀  CreditSense API starting on http://localhost:{port}')
    print(f'   ML model  : {"✅ loaded" if ml_available() else "⚠️  not found (scorecard-only mode)"}')
    print(f'   MongoDB   : {"✅ connected" if db_ping() else "❌ not reachable"}')
    print()
    app.run(host='0.0.0.0', port=port, debug=debug)