import { inngest } from "@/services/inngest/client";
import {
  clerkCreateOrganization,
  clerkCreateOrganizationMember,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteOrganizationMember,
  clerkDeleteUser,
  clerkUpdateOrganization,
  clerkUpdateUser,
} from "@/services/inngest/functions/clerk";
import {
  prepareDailyOrganizationUserApplicationNotifications,
  prepareDailyUserJobListingNotifications,
  sendDailyOrganizationUserApplicationEmail,
  sendDailyUserJobListingEmail,
} from "@/services/inngest/functions/email";
import { rankApplicant } from "@/services/inngest/functions/jobApplication";
import { createAISummaryOfUploadedResume } from "@/services/inngest/functions/resume";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    clerkCreateUser,
    clerkUpdateUser,
    clerkDeleteUser,
    clerkCreateOrganization,
    clerkUpdateOrganization,
    clerkDeleteOrganization,
    clerkCreateOrganizationMember,
    clerkDeleteOrganizationMember,
    createAISummaryOfUploadedResume,
    rankApplicant,
    prepareDailyUserJobListingNotifications,
    sendDailyUserJobListingEmail,
    prepareDailyOrganizationUserApplicationNotifications,
    sendDailyOrganizationUserApplicationEmail,
  ],
});
