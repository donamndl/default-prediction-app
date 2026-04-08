"""
test_scorecard.py
─────────────────────────────────────────────────────────────────────────────
Unit tests for the scorecard engine.
Run with:  python test_scorecard.py
─────────────────────────────────────────────────────────────────────────────
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from scorecard import calculate_score, get_approval_level_from_pct, MAX_SCORE

# ─────────────────────────────────────────────
# PERFECT SCORE SAMPLE (should score maximum)
# ─────────────────────────────────────────────

PERFECT = {
    # Family
    'marital_status'          : 'Married',
    'total_members'           : 2,
    'pct_earning_members'     : 100,
    'spouse_working'          : 'Yes',   # Yes → 10
    'total_dependents'        : 1,

    # Residence
    'house_ownership'         : 'Owned',
    'ownership_proof'         : 'Yes',
    'residence_stability_months': 36,
    'stability_proof'         : 'Yes',
    'residence_change_count'  : 0,
    'stays_with_family'       : 'Yes',
    'resi_traceable'          : 'Yes',
    'pic_available'           : 'Yes',
    'entry_easy'              : 'Yes',
    'shared_accommodation'    : 'No',
    'total_rooms'             : 6,
    'floor'                   : 3,
    'lift_available'          : 'Yes',
    'residence_type'          : 'Bunglow',
    'resi_negative_location'  : 'No',

    # Office
    'employment_type'         : 'Permanent',
    'job_changes'             : 0,
    'office_traceable'        : 'Yes',
    'office_building_type'    : 'Commercial Complex',
    'office_entry_easy'       : 'Yes',
    'office_negative_location': 'No',

    # Banking
    'inward_returns'          : 0,
    'utility_via_bank'        : 'Yes',
    'uniform_utility_payment' : 'Yes',
    'bank_transactions'       : 'Yes',
    'salary_credit_bank'      : 'Yes',
    'uniform_credit'          : 'Yes',
    'total_credits'           : 15,
    'pct_cash_deposit'        : 10,
    'intra_group'             : 'No',
    'abb_to_emi'              : 5,
    'avg_credit_to_emi'       : 5,

    # Bureau
    'enquiries_6m'            : 1,
    'bureau_score'            : 800,
    'sma_status'              : 'No',
    'dpd_instance'            : 'No',

    # Health
    'write_off'               : 'No',
    'informal_loans'          : 'No',
    'hospitalisation'         : 'No',
    'smoker'                  : 'No',
    'drinker'                 : 'No',

    # Caution
    'criminal_history'        : 'No',
    'prosecution'             : 'No',
    'rbi_defaulter'           : 'No',
    'un_list'                 : 'No',
    'tax_default'             : 'No',
    'political_association'   : 'No',
}

# ─────────────────────────────────────────────
# POOR SCORE SAMPLE (should score low)
# ─────────────────────────────────────────────

POOR = {
    'marital_status'          : 'Divorcee',
    'total_members'           : 12,
    'pct_earning_members'     : 20,
    'spouse_working'          : 'No',
    'total_dependents'        : 12,
    'house_ownership'         : 'Rented',
    'ownership_proof'         : 'No',
    'residence_stability_months': 5,
    'stability_proof'         : 'No',
    'residence_change_count'  : 5,
    'stays_with_family'       : 'No',
    'resi_traceable'          : 'No',
    'pic_available'           : 'No',
    'entry_easy'              : 'No',
    'shared_accommodation'    : 'Yes',
    'total_rooms'             : 1,
    'floor'                   : 8,
    'lift_available'          : 'No',
    'residence_type'          : 'Chawl',
    'resi_negative_location'  : 'Yes',
    'employment_type'         : 'Contractual',
    'job_changes'             : 6,
    'office_traceable'        : 'No',
    'office_building_type'    : 'Factory',
    'office_entry_easy'       : 'No',
    'office_negative_location': 'Yes',
    'inward_returns'          : 10,
    'utility_via_bank'        : 'No',
    'uniform_utility_payment' : 'No',
    'bank_transactions'       : 'No',
    'salary_credit_bank'      : 'No',
    'uniform_credit'          : 'No',
    'total_credits'           : 2,
    'pct_cash_deposit'        : 80,
    'intra_group'             : 'Yes',
    'abb_to_emi'              : 0.5,
    'avg_credit_to_emi'       : 0.5,
    'enquiries_6m'            : 10,
    'bureau_score'            : -1,
    'sma_status'              : 'Yes',
    'dpd_instance'            : 'Yes',
    'write_off'               : 'Yes',
    'informal_loans'          : 'Yes',
    'hospitalisation'         : 'Yes',
    'smoker'                  : 'Yes',
    'drinker'                 : 'Yes',
    'criminal_history'        : 'Yes',
    'prosecution'             : 'Yes',
    'rbi_defaulter'           : 'Yes',
    'un_list'                 : 'Yes',
    'tax_default'             : 'Yes',
    'political_association'   : 'Yes',
}


# ─────────────────────────────────────────────
# TEST RUNNER
# ─────────────────────────────────────────────

def run_tests():
    passed = 0
    failed = 0

    def check(name, condition, detail=''):
        nonlocal passed, failed
        if condition:
            print(f'  ✅  {name}')
            passed += 1
        else:
            print(f'  ❌  {name}  {detail}')
            failed += 1

    print('\n═══════════════════════════════════════')
    print('  CreditSense Scorecard — Unit Tests')
    print('═══════════════════════════════════════\n')

    # ── Perfect score ──
    print('── Perfect Profile ──')
    r = calculate_score(PERFECT)
    print(f'   Score: {r["total_score"]}/{MAX_SCORE}  ({r["score_percentage"]}%)')
    print(f'   Level: {r["approval_level"]}')
    print(f'   Sections: {r["section_scores"]}')
    check('Perfect score ≥ 280',       r['total_score'] >= 280)
    check('Perfect pct ≥ 80',          r['score_percentage'] >= 80)
    check('Perfect → STP',             'STP' in r['approval_level'])
    check('Total ≤ MAX_SCORE',         r['total_score'] <= MAX_SCORE)

    # ── Poor score ──
    print('\n── Poor Profile ──')
    r2 = calculate_score(POOR)
    print(f'   Score: {r2["total_score"]}/{MAX_SCORE}  ({r2["score_percentage"]}%)')
    print(f'   Level: {r2["approval_level"]}')
    check('Poor score ≤ 80',           r2['total_score'] <= 80)
    check('Poor pct ≤ 40',             r2['score_percentage'] <= 40)
    check('Poor → Reject/L3',          'Reject' in r2['approval_level'] or 'L3' in r2['approval_level'])

    # ── Section totals add up ──
    print('\n── Section Totals ──')
    sec_sum = sum(r['section_scores'].values())
    check('Section scores sum = total', sec_sum == r['total_score'],
          f'got {sec_sum} vs {r["total_score"]}')

    check('field_breakdown is dict',    isinstance(r['field_breakdown'], dict))
    check('section_max present',        'family' in r['section_max'])

    # ── Max score caps ──
    print('\n── Max Score Caps ──')
    sm = r['section_max']
    ss = r['section_scores']
    check('Family ≤ 40',        ss['family']    <= sm['family'])
    check('Residence ≤ 105',    ss['residence'] <= sm['residence'])
    check('Office ≤ 40',        ss['office']    <= sm['office'])
    check('Banking ≤ 80',       ss['banking']   <= sm['banking'])
    check('Bureau ≤ 40',        ss['bureau']    <= sm['bureau'])
    check('Health ≤ 25',        ss['health']    <= sm['health'])
    check('Caution ≤ 30',       ss['caution']   <= sm['caution'])

    # ── Approval bands ──
    print('\n── Approval Bands ──')
    check('≥80 → STP',          'STP'    in get_approval_level_from_pct(80)[0])
    check('79 → L1',            'L1'     in get_approval_level_from_pct(79)[0])
    check('60 → L1',            'L1'     in get_approval_level_from_pct(60)[0])
    check('59 → L2',            'L2'     in get_approval_level_from_pct(59)[0])
    check('40 → L2',            'L2'     in get_approval_level_from_pct(40)[0])
    check('39 → Reject',        'Reject' in get_approval_level_from_pct(39)[0])
    check('0  → Reject',        'Reject' in get_approval_level_from_pct(0)[0])

    # ── Edge cases ──
    print('\n── Edge Cases ──')
    empty = calculate_score({})
    check('Empty data → 0+ score',  empty['total_score'] >= 0)
    check('Empty data → int score', isinstance(empty['total_score'], int))

    bureau_nh = calculate_score({**PERFECT, 'bureau_score': -1})
    check('Bureau -1 → 0 pts for bureau_score', bureau_nh['field_breakdown']['bureau_score'] == 0)

    # ─────────────────────────────────────────
    print(f'\n═══════════════════════════════════════')
    print(f'  Results: {passed} passed, {failed} failed')
    print(f'═══════════════════════════════════════\n')

    return failed == 0


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)