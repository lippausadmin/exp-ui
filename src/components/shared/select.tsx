import { Tooltip } from "@/components/shared/tooltip";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { CheckIcon, ChevronDown, InfoIcon, SearchIcon, XIcon } from "lucide-react";
import { forwardRef, useMemo, useState } from "react";
import type { MouseEvent } from "react";

export type Option = {
  value: number | string | boolean;
  label: string;
};

export type SelectProps = {
  placeholder?: string;
  label?: string;
  helpText?: string;
  error?: string;
  options: Option[];
  value?: Option;
  defaultValue?: string;
  width?: string | number;
  containerClassName?: string;
  onChange?: (value: Option | undefined) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  minSearchChars?: number;
  maxRenderedOptions?: number;
  clearable?: boolean;
  className?: string;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      placeholder,
      label,
      helpText,
      error,
      options = [],
      value,
      onChange,
      onBlur,
      disabled,
      searchable = false,
      searchPlaceholder = "Pesquisar...",
      clearable = true,
      width,
      containerClassName,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

    const normalizedValue = value ? `${value.value}` : "";

    const filtered = useMemo(() => {
      if (!searchTerm.trim()) return options;
      const lower = searchTerm.toLowerCase();
      return options.filter((opt) => opt.label.toLowerCase().includes(lower));
    }, [options, searchTerm]);

    const virtualizer = useVirtualizer({
      count: filtered.length,
      getScrollElement: () => scrollElement,
      estimateSize: () => 32,
      overscan: 10,
    });

    const handleSelect = (option: Option) => {
      onChange?.(option);
      setOpen(false);
      setSearchTerm("");
    };

    const handleClear = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) onChange?.(undefined);
    };

    const hasValue = !!normalizedValue;
    const showClear = clearable && hasValue && !disabled;

    return (
        <Field data-invalid={!!error} className={cn("w-full gap-0", containerClassName)} style={{ width }}>
        {label && (
          <FieldLabel className="w-full text-[13px] text-[#0A0A0A]">
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

        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setSearchTerm("");
          }}
          modal
        >
          <PopoverTrigger asChild>
            <button
              ref={ref}
              type="button"
              data-invalid={!!error || undefined}
              onBlur={onBlur}
              disabled={disabled}
              title={value?.label}
              className={cn(
                'border-input ring-offset-background data-placeholder:text-muted-foreground focus:ring-ring flex h-8 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
                className,
                error && 'border-red-500 focus-visible:ring-red-500',
              )}
            >
              <span className={cn('min-w-0 truncate text-[13px]', !hasValue && 'text-muted-foreground')}>
                {value?.label || placeholder}
              </span>
              {showClear ? (
                <span
                  role="button"
                  tabIndex={-1}
                  aria-label="Limpar seleção"
                  className="text-muted-foreground hover:text-destructive flex shrink-0 cursor-pointer items-center justify-center rounded-sm opacity-50 transition-opacity hover:opacity-100"
                  style={{ pointerEvents: 'auto' }}
                  onClick={handleClear}
                >
                  <XIcon className="size-4" />
                </span>
              ) : (
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              )}
            </button>
          </PopoverTrigger>

          <PopoverContent className="min-w-87.5 p-0">
            {searchable && (
              <div className="flex items-center border-b px-3">
                <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}
            <div ref={setScrollElement} className="max-h-75 overflow-x-hidden overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground py-6 text-center text-sm">Nenhum resultado encontrado</p>
              ) : (
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const option = filtered[virtualItem.index];
                    const val = `${option.value}`;
                    const isSelected = val === normalizedValue;

                    return (
                      <div
                        key={`${val}-${virtualItem.index}`}
                        data-index={virtualItem.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        className={cn(
                          'hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] outline-none select-none',
                          isSelected && 'bg-accent/50',
                        )}
                        onClick={() => handleSelect(option)}
                      >
                        <CheckIcon className={cn('mr-2 size-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')} />
                        {option.label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <FieldError>{error}</FieldError>
      </Field>
    );
  },
);

Select.displayName = 'Select';
