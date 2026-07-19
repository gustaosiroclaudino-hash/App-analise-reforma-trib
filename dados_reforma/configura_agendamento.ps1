# Definir caminhos com base no local do script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$targetScript = Join-Path $scriptPath "check_updates.ps1"
$taskName = "AtualizadorReformaTributaria"

Write-Host "Iniciando configuração do Agendador de Tarefas do Windows..."
Write-Host "Script alvo: $targetScript"

# Verificar privilégios de Administrador (necessários para agendar tarefas globais)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Warning "=========================================================================="
    Write-Warning "ATENÇÃO: Privilégios de Administrador são necessários para agendar tarefas."
    Write-Warning "Por favor, abra o PowerShell como ADMINISTRADOR e execute:"
    Write-Warning "  & '$($MyInvocation.MyCommand.Path)'"
    Write-Warning "=========================================================================="
    Write-Host ""
    exit 1
}

# Ação da tarefa: executar o PowerShell de forma silenciosa (-WindowStyle Hidden)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -File `"$targetScript`""

# Gatilho da tarefa: Diariamente às 20:00 (8:00 PM)
$trigger = New-ScheduledTaskTrigger -Daily -At 8:00PM

# Configurações adicionais de robustez
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Registrar tarefa no Windows Task Scheduler
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Coleta atualizações das alíquotas da reforma tributária diariamente e atualiza a base local." -Force | Out-Null
    Write-Host "Sucesso: A tarefa '$taskName' foi agendada com sucesso!" -ForegroundColor Green
    Write-Host "O script passará a rodar silenciosamente todos os dias às 20:00." -ForegroundColor Green
} catch {
    Write-Error "Falha ao registrar a tarefa no Agendador do Windows: $($_.Exception.Message)"
}
