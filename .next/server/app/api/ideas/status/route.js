"use strict";(()=>{var e={};e.id=578,e.ids=[578],e.modules={72934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6005:e=>{e.exports=require("node:crypto")},94788:(e,t,a)=>{a.r(t),a.d(t,{originalPathname:()=>I,patchFetch:()=>_,requestAsyncStorage:()=>F,routeModule:()=>w,serverHooks:()=>k,staticGenerationAsyncStorage:()=>v});var i={};a.r(i),a.d(i,{POST:()=>f});var r=a(49303),n=a(88716),o=a(60670),s=a(87070),d=a(19692),l=a(99064),p=a(5579);let u={under_review:{subject:e=>`Your idea is being reviewed: "${e}"`,heading:"Your idea is under review",intro:e=>`Hi ${e}, your idea has been picked up and is now being reviewed by the team.`,badgeLabel:"In Review",badgeBg:"#EFF6FF",badgeColor:"#1D4ED8",closing:"We'll keep you posted as things move forward."},planned:{subject:e=>`Your idea has been planned: "${e}"`,heading:"Your idea is on the roadmap",intro:e=>`Great news, ${e}! Your idea has been reviewed and added to the roadmap.`,badgeLabel:"Planned",badgeBg:"#EEF2FF",badgeColor:"#4338CA",closing:"We'll let you know when work begins."},in_progress:{subject:e=>`Work has started on your idea: "${e}"`,heading:"Your idea is being built",intro:e=>`${e}, the team has started working on your idea. It's now in progress.`,badgeLabel:"In Progress",badgeBg:"#FFF7ED",badgeColor:"#C2540A",closing:"Stay tuned — we'll notify you when it ships."},implemented:{subject:e=>`Your idea shipped! 🎉 "${e}"`,heading:"Your idea was implemented \uD83C\uDF89",intro:e=>`${e}, your idea has been implemented and is now live. Thank you for speaking up — this kind of contribution makes a real difference.`,badgeLabel:"Implemented",badgeBg:"#ECFDF5",badgeColor:"#059669",noteHeading:"What was built",closing:"Your voice shaped something real. Keep the ideas coming."},declined:{subject:e=>`An update on your idea: "${e}"`,heading:"An update on your idea",intro:e=>`Hi ${e}, thank you for sharing your idea. After careful consideration, we are not moving forward with it at this time.`,badgeLabel:"Declined",badgeBg:"#FEF2F2",badgeColor:"#B91C1C",noteHeading:"Why we're not moving forward",closing:"We appreciate you sharing your thinking. Please keep ideas coming — every submission helps us improve."}},g={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};function c(e){return e.replace(/[&<>"']/g,e=>g[e]??e)}let m=["open","under_review","planned","in_progress","implemented","declined"],h=["under_review","planned","in_progress","implemented","declined"],b=["declined","implemented"],x=process.env.RESEND_FROM_EMAIL??"IdeaFlow <notifications@ideaflow.app>";async function f(e){try{let t=(0,d.e)(),a=(0,l.i)(),{data:{user:i},error:r}=await t.auth.getUser();if(r||!i)return s.NextResponse.json({error:"Unauthorized"},{status:401});let{data:n}=await t.from("profiles").select("role, company_id").eq("id",i.id).single();if(!n||"admin"!==n.role)return s.NextResponse.json({error:"Forbidden — admins only"},{status:403});let{ideaId:o,status:p,note:u,impactSummary:g,impactType:c,impactLink:x}=await e.json();if("string"!=typeof o||!o)return s.NextResponse.json({error:"ideaId is required"},{status:400});if("string"!=typeof p||!m.includes(p))return s.NextResponse.json({error:`status must be one of: ${m.join(", ")}`},{status:400});let f="string"==typeof u?u.trim():"",w="string"==typeof g?g.trim():"",F="string"==typeof c?c.trim():"",v="string"==typeof x?x.trim():"";if(b.includes(p)&&f.length<30){let e="declined"===p?"declining":"implementing";return s.NextResponse.json({error:`A note of at least 30 characters is required when ${e} an idea.`},{status:400})}if("implemented"===p&&w.length<10)return s.NextResponse.json({error:"An impact summary (at least 10 characters) is required when marking an idea as implemented."},{status:400});let{data:k,error:I}=await a.from("ideas").select("id, company_id, user_id, title, status").eq("id",o).single();if(I||!k)return console.error("[api/ideas/status] idea fetch failed:",I,"| ideaId:",o),s.NextResponse.json({error:I?.message??"Idea not found",code:I?.code},{status:404});if(k.company_id!==n.company_id)return s.NextResponse.json({error:"Forbidden"},{status:403});let _=k.status!==p,{data:j,error:C}=await a.from("ideas").update({status:p,status_note:f||null,status_changed_at:new Date().toISOString(),status_changed_by:i.id,impact_summary:"implemented"===p?w:null,impact_type:"implemented"===p&&F||null,impact_link:"implemented"===p&&v||null}).eq("id",o).select().single();if(C)return s.NextResponse.json({error:C.message},{status:500});return _&&h.includes(p)&&y({authorId:k.user_id,ideaTitle:k.title,status:p,note:f||null,appUrl:"http://localhost:3000"}).catch(e=>{console.error("[api/ideas/status] email send failed:",e)}),s.NextResponse.json(j)}catch(e){return console.error("[api/ideas/status] crash:",e),s.NextResponse.json({error:e instanceof Error?e.message:"Something went wrong"},{status:500})}}async function y({authorId:e,ideaTitle:t,status:a,note:i,appUrl:r}){let n=(0,l.i)(),{data:{user:o},error:s}=await n.auth.admin.getUserById(e);if(s||!o?.email){console.warn("[sendStatusEmail] could not fetch author email:",s?.message);return}let{data:d}=await n.from("profiles").select("full_name").eq("id",e).single(),{subject:g,html:m}=function({authorName:e,ideaTitle:t,status:a,note:i,appUrl:r}){let n=u[a],o=e.split(" ")[0]||e,s=i&&i.trim()?`
        <tr>
          <td style="padding: 0 40px 28px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="
                  background: ${n.badgeBg};
                  border-left: 3px solid ${n.badgeColor};
                  border-radius: 4px;
                  padding: 14px 16px;
                ">
                  ${n.noteHeading?`<p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: ${n.badgeColor};">${n.noteHeading}</p>`:""}
                  <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151;">
                    ${c(i.trim())}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`:"",d=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${c(n.subject(t))}</title>
</head>
<body style="margin: 0; padding: 0; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F9FAFB; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">

          <!-- Logo row -->
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 16px; font-weight: 800; color: #0D1F35; letter-spacing: -0.02em;">
                Idea<span style="color: #F97316;">Flow</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="
              background: #FFFFFF;
              border-radius: 12px;
              border: 1px solid rgba(0,0,0,0.07);
              box-shadow: 0 1px 4px rgba(0,0,0,0.05);
              overflow: hidden;
            ">
              <!-- Orange accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="height: 3px; background: linear-gradient(90deg, #F97316, #FB923C);"></td>
                </tr>
              </table>

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">

                <!-- Heading -->
                <tr>
                  <td style="padding: 32px 40px 6px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0D1F35; line-height: 1.3;">
                      ${c(n.heading)}
                    </h1>
                  </td>
                </tr>

                <!-- Status badge -->
                <tr>
                  <td style="padding: 12px 40px 20px;">
                    <span style="
                      display: inline-block;
                      padding: 3px 10px;
                      border-radius: 5px;
                      font-size: 12px;
                      font-weight: 700;
                      letter-spacing: 0.03em;
                      background: ${n.badgeBg};
                      color: ${n.badgeColor};
                    ">${n.badgeLabel}</span>
                  </td>
                </tr>

                <!-- Intro -->
                <tr>
                  <td style="padding: 0 40px 20px;">
                    <p style="margin: 0; font-size: 15px; line-height: 1.65; color: #374151;">
                      ${c(n.intro(o))}
                    </p>
                  </td>
                </tr>

                <!-- Idea title box -->
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background: #F8F9FB;
                          border: 1px solid rgba(0,0,0,0.07);
                          border-radius: 8px;
                          padding: 12px 16px;
                        ">
                          <p style="margin: 0 0 3px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9AB0C8;">Your idea</p>
                          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0D1F35; line-height: 1.4;">
                            ${c(t)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Note block (conditional) -->
                ${s}

                <!-- Closing -->
                <tr>
                  <td style="padding: 0 40px 24px;">
                    <p style="margin: 0; font-size: 14px; line-height: 1.65; color: #6B7280;">
                      ${c(n.closing)}
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 0 40px 36px;">
                    <a
                      href="${r}/dashboard"
                      style="
                        display: inline-block;
                        padding: 10px 20px;
                        background: #F97316;
                        color: #FFFFFF;
                        text-decoration: none;
                        border-radius: 7px;
                        font-size: 13px;
                        font-weight: 700;
                        letter-spacing: 0.01em;
                      "
                    >View in IdeaFlow →</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="margin: 0; font-size: 12px; color: #9AB0C8; line-height: 1.6;">
                You received this email because you submitted an idea on IdeaFlow.<br />
                This is an automated notification — please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;return{subject:n.subject(t),html:d}}({authorName:d?.full_name?.trim()||o.email.split("@")[0],ideaTitle:t,status:a,note:i,appUrl:r});await p.m.emails.send({from:x,to:[o.email],subject:g,html:m})}let w=new r.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/ideas/status/route",pathname:"/api/ideas/status",filename:"route",bundlePath:"app/api/ideas/status/route"},resolvedPagePath:"/Users/larsneeft/Downloads/ideabox/app/api/ideas/status/route.ts",nextConfigOutput:"",userland:i}),{requestAsyncStorage:F,staticGenerationAsyncStorage:v,serverHooks:k}=w,I="/api/ideas/status/route";function _(){return(0,o.patchFetch)({serverHooks:k,staticGenerationAsyncStorage:v})}},99064:(e,t,a)=>{a.d(t,{i:()=>r});var i=a(88336);function r(){let e="https://btlpwdyiohwzohebgrwv.supabase.co",t=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!e||!t)throw Error("Missing Supabase admin environment variables");return(0,i.eI)(e,t,{auth:{autoRefreshToken:!1,persistSession:!1}})}},5579:(e,t,a)=>{a.d(t,{m:()=>i});let i=new(a(82591)).R(process.env.RESEND_API_KEY)},19692:(e,t,a)=>{a.d(t,{e:()=>n});var i=a(67721),r=a(71615);function n(){let e=(0,r.cookies)();return(0,i.createServerClient)("https://btlpwdyiohwzohebgrwv.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bHB3ZHlpb2h3em9oZWJncnd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NzAwNTksImV4cCI6MjA5MDM0NjA1OX0.oeFQLZDgk4ob4eoPoGYhMuEuoLQ1Cxw27vU2HvRh_hs",{cookies:{getAll:()=>e.getAll(),setAll(t){try{t.forEach(({name:t,value:a,options:i})=>e.set(t,a,i))}catch{}}}})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),i=t.X(0,[317,355,972,591],()=>a(94788));module.exports=i})();