const sp=document.getElementById('sp');
document.getElementById('sok').onclick=()=>{sp.style.display='none';if(stairEdit){stairEdit=null;}else setTool('lib');};
document.getElementById('sno').onclick=()=>{sp.style.display='none';stairEdit=null;};
let selSet=[],sst=null;
const rb=document.createElement('div');rb.style.display='none';document.body.appendChild(rb);
const sbv=new THREE.Vector3();
function scrBox(m){
  m.updateMatrixWorld();
  let a=1e9,b=1e9,c=-1e9,d=-1e9;
  for(let i=0;i<8;i++){
    sbv.set(i&1?0.5:-0.5,i&2?1:0,i&4?0.5:-0.5).applyMatrix4(m.matrixWorld).project(camera);
    const px=(sbv.x+1)/2*innerWidth,py=(1-sbv.y)/2*innerHeight;
    a=Math.min(a,px);b=Math.min(b,py);c=Math.max(c,px);d=Math.max(d,py);
  }
  return [a,b,c,d];
}
function setSel(arr){
  selSet.forEach(m=>{if(m.material)m.material.emissive.setHex(0);});
  select(null);
  selSet=arr.slice();
  if(selSet.length===1)select(selSet[0]);
  else if(selSet.length>1){
    selSet.forEach(m=>m.material.emissive.setHex(0x1a5a99));
    info.innerHTML='<span>المحدد: '+selSet.length+' عنصر</span>';
  }
  document.getElementById('sa').style.display=selSet.length?'flex':'none';
  document.getElementById('sa-del').textContent='حذف ('+selSet.length+')';
}
function rbDraw(){
  const s=sst,win=s.x1>=s.x0;
  rb.style.cssText='display:block;position:fixed;pointer-events:none;left:'+Math.min(s.x0,s.x1)+'px;top:'+Math.min(s.y0,s.y1)+'px;width:'+Math.abs(s.x1-s.x0)+'px;height:'+Math.abs(s.y1-s.y0)+'px;border:1.5px '+(win?'solid #2a7fff':'dashed #2ea043')+';background:'+(win?'rgba(42,127,255,.15)':'rgba(46,160,67,.15)');
}
function selDown(e){
  const m=pick(e);
  if(m){
    if(selSet.indexOf(m)<0)setSel([m]);
    const g=ground(e);
    if(!g)return;
    sst={mode:'move',hit:m,g0:g,orig:selSet.map(o=>[o,o.position.x,o.position.z]),done:false};
  }else{
    sst={mode:'box',x0:e.clientX,y0:e.clientY,x1:e.clientX,y1:e.clientY};
    rbDraw();
  }
}
function selMove(e){
  if(!sst)return;
  if(sst.mode==='move'){
    const g=ground(e);if(!g)return;
    const dx=g.x-sst.g0.x,dz=g.z-sst.g0.z;
    if(!sst.done&&(dx||dz)){undo.push({k:'mvset',o:sst.orig});sst.done=true;}
    if(sst.done)sst.orig.forEach(a=>{a[0].position.x=a[1]+dx;a[0].position.z=a[2]+dz;});
  }else{sst.x1=e.clientX;sst.y1=e.clientY;rbDraw();}
}
function selUp(e){
  const s=sst;sst=null;rb.style.display='none';
  if(!s)return;
  if(s.mode==='move'){if(!s.done)setSel([s.hit]);return;}
  if(Math.abs(s.x1-s.x0)<6&&Math.abs(s.y1-s.y0)<6){setSel([]);return;}
  const win=s.x1>=s.x0,x1=Math.min(s.x0,s.x1),x2=Math.max(s.x0,s.x1),y1=Math.min(s.y0,s.y1),y2=Math.max(s.y0,s.y1);
  setSel(boxes.filter(m=>{
    if(!m.visible||isLayerLocked(m.userData.layerId))return false;
    const b=scrBox(m);
    return win?(b[0]>=x1&&b[2]<=x2&&b[1]>=y1&&b[3]<=y2):(b[2]>=x1&&b[0]<=x2&&b[3]>=y1&&b[1]<=y2);
  }));
}
function cloneMesh(m){
  const c=new THREE.Mesh(m.geometry,m.material.clone());
  c.userData.cyl=m.userData.cyl;c.userData.kind=m.userData.kind;c.userData.N=m.userData.N;c.userData.layerId=m.userData.layerId;
  c.position.copy(m.position);c.rotation.copy(m.rotation);c.scale.copy(m.scale);
  m.children.forEach(ch=>{if(ch.isLineSegments)c.add(new THREE.LineSegments(ch.geometry,lineMat));});
  c.visible=m.visible;scene.add(c);boxes.push(c);return c;
}
document.getElementById('sa-del').onclick=()=>{
  if(!selSet.length)return;
  const ms=selSet.slice();setSel([]);
  ms.forEach(m=>{scene.remove(m);const i=boxes.indexOf(m);if(i>=0)boxes.splice(i,1);});
  undo.push({k:'mdel',ms});
};
document.getElementById('sa-copy').onclick=()=>{
  if(!selSet.length)return;
  const cs=selSet.map(m=>{const c=cloneMesh(m);c.position.x+=1;c.position.z+=1;return c;});
  undo.push({k:'multi',ms:cs});setSel(cs);
};
document.getElementById('sa-no').onclick=()=>setSel([]);
const hp=document.getElementById('hp');let houseEdit=null;
const HPRE=['مجلس 0 0 4.8 2.8','حمام 0 3.0 1.7 1.7','ممر 1.9 3.0 2.9 1.7','غرفة 0 4.9 4.8 3.0','غرفة 0 8.1 4.0 3.2','درج 5.0 0 4.4 2.8','صالة 5.0 3.0 3.2 4.2','منور 8.4 3.0 1.0 4.2','مدخل 5.0 7.4 4.4 1.2','حمام 4.2 8.8 1.6 2.5','منور 6.0 8.8 0.8 2.5','مطبخ 7.0 8.8 2.4 2.5','باب 7.0 -0.1 1.1','باب 3.5 2.9 0.9','باب 4.9 3.9 0.9','باب 4.9 6.4 0.9','باب 6.6 7.3 1.4','باب 2.0 8.0 0.9','باب 5.0 8.7 0.8','باب 8.2 8.7 0.9','نافذة -0.1 1.4 1.2','نافذة -0.1 6.4 1.2','نافذة -0.1 9.7 1.2','نافذة 9.5 10.0 1.0'].join('\n');
document.getElementById('h-txt').value=HPRE;
function readHP(){
  return {H:Math.min(8,Math.max(0,num(document.getElementById('h-h').value)||0)),t:Math.min(0.5,Math.max(0.08,num(document.getElementById('h-t').value)||0.2)),text:document.getElementById('h-txt').value};
}
function parseHouse(txt){
  const rooms=[],ops=[];
  txt.split('\n').forEach(line=>{
    const tk=line.trim().split(/\s+/);if(tk.length<4)return;
    const nm=tk.map(s=>num(s));
    if(tk[0]==='باب'||tk[0]==='نافذة'){
      if(nm[1]===nm[1]&&nm[2]===nm[2])ops.push({k:tk[0]==='باب'?'d':'w',x:nm[1],y:nm[2],w:nm[3]>0?nm[3]:1});
      return;
    }
    const n4=nm.slice(-4);
    if(tk.length<5||n4.some(v=>!(v===v))||n4[2]<=0||n4[3]<=0)return;
    rooms.push({name:tk.slice(0,tk.length-4).join(' '),x:n4[0],y:n4[1],w:n4[2],d:n4[3]});
  });
  return {rooms,ops};
}
function hInfo(){
  const p=readHP(),q=parseHouse(p.text);let a=1e9,b=-1e9,c=1e9,d=-1e9;
  q.rooms.forEach(r=>{a=Math.min(a,r.x);b=Math.max(b,r.x+r.w);c=Math.min(c,r.y);d=Math.max(d,r.y+r.d);});
  document.getElementById('h-info').textContent=q.rooms.length?('الأبعاد الخارجية '+(b-a+2*p.t).toFixed(2)+' × '+(d-c+2*p.t).toFixed(2)+' م · '+q.rooms.length+' غرفة · '+q.ops.length+' فتحة'):'لا توجد غرف';
}
function hMode(){document.getElementById('hok').textContent=houseEdit?'تم':'وضع';}
function rebuildHouse(grp){
  grp.L.forEach(m=>{scene.remove(m);const i=boxes.indexOf(m);if(i>=0)boxes.splice(i,1);});
  grp.L.length=0;
  if(grp.L.lab){grp.L.lab.slice().forEach(rmLabel);grp.L.lab.length=0;}
  select(null);
  buildHouseP(grp.L,grp.x,grp.z,grp.y0,grp.p);
  grp.L.forEach(m=>m.userData.house=grp);
}
function hLive(){hInfo();if(houseEdit){houseEdit.p=readHP();rebuildHouse(houseEdit);}}
['h-h','h-t'].forEach(id=>document.getElementById(id).addEventListener('input',hLive));
document.getElementById('h-txt').addEventListener('change',hLive);
document.getElementById('h-up').onclick=()=>{document.getElementById('h-h').value=3;hLive();};
document.getElementById('h-flat').onclick=()=>{document.getElementById('h-h').value=0;hLive();};
document.getElementById('hok').onclick=()=>{hp.style.display='none';if(houseEdit)houseEdit=null;else setTool('lib');};
document.getElementById('hno').onclick=()=>{hp.style.display='none';houseEdit=null;};
document.getElementById('hsbtn').addEventListener('click',()=>{
  if(!sel||!sel.userData.house){flash('اختر جزءاً من المنزل أولاً بأداة السحب');return;}
  const g=sel.userData.house,p=g.p;
  houseEdit=g;
  document.getElementById('h-h').value=p.H;document.getElementById('h-t').value=p.t;
  document.getElementById('h-txt').value=p.text;
  hMode();hp.style.display='block';hInfo();
});
function buildHouse(L,x,z,y0){
  const p=readHP();
  const grp={L,x,z,y0,p};
  buildHouseP(L,x,z,y0,p);
  L.forEach(m=>m.userData.house=grp);
}
function buildHouseP(L,x,z,y0,p){
  const q=parseHouse(p.text),rooms=q.rooms,ops=q.ops,t=p.t,flat=!(p.H>0.05),hh=flat?0.1:p.H;
  if(!rooms.length)return;
  const WC=flat?0x2a3f8f:0xe8e2d0;
  const Hs={},Vs={},key=c=>Math.round(c*1000);
  const addS=(M,c,a,b)=>{const k=key(c);(M[k]=M[k]||{c,iv:[]}).iv.push([a,b]);};
  let minx=1e9,maxx=-1e9,miny=1e9,maxy=-1e9;
  rooms.forEach(r=>{
    const x1=r.x-t/2,x2=r.x+r.w+t/2,y1=r.y-t/2,y2=r.y+r.d+t/2;
    addS(Hs,y1,x1,x2);addS(Hs,y2,x1,x2);addS(Vs,x1,y1,y2);addS(Vs,x2,y1,y2);
    minx=Math.min(minx,x1);maxx=Math.max(maxx,x2);miny=Math.min(miny,y1);maxy=Math.max(maxy,y2);
  });
  const walls=[];
  const collect=(M,o)=>{
    for(const k in M){
      const w=M[k],iv=w.iv.sort((a,b)=>a[0]-b[0]),m=[];
      iv.forEach(s=>{const l=m[m.length-1];if(l&&s[0]<=l[1]+1e-6)l[1]=Math.max(l[1],s[1]);else m.push([s[0],s[1]]);});
      m.forEach(s=>walls.push({o,c:w.c,a:s[0],b:s[1],ops:[]}));
    }
  };
  collect(Hs,'h');collect(Vs,'v');
  ops.forEach(op=>{
    let best=null,bd=1e9;
    walls.forEach(w=>{
      const along=w.o==='h'?op.x:op.y,across=w.o==='h'?op.y:op.x,d=Math.abs(across-w.c);
      if(d<=t*0.8&&along>=w.a-1e-6&&along<=w.b+1e-6&&d<bd){bd=d;best=w;}
    });
    if(best)best.ops.push({p:best.o==='h'?op.x:op.y,w:op.w,k:op.k});
  });
  const box=(o,c,s1,s2,yb,yh)=>{
    if(s2-s1<0.01||yh<0.01)return;
    if(o==='h')part(L,x+(s1+s2)/2,y0+yb,z+c,s2-s1,yh,t,WC);
    else part(L,x+c,y0+yb,z+(s1+s2)/2,t,yh,s2-s1,WC);
  };
  walls.forEach(w=>{
    const s1=w.o==='h'?w.a-t/2:w.a+t/2,s2=w.o==='h'?w.b+t/2:w.b-t/2;
    let cur=s1;
    w.ops.sort((a,b)=>a.p-b.p).forEach(op=>{
      const a=Math.max(cur,op.p-op.w/2),b=Math.min(s2,op.p+op.w/2);
      if(b<=a)return;
      box(w.o,w.c,cur,a,0,hh);
      if(!flat){
        if(op.k==='w'){box(w.o,w.c,a,b,0,Math.min(0.9,hh));box(w.o,w.c,a,b,2.1,hh-2.1);}
        else box(w.o,w.c,a,b,2.1,hh-2.1);
      }
      cur=b;
    });
    box(w.o,w.c,cur,s2,0,hh);
  });
  part(L,x+(minx+maxx)/2,y0,z+(miny+maxy)/2,maxx-minx,0.04,maxy-miny,0xd9d2c0);
  rooms.forEach(r=>addLabel(L,r.name+' '+r.w.toFixed(2)+'×'+r.d.toFixed(2),x+r.x+r.w/2,y0+0.3,z+r.y+r.d/2));
  trMsg='منزل '+(maxx-minx+t).toFixed(2)+' × '+(maxy-miny+t).toFixed(2)+' م · '+rooms.length+' غرفة · '+(flat?'مخطط ثنائي — ارفع الجدران من أيقونة «منزل»':'ارتفاع الجدران '+p.H+' م');
}