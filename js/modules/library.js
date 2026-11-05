function part(L,x,y,z,w,h,d,c,cy){
  const m=cy?addCyl(x,z,w,h,cy):addBox(x,z,w,d,h);
  m.position.y=y;m.material.color.setHex(c);L.push(m);
}
function place(k,g){
  const L=[],S=0x9aa5b1,B=0xd8c3a5,R=0xd1495b,x=g.x,z=g.z;
  const P=(dx,y,dz,w,h,d,c,cy)=>part(L,x+dx,y+(g.y||0),z+dz,w,h,d,c,cy);
  if(k==='beam'){P(-2.8,0,0,0.4,1,0.4,S);P(2.8,0,0,0.4,1,0.4,S);P(0,1,0,6,0.5,0.4,B);}
  else if(k==='bend'){
    const n=30,sg=6/n;
    P(-2.8,0,0,0.4,1,0.4,S);P(2.8,0,0,0.4,1,0.4,S);
    for(let i=0;i<n;i++){const t=(i+0.5)/n,u=Math.min(t,1-t);P(-3+(i+0.5)*sg,1-0.8*(3*u-4*u*u*u),0,sg*1.03,0.5,0.4,B);}
    P(0,0.7,0,0.12,1.4,0.12,R,1);
  }
  else if(k==='amph'){buildStairs(L,x,z,g.y||0);}
  else if(k==='house'){buildHouse(L,x,z,g.y||0);}
  else if(k==='stairs'){for(let i=0;i<10;i++)P(0,0,i*0.3-1.4,1.2,0.18*(i+1),0.3,B);}
  else if(k==='foot'){P(0,0,0,2,0.5,2,S);P(0,0.5,0,0.4,3,0.4,B);}
  else if(k==='frame'){P(-2,0,0,0.4,3,0.4,B);P(2,0,0,0.4,3,0.4,B);P(0,3,0,4.4,0.4,0.4,B);}
  else if(k==='sup'){P(0,0,0,0.8,0.8,0,S,2);}
  else if(k==='load'){P(0,0.4,0,0.1,1.4,0.1,R,1);P(0,0,0,0.35,0.4,0,R,3);}
  else if(k==='truss'){buildTruss(L,x,z,g.y||0);}
  else if(k==='bridge'){buildBridge(L,x,z,g.y||0);}
  else if(k==='truss0'){
    const M=(x1,y1,x2,y2,c)=>{
      const dx=x2-x1,dy=y2-y1,th=Math.atan2(dy,dx),t=0.16;
      part(L,x+(x1+x2)/2+Math.sin(th)*t/2,(g.y||0)+(y1+y2)/2-Math.cos(th)*t/2,z,Math.hypot(dx,dy),t,t,c);
      L[L.length-1].rotation.z=th;
    };
    const C=0x2a7fff,T=0xd1495b;
    P(-4,0,0,0.3,1,0.3,S);P(4,0,0,0.3,1,0.3,S);P(0,0,0,0.12,0.9,0.12,R,1);
    for(let i=0;i<4;i++)M(-4+2*i,1,-2+2*i,1,T);
    for(let j=0;j<3;j++)M(-3+2*j,3,-1+2*j,3,C);
    for(let j=0;j<4;j++){
      const lc=j<2?C:T,rc2=j<2?T:C;
      M(-4+2*j,1,-3+2*j,3,lc);M(-3+2*j,3,-2+2*j,1,rc2);
    }
  }
  else{[[-2,-2],[2,-2],[-2,2],[2,2]].forEach(a=>P(a[0],0,a[1],0.4,3,0.4,S));P(0,3,0,5,0.2,5,B);}
  undo.push({k:'multi',ms:L,lab:L.lab});select(null);
  if(k==='truss'||k==='bridge'||k==='amph'||k==='house')flash(trMsg);
}