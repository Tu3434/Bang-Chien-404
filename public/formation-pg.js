(()=>{'use strict';
const cls=['Cửu Linh','Toái Mộng','Huyết Hà','Long Ngâm','Thiết Y','Thần Tương','Tố Vấn'];const colors={'Cửu Linh':'purple','Toái Mộng':'blue','Huyết Hà':'red','Long Ngâm':'green','Thiết Y':'yellow','Thần Tương':'darkblue','Tố Vấn':'pink'};
let admin=false,rows={},members=[];const note=s=>{const el=document.getElementById('sync-state');if(el)el.textContent=s;};
const setHidden=(id,hidden)=>{const el=document.getElementById(id);if(el)el.hidden=hidden;};
async function api(url,opts={}){const r=await fetch(url,{...opts,credentials:'same-origin',headers:{'Content-Type':'application/json',...opts.headers}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
const key=e=>`${e.dataset.pt}:${e.dataset.row}:${e.classList.contains('skill-cell')?'skill':'name'}`;
function paint(){document.querySelectorAll('.formation-v10 td').forEach(e=>{const x=rows[key(e)]||{};e.textContent=x.value||'';e.classList.remove(...Object.values(colors));if(colors[x.phai])e.classList.add(colors[x.phai]);e.classList.toggle('can-edit',admin);e.title=admin?'Nhấn để sửa':'Chỉ quản trị viên được sửa'});setHidden('btn-login',admin);setHidden('btn-logout',!admin);setHidden('btn-clear',!admin);const warDate=document.getElementById('war-date');if(warDate)warDate.readOnly=true}
async function load(){try{const data=await api('/api/formation');rows={};for(const r of data)rows[r.cell_key]=r;paint();note('✓ Đã đồng bộ đội hình từ PostgreSQL')}catch(e){note('⚠ '+e.message)}}
async function save(e,value,phai=''){const k=key(e),old=rows[k];if(k.endsWith(':name')&&value){const duplicate=Object.entries(rows).find(([other,x])=>other!==k&&other.endsWith(':name')&&x.value?.trim().toLocaleLowerCase()===value.trim().toLocaleLowerCase());if(duplicate){alert('Nhân vật này đã được xếp vào PT khác!');return false}}rows[k]={value,phai};paint();try{await api('/api/formation/'+encodeURIComponent(k),{method:'PUT',body:JSON.stringify({value,phai})});note('✓ Đã lưu lên PostgreSQL');return true}catch(err){if(old)rows[k]=old;else delete rows[k];paint();alert(err.message);return false}}
function dialog(title){const layer=document.createElement('div');layer.className='v10-modal';layer.innerHTML='<div class="v10-dialog" role="dialog" aria-modal="true"><h3></h3><div class="content"></div><p class="msg"></p><button class="secondary close">Đóng</button></div>';layer.querySelector('h3').textContent=title;const close=()=>layer.remove();layer.querySelector('.close').onclick=close;layer.onclick=e=>{if(e.target===layer)close()};document.body.append(layer);return {box:layer.querySelector('.content'),msg:layer.querySelector('.msg'),close}}
async function getMembers(){try{const d=await api('/api/attendance');members=d.entries.map(x=>({name:x.character_name,phai:x.class_name}))}catch(e){members=[];note(e.message)}}
function editMember(e){
 const d=dialog('Chọn nhân vật · PT'+e.dataset.pt);
 const modal=d.box.closest('.v10-dialog');modal.classList.add('sakura-roster-modal');
 const title=modal.querySelector('h3');title.textContent='Chọn nhân vật · PT'+e.dataset.pt;
 const subtitle=document.createElement('p');subtitle.className='roster-subtitle';subtitle.textContent='Chọn thành viên đã điểm danh để thêm vào đội hình';title.after(subtitle);
 const closeButton=modal.querySelector('button.close');closeButton.textContent='✕';closeButton.classList.add('roster-x');closeButton.setAttribute('aria-label','Đóng cửa sổ');modal.prepend(closeButton);
 const searchWrap=document.createElement('div');searchWrap.className='roster-search';
 const input=document.createElement('input');input.type='search';input.placeholder='Tìm hoặc nhập tên nhân vật...';input.autocomplete='off';input.value=rows[key(e)]?.value||'';
 const searchIcon=document.createElement('span');searchIcon.textContent='⌕';searchIcon.setAttribute('aria-hidden','true');searchWrap.append(searchIcon,input);
 const filters=document.createElement('div');filters.className='roster-filters';filters.setAttribute('aria-label','Lọc môn phái');
 const list=document.createElement('div');list.className='roster-list';list.setAttribute('role','list');
 const status=document.createElement('p');status.className='roster-status';status.setAttribute('aria-live','polite');
 const footer=document.createElement('div');footer.className='roster-footer';
 const clearBtn=document.createElement('button');clearBtn.type='button';clearBtn.className='roster-clear';clearBtn.textContent='♧  Bỏ trống ô này';
 footer.append(clearBtn);d.box.append(searchWrap,filters,list,status,footer);
 let selectedClass=rows[key(e)]?.phai||'';let filter='';let saving=false;
 const safeName=x=>String(x||'').trim().toLocaleLowerCase();
 const occupied=m=>Object.entries(rows).some(([other,x])=>other!==key(e)&&other.endsWith(':name')&&safeName(x.value)===safeName(m.name));
 const filterDefs=[['','✿  Tất cả'],['Cửu Linh','✦  Cửu Linh'],['Toái Mộng','⚔  Toái Mộng'],['Huyết Hà','✧  Huyết Hà'],['Long Ngâm','❀  Long Ngâm'],['Thiết Y','⬡  Thiết Y'],['Thần Tương','✺  Thần Tương'],['Tố Vấn','✿  Tố Vấn']];
 function renderFilters(){filters.replaceChildren();for(const [value,label] of filterDefs){const b=document.createElement('button');b.type='button';b.className='roster-filter';b.textContent=label;b.dataset.class=value||'all';b.setAttribute('aria-pressed',String(filter===value));b.onclick=()=>{filter=value;renderFilters();draw()};filters.append(b)}}
 function draw(){list.replaceChildren();const query=safeName(input.value);const shown=members.filter(m=>(!filter||m.phai===filter)&&(!query||safeName(m.name).includes(query))).slice(0,80);
  for(const m of shown){const isUsed=occupied(m);const item=document.createElement('div');item.className='roster-item';item.dataset.class=m.phai||'';item.setAttribute('role','listitem');
   const emblem=document.createElement('span');emblem.className='roster-emblem';emblem.setAttribute('aria-hidden','true');emblem.textContent=({'Cửu Linh':'✿','Toái Mộng':'⚔','Huyết Hà':'✦','Long Ngâm':'❀','Thiết Y':'⬡','Thần Tương':'✺','Tố Vấn':'❁'})[m.phai]||'✿';
   const info=document.createElement('div');info.className='roster-info';const name=document.createElement('strong');name.textContent=m.name;const tag=document.createElement('span');tag.className='roster-tag';tag.textContent=m.phai;info.append(name,tag);
   const action=document.createElement('button');action.type='button';action.className='roster-pick';action.disabled=isUsed;action.textContent=isUsed?'✓  Đã xếp':'＋  Chọn';action.title=isUsed?'Nhân vật đã được xếp vào vị trí khác':'';
   action.onclick=async()=>{
    if(isUsed||saving)return;
    saving=true;action.disabled=true;action.textContent='Đang lưu...';
    status.textContent='Đang lưu '+m.name+' lên PostgreSQL...';
    try{if(await save(e,m.name,m.phai)){d.close();return;}status.textContent='Không thể lưu nhân vật. Vui lòng thử lại.';}
    finally{saving=false;action.disabled=occupied(m);action.textContent=occupied(m)?'✓  Đã xếp':'＋  Chọn';}
   };
   if(isUsed)item.classList.add('roster-occupied');if(safeName(input.value)===safeName(m.name)&&selectedClass===m.phai)item.classList.add('roster-selected');
   item.append(emblem,info,action);list.append(item)
  }
  if(!shown.length){const empty=document.createElement('p');empty.className='roster-empty';empty.textContent=members.length?'Không có nhân vật phù hợp bộ lọc.':'Chưa có thành viên điểm danh.';list.append(empty)}
 }
 input.oninput=()=>{const match=members.find(m=>safeName(m.name)===safeName(input.value));selectedClass=match?match.phai:'';status.textContent='';draw()};
 clearBtn.onclick=async()=>{if(saving)return;saving=true;clearBtn.disabled=true;try{if(await save(e,'',''))d.close()}finally{saving=false;clearBtn.disabled=false}};
 renderFilters();draw();getMembers().then(draw);input.focus();
}
function editSkill(e){const d=dialog('Chỉnh Skill · PT'+e.dataset.pt),input=document.createElement('input'),b=document.createElement('button');input.placeholder='Nhập skill';input.value=rows[key(e)]?.value||'';b.textContent='Lưu Skill';b.onclick=async()=>{if(await save(e,input.value.trim()))d.close()};d.box.append(input,b);input.focus()}
document.querySelectorAll('.formation-v10 td').forEach(e=>{const act=()=>{if(admin)(e.classList.contains('skill-cell')?editSkill:editMember)(e)};e.onclick=act;e.onkeydown=ev=>{if(ev.key==='Enter'){ev.preventDefault();act()}}});
const btnLogin=document.getElementById('btn-login');
if(btnLogin)btnLogin.onclick=()=>{const d=dialog('Đăng nhập quản trị'),email=document.createElement('input'),pass=document.createElement('input'),b=document.createElement('button');email.type='email';email.placeholder='Email';pass.type='password';pass.placeholder='Mật khẩu';b.textContent='Đăng nhập';b.onclick=async()=>{try{await api('/api/login',{method:'POST',body:JSON.stringify({email:email.value,password:pass.value})});const session=await api('/api/me');if(!session.admin)throw Error('Tài khoản chưa có quyền quản trị');admin=true;paint();d.close();note('✓ Đã đăng nhập quản trị')}catch(e){d.msg.textContent=e.message}};d.box.append(email,pass,b);pass.addEventListener('keydown',e=>{if(e.key==='Enter')b.click()});email.focus()};
const btnLogout=document.getElementById('btn-logout');
if(btnLogout)btnLogout.onclick=async()=>{try{await api('/api/logout',{method:'POST'});admin=false;paint();note('✓ Đã đăng xuất')}catch(e){note('⚠ Không thể đăng xuất: '+e.message);alert('Không thể đăng xuất: '+e.message)}};

const btnClear = document.getElementById('btn-clear');

if (btnClear) {
  btnClear.onclick = async () => {
    if (!admin || !confirm('Xóa toàn bộ đội hình trên máy chủ?')) {
      return;
    }

    try {
      await api('/api/formation', {
        method: 'DELETE'
      });

      rows = {};
      paint();
      note('✓ Đã xóa đội hình');
    } catch (e) {
      alert(e.message);
    }
  };
}

// Nút Thành Viên Tham Gia đã được loại bỏ; không cần gắn sự kiện.
const date=document.getElementById('war-date');if(date){date.readOnly=true;date.title='Quản lý ngày trận tại trang Điểm danh';}
(async()=>{try{admin=(await api('/api/me')).admin;paint();const savedDate=await api('/api/date');if(date)date.value=savedDate.value||''}catch(e){note(e.message)}await load()})();
// Đồng bộ thay đổi điểm danh từ các thiết bị khác mỗi 15 giây.
setInterval(()=>{if(!document.hidden&&!document.querySelector('.v10-modal'))load()},15000);
})();
