import { useRef, useEffect, useState } from "react";
import { useGetSettings, useUpdateSettings } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const settingsSchema = z.object({
  heroTitlePurple: z.string().optional(),
  heroTitleWhite: z.string().optional(),
  heroSubtitle: z.string().optional(),
  aboutText: z.string().optional(),
  entryPrice: z.coerce.number().optional(),
  openingHours: z.string().optional(),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  address: z.string().optional(),
  googleMapsUrl: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      heroTitlePurple: "",
      heroTitleWhite: "",
      heroSubtitle: "",
      aboutText: "",
      entryPrice: 0,
      openingHours: "",
      whatsapp: "",
      instagram: "",
      facebook: "",
      address: "",
      googleMapsUrl: "",
    },
  });

  useUnsavedChanges(hasUnsavedChanges);

  // Guard to prevent infinite initialization loops
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      initialized.current = true;
      form.reset({
        heroTitlePurple: settings.heroTitlePurple || "",
        heroTitleWhite: settings.heroTitleWhite || "",
        heroSubtitle: settings.heroSubtitle || "",
        aboutText: settings.aboutText || "",
        entryPrice: settings.entryPrice || 0,
        openingHours: settings.openingHours || "",
        whatsapp: settings.whatsapp || "",
        instagram: settings.instagram || "",
        facebook: settings.facebook || "",
        address: settings.address || "",
        googleMapsUrl: settings.googleMapsUrl || "",
      });
      setHasUnsavedChanges(false);
    }
  }, [settings, form]);

  // Watch for form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: SettingsFormValues) => {
    console.log('Submitting settings:', data);
    updateSettings.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: "Configurações salvas", description: "O site público foi atualizado com sucesso." });
          setHasUnsavedChanges(false);
        },
        onError: (error) => {
          console.error('Error saving settings:', error);
          toast({ title: "Erro ao salvar configurações", description: "Verifique os dados e tente novamente.", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold">Configurações</h1>
        <p className="text-muted-foreground">Personalize o conteúdo e informações do site público.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-card border border-white/5 mb-6">
              <TabsTrigger value="general">Geral & Landing Page</TabsTrigger>
              <TabsTrigger value="info">Informações & Contato</TabsTrigger>
              <TabsTrigger value="social">Redes Sociais</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="glass-card border-white/5">
                <CardHeader>
                  <CardTitle className="font-display">Conteúdo da Landing Page</CardTitle>
                  <CardDescription>Textos principais exibidos na página inicial</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="heroTitlePurple" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título - Parte Roxa</FormLabel>
                        <FormControl><Input placeholder="PLAY" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="heroTitleWhite" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título - Parte Branca</FormLabel>
                        <FormControl><Input placeholder="ZONE" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="heroSubtitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtítulo (Hero)</FormLabel>
                      <FormControl><Textarea rows={2} {...field} /></FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="aboutText" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Texto da Seção Sobre</FormLabel>
                      <FormControl><Textarea rows={5} {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              <Card className="glass-card border-white/5">
                <CardHeader>
                  <CardTitle className="font-display">Informações do Bar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="entryPrice" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Entrada / Couvert (R$)</FormLabel>
                        <FormControl><Input type="number" step="0.5" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="openingHours" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Funcionamento (Texto livre)</FormLabel>
                        <FormControl><Input placeholder="Ter a Dom: 18h as 02h" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço Completo</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="googleMapsUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL iframe do Google Maps</FormLabel>
                      <FormControl><Input placeholder="https://www.google.com/maps/embed?..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card className="glass-card border-white/5">
                <CardHeader>
                  <CardTitle className="font-display">Contatos & Redes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="whatsapp" render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (Apenas números, com DDD)</FormLabel>
                      <FormControl><Input placeholder="11999999999" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="instagram" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Instagram</FormLabel>
                      <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="facebook" render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Facebook</FormLabel>
                      <FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end sticky bottom-8 p-4 bg-background/80 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">
            <Button type="submit" variant="neon" size="lg" disabled={updateSettings.isPending}>
              {updateSettings.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              SALVAR ALTERAÇÕES
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
