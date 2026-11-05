let libItem='beam';
document.querySelectorAll('[data-lib]').forEach(b=>b.addEventListener('click',()=>{libItem=b.dataset.lib;if(libItem==='truss')tp.style.display='block';else if(libItem==='bridge')bp.style.display='block';else if(libItem==='amph'){stairEdit=null;spMode();sp.style.display='block';spInfo();}else if(libItem==='house'){houseEdit=null;hMode();hp.style.display='block';hInfo();}else setTool('lib');}));
let vi=0;
document.getElementById('view').onclick=()=>{
  const V=[[0.8,0.6,'منظر مجسم'],[0,1.5,'منظر علوي'],[0,0.05,'منظر أمامي'],[1.5708,0.05,'منظر جانبي']];
  vi=(vi+1)%V.length;yaw=V[vi][0];pitch=V[vi][1];tx=0;tz=0;flash(V[vi][2]);
};
function measUpdate(b){
  const a=ms.a;
  mline.geometry.setFromPoints([new THREE.Vector3(a.x,a.y+0.05,a.z),new THREE.Vector3(b.x,a.y+0.05,b.z)]);
  mline.visible=true;
  info.innerHTML='<span>المسافة '+Math.hypot(a.x-b.x,a.z-b.z).toFixed(2)+' م</span>';
}
document.getElementById('copy').onclick=()=>{
  if(!sel){flash('اختر مجسماً أولاً بأداة السحب');return;}
  const m=sel.userData.cyl?addCyl(sel.position.x+1,sel.position.z+1,sel.scale.x,sel.scale.y,sel.userData.kind):addBox(sel.position.x+1,sel.position.z+1,sel.scale.x,sel.scale.z,sel.scale.y);
  m.material.color.copy(sel.material.color);m.rotation.y=sel.rotation.y;m.position.y=sel.position.y;m.rotation.z=sel.rotation.z;
  undo.push({k:'add',m});select(m);
};
const KEY='workshop3d-v1';
document.getElementById('save').onclick=()=>{
  const data=boxes.map(m=>[m.position.x,m.position.z,m.scale.x,m.scale.z,m.scale.y,m.material.color.getHex(),m.userData.kind||0,m.rotation.y,m.position.y,m.rotation.z]);
  try{localStorage.setItem(KEY,JSON.stringify(data));flash('تم الحفظ');}catch(e){flash('تعذر الحفظ');}
};
document.getElementById('load').onclick=()=>{
  try{
    const s=localStorage.getItem(KEY);if(!s){flash('لا يوجد مشروع محفوظ');return;}
    boxes.forEach(m=>scene.remove(m));boxes.length=0;undo.length=0;select(null);
    clearLabels();JSON.parse(s).forEach(a=>{const m=a[6]?addCyl(a[0],a[1],a[2],a[4],a[6]):addBox(a[0],a[1],a[2],a[3],a[4]);m.material.color.setHex(a[5]);m.rotation.y=a[7]||0;m.position.y=a[8]||0;m.rotation.z=a[9]||0;});
    flash('تم الفتح');
  }catch(e){flash('تعذر الفتح');}
};
const rc=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function ray(e){const r=el.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1);rc.setFromCamera(ndc,camera);}
function ground(e,y){ray(e);plane.constant=-(y||0);const t=new THREE.Vector3();if(!rc.ray.intersectPlane(plane,t))return null;t.x=snap(t.x);t.z=snap(t.z);t.y=y||0;return t;}
function surf(e){
  ray(e);
  const h=rc.intersectObjects(boxes,false)[0];
  if(h){
    const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);
    if(n.y>0.7)return new THREE.Vector3(snap(h.point.x),Math.round(h.point.y*100)/100,snap(h.point.z));
  }
  return ground(e,0);
}
function pick(e){ray(e);const h=rc.intersectObjects(boxes,false);return h.length?h[0].object:null;}

function updatePreview(){
  const a=drawing.a,b=drawing.b,w=Math.abs(a.x-b.x),d=Math.abs(a.z-b.z);
  preview.visible=w>0&&d>0;
  preview.scale.set(Math.max(w,0.01),0.03,Math.max(d,0.01));
  preview.position.set((a.x+b.x)/2,drawing.y,(a.z+b.z)/2);
  showInfo(w,d,0);
}
function finishRect(){
  const a=drawing.a,b=drawing.b;drawing=null;preview.visible=false;
  const w=Math.abs(a.x-b.x),d=Math.abs(a.z-b.z);
  if(w<0.5||d<0.5){info.innerHTML='';return;}
  const m=addBox((a.x+b.x)/2,(a.z+b.z)/2,w,d,0.02);m.position.y=a.y;
  undo.push({k:'add',m});
  setTool('pull');select(m);
}
