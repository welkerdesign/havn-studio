// Local, transport-independent FL22 recipe model. Times are seconds.
globalThis.HavnWasher = (() => {
  'use strict';
  const programs = [
    {id:'bedding', name:'Bedding', detail:'Fitted sheet, top sheet and two pillowcases', washLevel:131.5, rinseLevel:131.5, rpm:40, stroke:6, rest:0.4, wetout:36, wash:120, rinse:60, rinses:2, spin:1075, hold:240},
    {id:'delicates', name:'Delicates', detail:'Gentle reversals and a low final spin', washLevel:135, rinseLevel:135, rpm:22, stroke:12, rest:7, wetout:36, wash:180, rinse:90, rinses:2, spin:400, hold:90},
    {id:'cotton', name:'Cotton', detail:'Everyday cotton garments', washLevel:131.5, rinseLevel:131.5, rpm:42, stroke:8, rest:1, wetout:36, wash:360, rinse:90, rinses:2, spin:900, hold:180},
    {id:'quick', name:'Quick wash', detail:'Small, lightly soiled loads', washLevel:125, rinseLevel:128, rpm:35, stroke:6, rest:1, wetout:24, wash:90, rinse:45, rinses:1, spin:700, hold:90},
    {id:'soak', name:'Soak', detail:'Wet out, soak for ten minutes, then drain', washLevel:135, rinseLevel:null, rpm:20, stroke:12, rest:7, wetout:36, wash:0, soak:600, rinse:0, rinses:0, spin:0, hold:0},
    {id:'soak-rinse', name:'Soak & rinse', detail:'Ten-minute soak followed by one fresh rinse', washLevel:135, rinseLevel:131.5, rpm:24, stroke:10, rest:5, wetout:30, wash:0, soak:600, rinse:60, rinses:1, spin:500, hold:90},
    {id:'rinse', name:'Rinse & spin', detail:'One fresh-water rinse and extraction', washLevel:null, rinseLevel:131.5, rpm:35, stroke:6, rest:1, wetout:30, wash:0, rinse:60, rinses:1, spin:700, hold:120}
  ].map(Object.freeze);
  const limits = Object.freeze({lowSumpL:0.065, lowStableS:2, levelStableS:4, stopStableS:3, drainTimeoutS:60});

  function makePlan(id, extra=false) {
    const p = programs.find(program => program.id === id);
    if (!p) throw new Error('Unknown washer program');
    const steps = [];
    function phase(kind, label, seconds, rpm=0, drainOpen=false, more={}) {
      steps.push({kind, label, seconds, rpm, drainOpen, ...more});
    }
    const baths = [];
    if (p.washLevel !== null) baths.push({label:p.soak?'Soak':'Wash', level:p.washLevel, seconds:p.wash, soak:p.soak||0});
    for (let i=1; i<=p.rinses; i++) baths.push({label:'Rinse '+i, level:p.rinseLevel, seconds:p.rinse, soak:0});
    for (const [index,bath] of baths.entries()) {
      const label = bath.label;
      phase('fill', label+' · manual fill', null, 0, false, {levelMm:bath.level});
      phase('tumble', label+' · wet out', p.wetout, p.rpm);
      phase('settle', label+' · settle', 3);
      phase('fill', label+' · check and top up', null, 0, false, {levelMm:bath.level});
      if (bath.soak) phase('soak', 'Soak · hold', bath.soak);
      if (bath.seconds) phase('tumble', label+' · tumble', bath.seconds, p.rpm);
      phase('stop', label+' · confirm standstill', null);
      phase('drain', label+' · drain', null, 0, true);
      if (index < baths.length-1) phase('close', label+' · close drain', null);
    }
    if (p.spin) {
      phase('distribute', 'Distribute load', 9, 95, true);
      phase('ramp', 'Ramp to spin speed', 30, p.spin, true);
      phase('spin', 'Final spin', p.hold+(id==='bedding' && extra?60:0), p.spin, true);
      phase('coast', 'Coast to standstill', 15, 0, true);
    }
    phase('empty-stop', 'Confirm empty and stopped', null, 0, true);
    phase('close', 'Close drain', null);
    return steps;
  }

  function motorTarget(step, time, program) {
    if (step.kind==='tumble') {
      const t=time%program.stroke, moving=program.stroke-program.rest;
      const factor=Math.max(0, Math.min(1, t/0.65, (moving-t)/0.65));
      return Math.round((Math.floor(time/program.stroke)%2?-1:1)*step.rpm*factor);
    }
    if (step.kind==='distribute') return Math.round(step.rpm*Math.min(1,time/3));
    if (step.kind==='ramp') return Math.round(95+(step.rpm-95)*Math.min(1,time/step.seconds));
    return step.rpm;
  }

  // One tick represents one second of preview time. Feedback is supplied by the
  // simulated plant in the panel and can be independently varied in profile tests.
  class Cycle {
    constructor(id, extra=false) {
      this.program=programs.find(p=>p.id===id);
      this.extra=id==='bedding' && extra;
      this.steps=makePlan(id,this.extra);
      this.index=0; this.age=0; this.stable=0; this.elapsed=0; this.fault='';
    }
    get step() { return this.steps[this.index]; }
    get done() { return this.index>=this.steps.length; }
    get canExtend() {
      return !this.done && !this.fault && this.program.id==='bedding' && !this.extra &&
        this.index<=this.steps.findIndex(s=>s.kind==='spin');
    }
    extend() {
      if (!this.canExtend) return false;
      this.steps.find(s=>s.kind==='spin').seconds+=60;
      this.extra=true; return true;
    }
    next() { this.index++; this.age=0; this.stable=0; }
    tick(f) {
      if (this.done || this.fault) return;
      const s=this.step, low=f.sumpL>=0 && f.sumpL<=limits.lowSumpL;
      this.age++; this.elapsed++;
      if (!f.levelValid || !f.locked || !f.panDry || !f.receiverOk || (f.open && f.closed)) {
        this.fault='Check door, level and discharge path'; return;
      }
      if (['distribute','ramp','spin'].includes(s.kind) && (!f.open || f.closed || !low || !f.balanced)) {
        this.fault='Spin requires an open drain, low sump and balanced load'; return;
      }
      if (['fill','tumble','soak','settle','stop'].includes(s.kind) && (!f.closed || f.open)) {
        this.fault='Closed drain required for this bath'; return;
      }
      if (s.kind==='fill') {
        const reached=f.levelMm>=s.levelMm && f.stopped;
        this.stable=reached?this.stable+1:0;
        if (this.stable>=limits.levelStableS && f.fillConfirmed) this.next();
      } else if (s.kind==='drain' || s.kind==='empty-stop') {
        const empty=f.open && !f.closed && low && f.stopped;
        this.stable=empty?this.stable+1:0;
        if (this.stable>=(s.kind==='drain'?limits.lowStableS:limits.stopStableS)) this.next();
        else if (this.age>=limits.drainTimeoutS) this.fault='Drain or standstill feedback timed out';
      } else if (s.kind==='close') {
        if (!f.stopped || !low) this.fault='Standstill and low sump required to close';
        else if (f.closed && !f.open) this.next();
        else if (this.age>=8) this.fault='Drain closure unconfirmed';
      } else if (s.kind==='stop') {
        if (f.stopped) this.next();
        else if (this.age>=30) this.fault='Standstill unconfirmed';
      } else if (s.kind==='coast' && (!f.open || f.closed)) {
        this.fault='Drain opening lost during coast';
      } else if (this.age>=s.seconds) this.next();
    }
  }
  return Object.freeze({programs:Object.freeze(programs), limits, makePlan, motorTarget, Cycle});
})();
