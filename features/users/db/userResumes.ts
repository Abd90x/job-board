import { db } from "@/db/db";
import { UserResumeTable } from "@/db/schema";
import { revalidateUserResumeCache } from "./cache/userResumes";
import { eq } from "drizzle-orm";

export async function upsertUserResume(
  userId: string,
  data: Omit<typeof UserResumeTable.$inferInsert, "userId">
) {
  await db
    .insert(UserResumeTable)
    .values({ userId, ...data })
    .onConflictDoUpdate({
      target: UserResumeTable.userId,
      set: {
        ...data,
        updatedAt: new Date(),
      },
    });

  revalidateUserResumeCache(userId);
}

export async function updateUserResume(
  userId: string,
  data: Partial<Omit<typeof UserResumeTable.$inferInsert, "userId">>
) {
  await db
    .update(UserResumeTable)
    .set(data)
    .where(eq(UserResumeTable.userId, userId));

  revalidateUserResumeCache(userId);
}
