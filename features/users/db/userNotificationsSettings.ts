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

export async function updateUserNotificationsSettings(
  userId: string,
  settings: Partial<
    Omit<typeof UserNotificationSettingsTable.$inferInsert, "userId">
  >
) {
  await db
    .insert(UserNotificationSettingsTable)
    .values({ ...settings, userId })
    .onConflictDoUpdate({
      target: [UserNotificationSettingsTable.userId],
      set: { ...settings },
    });

  revalidateUserNotificationSettingsCache(userId);
}
