import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export default function DeleteConfirmation({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Confirmar Exclusão",
  description = "Essa ação não pode ser desfeita. O registro será removido permanentemente da base de dados.",
  isLoading = false
}: DeleteConfirmationProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] border-slate-200 rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-sm font-bold uppercase tracking-wide text-slate-800">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 flex flex-row gap-2 sm:justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            className="flex-1 sm:flex-none h-9 text-xs font-bold" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 h-9 text-xs font-bold px-6"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Excluindo..." : "Excluir Agora"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
