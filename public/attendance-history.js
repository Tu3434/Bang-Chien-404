(()=>{'use strict';
const $=id=>document.getElementById(id),open=$('history-open'),dialog=$('history-dialog'),rounds=$('history-rounds'),detail=$('history-detail');
if(!open||!dialog)return;
async function get(url){const r=await fetch(url,{credentials:'same-origin'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
function node(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x}
let selectedRoundId=null;
async function post(url){const r=await fetch(url,{method:'POST',credentials:'same-origin'}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`HTTP ${r.status}`);return d}
async function showRound(id){selectedRoundId=id;detail.replaceChildren(node('p','','Đang tải danh sách…'));try{
 const d=await get('/api/attendance/history/'+id);if(selectedRoundId!==id)return;
 detail.replaceChildren();const header=node('div','history-match-heading');header.append(node('h3','',`${d.round.match_date||'Chưa rõ ngày'} · ${d.round.title}`));
 if(!d.round.is_active){const reopen=node('button','history-reopen','↻ Mở lại trận này');reopen.type='button';reopen.onclick=async()=>{
  if(!confirm(`Mở lại trận ${d.round.match_date}? Trận đang mở sẽ tạm kết thúc; đội hình xóa tên nhưng giữ Skill. Dữ liệu đăng ký của cả hai trận vẫn được giữ.`))return;
  reopen.disabled=true;try{await post('/api/attendance/rounds/'+id+'/reopen');await show();document.dispatchEvent(new Event('attendance-round-changed'));}
  catch(e){alert('Không thể mở lại trận: '+e.message);reopen.disabled=false;}
 };header.append(reopen)}else header.append(node('span','history-active-label','● Đang mở'));
 detail.append(header);
 const classes=['Cửu Linh','Toái Mộng','Huyết Hà','Long Ngâm','Thiết Y','Thần Tương','Tố Vấn'];const grid=node('div','history-grid');for(const cls of classes){const group=d.entries.filter(x=>x.class_name===cls),card=node('section','history-class');card.append(node('h4','',`${cls} (${group.length})`));if(!group.length)card.append(node('p','history-empty','Chưa có đăng ký'));for(const e of group){const item=node('div','history-person'),name=node('strong','',e.character_name),when=node('small','',new Date(e.registered_at).toLocaleString('vi-VN'));item.append(name,when);if(e.deleted_at)item.append(node('span','history-deleted','Đã xóa điểm danh'));card.append(item)}grid.append(card)}detail.append(grid)
 }catch(e){detail.textContent=e.message}}
async function show(){if(!dialog.open)dialog.showModal();rounds.textContent='Đang tải…';try{const d=await get('/api/attendance/history');rounds.replaceChildren();if(!d.rounds.length){rounds.textContent='Chưa có trận nào';return}for(const r of d.rounds){const b=node('button','history-round',`${r.match_date||'Chưa gán ngày'} · ${r.total} lượt${r.is_active?' · Đang mở':''}`);b.type='button';b.onclick=()=>{rounds.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');showRound(r.id)};rounds.append(b);b.dataset.roundId=r.id}const chosen=rounds.querySelector(`[data-round-id="${selectedRoundId}"]`)||rounds.querySelector('button');chosen.click()}catch(e){rounds.textContent=e.message}}
open.addEventListener('click',show);$('history-close').onclick=()=>dialog.close();
async function check(){try{const d=await get('/api/me');open.hidden=!d.admin}catch{open.hidden=true}}
check();document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
})();