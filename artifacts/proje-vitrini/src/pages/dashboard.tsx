import React from 'react';
import { useListMyProjects, useDeleteProject, getListMyProjectsQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Plus, Edit2, Trash2, Rocket, ExternalLink, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { label: string; badge: string; desc: string }> = {
  approved: { label: 'Onaylandı', badge: 'bg-success text-white', desc: 'Projeniz vitrinde sergileniyor.' },
  pending: { label: 'Değerlendirmede', badge: 'bg-warning text-white', desc: 'Yöneticiler projenizi inceliyor.' },
  rejected: { label: 'Reddedildi', badge: 'bg-destructive text-white', desc: 'Düzeltmeler gerekiyor.' },
  draft: { label: 'Taslak', badge: 'bg-muted-foreground text-white', desc: 'Henüz onaya gönderilmedi.' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useListMyProjects();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    deleteProject.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMyProjectsQueryKey() });
          toast({ title: 'Proje silindi' });
        },
        onError: (err: any) => {
          toast({ title: 'Hata', description: err.error || 'Proje silinemedi', variant: 'destructive' });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projelerim</h1>
          <p className="text-muted-foreground mt-1">
            {user?.fullName}, {user?.school}
          </p>
        </div>
        <Link href="/dashboard/submit">
          <Button className="gap-2 font-semibold">
            <Plus className="w-4 h-4" />
            Yeni Proje Ekle
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader className="h-24 bg-muted/50"></CardHeader>
              <CardContent className="py-6"><div className="h-4 bg-muted rounded w-3/4"></div></CardContent>
            </Card>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5 pb-0 flex items-start justify-between">
                <Badge className={`${statusConfig[project.status]?.badge} font-semibold shadow-none border-0`}>
                  {statusConfig[project.status]?.label}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(project.createdAt), 'dd MMM yyyy', { locale: tr })}
                </div>
              </div>
              <CardHeader className="pt-4">
                <CardTitle className="line-clamp-2 leading-tight">
                  {project.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  {project.category.replace(/-/g, ' ')}
                </p>
              </CardHeader>
              
              <CardContent className="flex-1">
                {project.status === 'rejected' && project.adminFeedback && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4 flex items-start gap-2 border border-destructive/20">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-1">Geri Bildirim:</span>
                      <p className="line-clamp-3">{project.adminFeedback}</p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.problem}
                </p>
              </CardContent>
              
              <CardFooter className="p-4 bg-muted/20 border-t flex items-center justify-between gap-2">
                {project.status === 'approved' ? (
                  <Link href={`/projects/${project.id}`} className="w-full">
                    <Button variant="outline" className="w-full gap-2">
                      <ExternalLink className="w-4 h-4" /> Vitrinde Gör
                    </Button>
                  </Link>
                ) : (
                  <div className="flex w-full gap-2">
                    <Link href={`/dashboard/projects/${project.id}/edit`} className="flex-1">
                      <Button variant="default" className="w-full gap-2" disabled={project.status === 'pending' || project.status === 'approved'}>
                        <Edit2 className="w-4 h-4" /> Düzenle
                      </Button>
                    </Link>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon" className="shrink-0" disabled={project.status === 'approved'}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Projeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz. "{project.title}" projesi kalıcı olarak silinecektir.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(project.id)} className="bg-destructive hover:bg-destructive/90">
                            Evet, Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-card border rounded-2xl flex flex-col items-center">
          <div className="bg-primary/10 text-primary p-5 rounded-full mb-6">
            <Rocket className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Henüz Projeniz Yok</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            GençTek ekosistemine katılmak için ilk projenizi hemen ekleyin ve binlerce kişiye ulaşın.
          </p>
          <Link href="/dashboard/submit">
            <Button size="lg" className="font-bold px-8 shadow-md">
              <Plus className="w-5 h-5 mr-2" />
              İlk Projeni Oluştur
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
