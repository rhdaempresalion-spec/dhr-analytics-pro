// ===== ESTADO GLOBAL =====
let currentFilters = {
  startDate: '',
  endDate: '',
  status: 'all',
  paymentMethod: 'all',
  products: []
};

let analysisData = {
  adSpend: 0,
  leads: 0,
  chargeback: 0
};

let dashboardData = null;
let editingNotificationId = null;

let charts = {
  hourly: null,
  weekday: null,
  amounts: null
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupFilters();
  loadProducts();
  loadDashboard();
  loadNotifications();
  loadAnalysisData();
  
  // Auto-refresh a cada 3 segundos para atualização em tempo real
  setInterval(() => {
    const activeTab = document.querySelector('.tab.active')?.dataset.tab;
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'pix') loadPIX();
    if (activeTab === 'analysis') updateAnalysis();
  }, 3000);
});

// ===== TABS =====
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Ativar tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mostrar conteúdo
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(`tab-${tabName}`).classList.remove('hidden');
      
      // Carregar dados
      if (tabName === 'dashboard') loadDashboard();
      if (tabName === 'pix') loadPIX();
      if (tabName === 'analysis') {
        updateAnalysis();
        setTimeout(() => calculateAnalysis(), 200);
      }
      if (tabName === 'notifications') loadNotifications();
    });
  });
}

// ===== PRODUTOS =====
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    const select = document.getElementById('filter-products');
    if (!select) return;
    
    select.innerHTML = '<option value="all">Todos</option>';
    
    products.forEach(p => {
      const option = document.createElement('option');
      option.value = p;
      option.textContent = p;
      select.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
  }
}

// ===== FILTROS =====
function setupFilters() {
  // Filtros já configurados no HTML
}

function applyFilters() {
  const startDate = document.getElementById('filter-start-date').value;
  const endDate = document.getElementById('filter-end-date').value;
  const status = document.getElementById('filter-status').value;
  const method = document.getElementById('filter-method').value;
  
  // Pegar produtos selecionados
  const productsSelect = document.getElementById('filter-products');
  const selectedProducts = productsSelect ? Array.from(productsSelect.selectedOptions).map(opt => opt.value) : [];
  
  currentFilters = {
    startDate,
    endDate,
    status,
    paymentMethod: method,
    products: selectedProducts.includes('all') ? [] : selectedProducts
  };
  
  loadDashboard();
  showToast('✅ Filtros aplicados');
}

function clearFilters() {
  document.getElementById('filter-start-date').value = '';
  document.getElementById('filter-end-date').value = '';
  document.getElementById('filter-status').value = 'all';
  document.getElementById('filter-method').value = 'all';
  
  const productsSelect = document.getElementById('filter-products');
  if (productsSelect) {
    Array.from(productsSelect.options).forEach(opt => {
      opt.selected = opt.value === 'all';
    });
  }
  
  currentFilters = {
    startDate: '',
    endDate: '',
    status: 'all',
    paymentMethod: 'all',
    products: []
  };
  
  loadDashboard();
  showToast('🔄 Filtros limpos');
}

function buildQueryString() {
  const params = new URLSearchParams();
  if (currentFilters.startDate) params.append('startDate', currentFilters.startDate);
  if (currentFilters.endDate) params.append('endDate', currentFilters.endDate);
  if (currentFilters.status !== 'all') params.append('status', currentFilters.status);
  if (currentFilters.paymentMethod !== 'all') params.append('paymentMethod', currentFilters.paymentMethod);
  if (currentFilters.products && currentFilters.products.length > 0) {
    params.append('products', currentFilters.products.join(','));
  }
  return params.toString();
}

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const query = buildQueryString();
    const response = await fetch(`/api/dashboard?${query}`);
    const data = await response.json();
    
    dashboardData = data;
    updateDashboardCards(data);
    updateCharts(data);
    loadProductsSoldToday();
    
    // Atualizar análise se a aba estiver ativa
    const activeTab = document.querySelector('.tab.active')?.dataset.tab;
    if (activeTab === 'analysis') {
      calculateAnalysis();
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    showToast('❌ Erro ao carregar dados');
  }
}

async function loadProductsSoldToday() {
  try {
    const response = await fetch('/api/products-sold-today');
    const products = await response.json();
    
    const container = document.getElementById('products-sold-container');
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">Nenhum produto vendido hoje</div>';
      return;
    }
    
    let html = '<div class="table-container"><table>';
    html += '<thead><tr>';
    html += '<th>Produto</th>';
    html += '<th style="text-align: center;">Vendas Pagas</th>';
    html += '<th style="text-align: center;">Quantidade</th>';
    html += '<th style="text-align: right;">Valor Líquido Recebido</th>';
    html += '<th style="text-align: right;">Ticket Médio Líquido</th>';
    html += '</tr></thead><tbody>';
    
    products.forEach(product => {
      html += '<tr>';
      html += `<td><strong>${product.name}</strong></td>`;
      html += `<td style="text-align: center;">`;
      html += `<span class="badge badge-success">${product.paidSales}</span>`;
      html += `</td>`;
      html += `<td style="text-align: center;">${product.paidSales}x</td>`;
      html += `<td style="text-align: right;"><strong>${formatMoney(product.paidNetAmount)}</strong></td>`;
      html += `<td style="text-align: right;">${formatMoney(parseFloat(product.avgNetTicket))}</td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
  } catch (error) {
    console.error('Erro ao carregar produtos vendidos:', error);
  }
}

function updateDashboardCards(data) {
  // Usar data.period em vez de data.today (período filtrado)
  const periodData = data.period || data.today; // Fallback para compatibilidade
  
  // Lucro Líquido do Período
  document.getElementById('net-amount').textContent = formatMoney(periodData.netAmount);
  const fee = periodData.estimatedFee || 0;
  document.getElementById('net-subtitle').textContent = `Taxa: ${formatMoney(fee)}`;
  
  // Vendas Pagas do Período
  document.getElementById('today-paid-amount').textContent = formatMoney(periodData.paidAmount);
  document.getElementById('today-paid-count').textContent = `${periodData.paid} transações`;
  
  // Vendas Pendentes do Período
  document.getElementById('today-pending-amount').textContent = formatMoney(periodData.pendingAmount);
  document.getElementById('today-pending-count').textContent = `${periodData.pending} transações`;
  
  // Ticket Médio
  document.getElementById('avg-ticket').textContent = formatMoney(periodData.avgTicket);
  
  // Últimos 7 dias (baseado na data final do período)
  document.getElementById('week-paid-amount').textContent = formatMoney(data.week.paidAmount);
  document.getElementById('week-paid-count').textContent = `${data.week.paid} transações`;
  
  // Últimos 30 dias (baseado na data final do período)
  document.getElementById('month-paid-amount').textContent = formatMoney(data.month.paidAmount);
  document.getElementById('month-paid-count').textContent = `${data.month.paid} transações`;
  
  // Taxa de Conversão
  document.getElementById('conversion-rate').textContent = periodData.conversion + '%';
  
  // Melhor horário
  document.getElementById('best-hour').textContent = data.bestHour;
}

function updateCharts(data) {
  // Gráfico por hora
  const hourlyCtx = document.getElementById('chart-hourly')?.getContext('2d');
  if (hourlyCtx) {
    if (charts.hourly) charts.hourly.destroy();
    
    charts.hourly = new Chart(hourlyCtx, {
      type: 'bar',
      data: {
        labels: data.hourly.map((_, i) => `${i}:00`),
        datasets: [{
          label: 'Vendas',
          data: data.hourly.map(h => h.sales),
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
  
  // Gráfico por dia da semana
  const weekdayCtx = document.getElementById('chart-weekday')?.getContext('2d');
  if (weekdayCtx) {
    if (charts.weekday) charts.weekday.destroy();
    
    charts.weekday = new Chart(weekdayCtx, {
      type: 'bar',
      data: {
        labels: data.weekdayStats.map(w => w.day),
        datasets: [{
          label: 'Vendas',
          data: data.weekdayStats.map(w => w.sales),
          backgroundColor: '#10b981'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }
}

// ===== ANÁLISE DO DIA =====
function loadAnalysisData() {
  const saved = localStorage.getItem('analysisData');
  if (saved) {
    analysisData = JSON.parse(saved);
    const adSpendInput = document.getElementById('input-ad-spend');
    const leadsInput = document.getElementById('input-leads');
    const chargebackInput = document.getElementById('input-chargeback');
    
    if (adSpendInput) adSpendInput.value = analysisData.adSpend || '';
    if (leadsInput) leadsInput.value = analysisData.leads || '';
    if (chargebackInput) chargebackInput.value = analysisData.chargeback || '';
  }
}

function saveAnalysisData() {
  localStorage.setItem('analysisData', JSON.stringify(analysisData));
}

async function updateAnalysis() {
  if (!dashboardData) {
    await loadDashboard();
  }
  calculateAnalysis();
}

function calculateAnalysis() {
  // Pegar valores dos inputs
  const adSpendInput = document.getElementById('input-ad-spend');
  const leadsInput = document.getElementById('input-leads');
  const chargebackInput = document.getElementById('input-chargeback');
  
  if (!adSpendInput) return; // Aba não carregada ainda
  
  analysisData.adSpend = parseFloat(adSpendInput.value) || 0;
  // Leads agora vem do backend (CPFs únicos do período)
  const leadsFromAPI = dashboardData?.totalLeads || 0;
  analysisData.leads = leadsFromAPI;
  // Chargeback agora vem do backend (refundedAmount do período)
  const periodData = dashboardData?.period || dashboardData?.today || {};
  const chargebackFromAPI = periodData.refundedAmount || 0;
  analysisData.chargeback = chargebackFromAPI;
  
  // Atualizar campo de leads com valor automático
  if (leadsInput) {
    leadsInput.value = leadsFromAPI;
    leadsInput.disabled = true;
    leadsInput.style.backgroundColor = '#f0f0f0';
    leadsInput.style.cursor = 'not-allowed';
  }
  
  // Atualizar campo de chargeback com valor automático
  if (chargebackInput) {
    chargebackInput.value = chargebackFromAPI.toFixed(2);
    chargebackInput.disabled = true;
    chargebackInput.style.backgroundColor = '#f0f0f0';
    chargebackInput.style.cursor = 'not-allowed';
  }
  
  saveAnalysisData();
  
  if (!dashboardData) return;
  
  // Usar dados do período filtrado (periodData já foi declarado acima)
  const revenue = periodData.paidAmount || 0;
  const profit = periodData.netAmount || 0;
  const fees = periodData.estimatedFee || 0;
  const sales = periodData.paid || 0;
  
  // Atualizar cards principais
  const revenueEl = document.getElementById('analysis-revenue');
  const profitEl = document.getElementById('analysis-profit');
  const feesEl = document.getElementById('analysis-fees');
  
  if (revenueEl) revenueEl.textContent = formatMoney(revenue);
  if (profitEl) profitEl.textContent = formatMoney(profit);
  if (feesEl) feesEl.textContent = formatMoney(fees);
  
  // Calcular métricas
  const adSpend = analysisData.adSpend;
  const leads = analysisData.leads;
  const chargeback = analysisData.chargeback;
  
  // ROI = ((Lucro - Investimento) / Investimento) * 100
  const roi = adSpend > 0 ? ((profit - adSpend) / adSpend * 100) : 0;
  const roiEl = document.getElementById('metric-roi');
  if (roiEl) {
    roiEl.textContent = roi.toFixed(1) + '%';
    roiEl.style.color = roi >= 0 ? '#10b981' : '#ef4444';
  }
  
  // ROAS = Receita / Gasto com Anúncios
  const roas = adSpend > 0 ? (revenue / adSpend) : 0;
  const roasEl = document.getElementById('metric-roas');
  if (roasEl) roasEl.textContent = roas.toFixed(2) + 'x';
  
  // Margem de Lucro = (Lucro Líquido / Receita) * 100
  const margin = revenue > 0 ? ((profit - adSpend - chargeback) / revenue * 100) : 0;
  const marginEl = document.getElementById('metric-margin');
  if (marginEl) {
    marginEl.textContent = margin.toFixed(1) + '%';
    marginEl.style.color = margin >= 0 ? '#10b981' : '#ef4444';
  }
  
  // Custo por Lead
  const cpl = leads > 0 ? (adSpend / leads) : 0;
  const cplEl = document.getElementById('metric-cpl');
  if (cplEl) cplEl.textContent = formatMoney(cpl);
  
  // CPA (Custo por Aquisição)
  const cpa = sales > 0 ? (adSpend / sales) : 0;
  const cpaEl = document.getElementById('metric-cpa');
  if (cpaEl) cpaEl.textContent = formatMoney(cpa);
  
  // Reembolsos
  const refunded = dashboardData.today.refundedAmount || 0;
  const lossesEl = document.getElementById('metric-losses');
  if (lossesEl) lossesEl.textContent = formatMoney(refunded);
}

// ===== PIX =====
async function loadPIX() {
  try {
    const query = buildQueryString();
    const response = await fetch(`/api/pix?${query}`);
    const data = await response.json();
    
    // Atualizar cards
    document.getElementById('pix-total').textContent = data.total;
    document.getElementById('pix-paid').textContent = data.paid;
    document.getElementById('pix-pending').textContent = data.pending;
    document.getElementById('pix-merchants').textContent = data.uniqueMerchants;
    document.getElementById('pix-conversion').textContent = data.conversionRate + '%';
    document.getElementById('pix-avg-time').textContent = data.avgPaymentTime;
    
    // Ranking
    const rankingContainer = document.getElementById('merchant-ranking');
    rankingContainer.innerHTML = data.ranking.slice(0, 10).map((m, idx) => `
      <div class="ranking-item">
        <div class="ranking-position">#${idx + 1}</div>
        <div class="ranking-info">
          <div class="ranking-name">${m.merchant}</div>
          <div class="ranking-acquirer">${m.acquirer}</div>
        </div>
        <div class="ranking-stats">
          <div>${m.total} PIX</div>
          <div style="color: var(--success)">${m.paid} pagos</div>
          <div>${m.conversion}% conversão</div>
        </div>
      </div>
    `).join('');
    
    // Top valores
    const valuesContainer = document.getElementById('top-values');
    valuesContainer.innerHTML = data.topValues.slice(0, 10).map((v, idx) => `
      <div class="value-item">
        <span>#${idx + 1}</span>
        <span>${formatMoney(v.value)}</span>
        <span>${v.count}x</span>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar PIX:', error);
  }
}

// ===== NOTIFICAÇÕES =====
async function loadNotifications() {
  try {
    const response = await fetch('/api/notifications');
    const notifications = await response.json();
    
    const container = document.getElementById('notifications-list');
    
    if (notifications.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <p style="font-size: 16px; margin-bottom: 8px;">Nenhuma notificação configurada</p>
          <p style="font-size: 14px;">Clique em "Nova Notificação" para começar</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = notifications.map(n => `
      <div class="notif-item">
        <div class="notif-info">
          <h4>${n.name}</h4>
          <p>${n.eventType === 'sale_paid' ? '💰 Venda Paga' : '🔄 Reembolso'} • ${n.enabled ? '<span style="color: var(--success)">Ativo</span>' : '<span style="color: var(--text-muted)">Inativo</span>'}</p>
        </div>
        <div class="notif-actions">
          <div class="toggle ${n.enabled ? 'active' : ''}" onclick="toggleNotification('${n.id}')"></div>
          <button class="btn btn-sm btn-secondary" onclick="editNotification('${n.id}')">✏️ Editar</button>
          <button class="btn btn-sm btn-secondary" onclick="testNotification('${n.id}')">🧪 Testar</button>
          <button class="btn btn-sm btn-secondary" onclick="deleteNotification('${n.id}')">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar notificações:', error);
  }
}

function openNotificationModal() {
  editingNotificationId = null;
  document.querySelector('#notification-modal .modal-header h3').textContent = 'Nova Notificação';
  document.getElementById('notification-modal').classList.remove('hidden');
}

function closeNotificationModal() {
  editingNotificationId = null;
  document.getElementById('notification-modal').classList.add('hidden');
  document.getElementById('notification-form').reset();
}

async function editNotification(id) {
  try {
    const response = await fetch('/api/notifications');
    const notifications = await response.json();
    const notif = notifications.find(n => n.id === id);
    
    if (!notif) {
      showToast('❌ Notificação não encontrada');
      return;
    }
    
    editingNotificationId = id;
    
    document.getElementById('notif-name').value = notif.name;
    document.getElementById('notif-url').value = notif.url;
    document.getElementById('notif-event').value = notif.eventType;
    document.getElementById('notif-title').value = notif.title;
    document.getElementById('notif-text').value = notif.text;
    
    document.querySelector('#notification-modal .modal-header h3').textContent = 'Editar Notificação';
    document.getElementById('notification-modal').classList.remove('hidden');
  } catch (error) {
    console.error('Erro ao editar notificação:', error);
    showToast('❌ Erro ao carregar notificação');
  }
}

document.getElementById('notification-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    name: document.getElementById('notif-name').value,
    url: document.getElementById('notif-url').value,
    eventType: document.getElementById('notif-event').value,
    title: document.getElementById('notif-title').value,
    text: document.getElementById('notif-text').value,
    enabled: true
  };
  
  try {
    if (editingNotificationId) {
      // Editar existente
      await fetch(`/api/notifications/${editingNotificationId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      showToast('✅ Notificação atualizada');
    } else {
      // Criar nova
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
      });
      showToast('✅ Notificação salva');
    }
    
    editingNotificationId = null;
    document.querySelector('#notification-modal .modal-header h3').textContent = 'Nova Notificação';
    closeNotificationModal();
    loadNotifications();
  } catch (error) {
    showToast('❌ Erro ao salvar');
  }
});

async function toggleNotification(id) {
  try {
    const response = await fetch(`/api/notifications/${id}/toggle`, {method: 'POST'});
    if (response.ok) {
      loadNotifications();
      showToast('✅ Status atualizado');
    }
  } catch (error) {
    showToast('❌ Erro ao atualizar');
  }
}

async function testNotification(id) {
  try {
    const response = await fetch(`/api/notifications/${id}/test`, {method: 'POST'});
    if (response.ok) {
      showToast('✅ Notificação de teste enviada!');
    } else {
      showToast('❌ Erro ao enviar teste');
    }
  } catch (error) {
    showToast('❌ Erro ao enviar teste');
  }
}

async function deleteNotification(id) {
  if (!confirm('Tem certeza que deseja excluir esta notificação?')) return;
  
  try {
    await fetch(`/api/notifications/${id}`, {method: 'DELETE'});
    loadNotifications();
    showToast('✅ Notificação excluída');
  } catch (error) {
    showToast('❌ Erro ao excluir');
  }
}

// ===== EXPORTAÇÃO =====
function exportCSV() {
  const query = buildQueryString();
  window.open(`/api/export/csv?${query}`, '_blank');
}

function exportExcel() {
  const query = buildQueryString();
  window.open(`/api/export/excel?${query}`, '_blank');
}

function exportTXT() {
  const query = buildQueryString();
  window.open(`/api/export/txt?${query}`, '_blank');
}

// ===== UTILS =====
function formatMoney(value) {
  return 'R$ ' + (value || 0).toFixed(2).replace('.', ',');
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-card);
    color: var(--text-primary);
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid var(--border);
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
