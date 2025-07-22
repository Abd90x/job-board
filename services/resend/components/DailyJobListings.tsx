import { JobListingTable } from "@/db/schema";
import {
  Button,
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import tailwindConfig from "../data/tailwindConfig";
import {
  formatExperienceLevel,
  formatJobTypes,
  formatLocationRequirement,
  formatWage,
} from "@/features/jobListings/lib/formatters";

type JobListing = Pick<
  typeof JobListingTable.$inferSelect,
  | "id"
  | "title"
  | "city"
  | "country"
  | "type"
  | "experienceLevel"
  | "wage"
  | "wageInterval"
  | "locationRequirement"
> & {
  organizationName: string;
};

export default function DailyJobListingsEmail({
  userName,
  jobListings,
  serverUrl,
}: {
  userName: string;
  jobListings: JobListing[];
  serverUrl: string;
}) {
  return (
    <Tailwind config={tailwindConfig}>
      <Html>
        <Head />
        <Container className="font-sans">
          <Heading as="h1">New Job Listings!</Heading>
          <Text>
            Hi {userName}, Here are all the new job listings that meet your
            criteria:
          </Text>
          <Section>
            {jobListings.map((job) => (
              <div
                key={job.id}
                className="text-card-foreground rounded-lg border p-4 border-primary border-solid mb-6"
              >
                <Text className="leading-none font-semibold text-xl my-0">
                  {job.title}
                </Text>

                <Text className="text-muted-foreground mb-2 mt-0">
                  {job.organizationName}
                </Text>

                <div className="mb-5">
                  {getBadges(job).map((badge, idx) => (
                    <div
                      key={idx}
                      className="inline-block rounded-md border border-solid border-primary font-medium w-fit text-foreground text-sm px-3 py-1 mb-1 mr-1"
                    >
                      {badge}
                    </div>
                  ))}
                </div>
                <Button
                  href={`${serverUrl}/job-listings/${job.id}`}
                  className="rounded-md text-sm font-medium focus-visible:border-ring bg-primary text-primary-foreground px-4 py-2"
                >
                  View Details
                </Button>
              </div>
            ))}
          </Section>
          <Text className="text-muted-foreground text-sm text-center mt-10">
            Copyright © 2025 Job Listings. All rights reserved. Job Listings
            123 Main St Anytown, USA 12345
          </Text>
        </Container>
      </Html>
    </Tailwind>
  );
}

function getBadges(job: JobListing) {
  const badges = [
    formatLocationRequirement(job.locationRequirement),
    formatExperienceLevel(job.experienceLevel),
    formatJobTypes(job.type),
  ];

  if (job.city != null || job.country != null) {
    badges.unshift(formatLocationRequirement(job.locationRequirement));
  }

  if (job.wage != null || job.wageInterval != null) {
    badges.unshift(formatWage(job.wage ?? 0, job.wageInterval ?? "yearly"));
  }

  return badges;
}

DailyJobListingsEmail.PreviewProps = {
  jobListings: [
    {
      id: "ed8ed8b9-4c9f-49eb-937e-770bafb43760",
      title: "Software Engineer",
      wage: 100000,
      wageInterval: "yearly",
      city: "San Francisco",
      country: "United States",
      experienceLevel: "senior",
      type: "full-time",
      locationRequirement: "remote",
      organizationName: "Google",
    },
    {
      id: "ed8ed8b9-4c9f-49eb-937e-770bafb43760",
      title: "Software Engineer",
      wage: 100000,
      wageInterval: "hourly",
      city: "San Francisco",
      country: "United States",
      experienceLevel: "junior",
      type: "full-time",
      locationRequirement: "remote",
      organizationName: "Google",
    },
  ],
  userName: "John Doe",
  serverUrl: "http://localhost:3000",
} satisfies Parameters<typeof DailyJobListingsEmail>[0];
