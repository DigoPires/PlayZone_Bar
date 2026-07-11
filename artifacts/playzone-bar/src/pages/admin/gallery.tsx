import { useState } from "react";
import { useListGallery, useCreateGalleryImage, useDeleteGalleryImage, useUpdateGalleryImage } from "@workspace/api-client-react";
import { Loader2, Plus, Trash2, Image as ImageIcon, Edit } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import { ImageUpload } from "@/components/ui/image-upload";

const imageSchema = z.object({
  url: z.string().optional(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
  active: z.boolean().default(true),
});

export default function AdminGallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  const { data: images, isLoading } = useListGallery();
  
  // Ensure images is an array and limit to 30
  const imagesArray = Array.isArray(images) ? images.slice(0, 30) : [];
  
  const createImage = useCreateGalleryImage();
  const updateImage = useUpdateGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const form = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      url: "",
      publicId: "",
      alt: "",
      active: true,
    },
  });

  const editForm = useForm<z.infer<typeof imageSchema>>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      url: "",
      publicId: "",
      alt: "",
      active: true,
    },
  });

  const onSubmit = (data: z.infer<typeof imageSchema>) => {
    if (!data.url) {
      toast({ title: "Por favor, faça upload de uma imagem", variant: "destructive" });
      return;
    }

    // Check if limit reached
    if (imagesArray.length >= 30) {
      toast({ title: "Limite de 30 imagens atingido", variant: "destructive" });
      return;
    }

    const payload = {
      url: data.url,
      publicId: data.publicId || `img_${Date.now()}`,
      alt: data.alt,
      active: data.active,
      order: (images?.length || 0) * 10
    };

    createImage.mutate(
      { data: payload },
      {
        onSuccess: () => {
          toast({ title: "Imagem adicionada à galeria" });
          queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
          setOpen(false);
          form.reset();
        }
      }
    );
  };

  const handleEdit = (img: any) => {
    setEditingImage(img);
    editForm.reset({
      url: img.url,
      publicId: img.publicId,
      alt: img.alt || "",
      active: img.active,
    });
    setEditOpen(true);
  };

  const onEditSubmit = (data: z.infer<typeof imageSchema>) => {
    updateImage.mutate(
      { id: editingImage.id, data: { alt: data.alt, active: data.active } },
      {
        onSuccess: () => {
          toast({ title: "Imagem atualizada" });
          queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
          setEditOpen(false);
          setEditingImage(null);
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteImage.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          toast({ title: "Imagem excluída" });
          queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
          setDeleteConfirmOpen(false);
          setDeleteId(null);
        }
      }
    );
  };

  const toggleActive = (id: number, current: boolean) => {
    updateImage.mutate(
      { id, data: { active: !current } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Galeria</h1>
          <p className="text-muted-foreground">Gerencie as fotos exibidas no site público. Limite: 30 imagens ({imagesArray.length}/30)</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="neon" disabled={imagesArray.length >= 30}>
              <Plus className="mr-2 h-4 w-4" /> ADICIONAR IMAGEM
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display">Adicionar Foto à Galeria</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={(url, publicId) => {
                            field.onChange(url);
                            if (publicId) {
                              form.setValue('publicId', publicId);
                            }
                          }}
                          onRemove={() => {
                            field.onChange('');
                            form.setValue('publicId', '');
                          }}
                          disabled={createImage.isPending}
                          uploadEndpoint="/api/gallery/upload"
                          uploadFolder="playzone/galeria_test"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="alt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Acessibilidade)</FormLabel>
                      <FormControl>
                        <Input placeholder="Descreva a imagem..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createImage.isPending}>
                    {createImage.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Adicionar
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
      ) : imagesArray.length === 0 ? (
        <Card className="glass-card border-white/5 border-dashed bg-transparent p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-bold mb-1">Nenhuma imagem na galeria</h3>
            <p className="text-muted-foreground mb-4">Faça upload de fotos para mostrar a vibe do bar.</p>
            <Button variant="outline" onClick={() => setOpen(true)}>Adicionar Imagem</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {imagesArray.map((img) => (
            <div key={img.id} className={`group relative rounded-xl overflow-hidden border transition-all ${img.active ? 'border-white/10 hover:border-primary/50' : 'border-destructive/30 opacity-60 grayscale-[0.5]'}`}>
              <div className="aspect-square">
                <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
              </div>
              
              <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-3">
                <div className="flex items-center gap-2 bg-card/90 px-3 py-1.5 rounded-full border border-white/10">
                  <span className="text-xs font-medium">{img.active ? "Exibindo" : "Oculta"}</span>
                  <Switch 
                    checked={img.active} 
                    onCheckedChange={() => toggleActive(img.id, img.active)}
                    className="scale-75"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(img)} className="h-7 shadow-lg">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(img.id)} className="h-7 shadow-lg">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">Editar Imagem</DialogTitle>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 pt-4">
              <div className="aspect-video w-full rounded-lg overflow-hidden border border-white/10">
                <img src={editForm.watch('url')} alt="Preview" className="w-full h-full object-cover" />
              </div>
              
              <FormField
                control={editForm.control}
                name="alt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Acessibilidade)</FormLabel>
                    <FormControl>
                      <Input placeholder="Descreva a imagem..." {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Exibir no site</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Quando desativado, a imagem não será exibida na galeria pública
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={updateImage.isPending}>
                  {updateImage.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Imagem"
        description="Tem certeza que deseja excluir esta imagem? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        confirmText="Excluir"
      />
    </div>
  );
}
