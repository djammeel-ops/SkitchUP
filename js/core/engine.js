/* Three.js scene, camera, renderer, lighting and shared scene primitives. */
const dark=matchMedia('(prefers-color-scheme: dark)').matches;
const scene=new THREE.Scene();
scene.background=new THREE.Color(dark?0x1b2128:0xe8eef3);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,300);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
document.body.prepend(renderer.domElement);
const el=renderer.domElement;

const grid=new THREE.GridHelper(40,40,dark?0x6d7b8a:0x8a99a8,dark?0x34404c:0xc3ced8);
grid.position.y=-0.01;scene.add(grid);
scene.add(new THREE.AmbientLight(0xffffff,0.65));
const sun=new THREE.DirectionalLight(0xffffff,0.75);
sun.position.set(6,12,8);scene.add(sun);

const unit=new THREE.BoxGeometry(1,1,1);unit.translate(0,0.5,0);
const edges=new THREE.EdgesGeometry(unit);
const lineMat=new THREE.LineBasicMaterial({color:dark?0xdde6ee:0x2b3540});
const boxes=[],undo=[];
let sel=null,tool='orbit',drawing=null,pull=null,mv=null,ms=null,wl=null,cr=null,rt=null,pinch=null,rot=false;
let yaw=0.8,pitch=0.6,dist=12,tx=0,tz=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const snap=v=>Math.round(v*2)/2;

const preview=new THREE.Mesh(unit,new THREE.MeshBasicMaterial({color:0x2a7fff,transparent:true,opacity:0.45}));
preview.visible=false;scene.add(preview);