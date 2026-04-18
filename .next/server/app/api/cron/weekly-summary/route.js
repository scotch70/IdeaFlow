"use strict";(()=>{var e={};e.id=486,e.ids=[486],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6005:e=>{e.exports=require("node:crypto")},96559:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>w,patchFetch:()=>v,requestAsyncStorage:()=>y,routeModule:()=>c,serverHooks:()=>h,staticGenerationAsyncStorage:()=>f});var r={};a.r(r),a.d(r,{GET:()=>m,dynamic:()=>u});var i=a(49303),s=a(88716),o=a(60670),n=a(87070),l=a(99064),d=a(5579);async function p({email:e,companyName:t,stats:a}){let r=`
    <div style="font-family: Arial; line-height: 1.6;">
      <h2>${t} — Weekly Idea Summary</h2>

      <p>Your team activity this week:</p>

      <ul>
        <li><strong>${a.totalIdeas}</strong> ideas submitted</li>
        <li><strong>${a.needsReview}</strong> need your review</li>
        <li><strong>${a.implemented}</strong> implemented</li>
      </ul>

      <p>
        <a href="http://localhost:3000/dashboard/review"
           style="display:inline-block;padding:10px 16px;background:#111827;color:#fff;border-radius:8px;text-decoration:none;">
          Review ideas
        </a>
      </p>

      <p style="font-size:12px;color:#6b7280;">
        Stay on top of your team’s ideas.
      </p>
    </div>
  `;await d.m.emails.send({from:process.env.RESEND_FROM_EMAIL,to:[e],subject:`${t} — Weekly idea summary`,html:r})}let u="force-dynamic";async function m(){let e=(0,l.i)(),{data:t}=await e.from("companies").select("id, name");for(let a of t??[]){let{data:t}=await e.from("profiles").select("id").eq("company_id",a.id).eq("role","admin"),{data:r}=await e.from("ideas").select("created_at, status").eq("company_id",a.id),i=Date.now(),s=r?.filter(e=>i-new Date(e.created_at).getTime()<6048e5)??[],o=r?.filter(e=>"open"===e.status||"under_review"===e.status).length??0,n=s.filter(e=>"implemented"===e.status).length??0;for(let r of t??[]){let{data:t}=await e.auth.admin.getUserById(r.id);t?.user?.email&&await p({email:t.user.email,companyName:a.name,stats:{totalIdeas:s.length,needsReview:o,implemented:n}})}}return n.NextResponse.json({success:!0})}let c=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/cron/weekly-summary/route",pathname:"/api/cron/weekly-summary",filename:"route",bundlePath:"app/api/cron/weekly-summary/route"},resolvedPagePath:"/Users/larsneeft/Downloads/ideabox/app/api/cron/weekly-summary/route.ts",nextConfigOutput:"",userland:r}),{requestAsyncStorage:y,staticGenerationAsyncStorage:f,serverHooks:h}=c,w="/api/cron/weekly-summary/route";function v(){return(0,o.patchFetch)({serverHooks:h,staticGenerationAsyncStorage:f})}},99064:(e,t,a)=>{a.d(t,{i:()=>i});var r=a(88336);function i(){let e="https://btlpwdyiohwzohebgrwv.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase admin environment variables");return(0,r.eI)(e,t,{auth:{autoRefreshToken:!1,persistSession:!1}})}},5579:(e,t,a)=>{a.d(t,{m:()=>r});let r=new(a(82591)).R(process.env.RESEND_API_KEY)}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[317,972,591],()=>a(96559));module.exports=r})();