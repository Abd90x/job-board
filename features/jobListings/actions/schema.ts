import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/db/schema";
import { z } from "zod";

export const jobListingSchema = z
  .object({
    title: z.string().min(1, "Required"),
    description: z.string().min(1, "Required"),
    experienceLevel: z.enum(experienceLevels),
    locationRequirement: z.enum(locationRequirements),
    type: z.enum(jobListingTypes),
    wage: z.number().int().positive().min(1).nullable(),
    wageInterval: z.enum(wageIntervals).nullable(),
    country: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
    city: z
      .string()
      .transform((val) => (val.trim() === "" ? null : val))
      .nullable(),
  })
  .refine(
    (lisiting) => {
      return lisiting.locationRequirement === "remote" || lisiting.city != null;
    },
    {
      message: "Required for non-remote listings",
      path: ["city"],
    }
  )
  .refine(
    (lisiting) => {
      return (
        lisiting.locationRequirement === "remote" || lisiting.country != null
      );
    },
    {
      message: "Required for non-remote listings",
      path: ["country"],
    }
  );

export const jobListingAiSearchSchema = z.object({
  query: z.string().min(1, "Required"),
});
