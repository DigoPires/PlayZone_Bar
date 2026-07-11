import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProtectedRoute } from '@/components/auth/protected-route';

import { PublicLayout } from '@/components/layout/public-layout';
import { AdminLayout } from '@/components/layout/admin-layout';

// Error Page
import NotFound from '@/pages/not-found';

// Public Pages
import HomePage from '@/pages/home';
import ReservationsPage from '@/pages/reservations';
import EventsPage from '@/pages/events';
import MenuPage from '@/pages/menu';
import GalleryPage from '@/pages/gallery';
import InfoPage from '@/pages/info';
import TermsPage from '@/pages/terms';
import PrivacyPage from '@/pages/privacy';
import RulesPage from '@/pages/rules';

// Admin Pages
import AdminDashboard from '@/pages/admin/dashboard';
import AdminReservations from '@/pages/admin/reservations';
import AdminEvents from '@/pages/admin/events';
import AdminMenu from '@/pages/admin/menu';
import AdminGallery from '@/pages/admin/gallery';
import AdminSettings from '@/pages/admin/settings';
import AdminCoupons from '@/pages/admin/coupons';
import AdminAvailability from '@/pages/admin/availability';
import LoginPage from '@/pages/login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PublicRoutes() {
  return (
    <PublicLayout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/reservations" component={ReservationsPage} />
        <Route path="/events" component={EventsPage} />
        <Route path="/menu" component={MenuPage} />
        <Route path="/gallery" component={GalleryPage} />
        <Route path="/info" component={InfoPage} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/rules" component={RulesPage} />
        <Route component={NotFound} />
      </Switch>
    </PublicLayout>
  );
}

function AdminRoutes() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Switch>
          <Route path="/admin-playzone" component={AdminDashboard} />
          <Route path="/admin-playzone/reservations" component={AdminReservations} />
          <Route path="/admin-playzone/events" component={AdminEvents} />
          <Route path="/admin-playzone/menu" component={AdminMenu} />
          <Route path="/admin-playzone/gallery" component={AdminGallery} />
          <Route path="/admin-playzone/settings" component={AdminSettings} />
          <Route path="/admin-playzone/coupons" component={AdminCoupons} />
          <Route path="/admin-playzone/availability" component={AdminAvailability} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Switch>
            <Route path="/admin-playzone/login" component={LoginPage} />
            <Route path="/admin-playzone" component={AdminRoutes} />
            <Route path="/admin-playzone/*" component={AdminRoutes} />
            <Route path="/*" component={PublicRoutes} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
