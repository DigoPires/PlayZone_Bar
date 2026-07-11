import { useState } from "react";
import { useListCoupons, useCreateCoupon, useDeleteCoupon, useUpdateCoupon } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminCoupons() {
  const { data: coupons = [], refetch } = useListCoupons();
  
  // Ensure coupons is an array
  const couponsArray = Array.isArray(coupons) ? coupons : [];
  
  const { mutateAsync: createCoupon } = useCreateCoupon();
  const { mutateAsync: deleteCoupon } = useDeleteCoupon();
  const { mutateAsync: updateCoupon } = useUpdateCoupon();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    code: "",
    discountType: "percent" as "percent" | "fixed",
    discountValue: "",
    validUntil: "",
    maxUses: "",
  });

  async function handleCreate() {
    try {
      await createCoupon({
        data: {
          code: form.code,
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          validUntil: form.validUntil || undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          active: true,
        },
      });
      toast({ title: "Cupom criado com sucesso!" });
      setOpen(false);
      setForm({ code: "", discountType: "percent", discountValue: "", validUntil: "", maxUses: "" });
      refetch();
    } catch {
      toast({ title: "Erro ao criar cupom", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteCoupon({ id: deleteId });
      toast({ title: "Cupom removido" });
      refetch();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch {
      toast({ title: "Erro ao remover cupom", variant: "destructive" });
    }
  }

  async function handleToggle(id: number, active: boolean) {
    try {
      await updateCoupon({ id, data: { active: !active } });
      refetch();
    } catch {
      toast({ title: "Erro ao atualizar cupom", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Cupons</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie cupons de desconto</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="neon">
              <Plus className="h-4 w-4 mr-2" /> Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>Criar Cupom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Código do Cupom</Label>
                <Input className="mt-1 uppercase" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="PROMO10" />
              </div>
              <div>
                <Label>Tipo de desconto</Label>
                <Select value={form.discountType} onValueChange={(v: "percent" | "fixed") => setForm(f => ({ ...f, discountType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor do desconto</Label>
                <Input className="mt-1" type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder="10" />
              </div>
              <div>
                <Label>Válido até (opcional)</Label>
                <Input className="mt-1" type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} />
              </div>
              <div>
                <Label>Limite de reservas (opcional)</Label>
                <Input className="mt-1" type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Sem limite" />
              </div>
              <Button onClick={handleCreate} className="w-full" variant="neon">Criar Cupom</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {couponsArray.length === 0 && (
          <Card className="glass-card border-white/5">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum cupom cadastrado</p>
            </CardContent>
          </Card>
        )}
        {couponsArray.map(coupon => (
          <Card key={coupon.id} className="glass-card border-white/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary">{coupon.code}</span>
                    <Badge variant={coupon.active ? "default" : "secondary"}>
                      {coupon.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coupon.discountType === "percent" ? `${coupon.discountValue}% de desconto` : `R$ ${coupon.discountValue} de desconto`}
                    {" · "}{coupon.uses} usos{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => handleToggle(coupon.id, coupon.active)}>
                  {coupon.active ? "Desativar" : "Ativar"}
                </Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(coupon.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Cupom"
        description="Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
      />
    </div>
  );
}
