@echo off
REM Script para diagnosticar erro 500 no POST /auth/signup

echo.
echo 🔍 Diagnosticando erro 500 no POST /auth/signup...
echo.

REM Verifica se Railway CLI está instalado
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Railway CLI não encontrado. Instale com: npm install -g @railway/cli
    echo    Ou execute: 'railway login' no terminal e depois 'railway logs --service backend'
    pause
    exit /b 1
)

echo 📋 Ultimos logs do backend Railway (procurando por erros):
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

railway logs --service backend --lines 100 --follow=false 2>nul

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 🔧 Variáveis de ambiente no Railway:
echo Use: railway variables ls

echo.
echo 💡 Se vir JWT_SECRET ou DATABASE_URL faltando, configure com:
echo    railway variables set JWT_SECRET=seu-secret-aqui-min-32-chars
echo.
pause
