import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useLogout, getGetMeQueryKey } from '@workspace/api-client-react';
import { LogOut, LayoutDashboard, Rocket, CheckCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation('/');
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-primary transition-opacity hover:opacity-80">
            <Rocket className="h-6 w-6" />
            <span>GençTek Proje Vitrini</span>
          </Link>
          
          <nav className="flex items-center gap-4">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                      <Button variant="ghost" className="gap-2 text-sm font-medium">
                        <LayoutDashboard className="h-4 w-4" />
                        <span className="hidden sm:inline">Panel</span>
                      </Button>
                    </Link>
                    <div className="h-4 w-px bg-border hidden sm:block" />
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-foreground">
                      <LogOut className="h-4 w-4" />
                      <span className="hidden sm:inline">Çıkış</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="text-sm font-medium">Giriş Yap</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="text-sm font-medium shadow-sm">Kayıt Ol</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-card py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
          <p>© {new Date().getFullYear()} GençTek. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-1 text-xs">
            <CheckCircle className="h-3 w-3 text-success" />
            <span>Fikirden Ürüne</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
