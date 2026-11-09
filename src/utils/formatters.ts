export const formatMoney = (amount: number): string => {
  return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const normalizeText = (value: string): string => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

export const generateOrderId = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  return `RC-${year}${month}${day}-${hours}${mins}`;
};
