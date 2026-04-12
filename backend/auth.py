"""
auth.py
─────────────────────────────────────────────────────────────────────────────
Authentication Blueprint — Register / Login / Token verify
─────────────────────────────────────────────────────────────────────────────

Endpoints:
  POST /api/auth/register   { name, email, password }  → { token, user }
  POST /api/auth/login      { email, password }         → { token, user }
  GET  /api/auth/me         (Bearer token required)     → { user }
─────────────────────────────────────────────────────────────────────────────
"""

import os
import re
import hashlib
import hmac
import base64
import json
from datetime import datetime, timedelta
from functools import wraps

from flask import Blueprint, request, jsonify
from db import get_db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────

SECRET_KEY = os.getenv('SECRET_KEY', 'change-this-in-production-please')
TOKEN_TTL_HOURS = 72   # token valid for 3 days


# ─────────────────────────────────────────────
# LIGHTWEIGHT JWT  (no extra library needed)
# ─────────────────────────────────────────────

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + '=' * padding)


def create_token(payload: dict) -> str:
    """Create a simple HS256 JWT-like token."""
    header  = _b64url_encode(json.dumps({'alg': 'HS256', 'typ': 'JWT'}).encode())
    body    = _b64url_encode(json.dumps(payload).encode())
    sig_input = f'{header}.{body}'.encode()
    sig     = hmac.new(SECRET_KEY.encode(), sig_input, hashlib.sha256).digest()
    return f'{header}.{body}.{_b64url_encode(sig)}'


def verify_token(token: str) -> dict | None:
    """Verify token signature and expiry. Returns payload dict or None."""
    try:
        header, body, sig = token.split('.')
        sig_input = f'{header}.{body}'.encode()
        expected  = hmac.new(SECRET_KEY.encode(), sig_input, hashlib.sha256).digest()
        if not hmac.compare_digest(_b64url_decode(sig), expected):
            return None
        payload = json.loads(_b64url_decode(body))
        if datetime.utcnow().timestamp() > payload.get('exp', 0):
            return None
        return payload
    except Exception:
        return None


# ─────────────────────────────────────────────
# PASSWORD HASHING  (SHA-256 + salt, no deps)
# ─────────────────────────────────────────────

def _hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Return (hashed, salt). Generate salt if not provided."""
    if salt is None:
        salt = base64.b64encode(os.urandom(16)).decode()
    hashed = hashlib.pbkdf2_hmac(
        'sha256', password.encode(), salt.encode(), 260_000
    )
    return base64.b64encode(hashed).decode(), salt


def _check_password(password: str, hashed: str, salt: str) -> bool:
    computed, _ = _hash_password(password, salt)
    return hmac.compare_digest(computed, hashed)


# ─────────────────────────────────────────────
# AUTH MIDDLEWARE  (decorator for protected routes)
# ─────────────────────────────────────────────

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({'status': 'error', 'message': 'Missing token'}), 401
        token = auth_header[7:]
        payload = verify_token(token)
        if not payload:
            return jsonify({'status': 'error', 'message': 'Invalid or expired token'}), 401
        request.user_id = payload.get('user_id')
        return f(*args, **kwargs)
    return decorated


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def _validate_email(email: str) -> bool:
    return bool(re.match(r'^[^@\s]+@[^@\s]+\.[^@\s]+$', email))


def _user_to_dict(user: dict) -> dict:
    """Strip sensitive fields before sending to client."""
    return {
        'id'          : str(user['_id']),
        'name'        : user['name'],
        'email'       : user['email'],
        'phone'       : user.get('phone', ''),
        'organisation': user.get('organisation', ''),
        'role'        : user.get('role', ''),
        'created_at'  : user.get('created_at', ''),
    }


# ─────────────────────────────────────────────
# ROUTES
# ─────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    Body: { name, email, password }
    """
    data = request.get_json(silent=True) or {}

    name     = (data.get('name', '')     or '').strip()
    email    = (data.get('email', '')    or '').strip().lower()
    password =  data.get('password', '') or ''

    # ── Validation ──
    errors = {}
    if not name:
        errors['name'] = 'Full name is required'
    if not email:
        errors['email'] = 'Email is required'
    elif not _validate_email(email):
        errors['email'] = 'Enter a valid email address'
    if not password:
        errors['password'] = 'Password is required'
    elif len(password) < 6:
        errors['password'] = 'Password must be at least 6 characters'

    if errors:
        return jsonify({'status': 'error', 'message': list(errors.values())[0], 'errors': errors}), 422

    db = get_db()

    # ── Check duplicate email ──
    if db.users.find_one({'email': email}):
        return jsonify({'status': 'error', 'message': 'An account with this email already exists'}), 409

    # ── Create user ──
    hashed, salt = _hash_password(password)
    user_doc = {
        'name'      : name,
        'email'     : email,
        'password'  : hashed,
        'salt'      : salt,
        'created_at': datetime.utcnow().isoformat(),
    }
    result  = db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # ── Generate token ──
    token = create_token({
        'user_id': user_id,
        'email'  : email,
        'exp'    : (datetime.utcnow() + timedelta(hours=TOKEN_TTL_HOURS)).timestamp(),
    })

    user_doc['_id'] = result.inserted_id
    return jsonify({
        'status': 'success',
        'token' : token,
        'user'  : _user_to_dict(user_doc),
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login existing user.
    Body: { email, password }
    """
    data = request.get_json(silent=True) or {}

    email    = (data.get('email', '')    or '').strip().lower()
    password =  data.get('password', '') or ''

    if not email or not password:
        return jsonify({'status': 'error', 'message': 'Email and password are required'}), 422

    db   = get_db()
    user = db.users.find_one({'email': email})

    if not user or not _check_password(password, user['password'], user['salt']):
        return jsonify({'status': 'error', 'message': 'Invalid email or password'}), 401

    user_id = str(user['_id'])
    token   = create_token({
        'user_id': user_id,
        'email'  : email,
        'exp'    : (datetime.utcnow() + timedelta(hours=TOKEN_TTL_HOURS)).timestamp(),
    })

    return jsonify({
        'status': 'success',
        'token' : token,
        'user'  : _user_to_dict(user),
    })


@auth_bp.route('/me', methods=['GET'])
@require_auth
def me():
    """Return current user info (requires Bearer token)."""
    from bson import ObjectId
    db   = get_db()
    user = db.users.find_one({'_id': ObjectId(request.user_id)})
    if not user:
        return jsonify({'status': 'error', 'message': 'User not found'}), 404
    return jsonify({'status': 'success', 'user': _user_to_dict(user)})


@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """
    Update user profile fields.
    Body: { name, email, phone?, organisation?, role? }
    """
    from bson import ObjectId
    data = request.get_json(silent=True) or {}

    name         = (data.get('name', '')         or '').strip()
    email        = (data.get('email', '')         or '').strip().lower()
    phone        = (data.get('phone', '')         or '').strip()
    organisation = (data.get('organisation', '')  or '').strip()
    role         = (data.get('role', '')          or '').strip()

    # Validate
    errors = {}
    if not name:
        errors['name'] = 'Name is required'
    if not email:
        errors['email'] = 'Email is required'
    elif not _validate_email(email):
        errors['email'] = 'Enter a valid email address'

    if errors:
        return jsonify({'status': 'error', 'message': list(errors.values())[0], 'errors': errors}), 422

    db = get_db()

    # Check if email is taken by another user
    existing = db.users.find_one({'email': email, '_id': {'$ne': ObjectId(request.user_id)}})
    if existing:
        return jsonify({'status': 'error', 'message': 'This email is already in use by another account'}), 409

    # Build update doc — only set non-empty optional fields
    update_fields = {
        'name' : name,
        'email': email,
    }
    if phone:        update_fields['phone']        = phone
    if organisation: update_fields['organisation'] = organisation
    if role:         update_fields['role']         = role

    db.users.update_one(
        {'_id': ObjectId(request.user_id)},
        {'$set': update_fields}
    )

    updated_user = db.users.find_one({'_id': ObjectId(request.user_id)})
    return jsonify({
        'status': 'success',
        'message': 'Profile updated successfully',
        'user': _user_to_dict(updated_user),
    })


@auth_bp.route('/password', methods=['PUT'])
@require_auth
def update_password():
    """
    Change password.
    Body: { current_password, new_password }
    """
    from bson import ObjectId
    data             = request.get_json(silent=True) or {}
    current_password = data.get('current_password', '') or ''
    new_password     = data.get('new_password',     '') or ''

    if not current_password:
        return jsonify({'status': 'error', 'message': 'Current password is required'}), 422
    if not new_password or len(new_password) < 6:
        return jsonify({'status': 'error', 'message': 'New password must be at least 6 characters'}), 422

    db   = get_db()
    user = db.users.find_one({'_id': ObjectId(request.user_id)})

    if not user or not _check_password(current_password, user['password'], user['salt']):
        return jsonify({'status': 'error', 'message': 'Current password is incorrect'}), 401

    hashed, salt = _hash_password(new_password)
    db.users.update_one(
        {'_id': ObjectId(request.user_id)},
        {'$set': {'password': hashed, 'salt': salt}}
    )

    return jsonify({'status': 'success', 'message': 'Password updated successfully'})