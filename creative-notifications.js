// Sistema de Notificações Criativas Inteligentes
// Analisa média semanal e gera mensagens contextuais

export const creativeNotifications = {
  // Notificações para quando está MUITO ABAIXO da média (-50% ou mais)
  veryBad: {
    morning: [
      { title: "☕ Bom dia! Mas... 🤔", text: "Faturou R$ {VALOR} líquido ontem. Tá {PERCENT}% abaixo da média semanal (R$ {MEDIA}). BM caiu? Criativos saturaram? Bora ajustar! 🔧" },
      { title: "🌅 Dia novo, estratégia nova!", text: "R$ {VALOR} líquido ontem... {PERCENT}% abaixo do normal. Hora de testar novos ângulos! O que funcionou semana passada? 🎯" },
      { title: "⚠️ Alerta de performance!", text: "Eita! R$ {VALOR} ontem. Média semanal: R$ {MEDIA}. Diferença de {PERCENT}%. Públicos cansaram? Bora escalar outros! 🚀" },
      { title: "🔴 Houston, temos um problema!", text: "R$ {VALOR} líquido. Tá {PERCENT}% abaixo da meta. CPA subiu? CTR caiu? Hora de investigar os dados! 📊" },
      { title: "💭 Reflexão matinal...", text: "R$ {VALOR} ontem vs R$ {MEDIA} de média. O que mudou? Concorrência? Sazonalidade? Vamos descobrir! 🕵️" },
      { title: "🎯 Foco no que importa!", text: "Faturou R$ {VALOR} ({PERCENT}% abaixo). Mas calma! Dias ruins fazem parte. Analisa, ajusta e volta mais forte! 💪" },
      { title: "📉 Momento de pivotar?", text: "R$ {VALOR} líquido. Bem abaixo dos R$ {MEDIA} habituais. Testa novos produtos? Novos nichos? Hora de inovar! 🔄" }
    ],
    afternoon: [
      { title: "🌤️ Boa tarde! Vamos recuperar?", text: "Ontem: R$ {VALOR} ({PERCENT}% abaixo da média). Hoje pode ser diferente! Já testou novos criativos? ⚡" },
      { title: "📊 Análise do meio-dia", text: "R$ {VALOR} ontem. Média: R$ {MEDIA}. Gap de {PERCENT}%. Otimiza campanhas, testa ofertas, escala o que funciona! 🎯" },
      { title: "🔍 Investigando a queda...", text: "Faturamento: R$ {VALOR}. Bem abaixo do esperado. Checa: CPM, CPC, CTR, CR. Onde tá o gargalo? 🔧" },
      { title: "💡 Hora de testar!", text: "R$ {VALOR} ontem ({PERCENT}% abaixo). Que tal testar: novos ângulos, novos públicos, novos horários? 🚀" },
      { title: "⚙️ Modo otimização ON", text: "Lucro líquido: R$ {VALOR}. Abaixo dos R$ {MEDIA} normais. Analisa funil, otimiza checkout, melhora copy! 📈" },
      { title: "🎲 Teste A/B time!", text: "R$ {VALOR} vs R$ {MEDIA} de média. Diferença de {PERCENT}%. Roda testes, valida hipóteses, escala winners! 🏆" },
      { title: "🔄 Pivotando estratégia", text: "Faturou R$ {VALOR} ({PERCENT}% abaixo). Hora de mudar: criativos, copy, oferta ou público? Testa tudo! 💪" }
    ],
    night: [
      { title: "🌙 Reflexão noturna...", text: "R$ {VALOR} hoje. {PERCENT}% abaixo da média (R$ {MEDIA}). Amanhã é outro dia! Planeja, testa, executa! 🎯" },
      { title: "😴 Descansa, mas não desiste!", text: "Lucro: R$ {VALOR}. Abaixo do esperado. Mas lembra: todo grande marketer já teve dias ruins. Bora virar o jogo! 💪" },
      { title: "📉 Dia difícil, aprendizado valioso", text: "R$ {VALOR} líquido ({PERCENT}% abaixo). Anota o que não funcionou. Amanhã você volta mais esperto! 🧠" },
      { title: "🌃 Fim de dia, começo de plano", text: "Faturou R$ {VALOR}. Média: R$ {MEDIA}. Diferença: {PERCENT}%. Já sabe o que testar amanhã? 🚀" },
      { title: "💤 Dorme tranquilo, acorda focado!", text: "R$ {VALOR} hoje. Abaixo da meta. Mas calma! Analisa dados, ajusta estratégia, executa amanhã! 🎯" },
      { title: "🌠 Amanhã é outro dia!", text: "Lucro líquido: R$ {VALOR} ({PERCENT}% abaixo). Descansa, recarrega, volta com tudo! Você consegue! 🔥" },
      { title: "📚 Lição aprendida", text: "R$ {VALOR} vs R$ {MEDIA} de média. Gap de {PERCENT}%. Anota, aprende, melhora. É assim que cresce! 📈" }
    ]
  },

  // Notificações para quando está ABAIXO da média (-20% a -49%)
  bad: {
    morning: [
      { title: "☕ Bom dia! Vamos melhorar?", text: "Faturou R$ {VALOR} líquido ontem. Tá {PERCENT}% abaixo da média (R$ {MEDIA}). Nada grave, mas dá pra otimizar! 🔧" },
      { title: "🌅 Novo dia, novas oportunidades!", text: "R$ {VALOR} ontem. Um pouco abaixo dos R$ {MEDIA} habituais. Testa novos criativos hoje! 🎨" },
      { title: "📊 Análise matinal", text: "Lucro líquido: R$ {VALOR} ({PERCENT}% abaixo da média). Checa métricas e otimiza! Você tá perto! 🎯" },
      { title: "💪 Foco e disciplina!", text: "R$ {VALOR} ontem vs R$ {MEDIA} de média. Pequena queda. Ajusta lances, testa públicos, escala! 🚀" },
      { title: "🔍 Hora de otimizar!", text: "Faturamento: R$ {VALOR}. {PERCENT}% abaixo do normal. Analisa campanhas e melhora! Tá quase lá! ⚡" },
      { title: "🎯 Mira no alvo!", text: "R$ {VALOR} líquido. Abaixo dos R$ {MEDIA} esperados. Foca no que converte e escala! 📈" },
      { title: "🚀 Preparado pra decolar?", text: "Ontem: R$ {VALOR} ({PERCENT}% abaixo). Hoje pode ser melhor! Otimiza e testa! 💡" }
    ],
    afternoon: [
      { title: "🌤️ Boa tarde! Como tá o dia?", text: "Ontem fez R$ {VALOR} ({PERCENT}% abaixo da média). Hoje já testou algo novo? 🔄" },
      { title: "📈 Hora de recuperar!", text: "R$ {VALOR} ontem. Média: R$ {MEDIA}. Diferença de {PERCENT}%. Otimiza agora e recupera! ⚡" },
      { title: "💡 Ideias pra testar", text: "Lucro: R$ {VALOR} (abaixo da média). Que tal: novos ângulos, urgência, escassez? 🎯" },
      { title: "🔧 Modo ajuste fino", text: "R$ {VALOR} vs R$ {MEDIA}. Gap de {PERCENT}%. Pequenos ajustes = grandes resultados! 🚀" },
      { title: "🎲 Testa e valida!", text: "Faturou R$ {VALOR} ({PERCENT}% abaixo). Roda testes, valida hipóteses, escala winners! 🏆" },
      { title: "⚙️ Otimização contínua", text: "R$ {VALOR} líquido. Um pouco abaixo. Melhora copy, criativos e ofertas! Você consegue! 💪" },
      { title: "📊 Dados não mentem", text: "Lucro: R$ {VALOR}. Média: R$ {MEDIA}. Analisa métricas, encontra gargalos, resolve! 🔍" }
    ],
    night: [
      { title: "🌙 Fim de dia, hora de planejar", text: "R$ {VALOR} hoje ({PERCENT}% abaixo da média). Amanhã você recupera! Planeja agora! 📝" },
      { title: "😊 Não foi ruim, mas dá pra melhorar!", text: "Lucro líquido: R$ {VALOR}. Abaixo dos R$ {MEDIA} normais. Amanhã você supera! 🚀" },
      { title: "💭 Reflexão noturna", text: "R$ {VALOR} vs R$ {MEDIA}. Diferença: {PERCENT}%. O que pode melhorar amanhã? 🤔" },
      { title: "🌃 Descansa e volta forte!", text: "Faturou R$ {VALOR} ({PERCENT}% abaixo). Nada grave! Descansa e amanhã você arrasa! 💪" },
      { title: "📚 Aprendizado do dia", text: "R$ {VALOR} líquido. Um pouco abaixo. Anota insights e aplica amanhã! 📈" },
      { title: "🌠 Amanhã é outro dia!", text: "Lucro: R$ {VALOR}. Média: R$ {MEDIA}. Pequena queda. Amanhã você recupera! 🔥" },
      { title: "💤 Dorme tranquilo!", text: "R$ {VALOR} hoje ({PERCENT}% abaixo da média). Tá no caminho certo! Continua! ⚡" }
    ]
  },

  // Notificações para quando está NA MÉDIA (-10% a +10%)
  average: {
    morning: [
      { title: "☕ Bom dia, consistência!", text: "Faturou R$ {VALOR} líquido ontem. Na média semanal (R$ {MEDIA})! Consistência é chave! 💪" },
      { title: "🌅 Dia produtivo pela frente!", text: "R$ {VALOR} ontem. Dentro da média! Agora é hora de buscar o próximo nível! 🚀" },
      { title: "📊 Performance estável!", text: "Lucro líquido: R$ {VALOR}. Na média dos R$ {MEDIA}. Estabilidade é lucro! 📈" },
      { title: "🎯 No caminho certo!", text: "R$ {VALOR} ontem vs R$ {MEDIA} de média. Tá certinho! Mantém o ritmo! ⚡" },
      { title: "💚 Verde sempre!", text: "Faturamento: R$ {VALOR}. Na faixa dos R$ {MEDIA} habituais. Consistência wins! 🏆" },
      { title: "🔄 Mantém o padrão!", text: "R$ {VALOR} líquido. Média semanal: R$ {MEDIA}. Tá no padrão! Agora escala! 🚀" },
      { title: "⚖️ Equilíbrio perfeito!", text: "Lucro: R$ {VALOR}. Bem na média (R$ {MEDIA}). Estável e lucrativo! 💰" }
    ],
    afternoon: [
      { title: "🌤️ Boa tarde! Tudo nos trilhos!", text: "Ontem: R$ {VALOR}. Na média de R$ {MEDIA}. Mantém o foco e escala! 🎯" },
      { title: "📈 Performance consistente!", text: "R$ {VALOR} líquido. Média: R$ {MEDIA}. Tá estável! Hora de testar escalas! 🚀" },
      { title: "💡 Estabilidade = Previsibilidade", text: "Faturou R$ {VALOR}. Na média semanal. Previsível é escalável! 📊" },
      { title: "🔧 Mantém e otimiza!", text: "R$ {VALOR} vs R$ {MEDIA}. No padrão! Agora otimiza pra crescer! ⚡" },
      { title: "🎲 Hora de testar escalas!", text: "Lucro: R$ {VALOR}. Consistente! Testa orçamentos maiores? 💰" },
      { title: "⚙️ Máquina rodando!", text: "R$ {VALOR} líquido. Média: R$ {MEDIA}. Sistema funcionando! Escala agora! 🚀" },
      { title: "📊 Métricas saudáveis!", text: "Faturamento: R$ {VALOR}. Na média dos R$ {MEDIA}. Tudo certo! Mantém! 💪" }
    ],
    night: [
      { title: "🌙 Dia sólido!", text: "R$ {VALOR} hoje. Na média de R$ {MEDIA}. Dia produtivo! Descansa merecido! 😊" },
      { title: "😌 Satisfação garantida!", text: "Lucro líquido: R$ {VALOR}. Dentro da média semanal. Consistência é rei! 👑" },
      { title: "💭 Balanço positivo", text: "R$ {VALOR} vs R$ {MEDIA}. No padrão! Amanhã mantém ou supera! 🎯" },
      { title: "🌃 Fim de dia tranquilo", text: "Faturou R$ {VALOR}. Na faixa esperada. Dorme tranquilo, acordar focado! 💤" },
      { title: "📚 Mais um dia no lucro!", text: "R$ {VALOR} líquido. Média: R$ {MEDIA}. Estável e lucrativo! 📈" },
      { title: "🌠 Consistência vence!", text: "Lucro: R$ {VALOR}. Na média semanal. Mantém o ritmo! Você tá bem! 💚" },
      { title: "💤 Descansa em paz!", text: "R$ {VALOR} hoje. Dentro do esperado (R$ {MEDIA}). Dia produtivo! 🔥" }
    ]
  },

  // Notificações para quando está ACIMA da média (+11% a +49%)
  good: {
    morning: [
      { title: "☕ Bom dia, campeão!", text: "Faturou R$ {VALOR} líquido ontem! {PERCENT}% acima da média (R$ {MEDIA})! Tá voando! 🚀" },
      { title: "🌅 Acordou faturando!", text: "R$ {VALOR} ontem! Acima dos R$ {MEDIA} habituais! O que fez de diferente? Replica! 🔥" },
      { title: "📊 Performance acima da média!", text: "Lucro líquido: R$ {VALOR} ({PERCENT}% acima da média). Tá mandando bem! Escala isso! 📈" },
      { title: "🎯 Acertou em cheio!", text: "R$ {VALOR} ontem vs R$ {MEDIA} de média. {PERCENT}% acima! Descobriu a fórmula! ⚡" },
      { title: "💚 Verde escuro!", text: "Faturamento: R$ {VALOR}. Bem acima dos R$ {MEDIA} normais. Continua assim! 🏆" },
      { title: "🔥 Tá pegando fogo!", text: "R$ {VALOR} líquido! {PERCENT}% acima da média! O que tá fazendo? Escala! 🚀" },
      { title: "⚡ Energia positiva!", text: "Lucro: R$ {VALOR}. Acima dos R$ {MEDIA} esperados. Momentum tá aí! Aproveita! 💪" }
    ],
    afternoon: [
      { title: "🌤️ Boa tarde, top performer!", text: "Ontem: R$ {VALOR} ({PERCENT}% acima da média). Hoje pode ser ainda melhor! 🚀" },
      { title: "📈 Crescimento acelerado!", text: "R$ {VALOR} líquido! Média: R$ {MEDIA}. {PERCENT}% acima! Escala com cuidado! ⚡" },
      { title: "💡 Fórmula descoberta!", text: "Faturou R$ {VALOR}. Acima da média semanal. Replica o que funcionou! 🎯" },
      { title: "🔧 Otimização funcionou!", text: "R$ {VALOR} vs R$ {MEDIA}. {PERCENT}% acima! Seus ajustes deram resultado! 🏆" },
      { title: "🎲 Momento de escalar!", text: "Lucro: R$ {VALOR} ({PERCENT}% acima da média). Aumenta budget? 💰" },
      { title: "⚙️ Máquina turbinada!", text: "R$ {VALOR} líquido! Bem acima dos R$ {MEDIA} normais. Tá on fire! 🔥" },
      { title: "📊 Métricas excelentes!", text: "Faturamento: R$ {VALOR}. {PERCENT}% acima da média. Mantém o gás! 🚀" }
    ],
    night: [
      { title: "🌙 Dia épico!", text: "R$ {VALOR} hoje! {PERCENT}% acima da média (R$ {MEDIA})! Descansa orgulhoso! 😎" },
      { title: "😊 Satisfação máxima!", text: "Lucro líquido: R$ {VALOR}. Bem acima dos R$ {MEDIA} esperados. Você é foda! 🔥" },
      { title: "💭 Reflexão vitoriosa", text: "R$ {VALOR} vs R$ {MEDIA}. {PERCENT}% acima! O que fez certo? Anota! 📝" },
      { title: "🌃 Fim de dia glorioso", text: "Faturou R$ {VALOR} ({PERCENT}% acima da média). Dorme feliz! Mereceu! 💤" },
      { title: "📚 Lição de sucesso!", text: "R$ {VALOR} líquido. Acima da média semanal. Replica amanhã! 📈" },
      { title: "🌠 Estrela brilhando!", text: "Lucro: R$ {VALOR}. {PERCENT}% acima dos R$ {MEDIA} normais. Tá brilhando! ⭐" },
      { title: "💤 Descansa em glória!", text: "R$ {VALOR} hoje. Bem acima do esperado. Dia vitorioso! 🏆" }
    ]
  },

  // Notificações para quando está MUITO ACIMA da média (+50% ou mais)
  veryGood: {
    morning: [
      { title: "☕ CARALHO! BOM DIA!", text: "Faturou R$ {VALOR} líquido ontem! {PERCENT}% acima da média (R$ {MEDIA})! ABSURDO! 🤯" },
      { title: "🌅 ACORDOU MILIONÁRIO!", text: "R$ {VALOR} ontem! MUITO acima dos R$ {MEDIA} habituais! O QUE VOCÊ FEZ?! 🚀" },
      { title: "📊 PERFORMANCE INSANA!", text: "Lucro líquido: R$ {VALOR} ({PERCENT}% acima da média). TÁ MALUCO! ESCALA TUDO! 🔥" },
      { title: "🎯 JACKPOT!", text: "R$ {VALOR} ontem vs R$ {MEDIA} de média. {PERCENT}% ACIMA! VOCÊ É UMA LENDA! ⚡" },
      { title: "💚 VERDE NEON!", text: "Faturamento: R$ {VALOR}. EXPLODIU os R$ {MEDIA} normais. NÃO PARA! 🏆" },
      { title: "🔥 PEGOU FOGO MESMO!", text: "R$ {VALOR} líquido! {PERCENT}% acima da média! ESCALA ATÉ NÃO DAR MAIS! 🚀" },
      { title: "⚡ RAIO CAIU!", text: "Lucro: R$ {VALOR}. MUITO acima dos R$ {MEDIA} esperados. MOMENTUM INSANO! 💪" }
    ],
    afternoon: [
      { title: "🌤️ BOA TARDE, MONSTRO!", text: "Ontem: R$ {VALOR} ({PERCENT}% acima da média). HOJE BATE RECORDE! 🚀" },
      { title: "📈 CRESCIMENTO EXPONENCIAL!", text: "R$ {VALOR} líquido! Média: R$ {MEDIA}. {PERCENT}% ACIMA! ESCALA COM TUDO! ⚡" },
      { title: "💡 FÓRMULA DO OURO!", text: "Faturou R$ {VALOR}. MUITO acima da média. REPLICA E ESCALA! 🎯" },
      { title: "🔧 OTIMIZAÇÃO PERFEITA!", text: "R$ {VALOR} vs R$ {MEDIA}. {PERCENT}% ACIMA! VOCÊ DOMINOU O JOGO! 🏆" },
      { title: "🎲 HORA DE DOMINAR!", text: "Lucro: R$ {VALOR} ({PERCENT}% acima da média). DOBRA O BUDGET! 💰" },
      { title: "⚙️ MÁQUINA DE DINHEIRO!", text: "R$ {VALOR} líquido! MUITO acima dos R$ {MEDIA} normais. IMPARÁVEL! 🔥" },
      { title: "📊 MÉTRICAS SURREAIS!", text: "Faturamento: R$ {VALOR}. {PERCENT}% acima da média. VOCÊ É O CARA! 🚀" }
    ],
    night: [
      { title: "🌙 DIA HISTÓRICO!", text: "R$ {VALOR} hoje! {PERCENT}% acima da média (R$ {MEDIA})! LENDÁRIO! 😎" },
      { title: "😊 SATISFAÇÃO INFINITA!", text: "Lucro líquido: R$ {VALOR}. EXPLODIU os R$ {MEDIA} esperados. VOCÊ É FODA! 🔥" },
      { title: "💭 REFLEXÃO VITORIOSA", text: "R$ {VALOR} vs R$ {MEDIA}. {PERCENT}% ACIMA! ANOTA TUDO! REPLICA! 📝" },
      { title: "🌃 FIM DE DIA ÉPICO", text: "Faturou R$ {VALOR} ({PERCENT}% acima da média). DORME FELIZ! VOCÊ MERECE! 💤" },
      { title: "📚 MASTERCLASS DE SUCESSO!", text: "R$ {VALOR} líquido. MUITO acima da média. ENSINA OS OUTROS! 📈" },
      { title: "🌠 ESTRELA CADENTE!", text: "Lucro: R$ {VALOR}. {PERCENT}% acima dos R$ {MEDIA} normais. BRILHOU DEMAIS! ⭐" },
      { title: "💤 DESCANSA EM GLÓRIA!", text: "R$ {VALOR} hoje. MUITO acima do esperado. DIA VITORIOSO! 🏆" }
    ]
  },

  // Notificação especial para R$ 200k+ (segredo!)
  legendary: {
    morning: [
      { title: "🏆 O IMPOSSÍVEL ACONTECEU!", text: "R$ {VALOR} LÍQUIDO ONTEM! VOCÊ ATINGIU O LENDÁRIO! 200K+! PARABÉNS, MESTRE! 👑🔥🚀" }
    ],
    afternoon: [
      { title: "👑 REI DO MARKETING!", text: "R$ {VALOR} LÍQUIDO! 200K+! VOCÊ TRANSCENDEU! AGORA É HISTÓRIA! 🏆⚡💎" }
    ],
    night: [
      { title: "💎 LENDA VIVA!", text: "R$ {VALOR} HOJE! 200K+! VOCÊ É IMORTAL! DESCANSA, CAMPEÃO! 👑🔥😎" }
    ]
  }
};

// Função para selecionar notificação baseada em performance
export function selectNotification(currentValue, weeklyAverage, timeOfDay) {
  const percent = ((currentValue - weeklyAverage) / weeklyAverage) * 100;
  
  // Determinar categoria
  let category;
  if (currentValue >= 200000) {
    category = 'legendary';
  } else if (percent <= -50) {
    category = 'veryBad';
  } else if (percent <= -20) {
    category = 'bad';
  } else if (percent <= 10 && percent >= -10) {
    category = 'average';
  } else if (percent <= 49) {
    category = 'good';
  } else {
    category = 'veryGood';
  }
  
  // Determinar período do dia
  let period;
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    period = 'morning';
  } else if (hour >= 12 && hour < 19) {
    period = 'afternoon';
  } else {
    period = 'night';
  }
  
  // Selecionar notificação aleatória da categoria e período
  const notifications = creativeNotifications[category][period];
  const selected = notifications[Math.floor(Math.random() * notifications.length)];
  
  // Substituir variáveis
  const formattedValue = currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedAverage = weeklyAverage.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formattedPercent = Math.abs(percent).toFixed(1);
  
  return {
    title: selected.title,
    text: selected.text
      .replace('{VALOR}', formattedValue)
      .replace('{MEDIA}', formattedAverage)
      .replace('{PERCENT}', formattedPercent)
  };
}
