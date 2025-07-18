import { db } from "@/db/db";
import { OrganizationUserSettingsTable } from "@/db/schema";
import { revalidateOrganizationUserSettingsCache } from "./cache/organizationUserSettings";
import { eq, and } from "drizzle-orm";

export async function insertOrganizationUserSettings(
  settings: typeof OrganizationUserSettingsTable.$inferInsert
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values(settings)
    .onConflictDoNothing()
    .returning({
      userId: OrganizationUserSettingsTable.userId,
      organizationId: OrganizationUserSettingsTable.organizationId,
    });

  revalidateOrganizationUserSettingsCache(
    settings.userId!,
    settings.organizationId!
  );
}

export async function updateOrganizationUserSettings(
  { userId, orgId }: { userId: string; orgId: string },
  data: Partial<
    Omit<
      typeof OrganizationUserSettingsTable.$inferInsert,
      "userId" | "organizationId"
    >
  >
) {
  await db
    .insert(OrganizationUserSettingsTable)
    .values({ ...data, userId, organizationId: orgId })
    .onConflictDoUpdate({
      target: [
        OrganizationUserSettingsTable.userId,
        OrganizationUserSettingsTable.organizationId,
      ],
      set: data,
    })
    .returning({
      userId: OrganizationUserSettingsTable.userId,
      organizationId: OrganizationUserSettingsTable.organizationId,
    });

  revalidateOrganizationUserSettingsCache(userId, orgId);
}

export async function deleteOrganizationUserSettings(
  userId: string,
  organizationId: string
) {
  await db
    .delete(OrganizationUserSettingsTable)
    .where(
      and(
        eq(OrganizationUserSettingsTable.userId, userId),
        eq(OrganizationUserSettingsTable.organizationId, organizationId)
      )
    );

  revalidateOrganizationUserSettingsCache(userId, organizationId);
}
