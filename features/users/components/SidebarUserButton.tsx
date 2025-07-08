import { auth } from "@clerk/nextjs/server";
import React, { Suspense } from "react";
import { SidebarUserButtonClient } from "./_SidebarUserButton";

export const SidebarUserButton = () => {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
};

async function SidebarUserSuspense() {
  const { userId } = await auth();

  return (
    <SidebarUserButtonClient
      user={{
        email: "test@test.com",
        name: "Test User",
      }}
    />
  );
}
