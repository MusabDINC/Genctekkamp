import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLogin, getGetMeQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Rocket, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const loginMutation = useLogin();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirect if already logged in
  if (user) {
    setLocation(user.role === 'admin' ? '/admin' : '/dashboard');
    return null;
  }

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          // invalidateQueries arka planda yeniden fetch tetikler; yönlendirme
          // hemen ardından yapıldığında ProtectedRoute henüz eski (giriş
          // yapılmamış) "user: null" durumunu görüp tekrar /login'e atıyordu.
          // setQueryData ile cache'i senkron güncelleyip bu yarış durumunu önlüyoruz.
          queryClient.setQueryData(getGetMeQueryKey(), data);
          toast({
            title: 'Giriş Başarılı',
            description: `Hoş geldin, ${data.fullName}`,
          });
          setLocation(data.role === 'admin' ? '/admin' : '/dashboard');
        },
        onError: (error: any) => {
          toast({
            variant: 'destructive',
            title: 'Giriş Başarısız',
            description: error.error || 'E-posta veya şifre hatalı',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary">
            <Rocket className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Giriş Yap</CardTitle>
          <CardDescription>
            Hesabınıza giriş yaparak projelerinizi yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input placeholder="ornek@ogrenci.edu.tr" type="email" {...field} />
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
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center border-t px-6 py-4 mt-2">
          <div className="text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Kayıt Ol
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
