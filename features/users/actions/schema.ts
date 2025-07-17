import z from "zod";

export const userNotificationsSettingsSchema = z.object({
  newJobEmailNotification: z.boolean(),
  aiPrompt: z
    .string()
    .transform((val) => (val.trim() === "" ? null : val))
    .nullable(),
});
