import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const JobListingItemSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card className="@container" key={index}>
          <CardHeader>
            <div className="flex gap-4">
              <Skeleton className="size-14 rounded-full shrink-0" />

              <div className="flex flex-col gap-1 w-full">
                <CardTitle>
                  <Skeleton className="w-2/3 h-6" />
                </CardTitle>
                <Skeleton className="w-1/3 h-6" />
                <Skeleton className="w-16 h-4 @min-md:hidden" />
              </div>
              <Skeleton className="w-16 h-4 @max-md:hidden ml-auto" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-24 h-8" />
            <Skeleton className="w-24 h-8" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default JobListingItemSkeleton;
