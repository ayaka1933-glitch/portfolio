// ============ storage ============
const STORE_KEY = "lion-lab";
const RANKS = ["Cub", "Young Lion", "Shortlist", "Finalist", "Bronze", "Silver", "Gold", "Grand Prix", "Titanium", "Legend"];
const SPARK_SEC = 600;

function loadState() {
  const base = { xp: 0, streak: 0, bestStreak: 0, lastDay: "", log: {}, sessions: [], active: "", sparkBest: 0, cases: {}, plan: { fields: {}, criteria: null, notes: [] }, target: "", cat: "print", mode: "sprint" };
  try {
    return Object.assign(base, JSON.parse(localStorage.getItem(STORE_KEY)) || {});
  } catch (e) {
    return base;
  }
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ }
}
const state = loadState();

function dayKey(offset = 0, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// 日ごとの記録 { ideas: 出したアイデア数, spark, dojo, judge, case: こなした回数, xp }
function todayLog() {
  return (state.log[dayKey()] ||= { ideas: 0, spark: 0, dojo: 0, judge: 0, case: 0, xp: 0 });
}
function touchStreak() {
  const today = dayKey();
  if (state.lastDay !== today) {
    state.streak = state.lastDay === dayKey(-1) ? state.streak + 1 : 1;
    state.lastDay = today;
  }
  state.bestStreak = Math.max(state.bestStreak, state.streak);
}
function record(kind, ideas = 0) {
  const l = todayLog();
  if (kind) l[kind] = (l[kind] || 0) + 1;
  l.ideas += ideas;
  touchStreak();
  saveState();
}

function addXp(n, silent) {
  n = Math.round(n);
  if (n <= 0) return;
  const before = levelInfo().level;
  state.xp += n;
  todayLog().xp += n;
  saveState();
  const after = levelInfo().level;
  if (after > before) toast(`⬆ Level Up! Lv.${after} ${rankName(after)}`);
  else if (!silent) toast(`+${n} XP`);
  renderHeader();
}
// Lv.n → n+1 に必要なXP: 100 + (n-1)*60
function levelInfo() {
  let level = 1, need = 100, rest = state.xp;
  while (rest >= need) { rest -= need; level++; need = 100 + (level - 1) * 60; }
  return { level, now: rest, need };
}
const rankName = lv => RANKS[Math.min(lv, RANKS.length) - 1];

// ============ helpers ============
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pick = a => a[Math.floor(Math.random() * a.length)];
const lines = text => (text || "").split("\n").map(s => s.trim()).filter(Boolean);
const catOf = id => CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
const modeOf = id => MODES.find(m => m.id === id) || MODES[0];
const briefOf = id => BRIEFS.find(b => b.id === id);

function clock(ms) {
  const neg = ms < 0;
  let s = Math.floor(Math.abs(ms) / 1000);
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const body = h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return neg ? `+${body}` : body;
}
function fmtDate(t) {
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ============ router ============
function go(name) {
  stopDojoTick();
  stopSpark(false);
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  window.scrollTo(0, 0);
  if (name === "home") renderHome();
  if (name === "brief-list") renderBriefList();
  if (name === "spark") renderSpark();
  if (name === "bank") renderBank();
  if (name === "learn") renderLearn();
  if (name === "plan") renderPlan();
  if (name === "plan-sheet") renderSheet();
}
document.addEventListener("click", e => {
  const el = e.target.closest("[data-go]");
  if (el) go(el.dataset.go);
});

// ============ home ============
function renderHeader() {
  const alive = state.lastDay === dayKey() || state.lastDay === dayKey(-1);
  $("streak").textContent = alive ? state.streak : 0;
  $("level").textContent = levelInfo().level;
}

// 月曜はじまりの今週の日付
function weekDays() {
  const now = new Date();
  const back = (now.getDay() + 6) % 7;
  return [...Array(7).keys()].map(i => dayKey(i - back));
}

function renderHome() {
  renderHeader();
  const { level, now, need } = levelInfo();
  $("rankTitle").textContent = `Lv.${level} ${rankName(level)}`;
  $("xpNow").textContent = now;
  $("xpNext").textContent = need;
  requestAnimationFrame(() => { $("xpFill").style.width = `${(now / need) * 100}%`; });

  // カウントダウン
  $("cdDate").value = state.target;
  if (state.target) {
    const days = Math.ceil((new Date(`${state.target}T00:00:00`) - new Date(`${dayKey()}T00:00:00`)) / 86400000);
    $("cdDays").textContent = days >= 0 ? days : "済";
    $("cdLabel").textContent = days >= 0 ? `目標日（${state.target.replace(/-/g, "/")}）まで` : "目標日を過ぎました";
  } else {
    $("cdDays").textContent = "--";
    $("cdLabel").textContent = "目標日を設定しよう";
  }

  const totalIdeas = Object.values(state.log).reduce((a, l) => a + (l.ideas || 0), 0);
  const done = state.sessions.filter(s => s.done);
  $("statIdeas").textContent = totalIdeas;
  $("statBriefs").textContent = done.length;
  const best = state.sessions.map(s => verdictOf(s)).filter(Boolean).sort((a, b) => b.rank - a.rank)[0];
  $("statBest").textContent = best ? best.label : "-";

  const active = state.sessions.find(s => s.id === state.active);
  $("dojoMeta").textContent = active ? `▶ 途中のブリーフあり：${briefOf(active.briefId).issue}` : `${done.length} 本やり切った`;
  $("sparkMeta").textContent = state.sparkBest ? `自己ベスト ${state.sparkBest} 案` : "まずは10分";
  const unjudged = done.filter(s => !s.scores || Object.keys(s.scores).length < CRITERIA.length).length;
  $("bankMeta").textContent = unjudged ? `未審査 ${unjudged} 件` : `${done.length} 件`;
  $("planMeta").textContent = planPct() ? `${planPct()}% 完成` : "まずはゴールから";
  $("learnMeta").textContent = `受賞作 ${Object.keys(state.cases).length} / ${CASES.length} 分解済み`;

  // 今週のメニュー
  const days = weekDays();
  $("weekRange").textContent = `${days[0].slice(5).replace("-", "/")} 〜 ${days[6].slice(5).replace("-", "/")}`;
  const sum = k => days.reduce((a, d) => a + (state.log[d]?.[k] || 0), 0);
  $("routine").innerHTML = ROUTINE.map(r => {
    const n = sum(r.id);
    const ok = n >= r.target;
    return `<li class="${ok ? "ok" : ""}"><span class="check">${ok ? "✔" : ""}</span><span>${esc(r.label)}</span><span class="muted small">${Math.min(n, r.target)} / ${r.target}</span></li>`;
  }).join("");

  // 直近7日
  const last = [...Array(7).keys()].map(i => dayKey(i - 6));
  const vals = last.map(d => state.log[d]?.ideas || 0);
  const max = Math.max(20, ...vals);
  $("weekBars").innerHTML = last.map((d, i) => `
    <div class="wb${i === 6 ? " today" : ""}">
      <span class="wb-num">${vals[i] || ""}</span>
      <span class="wb-bar" style="height:${(vals[i] / max) * 100}%"></span>
      <span class="wb-day">${"日月火水木金土"[new Date(`${d}T00:00:00`).getDay()]}</span>
    </div>`).join("");
}

$("cdForm").addEventListener("submit", e => {
  e.preventDefault();
  state.target = $("cdDate").value;
  saveState();
  renderHome();
  toast(state.target ? "目標日を設定しました" : "目標日をリセットしました");
});

// ============ brief list ============
function renderBriefList() {
  $("catChips").innerHTML = CATEGORIES.map(c =>
    `<button type="button" class="chip-btn${c.id === state.cat ? " active" : ""}" data-cat="${c.id}">${c.icon} ${esc(c.name)}</button>`).join("");
  const cat = catOf(state.cat);
  $("catFocus").innerHTML = `<b>${esc(cat.ja)}部門の勝負どころ：</b>${esc(cat.focus)}<br><span class="muted">💡 ${esc(cat.tip)}</span>`;
  $("modeChips").innerHTML = MODES.map(m =>
    `<button type="button" class="chip-btn${m.id === state.mode ? " active" : ""}" data-mode="${m.id}">${esc(m.name)}<small>${esc(m.desc)}</small></button>`).join("");

  const planCat = lines(state.plan.fields.category)[0];
  $("planRemind").hidden = false;
  $("planRemind").innerHTML = planCat ? `📋 勝ち筋シート：<b>${esc(planCat)}</b>` : "📋 まだ勝ち筋シートがありません。先に作っておこう →";

  const tried = new Set(state.sessions.map(s => s.briefId));
  $("briefList").innerHTML = BRIEFS.map(b => `
    <button type="button" class="list-item" data-brief="${b.id}">
      <span class="li-main"><b>${esc(b.issue)}</b><span class="muted small">${esc(b.org)}</span></span>
      <span class="li-side">${tried.has(b.id) ? "✔ 挑戦済み" : "未挑戦"}</span>
    </button>`).join("");
}
$("catChips").addEventListener("click", e => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  state.cat = b.dataset.cat;
  saveState();
  renderBriefList();
});
$("modeChips").addEventListener("click", e => {
  const b = e.target.closest("[data-mode]");
  if (!b) return;
  state.mode = b.dataset.mode;
  saveState();
  renderBriefList();
});
$("briefList").addEventListener("click", e => {
  const b = e.target.closest("[data-brief]");
  if (b) startDojo(b.dataset.brief);
});
$("randomBrief").addEventListener("click", () => {
  // 未挑戦のブリーフを優先
  const tried = new Set(state.sessions.map(s => s.briefId));
  const fresh = BRIEFS.filter(b => !tried.has(b.id));
  startDojo(pick(fresh.length ? fresh : BRIEFS).id, true);
});

// ============ dojo ============
// 時間は実時間で進む（本番と同じく、中断しても止まらない）。時間切れでも書き続けられる
let dojo = null;   // 開いているセッション
let dojoTick = null;

function startDojo(briefId, surprise) {
  const active = state.sessions.find(s => s.id === state.active && !s.done);
  if (active && !confirm("途中のブリーフがあります。新しく始めますか？（途中の分は Judge Room に残ります）")) {
    openDojo(active);
    return;
  }
  const s = {
    id: `s${Date.now()}`,
    briefId, cat: state.cat, mode: state.mode,
    startedAt: Date.now(), phase: 0, texts: {}, done: false, scores: {}
  };
  state.sessions.unshift(s);
  state.active = s.id;
  saveState();
  openDojo(s);
  if (surprise) toast("📩 ブリーフが届きました");
}

function openDojo(s) {
  go("dojo");
  dojo = s;
  state.active = s.id;
  saveState();
  const b = briefOf(s.briefId), cat = catOf(s.cat);
  $("briefOrg").textContent = `${b.org}｜${b.issue}`;
  $("briefCat").textContent = `${cat.icon} ${cat.name}・${modeOf(s.mode).name}`;
  $("briefChallenge").textContent = b.challenge;
  $("briefTarget").textContent = b.target;
  $("briefAction").textContent = b.action;
  $("briefMandatory").textContent = b.mandatory;
  $("briefCard").open = s.phase === 0;
  renderPhase();
  dojoTick = setInterval(updateDojoTimer, 1000);
}
function stopDojoTick() {
  clearInterval(dojoTick);
  dojoTick = null;
}

function phaseEnd(s, i) {
  const total = modeOf(s.mode).min * 60000;
  const ratio = PHASES.slice(0, i + 1).reduce((a, p) => a + p.ratio, 0);
  return s.startedAt + total * ratio;
}

function updateDojoTimer() {
  if (!dojo) return;
  const total = modeOf(dojo.mode).min * 60000;
  const left = dojo.startedAt + total - Date.now();
  $("dojoTimer").textContent = left >= 0 ? `残り ${clock(left)}` : `超過 ${clock(left)}`;
  $("dojoTimer").classList.toggle("over", left < 0);
  $("dojoTimer").classList.toggle("hurry", left >= 0 && left < total * 0.1);

  const i = dojo.phase;
  const start = i ? phaseEnd(dojo, i - 1) : dojo.startedAt;
  const end = phaseEnd(dojo, i);
  const pLeft = end - Date.now();
  $("phaseTime").textContent = pLeft >= 0 ? `目安 あと${clock(pLeft)}` : `目安を ${clock(pLeft)} 超過`;
  $("phaseTime").classList.toggle("over", pLeft < 0);
  const pct = Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
  $("phaseFill").style.width = `${pct}%`;
}

function renderPhase() {
  const p = PHASES[dojo.phase];
  $("dojoSteps").innerHTML = PHASES.map((x, i) =>
    `<button type="button" class="step${i === dojo.phase ? " now" : ""}${dojo.texts[x.id] ? " filled" : ""}" data-step="${i}" title="${esc(x.name)}">${i + 1}</button>`).join("");
  $("phaseName").textContent = `${dojo.phase + 1}. ${p.name}`;
  $("phaseGuide").textContent = p.guide;
  $("phaseText").placeholder = p.placeholder;
  $("phaseText").value = dojo.texts[p.id] || "";
  $("lensBox").hidden = !p.lens;
  // 「選び抜く」では、勝ち筋シートの基準とマイルールを横に置いて判断する
  $("pickBox").hidden = p.id !== "pick";
  if (p.id === "pick") {
    const rules = lines(state.plan.fields.rules);
    $("pickBox").innerHTML = `
      <p class="small"><b>📋 勝ち筋シートの基準</b>（全部に✔がつく案を選ぶ）</p>
      <ul>${planCriteria().map(c => `<li><label><input type="checkbox"> ${esc(c)}</label></li>`).join("")}</ul>
      ${rules.length ? `<p class="small"><b>マイルール</b></p><ul class="rules">${rules.map(r => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}`;
  }
  $("lensCard").hidden = true;
  $("phasePrev").disabled = dojo.phase === 0;
  $("phaseNext").textContent = dojo.phase === PHASES.length - 1 ? "✔ 提出する" : "次へ →";
  updatePhaseCount();
  updateDojoTimer();
}

function updatePhaseCount() {
  const p = PHASES[dojo.phase];
  const n = lines($("phaseText").value).length;
  $("phaseCount").textContent = p.id === "ideas" ? `${n} 案${n >= 30 ? " 🔥" : n >= 10 ? "（ここから本番）" : ""}`
    : p.id === "insight" ? `${n} / 10 本` : "";
}

$("phaseText").addEventListener("input", () => {
  if (!dojo) return;
  dojo.texts[PHASES[dojo.phase].id] = $("phaseText").value;
  saveState();
  updatePhaseCount();
});
$("dojoSteps").addEventListener("click", e => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  dojo.phase = +b.dataset.step;
  saveState();
  renderPhase();
});
$("phasePrev").addEventListener("click", () => {
  if (dojo.phase > 0) { dojo.phase--; saveState(); renderPhase(); }
});
$("phaseNext").addEventListener("click", () => {
  if (dojo.phase < PHASES.length - 1) {
    dojo.phase++;
    saveState();
    renderPhase();
    window.scrollTo({ top: $("dojoSteps").offsetTop - 70, behavior: "smooth" });
    return;
  }
  finishDojo();
});
$("lensDraw").addEventListener("click", () => {
  const l = pick(LENSES);
  $("lensCard").hidden = false;
  $("lensCard").innerHTML = `<b>${esc(l.name)}</b><span>${esc(l.q)}</span>`;
});
$("dojoExit").addEventListener("click", () => {
  toast("保存しました。Judge Room から再開できます");
  go("home");
});

function finishDojo() {
  const s = dojo;
  const oneline = s.texts.oneline || "";
  if (!lines(oneline).length && !confirm("「一行で言い切る」が空です。このまま提出しますか？")) return;
  const firstSubmit = !s.submitted;
  s.done = true;
  s.submitted = true;
  s.finishedAt = s.finishedAt || Date.now();
  if (state.active === s.id) state.active = "";
  const ideas = lines(s.texts.ideas).length;
  let xp = 0;
  if (firstSubmit) {
    record("dojo", ideas);
    xp = 50 + ideas + lines(s.texts.insight).length;
    addXp(xp, true);
  } else {
    saveState();
  }
  const used = Date.now() - s.startedAt;
  const total = modeOf(s.mode).min * 60000;
  go("summary");
  $("summaryTitle").textContent = firstSubmit ? "提出完了！" : "更新しました";
  $("summaryXp").textContent = xp;
  $("summaryText").innerHTML = `${esc(briefOf(s.briefId).issue)}のブリーフ。アイデア <b>${ideas}</b> 案、インサイト <b>${lines(s.texts.insight).length}</b> 本。<br>${used <= total ? "時間内に提出できました 👏" : `目安を ${clock(total - used).slice(1)} 超えました。次は時間内に。`}<br><span class="muted small">次は少し時間を置いて、審査員の目で採点しよう。</span>`;
  $("summaryJudge").onclick = () => openJudge(s.id);
}

// ============ spark ============
let spark = null;   // { brief, lens, end, timer, running }

function renderSpark() {
  spark ||= { brief: pick(BRIEFS), lens: pick(LENSES), running: false };
  $("sparkIssue").textContent = `${spark.brief.issue}｜${spark.brief.target}`;
  $("sparkChallenge").textContent = `ゴール：${spark.brief.action}`;
  $("sparkLens").innerHTML = `<b>🃏 ${esc(spark.lens.name)}</b><span>${esc(spark.lens.q)}</span>`;
  $("sparkBest").textContent = state.sparkBest ? `（自己ベスト ${state.sparkBest}）` : "";
  if (!spark.running) {
    $("sparkClock").textContent = clock(SPARK_SEC * 1000);
    $("sparkRing").style.setProperty("--p", 100);
  }
  updateSparkCount();
}
function updateSparkCount() {
  $("sparkNum").textContent = lines($("sparkText").value).length;
}
$("sparkText").addEventListener("input", updateSparkCount);
$("sparkShuffle").addEventListener("click", () => {
  spark.brief = pick(BRIEFS.filter(b => b !== spark.brief));
  renderSpark();
});
$("sparkLensBtn").addEventListener("click", () => {
  spark.lens = pick(LENSES.filter(l => l !== spark.lens));
  renderSpark();
});
$("sparkStart").addEventListener("click", () => {
  $("sparkText").value = "";
  updateSparkCount();
  spark.running = true;
  spark.end = Date.now() + SPARK_SEC * 1000;
  $("sparkStart").hidden = true;
  $("sparkStop").hidden = false;
  $("sparkText").focus();
  spark.timer = setInterval(() => {
    const left = spark.end - Date.now();
    if (left <= 0) { stopSpark(true); return; }
    $("sparkClock").textContent = clock(left + 999);
    $("sparkRing").style.setProperty("--p", (left / (SPARK_SEC * 1000)) * 100);
  }, 250);
});
$("sparkStop").addEventListener("click", () => stopSpark(true));

function stopSpark(finished) {
  if (!spark?.running) return;
  clearInterval(spark.timer);
  spark.running = false;
  $("sparkStart").hidden = false;
  $("sparkStart").textContent = "▶ もう一回";
  $("sparkStop").hidden = true;
  $("sparkClock").textContent = "00:00";
  $("sparkRing").style.setProperty("--p", 0);
  if (!finished) return;
  const n = lines($("sparkText").value).length;
  if (!n) return;
  record("spark", n);
  const best = n > state.sparkBest;
  if (best) state.sparkBest = n;
  saveState();
  addXp(10 + n * 2, true);
  toast(best ? `🏆 自己ベスト更新！ ${n} 案（+${10 + n * 2} XP）` : `${n} 案（+${10 + n * 2} XP）`);
  renderSpark();
}

// ============ bank / judge ============
function verdictOf(s) {
  const vals = CRITERIA.map(c => s.scores?.[c.id]).filter(Boolean);
  if (vals.length < CRITERIA.length) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const table = [[4.8, "Grand Prix"], [4.5, "Gold"], [4.2, "Silver"], [3.8, "Bronze"], [3.3, "Finalist"], [2.6, "Shortlist"], [0, "Not yet"]];
  const i = table.findIndex(([min]) => avg >= min);
  return { avg, label: table[i][1], rank: table.length - i };
}
const titleOf = s => {
  const t = lines(s.texts.oneline)[0] || "";
  return t.replace(/^タイトル[：:]\s*/, "") || "（タイトル未設定）";
};

function renderBank() {
  const list = state.sessions;
  $("bankEmpty").hidden = list.length > 0;
  $("bankList").innerHTML = list.map(s => {
    const b = briefOf(s.briefId), v = verdictOf(s);
    return `
      <button type="button" class="list-item" data-session="${s.id}">
        <span class="li-main"><b>${esc(titleOf(s))}</b><span class="muted small">${fmtDate(s.startedAt)}｜${catOf(s.cat).icon} ${esc(catOf(s.cat).name)}｜${esc(b.issue)}</span></span>
        <span class="li-side${v ? " award" : ""}">${s.done ? (v ? esc(v.label) : "未審査") : "▶ 途中"}</span>
      </button>`;
  }).join("");
}
$("bankList").addEventListener("click", e => {
  const b = e.target.closest("[data-session]");
  if (b) openJudge(b.dataset.session);
});

let judging = null;
function openJudge(id) {
  const s = state.sessions.find(x => x.id === id);
  if (!s) return;
  if (!s.done) { openDojo(s); return; }
  go("judge");
  judging = s;
  const b = briefOf(s.briefId);
  $("judgeMeta").textContent = `${catOf(s.cat).name.toUpperCase()} / ${b.issue}`;
  $("judgeTitle").textContent = titleOf(s);
  $("judgeOneline").textContent = lines(s.texts.oneline).slice(1).join(" ").replace(/^アイデア（一行）[：:]\s*/, "");
  $("judgeNotes").innerHTML = PHASES.filter(p => s.texts[p.id]).map(p =>
    `<h4>${esc(p.name)}</h4><p class="note-text">${esc(s.texts[p.id])}</p>`).join("") || `<p class="muted small">メモはありません</p>`;
  renderCriteria();
  renderAiPanel();
  $("aiBox").hidden = !s.ai;
  if (s.ai) $("aiBox").innerHTML = aiHtml(s.ai);
}

function renderCriteria() {
  const s = judging;
  $("criteria").innerHTML = CRITERIA.map(c => `
    <div class="crit">
      <div><b>${esc(c.name)}</b><span class="muted small">${esc(c.q)}</span></div>
      <div class="dots">${[1, 2, 3, 4, 5].map(n =>
        `<button type="button" class="dotbtn${s.scores[c.id] >= n ? " on" : ""}" data-crit="${c.id}" data-n="${n}" aria-label="${esc(c.name)} ${n}">${n}</button>`).join("")}</div>
    </div>`).join("");
  const v = verdictOf(s);
  if (!v) {
    $("verdict").innerHTML = `<p class="muted small">全項目をつけると判定が出ます</p>`;
    return;
  }
  const weakest = CRITERIA.reduce((a, c) => (s.scores[c.id] < s.scores[a.id] ? c : a));
  const tip = {
    brief: PRINCIPLES[3], insight: PRINCIPLES[4], idea: PRINCIPLES[5], oneline: PRINCIPLES[0],
    craft: PRINCIPLES[8], global: PRINCIPLES[6], scale: PRINCIPLES[7]
  }[weakest.id];
  $("verdict").innerHTML = `
    <p class="v-label">${esc(v.label)}<small>平均 ${v.avg.toFixed(1)}</small></p>
    <p class="small">いちばん伸ばせるのは<b>「${esc(weakest.name)}」</b>。</p>
    <p class="small">💡 ${esc(tip.title)}：${esc(tip.body)}</p>`;
}
$("criteria").addEventListener("click", e => {
  const b = e.target.closest("[data-crit]");
  if (!b) return;
  const wasComplete = !!verdictOf(judging);
  judging.scores[b.dataset.crit] = +b.dataset.n;
  if (!wasComplete && verdictOf(judging) && !judging.judged) {
    judging.judged = true;
    record("judge");
    addXp(15);
  }
  saveState();
  renderCriteria();
});
$("judgeResume").addEventListener("click", () => {
  judging.done = false;
  openDojo(judging);
});
$("judgeDelete").addEventListener("click", () => {
  if (!confirm("この案を削除しますか？元に戻せません。")) return;
  state.sessions = state.sessions.filter(s => s !== judging);
  saveState();
  go("bank");
});

// ============ plan（勝ち筋シート） ============
const planCriteria = () => state.plan.criteria || DEFAULT_CRITERIA;
function planPct() {
  const filled = PLAN_FIELDS.filter(f => (state.plan.fields[f.id] || "").trim()).length + (state.plan.criteria ? 1 : 0);
  return Math.round((filled / (PLAN_FIELDS.length + 1)) * 100);
}
function updatePlanProgress() {
  const pct = planPct();
  $("planFill").style.width = `${pct}%`;
  $("planPct").textContent = `${pct}% 完成`;
  if (pct === 100 && !state.plan.completed) {
    state.plan.completed = true;
    saveState();
    addXp(50, true);
    toast("🎉 勝ち筋シート完成！（+50 XP）");
  }
}

function renderPlan() {
  let group = "";
  $("planForm").innerHTML = PLAN_FIELDS.map(f => {
    const head = f.group !== group ? `${group ? "</div>" : ""}<div class="panel"><h3>${esc(f.group)}</h3>` : "";
    group = f.group;
    return `${head}<label class="field">${esc(f.label)}<textarea data-field="${f.id}" rows="${f.rows}" placeholder="${esc(f.hint)}">${esc(state.plan.fields[f.id] || "")}</textarea></label>`;
  }).join("") + "</div>";
  renderCritEdit();
  renderNotes();
  updatePlanProgress();
}
$("planForm").addEventListener("input", e => {
  const t = e.target.closest("[data-field]");
  if (!t) return;
  state.plan.fields[t.dataset.field] = t.value;
  saveState();
  updatePlanProgress();
});

function renderCritEdit() {
  $("critEdit").innerHTML = planCriteria().map((c, i) => `
    <li><span>${esc(c)}</span><button type="button" class="x-btn" data-crit-del="${i}" aria-label="削除">✕</button></li>`).join("");
}
function setCriteria(list) {
  state.plan.criteria = list;
  saveState();
  renderCritEdit();
  updatePlanProgress();
}
$("critEdit").addEventListener("click", e => {
  const b = e.target.closest("[data-crit-del]");
  if (!b) return;
  const list = [...planCriteria()];
  list.splice(+b.dataset.critDel, 1);
  setCriteria(list);
});
$("critAdd").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("critInput").value.trim();
  if (!v) return;
  setCriteria([...planCriteria(), v]);
  $("critInput").value = "";
});

function renderNotes() {
  const notes = [...state.plan.notes].sort((a, b) => b.votes - a.votes || b.at - a.at);
  $("noteCount").textContent = `${notes.length} 件`;
  $("noteList").innerHTML = notes.map(n => `
    <li class="${n.votes >= 2 ? "rule" : ""}">
      <div>
        <p>${esc(n.text)}</p>
        <p class="muted small">${n.source ? esc(n.source) : "出典なし"}${n.votes >= 2 ? `<span class="badge">原則</span>` : ""}</p>
      </div>
      <div class="note-actions">
        <button type="button" class="vote" data-vote="${n.at}" title="別の人も同じことを言っていた">＋1<b>${n.votes}</b></button>
        <button type="button" class="x-btn" data-note-del="${n.at}" aria-label="削除">✕</button>
      </div>
    </li>`).join("");
}
$("noteForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("noteText").value.trim();
  if (!text) { toast("学んだことを書いてください"); return; }
  state.plan.notes.push({ at: Date.now(), source: $("noteSource").value.trim(), text, votes: 1 });
  saveState();
  $("noteText").value = "";
  renderNotes();
  addXp(3, true);
});
$("noteList").addEventListener("click", e => {
  const v = e.target.closest("[data-vote]"), d = e.target.closest("[data-note-del]");
  if (v) {
    const n = state.plan.notes.find(x => x.at === +v.dataset.vote);
    n.votes++;
    if (n.votes === 2) toast("2人以上が言っている → 原則に昇格。シートに反映しよう");
  }
  if (d) {
    if (!confirm("このメモを削除しますか？")) return;
    state.plan.notes = state.plan.notes.filter(x => x.at !== +d.dataset.noteDel);
  }
  saveState();
  renderNotes();
});

$("planViewBtn").addEventListener("click", () => go("plan-sheet"));
$("planPrint").addEventListener("click", () => window.print());

function renderSheet() {
  const f = state.plan.fields;
  const block = (label, v) => `<div class="sheet-item"><p class="sheet-label">${esc(label)}</p><p class="sheet-text">${(v || "").trim() ? esc(v.trim()) : `<span class="muted">未記入</span>`}</p></div>`;
  const rules = state.plan.notes.filter(n => n.votes >= 2).sort((a, b) => b.votes - a.votes);
  $("planSheet").innerHTML = `
    <p class="eyebrow">MY GAME PLAN</p>
    <h2 class="sheet-goal">${(f.goal || "").trim() ? esc(f.goal.trim()) : "ゴール未設定"}</h2>
    <div class="sheet-grid">
      ${block("出る部門と理由", f.category)}
      ${block("武器", f.strength)}
      ${block("役割分担", f.partner)}
      ${block("揉めた時の決め方", f.decide)}
    </div>
    ${block("時間配分", f.time)}
    <div class="sheet-item"><p class="sheet-label">案を選ぶ基準</p><ol class="sheet-list">${planCriteria().map(c => `<li>${esc(c)}</li>`).join("")}</ol></div>
    ${block("本番のマイルール", f.rules)}
    ${rules.length ? `<div class="sheet-item"><p class="sheet-label">学んだ原則（2人以上が言っていること）</p><ul class="sheet-list">${rules.map(n => `<li>${esc(n.text)}</li>`).join("")}</ul></div>` : ""}
    <div class="sheet-grid">
      ${block("前回の作品", f.lastWork)}
      ${block("GOLDとの差", f.lastGap)}
    </div>`;
}

// ============ learn ============
function renderLearn() {
  $("tab-principles").innerHTML = PRINCIPLES.map((p, i) => `
    <div class="principle">
      <span class="p-num">${String(i + 1).padStart(2, "0")}</span>
      <div><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p><p class="p-check">✔ ${esc(p.check)}</p></div>
    </div>`).join("");
  $("caseList").innerHTML = CASES.map((c, i) => `
    <button type="button" class="list-item" data-case="${i}">
      <span class="li-main"><b>${esc(c.name)}</b><span class="muted small">${esc(c.brand)}</span></span>
      <span class="li-side">${state.cases[c.name] ? "✔ 分解済み" : "未"}</span>
    </button>`).join("");
  $("phraseList").innerHTML = BOARD_PHRASES.map(p => `
    <div class="phrase">
      <span class="tag">${esc(p.part)}</span>
      <p class="phrase-en">${esc(p.en)}</p>
      <p class="muted small">${esc(p.ja)}</p>
    </div>`).join("");
  $("catList").innerHTML = CATEGORIES.map(c => `
    <div class="principle">
      <span class="p-num">${c.icon}</span>
      <div><h3>${esc(c.name)}<small> ${esc(c.ja)}</small></h3><p>${esc(c.focus)}</p><p class="p-check">💡 ${esc(c.tip)}</p></div>
    </div>`).join("");
}
$("learnTabs").addEventListener("click", e => {
  const t = e.target.closest("[data-tab]");
  if (!t) return;
  document.querySelectorAll("#learnTabs .tab").forEach(x => x.classList.toggle("active", x === t));
  document.querySelectorAll("#view-learn .tab-body").forEach(x => { x.hidden = x.id !== `tab-${t.dataset.tab}`; });
});
$("caseList").addEventListener("click", e => {
  const b = e.target.closest("[data-case]");
  if (b) openCase(CASES[+b.dataset.case]);
});

let currentCase = null;
function openCase(c) {
  go("case");
  currentCase = c;
  $("caseBrand").textContent = c.brand;
  $("caseName").textContent = c.name;
  $("caseHint").textContent = c.hint;
  $("caseChallengeQ").textContent = "どんな課題に、どう答えた作品だと思う？";
  const mine = state.cases[c.name] || {};
  $("caseMyInsight").value = mine.insight || "";
  $("caseMyIdea").value = mine.idea || "";
  $("caseAnswer").hidden = true;
  $("caseChallenge").textContent = c.challenge;
  $("caseInsight").textContent = c.insight;
  $("caseIdea").textContent = c.idea;
  $("caseLesson").textContent = `📝 ${c.lesson}`;
}
$("caseReveal").addEventListener("click", () => {
  const insight = $("caseMyInsight").value.trim(), idea = $("caseMyIdea").value.trim();
  if (!insight && !idea && !confirm("自分の分解を書かずに答えを見ますか？")) return;
  const first = !state.cases[currentCase.name];
  state.cases[currentCase.name] = { insight, idea };
  if (first) {
    record("case");
    addXp(10);
  }
  saveState();
  $("caseAnswer").hidden = false;
});
$("caseBack").addEventListener("click", () => {
  go("learn");
  document.querySelector('#learnTabs [data-tab="cases"]').click();
});

// ============ Claude API (optional) ============
// 静的サイトなのでサーバーは持たず、利用者自身のAPIキーでブラウザから直接呼ぶ。キーは Talk Lab と共通
const KEY_STORE = "talk-lab-key";
const MODEL = "claude-opus-5-5";
const SDK_URL = "https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm";

function getKey() {
  try { return localStorage.getItem(KEY_STORE) || ""; } catch (e) { return ""; }
}
let sdkPromise = null;
async function claude({ system, messages, maxTokens = 4000 }) {
  sdkPromise ||= import(SDK_URL).then(m => m.default);
  let Anthropic;
  try {
    Anthropic = await sdkPromise;
  } catch (e) {
    sdkPromise = null;
    throw new Error("AIの読み込みに失敗しました。通信環境を確認してください。");
  }
  const client = new Anthropic({ apiKey: getKey(), dangerouslyAllowBrowser: true });
  let res;
  try {
    res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system,
      messages
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error("APIキーが正しくないようです。もう一度確認してください。");
    if (e instanceof Anthropic.PermissionDeniedError) throw new Error("このAPIキーでは利用できません（権限エラー）。");
    if (e instanceof Anthropic.RateLimitError) throw new Error("混み合っています。少し待ってからもう一度どうぞ。");
    if (e instanceof Anthropic.APIConnectionError) throw new Error("通信できませんでした。ネット接続を確認してください。");
    if (e instanceof Anthropic.APIError) throw new Error(`AIでエラーが起きました（${e.status ?? "?"}）。`);
    throw e;
  }
  if (res.stop_reason === "refusal") throw new Error("この内容にはAIが答えられませんでした。別の言い方で試してください。");
  return res.content.filter(b => b.type === "text").map(b => b.text).join("").trim();
}

// "LABEL: 内容" 形式の返答を分解する。形式が崩れていたら全体を最初のラベル扱いにする
function parseTagged(text, labels) {
  const out = {};
  const parts = text.split(new RegExp(`^\\s*(${labels.join("|")}):`, "m"));
  for (let i = 1; i < parts.length; i += 2) out[parts[i]] = parts[i + 1].trim();
  if (!Object.keys(out).length) out[labels[0]] = text.trim();
  return out;
}

const JUDGE_LABELS = ["SCORE", "GOOD", "WEAK", "PUSH", "ENGLISH"];
const JUDGE_SYSTEM = `You are a seasoned Cannes Lions juror judging the Young Lions Competition. The entrant is a young Japanese creative (communication planner / copywriter) training to win Japan's national round and then the global final.
Judge like the real jury: idea first, then insight, relevance to the brief, craft, and whether it travels to a global, non-Japanese jury. Be honest and demanding — generic or safe ideas should score low — but always constructive.
The entry is a work in progress written as rough notes, so judge the thinking, not the formatting.
Reply in Japanese, in exactly this format and nothing else:
SCORE: <n>/10 <one short phrase: the award level you think it could reach now, e.g. Shortlist / Bronze / Gold>
GOOD: <one or two sentences: what is genuinely strong>
WEAK: <one or two sentences: the single biggest reason it would lose>
PUSH: <two or three concrete, bold directions to make the idea sharper or more surprising. Use "・" bullets on separate lines>
ENGLISH: <the idea as a single punchy English line a global juror would get in 5 seconds>`;

function renderAiPanel() {
  const key = getKey();
  $("aiKeyNote").textContent = key ? "準備OK" : "APIキーが必要";
  $("keyStatus").textContent = key ? `✅ 保存済み（…${key.slice(-4)}）` : "キーは console.anthropic.com で発行できます。";
  $("keyDelete").hidden = !key;
  $("keyPanel").open = !key;
  $("apiKey").value = "";
}
$("keySave").addEventListener("click", () => {
  const v = $("apiKey").value.trim();
  if (!v.startsWith("sk-ant-")) { toast("sk-ant- で始まるキーを入れてください"); return; }
  try { localStorage.setItem(KEY_STORE, v); } catch (e) { toast("保存できませんでした"); return; }
  renderAiPanel();
  toast("APIキーを保存しました");
});
$("keyDelete").addEventListener("click", () => {
  try { localStorage.removeItem(KEY_STORE); } catch (e) { /* ignore */ }
  renderAiPanel();
});

function aiHtml(text) {
  const p = parseTagged(text, JUDGE_LABELS);
  return `
    ${p.SCORE ? `<p class="ai-score">${esc(p.SCORE)}</p>` : ""}
    ${p.GOOD ? `<p class="fb-good">👍 ${esc(p.GOOD)}</p>` : ""}
    ${p.WEAK ? `<p class="fb-weak">⚠️ ${esc(p.WEAK)}</p>` : ""}
    ${p.PUSH ? `<div class="fb-push"><p class="muted small">もっと尖らせるなら</p><p>${esc(p.PUSH).replace(/\n/g, "<br>")}</p></div>` : ""}
    ${p.ENGLISH ? `<p class="fb-en">🌍 ${esc(p.ENGLISH)}</p>` : ""}`;
}

$("aiJudge").addEventListener("click", async () => {
  if (!getKey()) { $("keyPanel").open = true; toast("先にAPIキーを保存してください"); return; }
  const s = judging, b = briefOf(s.briefId), cat = catOf(s.cat);
  const notes = PHASES.filter(p => s.texts[p.id]).map(p => `## ${p.name}\n${s.texts[p.id]}`).join("\n\n");
  const prompt = `Category: ${cat.name} (${cat.focus})
Brief (from ${b.org}): ${b.challenge}
Target: ${b.target}
Desired action: ${b.action}
Mandatory: ${b.mandatory}

Entrant's work notes:
${notes}`;
  const btn = $("aiJudge");
  btn.disabled = true;
  $("aiBox").hidden = false;
  $("aiBox").innerHTML = `<p class="muted small">⚖️ 審査中…</p>`;
  try {
    const text = await claude({ system: JUDGE_SYSTEM, messages: [{ role: "user", content: prompt }] });
    s.ai = text;
    saveState();
    $("aiBox").innerHTML = aiHtml(text);
    addXp(5, true);
  } catch (e) {
    $("aiBox").innerHTML = `<p class="err">${esc(e.message)}</p>`;
  } finally {
    btn.disabled = false;
  }
});

// ============ start ============
renderHome();
