"use server";

import { userNotificationsSettingsSchema } from "./schema";
import z from "zod";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { updateUserNotificationsSettings as updateUserNotificationsSettingsDB } from "../db/userNotificationsSettings";

export async function updateUserNotificationsSettings(
  unsafeData: z.infer<typeof userNotificationsSettingsSchema>
) {
  const { userId } = await getCurrentUser();

  if (!userId)
    return {
      error: true,
      message: "You must be logged in to update your notification settings.",
    };

  const { success, data } =
    userNotificationsSettingsSchema.safeParse(unsafeData);

  if (!success)
    return {
      error: true,
      message: "There was an error updating your notification settings.",
    };

  await updateUserNotificationsSettingsDB(userId, data);

  return {
    error: false,
    message: "Notification settings updated successfully.",
  };
}
