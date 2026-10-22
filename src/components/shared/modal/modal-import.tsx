"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  CheckCircle2Icon,
  CloudUploadIcon,
  EyeIcon,
  FileIcon,
  InfoIcon,
  XCircleIcon,
} from "lucide-react";
import Papa from "papaparse";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import * as Yup from "yup";
import { Table, type ColumnDef } from "../table";

export type ImportMode = "create" | "update" | "delete";

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

type LayoutTemplate = Record<string, string | number>[];

type ToastNotifier = {
  error: (message: string) => void;
};

type ImportedRow = Record<string, unknown>;

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export type ModalImportProps<
  TData extends ImportedRow = ImportedRow,
> = {
  isOpen: boolean;
  title?: string;
  onClose(): void;
  schemas: {
    create?: Yup.ObjectSchema<Yup.AnyObject>;
    update?: Yup.ObjectSchema<Yup.AnyObject>;
    delete?: Yup.ObjectSchema<Yup.AnyObject>;
  };
  layoutTemplates?: {
    create?: LayoutTemplate;
    update?: LayoutTemplate;
    delete?: LayoutTemplate;
  };
  fileName: string;
  onConfirm: (data: TData[], mode: ImportMode) => Promise<void>;
  acceptedFileTypes?: string;
  parseOptions?: {
    delimiter?: string;
    skipEmptyLines?: boolean;
    header?: boolean;
  };
  toast?: ToastNotifier;
  /** Delimitador do layout para download. Padrão: o de parseOptions, depois ";" */
  layoutDelimiter?: string;
};

export function ModalImport<TData extends ImportedRow = ImportedRow>({
  isOpen,
  onClose,
  title = "Importar arquivo",
  schemas,
  layoutTemplates,
  fileName = "importacao",
  onConfirm,
  acceptedFileTypes = ".csv,.xlsx",
  parseOptions = {
    delimiter: undefined,
    skipEmptyLines: true,
    header: true,
  },
  toast,
  layoutDelimiter,
}: ModalImportProps<TData>) {
  const notifyError = (message: string) => toast?.error(message);
  const [mode, setMode] = useState<ImportMode>("create");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [parsedData, setParsedData] = useState<TData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSchema = schemas?.[mode];

  const handleFileSelect = async (selectedFile: File) => {
    if (!currentSchema) {
      notifyError("Schema de validação não configurado para este modo");
      return;
    }

    setFile(selectedFile);
    setValidationErrors([]);
    setValidationSuccess(false);
    setParsedData([]);
    setColumnOrder([]);

    try {
      setIsProcessing(true);

      let text = await selectedFile.text();
      text = text.replace(/^\uFEFF/, "");

      if (!text.trim()) {
        throw new Error("Arquivo vazio");
      }

      const result = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: parseOptions.skipEmptyLines ?? true,
        delimiter: parseOptions.delimiter || undefined,
        transformHeader: (h) =>
          h
            .replace(/^\uFEFF/, "")
            .replace(/\r/g, "")
            .trim(),
      });

      const criticalErrors = result.errors.filter((e) => e.type !== "Delimiter");
      if (criticalErrors.length > 0) {
        const first = criticalErrors[0];
        throw new Error(`Erro ao processar CSV (linha ${(first.row ?? 0) + 1}): ${first.message}`);
      }

      const headers = (result.meta.fields || []).filter(Boolean);
      const rows: Record<string, string>[] = (result.data || []).map((row) => {
        const trimmed: Record<string, string> = {};
        for (const [k, v] of Object.entries(row)) {
          trimmed[k] = typeof v === "string" ? v.trim() : String(v ?? "").trim();
        }
        return trimmed;
      });

      const filteredRows = rows.filter((row) =>
        Object.values(row).some((v) => v !== ""),
      );

      if (filteredRows.length === 0) {
        throw new Error("Nenhuma linha de dados encontrada");
      }

      const errors: ValidationError[] = [];
      const validData: TData[] = [];

      for (let i = 0; i < filteredRows.length; i++) {
        try {
          const validatedRow = await currentSchema.validate(filteredRows[i], {
            abortEarly: false,
            stripUnknown: true,
          });
          validData.push(validatedRow as TData);
        } catch (error: unknown) {
          if (error instanceof Yup.ValidationError) {
            error.inner.forEach((err) => {
              errors.push({
                row: i + 2, // +2 porque linha 1 é header e index começa em 0
                field: err.path ?? "",
                message: err.message,
              });
            });
          } else {
            errors.push({
              row: i + 2,
              field: "",
              message: getErrorMessage(error, "Linha inválida"),
            });
          }
        }
      }

      // Preserva a ordem original das colunas do CSV, filtrando apenas as que existem no schema
      if (validData.length > 0) {
        const schemaKeys = Object.keys(validData[0]);
        const orderedHeaders = headers.filter((header) => schemaKeys.includes(header));
        setColumnOrder(orderedHeaders);
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
        notifyError(`Foram encontrados ${errors.length} erro(s) no arquivo`);
      } else {
        setValidationSuccess(true);
        setParsedData(validData);
      }
    } catch (error: unknown) {
      notifyError(getErrorMessage(error, "Erro ao processar arquivo"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleConfirm = async () => {
    if (!file || validationErrors.length > 0 || parsedData.length === 0) {
      notifyError("Por favor, selecione um arquivo válido");
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirm(parsedData, mode);
      handleClose();
    } catch (error: unknown) {
      notifyError(getErrorMessage(error, "Não foi possível concluir a importação"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationErrors([]);
    setValidationSuccess(false);
    setParsedData([]);
    setColumnOrder([]);
    setMode("create");
    onClose();
  };

  const handleClickUploadArea = () => {
    fileInputRef.current?.click();
  };

  const handleModeChange = (newMode: ImportMode) => {
    setMode(newMode);
    setFile(null);
    setValidationErrors([]);
    setValidationSuccess(false);
    setParsedData([]);
    setColumnOrder([]);
  };

  const handleDownloadLayout = () => {
    const template = layoutTemplates?.[mode];

    if (!template || template.length === 0) {
      notifyError("Layout não disponível para este modo");
      return;
    }

    try {
      const titleKeys = Object.keys(template[0]);
      const refinedData = [];

      refinedData.push(titleKeys);
      template.forEach((row) => refinedData.push(Object.values(row)));

      let csvContent = "";
      refinedData.forEach((row) => {
        csvContent += row.join(layoutDelimiter || parseOptions.delimiter || ";") + "\n";
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const objUrl = URL.createObjectURL(blob);

      const modeMap = {
        create: "cadastro",
        update: "atualizacao",
        delete: "exclusao",
      };

      const link = document.createElement("a");
      link.setAttribute("href", objUrl);
      link.setAttribute("download", `layout_${fileName}_${modeMap[mode]}.csv`);
      link.click();

      URL.revokeObjectURL(objUrl);
    } catch {
      notifyError("Erro ao baixar layout");
    }
  };

  const hasLayout = layoutTemplates && !!layoutTemplates[mode];

  const tableColumns =
    parsedData.length > 0 && columnOrder.length > 0
      ? columnOrder.map<ColumnDef<TData>>((key) => ({
          accessorKey: key,
          header: key,
          localSortable: true,
          sortable: true,
          cell: ({ value }) =>
            value !== null && value !== undefined ? String(value) : "-",
        }))
      : [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader className="flex flex-col items-center">
            <div className="mb-3 rounded-full bg-primary/10 p-2">
              <InfoIcon className="text-primary" />
            </div>

            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>Escolha a forma de importação de arquivo</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex justify-center">
              <RadioGroup
                className="flex w-fit gap-3"
                value={mode}
                onValueChange={(value) => handleModeChange(value as ImportMode)}
                disabled={isProcessing}
              >
                {schemas?.create && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="create" id="create" />
                    <Label htmlFor="create" className="text-foreground cursor-pointer text-[15px] font-medium">
                      Cadastro
                    </Label>
                  </div>
                )}

                {schemas?.update && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="update" id="update" />
                    <Label htmlFor="update" className="text-foreground cursor-pointer text-[15px] font-medium">
                      Atualização
                    </Label>
                  </div>
                )}

                {schemas?.delete && (
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="delete" id="delete" />
                    <Label htmlFor="delete" className="text-foreground cursor-pointer text-[15px] font-medium">
                      Exclusão
                    </Label>
                  </div>
                )}
              </RadioGroup>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes}
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isProcessing}
            />

            <div
              className={cn(
                "flex min-h-37.5 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 transition-colors",
                isDragging ? "border-primary bg-primary/10" : "border-border",
                isProcessing && "cursor-not-allowed opacity-50",
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleClickUploadArea}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileIcon size={32} className="text-primary" />
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">{(file.size / 1024).toFixed(2)} KB</p>

                  {validationSuccess && (
                    <div className="mt-2 flex items-center gap-2 text-primary">
                      <CheckCircle2Icon size={20} />
                      <span className="text-sm font-medium">Arquivo validado com sucesso!</span>
                    </div>
                  )}

                  {validationSuccess && parsedData.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPreviewOpen(true);
                      }}
                    >
                      <EyeIcon className="mr-2 h-4 w-4" />
                      Visualizar Dados ({parsedData.length})
                    </Button>
                  )}

                  {validationErrors.length > 0 && (
                    <div className="text-destructive mt-2 flex items-center gap-2">
                      <XCircleIcon size={20} />
                      <span className="text-sm font-medium">{validationErrors.length} erro(s) encontrado(s)</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground flex items-center gap-2">
                  <CloudUploadIcon size={18} /> Arraste um item ou clique aqui para importar
                </p>
              )}

              {isProcessing && <p className="text-muted-foreground mt-2 text-sm">Processando arquivo...</p>}
            </div>

            {validationErrors.length > 0 && (
              <div className="border-destructive/30 bg-destructive/10 max-h-40 overflow-y-auto rounded-md border p-3">
                <p className="text-destructive mb-2 text-sm font-semibold">Erros de validação:</p>
                <ul className="space-y-1 text-xs">
                  {validationErrors.slice(0, 10).map((error, index) => (
                    <li key={index} className="text-destructive">
                      Linha {error.row}
                      {error.field ? <>, Campo &quot;{error.field}&quot;</> : null}:{" "}
                      {error.message}
                    </li>
                  ))}
                  {validationErrors.length > 10 && (
                    <li className="text-destructive">... e mais {validationErrors.length - 10} erro(s)</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between">
            {hasLayout && (
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={handleDownloadLayout}
                disabled={isProcessing}
              >
                Layout
              </Button>
            )}

            <div className={cn('flex gap-2', !hasLayout && 'ml-auto')}>
              <DialogClose asChild>
                <Button variant="secondary-outline" className="rounded-full" disabled={isProcessing}>
                  Cancelar
                </Button>
              </DialogClose>

              <Button
                variant="main"
                className="rounded-full"
                onClick={handleConfirm}
                disabled={isProcessing || !file || validationErrors.length > 0 || parsedData.length === 0}
              >
                {isProcessing ? 'Processando...' : 'Confirmar'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-6xl">
          <DialogHeader>
            <DialogTitle>Visualização dos Dados</DialogTitle>
            <DialogDescription>Prévia de {parsedData.length} registro(s) que serão importados</DialogDescription>
          </DialogHeader>

          <div className="h-[60vh] overflow-auto">
            <Table columns={tableColumns} data={parsedData} enablePagination={false} tableLayout="auto" />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary-outline" className="rounded-full">
                Fechar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
