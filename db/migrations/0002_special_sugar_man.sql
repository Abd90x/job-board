ALTER TABLE "job_listings" RENAME COLUMN "stateAbbreviation" TO "country";--> statement-breakpoint
DROP INDEX "job_listings_stateAbbreviation_index";--> statement-breakpoint
CREATE INDEX "job_listings_country_index" ON "job_listings" USING btree ("country");