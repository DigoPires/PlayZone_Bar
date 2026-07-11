import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gamepad2, Eye, EyeOff, Loader2, Home } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(3, { message: "Username deve ter pelo menos 3 caracteres" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login.mutate(
      { data },
      {
        onSuccess: () => {
          toast({
            title: "Acesso autorizado",
            description: "Bem-vindo ao painel de administração.",
          });
          setLocation("/admin-playzone");
        },
        onError: () => {
          toast({
            title: "Acesso negado",
            description: "Username ou senha incorretos.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/img/Logo_C_Nome.png" 
            alt="PlayZone Logo" 
            className="h-12 w-auto"
          />
        </div>

        <Card className="glass-card neon border-primary/30">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-display">Acesso Restrito</CardTitle>
            <CardDescription>
              Insira suas credenciais para acessar o painel de administração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="admin" 
                          className="bg-background/50 focus-visible:ring-primary/50" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="••••••••" 
                            className="bg-background/50 focus-visible:ring-primary/50 pr-10" 
                            {...field} 
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  variant="neon" 
                  className="w-full mt-6 py-6 text-lg tracking-wider font-bold"
                  disabled={login.isPending}
                >
                  {login.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AUTENTICANDO...
                    </>
                  ) : (
                    "ENTRAR"
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full mt-3 border-white/10 hover:bg-white/5"
                  onClick={() => setLocation("/")}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar ao Site
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-8">
          Área restrita a funcionários autorizados.
        </p>
      </div>
    </div>
  );
}
