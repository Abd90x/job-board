import React from "react";

const ClerkLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div>{children}</div>
    </div>
  );
};

export default ClerkLayout;
