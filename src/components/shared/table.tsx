"use client";

import * as React from "react";
import {
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table as TableRoot,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tooltip } from "./tooltip";

type CellStyle<T> =
  | React.CSSProperties
  | ((props: {
      value: T[keyof T] | (string & {}) | undefined;
      row: T;
      rows: T[];
      index: number;
    }) => React.CSSProperties);

export type ColumnDef<T> = {
  /** Chave do objeto de dados para acessar o valor da célula */
  accessorKey?: keyof T | (string & {});
  /** Texto exibido no cabeçalho da coluna */
  header: string;
  /** Descrição adicional mostrada em tooltip no cabeçalho */
  headerDescription?: string;
  /** Habilita ordenação da coluna (via callback onSortChange) */
  sortable?: boolean;
  /** Habilita ordenação local (client-side) da coluna */
  localSortable?: boolean;
  /** Estilos CSS customizados para o cabeçalho da coluna */
  headerStyle?: React.CSSProperties;
  /** Estilos CSS customizados para as células da coluna */
  cellStyle?: CellStyle<T>;
  /** Trunca o conteúdo da célula com ellipsis quando o texto ultrapassar a largura */
  ellipsis?: boolean;
  /** Função customizada de comparação para ordenação */
  sortFn?: (a: T, b: T) => number;
  /** Função para renderização customizada do conteúdo da célula */
  cell?: (params: { value: T[keyof T] | undefined; row: T }) => React.ReactNode;
  /** Exibe ícone verde (CheckCircle2) se o valor for truthy, ou vermelho (XCircle) se for falsy. null/undefined exibe "-" */
  booleanIcon?: boolean;
  /** Função que retorna o número de linhas que a célula deve ocupar (rowspan). Retorne 0 para ocultar a célula */
  rowSpanFn?: (params: {
    value: T[keyof T] | undefined;
    row: T;
    rows: T[];
    rowIndex: number;
  }) => number | null | undefined;
};

export type DataTableProps<T> = {
  /** Array de definições de colunas da tabela */
  columns: ColumnDef<T>[];
  /** Array de dados a serem exibidos na tabela */
  data: T[];
  /** Indica se a tabela está em estado de carregamento */
  loading?: boolean;
  /** Define o algoritmo de layout da tabela: 'auto' para largura automática ou 'fixed' para largura fixa */
  tableLayout?: "auto" | "fixed";
  /** Classes CSS adicionais para o container da tabela */
  className?: string;
  /**
   * Array de níveis de cabeçalhos agrupados. Cada elemento do array representa um nível.
   *
   * @example
   * // Exemplo com 2 níveis de agrupamento:
   * const headers = [
   *   [ // Nível 0 (topo)
   *     { title: 'Total: 100', span: 3, helpText: 'Texto do tooltip' },
   *     { title: 'Total: 200', span: 3 }
   *   ],
   *   [ // Nível 1
   *     { title: 'Grupo A', span: 3 },
   *     { title: 'Grupo B', span: 3 }
   *   ]
   * ];
   */
  groupedHeaders?: {
    title: React.ReactNode;
    span: number;
    helpText?: string;
    style?: React.CSSProperties;
  }[][];
  /** Função para customizar o estilo de cada linha baseado nos dados e índice */
  rowStyle?: (row: T, index: number) => React.CSSProperties;
  /** Callback executado quando a ordenação de uma coluna é alterada */
  onSortChange?: (
    columnKey: keyof T | (string & {}),
    direction: "asc" | "desc" | null,
  ) => void;
  /** Callback executado quando uma linha é clicada */
  onRowClick?: (row: T, index: number) => void;
  /** Callback executado quando uma linha recebe duplo clique */
  onRowDoubleClick?: (row: T, index: number) => void;

  /** Habilita ou desabilita a paginação da tabela */
  enablePagination?: boolean;
  /** Número total de registros (usado para cálculo de páginas) */
  totalCount?: number;
  /** Página atual selecionada (começa em 1) */
  currentPage?: number;
  /** Callback executado quando a página é alterada */
  onPageChange?: (page: number) => void;
  /** Quantidade de registros por página (usado para cálculo de páginas). Padrão: 100 */
  pageSize?: number;

  /** Habilita seleção de linhas com checkboxes */
  enableRowSelection?: boolean;
  /** Set contendo as linhas atualmente selecionadas */
  selectedRows?: Set<T>;
  /** Callback executado quando a seleção de linhas é alterada */
  onRowSelectionChange?: (selectedRows: Set<T>) => void;
  /** Define se uma linha pode ser selecionada. Padrão: todas as linhas */
  isRowSelectable?: (row: T) => boolean;
  /** Número de colunas de dados a serem fixadas (sticky) à esquerda da tabela */
  frozenColumns?: number;
  /** Mensagem a ser exibida quando não houver dados na tabela */
  emptyMessage?: string;
  /** Desabilita toda a tabela (checkboxes e interações) */
  disabled?: boolean;
};

export function Table<T extends object>({
  columns,
  data,
  tableLayout,
  loading,
  className,
  groupedHeaders,
  rowStyle,
  onSortChange,
  onRowClick,
  onRowDoubleClick,
  enablePagination = true,
  totalCount = 0,
  currentPage = 1,
  onPageChange,
  pageSize = 100,
  enableRowSelection = false,
  selectedRows: externalSelectedRows,
  onRowSelectionChange,
  isRowSelectable,
  frozenColumns = 0,
  emptyMessage = "Nenhum resultado encontrado.",
  disabled = false,
}: DataTableProps<T>) {
  const [internalSelectedRows, setInternalSelectedRows] = React.useState<
    Set<T>
  >(new Set());
  const selectedRows = externalSelectedRows ?? internalSelectedRows;

  const [sortState, setSortState] = React.useState<{
    columnKey: keyof T | (string & {});
    direction: "asc" | "desc" | null;
  } | null>(null);

  const sortedData = React.useMemo(() => {
    if (!sortState) return data;

    const col = columns.find((c) => c.accessorKey === sortState.columnKey);
    if (!col || !col.localSortable) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortState.columnKey as keyof T];
      const bVal = b[sortState.columnKey as keyof T];

      const aIsNull = aVal === null || aVal === undefined;
      const bIsNull = bVal === null || bVal === undefined;

      if (aIsNull && bIsNull) return 0;
      if (aIsNull) return 1;
      if (bIsNull) return -1;

      if (col.sortFn) {
        const result = col.sortFn(a, b);
        return sortState.direction === "asc" ? result : -result;
      }

      // Ordenação para string
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortState.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Ordenação para number
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortState.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      // Ordenação para boolean
      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return sortState.direction === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      // Ordenação para Date
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortState.direction === "asc"
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return 0;
    });

    return sorted;
  }, [data, sortState, columns]);

  const handleHeaderClick = (col: ColumnDef<T>) => {
    if (loading || !col.sortable || !col.accessorKey) return;

    const currentDirection =
      sortState?.columnKey === col.accessorKey ? sortState.direction : null;
    let nextDirection: "asc" | "desc" | null;

    if (currentDirection === null) nextDirection = "asc";
    else if (currentDirection === "asc") nextDirection = "desc";
    else nextDirection = null;

    setSortState(
      nextDirection
        ? { columnKey: col.accessorKey, direction: nextDirection }
        : null,
    );

    if (!col.localSortable) {
      onSortChange?.(col.accessorKey, nextDirection);
    }
  };

  const getSortSymbol = (col: ColumnDef<T>) => {
    if (sortState?.columnKey !== col.accessorKey) return null;
    if (sortState?.direction === "asc")
      return <ChevronUp className="h-4 w-4" />;
    if (sortState?.direction === "desc")
      return <ChevronDown className="h-4 w-4" />;
    return null;
  };

  const totalPages = enablePagination ? Math.ceil(totalCount / pageSize) : 1;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    onPageChange?.(page);
  };

  const handleRowSelection = (row: T, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(row);
    } else {
      newSelected.delete(row);
    }

    if (onRowSelectionChange) {
      onRowSelectionChange(newSelected);
    } else {
      setInternalSelectedRows(newSelected);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected = new Set<T>();
    if (checked) {
      selectableData.forEach((row) => {
        newSelected.add(row);
      });
    }

    if (onRowSelectionChange) {
      onRowSelectionChange(newSelected);
    } else {
      setInternalSelectedRows(newSelected);
    }
  };

  const selectableData = isRowSelectable
    ? sortedData.filter((row) => isRowSelectable(row))
    : sortedData;

  const isAllSelected =
    selectableData.length > 0 &&
    selectableData.every((row) => selectedRows.has(row));

  const isSomeSelected =
    selectableData.some((row) => selectedRows.has(row)) && !isAllSelected;

  const frozenColHeaderRefs = React.useRef<(HTMLTableCellElement | null)[]>([]);
  const checkboxHeaderRef = React.useRef<HTMLTableCellElement | null>(null);
  const [frozenLeftOffsets, setFrozenLeftOffsets] = React.useState<number[]>(
    [],
  );

  React.useLayoutEffect(() => {
    if (!frozenColumns) {
      // Frozen columns need layout measurement before paint to keep sticky offsets aligned.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFrozenLeftOffsets([]);
      return;
    }

    let startLeft = 0;
    if (enableRowSelection && checkboxHeaderRef.current) {
      startLeft = checkboxHeaderRef.current.offsetWidth;
    }

    const offsets: number[] = [];
    let cumulative = startLeft;
    for (let i = 0; i < Math.min(frozenColumns, columns.length); i++) {
      offsets.push(cumulative);
      const cell = frozenColHeaderRefs.current[i];
      if (cell) cumulative += cell.offsetWidth;
    }
    setFrozenLeftOffsets(offsets);
  }, [frozenColumns, columns, enableRowSelection, sortedData]);

  const getFrozenCellStyle = (
    colIndex: number,
    baseStyle: React.CSSProperties = {},
  ): React.CSSProperties => {
    if (
      !frozenColumns ||
      colIndex >= frozenColumns ||
      frozenLeftOffsets[colIndex] === undefined
    )
      return baseStyle;
    return {
      ...baseStyle,
      position: "sticky",
      left: frozenLeftOffsets[colIndex],
      zIndex: 1,
      backgroundColor:
        (baseStyle as React.CSSProperties & { backgroundColor?: string })
          .backgroundColor ?? "var(--background)",
      ...(colIndex === frozenColumns - 1
        ? { boxShadow: "2px 0 4px rgba(0,0,0,0.08)" }
        : {}),
    };
  };

  return (
    <div
      className={cn("flex h-full flex-col overflow-hidden", className)}
      style={{
        opacity: loading || disabled ? 0.5 : 1,
        pointerEvents: disabled ? "none" : undefined,
      }}
    >
      <div className="flex-1 overflow-auto">
        <TableRoot style={{ tableLayout }} noWrapper className="min-w-max">
          <TableHeader className="bg-background sticky top-0 z-10">
            {groupedHeaders &&
              groupedHeaders.map((headerLevel, levelIndex) => {
                const totalSpan = headerLevel.reduce(
                  (sum, h) => sum + h.span,
                  0,
                );
                const blankColSpan = columns.length - totalSpan;

                return (
                  <TableRow key={levelIndex}>
                    {blankColSpan > 0 && (
                      <TableHead
                        colSpan={blankColSpan}
                        className="bg-muted/50"
                      />
                    )}
                    {headerLevel.map((header, index) => (
                      <Tooltip key={index} text={header.helpText}>
                        <TableHead
                          colSpan={header.span}
                          className="bg-muted/50 text-center"
                          style={header.style}
                        >
                          {header.title}
                        </TableHead>
                      </Tooltip>
                    ))}
                  </TableRow>
                );
              })}

            <TableRow>
              {enableRowSelection && (
                <TableHead
                  ref={checkboxHeaderRef}
                  className="p-0"
                  align="center"
                  style={{
                    width: "40px",
                    minWidth: "40px",
                    maxWidth: "40px",
                    ...(frozenColumns > 0
                      ? {
                          position: "sticky",
                          left: 0,
                          zIndex: 3,
                          backgroundColor: "var(--background)",
                        }
                      : {}),
                  }}
                >
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={
                        isAllSelected ||
                        (isSomeSelected ? "indeterminate" : false)
                      }
                      onCheckedChange={handleSelectAll}
                      aria-label="Selecionar todas"
                      disabled={disabled || selectableData.length === 0}
                    />
                  </div>
                </TableHead>
              )}
              {columns.map((col, i) => (
                <Tooltip key={i} text={col.headerDescription}>
                  <TableHead
                    ref={(el) => {
                      frozenColHeaderRefs.current[i] =
                        el as HTMLTableCellElement | null;
                    }}
                    className={cn(
                      "text-foreground relative text-[13px]",
                      col.sortable && "cursor-pointer select-none",
                    )}
                    style={
                      i < frozenColumns
                        ? {
                            ...col.headerStyle,
                            position: "sticky",
                            left: frozenLeftOffsets[i] ?? 0,
                            zIndex: 2,
                            backgroundColor: "var(--background)",
                            ...(i === frozenColumns - 1
                              ? { boxShadow: "2px 0 4px rgba(0,0,0,0.08)" }
                              : {}),
                          }
                        : col.headerStyle
                    }
                    onClick={() => handleHeaderClick(col)}
                  >
                    {col.header}
                    {getSortSymbol(col) && (
                      <span className="absolute inset-y-0 right-1 flex items-center">
                        {getSortSymbol(col)}
                      </span>
                    )}
                  </TableHead>
                </Tooltip>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                  className="h-24 text-center"
                >
                  <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
                    <Loader2Icon className="h-5 w-5 animate-spin" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length > 0 ? (
              sortedData.map((row, rowIndex) => {
                const trStyle = rowStyle?.(row, rowIndex);
                const isSelected = selectedRows.has(row);

                return (
                  <TableRow
                    key={rowIndex}
                    className={cn("text-sm", onRowClick && "cursor-pointer")}
                    style={trStyle}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    onDoubleClick={() => onRowDoubleClick?.(row, rowIndex)}
                    data-state={isSelected ? "selected" : undefined}
                  >
                    {enableRowSelection && (
                      <TableCell
                        className="px-0 py-1.5"
                        align="center"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: "40px",
                          minWidth: "40px",
                          maxWidth: "40px",
                          ...(frozenColumns > 0
                            ? {
                                position: "sticky",
                                left: 0,
                                zIndex: 1,
                                backgroundColor: "var(--background)",
                              }
                            : {}),
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) =>
                            handleRowSelection(row, !!checked)
                          }
                          aria-label="Selecionar linha"
                          disabled={
                            disabled ||
                            (isRowSelectable ? !isRowSelectable(row) : false)
                          }
                        />
                      </TableCell>
                    )}
                    {columns.map((col, colIndex) => {
                      const value = col.accessorKey
                        ? row[col.accessorKey as keyof T]
                        : undefined;
                      let rowSpan: number | null | undefined = undefined;
                      if (col.rowSpanFn) {
                        rowSpan = col.rowSpanFn({
                          value,
                          row,
                          rows: sortedData,
                          rowIndex,
                        });
                        if (rowSpan === 0) return null;
                      }

                      const extraCellStyle =
                        typeof col.cellStyle === "function"
                          ? col.cellStyle({
                              value,
                              row,
                              rows: data,
                              index: rowIndex,
                            })
                          : col.cellStyle || {};

                      let rawCellContent: React.ReactNode;

                      if (col.booleanIcon) {
                        if (value === null || value === undefined)
                          rawCellContent = (
                            <div className="flex justify-center">-</div>
                          );
                        else if (value)
                          rawCellContent = (
                            <div className="flex justify-center">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            </div>
                          );
                        else
                          rawCellContent = (
                            <div className="flex justify-center">
                              <XCircle className="h-4 w-4 text-red-500" />
                            </div>
                          );
                      } else if (col.cell) {
                        rawCellContent = col.cell({ value, row });
                      } else {
                        rawCellContent = value ? String(value) : "-";
                      }

                      const cellContent =
                        col.ellipsis && typeof rawCellContent === "string" ? (
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                            {rawCellContent}
                          </span>
                        ) : (
                          rawCellContent
                        );

                      return (
                        <TableCell
                          key={colIndex}
                          className={cn("text-muted-foreground py-1.5 text-[13px]")}
                          style={getFrozenCellStyle(colIndex, extraCellStyle)}
                          title={
                            typeof rawCellContent === "string"
                              ? rawCellContent
                              : undefined
                          }
                          {...(rowSpan && rowSpan > 1 ? { rowSpan } : {})}
                        >
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
      </div>

      {enablePagination && (totalCount > 0 || loading) && (
        <div className="flex items-center justify-between gap-4 border-t px-3 pt-3 pb-1">
          <div className="text-muted-foreground flex max-w-125 min-w-80 items-center gap-2 text-[13px]">
            <span>
              Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalCount)}{" "}
              a {Math.min(currentPage * pageSize, totalCount)} de {totalCount}{" "}
              resultados
            </span>
          </div>

          <Pagination className="justify-end">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    !loading &&
                    currentPage > 1 &&
                    handlePageChange(currentPage - 1)
                  }
                  className={cn(
                    "h-7 min-w-7 cursor-pointer px-2 text-xs",
                    (currentPage <= 1 || loading) &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>

              {getPageNumbers().map((page, index) => (
                <PaginationItem key={index}>
                  {page === "ellipsis" ? (
                    <PaginationEllipsis className="h-7 w-7" />
                  ) : (
                    <PaginationLink
                      onClick={() => !loading && handlePageChange(page)}
                      isActive={currentPage === page}
                      className={cn(
                        "h-7 w-7 cursor-pointer text-xs",
                        loading && "pointer-events-none opacity-50",
                      )}
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    !loading &&
                    currentPage < totalPages &&
                    handlePageChange(currentPage + 1)
                  }
                  className={cn(
                    "h-7 min-w-7 cursor-pointer px-2 text-xs",
                    (currentPage >= totalPages || loading) &&
                      "pointer-events-none opacity-50",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
