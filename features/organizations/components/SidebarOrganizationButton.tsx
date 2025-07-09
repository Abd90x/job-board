import React, { Suspense } from "react";
import { SidebarOrganizationButtonClient } from "./_SidebarOrganizationButton";
import {
  getCurrentOrganization,
  getCurrentUser,
} from "@/services/clerk/lib/getCurrentAuth";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { LogOutIcon } from "lucide-react";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";

export const SidebarOrganizationButton = () => {
  return (
    <Suspense>
      <SidebarUserSuspense />
    </Suspense>
  );
};

async function SidebarUserSuspense() {
  const [{ user }, { organization }] = await Promise.all([
    getCurrentUser({ allData: true }),
    getCurrentOrganization({ allData: true }),
  ]);

  if (!user || !organization)
    return (
      <SignOutButton>
        <SidebarMenuButton>
          <LogOutIcon />
          <span>Log Out</span>
        </SidebarMenuButton>
      </SignOutButton>
    );

  return (
    <SidebarOrganizationButtonClient user={user} organization={organization} />
  );
}
