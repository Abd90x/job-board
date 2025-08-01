import { ApplicationStage } from "@/db/schema";

export function formatJobListingApplicationStage(stage: ApplicationStage) {
  switch (stage) {
    case "applied":
      return "Applied";
    case "interested":
      return "Interested";
    case "denied":
      return "Denied";
    case "interviewed":
      return "Interviewed";
    case "hired":
      return "Hired";
    default:
      throw new Error(`Unknown stage: ${stage satisfies never}`);
  }
}
