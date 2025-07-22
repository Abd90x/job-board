import { Badge } from "@/components/ui/badge";
import { JobListingTable } from "@/db/schema";
import React, { ComponentProps } from "react";
import {
  formatExperienceLevel,
  formatJobListingLocation,
  formatJobTypes,
  formatLocationRequirement,
  formatWage,
} from "../lib/formatters";
import {
  BanknoteIcon,
  BuildingIcon,
  GraduationCapIcon,
  HourglassIcon,
  MapPinIcon,
  StarIcon,
} from "lucide-react";

type Props = {
  jobListing: Pick<
    typeof JobListingTable.$inferSelect,
    | "wage"
    | "wageInterval"
    | "stateAbbreviation"
    | "city"
    | "type"
    | "experienceLevel"
    | "locationRequirement"
    | "isFeatured"
  >;
  className?: string;
};

const JobListingBadges = ({
  jobListing: {
    wage,
    wageInterval,
    stateAbbreviation,
    city,
    type,
    experienceLevel,
    locationRequirement,
    isFeatured,
  },
  className,
}: Props) => {
  const badgeProps = {
    variant: "outline",
    className,
  } satisfies ComponentProps<typeof Badge>;

  return (
    <>
      {isFeatured && (
        <Badge {...badgeProps} variant="default" className={className}>
          <StarIcon />
          Featured
        </Badge>
      )}

      {wage && wageInterval && (
        <Badge {...badgeProps}>
          <BanknoteIcon />
          {formatWage(wage, wageInterval)}
        </Badge>
      )}
      {stateAbbreviation && city && (
        <Badge {...badgeProps}>
          <MapPinIcon className="size-10" />
          {formatJobListingLocation({ stateAbbreviation, city })}
        </Badge>
      )}

      <Badge {...badgeProps}>
        <BuildingIcon />
        {formatLocationRequirement(locationRequirement)}
      </Badge>
      <Badge {...badgeProps}>
        <HourglassIcon />
        {formatJobTypes(type)}
      </Badge>
      <Badge {...badgeProps}>
        <GraduationCapIcon />
        {formatExperienceLevel(experienceLevel)}
      </Badge>
    </>
  );
};

export default JobListingBadges;
