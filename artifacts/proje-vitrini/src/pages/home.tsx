import React, { useState } from 'react';
import { useGetStats, useListProjects, ProjectSummaryCategory, ProjectSummaryCity, ProjectSummaryStage } from '@workspace/api-client-react';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Code, MapPin, Rocket, Bot, Search, Frown } from 'lucide-react';
import { useDebounce } from '@/lib/use-debounce'; // Wait, let me implement useDebounce hook

export default function Home() {
  const { data: stats } = useGetStats();
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [city, setCity] = useState<ProjectSummaryCity | 'all'>('all');
  const [category, setCategory] = useState<ProjectSummaryCategory | 'all'>('all');
  
  const { data: projects, isLoading } = useListProjects({
    search: debouncedSearch || undefined,
    city: city === 'all' ? undefined : city,
    category: category === 'all' ? undefined : category,
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-card border-b py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 border-primary/20 text-primary bg-primary/5 px-3 py-1 text-sm rounded-full">
            GençTek Ekosistemi
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-foreground mb-6">
            Fikirden Ürüne <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">
              Proje Vitrini
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
            Konya ve Afyonkarahisar'daki öğrencilerin geliştirdiği modern teknoloji, yapay zeka destekli ve yenilikçi projeleri keşfedin.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-4xl">
            <StatCard icon={<Code className="w-5 h-5" />} value={stats?.total || 0} label="Toplam Proje" />
            <StatCard icon={<MapPin className="w-5 h-5" />} value={stats?.konya || 0} label="Konya" />
            <StatCard icon={<MapPin className="w-5 h-5" />} value={stats?.afyonkarahisar || 0} label="Afyonkarahisar" />
            <StatCard icon={<Bot className="w-5 h-5" />} value={stats?.aiSupported || 0} label="YZ Destekli" />
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Keşfet</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Proje veya teknoloji ara..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <Select value={city} onValueChange={(v: any) => setCity(v)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Şehir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Şehirler</SelectItem>
                  <SelectItem value="Konya">Konya</SelectItem>
                  <SelectItem value="Afyonkarahisar">Afyonkarahisar</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  <SelectItem value="web-tasarim-ve-gelistirme">Web Tasarım</SelectItem>
                  <SelectItem value="mobil-uygulama">Mobil Uygulama</SelectItem>
                  <SelectItem value="oyun-gelistirme">Oyun Geliştirme</SelectItem>
                  <SelectItem value="yapay-zeka">Yapay Zeka</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm h-[360px] animate-pulse">
                  <div className="h-48 bg-muted w-full"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted w-1/3 rounded"></div>
                    <div className="h-6 bg-muted w-3/4 rounded"></div>
                    <div className="h-4 bg-muted w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-xl border border-dashed flex flex-col items-center">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Frown className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Proje Bulunamadı</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Arama kriterlerinize uygun proje bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearch('');
                  setCity('all');
                  setCategory('all');
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-2xl shadow-sm">
      <div className="p-3 bg-primary/10 text-primary rounded-full mb-4">
        {icon}
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

// Inline Badge to avoid circular deps if needed
function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "destructive" | "outline" }) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props} />
  )
}
