import fetch from 'node-fetch';

const CONFIG = {
  DHR_PUBLIC_KEY: 'pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE',
  DHR_SECRET_KEY: 'sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD',
  DHR_API_URL: 'https://api.dhrtecnologialtda.com/v1'
};

function getAuth() {
  return 'Basic ' + Buffer.from(`${CONFIG.DHR_PUBLIC_KEY}:${CONFIG.DHR_SECRET_KEY}`).toString('base64');
}

async function testAPI() {
  console.log('\n🔍 TESTANDO API DHR PAGAMENTOS\n');
  console.log('═'.repeat(60));
  
  try {
    // Testar autenticação
    console.log('\n1️⃣  Testando autenticação...');
    const authHeader = getAuth();
    console.log('   ✅ Header Authorization gerado');
    console.log(`   📝 ${authHeader.substring(0, 30)}...`);
    
    // Testar endpoint de transações
    console.log('\n2️⃣  Buscando transações...');
    const response = await fetch(`${CONFIG.DHR_API_URL}/transactions?page=1&pageSize=10`, {
      headers: { 'Authorization': authHeader }
    });
    
    console.log(`   📡 Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`   ❌ Erro: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log('   ✅ Resposta recebida com sucesso!');
    
    // Mostrar estrutura da resposta
    console.log('\n3️⃣  Estrutura da resposta:');
    console.log(`   📊 Total de transações: ${data.data?.length || 0}`);
    console.log(`   📄 Página: ${data.page || 'N/A'}`);
    console.log(`   📦 Total geral: ${data.total || 'N/A'}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n4️⃣  Primeira transação encontrada:');
      const tx = data.data[0];
      console.log(`   🆔 ID: ${tx.id}`);
      console.log(`   💰 Valor: R$ ${((tx.amount || 0) / 100).toFixed(2)}`);
      console.log(`   📅 Data: ${tx.dateCreated}`);
      console.log(`   ✅ Status: ${tx.status}`);
      console.log(`   💳 Método: ${tx.paymentMethod || 'N/A'}`);
      console.log(`   👤 Cliente: ${tx.customer?.name || 'N/A'}`);
      
      console.log('\n5️⃣  Estrutura completa:');
      console.log(JSON.stringify(tx, null, 2));
    } else {
      console.log('\n⚠️  Nenhuma transação encontrada na conta!');
      console.log('   Isso pode significar:');
      console.log('   • Conta DHR ainda não tem transações');
      console.log('   • Credenciais corretas mas conta vazia');
      console.log('   • Período de teste sem dados');
    }
    
    // Testar outros endpoints
    console.log('\n6️⃣  Testando endpoint de clientes...');
    const customersResp = await fetch(`${CONFIG.DHR_API_URL}/customers?page=1&pageSize=5`, {
      headers: { 'Authorization': authHeader }
    });
    console.log(`   📡 Status: ${customersResp.status} ${customersResp.statusText}`);
    
    if (customersResp.ok) {
      const customersData = await customersResp.json();
      console.log(`   👥 Clientes encontrados: ${customersData.data?.length || 0}`);
    }
    
    console.log('\n═'.repeat(60));
    console.log('✅ TESTE CONCLUÍDO!\n');
    
  } catch (error) {
    console.log('\n❌ ERRO:');
    console.log(`   ${error.message}`);
    console.log(`   ${error.stack}`);
  }
}

testAPI();
