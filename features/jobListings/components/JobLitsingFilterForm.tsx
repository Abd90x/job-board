"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ExperienceLevel,
  experienceLevels,
  JobListingType,
  jobListingTypes,
  LocationRequirement,
  locationRequirements,
} from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  formatExperienceLevel,
  formatJobTypes,
  formatLocationRequirement,
} from "../lib/formatters";
import StateSelectItems from "./CountriesSelect";
import { Button } from "@/components/ui/button";
import LoadingSwap from "@/components/LoadingSwap";
import { useSidebar } from "@/components/ui/sidebar";

const ANY_VALUE = "any";

const jobListingFilterSchema = z.object({
  title: z.string().optional(),
  city: z.string().optional(),
  country: z.string().or(z.literal(ANY_VALUE)).optional(),
  experienceLevel: z.enum(experienceLevels).or(z.literal(ANY_VALUE)).optional(),
  locationRequirement: z
    .enum(locationRequirements)
    .or(z.literal(ANY_VALUE))
    .optional(),
  type: z.enum(jobListingTypes).or(z.literal(ANY_VALUE)).optional(),
});

const JobLitsingFilterForm = () => {
  const searchParams = useSearchParams();

  const router = useRouter();
  const pathname = usePathname();

  const { setOpenMobile } = useSidebar();

  const form = useForm({
    resolver: zodResolver(jobListingFilterSchema),
    defaultValues: {
      title: searchParams.get("title") ?? "",
      city: searchParams.get("city") ?? "",
      country: searchParams.get("state") ?? ANY_VALUE,
      experienceLevel:
        (searchParams.get("experience") as ExperienceLevel) ?? ANY_VALUE,
      locationRequirement:
        (searchParams.get("location") as LocationRequirement) ?? ANY_VALUE,
      type: (searchParams.get("type") as JobListingType) ?? ANY_VALUE,
    },
  });

  const onSubmit = (data: z.infer<typeof jobListingFilterSchema>) => {
    const newParams = new URLSearchParams();

    if (data.title) newParams.set("title", data.title);
    if (data.city) newParams.set("city", data.city);
    if (data.country && data.country !== ANY_VALUE)
      newParams.set("country", data.country);
    if (data.experienceLevel && data.experienceLevel !== ANY_VALUE)
      newParams.set("experience", data.experienceLevel);
    if (data.locationRequirement && data.locationRequirement !== ANY_VALUE)
      newParams.set("location", data.locationRequirement);
    if (data.type && data.type !== ANY_VALUE) newParams.set("type", data.type);

    router.push(`${pathname}?${newParams.toString()}`);
    setOpenMobile(false);
  };

  const clearFilters = () => {
    form.reset();
    router.push(pathname);
    setOpenMobile(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="locationRequirement"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Requirement</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any</SelectItem>
                    {locationRequirements.map((location) => (
                      <SelectItem key={location} value={location}>
                        {formatLocationRequirement(location)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="city"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="country"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any</SelectItem>
                    <StateSelectItems />
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="type"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Type</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any</SelectItem>
                    {jobListingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatJobTypes(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="experienceLevel"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ANY_VALUE}>Any</SelectItem>
                    {experienceLevels.map((experienceLevel) => (
                      <SelectItem key={experienceLevel} value={experienceLevel}>
                        {formatExperienceLevel(experienceLevel)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={form.formState.isSubmitting} className="w-full">
          <LoadingSwap isLoading={form.formState.isSubmitting}>
            Filter
          </LoadingSwap>
        </Button>
        <Button
          variant="outline"
          className="w-full"
          type="button"
          onClick={clearFilters}
          disabled={form.formState.isSubmitting}
        >
          Clear Filters
        </Button>
      </form>
    </Form>
  );
};

export default JobLitsingFilterForm;
