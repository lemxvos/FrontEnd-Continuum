import { useState } from "react";
import { format } from "date-fns";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProgressModalProps {
  open: boolean;
  onClose: () => void;
  entityId: string;
  entityName: string;
  unit?: string;
  onSuccess?: () => void;
}

export default function ProgressModal({ open, onClose, entityId, entityName, unit, onSuccess }: ProgressModalProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [value, setValue] = useState("1");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.post(`/api/entities/${entityId}/track`, {
        date,
        value: Number(value),
        note: note.trim() || undefined,
      });
      toast.success("Progresso registrado!");
      onSuccess?.();
      onClose();
      setNote("");
      setValue("1");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erro ao registrar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar — {entityName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Valor {unit ? `(${unit})` : ""}</Label>
            <Input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nota (opcional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Como foi?" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
