import { env } from "@/data/env/server";
import {
  experienceLevels,
  jobListingTypes,
  locationRequirements,
  wageIntervals,
} from "@/db/schema";
import { createAgent, gemini } from "@inngest/agent-kit";
import z from "zod";
import { getLastOutputMessage } from "./getLastOutputMessage";

const jobListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  wage: z.number().nullable(),
  wageInterval: z.enum(wageIntervals).nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
  experienceLevel: z.enum(experienceLevels),
  type: z.enum(jobListingTypes),
  locationRequirement: z.enum(locationRequirements),
});

const NO_JOBS = "NO_JOBS";

export async function getMatchingJobListings(
  prompt: string,
  allListings: z.infer<typeof jobListingSchema>[],
  { maxNumberOfJobs }: { maxNumberOfJobs?: number }
) {
  const agent = createAgent({
    name: "Job Matching Agent",
    description: "Agent for matching job listings to a user's prompt",
    system: `You are an expert at matching people with jobs based on their specific experience, and requirements. The provided user prompt will be a description that can include information about themselves as well what they are looking for in a job. ${
      maxNumberOfJobs
        ? `You are to return up to ${maxNumberOfJobs} jobs.`
        : `Return all jobs that match their requirements.`
    } Return the jobs as a comma separated list of jobIds. If you cannot find any jobs that match the user prompt, return the text "${NO_JOBS}". Here is the JSON array of available job listings: ${JSON.stringify(
      allListings.map((listing) =>
        jobListingSchema
          .transform((listing) => ({
            ...listing,
            wage: listing.wage ?? undefined,
            wageInterval: listing.wageInterval ?? undefined,
            city: listing.city ?? undefined,
            country: listing.country ?? undefined,
            locationRequirement: listing.locationRequirement ?? undefined,
          }))
          .parse(listing)
      )
    )}`,
    model: gemini({
      model: "gemini-2.0-flash",
      apiKey: env.GEMINI_API_KEY,
    }),
  });

  const result = await agent.run(prompt);

  const lastMessage = getLastOutputMessage(result);

  if (!lastMessage || lastMessage === NO_JOBS) return [];

  return lastMessage
    .split(",")
    .map((jobId) => jobId.trim())
    .filter(Boolean);
}
