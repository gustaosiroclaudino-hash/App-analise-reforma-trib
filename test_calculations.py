# Exhaustive Calculation & Rules Validation Suite (EC 132/2023 & LC 214/2025)
# Tests transition year logic (2026-2033), legal theses (Tese Fisco vs Contribuinte),
# special NCM rules (Isento / Redução 60%), and XML NFe parsing.

import os
import xml.etree.ElementTree as ET

YEAR_TRANSITION_RULES = {
    2026: {
        "cbsRateFunc": lambda cbsStd: 0.009,
        "ibsRateFunc": lambda ibsStd: 0.001,
        "residualIcmsIssPct": 1.0,
        "residualPisCofinsPct": 1.0,
        "residualIpiPct": 1.0,
        "neutralized": True
    },
    2027: {
        "cbsRateFunc": lambda cbsStd: max(0.0, cbsStd - 0.001),
        "ibsRateFunc": lambda ibsStd: 0.001,
        "residualIcmsIssPct": 1.0,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    },
    2028: {
        "cbsRateFunc": lambda cbsStd: max(0.0, cbsStd - 0.001),
        "ibsRateFunc": lambda ibsStd: 0.001,
        "residualIcmsIssPct": 1.0,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    },
    2029: {
        "cbsRateFunc": lambda cbsStd: cbsStd,
        "ibsRateFunc": lambda ibsStd: ibsStd * 0.10,
        "residualIcmsIssPct": 0.90,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    },
    2030: {
        "cbsRateFunc": lambda cbsStd: cbsStd,
        "ibsRateFunc": lambda ibsStd: ibsStd * 0.20,
        "residualIcmsIssPct": 0.80,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    },
    2031: {
        "cbsRateFunc": lambda cbsStd: cbsStd,
        "ibsRateFunc": lambda ibsStd: ibsStd * 0.30,
        "residualIcmsIssPct": 0.70,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    },
    2032: {
        "cbsRateFunc": lambda cbsStd: cbsStd,
        "ibsRateFunc": lambda ibsStd: ibsStd * 0.40,
        "residualIcmsIssPct": 0.60,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    },
    2033: {
        "cbsRateFunc": lambda cbsStd: cbsStd,
        "ibsRateFunc": lambda ibsStd: ibsStd * 1.00,
        "residualIcmsIssPct": 0.0,
        "residualPisCofinsPct": 0.0,
        "residualIpiPct": 0.0,
        "neutralized": False
    }
}

def calculate_item_taxes(item, year, cbs_std=0.088, ibs_std=0.177, legal_thesis='fisco', rule_type='padrao'):
    year_rules = YEAR_TRANSITION_RULES[year]

    pis_val = item.get('pis_atual', 0.0)
    cofins_val = item.get('cofins_atual', 0.0)
    icms_val = item.get('icms_atual', 0.0)
    iss_val = item.get('iss_atual', 0.0)
    ipi_val = item.get('ipi_atual', 0.0)
    total_val = item.get('valor_total', 0.0)

    current_tax = pis_val + cofins_val + icms_val + iss_val + ipi_val
    base_value = max(0.0, total_val - current_tax)

    cbs_factor = 1.0
    ibs_factor = 1.0
    if rule_type == 'isento':
        cbs_factor = 0.0
        ibs_factor = 0.0
    elif rule_type == 'reducao_60':
        cbs_factor = 0.4
        ibs_factor = 0.4
    elif rule_type == 'reducao_30':
        cbs_factor = 0.7
        ibs_factor = 0.7

    is_zfm = (item.get('uf_origem') == 'AM' or item.get('uf_destino') == 'AM')

    cbs_rate = year_rules['cbsRateFunc'](cbs_std) * cbs_factor
    ibs_rate = year_rules['ibsRateFunc'](ibs_std) * ibs_factor

    cbs_val_calc = base_value * cbs_rate
    ibs_val_calc = base_value * ibs_rate
    cbs_ibs_sum = cbs_val_calc + ibs_val_calc

    pis_res = pis_val * year_rules['residualPisCofinsPct']
    cofins_res = cofins_val * year_rules['residualPisCofinsPct']
    ipi_res = ipi_val * (1.0 if is_zfm else year_rules['residualIpiPct'])
    iss_res = iss_val * year_rules['residualIcmsIssPct']

    nominal_icms_rate = 0.18
    v_base_piscofins_ex_icms = total_val - pis_val - cofins_val
    if icms_val > 0 and v_base_piscofins_ex_icms > 0:
        nominal_icms_rate = min(0.35, max(0.04, icms_val / v_base_piscofins_ex_icms))

    effective_icms_rate = nominal_icms_rate * year_rules['residualIcmsIssPct']
    icms_res_fisco = 0.0
    icms_res_contrib = 0.0

    if effective_icms_rate > 0:
        if year_rules['residualPisCofinsPct'] == 0:
            v_prod_fisco = (base_value + effective_icms_rate * cbs_ibs_sum) / (1.0 - effective_icms_rate)
            icms_res_fisco = (v_prod_fisco + cbs_ibs_sum) * effective_icms_rate

            v_prod_contrib = base_value / (1.0 - effective_icms_rate)
            icms_res_contrib = v_prod_contrib * effective_icms_rate
        else:
            icms_res_fisco = icms_val * year_rules['residualIcmsIssPct']
            icms_res_contrib = icms_val * year_rules['residualIcmsIssPct']

    icms_res = icms_res_fisco if legal_thesis == 'fisco' else icms_res_contrib

    if year_rules['neutralized']:
        total_val_year = current_tax
    else:
        total_val_year = icms_res + ibs_val_calc + pis_res + cofins_res + cbs_val_calc + ipi_res + iss_res

    return {
        'cbs': cbs_val_calc,
        'ibs': ibs_val_calc,
        'pis': pis_res,
        'cofins': cofins_res,
        'icms': icms_res,
        'icms_fisco': icms_res_fisco,
        'icms_contrib': icms_res_contrib,
        'ipi': ipi_res,
        'iss': iss_res,
        'total': total_val_year,
        'current_tax': current_tax
    }

passed_count = 0
failed_count = 0

def assert_true(condition, message):
    global passed_count, failed_count
    if condition:
        print(f"  [PASS] {message}")
        passed_count += 1
    else:
        print(f"  [FAIL] {message}")
        failed_count += 1

def assert_close_to(actual, expected, tolerance=0.05, message=""):
    global passed_count, failed_count
    diff = abs(actual - expected)
    if diff <= tolerance:
        print(f"  [PASS] {message} (Actual: {actual:.2f}, Expected: {expected:.2f})")
        passed_count += 1
    else:
        print(f"  [FAIL] {message} (Actual: {actual:.2f}, Expected: {expected:.2f}, Diff: {diff:.2f})")
        failed_count += 1

print("================================================================================")
print("TAX REFORM EXHAUSTIVE CALCULATION TEST SUITE (EC 132/23 & LC 214/25)")
print("================================================================ fortress\n")

# --- TEST SUITE 1: 2026 Test Phase Neutrality ---
print("--- Test Suite 1: 2026 Experimental Phase Neutrality ---")
sample_item = {
    "produto_nome": "Notebook Pro",
    "valor_total": 4500.00,
    "pis_atual": 74.25,
    "cofins_atual": 342.00,
    "icms_atual": 675.00,
    "iss_atual": 0.00,
    "ipi_atual": 0.00,
    "uf_origem": "SP",
    "uf_destino": "SP"
}

res2026 = calculate_item_taxes(sample_item, 2026, 0.088, 0.177, 'fisco')
assert_close_to(res2026['cbs'], 30.68, 0.1, "2026 CBS rate (0.9% on liquid base)")
assert_close_to(res2026['ibs'], 3.41, 0.1, "2026 IBS rate (0.1% on liquid base)")
assert_close_to(res2026['total'], 1091.25, 0.05, "2026 Total Tax equals current total tax (Neutralized)")

# --- TEST SUITE 2: 2027 PIS/COFINS Extinction & Federal CBS Effective Collection ---
print("\n--- Test Suite 2: 2027 PIS/COFINS Extinction & Federal CBS Collection ---")
res2027 = calculate_item_taxes(sample_item, 2027, 0.088, 0.177, 'fisco')
assert_close_to(res2027['pis'], 0.00, 0.01, "2027 PIS Residual is 0 (Extinct)")
assert_close_to(res2027['cofins'], 0.00, 0.01, "2027 COFINS Residual is 0 (Extinct)")
assert_close_to(res2027['cbs'], 296.56, 0.1, "2027 CBS Effective (8.7% on liquid base)")
assert_close_to(res2027['ibs'], 3.41, 0.1, "2027 IBS Effective (0.1% on liquid base)")

# --- TEST SUITE 3: Legal Thesis Discrepancy ---
print("\n--- Test Suite 3: Legal Thesis Discrepancy (Tese Fisco vs Contribuinte) ---")
res_fisco = calculate_item_taxes(sample_item, 2027, 0.088, 0.177, 'fisco')
res_contrib = calculate_item_taxes(sample_item, 2027, 0.088, 0.177, 'contribuinte')
assert_true(res_fisco['icms'] > res_contrib['icms'], "Tese Fisco yields higher ICMS than Tese Contribuinte")
contingency = res_fisco['icms'] - res_contrib['icms']
assert_true(contingency > 0, f"Tax Contingency exists ({contingency:.2f})")

# --- TEST SUITE 4: Subnational Transition Progression (2029 - 2033) ---
print("\n--- Test Suite 4: Subnational Transition Progression (2029 - 2033) ---")
res2029 = calculate_item_taxes(sample_item, 2029, 0.088, 0.177, 'fisco')
res2030 = calculate_item_taxes(sample_item, 2030, 0.088, 0.177, 'fisco')
res2031 = calculate_item_taxes(sample_item, 2031, 0.088, 0.177, 'fisco')
res2032 = calculate_item_taxes(sample_item, 2032, 0.088, 0.177, 'fisco')
res2033 = calculate_item_taxes(sample_item, 2033, 0.088, 0.177, 'fisco')

assert_true(res2029['ibs'] < res2030['ibs'], "IBS increases from 2029 (10%) to 2030 (20%)")
assert_true(res2030['ibs'] < res2031['ibs'], "IBS increases from 2030 (20%) to 2031 (30%)")
assert_true(res2031['ibs'] < res2032['ibs'], "IBS increases from 2031 (30%) to 2032 (40%)")
assert_true(res2032['ibs'] < res2033['ibs'], "IBS reaches 100% in 2033")

assert_close_to(res2033['icms'], 0.00, 0.01, "2033 ICMS is 0 (Fully Extinct)")
assert_close_to(res2033['pis'], 0.00, 0.01, "2033 PIS is 0 (Fully Extinct)")
assert_close_to(res2033['cofins'], 0.00, 0.01, "2033 COFINS is 0 (Fully Extinct)")

# --- TEST SUITE 5: Special NCM Rules ---
print("\n--- Test Suite 5: Special NCM Rules (Cesta Basica & Aliquota Reduzida) ---")
rice_item = {"produto_nome": "Arroz", "valor_total": 1000.0, "pis_atual": 16.5, "cofins_atual": 76.0, "icms_atual": 120.0}
res_isento = calculate_item_taxes(rice_item, 2033, 0.088, 0.177, 'fisco', 'isento')
assert_close_to(res_isento['cbs'], 0.00, 0.01, "Cesta Basica: CBS is 0.00")
assert_close_to(res_isento['ibs'], 0.00, 0.01, "Cesta Basica: IBS is 0.00")

med_item = {"produto_nome": "Medicamento", "valor_total": 1000.0, "pis_atual": 16.5, "cofins_atual": 76.0, "icms_atual": 120.0}
res_reducao = calculate_item_taxes(med_item, 2033, 0.088, 0.177, 'fisco', 'reducao_60')
res_padrao = calculate_item_taxes(med_item, 2033, 0.088, 0.177, 'fisco', 'padrao')
assert_close_to(res_reducao['cbs'], res_padrao['cbs'] * 0.4, 0.05, "Reducao 60%: CBS pays exactly 40%")
assert_close_to(res_reducao['ibs'], res_padrao['ibs'] * 0.4, 0.05, "Reducao 60%: IBS pays exactly 40%")

# --- TEST SUITE 6: Real NFe XML File Parsing & Multi-Item Consolidation ---
print("\n--- Test Suite 6: Real NFe XML File Parsing & Multi-Item Consolidation ---")
xml_file_path = '35260507790200000134550050001361011607304194-nfe.xml'
assert_true(os.path.exists(xml_file_path), "NFe XML test file exists")

tree = ET.parse(xml_file_path)
root = tree.getroot()

def strip_ns(tag):
    return tag.split('}')[-1] if '}' in tag else tag

nfe_items = []
nfe_total_val = 0.0

for elem in root.iter():
    if strip_ns(elem.tag) == 'det':
        x_prod = ""
        v_prod = 0.0
        v_icms = 0.0
        v_pis = 0.0
        v_cofins = 0.0

        for child in elem:
            if strip_ns(child.tag) == 'prod':
                for pchild in child:
                    if strip_ns(pchild.tag) == 'xProd':
                        x_prod = pchild.text
                    elif strip_ns(pchild.tag) == 'vProd':
                        v_prod = float(pchild.text)
            elif strip_ns(child.tag) == 'imposto':
                for ichild in child:
                    if strip_ns(ichild.tag) == 'ICMS':
                        for gchild in ichild:
                            for sub in gchild:
                                if strip_ns(sub.tag) == 'vICMS':
                                    v_icms = float(sub.text)
                    elif strip_ns(ichild.tag) == 'PIS':
                        for gchild in ichild:
                            for sub in gchild:
                                if strip_ns(sub.tag) == 'vPIS':
                                    v_pis = float(sub.text)
                    elif strip_ns(ichild.tag) == 'COFINS':
                        for gchild in ichild:
                            for sub in gchild:
                                if strip_ns(sub.tag) == 'vCOFINS':
                                    v_cofins = float(sub.text)

        nfe_total_val += v_prod
        nfe_items.append({
            'produto_nome': x_prod,
            'valor_total': v_prod,
            'pis_atual': v_pis,
            'cofins_atual': v_cofins,
            'icms_atual': v_icms,
            'iss_atual': 0.0,
            'ipi_atual': 0.0,
            'uf_origem': 'SP',
            'uf_destino': 'SP'
        })

assert_true(len(nfe_items) == 14, f"Parsed 14 items from NFe XML (found {len(nfe_items)})")
assert_close_to(nfe_total_val, 21709.35, 0.01, "NFe Total Products Value equals R$ 21.709,35")

# Test Item 1 Individual (Ketchup 36 x 102.00 = 3672.00)
item1 = nfe_items[0]
assert_close_to(item1['valor_total'], 3672.00, 0.01, "Item 1 Total Value equals R$ 3.672,00")
res_item1_2026 = calculate_item_taxes(item1, 2026, 0.088, 0.177, 'fisco')
assert_close_to(res_item1_2026['icms'], 660.96, 0.01, "Item 1 2026 ICMS match")
assert_close_to(res_item1_2026['pis'], 49.68, 0.01, "Item 1 2026 PIS match")
assert_close_to(res_item1_2026['cofins'], 228.84, 0.01, "Item 1 2026 COFINS match")
assert_close_to(res_item1_2026['cbs'], 24.59, 0.1, "Item 1 2026 CBS match")
assert_close_to(res_item1_2026['ibs'], 2.73, 0.1, "Item 1 2026 IBS match")

# Test Full NFe Consolidated Multi-Year Matrix (14 items)
years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033]
consolidated_matrix = {}

for y in years:
    consolidated_matrix[y] = {'icms': 0.0, 'ibs': 0.0, 'pis': 0.0, 'cofins': 0.0, 'cbs': 0.0, 'total': 0.0}
    for item in nfe_items:
        res = calculate_item_taxes(item, y, 0.088, 0.177, 'fisco')
        consolidated_matrix[y]['icms'] += res['icms']
        consolidated_matrix[y]['ibs'] += res['ibs']
        consolidated_matrix[y]['pis'] += res['pis']
        consolidated_matrix[y]['cofins'] += res['cofins']
        consolidated_matrix[y]['cbs'] += res['cbs']
        consolidated_matrix[y]['total'] += res['total']

print("\n  NFe 136101 Consolidated Transition Table (Across ALL 14 items):")
print("  -----------------------------------------------------------------------------------------")
print("  Year | ICMS (R$) | IBS (R$)  | PIS (R$)  | COFINS (R$) | CBS (R$)   | Consolidated Total (R$)")
print("  -----------------------------------------------------------------------------------------")
for y in years:
    m = consolidated_matrix[y]
    print(f"  {y} | {m['icms']:9.2f} | {m['ibs']:9.2f} | {m['pis']:9.2f} | {m['cofins']:11.2f} | {m['cbs']:10.2f} | {m['total']:22.2f}")
print("  -----------------------------------------------------------------------------------------")

# Validate NFe 14-item totals against XML ICMS total (3770.33), PIS total (295.99), COFINS total (1363.37)
assert_close_to(consolidated_matrix[2026]['icms'], 3770.33, 0.5, "NFe 14-item 2026 ICMS aggregate match")
assert_close_to(consolidated_matrix[2026]['pis'], 295.99, 0.5, "NFe 14-item 2026 PIS aggregate match")
assert_close_to(consolidated_matrix[2026]['cofins'], 1363.37, 0.5, "NFe 14-item 2026 COFINS aggregate match")
assert_close_to(consolidated_matrix[2026]['cbs'], 146.52, 1.0, "NFe 14-item 2026 CBS aggregate match")
assert_close_to(consolidated_matrix[2026]['ibs'], 16.28, 0.5, "NFe 14-item 2026 IBS aggregate match")
assert_close_to(consolidated_matrix[2026]['total'], 5429.69, 1.0, "NFe 14-item 2026 Total Tax aggregate match")

assert_close_to(consolidated_matrix[2033]['icms'], 0.00, 0.01, "NFe 2033 ICMS is 0.00")

print("\n================================================================================")
print(f"TEST RESULTS SUMMARY: {passed_count} PASSED, {failed_count} FAILED")
print("================================================================================\n")

if failed_count > 0:
    exit(1)
else:
    exit(0)


