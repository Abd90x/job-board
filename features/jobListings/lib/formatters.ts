import {
  ExperienceLevel,
  JobListingType,
  LocationRequirement,
  WageInterval,
} from "@/db/schema";

export function formatWageInterval(interval: WageInterval) {
  switch (interval) {
    case "hourly":
      return "Hour";
    case "monthly":
      return "Month";
    case "yearly":
      return "Year";
    default:
      throw new Error(`Invalid wage interval: ${interval satisfies never}`);
  }
}

export function formatLocationRequirement(location: LocationRequirement) {
  switch (location) {
    case "remote":
      return "Remote";
    case "on-site":
      return "On-Site";
    case "hybrid":
      return "Hybrid";
    default:
      throw new Error(
        `Invalid location requirement: ${location satisfies never}`
      );
  }
}

export function formatJobTypes(type: JobListingType) {
  switch (type) {
    case "full-time":
      return "Full-Time";
    case "part-time":
      return "Part-Time";
    case "internship":
      return "Internship";
    default:
      throw new Error(`Invalid job type: ${type satisfies never}`);
  }
}

export function formatExperienceLevel(level: ExperienceLevel) {
  switch (level) {
    case "junior":
      return "Junior";
    case "mid-level":
      return "Mid-Level";
    case "senior":
      return "Senior";
    default:
      throw new Error(`Invalid experience level: ${level satisfies never}`);
  }
}
