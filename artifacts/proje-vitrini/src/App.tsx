import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth-context';
import Layout from '@/components/layout';
import Home from '@/pages/home';
import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Register from '@/pages/register';
import { ProtectedRoute } from '@/components/protected-route';

// We'll create these pages next
import ProjectDetail from '@/pages/project-detail';
import Dashboard from '@/pages/dashboard';
import SubmitProject from '@/pages/submit-project';
import EditProject from '@/pages/edit-project';
import AdminDashboard from '@/pages/admin-dashboard';

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects/:id" component={ProjectDetail} />
        
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Student Routes */}
        <Route path="/dashboard">
          <ProtectedRoute allowedRoles={['student', 'admin']}>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard/submit">
          <ProtectedRoute allowedRoles={['student']}>
            <SubmitProject />
          </ProtectedRoute>
        </Route>
        
        <Route path="/dashboard/projects/:id/edit">
          <ProtectedRoute allowedRoles={['student']}>
            <EditProject />
          </ProtectedRoute>
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin">
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
