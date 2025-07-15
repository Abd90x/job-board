"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { newJobListingApplicationSchema } from "../actions/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MarkdownEditor } from "@/components/markdown/MarkdownEditor";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { toast } from "sonner";
import { createJobListingApplication } from "../actions/actions";

type Props = {
  jobListingId: string;
};

const NewJobListingApplicationForm = ({ jobListingId }: Props) => {
  const form = useForm({
    resolver: zodResolver(newJobListingApplicationSchema),
    defaultValues: {
      coverLetter: "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof newJobListingApplicationSchema>
  ) => {
    const result = await createJobListingApplication(jobListingId, data);

    if (result.error) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="coverLetter"
          control={form.control}
          render={(field) => (
            <FormItem>
              <FormLabel>Cover Letter</FormLabel>
              <FormControl>
                <MarkdownEditor {...field} markdown={field.field.value ?? ""} />
              </FormControl>
              <FormDescription>Optional</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={form.formState.isSubmitting}
          type="submit"
          className="w-full"
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Apply
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
};

export default NewJobListingApplicationForm;
