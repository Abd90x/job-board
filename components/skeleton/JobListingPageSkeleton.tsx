import React from "react";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { SekeletonApplicationTable } from "@/features/jobListingsApplications/components/ApplicationTable";

const JobListingPageSkeleton = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 @container">
      <div className="flex items-center justify-between gap-4 @max-4xl:flex-col @max-4xl:items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <Skeleton className="w-48 h-8" />
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-16 h-8" />
          </div>
        </div>
        <div className="flex items-center gap-2 empty:-mt-4">
          <Skeleton className="w-22 h-8" />
          <Skeleton className="w-22 h-8" />
          <Skeleton className="w-22 h-8" />
          <Skeleton className="w-22 h-8" />
        </div>
      </div>

      <Skeleton className="w-full h-8 mb-2" />
      <Skeleton className="w-24 h-8 mb-4" />
      <Skeleton className="w-full h-48 mb-4" />

      <Separator />
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Applications</h2>
        <SekeletonApplicationTable />
      </div>
    </div>
  );
};

export default JobListingPageSkeleton;
