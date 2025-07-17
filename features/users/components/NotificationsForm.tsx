"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { UserNotificationSettingsTable } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { userNotificationsSettingsSchema } from "../actions/schema";
import z from "zod";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { toast } from "sonner";
import { updateUserNotificationsSettings } from "../actions/actions";

const NotificationsForm = ({
  notificationsSettings,
}: {
  notificationsSettings?: Pick<
    typeof UserNotificationSettingsTable.$inferSelect,
    "newJobEmailNotification" | "aiPrompt"
  >;
}) => {
  const form = useForm({
    resolver: zodResolver(userNotificationsSettingsSchema),
    defaultValues: notificationsSettings ?? {
      newJobEmailNotification: false,
      aiPrompt: "",
    },
  });

  const onSubmit = async (
    data: z.infer<typeof userNotificationsSettingsSchema>
  ) => {
    const result = await updateUserNotificationsSettings(data);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  };

  const newJobEmailNotification = form.watch("newJobEmailNotification");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm space-y-6">
          <FormField
            name="newJobEmailNotification"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>Daily Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email about new job listings that match your
                      interests
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          {newJobEmailNotification && (
            <FormField
              name="aiPrompt"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-0.5">
                    <FormLabel>Filter Prompt</FormLabel>
                    <FormDescription>
                      Out AI will use this prompt to filter job listings ans
                      only send you notifications for job that match your
                      criteria.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="min-h-32"
                      placeholder="Describe the jobs you're interested in. For example: I'm looking for a remote front-end development positions that use React and pay at least $750 per month."
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to receive notifications for all new job
                    listings.
                  </FormDescription>
                </FormItem>
              )}
            />
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Save Notification Settings
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
};

export default NotificationsForm;
