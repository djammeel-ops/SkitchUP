const ptrs=new Map();
el.addEventListener('contextmenu',e=>e.preventDefault());
el.addEventListener('pointerdown',e=>{
  el.setPointerCapture(e.pointerId);
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size>=2){cancelOps();return;}
  if(tool==='rect'){
    const p=surf(e);
    if(p){drawing={a:p,b:p,y:p.y};updatePreview();}else rot=true;
  }else if(tool==='pull'){
    const m=pick(e);
    if(m){
      select(m);
      const n=rc.intersectObjects(boxes,false)[0].face.normal;
      let ax='y';
      if(!m.userData.cyl&&Math.abs(n.y)<0.5)ax=Math.abs(n.x)>0.5?'x':'z';
      pull={m,ax,sg:ax==='x'?Math.sign(n.x):Math.sign(n.z),y0:e.clientY,g0:ground(e)||new THREE.Vector3(),h0:m.scale.y,w0:m.scale.x,d0:m.scale.z,x0:m.position.x,z0:m.position.z,done:false};
    }else{select(null);rot=true;}
  }else if(tool==='move'){
    const m=pick(e),g=ground(e);
    if(m&&g){select(m);mv={m,g0:g,x0:m.position.x,z0:m.position.z,done:false};}else rot=true;
  }else if(tool==='paint'){
    const m=pick(e);
    if(m){undo.push({k:'col',m,c:m.material.color.getHex()});m.material.color.setHex(color);select(m);}else rot=true;
  }else if(tool==='del'){
    const m=pick(e);
    if(m){scene.remove(m);boxes.splice(boxes.indexOf(m),1);undo.push({k:'del',m});if(sel===m)select(null);}else rot=true;
  }else if(tool==='col'){
    const g=surf(e);
    if(g){const m=addCyl(g.x,g.z,0.4,3);m.position.y=g.y;undo.push({k:'add',m});setTool('pull');select(m);}else rot=true;
  }else if(tool==='meas'){
    const g=surf(e);
    if(g){ms={a:g};measUpdate(g);}else rot=true;
  }else if(tool==='wall'){
    const g=surf(e);
    if(g){wl={a:g,b:g};wallPrev();}else rot=true;
  }else if(tool==='circ'){
    const g=surf(e);
    if(g){cr={c:g,b:g};circPrev();}else rot=true;
  }else if(tool==='lib'){
    const g=surf(e);
    if(g){place(libItem,g);setTool('orbit');}else rot=true;
  }else if(tool==='sel'){
    selDown(e);
  }else if(tool==='rot'){
    const m=pick(e);
    if(m){select(m);rt={m,x0:e.clientX,r0:m.rotation.y,done:false};}else rot=true;
  }else rot=true;
});
el.addEventListener('pointermove',e=>{
  const p=ptrs.get(e.pointerId);if(!p)return;
  const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;
  if(ptrs.size===2){
    const [a,b]=[...ptrs.values()];
    const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
    if(pinch){
      dist=clamp(dist*pinch.d/d,3,70);
      yaw-=(mx-pinch.mx)*0.008;
      pitch=clamp(pitch+(my-pinch.my)*0.008,0.05,1.5);
    }
    pinch={d,mx,my};return;
  }
  if(ptrs.size!==1)return;
  if(drawing){const g=ground(e,drawing.y);if(g){drawing.b=g;updatePreview();}}
  else if(pull){
    const p=pull,m=p.m;
    if(!p.done){undo.push({k:'sz',m,x:p.x0,z:p.z0,sx:p.w0,sy:p.h0,sz:p.d0});p.done=true;}
    if(p.ax==='y'){m.scale.y=Math.max(0.1,Math.round((p.h0+(p.y0-e.clientY)*dist/450)*10)/10);}
    else{
      const g=ground(e);
      if(g){
        const th=m.rotation.y,c=Math.cos(th),s=Math.sin(th),ddx=g.x-p.g0.x,ddz=g.z-p.g0.z;
        if(p.ax==='x'){const w=Math.max(0.1,p.w0+p.sg*(ddx*c-ddz*s));m.scale.x=w;const sh=p.sg*(w-p.w0)/2;m.position.x=p.x0+sh*c;m.position.z=p.z0-sh*s;}
        else{const d=Math.max(0.1,p.d0+p.sg*(ddx*s+ddz*c));m.scale.z=d;const sh=p.sg*(d-p.d0)/2;m.position.x=p.x0+sh*s;m.position.z=p.z0+sh*c;}
      }
    }
    showInfo(m.scale.x,m.scale.z,m.scale.y);
  }else if(sst){selMove(e);
  }else if(wl){
    const g=ground(e,wl.a.y);if(g){wl.b=g;wallPrev();}
  }else if(cr){
    const g=ground(e,cr.c.y);if(g){cr.b=g;circPrev();}
  }else if(rt){
    const q=Math.PI/12;
    if(!rt.done){undo.push({k:'rot',m:rt.m,r:rt.r0});rt.done=true;}
    rt.m.rotation.y=Math.round((rt.r0-(e.clientX-rt.x0)*0.01)/q)*q;
  }else if(ms){
    const g=ground(e,ms.a.y);if(g)measUpdate(g);
  }else if(mv){
    const g=ground(e);
    if(g){
      if(!mv.done){undo.push({k:'mv',m:mv.m,x:mv.x0,z:mv.z0});mv.done=true;}
      mv.m.position.x=mv.x0+g.x-mv.g0.x;mv.m.position.z=mv.z0+g.z-mv.g0.z;
    }
  }else if(rot){
    if(tool==='pan'){
      const k=dist*0.0015;
      tx+=-dx*k*Math.cos(yaw)-dy*k*Math.sin(yaw);
      tz+=dx*k*Math.sin(yaw)-dy*k*Math.cos(yaw);
    }else{yaw-=dx*0.01;pitch=clamp(pitch+dy*0.01,0.05,1.5);}
  }
});
function up(e){
  if(!ptrs.has(e.pointerId))return;
  ptrs.delete(e.pointerId);
  if(ptrs.size<2)pinch=null;
  if(sst)selUp(e);
  if(drawing)finishRect();
  if(cr)finishCirc();
  pull=null;mv=null;ms=null;rt=null;rot=false;
}
el.addEventListener('pointerup',up);
el.addEventListener('pointercancel',up);

addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

setTool('orbit');
(function loop(){
  camera.position.set(
    tx+dist*Math.cos(pitch)*Math.sin(yaw),
    dist*Math.sin(pitch),
    tz+dist*Math.cos(pitch)*Math.cos(yaw));
  camera.lookAt(tx,0.5,tz);
  updLabels();renderer.render(scene,camera);
  requestAnimationFrame(loop);
})();
