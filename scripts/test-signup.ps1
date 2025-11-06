# Script para testar signup endpoint manualmente
# Uso: powershell -ExecutionPolicy Bypass -File test-signup.ps1

$baseUrl = "https://pedagopass-production-c410.up.railway.app"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🧪 Teste de Signup - PedagoPass" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 1. Teste de conectividade básica
Write-Host "1️⃣  Testando conectividade com backend..."
try {
    $health = Invoke-WebRequest -Uri "$baseUrl/" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Backend respondendo: $(($health.Content | ConvertFrom-Json).service)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erro de conectividade: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Teste de CORS preflight
Write-Host "2️⃣  Testando preflight CORS..."
try {
    $headers = @{
        "Origin" = "https://pedagopasss.netlify.app"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type"
    }
    $preflight = Invoke-WebRequest -Uri "$baseUrl/auth/signup" -Method OPTIONS -Headers $headers -TimeoutSec 10
    $corsHeader = $preflight.Headers['Access-Control-Allow-Origin']
    if ($corsHeader) {
        Write-Host "   ✅ CORS habilitado: $corsHeader" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  CORS header não encontrado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Preflight test: $_" -ForegroundColor Yellow
}

Write-Host ""

# 3. Teste de signup com credenciais de teste
Write-Host "3️⃣  Testando POST /auth/signup..."

$email = "teste$(Get-Random)@pedagopass.com"
$body = @{
    nome = "User Teste"
    email = $email
    senha = "Senha@123456"
} | ConvertTo-Json

Write-Host "   Enviando: $body" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/signup" `
        -Method POST `
        -Headers @{"Content-Type" = "application/json"; "Origin" = "https://pedagopasss.netlify.app"} `
        -Body $body `
        -TimeoutSec 10
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.token) {
        Write-Host "   ✅ Signup bem-sucedido!" -ForegroundColor Green
        Write-Host "      User: $($data.user.nome) ($($data.user.email))" -ForegroundColor Green
        Write-Host "      Token: $($data.token.Substring(0, 20))..." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Signup respondeu 200 mas sem token:" -ForegroundColor Yellow
        Write-Host "      $($data | ConvertTo-Json)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorBody = $_.ErrorDetails.Message
    
    Write-Host "   ❌ Erro HTTP $statusCode" -ForegroundColor Red
    
    if ($errorBody) {
        try {
            $error = $errorBody | ConvertFrom-Json
            Write-Host "      Resposta: $($error | ConvertTo-Json -Depth 2)" -ForegroundColor Red
        } catch {
            Write-Host "      Resposta: $errorBody" -ForegroundColor Red
        }
    }
    
    # Dica baseada no status code
    if ($statusCode -eq 500) {
        Write-Host ""
        Write-Host "💡 Dicas para erro 500:" -ForegroundColor Yellow
        Write-Host "   • JWT_SECRET não configurado no Railway" -ForegroundColor Yellow
        Write-Host "   • DATABASE_URL inválida ou sem acesso" -ForegroundColor Yellow
        Write-Host "   • Erro no código do servidor" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Execute 'railway logs --service backend' para ver detalhes" -ForegroundColor Yellow
    }
    elseif ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host ""
        Write-Host "💡 Erro de autenticação/CORS:" -ForegroundColor Yellow
        Write-Host "   • Verifique CORS_ORIGIN no Railway" -ForegroundColor Yellow
        Write-Host "   • Remova trailing slash: use 'https://pedagopasss.netlify.app'" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
