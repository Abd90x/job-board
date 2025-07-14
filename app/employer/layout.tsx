import { ReactNode, Suspense } from "react";
import AppSidebar from "@/components/sidebar/AppSidebar";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";
import { ClipboardListIcon, PlusIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { SidebarOrganizationButton } from "@/features/organizations/components/SidebarOrganizationButton";
import { getCurrentOrganization } from "@/services/clerk/lib/getCurrentAuth";
import { redirect } from "next/navigation";
import AsyncIf from "@/components/AsyncIf";
import { hasOrgUserPermission } from "@/services/clerk/lib/orgUserPermissions";
import { getJobListingOrganizationIdTag } from "@/features/jobListings/cache/jobListings";
import { db } from "@/db/db";
import {
  JobListingApplicationTable,
  JobListingStatus,
  JobListingTable,
} from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobListingApplicationJobListingTag } from "@/features/jobListingsApplications/db/cache/jobListingApplications";
import { sortJobListingStatus } from "@/features/jobListings/lib/utils";
import JobListingMenuGroup from "./_JobListingMenuGroup";

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <LayoutSuspense>{children}</LayoutSuspense>
    </Suspense>
  );
}

async function LayoutSuspense({ children }: { children: ReactNode }) {
  const { orgId } = await getCurrentOrganization();

  if (!orgId) return redirect("/organizations/select");

  return (
    <AppSidebar
      content={
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Job Listings</SidebarGroupLabel>
            <AsyncIf
              condition={() => hasOrgUserPermission("job_listing:create")}
            >
              <SidebarGroupAction title="Add Job Listing" asChild>
                <Link href="/employer/job-listings/new">
                  <PlusIcon />
                  <span className="sr-only">Add Job Listing</span>
                </Link>
              </SidebarGroupAction>
            </AsyncIf>
            <SidebarGroupContent className="group-data-[state=collapsed]:hidden">
              <Suspense>
                <JobListingsMenu orgId={orgId} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
            ]}
          />
        </>
      }
      footerButton={<SidebarOrganizationButton />}
    >
      {children}
    </AppSidebar>
  );
}

async function JobListingsMenu({ orgId }: { orgId: string }) {
  const jobListings = await getJobListings(orgId);
  if (
    jobListings.length === 0 &&
    (await hasOrgUserPermission("job_listing:create"))
  ) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"employer/job-listings/new"}>
              <PlusIcon />
              <span>Create your first job listing</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return Object.entries(Object.groupBy(jobListings, (j) => j.status))
    .sort(([a], [b]) => {
      return sortJobListingStatus(a as JobListingStatus, b as JobListingStatus);
    })
    .map(([status, jobListings]) => {
      return (
        <JobListingMenuGroup
          key={status}
          status={status as JobListingStatus}
          jobListings={jobListings}
        />
      );
    });
}

async function getJobListings(orgId: string) {
  "use cache";
  cacheTag(getJobListingOrganizationIdTag(orgId));

  const data = await db
    .select({
      id: JobListingTable.id,
      title: JobListingTable.title,
      status: JobListingTable.status,
      applicationCount: count(JobListingApplicationTable.userId),
    })
    .from(JobListingTable)
    .where(eq(JobListingTable.organizationId, orgId))
    .leftJoin(
      JobListingApplicationTable,
      eq(JobListingTable.id, JobListingApplicationTable.jobListingId)
    )
    .groupBy(JobListingApplicationTable.jobListingId, JobListingTable.id)
    .orderBy(desc(JobListingTable.createdAt));

  data.forEach((jobListing) => {
    cacheTag(getJobListingApplicationJobListingTag(jobListing.id));
  });
  return data;
}
