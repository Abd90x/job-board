"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import React, { ReactNode } from "react";

const AppSidebarClient = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col w-full">
        <div className="p-2 border-b flex items-center gap-1 justify-between ">
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
          />
        </div>
        <div className="flex flex-1">{children}</div>
      </div>
    );
  }
  return children;
};

export default AppSidebarClient;
