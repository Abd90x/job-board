import { cn } from "@/lib/utils";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React from "react";
import { markdownClassNames } from "./_MarkdownEditor";
import remarkGfm from "remark-gfm";

const MarkdownRenderer = ({
  className,
  options,
  ...props
}: MDXRemoteProps & { className?: string }) => {
  return (
    <div className={cn(markdownClassNames, className)}>
      <MDXRemote
        {...props}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              ...(options?.mdxOptions?.remarkPlugins ?? []),
            ],
            ...options?.mdxOptions,
          },
        }}
      />
    </div>
  );
};

export default MarkdownRenderer;
