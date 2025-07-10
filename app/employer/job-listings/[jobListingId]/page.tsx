import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db/db";
import { JobListingTable } from "@/db/schema";
import { getJobListingIdTag } from "@/features/jobListings/cache/jobListings";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { EditIcon } from "lucide-react";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import MarkdownRenderer from "@/components/markdown/MarkdownRenderer";
import MarkdownPartial from "@/components/markdown/MarkdownPartial";

type Props = {
  params: Promise<{ jobListingId: string }>;
};

const JobListingPage = (props: Props) => {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
};

export default JobListingPage;

async function SuspendedPage({ params }: Props) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) return null;

  const { jobListingId } = await params;

  const jobListing = await getJobListing(jobListingId, orgId);

  if (!jobListing) return notFound();

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {jobListing.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge>{formatJobListingStatus(jobListing.status)}</Badge>
            <JobListingBadges jobListing={jobListing} />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <Button asChild variant="outline">
            <Link href={`/employer/job-listings/${jobListing.id}/edit`}>
              <EditIcon className="size-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <MarkdownPartial
        dialogMarkdown={<MarkdownRenderer source={jobListing.description} />}
        mainMarkdown={
          <MarkdownRenderer
            className="prose-sm"
            source={jobListing.description}
          />
        }
        dialogTitle="Description"
      />
    </div>
  );
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
