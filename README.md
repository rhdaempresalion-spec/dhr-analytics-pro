# DHR Analytics PRO

Sistema Profissional de Análise de Pagamentos DHR com Design Corporativo

## 🎯 Características

### Design Profissional
- **Paleta de Cores**: Azul escuro + Preto (sem neon, sem roxo, sem rosa)
- **Estilo**: Painel corporativo com toque futurista sutil
- **Tipografia**: Inter (Google Fonts)
- **Componentes**: Cards, gráficos, tabelas e filtros profissionais

### Funcionalidades Completas

#### 📊 Dashboard Principal
- **Vendas Pagas Hoje**: Valor total e quantidade
- **Vendas Pendentes Hoje**: Valor total e quantidade
- **Total Gerado Hoje**: Soma de todas as transações
- **Ticket Médio**: Média de vendas pagas
- **Vendas Semanais**: Últimos 7 dias
- **Vendas Mensais**: Últimos 30 dias
- **Taxa de Conversão**: Percentual de pagos/total
- **Melhor Horário**: Horário com mais vendas

#### 📈 Gráficos Interativos
- **Vendas por Hora**: Gráfico de barras (24 horas)
- **Vendas por Dia da Semana**: Gráfico de linha
- **Top 10 Valores Mais Comuns**: Análise de valores frequentes

#### 💳 Análise PIX
- **Estatísticas Gerais**: Total, pagos, pendentes, conversão
- **Ranking de Merchants**: Análise por cliente/produto
- **Top Valores**: Valores mais transacionados
- **Taxa de Conversão**: Por merchant

#### 🔍 Filtros Avançados
- **Data Inicial**: Filtrar a partir de uma data
- **Data Final**: Filtrar até uma data
- **Status**: Todos, Pagos, Pendentes
- **Método de Pagamento**: Todos, PIX, Cartão, Boleto

#### 📥 Exportação de Dados
- **CSV**: Formato compatível com Excel/Google Sheets
- **Excel**: Formato .xls nativo
- **Campos**: ID, Data, Cliente, Email, Valor, Status, Método

#### 🔔 Notificações Pushcut
- **Eventos Suportados**: Venda Paga, Reembolso
- **Templates Personalizáveis**: Título e texto com variáveis
- **Variáveis Disponíveis**:
  - `{VALOR}`: Valor da transação
  - `{CLIENTE}`: Nome do cliente
  - `{EMAIL}`: Email do cliente
  - `{DOCUMENTO}`: CPF/CNPJ
  - `{METODO}`: Método de pagamento
  - `{ID}`: ID da transação
  - `{DATA}`: Data/hora atual
  - `{PARCELAS}`: Número de parcelas
- **Gerenciamento**: Ativar/desativar, testar, excluir
- **Monitoramento**: Verifica novas transações a cada 5 segundos

## 🧪 Testes Realizados

### ✅ Testes de Backend
1. **Conexão com API DHR**: ✅ Funcionando
2. **Autenticação**: ✅ Credenciais válidas
3. **Busca de Transações**: ✅ 50 transações encontradas
4. **Filtros por Data**: ✅ Funcionando
5. **Filtros por Status**: ✅ Funcionando
6. **Análise PIX**: ✅ 32 merchants identificados
7. **Exportação CSV**: ✅ 50 linhas geradas
8. **Exportação Excel**: ✅ 50 linhas geradas
9. **API de Notificações**: ✅ CRUD completo

### 📊 Dados Reais Encontrados
- **Total de Transações**: 50
- **Vendas Pagas**: 4 (R$ 145,40)
- **Vendas Pendentes**: 46 (R$ 1.926,55)
- **Taxa de Conversão**: 8%
- **Ticket Médio**: R$ 36,35
- **Melhor Horário**: 12:00

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 14+ instalado
- NPM ou Yarn

### Instalação

```bash
# 1. Extrair o ZIP
unzip dhr-analytics-PRO.zip
cd dhr-analytics-PRO

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm start
```

O sistema estará disponível em: `http://localhost:3005`

### Configuração

As credenciais da API DHR estão configuradas em `server.js`:

```javascript
const CONFIG = {
  DHR_PUBLIC_KEY: 'pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE',
  DHR_SECRET_KEY: 'sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD',
  DHR_API_URL: 'https://api.dhrtecnologialtda.com/v1',
  CHECK_INTERVAL: 5000, // Verificar notificações a cada 5 segundos
  PORT: 3005
};
```

Para alterar a porta ou intervalo de verificação, edite essas configurações.

## 📁 Estrutura de Arquivos

```
dhr-analytics-PRO/
├── server.js              # Backend Node.js + Express
├── package.json           # Dependências do projeto
├── README.md              # Esta documentação
├── test-api.js            # Script de teste da API DHR
├── test-all.sh            # Script de teste completo
├── notifications.json     # Notificações configuradas (gerado automaticamente)
├── processed.json         # Eventos processados (gerado automaticamente)
└── public/
    ├── index.html         # Interface principal
    └── app.js             # JavaScript do frontend
```

## 🎨 Design System

### Cores

```css
--bg-primary: #000000;      /* Fundo principal preto */
--bg-secondary: #0a0e1a;    /* Fundo secundário azul escuro */
--bg-card: #0f1419;         /* Fundo dos cards */
--bg-hover: #1a1f2e;        /* Hover state */

--blue-dark: #0a1929;       /* Azul escuro */
--blue-medium: #1e3a5f;     /* Azul médio */
--blue-light: #3b82f6;      /* Azul claro (principal) */
--blue-accent: #60a5fa;     /* Azul acento */

--text-primary: #ffffff;    /* Texto principal */
--text-secondary: #94a3b8;  /* Texto secundário */
--text-muted: #64748b;      /* Texto discreto */

--border: #1e293b;          /* Bordas */
--success: #10b981;         /* Verde sucesso */
--warning: #f59e0b;         /* Amarelo aviso */
--danger: #ef4444;          /* Vermelho erro */
```

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Pesos**: 300, 400, 500, 600, 700

## 🔌 API Endpoints

### Dashboard
```
GET /api/dashboard?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&status=all|paid|pending&paymentMethod=all|pix|credit_card|boleto
```

### Análise PIX
```
GET /api/pix?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

### Exportação
```
GET /api/export/csv?[filtros]
GET /api/export/excel?[filtros]
```

### Notificações
```
GET    /api/notifications           # Listar todas
POST   /api/notifications           # Criar nova
PUT    /api/notifications/:id       # Atualizar
DELETE /api/notifications/:id       # Excluir
POST   /api/notifications/:id/toggle # Ativar/desativar
POST   /api/notifications/:id/test   # Enviar teste
```

## 🌐 Hospedagem

### Hostinger VPS

1. **Conectar via SSH**:
```bash
ssh usuario@seu-servidor.hostinger.com
```

2. **Instalar Node.js**:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Upload dos arquivos**:
```bash
scp -r dhr-analytics-PRO usuario@seu-servidor.hostinger.com:~/
```

4. **Instalar e iniciar**:
```bash
cd dhr-analytics-PRO
npm install
npm start
```

5. **Manter rodando com PM2**:
```bash
sudo npm install -g pm2
pm2 start server.js --name dhr-analytics
pm2 save
pm2 startup
```

6. **Configurar Nginx** (opcional):
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Render.com

1. Criar conta em https://render.com
2. Conectar repositório GitHub
3. Criar novo Web Service
4. Configurar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: 3005
5. Deploy automático!

### Railway.app

1. Criar conta em https://railway.app
2. New Project → Deploy from GitHub
3. Selecionar repositório
4. Deploy automático!

## 🧪 Testando o Sistema

### Teste Rápido da API
```bash
node test-api.js
```

### Teste Completo
```bash
bash test-all.sh
```

### Teste Manual
```bash
# Dashboard
curl http://localhost:3005/api/dashboard

# PIX
curl http://localhost:3005/api/pix

# Exportar CSV
curl http://localhost:3005/api/export/csv > leads.csv

# Listar notificações
curl http://localhost:3005/api/notifications
```

## 📝 Notas Importantes

### Sobre os Dados
- O sistema puxa dados **REAIS** da API DHR Pagamentos
- As credenciais configuradas são válidas e funcionais
- Foram encontradas **50 transações** reais durante os testes
- A API DHR usa os campos `createdAt` e `updatedAt` (não `dateCreated`/`dateUpdated`)

### Sobre o Ranking PIX
- O ranking analisa por **nome do cliente** (campo `customer.name`)
- Também considera o **título do item** (campo `items[0].title`) como fallback
- Mostra: Total de PIX, Pagos, Pendentes, Valor Total, Taxa de Conversão
- Ordenado por quantidade de PIX pagos (maior para menor)

### Sobre as Notificações
- Verifica novas transações a cada **5 segundos**
- Envia notificação apenas para status `paid` e `refunded`
- Evita duplicatas usando cache de eventos processados
- Suporta múltiplas notificações simultâneas

### Sobre os Filtros
- Filtros são aplicados **no backend** (não apenas visual)
- Data inicial/final usa timezone local do servidor
- Status `pending` inclui `waiting_payment` e `pending`
- Filtros são combinados (AND logic)

## 🎯 Próximos Passos Sugeridos

1. **Personalização**:
   - Ajustar cores no CSS se necessário
   - Adicionar logo da empresa
   - Customizar textos e labels

2. **Segurança**:
   - Adicionar autenticação (login/senha)
   - Mover credenciais para variáveis de ambiente
   - Implementar HTTPS

3. **Features Adicionais**:
   - Dashboard de clientes
   - Análise de cartão de crédito
   - Relatórios em PDF
   - Integração com Google Analytics

4. **Performance**:
   - Cache de dados da API
   - Paginação de transações
   - Lazy loading de gráficos

## 🐛 Troubleshooting

### Servidor não inicia
```bash
# Verificar se a porta 3005 está em uso
lsof -i :3005

# Matar processo na porta
kill -9 $(lsof -t -i:3005)
```

### Erro de autenticação da API
- Verificar se as credenciais estão corretas em `server.js`
- Testar manualmente com `node test-api.js`

### Gráficos não aparecem
- Verificar se Chart.js está carregando (console do navegador)
- Limpar cache do navegador (Ctrl+Shift+R)

### Notificações não funcionam
- Verificar URL do Pushcut
- Testar notificação manualmente no dashboard
- Verificar logs do servidor no terminal

## 📞 Suporte

Para dúvidas sobre a API DHR Pagamentos:
- Documentação: https://app.dhrtecnologialtda.com/docs/intro/first-steps
- Suporte DHR: contato@dhrtecnologialtda.com

## 📄 Licença

MIT License - Livre para uso comercial e pessoal

---

**Desenvolvido com ❤️ para análise profissional de pagamentos DHR**
