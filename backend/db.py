"""
db.py
─────────────────────────────────────────────────────────────────────────────
MongoDB connection + all database helper functions.
─────────────────────────────────────────────────────────────────────────────
"""

import os
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient, DESCENDING
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────────
# CONNECTION
# ─────────────────────────────────────────────

_client = None
_db     = None


def get_db():
    """Return the database instance (lazy singleton)."""
    global _client, _db
    if _db is None:
        uri         = os.getenv('MONGO_URI')
        db_name     = os.getenv('MONGO_DB_NAME', 'credit_scorecard')
        _client     = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _db         = _client[db_name]

        # Create indexes on first connect
        _ensure_indexes(_db)

    return _db


def _ensure_indexes(db):
    """Create useful indexes if they don't exist."""
    db.applications.create_index([('created_at', DESCENDING)])
    db.applications.create_index([('approval_level', DESCENDING)])
    db.applications.create_index([('ml_prediction', DESCENDING)])


def ping():
    """Return True if MongoDB is reachable."""
    try:
        get_db().command('ping')
        return True
    except Exception:
        return False


# ─────────────────────────────────────────────
# SERIALISATION HELPER
# ─────────────────────────────────────────────

def _serialise(doc):
    """Convert MongoDB document to JSON-safe dict."""
    if doc is None:
        return None
    doc = dict(doc)
    doc['_id'] = str(doc['_id'])
    # Convert any remaining ObjectId values
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            doc[k] = str(v)
        elif isinstance(v, datetime):
            doc[k] = v.isoformat()
    return doc


# ─────────────────────────────────────────────
# APPLICATIONS COLLECTION
# ─────────────────────────────────────────────

def save_application(form_data: dict, scorecard_result: dict, ml_result: dict) -> str:
    """
    Save a complete application record.

    Stores three logical sub-documents:
      - input       : the raw form data submitted
      - scorecard   : scorecard score, section breakdown, field breakdown
      - prediction  : ML model output
      - meta        : timestamps, status

    Returns the inserted document's string _id.
    """
    db = get_db()

    doc = {
        'input'     : form_data,
        'scorecard' : scorecard_result,
        'prediction': ml_result,
        'meta'      : {
            'created_at'    : datetime.utcnow(),
            'status'        : 'completed',
            'approval_level': scorecard_result.get('approval_level'),
            'score_pct'     : scorecard_result.get('score_percentage'),
            'ml_prediction' : ml_result.get('prediction_label'),
        }
    }

    result = db.applications.insert_one(doc)
    return str(result.inserted_id)


def get_application_by_id(app_id: str) -> dict | None:
    """Fetch a single application by its string _id."""
    try:
        db  = get_db()
        doc = db.applications.find_one({'_id': ObjectId(app_id)})
        return _serialise(doc)
    except Exception:
        return None


def get_applications(
    page        : int  = 1,
    per_page    : int  = 20,
    approval    : str  = None,
    ml_pred     : int  = None,
) -> dict:
    """
    Paginated application list with optional filters.

    Returns:
        {
          data       : list of application dicts
          total      : total matching documents
          page       : current page
          per_page   : items per page
          total_pages: total number of pages
        }
    """
    db = get_db()

    query = {}
    if approval:
        query['meta.approval_level'] = approval
    if ml_pred is not None:
        query['meta.ml_prediction'] = ml_pred

    total    = db.applications.count_documents(query)
    skip     = (page - 1) * per_page
    cursor   = (
        db.applications
        .find(query)
        .sort('meta.created_at', DESCENDING)
        .skip(skip)
        .limit(per_page)
    )

    return {
        'data'        : [_serialise(doc) for doc in cursor],
        'total'       : total,
        'page'        : page,
        'per_page'    : per_page,
        'total_pages' : max(1, -(-total // per_page)),  # ceiling division
    }


def get_dashboard_stats() -> dict:
    """
    Aggregate stats for a management dashboard:
      - total applications
      - approval level counts
      - ML prediction counts
      - average scorecard score
      - daily application counts (last 30 days)
    """
    db = get_db()
    col = db.applications

    total = col.count_documents({})

    # Approval level distribution
    approval_pipeline = [
        {'$group': {'_id': '$meta.approval_level', 'count': {'$sum': 1}}},
        {'$sort':  {'count': DESCENDING}}
    ]
    approval_dist = {
        doc['_id']: doc['count']
        for doc in col.aggregate(approval_pipeline)
        if doc['_id']
    }

    # ML prediction distribution
    ml_pipeline = [
        {'$group': {'_id': '$meta.ml_prediction', 'count': {'$sum': 1}}}
    ]
    ml_dist = {
        str(doc['_id']): doc['count']
        for doc in col.aggregate(ml_pipeline)
        if doc['_id'] is not None
    }

    # Average scorecard percentage
    avg_pipeline = [
        {'$group': {'_id': None, 'avg_pct': {'$avg': '$meta.score_pct'}}}
    ]
    avg_docs = list(col.aggregate(avg_pipeline))
    avg_score_pct = round(avg_docs[0]['avg_pct'], 2) if avg_docs else 0

    # Last 30 days daily counts
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    daily_pipeline = [
        {'$match': {'meta.created_at': {'$gte': thirty_days_ago}}},
        {'$group': {
            '_id': {
                'year' : {'$year' : '$meta.created_at'},
                'month': {'$month': '$meta.created_at'},
                'day'  : {'$dayOfMonth': '$meta.created_at'},
            },
            'count': {'$sum': 1}
        }},
        {'$sort': {'_id.year': 1, '_id.month': 1, '_id.day': 1}}
    ]
    daily_raw = list(col.aggregate(daily_pipeline))
    daily_counts = [
        {
            'date' : f"{r['_id']['year']}-{r['_id']['month']:02d}-{r['_id']['day']:02d}",
            'count': r['count']
        }
        for r in daily_raw
    ]

    return {
        'total'         : total,
        'approval_dist' : approval_dist,
        'ml_dist'       : ml_dist,
        'avg_score_pct' : avg_score_pct,
        'daily_counts'  : daily_counts,
    }


def delete_application(app_id: str) -> bool:
    """Delete a single application. Returns True if deleted."""
    try:
        db     = get_db()
        result = db.applications.delete_one({'_id': ObjectId(app_id)})
        return result.deleted_count == 1
    except Exception:
        return False