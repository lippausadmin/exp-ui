import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

type TooltipProps = {
  text: ReactNode;
} & ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;

export function Tooltip({ children, text, ...rest }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

        {text && <TooltipContent {...rest}>{text}</TooltipContent>}
      </TooltipRoot>
    </TooltipProvider>
  );
}
