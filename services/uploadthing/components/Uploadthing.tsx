"use client";

import { generateUploadDropzone } from "@uploadthing/react";
import { CustomFileRouter } from "../router";
import { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";
import { Json } from "@uploadthing/shared";

const UploadDropzoneComponent = generateUploadDropzone<CustomFileRouter>();

export function UploadDropzone({
  className,
  onClientUploadComplete,
  onUploadError,
  ...props
}: ComponentProps<typeof UploadDropzoneComponent>) {
  return (
    <UploadDropzoneComponent
      {...props}
      className={cn(
        "border-dashed border-2 border-muted rounded-lg flex items-center justify-center",
        "ut-button:bg-primary ut-button:text-primary-foreground ut-button:ut-readying:bg-primary/90 ut-button:ut-readying:text-primary-foreground/90 ut-label:hover:text-primary ut-progress:stroke-primary ut-progress:fill-primary/20 ut-focus-visible:ring-primary/50 ut-button:data-[state=ready]:bg-primary ut-button:data-[state=ready]:text-primary-foreground ut-button:data-[state=uploading]:bg-primary/90 ut-button:data-[state=uploading]:text-primary-foreground/90",
        className
      )}
      onClientUploadComplete={(res) => {
        res.forEach(({ serverData }) => {
          toast.success(serverData.message);
        });
        onClientUploadComplete?.(res);
      }}
      onUploadError={(error: UploadThingError<Json>) => {
        toast.error(error.message);
        onUploadError?.(error);
      }}
    />
  );
}
