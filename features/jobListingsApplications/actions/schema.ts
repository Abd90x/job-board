import z from "zod";

export const newJobListingApplicationSchema = z.object({
  coverLetter: z
    .string()
    .transform((v) => (v?.trim() === "" ? null : v))
    .nullable(),
});
