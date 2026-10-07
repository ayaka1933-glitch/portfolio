// ============ storage ============
const STORE_KEY = "talk-lab";
const WORD_GOAL = 150;   // 1日にしゃべる英単語の目標
const RANKS = ["Quiet Bird", "Chirper", "Singer", "Chatterbox", "Storyteller", "Speaker", "Presenter", "Panelist", "Keynote Star", "Talk Master"];

function loadState() {
  const base = { xp: 0, streak: 0, bestStreak: 0, lastDay: "", log: {}, qa: {}, rp: {}, quick: {}, story: {}, ai: 0, phrases: [] };
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

function dayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
// 日ごとの記録 { words: しゃべった英単語数, sets: 終えた練習数, xp }
function todayLog() {
  return (state.log[dayKey()] ||= { words: 0, sets: 0, xp: 0 });
}

function touchStreak() {
  const today = dayKey();
  if (state.lastDay !== today) {
    state.streak = state.lastDay === dayKey(-1) ? state.streak + 1 : 1;
    state.lastDay = today;
  }
  state.bestStreak = Math.max(state.bestStreak, state.streak);
}

// 声に出した英語の単語数を記録（タイピングは数えない）
function addWords(n) {
  if (n <= 0) return;
  const l = todayLog();
  const before = l.words;
  l.words += n;
  touchStreak();
  saveState();
  if (before < WORD_GOAL && l.words >= WORD_GOAL) toast(`🎉 今日の目標 ${WORD_GOAL} words 達成！`);
}

function finishSet() {
  todayLog().sets++;
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

// Lv.n → n+1 に必要なXP: 100 + (n-1)*50
function levelInfo() {
  let level = 1, need = 100, rest = state.xp;
  while (rest >= need) { rest -= need; level++; need = 100 + (level - 1) * 50; }
  return { level, now: rest, need };
}
const rankName = lv => RANKS[Math.min(lv, RANKS.length) - 1];

// ============ helpers ============
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2000);
}

const NUMS = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 20: "twenty", 30: "thirty", 50: "fifty" };
function tokens(text) {
  return text.toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => NUMS[w] || w)
    .map(w => w.replace(/'/g, ""));
}
const wordCount = text => tokens(text).length;

// 最長共通部分列で、お手本のどの単語を言えたかを判定
function compare(target, spoken) {
  const t = tokens(target), s = tokens(spoken);
  if (!t.length) return { score: 0, hits: new Set() };
  const dp = Array.from({ length: t.length + 1 }, () => new Array(s.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = s.length - 1; j >= 0; j--)
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hits = new Set();
  for (let i = 0, j = 0; i < t.length && j < s.length;) {
    if (t[i] === s[j]) { hits.add(i); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { score: Math.round((hits.size / t.length) * 100), hits };
}

// お手本の単語に、言えた/言えなかったの色を付ける
function diffHtml(target, hits) {
  let ti = 0;
  return target.split(" ").map(w => {
    const n = tokens(w).length;
    const ok = n > 0 && [...Array(n).keys()].every(k => hits.has(ti + k));
    ti += n;
    return `<span class="${ok ? "hit" : "miss"}">${esc(w)}</span>`;
  }).join(" ");
}

// フレーズを使えたか（単語列として含まれているか）
function usedPhrase(answer, phrase) {
  return ` ${tokens(answer).join(" ")} `.includes(` ${tokens(phrase).join(" ")} `);
}

function statsHtml(text, sec) {
  const n = wordCount(text);
  const wpm = sec > 3 ? Math.round(n / (sec / 60)) : 0;
  return `
    <div class="your-answer"><span class="muted small">あなたの答え（認識結果）</span><p>${esc(text)}</p></div>
    <div class="stat-pills">
      <span><b>${n}</b> words</span>
      ${sec >= 1 ? `<span><b>${Math.round(sec)}</b> 秒</span>` : ""}
      ${wpm ? `<span><b>${wpm}</b> wpm${wpm >= 90 ? " 👍" : ""}</span>` : ""}
    </div>`;
}

// ============ router ============
let currentView = "home";
function go(name) {
  stopRec();
  stopQuickTimer();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  hidePopover();
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  window.scrollTo(0, 0);
  currentView = name;
  if (name === "home") renderHome();
  if (name === "qa-list") renderQaList();
  if (name === "rp-list") renderRpList();
  if (name === "quick-list") renderQuickList();
  if (name === "story-list") renderStoryList();
  if (name === "ai-setup") renderAiSetup();
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

function renderHome() {
  renderHeader();
  const { level, now, need } = levelInfo();
  $("rankTitle").textContent = `Lv.${level} ${rankName(level)}`;
  $("xpNow").textContent = now;
  $("xpNext").textContent = need;
  requestAnimationFrame(() => { $("xpFill").style.width = `${(now / need) * 100}%`; });

  const words = state.log[dayKey()]?.words || 0;
  const pct = Math.min(100, Math.round((words / WORD_GOAL) * 100));
  $("todayWords").textContent = words;
  $("wordGoal").textContent = WORD_GOAL;
  $("wmPct").textContent = `${pct}%`;
  $("wmRing").style.setProperty("--p", pct);
  $("heroBird").classList.toggle("happy", pct >= 100);
  $("cheer").textContent = cheer(words);

  const qaDone = QA_SETS.filter(s => state.qa[s.id]).length;
  $("qaMeta").textContent = `${qaDone} / ${QA_SETS.length} セット挑戦済み`;
  const rpDone = ROLEPLAYS.filter(r => state.rp[r.id]).length;
  $("rpMeta").textContent = `${rpDone} / ${ROLEPLAYS.length} シーン`;
  const qDone = QUICK_SETS.filter(s => state.quick[s.id] !== undefined).length;
  $("quickMeta").textContent = `${qDone} / ${QUICK_SETS.length} セット`;
  const sDone = STORIES.filter(s => state.story[s.id]).length;
  $("storyMeta").textContent = `${sDone} / ${STORIES.length} 読了`;
  $("aiMeta").textContent = getKey() ? (state.ai ? `${state.ai} 回会話しました` : "準備OK！") : "APIキーが必要";

  renderPhrases();
  renderWeek();
}

function cheer(words) {
  if (!state.xp) return "まずは Q&A Dojo の1問目から。完璧じゃなくていいので、声に出すのが勝ち！";
  if (words === 0) return state.lastDay === dayKey(-1) ? `🔥 ${state.streak}日連続中！今日も1セットだけやってつなげよう。` : "今日はまだ0 words。1分だけ話してみよう。";
  if (words < WORD_GOAL / 2) return `いいスタート！あと ${WORD_GOAL - words} words で今日の目標。`;
  if (words < WORD_GOAL) return `もう少し！あと ${WORD_GOAL - words} words。`;
  return "今日の目標達成！しゃべれる英語が確実に増えてます 🎉";
}

function renderWeek() {
  const days = Array.from({ length: 7 }, (_, i) => dayKey(i - 6));
  const vals = days.map(d => state.log[d]?.words || 0);
  const max = Math.max(WORD_GOAL, ...vals);
  const wd = ["日", "月", "火", "水", "木", "金", "土"];
  $("weekBars").innerHTML = days.map((d, i) => {
    const day = new Date(d.replace(/-/g, "/"));
    return `<div class="wb ${vals[i] >= WORD_GOAL ? "goal" : ""}">
      <span class="wb-val">${vals[i] || ""}</span>
      <span class="wb-bar"><i style="height:${(vals[i] / max) * 100}%"></i></span>
      <span class="wb-day">${i === 6 ? "今日" : wd[day.getDay()]}</span>
    </div>`;
  }).join("");
}

function renderPhrases() {
  $("phraseCount").textContent = state.phrases.length;
  $("phraseEmpty").hidden = state.phrases.length > 0;
  $("phraseList").innerHTML = state.phrases.map((p, i) => `
    <li>
      <div><b>${esc(p.en)}</b>${p.ja ? `<span>${esc(p.ja)}</span>` : ""}</div>
      <button type="button" data-speak="${i}" aria-label="発音を聞く">🔊</button>
      <button type="button" data-del="${i}" aria-label="削除">×</button>
    </li>`).join("");
}
$("phraseList").addEventListener("click", e => {
  const sp = e.target.closest("[data-speak]");
  const del = e.target.closest("[data-del]");
  if (sp) speak(state.phrases[+sp.dataset.speak].en);
  if (del) { state.phrases.splice(+del.dataset.del, 1); saveState(); renderPhrases(); }
});

function savePhrase(en, ja = "") {
  if (state.phrases.some(p => p.en === en)) { toast("もう保存済みです"); return; }
  state.phrases.unshift({ en, ja });
  saveState();
  toast("⭐ フレーズ帳に保存しました");
}

// ============ speech synthesis ============
let voice = null;
function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const vs = speechSynthesis.getVoices().filter(v => /^en[-_]US/i.test(v.lang));
  voice = vs.find(v => /Google|Samantha|Aria|Jenny/i.test(v.name)) || vs[0] || null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  speechSynthesis.addEventListener?.("voiceschanged", pickVoice);
}
function speak(text, rate = 0.95, onEnd) {
  if (!("speechSynthesis" in window)) { onEnd?.(); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate;
  if (voice) u.voice = voice;
  if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
  speechSynthesis.speak(u);
}

// ============ recorder (mic → text) ============
// 各画面の .rec にマイクボタンを置く。音声認識がない環境ではテキスト入力にする
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;        // { recog, el, cancel() }
let micBlocked = false;

function recorder(el, { onDone, short = false, label = "🎙 話す", skip }) {
  const typed = !SR || micBlocked;
  el.innerHTML = typed ? `
      <p class="small muted">${micBlocked ? "マイクが使えないので" : "このブラウザは音声認識に未対応なので"}、声に出して言ってから、言った英語を入力してね。</p>
      <div class="type-row"><input type="text" class="rec-input" placeholder="言った英語を入力" autocomplete="off"><button class="btn primary rec-send" type="button">OK</button></div>
      ${skip ? `<button class="link-btn rec-skip" type="button">${esc(skip.label)}</button>` : ""}`
    : `
      <div class="rec-main">
        <button class="btn mic" type="button">${label}</button>
        <span class="rec-time"></span>
      </div>
      <p class="live"></p>
      ${skip ? `<button class="link-btn rec-skip" type="button">${esc(skip.label)}</button>` : ""}`;

  el.querySelector(".rec-skip")?.addEventListener("click", () => { stopRec(); skip.onSkip(); });

  if (typed) {
    const input = el.querySelector(".rec-input");
    const send = () => {
      const v = input.value.trim();
      if (!v) return;
      input.value = "";
      onDone(v, 0, true);
    };
    el.querySelector(".rec-send").addEventListener("click", send);
    input.addEventListener("keydown", e => { if (e.key === "Enter" && !e.isComposing) send(); });
    return;
  }

  const btn = el.querySelector(".mic");
  const live = el.querySelector(".live");
  const time = el.querySelector(".rec-time");
  btn.addEventListener("click", () => {
    if (rec && rec.el === el) { rec.recog.stop(); return; }
    start();
  });

  function start() {
    stopRec();
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    const recog = new SR();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.continuous = !short;
    let finals = [], interim = "", t0 = Date.now(), timer;
    rec = { recog, el, cancel() { recog.onend = null; recog.abort(); clearInterval(timer); setUi(false); } };

    recog.onresult = e => {
      finals = []; interim = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finals.push(e.results[i][0].transcript.trim());
        else interim += e.results[i][0].transcript;
      }
      live.textContent = [...finals, interim].join(" ");
    };
    recog.onerror = e => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        micBlocked = true;
        toast("マイクが許可されていないので、入力モードにします");
        rec = null;
        clearInterval(timer);
        recorder(el, { onDone, short, label, skip });
      } else if (e.error === "no-speech") {
        toast("声が聞こえなかったよ。もう一度！");
      }
    };
    recog.onend = () => {
      clearInterval(timer);
      setUi(false);
      rec = null;
      const text = [...finals, interim].join(" ").replace(/\s+/g, " ").trim();
      if (!text) { live.textContent = ""; return; }
      const sec = (Date.now() - t0) / 1000;
      addWords(wordCount(text));
      onDone(text, sec, false);
    };
    recog.start();
    setUi(true);
    live.textContent = "聞いています… 話し終わったら ■ を押してね";
    timer = setInterval(() => { time.textContent = `${Math.floor((Date.now() - t0) / 1000)}s`; }, 250);
  }
  function setUi(on) {
    btn.classList.toggle("recording", on);
    btn.textContent = on ? "■ 話し終わった" : label;
    if (!on) time.textContent = "";
  }
}
function stopRec() {
  if (rec) { rec.cancel(); rec = null; }
}

// ============ Q&A Dojo ============
let qa = null;   // { set, idx, rates: [], xp, answer }

function renderQaList() {
  $("qaList").innerHTML = QA_SETS.map((s, i) => {
    const best = state.qa[s.id];
    return `
      <button class="list-item" type="button" data-qa="${i}">
        <span class="list-num">${i + 1}</span>
        <span class="list-body">
          <h3>${esc(s.name)} <span class="muted">— ${esc(s.title)}</span></h3>
          <p>${esc(s.desc)} ・ ${s.items.length}問</p>
        </span>
        <span class="list-best">${best ? "★".repeat(best) + "☆".repeat(3 - best) : "NEW"}</span>
      </button>`;
  }).join("");
}
$("qaList").addEventListener("click", e => {
  const el = e.target.closest("[data-qa]");
  if (!el) return;
  go("qa");
  qa = { set: QA_SETS[+el.dataset.qa], idx: 0, rates: [], xp: 0 };
  showQa();
});

function showQa() {
  const { set, idx } = qa;
  const item = set.items[idx];
  $("qaProgress").textContent = `${idx + 1} / ${set.items.length}`;
  $("qaSteps").innerHTML = set.items.map((_, i) => `<span class="${i < idx ? "done" : i === idx ? "now" : ""}"></span>`).join("");
  $("qaText").textContent = item.q;
  $("qaText").hidden = true;
  $("qaHiddenNote").hidden = false;
  $("qaJa").hidden = true;
  $("qaJa").textContent = item.ja;
  $("qaReveal").textContent = "👀 質問文を見る";
  $("qaTip").innerHTML = `<b>💡 答え方のヒント</b> ${esc(item.tip)}`;
  $("qaResult").hidden = true;
  $("qaAnswerCard").hidden = false;
  recorder($("qaRec"), {
    label: "🎙 答える",
    onDone: (text, sec, typedIn) => showQaResult(text, sec, typedIn),
    skip: { label: "答えが浮かばない → お手本を見る", onSkip: () => showQaResult("", 0, true) }
  });
  playQa();
}
function playQa() {
  speak(qa.set.items[qa.idx].q, $("qaSlow").checked ? 0.75 : 0.95);
}
$("qaPlay").addEventListener("click", playQa);
$("qaReveal").addEventListener("click", () => {
  const show = $("qaText").hidden;
  $("qaText").hidden = !show;
  $("qaHiddenNote").hidden = show;
  $("qaJa").hidden = !show;
  $("qaReveal").textContent = show ? "🙈 隠す" : "👀 質問文を見る";
});

function showQaResult(text, sec, typedIn) {
  const item = qa.set.items[qa.idx];
  qa.answer = text;
  $("qaAnswerCard").hidden = true;
  $("qaText").hidden = false;
  $("qaHiddenNote").hidden = true;
  $("qaJa").hidden = false;

  $("qaStats").innerHTML = text ? statsHtml(text, typedIn ? 0 : sec) : `<p class="muted small">今回はお手本を見て、声に出してまねしてみよう（シャドーイング）。</p>`;
  const used = item.phrases.filter(p => text && usedPhrase(text, p));
  qa.phraseHits = used.length;
  $("qaPhrases").innerHTML = `
    <p class="small"><b>使えた「型」フレーズ</b> ${used.length} / ${item.phrases.length}</p>
    <div class="chips">${item.phrases.map(p => `<span class="${used.includes(p) ? "on" : ""}">${used.includes(p) ? "✓ " : ""}${esc(p)}</span>`).join("")}</div>`;
  $("qaModelEn").textContent = item.model;
  $("qaModelJa").textContent = item.modelJa;
  $("qaAiBox").hidden = true;
  $("qaAskAi").hidden = !getKey() || !text;
  $("qaResult").hidden = false;
  $("qaResult").scrollIntoView({ behavior: "smooth", block: "start" });
}
$("qaModelPlay").addEventListener("click", () => speak(qa.set.items[qa.idx].model, 0.9));
$("qaModelSave").addEventListener("click", () => {
  const it = qa.set.items[qa.idx];
  savePhrase(it.model, it.modelJa);
});
$("qaRetry").addEventListener("click", () => {
  $("qaResult").hidden = true;
  $("qaAnswerCard").hidden = false;
  recorder($("qaRec"), { label: "🎙 もう一回答える", onDone: showQaResult });
  $("qaRec").scrollIntoView({ behavior: "smooth", block: "center" });
});
$("qaAskAi").addEventListener("click", () => {
  const item = qa.set.items[qa.idx];
  askCoach($("qaAiBox"), $("qaAskAi"), `Situation: the learner just gave a presentation proposing a social media campaign for a new product to a client. A client asked: "${item.q}"`, qa.answer);
});

document.querySelector("#qaResult .self-rate").addEventListener("click", e => {
  const b = e.target.closest("[data-qa-rate]");
  if (!b) return;
  const rate = +b.dataset.qaRate;
  const words = qa.answer ? wordCount(qa.answer) : 0;
  const gain = 5 + Math.min(words, 60) / 3 + qa.phraseHits * 3 + rate * 2;
  qa.rates.push(rate);
  qa.xp += gain;
  addXp(gain);
  if (qa.idx < qa.set.items.length - 1) {
    qa.idx++;
    showQa();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const avg = Math.round(qa.rates.reduce((a, b) => a + b, 0) / qa.rates.length);
  state.qa[qa.set.id] = Math.max(state.qa[qa.set.id] || 0, avg);
  finishSet();
  const set = qa.set;
  showSummary({
    title: `${set.name} クリア！`,
    xp: qa.xp,
    text: avg >= 3 ? "堂々と答えられてます。次は質問文を見ずに挑戦！" : avg >= 2 ? "答えの型が身についてきました。お手本を1回まねしてからもう一周すると効果大。" : "最初は誰でも詰まります。お手本を声に出してまねするだけでも、次は口が動くはず。",
    again: () => { go("qa"); qa = { set, idx: 0, rates: [], xp: 0 }; showQa(); }
  });
});

// ============ Role Play ============
let rp = null;   // { sc, node, xp, spoken }

function renderRpList() {
  $("rpList").innerHTML = ROLEPLAYS.map((r, i) => `
    <button class="list-item" type="button" data-rp="${i}">
      <span class="list-num emoji">${r.icon}</span>
      <span class="list-body">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.desc)} ・ 相手: ${esc(r.partner)}</p>
      </span>
      <span class="list-best small">${state.rp[r.id] ? `${state.rp[r.id]}回クリア` : "NEW"}</span>
    </button>`).join("");
}
$("rpList").addEventListener("click", e => {
  const el = e.target.closest("[data-rp]");
  if (el) startRp(+el.dataset.rp);
});

function startRp(i) {
  go("rp");
  const sc = ROLEPLAYS[i];
  rp = { i, sc, node: sc.start, xp: 0, spoken: 0, turns: 0 };
  $("rpChat").innerHTML = "";
  rpTurn();
}

function addBubble(chat, who, html) {
  const row = document.createElement("div");
  row.className = `msg ${who}`;
  row.innerHTML = html;
  chat.appendChild(row);
  row.scrollIntoView({ behavior: "smooth", block: "end" });
  return row;
}

function rpTurn() {
  const n = rp.sc.nodes[rp.node];
  const row = addBubble($("rpChat"), "them", `
    <span class="avatar">${rp.sc.icon}</span>
    <div class="bubble them">
      <p class="who">${esc(rp.sc.partner)}</p>
      <p>${esc(n.them)}</p>
      <p class="ja" hidden>${esc(n.ja)}</p>
      <div class="bubble-tools"><button type="button" class="mini" data-act="play">🔊</button><button type="button" class="mini" data-act="ja">訳</button></div>
    </div>`);
  row.addEventListener("click", e => {
    const a = e.target.closest("[data-act]")?.dataset.act;
    if (a === "play") speak(n.them);
    if (a === "ja") row.querySelector(".ja").hidden = !row.querySelector(".ja").hidden;
  });
  speak(n.them);
  renderReplies();
}

function renderReplies() {
  const n = rp.sc.nodes[rp.node];
  const hide = $("rpHide").checked;
  $("rpReplies").innerHTML = n.replies.map((r, i) => `
    <button type="button" class="reply" data-reply="${i}">
      ${hide ? "" : `<span class="en">${esc(r.en)}</span>`}
      <span class="ja">${esc(r.ja)}</span>
    </button>`).join("");
  $("rpHint").textContent = hide ? "日本語の意味を、自分の英語で言ってみよう" : "どれかを声に出して言ってみよう（タップでも選べます）";
  recorder($("rpRec"), { label: "🎙 返事する", onDone: rpHeard });
}
$("rpHide").addEventListener("change", () => { if (rp) renderReplies(); });
$("rpReplies").addEventListener("click", e => {
  const b = e.target.closest("[data-reply]");
  if (b) rpChoose(+b.dataset.reply, null, 0);
});

function rpHeard(text) {
  const n = rp.sc.nodes[rp.node];
  // 候補に対して、言えた単語の割合が一番高いものを採用
  const best = n.replies.map((r, i) => ({ i, ...compare(r.en, text) })).sort((a, b) => b.score - a.score)[0];
  const hide = $("rpHide").checked;
  if (best.score < (hide ? 25 : 40)) {
    toast("候補の返事に近い英語が聞き取れなかった…もう一度！");
    $("rpRec").querySelector(".live").textContent = `「${text}」と聞こえました`;
    return;
  }
  rpChoose(best.i, text, best.score);
}

function rpChoose(i, spokenText, score) {
  stopRec();
  const n = rp.sc.nodes[rp.node];
  const r = n.replies[i];
  const hide = $("rpHide").checked;
  rp.turns++;
  if (spokenText) {
    rp.spoken++;
    rp.xp += (6 + score / 20) * (hide ? 2 : 1);
  } else {
    rp.xp += 1;
  }
  addBubble($("rpChat"), "me", `
    <div class="bubble me">
      <p>${esc(spokenText || r.en)}</p>
      ${spokenText && score < 90 ? `<p class="model-line">お手本: ${esc(r.en)}</p>` : ""}
      ${spokenText ? `<p class="score-tag">${score >= 90 ? "Perfect!" : score >= 70 ? "Nice!" : "OK!"}</p>` : `<p class="score-tag muted">タップで選択</p>`}
    </div>`);
  if (r.next === null) {
    $("rpReplies").innerHTML = "";
    $("rpRec").innerHTML = "";
    setTimeout(endRp, 900);
    return;
  }
  rp.node = r.next;
  $("rpReplies").innerHTML = "";
  setTimeout(rpTurn, 700);
}

function endRp() {
  const sc = rp.sc, i = rp.i;
  state.rp[sc.id] = (state.rp[sc.id] || 0) + 1;
  finishSet();
  const gain = rp.xp + 10;
  addXp(gain, true);
  showSummary({
    title: `${sc.title} 完了！`,
    xp: gain,
    text: rp.spoken === rp.turns ? "全部自分の声で返せました！次は「候補を日本語だけ」にして挑戦してみよう。" : `${rp.turns}回中 ${rp.spoken}回 声で返事できました。次は全部声で！`,
    again: () => startRp(i)
  });
}

// ============ Quick Fire ============
let qf = null;      // { set, items, idx, combo, maxCombo, scores, xp }
let qfTimer = null;
const QF_SEC = 5;

function renderQuickList() {
  $("quickList").innerHTML = QUICK_SETS.map((s, i) => {
    const best = state.quick[s.id];
    return `
      <button class="list-item" type="button" data-qf="${i}">
        <span class="list-num">⚡</span>
        <span class="list-body"><h3>${esc(s.title)}</h3><p>${s.items.length}文 ・ ${esc(s.items[0].ja)} など</p></span>
        <span class="list-best small">${best === undefined ? "NEW" : `最高 ${best}%`}</span>
      </button>`;
  }).join("");
}
$("quickList").addEventListener("click", e => {
  const el = e.target.closest("[data-qf]");
  if (el) startQuick(+el.dataset.qf);
});

function startQuick(i) {
  go("quick");
  const set = QUICK_SETS[i];
  qf = { i, set, items: shuffle(set.items), idx: 0, combo: 0, maxCombo: 0, scores: [], xp: 0 };
  showQuick();
}

function stopQuickTimer() { clearInterval(qfTimer); qfTimer = null; }

function showQuick() {
  const item = qf.items[qf.idx];
  $("quickSteps").innerHTML = qf.items.map((_, i) => `<span class="${i < qf.idx ? "done" : i === qf.idx ? "now" : ""}"></span>`).join("");
  $("combo").textContent = qf.combo >= 2 ? `🔥 ${qf.combo} combo` : "";
  $("quickJa").textContent = item.ja;
  $("quickEn").hidden = true;
  $("quickLive").textContent = "";
  $("quickActions").innerHTML = `<div class="rec" id="quickRec"></div>`;
  const started = Date.now();
  recorder($("quickRec"), {
    short: true,
    label: "🎙 言う",
    onDone: (text, sec, typedIn) => quickResult(text, (Date.now() - started) / 1000 - (typedIn ? 0 : sec)),
    skip: { label: "わからない → 答えを見る", onSkip: () => quickResult("", 99) }
  });
  // 5秒のカウントダウン（過ぎても答えられるが、コンボは切れる）
  let left = QF_SEC;
  const fg = $("qCountFg");
  $("qCount").classList.remove("over");
  $("qCountNum").textContent = left;
  fg.style.strokeDashoffset = 0;
  stopQuickTimer();
  qfTimer = setInterval(() => {
    left -= 0.1;
    fg.style.strokeDashoffset = `${(1 - Math.max(left, 0) / QF_SEC) * 126}`;
    $("qCountNum").textContent = Math.max(0, Math.ceil(left));
    if (left <= 0) { stopQuickTimer(); $("qCount").classList.add("over"); }
  }, 100);
}

function quickResult(text, thinkSec) {
  stopQuickTimer();
  const item = qf.items[qf.idx];
  const { score, hits } = text ? compare(item.en, text) : { score: 0, hits: new Set() };
  const inTime = thinkSec <= QF_SEC + 0.5;
  const good = score >= 70 && inTime;
  qf.combo = good ? qf.combo + 1 : 0;
  qf.maxCombo = Math.max(qf.maxCombo, qf.combo);
  qf.scores.push(score);
  const gain = score / 10 + (good ? Math.min(qf.combo, 5) * 2 : 0);
  qf.xp += gain;
  $("combo").textContent = qf.combo >= 2 ? `🔥 ${qf.combo} combo` : "";
  $("quickEn").hidden = false;
  $("quickEn").innerHTML = text ? diffHtml(item.en, hits) : esc(item.en);
  $("quickLive").innerHTML = text ? `<span class="muted">あなた:</span> ${esc(text)}` : "";
  $("quickActions").innerHTML = `
    <p class="q-score ${good ? "good" : ""}">${text ? `${score}%` : "—"} ${good ? (qf.combo >= 3 ? "🔥 Combo!" : "⭕") : !inTime && text ? "⏱ 時間オーバー" : ""}</p>
    <div class="score-actions">
      <button class="btn" type="button" id="qfPlay">🔊 お手本</button>
      <button class="btn" type="button" id="qfSave">☆保存</button>
      <button class="btn" type="button" id="qfRetry">もう一回</button>
      <button class="btn primary" type="button" id="qfNext">${qf.idx === qf.items.length - 1 ? "結果へ →" : "次へ →"}</button>
    </div>`;
  speak(item.en);
  $("qfPlay").onclick = () => speak(item.en);
  $("qfSave").onclick = () => savePhrase(item.en, item.ja);
  $("qfRetry").onclick = () => {
    qf.scores.pop();
    qf.xp -= gain;
    $("quickActions").innerHTML = `<div class="rec" id="quickRec"></div>`;
    recorder($("quickRec"), { short: true, label: "🎙 もう一回言う", onDone: t => quickResult(t, 0) });
  };
  $("qfNext").onclick = () => {
    if (qf.idx < qf.items.length - 1) { qf.idx++; showQuick(); return; }
    endQuick();
  };
}

function endQuick() {
  const avg = Math.round(qf.scores.reduce((a, b) => a + b, 0) / qf.scores.length);
  const { set, i } = qf;
  state.quick[set.id] = Math.max(state.quick[set.id] ?? 0, avg);
  finishSet();
  const gain = qf.xp + 5;
  addXp(gain, true);
  showSummary({
    title: `${set.title}`,
    xp: gain,
    text: `平均 ${avg}% ・ 最大 ${qf.maxCombo} コンボ。${avg >= 80 ? "反射で言えるレベル！" : "できなかった文は☆保存して、明日もう一回。"}`,
    again: () => startQuick(i)
  });
}

// ============ Stories ============
let story = null;   // { s, answered, correct, talk }

function renderStoryList() {
  $("storyList").innerHTML = STORIES.map((s, i) => `
    <button class="story-card" type="button" data-story="${i}">
      <span class="story-emoji">${s.emoji}</span>
      <span class="story-genre">${esc(s.genre)} ・ ${esc(s.level)}</span>
      <h3>${esc(s.title)}</h3>
      <span class="story-done">${state.story[s.id] ? "✓ 読了" : ""}</span>
    </button>`).join("");
}
$("storyList").addEventListener("click", e => {
  const el = e.target.closest("[data-story]");
  if (el) openStory(+el.dataset.story);
});

function openStory(i) {
  go("story");
  const s = STORIES[i];
  story = { i, s, answered: 0, correct: 0, talk: "" };
  $("storyMeta2").textContent = `${s.emoji} ${s.genre} ・ ${s.level}`;
  $("storyTitle").textContent = s.title;

  // 単語帳の語句を（最初の1回だけ）タップできるボタンにする
  let html = esc(s.text);
  s.glossary.forEach((g, gi) => {
    const re = new RegExp(`\\b(${g.w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "i");
    html = html.replace(re, `\u0000${gi}\u0001$1\u0002`);
  });
  html = html.replace(/\u0000(\d+)\u0001(.*?)\u0002/g, (_, gi, w) => `<button type="button" class="gl" data-g="${gi}">${w}</button>`);
  $("storyText").innerHTML = html.split("\n\n").map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");

  $("storyQs").innerHTML = s.questions.map((q, qi) => `
    <div class="sq" data-q="${qi}">
      <p class="sq-q">Q${qi + 1}. ${esc(q.q)}</p>
      ${q.choices.map((c, ci) => `<button type="button" class="choice" data-c="${ci}">${esc(c)}</button>`).join("")}
    </div>`).join("");
  $("storyTalk").hidden = true;
  $("storyTalkResult").hidden = true;
}

$("storyText").addEventListener("click", e => {
  const b = e.target.closest(".gl");
  if (!b) return;
  e.stopPropagation();
  showPopover(b, story.s.glossary[+b.dataset.g]);
});

$("storyQs").addEventListener("click", e => {
  const b = e.target.closest(".choice");
  if (!b) return;
  const box = b.closest(".sq");
  if (box.classList.contains("done")) return;
  const q = story.s.questions[+box.dataset.q];
  const ok = +b.dataset.c === q.a;
  box.classList.add("done");
  box.querySelectorAll(".choice").forEach((c, ci) => {
    if (ci === q.a) c.classList.add("ok");
    else if (c === b) c.classList.add("ng");
  });
  story.answered++;
  if (ok) story.correct++;
  if (story.answered === story.s.questions.length) openStoryTalk();
});

let storyRate = 0.9;
$("storyListen").addEventListener("click", () => {
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); $("storyListen").textContent = "🔊 読み上げ"; return; }
  speak(story.s.text.replace(/\n+/g, " "), storyRate, () => { $("storyListen").textContent = "🔊 読み上げ"; });
  $("storyListen").textContent = "■ 止める";
});

function openStoryTalk() {
  const t = story.s.talk;
  $("talkQ").textContent = t.q;
  $("talkJa").textContent = t.ja;
  $("storyTalk").hidden = false;
  $("storySample").textContent = t.sample;
  $("storyAiBox").hidden = true;
  recorder($("storyRec"), {
    label: "🎙 自分の話をする",
    onDone: (text, sec, typedIn) => {
      story.talk = text;
      $("storyStats").innerHTML = statsHtml(text, typedIn ? 0 : sec);
      $("storyTalkResult").hidden = false;
      $("storyAskAi").hidden = !getKey();
    },
    skip: { label: "回答例を先に見る", onSkip: () => { $("storyStats").innerHTML = ""; $("storyTalkResult").hidden = false; $("storyAskAi").hidden = true; } }
  });
  setTimeout(() => $("storyTalk").scrollIntoView({ behavior: "smooth", block: "start" }), 300);
  speak(t.q);
}
$("storySamplePlay").addEventListener("click", () => speak(story.s.talk.sample, 0.9));
$("storySampleSave").addEventListener("click", () => savePhrase(story.s.talk.sample));
$("storyAskAi").addEventListener("click", () => {
  askCoach($("storyAiBox"), $("storyAskAi"), `The learner read a short text titled "${story.s.title}" and was asked: "${story.s.talk.q}"`, story.talk);
});
$("storyDone").addEventListener("click", () => {
  const { s, i } = story;
  const words = story.talk ? wordCount(story.talk) : 0;
  const gain = 10 + story.correct * 5 + Math.min(words, 80) / 2;
  state.story[s.id] = true;
  finishSet();
  addXp(gain, true);
  showSummary({
    title: `${s.title}`,
    xp: gain,
    text: `クイズ ${story.correct} / ${s.questions.length} 正解${words ? ` ・ ${words} words 話しました` : ""}。読んだ英語を「自分の話」に変えるのが、会話力の近道です。`,
    again: () => openStory(i)
  });
});

// ============ popover ============
let popItem = null;
function showPopover(anchor, item) {
  popItem = item;
  $("popWord").textContent = item.w;
  $("popJa").textContent = item.ja;
  const pop = $("popover");
  pop.hidden = false;
  const r = anchor.getBoundingClientRect();
  const w = pop.offsetWidth;
  pop.style.left = `${Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
  pop.style.top = `${r.bottom + window.scrollY + 8}px`;
  speak(item.w, 0.85);
}
function hidePopover() { $("popover").hidden = true; }
$("popSpeak").addEventListener("click", () => popItem && speak(popItem.w, 0.85));
$("popSave").addEventListener("click", () => { if (popItem) savePhrase(popItem.w, popItem.ja); hidePopover(); });
document.addEventListener("click", e => { if (!e.target.closest("#popover") && !e.target.closest(".gl")) hidePopover(); });

// ============ summary ============
let summaryAgain = null;
function showSummary({ title, xp, text, again, extraHtml = "" }) {
  go("summary");
  $("summaryTitle").textContent = title;
  $("summaryXp").textContent = Math.round(xp);
  $("summaryText").textContent = text;
  $("summaryExtra").innerHTML = extraHtml;
  summaryAgain = again;
  $("summaryAgain").hidden = !again;
}
$("summaryAgain").addEventListener("click", () => summaryAgain && summaryAgain());

// ============ Claude API (optional) ============
// 静的サイトなのでサーバーは持たず、利用者自身のAPIキーでブラウザから直接呼ぶ
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
      output_config: { effort: "low" },
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
const isEmpty = v => !v || /^[-–—]?\s*$/.test(v) || /^none\.?$/i.test(v);

const COACH_SYSTEM = `You are a warm, practical English speaking coach for a Japanese business person (around CEFR B1) who wants to handle presentation Q&A and conversations in English.
The learner's answer comes from speech recognition, so ignore missing punctuation, capitalization and obvious recognition slips.
Reply in exactly this format and nothing else:
GOOD: <one sentence in Japanese praising something specific they did well>
BETTER: <a natural spoken English version of their answer, keeping their ideas and roughly their length, using simple words>
POINT: <one or two short sentences in Japanese: the single most useful improvement, quoting the key English phrase>`;

async function askCoach(box, btn, context, answer) {
  box.hidden = false;
  box.innerHTML = `<p class="muted small">🤖 添削中…</p>`;
  btn.disabled = true;
  try {
    const text = await claude({ system: COACH_SYSTEM, messages: [{ role: "user", content: `${context}\n\nThe learner answered (speech transcript):\n"${answer}"` }] });
    const p = parseTagged(text, ["GOOD", "BETTER", "POINT"]);
    box.innerHTML = `
      <h4>🤖 AIコーチ</h4>
      ${p.GOOD ? `<p class="fb-good">👍 ${esc(p.GOOD)}</p>` : ""}
      ${p.BETTER ? `<div class="fb-better"><p class="muted small">こう言うともっと自然</p><p class="model-en">${esc(p.BETTER)}</p>
        <div><button type="button" class="mini" data-fb="play">🔊</button><button type="button" class="mini" data-fb="save">☆保存</button></div></div>` : ""}
      ${p.POINT ? `<p class="fb-point">💡 ${esc(p.POINT)}</p>` : ""}`;
    box.onclick = e => {
      const a = e.target.closest("[data-fb]")?.dataset.fb;
      if (a === "play") speak(p.BETTER, 0.9);
      if (a === "save") savePhrase(p.BETTER);
    };
    addXp(3, true);
  } catch (e) {
    box.innerHTML = `<p class="err">${esc(e.message)}</p>`;
  } finally {
    btn.disabled = false;
  }
}

// ============ AI Talk ============
let ai = null;   // { mode, system, messages: [], label, spokenTurns, words, busy }

function renderAiSetup() {
  const key = getKey();
  $("keyStatus").textContent = key ? `✅ 保存済み（…${key.slice(-4)}）` : "キーは console.anthropic.com で発行できます。";
  $("keyDelete").hidden = !key;
  $("apiKey").value = "";
  $("aiModes").classList.toggle("locked", !key);
  $("aiTopics").innerHTML = AI_TOPICS.map((t, i) => `<button type="button" class="chip-btn" data-topic="${i}">${esc(t.label)}</button>`).join("");
}
$("keySave").addEventListener("click", () => {
  const v = $("apiKey").value.trim();
  if (!/^sk-ant-/.test(v)) { toast("sk-ant- で始まるキーを入れてください"); return; }
  try { localStorage.setItem(KEY_STORE, v); } catch (e) { toast("保存できませんでした"); return; }
  toast("🔑 保存しました");
  renderAiSetup();
});
$("keyDelete").addEventListener("click", () => {
  try { localStorage.removeItem(KEY_STORE); } catch (e) { /* storage unavailable */ }
  toast("キーを削除しました");
  renderAiSetup();
});

const TALK_FORMAT = `Keep the conversation going naturally. Use simple, clear spoken English (CEFR B1). Each reply: 1-3 short sentences, and usually end with ONE question.
Reply in exactly this format and nothing else:
REPLY: <what you say next, in English>
FIX: <if the learner's last message had a grammar mistake or sounded unnatural, a natural version of it in English; otherwise ->
TIP: <if FIX is not -, one short sentence in Japanese explaining the fix; otherwise ->
The learner's messages come from speech recognition, so ignore punctuation, capitalization and obvious recognition slips. For your very first message, FIX and TIP are -.`;

$("aiStartPres").addEventListener("click", () => {
  if (!getKey()) { toast("先にAPIキーを保存してください"); return; }
  const pres = $("aiPres").value.trim();
  if (pres.length < 10) { toast("プレゼンの内容をもう少し書いてください"); return; }
  const tough = $("aiTough").checked;
  startAi({
    mode: "pres",
    label: "🎤 質疑リハーサル",
    system: `You are role-playing an audience member (a client) at the end of the learner's business presentation. Here is what the presentation was about (it may be written in Japanese):
<presentation>
${pres}
</presentation>
Ask realistic Q&A questions about it, one at a time. ${tough ? "Include challenging questions: doubts about budget, risks, evidence and competitors." : "Mix easy and medium questions."} After each answer, react briefly like a real client (one short sentence), then ask a follow-up or a new question. Stay in character.
${TALK_FORMAT}`
  });
});
$("aiTopics").addEventListener("click", e => {
  const b = e.target.closest("[data-topic]");
  if (!b) return;
  if (!getKey()) { toast("先にAPIキーを保存してください"); return; }
  const t = AI_TOPICS[+b.dataset.topic];
  startAi({
    mode: "free",
    label: `☕ ${t.label}`,
    system: `You are Alex, a friendly colleague from an overseas office, chatting casually with the learner during a coffee break. Topic to start with: ${t.en}. Show interest in the learner, share small things about yourself too, and let the topic drift naturally.
${TALK_FORMAT}`
  });
});

function startAi({ mode, label, system }) {
  go("ai");
  ai = { mode, label, system, messages: [{ role: "user", content: "(The conversation starts now. Please say the first line.)" }], spokenTurns: 0, words: 0, busy: false, fixes: [] };
  $("aiLabel").textContent = label;
  $("aiChat").innerHTML = "";
  recorder($("aiRec"), { label: "🎙 話す", onDone: (text, sec, typedIn) => aiSend(text, !typedIn) });
  aiNext();
}

async function aiNext() {
  ai.busy = true;
  const thinking = addBubble($("aiChat"), "them", `<span class="avatar">🤖</span><div class="bubble them typing"><span></span><span></span><span></span></div>`);
  const session = ai;
  try {
    const text = await claude({ system: ai.system, messages: ai.messages });
    if (ai !== session) return;
    thinking.remove();
    ai.messages.push({ role: "assistant", content: text });
    const p = parseTagged(text, ["REPLY", "FIX", "TIP"]);
    const reply = p.REPLY || text;
    // 直前の自分の発言に添削を付ける
    const mine = [...$("aiChat").querySelectorAll(".msg.me")].pop();
    if (mine && !isEmpty(p.FIX)) {
      ai.fixes.push({ fix: p.FIX, tip: isEmpty(p.TIP) ? "" : p.TIP });
      const fb = document.createElement("div");
      fb.className = "fix";
      fb.innerHTML = `<p>✏️ ${esc(p.FIX)}</p>${isEmpty(p.TIP) ? "" : `<p class="muted small">${esc(p.TIP)}</p>`}
        <div><button type="button" class="mini" data-f="play">🔊</button><button type="button" class="mini" data-f="save">☆保存</button></div>`;
      fb.addEventListener("click", e => {
        const a = e.target.closest("[data-f]")?.dataset.f;
        if (a === "play") speak(p.FIX, 0.9);
        if (a === "save") savePhrase(p.FIX, isEmpty(p.TIP) ? "" : p.TIP);
      });
      mine.querySelector(".bubble").appendChild(fb);
    } else if (mine) {
      mine.querySelector(".bubble").insertAdjacentHTML("beforeend", `<p class="score-tag">👍 Natural!</p>`);
    }
    const row = addBubble($("aiChat"), "them", `<span class="avatar">🤖</span><div class="bubble them"><p>${esc(reply)}</p><div class="bubble-tools"><button type="button" class="mini" data-act="play">🔊</button></div></div>`);
    row.addEventListener("click", e => { if (e.target.closest("[data-act=play]")) speak(reply); });
    speak(reply);
  } catch (e) {
    if (ai !== session) return;
    thinking.remove();
    // 履歴はそのまま残し、再送できるようにする
    const row = addBubble($("aiChat"), "sys", `<p class="err">${esc(e.message)}</p><button type="button" class="mini">↻ 再送信</button>`);
    row.querySelector("button").addEventListener("click", () => { row.remove(); if (!ai.busy) aiNext(); });
  } finally {
    if (ai === session) ai.busy = false;
  }
}

function aiSend(text, spoken) {
  if (!ai || ai.busy) { toast("AIの返事を待ってね"); return; }
  if (spoken) { ai.spokenTurns++; ai.words += wordCount(text); }
  addBubble($("aiChat"), "me", `<div class="bubble me"><p>${esc(text)}</p></div>`);
  $("aiChat").querySelectorAll(".msg.sys").forEach(r => r.remove());
  // 送信に失敗した発言が残っていれば、同じユーザーターンにまとめる
  const last = ai.messages[ai.messages.length - 1];
  if (last.role === "user") last.content += `\n${text}`;
  else ai.messages.push({ role: "user", content: text });
  aiNext();
}
$("aiTypeForm").addEventListener("submit", e => {
  e.preventDefault();
  const v = $("aiTyped").value.trim();
  if (!v) return;
  $("aiTyped").value = "";
  aiSend(v, false);
});

$("aiFinish").addEventListener("click", async () => {
  if (!ai) return;
  const s = ai;
  const turns = s.messages.filter(m => m.role === "user").length - 1;
  stopRec();
  if (turns < 1) { go("ai-setup"); return; }
  state.ai++;
  finishSet();
  const gain = 10 + s.spokenTurns * 6 + Math.min(s.words, 200) / 4;
  addXp(gain, true);
  ai = null;
  showSummary({
    title: s.mode === "pres" ? "質疑リハーサル終了！" : "おしゃべり終了！",
    xp: gain,
    text: `${turns}回やりとりしました${s.spokenTurns ? `（声で ${s.spokenTurns}回・${s.words} words）` : ""}。`,
    extraHtml: `<div class="ai-feedback"><p class="muted small">🤖 ふりかえりを作成中…</p></div>`,
    again: () => startAi(s)
  });
  const transcript = s.messages.slice(1).map(m => `${m.role === "user" ? "Learner" : "Partner"}: ${m.role === "assistant" ? (parseTagged(m.content, ["REPLY", "FIX", "TIP"]).REPLY || m.content) : m.content}`).join("\n");
  const box = $("summaryExtra").querySelector(".ai-feedback");
  try {
    const fb = await claude({
      system: `You are an English speaking coach for a Japanese business person (around CEFR B1). Write in Japanese, friendly and concrete, under 250 Japanese characters plus phrases. Format exactly:
GOOD: <what they did well>
NEXT: <the one thing to work on next>
PHRASES: <3 useful English phrases for this kind of conversation, separated by " / ">`,
      messages: [{ role: "user", content: `${s.mode === "pres" ? "This was a presentation Q&A rehearsal." : "This was casual small talk."}\n\n${transcript}` }]
    });
    const p = parseTagged(fb, ["GOOD", "NEXT", "PHRASES"]);
    const phrases = (p.PHRASES || "").split(" / ").map(x => x.trim()).filter(Boolean);
    box.innerHTML = `
      <h4>🤖 ふりかえり</h4>
      ${p.GOOD ? `<p class="fb-good">👍 ${esc(p.GOOD)}</p>` : ""}
      ${p.NEXT ? `<p class="fb-point">💡 ${esc(p.NEXT)}</p>` : ""}
      ${phrases.length ? `<p class="muted small">次に使いたいフレーズ（タップで保存）</p><div class="chips">${phrases.map((x, i) => `<button type="button" class="chip-btn" data-ph="${i}">☆ ${esc(x)}</button>`).join("")}</div>` : ""}
      ${!p.GOOD && !p.NEXT ? `<p>${esc(fb)}</p>` : ""}`;
    box.onclick = e => {
      const b = e.target.closest("[data-ph]");
      if (b) { savePhrase(phrases[+b.dataset.ph]); speak(phrases[+b.dataset.ph]); }
    };
  } catch (e) {
    box.innerHTML = `<p class="err">${esc(e.message)}</p>`;
  }
});

// ============ init ============
renderHome();
