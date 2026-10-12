import { displaySectorOf, financialSectors, initiativeStatuses, itDomains, marketGroups, priorityTiers, regulatoryCategoryOf, researchCoverages, sourceTypes, type PublicLeaderReference, type PublicOrganizationReference } from './types';
import { CURRICULUM_LENGTH, caseDepths, caseRegions, caseTypeStages, caseTypes, deployments, industries, knowledgeDomains, sectionLabels, sourceKinds, sourceStatuses, stages, type ContentStore, type SalesLearningExtension } from './types';
export function validateContent(data:ContentStore):string[] {
 const errors:string[]=[];
 const all=Object.values(data).flat();
 for(const collection of Object.values(data)){
  const ids=new Set<string>();
  for(const item of collection){if(ids.has(item.id))errors.push(`Duplicate ID: ${item.id}`);ids.add(item.id);}
 }
 const sourceIds=new Set(data.sources.map(s=>s.id));
 const checkRefs=(refs:string[],allowed:Set<string>,context:string)=>refs.forEach(id=>{if(!allowed.has(id))errors.push(`${context}: missing ${id}`)});
 const knowledgeIds=new Set(data.knowledge.map(x=>x.id)),caseIds=new Set(data.cases.map(x=>x.id));
 for(const s of data.sources){if(!/^https:\/\//.test(s.url)&&!(s.kind==='INSTITUTION_ROSTER'&&/^http:\/\//.test(s.url)))errors.push(`Unsafe source URL: ${s.id}`);if(!s.title||!s.publisher||!s.lastVerifiedAt)errors.push(`Incomplete source: ${s.id}`);}
 // Source별 날짜·종류·상태 (전역 확인일 없음)
 const partialDate=/^\d{4}-\d{2}(-\d{2})?$/,fullDate=/^\d{4}-\d{2}-\d{2}$/;
 for(const s of data.sources){
  if(!sourceKinds.includes(s.kind))errors.push(`Source kind: ${s.id}`);
  if(!sourceStatuses.includes(s.status))errors.push(`Source status: ${s.id}`);
  if(!fullDate.test(s.lastVerifiedAt)||!Number.isFinite(Date.parse(s.lastVerifiedAt)))errors.push(`Source verified date: ${s.id}`);
  if(s.publishedAt&&!partialDate.test(s.publishedAt))errors.push(`Source published date: ${s.id}`);
  if(typeof s.effectiveAt==='string'&&!partialDate.test(s.effectiveAt))errors.push(`Source effective date: ${s.id}`);
  if(s.publishedAt&&s.lastVerifiedAt<s.publishedAt)errors.push(`Verified before published: ${s.id}`);
 }
 // 영업 학습 확장 필드: 있으면 빈 채로 두지 않는다
 const checkSales=(x:SalesLearningExtension|undefined,context:string)=>{if(!x)return;if(!x.amMustKnow.length||!x.discoveryQuestions.length||!x.architectureMeaning||!x.nextQuestions.length||!x.commonMistakes.length)errors.push(`Sales extension incomplete: ${context}`);};
 for(const item of all){
  if('sourceIds' in item){checkRefs(item.sourceIds,sourceIds,item.id);if(item.contentKind==='VERIFIED'&&!item.sourceIds.length)errors.push(`Missing evidence: ${item.id}`);}
  if('relatedKnowledgeIds' in item)checkRefs(item.relatedKnowledgeIds,knowledgeIds,item.id);
  if('relatedCaseIds' in item)checkRefs(item.relatedCaseIds,caseIds,item.id);
 }
 for(const k of data.knowledge){if(k.sections.map(s=>s.label).join('|')!==sectionLabels.join('|'))errors.push(`Section order: ${k.id}`);k.sections.forEach(s=>checkRefs(s.sourceIds,sourceIds,k.id));if(!knowledgeDomains.includes(k.domain)||(k.secondaryDomains??[]).some(d=>!knowledgeDomains.includes(d)||d===k.domain))errors.push(`Knowledge domain: ${k.id}`);checkSales(k.sales,k.id);if(!k.primarySourceIds.length||k.primarySourceIds.some(id=>!k.sourceIds.includes(id)))errors.push(`Primary sources: ${k.id}`);}
 for(const c of data.cases){
  if(!industries.includes(c.industry)||!stages.includes(c.stage))errors.push(`Taxonomy: ${c.id}`);
  // CaseType은 Stage와 별개지만 불가능한 조합은 막는다 (예: 혁신금융서비스 지정을 구축 레퍼런스로 표시)
  if(!caseTypes.includes(c.caseType)||!caseDepths.includes(c.depth)||!caseRegions.includes(c.region))errors.push(`Case type: ${c.id}`);
  else{if(!caseTypeStages[c.caseType].includes(c.stage))errors.push(`CaseType/Stage mismatch: ${c.id}`);if((c.caseType==='BENCHMARK')!==(c.region==='GLOBAL'))errors.push(`BENCHMARK/region: ${c.id}`);}
  for(const f of [c.data,c.outcome]){if(f){checkRefs(f.sourceIds,sourceIds,c.id);if(f.status==='UNKNOWN'&&(f.value!=='미공개'||f.sourceIds.length))errors.push(`Unknown field: ${c.id}`);if(f.status==='DISCLOSED'&&!f.sourceIds.length)errors.push(`Field evidence: ${c.id}`);}}
  checkSales(c.sales,c.id);
  if(c.deploymentModels.some(d=>!deployments.includes(d)))errors.push(`Deployment: ${c.id}`);
  checkRefs(c.stageSourceIds,sourceIds,c.id);checkRefs(c.deploymentSourceIds,sourceIds,c.id);
  if(c.stage!=='확인 필요'&&!c.stageSourceIds.length)errors.push(`Stage evidence: ${c.id}`);
  if(c.deploymentModels.length&&!c.deploymentSourceIds.length)errors.push(`Deployment evidence: ${c.id}`);
  for(const f of [c.csp,c.model,c.technology,c.security,c.architecture,c.partner]){
   checkRefs(f.sourceIds,sourceIds,c.id);
   if(f.status==='UNKNOWN'&&(f.value!=='미공개'||f.sourceIds.length))errors.push(`Unknown field: ${c.id}`);
   if(f.status==='DISCLOSED'&&!f.sourceIds.length)errors.push(`Field evidence: ${c.id}`);
  }
 }
 for(const q of data.quiz){if(!['SINGLE','OX','CONFUSION','SCENARIO'].includes(q.format)||!['FACT','TECH_FACT','INTERPRETATION','ARCHITECTURE_GUIDE'].includes(q.basis))errors.push(`Quiz metadata: ${q.id}`);if((q.basis==='FACT'||q.basis==='TECH_FACT')&&!q.sourceIds.length)errors.push(`Quiz FACT without source: ${q.id}`);if(q.format==='OX'&&q.options.join('|')!=='맞다|틀리다')errors.push(`Quiz OX options: ${q.id}`);if(q.options.length<2||q.options.length!==q.reasons.length||!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>=q.options.length)errors.push(`Quiz answers: ${q.id}`);}
 for(const m of data.meeting){if(!m.answer30s||!m.answer60s||!m.keywords.length||!m.followUps.length)errors.push(`Meeting incomplete: ${m.id}`);}
 for(const t of data.timeline)checkRefs([t.knowledgeId],knowledgeIds,t.id);
 // 16일 Curriculum
 if(data.curriculum.length!==CURRICULUM_LENGTH)errors.push(`Curriculum length: ${data.curriculum.length}`);
 const quizIds=new Set(data.quiz.map(x=>x.id)),meetingIds=new Set(data.meeting.map(x=>x.id)),architectureIds=new Set(data.architectures.map(x=>x.id));
 data.curriculum.forEach((d,i)=>{
  if(d.day!==i+1)errors.push(`Day order: ${d.id}`);
  checkRefs(d.knowledgeIds,knowledgeIds,d.id);checkRefs(d.caseIds,caseIds,d.id);checkRefs(d.architectureIds,architectureIds,d.id);checkRefs(d.quizIds,quizIds,d.id);checkRefs(d.meetingIds,meetingIds,d.id);
  checkSales(d.sales,d.id);
  checkRefs(d.timelineIds??[],new Set(data.timeline.map(x=>x.id)),d.id);
  if(d.contentStatus==='READY'){
   // READY Day의 최소 요건: 학습 구조를 모두 채우고, 참조 카드는 영업 필드를 갖추며, 근거 Source가 있다
   if(d.conclusions.length!==5||d.memorize.length!==5||d.discoveryQuestions.length<5||!d.whyLearn||!d.meeting30s||!d.sourceIds.length||!d.prerequisites.length||!d.knowledgeIds.length||!d.relatedServices.length||d.nextQuestions.length<3||!d.confusionPairs.length||d.quizIds.length<5||!d.sales)errors.push(`Day not ready: ${d.id}`);
   for(const kid of d.knowledgeIds){if(!data.knowledge.find(k=>k.id===kid)?.sales)errors.push(`Day card without sales fields: ${d.id}/${kid}`);}
  }
 });
 for(const a of data.architectures){
  checkRefs(a.componentIds,new Set(data.components.map(x=>x.id)),a.id);
  const raw=a as {kind:string;customerCaseId?:string;id:string};
  if(raw.kind==='GENERIC_PATTERN'&&raw.customerCaseId)errors.push(`Generic customer attribution: ${raw.id}`);
  if(a.kind==='DISCLOSED_CUSTOMER_ARCHITECTURE'){
   checkRefs([a.customerCaseId],caseIds,a.id);
   if(!a.sourceIds.length)errors.push(`Customer architecture evidence: ${a.id}`);
  }
 }
 // ── 금융시장 IT·AX Index(FinancialInstitution) ──
 // 원칙: Source 없는 사실·이름·조직·단계·Vendor는 저장하지 않는다. 확인하지 못한 값은 비워 둔다(null/undefined).
 const SPECULATION=/추정|아마(?!존)|가능성이 높/;
 const known=new Set(data.sources.map(s=>s.id));
 const dateOk=(d?:string)=>!!d&&/^\d{4}-\d{2}-\d{2}$/.test(d);
 const checkOrg=(o:PublicOrganizationReference,where:string)=>{if(!o.name||!o.sourceIds?.length||o.sourceIds.some(id=>!known.has(id))||!dateOk(o.lastVerifiedAt))errors.push(`Organization source: ${where}`);if(SPECULATION.test(o.name))errors.push(`Speculative wording: ${where}`)};
 const checkLeader=(l:PublicLeaderReference,where:string)=>{if(!l.personName||!l.title||!l.sourceIds?.length||l.sourceIds.some(id=>!known.has(id))||!dateOk(l.lastVerifiedAt))errors.push(`Leader source: ${where}`);if(l.asOfDate&&!/^\d{4}-\d{2}(-\d{2})?$/.test(l.asOfDate))errors.push(`Leader date: ${where}`)};
 const initiativeIds=new Set<string>();
 const basisBySector=new Map<string,string>();
 for(const inst of data.institutions){
  if(!marketGroups.includes(inst.marketGroup)||!financialSectors.includes(inst.sector)||!researchCoverages.includes(inst.researchCoverage)||(inst.priorityTier&&!priorityTiers.includes(inst.priorityTier))||inst.regulatoryCategory!==regulatoryCategoryOf[inst.sector])errors.push(`Institution taxonomy: ${inst.id}`);
  if(inst.website&&!/^https?:\/\//.test(inst.website))errors.push(`Institution website: ${inst.id}`);
  if(!inst.sourceIds.length||inst.sourceIds.some(id=>!known.has(id)))errors.push(`Institution sources: ${inst.id}`);
  // 회사 Universe는 공식 명부로 확인한다 (IT 사업 Source와 별개). 명부로 확인하지 못했다면 사유(rosterNote)를 남긴다.
  if(inst.universeSourceId?(data.sources.find(s=>s.id===inst.universeSourceId)?.kind!=='INSTITUTION_ROSTER'||!inst.sourceIds.includes(inst.universeSourceId)):!inst.rosterNote)errors.push(`Institution universe source: ${inst.id}`);
  if(inst.lastResearchedAt&&!dateOk(inst.lastResearchedAt))errors.push(`Institution researched date: ${inst.id}`);
  // "공개자료 없음"을 "사업 없음"으로 바꾸지 않는다: 조사 수준 UNRESEARCHED ⇔ 사업 0건
  if((inst.researchCoverage==='UNRESEARCHED')!==(inst.initiatives.length===0))errors.push(`Institution research coverage: ${inst.id}`);
  // 규모: 값에는 기준일·재무기준·단위·Source가 필수이고, 같은 업권 안에서는 같은 재무기준만 쓴다 (순위는 assetRanks가 같은 기준일일 때만 계산)
  const sc=inst.scale;
  if(sc?.totalAssets!=null){
   if(!sc.assetAsOf||!sc.assetBasis||!sc.unit||!sc.assetSourceIds.length||sc.assetSourceIds.some(id=>!known.has(id)))errors.push(`Asset source: ${inst.id}`);
   const key=displaySectorOf[inst.sector];const prev=basisBySector.get(key);
   if(prev&&prev!==sc.assetBasis)errors.push(`Asset basis mixed in sector: ${key}`);basisBySector.set(key,sc.assetBasis??'');
  }
  if(sc?.secondaryScaleMetric&&(!sc.secondaryScaleMetric.sourceIds.length||!sc.secondaryScaleMetric.asOf))errors.push(`Secondary scale source: ${inst.id}`);
  if(inst.headOffice&&(!inst.headOffice.region||!inst.headOffice.sourceIds.length||inst.headOffice.sourceIds.some(id=>!known.has(id))))errors.push(`Head office source: ${inst.id}`);
  inst.ownerDepartments.forEach((o,n)=>checkOrg(o,`${inst.id}#org${n}`));
  inst.publicLeaders.forEach((l,n)=>checkLeader(l,`${inst.id}#leader${n}`));
  for(const i of inst.initiatives){
   if(initiativeIds.has(i.id))errors.push(`Duplicate initiative: ${i.id}`);initiativeIds.add(i.id);
   if(i.institutionId!==inst.id||!i.summary||!i.title||!i.domains.length||i.domains.some(d=>!itDomains.includes(d))||(i.sourceStage&&!initiativeStatuses.includes(i.sourceStage)))errors.push(`Initiative: ${i.id}`);
   if(!i.sourceIds.length)errors.push(`Initiative without source: ${i.id}`);
   if(i.announcedAt&&!/^\d{4}-\d{2}(-\d{2})?$/.test(i.announcedAt))errors.push(`Initiative date: ${i.id}`);
   if(!dateOk(i.lastVerifiedAt))errors.push(`Initiative verified date: ${i.id}`);
   if(i.sourceIds.some(id=>!inst.sourceIds.includes(id)||!known.has(id)))errors.push(`Initiative source: ${i.id}`);
   if(i.relatedCaseIds.some(c=>!inst.relatedCaseIds.includes(c)))errors.push(`Initiative case link: ${i.id}`);
   // 재검증한 단계에는 짧은 근거 표현(120자 이하)이 있어야 하고, 단계가 없는 사업에는 근거 표현을 두지 않는다
   if(i.stageReviewedAt&&!dateOk(i.stageReviewedAt))errors.push(`Stage review date: ${i.id}`);
   if(i.sourceStage&&i.stageReviewedAt&&(!i.stageEvidenceQuote||i.stageEvidenceQuote.length>120))errors.push(`Stage evidence quote: ${i.id}`);
   if(!i.sourceStage&&i.stageEvidenceQuote)errors.push(`Stage quote without stage: ${i.id}`);
   if(i.discoveryQuestions&&(i.discoveryQuestions.length<2||i.discoveryQuestions.length>5))errors.push(`Initiative discovery questions: ${i.id}`);
   (i.ownerDepartments??[]).forEach((o,n)=>checkOrg(o,`${i.id}#org${n}`));
   (i.publicLeaders??[]).forEach((l,n)=>checkLeader(l,`${i.id}#leader${n}`));
   // 사실(FACT) 필드에는 추측 표현을 쓰지 않는다. 추측은 INTERPRETATION/SALES_VIEW에만 둔다.
   if([i.title,i.summary,i.businessPurpose??'',...(i.businessOutcome??[]),...(i.workloads??[]),...(i.targetUsers??[]),...(i.securityGovernancePoints??[])].some(x=>SPECULATION.test(x)))errors.push(`Speculative wording in fact field: ${i.id}`);
  }
  for(const sid of inst.sourceIds){const src=data.sources.find(s=>s.id===sid);if(!src?.sourceType||!sourceTypes.includes(src.sourceType))errors.push(`Source type missing: ${sid}`);if(!src||!/^https?:\/\/\S+$/.test(src.url))errors.push(`Source URL missing: ${sid}`)}
  // 조사 수준 DEEP: DB 심층조사 대상이며 모든 사업의 단계를 재검증한 회사만
  if(inst.researchCoverage==='DEEP'&&(!inst.dbResearchPriority||inst.initiatives.some(i=>!i.stageReviewedAt)))errors.push(`Deep coverage requirements: ${inst.id}`);
 }
 // 기존 Case는 정확히 한 고객사에 연결되어야 한다 (Case 데이터는 복사하지 않고 ID로만 연결)
 for(const c of data.cases.filter(x=>x.region==='KR')){
  const owners=data.institutions.filter(x=>x.relatedCaseIds.includes(c.id));
  if(owners.length!==1)errors.push(`Case institution link: ${c.id} (${owners.length})`);
 }
 return errors;
}
