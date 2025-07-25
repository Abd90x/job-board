"use client";

import { UploadDropzone } from "@/services/uploadthing/components/Uploadthing";
import { useRouter } from "next/navigation";

export default function DropzoneClient() {
  const router = useRouter();

  return (
    <UploadDropzone
      endpoint="resumeUploader"
      onClientUploadComplete={() => router.refresh()}
    />
  );
}
