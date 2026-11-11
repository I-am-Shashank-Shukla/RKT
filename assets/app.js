const SB='https://tcyqglzscrcujkfiijmp.supabase.co',KEY='sb_publishable_kFxBzQGgQLF2kJqGQU6zlQ_ytpeFjKB';
const sb=window.supabase?supabase.createClient(SB,KEY):null;
const B={ph:['9935792953','7651906520'],owner:'Ashok Kumar Shukla',addr:'Kanpur Nagar, Uttar Pradesh',upi:'ashokshuklaarti@okicici',payee:'Ashok Shukla',car:'UP 35 CE 0371',driver:'Anil'};
const $=i=>document.getElementById(i),v=i=>$(i).value,n=i=>Math.min(1e7,Math.max(0,+$(i).value||0));
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=x=>'₹'+Math.round(x).toLocaleString('en-IN'),no=x=>'RKT-'+String(x).padStart(4,'0');
const D={tag:['Your Journey, Our Priority','आपकी यात्रा, हमारी प्राथमिकता'],sub:['Trip billing and feedback','यात्रा बिल और फीडबैक'],drv:['Driver','ड्राइवर'],own:['Owner','मालिक'],
pin:['Enter your PIN','अपना पिन डालें'],open:['Open','खोलें'],badpin:['That PIN is not correct','पिन सही नहीं है'],newbill:['New trip bill','नया यात्रा बिल'],
s1:['Customer','ग्राहक'],s2:['Trip meter','यात्रा मीटर'],s3:['Charges','शुल्क'],name:['Customer name','ग्राहक का नाम'],phone:['WhatsApp number (10 digits)','व्हाट्सऐप नंबर (10 अंक)'],
from:['Pickup','कहाँ से'],to:['Destination','कहाँ तक'],date:['Trip date','यात्रा की तारीख'],type:['Billing type','बिल का प्रकार'],start:['Opening km (garage)','शुरुआती किमी (गैराज)'],end:['Closing km (garage)','अंतिम किमी (गैराज)'],
days:['Number of days','दिनों की संख्या'],hours:['Hours used','कुल घंटे'],fixed:['Agreed fare ₹','तय किराया ₹'],limit:['Included km (0 = no limit)','शामिल किमी (0 = सीमा नहीं)'],nights:['Night halts','रात्रि विश्राम'],
wait:['Waiting hours','प्रतीक्षा के घंटे'],toll:['Toll, parking, tax ₹','टोल, पार्किंग, टैक्स ₹'],adv:['Advance received ₹','एडवांस मिला ₹'],other:['Other charge ₹','अन्य शुल्क ₹'],olabel:['Reason for other charge','अन्य शुल्क का कारण'],
ty_out:['Outstation round trip','आउटस्टेशन राउंड ट्रिप'],ty_l8:['Local 8 hr / 80 km','लोकल 8 घंटे / 80 किमी'],ty_l12:['Local 12 hr / 120 km','लोकल 12 घंटे / 120 किमी'],ty_ow:['One-way / airport drop','वन-वे / एयरपोर्ट ड्रॉप'],ty_fixed:['Fixed fare / tour package','तय किराया / टूर पैकेज'],
total:['Total','कुल'],bal:['Balance to pay','देय शेष राशि'],save:['Save bill','बिल सहेजें'],recent:['Recent bills','हाल के बिल'],logout:['Log out','लॉग आउट'],norates:['Rates are not set yet. Please ask the owner.','दरें अभी तय नहीं हैं। कृपया मालिक से कहें।'],
err_fill:['Please enter the customer name, a 10-digit WhatsApp number, the route, and opening and closing km (closing must be higher).','कृपया ग्राहक का नाम, 10 अंक का व्हाट्सऐप नंबर, रूट और शुरुआती व अंतिम किमी भरें (अंतिम किमी ज़्यादा होना चाहिए)।'],
err_save:['Could not save. Please try again.','सहेज नहीं सके। कृपया फिर कोशिश करें।'],inv:['Invoice','बिल नं.'],guest:['Guest','अतिथि'],route:['Route','रूट'],veh:['Vehicle and driver','गाड़ी और ड्राइवर'],odo:['Odometer','ओडोमीटर'],
part:['Particulars','विवरण'],usage:['Usage','उपयोग'],amt:['Amount','राशि'],advr:['Advance received','एडवांस प्राप्त'],paid:['PAID','भुगतान हुआ'],payhdr:['Pay with any UPI app','किसी भी UPI ऐप से भुगतान करें'],
payhint:['Scan the code. The amount fills in automatically.','कोड स्कैन करें। राशि अपने-आप भर जाएगी।'],upiid:['UPI ID','UPI आईडी'],paidvia:['Paid by','भुगतान का तरीका'],
garage:['Distance and time are counted from garage to garage. Thank you for travelling with Radha Kishori Travellers.','दूरी और समय गैराज से गैराज तक गिने जाते हैं। राधा किशोरी ट्रैवलर्स के साथ यात्रा के लिए धन्यवाद।'],
wa:['Send on WhatsApp','व्हाट्सऐप पर भेजें'],share:['Share PDF','PDF शेयर करें'],dl:['Download PDF','PDF डाउनलोड करें'],back:['Back','वापस'],cash:['Cash received','नकद मिला'],upir:['UPI received','UPI से मिला'],
fbh:['How was your journey?','आपकी यात्रा कैसी रही?'],q1:['Car cleanliness','गाड़ी की सफाई'],q2:['Driver behaviour and safe driving','ड्राइवर का व्यवहार और सुरक्षित ड्राइविंग'],q3:['Overall comfort','कुल मिलाकर आराम'],
cmt:['Comments (optional)','टिप्पणी (वैकल्पिक)'],send:['Send feedback','फीडबैक भेजें'],thx:['Thank you! Your feedback has reached us.','धन्यवाद! आपका फीडबैक हम तक पहुँच गया।'],rate_all:['Please rate all three questions.','कृपया तीनों प्रश्नों को रेटिंग दें।'],
nf:['Bill not found','बिल नहीं मिला'],nfh:['Please check the link you received.','कृपया मिला हुआ लिंक जाँचें।'],load:['Loading…','लोड हो रहा है…'],
i_out:['Outstation round trip','आउटस्टेशन राउंड ट्रिप'],i_drv:['Driver allowance (per day)','ड्राइवर भत्ता (प्रति दिन)'],i_loc8:['Local package, 8 hr / 80 km','लोकल पैकेज, 8 घंटे / 80 किमी'],i_loc12:['Local package, 12 hr / 120 km','लोकल पैकेज, 12 घंटे / 120 किमी'],
i_xkm:['Extra km','अतिरिक्त किमी'],i_xhr:['Extra hours','अतिरिक्त घंटे'],i_ow:['One-way drop','वन-वे ड्रॉप'],i_fix:['Fixed fare / tour package','तय किराया / टूर पैकेज'],i_night:['Night halt','रात्रि विश्राम'],
i_wait:['Waiting charges','प्रतीक्षा शुल्क'],i_toll:['Toll, parking and state tax','टोल, पार्किंग और राज्य कर'],i_other:['Other charge','अन्य शुल्क'],
payh:['Record a payment','भुगतान दर्ज करें'],pay_amt:['Amount received ₹','मिली राशि ₹'],pay_m:['Method','तरीका'],pay_ref:['Reference (optional)','संदर्भ (वैकल्पिक)'],pay_rec:['Record payment','भुगतान दर्ज करें'],m_Cash:['Cash','नकद'],m_UPI:['UPI','UPI'],m_Bank:['Bank transfer','बैंक ट्रांसफर'],rcvd:['Payments received','प्राप्त भुगतान'],
err_over:['Amount is more than the balance due.','राशि बकाया से ज़्यादा है।'],locked:['Too many wrong attempts. Try again in 15 minutes.','बहुत ज़्यादा गलत प्रयास। 15 मिनट बाद कोशिश करें।'],err_adv:['Advance cannot be more than the total.','एडवांस कुल राशि से ज़्यादा नहीं हो सकता।'],
err_tot:['The total did not match the rate card. Reload the page and try again.','कुल राशि रेट कार्ड से मेल नहीं खाई। पेज रीलोड करके फिर कोशिश करें।'],recorded:['Payment recorded','भुगतान दर्ज हो गया'],offline:['You are offline. Please check your connection.','आप ऑफ़लाइन हैं। कृपया इंटरनेट कनेक्शन जाँचें।'],net_err:['Unable to connect. Please check your connection and retry.','कनेक्शन नहीं हो सका। कृपया इंटरनेट जाँच कर पुनः प्रयास करें।'],retry:['Retry','पुनः प्रयास'],cp_link:['Copy link','लिंक कॉपी करें'],copied:['Link copied to clipboard!','लिंक क्लिपबोर्ड पर कॉपी हो गया!'],csv_exp:['Export CSV','CSV डाउनलोड करें'],pwa_hint:['Add Driver App to Home Screen for quick access','होम स्क्रीन पर RKT ड्राइवर ऐप जोड़ें'],pwa_btn:['Add to Home Screen','होम स्क्रीन पर जोड़ें'],rev_pay:['Reverse','वापस लें'],rev_confirm:['Reverse this payment?','क्या आप इस भुगतान को वापस लेना चाहते हैं?'],rev_reason:['Reason for reversal (optional):','वापसी का कारण (वैकल्पिक):'],rev_ok:['Payment reversed successfully.','भुगतान सफलतापूर्वक वापस ले लिया गया।']};
let lang=localStorage.getItem('lang')||'en';
const t=k=>(D[k]||[k,k])[lang=='hi'?1:0];
function applyLang(){document.documentElement.lang=lang;document.querySelectorAll('[data-i]').forEach(e=>e.textContent=t(e.dataset.i));const b=$('lang');if(b)b.textContent=lang=='en'?'हिन्दी':'English'}
function initPage(o){o=o||{};if(o.english)lang='en';
 document.body.insertAdjacentHTML('afterbegin',`<header class="hd"><a class="lg" href="index.html"><img src="assets/emblem.webp" alt="RKT"><span><b>Radha Kishori Travellers</b><small data-i="tag"></small></span></a>${o.english?'':'<button id="lang" type="button" aria-label="Toggle language"></button>'}</header>`);
 const updNet=()=>{let b=$('off-bar');if(!navigator.onLine){if(!b){b=document.createElement('div');b.id='off-bar';b.className='off-bar';b.setAttribute('role','alert');b.setAttribute('data-i','offline');b.textContent=t('offline');document.body.insertAdjacentElement('afterbegin',b)}}else if(b)b.remove()};
 window.addEventListener('offline',updNet);window.addEventListener('online',updNet);updNet();
 if($('lang'))$('lang').onclick=()=>{lang=lang=='en'?'hi':'en';localStorage.setItem('lang',lang);applyLang();window.onLang&&window.onLang()};applyLang()}
function calc(f,R){const km=Math.max(0,f.end-f.start),L=[];let bill=km;const add=(k,u,a)=>{a=Math.round(a);if(a>0)L.push([k,u,a])};
 if(f.type=='out'){bill=Math.max(km,f.days*R.minKm);add('out',bill+' km × ₹'+R.outKm,bill*R.outKm);add('drv',f.days+' × ₹'+R.bhatta,f.days*R.bhatta)}
 else if(f.type=='l8'||f.type=='l12'){const h=f.type=='l8'?8:12,k=h==8?80:120,xk=Math.max(0,km-k),xh=Math.max(0,f.hours-h);add('loc'+h,h+' hr / '+k+' km',R[f.type]);add('xkm',xk+' km × ₹'+R.xKm,xk*R.xKm);add('xhr',xh+' hr × ₹'+R.xHr,xh*R.xHr)}
 else if(f.type=='ow')add('ow',km+' km × ₹'+R.owKm,km*R.owKm);
 else{const xk=f.limit?Math.max(0,km-f.limit):0;add('fix',f.limit?'≤ '+f.limit+' km':'',f.fixed);add('xkm',xk+' km × ₹'+R.xKm,xk*R.xKm)}
 add('night',f.nights+' × ₹'+R.night,f.nights*R.night);add('wait',f.wait+' hr × ₹'+R.wait,f.wait*R.wait);add('toll','',f.toll);add('other','',f.other);
 const total=L.reduce((s,l)=>s+l[2],0);return{km,bill,L,total,bal:Math.max(0,total-f.adv)}}
const itemName=(l,d)=>l[0]=='other'&&d.olabel?d.olabel:t('i_'+l[0]);
const fld=(id,k,ty,val,tt)=>`<label data-t="${tt||''}" for="${id}"><span data-i="${k}"></span><input id="${id}" name="${id}" type="${ty||'number'}" value="${esc(val??'')}" ${ty?'':'inputmode="decimal" min="0"'}></label>`;
const readForm=()=>({cust:v('cust').trim(),phone:v('phone').trim(),from:v('from').trim(),to:v('to').trim(),date:v('date'),type:v('type'),start:n('start'),end:n('end'),days:Math.max(1,n('days')),hours:n('hours'),nights:n('nights'),wait:n('wait'),toll:n('toll'),other:n('other'),olabel:v('olabel').trim(),fixed:n('fixed'),limit:n('limit'),adv:n('adv'),driver:B.driver,car:B.car});
function mountForm(el,p,R,onSave){p=p||{};
 el.innerHTML=`<div class="wrap">${R.confirmed||window.ADMIN?'':'<p class="warn" data-i="norates"></p>'}<h2 class="ttl" data-i="newbill"></h2>
 <section class="card"><h3 data-i="s1"></h3><div class="g">${fld('cust','name','text',p.cust)}${fld('phone','phone','tel',p.phone)}${fld('from','from','text',p.from)}${fld('to','to','text',p.to)}${fld('date','date','date',p.date||today())}<label for="type"><span data-i="type"></span><select id="type" name="type">${['out','l8','l12','ow','fixed'].map(k=>`<option value="${k}" data-i="ty_${k}"${p.type==k?' selected':''}></option>`).join('')}</select></label></div></section>
 <section class="card"><h3 data-i="s2"></h3><div class="g">${fld('start','start',0,p.start)}${fld('end','end',0,p.end)}${fld('days','days',0,p.days||1,'out')}${fld('hours','hours',0,p.hours||8,'l8,l12')}${fld('fixed','fixed',0,p.fixed,'fixed')}${fld('limit','limit',0,p.limit,'fixed')}</div></section>
 <section class="card"><h3 data-i="s3"></h3><div class="g">${fld('nights','nights',0,p.nights)}${fld('wait','wait',0,p.wait)}${fld('toll','toll',0,p.toll)}${fld('adv','adv',0,p.adv)}${fld('other','other',0,p.other)}${fld('olabel','olabel','text',p.olabel)}</div></section>
 <section class="card sum" id="sum"></section>
 <div class="dock"><div><small data-i="bal"></small><b id="dbal">₹0</b></div><button id="go" class="btn" data-i="save"></button></div></div>`;
 const upd=()=>{const ty=v('type');el.querySelectorAll('[data-t]').forEach(e=>e.style.display=!e.dataset.t||e.dataset.t.split(',').includes(ty)?'':'none');
  const c=calc(readForm(),R);$('sum').innerHTML=c.L.map(l=>`<div><span>${esc(itemName(l,{olabel:v('olabel')}))}<small>${esc(l[1])}</small></span><b>${inr(l[2])}</b></div>`).join('')+`<div class="t"><span>${t('total')} (${c.km} km)</span><b>${inr(c.total)}</b></div>`;$('dbal').textContent=inr(c.bal)};
 el.oninput=upd;window.onLang=upd;applyLang();upd();
 $('go').onclick=async()=>{const f=readForm();if(!f.cust||!/^\d{10}$/.test(f.phone)||!f.from||!f.to||f.end<=f.start)return toast(t('err_fill'));if(f.adv>calc(f,R).total)return toast(t('err_adv'));
  if(!R.confirmed&&!window.ADMIN)return toast(t('norates'));const g=$('go');g.disabled=true;try{await onSave({...f,...calc(f,R),rt:R})}finally{g.disabled=false}}}

function toast(m){const e=document.createElement('div');e.className='toast';e.setAttribute('role','status');e.setAttribute('aria-live','polite');e.textContent=m;document.body.appendChild(e);setTimeout(()=>e.remove(),4500)}
