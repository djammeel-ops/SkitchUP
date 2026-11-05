const dim=document.getElementById('dim'),dw=document.getElementById('dw'),dd=document.getElementById('dd'),dh=document.getElementById('dh');
const num=s=>parseFloat(String(s).replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[,٫،]/g,'.'));
document.getElementById('dimbtn').addEventListener('click',()=>{
  if(!sel){flash('اختر مجسماً أولاً بأداة السحب');return;}
  dw.value=+sel.scale.x.toFixed(2);dd.value=+sel.scale.z.toFixed(2);dh.value=+sel.scale.y.toFixed(2);
  dd.disabled=!!sel.userData.cyl;
  document.getElementById('dl-w').textContent=sel.userData.cyl?'القطر':'العرض';
  dim.style.display='block';
});
document.getElementById('dno').onclick=()=>{dim.style.display='none';};
document.getElementById('dok').onclick=()=>{
  const m=sel;if(!m)return;
  const w=num(dw.value),d=num(dd.value),h=num(dh.value);
  if(!(w>0&&h>0&&(m.userData.cyl||d>0))){flash('أدخل أرقاماً صحيحة أكبر من صفر');return;}
  undo.push({k:'sz',m,x:m.position.x,z:m.position.z,sx:m.scale.x,sy:m.scale.y,sz:m.scale.z});
  m.scale.set(w,h,m.userData.cyl?w:d);
  showInfo(m.scale.x,m.scale.z,m.scale.y);dim.style.display='none';
};
const tp=document.getElementById('tp');
let trMsg='';
document.getElementById('tok').onclick=()=>{tp.style.display='none';setTool('lib');};
document.getElementById('tno').onclick=()=>{tp.style.display='none';};
function readTP(){
  const v=id=>num(document.getElementById(id).value);
  return {type:document.getElementById('t-type').value,L:Math.max(2,v('t-span')||8),H:Math.max(0.5,v('t-h')||2),n:Math.max(2,Math.round(v('t-n')||4)),P:v('t-p')||10,mode:document.getElementById('t-mode').value,t:Math.max(2,v('t-w')||16)/100};
}
function solveSys(A,b){
  const n=b.length;
  for(let i=0;i<n;i++){
    let p=i;for(let r=i+1;r<n;r++)if(Math.abs(A[r][i])>Math.abs(A[p][i]))p=r;
    [A[i],A[p]]=[A[p],A[i]];[b[i],b[p]]=[b[p],b[i]];
    if(Math.abs(A[i][i])<1e-9)continue;
    for(let r=i+1;r<n;r++){const f=A[r][i]/A[i][i];if(f){for(let c=i;c<n;c++)A[r][c]-=f*A[i][c];b[r]-=f*b[i];}}
  }
  const x=new Array(n).fill(0);
  for(let i=n-1;i>=0;i--){let s=b[i];for(let c=i+1;c<n;c++)s-=A[i][c]*x[c];x[i]=Math.abs(A[i][i])<1e-9?0:s/A[i][i];}
  return x;
}
function buildTruss(L,x,z,y0){
  const q=readTP();let n=q.n;
  if(q.type==='roof')n=Math.max(2,2*Math.round(n/2));
  const dx=q.L/n,hs=1.5,N=[],Mb=[],bx=i=>-q.L/2+i*dx,add=(a,b)=>Mb.push([a,b]);
  for(let i=0;i<=n;i++)N.push([bx(i),0]);
  for(let i=0;i<n;i++)add(i,i+1);
  if(q.type==='warren'){
    for(let i=0;i<n;i++)N.push([bx(i)+dx/2,q.H]);
    for(let i=0;i<n;i++){add(i,n+1+i);add(n+1+i,i+1);}
    for(let i=0;i<n-1;i++)add(n+1+i,n+2+i);
  }else if(q.type==='roof'){
    for(let i=1;i<n;i++)N.push([bx(i),q.H*(1-Math.abs(bx(i))/(q.L/2))]);
    const T=i=>i===0?0:i===n?n:n+i;
    for(let i=0;i<n;i++)add(T(i),T(i+1));
    for(let i=1;i<n;i++)add(i,T(i));
    for(let i=1;i<n/2;i++){add(T(i),i+1);add(T(n-i),n-i-1);}
  }else{
    for(let i=0;i<=n;i++)N.push([bx(i),q.H]);
    const T=i=>n+1+i;
    for(let i=0;i<n;i++)add(T(i),T(i+1));
    for(let i=0;i<=n;i++)add(i,T(i));
    for(let i=0;i<n;i++){
      const left=i<n/2;
      if(q.type==='pratt'){if(left)add(T(i),i+1);else add(T(i+1),i);}
      else{if(left)add(i,T(i+1));else add(i+1,T(i));}
    }
  }
  const m=Mb.length,rows=2*N.length,cols=m+3;
  const A=Array.from({length:rows},()=>new Array(cols).fill(0)),b=new Array(rows).fill(0);
  Mb.forEach((e,k)=>{
    const a=e[0],c=e[1],ux=N[c][0]-N[a][0],uy=N[c][1]-N[a][1],l=Math.hypot(ux,uy),cx=ux/l,cy=uy/l;
    A[2*a][k]+=cx;A[2*a+1][k]+=cy;A[2*c][k]-=cx;A[2*c+1][k]-=cy;
  });
  A[0][m]=1;A[1][m+1]=1;A[2*n+1][m+2]=1;
  const loads=q.mode==='mid'?[Math.round(n/2)]:Array.from({length:n-1},(_,i)=>i+1);
  loads.forEach(i=>{b[2*i+1]+=q.P;});
  let sol;
  if(rows===cols)sol=solveSys(A,b);
  else{
    const AT=A[0].map((_,c)=>A.map(r=>r[c]));
    const AA=AT.map(r1=>AT.map(r2=>r1.reduce((s,v,i)=>s+v*r2[i],0)));
    const Ab=AT.map(r=>r.reduce((s,v,i)=>s+v*b[i],0));
    AA.forEach((r,i)=>r[i]+=1e-9);
    sol=solveSys(AA,Ab);
  }
  const C=0x2a7fff,T=0xd1495b,Z=0x9aa5b1,R=0xd1495b,t=q.t;
  Mb.forEach((e,k)=>{
    const a=N[e[0]],c=N[e[1]],ddx=c[0]-a[0],ddy=c[1]-a[1],th=Math.atan2(ddy,ddx),F=sol[k];
    part(L,x+(a[0]+c[0])/2+Math.sin(th)*t/2,y0+hs+(a[1]+c[1])/2-Math.cos(th)*t/2,z,Math.hypot(ddx,ddy),t,t,Math.abs(F)<0.05?Z:F>0?T:C);
    const mm=L[L.length-1];mm.rotation.z=th;mm.userData.N=F;
  });
  part(L,x-q.L/2,y0,z,0.3,hs,0.3,Z);part(L,x+q.L/2,y0,z,0.3,hs,0.3,Z);
  loads.forEach(i=>{part(L,x+bx(i),y0+hs-0.8,z,0.08,0.8,0.08,R,1);part(L,x+bx(i),y0+hs-1.2,z,0.35,0.4,0.35,R,3);});
  const f=sol.slice(0,m);
  trMsg='أكبر شد '+Math.max(0,...f).toFixed(1)+' · أكبر ضغط '+Math.abs(Math.min(0,...f)).toFixed(1)+' ك.ن — المس قضيباً بأداة السحب لرؤية قوته';
}
const labels=[];
function addLabel(L,txt,px,py,pz){
  const d=document.createElement('div');d.className='lb';d.textContent=txt;
  document.getElementById('lbl').appendChild(d);
  const l={d,p:new THREE.Vector3(px,py,pz)};labels.push(l);
  (L.lab=L.lab||[]).push(l);
}
function rmLabel(l){l.d.remove();const i=labels.indexOf(l);if(i>=0)labels.splice(i,1);}
function clearLabels(){labels.slice().forEach(rmLabel);}
const v3=new THREE.Vector3();
function updLabels(){
  labels.forEach(l=>{
    v3.copy(l.p).project(camera);
    l.d.style.display=(v3.z>-1&&v3.z<1)?'block':'none';
    l.d.style.left=((v3.x+1)/2*innerWidth)+'px';
    l.d.style.top=((1-v3.y)/2*innerHeight)+'px';
  });
}
document.getElementById('lbtn').addEventListener('click',()=>{const l=document.getElementById('lbl');l.style.display=l.style.display==='none'?'block':'none';});