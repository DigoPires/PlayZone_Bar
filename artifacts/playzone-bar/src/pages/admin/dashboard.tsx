import { useGetStats, useGetReservationsByDay, useGetPeakHours, useListCoupons } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedSection } from "@/components/ui/animations";
import { Users, Calendar, Gamepad2, TrendingUp, Loader2, ArrowRight, Tag } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: reservationsByDay, isLoading: byDayLoading } = useGetReservationsByDay();
  const { data: peakHours, isLoading: peakHoursLoading } = useGetPeakHours();
  const { data: coupons } = useListCoupons();

  // Ensure data is arrays
  const reservationsByDayArray = Array.isArray(reservationsByDay) ? reservationsByDay : [];
  const peakHoursArray = Array.isArray(peakHours) ? peakHours : [];
  const recentReservationsArray = Array.isArray(stats?.recentReservations) ? stats.recentReservations : [];
  const couponsArray = Array.isArray(coupons) ? coupons : [];

  // Calculate active promotions based on business rules
  const activePromotions = couponsArray.filter(coupon => {
    if (!coupon.active) return false;
    if (coupon.validUntil) {
      const validDate = new Date(coupon.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      validDate.setHours(0, 0, 0, 0);
      return validDate >= today;
    }
    return true;
  }).length;

  if (statsLoading || byDayLoading || peakHoursLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    {
      title: "Reservas Totais",
      value: stats?.totalReservations || 0,
      icon: Calendar,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Confirmadas Hoje",
      value: stats?.confirmedToday || 0,
      icon: Users,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Eventos Ativos",
      value: stats?.totalEvents || 0,
      icon: Gamepad2,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      title: "Promoções Ativas",
      value: activePromotions,
      icon: Tag,
      color: "text-green-500",
      bg: "bg-green-500/10",
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema e métricas de desempenho.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <AnimatedSection key={i} delay={i * 0.1}>
            <Card className="glass-card border-white/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <h3 className="text-3xl font-display font-bold">{kpi.value}</h3>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reservations Chart */}
        <AnimatedSection delay={0.4}>
          <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle>Reservas por Dia (Últimos 7 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={reservationsByDayArray}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSalao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGamer" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="salaoCount" name="Salão" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSalao)" />
                    <Area type="monotone" dataKey="gamerCount" name="Gamer" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorGamer)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Peak Hours Chart */}
        <AnimatedSection delay={0.5}>
          <Card className="glass-card border-white/5 h-full">
            <CardHeader>
              <CardTitle>Horários de Pico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={peakHoursArray}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Bar dataKey="count" name="Reservas" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
      
      {/* Recent Activity */}
      <AnimatedSection delay={0.6}>
        <Card className="glass-card border-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas Reservas</CardTitle>
            <Link href="/admin-playzone/reservations">
              <Button variant="outline" size="sm">
                Ver todas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentReservationsArray.length > 0 ? (
              <div className="space-y-4">
                {recentReservationsArray.map(res => (
                  <Link key={res.id} href="/admin-playzone/reservations">
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-white/5 hover:border-primary/30 transition-colors cursor-pointer">
                      <div className="flex flex-col">
                        <span className="font-bold">{res.name}</span>
                        <span className="text-sm text-muted-foreground">{res.date} às {res.time} • {res.people} pessoas</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs rounded-full font-bold uppercase
                          ${res.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 
                            res.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                            res.status === 'cancelled' ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`
                        }>
                          {res.status}
                        </span>
                        <span className={`text-xs mt-1 uppercase font-bold
                          ${res.type === 'gamer' ? 'text-secondary' : 'text-primary'}
                        `}>{res.type}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhuma reserva recente encontrada.</p>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  );
}
