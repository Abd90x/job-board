import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getCurrentUser } from "../clerk/lib/getCurrentAuth";
import { inngest } from "../inngest/client";

import { eq } from "drizzle-orm";
import { uploadthing } from "./client";
import { upsertUserResume } from "@/features/users/db/userResumes";
import { db } from "@/db/db";
import { UserResumeTable } from "@/db/schema";

const f = createUploadthing();

export const customFileRouter = {
  resumeUploader: f(
    {
      pdf: {
        maxFileSize: "2MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: true }
  )
    .middleware(async () => {
      const { userId } = await getCurrentUser();
      if (userId == null) throw new UploadThingError("Unauthorized");

      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { userId } = metadata;
      const resumeFileKey = await getUserResumeFileKey(userId);

      await upsertUserResume(userId, {
        resumeFileUrl: file.ufsUrl,
        resumeFileKey: file.key,
      });

      if (resumeFileKey != null) {
        await uploadthing.deleteFiles(resumeFileKey);
      }

      await inngest.send({ name: "app/resume.uploaded", user: { id: userId } });
      return { message: "Resume uploaded successfully" };
    }),
} satisfies FileRouter;

export type CustomFileRouter = typeof customFileRouter;

async function getUserResumeFileKey(userId: string) {
  const data = await db.query.UserResumeTable.findFirst({
    where: eq(UserResumeTable.userId, userId),
    columns: {
      resumeFileKey: true,
    },
  });

  return data?.resumeFileKey;
}
