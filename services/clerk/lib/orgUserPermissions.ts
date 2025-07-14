import { auth } from "@clerk/nextjs/server";

type UserPermission =
  | "job_listing:create"
  | "job_listing:update"
  | "job_listing:delete"
  | "job_listing:change_status"
  | "job_listing_application:change_stage"
  | "job_listing_application:change_rating";

export async function hasOrgUserPermission(permission: UserPermission) {
  const { has } = await auth();
  return has({ permission });
}
