type CacheTag =
  | "user"
  | "organization"
  | "userNotificationSettings"
  | "userResumes"
  | "jobListings"
  | "jobListingApplications"
  | "organizationUserSettings";

export function getGlobalTag(tag: CacheTag) {
  return `global:${tag}` as const;
}

export function getOrganizationTag(tag: CacheTag, orgId: string) {
  return `organization:${orgId}-${tag}` as const;
}

export function getIdTag(tag: CacheTag, id: string) {
  return `id:${tag}-${id}` as const;
}
