"use server";

import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { jobListingAiSearchSchema, jobListingSchema } from "./schema";

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
import {
  getJobListingGlobalTag,
  getJobListingIdTag,
} from "../cache/jobListings";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getNextJobListingStatus } from "../lib/utils";
import {
  hasReachedMaxFeaturedJobListings,
  hasReachedMaxPublishedJobListings,
} from "../lib/planFeatureHelpers";
import { getMatchingJobListings } from "@/services/inngest/ai/getMatchingJobListings";

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

  return {
    error: false,
    message: "Job listing created successfully",
    jobListingId: jobListing.id,
  };
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

  return {
    error: false,
    message: "Job listing updated successfully",
    jobListingId: updatedJobListing.id,
  };
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

export async function getAiJobListingsResult(
  unsafeData: z.infer<typeof jobListingAiSearchSchema>
): Promise<
  { error: true; message: string } | { error: false; jobIds: string[] }
> {
  const { success, data } = jobListingAiSearchSchema.safeParse(unsafeData);

  if (!success)
    return {
      error: true,
      message: "There was an error processing your request",
    };

  const { userId } = await getCurrentUser();

  if (!userId) {
    return {
      error: true,
      message: "You must be logged in to use this feature",
    };
  }

  const allListings = await getPublicJobListings();

  const matchingListings = await getMatchingJobListings(
    data.query,
    allListings,
    {
      maxNumberOfJobs: 10,
    }
  );

  if (matchingListings.length === 0) {
    return {
      error: true,
      message: "No matching job listings found",
    };
  }
  return {
    error: false,
    jobIds: matchingListings,
  };
}

async function getPublicJobListings() {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  return db.query.JobListingTable.findMany({
    where: eq(JobListingTable.status, "published"),
  });
}
