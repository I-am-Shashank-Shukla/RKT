initPage({english:true});
window.ADMIN=true;
const main=$('main');

const RF=[
  ['outKm','Outstation rate, ₹ per km'],
  ['minKm','Outstation minimum km per day'],
  ['bhatta','Driver allowance, ₹ per day'],
  ['night','Night halt, ₹ per night'],
  ['l8','Local 8 hr / 80 km package, ₹'],
  ['l12','Local 12 hr / 120 km package, ₹'],
  ['xKm','Extra km, ₹ per km'],
  ['xHr','Extra hour, ₹ per hour'],
  ['owKm','One-way drop, ₹ per km'],
  ['wait','Waiting charge, ₹ per hour']
];

const rf=(id,l,val,ty,ph)=>'<label for="'+id+'">'+l+'<input id="'+id+'" name="'+id+'" type="'+(ty||'number')+'" value="'+esc(val??'')+'"'+(ph?' placeholder="'+ph+'"':'')+(ty?'':' inputmode="decimal" min="0"')+' aria-label="'+esc(l)+'"></label>';

let ALL=[],PAID={};
const rec=b=>(b.data.adv||0)+(PAID[b.code]||0),due=b=>Math.max(0,b.data.total-rec(b));

function getFilteredBills(){
  const q=(v('q')||'').toLowerCase(),s=v('fs'),a=v('fa'),z=v('fz');
  return ALL.filter(b=>{
    const d=b.data;
    return(!q||(no(b.no)+d.cust+d.phone+d.from+d.to).toLowerCase().includes(q))&&(!s||b.status==s)&&(!a||d.date>=a)&&(!z||d.date<=z);
  });
}

function rows(){
  const r=getFilteredBills();
  $('tb').innerHTML=r.map(b=>{
    const d=b.data,f=b.fb;
    return'<tr><td><b>'+no(b.no)+'</b><small>'+esc(d.date)+'</small></td><td>'+esc(d.cust)+'<small>'+esc(d.phone)+'</small></td><td>'+esc(d.from)+' → '+esc(d.to)+'<small>'+d.km+' km</small></td><td>'+inr(d.total)+'<small>received '+inr(rec(b))+'</small></td><td>'+inr(due(b))+'</td><td><span class="pill '+b.status+'">'+b.status+'</span>'+(b.paid_via?'<small>'+esc(b.paid_via)+'</small>':'')+'</td><td>'+(f?f.c+', '+f.d+', '+f.m+'<small>'+esc(f.txt)+'</small>':'Waiting')+'</td><td><a href="bill.html?c='+b.code+'">Open</a> <button class="lnk" data-a="ed" data-c="'+b.code+'">Edit</button> <button class="lnk" data-a="rm" data-c="'+b.code+'">Delete</button></td></tr>';
  }).join('')||'<tr><td colspan="8" class="empty">'+(ALL.length?'No bills match these filters.':'No bills yet. Bills made on the driver page appear here.')+'</td></tr>';
}

function exportCSV(bills){
  if(!bills||!bills.length)return toast('No bills to export.');
  const headers=['Invoice No','Bill Code','Date','Customer Name','Phone','From','To','Car','Driver','Billing Type','Opening Km','Closing Km','Total Km','Total Fare (INR)','Advance (INR)','Payments Received (INR)','Balance Due (INR)','Status','Paid Via','Cleanliness (1-5)','Driver (1-5)','Comfort (1-5)','Customer Comments'];
  const escCSV=val=>`"${String(val??'').replace(/"/g,'""')}"`;
  const lines=bills.map(b=>{
    const d=b.data||{},f=b.fb||{};
    return[no(b.no),b.code,d.date||'',d.cust||'',d.phone||'',d.from||'',d.to||'',d.car||'',d.driver||'',d.type||'',d.start||0,d.end||0,d.km||0,d.total||0,d.adv||0,rec(b),due(b),b.status||'',b.paid_via||'',f.c||'',f.d||'',f.m||'',f.txt||''].map(escCSV).join(',');
  });
  const csv='\uFEFF'+[headers.map(escCSV).join(','),...lines].join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const u=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=u;
  a.download='RKT-Bills-'+today()+'.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(u);
  toast('Exported '+bills.length+' bills to CSV');
}

async function admin(){
  window.onLang=null;
  let session=null;
  try{
    const res=await sb.auth.getSession();
    session=res.data.session;
  }catch(_){
    session=null;
  }
  if(!session){
    main.innerHTML='<div class="card narrow"><h2>Owner login</h2><label for="em">Email<input id="em" name="em" type="email" autocomplete="username" aria-label="Email"></label><label for="pw" style="margin-top:12px">Password<input id="pw" name="pw" type="password" autocomplete="current-password" aria-label="Password"></label><button id="go" class="btn" style="margin-top:16px">Log in</button></div>';
    $('pw').onkeydown=e=>{if(e.key=='Enter')$('go').click()};
    $('go').onclick=async()=>{
      const g=$('go');
      if(g.disabled)return;
      g.disabled=true;
      try{
        const{error}=await sb.auth.signInWithPassword({email:v('em').trim(),password:v('pw')});
        if(error)toast('Login failed: '+error.message);
        else admin();
      }catch(_){
        toast('Connection failed. Please retry.');
      }finally{
        g.disabled=false;
      }
    };
    return;
  }
  main.innerHTML='<div class="wrap wide"><div class="sk" style="height:60px"></div><div class="sk" style="height:300px;margin-top:14px"></div></div>';
  let r1,r2,r3,r4;
  try{
    [r1,r2,r3,r4]=await Promise.all([
      sb.from('bills').select('*').order('no',{ascending:false}),
      sb.from('settings').select('rates').eq('id',1).single(),
      sb.from('payments').select('bill_code,amount').eq('reversed',false),
      sb.from('audit').select('*').order('id',{ascending:false}).limit(15)
    ]);
  }catch(err){
    main.innerHTML='<div class="wrap"><div class="card c"><h2>Network error</h2><p class="mu" style="margin:12px 0 16px">Unable to connect to the database. Please check your connection.</p><button class="btn" id="retry">Retry</button></div></div>';
    $('retry').onclick=admin;
    return;
  }
  if(r2.error||!r2.data){
    main.innerHTML='<div class="wrap"><h2>Could not load</h2><p>'+esc(r2.error?r2.error.message:'Settings not found')+'. Make sure you ran sql/03-security-payments.sql.</p><button class="btn sm" id="retry" style="margin-top:12px">Retry</button></div>';
    $('retry').onclick=admin;
    return;
  }
  ALL=r1.data||[];
  PAID={};
  (r3.data||[]).forEach(p=>PAID[p.bill_code]=(PAID[p.bill_code]||0)+Number(p.amount));
  const R=r2.data.rates,rated=ALL.filter(b=>b.fb);
  const billed=ALL.reduce((x,b)=>x+b.data.total,0),
        got=ALL.reduce((x,b)=>x+Math.min(rec(b),b.data.total),0),
        pend=ALL.reduce((x,b)=>x+due(b),0),
        mo=today().slice(0,7);
  const avg=rated.length?(rated.reduce((s,b)=>s+(b.fb.c+b.fb.d+b.fb.m)/3,0)/rated.length).toFixed(1)+' / 5':'No ratings yet';
  main.innerHTML='<div class="wrap wide"><div class="top"><h2>Owner dashboard</h2><span><button class="btn ol sm" id="csv">Export CSV</button> <a class="btn ol sm" href="driver.html">Driver page</a> <button class="btn ol sm" id="lo">Log out</button></span></div>'
  +'<div class="stats">'+[['Trips billed',ALL.length],['Total billed',inr(billed)],['Payments received',inr(got)],['Balance pending',inr(pend)],['Billed this month',inr(ALL.filter(b=>b.data.date.startsWith(mo)).reduce((x,b)=>x+b.data.total,0))],['Average rating',avg]].map(([k,x])=>'<div><small>'+k+'</small><b>'+x+'</b></div>').join('')+'</div>'
  +'<div class="flt"><label for="q">Search<input id="q" name="q" type="search" placeholder="Bill no, name, phone or place" aria-label="Search bills"></label><label for="fs">Status<select id="fs" name="fs" aria-label="Filter status"><option value="">All</option><option>Pending</option><option>Partial</option><option>Paid</option></select></label><label for="fa">From<input id="fa" name="fa" type="date" aria-label="From date"></label><label for="fz">To<input id="fz" name="fz" type="date" aria-label="To date"></label></div>'
  +'<div class="tw"><table><tr><th>Bill</th><th>Guest</th><th>Route</th><th>Total</th><th>Due</th><th>Status</th><th>Rating: clean, driver, comfort</th><th></th></tr><tbody id="tb"></tbody></table></div>'
  +'<section class="card"><h3>Rate card</h3><p class="mu" style="margin-bottom:12px">Set every rate here. The driver page uses these numbers and cannot change them. Old bills keep the rates they were made with.</p><div class="g">'+RF.map(([k,l])=>rf('r_'+k,l,R[k])).join('')+rf('r_pin','New driver PIN (leave empty to keep the current one)','','text','4 to 8 digits')+'</div><button id="sv" class="btn" style="margin-top:16px">Save rate card</button></section>'
  +'<section class="card"><h3>Activity log</h3><div class="log">'+((r4.data||[]).map(a=>'<div><b>'+esc(a.action)+'</b> '+esc(a.code)+'<small>'+esc(a.who)+', '+new Date(a.at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+'</small></div>').join('')||'<div class="empty">No edits or deletions yet.</div>')+'</div></section></div>';

  rows();
  if($('csv'))$('csv').onclick=()=>exportCSV(getFilteredBills());
  main.oninput=e=>{if(e.target.closest('.flt'))rows()};
  main.onclick=async e=>{
    const x=e.target,a=x.dataset.a,c=x.dataset.c;
    if(!a)return;
    if(a=='rm'&&confirm('Delete this bill and its payments permanently? This is recorded in the activity log.')){
      x.disabled=true;
      try{
        const{error}=await sb.from('bills').delete().eq('code',c);
        error?toast(error.message):(toast('Deleted'),admin());
      }catch(_){
        toast('Failed to delete. Please retry.');
      }finally{
        x.disabled=false;
      }
    }
    if(a=='ed'){
      const b=ALL.find(y=>y.code==c);
      main.oninput=main.onclick=null;
      mountForm(main,b.data,b.data.rt||R,async data=>{
        try{
          const{error}=await sb.from('bills').update({data}).eq('code',c);
          if(error)return toast('Could not save: '+error.message);
          await sb.rpc('refresh_bill',{p_code:c});
          location.href='bill.html?c='+c;
        }catch(_){
          toast('Network error saving bill.');
        }
      });
      main.firstChild.insertAdjacentHTML('afterbegin','<p><a class="btn ol sm" href="admin.html">Back</a></p>');
    }
  };
  $('sv').onclick=async()=>{
    const sv=$('sv');
    if(sv.disabled)return;
    sv.disabled=true;
    try{
      const rates={confirmed:true};
      RF.forEach(([k])=>rates[k]=+v('r_'+k)||0);
      const pin=v('r_pin').trim();
      if(pin&&!/^\d{4,8}$/.test(pin))return toast('Driver PIN must be 4 to 8 digits.');
      let{error}=await sb.from('settings').update({rates}).eq('id',1);
      if(!error&&pin)({error}=await sb.rpc('owner_set_pin',{p:pin}));
      toast(error?error.message:'Saved. The driver page now uses these rates.');
    }catch(_){
      toast('Network error saving rates.');
    }finally{
      sv.disabled=false;
    }
  };
  $('lo').onclick=async()=>{
    await sb.auth.signOut();
    admin();
  };
}

admin();
