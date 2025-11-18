import fetch from 'node-fetch';

const auth = 'Basic ' + Buffer.from('pk_WNNg2i_r8_iqeG3XrdJFI_q1I8ihd1yLoUa08Ip0LKaqxXxE:sk_jz1yyIaa0Dw2OWhMH0r16gUgWZ7N2PCpb6aK1crKPIFq02aD').toString('base64');

async function checkHours() {
  const response = await fetch('https://api.dhrtecnologialtda.com/v1/transactions?page=1&pageSize=200', {
    headers: { 'Authorization': auth }
  });
  
  const data = await response.json();
  const txs = data.data || [];
  const paid = txs.filter(t => t.status === 'paid');
  
  console.log('VENDAS PAGAS POR HORA:');
  console.log('Total de vendas pagas:', paid.length);
  console.log('');
  
  const byHour = {};
  paid.forEach(t => {
    const date = new Date(t.createdAt);
    const hour = date.getHours();
    if (!byHour[hour]) byHour[hour] = [];
    byHour[hour].push({
      id: t.id,
      hora: date.toLocaleTimeString('pt-BR'),
      valor: (t.amount/100).toFixed(2),
      cliente: t.customer?.name
    });
  });
  
  Object.keys(byHour).sort((a,b) => Number(a) - Number(b)).forEach(h => {
    console.log(`${h}:00 - ${byHour[h].length} vendas:`);
    byHour[h].forEach(v => {
      console.log(`  ${v.hora} - R$ ${v.valor} - ${v.cliente}`);
    });
    console.log('');
  });
}

checkHours().catch(e => console.error('Erro:', e));
