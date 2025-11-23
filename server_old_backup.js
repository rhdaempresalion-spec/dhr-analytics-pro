import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { decodePIX } from './pix-decoder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  DHR_PUBLIC_KEY: process.env.DHR_PUBLIC_KEY || 'pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE',
  DHR_SECRET_KEY: process.env.DHR_SECRET_KEY || 'sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD',
  DHR_API_URL: process.env.DHR_API_URL || 'https://api.dhrtecnologialtda.com/v1',
  CHECK_INTERVAL: parseInt(process.env.CHECK_INTERVAL_SECONDS || '5') * 1000,
  CACHE_INTERVAL: 30000, // Cache atualiza a cada 30 segundos
  PORT: parseInt(process.env.PORT || '3001')
};

const FILES = {
  notifications: path.join(__dirname, 'notifications.json'),
  processed: path.join(__dirname, 'processed.json')
};

let notifications = [];
let processedEvents = new Set();

// ===== CACHE GLOBAL (PERFORMANCE) =====
let transactionsCache = {
  data: [],
  lastUpdate: 0,
  isUpdating: false
};

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
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
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

// ===== BUSCAR TRANSAÇÕES COM CACHE (PERFORMANCE) =====

async function fetchAllTransactions() {
  const now = Date.now();
  
  // Se cache é recente (menos de 30s), retorna cache
  if (now - transactionsCache.lastUpdate < CONFIG.CACHE_INTERVAL && transactionsCache.data.length > 0) {
    console.log('⚡ Usando cache (instantâneo)');
    return transactionsCache.data;
  }
  
  // Se já está atualizando, aguarda e retorna cache atual
  if (transactionsCache.isUpdating) {
    console.log('⏳ Aguardando atualização em andamento...');
    return transactionsCache.data;
  }
  
  // Atualizar cache
  transactionsCache.isUpdating = true;
  console.log('🔄 Atualizando cache de transações...');
  
  try {
    let allTransactions = [];
    let page = 1;
    const pageSize = 200;
    let hasMore = true;
    
    while (hasMore) {
      try {
        const data = await fetchDHR(`/transactions?page=${page}&pageSize=${pageSize}`);
        const transactions = data.data || [];
        
        if (transactions.length === 0) {
          hasMore = false;
        } else {
          allTransactions = allTransactions.concat(transactions);
          page++;
          
          // Limite de segurança: máximo 100 páginas (20.000 transações)
          if (page > 100) {
            console.log('  ⚠️  Limite de 100 páginas atingido');
            hasMore = false;
          }
        }
      } catch (error) {
        console.error(`  ❌ Erro na página ${page}:`, error.message);
        hasMore = false;
      }
    }
    
    transactionsCache.data = allTransactions;
    transactionsCache.lastUpdate = Date.now();
    console.log(`✅ Cache atualizado: ${allTransactions.length} transações`);
    
    return allTransactions;
  } finally {
    transactionsCache.isUpdating = false;
  }
}

// Atualizar cache em background periodicamente
setInterval(async () => {
  if (!transactionsCache.isUpdating) {
    try {
      await fetchAllTransactions();
    } catch (error) {
      console.error('❌ Erro ao atualizar cache:', error.message);
    }
  }
}, CONFIG.CACHE_INTERVAL);

// ===== FILTROS =====

function applyFilters(transactions, filters) {
  let result = [...transactions];

  if (filters.startDate) {
    const start = new Date(filters.startDate + 'T00:00:00-03:00').getTime();
    result = result.filter(t => new Date(t.createdAt).getTime() >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate + 'T23:59:59-03:00').getTime();
    result = result.filter(t => new Date(t.createdAt).getTime() <= end);
  }

  if (filters.status === 'paid') {
    result = result.filter(t => t.status === 'paid');
  } else if (filters.status === 'pending') {
    result = result.filter(t => ['waiting_payment', 'pending'].includes(t.status));
  }

  if (filters.paymentMethod && filters.paymentMethod !== 'all') {
    result = result.filter(t => t.paymentMethod === filters.paymentMethod);
  }

  if (filters.products && filters.products.length > 0) {
    const productList = filters.products.split(',');
    result = result.filter(t => {
      if (!t.items || !t.items[0]) return false;
      const productType = t.items[0].title.split(' - ')[0].trim();
      return productList.includes(productType);
    });
  }

  return result;
}

// ===== ANÁLISES =====

function analyzeDashboard(transactions, allTransactions) {
  // Usar allTransactions (sem filtros) para semana/mês
  const now = new Date();
  const brazilNow = new Date(now.getTime() - (3 * 60 * 60 * 1000));
  const today = new Date(brazilNow.getFullYear(), brazilNow.getMonth(), brazilNow.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const weekAgo = new Date(today.getTime() - 7*86400000);
  const monthAgo = new Date(today.getTime() - 30*86400000);

  // HOJE: usar transações filtradas
  const todayTxs = transactions.filter(t => {
    const txDate = new Date(t.createdAt);
    const txBrazil = new Date(txDate.getTime() - (3 * 60 * 60 * 1000));
    const txDay = new Date(txBrazil.getFullYear(), txBrazil.getMonth(), txBrazil.getDate());
    return txDay.getTime() === today.getTime();
  });
  
  // SEMANA E MÊS: usar TODAS as transações (ignorar filtros)
  const weekTxs = allTransactions.filter(t => new Date(t.createdAt) >= weekAgo);
  const monthTxs = allTransactions.filter(t => new Date(t.createdAt) >= monthAgo);

  // Calcular leads únicos (CPFs únicos) APENAS DE HOJE
  const uniqueLeads = new Set();
  todayTxs.forEach(t => {
    if (t.customer && t.customer.document && t.customer.document.number) {
      uniqueLeads.add(t.customer.document.number);
    }
  });
  const totalLeads = uniqueLeads.size;

  // Função de cálculo COM CONVERSÃO POR CPF ÚNICO
  const calc = (txs) => {
    const paid = txs.filter(t => t.status === 'paid');
    const pending = txs.filter(t => ['waiting_payment','pending'].includes(t.status));
    const paidAmount = paid.reduce((s,t) => s + (t.amount||0), 0) / 100;
    const netAmount = paid.reduce((s,t) => s + (t.fee?.netAmount||0), 0) / 100;
    const estimatedFee = paidAmount - netAmount;
    const refundedAmount = txs.reduce((s,t) => s + (t.refundedAmount||0), 0) / 100;
    
    // CONVERSÃO POR CPF ÚNICO POR DIA
    const uniqueCPFsByDay = new Map(); // Map<data, Set<cpf>>
    
    txs.forEach(t => {
      if (t.customer && t.customer.document && t.customer.document.number) {
        const txDate = new Date(t.createdAt);
        const txBrazil = new Date(txDate.getTime() - (3 * 60 * 60 * 1000));
        const dayKey = txBrazil.toISOString().split('T')[0]; // YYYY-MM-DD
        
        if (!uniqueCPFsByDay.has(dayKey)) {
          uniqueCPFsByDay.set(dayKey, new Set());
        }
        uniqueCPFsByDay.get(dayKey).add(t.customer.document.number);
      }
    });
    
    // Contar total de CPFs únicos (soma de todos os dias)
    let totalUniqueCPFs = 0;
    uniqueCPFsByDay.forEach(cpfSet => {
      totalUniqueCPFs += cpfSet.size;
    });
    
    // Contar CPFs únicos que pagaram
    const paidCPFsByDay = new Map();
    
    paid.forEach(t => {
      if (t.customer && t.customer.document && t.customer.document.number) {
        const txDate = new Date(t.createdAt);
        const txBrazil = new Date(txDate.getTime() - (3 * 60 * 60 * 1000));
        const dayKey = txBrazil.toISOString().split('T')[0];
        
        if (!paidCPFsByDay.has(dayKey)) {
          paidCPFsByDay.set(dayKey, new Set());
        }
        paidCPFsByDay.get(dayKey).add(t.customer.document.number);
      }
    });
    
    let totalPaidUniqueCPFs = 0;
    paidCPFsByDay.forEach(cpfSet => {
      totalPaidUniqueCPFs += cpfSet.size;
    });
    
    // Conversão real: CPFs que pagaram / CPFs totais
    const conversion = totalUniqueCPFs > 0 
      ? ((totalPaidUniqueCPFs / totalUniqueCPFs) * 100).toFixed(1)
      : 0;
    
    return {
      total: txs.length,
      paid: paid.length,
      pending: pending.length,
      paidAmount,
      pendingAmount: pending.reduce((s,t) => s + (t.amount||0), 0) / 100,
      totalAmount: txs.reduce((s,t) => s + (t.amount||0), 0) / 100,
      avgTicket: paid.length ? paid.reduce((s,t) => s + (t.amount||0), 0) / paid.length / 100 : 0,
      conversion, // Conversão por CPF único
      netAmount,
      estimatedFee,
      refundedAmount,
      uniqueCPFs: totalUniqueCPFs, // Adicionar para debug
      paidUniqueCPFs: totalPaidUniqueCPFs // Adicionar para debug
    };
  };

  const hourly = Array(24).fill(0).map(() => ({sales:0, amount:0}));
  todayTxs.filter(t => t.status === 'paid').forEach(t => {
    const date = new Date(t.createdAt);
    const utcHour = date.getUTCHours();
    const spHour = (utcHour - 3 + 24) % 24;
    hourly[spHour].sales++;
    hourly[spHour].amount += (t.amount||0) / 100;
  });

  const bestHour = hourly.reduce((best, curr, idx) => 
    curr.sales > hourly[best].sales ? idx : best, 0);

  const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const byWeekday = weekdays.map(d => ({day:d, sales:0, amount:0}));
  weekTxs.filter(t => t.status === 'paid').forEach(t => {
    const date = new Date(t.createdAt);
    const spDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
    const d = spDate.getUTCDay();
    byWeekday[d].sales++;
    byWeekday[d].amount += (t.amount||0) / 100;
  });

  return {
    today: calc(todayTxs),
    week: calc(weekTxs), // Usa TODAS as transações
    month: calc(monthTxs), // Usa TODAS as transações
    hourly,
    bestHour: `${bestHour}:00`,
    weekdayStats: byWeekday,
    totalLeads: totalLeads
  };
}

function analyzePIX(transactions) {
  const pixTxs = transactions.filter(t => t.paymentMethod === 'pix');
  const paid = pixTxs.filter(t => t.status === 'paid');
  const pending = pixTxs.filter(t => ['waiting_payment','pending'].includes(t.status));

  const merchantMap = {};
  pixTxs.forEach(t => {
    const pixInfo = decodePIX(t.pix?.qrcode);
    const name = pixInfo.full;
    
    if (!merchantMap[name]) {
      merchantMap[name] = {
        name,
        merchant: pixInfo.merchant,
        acquirer: pixInfo.acquirer,
        total: 0,
        paid: 0,
        pending: 0,
        amount: 0
      };
    }
    merchantMap[name].total++;
    if (t.status === 'paid') {
      merchantMap[name].paid++;
      merchantMap[name].amount += (t.amount||0) / 100;
    } else if (['waiting_payment','pending'].includes(t.status)) {
      merchantMap[name].pending++;
    }
  });

  // CONVERSÃO POR CPF ÚNICO PARA PIX
  const uniqueCPFs = new Set();
  const paidCPFs = new Set();
  
  pixTxs.forEach(t => {
    if (t.customer && t.customer.document && t.customer.document.number) {
      const cpf = t.customer.document.number;
      uniqueCPFs.add(cpf);
      if (t.status === 'paid') {
        paidCPFs.add(cpf);
      }
    }
  });
  
  const conversionRate = uniqueCPFs.size > 0 
    ? ((paidCPFs.size / uniqueCPFs.size) * 100).toFixed(1)
    : 0;

  const ranking = Object.values(merchantMap).map(m => ({
    ...m,
    conversion: m.total ? (m.paid / m.total * 100).toFixed(1) : 0
  })).sort((a,b) => b.paid - a.paid);

  const amounts = {};
  pixTxs.forEach(t => {
    const amt = ((t.amount||0)/100).toFixed(2);
    amounts[amt] = (amounts[amt]||0) + 1;
  });

  const topAmounts = Object.entries(amounts)
    .map(([amt, cnt]) => ({amount:parseFloat(amt), count:cnt}))
    .sort((a,b) => b.count - a.count)
    .slice(0,10);

  let avgTime = 0;
  if (paid.length) {
    const times = paid.filter(t => t.updatedAt).map(t => 
      new Date(t.updatedAt) - new Date(t.createdAt)
    );
    if (times.length) avgTime = times.reduce((s,t) => s+t, 0) / times.length / 60000;
  }

  return {
    total: pixTxs.length,
    paid: paid.length,
    pending: pending.length,
    uniqueMerchants: Object.keys(merchantMap).length,
    conversionRate, // Conversão por CPF único
    avgPaymentTime: avgTime.toFixed(1) + ' min',
    ranking: ranking,
    topValues: topAmounts.map(a => ({value: a.amount, count: a.count}))
  };
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
    console.error('Erro:', err.message);
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
      console.error(`❌ Erro: ${err.message}`);
    }
  }
}

function formatMsg(notif, tx) {
  const vars = {
    '{VALOR}': `R$ ${((tx.amount||0)/100).toFixed(2)}`,
    '{CLIENTE}': tx.customer?.name || 'Cliente',
    '{EMAIL}': tx.customer?.email || '',
    '{DOCUMENTO}': tx.customer?.document || '',
    '{METODO}': tx.paymentMethod || '',
    '{ID}': tx.id || '',
    '{DATA}': new Date().toLocaleString('pt-BR'),
    '{PARCELAS}': tx.installments || '1'
  };

  let title = notif.title;
  let text = notif.text;
  Object.entries(vars).forEach(([k,v]) => {
    title = title.replace(new RegExp(k, 'g'), v);
    text = text.replace(new RegExp(k, 'g'), v);
  });

  return {title, text};
}

// ===== API =====

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/api/products', async (req, res) => {
  try {
    const txs = await fetchAllTransactions();
    const products = new Set();
    
    txs.forEach(t => {
      if (t.items && t.items[0] && t.items[0].title) {
        const productType = t.items[0].title.split(' - ')[0].trim();
        products.add(productType);
      }
    });
    
    res.json(Array.from(products).sort());
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get('/api/dashboard', async (req, res) => {
  try {
    const allTxs = await fetchAllTransactions();
    const filteredTxs = applyFilters(allTxs, req.query);
    res.json(analyzeDashboard(filteredTxs, allTxs)); // Passa ambos
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get('/api/pix', async (req, res) => {
  try {
    let txs = await fetchAllTransactions();
    txs = applyFilters(txs, {...req.query, paymentMethod: 'pix'});
    res.json(analyzePIX(txs));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get('/api/export/csv', async (req, res) => {
  try {
    let allTxs = await fetchAllTransactions();
    let txs = applyFilters(allTxs, req.query);
    
    const rows = [
      ['ID','Data','Cliente','Email','Telefone','Produto','Quantidade','Valor','Status'],
      ...txs.map(t => [
        t.id,
        new Date(t.createdAt).toLocaleString('pt-BR'),
        t.customer?.name || '',
        t.customer?.email || '',
        t.customer?.phone || '',
        t.items?.[0]?.title || '',
        t.items?.[0]?.quantity || 1,
        ((t.amount||0)/100).toFixed(2),
        t.status
      ])
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send(rows.map(r => r.join(',')).join('\n'));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get('/api/export/txt', async (req, res) => {
  try {
    let allTxs = await fetchAllTransactions();
    let txs = applyFilters(allTxs, req.query);
    
    let txt = 'RELATÓRIO DE TRANSAÇÕES DHR PAGAMENTOS\n';
    txt += '='.repeat(80) + '\n\n';
    txt += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n`;
    txt += `Total de Transações: ${txs.length}\n\n`;
    txt += '='.repeat(80) + '\n\n';
    
    txs.forEach((t, idx) => {
      txt += `LEAD #${idx + 1}\n`;
      txt += `-`.repeat(80) + '\n';
      txt += `ID: ${t.id}\n`;
      txt += `Data: ${new Date(t.createdAt).toLocaleString('pt-BR')}\n`;
      txt += `Cliente: ${t.customer?.name || 'N/A'}\n`;
      txt += `Email: ${t.customer?.email || 'N/A'}\n`;
      txt += `Telefone: ${t.customer?.phone || 'N/A'}\n`;
      txt += `Documento: ${t.customer?.document?.number || 'N/A'}\n`;
      if (t.items && t.items.length > 0) {
        txt += `Produto: ${t.items[0].title}\n`;
        txt += `Quantidade: ${t.items[0].quantity}x\n`;
      }
      txt += `Valor: R$ ${((t.amount||0)/100).toFixed(2)}\n`;
      txt += `Status: ${t.status}\n`;
      txt += '\n';
    });
    
    txt += '='.repeat(80) + '\n';
    txt += 'FIM DO RELATÓRIO\n';

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.txt');
    res.send(txt);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get('/api/export/excel', async (req, res) => {
  try {
    let allTxs = await fetchAllTransactions();
    let txs = applyFilters(allTxs, req.query);
    
    const rows = [
      ['ID','Data','Cliente','Email','Telefone','Produto','Quantidade','Valor','Status'],
      ...txs.map(t => [
        t.id,
        new Date(t.createdAt).toLocaleString('pt-BR'),
        t.customer?.name || '',
        t.customer?.email || '',
        t.customer?.phone || '',
        t.items?.[0]?.title || '',
        t.items?.[0]?.quantity || 1,
        ((t.amount||0)/100).toFixed(2),
        t.status
      ])
    ];

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.xls');
    res.send(rows.map(r => r.join('\t')).join('\n'));
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.post('/api/notifications', async (req, res) => {
  const n = {id: Date.now().toString(), enabled: true, ...req.body};
  notifications.push(n);
  await saveFile(FILES.notifications, notifications);
  res.json(n);
});

app.put('/api/notifications/:id', async (req, res) => {
  const idx = notifications.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({error: 'Not found'});
  notifications[idx] = {...notifications[idx], ...req.body};
  await saveFile(FILES.notifications, notifications);
  res.json(notifications[idx]);
});

app.delete('/api/notifications/:id', async (req, res) => {
  notifications = notifications.filter(n => n.id !== req.params.id);
  await saveFile(FILES.notifications, notifications);
  res.json({success: true});
});

app.post('/api/notifications/:id/toggle', async (req, res) => {
  const n = notifications.find(n => n.id === req.params.id);
  if (!n) return res.status(404).json({error: 'Not found'});
  n.enabled = !n.enabled;
  await saveFile(FILES.notifications, notifications);
  res.json(n);
});

app.post('/api/notifications/:id/test', async (req, res) => {
  const n = notifications.find(n => n.id === req.params.id);
  if (!n) return res.status(404).json({error: 'Not found'});
  
  try {
    const testTx = {
      id: 'TEST123',
      amount: 3635,
      customer: {
        name: 'Cliente Teste',
        email: 'teste@exemplo.com',
        document: '12345678900'
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

// ===== INIT =====

async function init() {
  notifications = await loadFile(FILES.notifications, []);
  const processed = await loadFile(FILES.processed, []);
  processedEvents = new Set(processed);

  console.log('\n🚀 DHR Analytics PRO - OTIMIZADO');
  console.log(`📍 http://localhost:${CONFIG.PORT}`);
  console.log(`⚡ Cache: ${CONFIG.CACHE_INTERVAL/1000}s`);
  console.log(`🔄 Notificações: ${CONFIG.CHECK_INTERVAL/1000}s\n`);

  // Carregar cache inicial
  await fetchAllTransactions();

  app.listen(CONFIG.PORT);
  setInterval(checkEvents, CONFIG.CHECK_INTERVAL);
  checkEvents();
}

init();
