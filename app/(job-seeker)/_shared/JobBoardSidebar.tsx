import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import JobLitsingFilterForm from "@/features/jobListings/components/JobLitsingFilterForm";
import React from "react";

const JobBoardSidebar = () => {
  return (
    <SidebarGroup className="group-data-[state=collapsed]:hidden">
      <SidebarGroupContent className="px-1">
        <JobLitsingFilterForm />
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default JobBoardSidebar;
