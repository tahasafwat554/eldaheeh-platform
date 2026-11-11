import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"};
Deno.serve(async req=>{
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 try{
  const {exam_id,student_name,student_email,answers}=await req.json();
  if(!exam_id||!student_name?.trim()||!student_email?.trim()||!answers||typeof answers!=="object") throw new Error("بيانات التسليم غير مكتملة");
  const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const {data:exam,error:ee}=await db.from("exams").select("id,published").eq("id",exam_id).single();
  if(ee||!exam?.published) throw new Error("الامتحان غير متاح");
  const {data:qs,error:qe}=await db.from("questions").select("id,question_text,correct_answer,explanation,source_page").eq("exam_id",exam_id).order("sort_order");
  if(qe||!qs?.length) throw new Error("لا توجد أسئلة");
  if(Object.keys(answers).length!==qs.length||qs.some(q=>typeof answers[q.id]!=="string")) throw new Error("يجب الإجابة عن جميع الأسئلة");
  const feedback=qs.map(q=>({question_id:q.id,question_text:q.question_text,student_answer:answers[q.id],correct_answer:q.correct_answer,is_correct:answers[q.id]===q.correct_answer,explanation:q.explanation,source_page:q.source_page}));
  const score=feedback.filter(x=>x.is_correct).length,total=qs.length,percentage=Math.round(score/total*10000)/100;
  const {data:attempt,error:ae}=await db.from("attempts").insert({exam_id,student_name:student_name.trim(),student_email:student_email.trim(),score,total,percentage}).select("id").single();
  if(ae) throw ae;
  const rows=feedback.map(f=>({attempt_id:attempt.id,question_id:f.question_id,student_answer:f.student_answer,is_correct:f.is_correct}));
  const {error:ansErr}=await db.from("attempt_answers").insert(rows);if(ansErr) throw ansErr;
  return new Response(JSON.stringify({attempt_id:attempt.id,score,total,percentage,feedback}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:e.message||"خطأ"}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}
});
