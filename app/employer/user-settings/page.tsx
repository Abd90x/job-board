import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/db";
import { OrganizationUserSettingsTable } from "@/db/schema";
import { getOrganizationUserSettingsIdTag } from "@/features/organizations/db/cache/organizationUserSettings";
import NotificationsForm from "@/features/organizations/components/NotificationsForm";

import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { and, eq } from "drizzle-orm";
import { unstable_cacheTag as cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

const UserSettingsPage = () => {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
};

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();
  const { orgId } = await getCurrentOrganization();

  if (!userId || !orgId) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} orgId={orgId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}) {
  const notificationsSettings = await getNotificationsSettings(userId, orgId);

  return <NotificationsForm notificationsSettings={notificationsSettings} />;
}

async function getNotificationsSettings(userId: string, orgId: string) {
  "use cache";
  cacheTag(getOrganizationUserSettingsIdTag(userId, orgId));

  return db.query.OrganizationUserSettingsTable.findFirst({
    where: and(
      eq(OrganizationUserSettingsTable.userId, userId),
      eq(OrganizationUserSettingsTable.organizationId, orgId)
    ),
    columns: {
      newApplicationEmailNotification: true,
      minRating: true,
    },
  });
}

export default UserSettingsPage;
