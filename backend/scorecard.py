"""
scorecard.py
─────────────────────────────────────────────────────────────────────────────
Retail Credit Scorecard — scoring engine
Mirrors the exact scoring rules from the Retail_Credit_Scorecard PDF.

Total max score : 350
Approval bands  :
    ≥ 80%  → STP  (Straight Through Processing)
    60-79% → L1   (Level 1 approval)
    40-59% → L2   (Level 2 approval)
    < 40%  → L3 / Reject
─────────────────────────────────────────────────────────────────────────────
"""

MAX_SCORE = 350


# ─────────────────────────────────────────────
# HELPER
# ─────────────────────────────────────────────

def _safe_int(val, default=0):
    """Safely cast a value to int, returning default on failure."""
    try:
        return int(float(val))
    except (TypeError, ValueError):
        return default


def _safe_float(val, default=0.0):
    """Safely cast a value to float, returning default on failure."""
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _yn(val):
    """Normalise a Yes/No field — returns 'Yes' or 'No'."""
    if isinstance(val, str):
        return val.strip().capitalize()
    return 'No'


# ─────────────────────────────────────────────
# SECTION SCORERS  (each returns int score + dict breakdown)
# ─────────────────────────────────────────────

def _score_family(d):
    """
    Section: Family Details
    Max: 40 pts
    """
    breakdown = {}
    score = 0

    # Marital Status  (Married → 5, Others → 0)
    breakdown['marital_status'] = 5 if d.get('marital_status') == 'Married' else 0
    score += breakdown['marital_status']

    # Total members  (0-3 → 10, 4-10 → 5, >10 → 0)
    tm = _safe_int(d.get('total_members', 0))
    if tm <= 3:
        breakdown['total_members'] = 10
    elif tm <= 10:
        breakdown['total_members'] = 5
    else:
        breakdown['total_members'] = 0
    score += breakdown['total_members']

    # % Earning members  (>50% → 5, else → 0)
    pem = _safe_float(d.get('pct_earning_members', 0))
    breakdown['pct_earning_members'] = 5 if pem > 50 else 0
    score += breakdown['pct_earning_members']

    # Spouse working  (No → 5, Yes → 10)
    # NOTE: spouse NOT working = lower financial pressure = better score
    sw = _yn(d.get('spouse_working', 'No'))
    breakdown['spouse_working'] = 5 if sw == 'No' else 10
    score += breakdown['spouse_working']

    # Total dependents  (0-3 → 10, 4-10 → 5, >10 → 0)
    dep = _safe_int(d.get('total_dependents', 0))
    if dep <= 3:
        breakdown['total_dependents'] = 10
    elif dep <= 10:
        breakdown['total_dependents'] = 5
    else:
        breakdown['total_dependents'] = 0
    score += breakdown['total_dependents']

    return score, breakdown


def _score_residence(d):
    """
    Section: Residence Stability
    Max: 105 pts
    """
    breakdown = {}
    score = 0

    # House ownership  (Owned → 10, Rented → 5)
    ho = d.get('house_ownership', '')
    breakdown['house_ownership'] = 10 if ho == 'Owned' else 5
    score += breakdown['house_ownership']

    # Ownership proof validated  (Yes → 5, No → 0)
    breakdown['ownership_proof'] = 5 if _yn(d.get('ownership_proof')) == 'Yes' else 0
    score += breakdown['ownership_proof']

    # Residence stability months  (0-12 → 0, 13-24 → 5, >24 → 10)
    rsm = _safe_int(d.get('residence_stability_months', 0))
    if rsm <= 12:
        breakdown['residence_stability_months'] = 0
    elif rsm <= 24:
        breakdown['residence_stability_months'] = 5
    else:
        breakdown['residence_stability_months'] = 10
    score += breakdown['residence_stability_months']

    # Stability proof validated  (Yes → 5, No → 0)
    breakdown['stability_proof'] = 5 if _yn(d.get('stability_proof')) == 'Yes' else 0
    score += breakdown['stability_proof']

    # Residence change count last 2 yrs  (0 → 10, 1-3 → 5, >3 → 0)
    rcc = _safe_int(d.get('residence_change_count', 0))
    if rcc == 0:
        breakdown['residence_change_count'] = 10
    elif rcc <= 3:
        breakdown['residence_change_count'] = 5
    else:
        breakdown['residence_change_count'] = 0
    score += breakdown['residence_change_count']

    # Stays with family  (Yes → 5, No → 0)
    breakdown['stays_with_family'] = 5 if _yn(d.get('stays_with_family')) == 'Yes' else 0
    score += breakdown['stays_with_family']

    # Resi location traceable  (Yes → 5, No → 0)
    breakdown['resi_traceable'] = 5 if _yn(d.get('resi_traceable')) == 'Yes' else 0
    score += breakdown['resi_traceable']

    # Pic of residence available  (Yes → 5, No → 0)
    breakdown['pic_available'] = 5 if _yn(d.get('pic_available')) == 'Yes' else 0
    score += breakdown['pic_available']

    # Entry to house easy  (Yes → 5, No → 0)
    breakdown['entry_easy'] = 5 if _yn(d.get('entry_easy')) == 'Yes' else 0
    score += breakdown['entry_easy']

    # Shared accommodation  (No → 5, Yes → 0)
    breakdown['shared_accommodation'] = 5 if _yn(d.get('shared_accommodation')) == 'No' else 0
    score += breakdown['shared_accommodation']

    # Total rooms  (1-2 → 2, 3-5 → 5, >5 → 10)
    rooms = _safe_int(d.get('total_rooms', 1))
    if rooms <= 2:
        breakdown['total_rooms'] = 2
    elif rooms <= 5:
        breakdown['total_rooms'] = 5
    else:
        breakdown['total_rooms'] = 10
    score += breakdown['total_rooms']

    # Floor of residence  (0-5 → 10, >5 → 5)
    floor = _safe_int(d.get('floor', 0))
    breakdown['floor'] = 10 if floor <= 5 else 5
    score += breakdown['floor']

    # Lift available  (Yes → 5, No → 0)
    breakdown['lift_available'] = 5 if _yn(d.get('lift_available')) == 'Yes' else 0
    score += breakdown['lift_available']

    # Residence type  (Bunglow → 10, Flat → 5, Chawl → 0)
    rtype = d.get('residence_type', '')
    if rtype == 'Bunglow':
        breakdown['residence_type'] = 10
    elif rtype == 'Flat':
        breakdown['residence_type'] = 5
    else:
        breakdown['residence_type'] = 0
    score += breakdown['residence_type']

    # Negative location  (No → 5, Yes → 0)
    breakdown['resi_negative_location'] = 5 if _yn(d.get('resi_negative_location')) == 'No' else 0
    score += breakdown['resi_negative_location']

    return score, breakdown


def _score_office(d):
    """
    Section: Office Stability
    Max: 40 pts
    """
    breakdown = {}
    score = 0

    # Employment type  (Permanent → 5, Contractual → 0)
    breakdown['employment_type'] = 5 if d.get('employment_type') == 'Permanent' else 0
    score += breakdown['employment_type']

    # Job changes last 2 yrs  (0-2 → 10, 3-5 → 5, >5 → 0)
    jc = _safe_int(d.get('job_changes', 0))
    if jc <= 2:
        breakdown['job_changes'] = 10
    elif jc <= 5:
        breakdown['job_changes'] = 5
    else:
        breakdown['job_changes'] = 0
    score += breakdown['job_changes']

    # Office location traceable  (Yes → 5, No → 0)
    breakdown['office_traceable'] = 5 if _yn(d.get('office_traceable')) == 'Yes' else 0
    score += breakdown['office_traceable']

    # Type of office building  (Commercial Complex → 10, Factory/Office → 5)
    obt = d.get('office_building_type', '')
    breakdown['office_building_type'] = 10 if obt == 'Commercial Complex' else 5
    score += breakdown['office_building_type']

    # Entry to office easy  (Yes → 5, No → 0)
    breakdown['office_entry_easy'] = 5 if _yn(d.get('office_entry_easy')) == 'Yes' else 0
    score += breakdown['office_entry_easy']

    # Negative location  (No → 5, Yes → 0)
    breakdown['office_negative_location'] = 5 if _yn(d.get('office_negative_location')) == 'No' else 0
    score += breakdown['office_negative_location']

    return score, breakdown


def _score_banking(d):
    """
    Section: Banking
    Max: 80 pts
    """
    breakdown = {}
    score = 0

    # Inward returns last 12 months  (0-2 → 5, 3-6 → 2, >6 → 0)
    ir = _safe_int(d.get('inward_returns', 0))
    if ir <= 2:
        breakdown['inward_returns'] = 5
    elif ir <= 6:
        breakdown['inward_returns'] = 2
    else:
        breakdown['inward_returns'] = 0
    score += breakdown['inward_returns']

    # Utility bills via bank  (Yes → 5, No → 0)
    breakdown['utility_via_bank'] = 5 if _yn(d.get('utility_via_bank')) == 'Yes' else 0
    score += breakdown['utility_via_bank']

    # Uniform utility payment  (Yes → 5, No → 0)
    breakdown['uniform_utility_payment'] = 5 if _yn(d.get('uniform_utility_payment')) == 'Yes' else 0
    score += breakdown['uniform_utility_payment']

    # Bank transactions  (Yes → 5, No → 0)
    breakdown['bank_transactions'] = 5 if _yn(d.get('bank_transactions')) == 'Yes' else 0
    score += breakdown['bank_transactions']

    # Salary credit in bank  (Yes → 5, No → 0)
    breakdown['salary_credit_bank'] = 5 if _yn(d.get('salary_credit_bank')) == 'Yes' else 0
    score += breakdown['salary_credit_bank']

    # Uniform credit last 12 months  (Yes → 5, No → 0)
    breakdown['uniform_credit'] = 5 if _yn(d.get('uniform_credit')) == 'Yes' else 0
    score += breakdown['uniform_credit']

    # Total credits last 12 months  (>12 → 10, 7-12 → 5, 0-6 → 0)
    tc = _safe_int(d.get('total_credits', 0))
    if tc > 12:
        breakdown['total_credits'] = 10
    elif tc >= 7:
        breakdown['total_credits'] = 5
    else:
        breakdown['total_credits'] = 0
    score += breakdown['total_credits']

    # % cash deposit to total deposit  (0-25 → 10, 26-50 → 5, >50 → 0)
    pcd = _safe_float(d.get('pct_cash_deposit', 0))
    if pcd <= 25:
        breakdown['pct_cash_deposit'] = 10
    elif pcd <= 50:
        breakdown['pct_cash_deposit'] = 5
    else:
        breakdown['pct_cash_deposit'] = 0
    score += breakdown['pct_cash_deposit']

    # Intra-group transaction  (No → 5, Yes → 0)
    breakdown['intra_group'] = 5 if _yn(d.get('intra_group')) == 'No' else 0
    score += breakdown['intra_group']

    # ABB to Proposed EMI ratio  (≥3 → 10, ≥2 → 5, ≥1 → 3, <1 → 0)
    abb = _safe_float(d.get('abb_to_emi', 0))
    if abb >= 3:
        breakdown['abb_to_emi'] = 10
    elif abb >= 2:
        breakdown['abb_to_emi'] = 5
    elif abb >= 1:
        breakdown['abb_to_emi'] = 3
    else:
        breakdown['abb_to_emi'] = 0
    score += breakdown['abb_to_emi']

    # Avg Credit to Proposed EMI ratio  (≥3 → 10, ≥2 → 5, ≥1 → 3, <1 → 0)
    ac = _safe_float(d.get('avg_credit_to_emi', 0))
    if ac >= 3:
        breakdown['avg_credit_to_emi'] = 10
    elif ac >= 2:
        breakdown['avg_credit_to_emi'] = 5
    elif ac >= 1:
        breakdown['avg_credit_to_emi'] = 3
    else:
        breakdown['avg_credit_to_emi'] = 0
    score += breakdown['avg_credit_to_emi']

    return score, breakdown


def _score_bureau(d):
    """
    Section: Bureau
    Max: 40 pts
    """
    breakdown = {}
    score = 0

    # Total enquiries last 6 months  (0-4 → 10, 5-8 → 5, >8 → 0)
    enq = _safe_int(d.get('enquiries_6m', 0))
    if enq <= 4:
        breakdown['enquiries_6m'] = 10
    elif enq <= 8:
        breakdown['enquiries_6m'] = 5
    else:
        breakdown['enquiries_6m'] = 0
    score += breakdown['enquiries_6m']

    # Bureau Score  (750-900 → 10, 650-749 → 6, 500-649 → 3, 300-499 → 0, -1/NH → 0)
    bs = _safe_int(d.get('bureau_score', -1))
    if bs >= 750:
        breakdown['bureau_score'] = 10
    elif bs >= 650:
        breakdown['bureau_score'] = 6
    elif bs >= 500:
        breakdown['bureau_score'] = 3
    else:
        breakdown['bureau_score'] = 0   # Covers 300-499, NH (-1), and 0
    score += breakdown['bureau_score']

    # SMA status in any account  (No → 5, Yes → 0)
    breakdown['sma_status'] = 5 if _yn(d.get('sma_status')) == 'No' else 0
    score += breakdown['sma_status']

    # DPD instance  (No → 5, Yes → 0)
    breakdown['dpd_instance'] = 5 if _yn(d.get('dpd_instance')) == 'No' else 0
    score += breakdown['dpd_instance']

    return score, breakdown


def _score_health(d):
    """
    Section: Health & Off-Book Liabilities
    Max: 25 pts
    """
    breakdown = {}
    score = 0

    # Write-off instance  (No → 5, Yes → 0)
    breakdown['write_off'] = 5 if _yn(d.get('write_off')) == 'No' else 0
    score += breakdown['write_off']

    # Informal loans (family/friends)  (No → 5, Yes → 0)
    breakdown['informal_loans'] = 5 if _yn(d.get('informal_loans')) == 'No' else 0
    score += breakdown['informal_loans']

    # Hospitalisation last 2 yrs  (No → 5, Yes → 0)
    breakdown['hospitalisation'] = 5 if _yn(d.get('hospitalisation')) == 'No' else 0
    score += breakdown['hospitalisation']

    # Smoker  (No → 5, Yes → 0)
    breakdown['smoker'] = 5 if _yn(d.get('smoker')) == 'No' else 0
    score += breakdown['smoker']

    # Drinker  (No → 5, Yes → 0)
    breakdown['drinker'] = 5 if _yn(d.get('drinker')) == 'No' else 0
    score += breakdown['drinker']

    return score, breakdown


def _score_caution(d):
    """
    Section: Caution Profile
    Max: 30 pts
    """
    breakdown = {}
    score = 0

    # Criminal history  (No → 5, Yes → 0)
    breakdown['criminal_history'] = 5 if _yn(d.get('criminal_history')) == 'No' else 0
    score += breakdown['criminal_history']

    # Prosecution  (No → 5, Yes → 0)
    breakdown['prosecution'] = 5 if _yn(d.get('prosecution')) == 'No' else 0
    score += breakdown['prosecution']

    # RBI defaulter list  (No → 5, Yes → 0)
    breakdown['rbi_defaulter'] = 5 if _yn(d.get('rbi_defaulter')) == 'No' else 0
    score += breakdown['rbi_defaulter']

    # UN Security Council list  (No → 5, Yes → 0)
    breakdown['un_list'] = 5 if _yn(d.get('un_list')) == 'No' else 0
    score += breakdown['un_list']

    # Tax default history  (No → 5, Yes → 0)
    breakdown['tax_default'] = 5 if _yn(d.get('tax_default')) == 'No' else 0
    score += breakdown['tax_default']

    # Political association  (No → 5, Yes → 0)
    breakdown['political_association'] = 5 if _yn(d.get('political_association')) == 'No' else 0
    score += breakdown['political_association']

    return score, breakdown


# ─────────────────────────────────────────────
# MAIN PUBLIC FUNCTIONS
# ─────────────────────────────────────────────

def calculate_score(data):
    """
    Run all 7 section scorers and return a full scorecard result dict.

    Returns:
        {
            total_score        : int   (0–350)
            max_score          : int   (350)
            score_percentage   : float (0–100, 2dp)
            approval_level     : str
            approval_color     : str   (for frontend badge)
            section_scores     : dict  {section_name: score}
            section_max        : dict  {section_name: max_pts}
            field_breakdown    : dict  {field_name: pts_awarded}
        }
    """
    s1, b1 = _score_family(data)
    s2, b2 = _score_residence(data)
    s3, b3 = _score_office(data)
    s4, b4 = _score_banking(data)
    s5, b5 = _score_bureau(data)
    s6, b6 = _score_health(data)
    s7, b7 = _score_caution(data)

    total = s1 + s2 + s3 + s4 + s5 + s6 + s7
    pct   = round((total / MAX_SCORE) * 100, 2)

    level, color = get_approval_level_from_pct(pct)

    return {
        'total_score'      : total,
        'max_score'        : MAX_SCORE,
        'score_percentage' : pct,
        'approval_level'   : level,
        'approval_color'   : color,
        'section_scores'   : {
            'family'    : s1,
            'residence' : s2,
            'office'    : s3,
            'banking'   : s4,
            'bureau'    : s5,
            'health'    : s6,
            'caution'   : s7,
        },
        'section_max' : {
            'family'    : 40,
            'residence' : 105,
            'office'    : 40,
            'banking'   : 80,
            'bureau'    : 40,
            'health'    : 25,
            'caution'   : 30,
        },
        'field_breakdown' : {**b1, **b2, **b3, **b4, **b5, **b6, **b7},
    }


def get_approval_level_from_pct(pct):
    """Map score percentage to approval level label + frontend color string."""
    if pct >= 80:
        return 'STP (Straight Through Processing)', 'green'
    elif pct >= 60:
        return 'L1 Approval', 'blue'
    elif pct >= 40:
        return 'L2 Approval', 'amber'
    else:
        return 'L3 / Reject', 'red'