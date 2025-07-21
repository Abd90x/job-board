// Local DB
// import { drizzle } from "drizzle-orm/node-postgres";
// import { env } from "@/data/env/server";

// Neon DB
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

import * as schema from "@/db/schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: sql, schema });

// Local DB
// export const db = drizzle(env.DATABASE_URL, { schema });
