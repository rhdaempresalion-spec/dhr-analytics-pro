// Estado global dos filtros
let filterState = {
    period: 'today',
    account: 'all',
    traffic: 'all',
    platform: 'all',
    selectedProducts: new Set()
};

// Produtos disponíveis
let availableProducts = [];

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadDashboard();
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('productsPanel');
        const trigger = document.getElementById('productsTrigger');
        
        if (!panel.contains(e.target) && !trigger.contains(e.target)) {
            closeProductsPanel();
        }
    });
});

// ===== PRODUTOS =====

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        availableProducts = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        document.getElementById('productsList').innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ef4444;">
                ❌ Erro ao carregar produtos
            </div>
        `;
    }
}

function renderProducts() {
    const container = document.getElementById('productsList');
    
    if (availableProducts.length === 0) {
        container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #64748b;">
                Nenhum produto encontrado
            </div>
        `;
        return;
    }

    const productsHTML = availableProducts.map(product => {
        const isSelected = filterState.selectedProducts.has(product);
        return `
            <div class="product-item ${isSelected ? 'selected' : ''}" onclick="toggleProduct('${escapeHtml(product)}')">
                <input 
                    type="checkbox" 
                    class="product-checkbox"
                    ${isSelected ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleProduct('${escapeHtml(product)}')"
                >
                <span class="product-label">${escapeHtml(product)}</span>
            </div>
        `;
    }).join('');

    container.innerHTML = productsHTML;
    updateProductsLabel();
}

function toggleProduct(product) {
    if (filterState.selectedProducts.has(product)) {
        filterState.selectedProducts.delete(product);
    } else {
        filterState.selectedProducts.add(product);
    }
    renderProducts();
}

function selectAllProducts() {
    filterState.selectedProducts = new Set(availableProducts);
    renderProducts();
}

function clearAllProducts() {
    filterState.selectedProducts.clear();
    renderProducts();
}

function toggleProductsPanel() {
    const panel = document.getElementById('productsPanel');
    const trigger = document.getElementById('productsTrigger');
    
    if (panel.classList.contains('show')) {
        closeProductsPanel();
    } else {
        panel.classList.add('show');
        trigger.classList.add('active');
    }
}

function closeProductsPanel() {
    const panel = document.getElementById('productsPanel');
    const trigger = document.getElementById('productsTrigger');
    panel.classList.remove('show');
    trigger.classList.remove('active');
}

function updateProductsLabel() {
    const label = document.getElementById('productsSelected');
    const count = filterState.selectedProducts.size;
    
    if (count === 0) {
        label.textContent = 'Qualquer';
    } else if (count === 1) {
        label.textContent = Array.from(filterState.selectedProducts)[0];
    } else {
        label.textContent = `${count} produtos selecionados`;
    }
}

// ===== DASHBOARD =====

async function loadDashboard() {
    try {
        // Construir query string com filtros
        const params = new URLSearchParams();
        
        // Converter período para datas
        const dates = getPeriodDates(filterState.period);
        if (dates.startDate) params.append('startDate', dates.startDate);
        if (dates.endDate) params.append('endDate', dates.endDate);
        
        // Outros filtros (quando implementados no backend)
        if (filterState.account !== 'all') params.append('account', filterState.account);
        if (filterState.traffic !== 'all') params.append('traffic', filterState.traffic);
        if (filterState.platform !== 'all') params.append('platform', filterState.platform);
        
        // Produtos selecionados
        if (filterState.selectedProducts.size > 0) {
            params.append('products', Array.from(filterState.selectedProducts).join(','));
        }

        const response = await fetch(`/api/dashboard?${params.toString()}`);
        if (!response.ok) throw new Error('Erro ao carregar dashboard');
        
        const data = await response.json();
        renderDashboard(data);
        updateTimestamp();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showError('Erro ao carregar dados do dashboard');
    }
}

function renderDashboard(data) {
    const grid = document.getElementById('dashboardGrid');
    
    // Cards principais
    const cards = [
        {
            label: 'Vendas Hoje',
            value: data.today.paid || 0,
            subtitle: `R$ ${formatMoney(data.today.paidAmount || 0)}`
        },
        {
            label: 'Pendentes Hoje',
            value: data.today.pending || 0,
            subtitle: `R$ ${formatMoney(data.today.pendingAmount || 0)}`
        },
        {
            label: 'Conversão Hoje',
            value: `${data.today.conversion || 0}%`,
            subtitle: `${data.today.total || 0} transações`
        },
        {
            label: 'Ticket Médio',
            value: `R$ ${formatMoney(data.today.avgTicket || 0)}`,
            subtitle: 'Valor médio por venda'
        },
        {
            label: 'Leads Únicos',
            value: data.totalLeads || 0,
            subtitle: 'CPFs únicos hoje'
        },
        {
            label: 'Vendas Semana',
            value: data.week.paid || 0,
            subtitle: `R$ ${formatMoney(data.week.paidAmount || 0)}`
        },
        {
            label: 'Vendas Mês',
            value: data.month.paid || 0,
            subtitle: `R$ ${formatMoney(data.month.paidAmount || 0)}`
        },
        {
            label: 'Melhor Horário',
            value: data.bestHour || '00:00',
            subtitle: 'Horário com mais vendas'
        }
    ];

    grid.innerHTML = cards.map(card => `
        <div class="dashboard-card">
            <div class="card-label">${card.label}</div>
            <div class="card-value">${card.value}</div>
            <div class="card-subtitle">${card.subtitle}</div>
        </div>
    `).join('');
}

function updateDashboard() {
    const btn = document.querySelector('.btn-update');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner"></div> Atualizando...';
    btn.disabled = true;

    loadDashboard().finally(() => {
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 500);
    });
}

// ===== UTILITÁRIOS =====

function getPeriodDates(period) {
    const today = new Date();
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    switch (period) {
        case 'today':
            return {
                startDate: formatDate(today),
                endDate: formatDate(today)
            };
        case 'yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return {
                startDate: formatDate(yesterday),
                endDate: formatDate(yesterday)
            };
        case '7days':
            const week = new Date(today);
            week.setDate(week.getDate() - 7);
            return {
                startDate: formatDate(week),
                endDate: formatDate(today)
            };
        case '30days':
            const month = new Date(today);
            month.setDate(month.getDate() - 30);
            return {
                startDate: formatDate(month),
                endDate: formatDate(today)
            };
        case 'custom':
            // Implementar seletor de datas customizado
            return {
                startDate: formatDate(today),
                endDate: formatDate(today)
            };
        default:
            return {
                startDate: formatDate(today),
                endDate: formatDate(today)
            };
    }
}

function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    document.getElementById('updateTime').textContent = `Atualizado às ${timeString}`;
}

function showError(message) {
    const grid = document.getElementById('dashboardGrid');
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444;">
            ❌ ${message}
        </div>
    `;
}
