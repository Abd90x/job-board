import {
  ExperienceLevel,
  JobListingStatus,
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

export function formatWage(wage: number, interval: WageInterval) {
  const wageFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  switch (interval) {
    case "hourly":
      return `${wageFormatter.format(wage)}/hr`;
    case "monthly":
      return `${wageFormatter.format(wage * 12)}/mo`;
    case "yearly":
      return `${wageFormatter.format(wage)}/yr`;
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

export function formatJobListingLocation({
  stateAbbreviation,
  city,
}: {
  stateAbbreviation: string | null;
  city: string | null;
}) {
  if (!stateAbbreviation && !city) return "None";

  const locationParts = [];
  if (city) locationParts.push(city);
  if (stateAbbreviation) locationParts.push(stateAbbreviation.toUpperCase());

  return locationParts.join(", ");
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

export function formatJobListingStatus(status: JobListingStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "published":
      return "Active";
    case "delisted":
      return "Delisted";
    default:
      throw new Error(`Invalid job listing status: ${status satisfies never}`);
  }
}
