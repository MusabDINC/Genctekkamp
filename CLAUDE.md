# CLAUDE.md

## Proje
**Fikirden Ürüne Proje Vitrini** — GençTek ekosistemi (Konya & Afyonkarahisar) öğrencilerinin AI-destekli / Vibe Coding projelerini sergilediği vitrin platformu. Basit bir forum değil; MVP/Prototip aşaması, AI kullanım şeffaflığı ve güvenlik/etik uyumunu öne çıkaran yapılandırılmış bir portföy.

Bu depo şu an **greenfield** (kod yok). Aşağıdaki kurallar ilk iskelet kurulumundan itibaren geçerlidir.

## Öncelik
1. Kullanıcı talebi / task
2. Bu dosya
3. `GencTek_Fikirden_Urune_AI_Context_8b94bdf8.md` (ürün/veri modeli kaynağı)
4. `gemini-code-1784915281283.md` (UI/UX tasarım sistemi kaynağı)

---

## Tech Stack

- **Frontend:** React 18+ (Strict Mode), TypeScript (strict), Vite
- **Styling:** Tailwind CSS, mobile-first
- **UI Components:** Shadcn/UI (Radix UI) veya Headless UI
- **Icons:** Lucide React
- **Routing:** React Router DOM v6
- **Form/Validation:** React Hook Form + Zod
- **Backend/DB:** Firebase v10+ (Auth, Firestore, Cloud Storage)
- **State Management:** Zustand (auth, tema gibi global state'ler için)
- **Bildirim:** react-hot-toast (veya benzeri) — tüm Firebase işlemlerinde kullanıcı dostu hata/başarı mesajı

Yeni state kütüphanesi, CSS framework'ü veya backend servisi ekleme; yukarıdaki stack sabittir.

---

## Mimari Kurallar

- **Modüler component yapısı:** UI component'leri (button, input, badge) ile container/logic component'lerini ayır.
- **Sayfa/feature bazlı klasörleme** öner (örn. `src/features/projects/`, `src/features/auth/`), tek dev seviyesinde generic yapı kurma.
- **Firebase güvenliği:** Firestore kurallarını client tarafında asla bypass etme. `pending` statüsündeki projeler unauthenticated kullanıcıya görünmemeli — bu varsayımla query yaz, Firestore Security Rules ile de doğrula.
- **Zod şeması her form için zorunlu.** Özellikle AI Beyanı ve Güvenlik/Etik checklist alanları — bunlar olmadan submit engellenir.
- **Hayali import yok:** `package.json`'da olmayan paketi import etme; yeni paket gerekiyorsa önce `npm install` komutunu belirt.
- **Hata yönetimi:** Tüm Firebase işlemleri try/catch içinde; kullanıcıya toast ile bildirim.

---

## Roller ve Auth

- **Yöntem:** Firebase Auth — Email & Password
- **Roller:** `guest` (giriş yapmamış) · `student` · `admin`
- Rol bazlı yönlendirme/route guard React Router v6 üzerinde kurulur; admin sayfaları student'a kapalı.

---

## Firestore Veri Modeli (Yetkili Kaynak: AI Context dokümanı)

### `users`
```typescript
interface User {
  uid: string;
  email: string;
  fullName: string;
  school: string;
  city: 'Konya' | 'Afyonkarahisar';
  role: 'student' | 'admin';
  createdAt: Timestamp;
}
```

### `projects`
```typescript
interface Project {
  id: string;
  studentId: string; // -> users.uid
  title: string;
  slug: string;
  category: 'web-tasarim-ve-gelistirme' | 'mobil-uygulama' | 'oyun-gelistirme' | 'yapay-zeka';
  city: 'Konya' | 'Afyonkarahisar';
  stage: 'MVP' | 'Prototip';

  description: {
    problem: string;
    targetAudience: string;
    solution: string;
    futurePlans: string;
  };

  techStack: string[];

  links: {
    github: string;
    demo: string;
  };

  images: {
    coverUrl: string;
    screenshotUrls: string[];
  };

  // Zorunlu — Etik & AI Beyanı
  aiUsage: {
    isUsed: boolean;
    tools: string[];
    usageAreas: string[];
    verificationMethod: string;
  };

  securityAndEthics: {
    noRealPersonalData: boolean;
    noSecretsInGithub: boolean;
    copyrightCompliant: boolean;
  };

  status: 'pending' | 'approved' | 'rejected' | 'draft';
  adminFeedback?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

Bu şemayı sessizce genişletme/daraltma; alan eklenecekse önce `GencTek_Fikirden_Urune_AI_Context_8b94bdf8.md` güncellenir.

---

## Temel Akışlar

### Herkese Açık Vitrin
- Hero: canlı sayaçlar (toplam proje, Konya, Afyonkarahisar, AI destekli)
- Proje listesi yalnızca `status: "approved"` gösterir
- Filtreler: Şehir, Kategori, Aşama (MVP/Prototip)
- Detay sayfası: Problem/Çözüm, Tech Stack, GitHub/Demo linkleri, **AI Kullanım Beyanı** ve **Güvenlik/Etik Beyanı** bölümleri zorunlu görünür

### Öğrenci Paneli
- Proje gönderimi 4 adımlı form: (1) Temel bilgiler (2) Medya/Storage upload (3) Tech & linkler (4) AI & Etik checklist
- Kendi projelerini düzenleme (yalnızca `rejected`/`draft` durumunda) ve silme

### Admin Paneli
- `pending` kuyruğu
- Aksiyonlar: Onayla (approved), Reddet (rejected + not), Değişiklik iste (adminFeedback ile)

---

## UI/UX Tasarım Sistemi (Yetkili Kaynak: gemini-code dokümanı)

- **Stil:** Minimal, developer-focused — GitHub/Vercel arayüzü hissiyatı
- **Erişilebilirlik:** Yüksek kontrast, belirgin hover/active/disabled durumları
- **Mobile-first:** Önce mobil, sonra `md:`/`lg:`/`xl:` breakpoint'leri

### Renk Paleti
| Amaç | Renk |
|---|---|
| Primary (Brand) | `#b91c1c` |
| Primary Hover | `#991b1b` |
| Primary Light (bg) | `#fee2e2` |
| App Background | `#f9fafb` / `#faf8f5` |
| Surface (Card/Modal) | `#ffffff` |
| Text Primary | `#111827` |
| Text Secondary | `#4b5563` |
| Border | `#e5e7eb` |
| Success (Approved) | `#10b981` |
| Warning (Pending/Draft) | `#f59e0b` |
| Info (AI Badge) | `#3b82f6` |

Yeni renk ekleme; bu palet dışına çıkma.

### Tipografi
- Font: Inter, Roboto veya sistem sans-serif (`font-sans`)
- Başlıklar: bold/semibold, tight tracking
- Body: 16px taban, `leading-relaxed`

### Bileşenler
- **Button:** `rounded-md`, belirgin padding, hover'da hafif gölge/renk koyulaşması
- **Card:** beyaz zemin, ince `border`, `shadow-sm`
- **Badge/Tag:** `rounded-full`, kategori/statü rengine göre (örn. "Yapay Zeka Destekli" → mavi/kırmızı ton)
- **Input:** belirgin çerçeve, focus'ta primary renkte ring efekti

---

## Çalışma Şekli

- İstenen işi yap, kapsamı büyütme
- Ürün/veri modeli sorularında `GencTek_Fikirden_Urune_AI_Context_8b94bdf8.md`'ye, görsel/stil sorularında `gemini-code-1784915281283.md`'ye referans ver
- Küçük, kolay revert edilebilir diff üret
- AI Beyanı ve Güvenlik/Etik checklist mantığında ekstra dikkatli ol — bu alanlar platformun temel amacı, gevşetilmez
- Emin olmadığını kesin yazma; önce sonucu söyle, sonra kısa gerekçe ver
