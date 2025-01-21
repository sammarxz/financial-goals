import { differenceInMonths, addMonths, format } from "date-fns";

export const calculations = {
  calculateMonthlyValues(
    goal: number,
    startDate: Date,
    endDate: Date,
    investmentType: "fixed" | "growing",
    baseValue?: number,
    growthRate?: number
  ): { [key: string]: number } {
    const totalMonths = differenceInMonths(endDate, startDate) + 1;
    const monthlyValues: { [key: string]: number } = {};

    if (investmentType === "fixed") {
      const monthlyValue = goal / totalMonths;

      for (let i = 0; i < totalMonths; i++) {
        const currentDate = addMonths(startDate, i);
        const monthKey = format(currentDate, "yyyy-MM");
        monthlyValues[monthKey] = Number(monthlyValue.toFixed(2));
      }
    } else if (investmentType === "growing" && baseValue && growthRate) {
      let currentValue = baseValue;
      const growthMultiplier = 1 + growthRate / 100;

      for (let i = 0; i < totalMonths; i++) {
        const currentDate = addMonths(startDate, i);
        const monthKey = format(currentDate, "yyyy-MM");
        monthlyValues[monthKey] = Number(currentValue.toFixed(2));
        currentValue *= growthMultiplier;
      }
    }

    return monthlyValues;
  },

  calculateTotalInvested(
    monthlyValues: { [key: string]: number },
    completedMonths: string[]
  ): number {
    return completedMonths.reduce(
      (total, month) => total + (monthlyValues[month] || 0),
      0
    );
  },

  calculateProgress(totalInvested: number, goal: number): number {
    return Math.min((totalInvested / goal) * 100, 100);
  },

  validateMonthlyValues(
    monthlyValues: { [key: string]: number },
    goal: number,
    tolerance: number = 0.01
  ): boolean {
    const total = Object.values(monthlyValues).reduce(
      (sum, value) => sum + value,
      0
    );
    const difference = Math.abs(total - goal) / goal;
    return difference <= tolerance;
  },
};
