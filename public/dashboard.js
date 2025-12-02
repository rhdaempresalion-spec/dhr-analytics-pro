// Estado global dos filtros (persiste entre atualizações)
let filterState = {
    startDate: '',
    endDate: '',
    status: '',
    paymentMethod: 'all',
    selectedProducts: new Set()
};

// Estado dos produtos disponíveis
let availableProducts = [];

// Controle de atualização automática
let autoUpdateInterval = null;
let isManualUpdate = false;

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', () => {
    // Definir datas padrão (hoje)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filterStartDate').value = today;
    document.getElementById('filterEndDate').value = today;
    filterState.startDate = today;
    filterState.endDate = today;

    // Carregar produtos da API
    loadProducts();

    // Carregar dashboard inicial
    loadDashboard();

    // Configurar listeners dos filtros
    setupFilterListeners();

    // NÃO iniciar atualização automática por padrão
    // Usuário controla quando atualizar via botão
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
        document.getElementById('productsContainer').innerHTML = `
            <div style="text-align: center; padding: 20px; color: #ef4444;">
                ❌ Erro ao carregar produtos
            </div>
        `;
    }
}

function renderProducts() {
    const container = document.getElementById('productsContainer');
    
    if (availableProducts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #64748b;">
                Nenhum produto encontrado
            </div>
        `;
        return;
    }

    const productsHTML = availableProducts.map(product => {
        const isSelected = filterState.selectedProducts.has(product);
        return `
            <label class="product-checkbox ${isSelected ? 'selected' : ''}" data-product="${escapeHtml(product)}">
                <input 
                    type="checkbox" 
                    value="${escapeHtml(product)}"
                    ${isSelected ? 'checked' : ''}
                    onchange="toggleProduct(this)"
                >
                <span class="product-label">${escapeHtml(product)}</span>
            </label>
        `;
    }).join('');

    container.innerHTML = `<div class="products-grid">${productsHTML}</div>`;
}

function toggleProduct(checkbox) {
    const product = checkbox.value;
    const label = checkbox.closest('.product-checkbox');
    
    if (checkbox.checked) {
        filterState.selectedProducts.add(product);
        label.classList.add('selected');
    } else {
        filterState.selectedProducts.delete(product);
        label.classList.remove('selected');
    }
}

function selectAllProducts() {
    filterState.selectedProducts = new Set(availableProducts);
    renderProducts();
}

function clearAllProducts() {
    filterState.selectedProducts.clear();
    renderProducts();
}

// ===== FILTROS =====

function setupFilterListeners() {
    // Atualizar estado quando filtros mudarem (mas NÃO recarregar automaticamente)
    document.getElementById('filterStartDate').addEventListener('change', (e) => {
        filterState.startDate = e.target.value;
    });

    document.getElementById('filterEndDate').addEventListener('change', (e) => {
        filterState.endDate = e.target.value;
    });

    document.getElementById('filterStatus').addEventListener('change', (e) => {
        filterState.status = e.target.value;
    });

    document.getElementById('filterMethod').addEventListener('change', (e) => {
        filterState.paymentMethod = e.target.value;
    });
}

function applyFilters() {
    isManualUpdate = true;
    loadDashboard();
    
    // Mostrar feedback visual
    const btn = document.querySelector('.btn-update');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner"></div> Atualizando...';
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        isManualUpdate = false;
    }, 1000);
}

// ===== DASHBOARD =====

async function loadDashboard() {
    try {
        // Construir query string com filtros
        const params = new URLSearchParams();
        
        if (filterState.startDate) params.append('startDate', filterState.startDate);
        if (filterState.endDate) params.append('endDate', filterState.endDate);
        if (filterState.status) params.append('status', filterState.status);
        if (filterState.paymentMethod !== 'all') params.append('paymentMethod', filterState.paymentMethod);
        
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
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    document.getElementById('updateStatus').innerHTML = `
        Atualizado às ${timeString}
    `;
}

function showError(message) {
    const grid = document.getElementById('dashboardGrid');
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #ef4444;">
            ❌ ${message}
        </div>
    `;
}

// ===== ATUALIZAÇÃO AUTOMÁTICA (OPCIONAL) =====

function enableAutoUpdate(intervalSeconds = 30) {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    
    autoUpdateInterval = setInterval(() => {
        // Só atualizar automaticamente se não estiver em uma atualização manual
        if (!isManualUpdate) {
            loadDashboard();
        }
    }, intervalSeconds * 1000);
}

function disableAutoUpdate() {
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
        autoUpdateInterval = null;
    }
}

// Desabilitar atualização automática por padrão
// Para habilitar, chame: enableAutoUpdate(30) no console ou adicione um botão
