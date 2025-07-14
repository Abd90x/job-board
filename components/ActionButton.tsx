"use client";

import React, { ComponentProps, useTransition } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import LoadingSwap from "./LoadingSwap";

type Props = {
  action: () => Promise<{ error: boolean; message: string }>;
  requireAreYouSure?: boolean;
  areYouSureDescription?: string;
};

const ActionButton = ({
  action,
  requireAreYouSure = false,
  areYouSureDescription = "This action cannot be undone.",
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & Props) => {
  const [isLoading, startTransition] = useTransition();

  function performAction() {
    startTransition(async () => {
      const data = await action();
      if (data.error) {
        toast.error(data.message ?? "An error occurred.");
      }
    });
  }
  if (requireAreYouSure) {
    return (
      <AlertDialog open={isLoading ? true : undefined}>
        <AlertDialogTrigger asChild>
          <Button {...props} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {areYouSureDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={performAction} disabled={isLoading}>
              <LoadingSwap
                isLoading={isLoading}
                className="inline-flex items-center gap-2"
              >
                Yes
              </LoadingSwap>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Button {...props} disabled={isLoading} onClick={performAction}>
      <LoadingSwap
        isLoading={isLoading}
        className="inline-flex items-center gap-2"
      >
        {props.children}
      </LoadingSwap>
    </Button>
  );
};

export default ActionButton;
