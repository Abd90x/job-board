"use server";

import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { jobListingSchema } from "./schema";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  insertJobListing,
  updateJobListing as updateJobListingDb,
} from "../db/jobListings";
import { db } from "@/db/db";
import { and, eq } from "drizzle-orm";
import { JobListingTable } from "@/db/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingIdTag } from "../cache/jobListings";

export async function createJobListing(
  unsafeData: z.infer<typeof jobListingSchema>
) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) {
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

  if (!orgId) {
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

  const updatedJobListing = await updateJobListingDb(id, {
    ...data,
    organizationId: orgId,
  });

  redirect(`/employer/job-listings/${updatedJobListing.id}`);
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
