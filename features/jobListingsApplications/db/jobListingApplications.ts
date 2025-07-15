import { JobListingApplicationTable } from "@/db/schema";
import { db } from "@/db/db";
import { revalidateJobListingApplicationCache } from "./cache/jobListingApplications";

export async function insertJobListingApplication(
  application: typeof JobListingApplicationTable.$inferInsert
) {
  await db.insert(JobListingApplicationTable).values(application);

  revalidateJobListingApplicationCache(application);
}
