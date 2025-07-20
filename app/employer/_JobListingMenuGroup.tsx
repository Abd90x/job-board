"use client";

import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { JobListingStatus, JobListingTable } from "@/db/schema";
import { formatJobListingStatus } from "@/features/jobListings/lib/formatters";
import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

type JobListing = Pick<typeof JobListingTable.$inferSelect, "title" | "id"> & {
  applicationCount: number;
};

const JobListingMenuGroup = ({
  status,
  jobListings,
}: {
  status: JobListingStatus;
  jobListings: JobListing[];
}) => {
  const { jobListingId } = useParams();

  return (
    <SidebarMenu>
      <Collapsible
        defaultOpen={
          status !== "delisted" ||
          jobListings.find((job) => job.id === jobListingId) != null
        }
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {formatJobListingStatus(status)}
              <ChevronRightIcon className="ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {jobListings.map((jobListing) => (
                <JobListingMenuItem key={jobListing.id} {...jobListing} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
};

function JobListingMenuItem({ id, title, applicationCount }: JobListing) {
  const { jobListingId } = useParams();

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton isActive={jobListingId === id} asChild>
        <Link href={`/employer/job-listings/${id}`}>
          <span className={cn(applicationCount && "pe-3", "truncate")}>
            {title}
          </span>
          {applicationCount > 0 && (
            <div className="absolute end-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {applicationCount}
            </div>
          )}
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export default JobListingMenuGroup;
