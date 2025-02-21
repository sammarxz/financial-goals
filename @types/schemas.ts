import { z } from "zod";

// Schema base para valores mensais
export const MonthlyValuesSchema = z.record(z.string(), z.number());

// Schema para dados do usuário
export const UserDataSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    goal: z.number().min(100, "Meta deve ser de pelo menos R$ 100,00"),
    startDate: z.date(),
    endDate: z.date(),
    investmentType: z.enum(["fixed", "growing"]),
    monthlyValues: MonthlyValuesSchema,
    completedMonths: z.array(z.string()),
  })
  .refine((data) => {
    // Garante que as datas são válidas antes de comparar
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return !isNaN(start.getTime()) && !isNaN(end.getTime()) && end > start;
  }, "Data final deve ser posterior à data inicial");

// Schema para notificações
export const NotificationSchema = z.object({
  enabled: z.boolean(),
  lastNotificationDate: z.date().nullable(),
});

// Schema para configurações do app
export const AppConfigSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  currency: z.enum(["BRL", "USD", "EUR"]),
  locale: z.enum(["pt-BR", "en-US", "es-ES"]),
});

// Inferindo tipos dos schemas
export type UserData = z.infer<typeof UserDataSchema>;
export type NotificationConfig = z.infer<typeof NotificationSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

// Tipos utilitários
export type MonthlyValue = {
  month: string;
  formattedMonth: string;
  value: number;
  completed: boolean;
};

export type PreviewValue = {
  month: string;
  value: number;
  accumulated: number;
};
