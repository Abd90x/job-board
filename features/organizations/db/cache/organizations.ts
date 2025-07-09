import { getGlobalTag, getIdTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getOrganizationGlobalTag() {
  return getGlobalTag("organization");
}

export function getOrganizationIdTag(id: string) {
  return getIdTag("organization", id);
}

export function revalidateOrganizationCache(id: string) {
  revalidateTag(getOrganizationGlobalTag());
  revalidateTag(getOrganizationIdTag(id));
}
