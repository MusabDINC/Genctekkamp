import React from 'react';
import { useRoute, useLocation, Link } from 'wouter';
import {
  useGetProject,
  useUpdateProject,
  getGetProjectQueryKey,
  getListMyProjectsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ProjectForm, ProjectFormValues } from '@/components/project-form';

export default function EditProject() {
  const [, params] = useRoute('/dashboard/projects/:id/edit');
  const [, setLocation] = useLocation();
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const queryClient = useQueryClient();
  const updateProject = useUpdateProject();
  const { toast } = useToast();

  const { data: project, isLoading } = useGetProject(id, {
    query: {
      enabled: !!id,
      queryKey: getGetProjectQueryKey(id)
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  if (!project) {
    return <div className="p-8 text-center text-muted-foreground">Proje bulunamadı.</div>;
  }

  if (project.status === 'pending') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Panele Dön
          </Button>
        </Link>
        <div className="bg-muted/50 border border-dashed rounded-lg p-12 text-center text-muted-foreground">
          <p>İncelemedeki projeler düzenlenemez.</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (status: 'draft' | 'pending', data: ProjectFormValues) => {
    updateProject.mutate(
      {
        id,
        data: {
          ...data,
          status,
          githubUrl: data.githubUrl || undefined,
          demoUrl: data.demoUrl || undefined,
          coverUrl: data.coverUrl || undefined,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMyProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
          toast({
            title: status === 'pending' ? 'Proje İncelemeye Gönderildi' : 'Taslak Olarak Kaydedildi',
            description: 'Yönlendiriliyorsunuz...'
          });
          setLocation('/dashboard');
        },
        onError: (err: any) => {
          toast({ title: 'Hata', description: err.error || 'İşlem başarısız oldu.', variant: 'destructive' });
        }
      }
    );
  };

  return (
    <ProjectForm
      title={`Proje Düzenle: ${project.title}`}
      backHref="/dashboard"
      isSubmitting={updateProject.isPending}
      onSubmit={handleSubmit}
      submitLabels={{ draft: 'Taslak Kaydet', publish: 'İncelemeye Gönder' }}
      defaultValues={{
        title: project.title,
        category: project.category,
        city: project.city,
        stage: project.stage,
        problem: project.problem,
        targetAudience: project.targetAudience,
        solution: project.solution,
        futurePlans: project.futurePlans,
        techStack: project.techStack,
        githubUrl: project.githubUrl ?? '',
        demoUrl: project.demoUrl ?? '',
        coverUrl: project.coverUrl ?? '',
        screenshotUrls: project.screenshotUrls,
        aiUsage: project.aiUsage,
        securityAndEthics: project.securityAndEthics,
      }}
    />
  );
}
