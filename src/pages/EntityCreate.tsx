import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import UpgradeModal from "@/components/UpgradeModal";

const entityTypes = [
  { value: "PERSON", label: "Pessoa" },
  { value: "HABIT", label: "Hábito" },
  { value: "PROJECT", label: "Projeto" },
  { value: "GOAL", label: "Objetivo" },
  { value: "DREAM", label: "Sonho" },
  { value: "CUSTOM", label: "Custom" },
];

const trackableTypes = ["HABIT", "PROJECT", "GOAL", "CUSTOM"];

export default function EntityCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetType = searchParams.get("type") || "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState(presetType || "HABIT");
  const [trackingEnabled, setTrackingEnabled] = useState(type === "HABIT");
  const [frequency, setFrequency] = useState("DAILY");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const canTrack = trackableTypes.includes(type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const body: any = {
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        metadata: {},
      };
      if (canTrack && trackingEnabled) {
        body.tracking = {
          enabled: true,
          frequency,
          unit: unit.trim() || undefined,
          targetValue: targetValue ? Number(targetValue) : undefined,
        };
      }
      const { data } = await api.post("/api/entities", body);
      toast.success("Entidade criada!");
      navigate(`/entities/${data.id}`);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.toLowerCase().includes("limit")) {
        setUpgradeOpen(true);
      } else {
        toast.error(err.response?.data?.message || "Erro ao criar");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-xl font-bold">Nova Entidade</h2>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="surface rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Meditação, Maria, Continuum..." required />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Meditar 10 minutos por dia para reduzir ansiedade..." rows={2} />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => { setType(v); if (v === "HABIT") setTrackingEnabled(true); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {canTrack && (
            <>
              <div className="flex items-center justify-between">
                <Label>Habilitar tracking</Label>
                <Switch checked={trackingEnabled} onCheckedChange={setTrackingEnabled} />
              </div>

              {trackingEnabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 pl-1 border-l-2 border-primary/20 ml-1">
                  <div className="space-y-2 pl-4">
                    <Label>Frequência</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Diário</SelectItem>
                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                        <SelectItem value="MONTHLY">Mensal</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 pl-4">
                    <Label>Unidade (opcional)</Label>
                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="minutos, páginas, km..." />
                  </div>
                  <div className="space-y-2 pl-4">
                    <Label>Meta (opcional)</Label>
                    <Input type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} placeholder="10" min="0" />
                  </div>
                </motion.div>
              )}
            </>
          )}

          <Button type="submit" className="w-full" disabled={saving || !name.trim()}>
            {saving && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
            Criar entidade
          </Button>
        </form>
      </motion.div>

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  );
}
