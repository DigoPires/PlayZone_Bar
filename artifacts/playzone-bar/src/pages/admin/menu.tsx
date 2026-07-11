import { useState, useEffect } from "react";
import { 
  useListMenuCategories, 
  useCreateMenuCategory, 
  useUpdateMenuCategory, 
  useDeleteMenuCategory,
  useListMenuItems,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem
} from "@workspace/api-client-react";
import { Loader2, Plus, Edit, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

function SortableCategory({ category, onEdit, onDelete }: { category: any; onEdit: (cat: any) => void; onDelete: (id: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between p-4 hover:bg-white/[0.02]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <span className="font-bold text-lg font-display">{category.name}</span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(category.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

const categorySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  order: z.coerce.number().min(1, "A ordenação deve ser no mínimo 1"),
});

const itemSchema = z.object({
  categoryId: z.coerce.number({ required_error: "Selecione uma categoria" }),
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Preço inválido"),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  available: z.boolean().default(true),
});

export default function AdminMenu() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<string>("categories");
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [categoriesState, setCategoriesState] = useState<any[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteType, setDeleteType] = useState<"category" | "item" | null>(null);
  
  // Queries
  const { data: categories, isLoading: isLoadingCats } = useListMenuCategories();
  const { data: items, isLoading: isLoadingItems } = useListMenuItems();
  
  // Ensure data is arrays
  const categoriesArray = Array.isArray(categories) ? categories : [];
  const itemsArray = Array.isArray(items) ? items : [];

  // Sync categories state with query data
  useEffect(() => {
    if (categoriesArray.length > 0) {
      setCategoriesState([...categoriesArray]);
    }
  }, [categoriesArray]);
  
  // Mutations
  const createCat = useCreateMenuCategory();
  const updateCat = useUpdateMenuCategory();
  const deleteCat = useDeleteMenuCategory();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCategoriesState((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update order values and save to backend
        newItems.forEach((cat, index) => {
          updateCat.mutate(
            { id: cat.id, data: { order: index * 10 } },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
              }
            }
          );
        });

        return newItems;
      });
    }
  };

  // Forms
  const catForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", order: 0 },
  });

  const itemForm = useForm<z.infer<typeof itemSchema>>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      categoryId: undefined,
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      available: true,
    },
  });

  // Handlers - Categories
  const handleOpenNewCat = () => {
    setEditingCatId(null);
    catForm.reset({ name: "", order: (categories?.length || 0) * 10 });
    setCatDialogOpen(true);
  };

  const handleOpenEditCat = (cat: any) => {
    setEditingCatId(cat.id);
    catForm.reset({ name: cat.name, order: cat.order });
    setCatDialogOpen(true);
  };

  const onSubmitCat = (data: z.infer<typeof categorySchema>) => {
    // Validate order doesn't exceed total categories
    const maxOrder = editingCatId ? categoriesState.length : categoriesState.length + 1;
    if (data.order > maxOrder) {
      toast({ 
        title: "Ordenação inválida", 
        description: `A ordenação deve estar entre 1 e ${maxOrder}`,
        variant: "destructive" 
      });
      return;
    }

    if (editingCatId) {
      updateCat.mutate({ id: editingCatId, data }, {
        onSuccess: () => {
          toast({ title: "Categoria atualizada" });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
          setCatDialogOpen(false);
        }
      });
    } else {
      createCat.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Categoria criada" });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
          setCatDialogOpen(false);
        }
      });
    }
  };

  const handleDeleteCat = (id: number) => {
    setDeleteId(id);
    setDeleteType("category");
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteId || !deleteType) return;
    
    if (deleteType === "category") {
      deleteCat.mutate({ id: deleteId }, {
        onSuccess: () => {
          toast({ title: "Categoria excluída" });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/categories"] });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
          setDeleteConfirmOpen(false);
          setDeleteId(null);
          setDeleteType(null);
        },
        onError: (error: any) => {
          const errorMessage = error?.data?.error || error?.message || "Erro ao excluir categoria";
          toast({ 
            title: "Erro ao excluir categoria", 
            description: errorMessage,
            variant: "destructive" 
          });
        }
      });
    } else if (deleteType === "item") {
      deleteItem.mutate({ id: deleteId }, {
        onSuccess: () => {
          toast({ title: "Item excluído" });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
          setDeleteConfirmOpen(false);
          setDeleteId(null);
          setDeleteType(null);
        },
        onError: (error: any) => {
          const errorMessage = error?.data?.error || error?.message || "Erro ao excluir item";
          toast({ 
            title: "Erro ao excluir item", 
            description: errorMessage,
            variant: "destructive" 
          });
        }
      });
    }
  };

  // Handlers - Items
  const handleOpenNewItem = () => {
    if (!categories?.length) {
      toast({ title: "Crie uma categoria primeiro", variant: "destructive" });
      return;
    }
    setEditingItemId(null);
    itemForm.reset({
      categoryId: categories[0].id,
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      available: true,
    });
    setItemDialogOpen(true);
  };

  const handleOpenEditItem = (item: any) => {
    setEditingItemId(item.id);
    itemForm.reset({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description || "",
      price: item.price,
      imageUrl: item.imageUrl || "",
      imagePublicId: item.imagePublicId || "",
      available: item.available,
    });
    setItemDialogOpen(true);
  };

  const onSubmitItem = (data: z.infer<typeof itemSchema>) => {
    if (editingItemId) {
      updateItem.mutate({ id: editingItemId, data }, {
        onSuccess: () => {
          toast({ title: "Item atualizado" });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
          setItemDialogOpen(false);
        }
      });
    } else {
      createItem.mutate({ data }, {
        onSuccess: () => {
          toast({ title: "Item criado" });
          queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
          setItemDialogOpen(false);
        }
      });
    }
  };

  const handleDeleteItem = (id: number) => {
    setDeleteId(id);
    setDeleteType("item");
    setDeleteConfirmOpen(true);
  };

  const toggleItemAvailability = (id: number, current: boolean) => {
    updateItem.mutate({ id, data: { available: !current } }, {
      onSuccess: () => {
        toast({ title: current ? "Item marcado como esgotado" : "Item marcado como disponível" });
        queryClient.invalidateQueries({ queryKey: ["/api/menu/items"] });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Cardápio</h1>
          <p className="text-muted-foreground">Gerencie categorias e itens do menu.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-white/5 mb-6">
          <TabsTrigger value="categories" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Categorias</TabsTrigger>
          <TabsTrigger value="items" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Itens do Menu</TabsTrigger>
        </TabsList>
        
        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="neon" onClick={handleOpenNewCat}>
              <Plus className="mr-2 h-4 w-4" /> NOVA CATEGORIA
            </Button>
          </div>
          
          <Card className="glass-card border-white/5">
            {isLoadingCats ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : categoriesState.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">Nenhuma categoria cadastrada.</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={categoriesState.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
                  <div className="divide-y divide-white/5">
                    {categoriesState.map((cat) => (
                      <SortableCategory 
                        key={cat.id} 
                        category={cat} 
                        onEdit={handleOpenEditCat}
                        onDelete={handleDeleteCat}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </TabsContent>
        
        {/* Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="neon" onClick={handleOpenNewItem}>
              <Plus className="mr-2 h-4 w-4" /> NOVO ITEM
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {isLoadingItems ? (
              <div className="col-span-full flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : itemsArray.length === 0 ? (
              <div className="col-span-full p-8 text-center text-muted-foreground bg-card border border-white/5 rounded-xl">
                Nenhum item cadastrado.
              </div>
            ) : (
              itemsArray.map((item) => (
                <Card key={item.id} className={`glass-card border-white/5 overflow-hidden transition-opacity ${!item.available && "opacity-60 grayscale-[0.5]"}`}>
                  <div className="flex h-full">
                    {item.imageUrl ? (
                      <div className="w-24 shrink-0 bg-muted">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 shrink-0 bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground opacity-50" />
                      </div>
                    )}
                    <div className="flex-1 p-4 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold font-display line-clamp-1">{item.name}</h4>
                        <span className="font-bold text-primary">R${item.price}</span>
                      </div>
                      <span className="text-xs text-secondary font-medium uppercase tracking-wider mb-2">
                        {item.categoryName}
                      </span>
                      <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={item.available} 
                            onCheckedChange={() => toggleItemAvailability(item.id, item.available)}
                            className="scale-75 data-[state=checked]:bg-primary"
                          />
                          <span className="text-xs font-medium">{item.available ? "Em Estoque" : "Esgotado"}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEditItem(item)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteItem(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Category Form Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingCatId ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
          </DialogHeader>
          <Form {...catForm}>
            <form onSubmit={catForm.handleSubmit(onSubmitCat)} className="space-y-4">
              <FormField control={catForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={catForm.control} name="order" render={({ field }) => (
                <FormItem><FormLabel>Ordem de Exibição</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setCatDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createCat.isPending || updateCat.isPending}>Salvar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Item Form Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent className="bg-card border-white/10 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingItemId ? "Editar Item" : "Novo Item"}
            </DialogTitle>
          </DialogHeader>
          <Form {...itemForm}>
            <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
              <FormField control={itemForm.control} name="categoryId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <select 
                      className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={field.value || ""}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    >
                      <option value="" disabled>Selecione...</option>
                      {categoriesArray.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <FormField control={itemForm.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div>
                  <FormField control={itemForm.control} name="price" render={({ field }) => (
                    <FormItem><FormLabel>Preço (R$)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
              
              <FormField control={itemForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Descrição</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={itemForm.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Item</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={(url, publicId) => {
                        field.onChange(url);
                        if (publicId) {
                          itemForm.setValue('imagePublicId', publicId);
                        }
                      }}
                      onRemove={() => {
                        field.onChange('');
                        itemForm.setValue('imagePublicId', '');
                      }}
                      disabled={createItem.isPending || updateItem.isPending}
                      uploadEndpoint="/api/menu/items/upload"
                      uploadFolder="playzone/cardapio_test"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createItem.isPending || updateItem.isPending}>Salvar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir"
        description={deleteType === "category" ? "Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita." : "Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."}
        onConfirm={confirmDelete}
        confirmText="Excluir"
      />
    </div>
  );
}
