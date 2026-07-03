import { Modal } from "./Modal";
import { SubmitButton } from "./SubmitButton";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, description }: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-slate-600 text-sm">{description}</p>
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <form action={onConfirm}>
            <SubmitButton label="Oui, supprimer" />
          </form>
        </div>
      </div>
    </Modal>
  );
}
