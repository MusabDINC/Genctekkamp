import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateProject, getListMyProjectsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Save, Send, X, Plus, Bot, ShieldCheck, Link as LinkIcon, Image as ImageIcon, LayoutList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const formSchema = z.object({
  title: z.string().min(3, 'Proje adı en az 3 karakter olmalıdır'),
  category: z.enum(['web-tasarim-ve-gelistirme', 'mobil-uygulama', 'oyun-gelistirme', 'yapay-zeka'] as const, { required_error: 'Kategori seçiniz' }),
  city: z.enum(['Konya', 'Afyonkarahisar'] as const, { required_error: 'Şehir seçiniz' }),
  stage: z.enum(['MVP', 'Prototip'] as const, { required_error: 'Aşama seçiniz' }),
  problem: z.string().min(10, 'Problemi detaylı açıklayınız'),
  targetAudience: z.string().min(5, 'Hedef kitleyi belirtiniz'),
  solution: z.string().min(10, 'Çözümü detaylı açıklayınız'),
  futurePlans: z.string().min(10, 'Gelecek planlarınızı yazınız'),
  techStack: z.array(z.string()).min(1, 'En az bir teknoloji ekleyiniz'),
  githubUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  demoUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  coverUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  screenshotUrls: z.array(z.string().url('Geçerli bir URL giriniz')).optional(),
  aiUsage: z.object({
    isUsed: z.boolean().default(false),
    tools: z.array(z.string()).default([]),
    usageAreas: z.array(z.string()).default([]),
    verificationMethod: z.string().default(''),
  }),
  securityAndEthics: z.object({
    noRealPersonalData: z.boolean().refine(val => val === true, 'Bu alanı onaylamanız zorunludur'),
    noSecretsInGithub: z.boolean().refine(val => val === true, 'Bu alanı onaylamanız zorunludur'),
    copyrightCompliant: z.boolean().refine(val => val === true, 'Bu alanı onaylamanız zorunludur'),
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitProject() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createProject = useCreateProject();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      problem: '',
      targetAudience: '',
      solution: '',
      futurePlans: '',
      techStack: [],
      screenshotUrls: [],
      aiUsage: { isUsed: false, tools: [], usageAreas: [], verificationMethod: '' },
      securityAndEthics: { noRealPersonalData: false, noSecretsInGithub: false, copyrightCompliant: false }
    },
    mode: 'onChange',
  });

  const [techInput, setTechInput] = useState('');
  const [screenshotInput, setScreenshotInput] = useState('');
  const [aiToolInput, setAiToolInput] = useState('');
  const [aiAreaInput, setAiAreaInput] = useState('');

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>, field: 'techStack' | 'aiTools' | 'aiAreas') => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();
    
    if (field === 'techStack' && techInput.trim()) {
      const current = form.getValues('techStack');
      if (!current.includes(techInput.trim())) {
        form.setValue('techStack', [...current, techInput.trim()], { shouldValidate: true });
      }
      setTechInput('');
    } else if (field === 'aiTools' && aiToolInput.trim()) {
      const current = form.getValues('aiUsage.tools');
      if (!current.includes(aiToolInput.trim())) {
        form.setValue('aiUsage.tools', [...current, aiToolInput.trim()], { shouldValidate: true });
      }
      setAiToolInput('');
    } else if (field === 'aiAreas' && aiAreaInput.trim()) {
      const current = form.getValues('aiUsage.usageAreas');
      if (!current.includes(aiAreaInput.trim())) {
        form.setValue('aiUsage.usageAreas', [...current, aiAreaInput.trim()], { shouldValidate: true });
      }
      setAiAreaInput('');
    }
  };

  const handleRemoveTag = (field: 'techStack' | 'aiTools' | 'aiAreas', tag: string) => {
    if (field === 'techStack') {
      const current = form.getValues('techStack');
      form.setValue('techStack', current.filter(t => t !== tag), { shouldValidate: true });
    } else if (field === 'aiTools') {
      const current = form.getValues('aiUsage.tools');
      form.setValue('aiUsage.tools', current.filter(t => t !== tag), { shouldValidate: true });
    } else if (field === 'aiAreas') {
      const current = form.getValues('aiUsage.usageAreas');
      form.setValue('aiUsage.usageAreas', current.filter(t => t !== tag), { shouldValidate: true });
    }
  };

  const handleAddScreenshot = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (screenshotInput.trim()) {
      const current = form.getValues('screenshotUrls') || [];
      form.setValue('screenshotUrls', [...current, screenshotInput.trim()], { shouldValidate: true });
      setScreenshotInput('');
    }
  };

  const nextStep = async () => {
    const fieldsToValidateByStep: Record<number, any[]> = {
      1: ['title', 'category', 'city', 'stage', 'problem', 'targetAudience', 'solution', 'futurePlans'],
      2: ['coverUrl'],
      3: ['techStack', 'githubUrl', 'demoUrl'],
      4: ['securityAndEthics.noRealPersonalData', 'securityAndEthics.noSecretsInGithub', 'securityAndEthics.copyrightCompliant']
    };
    
    const isValid = await form.trigger(fieldsToValidateByStep[step]);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const submitProject = (status: 'draft' | 'pending') => async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await form.trigger();
    
    if (!isValid) {
      toast({ title: 'Hata', description: 'Lütfen zorunlu alanları doldurun.', variant: 'destructive' });
      return;
    }
    
    const data = form.getValues();
    
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

  const watchAiUsed = form.watch('aiUsage.isUsed');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-6 -ml-3 text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Panele Dön
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Yeni Proje Ekle</h1>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-2 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -z-10 -translate-y-1/2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>
          </div>
          
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2
                ${step === i ? 'bg-primary border-primary text-primary-foreground' : 
                  step > i ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-muted text-muted-foreground'}`}
            >
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-medium px-1">
          <span>Temel Bilgiler</span>
          <span>Görseller</span>
          <span>Teknoloji & Linkler</span>
          <span>Yapay Zeka & Etik</span>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card className="border shadow-sm">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                {step === 1 && <><LayoutList className="w-5 h-5 text-primary" /> Temel Bilgiler</>}
                {step === 2 && <><ImageIcon className="w-5 h-5 text-primary" /> Medya & Görseller</>}
                {step === 3 && <><LinkIcon className="w-5 h-5 text-primary" /> Teknoloji Yığını & Bağlantılar</>}
                {step === 4 && <><ShieldCheck className="w-5 h-5 text-primary" /> Yapay Zeka & Etik Beyanı</>}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              
              {/* STEP 1: Basics */}
              <div className={step === 1 ? 'space-y-6 block' : 'hidden'}>
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proje Adı *</FormLabel>
                    <FormControl><Input placeholder="Örn: Akıllı Tarım Asistanı" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="web-tasarim-ve-gelistirme">Web Tasarım</SelectItem>
                          <SelectItem value="mobil-uygulama">Mobil Uygulama</SelectItem>
                          <SelectItem value="oyun-gelistirme">Oyun Geliştirme</SelectItem>
                          <SelectItem value="yapay-zeka">Yapay Zeka</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="city" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Şehir *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Konya">Konya</SelectItem>
                          <SelectItem value="Afyonkarahisar">Afyonkarahisar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="stage" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aşama *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="MVP">MVP (Minimum Çalışan Ürün)</SelectItem>
                          <SelectItem value="Prototip">Prototip</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>

                <FormField control={form.control} name="problem" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çözülen Problem *</FormLabel>
                    <FormControl><Textarea className="h-24" placeholder="Projenizin çözdüğü temel problemi açıklayın..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hedef Kitle *</FormLabel>
                    <FormControl><Input placeholder="Örn: Çiftçiler, Üniversite Öğrencileri..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <FormField control={form.control} name="solution" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Çözüm ve Yaklaşım *</FormLabel>
                    <FormControl><Textarea className="h-32" placeholder="Problemi nasıl çözdüğünüzü ve benzersiz yanlarını anlatın..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                <FormField control={form.control} name="futurePlans" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gelecek Planları *</FormLabel>
                    <FormControl><Textarea className="h-24" placeholder="Projenin gelecekteki hedefleri ve eklenecek özellikler..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              {/* STEP 2: Media */}
              <div className={step === 2 ? 'space-y-6 block' : 'hidden'}>
                <div className="bg-muted/50 p-4 rounded-lg border text-sm text-muted-foreground mb-6">
                  Şu an için görsel yükleme desteklenmemektedir. Görsellerinizi Imgur, imgbb gibi servislere yükleyip direkt URL'lerini (https://.../resim.jpg) yapıştırabilirsiniz.
                </div>
                
                <FormField control={form.control} name="coverUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kapak Görseli URL'si</FormLabel>
                    <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                    <FormDescription>Proje kartlarında görünecek ana resim (16:9 önerilir).</FormDescription>
                    <FormMessage />
                    {field.value && (
                      <div className="mt-4 rounded-lg border overflow-hidden max-w-sm aspect-video bg-muted flex items-center justify-center">
                        <img src={field.value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    )}
                  </FormItem>
                )}/>

                <div className="space-y-4 pt-4 border-t">
                  <FormLabel>Ekran Görüntüleri (İsteğe Bağlı)</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Resim URL'si girin..." 
                      value={screenshotInput} 
                      onChange={e => setScreenshotInput(e.target.value)}
                      onKeyDown={e => { if(e.key === 'Enter') handleAddScreenshot(e as any) }}
                    />
                    <Button type="button" variant="secondary" onClick={handleAddScreenshot}>Ekle</Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {form.watch('screenshotUrls')?.map((url, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                        <img src={url} alt={`Screenshot ${idx}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="w-8 h-8 rounded-full"
                            onClick={() => {
                              const current = form.getValues('screenshotUrls') || [];
                              form.setValue('screenshotUrls', current.filter((_, i) => i !== idx));
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEP 3: Tech & Links */}
              <div className={step === 3 ? 'space-y-6 block' : 'hidden'}>
                <FormField control={form.control} name="techStack" render={() => (
                  <FormItem>
                    <FormLabel>Teknoloji Yığını *</FormLabel>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="React, Python, Firebase... (Yazıp Enter'a basın)" 
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => handleAddTag(e, 'techStack')}
                      />
                      <Button type="button" variant="secondary" onClick={(e) => handleAddTag(e, 'techStack')}>Ekle</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.watch('techStack').map((tag) => (
                        <div key={tag} className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm font-medium">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag('techStack', tag)} className="hover:text-destructive text-muted-foreground ml-1">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <FormField control={form.control} name="githubUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub Repo URL</FormLabel>
                      <FormControl><Input placeholder="https://github.com/..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="demoUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canlı Demo URL</FormLabel>
                      <FormControl><Input placeholder="https://..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </div>
              </div>

              {/* STEP 4: AI & Ethics */}
              <div className={step === 4 ? 'space-y-8 block' : 'hidden'}>
                <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl p-5">
                  <FormField control={form.control} name="aiUsage.isUsed" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-base flex items-center gap-2 font-bold text-[#3b82f6]">
                          <Bot className="w-5 h-5" /> Yapay Zeka Kullandınız mı?
                        </FormLabel>
                        <FormDescription>
                          Kod yazarken, içerik üretirken veya projenizin içinde LLM, Vibe Coding araçları kullandıysanız işaretleyin.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}/>

                  {watchAiUsed && (
                    <div className="mt-6 space-y-5 animate-in fade-in slide-in-from-top-4">
                      <div>
                        <FormLabel className="text-sm font-semibold mb-2 block">Kullanılan Araçlar (Cursor, ChatGPT, Claude vb.)</FormLabel>
                        <div className="flex gap-2">
                          <Input value={aiToolInput} onChange={e => setAiToolInput(e.target.value)} onKeyDown={e => handleAddTag(e, 'aiTools')} placeholder="Araç adı..." />
                          <Button type="button" variant="secondary" onClick={e => handleAddTag(e, 'aiTools')}>Ekle</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('aiUsage.tools').map((tag) => (
                            <div key={tag} className="flex items-center gap-1 bg-[#3b82f6]/20 text-[#3b82f6] px-3 py-1 rounded-full text-sm font-medium">
                              {tag}
                              <button type="button" onClick={() => handleRemoveTag('aiTools', tag)} className="hover:text-destructive ml-1"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <FormLabel className="text-sm font-semibold mb-2 block">Hangi Alanlarda Kullandınız?</FormLabel>
                        <div className="flex gap-2">
                          <Input value={aiAreaInput} onChange={e => setAiAreaInput(e.target.value)} onKeyDown={e => handleAddTag(e, 'aiAreas')} placeholder="Örn: Frontend kodlama, logo tasarımı..." />
                          <Button type="button" variant="secondary" onClick={e => handleAddTag(e, 'aiAreas')}>Ekle</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {form.watch('aiUsage.usageAreas').map((tag) => (
                            <div key={tag} className="flex items-center gap-1 bg-[#3b82f6]/20 text-[#3b82f6] px-3 py-1 rounded-full text-sm font-medium">
                              {tag}
                              <button type="button" onClick={() => handleRemoveTag('aiAreas', tag)} className="hover:text-destructive ml-1"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <FormField control={form.control} name="aiUsage.verificationMethod" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Doğrulama Yöntemi</FormLabel>
                          <FormControl><Textarea placeholder="Yapay zekanın ürettiği sonuçları nasıl doğruladınız/test ettiniz?" className="h-20 bg-background" {...field} /></FormControl>
                        </FormItem>
                      )}/>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="font-bold text-lg border-b pb-2">Güvenlik ve Etik Beyanı</h3>
                  
                  <FormField control={form.control} name="securityAndEthics.noRealPersonalData" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg bg-card">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" /></FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="font-medium text-sm leading-snug cursor-pointer">
                          Projemde gerçek kullanıcılara ait hassas kişisel veriler (TCKN, gerçek adres, özel bilgiler) bulunmamaktadır. Test verileri kullanılmıştır.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="securityAndEthics.noSecretsInGithub" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg bg-card">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" /></FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="font-medium text-sm leading-snug cursor-pointer">
                          GitHub deposunda hiçbir şifre, API anahtarı (OpenAI, Firebase vb.) veya gizli bilgi paylaşılmamıştır.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}/>

                  <FormField control={form.control} name="securityAndEthics.copyrightCompliant" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-lg bg-card">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" /></FormControl>
                      <div className="space-y-1 leading-none flex-1">
                        <FormLabel className="font-medium text-sm leading-snug cursor-pointer">
                          Projede kullanılan tüm materyaller (kod, tasarım, içerik) telif haklarına ve açık kaynak lisanslarına uygundur.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}/>
                </div>
              </div>
            </CardContent>
            
            <div className="p-6 pt-4 border-t bg-muted/20 flex justify-between rounded-b-xl">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 1}>
                Geri
              </Button>
              
              {step < 4 ? (
                <Button type="button" onClick={nextStep} className="gap-2 font-semibold">
                  İleri <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={submitProject('draft')} disabled={createProject.isPending} className="gap-2">
                    <Save className="w-4 h-4" /> Taslak Kaydet
                  </Button>
                  <Button type="button" onClick={submitProject('pending')} disabled={createProject.isPending} className="gap-2 font-bold shadow-md">
                    <Send className="w-4 h-4" /> İncelemeye Gönder
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}

function CheckCircle2(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
}
