let stairEdit=null;
function readSP(){
  const v=id=>num(document.getElementById(id).value);
  const type=document.getElementById('s-type').value,nf=type==='one'?1:type==='two'?2:3;
  const Hf=Math.max(1,v('s-h')||3.06),w=Math.max(0.6,v('s-w')||1.2),e=Math.max(0.08,v('s-e')||0.15);
  let n=Math.round(v('s-n')||0);
  if(n<2)n=Math.max(2,Math.round(Hf/(nf*0.17)));
  return {type,nf,Hf,w,e,n:Math.min(60,n)};
}
function spInfo(){
  const p=readSP(),r=p.Hf/(p.nf*p.n),t=0.64-2*r,ok=r>=0.14&&r<=0.19&&t>=0.24&&t<=0.34;
  const hcE=document.getElementById('s-hc'),gcE=document.getElementById('s-gc');
  if(document.activeElement!==hcE)hcE.value=(r*100).toFixed(1);
  if(document.activeElement!==gcE)gcE.value=(t*100).toFixed(1);
  document.getElementById('s-info').textContent='القلبات '+p.nf+' · الدرجات لكل قلبة '+p.n+' · المجموع '+(p.n*p.nf)+' · h='+(r*100).toFixed(1)+' سم · g='+(t*100).toFixed(1)+' سم · 2h+g=64'+(ok?' ✓':' ⚠ خارج المجال المريح');
}
function spMode(){document.getElementById('sok').textContent=stairEdit?'تم':'وضع';}
function rebuildStairs(grp){
  const layerId=grp.L[0]?.userData.layerId||activeLayerId;
  grp.L.forEach(m=>{scene.remove(m);const i=boxes.indexOf(m);if(i>=0)boxes.splice(i,1);});
  grp.L.length=0;
  if(grp.L.lab){grp.L.lab.slice().forEach(rmLabel);grp.L.lab.length=0;}
  select(null);
  buildStairsP(grp.L,grp.x,grp.z,grp.y0,grp.p);
  grp.L.forEach(m=>{m.userData.layerId=layerId;applyLayerState(m);m.userData.stair=grp;});
}
function spLive(){spInfo();if(stairEdit){stairEdit.p=readSP();rebuildStairs(stairEdit);}}
function stepN(d){const p=readSP();document.getElementById('s-n').value=Math.max(2,Math.min(60,p.n+d));spLive();}
document.querySelectorAll('#sp input:not(.sx),#sp select').forEach(q2=>{q2.addEventListener('input',spLive);q2.addEventListener('change',spLive);});
const hcI=document.getElementById('s-hc'),gcI=document.getElementById('s-gc');
function nFromH(hm){
  const p=readSP();
  document.getElementById('s-n').value=Math.max(2,Math.min(60,Math.round(p.Hf/(p.nf*hm))));
  spLive();
}
hcI.addEventListener('input',()=>{const h=num(hcI.value);if(h>=8&&h<=30)nFromH(h/100);});
gcI.addEventListener('input',()=>{const g=num(gcI.value);if(g>=20&&g<=48)nFromH((64-g)/200);});
[hcI,gcI].forEach(i=>i.addEventListener('blur',spInfo));
['rbtn','gbtn'].forEach(id=>document.getElementById(id).addEventListener('click',()=>{
  document.getElementById('stbtn').click();
  if(sp.style.display==='block'){const f=id==='rbtn'?hcI:gcI;f.focus();f.select();}
}));
document.getElementById('s-minus').onclick=()=>stepN(-1);
document.getElementById('s-plus').onclick=()=>stepN(1);
document.getElementById('stbtn').addEventListener('click',()=>{
  if(!sel||!sel.userData.stair){flash('اختر جزءاً من المدرج أولاً بأداة السحب');return;}
  const g=sel.userData.stair,p=g.p;
  stairEdit=g;
  document.getElementById('s-type').value=p.type;
  document.getElementById('s-h').value=p.Hf;document.getElementById('s-w').value=p.w;
  document.getElementById('s-e').value=p.e;document.getElementById('s-n').value=p.n;
  spMode();sp.style.display='block';spInfo();
});
function buildStairs(L,x,z,y0){
  const p=readSP();
  const grp={L,x,z,y0,p};
  buildStairsP(L,x,z,y0,p);
  L.forEach(m=>m.userData.stair=grp);
}
function buildStairsP(L,x,z,y0,p){
  const type=p.type;
  const Hf=p.Hf,w=p.w,e=p.e;
  const nf=type==='one'?1:type==='two'?2:3;
  const n=p.n,r=Hf/(nf*n),t=Math.max(0.1,0.64-2*r),fh=n*r,nt=n*t;
  const S=0xc9cdd2,B=0xb9bfc6,CP=0xa9afb6;
  const flight=(ox,oz,phi,yb,idx)=>{
    const c=Math.cos(phi),s=Math.sin(phi),th=Math.atan2(r,t),Ls=Math.hypot(nt,fh);
    for(let k=0;k<n;k++){
      const u=(k+0.5)*t;
      part(L,x+ox+u*c,y0+yb+k*r,z+oz+u*s,t,r,w,S);
      L[L.length-1].rotation.y=-phi;
    }
    const um=nt/2+e*Math.sin(th),ym=fh/2-e*Math.cos(th);
    part(L,x+ox+um*c,y0+yb+ym,z+oz+um*s,Ls,e,w,B);
    const m=L[L.length-1];m.rotation.y=-phi;m.rotation.z=th;
    addLabel(L,'قلبة '+idx,x+ox+nt/2*c,y0+yb+fh/2+0.9,z+oz+nt/2*s);
  };
  const land=(cx,cz,top,lw,ld)=>{
    part(L,x+cx,y0+top-e,z+cz,lw,e,ld,CP);
    addLabel(L,'بسطة',x+cx,y0+top+0.5,z+cz);
  };
  if(type==='one'){
    flight(0,0,0,0,1);land(nt+0.6,0,fh,1.2,w);
  }else if(type==='two'){
    const g=0.1;
    flight(0,0,0,0,1);
    land(nt+w/2,(w+g)/2,fh,w,2*w+g);
    flight(nt,w+g,Math.PI,fh,2);
    land(-0.6,w+g,2*fh,1.2,w);
  }else{
    flight(0,0,0,0,1);
    land(nt+w/2,0,fh,w,w);
    flight(nt+w/2,w/2,Math.PI/2,fh,2);
    land(nt+w/2,w/2+nt+w/2,2*fh,w,w);
    flight(nt,w/2+nt+w/2,Math.PI,2*fh,3);
    land(-0.6,w/2+nt+w/2,3*fh,1.2,w);
  }
  trMsg=nf+' قلبة · '+n+' درجة لكل قلبة · القائمة '+(r*100).toFixed(1)+' سم · النائمة '+(t*100).toFixed(1)+' سم · 2h+g = '+(2*r*100+t*100).toFixed(1)+' سم ✓ بلوندل';
}