import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar as CalendarIcon, Check, Loader2 } from "lucide-react";
import { useSearchParams } from "wouter";

import { useCreateReservation, useGetAvailability, useGetSettings } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimatedSection } from "@/components/ui/animations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

const reservationSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  phone: z.string().min(14, "Telefone inválido").max(15, "Telefone inválido"),
  type: z.enum(["salao", "gamer"]),
  people: z.coerce.number().min(1, "Mínimo 1 pessoa").max(20, "Máximo 20 pessoas online. Para mais, contate-nos."),
  date: z.date({ required_error: "Selecione uma data" }),
  time: z.string().min(1, "Selecione um horário"),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

export default function ReservationsPage() {
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  const { data: settings } = useGetSettings();
  const [searchParams] = useSearchParams();
  
  // Check if type=gamer is in URL params
  const initialType = searchParams.get("type") === "gamer" ? "gamer" : "salao";
  
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      phone: "",
      type: initialType,
      people: 2,
      notes: "",
      couponCode: "",
    },
  });

  const selectedDate = form.watch("date");
  const selectedType = form.watch("type");

  // Format date safely for the query parameter
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  const { data: availability, isLoading: isLoadingAvailability } = useGetAvailability(
    { date: dateStr, type: selectedType as any }
  );

  const createReservation = useCreateReservation();

  const onSubmit = (data: ReservationFormValues) => {
    createReservation.mutate(
      { 
        data: {
          ...data,
          date: format(data.date, "yyyy-MM-dd"),
          type: data.type as "salao" | "gamer",
        } 
      },
      {
        onSuccess: () => {
          setSuccess(true);
          window.scrollTo(0, 0);
        },
        onError: () => {
          toast({
            title: "Erro ao realizar reserva",
            description: "Não foi possível concluir sua reserva. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
        <AnimatedSection className="flex flex-col items-center">
          <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 border-2 border-primary/50 box-glow-primary">
            <Check className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-4 text-glow-primary text-primary">Reserva Confirmada!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Sua reserva foi recebida com sucesso. Te enviamos uma mensagem no WhatsApp com os detalhes.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSuccess(false);
              form.reset();
            }}
          >
            Fazer outra reserva
          </Button>
        </AnimatedSection>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
      <AnimatedSection className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">
          FAÇA SUA <span className="text-primary text-glow-primary">RESERVA</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Garanta seu lugar no PlayZone Bar. Escolha entre nossa área comum (mesas, bilhar, bar) ou nossa arena gamer de alta performance.
        </p>
      </AnimatedSection>

      <Card className="glass-card neon border-primary/20 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Info Sidebar */}
            <div className="bg-muted/30 p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-white/5">
              <h3 className="font-display font-bold text-xl mb-6 text-foreground">Informações</h3>
              
              <div className="space-y-6 text-sm text-muted-foreground">
                <div>
                  <h4 className="font-bold text-foreground mb-1">Horário de Funcionamento</h4>
                  <p>{settings?.openingHours || "Terça a Domingo: 18h às 02h"}</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-foreground mb-1">Área Comum (Salão)</h4>
                  <p>Mesas no salão principal, acesso ao bar, mesas de bilhar e consoles lounge. Sem custo mínimo consumível.</p>
                </div>
                
                <div>
                  <h4 className="font-bold text-primary mb-1">Arena PC Gamer</h4>
                  <p>Acesso aos PCs high-end. É necessário adquirir pacote de horas no local. R$ 20/hora avulsa.</p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-xs">
                    Reservas têm tolerância de 15 minutos de atraso. Após esse período, a mesa/PC será liberado.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-8 md:w-2/3">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base">Qual ambiente?</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-2 gap-4"
                          >
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="salao" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-primary/10 hover:text-primary peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all">
                                <span className="font-bold mb-1">Salão / Bar</span>
                                <span className="text-xs font-normal text-muted-foreground text-center">Mesas, Drinks e Bilhar</span>
                              </FormLabel>
                            </FormItem>
                            
                            <FormItem>
                              <FormControl>
                                <RadioGroupItem value="gamer" className="peer sr-only" />
                              </FormControl>
                              <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-secondary/10 hover:text-secondary peer-data-[state=checked]:border-secondary peer-data-[state=checked]:text-secondary cursor-pointer transition-all">
                                <span className="font-bold mb-1">Arena Gamer</span>
                                <span className="text-xs font-normal text-muted-foreground text-center">PCs Alta Performance</span>
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                // Capitalize each word
                                const formatted = value
                                  .toLowerCase()
                                  .split(' ')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ');
                                field.onChange(formatted);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="(11) 99999-9999" 
                              {...field}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length > 11) value = value.slice(0, 11);
                                
                                if (value.length > 0) {
                                  value = '(' + value;
                                  if (value.length > 3) {
                                    value = value.slice(0, 3) + ') ' + value.slice(3);
                                  }
                                  if (value.length > 10) {
                                    value = value.slice(0, 10) + '-' + value.slice(10);
                                  }
                                }
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="people"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de Pessoas</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col mt-2">
                          <FormLabel>Data</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-4 text-left font-normal bg-background/50 border-white/10 hover:bg-white/5 hover:border-primary/30 transition-all",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    <span className="flex items-center">
                                      <CalendarIcon className="mr-2 h-4 w-4 text-primary opacity-70" />
                                      {format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                    </span>
                                  ) : (
                                    <span className="flex items-center">
                                      <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                      Selecione a data
                                    </span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-4 bg-background/95 backdrop-blur-sm border-white/10" align="start">
                              {/* Custom header with arrows */}
                              <div className="flex items-center justify-between mb-4 px-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDate = new Date(field.value || new Date());
                                    newDate.setMonth(newDate.getMonth() - 1);
                                    field.onChange(newDate);
                                  }}
                                  className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>
                                <span className="text-sm font-medium text-foreground">
                                  {field.value ? field.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) : 'Selecione uma data'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newDate = new Date(field.value || new Date());
                                    newDate.setMonth(newDate.getMonth() + 1);
                                    field.onChange(newDate);
                                  }}
                                  className="h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  // Reset time when date changes
                                  form.setValue("time", "");
                                }}
                                disabled={(date) => {
                                  // Disable past dates and Mondays (if closed)
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today || date.getDay() === 1;
                                }}
                                initialFocus
                                className="rounded-md"
                                classNames={{
                                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                  month: "space-y-4",
                                  month_caption: "hidden",
                                  caption_label: "hidden",
                                  nav: "hidden",
                                  weekdays: "flex",
                                  weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                  week: "flex w-full mt-2",
                                  day: "h-9 w-9 p-0 text-center text-sm rounded-md hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors",
                                  day_outside: "text-muted-foreground opacity-50",
                                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                                  day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
                                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                  day_hidden: "invisible",
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário</FormLabel>
                        <FormControl>
                          {selectedDate ? (
                            isLoadingAvailability ? (
                              <div className="flex items-center justify-center p-4 border rounded-md bg-background/50">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
                                <span className="text-sm text-muted-foreground">Carregando horários...</span>
                              </div>
                            ) : availability?.slots && availability.slots.length > 0 ? (
                              <div className="grid grid-cols-4 gap-2">
                                {availability.slots.map((time) => (
                                  <div key={time} className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`time-${time}`}
                                      value={time}
                                      className="peer sr-only"
                                      checked={field.value === time}
                                      onChange={(e) => field.onChange(e.target.value)}
                                    />
                                    <label
                                      htmlFor={`time-${time}`}
                                      className="w-full text-center rounded-md border border-input bg-background/50 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground peer-checked:border-primary peer-checked:bg-primary/20 peer-checked:text-primary cursor-pointer transition-colors"
                                    >
                                      {time}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-4 border rounded-md bg-destructive/10 text-destructive text-sm text-center">
                                Sem horários disponíveis para esta data.
                              </div>
                            )
                          ) : (
                            <div className="p-4 border rounded-md bg-background/50 text-muted-foreground text-sm text-center">
                              Selecione uma data primeiro
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações (Opcional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Aniversário, preferência de jogos, etc..." 
                            className="resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="couponCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cupom de Desconto (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite o código do cupom" 
                            className="uppercase"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value.toUpperCase());
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Siga nosso Instagram para acompanhar os cupons exclusivos!
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    variant="neon" 
                    className="w-full py-6 text-lg mt-6"
                    disabled={createReservation.isPending}
                  >
                    {createReservation.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> PROCESSANDO...</>
                    ) : (
                      "CONFIRMAR RESERVA"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
