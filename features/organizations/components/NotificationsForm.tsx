"use client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { OrganizationUserSettingsTable } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { toast } from "sonner";
import { organizationUserSettingsSchema } from "../actions/schema";
import { updateOrganizationUserSettings } from "../actions/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import RatingIcons from "@/features/jobListingsApplications/components/RatingIcons";
import { RATING_OPTIONS } from "@/features/data/constants";

const ANY_VALUE = "any";

const NotificationsForm = ({
  notificationsSettings,
}: {
  notificationsSettings?: Pick<
    typeof OrganizationUserSettingsTable.$inferSelect,
    "newApplicationEmailNotification" | "minRating"
  >;
}) => {
  const form = useForm({
    resolver: zodResolver(organizationUserSettingsSchema),
    defaultValues: notificationsSettings ?? {
      newApplicationEmailNotification: false,
      minRating: null,
    },
  });

  const onSubmit = async (
    data: z.infer<typeof organizationUserSettingsSchema>
  ) => {
    const result = await updateOrganizationUserSettings(data);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
    }
  };

  const newApplicationEmailNotification = form.watch(
    "newApplicationEmailNotification"
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="border rounded-lg p-4 shadow-sm space-y-6">
          <FormField
            name="newApplicationEmailNotification"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <FormLabel>New Application Email Notifications</FormLabel>
                    <FormDescription>
                      Receive email about new applications that are created by
                      your organization.
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
          {newApplicationEmailNotification && (
            <FormField
              name="minRating"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Rating</FormLabel>
                  <Select
                    value={field.value ? field.value.toString() : ANY_VALUE}
                    onValueChange={(val) =>
                      field.onChange(val === ANY_VALUE ? null : Number(val))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue asChild />
                        {field.value === null ? (
                          <span>Any Rating</span>
                        ) : (
                          <RatingIcons
                            className="text-inherit"
                            rating={field.value}
                          />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ANY_VALUE}>Any Rating</SelectItem>
                      {RATING_OPTIONS.filter((r) => r != null).map((r) => (
                        <SelectItem value={r.toString()} key={r}>
                          <RatingIcons className="text-inherit" rating={r} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Only receive notifications for candidates that meet or
                    exceed this rating. Candidates 3-5 stars should meet all job
                    requirements and are likely a good fit for the role.
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
            Save Settings
          </LoadingSwap>
        </Button>
      </form>
    </Form>
  );
};

export default NotificationsForm;
