import AppSidebar from "@/components/sidebar/AppSidebar";

import { SidebarUserButton } from "@/features/users/components/SidebarUserButton";
import {
  BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboard,
  LogInIcon,
} from "lucide-react";
import { ReactNode } from "react";
import SidebarNavMenuGroup from "@/components/sidebar/SidebarNavMenuGroup";

const JobSeekerLayout = ({
  children,
  sidebar,
}: {
  children: ReactNode;
  sidebar: ReactNode;
}) => {
  return (
    <AppSidebar
      content={
        <>
          {sidebar}
          <SidebarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
              {
                href: "/ai-search",
                icon: <BrainCircuitIcon />,
                label: "AI Search",
              },
              {
                href: "/employer",
                icon: <LayoutDashboard />,
                label: "Employer Dashboard",
                authStatus: "signedIn",
              },
              {
                href: "/sign-in",
                icon: <LogInIcon />,
                label: "Sign In",
                authStatus: "signedOut",
              },
            ]}
          />
        </>
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSidebar>
  );
};

export default JobSeekerLayout;
