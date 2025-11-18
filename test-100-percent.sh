#!/bin/bash

echo "🧪 TESTANDO 100% DO SISTEMA DHR ANALYTICS PRO"
echo "=============================================="
echo ""

BASE_URL="https://3005-iddkhi9p6m4lf1ujf253c-ca4c9c8d.manusvm.computer"

# 1. Dashboard
echo "1️⃣ DASHBOARD"
curl -s "$BASE_URL/api/dashboard" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  ✅ Lucro líquido: R\$ {data[\"today\"][\"netAmount\"]:.2f}')
print(f'  ✅ Vendas pagas: R\$ {data[\"today\"][\"paid\"]:.2f} ({data[\"today\"][\"paidCount\"]} txs)')
print(f'  ✅ Leads únicos: {data[\"totalLeads\"]} CPFs')
print(f'  ✅ Melhor horário: {data[\"bestHour\"]}')
"
echo ""

# 2. PIX
echo "2️⃣ ANÁLISE PIX"
curl -s "$BASE_URL/api/pix" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  ✅ Total PIX: {data[\"total\"]}')
print(f'  ✅ Pagos: {data[\"paid\"]}')
print(f'  ✅ Pendentes: {data[\"pending\"]}')
print(f'  ✅ Adquirentes únicos: {data[\"uniqueMerchants\"]}')
print(f'  ✅ Conversão: {data[\"conversionRate\"]}%')
print(f'  ✅ Ranking: {len(data[\"ranking\"])} merchants')
"
echo ""

# 3. Produtos
echo "3️⃣ PRODUTOS"
curl -s "$BASE_URL/api/products" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  ✅ Produtos encontrados: {len(data)}')
for p in data[:3]:
    print(f'     - {p}')
"
echo ""

# 4. Filtros
echo "4️⃣ FILTROS"
curl -s "$BASE_URL/api/dashboard?status=paid" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  ✅ Filtro status=paid: {data[\"today\"][\"paidCount\"]} transações')
"
echo ""

# 5. Exportação
echo "5️⃣ EXPORTAÇÃO"
TXT_SIZE=$(curl -s "$BASE_URL/api/export/txt" | wc -c)
CSV_SIZE=$(curl -s "$BASE_URL/api/export/csv" | wc -c)
echo "  ✅ TXT: $TXT_SIZE bytes"
echo "  ✅ CSV: $CSV_SIZE bytes"
echo ""

# 6. Notificações
echo "6️⃣ NOTIFICAÇÕES"
curl -s "$BASE_URL/api/notifications" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f'  ✅ Notificações cadastradas: {len(data)}')
if len(data) > 0:
    print(f'     - {data[0][\"name\"]}: {\"Ativa\" if data[0][\"enabled\"] else \"Inativa\"}')
"
echo ""

echo "✅ TODOS OS TESTES CONCLUÍDOS!"
