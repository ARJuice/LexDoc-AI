# Project Diary for PBL courses

**Project Title:** LexDoc AI - Intelligent College Document Management System

**Team Members:**
1. Arjun
2. ____________________________________________________
3. ____________________________________________________
4. ____________________________________________________

**Name of the Course Faculty:** _______________________

**Start Date:** _________________  **End Date:** _________________

**Sustainable Development Goal (SDG) Alignment:**
- **Quality Education (SDG 4):** Streamlining and securing access to educational and departmental documents, enhancing learning resources and institutional efficiency.
- **Industry, Innovation and Infrastructure (SDG 9):** Building a modern, AI-integrated digital infrastructure for secure college document management.

---

## Weekly Log

### Week 1: Frontend Architecture & UI/UX Design
**Date:** _________________
**Tasks Completed:** 
- Setup Vite + React environment.
- Implemented professional finance/institution aesthetic with dark/light theme toggle.
- Integrated GSAP animations, Lenis smooth scrolling, and custom cursor.
**Challenges Faced:** 
- Ensuring smooth performance and avoiding layout thrashing with continuous animations and custom cursor trailing.
**Next Steps:** 
- Design and integrate the Supabase PostgreSQL database schema.
**Faculty Feedback & Suggestions:** 
____________________________________________________________________

### Week 2: Database Schema & Supabase Configuration
**Date:** _________________
**Tasks Completed:** 
- Designed relational database schema (3NF) with core tables: departments, roles, users, documents, tags, summaries.
- Configured Supabase project and mapped PostgreSQL instance.
- Implemented Row Level Security (RLS) policies for departmental access controls.
**Challenges Faced:** 
- Structuring the permissions for hybrid authentication and handling complex role-based visibility rules (Admin vs HOD vs Teacher vs Student).
**Next Steps:** 
- Develop authentication flow and API integration.
**Faculty Feedback & Suggestions:** 
____________________________________________________________________

### Week 3: Authentication & Core Features
**Date:** _________________
**Tasks Completed:** 
- Implemented hybrid auth (Google OAuth for initial verification + Username/Password).
- Created document upload logic and assigned standard user roles.
- Promoted Admin user (Arjun) via SQL to enable global document uploading.
**Challenges Faced:** 
- Managing state effectively for secure password handling and preventing duplicate OAuth accounts.
**Next Steps:** 
- Performance optimization and AI service integration.
**Faculty Feedback & Suggestions:** 
____________________________________________________________________

### Week 4: Performance Optimization & AI Insights Prep
**Date:** _________________
**Tasks Completed:** 
- Resolved database N+1 query issues.
- Implemented lazy loading for React components and memoized React contexts.
- Prepared the summaries table for the FastAPI/Ollama local LLM integration.
**Challenges Faced:** 
- Balancing initial load times with the heavy GSAP and frontend dependencies.
**Next Steps:** 
- Connect the FastAPI backend to the Ollama LLM for document summarization.
**Faculty Feedback & Suggestions:** 
____________________________________________________________________

---

## Mid-Semester / First Review Summary

**Current Status of Project:**
The frontend and core database architectures are complete and optimized. Authentication is fully functioning with strong RLS on Supabase. Foundational document upload functionality is active, with role-based access management ensuring correct document visibility. 

**Key Learnings & Improvements:**
- Mastered React performance optimization techniques (memoization, lazy loading).
- Gained deep understanding of PostgreSQL schema design and Supabase Row Level Security.
- Learned to model infrastructure for integrating local LLMs (Ollama) into a traditional web stack.

**Adjustments in Methodology:**
- Shifted from basic API-based permission checks to strict Database-level security (RLS) to enforce departmental boundaries at the lowest level reliably.

**SDG Impact Assessment:**
- Successfully digitized role-specific access controls, proving the feasibility of paperless departmental workflows (SDG 9) and making educational resources more accessible (SDG 4).

**Faculty Comments:**
____________________________________________________________________

---

## Final Review Summary

**Project Outcomes & Achievements:**
[To be filled at the end of the project]

**Challenges Overcome:**
[To be filled at the end of the project]

**Future Scope & Recommendations:**
- Extend the AI summarization to support multi-modal documents (images, scanned PDFs) via standard ingestion pipelines.
- Implemented an automated deadline & event extraction system combining LlamaParse and advanced reasoning LLMs (Arcee AI: Trinity Large Preview / Gemini-2.0-Flash), which compresses multi-day schedules automatically.

**Final SDG Impact Assessment:**
[To be filled at the end of the project]

**Faculty Final Comments:**
____________________________________________________________________

**Signature of Team Members:**
1. ______________________  2. ______________________  3. ______________________  4. ______________________  

**Faculty Signature:** ______________________
