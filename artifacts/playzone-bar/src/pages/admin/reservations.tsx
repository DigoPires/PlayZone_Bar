import { useState } from "react";
import { 
  useListReservations, 
  useUpdateReservation, 
  useDeleteReservation,
  useCheckInReservation
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Search, Filter, MoreHorizontal, QrCode, CheckCircle, XCircle, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function AdminReservations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data: reservationList, isLoading } = useListReservations({
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    type: typeFilter !== "all" ? typeFilter as any : undefined,
    limit: 50
  });

  // Ensure reservations data is an array
  const reservations = Array.isArray(reservationList?.reservations) ? reservationList.reservations : [];

  const updateReservation = useUpdateReservation();
  const deleteReservation = useDeleteReservation();
  const checkInReservation = useCheckInReservation();

  const handleStatusChange = (id: number, status: string) => {
    updateReservation.mutate({ id, data: { status: status as any } }, {
      onSuccess: () => {
        toast({ title: "Status atualizado" });
        queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      }
    });
  };

  const handleCheckIn = (id: number) => {
    checkInReservation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Check-in realizado com sucesso" });
        queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      }
    });
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteReservation.mutate({ id: deleteId }, {
      onSuccess: () => {
        toast({ title: "Reserva excluída" });
        queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
        setDeleteConfirmOpen(false);
        setDeleteId(null);
      },
      onError: () => {
        toast({ title: "Erro ao excluir reserva", variant: "destructive" });
      }
    });
  };

  const statusMap: Record<string, { label: string, color: string }> = {
    pending: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
    confirmed: { label: "Confirmada", color: "bg-primary/20 text-primary border-primary/30" },
    checkin: { label: "Check-in", color: "bg-accent/20 text-accent border-accent/30" },
    completed: { label: "Concluída", color: "bg-muted text-muted-foreground border-white/10" },
    cancelled: { label: "Cancelada", color: "bg-destructive/20 text-destructive border-destructive/30" }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Gestão de Reservas</h1>
          <p className="text-muted-foreground">Controle de mesas e acessos à arena.</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/5">
        <CardContent className="p-4 flex flex-wrap gap-4">
          <div className="w-full md:w-64">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="checkin">Check-in</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-64">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-background/50 border-white/10">
                <SelectValue placeholder="Ambiente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Ambientes</SelectItem>
                <SelectItem value="salao">Salão (Mesas/Bar)</SelectItem>
                <SelectItem value="gamer">Arena Gamer (PCs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !reservationList?.reservations?.length ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Nenhuma reserva encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/50 border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium text-muted-foreground">Cliente</th>
                  <th className="p-4 font-medium text-muted-foreground">Data/Hora</th>
                  <th className="p-4 font-medium text-muted-foreground">Ambiente</th>
                  <th className="p-4 font-medium text-muted-foreground">Pessoas</th>
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-muted-foreground text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold">{res.name}</div>
                      <div className="text-xs text-muted-foreground">{res.phone}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{format(new Date(res.date), "dd/MM/yyyy")}</div>
                      <div className="text-xs text-muted-foreground">{res.time}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${res.type === 'gamer' ? 'text-secondary bg-secondary/10 border border-secondary/20' : 'text-primary bg-primary/10 border border-primary/20'}
                      `}>
                        {res.type}
                      </span>
                    </td>
                    <td className="p-4">{res.people}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusMap[res.status].color}`}>
                        {statusMap[res.status].label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-white/10">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-white/10" />
                          
                          {res.status === 'confirmed' && (
                            <DropdownMenuItem onClick={() => handleCheckIn(res.id)} className="text-accent font-medium focus:text-accent focus:bg-accent/10">
                              <CheckCircle className="mr-2 h-4 w-4" /> Realizar Check-in
                            </DropdownMenuItem>
                          )}
                          
                          {res.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'confirmed')} className="text-primary font-medium focus:text-primary focus:bg-primary/10">
                              <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Reserva
                            </DropdownMenuItem>
                          )}
                          
                          {(res.status === 'pending' || res.status === 'confirmed') && (
                            <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'cancelled')} className="text-destructive font-medium focus:text-destructive focus:bg-destructive/10">
                              <XCircle className="mr-2 h-4 w-4" /> Cancelar Reserva
                            </DropdownMenuItem>
                          )}
                          
                          {res.status === 'checkin' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(res.id, 'completed')}>
                              <Clock className="mr-2 h-4 w-4" /> Finalizar (Checkout)
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem onClick={() => handleDelete(res.id)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                            Excluir Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Reserva"
        description="Tem certeza que deseja excluir esta reserva? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
      />
    </div>
  );
}
