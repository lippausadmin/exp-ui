import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90 disabled:hover:bg-primary",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:hover:bg-destructive",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground disabled:hover:bg-background disabled:hover:text-inherit",
        ghost:
          "hover:bg-accent hover:text-accent-foreground disabled:hover:bg-transparent disabled:hover:text-inherit",
        link: "text-primary underline-offset-4 hover:underline disabled:hover:no-underline",

        // Custom variants
        main: "bg-primary text-white font-semibold hover:bg-primary/90 disabled:hover:bg-primary",
        secondary:
          "bg-secondary text-secondary-foreground font-semibold hover:bg-primary/15 disabled:hover:bg-secondary",
        "main-outline":
          "border border-primary text-primary font-semibold hover:bg-accent disabled:hover:bg-transparent",
        "secondary-outline":
          "border border-[#D5D7DA] text-black font-semibold hover:bg-accent disabled:hover:bg-transparent",
        "destructive-outline":
          "border border-red-500 text-red-500 font-semibold hover:bg-red-500 hover:text-white disabled:hover:bg-transparent disabled:hover:text-red-500",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7.5 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, type = "button", ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

// Shared by composed components such as Calendar.
// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
