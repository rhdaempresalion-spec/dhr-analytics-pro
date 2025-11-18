import fetch from 'node-fetch';

const auth = 'Basic ' + Buffer.from('pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE:sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD').toString('base64');

async function findAllSales() {
  let allPaid = [];
  let page = 1;
  
  while (page <= 10) {
    const response = await fetch(`https://api.dhrtecnologialtda.com/v1/transactions?page=${page}&pageSize=100`, {
      headers: { 'Authorization': auth }
    });
    
    const data = await response.json();
    const txs = data.data || [];
    
    console.log(`Página ${page}: ${txs.length} transações`);
    
    if (txs.length === 0) break;
    
    const paid = txs.filter(t => t.status === 'paid');
    console.log(`  -> ${paid.length} pagas`);
    allPaid = allPaid.concat(paid);
    
    page++;
  }
  
  console.log(`\n✅ Total de vendas PAGAS: ${allPaid.length}\n`);
  
  // Agrupar por hora
  const byHour = {};
  allPaid.forEach(t => {
    const date = new Date(t.createdAt);
    const hour = date.getHours();
    const key = `${hour}`;
    
    if (!byHour[key]) {
      byHour[key] = {
        count: 0,
        sales: []
      };
    }
    
    byHour[key].count++;
    byHour[key].sales.push({
      hora: date.toLocaleTimeString('pt-BR'),
      cliente: t.customer?.name,
      valor: (t.amount / 100).toFixed(2)
    });
  });
  
  console.log('📊 VENDAS PAGAS POR HORA:\n');
  Object.keys(byHour).sort((a, b) => Number(a) - Number(b)).forEach(h => {
    console.log(`${h}:00 - ${byHour[h].count} vendas:`);
    byHour[h].sales.forEach(s => {
      console.log(`  ${s.hora} - R$ ${s.valor} - ${s.cliente}`);
    });
    console.log('');
  });
}

findAllSales().catch(e => console.error('Erro:', e));
