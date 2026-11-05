/* Layer manager: visibility, locking, active layer and layer assignment. */
let layerCounter=1;
const layersPanel=document.getElementById('layersPanel');
const layersBtn=document.getElementById('layersBtn');
function findLayer(id){return layers.find(l=>l.id===id)||null;}
function isLayerLocked(id){const l=findLayer(id);return !l||!!l.locked;}
function assignLayer(m,id){
  const target=findLayer(id||activeLayerId)||layers.find(l=>!l.locked)||layers[0];
  m.userData.layerId=target.id;
  m.visible=target.visible!==false;
  return m;
}
function applyLayerState(m){
  const l=findLayer(m.userData.layerId);
  if(!l)assignLayer(m,activeLayerId);
  else m.visible=l.visible!==false;
}
function layerPickables(){return boxes.filter(m=>m.visible&&!isLayerLocked(m.userData.layerId));}
function refreshLayersUI(){
  if(!layersPanel)return;
  layersPanel.replaceChildren();
  const head=document.createElement('div');head.className='layers-head';
  const title=document.createElement('strong');title.textContent='الطبقات ('+layers.length+')';
  const actions=document.createElement('div');actions.className='layers-actions';
  [['add','+ طبقة'],['rename','إعادة تسمية'],['move','نقل المحدد للنشطة'],['delete','حذف الطبقة']].forEach(([action,label])=>{
    const b=document.createElement('button');b.type='button';b.dataset.action=action;b.textContent=label;
    if(action==='delete')b.disabled=layers.length<=1;
    actions.appendChild(b);
  });
  head.append(title,actions);layersPanel.appendChild(head);
  layers.forEach(layer=>{
    const row=document.createElement('div');row.className='layer-row'+(layer.id===activeLayerId?' active':'');
    const main=document.createElement('button');main.type='button';main.className='layer-main';main.dataset.action='activate';main.dataset.layerId=layer.id;
    main.textContent=layer.name+(layer.id===activeLayerId?'  ✓':'');
    const state=document.createElement('span');state.className='layer-state';
    state.textContent=(layer.visible?'مرئية':'مخفية')+(layer.locked?' · مقفلة':'');
    const eye=document.createElement('button');eye.type='button';eye.className='layer-mini';eye.dataset.action='visibility';eye.dataset.layerId=layer.id;eye.textContent=layer.visible?'إخفاء':'إظهار';
    const lock=document.createElement('button');lock.type='button';lock.className='layer-mini';lock.dataset.action='lock';lock.dataset.layerId=layer.id;lock.textContent=layer.locked?'فتح القفل':'قفل';
    row.append(main,state,eye,lock);layersPanel.appendChild(row);
  });
}
function chooseLayer(id){
  const layer=findLayer(id);if(!layer)return;
  if(layer.locked){flash('افتح قفل الطبقة قبل العمل عليها');return;}
  if(!layer.visible){layer.visible=true;boxes.filter(m=>m.userData.layerId===id).forEach(m=>m.visible=true);}
  activeLayerId=id;refreshLayersUI();flash('الطبقة النشطة: '+layer.name);
}
function nextUsableLayer(excludeId){
  return layers.find(l=>l.id!==excludeId&&l.visible&&!l.locked)||layers.find(l=>l.id!==excludeId&&!l.locked)||null;
}
function toggleLayerVisibility(id){
  const layer=findLayer(id);if(!layer)return;
  layer.visible=!layer.visible;
  boxes.filter(m=>m.userData.layerId===id).forEach(m=>m.visible=layer.visible);
  if(!layer.visible&&activeLayerId===id){
    const next=nextUsableLayer(id);
    if(next){activeLayerId=next.id;next.visible=true;boxes.filter(m=>m.userData.layerId===next.id).forEach(m=>m.visible=true);}
    else{layer.visible=true;boxes.filter(m=>m.userData.layerId===id).forEach(m=>m.visible=true);flash('يجب إبقاء طبقة واحدة ظاهرة للعمل');}
  }
  if(sel&&!sel.visible)select(null);
  if(typeof selSet!=='undefined'&&selSet.length)setSel(selSet.filter(m=>m.visible&&!isLayerLocked(m.userData.layerId)));
  refreshLayersUI();
}
function toggleLayerLock(id){
  const layer=findLayer(id);if(!layer)return;
  layer.locked=!layer.locked;
  if(layer.locked&&activeLayerId===id){
    const next=nextUsableLayer(id);
    if(next){activeLayerId=next.id;next.visible=true;boxes.filter(m=>m.userData.layerId===next.id).forEach(m=>m.visible=true);}
    else{layer.locked=false;flash('يجب إبقاء طبقة واحدة مفتوحة للعمل');}
  }
  if(sel&&isLayerLocked(sel.userData.layerId))select(null);
  if(typeof selSet!=='undefined'&&selSet.length)setSel(selSet.filter(m=>!isLayerLocked(m.userData.layerId)));
  refreshLayersUI();
}
function addLayer(){
  let id;do{id='layer-'+(++layerCounter);}while(findLayer(id));
  const layer={id,name:'طبقة '+layers.length,visible:true,locked:false};
  layers.push(layer);activeLayerId=id;refreshLayersUI();flash('أُنشئت '+layer.name);
}
function renameActiveLayer(){
  const layer=findLayer(activeLayerId);if(!layer)return;
  const name=prompt('اسم الطبقة الجديدة:',layer.name);
  if(name===null)return;
  const clean=name.trim();if(!clean){flash('اسم الطبقة لا يمكن أن يكون فارغاً');return;}
  layer.name=clean;refreshLayersUI();
}
function moveSelectionToActiveLayer(){
  const selected=typeof selSet!=='undefined'&&selSet.length?selSet.slice():(sel?[sel]:[]);
  if(!selected.length){flash('حدد مجسماً أو أكثر أولاً');return;}
  selected.forEach(m=>{m.userData.layerId=activeLayerId;applyLayerState(m);});
  refreshLayersUI();flash('نُقلت '+selected.length+' عناصر إلى '+findLayer(activeLayerId).name);
}
function deleteActiveLayer(){
  if(layers.length<=1){flash('لا يمكن حذف الطبقة الوحيدة');return;}
  const layer=findLayer(activeLayerId);if(!layer)return;
  const target=nextUsableLayer(layer.id);
  if(!target){flash('افتح طبقة أخرى قبل حذف هذه الطبقة');return;}
  boxes.filter(m=>m.userData.layerId===layer.id).forEach(m=>{m.userData.layerId=target.id;m.visible=target.visible;});
  layers.splice(layers.indexOf(layer),1);activeLayerId=target.id;target.visible=true;
  boxes.filter(m=>m.userData.layerId===target.id).forEach(m=>m.visible=true);
  if(sel&&sel.userData.layerId===target.id)select(null);
  refreshLayersUI();flash('نُقلت عناصر الطبقة المحذوفة إلى '+target.name);
}
layersBtn.addEventListener('click',()=>{
  const open=layersPanel.classList.toggle('open');
  if(open)refreshLayersUI();
});
layersPanel.addEventListener('click',e=>{
  const b=e.target.closest('button[data-action]');if(!b||b.disabled)return;
  const action=b.dataset.action,id=b.dataset.layerId;
  if(action==='add')addLayer();
  else if(action==='rename')renameActiveLayer();
  else if(action==='delete')deleteActiveLayer();
  else if(action==='move')moveSelectionToActiveLayer();
  else if(action==='activate')chooseLayer(id);
  else if(action==='visibility')toggleLayerVisibility(id);
  else if(action==='lock')toggleLayerLock(id);
});
refreshLayersUI();
