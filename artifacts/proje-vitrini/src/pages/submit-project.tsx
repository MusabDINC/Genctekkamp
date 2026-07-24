import React from 'react';
import { useLocation } from 'wouter';
import { useCreateProject, getListMyProjectsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { ProjectForm, ProjectFormValues } from '@/components/project-form';

export default function SubmitProject() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const { toast } = useToast();

  const handleSubmit = (status: 'draft' | 'pending', data: ProjectFormValues) => {
    createProject.mutate(
      {
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
      title="Yeni Proje Ekle"
      backHref="/dashboard"
      isSubmitting={createProject.isPending}
      onSubmit={handleSubmit}
      submitLabels={{ draft: 'Taslak Kaydet', publish: 'İncelemeye Gönder' }}
    />
  );
}
