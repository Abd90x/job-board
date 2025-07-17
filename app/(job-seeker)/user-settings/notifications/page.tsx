import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db/db";
import { UserNotificationSettingsTable } from "@/db/schema";
import NotificationsForm from "@/features/users/components/NotificationsForm";
import { getUserNotificationSettingsIdTag } from "@/features/users/db/cache/userNotificationsSettings";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";

const NotificationsPage = () => {
  return (
    <Suspense>
      <SuspendedComponent />
    </Suspense>
  );
};

async function SuspendedComponent() {
  const { userId } = await getCurrentUser();

  if (!userId) return notFound();

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Notifications Settings</h1>
      <Card>
        <CardContent>
          <Suspense fallback={<LoadingSpinner />}>
            <SuspendedForm userId={userId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SuspendedForm({ userId }: { userId: string }) {
  const notificationsSettings = await getNotificationsSettings(userId);

  return <NotificationsForm notificationsSettings={notificationsSettings} />;
}

async function getNotificationsSettings(userId: string) {
  "use cache";
  cacheTag(getUserNotificationSettingsIdTag(userId));

  return db.query.UserNotificationSettingsTable.findFirst({
    where: eq(UserNotificationSettingsTable.userId, userId),
    columns: {
      aiPrompt: true,
      newJobEmailNotification: true,
    },
  });
}

export default NotificationsPage;
