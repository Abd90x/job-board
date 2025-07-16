import { env } from "@/data/env/server";
import { updateJobListingApplication } from "@/features/jobListingsApplications/db/jobListingApplications";
import { createAgent, createTool } from "@inngest/agent-kit";
import { gemini } from "inngest";
import z from "zod";

const saveApplicantRatingTool = createTool({
  name: "save-applicant-rating",
  description: "Save the applicant rating to the database",
  parameters: z.object({
    rating: z.number().min(1).max(5),
    jobListingId: z.string(),
    userId: z.string(),
  }),
  handler: async ({ jobListingId, userId, rating }) => {
    await updateJobListingApplication({ jobListingId, userId }, { rating });

    return "Successfully saved applicant rating";
  },
});

export const applicantRankingAgent = createAgent({
  name: "Applicant Ranking Agent",
  description:
    "Agent for ranking job applications for specific job listings based on their resume and cover letter",
  system:
    "You are an expert' at  ranking job applicants for  specific  jobs  based  on ftheir resume and cover letted. You will be provided with a user prompt that includes a user's id, resume and cover letter as well as the job listing they are applying for in JSON. Your task is to compare the job listing with the applicant  s resume and cover letter and provide a rating for the applicant on how well they fit that specific job listing. The rating should be a number between 1 and 5, where S is the highest rating indicating a perfect or near perfect match. A rating 3 should be used for applicants that barely meet the requirements of the job listing, while a rating of 1 should be used for applicants that do not meet the requirements at all. You should save this user rating in the database and not return any output.",
  tools: [saveApplicantRatingTool],
  // @ts-expect-error - gemini is not typed
  model: gemini({
    model: "gemini-2.0-flash",
    apiKey: env.GEMINI_API_KEY,
  }),
});
