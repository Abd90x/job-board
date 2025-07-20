import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { getJobListingIdTag } from "@/features/jobListings/cache/jobListings";
import JobListingForm from "@/features/jobListings/components/JobListingForm";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

const EditJobListingPage = (props: Props) => {
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Edit Job Listing</h1>

      <Card>
        <CardContent>
          <Suspense>
            <SuspendedPage {...props} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditJobListingPage;

async function SuspendedPage({ params }: Props) {
  const { jobListingId } = await params;
  const { orgId } = await getCurrentOrganization();

  if (!orgId) return notFound();

  const jobListing = await getJobListing(jobListingId, orgId);

  if (!jobListing) return notFound();

  return <JobListingForm jobListing={jobListing} />;
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
