import { Card, CardContent } from "@/components/ui/card";
import React, { Suspense } from "react";
import DropzoneClient from "./_DropzoneClient";

const UserResumePage = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 px-4">
      <h1 className="text-2xl font-bold">Upload Your Resume</h1>
      <Card>
        <CardContent>
          <DropzoneClient />
        </CardContent>
        <Suspense>
          <ResumeDetails />
        </Suspense>
      </Card>

      <Suspense>
        <AISummaryCard />
      </Suspense>
    </div>
  );
};

async function ResumeDetails() {
  return null;
}

async function AISummaryCard() {
  return null;
}

export default UserResumePage;
