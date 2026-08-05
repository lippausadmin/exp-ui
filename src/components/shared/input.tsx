import { cn } from "@/lib/utils";
import { InfoIcon } from "lucide-react";
import {
  forwardRef,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input as InputRoot } from "../ui/input";
import { Tooltip } from "./tooltip";

export type InputProps = {
  label?: string;
  error?: string;
  minWidth?: string;
  maxWidth?: string;
  width?: string;
  containerClassName?: string;
  helpText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  numericOnly?: boolean;
  currencyOnly?: boolean;
  uppercase?: boolean;
} & Omit<ComponentProps<"input">, "ref">;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      minWidth,
      maxWidth,
      width,
      containerClassName,
      helpText,
      leftIcon,
      rightIcon,
      numericOnly,
      currencyOnly,
      className,
      uppercase,
      ...props
    },
    ref,
  ) => {
    const inputId = props.id || props.name;

    const formatCurrency = (value: string) => {
      let formatted = value.replace(/\D/g, "");
      formatted = formatted.replace(/(\d)(\d{2})$/, "$1,$2");
      formatted = formatted.replace(/(?=(\d{3})+(\D))\B/g, ".");
      return formatted;
    };

    const handleCurrencyChange = (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCurrency(e.target.value);
      e.target.value = formatted;
      props.onChange?.(e);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (uppercase) {
        e.target.value = e.target.value.toUpperCase();
      }
      props.onChange?.(e);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      props.onKeyDown?.(e);
      if (e.defaultPrevented || (!numericOnly && !currencyOnly)) return;

      if (
        [
          "Backspace",
          "Delete",
          "Tab",
          "Enter",
          "Escape",
          "Home",
          "End",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ].includes(e.key)
      )
        return;
      if (e.ctrlKey || e.metaKey) return;
      if (
        (numericOnly && (e.key === "." || e.key === ",")) ||
        /[0-9]/.test(e.key)
      )
        return;

      e.preventDefault();
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      props.onPaste?.(e);
      if (e.defaultPrevented || (!numericOnly && !currencyOnly)) return;

      const pasted = e.clipboardData.getData("text").replace(/[^\d,.]/g, "");
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      const val = target.value;
      const newVal = val.slice(0, start) + pasted + val.slice(end);
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set;
      nativeInputValueSetter?.call(
        target,
        currencyOnly ? formatCurrency(newVal) : newVal,
      );

      props.onChange?.({
        ...e,
        target,
      } as ChangeEvent<HTMLInputElement>);
    };

    return (
      <Field
        data-invalid={!!error}
        className={cn("w-full gap-0", containerClassName)}
        style={{ minWidth, maxWidth, width }}
      >
        {label && (
          <FieldLabel
            htmlFor={inputId}
            className="text-foreground flex w-full min-w-0 items-center gap-3 text-[13px]"
          >
            <span className="min-w-0 truncate" title={label}>
              {label}
            </span>

            {helpText && (
              <Tooltip text={helpText}>
                <InfoIcon size={16} className="shrink-0 text-primary" />
              </Tooltip>
            )}
          </FieldLabel>
        )}

        <div className="relative w-full">
          {leftIcon && (
            <div className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              {leftIcon}
            </div>
          )}

          <InputRoot
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-8 text-[12px]",
              className,
              error && "border-destructive focus-visible:ring-destructive",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              (props.type === "number" || numericOnly || currencyOnly) &&
                "[-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none",
            )}
            style={{ width }}
            {...props}
            onChange={currencyOnly ? handleCurrencyChange : handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />

          {rightIcon && (
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>

        <FieldError>{error}</FieldError>
      </Field>
    );
  },
);

Input.displayName = "Input";
