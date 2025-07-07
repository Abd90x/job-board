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
} from "@/components/ui/sidebar";
import React from "react";
import AppSidebarClient from "./_AppSidebarClient";
import Image from "next/image";

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

          <SidebarContent></SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>BB</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <h1>Page</h1>
        </main>
      </AppSidebarClient>
    </SidebarProvider>
  );
};

export default Page;
