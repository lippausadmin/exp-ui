import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export type PageContainerProps = { tabs?: boolean } & ComponentProps<"div">;

export function PageContainer({
  tabs = false,
  className,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        tabs
          ? "flex h-full max-w-full min-w-0 flex-col gap-4 py-2 2xl:py-4"
          : "flex h-full flex-col gap-2 py-2 2xl:gap-3 2xl:py-4",
        className,
      )}
      {...props}
    />
  );
}
