let currentEditId = null;

// Carregar dados ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadStatus();
    loadNotifications();
    
    // Atualizar status a cada 5 segundos
    setInterval(loadStatus, 5000);
});

// Carregar status do sistema
async function loadStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        document.getElementById('statusRunning').textContent = data.running ? '🟢' : '🔴';
        document.getElementById('statusInterval').textContent = `${data.interval}s`;
        document.getElementById('statusNotifications').textContent = data.activeNotifications;
        document.getElementById('statusProcessed').textContent = data.processedCount;
    } catch (error) {
        console.error('Erro ao carregar status:', error);
    }
}

// Carregar notificações
async function loadNotifications() {
    try {
        const response = await fetch('/api/notifications');
        const notifications = await response.json();
        
        const grid = document.getElementById('notificationsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (notifications.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        const eventTypeLabels = {
            'sale_paid': '💰 Venda Paga',
            'withdrawal_requested': '💸 Saque Solicitado',
            'withdrawal_approved': '✅ Saque Aprovado',
            'refund': '🔄 Reembolso'
        };
        
        grid.innerHTML = notifications.map(n => `
            <div class="notification-card ${!n.enabled ? 'disabled' : ''}">
                <div class="card-header">
                    <div class="card-title">${escapeHtml(n.name)}</div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${n.enabled ? 'checked' : ''} onchange="toggleNotification('${n.id}', this.checked)">
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div class="card-content">
                    <div class="card-label">Tipo de Evento:</div>
                    <div class="card-value">${eventTypeLabels[n.eventType] || n.eventType}</div>
                    
                    <div class="card-label">URL:</div>
                    <div class="card-value">${escapeHtml(n.url)}</div>
                    
                    <div class="card-label">Título:</div>
                    <div class="card-value">${escapeHtml(n.title)}</div>
                    
                    <div class="card-label">Texto:</div>
                    <div class="card-value">${escapeHtml(n.text)}</div>
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-test" onclick="testNotification('${n.id}')">🧪 Testar</button>
                    <button class="btn btn-edit" onclick="editNotification('${n.id}')">✏️ Editar</button>
                    <button class="btn btn-delete" onclick="deleteNotification('${n.id}')">🗑️ Deletar</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar notificações:', error);
    }
}

// Abrir modal para adicionar
function openAddModal() {
    currentEditId = null;
    document.getElementById('modalTitle').textContent = 'Adicionar Notificação';
    document.getElementById('notificationForm').reset();
    document.getElementById('modal').style.display = 'block';
}

// Editar notificação
async function editNotification(id) {
    try {
        const response = await fetch('/api/notifications');
        const notifications = await response.json();
        const notification = notifications.find(n => n.id === id);
        
        if (!notification) return;
        
        currentEditId = id;
        document.getElementById('modalTitle').textContent = 'Editar Notificação';
        document.getElementById('inputName').value = notification.name;
        document.getElementById('inputUrl').value = notification.url;
        document.getElementById('inputEventType').value = notification.eventType || 'sale_paid';
        document.getElementById('inputTitle').value = notification.title;
        document.getElementById('inputText').value = notification.text;
        document.getElementById('modal').style.display = 'block';
    } catch (error) {
        console.error('Erro ao editar:', error);
        alert('Erro ao carregar dados da notificação');
    }
}

// Salvar notificação
async function saveNotification(event) {
    event.preventDefault();
    
    const data = {
        name: document.getElementById('inputName').value,
        url: document.getElementById('inputUrl').value,
        eventType: document.getElementById('inputEventType').value,
        title: document.getElementById('inputTitle').value,
        text: document.getElementById('inputText').value,
        enabled: true
    };
    
    try {
        const url = currentEditId 
            ? `/api/notifications/${currentEditId}` 
            : '/api/notifications';
        
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) throw new Error('Erro ao salvar');
        
        closeModal();
        loadNotifications();
        loadStatus();
        
        alert(currentEditId ? 'Notificação atualizada!' : 'Notificação adicionada!');
    } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar notificação');
    }
}

// Deletar notificação
async function deleteNotification(id) {
    if (!confirm('Tem certeza que deseja deletar esta notificação?')) return;
    
    try {
        const response = await fetch(`/api/notifications/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erro ao deletar');
        
        loadNotifications();
        loadStatus();
        alert('Notificação deletada!');
    } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar notificação');
    }
}

// Ativar/desativar notificação
async function toggleNotification(id, enabled) {
    try {
        const response = await fetch(`/api/notifications/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled })
        });
        
        if (!response.ok) throw new Error('Erro ao atualizar');
        
        loadNotifications();
        loadStatus();
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        alert('Erro ao atualizar notificação');
    }
}

// Testar notificação
async function testNotification(id) {
    if (!confirm('Enviar notificação de teste para este dispositivo?')) return;
    
    try {
        const response = await fetch(`/api/test/${id}`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('✅ Notificação de teste enviada!\n\n' +
                  'Título: ' + result.title + '\n' +
                  'Texto: ' + result.text);
        } else {
            alert('❌ Erro ao enviar notificação de teste');
        }
    } catch (error) {
        console.error('Erro ao testar:', error);
        alert('Erro ao enviar notificação de teste');
    }
}

// Fechar modal
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('notificationForm').reset();
    currentEditId = null;
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        closeModal();
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
