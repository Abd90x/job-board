import { OrganizationList } from "@clerk/nextjs";
import React, { Suspense } from "react";

type Props = {
  searchParams: Promise<{ redirect?: string }>;
};

const OrganizationSelectPage = (props: Props) => {
  return (
    <Suspense>
      <SuspendedPage {...props} />
    </Suspense>
  );
};

export default OrganizationSelectPage;

async function SuspendedPage({ searchParams }: Props) {
  const { redirect } = await searchParams;

  const redirectUrl = redirect ?? "/employer";

  return (
    <OrganizationList
      hidePersonal
      hideSlug
      skipInvitationScreen
      afterSelectOrganizationUrl={redirectUrl}
      afterCreateOrganizationUrl={redirectUrl}
    />
  );
}
