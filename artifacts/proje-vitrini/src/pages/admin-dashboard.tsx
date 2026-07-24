import React, { useState } from 'react';
import { useListAdminProjects, useApproveProject, useRejectProject, getListAdminProjectsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, ExternalLink, Bot, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link } from 'wouter';

export default function AdminDashboard() {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { data: projects, isLoading } = useListAdminProjects({ status: filter });
  const approveProject = useApproveProject();
  const rejectProject = useRejectProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleApprove = (id: number) => {
    approveProject.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminProjectsQueryKey() });
          toast({ title: 'Proje onaylandı ve vitrine eklendi.', className: 'bg-success text-white' });
        },
        onError: (err: any) => {
          toast({ title: 'Hata', description: err.error, variant: 'destructive' });
        }
      }
    );
  };

  const handleRejectSubmit = () => {
    if (!selectedProjectId) return;
    if (feedback.trim().length < 5) {
      toast({ title: 'Geri bildirim çok kısa', variant: 'destructive' });
      return;
    }

    rejectProject.mutate(
      { id: selectedProjectId, data: { feedback } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListAdminProjectsQueryKey() });
          toast({ title: 'Proje reddedildi ve öğrenciye geri bildirim gönderildi.' });
          setRejectModalOpen(false);
          setFeedback('');
        },
        onError: (err: any) => {
          toast({ title: 'Hata', description: err.error, variant: 'destructive' });
        }
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-primary">Yönetici Paneli</h1>
        <p className="text-muted-foreground">Gönderilen projeleri inceleyin ve onaylayın.</p>
      </div>

      <div className="flex gap-2 border-b mb-6">
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${filter === 'pending' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Bekleyenler
        </button>
        <button 
          onClick={() => setFilter('approved')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${filter === 'approved' ? 'border-success text-success' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Onaylananlar
        </button>
        <button 
          onClick={() => setFilter('rejected')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${filter === 'rejected' ? 'border-destructive text-destructive' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          Reddedilenler
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project.id} className="bg-card border rounded-xl p-5 flex flex-col md:flex-row gap-5 hover:shadow-sm transition-shadow">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="bg-muted font-medium">{project.category}</Badge>
                  {project.aiUsage?.isUsed && <Badge className="bg-[#3b82f6] shadow-sm"><Bot className="w-3 h-3 mr-1" /> YZ Destekli</Badge>}
                  <span className="text-xs text-muted-foreground ml-auto">{format(new Date(project.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}</span>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    <Link href={`/projects/${project.id}`} className="hover:text-primary hover:underline">{project.title}</Link>
                  </h3>
                  <div className="text-sm font-medium text-muted-foreground mt-1">
                    {project.studentName} ({project.studentEmail}) • {project.city}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {project.techStack.map(t => <Badge key={t} variant="secondary" className="text-xs py-0">{t}</Badge>)}
                </div>

                {project.status === 'rejected' && project.adminFeedback && (
                  <div className="mt-3 text-sm bg-destructive/10 text-destructive p-3 rounded-md border border-destructive/20 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div><span className="font-semibold block">Red Nedeni:</span> {project.adminFeedback}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-5 min-w-[140px]">
                {project.status === 'pending' && (
                  <>
                    <Button variant="default" className="w-full gap-2 bg-success hover:bg-success/90" onClick={() => handleApprove(project.id)}>
                      <Check className="w-4 h-4" /> Onayla
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setRejectModalOpen(true);
                      }}
                    >
                      <X className="w-4 h-4" /> Reddet
                    </Button>
                  </>
                )}
                
                {project.status === 'approved' && (
                  <Button variant="outline" className="w-full gap-2 text-muted-foreground" disabled>
                    <Check className="w-4 h-4 text-success" /> Onaylı
                  </Button>
                )}
                
                {project.status === 'rejected' && (
                  <Button variant="outline" className="w-full gap-2 text-muted-foreground" disabled>
                    <X className="w-4 h-4 text-destructive" /> Reddedilmiş
                  </Button>
                )}

                <Link href={`/projects/${project.id}`} className="w-full">
                  <Button variant="ghost" size="sm" className="w-full gap-2">
                    <ExternalLink className="w-4 h-4" /> İncele
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/30 border border-dashed rounded-xl">
          <p className="text-muted-foreground text-lg">Bu kategoride proje bulunmuyor.</p>
        </div>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Projeyi Reddet</DialogTitle>
            <DialogDescription>
              Lütfen öğrenciye projeyi neden reddettiğinizi ve neleri düzeltmesi gerektiğini anlatan bir geri bildirim yazın.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea 
              placeholder="Örn: Görseller yüklenmemiş, açıklama çok kısa vb." 
              className="h-32"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectModalOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleRejectSubmit} disabled={rejectProject.isPending}>
              Projeyi Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
