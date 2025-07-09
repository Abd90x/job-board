import { getGlobalTag, getIdTag, getOrganizationTag } from "@/lib/dataCache";
import { revalidateTag } from "next/cache";

export function getJobListingGlobalTag() {
  return getGlobalTag("jobListings");
}

export function getJobListingOrganizationIdTag(orgId: string) {
  return getOrganizationTag("jobListings", orgId);
}

export function getJobListingIdTag(id: string) {
  return getIdTag("jobListings", id);
}

export function revalidateJobListingCache({
  id,
  orgId,
}: {
  id: string;
  orgId: string;
}) {
  revalidateTag(getJobListingGlobalTag());
  revalidateTag(getJobListingOrganizationIdTag(orgId));
  revalidateTag(getJobListingIdTag(id));
}
