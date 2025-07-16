"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { jobListingAiSearchSchema } from "../actions/schema";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";

const JobListingAiSearchForm = () => {
  const form = useForm({
    resolver: zodResolver(jobListingAiSearchSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof jobListingAiSearchSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="query"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Search Query</FormLabel>
              <FormControl>
                <Textarea {...field} className="min-h-32" />
              </FormControl>
              <FormDescription>
                Provide a description of your skills/experience as well as what
                you are looking for in a job. The more specific you are, the
                better the result will be.
              </FormDescription>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Search
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
};

export default JobListingAiSearchForm;
