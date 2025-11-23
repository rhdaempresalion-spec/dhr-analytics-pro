# 🚀 Instruções de Deploy - DHR Monitor (Versão Atualizada)

## ✨ O Que Foi Melhorado

### 1. **Novo Dashboard com Filtros Visuais**
- ✅ Interface moderna com tema dark/hacker
- ✅ Filtro de produtos com checkboxes visuais
- ✅ Seleção múltipla de produtos sem bugs
- ✅ Estado dos filtros persiste (não reseta mais)
- ✅ Atualização manual via botão (sem reload automático)

### 2. **Correções Críticas**
- ✅ Módulo `pix-decoder.js` criado (estava ausente)
- ✅ Configuração via variáveis de ambiente
- ✅ Bug de atualização automática corrigido

### 3. **Arquivos Novos/Atualizados**
- `public/dashboard.html` - Nova interface de dashboard
- `public/dashboard.js` - Lógica do dashboard sem bugs
- `pix-decoder.js` - Decodificador de QR Code PIX
- `server.js` - Atualizado para usar variáveis de ambiente

---

## 📦 Como Fazer o Deploy

### Opção 1: Deploy no Render (Recomendado)

1. **Fazer Upload dos Arquivos Atualizados**
   - Acesse seu repositório no GitHub
   - Substitua os arquivos antigos pelos novos
   - Commit: `git commit -m "Atualização: novo dashboard com filtros visuais"`
   - Push: `git push origin main`

2. **Render Fará Deploy Automático**
   - O Render detecta mudanças no GitHub
   - Deploy automático em 2-3 minutos
   - Aguarde status "Live" no painel

3. **Acessar o Novo Dashboard**
   - URL: `https://seu-app.onrender.com/dashboard.html`
   - Ou adicione link na página principal

### Opção 2: Deploy Manual via FTP/SFTP

1. **Conectar ao Servidor**
   ```bash
   sftp usuario@seu-servidor.com
   ```

2. **Fazer Upload dos Arquivos**
   ```bash
   cd /caminho/do/projeto
   put public/dashboard.html
   put public/dashboard.js
   put pix-decoder.js
   put server.js
   ```

3. **Reiniciar o Servidor**
   ```bash
   pm2 restart dhr-monitor
   ```

### Opção 3: Deploy Local para Teste

1. **Instalar Dependências**
   ```bash
   cd dhr-monitor-main
   npm install
   ```

2. **Configurar Variáveis de Ambiente**
   - Edite o arquivo `.env` com suas chaves

3. **Iniciar o Servidor**
   ```bash
   npm start
   ```

4. **Acessar o Dashboard**
   - Abra: `http://localhost:3001/dashboard.html`

---

## 🎯 Como Usar o Novo Dashboard

### 1. Acessar a Interface

```
https://seu-app.onrender.com/dashboard.html
```

### 2. Configurar Filtros

**Data Inicial/Final:**
- Selecione o período desejado
- Padrão: hoje

**Status:**
- Todos / Pagos / Pendentes

**Método:**
- Todos / PIX / Cartão / Boleto

**Produtos:**
- ✅ Checkboxes visuais para cada produto
- ✅ Selecionar múltiplos produtos
- ✅ Botões "Selecionar Todos" e "Limpar Seleção"

### 3. Atualizar Dashboard

- Clique no botão **"🔄 Atualizar Dashboard"**
- Aguarde o carregamento (1-2 segundos)
- Dashboard atualizado com os filtros aplicados

### 4. Recursos Avançados

**Sem Bug de Atualização:**
- Os filtros NÃO resetam mais
- Estado persiste entre atualizações
- Você controla quando atualizar

**Atualização Automática (Opcional):**
- Abra o console do navegador (F12)
- Digite: `enableAutoUpdate(30)` (atualiza a cada 30 segundos)
- Para desabilitar: `disableAutoUpdate()`

---

## 🔧 Configuração Avançada

### Personalizar Cores

Edite `public/dashboard.html`, seção `<style>`:

```css
/* Cor primária (azul) */
--primary: #3b82f6;

/* Cor de fundo */
--bg-dark: #0a0e27;

/* Cor dos cards */
--card-bg: #1e293b;
```

### Adicionar Mais Cards

Edite `public/dashboard.js`, função `renderDashboard()`:

```javascript
const cards = [
    // ... cards existentes
    {
        label: 'Seu Card',
        value: data.seuValor || 0,
        subtitle: 'Descrição'
    }
];
```

### Mudar Intervalo de Atualização Automática

Edite `public/dashboard.js`, final do arquivo:

```javascript
// Habilitar atualização a cada 60 segundos
enableAutoUpdate(60);
```

---

## 📱 Responsividade

O dashboard é **100% responsivo**:
- ✅ Desktop: Grid com múltiplas colunas
- ✅ Tablet: Grid adaptativo
- ✅ Mobile: Layout em coluna única

---

## 🐛 Solução de Problemas

### Dashboard Não Carrega

**Problema:** Tela branca ou erro

**Solução:**
1. Verifique se o arquivo `dashboard.html` foi enviado
2. Acesse: `https://seu-app.onrender.com/dashboard.html`
3. Veja o console do navegador (F12) para erros

### Produtos Não Aparecem

**Problema:** "Carregando produtos..." infinito

**Solução:**
1. Verifique se o endpoint `/api/products` funciona
2. Teste: `https://seu-app.onrender.com/api/products`
3. Deve retornar um array JSON com os produtos

### Filtros Não Funcionam

**Problema:** Dashboard não atualiza ao clicar no botão

**Solução:**
1. Verifique se o endpoint `/api/dashboard` funciona
2. Teste: `https://seu-app.onrender.com/api/dashboard`
3. Veja o console do navegador para erros

### Erro "Cannot find module pix-decoder.js"

**Problema:** Servidor não inicia

**Solução:**
1. Certifique-se de que o arquivo `pix-decoder.js` foi enviado
2. Deve estar na raiz do projeto (mesmo nível do `server.js`)
3. Reinicie o servidor

---

## 📊 Checklist de Deploy

Antes de considerar o deploy concluído:

- [ ] Arquivo `public/dashboard.html` enviado
- [ ] Arquivo `public/dashboard.js` enviado
- [ ] Arquivo `pix-decoder.js` enviado (raiz do projeto)
- [ ] Arquivo `server.js` atualizado
- [ ] Variáveis de ambiente configuradas no `.env`
- [ ] Servidor reiniciado
- [ ] Dashboard acessível via `/dashboard.html`
- [ ] Produtos carregam corretamente
- [ ] Filtros funcionam sem bugs
- [ ] Dashboard atualiza ao clicar no botão
- [ ] Layout responsivo no mobile

---

## 🎉 Pronto!

Seu dashboard está atualizado com:
- ✅ Filtros visuais bonitos
- ✅ Sem bugs de atualização
- ✅ Interface moderna e responsiva
- ✅ Performance otimizada

**Aproveite! 🚀**

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do servidor
2. Veja o console do navegador (F12)
3. Teste os endpoints da API manualmente
4. Revise este guia de deploy

**Boa sorte com seu dashboard! 💰📊**
