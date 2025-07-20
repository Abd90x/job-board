"use client";

import { ModeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/services/clerk/components/AuthButtons";
import { useClerk } from "@clerk/nextjs";
import {
  ArrowLeftRightIcon,
  Building2Icon,
  ChevronsUpDown,
  CreditCardIcon,
  LogOutIcon,
  UserRoundCheckIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

type User = {
  name: string;
  email: string;
  imageUrl?: string;
};

type Organization = {
  name: string;
  imageUrl: string | null;
};

export const SidebarOrganizationButtonClient = ({
  user,
  organization,
}: {
  user: User;
  organization: Organization;
}) => {
  const { isMobile, setOpenMobile } = useSidebar();

  const { openOrganizationProfile } = useClerk();

  return (
    <SidebarMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <OrganizationInfo user={user} organization={organization} />
            <ChevronsUpDown className="ml-auto group-data-[state=collapsed]:hidden" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          sideOffset={4}
          align="end"
          side={isMobile ? "bottom" : "right"}
          className="min-w-64 max-w-80"
        >
          <DropdownMenuLabel className="font-normal p-1">
            <OrganizationInfo user={user} organization={organization} />
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              openOrganizationProfile();
              setOpenMobile(false);
            }}
          >
            <Building2Icon className="me-1" /> Manage Organization
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/employer/user-settings">
              <UserRoundCheckIcon className="me-1" />
              User Settings
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/employer/pricing">
              <CreditCardIcon className="me-1" />
              Change Plan
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/organizations/select">
              <ArrowLeftRightIcon className="me-1" />
              Switch Organizations
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <ModeToggle />
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <SignOutButton>
            <DropdownMenuItem>
              <LogOutIcon className="me-1" /> Log Out
            </DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenu>
  );
};

const OrganizationInfo = ({
  user,
  organization,
}: {
  user: User;
  organization: Organization;
}) => {
  const nameInitials = organization.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <Avatar>
        <AvatarImage
          src={organization.imageUrl ?? undefined}
          alt={organization.name}
        />
        <AvatarFallback className="uppercasse bg-primary text-primary-foreground">
          {nameInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col flex-1 min-w-0 leading-tight group-data-[state=collapsed]:hidden">
        <span className="truncate text-sm font-semibold">
          {organization.name}
        </span>
        <span className="truncate text-xs">{user.email}</span>
      </div>
    </div>
  );
};
