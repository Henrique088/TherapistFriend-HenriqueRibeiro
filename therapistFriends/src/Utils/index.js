
export const formatarData = (dataString) => {
  if (!dataString) return '';
  
  const data = new Date(dataString);
  const agora = new Date();
  const diffDias = Math.floor((agora - data) / (1000 * 60 * 60 * 24));
  
  // Se for hoje, mostra apenas a hora
  if (diffDias === 0 || diffDias === -1) {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  }
  
  // Se for ontem
  if (diffDias === 1) return 'Ontem';
  
 
  // Se for até 7 dias atrás
  if (diffDias < 7) return `${diffDias} dias atrás`;
  
  // Mais de uma semana, mostra a data completa
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  }).format(data);
};



 