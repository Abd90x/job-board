import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { ReactNode } from "react";
import AppSidebarClient from "@/components/sidebar/_AppSidebarClient";
import Image from "next/image";
import { SignedIn } from "@/services/clerk/components/SignInStatus";

const AppSidebar = ({
  content,
  footerButton,
  children,
}: {
  content: ReactNode;
  footerButton: ReactNode;
  children: ReactNode;
}) => {
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

          <SidebarContent>{content}</SidebarContent>

          <SignedIn>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>{footerButton}</SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </SignedIn>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </AppSidebarClient>
    </SidebarProvider>
  );
};

export default AppSidebar;
