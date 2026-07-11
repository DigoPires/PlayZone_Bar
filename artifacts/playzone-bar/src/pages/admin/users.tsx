import { useState } from "react";
import { useListUsers, useCreateUser, useDeleteUser } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, User, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function AdminUsers() {
  const { data: users = [], refetch } = useListUsers();
  
  // Ensure users is an array
  const usersArray = Array.isArray(users) ? users : [];
  
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ username: "", name: "", password: "", role: "admin" as "admin" });

  async function handleCreate() {
    try {
      await createUser({ data: { username: form.username, name: form.name, password: form.password, role: form.role } });
      toast({ title: "Usuário criado com sucesso!" });
      setOpen(false);
      setForm({ username: "", name: "", password: "", role: "admin" });
      refetch();
    } catch {
      toast({ title: "Erro ao criar usuário", variant: "destructive" });
    }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      await deleteUser({ id: deleteId });
      toast({ title: "Usuário removido" });
      refetch();
      setDeleteConfirmOpen(false);
      setDeleteId(null);
    } catch {
      toast({ title: "Erro ao remover usuário", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie acessos ao painel administrativo</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="neon"><Plus className="h-4 w-4 mr-2" /> Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>Criar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nome</Label>
                <Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Username</Label>
                <Input className="mt-1" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>
              <div>
                <Label>Senha</Label>
                <Input className="mt-1" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
              <Button onClick={handleCreate} className="w-full" variant="neon">Criar Usuário</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {usersArray.length === 0 && (
          <Card className="glass-card border-white/5">
            <CardContent className="py-12 text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhum usuário cadastrado</p>
            </CardContent>
          </Card>
        )}
        {usersArray.map(user => (
          <Card key={user.id} className="glass-card border-white/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.role === "admin" ? <ShieldCheck className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{user.username}</span>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(user.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Usuário"
        description="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
      />
    </div>
  );
}
