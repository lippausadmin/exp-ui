import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker, type ChevronProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";

function Calendar({ className, classNames, showOutsideDays = true, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "relative flex flex-col gap-3",
        month_caption: "relative flex h-8 items-center justify-start pr-16",
        caption_label: "pointer-events-none relative z-10 inline-flex items-center gap-1 text-[13px] font-bold capitalize",
        dropdowns: "flex items-center justify-start gap-1 text-[13px] font-bold",
        dropdown_root:
          "relative inline-flex h-8 items-center gap-1 rounded-md bg-background text-[13px] font-bold capitalize",
        dropdown: "absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0",
        chevron: "size-3 text-foreground",
        nav: "absolute right-0 top-0 flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 border-0 bg-transparent p-0 shadow-none opacity-60 hover:bg-transparent hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 border-0 bg-transparent p-0 shadow-none opacity-60 hover:bg-transparent hover:opacity-100",
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday: "w-7 rounded-md text-center text-[12px] font-medium text-foreground",
        week: "mt-1 flex w-full",
        day: cn(
          "relative size-7 p-0 text-center text-[12px] focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-primary [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md",
        ),
        day_button: cn(buttonVariants({ variant: "ghost" }), "size-7 rounded-sm p-0 text-[12px] font-medium aria-selected:opacity-100"),
        range_start: "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        range_end: "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside: "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }: ChevronProps) => {
          const Icon = orientation === "left" ? ChevronLeft : orientation === "right" ? ChevronRight : ChevronDown;

          return <Icon className={cn("size-4", className)} {...props} />;
        },
      }}
      {...props}
    />
  );
}

export { Calendar };
