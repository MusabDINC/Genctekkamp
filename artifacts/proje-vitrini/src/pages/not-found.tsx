import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-9xl font-black text-muted-foreground/20">404</h1>
      <h2 className="text-3xl font-bold mt-4 mb-2">Sayfa Bulunamadı</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
      </p>
      <Link href="/">
        <Button size="lg" className="gap-2">
          <Home className="w-4 h-4" />
          Ana Sayfaya Dön
        </Button>
      </Link>
    </div>
  );
}
