// Nova função analyzeDashboard que respeita os filtros
function analyzeDashboard(transactions) {
  // transactions já vem filtrado pelo período selecionado
  
  // Calcular leads únicos (CPFs únicos) do período
  const uniqueLeads = new Set();
  transactions.forEach(t => {
    if (t.customer && t.customer.document && t.customer.document.number) {
      uniqueLeads.add(t.customer.document.number);
    }
  });
  const totalLeads = uniqueLeads.size;

  const calc = (txs) => {
    const paid = txs.filter(t => t.status === 'paid');
    const pending = txs.filter(t => ['waiting_payment','pending'].includes(t.status));
    const paidAmount = paid.reduce((s,t) => s + (t.amount||0), 0) / 100;
    const netAmount = paid.reduce((s,t) => s + (t.fee?.netAmount||0), 0) / 100;
    const estimatedFee = paidAmount - netAmount;
    const refundedAmount = txs.reduce((s,t) => s + (t.refundedAmount||0), 0) / 100;
    
    return {
      total: txs.length,
      paid: paid.length,
      pending: pending.length,
      paidAmount,
      pendingAmount: pending.reduce((s,t) => s + (t.amount||0), 0) / 100,
      totalAmount: txs.reduce((s,t) => s + (t.amount||0), 0) / 100,
      avgTicket: paid.length ? paid.reduce((s,t) => s + (t.amount||0), 0) / paid.length / 100 : 0,
      conversion: txs.length ? (paid.length / txs.length * 100).toFixed(1) : 0,
      netAmount,
      estimatedFee,
      refundedAmount
    };
  };

  // Calcular vendas por hora (baseado no período filtrado)
  const hourly = Array(24).fill(0).map(() => ({sales:0, amount:0}));
  transactions.filter(t => t.status === 'paid').forEach(t => {
    const date = new Date(t.createdAt);
    const utcHour = date.getUTCHours();
    const spHour = (utcHour - 3 + 24) % 24;
    hourly[spHour].sales++;
    hourly[spHour].amount += (t.amount||0) / 100;
  });

  const bestHour = hourly.reduce((best, curr, idx) => 
    curr.sales > hourly[best].sales ? idx : best, 0);

  // Calcular vendas por dia da semana (baseado no período filtrado)
  const weekdays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const byWeekday = weekdays.map(d => ({day:d, sales:0, amount:0}));
  transactions.filter(t => t.status === 'paid').forEach(t => {
    const date = new Date(t.createdAt);
    const spDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
    const d = spDate.getUTCDay();
    byWeekday[d].sales++;
    byWeekday[d].amount += (t.amount||0) / 100;
  });

  // Calcular últimos 7 e 30 dias baseado na data final do período
  // Se não houver filtro de data, usar hoje
  const allTxs = transactions;
  const latestDate = allTxs.length > 0 
    ? Math.max(...allTxs.map(t => new Date(t.createdAt).getTime()))
    : Date.now();
  
  const weekAgo = new Date(latestDate - 7*86400000);
  const monthAgo = new Date(latestDate - 30*86400000);
  
  const weekTxs = allTxs.filter(t => new Date(t.createdAt) >= weekAgo);
  const monthTxs = allTxs.filter(t => new Date(t.createdAt) >= monthAgo);

  return {
    period: calc(transactions),  // Renomear de "today" para "period"
    week: calc(weekTxs),
    month: calc(monthTxs),
    hourly,
    bestHour: `${bestHour}:00`,
    weekdayStats: byWeekday,
    totalLeads: totalLeads
  };
}
