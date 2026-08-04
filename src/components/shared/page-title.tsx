import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

export type PageTitleProps = {
  title: string;
} & Omit<ComponentProps<"h1">, "children">;

export function PageTitle({ title, className, ...props }: PageTitleProps) {
  return (
    <h1
      className={cn(
        "text-[20px] font-semibold text-primary xl:text-[22px] 2xl:text-[24px]",
        className,
      )}
      {...props}
    >
      {title}
    </h1>
  );
}
