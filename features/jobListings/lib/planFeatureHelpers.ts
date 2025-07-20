import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { getJobListingOrganizationIdTag } from "../cache/jobListings";
import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { hasPlanFeature } from "@/services/clerk/lib/planFeatures";

export async function hasReachedMaxPublishedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return true;

  const count = await getPublishedJobListingsCount(orgId);

  const canPost = await Promise.all([
    hasPlanFeature("post_1_job_listing").then((has) => has && count < 1),
    hasPlanFeature("post_3_job_listings").then((has) => has && count < 3),
    hasPlanFeature("post_15_job_listings").then((has) => has && count < 15),
  ]);

  return !canPost.some(Boolean);
}

export async function hasReachedMaxFeaturedJobListings() {
  const { orgId } = await getCurrentOrganization();
  if (!orgId) return true;

  const count = await getFeaturedJobListingsCount(orgId);

  const canFeatured = await Promise.all([
    hasPlanFeature("1_featured_job_listing").then((has) => has && count < 1),
    hasPlanFeature("unlimited_featured_job_listings"),
  ]);

  return !canFeatured.some(Boolean);
}

async function getPublishedJobListingsCount(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationIdTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.organizationId, orgId),
        eq(JobListingTable.status, "published")
      )
    );

  return res?.count ?? 0;
}

async function getFeaturedJobListingsCount(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationIdTag(orgId));

  const [res] = await db
    .select({ count: count() })
    .from(JobListingTable)
    .where(
      and(
        eq(JobListingTable.organizationId, orgId),
        eq(JobListingTable.isFeatured, true)
      )
    );

  return res?.count ?? 0;
}
