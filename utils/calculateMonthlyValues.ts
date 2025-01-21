import { differenceInMonths, addMonths, format } from "date-fns";

const roundToNearestFifty = (value: number) => {
  return Math.round(value / 50) * 50;
};

export function calculateMonthlyValues(
  goal: number,
  startDate: Date,
  endDate: Date,
  investmentType: "fixed" | "growing"
) {
  const monthlyValues: { [key: string]: number } = {};
  const months = differenceInMonths(endDate, startDate) + 1;

  if (investmentType === "fixed") {
    // Para aportes fixos, arredondamos para o múltiplo de 50 mais próximo
    const exactMonthlyValue = goal / months;
    const roundedMonthlyValue = roundToNearestFifty(exactMonthlyValue);
    let totalInvested = 0;

    // Distribuir os valores mensais
    for (let i = 0; i < months - 1; i++) {
      const currentDate = addMonths(startDate, i);
      const monthKey = format(currentDate, "yyyy-MM");
      monthlyValues[monthKey] = roundedMonthlyValue;
      totalInvested += roundedMonthlyValue;
    }

    // Último mês ajusta a diferença para atingir a meta exata
    const lastDate = addMonths(startDate, months - 1);
    const lastMonthKey = format(lastDate, "yyyy-MM");
    monthlyValues[lastMonthKey] = goal - totalInvested;
  } else {
    // Para aportes crescentes
    // Começamos com um valor inicial mais baixo e aumentamos gradualmente
    let baseValue = roundToNearestFifty(goal / (months * 2)); // Valor inicial aproximado
    const increment = roundToNearestFifty(
      (goal - baseValue * months) / ((months * (months - 1)) / 2)
    );

    let totalInvested = 0;

    // Distribuir os valores crescentes
    for (let i = 0; i < months - 1; i++) {
      const currentDate = addMonths(startDate, i);
      const monthKey = format(currentDate, "yyyy-MM");
      const currentValue = roundToNearestFifty(baseValue + increment * i);
      monthlyValues[monthKey] = currentValue;
      totalInvested += currentValue;
    }

    // Último mês ajusta para atingir a meta exata
    const lastDate = addMonths(startDate, months - 1);
    const lastMonthKey = format(lastDate, "yyyy-MM");
    monthlyValues[lastMonthKey] = goal - totalInvested;
  }

  return monthlyValues;
}
