"use server";

import z from "zod";
import { organizationUserSettingsSchema } from "./schema";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { updateOrganizationUserSettings as updateOrganizationUserSettingsDb } from "../db/organizationUserSettings";

export async function updateOrganizationUserSettings(
  unsafeData: z.infer<typeof organizationUserSettingsSchema>
) {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();

  if (!userId || !orgId) {
    return {
      error: true,
      message: "You must be logged in to update your settings",
    };
  }

  const { success, data } =
    organizationUserSettingsSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error updating your settings",
    };
  }

  await updateOrganizationUserSettingsDb({ userId, orgId }, data);

  return {
    error: false,
    message: "Settings updated successfully",
  };
}
