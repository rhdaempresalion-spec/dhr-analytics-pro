// DHR Analytics PRO - Dashboard JavaScript
// Variáveis globais
let allTransactions = [];
let filteredTransactions = [];
let currentView = 'dashboard';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    showLoading(true);
    try {
        await loadAllData();
        updateDashboard();
        showLoading(false);
        showSuccess('Dados carregados com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        showError('Erro ao carregar dados');
        showLoading(false);
    }
    
    // Atualizar a cada 30 segundos
    setInterval(async () => {
        try {
            await loadAllData();
            updateDashboard();
        } catch (error) {
            console.error('Erro ao atualizar:', error);
        }
    }, 30000);
}

// Carregar todos os dados
async function loadAllData() {
    try {
        let page = 1;
        const maxPages = 100;
        allTransactions = [];
        
        while (page <= maxPages) {
            const response = await fetch(`/api/transactions?page=${page}&pageSize=200`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            const txs = data.data || [];
            
            if (txs.length === 0) break;
            
            allTransactions = allTransactions.concat(txs);
            page++;
            
            // Limitar para não travar o navegador
            if (allTransactions.length >= 10000) break;
        }
        
        filteredTransactions = [...allTransactions];
        console.log(`Carregadas ${allTransactions.length} transações`);
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
        throw error;
    }
}

// Atualizar dashboard
function updateDashboard() {
    const paid = filteredTransactions.filter(t => t.status === 'paid');
    const pending = filteredTransactions.filter(t => t.status === 'waiting_payment');
    
    const totalRevenue = paid.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
    const totalPending = pending.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
    const avgTicket = paid.length > 0 ? totalRevenue / paid.length : 0;
    const conversionRate = filteredTransactions.length > 0 ? (paid.length / filteredTransactions.length) * 100 : 0;
    
    // Atualizar cards
    updateCard('lucro-liquido', formatCurrency(totalRevenue), `Após taxas`);
    updateCard('vendas-pagas', formatCurrency(totalRevenue), `${paid.length} transações`);
    updateCard('vendas-pendentes', formatCurrency(totalPending), `${pending.length} transações`);
    updateCard('ticket-medio', formatCurrency(avgTicket), `Média de vendas pagas`);
    
    // Últimos 7 e 30 dias
    const now = new Date();
    const last7Days = filteredTransactions.filter(t => {
        const txDate = new Date(t.createdAt);
        const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && t.status === 'paid';
    });
    const last30Days = filteredTransactions.filter(t => {
        const txDate = new Date(t.createdAt);
        const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
        return diffDays <= 30 && t.status === 'paid';
    });
    
    const revenue7Days = last7Days.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
    const revenue30Days = last30Days.reduce((sum, t) => sum + (t.amount || 0), 0) / 100;
    
    updateCard('ultimos-7-dias', formatCurrency(revenue7Days), `${last7Days.length} transações`);
    updateCard('ultimos-30-dias', formatCurrency(revenue30Days), `${last30Days.length} transações`);
    updateCard('taxa-conversao', `${conversionRate.toFixed(1)}%`, `Pagos / Total`);
    
    // Melhor horário
    const hourCounts = {};
    paid.forEach(t => {
        const hour = new Date(t.createdAt).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const bestHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    updateCard('melhor-horario', bestHour ? `${bestHour[0]}h` : '--:--', `Horário com mais vendas`);
    
    // Produtos vendidos hoje
    updateProductsList();
}

function updateCard(id, value, subtitle) {
    const card = document.querySelector(`[data-card="${id}"]`);
    if (!card) return;
    
    const valueEl = card.querySelector('.card-value');
    const subtitleEl = card.querySelector('.card-subtitle');
    
    if (valueEl) valueEl.textContent = value;
    if (subtitleEl) subtitleEl.textContent = subtitle;
}

function updateProductsList() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = filteredTransactions.filter(t => {
        const txDate = new Date(t.createdAt);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === today.getTime() && t.status === 'paid';
    });
    
    const productCounts = {};
    todayTransactions.forEach(t => {
        const items = t.items || [];
        items.forEach(item => {
            const name = item.title || 'Produto Desconhecido';
            productCounts[name] = (productCounts[name] || 0) + 1;
        });
    });
    
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    
    if (Object.keys(productCounts).length === 0) {
        productsList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Nenhuma venda hoje</p>';
        return;
    }
    
    productsList.innerHTML = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => `
            <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                <span>${escapeHtml(name)}</span>
                <span style="font-weight: bold; color: #10b981;">${count}x</span>
            </div>
        `).join('');
}

// Aplicar filtros
function applyFilters() {
    const period = document.getElementById('filter-period')?.value || 'Hoje';
    const status = document.getElementById('filter-status')?.value || 'Todos';
    const method = document.getElementById('filter-method')?.value || 'Todos';
    
    filteredTransactions = allTransactions.filter(t => {
        // Filtro de período
        if (period !== 'Todos') {
            const txDate = new Date(t.createdAt);
            const now = new Date();
            const diffDays = (now - txDate) / (1000 * 60 * 60 * 24);
            
            if (period === 'Hoje') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const txDay = new Date(txDate);
                txDay.setHours(0, 0, 0, 0);
                if (txDay.getTime() !== today.getTime()) return false;
            } else if (period === 'Ontem') {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                yesterday.setHours(0, 0, 0, 0);
                const txDay = new Date(txDate);
                txDay.setHours(0, 0, 0, 0);
                if (txDay.getTime() !== yesterday.getTime()) return false;
            } else if (period === '7 dias') {
                if (diffDays > 7) return false;
            } else if (period === '1 mês') {
                if (diffDays > 30) return false;
            }
        }
        
        // Filtro de status
        if (status !== 'Todos') {
            if (status === 'Pagos' && t.status !== 'paid') return false;
            if (status === 'Pendentes' && t.status !== 'waiting_payment') return false;
        }
        
        // Filtro de método
        if (method !== 'Todos') {
            if (method === 'PIX' && t.paymentMethod !== 'pix') return false;
            if (method === 'Cartão' && t.paymentMethod !== 'credit_card') return false;
            if (method === 'Boleto' && t.paymentMethod !== 'boleto') return false;
        }
        
        return true;
    });
    
    updateDashboard();
    showSuccess('Filtros aplicados!');
}

function clearFilters() {
    if (document.getElementById('filter-period')) document.getElementById('filter-period').value = 'Hoje';
    if (document.getElementById('filter-status')) document.getElementById('filter-status').value = 'Todos';
    if (document.getElementById('filter-method')) document.getElementById('filter-method').value = 'Todos';
    
    filteredTransactions = [...allTransactions];
    updateDashboard();
    showSuccess('Filtros limpos!');
}

// Exportar dados
function exportCSV() {
    const csv = generateCSV(filteredTransactions);
    downloadFile(csv, 'dhr-analytics.csv', 'text/csv');
}

function exportExcel() {
    // Simples conversão para TSV (compatível com Excel)
    const tsv = generateTSV(filteredTransactions);
    downloadFile(tsv, 'dhr-analytics.xls', 'application/vnd.ms-excel');
}

function exportTXT() {
    const txt = generateTXT(filteredTransactions);
    downloadFile(txt, 'dhr-analytics.txt', 'text/plain');
}

function generateCSV(transactions) {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'CPF', 'Valor', 'Status', 'Método', 'Produto'];
    const rows = transactions.map(t => [
        t.id,
        new Date(t.createdAt).toLocaleString('pt-BR'),
        t.customer?.name || '',
        t.customer?.email || '',
        t.customer?.document?.number || '',
        `R$ ${((t.amount || 0) / 100).toFixed(2)}`,
        t.status,
        t.paymentMethod || '',
        t.items?.[0]?.title || ''
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function generateTSV(transactions) {
    const headers = ['ID', 'Data', 'Cliente', 'Email', 'CPF', 'Valor', 'Status', 'Método', 'Produto'];
    const rows = transactions.map(t => [
        t.id,
        new Date(t.createdAt).toLocaleString('pt-BR'),
        t.customer?.name || '',
        t.customer?.email || '',
        t.customer?.document?.number || '',
        ((t.amount || 0) / 100).toFixed(2),
        t.status,
        t.paymentMethod || '',
        t.items?.[0]?.title || ''
    ]);
    
    return [headers, ...rows].map(row => row.join('\t')).join('\n');
}

function generateTXT(transactions) {
    let txt = 'DHR ANALYTICS - RELATÓRIO DE TRANSAÇÕES\n';
    txt += '='.repeat(80) + '\n\n';
    
    transactions.forEach((t, i) => {
        txt += `Transação #${i + 1}\n`;
        txt += '-'.repeat(80) + '\n';
        txt += `ID: ${t.id}\n`;
        txt += `Data: ${new Date(t.createdAt).toLocaleString('pt-BR')}\n`;
        txt += `Cliente: ${t.customer?.name || 'N/A'}\n`;
        txt += `Email: ${t.customer?.email || 'N/A'}\n`;
        txt += `CPF: ${t.customer?.document?.number || 'N/A'}\n`;
        txt += `Valor: R$ ${((t.amount || 0) / 100).toFixed(2)}\n`;
        txt += `Status: ${t.status}\n`;
        txt += `Método: ${t.paymentMethod || 'N/A'}\n`;
        txt += `Produto: ${t.items?.[0]?.title || 'N/A'}\n`;
        txt += '\n';
    });
    
    return txt;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Utilitários
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading(show) {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Adicionar estilos de animação
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('DHR Analytics PRO - Iniciado');
