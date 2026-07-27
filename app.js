// Tax Reform Landing Page & Dashboard Application Logic

const YEAR_TRANSITION_RULES = {
    2026: {
        description: "Fase de teste com alíquotas de teste (CBS 0,9% e IBS 0,1%) totalmente compensadas por PIS/Cofins. Sem impacto fiscal real na carga.",
        pisCofins: "Vigente (100%)",
        pisCofinsClass: "badge-primary",
        ipi: "Vigente (100%)",
        ipiClass: "badge-primary",
        icmsIss: "Vigente (100%)",
        icmsIssClass: "badge-primary",
        cbs: "Teste (0.9% Compensado)",
        cbsClass: "badge-success",
        ibs: "Teste (0.1% Compensado)",
        ibsClass: "badge-success",
        legalNote: "Conforme a EC 132/23, 2026 serve como fase experimental sem aumento da carga para homologar sistemas.",
        cbsRateFunc: (cbsStd) => 0.009,
        ibsRateFunc: (ibsStd) => 0.001,
        residualIcmsIssPct: 1.0,
        residualPisCofinsPct: 1.0,
        residualIpiPct: 1.0,
        neutralized: true
    },
    2027: {
        description: "Extinção do PIS/Cofins e redução do IPI a zero em regra. Início da cobrança efetiva da CBS (com redução de 0,1%) e do IBS (com alíquota de 0,1%). ICMS e ISS permanecem normais.",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Vigente (100%)",
        icmsIssClass: "badge-primary",
        cbs: "Cobrança Efetiva (-0.1% p.p.)",
        cbsClass: "badge-success",
        ibs: "Cobrança Efetiva (0.1%)",
        ibsClass: "badge-success",
        legalNote: "Entrada em vigor da CBS federal com redução de 0,1% e IBS com alíquota de 0,1%. IPI passa a ter alíquota zero para a maioria das mercadorias, exceto ZFM. ICMS/ISS continuam a 100%.",
        cbsRateFunc: (cbsStd) => Math.max(0, cbsStd - 0.001),
        ibsRateFunc: (ibsStd) => 0.001,
        residualIcmsIssPct: 1.0,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2028: {
        description: "Continuidade do arranjo federal com PIS/Cofins extintos, IPI a alíquota zero, CBS ativa a 8,7% (redução de 0,1%) e IBS a 0,1%.",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Vigente (100%)",
        icmsIssClass: "badge-primary",
        cbs: "Cobrança Efetiva (-0.1% p.p.)",
        cbsClass: "badge-success",
        ibs: "Cobrança Efetiva (0.1%)",
        ibsClass: "badge-success",
        legalNote: "Ano de consolidação do novo arranjo federal de tributação antes do início da transição de ICMS e ISS.",
        cbsRateFunc: (cbsStd) => Math.max(0, cbsStd - 0.001),
        ibsRateFunc: (ibsStd) => 0.001,
        residualIcmsIssPct: 1.0,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2029: {
        description: "Início da transição subnacional gradual. ICMS e ISS reduzem para 90% de sua carga original, convivendo com a cobrança de 10% do IBS pleno.",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Reduzido a 90% (Transição)",
        icmsIssClass: "badge-warning",
        cbs: "Vigente (Alíquota Cheia)",
        cbsClass: "badge-success",
        ibs: "Vigente (10% do IBS)",
        ibsClass: "badge-success",
        legalNote: "Início da substituição gradual do ICMS e ISS estaduais/municipais pelo novo IBS (10% da alíquota plena e 90% de ICMS/ISS residual).",
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.10,
        residualIcmsIssPct: 0.90,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2030: {
        description: "Avanço da transição subnacional. ICMS e ISS são reduzidos para 80%, convivendo com a cobrança de 20% do IBS pleno.",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Reduzido a 80% (Transição)",
        icmsIssClass: "badge-warning",
        cbs: "Vigente (Alíquota Cheia)",
        cbsClass: "badge-success",
        ibs: "Vigente (20% do IBS)",
        ibsClass: "badge-success",
        legalNote: "Proporção progressiva: a participação do IBS no bloco subnacional aumenta para 20%, enquanto a carga de ICMS/ISS residual cai para 80%.",
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.20,
        residualIcmsIssPct: 0.80,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2031: {
        description: "Intensificação da transição. ICMS e ISS reduzem para 70% de sua carga original, convivendo com a cobrança de 30% do IBS pleno.",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Reduzido a 70% (Transição)",
        icmsIssClass: "badge-warning",
        cbs: "Vigente (Alíquota Cheia)",
        cbsClass: "badge-success",
        ibs: "Vigente (30% do IBS)",
        ibsClass: "badge-success",
        legalNote: "A convivência entre os dois sistemas continua, mas a cobrança do IBS ganha maior representatividade (30% IBS / 70% ICMS/ISS).",
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.30,
        residualIcmsIssPct: 0.70,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2032: {
        description: "Último ano da transição escalonada subnacional expressa no Gov.br. ICMS e ISS reduzem para 60%, convivendo com a cobrança de 40% do IBS pleno.",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Reduzido a 60% (Transição)",
        icmsIssClass: "badge-warning",
        cbs: "Vigente (Alíquota Cheia)",
        cbsClass: "badge-success",
        ibs: "Vigente (40% do IBS)",
        ibsClass: "badge-success",
        legalNote: "Fase final da transição gradual expressa em percentuais. A partir do próximo ano, ocorre a migração definitiva com substituição integral.",
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 0.40,
        residualIcmsIssPct: 0.60,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    },
    2033: {
        description: "Conclusão definitiva da transição tributária principal. Extinção total de ICMS e ISS. IBS e CBS operam de forma integral e plena (100%).",
        pisCofins: "Extinto",
        pisCofinsClass: "badge-danger",
        ipi: "Alíquota Zero (Em Regra)",
        ipiClass: "badge-success",
        icmsIss: "Extinto (Substituição Plena)",
        icmsIssClass: "badge-danger",
        cbs: "Vigente (Alíquota Cheia)",
        cbsClass: "badge-success",
        ibs: "Vigente (Alíquota Cheia)",
        ibsClass: "badge-success",
        legalNote: "Conforme a EC 132/2023, o IBS assume integralmente o papel do ICMS e ISS, finalizando a transição estrutural.",
        cbsRateFunc: (cbsStd) => cbsStd,
        ibsRateFunc: (ibsStd) => ibsStd * 1.00,
        residualIcmsIssPct: 0.0,
        residualPisCofinsPct: 0.0,
        residualIpiPct: 0.0,
        neutralized: false
    }
};

// Fallback Default Tax Rules
const DEFAULT_RULES = {
    "aliquotas_padrao": {
        "cbs": 0.088,
        "ibs": 0.177,
        "total": 0.265
    },
    "regras_especiais": [
        {
            "ncm_codigo": "10063021",
            "produto_nome": "Arroz",
            "tipo_regra": "isento",
            "fator_reducao": 1.0,
            "descricao": "Cesta Básica Nacional - Alíquota zero de CBS e IBS."
        },
        {
            "ncm_codigo": "07133399",
            "produto_nome": "Feijao",
            "tipo_regra": "isento",
            "fator_reducao": 1.0,
            "descricao": "Cesta Básica Nacional - Alíquota zero de CBS e IBS."
        },
        {
            "ncm_codigo": "04012010",
            "produto_nome": "Leite",
            "tipo_regra": "isento",
            "fator_reducao": 1.0,
            "descricao": "Cesta Básica Nacional - Alíquota zero de CBS e IBS."
        },
        {
            "ncm_codigo": "30049025",
            "produto_nome": "Medicamentos",
            "tipo_regra": "reducao_60",
            "fator_reducao": 0.6,
            "descricao": "Alíquota de CBS e IBS reduzida em 60%."
        },
        {
            "ncm_codigo": "99010000",
            "produto_nome": "Educacao",
            "tipo_regra": "reducao_60",
            "fator_reducao": 0.6,
            "descricao": "Alíquota de CBS e IBS reduzida em 60% para serviços de educação."
        }
    ],
    "ultima_atualizacao": "2026-07-19T03:32:00Z",
    "fonte_oficial": "https://www.gov.br/fazenda/pt-br/assuntos/reforma-tributaria"
};

// Fallback Default Column Header Mappings
const DEFAULT_MAPPINGS = {
    "id_nfe": ["id_nfe", "id_venda", "id", "numero_nfe", "nfe", "numero", "id_nota", "nota_fiscal", "nota"],
    "data_emissao": ["data_emissao", "data", "emissao", "data_venda", "dt_emissao", "dt_venda", "data_nota"],
    "uf_origem": ["uf_origem", "origem", "uf_de", "uf_orig", "uf_remetente", "estado_origem", "uf_rem"],
    "uf_destino": ["uf_destino", "uf_cliente", "uf_dest", "uf_para", "uf", "uf_destinatario", "estado_destino", "uf_destin"],
    "ncm_codigo": ["ncm_codigo", "ncm", "codigo_ncm", "cod_ncm", "ncm_code", "ncm_no"],
    "produto_nome": ["produto_nome", "descricao_produto", "produto", "descricao", "nome_produto", "item", "nome_item", "desc_item", "desc_prod", "produto_descricao"],
    "quantidade": ["quantidade", "qtd", "quant", "qnt", "qtde", "quantidade_itens", "quantia"],
    "valor_unitario": ["valor_unitario", "preco_unitario", "valor_unit", "preco", "vlr_unitario", "vlr_unit", "preco_unit", "val_unit"],
    "valor_total": ["valor_total", "valor_total_item", "total", "valor", "valor_total_nfe", "vlr_total", "vl_total", "valor_liq", "liquido", "vlr_total_item"],
    "tipo_cliente": ["tipo_cliente", "tipo_cli", "cliente_tipo", "tipo_destinatario", "perfil_cliente"],
    "pis_atual": ["pis_atual", "valor_pis", "pis", "vlr_pis", "vl_pis", "pis_valor", "pisval", "valorpis", "pis_vlr", "pis_val", "pis_aliquota"],
    "cofins_atual": ["cofins_atual", "valor_cofins", "cofins", "vlr_cofins", "vl_cofins", "cofins_valor", "cofinsval", "valorcofins", "cofins_vlr", "cofins_val", "cofins_aliquota"],
    "icms_atual": ["icms_atual", "valor_icms", "icms", "vlr_icms", "vl_icms", "icms_valor", "icmsval", "valoricms", "icms_vlr", "icms_val", "icms_aliquota", "valor_icms_integral"],
    "iss_atual": ["iss_atual", "valor_iss", "iss", "vlr_iss", "vl_iss", "iss_valor", "issval", "valoriss", "iss_vlr", "iss_val", "iss_aliquota"],
    "ipi_atual": ["ipi_atual", "valor_ipi", "ipi", "vlr_ipi", "vl_ipi", "ipi_valor", "ipival", "valoripi", "ipi_vlr", "ipi_val", "ipi_aliquota"]
};

// Fallback Default Sales Database (starts clean as requested)
const DEFAULT_VENDAS = [];

// App State
let systemRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
let columnMappings = null;
let rawSales = [];
let analyzedSales = [];
let activeSortColumn = 'id_nfe';
let activeSortDirection = 'asc';
let legalThesis = 'fisco'; // 'fisco' (Tese do Fisco - RC SEFAZ/SP 32.303/2025) ou 'contribuinte' (Tese do Contribuinte - PLP 16/2025)
let activeSimulatedSale = null;

// ApexCharts instances
let charts = {
    distribution: null,
    products: null,
    regional: null
};

// UI Elements
const themeToggle = document.getElementById('theme-toggle');
const headerEl = document.getElementById('header');

const cbsSlider = document.getElementById('cbs-slider');
const cbsVal = document.getElementById('cbs-val');
const ibsSlider = document.getElementById('ibs-slider');
const ibsVal = document.getElementById('ibs-val');

const legalThesisSelect = document.getElementById('legal-thesis-select');
const thesisBadge = document.getElementById('thesis-badge');

// Year Selector State and DOM elements
let currentYear = 2026;
const selectedYearDisplay = document.getElementById('selected-year-display');
const yearDescription = document.getElementById('year-description');

// Upload controls
const uploadZone = document.getElementById('upload-zone');
const csvFileInput = document.getElementById('csv-file-input');
const btnLoadDefault = document.getElementById('btn-load-default');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');

// KPI elements
const kpiRevenue = document.getElementById('kpi-revenue');
const kpiCount = document.getElementById('kpi-count');
const kpiTaxCurrent = document.getElementById('kpi-tax-current');
const kpiTaxCurrentPct = document.getElementById('kpi-tax-current-pct');
const kpiTaxNew = document.getElementById('kpi-tax-new');
const kpiTaxNewPct = document.getElementById('kpi-tax-new-pct');
const kpiTaxDiff = document.getElementById('kpi-tax-diff');
const kpiTaxDiffTrend = document.getElementById('kpi-tax-diff-trend');
const kpiContingencyVal = document.getElementById('kpi-contingency-val');
const kpiContingencyPct = document.getElementById('kpi-contingency-pct');

// Table search and body
const tableSearch = document.getElementById('table-search');
const tableBody = document.getElementById('sales-table-body');
const tableHeaders = document.querySelectorAll('#sales-table th[data-sort]');

// JSON display
const jsonViewer = document.getElementById('json-viewer');

// Simulator elements
const simProductName = document.getElementById('sim-product-name');
const simNcm = document.getElementById('sim-ncm');
const simValue = document.getElementById('sim-value');
const simRuleType = document.getElementById('sim-rule-type');
const simImpactVal = document.getElementById('sim-impact-val');
const simImpactPct = document.getElementById('sim-impact-pct');
const simTaxCurrentEl = document.getElementById('sim-tax-current');
const simTaxCbsEl = document.getElementById('sim-tax-cbs');
const simTaxIbsEl = document.getElementById('sim-tax-ibs');
const simTaxNewEl = document.getElementById('sim-tax-new');

// Custom rule form
const ruleNcm = document.getElementById('rule-ncm');
const ruleName = document.getElementById('rule-name');
const ruleType = document.getElementById('rule-type');
const btnAddRule = document.getElementById('btn-add-rule');


// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    // Icons
    lucide.createIcons();
    
    // Event listeners
    initEventListeners();
    
    // Load rules and initial sales dataset
    loadInitialData();
});

// Setup navigation highlighting on scroll
window.addEventListener('scroll', () => {
    // Header scroll background change
    if (window.scrollY > 50) {
        headerEl.classList.add('scrolled');
    } else {
        headerEl.classList.remove('scrolled');
    }

    // Scroll active link mapping
    const scrollPos = window.scrollY + 100;
    document.querySelectorAll('main > section').forEach(section => {
        if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
            const id = section.getAttribute('id');
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

function initEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.innerHTML = isLight ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
        lucide.createIcons();
        
        // Refresh charts colors when theme switches
        updateCharts();
    });

    // Legal Thesis Scenario Selector
    if (legalThesisSelect) {
        legalThesisSelect.addEventListener('change', (e) => {
            legalThesis = e.target.value;
            if (thesisBadge) {
                thesisBadge.textContent = legalThesis === 'fisco' ? 'Tese do Fisco' : 'Tese Contribuinte';
                thesisBadge.className = legalThesis === 'fisco' ? 'badge badge-warning' : 'badge badge-success';
            }
            recalculateAndRefresh();
        });
    }

    // Sliders
    cbsSlider.addEventListener('input', (e) => {
        cbsVal.textContent = parseFloat(e.target.value).toFixed(1) + '%';
        recalculateAndRefresh();
    });
    ibsSlider.addEventListener('input', (e) => {
        ibsVal.textContent = parseFloat(e.target.value).toFixed(1) + '%';
        recalculateAndRefresh();
    });

    // Year Selector Timeline Buttons
    const btnYears = document.querySelectorAll('.btn-year');
    btnYears.forEach(btn => {
        btn.addEventListener('click', () => {
            const yearStr = btn.getAttribute('data-year');
            currentYear = parseInt(yearStr);
            
            // Sync all year buttons with the same data-year
            btnYears.forEach(b => {
                if (b.getAttribute('data-year') === yearStr) {
                    b.classList.add('active');
                } else {
                    b.classList.remove('active');
                }
            });
            
            // Update display
            if (selectedYearDisplay) selectedYearDisplay.textContent = currentYear;
            const simSelectedYear = document.getElementById('sim-selected-year');
            if (simSelectedYear) simSelectedYear.textContent = currentYear;

            const yearRules = YEAR_TRANSITION_RULES[currentYear];
            if (yearDescription) yearDescription.textContent = yearRules.description;

            recalculateAndRefresh();
        });
    });

    // File Drag and Drop / Select
    uploadZone.addEventListener('click', () => csvFileInput.click());
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    });
    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files);
        }
    });

    // Clear and reset database cache
    btnLoadDefault.addEventListener('click', () => {
        if (confirm('Deseja limpar todos os dados importados e esvaziar o simulador?')) {
            clearSalesCache();
            loadFallbackSales();
        }
    });

    // Export data to Excel
    const btnExportExcel = document.getElementById('btn-export-excel');
    if (btnExportExcel) {
        btnExportExcel.addEventListener('click', () => {
            exportSalesToExcel();
        });
    }

    // Search bar
    tableSearch.addEventListener('input', () => {
        renderTable();
    });

    // Table sorting
    tableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const col = th.getAttribute('data-sort');
            if (activeSortColumn === col) {
                activeSortDirection = activeSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                activeSortColumn = col;
                activeSortDirection = 'asc';
            }
            
            // Update icons
            tableHeaders.forEach(header => {
                const icon = header.querySelector('i');
                if (icon) icon.setAttribute('data-lucide', 'chevrons-up-down');
            });
            const activeIcon = th.querySelector('i');
            if (activeIcon) {
                activeIcon.setAttribute('data-lucide', activeSortDirection === 'asc' ? 'chevron-up' : 'chevron-down');
            }
            lucide.createIcons();
            
            renderTable();
        });
    });

    // Single item simulator
    const simInputs = [simProductName, simNcm, simValue, simRuleType];
    simInputs.forEach(input => {
        input.addEventListener('input', updateSingleSimulator);
    });

    // NCM auto-detection on simulator
    simNcm.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        const rule = matchRule(value, '');
        if (rule) {
            simRuleType.value = rule.tipo_regra;
        } else {
            simRuleType.value = 'padrao';
        }
        updateSingleSimulator();
    });

    // Add Exception rule
    btnAddRule.addEventListener('click', () => {
        const ncm = ruleNcm.value.trim();
        const desc = ruleName.value.trim();
        const type = ruleType.value;

        if (ncm.length !== 8 || isNaN(ncm)) {
            alert('Código NCM deve conter exatamente 8 dígitos numéricos.');
            return;
        }
        if (!desc) {
            alert('Por favor, informe uma descrição para a regra.');
            return;
        }

        // Add rule to local list
        const reductionFactors = {
            'isento': 1.0,
            'reducao_60': 0.6,
            'reducao_30': 0.3
        };

        const newException = {
            ncm_codigo: ncm,
            produto_nome: desc,
            tipo_regra: type,
            fator_reducao: reductionFactors[type],
            descricao: `Regra provisória: ${desc}. Fator de redução = ${reductionFactors[type]}`
        };

        systemRules.regras_especiais.unshift(newException);
        updateRulesDisplay();
        recalculateAndRefresh();
        updateSingleSimulator();

        // Clear fields
        ruleNcm.value = '';
        ruleName.value = '';
        alert('Regra adicionada e aplicada ao Dashboard com sucesso!');
    });

    // Simulator breakdown tab switcher
    const btnSimTabSummary = document.getElementById('btn-sim-tab-summary');
    const btnSimTabBreakdown = document.getElementById('btn-sim-tab-breakdown');
    const btnSimTabTheses = document.getElementById('btn-sim-tab-theses');

    const panelSummary = document.getElementById('sim-panel-summary');
    const panelBreakdown = document.getElementById('sim-panel-breakdown');
    const panelTheses = document.getElementById('sim-panel-theses');

    function switchSimTab(tab) {
        if (!panelSummary || !panelBreakdown || !panelTheses) return;
        btnSimTabSummary.classList.remove('active');
        btnSimTabBreakdown.classList.remove('active');
        btnSimTabTheses.classList.remove('active');

        panelSummary.style.display = 'none';
        panelBreakdown.style.display = 'none';
        panelTheses.style.display = 'none';

        if (tab === 'summary') {
            btnSimTabSummary.classList.add('active');
            panelSummary.style.display = 'block';
        } else if (tab === 'breakdown') {
            btnSimTabBreakdown.classList.add('active');
            panelBreakdown.style.display = 'block';
        } else if (tab === 'theses') {
            btnSimTabTheses.classList.add('active');
            panelTheses.style.display = 'block';
        }
    }

    if (btnSimTabSummary) btnSimTabSummary.addEventListener('click', () => switchSimTab('summary'));
    if (btnSimTabBreakdown) btnSimTabBreakdown.addEventListener('click', () => switchSimTab('breakdown'));
    if (btnSimTabTheses) btnSimTabTheses.addEventListener('click', () => switchSimTab('theses'));

    // Toggle multi-year matrix card
    const multiyearHeader = document.getElementById('multiyear-header');
    const multiyearContent = document.getElementById('multiyear-content');
    const btnToggleMultiyear = document.getElementById('btn-toggle-multiyear');
    const multiyearChevronIcon = document.getElementById('multiyear-chevron-icon');

    function toggleMultiyearCard() {
        if (!multiyearContent) return;
        const isCollapsed = multiyearContent.classList.toggle('collapsed');
        if (multiyearChevronIcon) {
            multiyearChevronIcon.setAttribute('data-lucide', isCollapsed ? 'chevron-down' : 'chevron-up');
            lucide.createIcons();
        }
    }

    if (multiyearHeader) multiyearHeader.addEventListener('click', toggleMultiyearCard);
    if (btnToggleMultiyear) btnToggleMultiyear.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMultiyearCard();
    });

    // Multi-year Matrix Mode Switcher (Item Individual vs Nota Fiscal Completa)
    const btnMultiyearModeItem = document.getElementById('btn-multiyear-mode-item');
    const btnMultiyearModeNfe = document.getElementById('btn-multiyear-mode-nfe');
    const multiyearNfeSelectorContainer = document.getElementById('multiyear-nfe-selector-container');
    const multiyearNfeSelect = document.getElementById('multiyear-nfe-select');

    if (btnMultiyearModeItem && btnMultiyearModeNfe) {
        btnMultiyearModeItem.addEventListener('click', () => {
            multiyearMode = 'item';
            btnMultiyearModeItem.classList.add('active');
            btnMultiyearModeNfe.classList.remove('active');
            if (multiyearNfeSelectorContainer) multiyearNfeSelectorContainer.style.display = 'none';
            updateSingleSimulator();
        });

        btnMultiyearModeNfe.addEventListener('click', () => {
            multiyearMode = 'nfe';
            btnMultiyearModeNfe.classList.add('active');
            btnMultiyearModeItem.classList.remove('active');
            if (multiyearNfeSelectorContainer) multiyearNfeSelectorContainer.style.display = 'flex';
            populateMultiyearNfeDropdown();
            updateSingleSimulator();
        });
    }

    if (multiyearNfeSelect) {
        multiyearNfeSelect.addEventListener('change', (e) => {
            multiyearTargetNfe = e.target.value;
            updateSingleSimulator();
        });
    }
}

let multiyearMode = 'item'; // 'item' or 'nfe'
let multiyearTargetNfe = 'consolidado'; // 'consolidado' or specific id_nfe

function populateMultiyearNfeDropdown() {
    const multiyearNfeSelect = document.getElementById('multiyear-nfe-select');
    if (!multiyearNfeSelect) return;

    const currentVal = multiyearNfeSelect.value || 'consolidado';
    
    // Group sales by id_nfe
    const nfeGroupMap = {};
    if (analyzedSales && analyzedSales.length > 0) {
        analyzedSales.forEach(s => {
            const id = s.id_nfe || 'NF Desconhecida';
            if (!nfeGroupMap[id]) {
                nfeGroupMap[id] = { count: 0, total: 0, uf: `${s.uf_origem}->${s.uf_destino}` };
            }
            nfeGroupMap[id].count += 1;
            nfeGroupMap[id].total += s.valor_total;
        });
    }

    const nfeIds = Object.keys(nfeGroupMap);

    let html = `<option value="consolidado">Todas as Notas Fiscais (Consolidado - ${analyzedSales ? analyzedSales.length : 0} itens)</option>`;
    nfeIds.forEach(id => {
        const info = nfeGroupMap[id];
        html += `<option value="${id}">${id} (${info.count} item${info.count > 1 ? 'ns' : ''} - ${formatCurrency(info.total)})</option>`;
    });

    multiyearNfeSelect.innerHTML = html;
    if (nfeIds.includes(currentVal) || currentVal === 'consolidado') {
        multiyearNfeSelect.value = currentVal;
    } else if (nfeIds.length > 0) {
        multiyearNfeSelect.value = nfeIds[0];
        multiyearTargetNfe = nfeIds[0];
    }
}

// Load Rules from JSON & initial CSV sales
function loadInitialData() {
    const fetchRules = fetch('dados_reforma/regras_aliquotas.json')
        .then(response => {
            if (!response.ok) throw new Error('Não foi possível obter o JSON das regras');
            return response.json();
        })
        .catch(err => {
            console.log('Erro ao carregar regras via HTTP. Usando regras padrão locais:', err);
            return JSON.parse(JSON.stringify(DEFAULT_RULES));
        });

    const fetchMappings = fetch('dados_reforma/variantes/mapeamento_colunas.json')
        .then(response => {
            if (!response.ok) throw new Error('Não foi possível obter o JSON de mapeamento de colunas');
            return response.json();
        })
        .catch(err => {
            console.log('Erro ao carregar mapeamento de colunas via HTTP. Usando padrão local:', err);
            return JSON.parse(JSON.stringify(DEFAULT_MAPPINGS));
        });

    Promise.all([fetchRules, fetchMappings])
        .then(([rules, mappings]) => {
            systemRules = rules;
            columnMappings = mappings;

            // Update sliders with JSON standard values
            if (systemRules.aliquotas_padrao) {
                cbsSlider.value = (systemRules.aliquotas_padrao.cbs * 100).toFixed(1);
                cbsVal.textContent = (systemRules.aliquotas_padrao.cbs * 100).toFixed(1) + '%';
                ibsSlider.value = (systemRules.aliquotas_padrao.ibs * 100).toFixed(1);
                ibsVal.textContent = (systemRules.aliquotas_padrao.ibs * 100).toFixed(1) + '%';
            }

            updateRulesDisplay();
            updateMappingsDisplay();
            loadInitialSales();
        });
}

function updateMappingsDisplay() {
    const mappingsViewer = document.getElementById('mappings-viewer');
    if (mappingsViewer) {
        mappingsViewer.textContent = JSON.stringify(columnMappings || DEFAULT_MAPPINGS, null, 2);
    }
}

function loadInitialSales() {
    // 1. Try loading from localStorage cache
    try {
        const cached = localStorage.getItem('rawSales');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
                rawSales = parsed;
                setDatabaseStatus('success', 'Base de dados restaurada do cache local.');
                recalculateAndRefresh();
                return;
            }
        }
    } catch (e) {
        console.warn('Erro ao ler rawSales do cache local:', e);
    }

    // 2. Fallback to loading vendas_exemplo.csv
    fetch('tabelas_nfe/vendas_exemplo.csv')
        .then(response => {
            if (!response.ok) throw new Error('Não foi possível carregar o CSV');
            return response.text();
        })
        .then(csvText => {
            parseSalesCSV(csvText, true);
        })
        .catch(err => {
            console.log('Erro ao carregar CSV de vendas via HTTP:', err);
            loadFallbackSales();
        });
}

function loadFallbackSales() {
    rawSales = JSON.parse(JSON.stringify(DEFAULT_VENDAS));
    if (rawSales && rawSales.length > 0) {
        setDatabaseStatus('warning', 'Base mockada ativa (Modo Offline/Local).');
    } else {
        setDatabaseStatus('warning', 'Aguardando importação de notas fiscais...');
    }
    recalculateAndRefresh();
}

function handleFileUpload(fileInput) {
    if (!fileInput) return;
    const files = (fileInput instanceof FileList || Array.isArray(fileInput)) 
        ? Array.from(fileInput) 
        : [fileInput];

    if (files.length === 0) return;

    // Categorize files
    const xmlFiles = files.filter(f => f.name.toLowerCase().endsWith('.xml'));
    const csvFiles = files.filter(f => f.name.toLowerCase().endsWith('.csv'));
    const excelFiles = files.filter(f => f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls'));

    if (xmlFiles.length > 0) {
        setDatabaseStatus('warning', `Processando ${xmlFiles.length} arquivo(s) XML de NF-e...`);
        const xmlPromises = xmlFiles.map(readXmlFile);
        Promise.all(xmlPromises)
            .then(results => {
                let allItems = [];
                results.forEach(res => {
                    allItems = allItems.concat(res.items);
                });

                if (allItems.length > 0) {
                    rawSales = allItems;
                    saveSalesToCache();
                    recalculateAndRefresh();
                    if (xmlFiles.length === 1) {
                        setDatabaseStatus('success', `Carregada NF-e (${xmlFiles[0].name}) com ${allItems.length} item(ns).`);
                    } else {
                        setDatabaseStatus('success', `Carregadas ${xmlFiles.length} NF-es em XML (${allItems.length} itens no total).`);
                    }
                } else {
                    alert('Nenhum item válido encontrado no(s) arquivo(s) XML da NF-e.');
                    setDatabaseStatus('warning', 'Sem itens no XML.');
                }
            })
            .catch(err => {
                console.error('Erro ao ler arquivos XML:', err);
                alert('Falha ao processar o(s) arquivo(s) XML enviados.');
                setDatabaseStatus('danger', 'Erro na leitura do XML.');
            });
    } else if (csvFiles.length > 0) {
        const file = csvFiles[0];
        setDatabaseStatus('warning', 'Processando arquivo CSV...');
        const reader = new FileReader();
        reader.onload = function(e) {
            parseSalesCSV(e.target.result);
        };
        reader.onerror = function() {
            alert('Erro ao ler o arquivo selecionado.');
            setDatabaseStatus('danger', 'Erro na leitura do arquivo enviado.');
        };
        reader.readAsText(file, 'UTF-8');
    } else if (excelFiles.length > 0) {
        const file = excelFiles[0];
        setDatabaseStatus('warning', 'Processando planilha Excel...');
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                
                if (jsonData && jsonData.length > 0) {
                    processSalesJSON(jsonData, false);
                    setDatabaseStatus('success', `Carregado arquivo Excel: ${file.name}`);
                } else {
                    alert('Nenhum dado localizado na primeira aba da planilha.');
                    setDatabaseStatus('warning', 'Planilha Excel vazia.');
                }
            } catch (err) {
                console.error('Erro ao ler planilha Excel:', err);
                alert('Falha ao processar a planilha Excel selecionada.');
                setDatabaseStatus('danger', 'Erro na leitura do Excel.');
            }
        };
        reader.onerror = function() {
            alert('Erro ao ler o arquivo selecionado.');
            setDatabaseStatus('danger', 'Erro na leitura do arquivo enviado.');
        };
        reader.readAsArrayBuffer(file);
    } else {
        alert('Por favor, faça upload de um arquivo com extensão .xml, .csv, .xlsx ou .xls');
    }
}

function readXmlFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const items = parseNfeXmlText(e.target.result, file.name);
                resolve({ fileName: file.name, items: items });
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = function(err) {
            reject(err);
        };
        reader.readAsText(file, 'UTF-8');
    });
}

function parseNfeXmlText(xmlText, fileName) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
        console.error("Erro de parser no XML:", parserError.textContent);
        return [];
    }

    const getTagVal = (container, tagName, defaultVal = '') => {
        if (!container) return defaultVal;
        const els = container.getElementsByTagName(tagName);
        if (els && els.length > 0 && els[0].textContent !== null) {
            return els[0].textContent.trim();
        }
        return defaultVal;
    };

    const ide = xmlDoc.getElementsByTagName('ide')[0];
    const emit = xmlDoc.getElementsByTagName('emit')[0];
    const dest = xmlDoc.getElementsByTagName('dest')[0];

    const nNF = getTagVal(ide, 'nNF') || getTagVal(xmlDoc, 'chNFe') || '1';

    let dhEmi = getTagVal(ide, 'dhEmi') || getTagVal(ide, 'dEmi') || '2026-07-19';
    if (dhEmi.includes('T')) {
        dhEmi = dhEmi.split('T')[0];
    }

    const ufOrigem = getTagVal(emit, 'UF', 'SP');
    const ufDestino = getTagVal(dest, 'UF', 'SP');

    let tipoCliente = "B2C";
    if (dest) {
        const cnpjDest = getTagVal(dest, 'CNPJ');
        if (cnpjDest && cnpjDest.length > 0) {
            tipoCliente = "B2B";
        }
    }

    const detList = xmlDoc.getElementsByTagName('det');
    const items = [];

    for (let i = 0; i < detList.length; i++) {
        const det = detList[i];
        const prod = det.getElementsByTagName('prod')[0];
        const imposto = det.getElementsByTagName('imposto')[0];

        if (!prod) continue;

        const xProd = getTagVal(prod, 'xProd', 'Produto NFe');
        const ncmRaw = getTagVal(prod, 'NCM', '');
        const cleanNcm = ncmRaw.replace(/\D/g, '');
        const qCom = parseFloatSafe(getTagVal(prod, 'qCom', '1'), 1);
        const vUnCom = parseFloatSafe(getTagVal(prod, 'vUnCom', '0'), 0);
        let vProd = parseFloatSafe(getTagVal(prod, 'vProd', '0'), 0);
        if (vProd === 0) {
            vProd = qCom * vUnCom;
        }

        let icmsVal = 0;
        let pisVal = 0;
        let cofinsVal = 0;
        let ipiVal = 0;
        let issVal = 0;

        if (imposto) {
            const icmsGroup = imposto.getElementsByTagName('ICMS')[0];
            if (icmsGroup) {
                icmsVal = parseFloatSafe(getTagVal(icmsGroup, 'vICMS', '0'), 0);
            }

            const pisGroup = imposto.getElementsByTagName('PIS')[0];
            if (pisGroup) {
                pisVal = parseFloatSafe(getTagVal(pisGroup, 'vPIS', '0'), 0);
            }

            const cofinsGroup = imposto.getElementsByTagName('COFINS')[0];
            if (cofinsGroup) {
                cofinsVal = parseFloatSafe(getTagVal(cofinsGroup, 'vCOFINS', '0'), 0);
            }

            const ipiGroup = imposto.getElementsByTagName('IPI')[0];
            if (ipiGroup) {
                ipiVal = parseFloatSafe(getTagVal(ipiGroup, 'vIPI', '0'), 0);
            }

            const issGroup = imposto.getElementsByTagName('ISSQN')[0];
            if (issGroup) {
                issVal = parseFloatSafe(getTagVal(issGroup, 'vISSQN', '0') || getTagVal(issGroup, 'vISS', '0'), 0);
            }
        }

        items.push({
            id_nfe: `NF ${nNF}`,
            data_emissao: dhEmi,
            uf_origem: ufOrigem,
            uf_destino: ufDestino,
            ncm_codigo: cleanNcm || "85171300",
            produto_nome: xProd,
            quantidade: qCom,
            valor_unitario: vUnCom,
            valor_total: vProd,
            tipo_cliente: tipoCliente,
            pis_atual: pisVal,
            cofins_atual: cofinsVal,
            icms_atual: icmsVal,
            iss_atual: issVal,
            ipi_atual: ipiVal
        });
    }

    return items;
}

function parseSalesCSV(csvText, silent = false) {
    Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data && results.data.length > 0) {
                processSalesJSON(results.data, silent);
                if (!silent) {
                    setDatabaseStatus('success', 'Arquivo CSV carregado com sucesso.');
                }
            } else {
                if (!silent) {
                    alert('Nenhum dado encontrado no arquivo CSV.');
                }
                setDatabaseStatus('warning', 'Aguardando importação de notas fiscais...');
                rawSales = [];
                saveSalesToCache();
                recalculateAndRefresh();
            }
        }
    });
}

function processSalesJSON(jsonData, silent = false) {
    const headers = Object.keys(jsonData[0]);
    const mappings = columnMappings || DEFAULT_MAPPINGS;
    
    // Helper to search keys using aliases from configurations, filtering empty values
    const getVal = (row, keyOrAliases, defaultVal = null) => {
        const aliases = Array.isArray(keyOrAliases) 
            ? keyOrAliases 
            : (mappings[keyOrAliases] || [keyOrAliases]);
            
        const foundKey = headers.find(k => {
            const cleanK = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
            return aliases.some(alias => {
                const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9_]/g, '');
                return cleanK === cleanAlias;
            });
        });
        if (foundKey === undefined) return defaultVal;
        const val = row[foundKey];
        return (val === null || val === undefined || String(val).trim() === "") ? defaultVal : val;
    };

    // Validate minimum requirements: we need some way to identify the product description and value
    const productAliases = mappings.produto_nome;
    const valueAliases = mappings.valor_total;

    const hasProduct = headers.some(k => {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
        return productAliases.some(alias => cleanK === alias.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    });
    
    const hasValue = headers.some(k => {
        const cleanK = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
        return valueAliases.some(alias => cleanK === alias.toLowerCase().replace(/[^a-z0-9_]/g, ''));
    });

    if (!hasProduct || !hasValue) {
        if (!silent) {
            alert('A planilha é inválida. Não foi possível identificar as colunas de descrição do produto ou valor total.');
        }
        setDatabaseStatus('danger', 'Colunas essenciais ausentes.');
        return;
    }

    // Format records properly using alias mapping and safe float conversion
    rawSales = jsonData.map((row, idx) => {
        // Map client type dynamically from doc type or length
        let clientType = "B2C";
        const directType = getVal(row, 'tipo_cliente');
        if (directType) {
            clientType = String(directType).toUpperCase().includes("B2B") ? "B2B" : "B2C";
        } else {
            const docType = getVal(row, ['tipo_documento_cliente', 'tipo_doc', 'tipo_documento']);
            if (docType) {
                clientType = String(docType).toUpperCase() === "CNPJ" ? "B2B" : "B2C";
            } else {
                const docVal = getVal(row, ['documento_cliente', 'documento', 'doc_cliente', 'cnpj', 'cpf']);
                if (docVal) {
                    const cleanDoc = String(docVal).replace(/\D/g, "");
                    clientType = cleanDoc.length > 11 ? "B2B" : "B2C";
                }
            }
        }

        const ncmRaw = getVal(row, 'ncm_codigo', "");
        const cleanNcm = String(ncmRaw || "").replace(/\D/g, "");

        return {
            id_nfe: getVal(row, 'id_nfe', idx + 1),
            data_emissao: getVal(row, 'data_emissao', "2026-07-19"),
            uf_origem: getVal(row, 'uf_origem', "SP"),
            uf_destino: getVal(row, 'uf_destino', "SP"),
            ncm_codigo: cleanNcm || "85171300",
            produto_nome: getVal(row, 'produto_nome', "Produto Sem Nome"),
            quantidade: parseFloatSafe(getVal(row, 'quantidade', 1), 1),
            valor_unitario: parseFloatSafe(getVal(row, 'valor_unitario', 0), 0),
            valor_total: parseFloatSafe(getVal(row, 'valor_total', 0), 0),
            tipo_cliente: clientType,
            pis_atual: parseFloatSafe(getVal(row, 'pis_atual', 0), 0),
            cofins_atual: parseFloatSafe(getVal(row, 'cofins_atual', 0), 0),
            icms_atual: parseFloatSafe(getVal(row, 'icms_atual', 0), 0),
            iss_atual: parseFloatSafe(getVal(row, 'iss_atual', 0), 0),
            ipi_atual: parseFloatSafe(getVal(row, 'ipi_atual', 0), 0)
        };
    });

    saveSalesToCache();
    recalculateAndRefresh();
}

function saveSalesToCache() {
    try {
        localStorage.setItem('rawSales', JSON.stringify(rawSales));
    } catch (e) {
        console.warn('Erro ao salvar no cache local:', e);
    }
}

function clearSalesCache() {
    try {
        localStorage.removeItem('rawSales');
    } catch (e) {
        console.warn('Erro ao limpar cache local:', e);
    }
}

function setDatabaseStatus(type, message) {
    statusDot.className = 'status-indicator ' + type;
    statusText.textContent = message;
}

// Rules matching logic by NCM or product keyword matching
function matchRule(ncm, productName) {
    const rules = systemRules.regras_especiais;
    const cleanNcm = String(ncm).trim();
    const cleanName = String(productName).toLowerCase().trim();
    
    // First, try matching NCM exactly
    if (cleanNcm) {
        const found = rules.find(r => r.ncm_codigo === cleanNcm);
        if (found) return found;
    }
    
    // If not found, try matching by name
    if (cleanName) {
        const found = rules.find(r => cleanName.includes(r.produto_nome.toLowerCase()));
        if (found) return found;
    }
    
    return null;
}

// Calculation Engine
function recalculateAndRefresh() {
    const cbsStd = parseFloat(cbsSlider.value) / 100;
    const ibsStd = parseFloat(ibsSlider.value) / 100;
    const yearRules = YEAR_TRANSITION_RULES[currentYear];

    analyzedSales = rawSales.map(sale => {
        // Calculate old total tax burden
        const taxCurrent = (sale.pis_atual || 0) + (sale.cofins_atual || 0) + (sale.icms_atual || 0) + (sale.iss_atual || 0) + (sale.ipi_atual || 0);

        // Find if there is a special rule for this product
        const rule = matchRule(sale.ncm_codigo, sale.produto_nome);
        
        let cbsFactor = 1.0;
        let ibsFactor = 1.0;
        let ruleDescription = "Alíquota Cheia";
        let badgeClass = "badge-primary";

        if (rule) {
            if (rule.tipo_regra === 'isento') {
                cbsFactor = 0.0;
                ibsFactor = 0.0;
                ruleDescription = "Isento";
                badgeClass = "badge-success";
            } else if (rule.tipo_regra === 'reducao_60') {
                cbsFactor = 0.4; // 60% reduction -> pay 40%
                ibsFactor = 0.4;
                ruleDescription = "Redução 60%";
                badgeClass = "badge-warning";
            } else if (rule.tipo_regra === 'reducao_30') {
                cbsFactor = 0.7; // 30% reduction -> pay 70%
                ibsFactor = 0.7;
                ruleDescription = "Redução 30%";
                badgeClass = "badge-warning";
            }
        }

        // Calculate nominal ICMS rate (default 18% if not inferrable)
        let nominalIcmsRate = 0.18;
        const vBasePiscofinsExIcms = sale.valor_total - (sale.pis_atual || 0) - (sale.cofins_atual || 0);
        if (sale.icms_atual > 0 && vBasePiscofinsExIcms > 0) {
            nominalIcmsRate = Math.min(0.35, Math.max(0.04, sale.icms_atual / vBasePiscofinsExIcms));
        }

        // Calculate CBS & IBS values based on the year rules
        const cbsRate = yearRules.cbsRateFunc(cbsStd) * cbsFactor;
        const ibsRate = yearRules.ibsRateFunc(ibsStd) * ibsFactor;

        const baseValue = Math.max(0, sale.valor_total - taxCurrent);
        const cbsValCalculated = baseValue * cbsRate;
        const ibsValCalculated = baseValue * ibsRate;
        const cbsIbsSum = cbsValCalculated + ibsValCalculated;

        // Calculate residual taxes for this year
        const tax_pis_res = (sale.pis_atual || 0) * yearRules.residualPisCofinsPct;
        const tax_cofins_res = (sale.cofins_atual || 0) * yearRules.residualPisCofinsPct;
        const isZFM = sale.uf_origem === 'AM' || sale.uf_destino === 'AM';
        const tax_ipi_res = (sale.ipi_atual || 0) * (isZFM ? 1.0 : yearRules.residualIpiPct);
        const tax_iss_res = (sale.iss_atual || 0) * yearRules.residualIcmsIssPct;

        // ICMS calculation considering PIS/COFINS extinction and ICMS "por dentro" gross-up (MGK Method)
        const effectiveIcmsRate = nominalIcmsRate * yearRules.residualIcmsIssPct;
        let tax_icms_fisco = 0;
        let tax_icms_contrib = 0;

        if (effectiveIcmsRate > 0) {
            if (yearRules.residualPisCofinsPct === 0) {
                // Post 2027: PIS/COFINS extintos. Recálculo da base por dentro sobre a receita líquida alvo (baseValue)
                // Tese do Fisco (RC SEFAZ/SP 32.303/2025): IBS e CBS integram a base do ICMS
                const vProdFisco = (baseValue + effectiveIcmsRate * cbsIbsSum) / (1 - effectiveIcmsRate);
                tax_icms_fisco = (vProdFisco + cbsIbsSum) * effectiveIcmsRate;

                // Tese do Contribuinte (PLP 16/2025): IBS e CBS NÃO integram a base do ICMS
                const vProdContrib = baseValue / (1 - effectiveIcmsRate);
                tax_icms_contrib = vProdContrib * effectiveIcmsRate;
            } else {
                // 2025/2026: PIS/COFINS continuam vigentes
                tax_icms_fisco = (sale.icms_atual || 0) * yearRules.residualIcmsIssPct;
                tax_icms_contrib = (sale.icms_atual || 0) * yearRules.residualIcmsIssPct;
            }
        }

        // Active ICMS value according to selected legal thesis
        const tax_icms_res = (legalThesis === 'fisco') ? tax_icms_fisco : tax_icms_contrib;
        
        // Passivo / Contingência da controvérsia legal (diferença entre Fisco e Contribuinte)
        const tax_contingency = tax_icms_fisco - tax_icms_contrib;

        // Apply transition scenario
        let taxNew;
        if (yearRules.neutralized) {
            // CBS & IBS are experimental and compensated, keeping the original tax burden paid
            taxNew = taxCurrent;
        } else {
            taxNew = cbsValCalculated + ibsValCalculated + tax_pis_res + tax_cofins_res + tax_ipi_res + tax_icms_res + tax_iss_res;
        }
        
        const taxDiff = taxNew - taxCurrent;

        return {
            ...sale,
            tax_current: taxCurrent,
            tax_cbs: cbsValCalculated,
            tax_ibs: ibsValCalculated,
            tax_pis_res: tax_pis_res,
            tax_cofins_res: tax_cofins_res,
            tax_ipi_res: tax_ipi_res,
            tax_icms_res: tax_icms_res,
            tax_icms_fisco: tax_icms_fisco,
            tax_icms_contrib: tax_icms_contrib,
            tax_contingency: tax_contingency,
            tax_iss_res: tax_iss_res,
            tax_new: taxNew,
            tax_diff: taxDiff,
            status_regra: ruleDescription,
            badge_class: badgeClass
        };
    });

    updateKPIs();
    updateCharts();
    renderTable();
    populateMultiyearNfeDropdown();
    updateSingleSimulator();
}

function updateKPIs() {
    let totalRevenue = 0;
    let totalTaxCurrent = 0;
    let totalTaxNew = 0;
    let totalContingency = 0;
    let totalCount = analyzedSales.length;

    analyzedSales.forEach(sale => {
        totalRevenue += sale.valor_total;
        totalTaxCurrent += sale.tax_current;
        totalTaxNew += sale.tax_new;
        totalContingency += sale.tax_contingency || 0;
    });

    const totalTaxDiff = totalTaxNew - totalTaxCurrent;
    const avgTaxCurrentPct = totalRevenue > 0 ? (totalTaxCurrent / totalRevenue) * 100 : 0;
    const avgTaxNewPct = totalRevenue > 0 ? (totalTaxNew / totalRevenue) * 100 : 0;
    
    // Calculate difference relative to current tax burden
    const taxDiffPct = totalTaxCurrent > 0 ? (totalTaxDiff / totalTaxCurrent) * 100 : 0;
    const contingencyPctRevenue = totalRevenue > 0 ? (totalContingency / totalRevenue) * 100 : 0;

    // Set KPI text
    kpiRevenue.textContent = formatCurrency(totalRevenue);
    kpiCount.textContent = `${totalCount} notas fiscais`;

    kpiTaxCurrent.textContent = formatCurrency(totalTaxCurrent);
    kpiTaxCurrentPct.textContent = `Alíquota média: ${avgTaxCurrentPct.toFixed(2)}%`;

    kpiTaxNew.textContent = formatCurrency(totalTaxNew);
    kpiTaxNewPct.textContent = `Alíquota média: ${avgTaxNewPct.toFixed(2)}%`;

    kpiTaxDiff.textContent = (totalTaxDiff >= 0 ? '+' : '') + formatCurrency(totalTaxDiff);
    
    // Style the diff card trend
    const trendEl = kpiTaxDiffTrend.querySelector('.kpi-trend');
    trendEl.textContent = `${(totalTaxDiff >= 0 ? '+' : '')}${taxDiffPct.toFixed(1)}%`;
    trendEl.className = 'kpi-trend ' + (totalTaxDiff > 0 ? 'positive' : totalTaxDiff < 0 ? 'negative' : '');

    // Set Risk / Contingency KPI text
    if (kpiContingencyVal) {
        kpiContingencyVal.textContent = formatCurrency(totalContingency);
    }
    if (kpiContingencyPct) {
        kpiContingencyPct.textContent = `Diferença ICMS: +${contingencyPctRevenue.toFixed(2)}% fat.`;
    }
}

// Chart Renderings
function updateCharts() {
    const isLight = document.body.classList.contains('light-mode');
    const labelColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)';

    const distributionContainer = document.querySelector("#chart-distribution");
    const productsContainer = document.querySelector("#chart-products");
    const regionalContainer = document.querySelector("#chart-regional");

    if (!analyzedSales || analyzedSales.length === 0) {
        // Destroy existing chart instances to avoid memory leaks/errors
        if (charts.distribution) { charts.distribution.destroy(); charts.distribution = null; }
        if (charts.products) { charts.products.destroy(); charts.products = null; }
        if (charts.regional) { charts.regional.destroy(); charts.regional = null; }

        const emptyMessage = `
            <div class="empty-chart-state" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 250px; color: var(--text-muted); gap: 12px; text-align: center; padding: 20px;">
                <i data-lucide="bar-chart-3" style="width: 36px; height: 36px; color: var(--text-muted); opacity: 0.6;"></i>
                <span style="font-size: 13px; font-weight: 500;">Aguardando carregamento de notas fiscais...</span>
            </div>
        `;

        if (distributionContainer) distributionContainer.innerHTML = emptyMessage;
        if (productsContainer) productsContainer.innerHTML = emptyMessage;
        if (regionalContainer) regionalContainer.innerHTML = emptyMessage;

        lucide.createIcons();
        return;
    }

    // Compute aggregation data
    let currentTaxesSum = { pis: 0, cofins: 0, icms: 0, iss: 0, ipi: 0 };
    let newTaxesSum = { cbs: 0, ibs: 0, pis: 0, cofins: 0, icms: 0, iss: 0, ipi: 0 };

    // Regional data grouping
    let regionalMap = {};
    // Product data grouping
    let productMap = {};

    analyzedSales.forEach(sale => {
        currentTaxesSum.pis += sale.pis_atual || 0;
        currentTaxesSum.cofins += sale.cofins_atual || 0;
        currentTaxesSum.icms += sale.icms_atual || 0;
        currentTaxesSum.iss += sale.iss_atual || 0;
        currentTaxesSum.ipi += sale.ipi_atual || 0;

        newTaxesSum.cbs += sale.tax_cbs || 0;
        newTaxesSum.ibs += sale.tax_ibs || 0;
        newTaxesSum.pis += sale.tax_pis_res || 0;
        newTaxesSum.cofins += sale.tax_cofins_res || 0;
        newTaxesSum.icms += sale.tax_icms_res || 0;
        newTaxesSum.iss += sale.tax_iss_res || 0;
        newTaxesSum.ipi += sale.tax_ipi_res || 0;

        // Region (UF destino)
        const uf = sale.uf_destino || "Indefinido";
        if (!regionalMap[uf]) {
            regionalMap[uf] = { current: 0, next: 0 };
        }
        regionalMap[uf].current += sale.tax_current;
        regionalMap[uf].next += sale.tax_new;

        // Product
        const pName = sale.produto_nome;
        if (!productMap[pName]) {
            productMap[pName] = { current: 0, next: 0, value: 0 };
        }
        productMap[pName].current += sale.tax_current;
        productMap[pName].next += sale.tax_new;
        productMap[pName].value += sale.valor_total;
    });

    // Chart 1: Distribution comparison (Current breakdown vs CBS/IBS)
    const optionsDistribution = {
        series: [
            {
                name: 'Tributos Atuais',
                data: [
                    { x: 'PIS', y: Math.round(currentTaxesSum.pis) },
                    { x: 'COFINS', y: Math.round(currentTaxesSum.cofins) },
                    { x: 'ICMS', y: Math.round(currentTaxesSum.icms) },
                    { x: 'ISS', y: Math.round(currentTaxesSum.iss) },
                    { x: 'IPI', y: Math.round(currentTaxesSum.ipi) }
                ]
            },
            {
                name: 'Tributos Propostos (Reforma)',
                data: [
                    { x: 'CBS (Federal)', y: Math.round(newTaxesSum.cbs) },
                    { x: 'IBS (Est/Mun)', y: Math.round(newTaxesSum.ibs) },
                    { x: 'PIS (Residual)', y: Math.round(newTaxesSum.pis) },
                    { x: 'COFINS (Residual)', y: Math.round(newTaxesSum.cofins) },
                    { x: 'ICMS (Residual)', y: Math.round(newTaxesSum.icms) },
                    { x: 'ISS (Residual)', y: Math.round(newTaxesSum.iss) },
                    { x: 'IPI (Residual)', y: Math.round(newTaxesSum.ipi) }
                ].filter(item => item.y > 0 || item.x === 'CBS (Federal)' || item.x === 'IBS (Est/Mun)')
            }
        ],
        chart: {
            type: 'bar',
            height: 320,
            background: 'transparent',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: false,
                barHeight: '70%'
            }
        },
        colors: ['#475569', '#6366f1'],
        theme: {
            mode: isLight ? 'light' : 'dark'
        },
        grid: {
            borderColor: gridColor,
            xaxis: { lines: { show: true } }
        },
        xaxis: {
            labels: {
                style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans' },
                formatter: function (val) { return 'R$ ' + val; }
            }
        },
        yaxis: {
            labels: {
                style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans' }
            }
        },
        tooltip: {
            theme: isLight ? 'light' : 'dark',
            y: { formatter: function (val) { return 'R$ ' + val.toLocaleString('pt-BR'); } }
        }
    };

    if (charts.distribution) {
        charts.distribution.updateOptions(optionsDistribution);
    } else {
        if (distributionContainer) distributionContainer.innerHTML = "";
        charts.distribution = new ApexCharts(distributionContainer, optionsDistribution);
        charts.distribution.render();
    }

    // Chart 2: Product impact (Top 6 products by volume)
    const topProducts = Object.entries(productMap)
        .sort((a, b) => b[1].value - a[1].value)
        .slice(0, 6);

    const productNames = topProducts.map(p => p[0]);
    const prodTaxCurrent = topProducts.map(p => Math.round(p[1].current));
    const prodTaxNew = topProducts.map(p => Math.round(p[1].next));

    const optionsProducts = {
        series: [
            { name: 'Carga Tributária Atual', data: prodTaxCurrent },
            { name: 'Carga Tributária Nova', data: prodTaxNew }
        ],
        chart: {
            type: 'bar',
            height: 320,
            background: 'transparent',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '55%',
                borderRadius: 4
            }
        },
        colors: ['#a855f7', '#06b6d4'],
        theme: { mode: isLight ? 'light' : 'dark' },
        grid: { borderColor: gridColor },
        xaxis: {
            categories: productNames,
            labels: {
                rotate: -30,
                trim: true,
                maxHeight: 60,
                style: { colors: labelColor, fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }
            }
        },
        yaxis: {
            title: { text: 'Valor em R$', style: { color: labelColor } },
            labels: { style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans' } }
        },
        tooltip: {
            theme: isLight ? 'light' : 'dark',
            y: { formatter: function (val) { return 'R$ ' + val.toLocaleString('pt-BR'); } }
        }
    };

    if (charts.products) {
        charts.products.updateOptions(optionsProducts);
    } else {
        if (productsContainer) productsContainer.innerHTML = "";
        charts.products = new ApexCharts(productsContainer, optionsProducts);
        charts.products.render();
    }

    // Chart 3: Regional analysis (UF breakdown)
    const sortedUF = Object.entries(regionalMap).sort((a, b) => b[1].current - a[1].current);
    const categoriesUF = sortedUF.map(u => u[0]);
    const ufCurrent = sortedUF.map(u => Math.round(u[1].current));
    const ufNew = sortedUF.map(u => Math.round(u[1].next));

    const optionsRegional = {
        series: [
            { name: 'Carga Atual', data: ufCurrent },
            { name: 'Carga Nova Projeção', data: ufNew }
        ],
        chart: {
            type: 'area',
            height: 280,
            background: 'transparent',
            toolbar: { show: false }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#64748b', '#10b981'],
        theme: { mode: isLight ? 'light' : 'dark' },
        grid: { borderColor: gridColor },
        xaxis: {
            categories: categoriesUF,
            labels: { style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans' } }
        },
        yaxis: {
            labels: { style: { colors: labelColor, fontFamily: 'Plus Jakarta Sans' } }
        },
        tooltip: {
            theme: isLight ? 'light' : 'dark',
            y: { formatter: function (val) { return 'R$ ' + val.toLocaleString('pt-BR'); } }
        }
    };

    if (charts.regional) {
        charts.regional.updateOptions(optionsRegional);
    } else {
        if (regionalContainer) regionalContainer.innerHTML = "";
        charts.regional = new ApexCharts(regionalContainer, optionsRegional);
        charts.regional.render();
    }
}

// Table rendering with search & sorting
function renderTable() {
    const query = tableSearch.value.toLowerCase().trim();
    
    // Filtering
    let filtered = analyzedSales.filter(sale => {
        const prodMatch = String(sale.produto_nome).toLowerCase().includes(query);
        const ncmMatch = String(sale.ncm_codigo).includes(query);
        return prodMatch || ncmMatch;
    });

    // Sorting
    filtered.sort((a, b) => {
        let valA = a[activeSortColumn];
        let valB = b[activeSortColumn];

        if (typeof valA === 'string') {
            return activeSortDirection === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        } else {
            return activeSortDirection === 'asc' 
                ? valA - valB 
                : valB - valA;
        }
    });

    // Build rows HTML
    tableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--text-muted);">Nenhum item localizado na base ativa.</td></tr>`;
        return;
    }

    filtered.forEach(sale => {
        const tr = document.createElement('tr');
        const diffSymbol = sale.tax_diff > 0.05 ? '+' : '';
        const diffClass = sale.tax_diff > 0.05 ? 'kpi-trend positive' : sale.tax_diff < -0.05 ? 'kpi-trend negative' : '';
        const saleIndex = analyzedSales.indexOf(sale);

        tr.innerHTML = `
            <td>#${sale.id_nfe}</td>
            <td style="text-align: center;">
                <button class="btn-table-action" onclick="simulateRow(${saleIndex})" title="Carregar no Simulador">
                    <i data-lucide="play"></i>
                </button>
            </td>
            <td style="font-weight: 500; color: var(--text-primary);">${sale.produto_nome}</td>
            <td><code>${sale.ncm_codigo}</code></td>
            <td><span class="badge-uf">${sale.uf_destino}</span></td>
            <td>${formatCurrency(sale.valor_total)}</td>
            <td>${formatCurrency(sale.tax_current)}</td>
            <td>${formatCurrency(sale.tax_new)}</td>
            <td class="${diffClass}">${diffSymbol}${formatCurrency(sale.tax_diff)}</td>
            <td><span class="badge ${sale.badge_class}">${sale.status_regra}</span></td>
        `;
        tableBody.appendChild(tr);
    });

    // Recreate icons inside dynamically rendered table rows
    lucide.createIcons();
}

function updateSingleSimulator(saleOverride = null) {
    const name = simProductName.value;
    const ncm = simNcm.value;
    const totalVal = parseFloat(simValue.value) || 0;
    const ruleTypeSelect = simRuleType.value;

    const cbsStd = parseFloat(cbsSlider.value) / 100;
    const ibsStd = parseFloat(ibsSlider.value) / 100;
    const yearRules = YEAR_TRANSITION_RULES[currentYear];

    // Retrieve breakdown of current taxes
    let pisVal = 0, cofinsVal = 0, icmsVal = 0, issVal = 0, ipiVal = 0;
    let foundMatch = false;

    let targetSale = saleOverride;
    if (!targetSale && activeSimulatedSale) {
        if (activeSimulatedSale.produto_nome === name && activeSimulatedSale.ncm_codigo === ncm) {
            targetSale = activeSimulatedSale;
        }
    }

    if (targetSale) {
        const scale = targetSale.valor_total > 0 ? (totalVal / targetSale.valor_total) : 1;
        pisVal = (targetSale.pis_atual || 0) * scale;
        cofinsVal = (targetSale.cofins_atual || 0) * scale;
        icmsVal = (targetSale.icms_atual || 0) * scale;
        issVal = (targetSale.iss_atual || 0) * scale;
        ipiVal = (targetSale.ipi_atual || 0) * scale;
        foundMatch = true;
    } else if (analyzedSales && analyzedSales.length > 0) {
        const cleanNcm = String(ncm || "").replace(/\D/g, "");
        const match = analyzedSales.find(s => 
            (cleanNcm && s.ncm_codigo === cleanNcm) || 
            (name && String(s.produto_nome).toLowerCase().trim() === String(name).toLowerCase().trim())
        );
        if (match) {
            const scale = match.valor_total > 0 ? (totalVal / match.valor_total) : 1;
            pisVal = (match.pis_atual || 0) * scale;
            cofinsVal = (match.cofins_atual || 0) * scale;
            icmsVal = (match.icms_atual || 0) * scale;
            issVal = (match.iss_atual || 0) * scale;
            ipiVal = (match.ipi_atual || 0) * scale;
            foundMatch = true;
        }
    }

    if (!foundMatch) {
        if (ruleTypeSelect === 'isento') {
            // all 0
        } else if (ruleTypeSelect === 'reducao_60') {
            icmsVal = totalVal * 0.12; // 12% standard reduced
        } else {
            pisVal = totalVal * 0.0165;
            cofinsVal = totalVal * 0.0760;
            icmsVal = totalVal * 0.1500;
        }
    }

    const currentTax = pisVal + cofinsVal + icmsVal + issVal + ipiVal;
    const valorLiquido = Math.max(0, totalVal - currentTax);
    
    // Calculate CBS & IBS values based on the year rules
    const cbsFactor = ruleTypeSelect === 'isento' ? 0.0 : (ruleTypeSelect === 'reducao_60' ? 0.4 : 1.0);
    const ibsFactor = ruleTypeSelect === 'isento' ? 0.0 : (ruleTypeSelect === 'reducao_60' ? 0.4 : 1.0);
    
    const cbsRate = yearRules.cbsRateFunc(cbsStd) * cbsFactor;
    const ibsRate = yearRules.ibsRateFunc(ibsStd) * ibsFactor;
    
    const simCbs = valorLiquido * cbsRate;
    const simIbs = valorLiquido * ibsRate;
    const simCbsIbsSum = simCbs + simIbs;

    // Calculate residual taxes for this year
    const pisCofinsRes = (pisVal + cofinsVal) * yearRules.residualPisCofinsPct;
    
    // Check if the simulated item has ZFM origin/destination or if its NCM belongs to a matching row that is ZFM
    let isZFM = false;
    if (analyzedSales && analyzedSales.length > 0) {
        const cleanNcm = String(ncm || "").replace(/\D/g, "");
        const match = analyzedSales.find(s => 
            (cleanNcm && s.ncm_codigo === cleanNcm) || 
            (name && String(s.produto_nome).toLowerCase().trim() === String(name).toLowerCase().trim())
        );
        if (match) {
            isZFM = match.uf_origem === 'AM' || match.uf_destino === 'AM';
        }
    }
    const ipiRes = ipiVal * (isZFM ? 1.0 : yearRules.residualIpiPct);
    const issRes = issVal * yearRules.residualIcmsIssPct;

    // ICMS calculation considering PIS/COFINS extinction and ICMS "por dentro" gross-up (MGK Method)
    let nominalIcmsRate = 0.18;
    const vBasePiscofinsExIcms = totalVal - pisVal - cofinsVal;
    if (icmsVal > 0 && vBasePiscofinsExIcms > 0) {
        nominalIcmsRate = Math.min(0.35, Math.max(0.04, icmsVal / vBasePiscofinsExIcms));
    }
    const effectiveIcmsRate = nominalIcmsRate * yearRules.residualIcmsIssPct;

    let simIcmsFisco = 0;
    let simIcmsContrib = 0;

    if (effectiveIcmsRate > 0) {
        if (yearRules.residualPisCofinsPct === 0) {
            // Post 2027: PIS/COFINS extintos. Recálculo da base por dentro sobre a receita líquida alvo (valorLiquido)
            // Tese do Fisco (RC SEFAZ/SP 32.303/2025): IBS e CBS integram a base do ICMS
            const vProdFisco = (valorLiquido + effectiveIcmsRate * simCbsIbsSum) / (1 - effectiveIcmsRate);
            simIcmsFisco = (vProdFisco + simCbsIbsSum) * effectiveIcmsRate;

            // Tese do Contribuinte (PLP 16/2025): IBS e CBS NÃO integram a base do ICMS
            const vProdContrib = valorLiquido / (1 - effectiveIcmsRate);
            simIcmsContrib = vProdContrib * effectiveIcmsRate;
        } else {
            simIcmsFisco = icmsVal * yearRules.residualIcmsIssPct;
            simIcmsContrib = icmsVal * yearRules.residualIcmsIssPct;
        }
    }

    const simIcmsRes = (legalThesis === 'fisco') ? simIcmsFisco : simIcmsContrib;
    const simContingency = simIcmsFisco - simIcmsContrib;

    // Final tax burden for the year
    let newTax;
    if (yearRules.neutralized) {
        newTax = currentTax;
    } else {
        newTax = simCbs + simIbs + pisCofinsRes + ipiRes + simIcmsRes + issRes;
    }

    const diff = newTax - currentTax;
    const diffPct = currentTax > 0 ? (diff / currentTax) * 100 : 0;

    // Update Simulator Card summary
    const summaryCardYearEl = document.getElementById('summary-card-year');
    if (summaryCardYearEl) summaryCardYearEl.textContent = currentYear;

    if (simTaxCurrentEl) simTaxCurrentEl.textContent = formatCurrency(currentTax);
    if (simTaxCbsEl) simTaxCbsEl.textContent = formatCurrency(simCbs);
    if (simTaxIbsEl) simTaxIbsEl.textContent = formatCurrency(simIbs);
    if (simTaxNewEl) simTaxNewEl.textContent = formatCurrency(newTax);

    // Dynamic Pill Tags for System Comparison
    const pillsCurrentEl = document.getElementById('sim-pills-current');
    if (pillsCurrentEl) {
        let currentPillsHTML = '';
        if (pisVal > 0) currentPillsHTML += `<span class="tax-pill warning">PIS: ${formatCurrency(pisVal)}</span>`;
        if (cofinsVal > 0) currentPillsHTML += `<span class="tax-pill warning">COFINS: ${formatCurrency(cofinsVal)}</span>`;
        if (icmsVal > 0) currentPillsHTML += `<span class="tax-pill warning">ICMS: ${formatCurrency(icmsVal)}</span>`;
        if (issVal > 0) currentPillsHTML += `<span class="tax-pill warning">ISS: ${formatCurrency(issVal)}</span>`;
        if (ipiVal > 0) currentPillsHTML += `<span class="tax-pill warning">IPI: ${formatCurrency(ipiVal)}</span>`;
        if (!currentPillsHTML) currentPillsHTML = `<span class="tax-pill muted">Isento / Sem retenção</span>`;
        pillsCurrentEl.innerHTML = currentPillsHTML;
    }

    const pillsNewEl = document.getElementById('sim-pills-new');
    if (pillsNewEl) {
        let newPillsHTML = '';
        if (simCbs > 0) newPillsHTML += `<span class="tax-pill primary">CBS (${(cbsRate * 100).toFixed(1)}%): ${formatCurrency(simCbs)}</span>`;
        if (simIbs > 0) newPillsHTML += `<span class="tax-pill accent">IBS (${(ibsRate * 100).toFixed(1)}%): ${formatCurrency(simIbs)}</span>`;
        if (pisCofinsRes > 0) newPillsHTML += `<span class="tax-pill warning">PIS/COF Res.: ${formatCurrency(pisCofinsRes)}</span>`;
        if (simIcmsRes > 0) newPillsHTML += `<span class="tax-pill warning">ICMS Res.: ${formatCurrency(simIcmsRes)}</span>`;
        if (issRes > 0) newPillsHTML += `<span class="tax-pill warning">ISS Res.: ${formatCurrency(issRes)}</span>`;
        if (ipiRes > 0) newPillsHTML += `<span class="tax-pill warning">IPI Res.: ${formatCurrency(ipiRes)}</span>`;
        pillsNewEl.innerHTML = newPillsHTML;
    }

    const elThesisFisco = document.getElementById('sim-val-thesis-fisco');
    const elThesisContrib = document.getElementById('sim-val-thesis-contrib');
    const elContingencyItem = document.getElementById('sim-val-contingency-item');
    const elThesisDiff = document.getElementById('sim-val-thesis-diff');

    if (elThesisFisco) elThesisFisco.textContent = formatCurrency(simIcmsFisco);
    if (elThesisContrib) elThesisContrib.textContent = formatCurrency(simIcmsContrib);
    if (elContingencyItem) elContingencyItem.textContent = formatCurrency(simContingency);
    if (elThesisDiff) elThesisDiff.textContent = formatCurrency(simContingency);

    // Update Waterfall Stepper (Memória de Cálculo Passo a Passo)
    const simCalcStepsEl = document.getElementById('sim-calc-steps');
    if (simCalcStepsEl) {
        let stepsHTML = `
            <div class="stepper-header">
                <div class="stepper-header-title">
                    <i data-lucide="calculator" style="width: 15px; height: 15px; color: var(--primary);"></i>
                    Memória de Cálculo (${currentYear})
                </div>
                <span class="badge ${legalThesis === 'fisco' ? 'badge-warning' : 'badge-success'}" style="font-size: 10px; font-weight: 700;">
                    ${legalThesis === 'fisco' ? 'Tese Fisco' : 'Tese Contribuinte'}
                </span>
            </div>
            
            <!-- Step 1: Valor Bruto -->
            <div class="stepper-row">
                <div class="stepper-label">
                    <span class="stepper-num">1</span>
                    <span>Valor Total Bruto do Item</span>
                </div>
                <div class="stepper-val" style="color: var(--text-primary);">${formatCurrency(totalVal)}</div>
            </div>

            <!-- Step 2: (-) Impostos Atuais Descontados -->
            <div class="stepper-row highlight-subtle" style="flex-direction: column; align-items: stretch; gap: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div class="stepper-label">
                        <span class="stepper-num" style="background: rgba(234, 179, 8, 0.2); color: #facc15;">2</span>
                        <span style="font-weight: 600; color: var(--warning);">(-) Carga Tributária Atual Descontada</span>
                    </div>
                    <div class="stepper-val" style="color: var(--warning);">- ${formatCurrency(currentTax)}</div>
                </div>
                <details style="margin-left: 24px; font-size: 11px;">
                    <summary class="stepper-details-summary">
                        <span>Ver detalhamento dos impostos atuais</span>
                    </summary>
                    <div style="margin-top: 6px; padding: 6px 10px; background: rgba(0, 0, 0, 0.25); border-radius: 6px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 3px;">
                        <div style="display: flex; justify-content: space-between;"><span>• PIS:</span><span style="white-space: nowrap; font-weight: 600;">${formatCurrency(pisVal)}</span></div>
                        <div style="display: flex; justify-content: space-between;"><span>• COFINS:</span><span style="white-space: nowrap; font-weight: 600;">${formatCurrency(cofinsVal)}</span></div>
                        <div style="display: flex; justify-content: space-between;"><span>• ICMS:</span><span style="white-space: nowrap; font-weight: 600;">${formatCurrency(icmsVal)}</span></div>
                        <div style="display: flex; justify-content: space-between;"><span>• ISS:</span><span style="white-space: nowrap; font-weight: 600;">${formatCurrency(issVal)}</span></div>
                        <div style="display: flex; justify-content: space-between;"><span>• IPI:</span><span style="white-space: nowrap; font-weight: 600;">${formatCurrency(ipiVal)}</span></div>
                    </div>
                </details>
            </div>

            <!-- Step 3: Base Líquida -->
            <div class="stepper-row" style="border-bottom: 1px dashed var(--border-color); padding-bottom: 8px; margin-bottom: 4px;">
                <div class="stepper-label">
                    <span class="stepper-num">3</span>
                    <span style="font-weight: 600; color: var(--text-primary);">(=) Base de Cálculo Líquida do Produto</span>
                </div>
                <div class="stepper-val" style="color: var(--text-primary); font-size: 13px;">${formatCurrency(valorLiquido)}</div>
            </div>

            <!-- Step 4: (+) CBS -->
            <div class="stepper-row">
                <div class="stepper-label">
                    <span class="stepper-num" style="background: rgba(99, 102, 241, 0.2); color: #818cf8;">4</span>
                    <span>(+) CBS Projetada (${(cbsRate * 100).toFixed(1)}%)</span>
                </div>
                <div class="stepper-val" style="color: var(--primary);">+ ${formatCurrency(simCbs)}</div>
            </div>

            <!-- Step 5: (+) IBS -->
            <div class="stepper-row">
                <div class="stepper-label">
                    <span class="stepper-num" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;">5</span>
                    <span>(+) IBS Projetado (${(ibsRate * 100).toFixed(1)}%)</span>
                </div>
                <div class="stepper-val" style="color: var(--accent);">+ ${formatCurrency(simIbs)}</div>
            </div>
        `;

        if (yearRules.neutralized) {
            stepsHTML += `
                <div class="stepper-row">
                    <div class="stepper-label">
                        <span class="stepper-num" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">6</span>
                        <span>(-) Compensação de Teste (Neutralizado)</span>
                    </div>
                    <div class="stepper-val" style="color: var(--success);">- ${formatCurrency(simCbs + simIbs)}</div>
                </div>
                <div class="stepper-row">
                    <div class="stepper-label">
                        <span class="stepper-num">7</span>
                        <span>(+) Impostos Vigentes em Teste (100%)</span>
                    </div>
                    <div class="stepper-val" style="color: var(--text-primary);">+ ${formatCurrency(currentTax)}</div>
                </div>
            `;
        } else {
            let stepNum = 6;
            if (pisCofinsRes > 0) {
                stepsHTML += `
                    <div class="stepper-row">
                        <div class="stepper-label">
                            <span class="stepper-num">${stepNum}</span>
                            <span>(+) PIS/COFINS Residuais (${(yearRules.residualPisCofinsPct * 100).toFixed(0)}%)</span>
                        </div>
                        <div class="stepper-val" style="color: var(--text-primary);">+ ${formatCurrency(pisCofinsRes)}</div>
                    </div>
                `;
                stepNum++;
            }
            if (ipiRes > 0) {
                const isZFMText = isZFM ? " (Preservado ZFM)" : ` (${(yearRules.residualIpiPct * 100).toFixed(0)}%)`;
                stepsHTML += `
                    <div class="stepper-row">
                        <div class="stepper-label">
                            <span class="stepper-num">${stepNum}</span>
                            <span>(+) IPI Residual${isZFMText}</span>
                        </div>
                        <div class="stepper-val" style="color: var(--text-primary);">+ ${formatCurrency(ipiRes)}</div>
                    </div>
                `;
                stepNum++;
            }
            if (simIcmsRes > 0) {
                const thesisNote = legalThesis === 'fisco' ? ' (com IBS/CBS na base)' : ' (sem IBS/CBS na base)';
                stepsHTML += `
                    <div class="stepper-row">
                        <div class="stepper-label">
                            <span class="stepper-num" style="background: rgba(234, 179, 8, 0.2); color: #facc15;">${stepNum}</span>
                            <span>(+) ICMS Residual (${(effectiveIcmsRate * 100).toFixed(1)}% por dentro)${thesisNote}</span>
                        </div>
                        <div class="stepper-val" style="color: var(--warning);">+ ${formatCurrency(simIcmsRes)}</div>
                    </div>
                `;
                stepNum++;
            }
            if (issRes > 0) {
                stepsHTML += `
                    <div class="stepper-row">
                        <div class="stepper-label">
                            <span class="stepper-num">${stepNum}</span>
                            <span>(+) ISS Residual (${(yearRules.residualIcmsIssPct * 100).toFixed(0)}%)</span>
                        </div>
                        <div class="stepper-val" style="color: var(--text-primary);">+ ${formatCurrency(issRes)}</div>
                    </div>
                `;
                stepNum++;
            }
        }

        stepsHTML += `
            <!-- Final Step: Carga Efetiva -->
            <div class="stepper-row highlight-total">
                <div class="stepper-label">
                    <i data-lucide="check-circle-2" style="width: 16px; height: 16px; color: var(--primary);"></i>
                    <span style="font-weight: 800; font-size: 13px; color: var(--text-primary);">(=) Carga Efetiva no Ano (${currentYear})</span>
                </div>
                <div class="stepper-val" style="font-size: 15px; font-weight: 800; color: var(--primary);">${formatCurrency(newTax)}</div>
            </div>
        `;
        simCalcStepsEl.innerHTML = stepsHTML;
        if (window.lucide) window.lucide.createIcons();
    }

    simImpactVal.textContent = (diff >= 0 ? '+' : '') + formatCurrency(diff);
    
    if (diff > 0.05) {
        simImpactVal.className = 'sim-impact-value increase';
        simImpactPct.textContent = `(+${diffPct.toFixed(2)}% de aumento)`;
        simImpactPct.style.color = 'var(--danger)';
    } else if (diff < -0.05) {
        simImpactVal.className = 'sim-impact-value decrease';
        simImpactPct.textContent = `(${diffPct.toFixed(2)}% de redução)`;
        simImpactPct.style.color = 'var(--success)';
    } else {
        simImpactVal.className = 'sim-impact-value neutral';
        simImpactPct.textContent = '(Sem variação de carga)';
        simImpactPct.style.color = 'var(--text-muted)';
    }

    // Update changes summary card
    const summaryYearEl = document.getElementById('summary-year');
    const summaryDetailsTextEl = document.getElementById('summary-details-text');
    const compPisCofinsEl = document.getElementById('comparison-pis-cofins');
    const compIpiEl = document.getElementById('comparison-ipi');
    const compIcmsIssEl = document.getElementById('comparison-icms-iss');
    const compCbsEl = document.getElementById('comparison-cbs');
    const compIbsEl = document.getElementById('comparison-ibs');

    if (summaryYearEl) summaryYearEl.textContent = currentYear;
    if (summaryDetailsTextEl) summaryDetailsTextEl.textContent = yearRules.description;
    
    if (compPisCofinsEl) {
        compPisCofinsEl.textContent = yearRules.pisCofins;
        compPisCofinsEl.className = 'badge ' + yearRules.pisCofinsClass;
    }
    if (compIpiEl) {
        compIpiEl.textContent = yearRules.ipi;
        compIpiEl.className = 'badge ' + yearRules.ipiClass;
    }
    if (compIcmsIssEl) {
        let text = yearRules.icmsIss;
        if (currentYear >= 2029 && currentYear <= 2032) {
            text = `Reduzido a ${(yearRules.residualIcmsIssPct * 100).toFixed(0)}% (Transição)`;
        }
        compIcmsIssEl.textContent = text;
        compIcmsIssEl.className = 'badge ' + yearRules.icmsIssClass;
    }
    if (compCbsEl) {
        let text = yearRules.cbs;
        if (currentYear === 2026) {
            text = "Teste (0.9% Compensado)";
        } else if (currentYear === 2027 || currentYear === 2028) {
            text = `Efetivo (${(cbsRate * 100).toFixed(1)}% Cobrado)`;
        } else {
            text = `Vigente (${(cbsRate * 100).toFixed(1)}% Cheio)`;
        }
        compCbsEl.textContent = text;
        compCbsEl.className = 'badge ' + yearRules.cbsClass;
    }
    if (compIbsEl) {
        let text = yearRules.ibs;
        if (currentYear === 2026) {
            text = "Teste (0.1% Compensado)";
        } else if (currentYear === 2027 || currentYear === 2028) {
            text = `Efetivo (0.1% Inicial)`;
        } else if (currentYear >= 2029 && currentYear <= 2032) {
            const factorPct = (currentYear - 2028) * 10;
            text = `Vigente (${factorPct}% = ${(ibsRate * 100).toFixed(2)}%)`;
        } else {
            text = `Vigente (${(ibsRate * 100).toFixed(1)}% Cheio)`;
        }
        compIbsEl.textContent = text;
        compIbsEl.className = 'badge ' + yearRules.ibsClass;
    }

    // Update Multi-Year Transition Matrix (inspired by NFe Item transition table)
    updateMultiyearMatrix(name, ncm, totalVal, ruleTypeSelect, targetSale);

    // Recreate icons in simulation breakdown
    lucide.createIcons();
}

function updateMultiyearMatrix(name, ncm, totalVal, ruleTypeSelect, targetSale = null) {
    const multiyearNcm = document.getElementById('multiyear-ncm');
    const multiyearName = document.getElementById('multiyear-name');
    const multiyearCfop = document.getElementById('multiyear-cfop');
    const multiyearVal = document.getElementById('multiyear-val');
    const tbody = document.getElementById('multiyear-table-body');

    if (!tbody) return;

    const cbsStd = parseFloat(cbsSlider.value) / 100;
    const ibsStd = parseFloat(ibsSlider.value) / 100;
    const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

    const matrix = {
        icms: years.map(() => 0),
        ibs: years.map(() => 0),
        pis: years.map(() => 0),
        cofins: years.map(() => 0),
        cbs: years.map(() => 0),
        ipi: years.map(() => 0),
        is: years.map(() => 0),
        ii: years.map(() => 0),
        total: years.map(() => 0)
    };

    if (multiyearMode === 'item') {
        // Format NCM display
        let cleanNcmDisplay = String(ncm || "84713012").replace(/\D/g, "");
        if (cleanNcmDisplay.length === 8) {
            cleanNcmDisplay = `${cleanNcmDisplay.slice(0,4)}.${cleanNcmDisplay.slice(4,6)}.${cleanNcmDisplay.slice(6,8)}`;
        }
        if (multiyearNcm) multiyearNcm.textContent = cleanNcmDisplay || "8471.30.12";
        if (multiyearName) multiyearName.textContent = name || "Produto / Serviço";
        if (multiyearVal) multiyearVal.textContent = formatCurrency(totalVal);
        
        if (multiyearCfop) {
            if (targetSale && targetSale.id_nfe) {
                const ufText = (targetSale.uf_origem && targetSale.uf_destino) ? ` (${targetSale.uf_origem}->${targetSale.uf_destino})` : '';
                multiyearCfop.textContent = `${targetSale.id_nfe}${ufText}`;
            } else {
                multiyearCfop.textContent = "CFOP: 5101";
            }
        }

        // Retrieve initial taxes
        let pisVal = 0, cofinsVal = 0, icmsVal = 0, issVal = 0, ipiVal = 0;
        let foundMatch = false;

        if (targetSale) {
            const scale = targetSale.valor_total > 0 ? (totalVal / targetSale.valor_total) : 1;
            pisVal = (targetSale.pis_atual || 0) * scale;
            cofinsVal = (targetSale.cofins_atual || 0) * scale;
            icmsVal = (targetSale.icms_atual || 0) * scale;
            issVal = (targetSale.iss_atual || 0) * scale;
            ipiVal = (targetSale.ipi_atual || 0) * scale;
            foundMatch = true;
        } else if (analyzedSales && analyzedSales.length > 0) {
            const cleanNcm = String(ncm || "").replace(/\D/g, "");
            const match = analyzedSales.find(s => 
                (cleanNcm && s.ncm_codigo === cleanNcm) || 
                (name && String(s.produto_nome).toLowerCase().trim() === String(name).toLowerCase().trim())
            );
            if (match) {
                const scale = match.valor_total > 0 ? (totalVal / match.valor_total) : 1;
                pisVal = (match.pis_atual || 0) * scale;
                cofinsVal = (match.cofins_atual || 0) * scale;
                icmsVal = (match.icms_atual || 0) * scale;
                issVal = (match.iss_atual || 0) * scale;
                ipiVal = (match.ipi_atual || 0) * scale;
                foundMatch = true;
            }
        }

        if (!foundMatch) {
            if (ruleTypeSelect === 'isento') {
                // all 0
            } else if (ruleTypeSelect === 'reducao_60') {
                icmsVal = totalVal * 0.12;
            } else {
                pisVal = totalVal * 0.0165;
                cofinsVal = totalVal * 0.0760;
                icmsVal = totalVal * 0.1500;
            }
        }

        const currentTax = pisVal + cofinsVal + icmsVal + issVal + ipiVal;
        const baseValue = Math.max(0, totalVal - currentTax);

        const cbsFactor = ruleTypeSelect === 'isento' ? 0.0 : (ruleTypeSelect === 'reducao_60' ? 0.4 : 1.0);
        const ibsFactor = ruleTypeSelect === 'isento' ? 0.0 : (ruleTypeSelect === 'reducao_60' ? 0.4 : 1.0);

        let isZFM = false;
        if (targetSale) {
            isZFM = targetSale.uf_origem === 'AM' || targetSale.uf_destino === 'AM';
        }

        let nominalIcmsRate = 0.18;
        const vBasePiscofinsExIcms = totalVal - pisVal - cofinsVal;
        if (icmsVal > 0 && vBasePiscofinsExIcms > 0) {
            nominalIcmsRate = Math.min(0.35, Math.max(0.04, icmsVal / vBasePiscofinsExIcms));
        }

        years.forEach((y, idx) => {
            const yRules = YEAR_TRANSITION_RULES[y];

            const cbsRate = yRules.cbsRateFunc(cbsStd) * cbsFactor;
            const ibsRate = yRules.ibsRateFunc(ibsStd) * ibsFactor;

            const cbsValCalc = baseValue * cbsRate;
            const ibsValCalc = baseValue * ibsRate;
            const cbsIbsSum = cbsValCalc + ibsValCalc;

            const pisRes = pisVal * yRules.residualPisCofinsPct;
            const cofinsRes = cofinsVal * yRules.residualPisCofinsPct;
            const ipiRes = ipiVal * (isZFM ? 1.0 : yRules.residualIpiPct);
            const issRes = issVal * yRules.residualIcmsIssPct;

            const effectiveIcmsRate = nominalIcmsRate * yRules.residualIcmsIssPct;
            let icmsResFisco = 0;
            let icmsResContrib = 0;

            if (effectiveIcmsRate > 0) {
                if (yRules.residualPisCofinsPct === 0) {
                    const vProdFisco = (baseValue + effectiveIcmsRate * cbsIbsSum) / (1 - effectiveIcmsRate);
                    icmsResFisco = (vProdFisco + cbsIbsSum) * effectiveIcmsRate;

                    const vProdContrib = baseValue / (1 - effectiveIcmsRate);
                    icmsResContrib = vProdContrib * effectiveIcmsRate;
                } else {
                    icmsResFisco = icmsVal * yRules.residualIcmsIssPct;
                    icmsResContrib = icmsVal * yRules.residualIcmsIssPct;
                }
            }

            const icmsRes = (legalThesis === 'fisco') ? icmsResFisco : icmsResContrib;

            const isValCalc = 0;
            const iiValCalc = 0;

            let totalValYear = 0;
            if (yRules.neutralized) {
                totalValYear = currentTax;
            } else {
                totalValYear = icmsRes + ibsValCalc + pisRes + cofinsRes + cbsValCalc + ipiRes + isValCalc + iiValCalc + issRes;
            }

            matrix.icms[idx] = icmsRes;
            matrix.ibs[idx] = ibsValCalc;
            matrix.pis[idx] = pisRes;
            matrix.cofins[idx] = cofinsRes;
            matrix.cbs[idx] = cbsValCalc;
            matrix.ipi[idx] = ipiRes;
            matrix.is[idx] = isValCalc;
            matrix.ii[idx] = iiValCalc;
            matrix.total[idx] = totalValYear;
        });

    } else {
        // Mode === 'nfe' (Nota Fiscal Completa ou Consolidada)
        let itemsToProcess = [];
        if (multiyearTargetNfe === 'consolidado') {
            itemsToProcess = analyzedSales || [];
        } else {
            itemsToProcess = (analyzedSales || []).filter(s => String(s.id_nfe) === String(multiyearTargetNfe));
        }

        if (itemsToProcess.length === 0 && analyzedSales && analyzedSales.length > 0) {
            itemsToProcess = analyzedSales;
        }

        let totalNfeValue = 0;
        itemsToProcess.forEach(item => totalNfeValue += item.valor_total);

        // Update Header display for full NF-e
        if (multiyearNcm) {
            multiyearNcm.textContent = multiyearTargetNfe === 'consolidado' ? 'TODAS AS NFES' : String(multiyearTargetNfe).toUpperCase();
        }
        if (multiyearName) {
            multiyearName.textContent = multiyearTargetNfe === 'consolidado' 
                ? `Consolidado (${itemsToProcess.length} itens)`
                : `Nota Fiscal (${itemsToProcess.length} item${itemsToProcess.length > 1 ? 'ns' : ''})`;
        }
        if (multiyearVal) multiyearVal.textContent = formatCurrency(totalNfeValue);
        if (multiyearCfop) {
            const firstItem = itemsToProcess[0];
            const ufText = (firstItem && firstItem.uf_origem && firstItem.uf_destino) ? `${firstItem.uf_origem}->${firstItem.uf_destino}` : 'BR';
            multiyearCfop.textContent = `Operação: ${ufText}`;
        }

        // Aggregate calculations for each item across every year 2026..2033
        itemsToProcess.forEach(item => {
            const itemVal = item.valor_total;
            const itemPis = item.pis_atual || 0;
            const itemCofins = item.cofins_atual || 0;
            const itemIcms = item.icms_atual || 0;
            const itemIss = item.iss_atual || 0;
            const itemIpi = item.ipi_atual || 0;
            const itemTaxCurrent = itemPis + itemCofins + itemIcms + itemIss + itemIpi;
            const itemBaseLiquida = Math.max(0, itemVal - itemTaxCurrent);

            const rule = matchRule(item.ncm_codigo, item.produto_nome);
            let cbsFactor = 1.0;
            let ibsFactor = 1.0;

            if (rule) {
                if (rule.tipo_regra === 'isento') {
                    cbsFactor = 0.0;
                    ibsFactor = 0.0;
                } else if (rule.tipo_regra === 'reducao_60') {
                    cbsFactor = 0.4;
                    ibsFactor = 0.4;
                } else if (rule.tipo_regra === 'reducao_30') {
                    cbsFactor = 0.7;
                    ibsFactor = 0.7;
                }
            }

            const isZFM = item.uf_origem === 'AM' || item.uf_destino === 'AM';

            let nominalIcmsRate = 0.18;
            const vBasePiscofinsExIcms = itemVal - itemPis - itemCofins;
            if (itemIcms > 0 && vBasePiscofinsExIcms > 0) {
                nominalIcmsRate = Math.min(0.35, Math.max(0.04, itemIcms / vBasePiscofinsExIcms));
            }

            years.forEach((y, idx) => {
                const yRules = YEAR_TRANSITION_RULES[y];

                const cbsRate = yRules.cbsRateFunc(cbsStd) * cbsFactor;
                const ibsRate = yRules.ibsRateFunc(ibsStd) * ibsFactor;

                const cbsValCalc = itemBaseLiquida * cbsRate;
                const ibsValCalc = itemBaseLiquida * ibsRate;
                const cbsIbsSum = cbsValCalc + ibsValCalc;

                const pisRes = itemPis * yRules.residualPisCofinsPct;
                const cofinsRes = itemCofins * yRules.residualPisCofinsPct;
                const ipiRes = itemIpi * (isZFM ? 1.0 : yRules.residualIpiPct);
                const issRes = itemIss * yRules.residualIcmsIssPct;

                const effectiveIcmsRate = nominalIcmsRate * yRules.residualIcmsIssPct;
                let icmsResFisco = 0;
                let icmsResContrib = 0;

                if (effectiveIcmsRate > 0) {
                    if (yRules.residualPisCofinsPct === 0) {
                        const vProdFisco = (itemBaseLiquida + effectiveIcmsRate * cbsIbsSum) / (1 - effectiveIcmsRate);
                        icmsResFisco = (vProdFisco + cbsIbsSum) * effectiveIcmsRate;

                        const vProdContrib = itemBaseLiquida / (1 - effectiveIcmsRate);
                        icmsResContrib = vProdContrib * effectiveIcmsRate;
                    } else {
                        icmsResFisco = itemIcms * yRules.residualIcmsIssPct;
                        icmsResContrib = itemIcms * yRules.residualIcmsIssPct;
                    }
                }

                const icmsRes = (legalThesis === 'fisco') ? icmsResFisco : icmsResContrib;

                let totalValYear = 0;
                if (yRules.neutralized) {
                    totalValYear = itemTaxCurrent;
                } else {
                    totalValYear = icmsRes + ibsValCalc + pisRes + cofinsRes + cbsValCalc + ipiRes + issRes;
                }

                matrix.icms[idx] += icmsRes;
                matrix.ibs[idx] += ibsValCalc;
                matrix.pis[idx] += pisRes;
                matrix.cofins[idx] += cofinsRes;
                matrix.cbs[idx] += cbsValCalc;
                matrix.ipi[idx] += ipiRes;
                matrix.is[idx] += 0;
                matrix.ii[idx] += 0;
                matrix.total[idx] += totalValYear;
            });
        });
    }

    const rowsDef = [
        { label: 'ICMS', key: 'icms', className: 'row-icms', info: null },
        { label: 'IBS', key: 'ibs', className: 'row-ibs', info: 'Imposto sobre Bens e Serviços (Estadual/Municipal)' },
        { label: 'PIS', key: 'pis', className: 'row-pis', info: null },
        { label: 'COFINS', key: 'cofins', className: 'row-cofins', info: null },
        { label: 'CBS', key: 'cbs', className: 'row-cbs', info: 'Contribuição sobre Bens e Serviços (Federal)' },
        { label: 'IPI', key: 'ipi', className: 'row-ipi', info: 'Alíquota zero para a maioria das mercadorias a partir de 2027 (exceto ZFM)' },
        { label: 'IS', key: 'is', className: 'row-is', info: 'Imposto Seletivo (sobre produtos nocivos à saúde/meio ambiente)' },
        { label: 'II', key: 'ii', className: 'row-ii', info: 'Imposto de Importação' },
        { label: 'Total', key: 'total', className: 'row-total', info: null }
    ];

    let html = '';
    rowsDef.forEach(r => {
        html += `<tr class="${r.className}">`;
        
        let labelHTML = r.label;
        if (r.info) {
            labelHTML += ` <i data-lucide="info" title="${r.info}" class="info-tooltip-icon" style="width: 14px; height: 14px; vertical-align: middle; opacity: 0.7; cursor: help;"></i>`;
        }

        html += `<td style="font-weight: 700; text-align: left; padding-left: 16px;">${labelHTML}</td>`;

        years.forEach((y, idx) => {
            const val = matrix[r.key][idx];
            const isCurrentActiveYear = (y === currentYear);
            const activeYearClass = isCurrentActiveYear ? ' active-year-col' : '';
            html += `<td class="${activeYearClass}">${formatCurrency(val)}</td>`;
        });

        html += `</tr>`;
    });

    tbody.innerHTML = html;

    // Attach click events on year column headers to select year
    const thEls = document.querySelectorAll('#multiyear-table th');
    thEls.forEach((th, idx) => {
        if (idx > 0) {
            const yearNum = years[idx - 1];
            th.style.cursor = 'pointer';
            th.title = `Clique para alternar para o ano ${yearNum}`;
            if (yearNum === currentYear) {
                th.classList.add('active-year-th');
            } else {
                th.classList.remove('active-year-th');
            }

            th.onclick = () => {
                const btnYears = document.querySelectorAll('.btn-year');
                btnYears.forEach(b => {
                    if (b.getAttribute('data-year') === String(yearNum)) {
                        b.click();
                    }
                });
            };
        }
    });

    lucide.createIcons();
}

// Format regras_aliquotas.json display
function updateRulesDisplay() {
    jsonViewer.textContent = JSON.stringify(systemRules, null, 2);
}

// Helpers
function formatCurrency(val) {
    return 'R$ ' + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Safe float parsing with localization support (Brazilian & US formatting)
function parseFloatSafe(val, defaultVal) {
    if (val === null || val === undefined) return defaultVal;
    if (typeof val === 'number') return val;
    
    var str = String(val).trim();
    if (str === "") return defaultVal;
    
    // Remove currency indicators and spaces
    str = str.replace(/R\$\s*/gi, '').replace(/\s/g, '');
    
    var lastComma = str.lastIndexOf(',');
    var lastDot = str.lastIndexOf('.');
    
    if (lastComma !== -1 && lastDot !== -1) {
        if (lastComma > lastDot) {
            // Brazilian format: 1.234,56 -> 1234.56
            str = str.replace(/\./g, '').replace(',', '.');
        } else {
            // US format: 1,234.56 -> 1234.56
            str = str.replace(/,/g, '');
        }
    } else if (lastComma !== -1) {
        // Only comma decimal separator: 1234,56 -> 1234.56
        str = str.replace(',', '.');
    }
    
    var parsed = parseFloat(str);
    return isNaN(parsed) ? defaultVal : parsed;
}

// Dynamic row simulator trigger
function simulateRow(indexOrId) {
    let sale = null;
    if (typeof indexOrId === 'number' && indexOrId >= 0 && indexOrId < analyzedSales.length) {
        sale = analyzedSales[indexOrId];
    } else if (typeof indexOrId === 'string' && !isNaN(parseInt(indexOrId, 10)) && analyzedSales[parseInt(indexOrId, 10)]) {
        sale = analyzedSales[parseInt(indexOrId, 10)];
    } else {
        sale = analyzedSales.find(s => String(s.id_nfe) === String(indexOrId));
    }
    if (!sale) return;

    activeSimulatedSale = sale;

    // Fill in simulator fields
    simProductName.value = sale.produto_nome;
    simNcm.value = sale.ncm_codigo;
    simValue.value = sale.valor_total;

    // Auto-select rule type
    const rule = matchRule(sale.ncm_codigo, sale.produto_nome);
    if (rule) {
        simRuleType.value = rule.tipo_regra;
    } else {
        simRuleType.value = 'padrao';
    }

    // Smooth scroll to the simulator
    const simSection = document.getElementById('simulador-rapido');
    if (simSection) {
        simSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Calculate
    updateSingleSimulator(sale);

    // Highlight visual feedback
    const resultCard = document.querySelector('.sim-result-card');
    if (resultCard) {
        resultCard.style.boxShadow = '0 0 35px var(--primary-glow)';
        resultCard.style.borderColor = 'var(--primary)';
        
        setTimeout(() => {
            resultCard.style.boxShadow = '';
            resultCard.style.borderColor = '';
        }, 1500);
    }
}
window.simulateRow = simulateRow;

function exportSalesToExcel() {
    if (!analyzedSales || analyzedSales.length === 0) {
        alert('Nenhum dado disponível para exportação. Importe uma planilha primeiro.');
        return;
    }
    
    // Format headers and values for business presentation
    const dataToExport = analyzedSales.map(sale => ({
        'ID NFe': sale.id_nfe,
        'Data Emissão': sale.data_emissao,
        'UF Origem': sale.uf_origem,
        'UF Destino': sale.uf_destino,
        'NCM': sale.ncm_codigo,
        'Produto': sale.produto_nome,
        'Quantidade': sale.quantidade,
        'Valor Unitário (R$)': sale.valor_unitario,
        'Valor Total (R$)': sale.valor_total,
        'Tipo de Cliente': sale.tipo_cliente,
        'PIS Atual (R$)': sale.pis_atual || 0,
        'COFINS Atual (R$)': sale.cofins_atual || 0,
        'ICMS Atual (R$)': sale.icms_atual || 0,
        'ISS Atual (R$)': sale.iss_atual || 0,
        'IPI Atual (R$)': sale.ipi_atual || 0,
        'Carga Atual Total (R$)': sale.tax_current || 0,
        'CBS Projetada (R$)': sale.tax_cbs || 0,
        'IBS Projetado (R$)': sale.tax_ibs || 0,
        'PIS Residual (R$)': sale.tax_pis_res || 0,
        'COFINS Residual (R$)': sale.tax_cofins_res || 0,
        'ICMS Residual (R$)': sale.tax_icms_res || 0,
        'ICMS Tese Fisco (R$)': sale.tax_icms_fisco || 0,
        'ICMS Tese Contribuinte (R$)': sale.tax_icms_contrib || 0,
        'Contingência/Risco Fiscal (R$)': sale.tax_contingency || 0,
        'ISS Residual (R$)': sale.tax_iss_res || 0,
        'IPI Residual (R$)': sale.tax_ipi_res || 0,
        'Carga Nova Total (R$)': sale.tax_new || 0,
        'Impacto Líquido (R$)': sale.tax_diff || 0,
        'Cenário Jurídico Ativo': legalThesis === 'fisco' ? 'Tese Fisco (INCLUI IBS/CBS)' : 'Tese Contribuinte (EXCLUI IBS/CBS)',
        'Regra Aplicada': sale.status_regra
    }));

    try {
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Análise Tributária');
        
        // Save file
        XLSX.writeFile(workbook, `analise_reforma_tributaria_${currentYear}.xlsx`);
    } catch (e) {
        console.error('Erro ao exportar arquivo Excel:', e);
        alert('Ocorreu um erro ao gerar o arquivo Excel para download.');
    }
}
