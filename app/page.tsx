import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
} from "@/components/ui/sidebar";
import React from "react";
import AppSidebarClient from "./_AppSidebarClient";
import Image from "next/image";
import Link from "next/link";
import { LogInIcon } from "lucide-react";
import { SignedIn, SignedOut } from "@/services/clerk/components/SignInStatus";
import { SidebarUserButton } from "@/features/users/components/SidebarUserButton";

const Page = () => {
  return (
    <SidebarProvider className="overflow-y-hidden">
      <AppSidebarClient>
        <Sidebar collapsible="icon" className="overflow-hidden">
          <SidebarHeader className="flex-row items-center justify-between">
            <SidebarTrigger />
            <Image
              src="/logo-light.svg"
              alt="JOR Jobs"
              width={120}
              height={90}
              className="hidden dark:block"
            />
            <Image
              src="/logo.svg"
              alt="JOR Jobs"
              width={120}
              height={90}
              className="block dark:hidden"
            />{" "}
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                <SignedOut>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/sign-in">
                        <LogInIcon aria-hidden="true" />
                        <span>Log In</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SignedOut>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarUserButton />
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <h1>Page</h1>
        </main>
      </AppSidebarClient>
    </SidebarProvider>
  );
};

export default Page;
