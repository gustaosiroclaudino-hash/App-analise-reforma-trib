// Tax Reform Landing Page & Dashboard Application Logic

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

// Fallback Default Sales Database (contains vendas_exemplo.csv + expanded entries for premium dashboard presentation)
const DEFAULT_VENDAS = [
    { id_nfe: 1, data_emissao: "2026-07-01", uf_origem: "SP", uf_destino: "SP", ncm_codigo: "85171300", produto_nome: "Smartphone Android", quantidade: 2, valor_unitario: 1500.00, valor_total: 3000.00, tipo_cliente: "B2C", pis_atual: 49.50, cofins_atual: 228.00, icms_atual: 540.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 2, data_emissao: "2026-07-01", uf_origem: "SP", uf_destino: "RJ", ncm_codigo: "84713012", produto_nome: "Notebook Pro", quantidade: 1, valor_unitario: 4500.00, valor_total: 4500.00, tipo_cliente: "B2B", pis_atual: 74.25, cofins_atual: 342.00, icms_atual: 540.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 3, data_emissao: "2026-07-02", uf_origem: "MG", uf_destino: "SP", ncm_codigo: "10063021", produto_nome: "Arroz Integral 5kg", quantidade: 50, valor_unitario: 25.00, valor_total: 1250.00, tipo_cliente: "B2B", pis_atual: 0.00, cofins_atual: 0.00, icms_atual: 0.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 4, data_emissao: "2026-07-02", uf_origem: "MG", uf_destino: "MG", ncm_codigo: "07133399", produto_nome: "Feijao Carioca 1kg", quantidade: 100, valor_unitario: 8.00, valor_total: 800.00, tipo_cliente: "B2C", pis_atual: 0.00, cofins_atual: 0.00, icms_atual: 0.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 5, data_emissao: "2026-07-03", uf_origem: "SP", uf_destino: "SP", ncm_codigo: "04012010", produto_nome: "Leite Integral UHT", quantidade: 200, valor_unitario: 4.50, valor_total: 900.00, tipo_cliente: "B2C", pis_atual: 0.00, cofins_atual: 0.00, icms_atual: 0.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 6, data_emissao: "2026-07-03", uf_origem: "RJ", uf_destino: "SP", ncm_codigo: "30049025", produto_nome: "Ibuprofeno 600mg", quantidade: 30, valor_unitario: 15.00, valor_total: 450.00, tipo_cliente: "B2C", pis_atual: 7.43, cofins_atual: 34.20, icms_atual: 54.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 7, data_emissao: "2026-07-04", uf_origem: "SP", uf_destino: "SP", ncm_codigo: "99010000", produto_nome: "Mensalidade Escolar Ensino Medio", quantidade: 1, valor_unitario: 1200.00, valor_total: 1200.00, tipo_cliente: "B2C", pis_atual: 19.80, cofins_atual: 91.20, icms_atual: 0.00, iss_atual: 60.00, ipi_atual: 0.00 },
    { id_nfe: 8, data_emissao: "2026-07-04", uf_origem: "SP", uf_destino: "MG", ncm_codigo: "85171300", produto_nome: "Smartphone Android", quantidade: 10, valor_unitario: 1400.00, valor_total: 14000.00, tipo_cliente: "B2B", pis_atual: 231.00, cofins_atual: 1064.00, icms_atual: 1680.00, iss_atual: 0.00, ipi_atual: 0.00 },
    
    // Additional realistic records to make charts rich and responsive
    { id_nfe: 9, data_emissao: "2026-07-05", uf_origem: "PR", uf_destino: "SP", ncm_codigo: "84713012", produto_nome: "Notebook Pro", quantidade: 3, valor_unitario: 4200.00, valor_total: 12600.00, tipo_cliente: "B2B", pis_atual: 207.90, cofins_atual: 957.60, icms_atual: 1512.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 10, data_emissao: "2026-07-05", uf_origem: "SP", uf_destino: "RS", ncm_codigo: "85171300", produto_nome: "Smartphone Android", quantidade: 5, valor_unitario: 1300.00, valor_total: 6500.00, tipo_cliente: "B2C", pis_atual: 107.25, cofins_atual: 494.00, icms_atual: 1170.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 11, data_emissao: "2026-07-06", uf_origem: "SP", uf_destino: "SP", ncm_codigo: "30049025", produto_nome: "Dipirona Monoidratada", quantidade: 100, valor_unitario: 5.00, valor_total: 500.00, tipo_cliente: "B2C", pis_atual: 8.25, cofins_atual: 38.00, icms_atual: 90.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 12, data_emissao: "2026-07-06", uf_origem: "MG", uf_destino: "RJ", ncm_codigo: "10063021", produto_nome: "Arroz Integral 5kg", quantidade: 80, valor_unitario: 26.00, valor_total: 2080.00, tipo_cliente: "B2B", pis_atual: 0.00, cofins_atual: 0.00, icms_atual: 0.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 13, data_emissao: "2026-07-07", uf_origem: "RS", uf_destino: "PR", ncm_codigo: "07133399", produto_nome: "Feijao Carioca 1kg", quantidade: 150, valor_unitario: 8.50, valor_total: 1275.00, tipo_cliente: "B2B", pis_atual: 0.00, cofins_atual: 0.00, icms_atual: 0.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 14, data_emissao: "2026-07-08", uf_origem: "SP", uf_destino: "BA", ncm_codigo: "99010000", produto_nome: "Curso de Pos-Graduacao EAD", quantidade: 1, valor_unitario: 3500.00, valor_total: 3500.00, tipo_cliente: "B2C", pis_atual: 57.75, cofins_atual: 266.00, icms_atual: 0.00, iss_atual: 175.00, ipi_atual: 0.00 },
    { id_nfe: 15, data_emissao: "2026-07-08", uf_origem: "SC", uf_destino: "SP", ncm_codigo: "84713012", produto_nome: "Servidor Rack Enterprise", quantidade: 1, valor_unitario: 15000.00, valor_total: 15000.00, tipo_cliente: "B2B", pis_atual: 247.50, cofins_atual: 1140.00, icms_atual: 1800.00, iss_atual: 0.00, ipi_atual: 750.00 },
    { id_nfe: 16, data_emissao: "2026-07-09", uf_origem: "SP", uf_destino: "DF", ncm_codigo: "85171300", produto_nome: "Tablet Pro X", quantidade: 4, valor_unitario: 2200.00, valor_total: 8800.00, tipo_cliente: "B2C", pis_atual: 145.20, cofins_atual: 668.80, icms_atual: 1056.00, iss_atual: 0.00, ipi_atual: 0.00 },
    { id_nfe: 17, data_emissao: "2026-07-10", uf_origem: "RJ", uf_destino: "RJ", ncm_codigo: "99010000", produto_nome: "Treinamento Corporativo", quantidade: 1, valor_unitario: 5000.00, valor_total: 5000.00, tipo_cliente: "B2B", pis_atual: 82.50, cofins_atual: 380.00, icms_atual: 0.00, iss_atual: 250.00, ipi_atual: 0.00 }
];

// App State
let systemRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
let rawSales = [];
let analyzedSales = [];
let activeSortColumn = 'id_nfe';
let activeSortDirection = 'asc';

// ApexCharts instances
let charts = {
    distribution: null,
    products: null,
    regional: null
};

// UI Elements
const themeToggle = document.getElementById('theme-toggle');
const headerEl = document.getElementById('header');

// Sliders and controls
const cbsSlider = document.getElementById('cbs-slider');
const cbsVal = document.getElementById('cbs-val');
const ibsSlider = document.getElementById('ibs-slider');
const ibsVal = document.getElementById('ibs-val');
const transSlider = document.getElementById('trans-slider');
const transVal = document.getElementById('trans-val');

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

    // Sliders
    cbsSlider.addEventListener('input', (e) => {
        cbsVal.textContent = parseFloat(e.target.value).toFixed(1) + '%';
        recalculateAndRefresh();
    });
    ibsSlider.addEventListener('input', (e) => {
        ibsVal.textContent = parseFloat(e.target.value).toFixed(1) + '%';
        recalculateAndRefresh();
    });
    transSlider.addEventListener('input', (e) => {
        transVal.textContent = e.target.value + '% ' + (e.target.value == 100 ? '(Novo)' : e.target.value == 0 ? '(Antigo)' : '(Transição)');
        recalculateAndRefresh();
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
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    csvFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Load local example database
    btnLoadDefault.addEventListener('click', () => {
        loadFallbackSales();
    });

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
}

// Load Rules from JSON & initial CSV sales
function loadInitialData() {
    // Attempt loading JSON first
    fetch('dados_reforma/regras_aliquotas.json')
        .then(response => {
            if (!response.ok) throw new Error('Não foi possível obter o JSON das regras');
            return response.json();
        })
        .then(data => {
            systemRules = data;
            // Update sliders with JSON standard values
            if (systemRules.aliquotas_padrao) {
                cbsSlider.value = (systemRules.aliquotas_padrao.cbs * 100).toFixed(1);
                cbsVal.textContent = (systemRules.aliquotas_padrao.cbs * 100).toFixed(1) + '%';
                ibsSlider.value = (systemRules.aliquotas_padrao.ibs * 100).toFixed(1);
                ibsVal.textContent = (systemRules.aliquotas_padrao.ibs * 100).toFixed(1) + '%';
            }
            updateRulesDisplay();
            loadInitialSales();
        })
        .catch(err => {
            console.log('Erro ao carregar regras via HTTP. Usando regras padrão locais:', err);
            systemRules = JSON.parse(JSON.stringify(DEFAULT_RULES));
            updateRulesDisplay();
            loadInitialSales();
        });
}

function loadInitialSales() {
    // Attempt loading vendas_exemplo.csv
    fetch('tabelas_nfe/vendas_exemplo.csv')
        .then(response => {
            if (!response.ok) throw new Error('Não foi possível carregar o CSV');
            return response.text();
        })
        .then(csvText => {
            parseSalesCSV(csvText);
            setDatabaseStatus('success', 'Base vendas_exemplo.csv carregada via servidor local.');
        })
        .catch(err => {
            console.log('Erro ao carregar CSV de vendas via HTTP. Usando banco de dados mockado robusto:', err);
            loadFallbackSales();
        });
}

function loadFallbackSales() {
    rawSales = JSON.parse(JSON.stringify(DEFAULT_VENDAS));
    setDatabaseStatus('warning', 'Base mockada ativa (Modo Offline/Local).');
    recalculateAndRefresh();
}

function handleFileUpload(file) {
    if (!file.name.endsWith('.csv')) {
        alert('Por favor, faça upload de um arquivo com extensão .csv');
        return;
    }
    setDatabaseStatus('warning', 'Processando arquivo upload...');
    
    const reader = new FileReader();
    reader.onload = function(e) {
        parseSalesCSV(e.target.result);
        setDatabaseStatus('success', `Carregado arquivo do usuário: ${file.name}`);
    };
    reader.onerror = function() {
        alert('Erro ao ler o arquivo selecionado.');
        setDatabaseStatus('danger', 'Erro na leitura do arquivo enviado.');
    };
    reader.readAsText(file, 'UTF-8');
}

function parseSalesCSV(csvText) {
    Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data && results.data.length > 0) {
                const headers = Object.keys(results.data[0]);
                
                // Helper to search keys using aliases, filtering empty values
                const getVal = (row, aliases, defaultVal = null) => {
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
                const productAliases = ['produto_nome', 'descricao_produto', 'produto', 'descricao', 'nome_produto', 'item'];
                const valueAliases = ['valor_total', 'valor_total_item', 'total', 'valor', 'valor_total_nfe'];

                const hasProduct = headers.some(k => {
                    const cleanK = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    return productAliases.some(alias => cleanK === alias.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                });
                
                const hasValue = headers.some(k => {
                    const cleanK = k.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    return valueAliases.some(alias => cleanK === alias.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                });

                if (!hasProduct || !hasValue) {
                    alert('O arquivo CSV é inválido. Não foi possível identificar as colunas de nome/descrição do produto ou valor total.');
                    setDatabaseStatus('danger', 'Colunas essenciais ausentes.');
                    return;
                }

                // Format records properly using alias mapping and safe float conversion
                rawSales = results.data.map((row, idx) => {
                    // Map client type dynamically from doc type or length
                    let clientType = "B2C";
                    const directType = getVal(row, ['tipo_cliente', 'tipo_cli', 'cliente_tipo']);
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

                    const ncmRaw = getVal(row, ['ncm_codigo', 'ncm', 'codigo_ncm'], "");
                    const cleanNcm = String(ncmRaw || "").replace(/\D/g, "");

                    return {
                        id_nfe: getVal(row, ['id_nfe', 'id_venda', 'id', 'numero_nfe', 'nfe', 'numero'], idx + 1),
                        data_emissao: getVal(row, ['data_emissao', 'data', 'emissao', 'data_venda'], "2026-07-19"),
                        uf_origem: getVal(row, ['uf_origem', 'origem', 'uf_de', 'uf_orig'], "SP"),
                        uf_destino: getVal(row, ['uf_destino', 'uf_cliente', 'uf_dest', 'uf_para', 'uf'], "SP"),
                        ncm_codigo: cleanNcm || "85171300",
                        produto_nome: getVal(row, productAliases, "Produto Sem Nome"),
                        quantidade: parseFloatSafe(getVal(row, ['quantidade', 'qtd', 'quant'], 1), 1),
                        valor_unitario: parseFloatSafe(getVal(row, ['valor_unitario', 'preco_unitario', 'valor_unit', 'preco'], 0), 0),
                        valor_total: parseFloatSafe(getVal(row, valueAliases, 0), 0),
                        tipo_cliente: clientType,
                        pis_atual: parseFloatSafe(getVal(row, ['pis_atual', 'valor_pis', 'pis', 'vlr_pis', 'vl_pis', 'pis_valor', 'pisval', 'valorpis', 'pis_vlr', 'pis_val'], 0), 0),
                        cofins_atual: parseFloatSafe(getVal(row, ['cofins_atual', 'valor_cofins', 'cofins', 'vlr_cofins', 'vl_cofins', 'cofins_valor', 'cofinsval', 'valorcofins', 'cofins_vlr', 'cofins_val'], 0), 0),
                        icms_atual: parseFloatSafe(getVal(row, ['icms_atual', 'valor_icms', 'icms', 'vlr_icms', 'vl_icms', 'icms_valor', 'icmsval', 'valoricms', 'icms_vlr', 'icms_val'], 0), 0),
                        iss_atual: parseFloatSafe(getVal(row, ['iss_atual', 'valor_iss', 'iss', 'vlr_iss', 'vl_iss', 'iss_valor', 'issval', 'valoriss', 'iss_vlr', 'iss_val'], 0), 0),
                        ipi_atual: parseFloatSafe(getVal(row, ['ipi_atual', 'valor_ipi', 'ipi', 'vlr_ipi', 'vl_ipi', 'ipi_valor', 'ipival', 'valoripi', 'ipi_vlr', 'ipi_val'], 0), 0)
                    };
                });
                
                recalculateAndRefresh();
            } else {
                alert('Nenhum dado encontrado no arquivo CSV.');
                setDatabaseStatus('danger', 'Arquivo CSV vazio.');
            }
        }
    });
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
    const transPct = parseFloat(transSlider.value) / 100;

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

        // Calculate CBS & IBS values based on the slider state
        const cbsRate = cbsStd * cbsFactor;
        const ibsRate = ibsStd * ibsFactor;

        const cbsValCalculated = sale.valor_total * cbsRate;
        const ibsValCalculated = sale.valor_total * ibsRate;
        const taxNewNominal = cbsValCalculated + ibsValCalculated;

        // Apply transition scenario
        // Tax = OldTax * (1 - Transition%) + NewTaxNominal * Transition%
        const taxNew = (taxCurrent * (1 - transPct)) + (taxNewNominal * transPct);
        const taxDiff = taxNew - taxCurrent;

        return {
            ...sale,
            tax_current: taxCurrent,
            tax_cbs: cbsValCalculated * transPct,
            tax_ibs: ibsValCalculated * transPct,
            tax_new: taxNew,
            tax_diff: taxDiff,
            status_regra: ruleDescription,
            badge_class: badgeClass
        };
    });

    updateKPIs();
    updateCharts();
    renderTable();
    updateSingleSimulator();
}

function updateKPIs() {
    let totalRevenue = 0;
    let totalTaxCurrent = 0;
    let totalTaxNew = 0;
    let totalCount = analyzedSales.length;

    analyzedSales.forEach(sale => {
        totalRevenue += sale.valor_total;
        totalTaxCurrent += sale.tax_current;
        totalTaxNew += sale.tax_new;
    });

    const totalTaxDiff = totalTaxNew - totalTaxCurrent;
    const avgTaxCurrentPct = totalRevenue > 0 ? (totalTaxCurrent / totalRevenue) * 100 : 0;
    const avgTaxNewPct = totalRevenue > 0 ? (totalTaxNew / totalRevenue) * 100 : 0;
    
    // Calculate difference relative to current tax burden
    const taxDiffPct = totalTaxCurrent > 0 ? (totalTaxDiff / totalTaxCurrent) * 100 : 0;

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
}

// Chart Renderings
function updateCharts() {
    const isLight = document.body.classList.contains('light-mode');
    const labelColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.05)';

    // Compute aggregation data
    let currentTaxesSum = { pis: 0, cofins: 0, icms: 0, iss: 0, ipi: 0 };
    let newTaxesSum = { cbs: 0, ibs: 0 };

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
                    { x: 'IBS (Est/Mun)', y: Math.round(newTaxesSum.ibs) }
                ]
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
        charts.distribution = new ApexCharts(document.querySelector("#chart-distribution"), optionsDistribution);
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
        charts.products = new ApexCharts(document.querySelector("#chart-products"), optionsProducts);
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
        charts.regional = new ApexCharts(document.querySelector("#chart-regional"), optionsRegional);
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

        tr.innerHTML = `
            <td>#${sale.id_nfe}</td>
            <td style="text-align: center;">
                <button class="btn-table-action" onclick="simulateRow(${sale.id_nfe})" title="Carregar no Simulador">
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

// Single item quick simulator logic
function updateSingleSimulator() {
    const name = simProductName.value;
    const ncm = simNcm.value;
    const totalVal = parseFloat(simValue.value) || 0;
    const ruleTypeSelect = simRuleType.value;

    const cbsStd = parseFloat(cbsSlider.value) / 100;
    const ibsStd = parseFloat(ibsSlider.value) / 100;

    // Simulate old tax based on realistic average (approx 24% for general goods)
    // We try to pull from matching items in active CSV, or fallback to 24% standard current rate
    let currentRate = 0.2425; 
    
    // Attempt to pull actual rate from active CSV matching by NCM or name
    if (analyzedSales && analyzedSales.length > 0) {
        const cleanNcm = String(ncm || "").replace(/\D/g, "");
        const match = analyzedSales.find(s => 
            (cleanNcm && s.ncm_codigo === cleanNcm) || 
            (name && String(s.produto_nome).toLowerCase().trim() === String(name).toLowerCase().trim())
        );
        if (match && match.valor_total > 0) {
            currentRate = match.tax_current / match.valor_total;
        }
    }
    
    // Check if the simulator inputs match a rule
    let cbsFactor = 1.0;
    let ibsFactor = 1.0;

    if (ruleTypeSelect === 'isento') {
        cbsFactor = 0.0;
        ibsFactor = 0.0;
        currentRate = 0.0; // Food products in Brazil generally have very low/zero current taxes
    } else if (ruleTypeSelect === 'reducao_60') {
        cbsFactor = 0.4;
        ibsFactor = 0.4;
        currentRate = 0.12; // Educ/Medicines generally have reduced current taxes as well
    }

    const currentTax = totalVal * currentRate;
    const simCbs = totalVal * cbsStd * cbsFactor;
    const simIbs = totalVal * ibsStd * ibsFactor;
    const newTax = simCbs + simIbs;

    const diff = newTax - currentTax;
    const diffPct = currentTax > 0 ? (diff / currentTax) * 100 : 0;

    // Update Simulator Card
    simTaxCurrentEl.textContent = formatCurrency(currentTax);
    simTaxCbsEl.textContent = formatCurrency(simCbs);
    simTaxIbsEl.textContent = formatCurrency(simIbs);
    simTaxNewEl.textContent = formatCurrency(newTax);

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
function simulateRow(idNfe) {
    const sale = analyzedSales.find(s => s.id_nfe === idNfe);
    if (!sale) return;

    // Smooth scroll to the simulator
    const simSection = document.getElementById('simulador-rapido');
    if (simSection) {
        simSection.scrollIntoView({ behavior: 'smooth' });
    }

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

    // Calculate
    updateSingleSimulator();

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
