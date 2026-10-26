(()=>{'use strict';
const $=id=>document.getElementById(id),open=$('history-open'),dialog=$('history-dialog'),rounds=$('history-rounds'),detail=$('history-detail');
if(!open||!dialog)return;
async function get(url){const r=await fetch(url,{credentials:'same-origin',cache:'no-store'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
let selectedRoundId=null;
async function post(url){return mutate(url,'POST')}
async function mutate(url,method,body){const r=await fetch(url,{method,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
function toISO(value){const m=String(value||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:''}
function fromISO(value){const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]+'/'+m[1]:value}
async function showRound(id){selectedRoundId=id;detail.replaceChildren(node('p','','Đang tải danh sách…'));try{
 const d=await get('/api/attendance/history/'+id);if(selectedRoundId!==id)return;
 detail.replaceChildren();const header=node('div','history-match-heading');header.append(node('h3','',`${d.round.match_date||'Chưa rõ ngày'} · ${d.round.title}`));
 if(!d.round.is_active){const reopen=node('button','history-reopen','↻ Mở lại trận này');reopen.type='button';reopen.onclick=async()=>{
  if(!confirm(`Mở lại trận ${d.round.match_date}? Trận đang mở sẽ tạm kết thúc; đội hình xóa tên nhưng giữ Skill. Dữ liệu đăng ký của cả hai trận vẫn được giữ.`))return;
  reopen.disabled=true;try{const result=await post('/api/attendance/rounds/'+id+'/reopen');dialog.close();document.dispatchEvent(new Event('attendance-round-changed'));window.location.reload();}
  catch(e){alert('Không thể mở lại trận: '+e.message);reopen.disabled=false;}
 };header.append(reopen)}else header.append(node('span','history-active-label','● Đang mở'));
 if(!d.round.is_active){
  const actions=node('div','history-admin-actions');
  const edit=node('button','history-edit-date','✎ Sửa ngày');edit.type='button';
  edit.onclick=()=>{
   if(actions.querySelector('input'))return;
   const input=node('input','history-date-input');input.type='text';input.placeholder='dd/mm/yyyy';input.value=d.round.match_date||'';input.setAttribute('aria-label','Ngày bang chiến định dạng ngày/tháng/năm');
   const save=node('button','history-save-date','Lưu');save.type='button';
   const cancel=node('button','history-cancel-date','Hủy');cancel.type='button';
   const finish=()=>{input.remove();save.remove();cancel.remove();edit.hidden=false};
   const submit=async()=>{
    const raw=input.value.trim(),m=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(!m){alert('Nhập ngày theo định dạng dd/mm/yyyy');return}
    const iso=m[3]+'-'+m[2]+'-'+m[1];const check=new Date(iso+'T00:00:00Z');
    if(!Number.isFinite(check.valueOf())||check.toISOString().slice(0,10)!==iso){alert('Ngày không hợp lệ');return}
    save.disabled=true;try{await mutate('/api/attendance/rounds/'+id+'/date','PATCH',{date:iso});finish();await show();}catch(e){alert('Không thể sửa ngày: '+e.message);save.disabled=false}
   };
   save.onclick=submit;cancel.onclick=finish;input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit()}if(e.key==='Escape')finish()};
   edit.hidden=true;actions.prepend(input,save,cancel);input.focus();input.select();
  };
  const del=node('button','history-delete-round','🗑 Xóa trận');del.type='button';
  del.onclick=async()=>{
   if(d.entries.length){alert('Trận này có lịch sử đăng ký. Không thể xóa để tránh mất dữ liệu. Bạn vẫn có thể sửa ngày.');return}
   if(!confirm('Xóa vĩnh viễn trận '+(d.round.match_date||'chưa có ngày')+'? Chỉ trận trống và đã kết thúc mới được xóa.'))return;
   del.disabled=true;try{await mutate('/api/attendance/rounds/'+id,'DELETE');selectedRoundId=null;detail.textContent='Đã xóa trận trống';await show()}catch(e){alert('Không thể xóa trận: '+e.message);del.disabled=false}
  };
  actions.append(edit,del);header.append(actions);
 }
 detail.append(header);
 const classes=['Cửu Linh','Toái Mộng','Huyết Hà','Long Ngâm','Thiết Y','Thần Tương','Tố Vấn'];const grid=node('div','history-grid');for(const cls of classes){const group=d.entries.filter(x=>x.class_name===cls),card=node('section','history-class');card.append(node('h4','',`${cls} (${group.length})`));if(!group.length)card.append(node('p','history-empty','Chưa có đăng ký'));for(const e of group){const item=node('div','history-person'),name=node('strong','',e.character_name),when=node('small','',new Date(e.registered_at).toLocaleString('vi-VN'));item.append(name,when);if(e.deleted_at)item.append(node('span','history-deleted','Đã xóa điểm danh'));card.append(item)}grid.append(card)}detail.append(grid)
 }catch(e){detail.textContent=e.message}}
async function show(){if(!dialog.open)dialog.showModal();rounds.textContent='Đang tải…';try{const d=await get('/api/attendance/history');rounds.replaceChildren();if(!d.rounds.length){rounds.textContent='Chưa có trận nào';return}for(const r of d.rounds){const b=node('button','history-round',`${r.match_date||'Chưa gán ngày'} · ${r.total} lượt${r.is_active?' · Đang mở':''}`);b.type='button';b.onclick=()=>{rounds.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');showRound(r.id)};rounds.append(b);b.dataset.roundId=r.id}const chosen=rounds.querySelector(`[data-round-id="${selectedRoundId}"]`)||rounds.querySelector('button');chosen.click()}catch(e){rounds.textContent=e.message}}
open.addEventListener('click',show);$('history-close').onclick=()=>dialog.close();
async function check(){try{const d=await get('/api/me');open.hidden=!d.admin}catch{open.hidden=true}}
check();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();