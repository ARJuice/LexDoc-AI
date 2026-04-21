<div align="center">

# LEXDOC AI: INTELLIGENT COLLEGE DOCUMENT MANAGEMENT SYSTEM

### A PROJECT REPORT

Submitted by

**ARJUN**

to

the APJ Abdul Kalam Technological University  
in partial fulfillment of the requirements for the award of the Degree  
of  
*Bachelor of Technology*  
*in*  
*Computer Science and Engineering*

**Department of Computer Science and Engineering**  
SAHRDAYA COLLEGE OF ENGINEERING AND TECHNOLOGY  
KODAKARA, THRISSUR - 680684

**December 2024**

</div>

---

<div align="center">

## DECLARATION
</div>

We, the undersigned, hereby declare that the project report “LexDoc AI: Intelligent College Document Management System”, submitted for partial fulfillment of the requirements for the award of degree of Bachelor of Technology of the APJ Abdul Kalam Technological University, Kerala is a bonafide work done by us under guidance. This submission represents our ideas in our own words and where ideas or words of others have been included; we have adequately and accurately cited and referenced the original sources. We also declare that we have adhered to the ethics of academic honesty and integrity and have not misrepresented or fabricated any data or idea or fact or source in our submission. We understand that any violation of the above will be a cause for disciplinary action by the institute and/or the University.

<div align="right">
<b>ARJUN</b>
</div>

<b>Kodakara</b>

---

<div align="center">

## DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
### SAHRDAYA COLLEGE OF ENGINEERING AND TECHNOLOGY, KODAKARA, THRISSUR

## BONAFIDE CERTIFICATE
</div>

This is to certify that the project report entitled **LEXDOC AI: INTELLIGENT COLLEGE DOCUMENT MANAGEMENT SYSTEM** submitted by **ARJUN** to the APJ Abdul Kalam Technological University in partial fulfillment of the requirements for the award of the Degree of Bachelor of Technology in Computer Science and Engineering is a bonafide record of the project work carried out by him under our guidance and supervision. This report in any form has not been submitted to any other University or Institute for any other purpose.

<div align="right">
<b>HEAD OF THE DEPARTMENT</b><br>
Dr. Manishankar<br>
Professor
</div>

<b>Kodakara</b>

---

## ACKNOWLEDGMENT

We would like to express our immense gratitude and profound thanks to all those who helped us to make this project a great success. We express our gratitude to the almighty God for all the blessings endowed on us.

We express our sincere thanks to our Executive Director **Rev. Fr. George Pareman** and Principal **Dr. Ramkumar S** for providing us with such a great opportunity.

We also convey our gratitude to our Head of the Department **Dr. Manishankar** for having given us a constant inspiration and suggestion. We extend our deep sense of gratitude to our project coordinators and guides for providing enlightening guidance and whole-hearted support through the project. It was their encouragement that helped us to complete the project. We are extremely thankful and indebted to our friends and parents who supported us in all aspects of the project work.

<div align="right">
<b>ARJUN</b>
</div>

---

## INSTITUTIONAL VISION, MISSION AND QUALITY POLICY

### INSTITUTIONAL VISION
Evolve as a leading technology institute to create high caliber leaders and innovators of global standing with strong ethical values to serve the industry and society.

### INSTITUTIONAL MISSION
Provide quality technical education that transforms students to be knowledgeable, skilled, innovative and entrepreneurial professionals. Collaborate with academia and industry around the globe, to strengthen the education and research ecosystem. Practice and promote high standards of professional ethics, good discipline, high integrity and social accountability with a passion for holistic excellence.

### QUALITY POLICY
We at Sahrdaya are committed to provide Quality Technical Education through continual improvement and by inculcating Moral & Ethical values to mould into Vibrant Engineers with high Professional Standards. We impart the best education through the support of competent & dedicated faculties, excellent infrastructure and collaboration with industries to create an ambience of excellence.

---

## DEPARTMENTAL VISION, MISSION, PEOs, PO AND PSOs

### Departmental Vision
To be a nationally recognized centre for quality education and research in diverse areas of computer science engineering with a strong social commitment.

### Department Mission
- Impart relevant technical knowledge, skills and attributes along with values and ethics.
- Enhance creativity and quality in research through project based learning environment.
- Mould Computer Science Engineering Professionals in synchronization with the dynamic industry requirements.
- Inculcate essential leadership qualities coupled with commitment to the society.

### Programme Educational Objectives (PEOs)
| PEO | Description |
|-----|-------------|
| **PEO1** | Take up challenging careers in suitable corporate, business or educational sectors across the world, in multi-cultural work environment. |
| **PEO2** | Continuously strive for higher achievements in life keeping moral and ethical values such as honesty, loyalty, good relationship and best performance, aloft. |
| **PEO3** | Be knowledgeable and responsible citizens with good team-work skills, competent leadership qualities and holistic values. |

### Programme Specific Objectives (PSOs)
| PSO | Description |
|-----|-------------|
| **PSO1** | To nurture students with technically inquisitive attitude so that any real-world problem could be tackled with a problem solving perspective. |
| **PSO2** | To develop professionals with excellent exposure to the latest technologies to design high quality products unique in innovation, software, security, making high impact on society. |
| **PSO3** | To enhance knowledge in practical implementation of technology. |

### Programme Outcomes (POs)
1. **Engineering knowledge**
2. **Problem analysis**
3. **Design/development of solutions**
4. **Conduct investigations of complex problems**
5. **Modern tool usage**
6. **The engineer and society**
7. **Environment and sustainability**
8. **Ethics**
9. **Individual and team work**
10. **Communication**
11. **Project management and finance**
12. **Life-long learning**

### COURSE OBJECTIVES
To develop skills in doing literature survey, technical presentation and report preparation.

### COURSE OUTCOMES
1. **CO1**: Envisage applications for societal needs.
2. **CO2**: Develop skills for analysis and synthesis of practical systems.
3. **CO3**: Learn to use new tools effectively and creatively.
4. **CO4**: Learns to carry out analysis and cost-effective, environmental friendly designs of engineering systems.
5. **CO5**: Develops the ability to write Technical / Project reports and oral presentation.

---

<div align="center">

## ABSTRACT

</div>

The administration of academic documents across various college departments is often marred by decentralized communication, causing students and faculty to miss critical deadlines or important materials. Traditional circulars lack structured visibility controls and are difficult to extract information from quickly. LexDoc AI addresses these challenges by offering a centralized, intelligent document management system designed explicitly for educational institutions. The system utilizes a hybrid authentication mechanism, robust 3NF relational PostgreSQL organization, and deep Row-Level Security (RLS) policies to ensure strict departmental document isolation. At its core, LexDoc AI integrates a dual Edge Function architecture powered by Deno that employs multi-modal AI (OpenRouter LLMs and LlamaParse API) to automatically summarize uploaded documents, seamlessly handle DOCX structures natively, and deterministically extract event dates and ranges into actionable JSON formats. Built on a React and Vite frontend heavily utilizing GSAP micro-animations for a liquid glassmorphism aesthetic, LexDoc AI guarantees that documents are securely hosted, intelligently processed, and promptly delivered without compromising on user experience or administrative tracking, supported natively by un-bypassable database audit triggers and automated `pg_cron` expiry tasks.

---

## LIST OF ABBREVIATIONS

| ABBREVIATION | DESCRIPTION |
|--------------|-------------|
| **3NF** | Third Normal Form |
| **AI** | Artificial Intelligence |
| **API** | Application Programming Interface |
| **BaaS** | Backend-as-a-Service |
| **DBMS** | Database Management System |
| **DDL** | Data Definition Language |
| **DOCX** | Office Open XML Document |
| **FK** | Foreign Key |
| **GSAP** | GreenSock Animation Platform |
| **HOD** | Head of Department |
| **JSON** | JavaScript Object Notation |
| **JWT** | JSON Web Token |
| **LLM** | Large Language Model |
| **OCR** | Optical Character Recognition |
| **PDF** | Portable Document Format |
| **PK** | Primary Key |
| **RBAC** | Role-Based Access Control |
| **RLS** | Row-Level Security |
| **UI** | User Interface |
| **UX** | User Experience |

---

# CHAPTER 1: INTRODUCTION

### GENERAL BACKGROUND
Educational institutions generate a massive volume of documents daily, including circulars, syllabus structures, event notices, administrative guidelines, and examination schedules. Traditionally, these files are circulated via decentralized and often fragmented methods such as email chains, physical bulletin boards, inter-departmental memos, or unmanaged messaging platforms like WhatsApp groups. This classic paradigm causes massive administrative inefficiencies. Documents frequently become lost in cluttered inboxes, critical deadlines are inadvertently missed due to a lack of proactive notifications, and administrators have absolutely no clear audit trail indicating who accessed what files and when. Furthermore, as the scale of an institution grows, the sheer volume of unstructured data makes it nearly impossible for students and faculty to quickly retrieve relevant historical information or piece together long-term academic timelines efficiently. The modern academic landscape demands a streamlined, digital-first approach to information dissemination.

### PROBLEM DEFINITION
The lack of a unified, intelligent structure means that there is very little visibility between cross-departmental entities, raising significant issues over document authenticity, version control, and security. Existing centralized solutions within many colleges are often overly simplistic—acting merely as digital dumpsters like shared Google Drive folders or basic static web portals. These systems critically lack automatic insight generation, meaning humans still have to manually read and parse every document. Moreover, they usually lack restrictive, granular role-based safeguards to prevent unauthorized access to sensitive materials. Furthermore, processing long textual documents (such as 10-page university regulations or detailed seminar schedules) demands excessive human effort to distill critical timelines, core messages, or actionable items. There is a glaring gap for a system that not only stores documents but actively understands and processes them to save time for all stakeholders.

### MOTIVATION
The primary motivation behind LexDoc AI is to eradicate the friction points and bottlenecks in academic communications by building a truly "smart" document repository. By integrating Large Language Models (LLMs) directly into the upload pipeline, we fundamentally bypass the need for human administrators or students to manually summarize notices, extract key points, or input vital dates into personal calendars. Our goal is to automate the mundane aspects of document management. Furthermore, considering the sensitive nature of academic data (e.g., examination papers, internal faculty memos, disciplinary notices), a paramount motivation is to integrate severe, un-bypassable Row-Level Security (RLS) at the database layer. This ensures that confidential files are mathematically protected from being viewable by standard student roles, securing the entire pipeline from end to end without relying purely on frontend logic which can be easily manipulated.

### OBJECTIVES
The core objectives of the LexDoc AI project are as follows:
- **Intelligent Processing**: Propose and implement an intelligent model that seamlessly manages both structured database entries and unstructured document files (PDFs, DOCX).
- **Automated Extraction**: Achieve highly precise information extraction (e.g., critical dates, date ranges, and event types) via a hybrid approach of deterministic TypeScript programming mixed with cutting-edge AI models.
- **Uncompromised Security**: Guarantee absolute data security and logical isolation by migrating access logic to the Database level (PostgreSQL Triggers, RLS policies), rather than relying on application-level checks.
- **Premium User Experience**: Deliver an aesthetically premium, highly engaging frontend user interface utilizing modern design principles like liquid glassmorphism, smooth scrolling, and GSAP micro-animations.
- **Automated Lifecycle Management**: Implement autonomous mechanisms (like `pg_cron`) to manage the lifecycle of documents, automatically purging expired or irrelevant files to maintain system efficiency and reduce storage costs.

---

# CHAPTER 2: OBJECTIVES

### 2.1 MAJOR GOALS
The primary goal of the LexDoc AI project is to design and implement an intelligent, user-friendly platform that automatically generates concise summaries of uploaded documents while extracting critical timelines and maintaining the core context of the original content. The system aims to simplify the process of distributing and reading relevant academic information through a scalable pipeline of serverless services like the LlamaParse API and OpenRouter LLMs.

**Target Objectives**
1. Develop a full-stack web application that allows users to upload, summarize, and manage PDF and DOCX files.
2. Integrate advanced AI summarization and deterministic data extraction models using cloud-based APIs (OpenRouter, LlamaParse) via serverless Deno Edge Functions.
3. Implement ironclad document management, including robust storage, retrieval, and automated lifecycle deletion (e.g., via `pg_cron`), managed entirely within PostgreSQL.
4. Design an aesthetically premium, intuitive React-based interface utilizing liquid glassmorphism, GSAP micro-animations, and responsive navigation for a seamless user experience.
5. Ensure data privacy and institutional security by keeping unauthorized users from accessing inter-departmental documents through un-bypassable Row-Level Security (RLS).
6. Provide a scalable serverless architecture, eliminating infrastructure cold-starts and allowing for instant backend responsiveness during concurrent uploads.

### 2.2 TECHNICAL OBJECTIVES
The technical objectives of this project focus on the engineering and implementation aspects that enable reliable, scalable, and highly intelligent summarization. These objectives define the technological foundation on which LexDoc AI is built.

**1. Frontend Development (React & Vite):**
- Develop an engaging, responsive, and accessible user interface focusing on premium aesthetics.
- Employ React lazy loading and component-level code splitting for core application sections to drastically minimize initial payload sizes and accelerate rendering.
- Implement robust features for secure file uploads, summary display, and calendar integration based on extracted event dates.
- Integrate the `supabase-js` client to handle real-time database subscriptions and secure backend communication.

**2. Backend Development (Supabase & Deno Edge Functions):**
- Create highly scalable, stateless serverless Edge Functions for intercepting document uploads securely.
- Handle varied document structures natively by extracting DOCX buffers locally and leveraging the LlamaParse API for complex PDF tables.
- Route cleaned markdown texts safely to the OpenRouter API (utilizing Arcee AI models with Gemini 2.0 Flash fallbacks) for context-aware AI summary and event processing.

**3. Database Management (PostgreSQL):**
- Store user documents, generated summaries, structured events, and system metadata securely in a fully normalized 3NF database schema.
- Implement automated database maintenance mechanisms, such as structured `events` tables and automatic data-aging deletion rules using `pg_cron`.
- Support and enforce strict departmental data isolation at the lowest level via Row-Level Security (RLS) constraints and tracking activity with trigger-based audit logging.

**4. AI and NLP Integration:**
- Implement precise abstractive summarization capable of parsing lengthy college circulars and regulations.
- Develop fallback systems to ensure the serverless functions utilize alternate endpoints locally or externally when prime models lack availability.
- Evaluate the returned AI text using TypeScript to deterministically strip structured JSON dates and parse sequential multi-day events logically.

**5. Security and Performance:**
- Use Supabase Auth paired with database mapping to restrict UI-level components and limit physical Database rows natively.
- Optimize serverless endpoint invocations to minimize wait-times and reduce overhead during large document upload loops.
- Avoid large backend scaling costs by pushing intensive machine-learning computations back to third-party endpoints, ensuring instant response times globally.

### 2.3 SKILL DEVELOPMENT
The development of the LexDoc AI project has provided the team with valuable exposure to a broad range of highly modern technical paradigms and professional skills that are actively sought in the software industry.

**Technical Skills Acquired:**
1. Full-stack modern web development using Next-Generation tooling like React 18, Vite, and Node.
2. Edge computing and lightweight backend API execution utilizing the Deno runtime over standard Python frameworks.
3. Advanced Multi-Modal AI integration, prompt engineering, and deterministic data extraction from vast unstructured data chunks.
4. Deep Relational Database design involving Third Normal Form (3NF), complex PostgreSQL trigger programming, and the programmatic enforcement of Row-Level Security.
5. High-fidelity UI/UX design implementation mapping utilizing bleeding-edge libraries like the GreenSock Animation Platform (GSAP) and Lenis for fluid, physics-based rendering.
6. Real-time logging and performance debugging using cloud deployment dashboards and Supabase studio metrics.

**Soft Skills and Team Skills:**
1. Architectural planning, weighing the trade-offs of monolithic backend servers against resilient serverless paradigms.
2. Analytical thinking and logical problem-solving while designing deterministic TypeScript algorithms to process dynamic human dates.
3. Effective documentation structuring and the translation of complex backend mechanics into comprehensible, visually supported technical reports.
4. Time management for meeting aggressive product milestones inside a strict deployment window.
5. Absolute adaptability in pivoting from traditional technologies to learning fresh ecosystem stacks rapidly to optimize execution speeds.
---

# CHAPTER 3: SCOPE AND DELIVERABLES

### 3.1 PROJECT SCOPE
The scope of the LexDoc AI project is constrained primarily to serving internal document management requirements within academic departments and collegiate institutions. It focuses heavily on digitizing and automating the workflow surrounding formal circulars, notifications, syllabi, and administrative documentation. The system encompasses the following core areas:

- **Intelligent Ingestion & Storage:** Supporting the seamless upload, parsing, and secure cloud storage of standard academic text formats, restricted initially to PDF and DOCX files to ensure processing reliability.
- **Automated AI Summarization:** Generating condensed, contextually-aware summaries from lengthy documents. This serves to drastically save reading time for administrators, faculty, and students who frequently need to parse multi-page files quickly.
- **Deterministic Data Extraction:** Automatically scanning for and mapping crucial information—such as internal deadlines, university exam schedules, and seminar dates—extracted directly from unstructured text strings into a highly structured database format suitable for a calendar view.
- **Role-Based Governance & Privacy:** Facilitating deep departmental data sovereignty. The application explicitly implements theoretical Role-Based Access Control (RBAC) logic at the database level. It establishes strict hierarchies guaranteeing that standard roles (e.g., student accounts) cannot mistakenly or maliciously bypass internal logic to access highly-classified circulars meant strictly for administrative layers.
- **Administrative Access Control:** Granting administrators comprehensive, dynamic command over institutional data access. This includes the implementation of granular view permissions, the robust capability to dynamically grant or revoke user privileges across the organization, and mechanisms to seamlessly execute secure bulk-insert operations for incoming documents and large student directories.

### 3.2 DELIVERABLES
To successfully fulfill the project's objectives and maintain its defined scope, the deployment encompasses the following distinct, tangible deliverables. Each deliverable serves as a foundational pillar for the architecture's final operational success:

- **Client Application:** A fully functional LexDoc AI document management web application acting as the primary user hub, accessible via any modern browser without requiring native desktop installations.
- **AI Processing Engine:** An integrated multi-modal AI engine orchestrated across Deno Edge Functions, configured seamlessly for abstractive text summarization and automatic event mapping using custom-tailored Large Language Models.
- **Database Architecture:** A fortified Supabase PostgreSQL database schema strictly equipped with custom Row-Level Security (RLS) policies, un-bypassable audit log triggers to track every file interaction, and an automated data purging `pg_cron` system to handle absolute document lifecycles.
- **Client Interface:** A complete visual frontend demonstrating cutting-edge UI/UX paradigms—particularly liquid glassmorphism, dynamic animations, and skeleton loaders—implemented over standard structural elements to grant users a modern, friction-less experience.
- **Technical Documentation:** A comprehensive project report containing rigorous design constraints, system flow algorithms, implementation analysis, and overall system performance documentation to be submitted for academic evaluation.

---

# CHAPTER 4: METHODOLOGY

### 4.1 DEVELOPMENT APPROACH & REQUIREMENT ANALYSIS
The LexDoc AI project follows an iterative, serverless-first development approach, prioritizing the shifting of core logic directly to the database layer and dynamic edge networks. Supabase was selected as the primary backend platform for PostgreSQL management, Edge Functions, and secure authentication flows. 

Through rigorous requirement analysis, the primary operational bottlenecks identified included handling unstructured academic files (PDFs and DOCX), the need for contextual summarization to save time, deterministic calendar extraction, and the necessity of un-bypassable security controls. By adopting a modular serverless paradigm, components could be built and tested independently before full unified integration, ensuring scalability and robust performance.

### 4.2 CORE ARCHITECTURE DESIGN
The system's architecture cleanly separates computational concerns across four distinct tiers:
1. **Frontend Interface:** A highly interactive React application styled with "Liquid Glass" aesthetics, communicating directly and securely with Supabase.
2. **Serverless Edge Layer:** Deno-based Edge Functions hosted by Supabase, serving as proxy intermediaries to handle API secrets and computationally intensive document extraction tasks.
3. **Relational Database:** A fully normalized PostgreSQL database utilizing Row-Level Security (RLS) to restrict unauthorized queries inherently.
4. **AI & Processing Endpoints:** Offloaded machine learning text extraction using LlamaParse and advanced LLMs (via OpenRouter) strictly invoked through secure edge functions.

<!-- IMAGE: System Architecture Flow -->

### 4.3 TOOLS AND TECHNOLOGIES STACK
The selection of tools and technologies for LexDoc AI was based on serverless reliability, absolute data isolation, and the ability to process unstructured documentation efficiently. 

**Frontend Tools**

| Tool | Purpose |
|------|---------|
| **React.js** | Core user interface design and component-based frontend framework |
| **Vite** | Build tool optimized for extremely fast hot-module-reloading and transpilation |
| **GSAP** | Advanced animation library establishing fluid "Liquid Glass" physics interfaces |

**Backend & Database Tools**

| Tool | Purpose |
|------|---------|
| **Supabase** | Primary Backend-as-a-Service (BaaS) coordinating auth, database, and edge functions |
| **PostgreSQL** | Relational database (3NF) managing strict Row-Level Security and triggers natively |
| **Deno Edge Functions** | Serverless TypeScript environment for intercepting API secrets and files securely |

**AI & Parsing Integration**

| Tool | Purpose |
|------|---------|
| **OpenRouter API** | Gateway orchestrating multi-modal abstractive models (Arcee AI, Gemini 2.0 Flash) |
| **LlamaParse API** | Pure proprietary cloud extraction endpoint for complex multi-column PDFs |
| **OCR.space API** | Dedicated fallback engine for unselectable, image-based legacy document scans |

The combination of these modern serverless technologies ensures that LexDoc AI remains highly scalable and infinitely isolated without the typical bottlenecks associated with localized physical servers.

### 4.4 DATABASE SCHEMA & ENTITY-RELATIONSHIP
To maintain absolute data integrity and eliminate redundancy, the database utilizes the Third Normal Form (3NF). The schema consists of interconnected structures dynamically linking hierarchical logic with document states. The core tables and their properties include:

- **`roles`**: `id` (PK), `name`, `access_level`
- **`departments`**: `id` (PK), `name`, `code`
- **`users`**: `id` (PK), `role_id` (FK), `dept_id` (FK), `username`, `email`, `password_hash`, `google_id`, `is_verified`, `bulk_delete_enabled`, `sr_no`, `semester`, `class`, `created_at`
- **`documents`**: `id` (PK), `uploader_id` (FK), `title`, `storage_bucket`, `mime_type`, `processing_status`, `is_general`, `uploaded_at`, `expiry_date`
- **`tags`**: `id` (PK), `name`, `type`, `weight`, `color`
- **`ai_cache`**: `id` (PK), `doc_id` (FK), `summary_text`, `model_used`, `created_at`, `updated_at`
- **`summaries`**: `id` (PK), `doc_id` (FK), `content`, `model_used`, `created_at`
- **`events`**: `id` (PK), `doc_id` (FK), `title`, `event_type`, `event_date`, `event_time`, `description`, `created_by_ai`, `created_at`, `start_date`, `end_date`
- **`notifications`**: `id` (PK), `user_id` (FK), `doc_id` (FK), `type`, `message`, `is_read`, `created_at`
- **`audit_logs`**: `id` (PK), `user_id` (FK), `doc_id` (FK), `action`, `details`, `timestamp`
- **`document_departments`**: `doc_id` (FK), `dept_id` (FK)
- **`document_tags`**: `doc_id` (FK), `tag_id` (FK)

The database strictly enforces the Third Normal Form (3NF) through these clearly defined tables. Core entities like `users` and `documents` maintain logical independence, utilizing primary keys and structured architectural attributes to store discrete data. To resolve complex many-to-many relationships organically without redundancy, explicit junction tables such as `document_departments` and `document_tags` act as intermediary connectors mapping corresponding foreign keys to base tables securely. This elegant configuration seamlessly bridges access constraints across organizational boundaries, ensuring hierarchical permissions defined in `roles` flow consistently securely throughout the distributed system without data duplication.

Below is the Entity-Relationship (ER) Diagram illustrating these specific relational connections natively:

<!-- IMAGE: Entity-Relationship Diagram (ERD) -->

### 4.5 DOCUMENT INGESTION & PARSING PIPELINE
To allow modern web browsers to interact with dense historical documents securely without requiring bulky client-side software dependencies, the system aggressively utilizes a complex serverless data parsing pipeline. Upon file upload to a secured Supabase storage bucket, edge functions capture the raw file buffer natively and determine the extraction approach based exclusively on file signature formats.

- **DOCX Processing:** Binary DOCX formats natively undergo conversion to structured Markdown representations strictly within dedicated serverless Deno runtimes. This actively maintains the original document's heading structures natively without consuming costly AI resources or requiring localized user-side desktop applications to render native text previews.
- **PDF Extraction:** Standard generic documents are explicitly delegated immediately to the cloud-based **LlamaParse API** for pristine document extraction. Conversely, if a native unselectable PDF or a stubborn legacy scan resists parsing effectively, the architecture instantly falls back via automatic error-catching mechanisms to map out text contents precisely utilizing the **OCR.space API**. 

This sophisticated ingestion methodology securely prevents end clients from downloading heavy processing binaries and strongly supports instantaneous mobile ecosystem execution capabilities natively.

### 4.6 IMPLEMENTATION
Implementation centralized around strictly configuring Postgres entities via standard DDL executions heavily supplemented by native database triggers. Serverless endpoints were programmed deterministically using TypeScript to bypass expensive monolithic server requirements completely.

### 4.7 SYSTEM TESTING
Testing frameworks fundamentally prioritized simulating proactive malicious cross-departmental operations aggressively to extensively validate backend database isolation integrity, and consistently evaluated the specific external API fallbacks routinely during highly simulated network congestion scenarios.



---

# CHAPTER 5: PROJECT ACTIVITIES

### 5.1 ROLE-BASED ACCESS CONTROL (RBAC) & GOVERNANCE
LexDoc AI implements an exceptionally deep permission framework utilizing four primary roles structurally coded directly into the database: 
- **Admin** (Priority 10)
- **Head of Department (HOD)** (Priority 7)
- **Teacher** (Priority 5)
- **Student** (Priority 1)

These roles intrinsically govern application capabilities dynamically mapping functionality to integer arrays. 
Leveraging powerful PostgreSQL Row-Level Security (RLS) policies, queries inherently restrict data contextually based directly on the active user’s encoded JSON Web Token properties. Access control operates physically at the database level; a student requesting sensitive documents natively fails because the SQL engine forcefully rejects the selection parameters before routing execution back to the client. Revoking or granting structural privileges simply requires administrators to manually modify `users.role_id` configurations, instantly enforcing complex security barriers effortlessly across all linked APIs globally.

<!-- IMAGE: User Roles & RBAC Architecture -->

### 5.2 AUTOMATED DOCUMENT LIFECYCLE & EXPIRY
To aggressively mitigate systematic database bloating across consecutive academic semesters, documents deliberately maintain highly dynamic lifecycles internally. While users may organically define native deletion boundaries upon specific document uploads, undefined files continuously inherit a strict **150-day (5-month) automatic expiry limit** dynamically fallback natively. 

This process operates absolutely autonomously leveraging the **`pg_cron`** Postgres extension perfectly. Scheduled on a persistent `0 * * * *` (hourly) cycle, the database continuously sweeps the active `documents` table completely, irrevocably purging any row explicitly exceeding its calculated `expiry_date`. Resultingly, this establishes highly efficient temporal data maintenance natively without requiring external monolithic server dependencies or active human maintenance.

### 5.3 SECURITY AUDITING & LOGGING
Absolute historical context tracking is fundamentally critical within structural document management systems. To guarantee complete oversight, the architecture intentionally implements an invisible `audit_document_changes` SQL trigger designed expressly to execute automatically on every `INSERT` or `DELETE` document operational phase definitively. 

This database-level mechanism seamlessly intercepts the `auth.uid()` identity directly from the connection environment to track behavioral modifications exactly, subsequently producing immutable chronological event logs describing exactly which user manipulated which document. Administrators possess a highly secure dashboard intentionally designed to query and monitor this `audit_logs` table selectively, granting institutional oversight robustly.

<!-- IMAGE: Admin Security & Auditing Dashboard -->

### 5.4 AI SUMMARIZATION & DETERMINISTIC EVENT EXTRACTION
The architectural core of the ingestion process securely integrates abstractive summarizations generated using multi-modal AI systems utilizing the OpenRouter protocol broadly. The underlying API systematically filters processed document text payloads sequentially through open-source language models. It strictly prioritizes advanced models (`arcee-ai/trinity-large-preview`) for deeply contextual reasoning logically while dynamically failing back to globally resilient infrastructures (`google/gemini-2.0-flash`) instantaneously upon any congestion timeout triggers.

To illustrate the deterministic data pipeline natively, AI-extrapolated event objects inherently undergo a complex sequential validation pass post-generation. Custom TypeScript algorithms structurally evaluate, filter, and correctly format hallucinatory LLM outputs natively to guarantee they definitively match structured JSON definitions before committing data functionally to the production layer.

### 5.5 NOTIFICATION & TAGGING ENGINE
LexDoc AI employs a heavily unified tagging paradigm seamlessly consolidating global `PRIORITY` metadata parameters, localized `LABEL` definitions, and uniquely custom user descriptors. The framework implements proactive automated notification hooks natively within PostgreSQL natively. 

As documents process correctly, native procedural SQL triggers naturally detect insertions against high-value metadata inputs (specifically “Urgent” or “High” tags). Upon interception, the database utilizes the underlying structural RBAC capabilities natively to determine all authorized users permitted to view the newly created document accurately and comprehensively inject localized targeted alerts directly into specific `notifications` tables instantly.

### 5.6 AUTHENTICATION INTERFACES
Authentication processes actively integrate highly robust Google OAuth methodologies managed entirely by Supabase Auth protocols natively. This structurally simplifies verification mechanisms completely ensuring internal persistent verification natively correlates precisely against authorized institutional Google Workspace credentials. 
By delegating initial password management entirely securely out to trusted global architectures, background systems silently manage token authorizations correctly. This completely mitigates localized JSON Web Token credential vulnerabilities from the end user while unequivocally verifying institutional hierarchy classifications perfectly instantly upon successful authentication handshakes.

### 5.7 GUI DESIGN & USER EXPERIENCE
The LexDoc AI Graphic User Interface was meticulously crafted organically focusing exclusively on removing interactive friction. Breaking visually distinct from historically generic educational layout models, the application implements a rich dark-themed "Liquid Glass" design aesthetic. Responsive micro-animations execute flawlessly utilizing the GSAP framework, structurally guiding user focus gracefully across intricate file uploads matrices, active summarization wait-states, and newly structured event parameters securely without generating blocking or highly aggressive alert popups inherently.

<!-- IMAGE: Client User Interface Display -->

### 5.8 INTEGRATION TESTING
Consistent with the architecture's modularity, system integrations were rigorously stress-tested across all active features. 
- **Database & Trigger Testing:** Validated the reliable, chronologically correct execution of `audit_document_changes` logs upon varying data uploads. The `pg_cron` document expiry mechanism was evaluated extensively by artificially fast-forwarding chron-cycles natively. 
- **AI Fallback Resilience:** Proactively forced OpenRouter API timeouts specifically to observe and measure the time required for Edge Functions to successfully and seamlessly establish secondary connections with Google's Gemini 2.0 Flash fallback structure.
- **Frontend Interactivity:** UI components were tested during high-latency extraction phases to evaluate visual rendering constraints dynamically. Skeleton loaders effectively mitigated rendering-blocking properties flawlessly, preserving absolute UX comfort.

---

# CHAPTER 6: RESULTS & FINDINGS

The implementation of the LexDoc AI platform definitively establishes an immensely scalable, serverless ecosystem successfully unified with an advanced multi-modal Artificial Intelligence engine. The project's most distinct achievement lies in systematically bypassing structurally heavy centralized processing servers by distributing workloads cleanly between Edge environments, sophisticated external AI parsing endpoints, and hyper-optimized frontend logic.

The architectural database enforcement produced mathematically superior results compared to standard application-layer security equivalents. By writing comprehensive Row-Level Security rules directly alongside native procedures like automated `pg_cron` routines and the strict `trigger_notify_on_urgent_document` functionality, the application scaled effectively operating autonomously.

The artificial intelligence framework continuously generated highly precise documentation insights. Integrated APIs flawlessly decoded intricate, multi-column collegiate administrative files using modern edge functions (`generate-summary` and `parse-docx`), smoothly transitioning data natively into machine-readable boundaries dynamically optimally for client experiences. Thus, LexDoc AI solidly transitions standard prototypes into a structurally dense and highly premium functional web-application organically.

---

# CHAPTER 7: CONCLUSION

The LexDoc AI initiative successfully fulfills its core objective of definitively modernizing internal institutional data distribution processes completely utilizing advanced distributed edge computing and highly accessible abstractive artificial intelligence. By intertwining an exquisitely refined frontend programmatic wrapper with an aggressively secured PostgreSQL environment, the system gracefully resolves the chronic systemic inefficiencies universally associated with physical documentation structures efficiently.

Through meticulously executing a Third Normal Form (3NF) relational framework, explicitly implementing un-bypassable database audit tracking natively, establishing dynamic time-to-live file expirations via background cron jobs predictably, and establishing deep model fallback hierarchies integrating next-generation Language Models perfectly, this deployment grants immense practical architectural observations.

As corporate entities and institutions progressively manage exponentially larger amounts of unstructured administrative data daily, comprehensive software architectures exactly like LexDoc AI fundamentally construct indispensable systemic operational frameworks. Future application iterations essentially possess unlimited scalable capability extending progressively securely toward mobile cross-platform compatibilities and institutional push-notification architectures broadly natively.
