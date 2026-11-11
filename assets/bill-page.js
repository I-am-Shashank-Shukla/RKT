initPage();
const main=$('main'),code=(new URLSearchParams(location.search).get('c')||'').toUpperCase(),PIN=sessionStorage.getItem('pin')||'';
const ST=[['c','q1'],['d','q2'],['m','q3']];
let FB={},BILL=null,STAFF=false,SESS=null,PAY_LIST=[];

async function load(){
  main.innerHTML='<div class="wrap"><div class="sk" style="height:56px"></div><div class="sk" style="height:440px;margin-top:14px"></div></div>';
  applyLang();
  try{
    const{data:b,error}=await sb.rpc('get_bill',{p_code:code});
    if(error)throw error;
    if(!b){
      main.innerHTML='<div class="wrap"><h2 data-i="nf"></h2><p data-i="nfh"></p></div>';
      return applyLang();
    }
    BILL=b;
    try{SESS=(await sb.auth.getSession()).data.session;}catch(_){SESS=null;}
    STAFF=!!(PIN||SESS);
    if(SESS){
      try{
        const{data:pl}=await sb.from('payments').select('*').eq('bill_code',code).order('id',{ascending:false});
        PAY_LIST=pl||[];
      }catch(_){
        PAY_LIST=[];
      }
    }else{
      PAY_LIST=[];
    }
    window.onLang=draw;
    draw();
  }catch(e){
    main.innerHTML='<div class="wrap"><div class="card c"><h2>'+t('err_save')+'</h2><p class="mu" style="margin:12px 0 16px">'+t('net_err')+'</p><button class="btn" id="retry">'+t('retry')+'</button></div></div>';
    $('retry').onclick=load;
  }
}

function draw(){
  const b=BILL,d=b.data,paid=+b.paid||0,due=Math.max(0,d.total-d.adv-paid),done=b.status=='Paid'||due<=0,nm=no(b.no),link=location.origin+location.pathname+'?c='+b.code;
  const upi='upi://pay?pa='+B.upi+'&pn='+encodeURIComponent(B.payee)+'&am='+due+'&cu=INR&tn='+nm;
  let qr='';
  if(!done){
    const q=qrcode(0,'M');
    q.addData(upi);
    q.make();
    qr=q.createDataURL(5,2);
  }
  const m=(k,x)=>'<div><small data-i="'+k+'"></small><b>'+esc(x)+'</b></div>';
  const bar=STAFF
    ?'<div class="bar"><button class="btn wa" id="wa" data-i="wa"></button><button class="btn ol" id="sh" data-i="share"></button><button class="btn ol" id="cp" data-i="cp_link"></button><a class="btn ol" href="'+(PIN?'driver.html':'admin.html')+'" data-i="back"></a></div>'+(!done?'<section class="card"><h3 data-i="payh"></h3><div class="g"><label for="pa"><span data-i="pay_amt"></span><input id="pa" name="pa" type="number" inputmode="decimal" min="0" value="'+due+'" aria-label="'+t('pay_amt')+'"></label><label for="pm"><span data-i="pay_m"></span><select id="pm" name="pm" aria-label="'+t('pay_m')+'"><option value="Cash" data-i="m_Cash"></option><option value="UPI" data-i="m_UPI"></option><option value="Bank" data-i="m_Bank"></option></select></label></div><label for="pr" style="margin-top:10px"><span data-i="pay_ref"></span><input id="pr" name="pr" type="text" maxlength="40" aria-label="'+t('pay_ref')+'"></label><button class="btn" id="pgo" style="margin-top:12px;width:100%" data-i="pay_rec"></button></section>':'')
    :'<div class="bar"><button class="btn ol" id="dl" data-i="dl"></button><button class="btn ol" id="cp" data-i="cp_link"></button></div>';

  const plHtml=(SESS&&PAY_LIST.length)?'<section class="card"><h3 data-i="rcvd"></h3>'+PAY_LIST.map(p=>
    '<div class="row" style="align-items:center"><span><b>'+inr(p.amount)+'</b> <small>'+esc(p.method)+(p.ref?' ('+esc(p.ref)+')':'')+'</small><small>'+new Date(p.at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'})+'</small></span>'
    +(p.reversed?'<span class="pill" style="background:#fee;color:var(--mr)">Reversed</span>':'<button class="lnk rev-btn" data-pid="'+p.id+'" data-pamt="'+p.amount+'">'+t('rev_pay')+'</button>')
    +'</div>'
  ).join('')+'</section>':'';

  const fb=STAFF?'':b.fb?'<section class="card"><h3 data-i="thx"></h3></section>':'<section class="card" id="fb"><h3 data-i="fbh"></h3>'+ST.map(([k,q])=>'<div class="rate"><span data-i="'+q+'"></span><span class="stars" data-k="'+k+'">'+[1,2,3,4,5].map(i=>'<button data-i2="'+i+'" aria-label="'+i+'">★</button>').join('')+'</span></div>').join('')+'<label for="txt" style="margin-top:12px"><span data-i="cmt"></span><textarea id="txt" name="txt" rows="2" aria-label="'+t('cmt')+'"></textarea></label><button id="fsend" class="btn" style="margin-top:12px;width:100%" data-i="send"></button></section>';

  main.innerHTML='<div class="wrap">'+bar+'<div id="rc" class="rc"><img class="wm" src="assets/watermark.webp" alt=""><div class="rh"><img src="assets/emblem.webp" alt=""><div><h2>Radha Kishori Travellers</h2><span class="tg" data-i="tag"></span><small>'+B.owner+', +91 '+B.ph.join(', ')+'</small><small>'+B.addr+'</small></div></div><div class="rb"><div class="mg">'+m('inv',nm)+m('date',d.date)+m('guest',d.cust+' (+91 '+d.phone+')')+m('route',d.from+' → '+d.to)+m('veh',d.car+', '+d.driver)+m('odo',d.start+' → '+d.end+' ('+d.km+' km)')+'</div>'
  +'<table><tr><th data-i="part"></th><th data-i="usage"></th><th data-i="amt"></th></tr>'+d.L.map(l=>'<tr><td>'+esc(itemName(l,d))+'</td><td>'+esc(l[1])+'</td><td>'+inr(l[2])+'</td></tr>').join('')+'</table>'
  +'<div class="tot"><div><span data-i="total"></span><b>'+inr(d.total)+'</b></div><div><span data-i="advr"></span><b>'+inr(d.adv)+'</b></div>'+(paid?'<div><span data-i="rcvd"></span><b>'+inr(paid)+'</b></div>':'')+'<div class="b"><span data-i="bal"></span><span>'+inr(due)+'</span></div></div><div class="perf"></div>'
  +(done?'<div class="stamp" data-i="paid"></div>'+(b.paid_via?'<p><small><span data-i="paidvia"></span>: '+esc(b.paid_via)+'</small></p>':''):'<div class="pay"><img src="'+qr+'" alt="UPI QR"><div><b><span data-i="payhdr"></span>: '+inr(due)+'</b><small data-i="payhint"></small><small><span data-i="upiid"></span>: '+B.upi+' ('+B.payee+')</small></div></div>')
  +'<p class="mu" style="margin-top:14px" data-i="garage"></p></div></div>'+plHtml+fb+'</div>';
  applyLang();

  const msg='नमस्ते '+d.cust+', राधा किशोरी ट्रैवलर्स के साथ यात्रा के लिए धन्यवाद।\nThank you for travelling with Radha Kishori Travellers.\n\n'+nm+': '+d.from+' → '+d.to+'\n'+t('total')+': '+inr(d.total)+'  |  '+t('bal')+': '+inr(due)+'\n\nBill / बिल, UPI, feedback:\n'+link;
  const opt={margin:6,filename:nm+'.pdf',html2canvas:{scale:2,useCORS:true},jsPDF:{unit:'mm',format:'a4'}};
  if($('wa'))$('wa').onclick=()=>window.open('https://wa.me/91'+d.phone+'?text='+encodeURIComponent(msg),'_blank');
  if($('dl'))$('dl').onclick=()=>html2pdf().set(opt).from($('rc')).save();
  if($('sh'))$('sh').onclick=async()=>{
    const f=new File([await html2pdf().set(opt).from($('rc')).outputPdf('blob')],opt.filename,{type:'application/pdf'});
    if(navigator.canShare&&navigator.canShare({files:[f]}))navigator.share({files:[f],text:msg}).catch(()=>{});
    else html2pdf().set(opt).from($('rc')).save();
  };

  if($('cp'))$('cp').onclick=async()=>{
    try{
      if(navigator.clipboard&&navigator.clipboard.writeText){
        await navigator.clipboard.writeText(link);
      }else{
        const ta=document.createElement('textarea');
        ta.value=link;
        ta.style.position='fixed';
        ta.style.opacity='0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      toast(t('copied'));
    }catch(_){
      prompt('Bill link:',link);
    }
  };

  if($('pgo'))$('pgo').onclick=async()=>{
    const a=Math.round(+v('pa')*100)/100;
    if(!(a>0))return toast(t('pay_amt'));
    if(a>due)return toast(t('err_over'));
    const g=$('pgo');
    g.disabled=true;
    let err=null;
    try{
      if(PIN){
        const{data:r,error}=await sb.rpc('driver_add_payment',{p_pin:PIN,p_code:code,p_amt:a,p_method:v('pm'),p_ref:v('pr').trim()});
        err=error||!r?'err_save':r.err?(r.err=='over'?'err_over':r.err=='locked'?'locked':'err_save'):null;
      } else {
        const{error}=await sb.from('payments').insert({bill_code:code,amount:a,method:v('pm'),ref:v('pr').trim()||null,by:'owner'});
        if(error)err='err_save';
        else await sb.rpc('refresh_bill',{p_code:code});
      }
    }catch(_){
      err='net_err';
    }
    g.disabled=false;
    if(err)return toast(t(err));
    toast(t('recorded'));
    load();
  };

  document.querySelectorAll('.rev-btn').forEach(btn=>{
    btn.onclick=async()=>{
      const pid=+btn.dataset.pid,pamt=btn.dataset.pamt;
      const note=prompt(t('rev_confirm')+' ₹'+pamt+'\n'+t('rev_reason'));
      if(note===null)return;
      btn.disabled=true;
      try{
        let{data:r,error}=await sb.rpc('owner_reverse_payment',{p_payment_id:pid,p_note:note});
        if(error||!r||r.err){
          const noteText=(note.trim()||'Reversed by owner').slice(0,50);
          const{error:upErr}=await sb.from('payments').update({reversed:true,ref:'[Reversed: '+noteText+']'}).eq('id',pid);
          if(upErr)return toast(t('err_save'));
          await sb.rpc('refresh_bill',{p_code:code});
        }
        toast(t('rev_ok'));
        load();
      }catch(_){
        toast(t('err_save'));
        btn.disabled=false;
      }
    };
  });

  document.querySelectorAll('.stars').forEach(g=>[...g.children].forEach((x,j)=>{
    x.classList.toggle('on',j<(FB[g.dataset.k]||0));
    x.onclick=()=>{
      FB[g.dataset.k]=j+1;
      [...g.children].forEach((y,i)=>y.classList.toggle('on',i<=j));
    };
  }));

  if($('fsend'))$('fsend').onclick=async()=>{
    if(!(FB.c&&FB.d&&FB.m))return toast(t('rate_all'));
    const fs=$('fsend');
    fs.disabled=true;
    try{
      const{error}=await sb.rpc('send_feedback',{p_code:b.code,p_fb:{...FB,txt:v('txt').trim().slice(0,500)}});
      if(error){fs.disabled=false;return toast(t('err_save'));}
      $('fb').innerHTML='<h3>'+t('thx')+'</h3>';
    }catch(_){
      fs.disabled=false;
      toast(t('net_err'));
    }
  };
}

load();
