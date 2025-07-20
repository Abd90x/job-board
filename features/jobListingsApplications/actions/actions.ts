"use server";

import { db } from "@/db/db";
import {
  ApplicationStage,
  applicationStages,
  JobListingTable,
  UserResumeTable,
} from "@/db/schema";
import { newJobListingApplicationSchema } from "./schema";
import { getJobListingIdTag } from "@/features/jobListings/cache/jobListings";
import { getUserResumeIdTag } from "@/features/users/db/cache/userResumes";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { z } from "zod";
import {
  insertJobListingApplication,
  updateJobListingApplication,
} from "../db/jobListingApplications";
import { inngest } from "@/services/inngest/client";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";

export async function createJobListingApplication(
  jobListingId: string,
  unsafeData: z.infer<typeof newJobListingApplicationSchema>
) {
  const permissionError = {
    error: true,
    message: "You don't have permission to submit an application",
  };

  const { userId } = await getCurrentUser();

  if (!userId) return permissionError;

  const [userResume, jobListing] = await Promise.all([
    getUserResume(userId),
    getPublicJobListing(jobListingId),
  ]);

  if (!userResume || !jobListing) return permissionError;

  const { success, data } =
    newJobListingApplicationSchema.safeParse(unsafeData);

  if (!success)
    return {
      error: true,
      message: "There was an error processing your application",
    };

  await insertJobListingApplication({
    jobListingId,
    userId,
    ...data,
  });

  // TODO AI Generation rating
  await inngest.send({
    name: "app/jobListingApplication.created",
    data: { jobListingId, userId },
  });

  return {
    error: false,
    message: "Application submitted successfully",
  };
}

export async function updateJobListingApplicationStage(
  { jobListingId, userId }: { jobListingId: string; userId: string },
  unsafeStage: ApplicationStage
) {
  const { success, data: stage } = z
    .enum(applicationStages)
    .safeParse(unsafeStage);

  if (!success)
    return {
      error: true,
      message: "There was an error processing the stage",
    };

  if (!(await hasOrgUserPermission("job_listing_applications:change_stage")))
    return {
      error: true,
      message: "You don't have permission to update the stage",
    };

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);

  if (!jobListing || !orgId || orgId !== jobListing.organizationId)
    return {
      error: true,
      message: "You don't have permission to update this application",
    };

  await updateJobListingApplication({ jobListingId, userId }, { stage });

  return {
    error: false,
    message: "Stage updated successfully",
  };
}

export async function updateJobListingApplicationRating(
  { jobListingId, userId }: { jobListingId: string; userId: string },
  unsafeRating: number | null
) {
  const { success, data: rating } = z
    .number()
    .min(0)
    .max(5)
    .nullish()
    .safeParse(unsafeRating);

  if (!success)
    return {
      error: true,
      message: "There was an error processing the rating",
    };

  if (!(await hasOrgUserPermission("job_listing_applications:change_rating")))
    return {
      error: true,
      message: "You don't have permission to update the rating",
    };

  const { orgId } = await getCurrentOrganization();
  const jobListing = await getJobListing(jobListingId);

  if (!jobListing || !orgId || orgId !== jobListing.organizationId)
    return {
      error: true,
      message: "You don't have permission to update this application",
    };

  await updateJobListingApplication({ jobListingId, userId }, { rating });

  return {
    error: false,
    message: "Rating updated successfully",
  };
}

async function getPublicJobListing(jobListingId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));

  return db.query.JobListingTable.findFirst({
    where: and(
      eq(JobListingTable.id, jobListingId),
      eq(JobListingTable.status, "published")
    ),
    columns: {
      id: true,
    },
  });
}

async function getUserResume(userId: string) {
  "use cache";
  cacheTag(getUserResumeIdTag(userId));

  return db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: { userId: true },
  });
}

async function getJobListing(jobListingId: string) {
  "use cache";
  cacheTag(getJobListingIdTag(jobListingId));

  return db.query.JobListingTable.findFirst({
    where: and(eq(JobListingTable.id, jobListingId)),
    columns: { id: true, organizationId: true },
  });
}
