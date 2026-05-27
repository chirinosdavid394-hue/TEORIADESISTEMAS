/* ════ ESTADO + LOCALSTORAGE ════ */
let ST = {visited:[],exDone:[],gamesUsed:[],quizScore:0,quizDone:false,badges:[]};
function loadST(){const s=localStorage.getItem('ova-caos');if(s)ST=JSON.parse(s);applyBadges();}
function saveST(){localStorage.setItem('ova-caos',JSON.stringify(ST));}
function visitSec(id){if(!ST.visited.includes(id)){ST.visited.push(id);saveST();checkBadges();}}
function doneEx(id){if(!ST.exDone.includes(id)){ST.exDone.push(id);saveST();checkBadges();}}
function useGame(id){if(!ST.gamesUsed.includes(id)){ST.gamesUsed.push(id);saveST();checkBadges();}}
function checkBadges(){
  const secs=['inicio','contexto','teoria','ejemplos','ejercicios','juegos','herramientas','glosario','videos','quiz-sec','caso'];
  if(secs.every(s=>ST.visited.includes(s)))earnBadge('explorer');
  if(ST.exDone.length>=5)earnBadge('scientist');
  if(ST.gamesUsed.length>=3)earnBadge('gamer');
  if(ST.quizScore>=8&&ST.quizDone)earnBadge('master');
}
function earnBadge(id){if(!ST.badges.includes(id)){ST.badges.push(id);saveST();}applyBadges();}
function applyBadges(){ST.badges.forEach(b=>{const el=document.getElementById('badge-'+b);if(el)el.classList.add('earned');});}

/* ════ NAV + SCROLL ════ */
window.addEventListener('scroll',()=>{
  const pct=(window.scrollY/(document.body.scrollHeight-window.innerHeight))*100;
  document.getElementById('nav-prog').style.width=pct+'%';
  const ids=['inicio','contexto','teoria','ejemplos','ejercicios','juegos','herramientas','glosario','videos','quiz-sec','caso'];
  let cur='inicio';
  ids.forEach(id=>{const el=document.getElementById(id);if(el&&window.scrollY>=el.offsetTop-70)cur=id;});
  document.querySelectorAll('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+cur));
  // track visited
  ids.forEach(id=>{const el=document.getElementById(id);if(!el)return;const r=el.getBoundingClientRect();if(r.top<window.innerHeight*.6&&r.bottom>0)visitSec(id);});
});

/* ════ FADE IN ════ */
const fobs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('vis');}),{threshold:.08});
document.querySelectorAll('.fi').forEach(el=>fobs.observe(el));

/* ════ HERO CANVAS ════ */
(function(){
  const c=document.getElementById('hero-cv'),ctx=c.getContext('2d');
  let W,H,pts;
  function resize(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;
    pts=Array.from({length:120},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.85,vy:(Math.random()-.5)*.85,r:Math.random()*1.6+.4}));}
  resize();window.addEventListener('resize',resize);
  function frame(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle='rgba(107,232,155,.75)';ctx.fill();});
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<105){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);
        ctx.strokeStyle=`rgba(107,232,155,${.16*(1-d/105)})`;ctx.lineWidth=.5;ctx.stroke();}}
    requestAnimationFrame(frame);}
  frame();
})();

/* ════ LORENZ CANVAS (teoría) ════ */
(function(){
  const c=document.getElementById('lorenz-cv'),ctx=c.getContext('2d');
  const pts=[];let lx=.1,ly=0,lz=0;
  const s=10,rho=28,b=8/3,dt=.005;
  function resize(){c.width=c.offsetWidth;}
  function step(){const dx=s*(ly-lx),dy=lx*(rho-lz)-ly,dz=lx*ly-b*lz;
    lx+=dx*dt;ly+=dy*dt;lz+=dz*dt;
    const W=c.width,H=270;
    pts.push({x:(lx+30)/60*W,y:(lz-5)/40*H});
    if(pts.length>3500)pts.shift();}
  function draw(){
    resize();
    const W=c.width,H=270;
    for(let i=0;i<4;i++)step();
    ctx.clearRect(0,0,W,H);
    if(pts.length<2){requestAnimationFrame(draw);return;}
    ctx.beginPath();pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
    const g=ctx.createLinearGradient(0,0,W,0);
    g.addColorStop(0,'#6be89b');g.addColorStop(.5,'#ffa915');g.addColorStop(1,'#6be89b');
    ctx.strokeStyle=g;ctx.lineWidth=1;ctx.stroke();requestAnimationFrame(draw);}
  setTimeout(()=>{resize();draw();},120);
})();

/* ════ MINI CANVASES (ejemplos) ════ */
function drawWeather(){const c=document.getElementById('cv-weather'),ctx=c.getContext('2d');
  const W=c.width,H=c.height;let wx=.1,wy=0,wz=0;const p=[];
  for(let i=0;i<900;i++){const dx=10*(wy-wx),dy=wx*(28-wz)-wy,dz=wx*wy-8/3*wz;wx+=dx*.008;wy+=dy*.008;wz+=dz*.008;p.push({x:(wx+30)/60*W,y:(wz-5)/40*H});}
  ctx.beginPath();p.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y));ctx.strokeStyle='#4ecdc4';ctx.lineWidth=1.2;ctx.stroke();}
function drawHeart(){const c=document.getElementById('cv-heart'),ctx=c.getContext('2d');
  const W=c.width,H=c.height;ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.6;ctx.beginPath();
  let t=0;for(let x=0;x<W;x+=1.2){const y=H/2+28*Math.sin(t)*Math.sin(t*7)*Math.exp(-Math.pow((t%6.28-3.14),2)/2);x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);t+=.1;}ctx.stroke();}
function drawPop(){const c=document.getElementById('cv-pop'),ctx=c.getContext('2d');
  const W=c.width,H=c.height;let px=0.4,py=0.5;const p=[];
  for(let i=0;i<500;i++){const dx=(1.5-.5*py)*px,dy=(.75*px-.25)*py;px+=dx*.025;py+=dy*.025;p.push({x:px*W*.6+10,y:H-py*H*.85});}
  ctx.beginPath();p.forEach((pt,i)=>i===0?ctx.moveTo(pt.x,pt.y):ctx.lineTo(pt.x,pt.y));ctx.strokeStyle='#6be89b';ctx.lineWidth=1.3;ctx.stroke();}
function drawMkt(){const c=document.getElementById('cv-mkt'),ctx=c.getContext('2d');
  const W=c.width,H=c.height;let v=H/2;ctx.strokeStyle='#ffa915';ctx.lineWidth=1.6;ctx.beginPath();
  for(let x=0;x<W;x++){v+=(Math.random()-.5)*9+Math.sin(x*.3)*2;v=Math.max(16,Math.min(H-16,v));x===0?ctx.moveTo(x,v):ctx.lineTo(x,v);}ctx.stroke();}
window.addEventListener('load',()=>{drawWeather();drawHeart();drawPop();drawMkt();setTimeout(g2DrawFull,250);});

/* ════ TABS ════ */
function showTab(id,btn){
  document.querySelectorAll('.tab-c').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(id).classList.add('active');if(btn)btn.classList.add('active');}

/* ════ EJERCICIOS ════ */
function toggleEx(hd){const ex=hd.parentElement;ex.classList.toggle('open');hd.querySelector('span:last-child').textContent=ex.classList.contains('open')?'▲':'▼';}

function calcEx1(){
  const r=parseFloat(document.getElementById('e1r').value),x0=parseFloat(document.getElementById('e1x0').value),n=parseInt(document.getElementById('e1n').value);
  if(isNaN(r)||r<0||r>4||isNaN(x0)||x0<0||x0>1){alert('Valores fuera de rango');return;}
  const vals=[x0];let x=x0;for(let i=0;i<n;i++){x=r*x*(1-x);vals.push(x);}
  const out=document.getElementById('e1-out');out.style.display='block';
  out.innerHTML=vals.map((v,i)=>`x_${i} = ${v.toFixed(8)}`).join('<br>');
  const cv=document.getElementById('e1-cv');cv.style.display='block';cv.width=cv.offsetWidth;
  const ctx=cv.getContext('2d'),W=cv.width,H=cv.height;ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='#04662c';ctx.lineWidth=1.5;ctx.beginPath();
  vals.forEach((v,i)=>{const px=i/(vals.length-1)*(W-40)+20,py=(1-v)*(H-40)+20;i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);});ctx.stroke();
  vals.forEach((v,i)=>{const px=i/(vals.length-1)*(W-40)+20,py=(1-v)*(H-40)+20;ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fillStyle='#ffa915';ctx.fill();});
  let msg='';
  if(r<1)msg='El sistema colapsa a 0 (extinción).';
  else if(r<=3)msg=`Converge a punto fijo ≈ ${vals[vals.length-1].toFixed(4)}.`;
  else if(r<=3.57)msg=`Ciclos detectados (período ${r<3.449?2:r<3.544?4:8}).`;
  else msg=`¡Comportamiento caótico! Δ(x_{${n-1}},x_${n}) = ${Math.abs(vals[vals.length-1]-vals[vals.length-2]).toFixed(6)}.`;
  const res=document.getElementById('e1-res');res.className='ex-result inf';res.innerHTML='<strong>Análisis:</strong> '+msg;
  doneEx('ex1');}

const clData={
  A:{c:false,ok:'✅ Correcto. El péndulo simple (pequeñas oscilaciones) es lineal (senθ≈θ). Solución periódica exacta, sin SDIC.',err:'❌ Incorrecto. Es NO caótico: es lineal y tiene solución analítica periódica exacta.'},
  B:{c:true,ok:'✅ Correcto. El péndulo doble es no lineal con SDIC. Uno de los sistemas caóticos más estudiados.',err:'❌ Incorrecto. ES caótico: no lineal con suficientes grados de libertad y SDIC demostrada.'},
  C:{c:false,ok:'✅ Correcto. dx/dt=kx es lineal con solución única x(t)=x₀·eᵏᵗ. Predecible, no caótico.',err:'❌ Incorrecto. Es NO caótico: lineal de primer orden con solución analítica exacta.'},
  D:{c:true,ok:'✅ Correcto. El circuito de Chua es no lineal con 3 variables y exhibe atractor doble "scroll" caótico.',err:'❌ Incorrecto. ES caótico: sistema electrónico no lineal con 3 variables de estado.'},
  E:{c:false,ok:'✅ Correcto. El flujo laminar es ordenado y predecible. El caos aparece en flujo turbulento (Re alto).',err:'❌ Incorrecto. Es NO caótico: régimen laminar es ordenado. El caos requiere número de Reynolds alto.'}
};
function classify(sys,ans){
  const d=clData[sys],fb=document.getElementById('fb-'+sys);
  fb.style.display='block';
  if(ans===d.c){fb.style.cssText='display:block;background:#e8f5ee;border-left:4px solid #04662c;border-radius:0 6px 6px 0;padding:8px 10px;font-size:12px;color:#034d21';fb.textContent=d.ok;}
  else{fb.style.cssText='display:block;background:#fef0f0;border-left:4px solid #DC143C;border-radius:0 6px 6px 0;padding:8px 10px;font-size:12px;color:#8b0000';fb.textContent=d.err;}
  doneEx('ex2-'+sys);}

function checkEx3(){
  const ans=parseFloat(document.getElementById('e3-ans').value);
  const T=(1/0.35)*Math.log(0.5/0.001);
  const res=document.getElementById('e3-res');
  if(!isNaN(ans)&&Math.abs(ans-T)<0.6){res.className='ex-result ok';res.innerHTML=`✅ ¡Correcto! T=(1/0.35)·ln(500)≈${T.toFixed(2)} días. Explica por qué los pronósticos pierden fiabilidad después de ~2 semanas.`;}
  else{res.className='ex-result err';res.innerHTML=`❌ Incorrecto. T=(1/0.35)·ln(500)≈${T.toFixed(2)} días. Recuerda: T=(1/λ)·ln(δ_max/δ₀).`;}
  doneEx('ex3');}

function checkEx4(){
  const ans=parseFloat(document.getElementById('e4-ans').value);
  const D=Math.log(4)/Math.log(3);
  const res=document.getElementById('e4-res');
  if(!isNaN(ans)&&Math.abs(ans-D)<0.01){res.className='ex-result ok';res.innerHTML=`✅ ¡Correcto! D=log(4)/log(3)≈${D.toFixed(3)}. El copo de Koch es más complejo que una línea (D=1) pero no llena un plano (D=2).`;}
  else{res.className='ex-result err';res.innerHTML=`❌ Incorrecto. D=log(4)/log(3)≈${D.toFixed(3)}. Usa D=log(N)/log(1/r) con N=4, r=1/3.`;}
  doneEx('ex4');}

function calcEx5(){
  const r=parseFloat(document.getElementById('e5r').value);
  const N=parseInt(document.getElementById('e5n').value);
  if(isNaN(r)||r<0||r>4){alert('r debe estar entre 0 y 4');return;}
  let x=0.5;for(let i=0;i<200;i++)x=r*x*(1-x);
  let lam=0,valid=0;
  for(let i=0;i<N;i++){const d=Math.abs(r*(1-2*x));if(d>1e-15){lam+=Math.log(d);valid++;}x=r*x*(1-x);}
  lam=valid>0?lam/valid:-Infinity;
  let cls='',col='';
  if(lam>0.01){cls='🌀 CAÓTICO — trayectorias divergen exponencialmente';col='#034d21';}
  else if(lam>-0.01){cls='⚖️ MARGINAL — en el borde del caos';col='#7a5000';}
  else{cls='✅ ESTABLE — trayectorias convergen';col='#1a4d80';}
  let txt=`Exponente de Lyapunov para r = ${r}:\n`;
  txt+=`─────────────────────────────\n`;
  txt+=`λ = ${lam.toFixed(6)}\n\n`;
  txt+=`Clasificación: ${cls}\n`;
  if(lam>0){const h=Math.log(1000)/lam;txt+=`\nHorizonte de pred. (×1000): ~${h.toFixed(1)} iteraciones`;}
  const out=document.getElementById('e5-out');out.style.display='block';out.innerHTML=txt.replace(/\n/g,'<br>');out.style.color=col;
  doneEx('ex5');}

function checkCaso(){
  const ans=parseFloat(document.getElementById('caso-ans').value);
  const T=(1/0.9)*Math.log(1.0/0.0001);
  const res=document.getElementById('caso-res');
  if(!isNaN(ans)&&Math.abs(ans-T)<0.15){res.className='ex-result ok';res.innerHTML=`✅ ¡Correcto! T=(1/0.9)·ln(10000)≈${T.toFixed(2)} días. Con λ más alto el horizonte se reduce significativamente.`;}
  else{res.className='ex-result err';res.innerHTML=`❌ Incorrecto. T=(1/0.9)·ln(10000)≈${T.toFixed(2)} días. Revisa la fórmula T=(1/λ)·ln(δ_max/δ₀).`;}
  doneEx('caso');}

/* ════ JUEGO 1 — EFECTO MARIPOSA (mapa logístico r=3.95) ════
   x1/x2 en scope global; reset y slider los alcanzan correctamente  */
let g1Running=true, g1D1=[], g1D2=[], g1Iter=0;
let g1x1=0.5, g1x2=0.5+1e-3;
const G1R=3.95;

function g1GetDelta(){ return Math.pow(10, parseFloat(document.getElementById('g1-delta').value||'-3')); }

function g1Reset(){
  g1x1=0.5; g1x2=0.5+g1GetDelta();
  g1D1=[]; g1D2=[]; g1Iter=0; g1Running=true;
  document.getElementById('g1-pause-btn').textContent='⏸ Pausar';
  document.getElementById('g1-div').textContent='0.000000';
  document.getElementById('g1-iter').textContent='0';
  useGame('game1');
}
function g1Toggle(){
  g1Running=!g1Running;
  document.getElementById('g1-pause-btn').textContent=g1Running?'⏸ Pausar':'▶ Reanudar';
}

(function(){
  const c=document.getElementById('butterfly-cv'), ctx=c.getContext('2d');
  const CSS_H=280; // altura fija — coincide con #butterfly-cv{height:280px}

  function resize(){ c.width=c.offsetWidth||600; c.height=CSS_H; }

  function loop(){
    const W=c.width, H=c.height;
    if(g1Running){
      const spd=Math.max(1,parseInt(document.getElementById('g1-speed').value)||3);
      for(let i=0;i<spd;i++){
        g1x1=G1R*g1x1*(1-g1x1); g1x2=G1R*g1x2*(1-g1x2);
        if(!isFinite(g1x1)||isNaN(g1x1)) g1x1=Math.random();
        if(!isFinite(g1x2)||isNaN(g1x2)) g1x2=Math.random();
        g1D1.push(g1x1); g1D2.push(g1x2); g1Iter++;
        if(g1D1.length>W){ g1D1.shift(); g1D2.shift(); }
      }
    }
    ctx.fillStyle='rgba(10,26,16,.2)'; ctx.fillRect(0,0,W,H);
    [[g1D1,'#6be89b'],[g1D2,'#ffa915']].forEach(([d,col])=>{
      if(d.length<2) return;
      ctx.beginPath();
      d.forEach((v,i)=>{
        const px=i/(d.length-1)*(W-20)+10;
        const py=(1-Math.max(0,Math.min(1,v)))*(H-20)+10;
        i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);
      });
      ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke();
    });
    document.getElementById('g1-div').textContent=Math.abs(g1x1-g1x2).toFixed(6);
    document.getElementById('g1-iter').textContent=g1Iter;
    requestAnimationFrame(loop);
  }

  function init(){
    resize();
    window.addEventListener('resize', resize);
    document.getElementById('g1-delta').addEventListener('input',function(){
      const v=parseFloat(this.value);
      document.getElementById('g1-delta-val').textContent=Math.pow(10,v).toExponential(1);
      g1Reset();
    });
    g1Reset();
    loop();
  }
  // arrancar después de que el layout esté pintado
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else setTimeout(init,200);
})();

/* ════ JUEGO 2 — BIFURCACIÓN
   FIX: altura leída del CSS (constante) en vez de getComputedStyle ════ */
const G2_H=320;
function g2Behavior(r){
  if(r<1)return'Extinción (x→0)'; if(r<=3)return'Punto fijo estable';
  if(r<=3.449)return'Ciclo período 2'; if(r<=3.544)return'Ciclo período 4';
  if(r<=3.564)return'Ciclo período 8'; if(r<=3.57)return'Ciclos período alto';
  return'Caos determinista 🌀';
}
function g2Update(){
  const rv=parseInt(document.getElementById('g2-r').value)/100;
  document.getElementById('g2-r-val').textContent='r='+rv.toFixed(2);
  document.getElementById('g2-behavior').textContent=g2Behavior(rv);
  g2Draw(rv); useGame('game2');
}
function g2DrawFull(){ g2Draw(null); }
function g2Draw(hl){
  const c=document.getElementById('bifurcation-cv'), ctx=c.getContext('2d');
  c.width=c.offsetWidth||700; c.height=G2_H;
  const W=c.width, H=G2_H;
  ctx.fillStyle='#0a1a10'; ctx.fillRect(0,0,W,H);
  const rMin=2.5, rMax=4.0, pad=36, dW=W-pad*2, dH=H-32;
  for(let ri=0;ri<dW;ri++){
    const r=rMin+(ri/dW)*(rMax-rMin); let x=0.5;
    for(let j=0;j<300;j++) x=r*x*(1-x);
    for(let j=0;j<130;j++){
      x=r*x*(1-x);
      const hue=r<3?120:r<3.57?60:r<3.7?30:0;
      ctx.fillStyle=`hsla(${hue},80%,65%,.25)`;
      ctx.fillRect(ri+pad, dH-x*dH+16, 1, 1);
    }
  }
  // ejes
  ctx.strokeStyle='rgba(255,255,255,.25)'; ctx.lineWidth=.5;
  ctx.beginPath(); ctx.moveTo(pad,16); ctx.lineTo(pad,dH+16); ctx.lineTo(dW+pad,dH+16); ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.55)'; ctx.font='10px Arial';
  ctx.fillText('r=2.5',pad-2,dH+30); ctx.fillText('r=4.0',dW+pad-20,dH+30);
  ctx.fillText('x=1',4,22); ctx.fillText('x=0',4,dH+16);
  ctx.fillText('Diagrama de bifurcación — mapa logístico',W/2-90,12);
  // línea r actual
  if(hl!=null){
    const px=(hl-rMin)/(rMax-rMin)*dW+pad;
    ctx.strokeStyle='#ffa915'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(px,16); ctx.lineTo(px,dH+16); ctx.stroke();
  }
}

/* ════ JUEGO 3 — PÉNDULO DOBLE (RK2)
   FIX: altura fija; g3UpdateAngle reinicia estado sin romper el loop ════ */
const G3_H=340;
let g3Running=true, g3Time=0, g3Trace=[], g3th1, g3th2, g3w1, g3w2;
const GRAV=9.81, GL1=1, GL2=1, GM1=1, GM2=1, PDT=0.012;

function pendDerivs(t1,t2,o1,o2){
  const d=t1-t2;
  const denom=(2*GM1+GM2-GM2*Math.cos(2*d));
  const d1=denom*GL1, d2=denom*GL2;
  const sd1=Math.abs(d1)<1e-10?1e-10:d1, sd2=Math.abs(d2)<1e-10?1e-10:d2;
  const a1=(-GRAV*(2*GM1+GM2)*Math.sin(t1)-GM2*GRAV*Math.sin(t1-2*t2)
            -2*Math.sin(d)*GM2*(o2*o2*GL2+o1*o1*GL1*Math.cos(d)))/sd1;
  const a2=(2*Math.sin(d)*((GM1+GM2)*o1*o1*GL1+GRAV*(GM1+GM2)*Math.cos(t1)
            +o2*o2*GL2*GM2*Math.cos(d)))/sd2;
  return [a1,a2];
}
function g3Step(){
  const [a1,a2]=pendDerivs(g3th1,g3th2,g3w1,g3w2);
  const t1m=g3th1+g3w1*PDT/2, t2m=g3th2+g3w2*PDT/2;
  const w1m=g3w1+a1*PDT/2, w2m=g3w2+a2*PDT/2;
  const [a1m,a2m]=pendDerivs(t1m,t2m,w1m,w2m);
  g3th1+=w1m*PDT; g3th2+=w2m*PDT; g3w1+=a1m*PDT; g3w2+=a2m*PDT; g3Time+=PDT;
}
function g3StateInit(){
  const deg=parseInt(document.getElementById('g3-angle').value)||120;
  g3th1=deg*Math.PI/180; g3th2=deg*Math.PI/180*0.97;
  g3w1=0; g3w2=0; g3Time=0; g3Trace=[];
}
// FIX: g3Reset y g3UpdateAngle solo reinician estado, no el loop
function g3Reset(){ g3StateInit(); }
function g3UpdateAngle(){
  document.getElementById('g3-angle-val').textContent=document.getElementById('g3-angle').value+'°';
  g3StateInit();
}
function g3Toggle(){
  g3Running=!g3Running;
  document.getElementById('g3-pause-btn').textContent=g3Running?'⏸ Pausar':'▶ Reanudar';
}
g3StateInit(); useGame('game3');

(function(){
  const c=document.getElementById('pendulum-cv'), ctx=c.getContext('2d');
  let W, CX, CY, SC;

  function resize(){
    W=c.width=c.offsetWidth||600;
    c.height=G3_H;
    CX=W/2; CY=G3_H*0.26; SC=Math.min(W,G3_H)*0.26;
  }

  function draw(){
    if(g3Running) for(let i=0;i<2;i++) g3Step();
    ctx.fillStyle='#0a1a10'; ctx.fillRect(0,0,W,G3_H);
    const x1=CX+SC*Math.sin(g3th1), y1=CY+SC*Math.cos(g3th1);
    const x2=x1+SC*Math.sin(g3th2), y2=y1+SC*Math.cos(g3th2);
    // traza
    if(g3Running && document.getElementById('g3-trace').checked){
      g3Trace.push({x:x2,y:y2}); if(g3Trace.length>1200) g3Trace.shift();
    }
    if(g3Trace.length>1){
      ctx.beginPath();
      g3Trace.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
      ctx.strokeStyle='rgba(255,169,21,.38)'; ctx.lineWidth=.9; ctx.stroke();
    }
    // varillas
    ctx.strokeStyle='rgba(107,232,155,.9)'; ctx.lineWidth=2.5;
    ctx.beginPath(); ctx.moveTo(CX,CY); ctx.lineTo(x1,y1); ctx.stroke();
    ctx.strokeStyle='rgba(107,232,155,.65)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    // masas y pivote
    [[CX,CY,4,'#fff'],[x1,y1,9,'#6be89b'],[x2,y2,7,'#ffa915']].forEach(([px,py,r,col])=>{
      ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
    });
    // energía
    const KE=0.5*(GM1+GM2)*GL1*GL1*g3w1*g3w1+0.5*GM2*GL2*GL2*g3w2*g3w2
             +GM2*GL1*GL2*g3w1*g3w2*Math.cos(g3th1-g3th2);
    const PE=-(GM1+GM2)*GRAV*GL1*Math.cos(g3th1)-GM2*GRAV*GL2*Math.cos(g3th2);
    document.getElementById('g3-energy').textContent=(KE+PE).toFixed(3)+' J';
    document.getElementById('g3-time').textContent=g3Time.toFixed(1)+' s';
    requestAnimationFrame(draw);
  }

  function init(){
    resize();
    window.addEventListener('resize', resize);
    draw();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else setTimeout(init,200);
})();

/* ════ GLOSARIO ════ */
function filterGloss(){
  const q=document.getElementById('gloss-input').value.toLowerCase();
  document.querySelectorAll('#gloss-list .gloss-item').forEach(item=>{
    const txt=item.textContent.toLowerCase();
    item.style.display=txt.includes(q)?'block':'none';});}

/* ════ QUIZ (10 preguntas fijas) ════ */
const QUESTIONS=[
  {q:'¿Qué característica NO es propia de un sistema caótico?',opts:['Sensibilidad a condiciones iniciales','Comportamiento aleatorio no determinista','Existencia de atractores extraños','Estructura fractal en el espacio de fase'],ans:1,exp:'Los sistemas caóticos son DETERMINISTAS, no aleatorios. Su impredecibilidad viene de la SDIC, no de aleatoriedad.'},
  {q:'¿Qué significa un exponente de Lyapunov positivo (λ > 0)?',opts:['El sistema es estable','Las trayectorias convergen','El sistema es caótico','El sistema es periódico'],ans:2,exp:'λ > 0 → trayectorias cercanas divergen exponencialmente = caos determinista (SDIC).'},
  {q:'¿Quién descubrió el efecto mariposa?',opts:['Henri Poincaré','Benoît Mandelbrot','Edward Lorenz','James Gleick'],ans:2,exp:'Lorenz descubrió en 1961 que redondear 0.506127 a 0.506 producía resultados completamente distintos.'},
  {q:'En el mapa logístico, ¿para qué valor de r aparece comportamiento caótico?',opts:['r < 1','1 < r < 3','r > 3.57 (aprox.)','r > 10'],ans:2,exp:'El caos aparece para r > 3.57, tras la cascada de bifurcaciones de duplicación de período (ruta de Feigenbaum).'},
  {q:'¿Cuál es la dimensión fractal aproximada del atractor de Lorenz?',opts:['1.00','2.06','3.00','2.50'],ans:1,exp:'D ≈ 2.06: más complejo que una superficie (D=2) pero sin llenar un volumen (D=3).'},
  {q:'¿Cuántas variables de estado mínimas necesita un sistema continuo para exhibir caos?',opts:['1','2','3','5'],ans:2,exp:'El teorema de Poincaré-Bendixson impide caos en 2D. Se necesitan al menos 3 variables (como x, y, z en Lorenz).'},
  {q:'¿Qué propiedad define a los fractales?',opts:['Dimensión entera','Autosimilaridad a diferentes escalas','Son siempre bidimensionales','Son aleatorios'],ans:1,exp:'Los fractales exhiben autosimilaridad: al ampliar cualquier parte se encuentra la misma estructura compleja repetida.'},
  {q:'Si λ=0.5 día⁻¹, δ₀=0.01 y δ_max=1, ¿cuál es el horizonte de predicción?',opts:['≈ 4.6 días','≈ 9.2 días','≈ 2.3 días','≈ 15 días'],ans:1,exp:'T=(1/0.5)·ln(1/0.01)=2·ln(100)=2·4.605≈9.2 días.'},
  {q:'¿Qué es un atractor extraño?',opts:['Un punto de equilibrio inestable','Una órbita periódica simple','Estructura fractal en el espacio de fase hacia la cual convergen trayectorias caóticas','Un repulsor que aleja trayectorias'],ans:2,exp:'Conjunto fractal en el espacio de fase que atrae trayectorias donde éstas nunca se repiten exactamente.'},
  {q:'¿Por qué el clima es impredecible a largo plazo?',opts:['Porque es aleatorio','Por la sensibilidad a condiciones iniciales (SDIC)','Porque no existen modelos matemáticos','Porque los instrumentos son imprecisos'],ans:1,exp:'El clima es caótico determinista con SDIC. El error de medición se amplifica exponencialmente haciendo imposible predecir más allá de ~2 semanas.'}
];
let qIdx=0,qScore=0,qAnswered=false;
function loadQ(){
  const q=QUESTIONS[qIdx];
  document.getElementById('q-num').textContent=qIdx+1;
  document.getElementById('q-score').textContent=qScore;
  document.getElementById('q-text').textContent=q.q;
  const od=document.getElementById('q-opts');od.innerHTML='';
  q.opts.forEach((opt,i)=>{const b=document.createElement('button');b.className='q-opt';b.textContent=opt;b.onclick=()=>answerQ(i);od.appendChild(b);});
  document.getElementById('q-fb').className='q-fb';document.getElementById('q-fb').textContent='';
  document.getElementById('q-next').style.display='none';
  document.getElementById('q-prog').style.width=(qIdx/10*100)+'%';
  qAnswered=false;}
function answerQ(i){
  if(qAnswered)return;qAnswered=true;
  const q=QUESTIONS[qIdx];
  document.querySelectorAll('.q-opt').forEach((b,j)=>{b.disabled=true;if(j===q.ans)b.classList.add('correct');else if(j===i)b.classList.add('wrong');});
  const fb=document.getElementById('q-fb');fb.classList.add('show');
  if(i===q.ans){qScore++;fb.classList.add('correct');fb.textContent='✅ ¡Correcto! '+q.exp;document.getElementById('q-score').textContent=qScore;}
  else{fb.classList.add('wrong');fb.textContent='❌ Incorrecto. '+q.exp;}
  document.getElementById('q-next').style.display='inline-block';}
function nextQ(){qIdx++;if(qIdx>=QUESTIONS.length)showQResult();else loadQ();}
function showQResult(){
  document.getElementById('q-opts').innerHTML='';document.getElementById('q-fb').innerHTML='';
  document.getElementById('q-next').style.display='none';
  document.getElementById('q-prog').style.width='100%';
  document.getElementById('q-result').style.display='block';
  document.getElementById('q-text').textContent='';
  document.getElementById('q-score-final').textContent=qScore+'/10';
  document.getElementById('q-num').textContent=10;
  const stars=qScore>=9?'⭐⭐⭐⭐⭐':qScore>=7?'⭐⭐⭐⭐':qScore>=5?'⭐⭐⭐':qScore>=3?'⭐⭐':'⭐';
  const msgs=['Sigue estudiando el material y vuelve a intentarlo.','Buen comienzo. Repasa atractores y Lyapunov.','Nivel intermedio. Profundiza en bifurcaciones.','¡Muy bien! Dominas la mayor parte del tema.','¡Excelente! Maestro del caos. 🎉'];
  document.getElementById('q-stars').textContent=stars;
  document.getElementById('q-msg').textContent=msgs[Math.floor(qScore/2)];
  ST.quizScore=qScore;ST.quizDone=true;saveST();checkBadges();}
function resetQuiz(){
  qIdx=0;qScore=0;qAnswered=false;
  document.getElementById('q-result').style.display='none';
  document.getElementById('q-prog').style.background='var(--gold)';
  loadQ();}

/* ════ INIT ════ */
loadST();
loadQ();
