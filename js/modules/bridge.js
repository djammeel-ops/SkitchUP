const bp=document.getElementById('bp');
document.getElementById('bok').onclick=()=>{bp.style.display='none';setTool('lib');};
document.getElementById('bno').onclick=()=>{bp.style.display='none';};
function buildBridge(L,x,z,y0){
  const v=id=>num(document.getElementById(id).value);
  const type=document.getElementById('b-type').value;
  let n=Math.max(1,Math.min(5,Math.round(v('b-n')||3)));
  const Ls=Math.max(4,v('b-span')||12),W=Math.max(5,v('b-w')||9),H=Math.max(1,v('b-h')||4);
  const ng=type==='cable'?2:Math.max(2,Math.min(8,Math.round(v('b-g')||4)));
  if(type==='cable')n=2;
  const C=0xb9bfc6,CP=0xc9cdd2,AS=0x353a40,FL=0x9c7a54,WH=0xf4f4f4,BR=0x222831,RL=0x7a8896,SW=0xcfd4da;
  const tot=n*Ls,xs=i=>-tot/2+i*Ls,sw=1.2,tdk=0.25;
  const f=Math.max(1.5,Ls*0.25),ys=0.8+H;
  const yd=type==='arch'?ys+f+1:3.15+H,yt=yd+tdk,Lr=tot+13.2;
  const cut=document.getElementById('b-cut').value;const pw=document.getElementById('b-pier').value==='wall';let zi=0;
  const P=(dx,y,dz,w,h,d,c,cy)=>{
    const e=(zi++)*0.0007;
    if(cut==='long'){
      if(cy){if(dz>0.01)return;}
      else{const a=dz-d/2,b=Math.min(dz+d/2,-e);if(b-a<=0.002)return;part(L,x+dx,y0+y,z+(a+b)/2,w,h,b-a,c,cy);return;}
    }else if(cut==='trans'){
      if(cy){if(dx>0.01)return;}
      else{const a=dx-w/2,b=Math.min(dx+w/2,-e);if(b-a<=0.002)return;part(L,x+(a+b)/2,y0+y,z+dz,b-a,h,d,c,cy);return;}
    }
    part(L,x+dx,y0+y,z+dz,w,h,d,c,cy);
  };
  const M=(x1,y1,x2,y2,zz,d,t,c)=>{
    const ddx=x2-x1,ddy=y2-y1,th=Math.atan2(ddy,ddx);
    let zz2=z+zz,dd=d;
    if(cut==='long'){const a=zz-d/2,b=Math.min(zz+d/2,0);if(b-a<=0.002)return;zz2=z+(a+b)/2;dd=b-a;}
    if(cut==='trans'&&(x1+x2)/2>0)return;
    part(L,x+(x1+x2)/2+Math.sin(th)*t/2,y0+(y1+y2)/2-Math.cos(th)*t/2,zz2,Math.hypot(ddx,ddy),t,dd,c);
    L[L.length-1].rotation.z=th;
  };
  // دعامات طرفية + أساسات + ردم + جدران جناحية
  for(const i of [0,n]){
    const sg=i===0?-1:1,fx=xs(i)+sg*3.6;
    P(xs(i),-0.1,0,3,0.1,W+1.4,0x8a8f95);
    P(xs(i),0,0,2.6,0.8,W+1,C);
    P(xs(i),0.8,0,1.2,H+1,W,CP);
    P(xs(i)+sg*0.4,1.8+H,0,0.4,yt-1.8-H,W-0.04,CP);
    P(xs(i)+sg*0.75,yt-0.75,0,0.3,0.25,W-0.04,C);
    M(xs(i)+sg*0.6,yt-0.35,xs(i)+sg*5.6,yt-0.85,0,W-0.04,0.3,C);
    P(xs(i)+sg*3.6,yt-0.2,0,6,0.2,W-0.04,0x7a7f85);
    P(fx,0,0,6,yt-0.2,W-0.04,FL);
    P(fx,0,W/2+0.15,6,yt,0.3,C);P(fx,0,-W/2-0.15,6,yt,0.3,C);
  }
  // الركائز الوسيطة
  const cc=W>8?3:2,zc=j=>(j-(cc-1)/2)*((W-2.5)/(cc-1));
  for(let i=1;i<n;i++){
    if(type==='arch'||pw){P(xs(i),0,0,2.6,0.8,W-1,C);P(xs(i),0.8,0,1.4,H+(type==='arch'?0:1),W-1.5,CP);}
    else{
      for(let j=0;j<cc;j++){P(xs(i),0,zc(j),2.4,0.8,2.4,C);P(xs(i),0.8,zc(j),1.2,H,1.2,CP,1);}
      P(xs(i),0.8+H,0,1.4,1,W-0.4,C);
    }
  }
  if(type!=='arch'){
    const gz=j=>(j-(ng-1)/2)*((W-1.5)/(ng-1));
    for(let i=0;i<=n;i++)for(let j=0;j<ng;j++)P(xs(i),1.8+H,gz(j),0.4,0.15,0.4,BR);
    for(let j=0;j<ng;j++)P(0,1.95+H,gz(j),tot+0.4,1.2,0.5,C);
    for(let i=0;i<=n;i++)P(xs(i),1.95+H,0,0.3,1,W-1.2,C);
    for(let i=0;i<n;i++)P(xs(i)+Ls/2,1.95+H,0,0.25,0.9,W-1.2,C);
  }
  if(type==='arch'){
    const seg=12,thk=0.7,aw=W-1.5,ps=Math.max(1,Math.floor(Ls/2.5));
    for(let s=0;s<n;s++){
      const ay=t=>ys+4*f*t*(1-t);
      for(let k=0;k<seg;k++)M(xs(s)+Ls*k/seg,ay(k/seg),xs(s)+Ls*(k+1)/seg,ay((k+1)/seg),0,aw,thk,C);
      for(let k=1;k<=ps;k++){
        const t=k/(ps+1),ya=ay(t)+thk*0.5;
        [-1,1].forEach(sg=>P(xs(s)+Ls*t,ya,sg*(aw/2-0.3),0.4,yd-ya,0.4,C));
      }
    }
  }
  if(type==='cable'){
    const Ht=Math.max(6,Ls*0.8),xt=xs(1),top=1.8+H+Ht,sp2=(Ls-1.5)/5,zt=W/2-0.6;
    [-1,1].forEach(sg=>P(xt,1.8+H,sg*zt,0.9,Ht,0.9,C));
    P(xt,top-0.8,0,0.9,0.6,W-1.2,C);
    for(let k=1;k<=5;k++){
      const ax=1.5+sp2*(k-1),ya=top-0.3-0.8*(5-k);
      [-1,1].forEach(sx=>[-1,1].forEach(sz=>M(xt,ya,xt+sx*ax,yt,sz*zt,0.08,0.08,WH)));
    }
  }
  // بلاطة الممر + طبقة الإسفلت + الأرصفة + الحواجز + التشوير
  P(0,yd,0,tot+0.4,tdk,W,C);
  P(0,yt,0,Lr,0.03,W-2*sw,0x1e1e1e);P(0,yt+0.03,0,Lr,0.08,W-2*sw,AS);
  P(0,yt+0.11,W/2-sw-0.2,Lr,0.02,0.1,WH);P(0,yt+0.11,-(W/2-sw-0.2),Lr,0.02,0.1,WH);
  for(let xp=-Lr/2+2;xp<Lr/2-1;xp+=4)P(xp,yt+0.11,0,2,0.02,0.15,WH);
  [-1,1].forEach(sg=>{
    P(0,yt,sg*(W/2-sw),Lr,0.25,0.12,C);
    P(0,yt,sg*(W/2-0.3),Lr,0.25,0.1,C);
    P(0,yt,sg*(W/2-sw/2),Lr,0.05,sw,0xe3d3a0);
    for(let k=-1;k<=1;k++)P(0,yt+0.05,sg*(W/2-0.6+k*0.2),Lr,0.1,0.1,[0x2a7fff,0xd1495b,0xf2c14e][k+1]);
    P(0,yt+0.2,sg*(W/2-0.745),Lr,0.05,0.78,SW);
    P(0,yt,sg*(W/2-0.1),Lr,0.5,0.2,C);
    for(let xp=-Lr/2+1;xp<=Lr/2-0.5;xp+=3)P(xp,yt+0.5,sg*(W/2-0.1),0.12,0.8,0.12,RL);
    P(0,yt+1.25,sg*(W/2-0.1),Lr,0.08,0.1,RL);
    P(0,yt+0.9,sg*(W/2-0.1),Lr,0.05,0.06,RL);
  });
  if(cut!=='none'){
    const seg=(a,b,c2,d2)=>{
      const w=Math.max(Math.abs(c2-a),0.03),h=Math.max(Math.abs(d2-b),0.03),cx=(a+c2)/2,yb=Math.min(b,d2);
      if(cut==='trans')part(L,x+0.3,y0+yb,z+cx,0.03,h,w,0x555555);
      else part(L,x+cx,y0+yb,z+0.3,w,h,0.03,0x555555);
    };
    const ann=(t,a,b,la,lb)=>{
      seg(a,b,a,lb);seg(a,lb,la,lb);
      if(cut==='trans')addLabel(L,t,x+0.3,y0+lb,z+la);else addLabel(L,t,x+la,y0+lb,z+0.3);
    };
    const top=1.8+H;
    if(cut==='long'){
      const xa=xs(0);
      ann('الجدار الواقي',xa-0.4,yt-0.8,xa-0.4,yt+1.9);
      ann('مسند البلاطة الانتقالية',xa-0.75,yt-0.62,xa-2.3,yt+2.7);
      ann('البلاطة الإنتقالية',xa-3.1,yt-0.6,xa-3.1,yt+1.9);
      ann('طبقة الأساس والإسفلت',xa-5.2,yt+0.1,xa-5.2,yt+2.7);
      ann('ردم خلفي مدموك',xa-4.5,(yt-0.5)/2,xa-4.5,-1);
      ann('الأساس (القاعدة)',xa-0.8,0.4,xa-0.8,-1);
      ann('خرسانة النظافة',xa+0.8,-0.05,xa+0.8,-2);
      ann('الجدار الراجع (المقابل)',xa-6.2,yt/2,xa-4,-2);
      ann('الجدار الأمامي (الجبهي)',xa+0.3,0.8+(H+1)/2,xa+2.5,0.8+(H+1)/2);
      if(type!=='arch'){
        ann('جهاز الاستناد (نيوبران)',xa,top+0.075,xa+2.5,top-0.6);
        ann('رافدة',xa+Ls/2,top+0.75,xa+Ls/2,yt+1.9);
      }
      ann('بلاطة سطح الجسر',xa+2.5,yd+0.12,xa+2.5,yt+2.7);
      if(n>1)ann('ركيزة وسطية',xs(1),0.8+H/2,xs(1),-1);
    }else{
      const gz0=-(W-1.5)/2,cx=-W/2-2.4,rx=W/2+2.2;
      ann('حاجز أمني',W/2-0.1,yt+1.25,rx,yt+3.0);
      ann('كرنيشة',W/2-0.1,yt+0.35,rx,yt+2.3);
      ann('الحافة الداخلية',W/2-0.3,yt+0.2,rx,yt+1.6);
      ann('بلاطة الرصيف',W/2-0.745,yt+0.22,rx,yt+0.9);
      ann('أنابيب الشبكات المختلفة',W/2-0.6,yt+0.1,rx,yt-0.6);
      ann('طبقة رملية',W/2-0.9,yt+0.02,rx,yt-1.3);
      ann('حافة الرصيف',W/2-sw,yt+0.15,W/2-sw,yt+2.6);
      ann('طبقة السير',-W/4,yt+0.1,-W/4,yt+3.0);
      ann('الطبقة العازلة',0,yt+0.015,0,yt+2.0);
      ann('بلاطة سطح الجسر',-W/2+0.5,yd+0.12,cx,yd+0.12);
      if(type!=='arch'){
        ann('رافدة',gz0,1.95+H+0.6,cx,1.95+H+0.6);
        ann('جهاز الاستناد (نيوبران)',gz0,1.875+H,cx,1.1+H);
        if(n%2===0){
          if(!pw)ann('عارضة (رأس الركيزة)',-W/2+0.5,top+0.5,cx,top+0.5);
          if(pw)ann('جدار الركيزة',0,0.8+H/2,cx,0.8+H/2);else ann('عمود',zc(0),0.8+H/2,cx,0.8+H/2);
          ann('قاعدة',pw?0:zc(0),0.4,cx,0.4);
        }
      }
    }
  }
  const nm={girder:'برافدات',arch:'مقوّس',cable:'بالكابلات'}[type];
  trMsg='جسر '+nm+' · '+n+' فتحات · الطول '+(tot+1.2).toFixed(1)+' م · العرض '+W+' م'+(cut==='long'?' — اختر منظر «أمامي» لرؤية المقطع':cut==='trans'?' — اختر منظر «جانبي» لرؤية المقطع':'');
}