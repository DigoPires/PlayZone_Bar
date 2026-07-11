import { useState, useRef } from "react";
import { useListEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Loader2, Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { TiltCard } from "@/components/ui/animations";
import { ImageUpload } from "@/components/ui/image-upload";

const eventSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().optional(),
  date: z.string().min(1, "Data obrigatória"),
  endDate: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  price: z.coerce.number().optional(),
  capacity: z.coerce.number().optional(),
  location: z.string().optional(),
  featured: z.boolean().default(false),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function AdminEvents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data: events, isLoading } = useListEvents();
  
  // Ensure events is an array
  const eventsArray = Array.isArray(events) ? events : [];
  
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      featured: false,
      price: 0,
    },
  });

  const handleOpenNew = () => {
    setEditingId(null);
    form.reset({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      featured: false,
      price: 0,
    });
    setOpen(true);
  };

  const handleOpenEdit = (event: any) => {
    setEditingId(event.id);
    form.reset({
      title: event.title,
      description: event.description || "",
      date: event.date.substring(0, 16), // Format for datetime-local
      endDate: event.endDate ? event.endDate.substring(0, 16) : undefined,
      imageUrl: event.imageUrl || "",
      imagePublicId: event.imagePublicId || "",
      price: event.price || 0,
      capacity: event.capacity || undefined,
      location: event.location || "",
      featured: event.featured || false,
    });
    setOpen(true);
  };

  const onSubmit = (data: EventFormValues) => {
    // Format empty string to undefined for optional numbers
    const payload = {
      ...data,
      price: data.price === 0 ? undefined : data.price,
    };

    if (editingId) {
      updateEvent.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Evento atualizado" });
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            setOpen(false);
          }
        }
      );
    } else {
      createEvent.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Evento criado" });
            queryClient.invalidateQueries({ queryKey: ["/api/events"] });
            setOpen(false);
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteEvent.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Evento excluído" });
          queryClient.invalidateQueries({ queryKey: ["/api/events"] });
          setDeleteConfirmOpen(false);
          setDeleteId(null);
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Eventos</h1>
          <p className="text-muted-foreground">Gerencie torneios, festas e programações.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="neon" onClick={handleOpenNew}>
              <Plus className="mr-2 h-4 w-4" /> NOVO EVENTO
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editingId ? "Editar Evento" : "Criar Novo Evento"}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título do Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Campeonato de Valorant" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Início</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (0 para gratuito)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem de Capa</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={(url, publicId) => {
                            field.onChange(url);
                            if (publicId) {
                              form.setValue('imagePublicId', publicId);
                            }
                          }}
                          onRemove={() => {
                            field.onChange('');
                            form.setValue('imagePublicId', '');
                          }}
                          disabled={createEvent.isPending || updateEvent.isPending}
                          uploadEndpoint="/api/events/upload"
                          uploadFolder="playzone/campeonatos_test"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-white/10 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Destaque</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Exibir este evento no banner principal da página de eventos.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                    {(createEvent.isPending || updateEvent.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : eventsArray.length === 0 ? (
        <Card className="glass-card border-white/5 border-dashed bg-transparent p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold mb-1">Nenhum evento criado</h3>
            <p className="text-muted-foreground mb-4">Adicione torneios ou programações especiais.</p>
            <Button variant="outline" onClick={handleOpenNew}>Criar Primeiro Evento</Button>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {eventsArray.map((event) => (
            <Card key={event.id} className="glass-card border-white/5 overflow-hidden flex flex-col group">
              {event.imageUrl ? (
                <div className="h-40 w-full overflow-hidden relative">
                  <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  {event.featured && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-accent text-background text-xs font-bold rounded">
                      DESTAQUE
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-40 w-full bg-muted flex items-center justify-center border-b border-white/5 relative">
                  <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
                  {event.featured && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-accent text-background text-xs font-bold rounded">
                      DESTAQUE
                    </div>
                  )}
                </div>
              )}
              
              <CardContent className="p-5 flex-1">
                <h3 className="font-display font-bold text-lg mb-2 line-clamp-1">{event.title}</h3>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <p>{format(new Date(event.date), "dd/MM/yyyy HH:mm")}</p>
                  <p className="font-medium text-foreground">{event.price ? `R$ ${event.price}` : 'Gratuito'}</p>
                </div>
              </CardContent>
              
              <CardFooter className="p-4 pt-4 flex gap-2 border-t border-white/5 mt-auto">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEdit(event)}>
                  <Edit className="mr-2 h-3 w-3" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-none text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleDelete(event.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Evento"
        description="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
      />
    </div>
  );
}
