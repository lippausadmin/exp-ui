"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";

export type ModalAlertProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm(): Promise<void> | void;
  onCancel?(): Promise<void> | void;
};

export function ModalAlert({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  onCancel,
}: ModalAlertProps) {
  function handleConfirm() {
    onClose();
    onConfirm();
  }

  function handleCancel() {
    onClose();
    if (onCancel) {
      onCancel();
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="flex flex-col items-center">
          <div className="mb-3 rounded-full bg-primary/10 p-3">
            <AlertTriangleIcon size={24} className="text-primary" />
          </div>

          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-row items-center justify-center gap-3">
          <Button
            variant="main-outline"
            className="w-full rounded-full"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button
            variant="main"
            className="w-full rounded-full"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
