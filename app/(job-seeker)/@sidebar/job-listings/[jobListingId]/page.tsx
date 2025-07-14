import React from "react";

type Props = {
  params: Promise<{ jobListingId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

const JobListingPage = async ({ params, searchParams }: Props) => {
  return "ssss";
};

export default JobListingPage;
