import React, { ReactNode, Suspense } from "react";
import {
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
} from "@clerk/nextjs";

export const SignedOut = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <ClerkSignedOut>{children}</ClerkSignedOut>
    </Suspense>
  );
};

export const SignedIn = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <ClerkSignedIn>{children}</ClerkSignedIn>
    </Suspense>
  );
};
