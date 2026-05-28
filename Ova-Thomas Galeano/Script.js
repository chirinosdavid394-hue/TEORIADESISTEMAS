
// ─── BACKGROUND CANVAS ───────────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let nodes = [], W, H;
function resizeCanvas(){
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
function initNodes(){
  nodes = [];
  for(let i=0;i<60;i++){
    nodes.push({
      x:Math.random()*W, y:Math.random()*H,
      vx:(Math.random()-.5)*.4, vy:(Math.random()-.5)*.4,
      r:Math.random()*2+1
    });
  }
}
function drawCanvas(){
  ctx.clearRect(0,0,W,H);
  for(let i=0;i<nodes.length;i++){
    const n=nodes[i];
    n.x+=n.vx; n.y+=n.vy;
    if(n.x<0||n.x>W)n.vx*=-1;
    if(n.y<0||n.y>H)n.vy*=-1;
    ctx.beginPath();
    ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle='rgba(0,229,200,0.6)';
    ctx.fill();
    for(let j=i+1;j<nodes.length;j++){
      const m=nodes[j];
      const d=Math.hypot(n.x-m.x,n.y-m.y);
      if(d<120){
        ctx.beginPath();
        ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);
        ctx.strokeStyle=`rgba(0,229,200,${(1-d/120)*.25})`;
        ctx.lineWidth=.5;ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawCanvas);
}
resizeCanvas();initNodes();drawCanvas();
window.addEventListener('resize',()=>{resizeCanvas();initNodes();});

// ─── TABS ───────────────────────────────────────────────────────────
function showTab(id){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('active');
  event.target.classList.add('active');
}

// ─── EJERCICIOS ──────────────────────────────────────────────────────
function checkEx(id,el,correct){
  const list=document.getElementById(id);
  if(list.dataset.done)return;
  list.dataset.done='1';
  list.querySelectorAll('li').forEach(li=>li.style.pointerEvents='none');
  if(correct){
    el.classList.add('correct');
    document.getElementById('fb-'+id+'-ok').classList.add('show');
  } else {
    el.classList.add('wrong');
    document.getElementById('fb-'+id+'-bad').classList.add('show');
  }
}

// ─── SIMULADOR ───────────────────────────────────────────────────────
const simState={
  temp:{val:37,min:36.5,max:37.5,unit:'°C',bar:'bar-temp',valEl:'val-temp',color1:'#00e5c8',color2:'#ff6b35'},
  glu:{val:90,min:70,max:100,unit:'mg/dL',bar:'bar-glu',valEl:'val-glu',color1:'#a78bfa',color2:'#ff6b35'},
  pres:{val:120,min:90,max:130,unit:'mmHg',bar:'bar-pres',valEl:'val-pres',color1:'#ff6b35',color2:'#ff4444'},
  ph:{val:7.4,min:7.35,max:7.45,unit:'',bar:'bar-ph',valEl:'val-ph',color1:'#fbbf24',color2:'#ff6b35'}
};
let simInterval=null;
function simLog(msg){
  const log=document.getElementById('sim-log');
  const now=new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  log.innerHTML=`[${now}] ${msg}\n`+log.innerHTML;
}
function renderSim(){
  let allOk=true;
  for(const k in simState){
    const s=simState[k];
    const range=130; // max range for bar display
    let pct,inRange;
    if(k==='temp'){pct=((s.val-34)/(40-34))*100;inRange=s.val>=s.min&&s.val<=s.max;}
    else if(k==='glu'){pct=((s.val-50)/(200-50))*100;inRange=s.val>=s.min&&s.val<=s.max;}
    else if(k==='pres'){pct=((s.val-80)/(180-80))*100;inRange=s.val>=s.min&&s.val<=s.max;}
    else{pct=((s.val-7.0)/(7.8-7.0))*100;inRange=s.val>=s.min&&s.val<=s.max;}
    const bar=document.getElementById(s.bar);
    bar.style.width=Math.max(2,Math.min(100,pct))+'%';
    bar.style.background=inRange?s.color1:s.color2;
    const decimals=k==='ph'?2:k==='temp'?1:0;
    document.getElementById(s.valEl).textContent=s.val.toFixed(decimals)+(s.unit?' '+s.unit:'');
    if(!inRange)allOk=false;
  }
  const st=document.getElementById('sim-status');
  if(allOk){st.className='sim-status ok';st.textContent='✓ HOMEOSTASIS ACTIVA';}
  else {
    const crit=Object.values(simState).some(s=>
      s.val<s.min*0.9||s.val>s.max*1.1
    );
    if(crit){st.className='sim-status danger';st.textContent='⚠ ESTADO CRÍTICO';}
    else{st.className='sim-status warn';st.textContent='! PERTURBACIÓN DETECTADA';}
  }
}
function simStress(type){
  clearInterval(simInterval);
  if(type==='heat'){simState.temp.val=39.5;simLog('⚠ Golpe de calor aplicado — Temperatura: 39.5 °C');}
  else if(type==='sugar'){simState.glu.val=180;simLog('⚠ Hiperglucemia — Glucosa: 180 mg/dL');}
  else if(type==='hyper'){simState.pres.val=160;simLog('⚠ Hipertensión — Presión: 160 mmHg');}
  else if(type==='acid'){simState.ph.val=7.2;simLog('⚠ Acidosis — pH: 7.2');}
  renderSim();
}
function simRestore(){
  clearInterval(simInterval);
  simLog('🔄 Mecanismos homeostáticos activados — Restaurando equilibrio...');
  const targets={temp:37,glu:90,pres:120,ph:7.4};
  simInterval=setInterval(()=>{
    let done=true;
    for(const k in targets){
      const diff=targets[k]-simState[k].val;
      if(Math.abs(diff)>0.05){
        simState[k].val+=diff*0.12;
        done=false;
      } else {
        simState[k].val=targets[k];
      }
    }
    renderSim();
    if(done){clearInterval(simInterval);simLog('✓ Homeostasis restaurada — Todos los parámetros en rango normal');}
  },80);
}
function simReset(){
  clearInterval(simInterval);
  for(const k in simState){
    if(k==='temp')simState[k].val=37;
    else if(k==='glu')simState[k].val=90;
    else if(k==='pres')simState[k].val=120;
    else simState[k].val=7.4;
  }
  renderSim();
  document.getElementById('sim-log').innerHTML='[ Sistema reiniciado — Todos los parámetros en rango normal ]';
}
renderSim();

// ─── JUEGO 1 ─────────────────────────────────────────────────────────
function updateGame1(){
  const temp=parseFloat(document.getElementById('g1-temp').value);
  const glu=parseFloat(document.getElementById('g1-glu').value);
  const pres=parseFloat(document.getElementById('g1-pres').value);
  const ph=parseFloat(document.getElementById('g1-ph').value);
  document.getElementById('g1-temp-val').textContent=temp.toFixed(1)+' °C';
  document.getElementById('g1-glu-val').textContent=glu+' mg/dL';
  document.getElementById('g1-pres-val').textContent=pres+' mmHg';
  document.getElementById('g1-ph-val').textContent=ph.toFixed(2);
  const tOk=temp>=36.5&&temp<=37.5;
  const gOk=glu>=70&&glu<=100;
  const pOk=pres>=90&&pres<=130;
  const phOk=ph>=7.35&&ph<=7.45;
  const score=([tOk,gOk,pOk,phOk].filter(Boolean).length/4*100).toFixed(0);
  const sc=document.getElementById('g1-score');
  sc.textContent=score+'%';
  sc.style.color=score==100?'var(--accent1)':score>=50?'var(--accent4)':'var(--accent2)';
  const fb=document.getElementById('g1-feedback');
  if(score==100){fb.textContent='🎉 ¡Homeostasis perfecta! El organismo está en equilibrio.';}
  else{
    const issues=[];
    if(!tOk)issues.push('temperatura');
    if(!gOk)issues.push('glucosa');
    if(!pOk)issues.push('presión');
    if(!phOk)issues.push('pH');
    fb.textContent='Ajusta: '+issues.join(', ');
  }
}

// ─── JUEGO 2 (Drag & Drop) ───────────────────────────────────────────
let dragged=null;
function dragStart(e){dragged=e.target;e.target.classList.add('dragging');}
document.addEventListener('dragend',()=>{if(dragged)dragged.classList.remove('dragging');dragged=null;});
function dragOver(e){e.preventDefault();e.currentTarget.classList.add('over');}
document.querySelectorAll('.match-drop').forEach(d=>{
  d.addEventListener('dragleave',()=>d.classList.remove('over'));
});
function dropItem(e,el){
  e.preventDefault();
  el.classList.remove('over');
  if(!dragged)return;
  el.textContent=dragged.textContent;
  el.dataset.dropped=dragged.dataset.id;
  el.classList.remove('correct','wrong');
}
function checkMatch(){
  const drops=document.querySelectorAll('.match-drop');
  let correct=0;
  drops.forEach(d=>{
    if(d.dataset.dropped===d.dataset.accept){d.classList.add('correct');d.classList.remove('wrong');correct++;}
    else if(d.dataset.dropped){d.classList.add('wrong');d.classList.remove('correct');}
  });
  const r=document.getElementById('match-result');
  if(correct===4){r.textContent='🎉 ¡Perfecto! Todos los conceptos correctamente emparejados.';r.style.color='var(--accent1)';}
  else{r.textContent=`${correct}/4 correctos. Revisa los marcados en rojo.`;r.style.color='var(--accent2)';}
}
function resetMatch(){
  document.querySelectorAll('.match-drop').forEach(d=>{
    d.textContent=d.dataset.accept==='sensor'?'Detecta cambios':
                  d.dataset.accept==='control'?'Procesa y ordena respuesta':
                  d.dataset.accept==='efector'?'Produce el cambio correctivo':'Define el valor objetivo';
    d.classList.remove('correct','wrong');
    delete d.dataset.dropped;
  });
  document.getElementById('match-result').textContent='Arrastra y suelta para emparejar';
  document.getElementById('match-result').style.color='';
}

// ─── JUEGO 3 (Verdadero/Falso) ───────────────────────────────────────
const tfQuestions=[
  {q:'La homeostasis mantiene el ambiente interno del organismo completamente estático, sin ninguna variación.',ans:false,exp:'FALSO. La homeostasis mantiene parámetros dentro de rangos (no valores exactos fijos). Hay variaciones normales constantes.'},
  {q:'El hipotálamo actúa como centro de control para la termorregulación en los mamíferos.',ans:true,exp:'VERDADERO. El hipotálamo monitorea la temperatura sanguínea y coordina respuestas como sudoración o escalofríos.'},
  {q:'La retroalimentación positiva siempre desestabiliza un sistema, por lo que no tiene funciones biológicas útiles.',ans:false,exp:'FALSO. La retroalimentación positiva es útil en procesos que deben completarse rápido, como el parto, la coagulación o la ovulación.'},
  {q:'En un equilibrio dinámico, los procesos opuestos ocurren a la misma velocidad.',ans:true,exp:'VERDADERO. Por eso las variables macroscópicas parecen estables aunque haya actividad constante (ej: reacciones reversibles).'},
  {q:'El set point es el valor máximo permitido antes de que el sistema active una respuesta correctiva.',ans:false,exp:'FALSO. El set point es el valor OBJETIVO u ideal, no el máximo. El sistema responde cuando se desvía de este valor central.'},
  {q:'Un termostato es un ejemplo artificial de sistema homeostático.',ans:true,exp:'VERDADERO. Detecta temperatura (sensor), la compara con el set point (control) y activa el sistema de climatización (efector).'},
  {q:'La vasodilatación ante el calor es una respuesta mediada por retroalimentación negativa.',ans:true,exp:'VERDADERO. La vasodilatación aumenta la pérdida de calor, oponiéndose al aumento de temperatura — eso es retroalimentación negativa.'},
  {q:'Un sistema en equilibrio inestable regresa espontáneamente a su estado original tras una perturbación.',ans:false,exp:'FALSO. En el equilibrio INESTABLE, una perturbación aleja permanentemente al sistema de su estado original. El que regresa es el equilibrio ESTABLE.'}
];
let tfIdx=0,tfCorrect=0,tfPts=0,tfTimer=null,tfTimeLeft=10,tfActive=false;
function tfStart(){
  tfIdx=0;tfCorrect=0;tfPts=0;tfActive=false;
  document.getElementById('tf-correct').textContent=0;
  document.getElementById('tf-qnum').textContent='0/8';
  document.getElementById('tf-pts').textContent=0;
  document.getElementById('tf-start').style.display='none';
  document.getElementById('tf-v-btn').disabled=false;
  document.getElementById('tf-f-btn').disabled=false;
  tfLoadQ();
}
function tfLoadQ(){
  if(tfIdx>=tfQuestions.length){tfEnd();return;}
  const q=tfQuestions[tfIdx];
  document.getElementById('tf-q').textContent=q.q;
  document.getElementById('tf-qnum').textContent=(tfIdx+1)+'/8';
  document.getElementById('tf-fb').textContent='';
  tfTimeLeft=10;
  document.getElementById('tf-timer').style.width='100%';
  document.getElementById('tf-timer').style.background='var(--accent1)';
  clearInterval(tfTimer);
  tfActive=true;
  tfTimer=setInterval(()=>{
    tfTimeLeft-=0.1;
    const pct=Math.max(0,tfTimeLeft/10*100);
    document.getElementById('tf-timer').style.width=pct+'%';
    if(pct<40)document.getElementById('tf-timer').style.background='var(--accent2)';
    if(tfTimeLeft<=0){clearInterval(tfTimer);tfActive=false;tfAnswer(null);}
  },100);
}
function tfAnswer(ans){
  if(!tfActive&&ans!==null)return;
  clearInterval(tfTimer);tfActive=false;
  const q=tfQuestions[tfIdx];
  const fb=document.getElementById('tf-fb');
  if(ans===null){fb.textContent='⏰ Tiempo agotado. '+q.exp;}
  else if(ans===q.ans){
    tfCorrect++;tfPts+=10;
    fb.textContent='✓ Correcto. '+q.exp;
    document.getElementById('tf-correct').textContent=tfCorrect;
    document.getElementById('tf-pts').textContent=tfPts;
  } else {
    fb.textContent='✗ Incorrecto. '+q.exp;
  }
  tfIdx++;
  document.getElementById('tf-v-btn').disabled=true;
  document.getElementById('tf-f-btn').disabled=true;
  setTimeout(()=>{
    document.getElementById('tf-v-btn').disabled=false;
    document.getElementById('tf-f-btn').disabled=false;
    tfLoadQ();
  },2200);
}
function tfEnd(){
  document.getElementById('tf-q').textContent=`¡Ronda terminada! ${tfCorrect}/8 correctas · ${tfPts} puntos`;
  document.getElementById('tf-v-btn').disabled=true;
  document.getElementById('tf-f-btn').disabled=true;
  document.getElementById('tf-fb').textContent='';
  document.getElementById('tf-start').style.display='block';
  document.getElementById('tf-start').textContent='↺ Jugar de nuevo';
  document.getElementById('tf-timer').style.width='0%';
}

// ─── QUIZ ─────────────────────────────────────────────────────────────
const quizData=[
  {q:'¿Qué término acuñó Walter B. Cannon en 1926 para describir la capacidad de los organismos de mantener su equilibrio interno?',opts:['Cibernética','Homeostasis','Alostasis','Metaestabilidad'],ans:1},
  {q:'¿Cuál es la función del EFECTOR en un sistema homeostático?',opts:['Detectar la perturbación','Comparar con el set point','Transmitir señales nerviosas','Ejecutar la respuesta correctiva'],ans:3},
  {q:'La glucosa sanguínea en ayunas normal en humanos se encuentra aproximadamente en el rango de:',opts:['40–60 mg/dL','70–100 mg/dL','150–200 mg/dL','200–250 mg/dL'],ans:1},
  {q:'¿Qué tipo de retroalimentación utilizan las contracciones uterinas durante el parto?',opts:['Retroalimentación negativa','Retroalimentación neutra','Retroalimentación positiva','Sin retroalimentación'],ans:2},
  {q:'En un termostato, ¿qué componente cumple la función de "centro de control"?',opts:['El termómetro','El compresor del AC','El microprocesador/controlador','Los ductos de ventilación'],ans:2},
  {q:'¿Cómo se denomina el valor de referencia que un sistema homeostático busca mantener?',opts:['Umbral de tolerancia','Set point (punto de ajuste)','Rango de seguridad','Señal de error máxima'],ans:1},
  {q:'¿Qué caracteriza al EQUILIBRIO DINÁMICO a diferencia del estático?',opts:['No hay cambios en el sistema','Los procesos internos cesan','Hay actividad constante pero variables macroscópicas estables','Solo ocurre en sistemas físicos'],ans:2},
  {q:'El pH normal de la sangre arterial humana es aproximadamente:',opts:['6.8 – 7.0','7.0 – 7.2','7.35 – 7.45','7.6 – 7.8'],ans:2},
  {q:'¿Quién propuso el concepto de "milieu intérieur" (medio interior) como antecedente de la homeostasis?',opts:['Norbert Wiener','Walter Cannon','Claude Bernard','Ivan Pavlov'],ans:2},
  {q:'En la dinámica depredador-presa de Lotka-Volterra, las oscilaciones poblacionales son un ejemplo de:',opts:['Equilibrio estático','Equilibrio inestable','Equilibrio dinámico','Ausencia de homeostasis'],ans:2}
];
let qIdx=0,qScore=0,qAnswered=false;
function loadQuizQ(){
  const q=quizData[qIdx];
  document.getElementById('quiz-q-text').textContent=(qIdx+1)+'. '+q.q;
  document.getElementById('quiz-prog-txt').textContent=qIdx+' / '+quizData.length;
  document.getElementById('quiz-prog-fill').style.width=(qIdx/quizData.length*100)+'%';
  const opts=document.getElementById('quiz-opts');
  opts.innerHTML='';
  q.opts.forEach((o,i)=>{
    const btn=document.createElement('button');
    btn.className='quiz-opt';btn.textContent=o;
    btn.onclick=()=>{
      if(qAnswered)return;
      qAnswered=true;
      opts.querySelectorAll('.quiz-opt').forEach(b=>b.disabled=true);
      if(i===q.ans){btn.classList.add('correct');qScore++;}
      else{btn.classList.add('wrong');opts.querySelectorAll('.quiz-opt')[q.ans].classList.add('correct');}
      document.getElementById('quiz-next-btn').disabled=false;
    };
    opts.appendChild(btn);
  });
  qAnswered=false;
  document.getElementById('quiz-next-btn').disabled=true;
}
function nextQuizQ(){
  qIdx++;
  if(qIdx>=quizData.length){
    document.getElementById('quiz-prog-fill').style.width='100%';
    document.getElementById('quiz-prog-txt').textContent=quizData.length+' / '+quizData.length;
    document.getElementById('quiz-question-area').style.display='none';
    document.getElementById('quiz-progress-wrap').style.display='none';
    const res=document.getElementById('quiz-result');
    res.classList.add('show');
    document.getElementById('qr-score').textContent=qScore;
    const pct=qScore/quizData.length;
    let msg='';
    if(pct===1)msg='🏆 ¡Excelente! Dominas completamente los conceptos de homeostasis y sistemas de equilibrio.';
    else if(pct>=.8)msg='🥈 ¡Muy bien! Tienes un buen dominio del tema. Repasa los conceptos en los que fallaste.';
    else if(pct>=.6)msg='📚 Buen esfuerzo. Revisa la sección teórica y los ejemplos para reforzar tu comprensión.';
    else msg='💪 Sigue estudiando. Te recomendamos releer la teoría, ver los videos y usar el simulador antes de intentar de nuevo.';
    document.getElementById('qr-msg').textContent=msg;
  } else {
    loadQuizQ();
  }
}
function restartQuiz(){
  qIdx=0;qScore=0;qAnswered=false;
  document.getElementById('quiz-question-area').style.display='block';
  document.getElementById('quiz-progress-wrap').style.display='block';
  document.getElementById('quiz-result').classList.remove('show');
  loadQuizQ();
}
loadQuizQ();
