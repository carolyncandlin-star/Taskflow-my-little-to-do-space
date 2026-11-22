const API = "/api/tasks";
let tasks = [];
let currentView = "dashboard";
let statusFilter = "all";
let selectedDay = null;
let calDate = new Date(); calDate.setDate(1);

const $ = (id) => document.getElementById(id);
const escapeHTML = (value = "") => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pad = n => String(n).padStart(2, "0");
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const dueKey = (date) => { if (!date) return null; const d = new Date(date); return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); };
const isOverdue = task => !task.completed && dueKey(task.dueDate) && dueKey(task.dueDate) < todayKey();
const dateLabel = date => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }) : "No due date";
const getName = () => localStorage.getItem("taskflow-name") || "Carolyn";

function setGreeting() {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const name = getName();
  $("greeting").innerHTML = `${greet}, ${escapeHTML(name)}! <span>♡</span>`;
  $("profileName").textContent = `${name} ♡`;
  document.querySelector(".avatar").textContent = name.charAt(0).toUpperCase();
}
async function api(path = "", options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload;
}
function toast(message, error = false, ms = 3200) {
  const el = document.createElement("div");
  el.className = `toast${error ? " error" : ""}`;
  el.textContent = message;
  $("toastRegion").appendChild(el);
  setTimeout(() => el.remove(), ms);
}
function openModal(task = null) {
  $("taskForm").reset();
  $("taskId").value = task?._id || "";
  $("modalTitle").textContent = task ? "Edit your task ♡" : "Add a little task";
  $("taskTitle").value = task?.title || "";
  $("taskDescription").value = task?.description || "";
  $("taskCategory").value = task?.category || "Personal";
  $("taskPriority").value = task?.priority || "Medium";
  $("taskDueDate").value = dueKey(task?.dueDate) || "";
  $("taskImportant").checked = Boolean(task?.isImportant);
  if (!task && selectedDay) $("taskDueDate").value = selectedDay;
  $("taskModal").classList.add("open");
  $("taskModal").setAttribute("aria-hidden","false");
  setTimeout(() => $("taskTitle").focus(), 50);
}
function closeModal() {
  $("taskModal").classList.remove("open");
  $("taskModal").setAttribute("aria-hidden","true");
}
async function loadTasks() {
  $("taskList").innerHTML = '<div class="loading-state">Gathering your little tasks... ✧</div>';
  try {
    const params = new URLSearchParams();
    const search = $("searchInput").value.trim();
    const category = $("categoryFilter").value;
    const sort = $("sortSelect").value;
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    params.set("sort", sort);
    const result = await api(`?${params.toString()}`);
    tasks = result.data;
    render();
  } catch (err) {
    $("taskList").innerHTML = `<div class="empty-state"><div class="empty-art">☁</div><h3>Oops, we couldn't load your tasks.</h3><p>${escapeHTML(err.message)}</p><button class="add-inline" id="retryLoad">Try again</button></div>`;
    $("retryLoad")?.addEventListener("click", loadTasks);
    toast(err.message, true);
  }
}
function visibleTasks() {
  let list = [...tasks];
  const today = todayKey();
  if (statusFilter === "pending") list = list.filter(t => !t.completed);
  if (statusFilter === "completed") list = list.filter(t => t.completed);
  if (selectedDay) return list.filter(t => dueKey(t.dueDate) === selectedDay);
  if (currentView === "dashboard") list = list.filter(t => !t.completed);
  if (currentView === "today") list = list.filter(t => dueKey(t.dueDate) === today);
  if (currentView === "upcoming") list = list.filter(t => !t.completed && dueKey(t.dueDate) > today);
  if (currentView === "completed") list = list.filter(t => t.completed);
  if (currentView === "important") list = list.filter(t => t.isImportant);
  return list;
}
function taskRow(task) {
  const overdue = isOverdue(task);
  return `
    <article class="task-row ${task.completed ? "done" : ""}" data-id="${task._id}">
      <input class="task-check" type="checkbox" aria-label="Mark ${escapeHTML(task.title)} complete" data-complete="${task._id}" ${task.completed ? "checked" : ""}>
      <div class="task-main" title="Click to edit"><div class="task-title">${task.isImportant ? "☆ " : ""}${escapeHTML(task.title)}</div>${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ""}</div>
      <span class="tag category-tag">${escapeHTML(task.category)}</span>
      <span class="tag priority-tag ${task.completed ? "completed" : task.priority.toLowerCase()}">${task.completed ? "Done ♡" : escapeHTML(task.priority)}</span>
      <span class="due-date${overdue ? " overdue" : ""}" title="${task.dueDate ? dueKey(task.dueDate) : "No due date"}">${overdue ? "⚠ " : "♡ "}${dateLabel(task.dueDate)}</span>
      <button class="task-action edit" data-edit="${task._id}" aria-label="Edit task">✎</button>
      <button class="task-action delete" data-delete="${task._id}" aria-label="Delete task">♧</button>
    </article>`;
}
function render() {
  const total = tasks.length, completed = tasks.filter(t => t.completed).length;
  const pending = total - completed, overdue = tasks.filter(isOverdue).length;
  $("totalCount").textContent = total;
  $("completedCount").textContent = completed;
  $("pendingCount").textContent = pending;
  $("overdueCount").textContent = overdue;
  const percent = total ? Math.round(completed / total * 100) : 0;
  $("progressPercent").textContent = `${percent}%`;
  $("progressText").textContent = `${completed} of ${total} done`;
  $("progressBar").style.width = `${percent}%`;
  $("progressRing").style.background = `conic-gradient(#ed9fbd ${percent*3.6}deg,#f8dce8 0deg)`;
  const viewName = ({dashboard:"Focus List",all:"My Tasks",today:"Today's Tasks",upcoming:"Coming Up",completed:"Completed Tasks",important:"Important Tasks",categories:"Your Categories"})[currentView];
  const dayName = selectedDay ? new Date(selectedDay + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
  $("viewTitle").innerHTML = `${selectedDay ? `Tasks on ${dayName}` : viewName} <span>♡</span>`;
  renderCalendar();
  const list = visibleTasks();
  $("taskCountLabel").textContent = `${list.length} ${list.length === 1 ? "task" : "tasks"}`;
  if (!list.length) {
    $("taskList").innerHTML = `<div class="empty-state"><div class="empty-art">૮ ˶ᵔ ᵕ ᵔ˶ ა</div><h3>${tasks.length ? "Nothing here just yet!" : "Your page is a fresh little canvas."}</h3><p>${tasks.length ? "Try another view or add a new task." : "Add your first task and let the magic begin."}</p><button class="add-inline" id="emptyAdd">＋ Add a task</button></div>`;
    $("emptyAdd").addEventListener("click", () => openModal());
    return;
  }
  if (currentView === "categories") {
    const groups = {};
    list.forEach(t => (groups[t.category] = groups[t.category] || []).push(t));
    $("taskList").innerHTML = Object.keys(groups).sort().map(cat =>
      `<h4 class="group-title">✿ ${escapeHTML(cat)} <small>${groups[cat].length}</small></h4>${groups[cat].map(taskRow).join("")}`).join("");
  } else {
    $("taskList").innerHTML = list.map(taskRow).join("");
  }
}
async function createOrUpdate(data, id) {
  const result = await api(id ? `/${id}` : "", { method: id ? "PUT" : "POST", body: JSON.stringify(data) });
  toast(id ? "Your task has been updated ♡" : "A new little task is saved! ✿");
  closeModal(); await loadTasks();
  return result;
}
$("taskForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = $("taskId").value;
  const title = $("taskTitle").value.trim();
  if (!title) return toast("Please add a task title.", true);
  const data = {
    title, description: $("taskDescription").value.trim(),
    category: $("taskCategory").value, priority: $("taskPriority").value,
    dueDate: $("taskDueDate").value || null, isImportant: $("taskImportant").checked
  };
  try { await createOrUpdate(data, id); } catch (err) { toast(err.message, true); }
});
$("taskList").addEventListener("click", async e => {
  const row = e.target.closest(".task-row");
  if (row && e.target.closest(".task-main")) { const t = tasks.find(x => x._id === row.dataset.id); if (t) openModal(t); return; }
  const editId = e.target.closest("[data-edit]")?.dataset.edit;
  const deleteId = e.target.closest("[data-delete]")?.dataset.delete;
  if (editId) openModal(tasks.find(t => t._id === editId));
  if (deleteId) {
    const task = tasks.find(t => t._id === deleteId);
    if (!task || !confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try { await api(`/${deleteId}`, { method: "DELETE" }); toast("Task deleted."); await loadTasks(); }
    catch (err) { toast(err.message, true); }
  }
});
$("taskList").addEventListener("change", async e => {
  const id = e.target.dataset.complete;
  if (!id) return;
  try { await api(`/${id}/complete`, { method: "PATCH" }); toast("Task status updated ✧"); await loadTasks(); }
  catch (err) { toast(err.message, true); await loadTasks(); }
});
$("quickForm").addEventListener("submit", async e => {
  e.preventDefault();
  const title = $("quickTitle").value.trim();
  if (!title) return;
  try { await api("", { method: "POST", body: JSON.stringify({ title, category: "Personal", priority: "Medium" }) }); $("quickTitle").value = ""; toast("Quick task added ♡"); await loadTasks(); }
  catch (err) { toast(err.message, true); }
});
["addTaskTop","addTaskInline"].forEach(id => $(id).addEventListener("click", () => openModal()));
["closeModal","cancelModal"].forEach(id => $(id).addEventListener("click", closeModal));
$("taskModal").addEventListener("click", e => { if (e.target === $("taskModal")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
$("searchInput").addEventListener("input", debounce(loadTasks, 250));
$("categoryFilter").addEventListener("change", loadTasks);
$("sortSelect").addEventListener("change", loadTasks);
$("statusFilters").addEventListener("click", e => {
  const btn = e.target.closest("[data-filter]");
  if (!btn) return;
  statusFilter = btn.dataset.filter;
  document.querySelectorAll(".pill").forEach(p => p.classList.toggle("selected", p === btn));
  render();
});

const extraPage = $("extraPage");
const mainSections = [document.querySelector(".welcome-row"), $("reminderBanner"), document.querySelector(".stats-grid"), document.querySelector(".content-grid"), document.querySelector(".page-footer")];
const readStore = key => { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } };
const writeStore = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const pageShell = (kicker,title,desc,body) => `<div class="extra-heading"><div><span class="section-kicker">${kicker}</span><h2>${title} <span>♡</span></h2><p>${desc}</p></div><span class="extra-spark">✧ ✿</span></div>${body}`;
function showExtra(view) {
  const titles = {calendar:["YOUR MONTH AT A GLANCE","My Calendar","A gentle little overview of your plans."],diary:["A QUIET CORNER FOR YOU","My Diary","A private space for thoughts, stories and little moments."],stickers:["MAKE IT YOURS","Sticker Studio","Collect cute stickers or make your own little decorations."],memories:["LITTLE MOMENTS, KEPT CLOSE","Memory Garden","Add photos and captions as a visual reflection of your days."]};
  if (!titles[view]) return;
  mainSections.forEach(el => { if(el) el.hidden = true; });
  extraPage.hidden = false;
  const [k,t,d] = titles[view];
  if(view==="calendar") renderFullCalendar(k,t,d);
  if(view==="diary") renderDiary(k,t,d);
  if(view==="stickers") renderStickers(k,t,d);
  if(view==="memories") renderMemories(k,t,d);
}
let fullCalDate = new Date(); fullCalDate.setDate(1);
let fullCalMode = 'month';
let fullCalSelected = todayKey();
function monthCells(year, month, compact=false) {
 const first=new Date(year,month,1).getDay(), count=new Date(year,month+1,0).getDate();
 const cells=Array(first).fill('<span class="full-cal-blank"></span>');
 for(let n=1;n<=count;n++){
  const key=`${year}-${pad(month+1)}-${pad(n)}`, due=tasks.filter(x=>dueKey(x.dueDate)===key);
  cells.push(`<button type="button" class="full-cal-day ${key===todayKey()?'is-today':''} ${key===fullCalSelected?'is-selected':''} ${due.length?'has-plan':''} ${reminders.some(r=>r.date===key)?'has-reminder':''}" data-date="${key}" aria-label="${key}, ${due.length} tasks"><b>${n}</b>${due.length?`<small>${due.length} task${due.length>1?'s':''}</small>`:''}</button>`);
 }
 return `<div class="full-cal-grid full-cal-week">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(x=>`<span>${x}</span>`).join('')}</div><div class="full-cal-grid">${cells.join('')}</div>`;
}
function renderFullCalendar(k,t,d) {
 const theme=MONTH_THEMES[fullCalDate.getMonth()];
 const controls=`<div class="calendar-view-controls"><button type="button" data-cal-mode="all" class="${fullCalMode==='all'?'active':''}">All Calendars</button><button type="button" data-cal-mode="month" class="${fullCalMode==='month'?'active':''}">This Month</button></div>`;
 let content='';
 if(fullCalMode==='all'){
  const year=fullCalDate.getFullYear();
  content=`<div class="all-months-grid">${MONTH_THEMES.map((th,m)=>`<article class="month-theme-card" data-open-month="${m}" role="button" tabindex="0" aria-label="Open ${new Date(year,m,1).toLocaleDateString(undefined,{month:'long'})} calendar" style="--cal-accent:${th.accent};--cal-dark:${th.dark};--cal-soft:${th.soft}"><header><span class="cal-pic small" aria-hidden="true">${th.pic}</span><div><h3>${new Date(year,m,1).toLocaleDateString(undefined,{month:'long'})}</h3><small>${th.name}</small></div><span class="mini-heart">♡</span></header>${monthCells(year,m,true)}</article>`).join('')}</div>`;
 } else {
  content=`<div class="full-calendar" style="--cal-accent:${theme.accent};--cal-dark:${theme.dark};--cal-soft:${theme.soft}"><div class="full-cal-toolbar"><button type="button" data-cal-shift="-1" aria-label="Previous month">‹</button><div><div class="full-cal-title">${fullCalDate.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</div></div><button type="button" data-cal-shift="1" aria-label="Next month">›</button></div><div class="cal-banner full-banner"><span class="cal-pic" aria-hidden="true">${theme.pic}</span><div><strong>${theme.name}</strong><small>✧ ${theme.sub} ✧</small></div><span class="banner-doodles" aria-hidden="true"><i>✧</i><i>♡</i><i>✿</i></span></div>${monthCells(fullCalDate.getFullYear(),fullCalDate.getMonth())}</div>`;
 }
 const chosen=tasks.filter(x=>dueKey(x.dueDate)===fullCalSelected);
 const dayRems=reminders.filter(r=>r.date===fullCalSelected);
 const remBlock=`<div class="selected-reminders"><h4>🔔 Reminders</h4>${dayRems.length?dayRems.map(r=>`<div class="calendar-task-line"><span>🔔</span><strong>${escapeHTML(r.text)}</strong><small>${LEAD_LABEL[r.lead]??''}</small><button type="button" class="rem-x" data-full-rem-del="${r.id}" aria-label="Delete reminder">×</button></div>`).join(''):'<p>No reminders for this date yet.</p>'}<form class="rem-form" id="fullRemForm"><input id="fullRemText" maxlength="80" autocomplete="off" placeholder="e.g. Sister's birthday 🎂" required aria-label="Reminder text"><select id="fullRemLead" aria-label="When to remind me"><option value="0">On the day</option><option value="1">1 day before</option><option value="3">3 days before</option><option value="7" selected>1 week before</option></select><button aria-label="Add reminder">＋</button></form></div>`;
 const selectedPanel=`<section class="selected-date-panel"><h3>♡ ${new Date(fullCalSelected+'T00:00:00').toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</h3>${chosen.length?chosen.map(x=>`<div class="calendar-task-line"><span>${x.completed?'✓':'♡'}</span><strong>${escapeHTML(x.title)}</strong><small>${escapeHTML(x.category||'Personal')}</small></div>`).join(''):'<p>No tasks planned for this date yet.</p>'}${remBlock}<button type="button" class="primary-btn" id="addCalendarTask">＋ Add task for this date</button></section>`;
 extraPage.innerHTML=pageShell(k,t,d,`${controls}${content}${selectedPanel}`);
 extraPage.querySelectorAll('[data-cal-mode]').forEach(b=>b.addEventListener('click',()=>{fullCalMode=b.dataset.calMode;renderFullCalendar(k,t,d)}));
 extraPage.querySelectorAll('[data-open-month]').forEach(card=>{const open=()=>{fullCalDate=new Date(fullCalDate.getFullYear(),Number(card.dataset.openMonth),1);fullCalSelected=`${fullCalDate.getFullYear()}-${pad(fullCalDate.getMonth()+1)}-01`;fullCalMode='month';renderFullCalendar(k,t,d)};card.addEventListener('click',e=>{if(e.target.closest('[data-date]'))return;open()});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
 extraPage.querySelectorAll('[data-cal-shift]').forEach(b=>b.addEventListener('click',()=>{fullCalDate=new Date(fullCalDate.getFullYear(),fullCalDate.getMonth()+Number(b.dataset.calShift),1);fullCalSelected=`${fullCalDate.getFullYear()}-${pad(fullCalDate.getMonth()+1)}-01`;renderFullCalendar(k,t,d)}));
 extraPage.querySelectorAll('[data-date]').forEach(b=>b.addEventListener('click',()=>{fullCalSelected=b.dataset.date;fullCalDate=new Date(Number(fullCalSelected.slice(0,4)),Number(fullCalSelected.slice(5,7))-1,1);renderFullCalendar(k,t,d)}));
 extraPage.querySelector('#addCalendarTask').addEventListener('click',()=>{selectedDay=fullCalSelected;currentView='all';extraPage.hidden=true;mainSections.forEach(el=>{if(el)el.hidden=false});render();openModal()});
 extraPage.querySelector('#fullRemForm').addEventListener('submit',e=>{e.preventDefault();const text=extraPage.querySelector('#fullRemText').value.trim();if(!text)return;reminders.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),date:fullCalSelected,text:text.slice(0,80),lead:Number(extraPage.querySelector('#fullRemLead').value),seen:null});saveReminders();toast('Reminder saved ♡');renderFullCalendar(k,t,d)});
 extraPage.querySelectorAll('[data-full-rem-del]').forEach(b=>b.addEventListener('click',()=>{reminders=reminders.filter(r=>r.id!==b.dataset.fullRemDel);saveReminders();renderFullCalendar(k,t,d)}));
}
function seasonDoodle(month){return ['❄','♡','✿','☼','✿','☀','✧','♡','✎','✦','❧','✧'][month]}

function renderDiary(k,t,d) {
 extraPage.innerHTML=pageShell(k,t,d,`<div class="diary-quote motto" id="diaryQuote" aria-live="polite"></div><form id="diaryForm" class="diary-form"><input id="diaryId" type="hidden"><label>Date<input id="diaryDate" type="date" value="${todayKey()}" required></label><label>Entry title<input id="diaryTitle" maxlength="90" placeholder="A little note to remember..." required></label><label>Your thoughts<textarea id="diaryBody" rows="7" placeholder="Write freely. This space is yours..."></textarea></label><div class="diary-actions"><span>Only saved in this browser ♡</span><button class="primary-btn">Save entry ✧</button></div></form><div class="diary-list" id="diaryList"></div>`);
 startMotto(extraPage.querySelector('#diaryQuote'),'diary','♡');
 const list=extraPage.querySelector('#diaryList');
 const paint=()=>{const items=readStore('taskflow-diary');list.innerHTML=items.length?items.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(e=>`<article class="diary-entry"><div><small>${escapeHTML(e.date||'')}</small><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.body).replace(/\n/g,'<br>')}</p></div><div class="entry-actions"><button data-edit-entry="${e.id}">Edit</button><button data-delete-entry="${e.id}">Delete</button></div></article>`).join(''):'<p class="empty-soft">Your diary is waiting for its first page. ✿</p>'};
 extraPage.querySelector('#diaryForm').addEventListener('submit',e=>{e.preventDefault();const id=extraPage.querySelector('#diaryId').value;let a=readStore('taskflow-diary');const entry={id:id||String(Date.now()),title:extraPage.querySelector('#diaryTitle').value.trim(),body:extraPage.querySelector('#diaryBody').value.trim(),date:extraPage.querySelector('#diaryDate').value};a=id?a.map(x=>x.id===id?entry:x):[...a,entry];writeStore('taskflow-diary',a);e.target.reset();extraPage.querySelector('#diaryDate').value=todayKey();paint();toast('Your diary entry is saved ♡')});
 list.addEventListener('click',e=>{const id=e.target.dataset.editEntry||e.target.dataset.deleteEntry;if(!id)return;let a=readStore('taskflow-diary'),item=a.find(x=>x.id===id);if(e.target.dataset.editEntry){extraPage.querySelector('#diaryId').value=id;extraPage.querySelector('#diaryDate').value=item.date||todayKey();extraPage.querySelector('#diaryTitle').value=item.title;extraPage.querySelector('#diaryBody').value=item.body;extraPage.querySelector('#diaryTitle').focus()}else if(confirm('Delete this diary entry?')){writeStore('taskflow-diary',a.filter(x=>x.id!==id));paint()}});
 paint();
}

function renderStickers(k,t,d) {
 const TAGS=['Popular','Animals','Fruits','Flowers','Decor','Symbols','My stickers'];
 const swatches=TEXT_COLORS.map((c,i)=>`<label class="swatch" style="--sw:${c}" title="Sticker color"><input type="radio" name="stickerColor" value="${c}" ${i===0?'checked':''}><span></span></label>`).join('');
 extraPage.innerHTML=pageShell(k,t,d,`<div class="sticker-intro-note motto" id="stickerMotto" aria-live="polite"></div><form id="stickerForm" class="sticker-create"><label>Make a text sticker<input id="stickerText" maxlength="32" placeholder="e.g. you got this!" required></label><label>Sticker label<input id="stickerLabel" maxlength="35" placeholder="Give it a cute name" required></label><div class="swatch-row" aria-label="Sticker color">${swatches}</div><button class="primary-btn">＋ Create sticker</button></form><div class="sticker-upload"><label class="upload-label">＋ Upload your own sticker image<input id="stickerFile" type="file" accept="image/png,image/jpeg,image/webp" hidden></label><label class="upload-name">Sticker label<input id="stickerUploadLabel" maxlength="35" placeholder="Name your uploaded sticker"></label><small>PNG, JPG or WebP · stored in this browser</small></div><div class="sticker-tags" id="stickerTags"><button class="active" data-tag="All">All</button>${TAGS.map(x=>`<button data-tag="${x}">${x}</button>`).join('')}</div><div class="sticker-preview" id="stickerPreview" hidden><div class="sticker-preview-art" id="previewArt"></div><div class="sticker-preview-copy"><span class="selected-badge">✓ Selected</span><h3 id="previewName"></h3><p>Press <b>Copy picture</b>, then paste it anywhere with <b>Ctrl + V</b> ♡</p><div class="sticker-actions"><button type="button" class="primary-btn" id="copySticker">⧉ Copy picture</button><button type="button" class="secondary-btn" id="downloadSticker">⤓ Download PNG</button><button type="button" class="link-btn" id="clearSticker">clear ✕</button></div><span class="copy-status" id="copyStatus" role="status"></span></div></div><h3 class="subsection-title">Your kawaii collection</h3><div class="sticker-grid" id="stickerGrid"></div><p class="sticker-selected" id="stickerSelected">Tap any sticker to select it — a ✓ will appear ♡</p>`);
 startMotto(extraPage.querySelector('#stickerMotto'),'stickers','✧');
 const grid=extraPage.querySelector('#stickerGrid'),preview=extraPage.querySelector('#stickerPreview'),status=extraPage.querySelector('#copyStatus');
 let activeTag='All',selectedId=null;
 const art=s=>s.image?`<img src="${s.image}" alt="${escapeHTML(s.name)}">`:`<svg viewBox="0 0 100 100" aria-hidden="true">${s.svg}</svg>`;
 const everything=()=>[...STICKER_LIBRARY,...readStore('taskflow-stickers').map(x=>({id:x.id,name:x.label,tags:['My stickers'],custom:true,image:x.image,svg:x.image?'':textStickerSVG(x.text||'cute!',x.color||TEXT_COLORS[0])}))];
 const current=()=>everything().find(s=>s.id===selectedId);
 const showPreview=()=>{const s=current();preview.hidden=!s;extraPage.querySelector('#stickerSelected').textContent=s?`Selected: ${s.name} ✓`:'Tap any sticker to select it — a ✓ will appear ♡';if(!s)return;extraPage.querySelector('#previewArt').innerHTML=art(s);extraPage.querySelector('#previewName').textContent=s.name;status.textContent=''};
 const paint=()=>{const all=everything(),list=activeTag==='All'?all:all.filter(x=>x.tags.includes(activeTag));grid.innerHTML=list.map(s=>`<div class="sticker-cell"><button type="button" class="sticker-tile ${s.id===selectedId?'chosen':''}" data-select-sticker="${s.id}" aria-pressed="${s.id===selectedId}" aria-label="Select ${escapeHTML(s.name)}"><span class="tile-check">✓</span><span class="tile-art">${art(s)}</span><small>${escapeHTML(s.name)}</small></button>${s.custom?`<button type="button" class="sticker-remove" data-remove-sticker="${s.id}" aria-label="Remove ${escapeHTML(s.name)}">×</button>`:''}</div>`).join('')||'<p class="empty-soft">No stickers on this little shelf yet — make one above ✿</p>'};
 extraPage.querySelector('#stickerForm').addEventListener('submit',e=>{e.preventDefault();const a=readStore('taskflow-stickers');const color=e.target.querySelector('input[name=stickerColor]:checked').value;a.push({id:String(Date.now()),text:extraPage.querySelector('#stickerText').value.trim(),label:extraPage.querySelector('#stickerLabel').value.trim(),color});writeStore('taskflow-stickers',a);e.target.reset();activeTag='My stickers';selectedId=a[a.length-1].id;extraPage.querySelectorAll('[data-tag]').forEach(b=>b.classList.toggle('active',b.dataset.tag===activeTag));paint();showPreview();toast('Your new sticker is ready ♡')});
 extraPage.querySelector('#stickerFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;if(f.size>800000){toast('Please choose an image under 800 KB.',true);return}const label=extraPage.querySelector('#stickerUploadLabel').value.trim();if(!label){toast('Please give your sticker a name first.',true);e.target.value='';return}const r=new FileReader();r.onload=()=>{const a=readStore('taskflow-stickers');a.push({id:String(Date.now()),image:r.result,label});try{writeStore('taskflow-stickers',a)}catch(err){toast('Browser storage is full — remove a photo or sticker first.',true);return}activeTag='My stickers';selectedId=a[a.length-1].id;extraPage.querySelectorAll('[data-tag]').forEach(b=>b.classList.toggle('active',b.dataset.tag===activeTag));paint();showPreview();toast('Your sticker has joined the collection ♡')};r.readAsDataURL(f)});
 extraPage.querySelector('#stickerTags').addEventListener('click',e=>{const b=e.target.closest('[data-tag]');if(!b)return;activeTag=b.dataset.tag;extraPage.querySelectorAll('#stickerTags [data-tag]').forEach(x=>x.classList.toggle('active',x===b));paint()});
 grid.addEventListener('click',e=>{const remove=e.target.closest('[data-remove-sticker]');if(remove){writeStore('taskflow-stickers',readStore('taskflow-stickers').filter(s=>s.id!==remove.dataset.removeSticker));if(selectedId===remove.dataset.removeSticker)selectedId=null;paint();showPreview();return}const tile=e.target.closest('[data-select-sticker]');if(!tile)return;selectedId=selectedId===tile.dataset.selectSticker?null:tile.dataset.selectSticker;paint();showPreview();if(selectedId)preview.scrollIntoView({block:'nearest',behavior:'smooth'})});
 const download=async s=>{const blob=await stickerPngBlob(s,512),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(s.name||'sticker').toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
 extraPage.querySelector('#copySticker').addEventListener('click',async()=>{const s=current();if(!s)return;try{if(!navigator.clipboard||!window.ClipboardItem)throw new Error('clipboard');await navigator.clipboard.write([new ClipboardItem({'image/png':stickerPngBlob(s,512)})]);status.textContent='Copied! Now paste it anywhere with Ctrl + V ♡';toast('Sticker copied ♡')}catch(err){await download(s);status.textContent='Your browser blocked copying, so it was saved as a PNG file instead ✧'}});
 extraPage.querySelector('#downloadSticker').addEventListener('click',async()=>{const s=current();if(s){await download(s);status.textContent='Saved as a PNG ♡'}});
 extraPage.querySelector('#clearSticker').addEventListener('click',()=>{selectedId=null;paint();showPreview()});
 paint();showPreview();
}

function renderMemories(k,t,d) {
 extraPage.innerHTML=pageShell(k,t,d,`<div class="memory-welcome motto" id="memoryMotto" aria-live="polite"></div><form id="memoryForm" class="diary-form"><label>Choose a photo<input id="memoryPhoto" type="file" accept="image/*" required></label><label>Photo title<input id="memoryTitle" maxlength="70" placeholder="Give this memory a title" required></label><label>Date of memory<input id="memoryDate" type="date" value="${todayKey()}" required></label><label>Caption<textarea id="memoryCaption" rows="2" maxlength="240" placeholder="What would you like to remember about this moment?"></textarea></label><button class="primary-btn">Add to my memory garden ♡</button><small>Photos are saved in this browser. Keep uploads under 800 KB each.</small></form><h3 class="subsection-title">Your little collection</h3><div class="memory-grid" id="memoryGrid"></div>`);
 startMotto(extraPage.querySelector('#memoryMotto'),'memories','✿');
 const grid=extraPage.querySelector('#memoryGrid');
 const paint=()=>{const a=readStore('taskflow-memories');grid.innerHTML=a.length?a.slice().reverse().map(x=>`<article class="memory-card"><img src="${x.image}" alt="${escapeHTML(x.title||'Personal memory')}"><div class="memory-card-copy"><h3>${escapeHTML(x.title||'A little memory')}</h3><small>${escapeHTML(x.date||'')}</small><p>${escapeHTML(x.caption||'')}</p></div><button data-delete-memory="${x.id}">Remove</button></article>`).join(''):'<p class="empty-soft">Your little moments will bloom here. ✿</p>'};
 extraPage.querySelector('#memoryForm').addEventListener('submit',e=>{e.preventDefault();const f=extraPage.querySelector('#memoryPhoto').files[0];if(!f)return;if(f.size>800000){toast('Choose a photo under 800 KB so your browser storage stays happy.',true);return}const r=new FileReader();r.onload=()=>{let a=readStore('taskflow-memories');a.push({id:String(Date.now()),image:r.result,title:extraPage.querySelector('#memoryTitle').value.trim(),caption:extraPage.querySelector('#memoryCaption').value.trim(),date:extraPage.querySelector('#memoryDate').value});try{writeStore('taskflow-memories',a)}catch(err){toast('Browser storage is full. Remove an older photo and try again.',true);return}e.target.reset();extraPage.querySelector('#memoryDate').value=todayKey();paint();toast('A memory has been tucked away ♡')};r.readAsDataURL(f)});
 grid.addEventListener('click',e=>{const id=e.target.dataset.deleteMemory;if(id&&confirm('Remove this memory?')){writeStore('taskflow-memories',readStore('taskflow-memories').filter(x=>x.id!==id));paint()}});
 paint();
}

document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => {
  currentView = btn.dataset.view; selectedDay = null;
  if(currentView==='dashboard'){const v=Number(sessionStorage.getItem('taskflow-dashboard-visit')||0)+1;sessionStorage.setItem('taskflow-dashboard-visit',String(v));setMotivation();}
  document.querySelectorAll(".nav-item[data-view]").forEach(n => n.classList.toggle("active", n === btn));
  if (["calendar","diary","stickers","memories"].includes(currentView)) showExtra(currentView);
  else { extraPage.hidden = true; mainSections.forEach(el => { if(el) el.hidden = false; }); render(); }
  $("sidebar").classList.remove("open");
}));
$("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
$("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("taskflow-theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if (localStorage.getItem("taskflow-theme") === "dark") document.body.classList.add("dark");
$("notifyBtn").addEventListener("click", () => {
  const today = todayKey();
  const overdue = tasks.filter(isOverdue).length;
  const dueToday = tasks.filter(t => !t.completed && dueKey(t.dueDate) === today).length;
  if (!overdue && !dueToday) return toast("You're all caught up ♡");
  toast(`${dueToday} due today, ${overdue} overdue ✧`, overdue > 0);
});
$("profileName").addEventListener("click", () => {
  const name = prompt("What should we call you?", getName());
  if (name && name.trim()) { localStorage.setItem("taskflow-name", name.trim().slice(0, 20)); setGreeting(); }
});
function debounce(fn, wait) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); }; }
/* ---------- Editable sticky notes ---------- */
/* ---------- Motivation + rotating goals (change through the day) ---------- */
const QUOTES = [
  "A little progress every day makes magic.", "Small steps still move you forward.", "You don't have to be perfect to be proud.",
  "Start where you are, with what you have.", "One tiny task at a time. You've got this!", "Begin gently — done is better than perfect.",
  "Be kind to yourself; you're still growing.", "Your future self will thank you for today.", "Rest is part of the plan, too.",
  "Bloom at your own pace.", "Today is a fresh page. Write something lovely.", "Tiny habits grow into big dreams.",
  "You are closer than you were yesterday.", "Courage looks like starting anyway.", "Focus on the next small thing.",
  "Messy progress is still progress.", "Dream big, start tiny.", "Believe in the magic of showing up.",
  "Every checkmark is a little celebration.", "Breathe in, plan well, begin.", "Your pace is the right pace.",
  "Good things take time — keep going.", "Make today a little bit brighter.", "You can do hard things, softly.",
  "Celebrate the small wins!", "Progress, not perfection.", "Keep going — your dreams are listening.",
  "Plant a little seed of effort today.", "You are doing better than you think.", "Let today be gentle and productive."
];
const PLANS = {
  morning: [
    ["✓ Pick your top 3 tasks", "✓ Drink some water", "♡ Start with the easiest one"],
    ["✓ Plan your day gently", "✓ Tidy your desk", "♡ Smile — it's a new day"],
    ["✓ Review your Focus List", "✓ Do one thing you've delayed", "♡ Be kind to yourself"],
    ["✓ Stretch and breathe", "✓ Write one goal for today", "♡ You've got this"]
  ],
  afternoon: [
    ["✓ Finish one important task", "✓ Take a tiny break", "♡ Stay hydrated"],
    ["✓ Check what's overdue", "✓ Move a big goal forward", "♡ Be proud of your progress"],
    ["✓ Focus for 25 minutes", "✓ Reply to one message", "♡ Take a little walk"],
    ["✓ Tick off a small win", "✓ Plan tomorrow's top task", "♡ Keep going, you're doing great"]
  ],
  evening: [
    ["✓ Review what you finished", "✓ Pick tomorrow's top 3", "♡ Be proud of yourself"],
    ["✓ Tidy up your tasks", "✓ Put the phone down early", "♡ Rest well tonight"],
    ["✓ Celebrate one small win", "✓ Write tomorrow's plan", "♡ Be gentle with yourself"],
    ["✓ Reflect on today", "✓ Prepare for tomorrow", "♡ Sleep is productive too"]
  ]
};
const REMINDERS = [
  ["You don't have to do it all today.", "Just do the next small thing."], ["Slow progress is still progress.", "You're blooming ♡"],
  ["Drink water, take a breath.", "Then begin again."], ["Be proud of how far you've come.", "Keep going gently."],
  ["Your best is enough today.", "Tiny steps count too."], ["Make it small, make it doable.", "Then celebrate it!"],
  ["Rest, then shine.", "The tasks will wait for you."], ["You are allowed to go slowly.", "Just don't stop."]
];
let motivationOffset = 0;
// Changes every 4 hours and every day, so opening the app at different times shows something new.
function timeSeed() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return { block: dayOfYear * 6 + Math.floor(now.getHours() / 4), hour: now.getHours() };
}
function planFor() {
  const { block, hour } = timeSeed();
  const set = PLANS[hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"];
  return set[block % set.length];
}
function reminderFor() { return REMINDERS[timeSeed().block % REMINDERS.length]; }
function setMotivation() {
  const visit = Number(sessionStorage.getItem('taskflow-dashboard-visit') || 0);
  const idx = (timeSeed().block + motivationOffset + visit) % QUOTES.length;
  const el = $("motivation").querySelector(".mot-text");
  el.classList.remove("pop"); void el.offsetWidth;
  el.textContent = QUOTES[idx];
  el.classList.add("pop");
}


/* ---------- Editable sticky notes (your own text is saved; otherwise they rotate) ---------- */
const NOTES = {
  reminderLines: { key: "taskflow-reminder", fallback: reminderFor }
};
function loadNote(id) {
  try { const saved = JSON.parse(localStorage.getItem(NOTES[id].key)); if (Array.isArray(saved) && saved.length) return saved; } catch (e) {}
  return NOTES[id].fallback();
}
function paintNote(id, lines) { $(id).innerHTML = lines.map(l => `<p>${escapeHTML(l)}</p>`).join(""); }
function initNotes() {
  Object.keys(NOTES).forEach(id => {
    const el = $(id);
    paintNote(id, loadNote(id));
    const read = () => el.innerText.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 8).map(l => l.slice(0, 80));
    el.addEventListener("input", () => { try { localStorage.setItem(NOTES[id].key, JSON.stringify(read())); } catch (e) {} });
    el.addEventListener("blur", () => {
      const lines = read();
      if (!lines.length) { try { localStorage.removeItem(NOTES[id].key); } catch (e) {} paintNote(id, NOTES[id].fallback()); }
      else paintNote(id, lines);
    });
    el.addEventListener("paste", e => { e.preventDefault(); document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain")); });
  });
}

/* ---------- Today's little plan: editable checklist ---------- */
const PLAN_KEY = "taskflow-plan2", PLAN_TITLE = "Today's little plan ♡";
const stripIcon = l => l.replace(/^[✓♡✧]\s*/, "");
function loadPlan() {
  try { const saved = JSON.parse(localStorage.getItem(PLAN_KEY)); if (saved && Array.isArray(saved.items) && saved.items.length) return saved; } catch (e) {}
  try { const old = JSON.parse(localStorage.getItem("taskflow-plan")); if (Array.isArray(old) && old.length) return { title: PLAN_TITLE, items: old.map(l => ({ t: stripIcon(l), d: false })) }; } catch (e) {}
  return { title: PLAN_TITLE, items: planFor().map(l => ({ t: stripIcon(l), d: false })) };
}
let plan = loadPlan();
function savePlan() { try { localStorage.setItem(PLAN_KEY, JSON.stringify({ title: plan.title, items: plan.items })); } catch (e) {} }
function resetPlan() { try { localStorage.removeItem(PLAN_KEY); localStorage.removeItem("taskflow-plan"); } catch (e) {} plan = loadPlan(); }
function renderPlanList() {
  $("planList").innerHTML = plan.items.map((it, i) => `<li class="plan-item${it.d ? " done" : ""}"><input type="checkbox" data-i="${i}" ${it.d ? "checked" : ""} aria-label="Done: ${escapeHTML(it.t)}"><span class="plan-text" contenteditable="true" spellcheck="false" data-i="${i}">${escapeHTML(it.t)}</span><button type="button" class="plan-del" data-del="${i}" aria-label="Remove ${escapeHTML(it.t)}">×</button></li>`).join("");
}
function initPlan() {
  $("planTitle").textContent = plan.title;
  renderPlanList();
  $("planTitle").addEventListener("input", () => { plan.title = $("planTitle").textContent.trim().slice(0, 30) || PLAN_TITLE; savePlan(); });
  $("planTitle").addEventListener("blur", () => { if (!$("planTitle").textContent.trim()) { plan.title = PLAN_TITLE; $("planTitle").textContent = PLAN_TITLE; savePlan(); } });
  $("planTitle").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); e.target.blur(); } });
  $("planList").addEventListener("change", e => {
    const i = e.target.dataset.i; if (i === undefined) return;
    plan.items[i].d = e.target.checked; savePlan(); renderPlanList();
    if (plan.items.length && plan.items.every(x => x.d)) toast("All done — so proud of you! ♡", false, 3500);
  });
  $("planList").addEventListener("input", e => {
    const el = e.target.closest(".plan-text"); if (!el) return;
    plan.items[el.dataset.i].t = el.textContent.trim().slice(0, 60); savePlan();
  });
  $("planList").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.closest(".plan-text")) { e.preventDefault(); e.target.blur(); } });
  $("planList").addEventListener("paste", e => { if (!e.target.closest(".plan-text")) return; e.preventDefault(); document.execCommand("insertText", false, (e.clipboardData || window.clipboardData).getData("text/plain").replace(/\s+/g, " ")); });
  $("planList").addEventListener("focusout", e => {
    const el = e.target.closest(".plan-text"); if (!el) return;
    plan.items = plan.items.filter(x => x.t); if (!plan.items.length) resetPlan(); else savePlan();
    renderPlanList();
  });
  $("planList").addEventListener("click", e => {
    const del = e.target.closest("[data-del]"); if (!del) return;
    plan.items.splice(Number(del.dataset.del), 1);
    if (!plan.items.length) resetPlan(); else savePlan();
    renderPlanList();
  });
  $("planForm").addEventListener("submit", e => {
    e.preventDefault();
    const text = $("planInput").value.trim(); if (!text) return;
    if (plan.items.length >= 10) return toast("Your plan is full — tick or clear a few ♡", true);
    plan.items.push({ t: text.slice(0, 60), d: false }); savePlan(); $("planInput").value = ""; renderPlanList();
  });
  $("planClear").addEventListener("click", () => {
    if (!plan.items.some(x => x.d)) return toast("Nothing ticked yet ✧");
    plan.items = plan.items.filter(x => !x.d);
    if (!plan.items.length) { resetPlan(); toast("Fresh plan ready ♡"); } else savePlan();
    renderPlanList();
  });
}

/* ---------- Calendar reminders ---------- */
const REM_KEY = "taskflow-reminders";
const LEAD_LABEL = { 0: "on the day", 1: "1 day before", 3: "3 days before", 7: "1 week before" };
const dayDiff = key => Math.round((new Date(key + "T00:00:00") - new Date(todayKey() + "T00:00:00")) / 86400000);
function loadReminders() {
  try { const r = JSON.parse(localStorage.getItem(REM_KEY)); if (Array.isArray(r)) return r.filter(x => x && x.date && x.text && dayDiff(x.date) >= -30); } catch (e) {}
  return [];
}
let reminders = loadReminders();
function saveReminders() { try { localStorage.setItem(REM_KEY, JSON.stringify(reminders)); } catch (e) {} }
const whenLabel = d => d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d} days`;
const prettyDate = key => new Date(key + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
function activeReminders() {
  return reminders.filter(r => { const d = dayDiff(r.date); return d >= 0 && d <= r.lead && r.seen !== todayKey(); })
    .sort((a, b) => a.date.localeCompare(b.date));
}
function renderReminderBanner() {
  const list = activeReminders(), box = $("reminderBanner");
  box.hidden = !list.length;
  if (!list.length) { box.innerHTML = ""; return; }
  box.innerHTML = `<span class="rem-bell">🔔</span><div class="rem-items">${list.map(r => `
    <div class="rem-item${dayDiff(r.date) <= 1 ? " soon" : ""}"><span><strong>${escapeHTML(r.text)}</strong> — ${whenLabel(dayDiff(r.date))} <small>(${prettyDate(r.date)})</small></span><button type="button" data-seen="${r.id}" aria-label="Got it, hide for today" title="Got it ♡">✓</button></div>`).join("")}</div>`;
}
function renderCalReminders() {
  const box = $("calReminders");
  box.hidden = !selectedDay; $("calHint").hidden = Boolean(selectedDay);
  if (!selectedDay) return;
  $("calRemDate").textContent = `Reminders · ${prettyDate(selectedDay)}`;
  const day = reminders.filter(r => r.date === selectedDay);
  $("calRemList").innerHTML = day.length
    ? day.map(r => `<li><span>${escapeHTML(r.text)} <small>· ${LEAD_LABEL[r.lead] ?? ""}</small></span><button type="button" data-del="${r.id}" aria-label="Delete reminder">×</button></li>`).join("")
    : '<li class="cal-rem-empty">No reminders yet ♡</li>';
}
function initReminders() {
  $("remForm").addEventListener("submit", e => {
    e.preventDefault();
    const text = $("remText").value.trim(); if (!text || !selectedDay) return;
    reminders.push({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5), date: selectedDay, text: text.slice(0, 80), lead: Number($("remLead").value), seen: null });
    saveReminders(); $("remText").value = "";
    toast("Reminder saved ♡"); renderCalendar();
  });
  $("calRemList").addEventListener("click", e => {
    const del = e.target.closest("[data-del]"); if (!del) return;
    reminders = reminders.filter(r => r.id !== del.dataset.del); saveReminders(); renderCalendar();
  });
  $("reminderBanner").addEventListener("click", e => {
    const btn = e.target.closest("[data-seen]"); if (!btn) return;
    const r = reminders.find(x => x.id === btn.dataset.seen); if (r) { r.seen = todayKey(); saveReminders(); }
    renderReminderBanner();
  });
  activeReminders().filter(r => dayDiff(r.date) <= 1).slice(0, 2).forEach((r, i) =>
    setTimeout(() => toast(`🔔 ${r.text} — ${whenLabel(dayDiff(r.date))}!`, false, 6000), 600 + i * 400));
}

/* ---------- Cute calendar ---------- */
const MONTH_THEMES = [
  { pic: "⛄", name: "Snowy snuggles", sub: "January", accent: "#8fc1ea", dark: "#4a82b5", soft: "#e6f2fc" },
  { pic: "💝", name: "Sweet little hearts", sub: "February", accent: "#f594b0", dark: "#c9557a", soft: "#fde6ee" },
  { pic: "🌱", name: "Tiny sprouts", sub: "March", accent: "#93d3a9", dark: "#4f9f6f", soft: "#e5f6ea" },
  { pic: "🐣", name: "Hello, little chick", sub: "April", accent: "#f2d062", dark: "#b8921f", soft: "#fff6d6" },
  { pic: "🌸", name: "Blooming days", sub: "May", accent: "#f4a6c4", dark: "#c8668f", soft: "#fde8f1" },
  { pic: "🌻", name: "Sunshine mood", sub: "June", accent: "#f6bc52", dark: "#c0821a", soft: "#fff0d0" },
  { pic: "🍦", name: "Ice-cream days", sub: "July", accent: "#72d0d8", dark: "#2f9ca5", soft: "#def6f7" },
  { pic: "🍉", name: "Juicy & sweet", sub: "August", accent: "#f58493", dark: "#c4475a", soft: "#ffe5e9" },
  { pic: "📚", name: "Cozy study vibes", sub: "September", accent: "#ac99e8", dark: "#6f58bf", soft: "#ece7fb" },
  { pic: "🎃", name: "Cute & spooky", sub: "October", accent: "#f5a561", dark: "#c26a1f", soft: "#ffecd9" },
  { pic: "🍄", name: "Cozy autumn", sub: "November", accent: "#dda68d", dark: "#a8664b", soft: "#fbebe3" },
  { pic: "🎄", name: "Twinkly lights", sub: "December", accent: "#78c494", dark: "#2f8a55", soft: "#e3f5e9" }
];
function applyCalendarTheme(month) {
  const t = MONTH_THEMES[month], panel = document.querySelector(".calendar-panel");
  panel.style.setProperty("--cal-accent", t.accent);
  panel.style.setProperty("--cal-dark", t.dark);
  panel.style.setProperty("--cal-soft", t.soft);
  $("calPic").textContent = t.pic;
  $("calCaption").textContent = t.name;
  $("calSub").textContent = `✧ ${t.sub} ✧`;
}
function renderCalendar() {
  applyCalendarTheme(calDate.getMonth());
  const y = calDate.getFullYear(), m = calDate.getMonth();
  $("calMonth").textContent = calDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstDay = new Date(y, m, 1).getDay(), daysInMonth = new Date(y, m + 1, 0).getDate();
  const info = {};
  tasks.forEach(t => { const k = dueKey(t.dueDate); if (!k) return; (info[k] = info[k] || { pending: 0, total: 0 }); info[k].total++; if (!t.completed) info[k].pending++; });
  const today = todayKey();
  const remDates = new Set(reminders.map(r => r.date));
  let html = "";
  for (let i = 0; i < firstDay; i++) html += '<span class="cal-empty"></span>';
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${y}-${pad(m + 1)}-${pad(d)}`, i = info[key];
    const cls = ["cal-day", key === today ? "today" : "", key === selectedDay ? "selected" : "", i ? (i.pending && key < today ? "late" : "has-task") : "", remDates.has(key) ? "has-reminder" : ""].join(" ").trim();
    html += `<button class="${cls}" data-date="${key}" aria-label="${d} ${calDate.toLocaleDateString(undefined, { month: "long" })}${i ? `, ${i.total} task${i.total > 1 ? "s" : ""}` : ""}"><span>${d}</span>${i ? "<i></i>" : ""}</button>`;
  }
  $("calDays").innerHTML = html;
  renderCalReminders();
  renderReminderBanner();
}
$("calDays").addEventListener("click", e => {
  const btn = e.target.closest("[data-date]");
  if (!btn) return;
  selectedDay = selectedDay === btn.dataset.date ? null : btn.dataset.date;
  render();
});
$("calPrev").addEventListener("click", () => { calDate = new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1); renderCalendar(); });
$("calNext").addEventListener("click", () => { calDate = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1); renderCalendar(); });

setGreeting();
setMotivation();
initNotes();
initPlan();
initReminders();
renderCalendar();
loadTasks();
