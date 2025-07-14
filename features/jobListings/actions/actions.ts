"use server";

import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { jobListingSchema } from "./schema";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
  deleteJobListing as deleteJobListingDb,
} from "../db/jobListings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/db/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingIdTag } from "../cache/jobListings";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../lib/utils";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "../lib/planFeatureHelpers";

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("job_listing:create"))) {
    return {
      error: true,
      message: "You don't have permission to create a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error creating the job listing",
    };
  }

  const jobListing = await insertJobListing({
    ...data,
    organizationId: orgId,
    status: "draft",
  });

  redirect(`/employer/job-listings/${jobListing.id}`);
}

export async function updateJobListing(
  id: string,
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("job_listing:update"))) {
    return {
      error: true,
      message: "You don't have permission to update a job listing",
    };
  }

  const { success, data } = jobListingSchema.safeParse(unsafeData);

  if (!success) {
    return {
      error: true,
      message: "There was an error updating the job listing",
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: "Job listing not found",
    };
  }

  const updatedJobListing = await updateJobListingDb(id, {
    ...data,
    organizationId: orgId,
  });

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
}

export async function toggleJobListingStatus(id: string) {
  const error = {
    error: true,
    message: "You don't have permission to update a job listing status",
  };
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("job_listing:update"))) {
    return error;
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: "Job listing not found",
    };
  }

  const newStatus = getNextJobListingStatus(jobListing.status);

  if (
    !(await hasOrgUserPermission("job_listing:change_status")) ||
    (newStatus === "published" && (await hasReachedMaxPublishedJobListings()))
  )
    return error;

  await updateJobListingDb(id, {
    ...jobListing,
    status: newStatus,
    isFeatured: newStatus === "published" ? undefined : false,
    postedAt:
      newStatus === "published" && jobListing.postedAt === null
        ? new Date()
        : undefined,
  });

  return {
    error: false,
    message: `Job listing status updated to ${newStatus}`,
  };
}

export async function toggleJobListingFeatured(id: string) {
  const error = {
    error: true,
    message:
      "You don't have permission to update a job listing featured status",
  };
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("job_listing:update"))) {
    return error;
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: "Job listing not found",
    };
  }

  if (
    !(await hasOrgUserPermission("job_listing:change_status")) ||
    (jobListing.isFeatured && (await hasReachedMaxFeaturedJobListings()))
  )
    return error;

  await updateJobListingDb(id, {
    ...jobListing,
    isFeatured: !jobListing.isFeatured,
  });

  return {
    error: false,
    message: `Job listing featured status updated`,
  };
}

export async function deleteJobListing(id: string) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId || !(await hasOrgUserPermission("job_listing:delete"))) {
    return {
      error: true,
      message: "You don't have permission to delete a job listing",
    };
  }

  const jobListing = await getJobListing(id, orgId);

  if (!jobListing) {
    return {
      error: true,
      message: "Job listing not found",
    };
  }

  await deleteJobListingDb(id);

  redirect("/employer");
}

async function getJobListing(id: string, orgId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(id));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, id),
      eq(JobListingTable.organizationId, orgId)
    ),
  });
}
