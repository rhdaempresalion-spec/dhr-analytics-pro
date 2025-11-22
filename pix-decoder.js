/**
 * Módulo para decodificar QR Codes PIX (formato EMV)
 * Extrai informações do merchant e adquirente
 */

export function decodePIX(qrcode) {
  if (!qrcode || typeof qrcode !== 'string') {
    return { 
      full: 'Desconhecido', 
      merchant: 'N/A', 
      acquirer: 'N/A' 
    };
  }
  
  try {
    // PIX QR Code segue padrão EMV
    // Tag 59: Merchant Name
    // Tag 62: Additional Data (contém URL)
    
    let merchant = 'Desconhecido';
    let acquirer = 'N/A';
    
    // Extrair Merchant Name (tag 59)
    const merchantMatch = qrcode.match(/59(\d{2})(.+?)(?=\d{2}|$)/);
    if (merchantMatch) {
      const length = parseInt(merchantMatch[1], 10);
      merchant = merchantMatch[2].substring(0, length);
    }
    
    // Extrair URL do adquirente (geralmente em tag 62 ou 26)
    const urlMatch = qrcode.match(/([a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?)/i);
    if (urlMatch) {
      acquirer = urlMatch[1];
    }
    
    return {
      full: `${merchant}/${acquirer}`,
      merchant: merchant.trim(),
      acquirer: acquirer.trim()
    };
  } catch (error) {
    console.error('Erro ao decodificar PIX:', error);
    return { 
      full: 'Erro ao decodificar', 
      merchant: 'N/A', 
      acquirer: 'N/A' 
    };
  }
}
