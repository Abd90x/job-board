import { JobListingStatus } from "@/db/schema";

export function getNextJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "draft":
    case "delisted":
      return "published";
    case "published":
      return "delisted";
    default:
      throw new Error(`Invalid job listing status: ${status}`);
  }
}

export function sortJobListingStatus(a: JobListingStatus, b: JobListingStatus) {
  return JOB_LISTING_STATUS_ORDER[a] - JOB_LISTING_STATUS_ORDER[b];
}

const JOB_LISTING_STATUS_ORDER: Record<JobListingStatus, number> = {
  published: 0,
  draft: 1,
  delisted: 2,
};
