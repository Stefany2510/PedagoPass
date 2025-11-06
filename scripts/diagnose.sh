#!/bin/bash
# Script para diagnosticar problemas de signup

echo "🔍 Diagnosticando erro 500 no POST /auth/signup..."
echo ""

# Verifica se Railway CLI está instalado
if ! command -v railway &> /dev/null; then
  echo "❌ Railway CLI não encontrado. Instale com: npm install -g @railway/cli"
  echo "   Ou execute: 'railway login' e depois 'railway logs --service backend'"
  exit 1
fi

echo "📋 Ultimos 50 logs do backend Railway:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
railway logs --service backend --lines 50 --follow=false 2>/dev/null | grep -E "error|Error|ERROR|signup|Signup|500|jwt|JWT|database|Database" || railway logs --service backend --lines 50 --follow=false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Checklist de variáveis obrigatórias:"
railway variables ls 2>/dev/null | grep -E "JWT_SECRET|DATABASE_URL|CORS_ORIGIN|NODE_ENV" || echo "Use: railway variables ls para ver todas"

echo ""
echo "💡 Se vir 'JWT_SECRET not found' ou 'DATABASE_URL not found', configure com:"
echo "   railway variables set JWT_SECRET=<seu-secret>"
echo "   railway variables set DATABASE_URL=mysql://..."
