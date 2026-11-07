/* V31.5 — chỉnh tiêu đề đoàn: Enter lưu lên PostgreSQL, Esc hủy. */
(()=>{'use strict';
const names={1:'ĐOÀN 1 · Trụ',2:'ĐOÀN 2 · Def (Mid)',3:'ĐOÀN 3 · Def (Mid)'};
let admin=false, editingId=null, saving=false;
const labels=[...document.querySelectorAll('.formation-heading-text[data-heading-id]')];
if(!labels.length)return;
function updateAccess(){for(const label of labels){label.classList.toggle('heading-editable',admin);label.tabIndex=admin?0:-1;label.title=admin?'Nhấn để sửa tiêu đề · Enter để lưu · Esc để hủy':'Chỉ Admin được sửa tiêu đề';}}
async function readJson(url,opts){const res=await fetch(url,{credentials:'same-origin',cache:'no-store',...opts});const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||'HTTP '+res.status);return data;}
async function load(){if(editingId!==null||saving)return;try{const data=await readJson('/api/formation/headings');for(const label of labels){const id=Number(label.dataset.headingId);const value=data.headings?.[id];label.textContent=typeof value==='string'&&value.trim()?value:names[id];}}catch(e){console.warn('Không tải được tiêu đề đoàn:',e.message);}}
function edit(label){if(!admin||saving||editingId!==null)return;
 const id=Number(label.dataset.headingId),previous=label.textContent.trim(); editingId=id;
 const input=document.createElement('input');input.type='text';input.className='formation-heading-input';input.maxLength=65;input.value=previous;input.setAttribute('aria-label','Nhập tiêu đề mới của Đoàn '+id+', nhấn Enter để lưu');
 const restore=()=>{input.replaceWith(label);editingId=null;label.focus();};
 label.replaceWith(input);input.focus();input.select();
 input.addEventListener('keydown',async ev=>{
  if(ev.key==='Escape'){ev.preventDefault();restore();return;}
  if(ev.key!=='Enter')return;
  ev.preventDefault();if(saving)return;
  const title=input.value.trim();if(!title){alert('Tiêu đề không được để trống');return;}
  if(title===previous){restore();return;}
  saving=true;input.disabled=true;
  try{const result=await readJson('/api/formation/headings/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({title})});label.textContent=result.title;restore();}
  catch(err){alert('Không lưu được tiêu đề: '+err.message);input.disabled=false;input.focus();}
  finally{saving=false;}
 });
}
for(const label of labels){label.addEventListener('click',()=>edit(label));label.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();edit(label);}});}
window.addEventListener('formation-admin-change',ev=>{admin=!!ev.detail?.admin;updateAccess();});
readJson('/api/me').then(d=>{admin=!!d.admin;updateAccess();}).catch(()=>{});
load();setInterval(()=>{if(!document.hidden)load()},15000);
})();
