(()=>{'use strict';
const cls=['Cửu Linh','Toái Mộng','Huyết Hà','Long Ngâm','Thiết Y','Thần Tương','Tố Vấn'];const colors={'Cửu Linh':'purple','Toái Mộng':'blue','Huyết Hà':'red','Long Ngâm':'green','Thiết Y':'yellow','Thần Tương':'darkblue','Tố Vấn':'pink'};
let admin=false,rows={},members=[];const note=s=>document.getElementById('sync-state').textContent=s;
async function api(url,opts={}){const r=await fetch(url,{...opts,credentials:'same-origin',headers:{'Content-Type':'application/json',...opts.headers}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
const key=e=>`${e.dataset.pt}:${e.dataset.row}:${e.classList.contains('skill-cell')?'skill':'name'}`;
function paint(){document.querySelectorAll('.formation-v10 td').forEach(e=>{const x=rows[key(e)]||{};e.textContent=x.value||'';e.classList.remove(...Object.values(colors));if(colors[x.phai])e.classList.add(colors[x.phai]);e.classList.toggle('can-edit',admin);e.title=admin?'Nhấn để sửa':'Chỉ quản trị viên được sửa'});document.getElementById('btn-login').hidden=admin;document.getElementById('btn-logout').hidden=!admin;document.getElementById('btn-clear').hidden=!admin;document.getElementById('btn-members').hidden=!admin;document.getElementById('war-date').readOnly=!admin}
async function load(){try{const data=await api('/api/formation');rows={};for(const r of data)rows[r.cell_key]=r;paint();note('✓ Đã đồng bộ đội hình từ PostgreSQL')}catch(e){note('⚠ '+e.message)}}
async function save(e,value,phai=''){
 const k=key(e);try{
  await api('/api/formation/'+encodeURIComponent(k),{method:'PUT',body:JSON.stringify({value,phai})});
  await load();note('✓ Đã lưu lên PostgreSQL');return true;
 }catch(err){await load();alert(err.message);return false}
}
function dialog(title){const layer=document.createElement('div');layer.className='v10-modal';layer.innerHTML='<div class="v10-dialog" role="dialog" aria-modal="true"><h3></h3><div class="content"></div><p class="msg"></p><button class="secondary close">Đóng</button></div>';layer.querySelector('h3').textContent=title;const close=()=>layer.remove();layer.querySelector('.close').onclick=close;layer.onclick=e=>{if(e.target===layer)close()};document.body.append(layer);return {box:layer.querySelector('.content'),msg:layer.querySelector('.msg'),close}}
async function getMembers(){try{const d=await api('/api/attendance');members=d.entries.map(x=>({name:x.character_name,phai:x.class_name}))}catch(e){members=[];note(e.message)}}
function editMember(e){
 const d=dialog('Chọn nhân vật · PT'+e.dataset.pt),search=document.createElement('input'),list=document.createElement('div');
 search.placeholder='Tìm thành viên đã điểm danh';search.setAttribute('aria-label','Tìm nhân vật');
 list.className='choices';
 function draw(){list.replaceChildren();const used=new Map(Object.entries(rows).filter(([k,v])=>k.endsWith(':name')&&k!==key(e)&&v.value).map(([k,v])=>[v.value.trim().toLocaleLowerCase('vi'),k]));
 const filtered=members.filter(m=>m.name.toLocaleLowerCase('vi').includes(search.value.trim().toLocaleLowerCase('vi')));
 if(!filtered.length){const msg=document.createElement('p');msg.textContent='Không có thành viên phù hợp. Hãy điểm danh trước.';list.append(msg)}
 for(const m of filtered){const b=document.createElement('button'),where=used.get(m.name.trim().toLocaleLowerCase('vi'));
 b.type='button';b.textContent=m.name+' · '+m.phai+(where?' (Đã xếp ở PT'+where.split(':')[0]+')':'');b.disabled=!!where;b.title=where?'Nhân vật đã được xếp, không thể chọn lại':'Chọn nhân vật';
 b.onclick=async()=>{b.disabled=true;const ok=await save(e,m.name,m.phai);if(ok)d.close();else draw()};list.append(b)}
 }
 search.oninput=draw;
 const clear=document.createElement('button');clear.className='secondary';clear.textContent='Bỏ trống ô này';clear.onclick=async()=>{if(await save(e,'',''))d.close()};
 d.box.append(search,list,clear);
 Promise.all([getMembers(),load()]).then(draw);search.focus()
}
function editSkill(e){const d=dialog('Chỉnh Skill · PT'+e.dataset.pt),input=document.createElement('input'),b=document.createElement('button');input.placeholder='Nhập skill';input.value=rows[key(e)]?.value||'';b.textContent='Lưu Skill';b.onclick=async()=>{if(await save(e,input.value.trim()))d.close()};d.box.append(input,b);input.focus()}
document.querySelectorAll('.formation-v10 td').forEach(e=>{const act=()=>{if(admin)(e.classList.contains('skill-cell')?editSkill:editMember)(e)};e.onclick=act;e.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();act()}}});
document.getElementById('btn-login').onclick=()=>{const d=dialog('Đăng nhập quản trị'),email=document.createElement('input'),pass=document.createElement('input'),b=document.createElement('button');email.type='email';email.placeholder='Email';pass.type='password';pass.placeholder='Mật khẩu';b.textContent='Đăng nhập';b.onclick=async()=>{try{await api('/api/login',{method:'POST',body:JSON.stringify({email:email.value,password:pass.value})});admin=true;paint();d.close();note('✓ Đã đăng nhập quản trị')}catch(e){d.msg.textContent=e.message}};d.box.append(email,pass,b);pass.addEventListener('keydown',e=>{if(e.key==='Enter')b.click()});email.focus()};
document.getElementById('btn-logout').onclick=async()=>{try{await api('/api/logout',{method:'POST'});admin=false;paint();note('✓ Đã đăng xuất')}catch(e){note('⚠ Không thể đăng xuất: '+e.message);alert('Không thể đăng xuất: '+e.message)}};
document.getElementById('btn-clear').onclick=async()=>{if(!admin||!confirm('Xóa toàn bộ đội hình trên máy chủ?'))return;try{await api('/api/formation',{method:'DELETE'});rows={};paint();note('✓ Đã xóa đội hình')}catch(e){alert(e.message)}};
document.getElementById('btn-members').onclick=()=>location.href='attendance.html';
const date=document.getElementById('war-date');
let savedDate='';date.addEventListener('change',async()=>{if(!admin)return;const next=date.value.trim();if(!/^([0-2]?\d|3[01])\/(0?[1-9]|1[0-2])(?:\/\d{4})?$/.test(next)){alert('Nhập ngày dạng DD/MM hoặc DD/MM/YYYY');date.value=savedDate;return}
 try{await api('/api/date',{method:'PUT',body:JSON.stringify({value:next})});savedDate=next;note('✓ Đã lưu ngày bang chiến lên PostgreSQL')}catch(e){date.value=savedDate;note('⚠ Không lưu được ngày: '+e.message);alert(e.message)}});

(async()=>{try{admin=(await api('/api/me')).admin;paint();savedDate=(await api('/api/date')).value;date.value=savedDate}catch(e){note(e.message)}await load()})();
})();
