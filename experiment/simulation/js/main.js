const Chart=(()=>{function draw(cv,series,opts={}){const dpr=window.devicePixelRatio||1;const cssW=cv.clientWidth||cv.width,cssH=cssW*0.62;cv.width=cssW*dpr;cv.height=cssH*dpr;const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const W=cssW,H=cssH,m={l:60,r:18,t:16,b:44};g.clearRect(0,0,W,H);let xs=[],ys=[];series.forEach(s=>s.data.forEach(p=>{xs.push(p[0]);ys.push(p[1]);}));if(!xs.length){g.fillStyle='#9aa3b2';g.font='15px Segoe UI';g.textAlign='center';g.fillText('Press "Plot" to see results',W/2,H/2);cv._series=null;return;}let xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(0,...ys),ymax=Math.max(...ys);if(opts.ymin!=null)ymin=opts.ymin;if(xmax===xmin)xmax=xmin+1;if(ymax===ymin)ymax=ymin+1;ymax+=(ymax-ymin)*0.08;const X=x=>m.l+(x-xmin)/(xmax-xmin)*(W-m.l-m.r);const Y=y=>H-m.b-(y-ymin)/(ymax-ymin)*(H-m.t-m.b);g.font='12px Segoe UI';const nT=6;for(let i=0;i<=nT;i++){const gy=ymin+(ymax-ymin)*i/nT;g.strokeStyle='#eef1f6';g.beginPath();g.moveTo(m.l,Y(gy));g.lineTo(W-m.r,Y(gy));g.stroke();g.fillStyle='#7b8494';g.textAlign='right';g.textBaseline='middle';g.fillText(fmt(gy),m.l-8,Y(gy));}for(let i=0;i<=nT;i++){const gx=xmin+(xmax-xmin)*i/nT;g.strokeStyle='#f4f6fa';g.beginPath();g.moveTo(X(gx),m.t);g.lineTo(X(gx),H-m.b);g.stroke();g.fillStyle='#7b8494';g.textAlign='center';g.textBaseline='top';g.fillText(fmt(gx),X(gx),H-m.b+6);}g.strokeStyle='#c7ccd6';g.beginPath();g.moveTo(m.l,m.t);g.lineTo(m.l,H-m.b);g.lineTo(W-m.r,H-m.b);g.stroke();g.fillStyle='#4a5261';g.font='13px Segoe UI';if(opts.xlabel){g.textAlign='center';g.fillText(opts.xlabel,(m.l+W-m.r)/2,H-10);}if(opts.ylabel){g.save();g.translate(15,(m.t+H-m.b)/2);g.rotate(-Math.PI/2);g.textAlign='center';g.fillText(opts.ylabel,0,0);g.restore();}series.forEach(s=>{if(!s.data.length)return;g.strokeStyle=s.color;g.lineWidth=2.4;g.beginPath();s.data.forEach((p,i)=>{const px=X(p[0]),py=Y(p[1]);i?g.lineTo(px,py):g.moveTo(px,py);});g.stroke();if(s.points){g.fillStyle=s.color;s.data.forEach(p=>{g.beginPath();g.arc(X(p[0]),Y(p[1]),2.4,0,7);g.fill();});}});cv._series=series;cv._map={X,Y,xmin,xmax,ymin,ymax,m,W,H};}
function fmt(v){const a=Math.abs(v);if(a>=1000)return(v/1000).toFixed(a>=10000?0:1)+'k';if(a>0&&a<1)return v.toFixed(3);if(!Number.isInteger(v))return v.toFixed(1);return''+v;}return{draw};})();

let curModel=0,lastData=null,lastMeta=null;
const TITLES=['Nicholson–Bailey model','Nicholson–Bailey with host density dependence','Negative-binomial model','Poisson vs Negative-binomial'];

document.getElementById('subtabs').addEventListener('click',e=>{const b=e.target.closest('.subtab');if(!b)return;curModel=+b.dataset.model;document.querySelectorAll('.subtab').forEach(t=>t.classList.toggle('active',t===b));document.querySelectorAll('.cset').forEach(c=>c.classList.toggle('active',+c.dataset.c===curModel));document.getElementById('plotTitle').textContent=TITLES[curModel];lastData=null;Chart.draw(document.getElementById('chart'),[],{});document.getElementById('legend').innerHTML='';});

function g(id){return +document.getElementById(id).value;}
function simulate(){
  const T=100;let host=[],para=[],meta;
  if(curModel===0){
    const H=[g('ht0')],P=[g('pt0')],R=g('r0'),a=g('a0'),c=g('c0');
    for(let i=0;i<T;i++){const e=Math.exp(-a*P[i]);H[i+1]=R*H[i]*e;P[i+1]=c*H[i]*(1-e);}
    for(let i=0;i<T;i++){host.push([i,H[i]]);para.push([i,P[i]]);}
    meta={x:'Time (generations)',y:'Population size',l1:'Host',l2:'Parasitoid'};
  }else if(curModel===1){
    const H=[g('ht1')],P=[0],R=g('r1'),a=g('a1'),c=g('c1'),K=g('k1'),t=g('t1'),p0=g('pt1');
    for(let i=0;i<T;i++){const e=Math.exp(-a*P[i]);H[i+1]=R*H[i]*(1-H[i]/K)*e;
      if(i<t-2)P[i+1]=0;else if(i===t-2)P[i+1]=p0;else P[i+1]=c*H[i]*(1-e);}
    for(let i=0;i<T;i++){host.push([i,H[i]]);para.push([i,P[i]]);}
    meta={x:'Time (generations)',y:'Population density',l1:'Host',l2:'Parasitoid'};
  }else if(curModel===2){
    const H=[g('ht2')],P=[g('pt2')],R=g('r2'),a=g('a2'),c=g('c2'),k=g('k2');
    for(let i=0;i<T;i++){const e=Math.pow(1+a*P[i]/k,-k);H[i+1]=R*H[i]*e;P[i+1]=c*H[i]*(1-e);}
    for(let i=0;i<T;i++){host.push([i+1,H[i]]);para.push([i+1,P[i]]);}
    meta={x:'Time (generations)',y:'Population size',l1:'Host',l2:'Parasitoid'};
  }else{
    const p0=g('pt3'),a=g('a3'),k=g('k3');
    for(let p=p0;p<10000;p+=100){host.push([p,Math.exp(-a*p)]);para.push([p,Math.pow(1+a*p/k,-k)]);}
    meta={x:'Number of parasitoids',y:'P(host escapes)',l1:'Poisson',l2:'Negative binomial'};
  }
  return {host,para,meta};
}
function plot(){
  const r=simulate();lastData=r;lastMeta=r.meta;
  Chart.draw(document.getElementById('chart'),[
    {color:'#e0662c',data:r.host,points:curModel!==3},
    {color:'#0e7c86',data:r.para,points:curModel!==3}
  ],{xlabel:r.meta.x,ylabel:r.meta.y,ymin:0});
  document.getElementById('legend').innerHTML=
    `<span><i style="background:#e0662c"></i>${r.meta.l1}</span><span><i style="background:#0e7c86"></i>${r.meta.l2}</span>`;
}
function sync(){
  document.querySelectorAll('.controls .val').forEach(v=>{
    const id=v.id.slice(2);const el=document.getElementById(id);if(el)v.textContent=el.value;
  });
}
const DEFAULTS={ht0:25,pt0:10,r0:1.5,a0:0.023,c0:2,ht1:2000,t1:20,pt1:800,r1:3,a1:0.01,c1:1,k1:8000,ht2:25,pt2:10,r2:1.5,a2:0.023,c2:2,k2:1.3,pt3:10,a3:0.001,k3:0.5};
function resetSim(){for(const k in DEFAULTS)document.getElementById(k).value=DEFAULTS[k];sync();lastData=null;Chart.draw(document.getElementById('chart'),[],{});document.getElementById('legend').innerHTML='';toast('Simulator reset');}
function downloadPNG(){const cv=document.getElementById('chart');if(!cv._series){toast('Plot first');return;}const o=document.createElement('canvas');o.width=cv.width;o.height=cv.height;const c=o.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,o.width,o.height);c.drawImage(cv,0,0);const a=document.createElement('a');a.download='parasitoid-host.png';a.href=o.toDataURL();a.click();toast('PNG downloaded');}
function downloadCSV(){if(!lastData){toast('Plot first');return;}let csv='x,'+lastMeta.l1+','+lastMeta.l2+'\n';for(let i=0;i<lastData.host.length;i++)csv+=lastData.host[i][0]+','+lastData.host[i][1]+','+lastData.para[i][1]+'\n';dl(csv,'parasitoid-host.csv','text/csv');toast('CSV downloaded');}
function saveRun(){const o={model:curModel};document.querySelectorAll('.controls input').forEach(i=>o[i.id]=i.value);localStorage.setItem('parasitoid_host',JSON.stringify(o));toast('Run saved');}
function loadRun(){const s=localStorage.getItem('parasitoid_host');if(!s){toast('No saved run');return;}const o=JSON.parse(s);for(const k in o){const el=document.getElementById(k);if(el)el.value=o[k];}document.querySelector('.subtab[data-model="'+o.model+'"]').click();sync();plot();toast('Run loaded');}
function dl(t,n,ty){const b=new Blob([t],{type:ty});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;a.click();URL.revokeObjectURL(a.href);}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200);}
(function(){const cv=document.getElementById('chart');cv.addEventListener('pointermove',e=>{if(!cv._map)return;const r=cv.getBoundingClientRect();const mx=e.clientX-r.left,my=e.clientY-r.top;const {xmin,xmax,ymin,ymax,m,W,H}=cv._map;if(mx<m.l||mx>W-m.r||my<m.t||my>H-m.b)return;document.getElementById('rx').textContent=(xmin+(mx-m.l)/(W-m.l-m.r)*(xmax-xmin)).toFixed(1);document.getElementById('ry').textContent=(ymin+(H-m.b-my)/(H-m.b-m.t)*(ymax-ymin)).toFixed(2);});})();


sync();window.addEventListener('resize',()=>{if(lastData)plot();});Chart.draw(document.getElementById('chart'),[],{});

/* ---- fullscreen (whole simulation box) ---- */
function toggleFS(){var el=document.getElementById('simbox');var fsEl=document.fullscreenElement||document.webkitFullscreenElement;if(!fsEl){var rq=el.requestFullscreen||el.webkitRequestFullscreen;if(rq)rq.call(el);}else{var ex=document.exitFullscreen||document.webkitExitFullscreen;if(ex)ex.call(document);}}
function _fsSync(){var b=document.getElementById('fsBtn');var on=document.fullscreenElement||document.webkitFullscreenElement;if(b)b.textContent=on?'✕':'⛶';setTimeout(function(){window.dispatchEvent(new Event('resize'));},70);}
document.addEventListener('fullscreenchange',_fsSync);
document.addEventListener('webkitfullscreenchange',_fsSync);
