param (
    [string]$ArquivoTeste = ""
)

# Definir caminhos locais com base no local do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptPath "regras_aliquotas.json"
$historicoDir = Join-Path $scriptPath "historico"
$logPath = Join-Path $scriptPath "historico/log_coleta.txt"

# Criar pasta de histórico se não existir
if (-not (Test-Path $historicoDir)) {
    New-Item -ItemType Directory -Path $historicoDir -Force | Out-Null
}

# Obter data atual formatada para logs e metadados
$now = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$todayLog = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Carregar arquivo JSON com as regras atuais
if (Test-Path $jsonPath) {
    try {
        $regras = Get-Content $jsonPath -Raw | ConvertFrom-Json
    } catch {
        Add-Content $logPath "[$todayLog] ERRO: Falha ao ler regras_aliquotas.json. Arquivo corrompido."
        Write-Error "Falha ao decodificar JSON!"
        exit 1
    }
} else {
    Add-Content $logPath "[$todayLog] ERRO: regras_aliquotas.json não encontrado."
    Write-Error "Arquivo regras_aliquotas.json não encontrado!"
    exit 1
}

$html = ""

# Se houver arquivo de teste, carregar localmente. Senão, acessar o site oficial
if ($ArquivoTeste -ne "") {
    if (Test-Path $ArquivoTeste) {
        Write-Host "Executando em MODO DE TESTE com arquivo: $ArquivoTeste"
        $html = Get-Content $ArquivoTeste -Raw -Encoding utf8
    } else {
        Add-Content $logPath "[$todayLog] ERRO: Arquivo de teste não encontrado em: $ArquivoTeste"
        Write-Error "Arquivo de teste não encontrado!"
        exit 1
    }
} else {
    $url = $regras.fonte_oficial
    if (-not $url) {
        $url = "https://www.gov.br/fazenda/pt-br/assuntos/reforma-tributaria"
    }
    Write-Host "Conectando ao site oficial para verificar atualizações: $url"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -TimeoutSec 15
        if ($response.StatusCode -eq 200) {
            $html = $response.Content
        } else {
            throw "Código HTTP de retorno: $($response.StatusCode)"
        }
    } catch {
        $errMsg = $_.Exception.Message
        Add-Content $logPath "[$todayLog] FALHA: Conexão falhou. Erro: $errMsg"
        Write-Host "Falha ao baixar conteúdo. Mantendo dados atuais. Erro: $errMsg"
        exit 0 # Encerra graciosamente para não travar o agendador de tarefas
    }
}

# Regex parsing para extrair alíquotas (procura por "CBS de 8,8%" ou "IBS de 17,7%" ou estimativas no texto)
$cbsNova = $null
$ibsNova = $null

# Procurar CBS
if ($html -match '(?s)\bCBS\b.{0,60}?\b(\d+(?:[.,]\d+)?)\s*%') {
    $cbsNova = [double]($Matches[1] -replace ',', '.') / 100
}

# Procurar IBS
if ($html -match '(?s)\bIBS\b.{0,60}?\b(\d+(?:[.,]\d+)?)\s*%') {
    $ibsNova = [double]($Matches[1] -replace ',', '.') / 100
}

Write-Host "--- Resultado do Parsing ---"
Write-Host "CBS Extraída: " -NoNewline
if ($null -ne $cbsNova) { Write-Host "$($cbsNova * 100)%" -ForegroundColor Green } else { Write-Host "Não encontrada" -ForegroundColor Red }

Write-Host "IBS Extraída: " -NoNewline
if ($null -ne $ibsNova) { Write-Host "$($ibsNova * 100)%" -ForegroundColor Green } else { Write-Host "Não encontrada" -ForegroundColor Red }

# Se as alíquotas não forem encontradas (layout mudou ou texto indisponível), manter as atuais e registrar no log
if ($null -eq $cbsNova -or $null -eq $ibsNova) {
    Add-Content $logPath "[$todayLog] SUCESSO: Conexão efetuada. Nenhuma alíquota padrão detectada no texto. Mantendo atuais."
    Write-Host "Não foi possível extrair alíquotas do texto HTML. Encerrando sem alterações."
    exit 0
}

# Comparar alíquotas encontradas com as alíquotas gravadas no JSON
$cbsAtual = $regras.aliquotas_padrao.cbs
$ibsAtual = $regras.aliquotas_padrao.ibs
$mudou = $false
$mudancas = @()

if ($cbsNova -ne $cbsAtual) {
    $mudou = $true
    $mudancas += @{
        campo = "cbs"
        anterior = $cbsAtual
        novo = $cbsNova
    }
}

if ($ibsNova -ne $ibsAtual) {
    $mudou = $true
    $mudancas += @{
        campo = "ibs"
        anterior = $ibsAtual
        novo = $ibsNova
    }
}

# Gravar as alterações se houver mudança detectada
if ($mudou) {
    Write-Host "Mudança detectada! Atualizando regras e gravando arquivo de histórico..." -ForegroundColor Yellow
    
    # Atualizar objeto em memória
    $regras.aliquotas_padrao.cbs = $cbsNova
    $regras.aliquotas_padrao.ibs = $ibsNova
    $regras.aliquotas_padrao.total = $cbsNova + $ibsNova
    $regras.ultima_atualizacao = $now
    
    # Salvar regras_aliquotas.json atualizado
    $regrasJson = $regras | ConvertTo-Json -Depth 10
    $regrasJson | Out-File -FilePath $jsonPath -Encoding utf8 -Force
    
    # Criar arquivo de log individual de mudança
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $historicoFile = Join-Path $historicoDir "historico_$timestamp.json"
    
    $historicoObj = @{
        data_coleta = $now
        fonte = if ($ArquivoTeste -ne "") { "Arquivo de Teste: $ArquivoTeste" } else { $url }
        mudancas = $mudancas
    }
    
    $historicoObjJson = $historicoObj | ConvertTo-Json -Depth 5
    $historicoObjJson | Out-File -FilePath $historicoFile -Encoding utf8 -Force
    
    # Registrar log em log_coleta.txt
    $logMsg = "[$todayLog] ALTERAÇÃO DETECTADA: "
    foreach ($m in $mudancas) {
        $logMsg += "$($m.campo): $($m.anterior * 100)% -> $($m.novo * 100)% | "
    }
    Add-Content $logPath $logMsg
    Write-Host "Modificações gravadas com sucesso no histórico." -ForegroundColor Green
} else {
    Add-Content $logPath "[$todayLog] SUCESSO: Verificação concluída. Alíquotas online conferem com as locais ($($cbsAtual*100)% CBS / $($ibsAtual*100)% IBS). Nenhuma mudança detectada."
    Write-Host "As alíquotas online conferem com as locais. Nenhuma alteração realizada." -ForegroundColor Cyan
}
