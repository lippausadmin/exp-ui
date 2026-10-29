"use client";

import type { Option } from "@/components/shared/select";
import { Tooltip } from "@/components/shared/tooltip";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  MultiSelect as MultiSelectRoot,
  MultiSelectTrigger,
  MultiSelectValue,
  useMultiSelectContext,
} from "@/components/ui/multiselect";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon, InfoIcon, SearchIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

export type MultiSelectOption = Option & { shortLabel?: string };

type OptionsMap = Map<string, MultiSelectOption>;

const optionRowClassName =
  "hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] outline-none select-none";

// Todas as opções marcadas (o tamanho da seleção corta a varredura cedo).
function useAllSelected(optionsMap: OptionsMap) {
  const { selectedValues } = useMultiSelectContext();

  return useMemo(
    () =>
      optionsMap.size > 0 &&
      selectedValues.size >= optionsMap.size &&
      Array.from(optionsMap.keys()).every((value) => selectedValues.has(value)),
    [optionsMap, selectedValues],
  );
}

export type MultiSelectProps = {
  maxWidth?: string | number;
  containerClassName?: string;
  className?: string;
  placeholder?: string;
  search?:
    | boolean
    | {
        placeholder?: string;
        emptyMessage?: string;
        value?: string;
        onValueChange?: (value: string) => void;
      };
  label?: string;
  helpText?: string;
  error?: string;
  options: MultiSelectOption[];
  defaultValue?: MultiSelectOption[];
  value?: MultiSelectOption[];
  onChange?: (value: MultiSelectOption[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  /** Mostra a opção "(Todos)", que marca ou desmarca todas as opções. Padrão: desligado */
  selectAll?: boolean | { label?: string };
  /** A pesquisa também compara o valor da opção, além do rótulo. Padrão: false */
  searchByValue?: boolean;
  /** Mensagem quando não há nenhuma opção. Padrão: a mesma da pesquisa sem resultado */
  emptyOptionsMessage?: string;
};

export function MultiSelect({
  maxWidth,
  containerClassName,
  className,
  placeholder = "Selecione...",
  search = true,
  helpText,
  label,
  error,
  options = [],
  defaultValue,
  value,
  onChange,
  onBlur,
  disabled,
  selectAll,
  searchByValue = false,
  emptyOptionsMessage,
}: MultiSelectProps) {
  const selectAllLabel = selectAll
    ? (typeof selectAll === "object" && selectAll.label) || "(Todos)"
    : undefined;

  const optionsMap = useMemo<OptionsMap>(
    () => new Map(options.map((o) => [`${o.value}`, o])),
    [options],
  );

  // Normalizar value para array de strings
  const normalizedValue = useMemo(
    () => value?.map((v) => `${v.value}`),
    [value],
  );
  const normalizedDefaultValue = defaultValue?.map((v) => `${v.value}`);

  const handleChange = (newValues: string[]) => {
    if (!onChange) return;

    const selectedOptions = newValues
      .map((val) => optionsMap.get(val))
      .filter((opt): opt is MultiSelectOption => opt !== undefined);
    onChange(selectedOptions);
  };

  return (
    <Field
      className={cn("gap-0", containerClassName)}
      style={{ maxWidth }}
      data-invalid={!!error}
    >
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

      <MultiSelectRoot
        defaultValues={normalizedDefaultValue}
        values={normalizedValue}
        onValuesChange={handleChange}
      >
        <MultiSelectTrigger
          onBlur={onBlur}
          aria-label={label}
          aria-invalid={!!error}
          disabled={disabled}
          className={cn(
            "h-8 w-full max-w-full",
            className,
            error && "border-red-500 focus-visible:ring-red-500",
          )}
        >
          <SelectionValue
            optionsMap={optionsMap}
            placeholder={placeholder}
            allSelectedLabel={selectAllLabel}
          />
        </MultiSelectTrigger>

        <VirtualizedContent
          options={options}
          optionsMap={optionsMap}
          search={search}
          selectAllLabel={selectAllLabel}
          searchByValue={searchByValue}
          emptyOptionsMessage={emptyOptionsMessage}
        />
      </MultiSelectRoot>

      <FieldError>{error}</FieldError>
    </Field>
  );
}

// Com "(Todos)" ligado e tudo marcado, mostra o rótulo em vez de um badge por opção.
// Com uma opção só, o próprio item diz mais que "(Todos)".
function SelectionValue({
  optionsMap,
  placeholder,
  allSelectedLabel,
}: {
  optionsMap: OptionsMap;
  placeholder?: string;
  allSelectedLabel?: string;
}) {
  const allSelected = useAllSelected(optionsMap);

  if (allSelectedLabel && allSelected && optionsMap.size > 1) {
    return (
      <span className="min-w-0 overflow-hidden text-[13px]">
        {allSelectedLabel}
      </span>
    );
  }

  return (
    <MultiSelectValue
      overflowBehavior="cutoff"
      placeholder={placeholder}
      className="text-[13px]"
    />
  );
}

function VirtualizedContent({
  options,
  optionsMap,
  search,
  selectAllLabel,
  searchByValue,
  emptyOptionsMessage,
}: {
  options: MultiSelectOption[];
  optionsMap: OptionsMap;
  search?: MultiSelectProps["search"];
  selectAllLabel?: string;
  searchByValue?: boolean;
  emptyOptionsMessage?: string;
}) {
  const {
    open,
    selectedValues,
    toggleValue,
    onItemAdded,
    onItemsAdded,
    clearAll,
    setAll,
  } = useMultiSelectContext();
  const allSelected = useAllSelected(optionsMap);
  const [internalSearchValue, setInternalSearchValue] = useState("");
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  // Register only selected items for badge display
  useEffect(() => {
    const entries: Array<[string, string]> = [];
    selectedValues.forEach((val) => {
      const opt = optionsMap.get(val);
      if (opt) entries.push([val, opt.shortLabel ?? opt.label]);
    });
    onItemsAdded(entries);
  }, [selectedValues, optionsMap, onItemsAdded]);

  const searchValue =
    typeof search === "object"
      ? (search.value ?? internalSearchValue)
      : internalSearchValue;

  const setSearchValue = useCallback(
    (value: string) => {
      if (typeof search === "object") {
        search.onValueChange?.(value);
      }

      setInternalSearchValue(value);
    },
    [search],
  );

  useEffect(() => {
    if (!open) setSearchValue("");
  }, [open, setSearchValue]);

  const filtered = useMemo(() => {
    if (!searchValue.trim()) return options;
    const lower = searchValue.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(lower) ||
        (searchByValue && `${opt.value}`.toLowerCase().includes(lower)),
    );
  }, [options, searchValue, searchByValue]);

  // Como no seletor do legado: marca ou desmarca todas as opções, não só as filtradas.
  const handleToggleAll = () => {
    if (allSelected) {
      clearAll();
      return;
    }

    setAll(Array.from(optionsMap.keys()));
  };

  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 32,
    overscan: 10,
  });

  const handleToggle = (value: string) => {
    const opt = optionsMap.get(value);
    if (opt) onItemAdded(value, opt.shortLabel ?? opt.label);
    toggleValue(value);
  };

  const canSearch = search !== false;
  const searchPlaceholder =
    typeof search === "object" ? search.placeholder : "Buscar...";
  const searchEmptyMessage =
    typeof search === "object"
      ? search.emptyMessage
      : "Nenhum resultado encontrado.";
  const emptyMessage =
    options.length === 0 && emptyOptionsMessage
      ? emptyOptionsMessage
      : searchEmptyMessage;

  return (
    <PopoverContent className="w-85 min-w-(--radix-popover-trigger-width) p-0">
      {canSearch && (
        <div className="flex items-center border-b px-3">
          <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      )}
      {selectAllLabel && options.length > 0 && (
        <div className="border-b p-1">
          <button
            type="button"
            role="checkbox"
            aria-checked={allSelected}
            onClick={handleToggleAll}
            className={cn(
              optionRowClassName,
              "focus-visible:ring-ring/50 w-full text-left focus-visible:ring-[3px]",
              allSelected && "bg-accent/50",
            )}
          >
            <CheckIcon
              className={cn(
                "mr-2 size-4 shrink-0",
                allSelected ? "opacity-100" : "opacity-0",
              )}
            />
            {selectAllLabel}
          </button>
        </div>
      )}
      <div
        ref={setScrollElement}
        className="max-h-75 overflow-x-hidden overflow-y-auto p-1"
      >
        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {emptyMessage}
          </p>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const option = filtered[virtualItem.index];
              const val = `${option.value}`;
              const isSelected = selectedValues.has(val);

              return (
                <div
                  key={`${val}-${virtualItem.index}`}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className={cn(
                    optionRowClassName,
                    isSelected && "bg-accent/50",
                  )}
                  onClick={() => handleToggle(val)}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      isSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.label}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PopoverContent>
  );
}
