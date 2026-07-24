import React from 'react';
import { useRoute } from 'wouter';
import { useGetProject, getGetProjectQueryKey } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, MapPin, Layers, Clock, Github, ExternalLink, 
  ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { Link } from 'wouter';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const categoryLabels: Record<string, string> = {
  'web-tasarim-ve-gelistirme': 'Web Tasarım',
  'mobil-uygulama': 'Mobil Uygulama',
  'oyun-gelistirme': 'Oyun Geliştirme',
  'yapay-zeka': 'Yapay Zeka',
};

export default function ProjectDetail() {
  const [, params] = useRoute('/projects/:id');
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const { data: project, isLoading, isError } = useGetProject(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProjectQueryKey(id)
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-8 bg-muted w-32 rounded"></div>
          <div className="h-[400px] bg-muted w-full rounded-2xl"></div>
          <div className="space-y-4">
            <div className="h-10 bg-muted w-3/4 rounded"></div>
            <div className="h-4 bg-muted w-1/4 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <AlertTriangle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Proje Bulunamadı</h2>
        <p className="text-muted-foreground mb-8">Aradığınız proje yayında değil veya silinmiş olabilir.</p>
        <Link href="/">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Vitrine Dön</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vitrine Dön
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="text-sm py-1 font-medium bg-card">
                {categoryLabels[project.category] || project.category}
              </Badge>
              {project.aiUsage?.isUsed && (
                <Badge className="bg-[#3b82f6] text-white gap-1.5 shadow-sm py-1">
                  <Bot className="w-4 h-4" />
                  Yapay Zeka Destekli
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground font-medium">
              <div className="flex items-center gap-2 text-foreground">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {project.studentName.charAt(0).toUpperCase()}
                </div>
                <span>{project.studentName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{project.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>{project.stage}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(project.createdAt), 'dd MMMM yyyy', { locale: tr })}</span>
              </div>
            </div>
          </div>

          {project.coverUrl && (
            <div className="rounded-2xl overflow-hidden border bg-muted shadow-sm">
              <img 
                src={project.coverUrl} 
                alt={`${project.title} kapak görseli`} 
                className="w-full h-auto object-cover max-h-[500px]" 
              />
            </div>
          )}

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                Problem
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {project.problem}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                Hedef Kitle
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {project.targetAudience}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-[#10b981] rounded-full inline-block"></span>
                Çözüm & Yaklaşım
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {project.solution}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full inline-block"></span>
                Gelecek Planları
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
                {project.futurePlans}
              </div>
            </section>
          </div>

          {project.screenshotUrls && project.screenshotUrls.length > 0 && (
            <section className="pt-4 border-t">
              <h2 className="text-2xl font-bold mb-6">Ekran Görüntüleri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshotUrls.map((url, idx) => (
                  <div key={idx} className="rounded-xl overflow-hidden border bg-muted">
                    <img src={url} alt={`Ekran Görüntüsü ${idx + 1}`} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Bağlantılar</h3>
            <div className="space-y-3 mb-6">
              {project.demoUrl ? (
                <Button className="w-full justify-start gap-2" asChild>
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Canlı Demo
                  </a>
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic px-2 py-1">Canlı demo linki eklenmemiş.</div>
              )}
              
              {project.githubUrl ? (
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                    GitHub Deposu
                  </a>
                </Button>
              ) : null}
            </div>

            <h3 className="font-bold text-lg mb-4 border-b pb-2">Teknoloji Yığını</h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary" className="px-3 py-1 font-medium bg-secondary/50">
                  {tech}
                </Badge>
              ))}
            </div>

            {project.aiUsage?.isUsed && (
              <>
                <h3 className="font-bold text-lg mb-4 border-b pb-2 flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#3b82f6]" />
                  Yapay Zeka Kullanımı
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-muted-foreground font-medium mb-1">Kullanılan Araçlar:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {project.aiUsage.tools.map((tool) => (
                        <Badge key={tool} variant="outline" className="border-[#3b82f6]/30 text-[#3b82f6] bg-[#3b82f6]/5">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-medium mb-1">Kullanım Alanları:</span>
                    <ul className="list-disc list-inside pl-1 space-y-1 text-foreground">
                      {project.aiUsage.usageAreas.map((area) => (
                        <li key={area}>{area}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}

            <div className="mt-8 bg-muted/40 rounded-xl p-4 border border-dashed border-border/60">
              <h4 className="font-semibold text-sm flex items-center gap-1.5 mb-3 text-foreground/80">
                <ShieldCheck className="w-4 h-4 text-success" />
                Güvenlik & Etik Beyanı
              </h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Gerçek kişisel veriler kullanılmamıştır.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Depoda API anahtarı veya sır yoktur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                  <span>Telif haklarına uygun materyaller kullanılmıştır.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
