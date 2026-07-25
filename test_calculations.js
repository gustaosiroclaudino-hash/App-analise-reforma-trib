// Comprehensive Automated Test Suite for Tax Reform Calculations
// Validates EC 132/2023, LC 214/2025, Legal Theses (SEFAZ/SP RC 32.303/2025 vs PLP 16/2025),
// transition progression (2026-2033), special NCM rules, and XML NFe parsing.

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Initialize DOM environment for DOMParser
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.DOMParser = dom.window.DOMParser;

// Import YEAR_TRANSITION_RULES logic
const YEAR_TRANSITION_RULES = {
    2026: {
        cbsRateFunc: (cbsStd) => 0.009,
        ibsRateFunc: (ibsStd) => 0.001,
        residualIcmsIssPct: 1.0,
        residualPisCofinsPct: 1.0,
        residualIpiPct: 1.0,
        neutralized: true
    },
    2027: {
        cbsRateFunc: (cbsStd) => Math.max(0, cbsStd - 0.001),
        ibsRateFunc: (ibsStd) => 0.001,
        residualIcmsIssPct: 1.0,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2028: {
        cbsRateFunc: (cbsStd) => Math.max(0, cbsStd - 0.001),
        ibsRateFunc: (ibsStd) => 0.001,
        residualIcmsIssPct: 1.0,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2029: {
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.10,
        residualIcmsIssPct: 0.90,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2030: {
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.20,
        residualIcmsIssPct: 0.80,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2031: {
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.30,
        residualIcmsIssPct: 0.70,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2032: {
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.40,
        residualIcmsIssPct: 0.60,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2033: {
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 1.00,
        residualIcmsIssPct: 0.0,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    }
};

function calculateItemTaxes(item, year, cbsStd = 0.088, ibsStd = 0.177, legalThesis = 'fisco', ruleType = 'padrao') {
    const yearRules = YEAR_TRANSITION_RULES[year];

    const pisVal = item.pis_atual || 0;
    const cofinsVal = item.cofins_atual || 0;
    const icmsVal = item.icms_atual || 0;
    const issVal = item.iss_atual || 0;
    const ipiVal = item.ipi_atual || 0;
    const totalVal = item.valor_total || 0;

    const currentTax = pisVal + cofinsVal + icmsVal + issVal + ipiVal;
    const baseValue = Math.max(0, totalVal - currentTax);

    let cbsFactor = 1.0;
    let ibsFactor = 1.0;
    if (ruleType === 'isento') {
        cbsFactor = 0.0;
        ibsFactor = 0.0;
    } else if (ruleType === 'reducao_60') {
        cbsFactor = 0.4;
        ibsFactor = 0.4;
    }

    const isZFM = item.uf_origem === 'AM' || item.uf_destino === 'AM';

    const cbsRate = yearRules.cbsRateFunc(cbsStd) * cbsFactor;
    const ibsRate = yearRules.ibsRateFunc(ibsStd) * ibsFactor;

    const cbsValCalc = baseValue * cbsRate;
    const ibsValCalc = baseValue * ibsRate;
    const cbsIbsSum = cbsValCalc + ibsValCalc;

    const pisRes = pisVal * yearRules.residualPisCofinsPct;
    const cofinsRes = cofinsVal * yearRules.residualPisCofinsPct;
    const ipiRes = ipiVal * (isZFM ? 1.0 : yearRules.residualIpiPct);
    const issRes = issVal * yearRules.residualIcmsIssPct;

    let nominalIcmsRate = 0.18;
    const vBasePiscofinsExIcms = totalVal - pisVal - cofinsVal;
    if (icmsVal > 0 && vBasePiscofinsExIcms > 0) {
        nominalIcmsRate = Math.min(0.35, Math.max(0.04, icmsVal / vBasePiscofinsExIcms));
    }

    const effectiveIcmsRate = nominalIcmsRate * yearRules.residualIcmsIssPct;
    let icmsResFisco = 0;
    let icmsResContrib = 0;

    if (effectiveIcmsRate > 0) {
        if (yearRules.residualPisCofinsPct === 0) {
            const vProdFisco = (baseValue + effectiveIcmsRate * cbsIbsSum) / (1 - effectiveIcmsRate);
            icmsResFisco = (vProdFisco + cbsIbsSum) * effectiveIcmsRate;

            const vProdContrib = baseValue / (1 - effectiveIcmsRate);
            icmsResContrib = vProdContrib * effectiveIcmsRate;
        } else {
            icmsResFisco = icmsVal * yearRules.residualIcmsIssPct;
            icmsResContrib = icmsVal * yearRules.residualIcmsIssPct;
        }
    }

    const icmsRes = (legalThesis === 'fisco') ? icmsResFisco : icmsResContrib;

    let totalValYear = 0;
    if (yearRules.neutralized) {
        totalValYear = currentTax;
    } else {
        totalValYear = icmsRes + ibsValCalc + pisRes + cofinsRes + cbsValCalc + ipiRes + issRes;
    }

    return {
        cbs: cbsValCalc,
        ibs: ibsValCalc,
        pis: pisRes,
        cofins: cofinsRes,
        icms: icmsRes,
        icmsFisco: icmsResFisco,
        icmsContrib: icmsResContrib,
        ipi: ipiRes,
        iss: issRes,
        total: totalValYear,
        currentTax: currentTax
    };
}

// Simple Assertion Helper
let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passedCount++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failedCount++;
    }
}

function assertCloseTo(actual, expected, tolerance = 0.02, message = "") {
    const diff = Math.abs(actual - expected);
    if (diff <= tolerance) {
        console.log(`  ✅ PASS: ${message} (Actual: ${actual.toFixed(2)}, Expected: ${expected.toFixed(2)})`);
        passedCount++;
    } else {
        console.error(`  ❌ FAIL: ${message} (Actual: ${actual.toFixed(2)}, Expected: ${expected.toFixed(2)}, Diff: ${diff.toFixed(2)})`);
        failedCount++;
    }
}

console.log("================================================================================");
console.log("🧪 TAX REFORM EXHAUSTIVE CALCULATION TEST SUITE (EC 132/23 & LC 214/25)");
console.log("================================================================================\n");

// --- TEST SUITE 1: 2026 Test Phase Neutrality ---
console.log("📌 Test Suite 1: 2026 Experimental Phase Neutrality");
{
    const sampleItem = {
        produto_nome: "Notebook Pro",
        valor_total: 4500.00,
        pis_atual: 74.25,
        cofins_atual: 342.00,
        icms_atual: 675.00,
        iss_atual: 0.00,
        ipi_atual: 0.00,
        uf_origem: "SP",
        uf_destino: "SP"
    };

    const res2026 = calculateItemTaxes(sampleItem, 2026, 0.088, 0.177, 'fisco');
    assertCloseTo(res2026.cbs, 30.68, 0.1, "2026 CBS rate (0.9% on liquid base)");
    assertCloseTo(res2026.ibs, 3.41, 0.1, "2026 IBS rate (0.1% on liquid base)");
    assertCloseTo(res2026.total, 1091.25, 0.05, "2026 Total Tax equals current total tax (Neutralized)");
}

// --- TEST SUITE 2: 2027 PIS/COFINS Extinction & Federal CBS Effective Collection ---
console.log("\n📌 Test Suite 2: 2027 PIS/COFINS Extinction & Federal CBS Collection");
{
    const sampleItem = {
        produto_nome: "Notebook Pro",
        valor_total: 4500.00,
        pis_atual: 74.25,
        cofins_atual: 342.00,
        icms_atual: 675.00,
        iss_atual: 0.00,
        ipi_atual: 0.00,
        uf_origem: "SP",
        uf_destino: "SP"
    };

    const res2027 = calculateItemTaxes(sampleItem, 2027, 0.088, 0.177, 'fisco');
    assertCloseTo(res2027.pis, 0.00, 0.01, "2027 PIS Residual is 0 (Extinct)");
    assertCloseTo(res2027.cofins, 0.00, 0.01, "2027 COFINS Residual is 0 (Extinct)");
    assertCloseTo(res2027.cbs, 296.56, 0.1, "2027 CBS Effective (8.7% on liquid base)");
    assertCloseTo(res2027.ibs, 3.41, 0.1, "2027 IBS Effective (0.1% on liquid base)");
}

// --- TEST SUITE 3: Legal Thesis Discrepancy (SEFAZ/SP RC 32.303/2025 vs PLP 16/2025) ---
console.log("\n📌 Test Suite 3: Legal Thesis Discrepancy (Tese Fisco vs Contribuinte)");
{
    const sampleItem = {
        produto_nome: "Notebook Pro",
        valor_total: 4500.00,
        pis_atual: 74.25,
        cofins_atual: 342.00,
        icms_atual: 675.00,
        iss_atual: 0.00,
        ipi_atual: 0.00,
        uf_origem: "SP",
        uf_destino: "SP"
    };

    const resFisco = calculateItemTaxes(sampleItem, 2027, 0.088, 0.177, 'fisco');
    const resContrib = calculateItemTaxes(sampleItem, 2027, 0.088, 0.177, 'contribuinte');
    
    assert(resFisco.icms > resContrib.icms, "Tese Fisco yields higher ICMS than Tese Contribuinte due to IBS/CBS inclusion in base");
    const contingency = resFisco.icms - resContrib.icms;
    assert(contingency > 0, `Tax Contingency exists (${contingency.toFixed(2)})`);
}

// --- TEST SUITE 4: Subnational Transition Progression (2029 - 2033) ---
console.log("\n📌 Test Suite 4: Subnational Transition Progression (2029 - 2033)");
{
    const sampleItem = {
        produto_nome: "Notebook Pro",
        valor_total: 4500.00,
        pis_atual: 74.25,
        cofins_atual: 342.00,
        icms_atual: 675.00,
        iss_atual: 0.00,
        ipi_atual: 0.00,
        uf_origem: "SP",
        uf_destino: "SP"
    };

    const res2029 = calculateItemTaxes(sampleItem, 2029, 0.088, 0.177, 'fisco');
    const res2030 = calculateItemTaxes(sampleItem, 2030, 0.088, 0.177, 'fisco');
    const res2031 = calculateItemTaxes(sampleItem, 2031, 0.088, 0.177, 'fisco');
    const res2032 = calculateItemTaxes(sampleItem, 2032, 0.088, 0.177, 'fisco');
    const res2033 = calculateItemTaxes(sampleItem, 2033, 0.088, 0.177, 'fisco');

    assert(res2029.ibs < res2030.ibs, "IBS increases from 2029 (10%) to 2030 (20%)");
    assert(res2030.ibs < res2031.ibs, "IBS increases from 2030 (20%) to 2031 (30%)");
    assert(res2031.ibs < res2032.ibs, "IBS increases from 2031 (30%) to 2032 (40%)");
    assert(res2032.ibs < res2033.ibs, "IBS reaches 100% in 2033");

    assertCloseTo(res2033.icms, 0.00, 0.01, "2033 ICMS is 0 (Fully Extinct)");
    assertCloseTo(res2033.pis, 0.00, 0.01, "2033 PIS is 0 (Fully Extinct)");
    assertCloseTo(res2033.cofins, 0.00, 0.01, "2033 COFINS is 0 (Fully Extinct)");
    assertCloseTo(res2033.cbs, 300.00, 5.0, "2033 CBS at full rate");
    assertCloseTo(res2033.ibs, 603.34, 5.0, "2033 IBS at full rate");
}

// --- TEST SUITE 5: Special Rules (Cesta Básica & Alíquota Reduzida) ---
console.log("\n📌 Test Suite 5: Special Rules (Cesta Básica & Alíquota Reduzida)");
{
    const riceItem = {
        produto_nome: "Arroz Tio João",
        valor_total: 1000.00,
        pis_atual: 16.50,
        cofins_atual: 76.00,
        icms_atual: 120.00,
        iss_atual: 0.00,
        ipi_atual: 0.00,
        uf_origem: "SP",
        uf_destino: "SP"
    };

    const resIsento = calculateItemTaxes(riceItem, 2033, 0.088, 0.177, 'fisco', 'isento');
    assertCloseTo(resIsento.cbs, 0.00, 0.01, "Cesta Básica: CBS is 0.00");
    assertCloseTo(resIsento.ibs, 0.00, 0.01, "Cesta Básica: IBS is 0.00");

    const medItem = {
        produto_nome: "Medicamento Alívio",
        valor_total: 1000.00,
        pis_atual: 16.50,
        cofins_atual: 76.00,
        icms_atual: 120.00,
        iss_atual: 0.00,
        ipi_atual: 0.00,
        uf_origem: "SP",
        uf_destino: "SP"
    };

    const resReducao = calculateItemTaxes(medItem, 2033, 0.088, 0.177, 'fisco', 'reducao_60');
    const resPadrao = calculateItemTaxes(medItem, 2033, 0.088, 0.177, 'fisco', 'padrao');

    assertCloseTo(resReducao.cbs, resPadrao.cbs * 0.4, 0.05, "Redução 60%: CBS pays exactly 40%");
    assertCloseTo(resReducao.ibs, resPadrao.ibs * 0.4, 0.05, "Redução 60%: IBS pays exactly 40%");
}

// --- TEST SUITE 6: XML NFe Import & Multi-Item Consolidation ---
console.log("\n📌 Test Suite 6: Real NFe XML File Parsing & Multi-Item Consolidation");
{
    const xmlFilePath = path.join(__dirname, '35260507790200000134550050001361011607304194-nfe.xml');
    assert(fs.existsSync(xmlFilePath), "NFe XML test file exists");

    const xmlText = fs.readFileSync(xmlFilePath, 'utf8');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const detList = xmlDoc.getElementsByTagName('det');
    assert(detList.length === 3, `NFe contains 3 items (found ${detList.length})`);

    let nfeTotalValue = 0;
    let nfeItems = [];

    for (let i = 0; i < detList.length; i++) {
        const det = detList[i];
        const prod = det.getElementsByTagName('prod')[0];
        const imposto = det.getElementsByTagName('imposto')[0];

        const xProd = prod.getElementsByTagName('xProd')[0].textContent;
        const vProd = parseFloat(prod.getElementsByTagName('vProd')[0].textContent);
        
        let icmsVal = 0, pisVal = 0, cofinsVal = 0;
        if (imposto) {
            const icmsEl = imposto.getElementsByTagName('vICMS')[0];
            if (icmsEl) icmsVal = parseFloat(icmsEl.textContent);
            const pisEl = imposto.getElementsByTagName('vPIS')[0];
            if (pisEl) pisVal = parseFloat(pisEl.textContent);
            const cofinsEl = imposto.getElementsByTagName('vCOFINS')[0];
            if (cofinsEl) cofinsVal = parseFloat(cofinsEl.textContent);
        }

        nfeTotalValue += vProd;
        nfeItems.push({
            produto_nome: xProd,
            valor_total: vProd,
            pis_atual: pisVal,
            cofins_atual: cofinsVal,
            icms_atual: icmsVal,
            iss_atual: 0,
            ipi_atual: 0,
            uf_origem: "SP",
            uf_destino: "SP"
        });
    }

    assertCloseTo(nfeTotalValue, 3672.00, 0.01, "NFe Total Value equals R$ 3.672,00");

    // Compute consolidated transition table for all 3 items across years 2026 to 2033
    const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];
    const consolidatedMatrix = {};

    years.forEach(y => {
        consolidatedMatrix[y] = { icms: 0, ibs: 0, pis: 0, cofins: 0, cbs: 0, total: 0 };
        nfeItems.forEach(item => {
            const res = calculateItemTaxes(item, y, 0.088, 0.177, 'fisco');
            consolidatedMatrix[y].icms += res.icms;
            consolidatedMatrix[y].ibs += res.ibs;
            consolidatedMatrix[y].pis += res.pis;
            consolidatedMatrix[y].cofins += res.cofins;
            consolidatedMatrix[y].cbs += res.cbs;
            consolidatedMatrix[y].total += res.total;
        });
    });

    console.log("\n  📊 NFe 136101 Consolidated Transition Table:");
    console.log("  ------------------------------------------------------------------");
    console.log("  Year | ICMS (R$) | IBS (R$)  | PIS (R$)  | COFINS (R$)| CBS (R$)  | Total (R$)");
    console.log("  ------------------------------------------------------------------");
    years.forEach(y => {
        const m = consolidatedMatrix[y];
        console.log(`  ${y} | ${m.icms.toFixed(2).padStart(9)} | ${m.ibs.toFixed(2).padStart(9)} | ${m.pis.toFixed(2).padStart(9)} | ${m.cofins.toFixed(2).padStart(10)} | ${m.cbs.toFixed(2).padStart(9)} | ${m.total.toFixed(2).padStart(10)}`);
    });
    console.log("  ------------------------------------------------------------------");

    // Validation against photo reference vectors
    assertCloseTo(consolidatedMatrix[2026].icms, 660.96, 0.5, "NFe 2026 ICMS match");
    assertCloseTo(consolidatedMatrix[2026].pis, 49.68, 0.5, "NFe 2026 PIS match");
    assertCloseTo(consolidatedMatrix[2026].cofins, 228.84, 0.5, "NFe 2026 COFINS match");
    assertCloseTo(consolidatedMatrix[2026].cbs, 24.59, 0.5, "NFe 2026 CBS match");
    assertCloseTo(consolidatedMatrix[2026].ibs, 2.73, 0.5, "NFe 2026 IBS match");
    assertCloseTo(consolidatedMatrix[2026].total, 966.80, 0.5, "NFe 2026 Total Tax match");

    assertCloseTo(consolidatedMatrix[2027].total, 853.40, 0.5, "NFe 2027 Total Tax match (PIS/COFINS extinct)");
    assertCloseTo(consolidatedMatrix[2033].icms, 0.00, 0.01, "NFe 2033 ICMS is 0.00");
}

console.log("\n================================================================================");
console.log(`📊 TEST RESULTS SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("================================================================================\n");

if (failedCount > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
