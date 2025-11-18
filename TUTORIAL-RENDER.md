# 🚀 TUTORIAL COMPLETO - HOSPEDAR NO RENDER

## PASSO A PASSO (COM PRINTS)

### 📋 ANTES DE COMEÇAR

Você vai precisar:
- ✅ Conta no GitHub (gratuita)
- ✅ Conta no Render (gratuita)
- ✅ Arquivo ZIP do sistema

---

## PARTE 1: PREPARAR O CÓDIGO NO GITHUB

### PASSO 1: Criar conta no GitHub (se não tiver)
1. Acesse: https://github.com
2. Clique em "Sign up"
3. Preencha email, senha e username
4. Confirme email

### PASSO 2: Criar novo repositório
1. Acesse: https://github.com/new
2. **Repository name:** `dhr-analytics-pro`
3. **Description:** Sistema de Analytics DHR
4. **Visibilidade:** Private (privado)
5. **NÃO marque** "Add a README file"
6. Clique em **"Create repository"**

### PASSO 3: Fazer upload do código

**OPÇÃO A - Via GitHub Web (MAIS FÁCIL):**

1. Na página do repositório criado, clique em **"uploading an existing file"**
2. Extraia o ZIP `DHR-ANALYTICS-PRO-FINAL.zip` no seu computador
3. Arraste TODOS os arquivos da pasta `dhr-analytics-PRO` para o GitHub
   - Arraste: `server.js`, `package.json`, `pix-decoder.js`, pasta `public`, etc.
   - **NÃO arraste** a pasta `node_modules` (se existir)
4. Na caixa "Commit changes":
   - Escreva: `Initial commit`
5. Clique em **"Commit changes"**

**OPÇÃO B - Via Git (se souber usar):**

```bash
# 1. Extrair ZIP
unzip DHR-ANALYTICS-PRO-FINAL.zip
cd dhr-analytics-PRO

# 2. Inicializar Git
git init
git add .
git commit -m "Initial commit"

# 3. Conectar ao GitHub
git remote add origin https://github.com/SEU_USERNAME/dhr-analytics-pro.git
git branch -M main
git push -u origin main
```

---

## PARTE 2: HOSPEDAR NO RENDER

### PASSO 4: Criar conta no Render
1. Acesse: https://render.com
2. Clique em **"Get Started"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar sua conta GitHub

### PASSO 5: Criar novo Web Service
1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Web Service"**
3. Clique em **"Connect account"** (se aparecer)
4. Autorize o Render a acessar seus repositórios

### PASSO 6: Selecionar repositório
1. Procure por **"dhr-analytics-pro"** na lista
2. Clique em **"Connect"** ao lado do repositório

### PASSO 7: Configurar o Web Service

**Preencha os campos:**

1. **Name:** `dhr-analytics-pro`
   - Este será o nome da URL: `dhr-analytics-pro.onrender.com`

2. **Region:** `Oregon (US West)` ou `Frankfurt (Europe)`
   - Escolha o mais próximo do Brasil

3. **Branch:** `main`
   - Deixe como está

4. **Root Directory:** 
   - **DEIXE EM BRANCO**

5. **Runtime:** `Node`
   - Selecione Node

6. **Build Command:** 
   ```
   npm install
   ```

7. **Start Command:**
   ```
   npm start
   ```

8. **Instance Type:**
   - Selecione **"Free"** (gratuito)
   - ⚠️ **IMPORTANTE:** O plano Free hiberna após 15 minutos sem uso
   - Para manter sempre ativo, precisa do plano Starter ($7/mês)

### PASSO 8: Adicionar Variáveis de Ambiente (OPCIONAL)

Se quiser mudar a porta (opcional):

1. Role até **"Environment Variables"**
2. Clique em **"Add Environment Variable"**
3. **Key:** `PORT`
4. **Value:** `3005`
5. Clique em **"Add"**

### PASSO 9: Criar Web Service

1. Role até o final da página
2. Clique em **"Create Web Service"**
3. **AGUARDE** 2-5 minutos enquanto o Render:
   - Clona seu repositório
   - Instala dependências (`npm install`)
   - Inicia o servidor (`npm start`)

### PASSO 10: Verificar se funcionou

1. Quando aparecer **"Live"** com bolinha verde = FUNCIONANDO! ✅
2. Clique na URL (ex: `https://dhr-analytics-pro.onrender.com`)
3. Deve abrir o dashboard!

---

## PARTE 3: CONFIGURAÇÕES IMPORTANTES

### ⚠️ PROBLEMA: Site hiberna após 15 minutos (Plano Free)

**Solução 1 - Upgrade para Starter ($7/mês):**
1. No dashboard do Render, clique no seu serviço
2. Vá em **"Settings"**
3. Role até **"Instance Type"**
4. Selecione **"Starter"**
5. Clique em **"Save Changes"**
6. Adicione cartão de crédito

**Solução 2 - Usar serviço de "ping" (gratuito):**
1. Acesse: https://uptimerobot.com
2. Crie conta gratuita
3. Adicione novo monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** DHR Analytics
   - **URL:** `https://dhr-analytics-pro.onrender.com`
   - **Monitoring Interval:** 5 minutes
4. Isso fará uma requisição a cada 5 minutos, mantendo o site ativo

### 🔧 ATUALIZAR O CÓDIGO

Quando quiser atualizar o sistema:

**Opção A - Via GitHub Web:**
1. Acesse seu repositório no GitHub
2. Clique no arquivo que quer editar
3. Clique no ícone de lápis (Edit)
4. Faça as alterações
5. Clique em **"Commit changes"**
6. **O Render atualiza AUTOMATICAMENTE!**

**Opção B - Via Git:**
```bash
git add .
git commit -m "Atualização"
git push
```

### 📊 VER LOGS (se der erro)

1. No dashboard do Render, clique no seu serviço
2. Clique na aba **"Logs"**
3. Veja os erros em tempo real

---

## PARTE 4: TESTAR TUDO

### ✅ CHECKLIST FINAL

Acesse sua URL e teste:

- [ ] Dashboard carrega
- [ ] Dados aparecem (vendas, lucro, etc.)
- [ ] Aba "Análise PIX" funciona
- [ ] Aba "Análise do Dia" funciona
- [ ] Aba "Notificações" funciona
- [ ] Filtros funcionam
- [ ] Exportação TXT/CSV funciona
- [ ] Notificações Pushcut funcionam

---

## 🆘 PROBLEMAS COMUNS

### Erro: "Application failed to respond"
**Solução:**
1. Vá em Settings → Environment
2. Adicione variável `PORT` = `10000`
3. Edite `server.js` linha 16:
   ```js
   PORT: process.env.PORT || 3005
   ```

### Erro: "Build failed"
**Solução:**
1. Verifique se `package.json` está no repositório
2. Veja os logs para identificar o erro
3. Certifique-se que Build Command é `npm install`

### Site muito lento
**Solução:**
1. Plano Free hiberna após 15 minutos
2. Primeira requisição demora ~30 segundos
3. Upgrade para Starter ($7/mês) resolve

### Notificações não funcionam
**Solução:**
1. Verifique se o arquivo `.env` está no repositório
2. Ou adicione as credenciais DHR como variáveis de ambiente no Render

---

## 📱 DOMÍNIO PERSONALIZADO (OPCIONAL)

Se quiser usar seu próprio domínio (ex: `analytics.seusite.com`):

1. No Render, vá em **"Settings"**
2. Role até **"Custom Domain"**
3. Clique em **"Add Custom Domain"**
4. Digite seu domínio
5. Siga as instruções para configurar DNS

---

## 🎉 PRONTO!

Seu sistema DHR Analytics PRO está no ar! 🚀

**URL:** `https://dhr-analytics-pro.onrender.com`

**Dúvidas?** Releia este tutorial passo a passo!
