import { db } from "@/db/db";
import { UserNotificationSettingsTable } from "@/db/schema";
import { revalidateUserNotificationSettingsCache } from "./cache/userNotificationsSettings";

export async function insertUserNotificationSettings(
  settings: typeof UserNotificationSettingsTable.$inferInsert
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values(settings)
    .onConflictDoNothing();

  revalidateUserNotificationSettingsCache(settings.userId);
}
