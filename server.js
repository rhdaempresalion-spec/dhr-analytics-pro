import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações - usar variáveis de ambiente
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
app.use(express.json());
app.use(express.static('public'));

// Status do sistema
app.get('/api/status', (req, res) => {
  res.json({
    running: true,
    interval: CONFIG.CHECK_INTERVAL / 1000,
    activeNotifications: notifications.filter(n => n.enabled).length,
    processedCount: processedEvents.size
  });
});

// Gerenciar notificações
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

// Health check para Render
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
      console.log(`✅ Servidor rodando em http://0.0.0.0:${CONFIG.PORT}`);
      console.log(`✅ Sistema pronto para receber requisições\n`);
    });

    // Garantir que o servidor está escutando
    server.on('error', (err) => {
      console.error('❌ Erro ao iniciar servidor:', err);
      process.exit(1);
    });

    // Iniciar monitoramento após servidor estar pronto
    setTimeout(() => {
      console.log('🔄 Iniciando monitoramento de transações...\n');
      setInterval(checkEvents, CONFIG.CHECK_INTERVAL);
      checkEvents(); // Primeira verificação imediata
    }, 2000);

  } catch (err) {
    console.error('❌ Erro fatal ao iniciar:', err);
    process.exit(1);
  }
}

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Erro não tratado:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exceção não capturada:', err);
  process.exit(1);
});

init();
