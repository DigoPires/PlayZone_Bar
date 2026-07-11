import { useState } from "react";
import { useListAvailabilityPatterns, useCreateAvailabilityPattern, useDeleteAvailabilityPattern, useUpdateAvailabilityPattern } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Clock, Edit, CalendarX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Generate time slots every 30 minutes from 18:00 to 02:00
function generateTimeSlots() {
  const slots: string[] = [];
  for (let hour = 18; hour <= 23; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  slots.push("00:00");
  slots.push("00:30");
  slots.push("01:00");
  slots.push("01:30");
  slots.push("02:00");
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

export default function AdminAvailability() {
  const { data: patterns = [], refetch } = useListAvailabilityPatterns();
  
  // Ensure patterns is an array
  const patternsArray = Array.isArray(patterns) ? patterns : [];
  
  const { mutateAsync: createPattern } = useCreateAvailabilityPattern();
  const { mutateAsync: deletePattern } = useDeleteAvailabilityPattern();
  const { mutateAsync: updatePattern } = useUpdateAvailabilityPattern();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("patterns");
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [exceptionForm, setExceptionForm] = useState({
    date: "",
    type: "salao" as "salao" | "gamer",
    selectedSlots: [] as string[],
    closed: false,
  });
  const [form, setForm] = useState({
    dayOfWeek: "2",
    type: "salao" as "salao" | "gamer",
    selectedSlots: [] as string[],
  });

  async function handleCreate() {
    try {
      if (editingId) {
        await updatePattern({
          id: editingId,
          data: {
            dayOfWeek: Number(form.dayOfWeek),
            type: form.type,
            slots: form.selectedSlots,
          },
        });
        toast({ title: "Padrão atualizado com sucesso!" });
      } else {
        await createPattern({
          data: {
            dayOfWeek: Number(form.dayOfWeek),
            type: form.type,
            slots: form.selectedSlots,
            active: true,
          },
        });
        toast({ title: "Padrão criado com sucesso!" });
      }
      setOpen(false);
      setEditingId(null);
      setForm({ dayOfWeek: "2", type: "salao", selectedSlots: [] });
      refetch();
    } catch {
      toast({ title: "Erro ao salvar padrão", variant: "destructive" });
    }
  }

  function handleEdit(pattern: any) {
    setEditingId(pattern.id);
    setForm({
      dayOfWeek: String(pattern.dayOfWeek),
      type: pattern.type,
      selectedSlots: pattern.slots ?? [],
    });
    setOpen(true);
  }

  function handleOpenDialog() {
    setEditingId(null);
    setForm({ dayOfWeek: "2", type: "salao", selectedSlots: [] });
    setOpen(true);
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deletePattern({ id: deleteId });
      toast({ title: "Padrão removido" });
      refetch();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch {
      toast({ title: "Erro ao remover padrão", variant: "destructive" });
    }
  }

  async function handleCreateException() {
    try {
      // Store exceptions in localStorage for now (would be backend in production)
      const exceptions = JSON.parse(localStorage.getItem('availabilityExceptions') || '[]');
      const newException = {
        id: Date.now(),
        date: exceptionForm.date,
        type: exceptionForm.type,
        slots: exceptionForm.closed ? [] : exceptionForm.selectedSlots,
        closed: exceptionForm.closed,
      };
      exceptions.push(newException);
      localStorage.setItem('availabilityExceptions', JSON.stringify(exceptions));
      toast({ title: "Exceção criada com sucesso!" });
      setExceptionOpen(false);
      setExceptionForm({ date: "", type: "salao", selectedSlots: [], closed: false });
    } catch {
      toast({ title: "Erro ao criar exceção", variant: "destructive" });
    }
  }

  async function handleDeleteException(id: number) {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }

  async function confirmDeleteException() {
    if (!deleteId) return;
    try {
      const exceptions = JSON.parse(localStorage.getItem('availabilityExceptions') || '[]');
      const filtered = exceptions.filter((e: any) => e.id !== deleteId);
      localStorage.setItem('availabilityExceptions', JSON.stringify(filtered));
      toast({ title: "Exceção removida" });
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch {
      toast({ title: "Erro ao remover exceção", variant: "destructive" });
    }
  }

  const exceptions = JSON.parse(localStorage.getItem('availabilityExceptions') || '[]');

  async function handleToggle(id: number, active: boolean) {
    await updatePattern({ id, data: { active: !active } });
    refetch();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Disponibilidade</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure horários disponíveis para reservas</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-white/5">
          <TabsTrigger value="patterns">Padrões Semanais</TabsTrigger>
          <TabsTrigger value="exceptions">Exceções de Data</TabsTrigger>
        </TabsList>

        <TabsContent value="patterns" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="neon" onClick={handleOpenDialog}><Plus className="h-4 w-4 mr-2" /> Novo Padrão</Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Editar Padrão de Disponibilidade" : "Criar Padrão de Disponibilidade"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Dia da semana</Label>
                    <Select value={form.dayOfWeek} onValueChange={v => setForm(f => ({ ...f, dayOfWeek: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ambiente</Label>
                    <Select value={form.type} onValueChange={(v: "salao" | "gamer") => setForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salao">Salão</SelectItem>
                        <SelectItem value="gamer">Arena Gamer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Horários disponíveis (selecione os horários que ficarão disponíveis)</Label>
                    <div className="mt-2 grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-background/50">
                      {TIME_SLOTS.map((time) => (
                        <label key={time} className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={form.selectedSlots.includes(time)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm(f => ({ ...f, selectedSlots: [...f.selectedSlots, time].sort() }));
                              } else {
                                setForm(f => ({ ...f, selectedSlots: f.selectedSlots.filter(t => t !== time) }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{time}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleCreate} className="w-full" variant="neon">{editingId ? "Atualizar" : "Criar"} Padrão</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {patternsArray.length === 0 && (
              <Card className="glass-card border-white/5">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhum padrão de disponibilidade configurado</p>
                </CardContent>
              </Card>
            )}
            {patternsArray.map(p => (
              <Card key={p.id} className="glass-card border-white/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{DAYS[p.dayOfWeek]} — {p.type === "salao" ? "Salão" : "Arena Gamer"}</span>
                        <Badge variant={p.active ? "default" : "secondary"}>{p.active ? "Ativo" : "Inativo"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{(p.slots ?? []).join(", ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleToggle(p.id, p.active ?? false)}>
                      {p.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={exceptionOpen} onOpenChange={setExceptionOpen}>
              <DialogTrigger asChild>
                <Button variant="neon"><Plus className="h-4 w-4 mr-2" /> Nova Exceção</Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-white/10">
                <DialogHeader>
                  <DialogTitle>Criar Exceção de Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Data</Label>
                    <Input 
                      type="date" 
                      className="mt-1" 
                      value={exceptionForm.date} 
                      onChange={e => setExceptionForm(f => ({ ...f, date: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label>Ambiente</Label>
                    <Select value={exceptionForm.type} onValueChange={(v: "salao" | "gamer") => setExceptionForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salao">Salão</SelectItem>
                        <SelectItem value="gamer">Arena Gamer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="closed" 
                      checked={exceptionForm.closed}
                      onChange={e => setExceptionForm(f => ({ ...f, closed: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="closed">Fechado neste dia</Label>
                  </div>
                  {!exceptionForm.closed && (
                    <div>
                      <Label>Horários disponíveis (selecione os horários que ficarão disponíveis)</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-background/50">
                        {TIME_SLOTS.map((time) => (
                          <label key={time} className="flex items-center gap-2 p-2 rounded hover:bg-primary/10 cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={exceptionForm.selectedSlots.includes(time)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExceptionForm(f => ({ ...f, selectedSlots: [...f.selectedSlots, time].sort() }));
                                } else {
                                  setExceptionForm(f => ({ ...f, selectedSlots: f.selectedSlots.filter(t => t !== time) }));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{time}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button onClick={handleCreateException} className="w-full" variant="neon">Criar Exceção</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {exceptions.length === 0 && (
              <Card className="glass-card border-white/5">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <CalendarX className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>Nenhuma exceção de data configurada</p>
                </CardContent>
              </Card>
            )}
            {exceptions.map((e: any) => (
              <Card key={e.id} className="glass-card border-white/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CalendarX className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{format(new Date(e.date), "dd/MM/yyyy", { locale: ptBR })} — {e.type === "salao" ? "Salão" : "Arena Gamer"}</span>
                        {e.closed && <Badge variant="destructive">Fechado</Badge>}
                      </div>
                      {!e.closed && (
                        <p className="text-sm text-muted-foreground">{e.slots.join(", ")}</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteException(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Item"
        description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
        onConfirm={activeTab === "patterns" ? confirmDelete : confirmDeleteException}
        confirmText="Excluir"
      />
    </div>
  );
}
