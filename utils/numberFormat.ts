export const formatCurrency = (value: string): string => {
  const cleanValue = value.replace(/[^\d]/g, "");
  const number = Number(cleanValue) / 100;
  return number.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d]/g, "");
  return Number(cleanValue) / 100;
};
