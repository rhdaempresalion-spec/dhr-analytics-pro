import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const CONFIG = {
  DHR_PUBLIC_KEY: process.env.DHR_PUBLIC_KEY || 'pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE',
  DHR_SECRET_KEY: process.env.DHR_SECRET_KEY || 'sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD',
  DHR_API_URL: process.env.DHR_API_URL || 'https://api.dhrtecnologialtda.com/v1',
  CHECK_INTERVAL: (process.env.CHECK_INTERVAL_SECONDS || 5) * 1000,
  PORT: process.env.PORT || 3000
};

const FILES = {
  notifications: path.join(__dirname, 'notifications.json'),
  processed: path.join(__dirname, 'processed.json')
};

let notifications = [];
let processedEvents = new Set();

// ===== UTILITÁRIOS =====

async function loadFile(filepath, defaultValue = []) {
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

async function saveFile(filepath, data) {
  try {
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Erro ao salvar arquivo:', err.message);
  }
}

function getAuth() {
  return 'Basic ' + Buffer.from(`${CONFIG.DHR_PUBLIC_KEY}:${CONFIG.DHR_SECRET_KEY}`).toString('base64');
}

async function fetchDHR(endpoint) {
  const response = await fetch(`${CONFIG.DHR_API_URL}${endpoint}`, {
    headers: { 'Authorization': getAuth() }
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// ===== NOTIFICAÇÕES =====

async function checkEvents() {
  try {
    const data = await fetchDHR('/transactions?page=1&pageSize=50');
    const txs = data.data || [];

    for (const tx of txs) {
      const key = `${tx.id}-${tx.status}`;
      if (processedEvents.has(key)) continue;

      if (tx.status === 'paid' || tx.status === 'refunded') {
        await sendNotifs(tx);
        processedEvents.add(key);
      }
    }

    await saveFile(FILES.processed, Array.from(processedEvents));
  } catch (err) {
    console.error('Erro ao verificar eventos:', err.message);
  }
}

async function sendNotifs(tx) {
  const type = tx.status === 'paid' ? 'sale_paid' : 'refund';
  const active = notifications.filter(n => n.enabled && n.eventType === type);

  for (const n of active) {
    try {
      const msg = formatMsg(n, tx);
      await fetch(n.url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(msg)
      });
      console.log(`✅ Notificação enviada: ${n.name}`);
    } catch (err) {
      console.error(`❌ Erro ao enviar notificação: ${err.message}`);
    }
  }
}

function formatMsg(notif, tx) {
  const vars = {
    '{VALOR}': `R$ ${((tx.amount||0)/100).toFixed(2)}`,
    '{CLIENTE}': tx.customer?.name || 'Cliente',
    '{EMAIL}': tx.customer?.email || '',
    '{DOCUMENTO}': tx.customer?.document?.number || '',
    '{METODO}': tx.paymentMethod || '',
    '{ID}': tx.id || '',
    '{DATA}': new Date().toLocaleString('pt-BR'),
    '{PARCELAS}': tx.installments || '1'
  };

  let title = notif.title || '';
  let text = notif.text || '';
  Object.entries(vars).forEach(([k,v]) => {
    title = title.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v);
    text = text.replace(new RegExp(k.replace(/[{}]/g, '\\$&'), 'g'), v);
  });

  return {title, text};
}

// ===== API =====

const app = express();

// CORS - IMPORTANTE para funcionar no navegador
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static('public'));

// ===== ROTAS DA API DHR =====

// Buscar todas as transações
app.get('/api/transactions', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 200;
    const data = await fetchDHR(`/transactions?page=${page}&pageSize=${pageSize}`);
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar transações:', err.message);
    res.status(500).json({error: err.message});
  }
});

// Buscar produtos
app.get('/api/products', async (req, res) => {
  try {
    const data = await fetchDHR('/products');
    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar produtos:', err.message);
    res.status(500).json({error: err.message});
  }
});

// Análise de dados
app.get('/api/analytics', async (req, res) => {
  try {
    // Buscar todas as transações recentes
    let allTransactions = [];
    let page = 1;
    const maxPages = 50;
    
    while (page <= maxPages) {
      const data = await fetchDHR(`/transactions?page=${page}&pageSize=200`);
      const txs = data.data || [];
      if (txs.length === 0) break;
      allTransactions = allTransactions.concat(txs);
      page++;
    }

    // Calcular estatísticas
    const paid = allTransactions.filter(t => t.status === 'paid');
    const pending = allTransactions.filter(t => t.status === 'waiting_payment');
    
    const totalRevenue = paid.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
    const totalPending = pending.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
    
    const avgTicket = paid.length > 0 ? totalRevenue / paid.length : 0;
    
    // Taxa de conversão
    const conversionRate = allTransactions.length > 0 
      ? (paid.length / allTransactions.length) * 100 
      : 0;

    // Análise por método de pagamento
    const byMethod = {};
    paid.forEach(t => {
      const method = t.paymentMethod || 'unknown';
      if (!byMethod[method]) {
        byMethod[method] = { count: 0, revenue: 0 };
      }
      byMethod[method].count++;
      byMethod[method].revenue += (t.amount || 0) / 100;
    });

    // Análise por produto
    const byProduct = {};
    paid.forEach(t => {
      const items = t.items || [];
      items.forEach(item => {
        const productName = item.title || 'Desconhecido';
        if (!byProduct[productName]) {
          byProduct[productName] = { count: 0, revenue: 0 };
        }
        byProduct[productName].count++;
        byProduct[productName].revenue += (t.amount || 0) / 100;
      });
    });

    res.json({
      summary: {
        totalRevenue,
        totalPending,
        paidCount: paid.length,
        pendingCount: pending.length,
        totalCount: allTransactions.length,
        avgTicket,
        conversionRate
      },
      byMethod,
      byProduct,
      recentTransactions: allTransactions.slice(0, 10)
    });
  } catch (err) {
    console.error('Erro ao gerar analytics:', err.message);
    res.status(500).json({error: err.message});
  }
});

// ===== ROTAS DE NOTIFICAÇÕES =====

app.get('/api/status', (req, res) => {
  res.json({
    running: true,
    interval: CONFIG.CHECK_INTERVAL / 1000,
    activeNotifications: notifications.filter(n => n.enabled).length,
    processedCount: processedEvents.size
  });
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  try {
    const n = {
      id: Date.now().toString(), 
      enabled: true, 
      eventType: req.body.eventType || 'sale_paid',
      name: req.body.name || 'Nova Notificação',
      url: req.body.url || '',
      title: req.body.title || '',
      text: req.body.text || ''
    };
    notifications.push(n);
    await saveFile(FILES.notifications, notifications);
    res.json(n);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.put('/api/notifications/:id', async (req, res) => {
  try {
    const idx = notifications.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({error: 'Not found'});
    notifications[idx] = {...notifications[idx], ...req.body};
    await saveFile(FILES.notifications, notifications);
    res.json(notifications[idx]);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    notifications = notifications.filter(n => n.id !== req.params.id);
    await saveFile(FILES.notifications, notifications);
    res.json({success: true});
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.post('/api/notifications/:id/toggle', async (req, res) => {
  try {
    const n = notifications.find(n => n.id === req.params.id);
    if (!n) return res.status(404).json({error: 'Not found'});
    n.enabled = !n.enabled;
    await saveFile(FILES.notifications, notifications);
    res.json(n);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.post('/api/notifications/:id/test', async (req, res) => {
  try {
    const n = notifications.find(n => n.id === req.params.id);
    if (!n) return res.status(404).json({error: 'Not found'});
    
    const testTx = {
      id: 'TEST123',
      amount: 3635,
      customer: {
        name: 'Cliente Teste',
        email: 'teste@exemplo.com',
        document: {number: '12345678900'}
      },
      paymentMethod: 'pix',
      createdAt: new Date().toISOString(),
      installments: 1
    };
    
    const msg = formatMsg(n, testTx);
    
    await fetch(n.url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(msg)
    });
    res.json({success: true});
  } catch (err) {
    res.status(500).json({success: false, error: err.message});
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok', 
    timestamp: new Date().toISOString(),
    notifications: notifications.length,
    processed: processedEvents.size
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.redirect('/index.html');
});

// ===== INIT =====

async function init() {
  try {
    notifications = await loadFile(FILES.notifications, []);
    const processed = await loadFile(FILES.processed, []);
    processedEvents = new Set(processed);

    console.log('\n🚀 DHR Monitor - Sistema Iniciado');
    console.log(`📍 Porta: ${CONFIG.PORT}`);
    console.log(`⏱️  Intervalo: ${CONFIG.CHECK_INTERVAL / 1000}s`);
    console.log(`📋 Notificações carregadas: ${notifications.length}`);
    console.log(`✅ Eventos processados: ${processedEvents.size}\n`);

    // Iniciar servidor
    const server = app.listen(CONFIG.PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor rodando na porta ${CONFIG.PORT}`);
    });

    server.on('error', (err) => {
      console.error('❌ Erro ao iniciar servidor:', err);
      process.exit(1);
    });

    // Iniciar monitoramento
    setInterval(checkEvents, CONFIG.CHECK_INTERVAL);
    checkEvents();

  } catch (err) {
    console.error('❌ Erro fatal ao iniciar:', err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});

init();
