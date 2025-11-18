# Script para gerar app.js completo com todas as funcionalidades

print("Gerando app.js completo...")

# Ler arquivo original
with open('public/app.js.backup', 'r', encoding='utf-8') as f:
    original = f.read()

# Encontrar onde adicionar novas funções (antes do último })
lines = original.split('\n')

# Adicionar variáveis globais no topo
new_vars = """
let analysisData = {
  adSpend: 0,
  leads: 0,
  chargeback: 0
};

let dashboardData = null;
let editingNotificationId = null;
"""

# Inserir após currentFilters
for i, line in enumerate(lines):
    if 'paymentMethod: \'all\'' in line:
        lines[i] = line.replace("'all'", "'all',\n  products: []")
        lines.insert(i+2, new_vars)
        break

# Salvar
with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print("✅ app.js gerado!")
