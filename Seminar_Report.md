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
| **AI** | Artificial Intelligence |
| **RLS** | Row-Level Security |
| **3NF** | Third Normal Form |
| **DBMS** | Database Management System |
| **JSON** | JavaScript Object Notation |
| **GSAP** | GreenSock Animation Platform |
| **LLM** | Large Language Model |
| **API** | Application Programming Interface |

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

### 2.1 GOALS AND DELIVERABLES
The primary goal of the LexDoc AI project is to design and implement an intelligent, user-friendly platform that automatically generates concise summaries of uploaded documents while extracting critical timelines and maintaining the core context of the original content. The system aims to simplify the process of distributing and reading relevant academic information through a scalable pipeline of serverless services like the LlamaParse API and OpenRouter LLMs.

**Major Goals**
1. Develop a full-stack web application that allows users to upload, summarize, and manage PDF and DOCX files.
2. Integrate advanced AI summarization and deterministic data extraction models using cloud-based APIs (OpenRouter, LlamaParse) via serverless Deno Edge Functions.
3. Implement ironclad document management, including robust storage, retrieval, and automated lifecycle deletion (e.g., via `pg_cron`), managed entirely within PostgreSQL.
4. Design an aesthetically premium, intuitive React-based interface utilizing liquid glassmorphism, GSAP micro-animations, and responsive navigation for a seamless user experience.
5. Ensure data privacy and institutional security by keeping unauthorized users from accessing inter-departmental documents through un-bypassable Row-Level Security (RLS).
6. Provide a scalable serverless architecture, eliminating infrastructure cold-starts and allowing for instant backend responsiveness during concurrent uploads.

**Expected Deliverables**
- A fully functional LexDoc AI document management web application.
- Integrated multi-modal AI engine for abstractive text summarization and automatic event mapping.
- Secure Supabase PostgreSQL database schema equipped with strict RLS policies, audit log triggers, and an automated data purging system.
- A complete visual frontend demonstrating cutting-edge UI/UX paradigms implemented over standard structural elements.
- A comprehensive project report with design, implementation, and system performance documentation.

### 2.2 TECHNICAL OBJECTIVES
The technical objectives of this project focus on the engineering and implementation aspects that enable reliable, scalable, and highly intelligent summarization. These objectives define the technological foundation on which LexDoc AI is built.

**1. Frontend Development (React & Vite):**
- Develop an engaging, responsive, and accessible user interface focusing on premium aesthetics.
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

# CHAPTER 3: PROPOSED SYSTEM

LexDoc AI is proposed as an intelligent multi-modal platform. The architecture shifts the paradigm by placing immense structural integrity strictly inside the target PostgreSQL database utilizing Supabase.
- **Frontend Layer:** Built using React, Vite, GSAP, and Lenis for aggressive visual fidelity.
- **Backend Edge Functions:** Deno-based custom edge functions intercept uploaded documents. 
- **Processing Engine:** LlamaParse API decodes complex PDFs, while a dedicated `parse-docx` logic structures Microsoft Word. The data is transferred via a sequential array to the `arcee-ai/trinity-large-preview:free` model which creates contextually-aware summaries.
- **Database Layer:** Supabase manages a 3NF scheme. RLS ensures logical isolation matching the physical users. Automated `pg_cron` functions routinely sweep and delete aged documents beyond their 150-day TTL.

---

# CHAPTER 4: DESIGN PHASE

### Table: Model Fallback Comparisons
| Representative Approaches | Advantages |
|---------------------------|------------|
| **Arcee AI: Trinity Large** | High precision summarization, handles large academic texts gracefully. |
| **Gemini 2.0 Flash** | Lightning-fast speeds; acts as a hyper-resilient instantaneous fallback. |
| **LlamaParse API** | Extracts pristine markdown maintaining tabular layouts where standard OCR fails. |
| **Native Mammoth parser** | Allows native buffer transformation for `.docx` bypassing API latencies. |

### Algorithm: Deterministic Event Extraction
**Procedure**: `PROCESS_EVENTS(raw_ai_array, today_ist)`
1. Let `U` denote the set of all extracted event rows outputted by the LLM.
2. Parse dates natively in TypeScript and assess if the Date >= `today_ist`.
3. Filter out past events to clean the memory table.
4. Classify event keywords deterministically (e.g., EXAM, DEADLINE).
5. Detect sequential ranges (If event dates map sequentially over 3 or more days, compress to a RANGE object encompassing `start_date` and `end_date`).
6. Insert strictly formatted JSON into the `events` table.

---

# CHAPTER 5: DESIGN DIAGRAMS

The architecture reflects a typical serverless hierarchy:
1. **Client Browser (React/GSAP)** interfaces directly with Supabase via the `supabase-js` client. 
2. **Supabase Auth** returns a valid JWT mapped to a `role_id` and `dept_id`.
3. Frontend triggers **Supabase Storage** to save raw Document Blobs.
4. Frontend invokes **Edge Functions** over HTTPS.
5. Edge Functions communicate externally to **OpenRouter** and **LlamaParse**, then write deterministically to the underlying **PostgreSQL** database schemas mapping events and logs.

---

# CHAPTER 6: REQUIREMENTS

### HARDWARE REQUIREMENTS
1. Processor: Intel core i3 or compatible and above
2. RAM: 4GB and above
3. Hard Disk: Minimum 50GB storage

### SOFTWARE REQUIREMENTS
1. Operating System: Windows, Ubuntu, or macOS
2. Languages: TypeScript, JavaScript, SQL, CSS
3. Frameworks & Tools: React 18, Vite, Deno Runtime, GSAP, Node.js
4. Database: PostgreSQL (Supabase Managed)

---

# CHAPTER 7: EXPECTED RESULTS

The implementation is expected to successfully ingest unstructured academic documents and automatically produce human-readable summaries instantly. The database will silently execute Row-Level filtering, meaning unauthorized students cannot manipulate URL parameters to read administrative documents. The `pg_cron` system will silently regulate database bloat, and triggers will actively map malicious and innocent uploads alike inside un-bypassable Audit Logs safely inside PostgreSQL.

---

# CHAPTER 8: CONCLUSION

LexDoc AI showcases the immense viability of combining rigorous academic theory regarding classical Database Normalization (3NF) and Trigger programming with bleeding-edge functional paradigms of Serverless Edge Computing and Large Language Models. By resolving the vulnerabilities of standard centralized servers and mitigating the hallucination risks of generic AI prompting, LexDoc AI emerges as a mathematically secure, wildly efficient, and visually stunning standard for educational institutional management.
