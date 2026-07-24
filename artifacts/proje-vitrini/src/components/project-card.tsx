import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MapPin, Layers, Clock, Eye } from 'lucide-react';
import { ProjectSummary, ProjectSummaryCategory, ProjectSummaryCity, ProjectSummaryStage, ProjectSummaryStatus } from '@workspace/api-client-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ProjectCardProps {
  project: ProjectSummary;
  showStatus?: boolean;
}

const categoryLabels: Record<string, string> = {
  'web-tasarim-ve-gelistirme': 'Web Tasarım',
  'mobil-uygulama': 'Mobil Uygulama',
  'oyun-gelistirme': 'Oyun Geliştirme',
  'yapay-zeka': 'Yapay Zeka',
};

const statusConfig: Record<string, { label: string; colorClass: string }> = {
  approved: { label: 'Onaylandı', colorClass: 'bg-[#10b981] text-white hover:bg-[#10b981]/90' },
  pending: { label: 'Bekliyor', colorClass: 'bg-[#f59e0b] text-white hover:bg-[#f59e0b]/90' },
  rejected: { label: 'Reddedildi', colorClass: 'bg-[#ef4444] text-white hover:bg-[#ef4444]/90' },
  draft: { label: 'Taslak', colorClass: 'bg-[#6b7280] text-white hover:bg-[#6b7280]/90' },
};

export function ProjectCard({ project, showStatus = false }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 group cursor-pointer">
        <div className="relative aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
          {project.coverUrl ? (
            <img 
              src={project.coverUrl} 
              alt={project.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`flex flex-col items-center justify-center w-full h-full text-muted-foreground p-6 text-center ${project.coverUrl ? 'hidden' : ''}`}>
            <Layers className="h-10 w-10 mb-2 opacity-20" />
            <span className="text-sm font-medium opacity-50">{categoryLabels[project.category] || project.category}</span>
          </div>
          
          {showStatus && project.status && (
            <div className="absolute top-3 right-3 z-10">
              <Badge className={`font-semibold shadow-sm ${statusConfig[project.status]?.colorClass || ''}`}>
                {statusConfig[project.status]?.label || project.status}
              </Badge>
            </div>
          )}
        </div>
        
        <CardHeader className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-xs font-medium text-muted-foreground border-muted-foreground/30">
              {categoryLabels[project.category] || project.category}
            </Badge>
            {project.aiUsage?.isUsed && (
              <Badge className="bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 gap-1 font-medium shadow-sm">
                <Bot className="w-3 h-3" />
                <span className="hidden sm:inline">YZ Destekli</span>
                <span className="sm:hidden">YZ</span>
              </Badge>
            )}
          </div>
          <h3 className="font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground font-medium mt-1">
            {project.studentName}
          </p>
        </CardHeader>
        
        <CardContent className="p-5 pt-0 flex-1 flex flex-col gap-4">
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {project.techStack?.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-secondary/50 text-xs px-2 py-0.5 rounded-sm">
                {tech}
              </Badge>
            ))}
            {project.techStack?.length > 4 && (
              <Badge variant="secondary" className="bg-secondary/50 text-xs px-2 py-0.5 rounded-sm">
                +{project.techStack.length - 4}
              </Badge>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{project.city}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>{project.stage}</span>
            </div>
            <div className="flex items-center gap-1.5" title={format(new Date(project.createdAt), 'dd MMM yyyy', { locale: tr })}>
              <Clock className="w-3.5 h-3.5" />
              <span>{format(new Date(project.createdAt), 'dd MMM yyyy', { locale: tr })}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
