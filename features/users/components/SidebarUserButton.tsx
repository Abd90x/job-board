import React, { Suspense } from "react";
import { SidebarUserButtonClient } from "./_SidebarUserButton";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentAuth";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";

export const SidebarUserButton = () => {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
};

async function SidebarUserSuspense() {
  const { user } = await getCurrentUser({ allData: true });

  if (!user)
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );

  return <SidebarUserButtonClient user={user} />;
}
