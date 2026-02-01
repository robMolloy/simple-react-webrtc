import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalStore } from "./modalStore";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export const Modal = () => {
  const modalStore = useModalStore();

  return (
    <Dialog
      open={!!modalStore.data}
      onOpenChange={() => modalStore.setData(null)}
    >
      {modalStore.data}
    </Dialog>
  );
};

export const ModalContent = (p: {
  title: string;
  description: string;
  content?: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{p.title}</DialogTitle>
        <DialogDescription>{p.description}</DialogDescription>
      </DialogHeader>
      {p.content}
      {p.footer && <DialogFooter>{p.footer}</DialogFooter>}
    </DialogContent>
  );
};

export const ConfirmationModalContent = (p: {
  title: string;
  description: string;
  onConfirm: () => void;
}) => {
  const modalStore = useModalStore();

  return (
    <ModalContent
      title={p.title}
      description={p.description}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="destructive" onClick={() => modalStore.close()}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              await p.onConfirm();
              modalStore.close();
            }}
          >
            Confirm
          </Button>
        </div>
      }
    />
  );
};
