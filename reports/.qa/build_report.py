from pathlib import Path
import re,json,textwrap,hashlib
from docx import Document
from docx.shared import Inches,Pt,RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_SECTION_START
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from PIL import Image,ImageDraw,ImageFont

ROOT=Path.cwd(); OUT=ROOT/'reports'; A=OUT/'assets'; Q=OUT/'.qa'
schema=(ROOT/'database/migrations/001_schema.sql').read_text()
tables=dict(re.findall(r'CREATE TABLE (\w+) \((.*?)\) ENGINE=InnoDB;',schema,re.S))
evidence=json.loads((A/'sql-readonly-evidence.json').read_text(encoding='utf-8-sig'))
doc=Document(Q/'reference.docx')
for x in list(doc.element.body):
    if x.tag!=qn('w:sectPr'): doc.element.body.remove(x)
for section in doc.sections:
    section.page_width=Inches(8.5);section.page_height=Inches(11)
    section.top_margin=section.bottom_margin=section.left_margin=section.right_margin=Inches(.789583)
    for part in (section.header,section.footer):
        for p in part.paragraphs: p.clear()
for name in ['Normal','Title','Heading 1','Heading 2','Heading 3','Caption']:
    s=doc.styles[name];s.font.name='Times New Roman';s.font.color.rgb=RGBColor(0,0,0)
    s.font.size=Pt(18 if name=='Heading 1' else 14 if name=='Heading 2' else 16 if name=='Title' else 12)
doc.styles['Normal'].paragraph_format.line_spacing=1.15
doc.styles['Normal'].paragraph_format.space_after=Pt(7)
for name in ['Figure Caption','Table Caption']:
    if name not in doc.styles: doc.styles.add_style(name,1)
    doc.styles[name].base_style=doc.styles['Caption'];doc.styles[name].font.size=Pt(10)
    doc.styles[name].paragraph_format.keep_with_next=False
figures=[]; tablecaps=[]
def p(t='',style=None): return doc.add_paragraph(t,style)
def center(t,bold=False,size=None):
    x=p(t);x.alignment=1
    for r in x.runs:r.bold=bold;r.font.size=Pt(size or 12)
    return x
def page():doc.add_page_break()
def h(t,level=1):doc.add_heading(t,level)
def field(par,code):
    r=par.add_run(); f=OxmlElement('w:fldSimple');f.set(qn('w:instr'),code);r._r.addnext(f)
def cap(t,kind='Figure'):
    bucket=figures if kind=='Figure' else tablecaps;bucket.append(t)
    x=p(f'{kind} {len(bucket)}. {t}',kind+' Caption');x.alignment=1
    x.paragraph_format.keep_with_next=(kind=='Table')
def table(headers,rows,title):
    cap(title,'Table');t=doc.add_table(rows=1,cols=len(headers))
    borders=OxmlElement('w:tblBorders')
    for edge in ['top','left','bottom','right','insideH','insideV']:
        el=OxmlElement('w:'+edge);el.set(qn('w:val'),'single');el.set(qn('w:sz'),'4');borders.append(el)
    t._tbl.tblPr.append(borders)
    for c,v in zip(t.rows[0].cells,headers):c.text=str(v)
    repeat=OxmlElement('w:tblHeader');t.rows[0]._tr.get_or_add_trPr().append(repeat)
    for row in rows:
        for c,v in zip(t.add_row().cells,row):c.text=str(v)
    for row in t.rows:
        for c in row.cells:
            for pp in c.paragraphs:
                pp.paragraph_format.space_after=Pt(3)
                for r in pp.runs:r.font.size=Pt(9)
    if len(rows)<=9:
        for row in t.rows[:-1]:
            for c in row.cells:
                for pp in c.paragraphs:pp.paragraph_format.keep_with_next=True
    return t
def code(t):
    for line in t.strip().splitlines():
        if not line.strip() or line.lstrip().startswith('--'):continue
        for wrapped in textwrap.wrap(line.expandtabs(4),width=100,replace_whitespace=False,drop_whitespace=False) or ['']:
            x=p(wrapped);x.paragraph_format.space_after=Pt(0);x.paragraph_format.line_spacing=1
            for r in x.runs:r.font.name='Consolas';r.font.size=Pt(8)
    p()
def pic(path,title,width=6.8):
    doc.add_picture(str(path),width=Inches(width));cap(title)
def chapter(n,title):page();h(f'{n}. {title}')
def sqlfile(name):return (ROOT/'database'/name).read_text(encoding='utf-8-sig')
def clean_sql(s):return re.sub(r'^USE .*?;\s*','',s,flags=re.M).strip()

# Schema-derived complete mapping panels; cards preserve exact identifiers.
font='C:/Windows/Fonts/consola.ttf';bold='C:/Windows/Fonts/consolab.ttf'
for panel in range(4):
    names=list(tables)[panel*5:(panel+1)*5];im=Image.new('RGB',(1650,2050),'white');d=ImageDraw.Draw(im)
    d.text((35,20),f'OrganSync V2 relational mapping — panel {panel+1} of 4',font=ImageFont.truetype(bold,30),fill='black')
    y=85
    for name in names:
        lines=[]
        for line in tables[name].strip().splitlines():
            line=line.strip().rstrip(',')
            if line.startswith('CONSTRAINT'):
                m=re.search(r'FOREIGN KEY \((.*?)\) REFERENCES (.*?) ON DELETE',line)
                if m:lines.append('FK '+m[1]+' -> '+m[2]+' [RESTRICT]')
            else:
                col=line.split()[0];tags=' [PK]' if 'PRIMARY KEY' in line else ' [UNIQUE]' if 'UNIQUE' in line else ''
                lines.append(col+tags)
        if name=='waiting_list':lines+=['active_patient_id, active_organ_type_id [generated in 002]','UNIQUE active patient / organ type pair']
        height=62+len(lines)*27;d.rectangle((30,y,1620,y+height),outline='black',width=2)
        d.text((48,y+9),name,font=ImageFont.truetype(bold,28),fill='black')
        for i,line in enumerate(lines):d.text((48,y+50+i*27),line,font=ImageFont.truetype(font,23),fill='black')
        y+=height+18
    im.crop((0,0,1650,min(y+15,2050))).save(A/f'implemented-mapping-{panel+1}.png')

# Core entity relationship supplement, with all other FKs enumerated in Chapter 4.
im=Image.new('RGB',(1650,1050),'white');d=ImageDraw.Draw(im);F=ImageFont.truetype(bold,26)
nodes={'donor':(50,70),'organ':(570,70),'organ_type':(1120,70),'patient':(50,330),'waiting_list':(570,330),'organ_match':(1120,330),'compatibility_test':(1120,580),'organ_allocation':(570,580),'transplant':(50,580),'transplant_follow_up':(50,840),'active_organ_reservation':(570,840),'organ_transplant_record':(1120,840)}
for child,parent in [('organ','donor'),('organ','organ_type'),('waiting_list','patient'),('waiting_list','organ_type'),('organ_match','waiting_list'),('organ_match','organ'),('compatibility_test','organ_match'),('organ_allocation','organ_match'),('transplant','organ_allocation'),('transplant_follow_up','transplant'),('active_organ_reservation','organ_allocation'),('organ_transplant_record','transplant')]:
    x,y=nodes[child];a,b=nodes[parent];d.line((x+205,y+50,a+205,b+50),fill='#555555',width=3)
for name,(x,y) in nodes.items():
    d.rectangle((x,y,x+480,y+100),fill='white',outline='black',width=3);d.text((x+12,y+35),name,font=F,fill='black')
d.text((35,990),'Lines connect FK child to referenced parent; exact keys and multiplicities are listed in Chapter 4.',font=ImageFont.truetype(font,23),fill='black');im.save(A/'implemented-er-core.png')

center('Mini project report on',True,14)
center('OrganSync V2',True,20)
doc.add_paragraph('Organ Donation and Transplant Management System','Title').alignment=1
center('Submitted in partial fulfilment of the requirements for',False)
center('UE24CS351A – DBMS Project',True,16)
center('Bachelor of Technology',True,16)
center('in Computer Science and Engineering',True,16)
p();center('Submitted by',True)
center('Sagar K – PES2UG24CS424',True);center('S Vinyas Gangadkar – PES2UG24CS418',True)
p();center('Under the guidance of',True);center('Prof. Vinu J',True,14)
doc.add_picture(str(Q/'image1.png'),width=Inches(.85));doc.paragraphs[-1].alignment=1
center('Department of Computer Science and Engineering',True)
center('PES University',True,16);center('Electronic City Campus, Bengaluru',True)
center('Academic Semester AUG – DEC 2026',True)
page();h('CERTIFICATE')
doc.add_picture(str(Q/'image1.png'),width=Inches(.7));doc.paragraphs[-1].alignment=1
center('PES University',True,16);center('Department of Computer Science and Engineering',True)
p('This is to certify that the mini project entitled “OrganSync V2 – Organ Donation and Transplant Management System” is submitted by Sagar K (PES2UG24CS424) and S Vinyas Gangadkar (PES2UG24CS418) towards the requirements of UE24CS351A – DBMS Project, during the academic semester AUG – DEC 2026, at PES University, Electronic City Campus, Bengaluru.')
p('The report is presented for academic evaluation under the guidance of Prof. Vinu J. Certification and assessment are subject to the signatures of the authorised faculty members.')
p('\n\n\n');p('Signature of the Guide: ____________________');p('Prof. Vinu J');p('\nDate: ____________________\n\nSignature of Examiner: ____________________')
page();h('DECLARATION')
p('We, Sagar K (PES2UG24CS424) and S Vinyas Gangadkar (PES2UG24CS418), declare that this report describes our OrganSync V2 mini project for UE24CS351A – DBMS Project, Department of Computer Science and Engineering, PES University, Electronic City Campus, Bengaluru, during AUG – DEC 2026, under the guidance of Prof. Vinu J.')
p('Technical descriptions and evidence in this report are attributed to the project repository and the sources listed in the bibliography. Existing conceptual diagrams are distinguished from the implemented schema. Historical test evidence is identified by its date; results have not been fabricated or represented as fresh executions.')
p('\n\nSagar K – PES2UG24CS424\nSignature: ____________________\n\nS Vinyas Gangadkar – PES2UG24CS418\nSignature: ____________________\n\nPlace: Bengaluru\nDate: ____________________')
page();h('ACKNOWLEDGEMENT')
p('We thank our guide, Prof. Vinu J, for guidance in the DBMS mini project. We acknowledge the Department of Computer Science and Engineering, PES University, Electronic City Campus, Bengaluru, for the academic setting in which the project is submitted.')
p('The work helped us connect relational modelling with application development, transaction management, database integrity and asynchronous integration. We acknowledge the official MySQL, MongoDB and Next.js documentation consulted for the technologies used. Responsibility for the implementation and the explanations in this report rests with the authors.')
p('Sagar K – PES2UG24CS424\nS Vinyas Gangadkar – PES2UG24CS418')
page();h('ABSTRACT')
p('OrganSync V2 is an educational organ donation and transplant management application built with JavaScript and the Next.js App Router. MySQL is the authoritative transactional store. The implemented model contains nineteen relational tables, including donation and patient registration, organ inventory, waiting-list entries, candidate matches, clinician-recorded compatibility evidence, allocation, reservation, transplantation and follow-up history. Twenty triggers and three transaction-safe stored procedures support integrity beyond browser validation.')
p('The application separates repositories, services and guarded API routes. Related business changes, audit metadata and outbox events are committed atomically. An asynchronous worker delivers committed events to MongoDB Atlas using stable event identifiers, retries and idempotent writes. Privacy-conscious business projections supplement event and audit collections without replacing MySQL.')
p('This report documents the actual repository, authentic SQL examples, a verified database-object inventory and genuine read-only frontend screenshots collected on 17 November 2026. It also identifies differences between the supplied conceptual diagrams and the implemented schema. Existing rollback-controlled demonstration results are used only as dated historical evidence. Matching is an academic workflow requiring clinician compatibility evidence; the system is not a clinically validated allocation service or a production medical platform.')
for title,instr in [('TABLE OF CONTENTS','TOC \\o "1-2" \\h \\z \\u'),('LIST OF TABLES','TOC \\t "Table Caption,1" \\h \\z'),('LIST OF FIGURES','TOC \\t "Figure Caption,1" \\h \\z')]:
    page();h(title);field(p(),instr)

section=doc.add_section(WD_SECTION_START.NEW_PAGE)
section.footer.is_linked_to_previous=False
num=OxmlElement('w:pgNumType');num.set(qn('w:start'),'1');section._sectPr.append(num)
footer=section.footer.paragraphs[0];footer.alignment=1;field(footer,'PAGE')
h('1. INTRODUCTION')
p('Organ donation management requires a persistent relationship between a donor, an available organ, a patient’s waiting-list registration and the clinical evidence used to approve a candidate match. OrganSync V2 implements these dependencies as an academic DBMS application. Its principal contribution is a traceable transition from inventory and waiting demand to allocation, transplant recording and append-only follow-up history.')
h('1.1 Objectives',2)
p('The objectives are to represent the workflow using explicit relational keys; prevent inconsistent reservations and duplicate transplantation; require clinician-recorded compatible evidence for allocation; retain audit and integration events in the same transaction; and demonstrate database enforcement using isolated fictional fixtures. A responsive frontend exposes the implemented operations and the associated database evidence.')
h('1.2 Architecture and scope',2)
p('The Next.js App Router renders the interface and handles server-side API routes. Services validate workflow rules and coordinate transactions; repositories issue parameterised SQL through mysql2/promise. MySQL stores the authoritative state. MongoDB Atlas stores synchronised event, audit and minimal business projections. Credentials remain server-side in ignored environment configuration.')
table(['Layer','Implemented responsibility'],[['Frontend','React pages and reusable management, matching, allocation and monitoring components'],['API and services','Development write guard, clinician session checks, domain validation and transaction boundaries'],['MySQL','InnoDB tables, foreign keys, checks, unique keys, triggers, views and stored procedures'],['MongoDB Atlas','sync_events, audit_history and twelve derived business collections; projection_sync_state checkpoints']],'Application architecture')
p('Installed dependencies declare Next.js 16.4.3, React 19.3.1, mysql2 and the official MongoDB Node.js driver. The project uses JavaScript and ES modules. Production writes remain blocked until real authentication and an explicitly scoped RBAC implementation exist. This academic system does not determine clinical suitability independently.')
chapter(2,'PROBLEM DEFINITION')
p('Separate registers can leave an organ apparently available after reservation, permit duplicate active requests, or record a transplant without approved compatibility evidence. The problem is to maintain consistent state across these operations while preserving a history suitable for demonstration and review.')
h('2.1 Functional requirements',2)
p('Implemented modules cover donor and patient management, organ inventory, waiting-list registration, candidate matching, compatibility testing, allocation and release, transplant recording, follow-up history, database demonstrations and synchronisation monitoring. The home page links these functions. Dashboard and Reports are labelled planned; they must not be presented as completed standalone analytical modules.')
h('2.2 Integrity requirements',2)
p('An organ must belong to a donor and a valid type. A waiting-list entry must identify its patient, requested type and centre. A match links an organ to a waiting entry of the same type. An approved match must have valid compatible evidence recorded by an active clinician. Reservations must be exclusive, transplantation permanent, and compatibility and follow-up history protected from retrospective editing.')
p('Allocation, release and transplantation update several related records. These changes must either all commit or all roll back. The application also records audit metadata and a durable outbox event in that transaction. A later MongoDB outage must not undo a committed MySQL business operation.')
h('2.3 Assumptions and limitations',2)
p('Only fictional demonstration data is appropriate. A candidate preview uses inventory availability, waiting status and organ type; it is not a validated medical ranking model. Blood-group and HLA compatibility are clinician-recorded evidence, not a substitute for a clinical decision. Development authorisation protects local writes but is not production identity management.')
chapter(3,'ER MODEL')
p('The supplied StockSync_ER_Diagram.drawio.pdf is retained below as an earlier simplified conceptual diagram. Its content concerns organ donation despite its filename. It contains nine conceptual entities and does not describe the complete implemented model. The comparison in Table 2 establishes the changes needed to interpret it accurately.')
pic(A/'provided-er-1.png','Supplied earlier conceptual ER diagram; incomplete relative to the implemented schema')
table(['Conceptual notation','Implemented schema / difference'],[['DONAR / DONAR_ID','donor / donor_id; spelling and case differ'],['REGISTRATION / Registered_ID','waiting_list / waiting_id'],['MATCH','organ_match; references waiting_id and organ_id'],['Organ condition, organ blood group, match score','Not stored columns of organ or organ_match'],['Diagnosis / medical history','medical_record uses record_type and assessment_notes; sensitive narrative is not projected'],['Transplant direct organ reference','transplant references allocation_id; organ_transplant_record stores permanent organ linkage'],['Nine conceptual entities','Ten additional tables implement catalogues, allocation, follow-up, identity, audit, outbox and integrity mappings']],'Comparison of the supplied diagrams with implementation')
p('The missing tables are organ_type, organ_allocation, transplant_follow_up, active_organ_reservation, organ_transplant_record, app_user, app_session, audit_log, sync_outbox and schema_migration. The conceptual centre licence attribute, match score and transplant follow-up status are not implemented columns. Follow-up is represented by separate append-only records.')
page();h('3.1 Implemented entity relationships',2)
pic(A/'implemented-er-core.png','Schema-derived core ER supplement; supporting entities and exact foreign keys are enumerated in Chapter 4')
p('One donor may supply several organs, while each organ has one donor. One patient may have several waiting registrations and medical records. Each match links exactly one waiting entry to one organ. A match may accumulate compatibility tests and allocation history. Each transplant identifies one unique allocation, and each transplant may have several follow-ups. An organ may have at most one active reservation and one permanent transplant record because organ_id is the primary key of each integrity mapping table.')
p('A parent may have no children unless a business operation imposes additional requirements. Nullable app_user.centre_id and audit_log.user_id are optional references. Other declared foreign-key columns are mandatory. The permanent and active mapping tables encode exclusivity that the simplified original drawing does not fully express.')
chapter(4,'ER TO RELATIONAL MAPPING')
h('4.1 Steps of Algorithm for Chosen Problem',2)
p('Each strong entity becomes a relation with a surrogate primary key. One-to-many relationships place the parent key on the child: donor_id on organ, patient_id on waiting_list and match_id on compatibility_test. The organ–waiting relationship becomes the associative relation organ_match, retaining its own identity so tests and allocations can refer to a specific candidate decision.')
p('Organ types are normalised into organ_type rather than repeated descriptive text. Allocation and transplantation are separate relations because reservation may be released while transplantation is a permanent event. Multi-valued follow-up observations form transplant_follow_up. Unique keys and specialised mapping relations represent at-most-one restrictions. Audit and outbox aggregate identifiers are polymorphic references, not declared foreign keys.')
h('4.1.1 Normalisation and dependencies',2)
p('Atomic scalar values and separate child relations support first normal form. Single-column primary keys avoid partial dependency on a composite key. Centre descriptions and organ-type names are held in their own relations rather than repeated as descriptive attributes in every transaction, reducing transitive update anomalies. Business facts such as allocation status belong to their allocation identity, while test observations belong to a test identity. This is a practical normalisation rationale, not a claim that every possible semantic dependency has been formally proved.')
p('Generated active waiting keys and the reservation/permanent mapping tables deliberately materialise integrity conditions. Such controlled redundancy is maintained by database constraints and transactional services. Foreign keys use ON DELETE RESTRICT, preserving referenced history instead of silently cascading it away.')
h('4.2 Complete Diagram of Relational Mapping',2)
p('The supplied DBMS-MEDTECH-1.drawio (1).pdf is an earlier nine-relation mapping. It is preserved as contextual evidence, followed by a complete schema-derived mapping of all nineteen tables. Card arrows use exact foreign-key identifiers; the following relationship inventory is authoritative for cardinality.')
pic(A/'provided-relational-1.png','Supplied earlier relational mapping; simplified conceptual model',4.85)
for i in range(1,5):
    page();pic(A/f'implemented-mapping-{i}.png',f'Complete implemented relational mapping, panel {i} of 4',6.7)
rows=[]
for name,body in tables.items():
    for col,parent,key in re.findall(r'FOREIGN KEY \((\w+)\) REFERENCES (\w+)\((\w+)\)',body):rows.append([name+'.'+col,parent+'.'+key,'0..1 child' if name in ['active_organ_reservation','organ_transplant_record'] and col in ['organ_id','allocation_id','transplant_id'] or name=='transplant' and col=='allocation_id' else '0..many children'])
page();table(['Foreign-key child','Referenced parent','Per parent'],rows,'Complete foreign-key relationship inventory')
chapter(5,'DDL STATEMENTS')
p('The following definitions are copied from database/migrations/001_schema.sql. They document the existing design and are not instructions to rerun migrations. No DDL was executed for this report. The current read-only metadata check found nineteen base tables, seven views, twenty triggers and three stored procedures on 17 November 2026.')
for name in ['organ','waiting_list','organ_match','compatibility_test','organ_allocation','transplant','active_organ_reservation','organ_transplant_record']:
    h('Definition of '+name,2);code('CREATE TABLE '+name+' ('+tables[name]+') ENGINE=InnoDB;')
h('5.1 Constraints and indexes',2)
p('Migration 002 adds priority bounds from 1 to 5, nonnegative retry counts, release-time ordering and generated active waiting keys. The unique generated pair prevents duplicate active registrations for the same patient and organ type while permitting historical inactive entries. Migration 007 adds match and approval exclusivity. The reservation primary key prevents two simultaneous reservations for one organ; the permanent mapping primary key prevents a second transplant of the same organ.')
code(clean_sql(sqlfile('migrations/002_constraints.sql')))
p('The composite idx_organ_status_type index supports filtering by organ status and type. The live read-only EXPLAIN selected this index using ref access with an estimate of two rows; “Using where; Using index” indicates a covering indexed access for the selected columns. These estimates describe the current data and are not a benchmark.')
table(['Property','Observed value'],[[k,evidence['explain']['rows'][0][k]] for k in ['table','type','key','rows','Extra']],'Actual EXPLAIN evidence collected on 17 November 2026')
h('5.2 Views',2)
table(['View','Purpose'],[['vw_active_waiting_list','Active registration view'],['vw_available_organs','Available inventory view'],['vw_candidate_matches','Candidate relationships'],['vw_dashboard_statistics','Aggregate statistics view, distinct from a completed Dashboard page'],['vw_latest_compatibility','Latest evidence view'],['vw_organ_availability','Availability summary'],['vw_transplant_summary','Transplant summary']],'Views present in the live metadata inventory')
chapter(6,'DML STATEMENTS')
p('DML creates and changes data inside the established model. The example below is copied from the existing seed file. It is included as source evidence only; no seed was rerun. Contact details and patient narratives are unnecessary to demonstrate insertion, so a catalogue example is used.')
seed=sqlfile('seeds/demo_data.sql');m=re.search(r'INSERT INTO organ_type\b.*?;',seed,re.S);code(m.group(0) if m else '-- Catalogue insertion is defined in database/seeds/demo_data.sql.')
p('Runtime repositories use parameter placeholders for values and allowlisted table and column identifiers. Services place related writes inside a single transaction. A successful registration creates the business row, audit metadata and outbox event together. A validation error or SQL exception rolls all of them back. Parameter binding protects values from being interpreted as SQL syntax; it does not replace authorisation or domain validation.')
h('6.1 Transactional workflow',2)
p('Allocation locks the relevant records, verifies approved compatible clinician evidence, inserts organ_allocation and active_organ_reservation, and changes organ and waiting status. Release removes the exact reservation and returns eligible inventory and demand to available states. Transplant recording inserts transplant and organ_transplant_record, completes allocation and waiting state, removes the active reservation, and records audit and outbox entries. Follow-ups are appended rather than overwritten.')
transaction=clean_sql(sqlfile('queries/transactions.sql'))
code(transaction[:transaction.find('COMMIT;')+7])
p('The transaction example is authentic repository SQL, not a newly executed journey. Actual application procedures have additional integrity and audit requirements described in Chapter 8. No UPDATE, DELETE, allocation, transplant or fixture creation was executed during report generation.')
chapter(7,'QUERIES')
h('7.1 Simple Query with GROUP BY and Aggregate',2)
code(evidence['aggregate']['sql']+';')
p('The LEFT JOIN keeps every organ type, including types with no available organs. The availability condition is in the join predicate, so the outer join is not reduced to an inner join. COUNT(o.organ_id) counts matched inventory rows rather than the preserved catalogue row. Grouping by the type key and name produces one count per type.')
table(['Organ type','Available count'],[[r['organ_name'],r['available_count']] for r in evidence['aggregate']['rows']],'Actual read-only aggregate result, 17 November 2026 at 16:15 UTC')
h('7.2 UPDATE Operation',2)
match=re.search(r'UPDATE organ_match\b.*?;',seed,re.S);code(match.group(0) if match else "UPDATE organ_match SET match_status='TESTING' WHERE match_id IN (1,2);")
p('This seed statement moves the listed proposed matches to testing. It illustrates selection by primary key and a state change. Runtime transitions additionally check workflow state, evidence and authorisation. The statement is reproduced without execution; affected-row counts are therefore not asserted.')
h('7.3 DELETE Operation',2)
code('DELETE FROM active_organ_reservation\nWHERE organ_id = ? AND allocation_id = ?;')
p('This parameterised operation is used in the allocation workflow to remove only the reservation belonging to the expected allocation. It is not a deletion of the organ or transplant history. The surrounding transaction updates the related state and records audit/outbox evidence. Foreign-key restrictions and immutable-history triggers reject inappropriate historical deletions. No deletion was run for this report.')
h('7.4 Correlated Query',2)
subs=clean_sql(sqlfile('queries/subqueries.sql'));statements=[x.strip()+';' for x in subs.split(';') if 'SELECT' in x]
code(statements[1]);p('The inner query refers to the current outer organ identifier. NOT EXISTS selects an organ only when no corresponding organ_match row is present. It avoids multiplying output rows when several historical matches exist. This is authentic source SQL; no new row-level output is reproduced because it is unnecessary for the report and may expose identifiers outside the fictional screenshots.')
h('7.5 Nested Query',2)
code(statements[0]);p('The inner SELECT identifies patient keys with active waiting entries. IN then filters the patient relation. This is a non-correlated membership subquery; repeated patient keys in the inner result do not duplicate a patient in the outer result.')
h('7.6 Joins and common table expressions',2)
code(clean_sql(sqlfile('queries/ctes.sql')).split(';')[0]+';')
p('The CTE separates aggregation from lookup of the descriptive organ name. The same file also contains an availability CTE using COALESCE to display zero availability. Existing joins.sql connects matches to registrations, patients, organs and organ types for human-readable workflow views. The SQL uses actual keys rather than inferring a relationship from names.')
chapter(8,'STORED PROCEDURES, FUNCTIONS AND TRIGGERS')
h('8.1 Stored Procedures or Functions',2)
p('The actual database contains sp_allocate_organ_tx, sp_release_allocation_tx and sp_record_transplant_tx. No stored function was found in the current routine inventory. These procedures are the transaction-safe replacements introduced in Migration 007. Migration 006 remains historical source and must not be described as the current safe implementation: its earlier procedures owned transaction boundaries and lacked the later audit handling.')
table(['Procedure','Implemented purpose'],[['sp_allocate_organ_tx','Reserve an approved evidenced match and update organ/waiting state with audit and outbox'],['sp_release_allocation_tx','Release the exact current reservation and restore eligible states with audit and outbox'],['sp_record_transplant_tx','Record permanent transplant linkage, complete states, remove reservation, and record audit/outbox']],'Live stored procedure inventory and responsibilities')
p('The caller begins and owns the transaction. The service establishes the named savepoint expected by the procedure; the procedure releases that savepoint rather than committing independently. This preserves rollback of all related changes on an error. Rows are locked consistently to reduce concurrency conflicts. Application checks provide readable feedback while database checks remain effective for direct SQL.')
proc=sqlfile('migrations/007_phase3e_integrity.sql') if (ROOT/'database/migrations/007_phase3e_integrity.sql').exists() else next((ROOT/'database/migrations').glob('007*')).read_text()
start=proc.find('CREATE PROCEDURE sp_allocate_organ_tx');snippet=proc[start:]
# Preserve authentic procedure opening and an exact transaction-boundary excerpt, without printing the full long routine.
code('\n'.join(snippet.splitlines()[:21]))
p('The listing above is the opening excerpt of the actual allocation procedure source, not a complete executable script. Its declarations and guard logic belong to the implemented routine; complete definitions remain in Migration 007. The current migration history includes an additive Migration 008 reconciliation for four missing trigger guards; earlier applied files were retained rather than silently rewritten.')
h('8.2 Triggers',2)
p('Triggers execute in MySQL, independently of frontend validation. BEFORE triggers reject invalid writes with SIGNAL SQLSTATE 45000. Unique and foreign-key constraints remain distinct enforcement mechanisms; a rejection by a constraint must not be labelled a trigger rejection. The following inventory was obtained read-only from information_schema.TRIGGERS on 17 November 2026.')
table(['Trigger','Table','Timing / event'],[[r['TRIGGER_NAME'],r['EVENT_OBJECT_TABLE'],r['ACTION_TIMING']+' '+r['EVENT_MANIPULATION']] for r in evidence['triggers']['rows']],'Actual inventory of all twenty triggers')
trigger=sqlfile('migrations/008_phase3e_reconciliation_proposal.sql');m=re.search(r'CREATE TRIGGER trg_allocation_evidence_guard.*?END\$\$',trigger,re.S);code(m.group(0))
p('The evidence guard selects the latest test by test_date and test_id, requires all three compatible results and verifies that the recorded performer is an active clinician. This is a database rule rather than a browser-only restriction. Other guards make compatibility and follow-up records append-only, protect permanent transplant history and validate reservations and state transitions.')
h('8.3 Authentic historical trigger evidence',2)
p('The retained .artifacts/phase3g-browser-demos.json records actual MySQL 8.0.46 executions on 1 November 2026. These are historical results, not executions repeated for report collection. The fixed fixture SQL reaches MySQL directly, bypassing business validation. The artifact records before/after states, database object hashes and rollback verification. AUTO_INCREMENT gaps may remain after rolled-back inserts.')
demos=json.loads((ROOT/'.artifacts/phase3g-browser-demos.json').read_text())
rows=[]
for x in demos:
    details=x['details'];obj=re.search(r'Object: (.*?)\.',details);err=re.search(r'Actual MySQL result\n(.*?)\nCode',details,re.S)
    rows.append([x['operation'],x['result'],obj[1] if obj else 'See artifact',err[1] if err else 'See artifact'])
table(['Scenario','Historical result','Enforcing object','Actual result / message'],rows,'Retained historical database demonstration results')
p('For example, inserting a match with different organ types was rejected by trg_match_validate_insert with “Organ type does not match waiting list”, ER_SIGNAL_EXCEPTION / 1644 / 45000. The artifact shows unchanged fixture state and absent fixture rows after rollback. A same-type proposed match was accepted with SQLSTATE 00000, then rolled back. The current page exposes 39 fixed scenarios; a catalogue screenshot alone does not prove fresh execution of all scenarios.')
chapter(9,'FRONT END DEVELOPMENT')
p('The application uses reusable React management interfaces and Next.js API routes. Forms show validation, loading and error states. Read operations remain available without granting write privileges. Local development writes require explicit configuration and authorisation; clinical workflows additionally require a real fictional clinician account and valid session. Passwords are hashed with scrypt, session tokens are stored as hashes, and neither is copied to MongoDB projections.')
h('9.1 Evidence collection and navigation',2)
p('The existing production build was started with npm run start -- -p 3000. Browser automation navigated actual pages on 17 November 2026 and captured the screenshots below. Only read-only navigation, filters and existing data were used. No login, account setup, trigger run, backfill or business mutation was performed. Donor, patient and organ screenshots were filtered to fictional entries; the follow-up view selects an existing fictional transplant.')
screens=[('home','OrganSync homepage and implemented module navigation'),('donors','Donor management filtered to fictional records'),('patients','Patient management filtered to fictional records'),('organs','Organ inventory filtered to fictional records'),('matching','Candidate matching interface with existing demonstration records'),('compatibility','Existing clinician-recorded compatibility evidence'),('allocations','Guarded allocation and transplant interface'),('transplants','Transplant recording interface with guarded controls'),('follow-ups','Existing fictional transplant follow-up history'),('database-demo','Read-only catalogue of 39 fixed database demonstrations; no new execution'),('database-sync','Live database synchronisation monitor; collection is read-only')]
for key,title in screens:
    page();pic(A/f'frontend-{key}.png',title)
    descriptions={'home':'Dashboard and Reports remain planned entries. Available modules include donors, patients, organs, waiting list, matching, transplants and the two database demonstration monitors.','compatibility':'The existing record shows compatible blood-group, HLA and overall results. Evidence is append-only and attributed to a fictional clinician. This screenshot is evidence of an existing record, not a newly performed medical test.','allocations':'Allocation requires an approved match and current compatible clinician evidence. Release and recording controls remain protected; they were not submitted during evidence collection.','database-demo':'The catalogue separates trigger, constraint, procedure and application enforcement. Current execution controls are disabled in the production process. Dated actual execution evidence is presented in Chapter 8.','database-sync':'The page reports actual connectivity and outbox state at capture time. Pending and failed events require operational attention; opening this page does not run the worker or establish successful delivery of every event.'}
    p(descriptions.get(key,'This genuine screenshot was captured from the running application using existing fictional demonstration records. No state-changing operation was performed to obtain it.'))
h('9.2 MySQL and MongoDB integration',2)
p('MySQL remains the source of truth. Each committed business transaction writes a sync_outbox event. The worker uses FOR UPDATE SKIP LOCKED to claim work safely, persists a stable event identifier in sync_events, writes audit metadata into audit_history and confirms persistence before marking the event DELIVERED. Failure leaves retryable work; retry delay is bounded. A crash before SQL commit makes delivery repeatable, so MongoDB operations must be idempotent.')
p('Business projections use deterministic identifiers and fenced concurrency with generation/checkpoint state in projection_sync_state. Projection handlers reread current MySQL state rather than trusting stale event payloads. Tombstones represent source deletions, dependency expansion refreshes allocation and transplant relationships, and reconciliation handles database changes that bypass application event producers. This is application-managed synchronisation, not MySQL binlog CDC.')
mapping=[('donors','donor'),('patients','patient'),('organs','organ'),('waiting_list','waiting_list'),('medical_records','medical_record'),('matches','organ_match'),('compatibility_tests','compatibility_test'),('organ_allocations','organ_allocation'),('transplants','transplant'),('transplant_follow_ups','transplant_follow_up'),('transplant_centres','transplant_centre'),('organ_types','organ_type')]
table(['MongoDB collection','MySQL source'],mapping,'Business projection mapping')
p('Projection documents are deliberately minimal. Credentials, session tokens, passwords, full names, dates of birth, contact information and clinical narrative are excluded. Reference IDs preserve relationships without duplicating the complete personal record. Existing event and audit documents are not replaced by business projections.')
table(['Outbox status','Actual count'],[[r['status'],r['events']] for r in evidence['outbox']['rows']],'Read-only outbox snapshot on 17 November 2026')
p('This snapshot contains 41 pending, 105 delivered and 5 failed events. No worker or reconciliation process was started to improve the report output. Therefore the report does not claim a fully drained queue or zero synchronisation errors. The monitoring page and operational scripts provide the means to investigate and retry under separate authorisation.')
h('9.3 Verification boundaries',2)
p('Current checks comprise source inspection, real read-only MySQL metadata and aggregate queries, successful application startup, read-only browser screenshots and document rendering. Existing test scripts include unit tests, serial integration tests and database/synchronisation verification scripts. Full integration suites were not rerun for report generation because they create fixtures or change state. Historical README test totals are not represented as fresh test results.')
p('Dedicated new screenshots of destructive UPDATE/DELETE operations, DDL execution, allocation creation, transplant creation and new trigger execution were intentionally not collected. Their authentic source SQL and available historical evidence are supplied instead. Separate Phase 3E/3F/3G report files referred to in earlier project history are absent from this checkout; the retained artifacts and faculty guide were used where available.')
page();h('REFERENCES / BIBLIOGRAPHY')
refs=[('OrganSync V2 source repository','https://github.com/sagark-05/organsync_v2','Repository inspected 17 November 2026: README, docs, database migrations 001–008, seed and query files, src, tests, scripts and FACULTY-DEMO-GUIDE.md.'),('MySQL 8.0 Reference Manual: CREATE TABLE','https://dev.mysql.com/doc/refman/8.0/en/create-table.html','Primary reference for table definitions, keys and constraints.'),('MySQL 8.0 Reference Manual: Trigger Syntax and Examples','https://dev.mysql.com/doc/refman/8.0/en/trigger-syntax.html','Primary reference for trigger timing and row-level execution.'),('Next.js Documentation: App Router','https://nextjs.org/docs/app','Framework architecture reference; installed project version is identified separately.'),('MongoDB Documentation: Write Concern','https://www.mongodb.com/docs/manual/reference/write-concern/','Primary reference for acknowledged persistence.'),('Supplied academic formatting reference','DBMS MINI PROJECT REPORT SAMPLE.docx','Used only for academic layout, chapter organisation and PES logo.'),('Supplied conceptual diagrams','StockSync_ER_Diagram.drawio.pdf; DBMS-MEDTECH-1.drawio (1).pdf','User-provided earlier conceptual models; implementation differences are documented in Chapters 3 and 4.')]
for i,(title,url,note) in enumerate(refs,1):p(f'[{i}] {title}. {url}\n{note}')
p('Repository paths throughout the report identify primary implementation sources. SQL listings are reproduced from these sources; the report does not infer output rows where no execution record exists. Official web references were consulted on 17 November 2026.')
page();h('APPENDIX A – DEFINITIONS, ACRONYMS AND ABBREVIATIONS')
table(['Term','Meaning'],[['DBMS','Database Management System'],['DDL / DML','Data Definition Language / Data Manipulation Language'],['ER','Entity–Relationship'],['PK / FK','Primary key / foreign key'],['ACID','Atomicity, consistency, isolation and durability'],['CTE','Common table expression'],['API','Application programming interface'],['RBAC','Role-based access control; broad production RBAC is outside current scope'],['HLA','Human leukocyte antigen; a recorded compatibility result in this academic workflow'],['Outbox','Transactional table holding committed integration events'],['Idempotency','Repeated delivery does not create duplicate logical records'],['Tombstone','A projection marker that records deletion without unsafe resurrection'],['Fencing','A generation or ownership check that prevents stale workers from writing'],['CDC','Change data capture; binlog CDC is not implemented here']],'Definitions and abbreviations')
h('GitHub Repository Link',2);p('https://github.com/sagark-05/organsync_v2.git')
h('Evidence register',2)
p('Fresh SQL evidence: reports/assets/sql-readonly-evidence.json. Fresh browser provenance: reports/assets/browser-evidence.json. Historical trigger evidence: .artifacts/phase3g-browser-demos.json. Schema source: database/migrations/001_schema.sql with additive constraints and reconciliation migrations. Complete report validation and limitations: reports/REPORT_VALIDATION.md.')

# Prevent rows from splitting and ensure headings remain with following content.
first=doc.sections[0];first.different_first_page_header_footer=True
pre=OxmlElement('w:pgNumType');pre.set(qn('w:fmt'),'lowerRoman');pre.set(qn('w:start'),'1');first._sectPr.append(pre)
first.footer.paragraphs[0].alignment=1;field(first.footer.paragraphs[0],'PAGE')
for t in doc.tables:
    for row in t.rows:
        pr=row._tr.get_or_add_trPr();pr.append(OxmlElement('w:cantSplit'))
for para in doc.paragraphs:
    if para.style.name.startswith('Heading'):para.paragraph_format.keep_with_next=True
doc.core_properties.title='OrganSync V2 DBMS Mini Project Report'
doc.core_properties.author='Sagar K; S Vinyas Gangadkar'
doc.core_properties.subject='UE24CS351A – DBMS Project'
doc.save(OUT/'OrganSync_V2_DBMS_Mini_Project_Report.docx')
(Q/'build-manifest.json').write_text(json.dumps({'figures':figures,'tables':tablecaps,'schemaTables':list(tables)},indent=2))
print('DOCX created:',len(figures),'figures;',len(tablecaps),'tables;',len(tables),'schema tables')
