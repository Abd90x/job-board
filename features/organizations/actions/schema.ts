import { z } from "zod";

export const organizationUserSettingsSchema = z.object({
  newApplicationEmailNotification: z.boolean(),
  minRating: z.number().min(1).max(5).nullable(),
});
