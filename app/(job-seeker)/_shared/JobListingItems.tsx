import JobListingItemSkeleton from "@/components/skeleton/JobListingItemSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db/db";
import {
  experienceLevels,
  JobListingTable,
  jobListingTypes,
  locationRequirements,
  OrganizationTable,
} from "@/db/schema";
import { getJobListingGlobalTag } from "@/features/jobListings/cache/jobListings";
import JobListingBadges from "@/features/jobListings/components/JobListingBadges";
import { getOrganizationIdTag } from "@/features/organizations/db/cache/organizations";
import { convertSearchParamsToString } from "@/lib/convertSearchParamsToString";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import { and, desc, eq, ilike, or, SQL } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import Link from "next/link";
import { connection } from "next/server";
import React, { Suspense } from "react";
import { z } from "zod";

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
  params?: Promise<{ jobListingId: string }>;
};

const searchParamsSchema = z.object({
  title: z.string().optional().catch(undefined),
  city: z.string().optional().catch(undefined),
  state: z.string().optional().catch(undefined),
  experience: z.enum(experienceLevels).optional().catch(undefined),
  location: z.enum(locationRequirements).optional().catch(undefined),
  type: z.enum(jobListingTypes).optional().catch(undefined),
  jobIds: z
    .union([z.string(), z.array(z.string())])
    .transform((v) => (Array.isArray(v) ? v : [v]))
    .optional()
    .catch(undefined),
});

const JobListingItems = (props: Props) => {
  return (
    <Suspense fallback={<JobListingItemSkeleton />}>
      <SuspendedComponent {...props} />
    </Suspense>
  );
};

async function SuspendedComponent({ searchParams, params }: Props) {
  const jobListingId = params ? (await params).jobListingId : undefined;

  const { success, data } = searchParamsSchema.safeParse(await searchParams);

  const search = success ? data : {};

  const jobListings = await getJobListings(search, jobListingId);

  if (jobListings.length === 0)
    return (
      <div className="text-muted-foreground p-4">No job listings found.</div>
    );

  return (
    <div className="space-y-4">
      {jobListings.map((jobListing) => (
        <Link
          href={`/job-listings/${jobListing.id}?${convertSearchParamsToString(
            search
          )}`}
          className="block"
          key={jobListing.id}
        >
          <JobListingListItem
            jobListing={jobListing}
            organization={jobListing.organization}
          />
        </Link>
      ))}
    </div>
  );
}

async function getJobListings(
  searchParams: z.infer<typeof searchParamsSchema>,
  jobListingId: string | undefined
) {
  "use cache";
  cacheTag(getJobListingGlobalTag());

  const whereConditions: (SQL | undefined)[] = [];

  if (searchParams.title) {
    whereConditions.push(
      ilike(JobListingTable.title, `%${searchParams.title}%`)
    );
  }

  if (searchParams.city) {
    whereConditions.push(ilike(JobListingTable.city, `%${searchParams.city}%`));
  }

  if (searchParams.state)
    whereConditions.push(
      ilike(JobListingTable.stateAbbreviation, `%${searchParams.state}%`)
    );

  if (searchParams.experience)
    whereConditions.push(
      eq(JobListingTable.experienceLevel, searchParams.experience)
    );

  if (searchParams.location)
    whereConditions.push(
      eq(JobListingTable.locationRequirement, searchParams.location)
    );

  if (searchParams.type)
    whereConditions.push(eq(JobListingTable.type, searchParams.type));

  if (searchParams.jobIds) {
    whereConditions.push(
      or(...searchParams.jobIds.map((id) => eq(JobListingTable.id, id)))
    );
  }

  const data = await db.query.JobListingTable.findMany({
    where: or(
      jobListingId
        ? and(
            eq(JobListingTable.status, "published"),
            eq(JobListingTable.id, jobListingId)
          )
        : undefined,
      and(eq(JobListingTable.status, "published"), ...whereConditions)
    ),
    with: {
      organization: {
        columns: {
          id: true,
          name: true,
          imageUrl: true,
        },
      },
    },
    orderBy: [desc(JobListingTable.isFeatured), desc(JobListingTable.postedAt)],
  });

  data.forEach((listing) => {
    cacheTag(getOrganizationIdTag(listing.organization.id));
  });

  return data;
}

function JobListingListItem({
  jobListing,
  organization,
}: {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "title"
    | "stateAbbreviation"
    | "city"
    | "wage"
    | "wageInterval"
    | "experienceLevel"
    | "type"
    | "postedAt"
    | "locationRequirement"
    | "isFeatured"
  >;
  organization: Pick<
    typeof OrganizationTable.$inferSelect,
    "name" | "imageUrl"
  >;
}) {
  const nameInitals = organization?.name
    .split(" ")
    .splice(0, 4)
    .map((name) => name[0])
    .join("");

  return (
    <Card
      className={cn(
        "@container",
        jobListing.isFeatured && "border-primary bg-primary/5 text-primary"
      )}
    >
      <CardHeader>
        <div className="flex gap-4">
          <Avatar className="size-14 @max-sm:hidden">
            <AvatarImage
              src={organization.imageUrl ?? undefined}
              alt={organization.name}
            />
            <AvatarFallback className="uppercase bg-primary text-primary-foreground">
              {nameInitals}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">{jobListing.title}</CardTitle>
            <CardDescription>{organization.name}</CardDescription>

            {jobListing.postedAt && (
              <div className="text-sm font-medium text-primary @min-md:hidden">
                <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                  <DaysSincePosting postedAt={jobListing.postedAt} />
                </Suspense>
              </div>
            )}
          </div>

          {jobListing.postedAt && (
            <div className="text-sm font-medium text-primary @max-md:hidden ml-auto">
              <Suspense fallback={jobListing.postedAt.toLocaleDateString()}>
                <DaysSincePosting postedAt={jobListing.postedAt} />
              </Suspense>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <JobListingBadges
          jobListing={jobListing}
          className={jobListing.isFeatured ? "border-primary" : undefined}
        />
      </CardContent>
    </Card>
  );
}

async function DaysSincePosting({ postedAt }: { postedAt: Date }) {
  await connection();
  const daysSincePosting = differenceInDays(postedAt, Date.now());

  if (daysSincePosting === 0) return <Badge>New</Badge>;

  return new Intl.RelativeTimeFormat(undefined, {
    style: "narrow",
    numeric: "always",
  }).format(daysSincePosting, "days");
}

export default JobListingItems;
