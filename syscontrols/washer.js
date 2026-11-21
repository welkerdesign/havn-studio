(() => {
  'use strict';
  const {programs,limits,makePlan,motorTarget,Cycle}=globalThis.HavnWasher;
  const el=id=>document.getElementById(id);
  const fmt=n=>n.toLocaleString('en-US');
  const clock=s=>Math.floor(s/60)+'m '+String(s%60).padStart(2,'0')+'s';
  const level=n=>n===null?'—':String(n);
  let selected=programs[0], cycle=null, extra=false, filling=false;
  let last=performance.now(), fraction=0;

  for (const p of programs) {
    const button=document.createElement('button');
    button.type='button'; button.textContent=p.name; button.dataset.id=p.id;
    button.addEventListener('click',()=>{ selected=p; extra=false; cycle=null; render(); });
    el('programs').append(button);
    const row=el('comparison').insertRow();
    for (const value of [p.name,level(p.washLevel)+' / '+level(p.rinseLevel),p.rpm+' rpm',p.rinses,
      p.spin?fmt(p.spin)+' rpm · '+clock(p.hold):'Drain only']) row.insertCell().textContent=value;
  }
  function setting(title,value) {
    const cell=document.createElement('div'), dt=document.createElement('dt'), dd=document.createElement('dd');
    dt.textContent=title; dd.textContent=value; cell.append(dt,dd); return cell;
  }
  function render() {
    const p=selected, active=cycle && !cycle.done && !cycle.fault;
    el('program-title').textContent=p.name; el('description').textContent=p.detail;
    for (const btn of el('programs').children) {
      btn.setAttribute('aria-pressed',String(btn.dataset.id===p.id));
      btn.disabled=Boolean(active);
    }
    el('settings').replaceChildren(
      setting('Manual fill · wash / rinse',level(p.washLevel)+' / '+level(p.rinseLevel)+' mm'),
      setting('Fresh rinses',String(p.rinses)),
      setting('Reversing tumble',p.rpm+' rpm · every '+p.stroke+' s'),
      setting(p.soak?'Stationary soak':'Wash tumble',p.soak?clock(p.soak):p.wash?clock(p.wash):'—'),
      setting('Tumble per rinse',p.rinses?clock(p.rinse):'—'),
      setting('Full-speed hold',p.spin?fmt(p.spin)+' rpm · '+clock(p.hold+(extra?60:0)):'Drain only'));
    el('extra-label').hidden=p.id!=='bedding'; el('extra').checked=extra;
    el('extra').disabled=Boolean(cycle && !cycle.canExtend);
    el('evidence').textContent=p.id==='bedding'
      ? 'Modeled bed set · Wash 5.14 L, rinses 2.74 L and 2.78 L including top-ups. Stop pouring at the indicated level.'
      : 'Proposed preset · Fill to the level prompt. Jug volume depends on the load.';
    el('start').hidden=Boolean(cycle);
    drawStatus();
  }
  function drawStatus() {
    el('playback').hidden=!cycle;
    if (!cycle) return;
    const s=cycle.step, complete=cycle.done, fault=cycle.fault;
    el('phase').textContent=fault?'Preview stopped':complete?'Cycle complete':s.label;
    el('clock').textContent=clock(cycle.elapsed);
    el('progress').max=cycle.steps.length; el('progress').value=cycle.index;
    el('outputs').textContent=fault?'Motor inhibited':complete?'Drum stopped · Drain confirmed closed':
      'Motor target '+fmt(motorTarget(s,cycle.age,selected))+' rpm · Drain commanded '+(s.drainOpen?'open':'closed')+
      (s.seconds!==null?' · '+clock(Math.max(0,s.seconds-cycle.age))+' remaining':'');
    let prompt='';
    if (fault) prompt=fault;
    else if (!complete) {
      if (s.kind==='fill') prompt=filling?'Checking stable level and cap confirmation…':
        'Manual fill to '+s.levelMm+' mm above the wardrobe floor. Confirm the level and replace the cap.';
      if (s.kind==='drain') prompt='Drain open until standstill and a sump level of 65 mL or less for 2 seconds.';
      if (s.kind==='empty-stop') prompt='Holding the drain open until the drum is stopped and the sump is low for 3 seconds.';
      if (s.kind==='spin') prompt=cycle.extra?'The extra minute is included in this hold.':'The drain stays open through spin and coast.';
    }
    if (el('prompt').textContent!==prompt) el('prompt').textContent=prompt;
    el('fill').hidden=complete || Boolean(fault) || s.kind!=='fill'; el('fill').disabled=filling;
    el('end').textContent=complete || fault?'Dismiss':'End preview';
    el('extra').disabled=!cycle.canExtend;
  }
  // Illustrative feedback for the screen preview. All timing and I/O stay local.
  function simulateSecond() {
    const s=cycle.step;
    const feedback={
      locked:true, levelValid:true, receiverOk:true, panDry:true, balanced:true,
      open:s.drainOpen, closed:!s.drainOpen, stopped:!['tumble','ramp','spin','coast','distribute'].includes(s.kind),
      levelMm:filling?s.levelMm:0, fillConfirmed:filling,
      sumpL:s.kind==='drain'?Math.max(.015,4.2-.09*cycle.age):.015
    };
    cycle.tick(feedback);
    if (cycle.step!==s) filling=false;
  }
  el('extra').addEventListener('change',()=>{
    if (cycle) cycle.extend();
    extra=cycle?cycle.extra:el('extra').checked;
    render();
  });
  el('start').addEventListener('click',()=>{
    cycle=new Cycle(selected.id,extra); filling=false; fraction=0; last=performance.now(); render();
  });
  el('end').addEventListener('click',()=>{cycle=null; extra=false; filling=false; render();});
  el('fill').addEventListener('click',()=>{filling=true; drawStatus();});
  el('export').addEventListener('click',()=>{
    const recipe={schema:'havn.fl22.recipe.v1',application:'SysControls simulation',program:selected,
      extraSpin:extra,fillDatum:'mm above wardrobe floor',manualFill:true,limits,
      steps:makePlan(selected.id,extra)};
    const url=URL.createObjectURL(new Blob([JSON.stringify(recipe,null,2)],{type:'application/json'}));
    const link=document.createElement('a'); link.href=url; link.download='FL22-'+selected.id+(extra?'-extra':'')+'.json';
    link.click(); setTimeout(()=>URL.revokeObjectURL(url),1500);
  });
  setInterval(()=>{
    const now=performance.now(), elapsed=Math.min((now-last)/1000,1); last=now;
    if (!cycle || cycle.done || cycle.fault) return;
    fraction+=elapsed*Number(el('speed').value);
    while (fraction>=1 && !cycle.done && !cycle.fault) {simulateSecond(); fraction--;}
    if (cycle.done || cycle.fault) render(); else drawStatus();
  },200);
  render();
})();
