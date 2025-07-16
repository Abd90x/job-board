import { db } from "@/db/db";
import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/db/schema";
import { env } from "@/data/env/server";
import { updateUserResume } from "@/features/users/db/userResumes";
import { GeminiAiAdapter } from "inngest";

export const createAISummaryOfUploadedResume = inngest.createFunction(
  {
    id: "create-ai-summary-of-uploaded-resume",
    name: "Create AI Summary of Uploaded Resume",
  },
  {
    event: "app/resume.uploaded",
  },
  async ({ step, event }) => {
    const { id: userId } = event.user;

    const userResume = await step.run("get-user-resume", async () => {
      return await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: {
          resumeFileUrl: true,
        },
      });
    });

    if (!userResume) return null;

    const fileResponse = await fetch(userResume.resumeFileUrl);
    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    const result = await step.ai.infer("create-ai-summary", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash",
        apiKey: env.GEMINI_API_KEY,
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "application/pdf",
                },
              },
              {
                text: `
                You are an AI assistant that reads resumes and produces a comprehensive summary for hiring managers.
                
                    Summarize the following resume and extract all key skills, experiences, and qualifications. the summary should include all the information that hiring manager would need to know about the candidate in order to determine if they are a good fit for the job.

                    The summary should be formatted as markdown. Do not return any other text. if the file does not look like a rumse return the text 'N/A'.

                    Remember: 
                    - keep the summary concise and to the point.
                    - do not include any other text than the summary.
                    - return the summary in markdown format.
                    - the summary should be max 1200 characters.
                  `,
              },
            ],
          },
        ],
      },
    });

    await step.run("save-ai-summary", async () => {
      const message =
        (result?.candidates?.[0]?.content.parts[0] as GeminiAiAdapter.TextPart)
          ?.text ?? "N/A";

      await updateUserResume(userId, { aiSummary: message });
    });
  }
);
