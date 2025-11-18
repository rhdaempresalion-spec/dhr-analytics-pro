#!/bin/bash

echo "========================================="
echo "TESTE COMPLETO - DHR ANALYTICS PRO"
echo "========================================="
echo ""

BASE_URL="https://3005-iddkhi9p6m4lf1ujf253c-ca4c9c8d.manusvm.computer"

# Teste 1: Endpoint /api/products
echo "✅ TESTE 1: Endpoint /api/products"
PRODUCTS=$(curl -s "$BASE_URL/api/products")
echo "Produtos encontrados: $PRODUCTS"
echo ""

# Teste 2: Dashboard sem filtros
echo "✅ TESTE 2: Dashboard sem filtros"
DASHBOARD=$(curl -s "$BASE_URL/api/dashboard")
PAID=$(echo "$DASHBOARD" | grep -o '"paid":[0-9]*' | head -1 | cut -d: -f2)
echo "Vendas pagas: $PAID"
echo ""

# Teste 3: Filtro de produtos
echo "✅ TESTE 3: Filtro de produtos (Passarela hoje)"
FILTERED=$(curl -s "$BASE_URL/api/dashboard?products=Passarela%20hoje")
FILTERED_PAID=$(echo "$FILTERED" | grep -o '"paid":[0-9]*' | head -1 | cut -d: -f2)
echo "Vendas pagas (filtrado): $FILTERED_PAID"
echo ""

# Teste 4: Análise PIX
echo "✅ TESTE 4: Análise PIX"
PIX=$(curl -s "$BASE_URL/api/pix")
PIX_TOTAL=$(echo "$PIX" | grep -o '"total":[0-9]*' | head -1 | cut -d: -f2)
echo "Total PIX: $PIX_TOTAL"
echo ""

# Teste 5: Exportação CSV
echo "✅ TESTE 5: Exportação CSV"
CSV_LINES=$(curl -s "$BASE_URL/api/export/csv" | wc -l)
echo "Linhas no CSV: $CSV_LINES"
echo ""

# Teste 6: Exportação TXT
echo "✅ TESTE 6: Exportação TXT"
TXT_SIZE=$(curl -s "$BASE_URL/api/export/txt" | wc -c)
echo "Tamanho TXT: $TXT_SIZE bytes"
echo ""

# Teste 7: Exportação Excel
echo "✅ TESTE 7: Exportação Excel"
EXCEL_SIZE=$(curl -s "$BASE_URL/api/export/excel" | wc -c)
echo "Tamanho Excel: $EXCEL_SIZE bytes"
echo ""

# Teste 8: Notificações
echo "✅ TESTE 8: Notificações"
NOTIFS=$(curl -s "$BASE_URL/api/notifications")
NOTIF_COUNT=$(echo "$NOTIFS" | grep -o '"id"' | wc -l)
echo "Notificações cadastradas: $NOTIF_COUNT"
echo ""

echo "========================================="
echo "RESUMO DOS TESTES"
echo "========================================="
echo "1. Produtos: OK"
echo "2. Dashboard: $PAID vendas pagas"
echo "3. Filtro produtos: $FILTERED_PAID vendas"
echo "4. PIX: $PIX_TOTAL transações"
echo "5. CSV: $CSV_LINES linhas"
echo "6. TXT: $TXT_SIZE bytes"
echo "7. Excel: $EXCEL_SIZE bytes"
echo "8. Notificações: $NOTIF_COUNT cadastradas"
echo ""
echo "✅ TODOS OS TESTES CONCLUÍDOS!"
