"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  id?: string;
  label?: string;
  error?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  width?: number | string;
  containerClassName?: string;
};

export const DatePicker = forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      label,
      error,
      value,
      onChange,
      placeholder = "Selecione uma data",
      disabled = false,
      id,
      fromDate,
      toDate,
      width,
      containerClassName,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(value);
    const [month, setMonth] = useState<Date>(value ?? new Date());

    useEffect(() => {
      setDate(value);
      if (value) {
        setMonth(value);
      }
    }, [value]);

    const handleSelect = (selectedDate: Date | undefined) => {
      setDate(selectedDate);
      if (selectedDate) {
        setMonth(selectedDate);
      }
      onChange?.(selectedDate);
    };

    const handleClear = () => {
      handleSelect(undefined);
      setOpen(false);
    };

    const handleToday = () => {
      const today = new Date();

      setMonth(today);
      handleSelect(today);
      setOpen(false);
    };

    return (
      <Field
        data-invalid={!!error}
        className={cn("w-full gap-0", containerClassName)}
        style={{ width }}
      >
        {label && (
          <FieldLabel
            htmlFor={id}
            className="w-full text-[13px] text-[#0A0A0A]"
          >
            <span className="min-w-0 truncate" title={label}>
              {label}
            </span>
          </FieldLabel>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant="outline"
              data-empty={!date}
              disabled={disabled}
              aria-invalid={!!error}
              className="data-[empty=true]:text-muted-foreground h-8 w-full justify-between text-left text-[13px] font-semibold shadow-xs"
            >
              <span>{date ? format(date, "dd/MM/yyyy") : placeholder}</span>
              <CalendarIcon className="text-foreground" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[230px] p-0" align="start">
            <Calendar
              mode="single"
              captionLayout="dropdown"
              locale={ptBR}
              selected={date}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonth}
              formatters={{
                formatCaption: (month) => format(month, "LLLL 'de' yyyy", { locale: ptBR }),
                formatMonthDropdown: (month) => `${format(month, "LLLL", { locale: ptBR })} de`,
                formatYearDropdown: (year) => format(year, "yyyy", { locale: ptBR }),
                formatWeekdayName: (weekday) => format(weekday, "EEEEE", { locale: ptBR }).toUpperCase(),
              }}
              startMonth={fromDate}
              endMonth={toDate}
              disabled={[
                ...(fromDate ? [{ before: fromDate }] : []),
                ...(toDate ? [{ after: toDate }] : []),
              ]}
            />
            <div className="flex items-center justify-between px-3 pb-3 text-[12px]">
              <button
                type="button"
                className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
                disabled={disabled || !date}
                onClick={handleClear}
              >
                Limpar
              </button>
              <button
                type="button"
                className="font-medium text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
                disabled={disabled}
                onClick={handleToday}
              >
                Hoje
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <FieldError>{error}</FieldError>
      </Field>
    );
  },
);

DatePicker.displayName = "DatePicker";
