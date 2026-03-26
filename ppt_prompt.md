# Prompt to Generate LexDoc AI Presentation

**Instructions:** Copy the text block below and paste it into an LLM (like ChatGPT, Claude, or Gemini) to generate the content for your LexDoc AI PowerPoint presentation.

---

**Copy below this line ↓**

I am preparing a PowerPoint presentation for my college project. Please generate ONLY the slide content (detailed bullet points) for each slide based on the technical details provided below. Keep the tone professional, highly technical, and focused on the complete architecture. Do not include or mention speaker notes.

**Project Title:** LexDoc AI - Intelligent College Document Management System
**Team Members:** Arjun (and add placeholders for others)
**Project Guide:** [Add Guide Name]

Please structure the presentation exactly as follows:

### Slide 1: Title Slide
- Project Title
- Complete details of team members & project guide

### Slide 2: Abstract
- A summary of what LexDoc AI is: A centralized, intelligent document management system designed for educational institutions.
- Key problems solved: Decentralized communication, missed deadlines, unauthorized access to sensitive documents.
- Value proposition: Automated document summarization, smart date/deadline extraction from unstructured files, and strict departmental visibility controls.

### Slide 3: Concepts Used in the Project
- **Row-Level Security (RLS) & 3NF Normalization:** Strict relational database design ensuring total data isolation and preventing anomalies.
- **Hybrid Authentication:** Google OAuth combined with domain-restricted email checks and custom credentials.
- **Multi-modal AI Pipeline:** Cloud-agnostic pipeline merging LlamaParse API (for pristine structure extraction) and OpenRouter LLMs.
- **Automated Database Triggers & pg_cron tasks:** Un-bypassable audit logging and automatic document expiry occurring purely at the database layer.
- **Smooth UX & Liquid Glassmorphism:** Providing a premium, modern aesthetic using advanced animations.

### Slide 4: Front end and Back end Details
- **Frontend:** Built with React, Vite. Styled with custom CSS targeting a "liquid glassmorphism" aesthetic. Uses GSAP and Lenis for smooth scrolling and advanced micro-animations.
- **Backend/Serverless:** Operated entirely on Supabase Edge Functions (Deno runtime).
- **AI Stack:** 
  - Extraction: LlamaParse API (with OCR.space fallback for difficult PDFs).
  - Summarization & Event Reasoning: OpenRouter API routing to 'Arcee AI: Trinity Large Preview' (as primary) with 'Gemini 2.0 Flash' as fallback.
- **Database:** PostgreSQL (managed natively by Supabase).

### Slide 5: Database Architecture & Core SQL Features
- Highlight the advanced PostgreSQL features implemented:
  - **Triggers (`update_modified_column`, `audit_document_changes`)**: Guaranteed `updated_at` modifications and completely un-bypassable audit logging on document `INSERT`/`DELETE`.
  - **`pg_cron` Automated Jobs (`delete-expired-documents`)**: Hourly scheduled jobs running inside the database to seamlessly sweep and delete documents past their 150-day TTL requirement.
  - **Row-Level Security (RLS)**: Enforcing dynamic departmental document isolation right at the database row level, preventing cross-department access without requiring middleware checks.
  - **Role-Based Access Control (RBAC)**: Hierarchical `access_level` checks (`Admin=10`, `HOD=7`, `Teacher=5`, `Student=1`).

### Slide 6: Created Tables with Schema Structure
- Summarize the heavy 3NF normalized relational schema:
  - `users`, `departments`, `roles`: The foundation of organizational routing and identity.
  - `documents`: Stores file metadata (mime_type, file_size), security classifications, and expiry.
  - `document_departments`, `document_tags`: Composite key junction tables enabling powerful many-to-many filtering.
  - `summaries`: Separate caching table isolating AI summaries mapped back to documents, reducing external LLM token usage.
  - `audit_logs`: Trigger-based immutable tracking tracking internal user actions.
  - `events`: Dynamic storage of AI-extracted entities (`DEADLINE`, `MEETING`, `EXAM`, `EVENT`, `RANGE`), fully supporting `start_date` and `end_date` arrays for multi-day schedules.
  - `notifications`: Broadcast system for urgent documents.

### Slide 7: Mapped SDG with Justification
- **SDG 4 (Quality Education):** LexDoc AI streamlines and secures access to critical educational and departmental documents, ensuring students and faculty never miss important deadlines or study materials.
- **SDG 9 (Industry, Innovation and Infrastructure):** Digitizes legacy paper workflows into a modern, highly secure, AI-integrated digital infrastructure that scales effortlessly across college departments.

Please generate the detailed slide bullet points based directly on these architectural facts. Do not add speaker notes.
