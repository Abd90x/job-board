import { db } from "@/db/db";
import { UserTable } from "@/db/schema";

export async function insertUser(user: typeof UserTable.$inferInsert) {
  await db.insert(UserTable).values(user).onConflictDoNothing();
}
