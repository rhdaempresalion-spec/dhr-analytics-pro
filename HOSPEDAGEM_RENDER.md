# 🚀 Hospedar no Render - 100% Online, Nunca Cai

Este guia te ensina a hospedar o sistema no **Render.com** de forma **GRATUITA** e **100% ONLINE** (24/7).

---

## 🎯 Por Que Render?

- ✅ **100% Gratuito** (plano inicial)
- ✅ **Nunca cai** (reinicia automaticamente se der problema)
- ✅ **Interface web acessível** de qualquer lugar
- ✅ **Deploy em 10 minutos**
- ✅ **SSL/HTTPS automático**
- ✅ **Logs em tempo real**

---

## 📋 Passo a Passo Completo

### 🎯 Passo 1: Criar Conta no GitHub (2 minutos)

**Se você JÁ tem conta no GitHub, pule para o Passo 2**

1. Acesse: [https://github.com/signup](https://github.com/signup)
2. Preencha:
   - Email: seu email
   - Senha: crie uma senha forte
   - Username: escolha um nome
3. Clique em **"Create account"**
4. Verifique seu email e confirme

---

### 🎯 Passo 2: Fazer Upload do Código (5 minutos)

#### Opção A: GitHub Web (Mais Fácil)

**1. Criar Repositório:**

1. Acesse: [https://github.com/new](https://github.com/new)
2. Preencha:
   - **Repository name:** `dhr-monitor-web`
   - **Description:** Sistema DHR com interface web
   - **Visibility:** ✅ **Private** (importante!)
3. **NÃO marque** nenhuma opção de "Initialize"
4. Clique em **"Create repository"**

**2. Fazer Upload:**

1. Extraia o arquivo `dhr-monitor-web.zip` no seu computador
2. Na página do repositório, clique em **"uploading an existing file"**
3. Arraste **TODOS** os arquivos (não a pasta, os arquivos de dentro):
   - ✅ server.js
   - ✅ package.json
   - ✅ .env.example
   - ✅ .gitignore
   - ✅ notifications.json
   - ✅ README.md
   - ✅ HOSPEDAGEM_RENDER.md
   - ✅ pasta `public/` (com index.html e app.js)
4. Escreva no commit: `Initial commit`
5. Clique em **"Commit changes"**

**✅ Código no GitHub!**

#### Opção B: GitHub Desktop (Alternativa)

1. Baixe [GitHub Desktop](https://desktop.github.com)
2. Instale e faça login
3. **File → New Repository**
4. Preencha:
   - Name: `dhr-monitor-web`
   - Local Path: onde extraiu o ZIP
5. **Create Repository**
6. **Publish Repository**
7. Marque **"Keep this code private"**
8. **Publish**

---

### 🎯 Passo 3: Criar Conta no Render (2 minutos)

1. Acesse: [https://render.com](https://render.com)
2. Clique em **"Get Started"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar sua conta
5. **Pronto!** Conta criada!

---

### 🎯 Passo 4: Criar Web Service no Render (5 minutos)

**⚠️ IMPORTANTE: Use "Web Service", NÃO "Background Worker"!**

**1. Criar Serviço:**

1. No painel do Render, clique em **"New +"**
2. Selecione **"Web Service"** (não Background Worker!)

**2. Conectar Repositório:**

1. Você verá lista de repositórios
2. Localize **"dhr-monitor-web"**
3. Clique em **"Connect"**

**Se não aparecer:**
- Clique em **"Configure account"**
- Autorize acesso a repositórios privados
- Volte e conecte

**3. Configurar Serviço:**

Preencha os campos:

```
Name: dhr-monitor
(ou qualquer nome que você quiser)

Region: Oregon (US West)
(ou o mais próximo de você)

Branch: main
(ou master, o que aparecer)

Runtime: Node

Build Command:
npm install

Start Command:
node server.js

Instance Type: Free
(selecione o plano gratuito)
```

**4. Adicionar Variáveis de Ambiente:**

Role até **"Environment Variables"** e adicione **UMA POR UMA**:

```
Key: DHR_PUBLIC_KEY
Value: pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE
```

```
Key: DHR_SECRET_KEY
Value: sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD
```

```
Key: DHR_API_URL
Value: https://api.dhrtecnologialtda.com/v1
```

```
Key: CHECK_INTERVAL_SECONDS
Value: 5
```

```
Key: PORT
Value: 3000
```

**⚠️ IMPORTANTE:** Use PORT=3000 no Render (não 3001)

**5. Criar:**

1. Revise tudo
2. Clique em **"Create Web Service"**
3. Aguarde 2-3 minutos (deploy automático)

---

### 🎯 Passo 5: Pegar a URL do Seu Site

Após o deploy concluir:

1. No painel do Render, você verá uma URL tipo:
   ```
   https://dhr-monitor.onrender.com
   ```
2. **Copie essa URL!**
3. **Acesse no navegador**
4. **Pronto! Seu site está no ar 24/7!** 🎉

---

## 🎉 Sistema 100% Online!

### ✅ O Que Você Tem Agora:

- 🌐 **Site acessível de qualquer lugar**
- 📱 **Interface web funcionando**
- 🔄 **Monitoramento automático 24/7**
- 🔒 **HTTPS/SSL automático**
- 🚀 **Reinicia sozinho se cair**
- 💰 **100% GRATUITO**

### 📱 Como Usar:

1. Acesse sua URL: `https://[seu-nome].onrender.com`
2. Adicione suas notificações Pushcut
3. Personalize as mensagens
4. **Pronto!** Sistema rodando!

---

## 🔧 Gerenciar o Sistema

### Ver Logs

1. Painel do Render
2. Clique no seu serviço
3. Aba **"Logs"**
4. Veja tudo em tempo real

### Reiniciar

1. Painel do serviço
2. **"Manual Deploy"**
3. **"Clear build cache & deploy"**

### Alterar Variáveis

1. Aba **"Environment"**
2. Edite as variáveis
3. Salva automaticamente e reinicia

### Ver Status

1. Painel mostra:
   - 🟢 **Live** = Funcionando
   - 🔴 **Failed** = Erro (veja logs)
   - 🟡 **Building** = Fazendo deploy

---

## ⚠️ Importante: Plano Gratuito

### Limitações:

- ✅ **Sempre online** (não dorme!)
- ✅ **750 horas/mês** grátis (suficiente para 24/7)
- ✅ **512 MB RAM**
- ⚠️ **Reinicia a cada 15 dias** (automático, sem downtime)

### Não Tem Problema:

O Render **reinicia automaticamente** sem você fazer nada. O sistema volta a funcionar sozinho em segundos!

---

## 🛠️ Solução de Problemas

### Deploy Falhou

**Erro:** "Build failed"

**Solução:**
1. Verifique se todos os arquivos foram enviados
2. Especialmente: `package.json`, `server.js`, pasta `public/`
3. Veja os logs do build

### Variáveis Não Funcionam

**Erro:** "Chaves da API não configuradas"

**Solução:**
1. Vá em **"Environment"**
2. Adicione todas as variáveis listadas
3. Salve e aguarde reiniciar

### Site Não Abre

**Erro:** "Application failed to respond"

**Solução:**
1. Veja os logs
2. Verifique se `PORT=3000` está nas variáveis
3. Reinicie o serviço

### Notificações Não Chegam

**Erro:** Pushcut não recebe

**Solução:**
1. Teste a URL do Pushcut manualmente
2. Verifique se o app está aberto no iPhone
3. Adicione a notificação pela interface web

---

## 🔄 Atualizar o Sistema

Se você fizer mudanças no código:

**Opção 1: GitHub Web**

1. Acesse seu repositório no GitHub
2. Clique no arquivo que quer editar
3. Clique no ícone de lápis ✏️
4. Faça as mudanças
5. **Commit changes**
6. Render faz deploy automático!

**Opção 2: GitHub Desktop**

1. Faça mudanças nos arquivos locais
2. GitHub Desktop detecta automaticamente
3. Escreva uma mensagem de commit
4. **Commit to main**
5. **Push origin**
6. Render faz deploy automático!

---

## 💡 Dicas

### Domínio Personalizado (Opcional)

Você pode usar seu próprio domínio:

1. Painel do Render
2. Aba **"Settings"**
3. **"Custom Domain"**
4. Adicione seu domínio
5. Configure DNS conforme instruções

### Monitorar Uptime

Use serviços gratuitos:

- [UptimeRobot](https://uptimerobot.com) - Monitora se está online
- [Better Uptime](https://betteruptime.com) - Alertas se cair

### Backup

O código está no GitHub = backup automático!

Se algo der errado:
1. Delete o serviço no Render
2. Crie novamente
3. Conecte o mesmo repositório

---

## 📊 Checklist Final

Antes de considerar concluído:

- [ ] Conta no GitHub criada
- [ ] Código enviado para repositório privado
- [ ] Conta no Render criada
- [ ] Web Service criado (não Background Worker)
- [ ] Todas as variáveis configuradas
- [ ] Deploy concluído com sucesso
- [ ] URL funcionando
- [ ] Interface web acessível
- [ ] Notificações adicionadas
- [ ] Teste enviado e recebido

---

## 🎯 Resumo Rápido

```
1. GitHub → Criar repositório privado
2. Upload → Arrastar arquivos do ZIP
3. Render → Criar Web Service
4. Conectar → Repositório GitHub
5. Configurar → Variáveis de ambiente
6. Deploy → Aguardar 2-3 minutos
7. Acessar → Sua URL .onrender.com
8. Usar → Adicionar notificações
9. Pronto! → Sistema 24/7 online
```

---

## 🆘 Precisa de Ajuda?

1. Veja os **logs** no Render
2. Confirme **variáveis** corretas
3. Teste **URL Pushcut** manualmente
4. **Reinicie** o serviço

---

## 🎉 Parabéns!

Seu sistema está **100% online, 24/7, nunca cai**!

Você pode:
- ✅ Acessar de qualquer lugar
- ✅ Adicionar quantas notificações quiser
- ✅ Personalizar mensagens
- ✅ Receber pagamentos em tempo real

**Aproveite! 🚀💰**

---

## 📞 Suporte

Se tiver problemas:

- **Logs do Render:** Primeira coisa a verificar
- **Status do Render:** [status.render.com](https://status.render.com)
- **Documentação:** [render.com/docs](https://render.com/docs)

---

**🌐 Seu sistema está pronto para rodar 24/7 sem parar!**
