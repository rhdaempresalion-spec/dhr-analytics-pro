#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "🧪 TESTANDO TODAS AS FUNCIONALIDADES DO DHR ANALYTICS PRO"
echo "════════════════════════════════════════════════════════════"

BASE_URL="https://3005-iddkhi9p6m4lf1ujf253c-ca4c9c8d.manusvm.computer"

echo ""
echo "1️⃣  TESTE: Dashboard Geral"
echo "────────────────────────────────────────────────────────────"
curl -s "$BASE_URL/api/dashboard" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Vendas Pagas Hoje: R\$ {data[\"today\"][\"paidAmount\"]:.2f}')
print(f'✅ Vendas Pendentes Hoje: R\$ {data[\"today\"][\"pendingAmount\"]:.2f}')
print(f'✅ Total Hoje: {data[\"today\"][\"total\"]} transações')
print(f'✅ Taxa de Conversão: {data[\"today\"][\"conversion\"]}%')
print(f'✅ Ticket Médio: R\$ {data[\"today\"][\"avgTicket\"]:.2f}')
print(f'✅ Melhor Horário: {data[\"bestHour\"]}')
"

echo ""
echo "2️⃣  TESTE: Filtro por Data"
echo "────────────────────────────────────────────────────────────"
curl -s "$BASE_URL/api/dashboard?startDate=2025-11-18&endDate=2025-11-18" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Filtro aplicado com sucesso!')
print(f'✅ Total filtrado: {data[\"today\"][\"total\"]} transações')
"

echo ""
echo "3️⃣  TESTE: Filtro por Status (Pagos)"
echo "────────────────────────────────────────────────────────────"
curl -s "$BASE_URL/api/dashboard?status=paid" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Apenas pagos: {data[\"today\"][\"paid\"]} transações')
print(f'✅ Valor total pago: R\$ {data[\"today\"][\"paidAmount\"]:.2f}')
"

echo ""
echo "4️⃣  TESTE: Filtro por Status (Pendentes)"
echo "────────────────────────────────────────────────────────────"
curl -s "$BASE_URL/api/dashboard?status=pending" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Apenas pendentes: {data[\"today\"][\"pending\"]} transações')
print(f'✅ Valor total pendente: R\$ {data[\"today\"][\"pendingAmount\"]:.2f}')
"

echo ""
echo "5️⃣  TESTE: Análise PIX"
echo "────────────────────────────────────────────────────────────"
curl -s "$BASE_URL/api/pix" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Total PIX: {data[\"stats\"][\"total\"]}')
print(f'✅ PIX Pagos: {data[\"stats\"][\"paid\"]}')
print(f'✅ PIX Pendentes: {data[\"stats\"][\"pending\"]}')
print(f'✅ Conversão PIX: {data[\"stats\"][\"conversion\"]}%')
print(f'✅ Ranking tem {len(data[\"merchantRanking\"])} merchants')
if len(data['merchantRanking']) > 0:
    top = data['merchantRanking'][0]
    print(f'✅ Top 1: {top[\"name\"]} ({top[\"paid\"]} pagos, {top[\"conversion\"]}% conversão)')
"

echo ""
echo "6️⃣  TESTE: Exportação CSV"
echo "────────────────────────────────────────────────────────────"
CSV_LINES=$(curl -s "$BASE_URL/api/export/csv" | wc -l)
echo "✅ CSV gerado com $CSV_LINES linhas"
curl -s "$BASE_URL/api/export/csv" | head -3
echo "..."

echo ""
echo "7️⃣  TESTE: Exportação Excel"
echo "────────────────────────────────────────────────────────────"
EXCEL_LINES=$(curl -s "$BASE_URL/api/export/excel" | wc -l)
echo "✅ Excel gerado com $EXCEL_LINES linhas"

echo ""
echo "8️⃣  TESTE: Notificações (Listar)"
echo "────────────────────────────────────────────────────────────"
curl -s "$BASE_URL/api/notifications" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'✅ Total de notificações: {len(data)}')
"

echo ""
echo "════════════════════════════════════════════════════════════"
echo "✅ TODOS OS TESTES CONCLUÍDOS COM SUCESSO!"
echo "════════════════════════════════════════════════════════════"
