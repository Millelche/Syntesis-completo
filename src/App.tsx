import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Páginas públicas
import Home from "@/pages/Home";
import Agency from "@/pages/Agency";
import ArtistDetail from "@/pages/ArtistDetail";
import AgencyDates from "@/pages/AgencyDates";
import Events from "@/pages/Events";
import EventDetail from "@/pages/EventDetail";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

// Panel de administración
import { AdminProvider } from "@/admin/context/AdminContext";
import ProtectedRoute from "@/admin/components/ProtectedRoute";
import Login from "@/admin/pages/Login";
import Dashboard from "@/admin/pages/Dashboard";
import Artists from "@/admin/pages/artists/Artists";
import AdminEvents from "@/admin/pages/events/Events";
import Dates from "@/admin/pages/dates/Dates";
import Bookings from "@/admin/pages/bookings/Bookings";
import Users from "@/admin/pages/users/Users";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/"                element={<Home />} />
            <Route path="/agency"          element={<Agency />} />
            <Route path="/agency/:slug"    element={<ArtistDetail />} />
            <Route path="/agency/dates"    element={<AgencyDates />} />
            <Route path="/events"          element={<Events />} />
            <Route path="/events/:slug"    element={<EventDetail />} />
            <Route path="/contact"         element={<Contact />} />

            {/* Panel admin */}
            <Route path="/admin"           element={<Login />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/artists"   element={<ProtectedRoute><Artists /></ProtectedRoute>} />
            <Route path="/admin/events"    element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
            <Route path="/admin/dates"     element={<ProtectedRoute><Dates /></ProtectedRoute>} />
            <Route path="/admin/bookings"  element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/admin/users"     element={<ProtectedRoute><Users /></ProtectedRoute>} />

            <Route path="*"                element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
