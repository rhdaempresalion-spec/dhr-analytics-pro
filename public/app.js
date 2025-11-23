// ===== ESTADO GLOBAL (PERSISTE ENTRE ATUALIZAÇÕES) =====

let filterState = {
    period: 'today',
    startDate: '',
    endDate: '',
    status: 'all',
    method: 'all',
    selectedProducts: new Set()
};

let availableProducts = [];
let isUpdating = false;

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    initializeDates();
    loadProducts();
    loadDashboard();
    
    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('productsPanel');
        const trigger = document.getElementById('productsTrigger');
        
        if (panel && trigger && !panel.contains(e.target) && !trigger.contains(e.target)) {
            closeProductsPanel();
        }
    });
    
    // Listeners dos filtros (atualizam estado mas NÃO recarregam)
    const filterStatus = document.getElementById('filterStatus');
    const filterMethod = document.getElementById('filterMethod');
    const filterStartDate = document.getElementById('filterStartDate');
    const filterEndDate = document.getElementById('filterEndDate');
    
    if (filterStatus) {
        filterStatus.addEventListener('change', (e) => {
            filterState.status = e.target.value;
        });
    }
    
    if (filterMethod) {
        filterMethod.addEventListener('change', (e) => {
            filterState.method = e.target.value;
        });
    }
    
    if (filterStartDate) {
        filterStartDate.addEventListener('change', (e) => {
            filterState.startDate = e.target.value;
        });
    }
    
    if (filterEndDate) {
        filterEndDate.addEventListener('change', (e) => {
            filterState.endDate = e.target.value;
        });
    }
});

function initializeDates() {
    const today = new Date().toISOString().split('T')[0];
    filterState.startDate = today;
    filterState.endDate = today;
    
    const startInput = document.getElementById('filterStartDate');
    const endInput = document.getElementById('filterEndDate');
    
    if (startInput) startInput.value = today;
    if (endInput) endInput.value = today;
}

// ===== PERÍODO =====

function onPeriodChange() {
    const period = document.getElementById('filterPeriod').value;
    filterState.period = period;
    
    const dateStartGroup = document.getElementById('dateStartGroup');
    const dateEndGroup = document.getElementById('dateEndGroup');
    
    if (period === 'custom') {
        // Mostrar campos de data
        if (dateStartGroup) dateStartGroup.style.display = 'flex';
        if (dateEndGroup) dateEndGroup.style.display = 'flex';
    } else {
        // Ocultar campos de data
        if (dateStartGroup) dateStartGroup.style.display = 'none';
        if (dateEndGroup) dateEndGroup.style.display = 'none';
        
        // Calcular datas automaticamente
        const dates = getPeriodDates(period);
        filterState.startDate = dates.startDate;
        filterState.endDate = dates.endDate;
        
        const startInput = document.getElementById('filterStartDate');
        const endInput = document.getElementById('filterEndDate');
        
        if (startInput) startInput.value = dates.startDate;
        if (endInput) endInput.value = dates.endDate;
    }
}

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
        default:
            return {
                startDate: formatDate(today),
                endDate: formatDate(today)
            };
    }
}

// ===== PRODUTOS =====

async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Erro ao carregar produtos');
        
        availableProducts = await response.json();
        renderProducts();
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        const container = document.getElementById('productsList');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #ef4444;">
                    ❌ Erro ao carregar produtos
                </div>
            `;
        }
    }
}

function renderProducts() {
    const container = document.getElementById('productsList');
    if (!container) return;
    
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
        const escapedProduct = escapeHtml(product);
        return `
            <div class="product-item ${isSelected ? 'selected' : ''}" onclick="toggleProduct('${escapedProduct}')">
                <input 
                    type="checkbox" 
                    class="product-checkbox"
                    ${isSelected ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleProduct('${escapedProduct}')"
                >
                <span class="product-label">${escapedProduct}</span>
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
    
    if (!panel || !trigger) return;
    
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
    
    if (panel) panel.classList.remove('show');
    if (trigger) trigger.classList.remove('active');
}

function updateProductsLabel() {
    const label = document.getElementById('productsSelected');
    if (!label) return;
    
    const count = filterState.selectedProducts.size;
    
    if (count === 0) {
        label.textContent = 'Todos';
    } else if (count === 1) {
        label.textContent = Array.from(filterState.selectedProducts)[0];
    } else {
        label.textContent = `${count} produtos selecionados`;
    }
}

// ===== DASHBOARD =====

async function loadDashboard() {
    if (isUpdating) return;
    
    try {
        // Construir query string com filtros
        const params = new URLSearchParams();
        
        if (filterState.startDate) params.append('startDate', filterState.startDate);
        if (filterState.endDate) params.append('endDate', filterState.endDate);
        if (filterState.status !== 'all') params.append('status', filterState.status);
        if (filterState.method !== 'all') params.append('method', filterState.method);
        
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
    if (!grid) return;
    
    // Cards principais
    const cards = [
        {
            label: 'Vendas Hoje',
            value: data.today?.paid || 0,
            subtitle: `R$ ${formatMoney(data.today?.paidAmount || 0)}`
        },
        {
            label: 'Pendentes Hoje',
            value: data.today?.pending || 0,
            subtitle: `R$ ${formatMoney(data.today?.pendingAmount || 0)}`
        },
        {
            label: 'Conversão Hoje',
            value: `${data.today?.conversion || 0}%`,
            subtitle: `${data.today?.total || 0} transações`
        },
        {
            label: 'Ticket Médio',
            value: `R$ ${formatMoney(data.today?.avgTicket || 0)}`,
            subtitle: 'Valor médio por venda'
        },
        {
            label: 'Leads Únicos',
            value: data.totalLeads || 0,
            subtitle: 'CPFs únicos'
        },
        {
            label: 'Vendas Semana',
            value: data.week?.paid || 0,
            subtitle: `R$ ${formatMoney(data.week?.paidAmount || 0)}`
        },
        {
            label: 'Vendas Mês',
            value: data.month?.paid || 0,
            subtitle: `R$ ${formatMoney(data.month?.paidAmount || 0)}`
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
    if (isUpdating) return;
    
    isUpdating = true;
    const btn = document.getElementById('btnUpdate');
    
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="spinner"></div> Atualizando...';
        btn.disabled = true;

        loadDashboard().finally(() => {
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                isUpdating = false;
            }, 500);
        });
    } else {
        loadDashboard().finally(() => {
            isUpdating = false;
        });
    }
}

// ===== UTILITÁRIOS =====

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
    const timeElement = document.getElementById('updateTime');
    if (!timeElement) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    timeElement.textContent = `Atualizado às ${timeString}`;
}

function showError(message) {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;
    
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444;">
            ❌ ${message}
        </div>
    `;
}
