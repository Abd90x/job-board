import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  varchar,
} from "drizzle-orm/pg-core";
import { UserTable } from "./user";
import { OrganizationTable } from "./organization";
import { createdAt, updatedAt } from "../schemaHelpers";
import { relations } from "drizzle-orm";

export const OrganizationUserSettingsTable = pgTable(
  "organization_user_settings",
  {
    userId: varchar().references(() => UserTable.id, {
      onDelete: "cascade",
    }),
    organizationId: varchar().references(() => OrganizationTable.id, {
      onDelete: "cascade",
    }),
    newApplicationEmailNotification: boolean().notNull().default(false),
    minRating: integer(),
    createdAt,
    updatedAt,
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.organizationId],
    }),
  ]
);

export const organizationUserSettingsRelations = relations(
  OrganizationUserSettingsTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [OrganizationUserSettingsTable.userId],
      references: [UserTable.id],
    }),
    organization: one(OrganizationTable, {
      fields: [OrganizationUserSettingsTable.userId],
      references: [OrganizationTable.id],
    }),
  })
);
