"use client";

import { DataTable } from "@/components/dataTable/DataTable";
import { DataTableSortableColumnHeader } from "@/components/dataTable/DataTableSortableHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ApplicationStage,
  applicationStages,
  JobListingApplicationTable,
  UserResumeTable,
  UserTable,
} from "@/db/schema";
import { ColumnDef, Table } from "@tanstack/react-table";
import { ReactNode, useOptimistic, useState, useTransition } from "react";
import { sortApplicationsByStage } from "../lib/utils";
import { StageIcon } from "./StageIcon";
import { formatJobListingApplicationStage } from "../lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDownIcon, MoreHorizontalIcon } from "lucide-react";
import { toast } from "sonner";
import {
  updateJobListingApplicationRating,
  updateJobListingApplicationStage,
} from "../actions/actions";
import RatingIcons from "./RatingIcons";
import { RATING_OPTIONS } from "@/features/data/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import DataTableFacetedFilter from "@/components/dataTable/DataTableFacetedFilter";

type Application = Pick<
  typeof JobListingApplicationTable.$inferSelect,
  "coverLetter" | "createdAt" | "stage" | "rating" | "jobListingId"
> & {
  coverLetterMarkdown: ReactNode | null;
  user: Pick<typeof UserTable.$inferSelect, "id" | "name" | "imageUrl"> & {
    resume:
      | (Pick<typeof UserResumeTable.$inferSelect, "resumeFileUrl"> & {
          markdownSummary: ReactNode | null;
        })
      | null;
  };
};

function getColumns(
  canUpdateRating: boolean,
  canUpdateStage: boolean
): ColumnDef<Application>[] {
  return [
    {
      accessorFn: (row) => row.user.name,
      header: "Name",
      cell: ({ row }) => {
        const user = row.original.user;
        const nameInitials = user.name
          .split(" ")
          .splice(0, 2)
          .map((n) => n.charAt(0).toUpperCase())
          .join("");

        return (
          <div className="flex items-center gap-2">
            <Avatar className="rounded-full size-6">
              <AvatarImage src={user.imageUrl} alt={user.name} />
              <AvatarFallback className="uppercase bg-primary text-primary-foreground text-xs">
                {nameInitials}
              </AvatarFallback>
            </Avatar>
            <span>{user.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "stage",
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Stage" />
      ),
      sortingFn: ({ original: a }, { original: b }) => {
        return sortApplicationsByStage(a.stage, b.stage);
      },
      filterFn: ({ original }, _, value) => {
        return value.includes(original.stage);
      },
      cell: ({ row }) => (
        <StageCell
          canUpdate={canUpdateStage}
          stage={row.original.stage}
          jobListingId={row.original.jobListingId}
          userId={row.original.user.id}
        />
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="rating" />
      ),

      filterFn: ({ original }, _, value) => {
        return value.includes(original.rating);
      },
      cell: ({ row }) => (
        <RatingCell
          canUpdate={canUpdateRating}
          rating={row.original.rating}
          jobListingId={row.original.jobListingId}
          userId={row.original.user.id}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      accessorFn: (row) => row.createdAt,
      header: ({ column }) => (
        <DataTableSortableColumnHeader column={column} title="Applied On" />
      ),

      cell: ({ row }) => (
        <div>{row.original.createdAt.toLocaleDateString()}</div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const jobListing = row.original;
        const resume = jobListing.user.resume;

        return (
          <ActionCell
            coverLetterMarkdown={jobListing.coverLetterMarkdown}
            resumeMarkdown={resume?.markdownSummary}
            resumeFileUrl={resume?.resumeFileUrl}
            userName={jobListing.user.name}
          />
        );
      },
    },
  ];
}

const ApplicationTable = ({
  applications,
  canUpdateRating,
  canUpdateStage,
  noResultsMessage = "No Applications",
  disabledToolbar = false,
}: {
  applications: Application[];
  canUpdateRating: boolean;
  canUpdateStage: boolean;
  noResultsMessage?: ReactNode;
  disabledToolbar?: boolean;
}) => {
  return (
    <DataTable
      data={applications}
      columns={getColumns(canUpdateRating, canUpdateStage)}
      noResultsMessage={noResultsMessage}
      ToolbarComponent={disabledToolbar ? DisabledToolbar : Toolbar}
      initialFilters={[
        {
          id: "stage",
          value: applicationStages.filter((stage) => stage !== "denied"),
        },
      ]}
    />
  );
};

function DisabledToolbar<T>({ table }: { table: Table<T> }) {
  return <Toolbar table={table} disabled />;
}

function Toolbar<T>({
  table,
  disabled,
}: {
  table: Table<T>;
  disabled?: boolean;
}) {
  const hiddenRows = table.getCoreRowModel().rows.length - table.getRowCount();

  return (
    <div className="flex items-center gap-2">
      {table.getColumn("stage") && (
        <DataTableFacetedFilter
          disabled={disabled}
          column={table.getColumn("stage")}
          title="Stage"
          options={applicationStages
            .toSorted(sortApplicationsByStage)
            .map((s) => ({
              label: <StageDetails stage={s} />,
              value: s,
              key: s,
            }))}
        />
      )}
      {table.getColumn("rating") && (
        <DataTableFacetedFilter
          disabled={disabled}
          column={table.getColumn("rating")}
          title="Rating"
          options={RATING_OPTIONS.map((r) => ({
            label: <RatingIcons rating={r} />,
            value: r,
            key: r ?? "none",
          }))}
        />
      )}

      {hiddenRows > 0 && (
        <div className="text-sm text-muted-foreground ms-2">
          {hiddenRows} {hiddenRows === 1 ? "row" : "rows"} hidden
        </div>
      )}
    </div>
  );
}

function StageCell({
  canUpdate,
  stage,
  jobListingId,
  userId,
}: {
  canUpdate: boolean;
  stage: ApplicationStage;
  jobListingId: string;
  userId: string;
}) {
  const [optimisticStage, setOptimisticStage] =
    useOptimistic<ApplicationStage>(stage);
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) {
    return <StageDetails stage={optimisticStage} />;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <StageDetails stage={optimisticStage} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {applicationStages.toSorted(sortApplicationsByStage).map((s) => (
          <DropdownMenuItem
            key={s}
            onClick={() => {
              startTransition(async () => {
                setOptimisticStage(s);
                const res = await updateJobListingApplicationStage(
                  { jobListingId, userId },
                  s
                );

                if (res.error) {
                  toast.error(res.message);
                } else {
                  toast.success(res.message);
                }
              });
            }}
          >
            <StageDetails stage={s} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RatingCell({
  canUpdate,
  rating,
  jobListingId,
  userId,
}: {
  canUpdate: boolean;
  rating: number | null;
  jobListingId: string;
  userId: string;
}) {
  const [optimisticRating, setOptimisticRating] = useOptimistic<number | null>(
    rating
  );
  const [isPending, startTransition] = useTransition();

  if (!canUpdate) {
    return <RatingIcons rating={optimisticRating} />;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("-ml-3", isPending && "opacity-50")}
        >
          <RatingIcons rating={optimisticRating} />
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {RATING_OPTIONS.map((r) => (
          <DropdownMenuItem
            key={r ?? "none"}
            onClick={() => {
              startTransition(async () => {
                setOptimisticRating(r);
                const res = await updateJobListingApplicationRating(
                  { jobListingId, userId },
                  r
                );

                if (res.error) {
                  toast.error(res.message);
                } else {
                  toast.success(res.message);
                }
              });
            }}
          >
            <RatingIcons rating={r} className="text-inherit" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StageDetails({ stage }: { stage: ApplicationStage }) {
  return (
    <div className="flex gap-2 items-center">
      <StageIcon stage={stage} className="size-5 text-inherit" />
      <div>{formatJobListingApplicationStage(stage)}</div>
    </div>
  );
}

function ActionCell({
  coverLetterMarkdown,
  resumeMarkdown,
  resumeFileUrl,
  userName,
}: {
  coverLetterMarkdown: ReactNode | null;
  resumeMarkdown: ReactNode | null;
  resumeFileUrl: string | null | undefined;
  userName: string;
}) {
  const [openModal, setOpenModal] = useState<"resume" | "coverLetter" | null>(
    null
  );
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <span className="sr-only">Actions</span>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {resumeFileUrl != null || resumeMarkdown != null ? (
            <DropdownMenuItem onClick={() => setOpenModal("resume")}>
              View Resume
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Resume
            </DropdownMenuLabel>
          )}

          {coverLetterMarkdown != null ? (
            <DropdownMenuItem onClick={() => setOpenModal("coverLetter")}>
              View Cover Letter
            </DropdownMenuItem>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground">
              No Cover Letter
            </DropdownMenuLabel>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {coverLetterMarkdown && (
        <Dialog
          open={openModal === "coverLetter"}
          onOpenChange={(o) => setOpenModal(o ? "coverLetter" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Cover Letter</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{coverLetterMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}

      {(resumeMarkdown || resumeFileUrl) && (
        <Dialog
          open={openModal === "resume"}
          onOpenChange={(o) => setOpenModal(o ? "resume" : null)}
        >
          <DialogContent className="lg:max-w-5xl md:max-w-3xl max-h-[calc(100%-2rem)] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Resume</DialogTitle>
              <DialogDescription>{userName}</DialogDescription>
              {resumeFileUrl && (
                <Button asChild className="self-start">
                  <Link
                    href={resumeFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Original Resume
                  </Link>
                </Button>
              )}
              <DialogDescription className="mt-2">
                This is an AI-generated summary of the applicant&apos;s resume.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">{resumeMarkdown}</div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

export function SekeletonApplicationTable() {
  return (
    <ApplicationTable
      applications={[]}
      canUpdateRating={false}
      canUpdateStage={false}
      noResultsMessage={<LoadingSpinner className="size-12" />}
      disabledToolbar={true}
    />
  );
}

export default ApplicationTable;
