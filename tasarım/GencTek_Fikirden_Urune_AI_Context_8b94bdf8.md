# Fikirden Ürüne Proje Vitrini - AI Master Context Document

## 1. Project Overview (Proje Özeti)
**Platform Name:** Fikirden Ürüne Proje Vitrini
**Target Audience:** GençTek ecosystem students (Konya & Afyonkarahisar) and tech enthusiasts.
**Purpose:** A platform where students can showcase their AI-assisted, Vibe Coding, and modern tech stack projects. It goes beyond a simple forum; it's a structured portfolio highlighting MVP/Prototype stages, AI usage transparency, and security/ethics compliance.

**AI Agent Role:** You are an expert Full-Stack Developer. You will use this document as your primary source of truth for architectural decisions, database schemas, and feature implementations.

---

## 2. Tech Stack & Architecture (Teknoloji Yığını)
*   **Frontend Library:** React 18+ (Strict Mode enabled)
*   **Language:** TypeScript (Strict typing required for all data models)
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (Mobile-first approach, modern UI)
*   **UI Components:** Shadcn/UI (Radix UI) or Headless UI (for accessible dropdowns, modals, tabs)
*   **Icons:** Lucide React
*   **Routing:** React Router DOM v6
*   **Form Management & Validation:** React Hook Form + Zod (Crucial for the complex project submission form)
*   **Backend / Database:** Firebase v10+ (Authentication, Firestore, Cloud Storage)
*   **State Management:** Zustand (for global states like user auth and UI themes)

---

## 3. Core Features & User Flows (Temel Akışlar)

### 3.1. Authentication (Kimlik Doğrulama)
*   **Methods:** Email & Password via Firebase Auth.
*   **Roles:** `guest` (unauthenticated), `student`, `admin`.

### 3.2. Public Showcase (Vitrin - Herkese Açık)
*   **Hero Section:** Dynamic stats counters (Total Projects, Konya Projects, Afyonkarahisar Projects, AI Supported).
*   **Project Grid/List:** Displays only `status: "approved"` projects.
*   **Filters:** By City (Konya/Afyonkarahisar), Category (Web, Mobile, AI, IoT, vs.), and Project Stage (MVP, Prototip).
*   **Project Detail Page:** Comprehensive view including Problem/Solution, Tech Stack, Live/GitHub links, and a dedicated **"Yapay Zeka Kullanım Beyanı" (AI Usage Declaration)** and **"Güvenlik/Etik Beyanı" (Security/Ethics)** section.

### 3.3. Student Dashboard (Öğrenci Paneli)
*   **Project Submission (Multi-step or Long Form):**
    *   *Step 1: Basics* (Title, Category, City, Stage, Description).
    *   *Step 2: Media* (Upload Cover Image & Screenshots to Firebase Storage).
    *   *Step 3: Tech & Links* (Tech tags, GitHub URL, Demo URL).
    *   *Step 4: AI & Ethics* (Mandatory checklist for security, explicit declaration of AI tools used and how they were verified).
*   **Manage Projects:** Edit (if rejected or draft), Delete.

### 3.4. Admin Dashboard (Yönetici Paneli)
*   **Review Queue:** List of `status: "pending"` projects.
*   **Actions:** Approve (moves to public showcase), Reject, Request Changes (with feedback note).

---

## 4. Firestore Database Schema (Veritabanı Modeli)

```typescript
// Collection: users
interface User {
  uid: string; // Firebase Auth UID
  email: string;
  fullName: string;
  school: string;
  city: 'Konya' | 'Afyonkarahisar';
  role: 'student' | 'admin';
  createdAt: Timestamp;
}

// Collection: projects
interface Project {
  id: string; // Auto-generated Document ID
  studentId: string; // Ref -> users.uid
  title: string;
  slug: string; // For SEO-friendly URLs
  category: 'web-tasarim-ve-gelistirme' | 'mobil-uygulama' | 'oyun-gelistirme' | 'yapay-zeka';
  city: 'Konya' | 'Afyonkarahisar';
  stage: 'MVP' | 'Prototip';
  
  description: {
    problem: string;
    targetAudience: string;
    solution: string;
    futurePlans: string;
  };
  
  techStack: string[]; // e.g., ["React", "Vite", "Firebase"]
  
  links: {
    github: string;
    demo: string;
  };
  
  images: {
    coverUrl: string;
    screenshotUrls: string[];
  };
  
  // CRITICAL: Ethics & AI Declaration
  aiUsage: {
    isUsed: boolean;
    tools: string[]; // e.g., ["Cursor", "v0", "Gemini"]
    usageAreas: string[]; // e.g., ["Kod yazma", "Arayüz tasarımı"]
    verificationMethod: string; // How the student tested the AI output
  };
  
  securityAndEthics: {
    noRealPersonalData: boolean;
    noSecretsInGithub: boolean;
    copyrightCompliant: boolean;
  };
  
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  adminFeedback?: string; // If rejected or changes requested
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 5. Development Guidelines for AI Agents (AI Geliştirici Talimatları)

1.  **Component Architecture:** Always create modular components. Separate UI components (buttons, inputs) from logical containers.
2.  **Tailwind Best Practices:** Use utility classes for responsive design (`sm:`, `md:`, `lg:`). Maintain consistency with the GençTek branding (Red `#b91c1c`, Dark `#1f2937`, Light `#f9fafb`).
3.  **Firebase Security:** Never bypass Firestore rules in client logic. Always structure queries securely. Assume the database rules will restrict `pending` projects from unauthenticated users.
4.  **Form Validation:** Use Zod schemas for EVERY form. The AI Declaration and Security Checklists are non-negotiable and MUST be strictly validated before submission.
5.  **Error Handling:** Implement robust error handling (try/catch) for all Firebase operations and display user-friendly toast notifications (e.g., react-hot-toast).
6.  **No Hallucinated Imports:** Do not import packages that are not explicitly installed in the `package.json`. If a new package is needed, provide the `npm install` command first.
