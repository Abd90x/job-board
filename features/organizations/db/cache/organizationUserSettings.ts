import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getOrganizationUserSettingsGlobalTag() {
  return getGlobalTag("organizationUserSettings");
}

export function getOrganizationUserSettingsIdTag(
  userId: string,
  organizationId: string
) {
  return getIdTag("organizationUserSettings", `${organizationId}-${userId}`);
}

export function revalidateOrganizationUserSettingsCache(
  userId: string,
  organizationId: string
) {
  revalidateTag(getOrganizationUserSettingsGlobalTag());
  revalidateTag(getOrganizationUserSettingsIdTag(userId, organizationId));
}
