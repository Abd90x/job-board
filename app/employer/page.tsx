import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { getJobListingOrganizationIdTag } from "@/features/jobListings/cache/jobListings";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const EmployerHomePage = () => {
  return (
    <Suspense>
      <SuspendedPage />
    </Suspense>
  );
};

export default EmployerHomePage;

async function SuspendedPage() {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) return redirect("/organizations/select");

  const jobListings = await mostRecentJobListings(orgId);

  if (!jobListings) return redirect("/employer/job-listings/new");
  else return redirect(`/employer/job-listings/${jobListings.id}`);
}

async function mostRecentJobListings(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationIdTag(orgId));

  return db.query.JobListingTable.findFirst({
    where: eq(JobListingTable.organizationId, orgId),
    orderBy: desc(JobListingTable.createdAt),
    columns: {
      id: true,
    },
  });
}
