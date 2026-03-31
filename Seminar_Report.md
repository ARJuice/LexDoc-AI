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

# CHAPTER 2: LITERATURE SURVEY
Current document management systems in colleges mostly rely on legacy infrastructure or basic Google Drive links. Studies show that centralized databases utilizing basic role tables are significantly prone to unauthorized access if internal API layers fail. Furthermore, while AI summarization is prevalent, traditional implementations involve heavy backend servers (e.g., Python FastAPI) which inherently suffer from massive cold starts and scaling costs when processing files on concurrent uploads. Research into serverless technologies indicates that utilizing Edge Functions (Deno runtime) massively offsets infrastructure delay, allowing lightweight client interactions directly routed to Cloud LLM APIs.

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
