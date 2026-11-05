/* Application tools, modeling operations, UI events and persistence. */



function addBox(x,z,w,d,h){
  const m=new THREE.Mesh(unit,new THREE.MeshLambertMaterial({color:0xd8c3a5}));
  m.add(new THREE.LineSegments(edges,lineMat));
  m.rotation.order='YXZ';m.position.set(x,0,z);m.scale.set(w,h,d);
  assignLayer(m);scene.add(m);boxes.push(m);return m;
}
const info=document.getElementById('info'),hint=document.getElementById('hint');
function showInfo(w,d,h){info.innerHTML='<span>العرض '+w.toFixed(1)+' م · العمق '+d.toFixed(1)+' م · الارتفاع '+h.toFixed(1)+' م</span>';}
function select(m){
  if(sel)sel.material.emissive.setHex(0);
  sel=m;
  if(m){m.material.emissive.setHex(0x1a3a66);showInfo(m.scale.x,m.scale.z,m.scale.y);
    if(m.userData.N!==undefined){const n=m.userData.N;info.innerHTML='<span>طول '+m.scale.x.toFixed(2)+' م · القوة '+Math.abs(n).toFixed(1)+' ك.ن ('+(n>0.05?'شد':n<-0.05?'ضغط':'صفر')+')</span>';}
  }else info.innerHTML='';
}
const HINTS={orbit:'اسحب بإصبع للتدوير وبإصبعين للتكبير',rect:'اسحب على الأرضية أو على سطح مجسم لرسم مستطيل',pull:'المس وجهاً ثم اسحب: العلوي للارتفاع والجانبي للعرض',move:'اسحب مجسماً لتحريكه على الأرضية',paint:'اختر لوناً ثم المس مجسماً',del:'المس مجسماً لحذفه',col:'المس الأرضية لوضع عمود أسطواني',meas:'اسحب بين نقطتين على الأرضية لقياس المسافة',wall:'اسحب على الأرضية لرسم جدار (سمك 0.2 م، ارتفاع 3 م)',circ:'اسحب من المركز لرسم دائرة (أسطوانة)',rot:'اسحب مجسماً يميناً أو يساراً لتدويره',pan:'اسحب لتحريك الكاميرا',lib:'المس الأرضية لوضع العنصر',sel:'المس مجسماً لتحديده · اسحب مستطيلاً: يميناً = تحديد كامل، يساراً = بالتقاطع'};
function cancelOps(){drawing=null;pull=null;mv=null;ms=null;wl=null;cr=null;rt=null;sst=null;rb.style.display='none';rot=false;mline.visible=false;preview.rotation.y=0;preview.visible=false;}
function setTool(t){
  tool=t;cancelOps();if(t!=='sel'&&selSet.length)setSel([]);
  document.querySelectorAll('[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
  if(hint) hint.textContent=HINTS[t];pal.style.display=t==='paint'?'flex':'none';syncGroups(t);
}
document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
document.getElementById('undo').onclick=()=>{
  const u=undo.pop();if(!u)return;
  if(u.k==='add'){scene.remove(u.m);boxes.splice(boxes.indexOf(u.m),1);if(sel===u.m)select(null);}
  else if(u.k==='multi'){u.ms.forEach(m=>{scene.remove(m);const i=boxes.indexOf(m);if(i>=0)boxes.splice(i,1);});(u.lab||[]).forEach(rmLabel);select(null);}
  else if(u.k==='mdel'){u.ms.forEach(m=>{scene.add(m);boxes.push(m);});}
  else if(u.k==='mvset'){u.o.forEach(a=>{a[0].position.x=a[1];a[0].position.z=a[2];});}
  else if(u.k==='rot'){u.m.rotation.y=u.r;}
  else if(u.k==='sz'){u.m.position.x=u.x;u.m.position.z=u.z;u.m.scale.set(u.sx,u.sy,u.sz);if(sel===u.m)showInfo(u.sx,u.sz,u.sy);}
  else if(u.k==='del'){scene.add(u.m);boxes.push(u.m);}
  else if(u.k==='mv'){u.m.position.x=u.x;u.m.position.z=u.z;}
  else if(u.k==='col'){u.m.material.color.setHex(u.c);}
  else{u.m.scale.y=u.prev;if(sel===u.m)showInfo(u.m.scale.x,u.m.scale.z,u.m.scale.y);}
};
document.getElementById('clear').onclick=()=>{
  clearLabels();boxes.forEach(m=>scene.remove(m));boxes.length=0;undo.length=0;select(null);
};

let color=0xd8c3a5;
const pal=document.getElementById('pal');
[0xd8c3a5,0xb5651d,0x9aa5b1,0xe8e2d0,0x7fb069,0xd1495b,0x2a7fff,0xf2c14e].forEach(c=>{
  const b=document.createElement('button');b.style.background='#'+c.toString(16).padStart(6,'0');
  b.onclick=()=>{color=c;[...pal.children].forEach(x=>x.classList.toggle('on',x===b));};
  pal.appendChild(b);
});
pal.children[0].classList.add('on');
function flash(t){info.innerHTML='<span>'+t+'</span>';}
const cunit=new THREE.CylinderGeometry(0.5,0.5,1,24);cunit.translate(0,0.5,0);
const cedges=new THREE.EdgesGeometry(cunit,30);
const GK={1:cunit};
[[2,new THREE.CylinderGeometry(0,0.5,1,24)],[3,new THREE.CylinderGeometry(0.5,0,1,24)]].forEach(a=>{a[1].translate(0,0.5,0);GK[a[0]]=a[1];});
const GE={};for(const k in GK)GE[k]=new THREE.EdgesGeometry(GK[k],30);
function addCyl(x,z,d,h,kd){
  kd=kd||1;
  const m=new THREE.Mesh(GK[kd],new THREE.MeshLambertMaterial({color:0xd8c3a5}));
  m.userData.cyl=true;m.userData.kind=kd;
  m.add(new THREE.LineSegments(GE[kd],lineMat));
  m.position.set(x,0,z);m.scale.set(d,h,d);
  assignLayer(m);scene.add(m);boxes.push(m);return m;
}
const mline=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xe63946}));
mline.visible=false;mline.frustumCulled=false;scene.add(mline);
function wallPrev(){
  const a=wl.a,b=wl.b,dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);
  preview.visible=L>0;
  preview.rotation.y=Math.atan2(-dz,dx);
  preview.scale.set(Math.max(L,0.01),0.05,0.2);
  preview.position.set((a.x+b.x)/2,a.y,(a.z+b.z)/2);
  info.innerHTML='<span>طول الجدار '+L.toFixed(2)+' م</span>';
}
function finishWall(){
  const a=wl.a,b=wl.b;wl=null;preview.visible=false;preview.rotation.y=0;
  const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);
  if(L<0.5){info.innerHTML='';return;}
  const m=addBox((a.x+b.x)/2,(a.z+b.z)/2,L,0.2,3);m.position.y=a.y;
  m.rotation.y=Math.atan2(-dz,dx);
  undo.push({k:'add',m});setTool('pull');select(m);
}
function circPrev(){
  const r=Math.hypot(cr.b.x-cr.c.x,cr.b.z-cr.c.z);
  preview.visible=r>0;
  preview.scale.set(Math.max(2*r,0.01),0.03,Math.max(2*r,0.01));
  preview.position.set(cr.c.x,cr.c.y,cr.c.z);
  info.innerHTML='<span>نصف القطر '+r.toFixed(2)+' م</span>';
}
function finishCirc(){
  const c=cr.c,r=Math.hypot(cr.b.x-c.x,cr.b.z-c.z);cr=null;preview.visible=false;
  if(r<0.25){info.innerHTML='';return;}
  const m=addCyl(c.x,c.z,2*r,0.02);m.position.y=c.y;
  undo.push({k:'add',m});setTool('pull');select(m);
}
const IC={
 orbit:'<circle cx="12" cy="12" r="2.5"/><path d="M12 3a9 9 0 0 1 8.5 6M12 21a9 9 0 0 1-8.5-6M20.5 4v5h-5M3.5 20v-5h5"/>',
 pan:'<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10M12 9.5V4.5a1.5 1.5 0 0 1 3 0V10M15 10V6.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1.5a6 6 0 0 1-4.6-2.1L3.5 14.5a1.6 1.6 0 0 1 2.4-2.1L9 15.5V11"/>',
 view:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
 rect:'<rect x="4" y="6" width="16" height="12" rx="1"/>',
 circ:'<circle cx="12" cy="12" r="8"/>',
 wall:'<rect x="3" y="5" width="18" height="14"/><path d="M3 12h18M9 5v7M15 12v7"/>',
 col:'<ellipse cx="12" cy="6" rx="6" ry="2.5"/><path d="M6 6v12c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V6"/>',
 pull:'<path d="M4 15l8 4 8-4v-4l-8 4-8-4z"/><path d="M12 15V4M8.5 7.5L12 4l3.5 3.5"/>',
 move:'<path d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"/>',
 rot:'<path d="M20 12a8 8 0 1 1-2.5-5.8M20 4v5h-5"/>',
 copy:'<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
 meas:'<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
 paint:'<path d="M5 12l7-7 7 7-6 6a2 2 0 0 1-2.8 0z"/><path d="M19 15c1 1.5 1.5 2.5 1.5 3.2a1.5 1.5 0 0 1-3 0c0-.7.5-1.7 1.5-3.2z"/>',
 del:'<path d="M3 16l9-9 7 7-5 5H7z"/><path d="M9.5 9.5l7 7"/>',
 undo:'<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
 save:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
 load:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 clear:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'
};
Object.assign(IC,{
 layers:'<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
 lib:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>',
 beam:'<path d="M3 9h18v4H3z"/><path d="M6 13l-2 6h4zM18 13l-2 6h4z"/>',
 bend:'<path d="M3 8q9 10 18 0"/><path d="M3 12q9 10 18 0"/><path d="M3 8v4M21 8v4"/>',
 amph:'<path d="M4 20h4v-4h4v-4h4V8h4v12z"/>',
 stairs:'<path d="M4 20h4v-4h4v-4h4V8h4v12z"/>',
 foot:'<path d="M3 20h18v-3H3z"/><path d="M9 17V4h6v13"/>',
 frame:'<path d="M5 20V6h14v14M3 6h18"/>',
 truss:'<path d="M3 18h18M3 18l4.5-8 4.5 8 4.5-8 4.5 8M7.5 10h9"/>',
 bridge:'<path d="M2 14h20M5 14v6M19 14v6M5 14c2-6 12-6 14 0"/>',
 tag:'<path d="M3 12l9-9h8v8l-9 9z"/><circle cx="15" cy="9" r="1.5"/>',
 steps:'<path d="M4 20h4v-4h4v-4h4V8h4"/><path d="M15 4h5M17.5 4v3"/>',
 select:'<path d="M5 3v16l4.5-4.5 3.5 6.5 2.5-1.2-3.5-6.5H19z"/>',
 house:'<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/>',
 riser:'<path d="M3 20h5v-5h5v-5h5v-5h3" opacity=".4"/><path d="M8 20v-5" stroke-width="3.2"/>',
 tread:'<path d="M3 20h5v-5h5v-5h5v-5h3" opacity=".4"/><path d="M8 15h5" stroke-width="3.2"/>',
 sup:'<path d="M12 5l7 14H5z"/><path d="M3 19h18"/>',
 load2:'<path d="M12 3v13M7 12l5 5 5-5"/><path d="M5 21h14"/>',
 slab:'<path d="M3 9l9-4 9 4-9 4z"/><path d="M6 11v8M18 11v8M12 13v8"/>',
 dim:'<path d="M3 12h18M3 8v8M21 8v8M7 9l-4 3 4 3M17 9l4 3-4 3"/>'
});
function ic(n){return '<svg class="i" viewBox="0 0 24 24">'+IC[n]+'</svg>';}
document.querySelectorAll('[data-ic]').forEach(b=>{b.innerHTML=ic(b.dataset.ic)+'<span>'+(b.dataset.name||b.textContent)+'</span>';});
function closePops(){document.querySelectorAll('.pop').forEach(p=>p.classList.remove('open'));dim.style.display='none';tp.style.display='none';bp.style.display='none';sp.style.display='none';hp.style.display='none';}
document.querySelectorAll('[data-grp]').forEach(g=>g.addEventListener('click',()=>{
  const p=document.getElementById('p-'+g.dataset.grp),o=p.classList.contains('open');
  closePops();if(!o)p.classList.add('open');
}));
document.querySelectorAll('.pop button').forEach(b=>b.addEventListener('click',closePops));
el.addEventListener('pointerdown',closePops);
function syncGroups(t){
  document.querySelectorAll('[data-grp]').forEach(g=>g.classList.remove('on'));
  if(t==='lib'){document.querySelector('[data-grp="lib"]').classList.add('on');return;}
  const tb=document.querySelector('.pop [data-tool="'+t+'"]');
  if(!tb)return;
  const g=document.querySelector('[data-grp="'+tb.parentNode.id.slice(2)+'"]');
  g.classList.add('on');g.innerHTML=ic(tb.dataset.ic)+'<span>'+g.dataset.name+'</span>';
}