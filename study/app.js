// ============ storage ============
const STORE_KEY = "english-study";
const DAILY_GOAL = 5;
const RANKS = ["Starter", "Beginner", "Explorer", "Challenger", "Runner", "Climber", "Achiever", "Advanced", "Expert", "800 Master"];

function loadState() {
  const base = { xp: 0, streak: 0, lastDay: "", today: { date: "", count: 0 }, reading: {}, shadow: {}, words: [], log: {}, bestStreak: 0,
    stats: { rType: {}, sPart: {}, missed: {} }, memo: {}, goal: { text: "", exam: "" } };
  try {
    return Object.assign(base, JSON.parse(localStorage.getItem(STORE_KEY) || localStorage.getItem("road745")) || {});
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

// 日ごとの学習記録 { sec: 学習秒数, rq: 解いた問題数, rc: 正解数, ss: シャドーイング回数, xp }
function todayLog() {
  const k = dayKey();
  return (state.log[k] ||= { sec: 0, rq: 0, rc: 0, ss: 0, xp: 0 });
}

// 1セット終えるごとに呼ぶ: 連続日数と今日のゴールを更新
function recordActivity() {
  const today = dayKey();
  if (state.lastDay !== today) {
    state.streak = state.lastDay === dayKey(-1) ? state.streak + 1 : 1;
    state.lastDay = today;
  }
  state.bestStreak = Math.max(state.bestStreak, state.streak);
  if (state.today.date !== today) state.today = { date: today, count: 0 };
  state.today.count++;
  saveState();
  if (state.today.count === DAILY_GOAL) toast("🎉 今日のゴール達成！");
}

function addXp(n) {
  if (n <= 0) return;
  const before = levelInfo().level;
  state.xp += n;
  todayLog().xp += n;
  saveState();
  const after = levelInfo().level;
  toast(after > before ? `⬆ Level Up! Lv.${after}` : `+${n} XP`);
  renderHeader();
}

// Lv.n → n+1 に必要なXP: 100 + (n-1)*50
function levelInfo() {
  let level = 1, need = 100, rest = state.xp;
  while (rest >= need) { rest -= need; level++; need = 100 + (level - 1) * 50; }
  return { level, now: rest, need };
}

// ============ helpers ============
const $ = id => document.getElementById(id);
const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const starStr = n => "★".repeat(n) + "☆".repeat(3 - n);

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
}

// ============ router ============
let currentView = "home";
function go(name) {
  stopTimer();
  stopListening();
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  hidePopover();
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  window.scrollTo(0, 0);
  if (name === "home") renderHome();
  if (name === "reading-list") renderPassageList();
  if (name === "shadow-list") renderSetList();
  if (name === "dashboard") { calSelected = dayKey(); renderDashboard(); }
  currentView = name;
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
  $("rankTitle").textContent = `Lv.${level} ${RANKS[Math.min(level, RANKS.length) - 1]}`;
  $("xpNow").textContent = now;
  $("xpNext").textContent = need;
  requestAnimationFrame(() => { $("xpFill").style.width = `${(now / need) * 100}%`; });

  const count = state.today.date === dayKey() ? state.today.count : 0;
  $("goalCount").textContent = Math.min(count, DAILY_GOAL);
  $("goalDots").innerHTML = Array.from({ length: DAILY_GOAL }, (_, i) =>
    `<span class="${i < count ? "done" : ""}">${i < count ? "✓" : ""}</span>`).join("");

  const readDone = PASSAGES.filter(p => state.reading[p.id] !== undefined).length;
  $("readingMeta").textContent = `${readDone} / ${PASSAGES.length} クリア`;
  const shadowDone = SHADOW_SETS.filter(s => state.shadow[s.id] !== undefined).length;
  $("shadowMeta").textContent = `${shadowDone} / ${SHADOW_SETS.length} セット挑戦済み`;

  $("weekMini").textContent = weekSummary();
  renderGoal();
  $("cheer").textContent = insights()[0].text;
  renderWords();
}

function renderWords() {
  $("wordCount").textContent = `${state.words.length}語`;
  $("wordEmpty").hidden = state.words.length > 0;
  $("wordList").innerHTML = state.words.map((w, i) => `
    <li><b>${esc(w.w)}</b> ${esc(w.ja)}
      <button type="button" data-speak="${esc(w.w)}" aria-label="発音を聞く">🔊</button>
      <button type="button" data-del="${i}" aria-label="削除">×</button>
    </li>`).join("");
}
$("wordList").addEventListener("click", e => {
  const sp = e.target.closest("[data-speak]");
  const del = e.target.closest("[data-del]");
  if (sp) speak(sp.dataset.speak, 0.85);
  if (del) { state.words.splice(+del.dataset.del, 1); saveState(); renderWords(); }
});

// ============ reading ============
let current = null;      // 表示中のパッセージ
let picks = [];          // 各問の選択肢
let elapsed = 0;
let timerId = null;
let submitted = false;

function renderPassageList() {
  $("passageList").innerHTML = PASSAGES.map((p, i) => {
    const best = state.reading[p.id];
    return `
      <button class="list-item" type="button" data-passage="${i}">
        <span class="list-num">${String(i + 1).padStart(2, "0")}</span>
        <span class="list-body">
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.type)} ・ ${p.questions.length}問 ・ 目標 ${fmtTime(p.targetSec)}</p>
        </span>
        <span class="list-best">${best === undefined ? "NEW" : starStr(best)}</span>
      </button>`;
  }).join("");
}
$("passageList").addEventListener("click", e => {
  const el = e.target.closest("[data-passage]");
  if (el) openPassage(+el.dataset.passage);
});

// 本文中の重要語を、タップで意味が出る span に置き換える
function glossify(text, glossary) {
  let html = esc(text);
  const found = [];
  [...glossary].sort((a, b) => b.w.length - a.w.length).forEach(g => {
    const term = g.w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
    html = html.replace(new RegExp(`\\b(${term})\\b`, "gi"), m => {
      found.push({ text: m, w: g.w, ja: g.ja });
      return `\u0000${found.length - 1}\u0000`;
    });
  });
  return html.replace(/\u0000(\d+)\u0000/g, (_, i) => {
    const f = found[i];
    return `<span class="gloss" data-w="${esc(f.w)}" data-ja="${esc(f.ja)}">${f.text}</span>`;
  });
}

function openPassage(i) {
  go("reading");
  current = i;
  const p = PASSAGES[i];
  picks = p.questions.map(() => null);
  submitted = false;

  $("passageType").textContent = p.type.toUpperCase();
  $("passageText").innerHTML = glossify(p.text, p.glossary);
  $("timerTarget").textContent = fmtTime(p.targetSec);
  $("readingResult").hidden = true;
  $("submitReading").hidden = false;

  $("questionList").innerHTML = p.questions.map((q, qi) => `
    <div class="q-card" data-q="${qi}">
      <h4>${qi + 1}. ${esc(q.q)}</h4>
      ${q.choices.map((c, ci) => `
        <button class="choice" type="button" data-c="${ci}">
          <span class="mark">${"ABCD"[ci]}</span><span>${esc(c)}</span>
        </button>`).join("")}
      <p class="explain" hidden></p>
    </div>`).join("");

  startTimer(p.targetSec);
}

$("questionList").addEventListener("click", e => {
  const btn = e.target.closest(".choice");
  if (!btn || submitted) return;
  const card = btn.closest(".q-card");
  picks[+card.dataset.q] = +btn.dataset.c;
  card.querySelectorAll(".choice").forEach(c => c.classList.toggle("picked", c === btn));
});

function startTimer(target) {
  stopTimer();
  elapsed = 0;
  $("timerText").textContent = "0:00";
  $("timer").classList.remove("over");
  timerId = setInterval(() => {
    elapsed++;
    $("timerText").textContent = fmtTime(elapsed);
    $("timer").classList.toggle("over", elapsed > target);
  }, 1000);
}
function stopTimer() { clearInterval(timerId); timerId = null; }

$("submitReading").addEventListener("click", () => {
  if (picks.includes(null)) { toast("全部の問題に答えてね"); return; }
  submitted = true;
  stopTimer();
  const p = PASSAGES[current];
  let correct = 0;

  document.querySelectorAll("#questionList .q-card").forEach((card, qi) => {
    const q = p.questions[qi];
    if (picks[qi] === q.answer) correct++;
    card.querySelectorAll(".choice").forEach((c, ci) => {
      c.classList.remove("picked");
      if (ci === q.answer) c.classList.add("correct");
      else if (ci === picks[qi]) c.classList.add("wrong");
    });
    const ex = card.querySelector(".explain");
    ex.textContent = `💡 ${q.explain}`;
    ex.hidden = false;
  });

  const total = p.questions.length;
  const perfect = correct === total;
  const inTime = elapsed <= p.targetSec;
  const stars = perfect && inTime ? 3 : perfect ? 2 : correct * 2 >= total ? 1 : 0;
  const xp = correct * 10 + (perfect && inTime ? 15 : 0);

  state.reading[p.id] = Math.max(state.reading[p.id] ?? 0, stars);
  const lg = todayLog();
  lg.rq += total;
  lg.rc += correct;
  const rt = (state.stats.rType[p.type] ||= { q: 0, c: 0 });
  rt.q += total;
  rt.c += correct;
  recordActivity();
  addXp(xp);

  const msg = perfect && inTime ? "パーフェクト＆時間内！スピードボーナス +15 XP"
    : perfect ? "全問正解！次は目標タイム内を目指そう"
    : "解説を読んで、本文のどこに答えがあるか確認しよう";
  const box = $("readingResult");
  box.innerHTML = `
    <div class="big">${correct} / ${total}</div>
    <div class="stars">${starStr(stars)}</div>
    <p>タイム ${fmtTime(elapsed)}（目標 ${fmtTime(p.targetSec)}）</p>
    <p class="small">${msg}</p>
    <div class="actions">
      <button class="btn" type="button" id="readAgain">もう一度</button>
      ${current < PASSAGES.length - 1 ? '<button class="btn primary" type="button" id="readNext">次の長文 →</button>' : ""}
    </div>`;
  box.hidden = false;
  $("submitReading").hidden = true;
  $("readAgain").addEventListener("click", () => openPassage(current));
  if ($("readNext")) $("readNext").addEventListener("click", () => openPassage(current + 1));
  box.scrollIntoView({ behavior: "smooth", block: "center" });
});

// ============ word popover ============
let popTarget = null;
$("passageText").addEventListener("click", e => {
  const g = e.target.closest(".gloss");
  if (!g) return;
  e.stopPropagation();
  hidePopover();
  popTarget = g;
  g.classList.add("active");
  $("popWord").textContent = g.dataset.w;
  $("popJa").textContent = g.dataset.ja;
  const pop = $("popover");
  pop.hidden = false;
  const r = g.getBoundingClientRect();
  const left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 8);
  pop.style.left = `${left}px`;
  pop.style.top = `${r.bottom + window.scrollY + 6}px`;
  speak(g.dataset.w, 0.85);
});
function hidePopover() {
  $("popover").hidden = true;
  if (popTarget) popTarget.classList.remove("active");
  popTarget = null;
}
document.addEventListener("click", e => { if (!e.target.closest("#popover")) hidePopover(); });
document.querySelector(".passage").addEventListener("scroll", hidePopover, { passive: true });
$("popSpeak").addEventListener("click", () => speak($("popWord").textContent, 0.85));
$("popSave").addEventListener("click", () => {
  const w = $("popWord").textContent;
  if (state.words.some(x => x.w === w)) { toast("もう単語帳に入っています"); }
  else { state.words.unshift({ w, ja: $("popJa").textContent }); saveState(); toast(`「${w}」を追加しました`); }
  hidePopover();
});

// ============ speech synthesis ============
let rate = 0.9;
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

function speak(text, r = rate, onBoundary, onEnd) {
  if (!("speechSynthesis" in window)) { toast("このブラウザは音声再生に対応していません"); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = r;
  if (voice) u.voice = voice;
  if (onBoundary) u.onboundary = onBoundary;
  if (onEnd) { u.onend = onEnd; u.onerror = onEnd; }
  speechSynthesis.speak(u);
}

// ============ shadowing ============
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let session = null;   // { setIdx, items, idx, best: [] }
let recog = null;
let listening = false;

function renderSetList() {
  const sets = [...SHADOW_SETS, { id: "mix", name: "Random 10", desc: "全パートからランダムに10文。", items: null }];
  $("setList").innerHTML = sets.map((s, i) => {
    const best = state.shadow[s.id];
    const n = s.items ? s.items.length : 10;
    return `
      <button class="list-item" type="button" data-set="${i}">
        <span class="list-num">${s.items ? s.name.replace("Part ", "P") : "🎲"}</span>
        <span class="list-body">
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.desc)} ・ ${n}文</p>
        </span>
        <span class="list-best">${best === undefined ? "NEW" : `${best}%`}</span>
      </button>`;
  }).join("");
  $("micNote").hidden = !!SR;
}
$("setList").addEventListener("click", e => {
  const el = e.target.closest("[data-set]");
  if (el) startSession(+el.dataset.set);
});

function startSession(setIdx) {
  let items, id;
  if (setIdx < SHADOW_SETS.length) {
    items = SHADOW_SETS[setIdx].items.map(it => ({ ...it, part: SHADOW_SETS[setIdx].name }));
    id = SHADOW_SETS[setIdx].id;
  } else {
    items = SHADOW_SETS.flatMap(s => s.items.map(it => ({ ...it, part: s.name }))).sort(() => Math.random() - 0.5).slice(0, 10);
    id = "mix";
  }
  go("shadow");
  session = { setIdx, id, items, idx: 0, best: items.map(() => null), xp: 0 };
  showItem();
}

function showItem() {
  const { items, idx } = session;
  const item = items[idx];
  $("shadowProgress").textContent = `${idx + 1} / ${items.length}`;
  $("shadowSteps").innerHTML = items.map((_, i) =>
    `<span class="${i < idx ? "done" : i === idx ? "now" : ""}"></span>`).join("");

  // 単語ごとに span にして、読み上げ位置をハイライトできるようにする
  let pos = 0;
  $("sentence").innerHTML = item.en.split(" ").map(w => {
    const start = item.en.indexOf(w, pos);
    pos = start + w.length;
    return `<span class="w" data-start="${start}">${esc(w)}</span>`;
  }).join(" ");
  $("sentence").classList.toggle("blind", $("blindToggle").checked);
  $("translation").textContent = item.ja;
  $("liveText").textContent = "";
  $("scoreBox").hidden = true;
  $("selfRate").hidden = true;
  $("micBtn").hidden = false;
  $("micBtn").textContent = SR ? "🎙 話してみる" : "🎙 話したら自己採点";
}

function playCurrent() {
  const item = session.items[session.idx];
  const spans = [...$("sentence").querySelectorAll(".w")];
  const clear = () => spans.forEach(s => s.classList.remove("speaking"));
  speak(item.en, rate, e => {
    if (e.name && e.name !== "word") return;
    clear();
    const hit = spans.filter(s => +s.dataset.start <= e.charIndex).pop();
    if (hit) hit.classList.add("speaking");
  }, clear);
}
$("playBtn").addEventListener("click", playCurrent);

document.querySelector(".speed").addEventListener("click", e => {
  const b = e.target.closest("[data-rate]");
  if (!b) return;
  rate = +b.dataset.rate;
  document.querySelectorAll(".speed button").forEach(x => x.classList.toggle("on", x === b));
});

$("blindToggle").addEventListener("change", e => {
  $("sentence").classList.toggle("blind", e.target.checked && $("scoreBox").hidden);
});

$("micBtn").addEventListener("click", () => {
  if (!SR) {
    $("selfRate").hidden = false;
    $("micBtn").hidden = true;
    return;
  }
  if (listening) { recog.stop(); return; }
  startListening();
});

function startListening() {
  speechSynthesis.cancel();
  recog = new SR();
  recog.lang = "en-US";
  recog.interimResults = true;
  recog.maxAlternatives = 3;
  recog.continuous = false;
  let finals = [];

  recog.onresult = e => {
    let interim = "";
    finals = [];
    for (let i = 0; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finals.push([...r].map(a => a.transcript));
      else interim += r[0].transcript;
    }
    $("liveText").textContent = finals.map(f => f[0]).join(" ") + " " + interim;
  };
  recog.onerror = e => {
    if (e.error === "not-allowed" || e.error === "service-not-allowed") {
      toast("マイクが使えないので自己採点モードにします");
      $("selfRate").hidden = false;
      $("micBtn").hidden = true;
    } else if (e.error === "no-speech") {
      toast("声が聞こえなかったよ。もう一度！");
    }
  };
  recog.onend = () => {
    setListening(false);
    if (!finals.length) return;
    // 認識候補の中から一番スコアが高いものを採用
    const candidates = finals.reduce((acc, alts) =>
      acc.flatMap(prefix => alts.map(a => `${prefix} ${a}`)).slice(0, 9), [""]);
    const target = session.items[session.idx].en;
    const best = candidates.map(c => compare(target, c)).sort((a, b) => b.score - a.score)[0];
    showScore(best.score, best.hits);
  };
  recog.start();
  setListening(true);
  $("liveText").textContent = "聞いています…";
}
function setListening(on) {
  listening = on;
  $("micBtn").classList.toggle("recording", on);
  $("micBtn").textContent = on ? "■ ストップ" : "🎙 話してみる";
}
function stopListening() {
  if (recog && listening) { recog.onend = () => setListening(false); recog.abort(); }
}

$("selfRate").addEventListener("click", e => {
  const b = e.target.closest("[data-self]");
  if (b) showScore(+b.dataset.self, null);
});

// ============ scoring ============
const NUMS = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten", 12: "twelve", 15: "fifteen", 20: "twenty", 30: "thirty", 40: "forty" };

function tokens(text) {
  return text.toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\bweb site\b/g, "website")
    .replace(/(\d+):00/g, "$1 o'clock")
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map(w => NUMS[w] || w)
    .map(w => w.replace(/'/g, ""));
}

// 最長共通部分列で、お手本のどの単語を言えたかを判定
function compare(target, spoken) {
  const t = tokens(target), s = tokens(spoken);
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

function showScore(score, hits) {
  const item = session.items[session.idx];
  const blind = $("blindToggle").checked;
  const stars = score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0;

  $("scoreNum").textContent = score;
  $("stars").textContent = starStr(stars);
  if (hits) {
    // tokens() と同じ区切りで、表示用の単語に正誤を付ける
    const words = item.en.split(" ");
    let ti = 0;
    $("diff").innerHTML = words.map(w => {
      const n = tokens(w).length;
      const ok = n > 0 && [...Array(n).keys()].every(k => hits.has(ti + k));
      ti += n;
      return `<span class="${ok ? "hit" : "miss"}">${esc(w)}</span>`;
    }).join(" ");
  } else {
    $("diff").textContent = item.en;
  }
  $("sentence").classList.remove("blind");
  $("selfRate").hidden = true;
  $("micBtn").hidden = true;
  $("scoreBox").hidden = false;
  $("nextBtn").textContent = session.idx === session.items.length - 1 ? "結果を見る →" : "次へ →";

  todayLog().ss++;
  const sp = (state.stats.sPart[item.part] ||= { n: 0, sum: 0 });
  sp.n++;
  sp.sum += score;
  if (hits) {
    $("diff").querySelectorAll(".miss").forEach(el => {
      const w = el.textContent.toLowerCase().replace(/[^a-z']/g, "");
      if (w.length > 3) state.stats.missed[w] = (state.stats.missed[w] || 0) + 1;
    });
  }
  saveState();

  // 同じ文のベスト更新分だけXPを付与(リトライでの稼ぎすぎ防止)
  const xp = Math.round(Math.round(score / 10) * (blind ? 1.5 : 1)) + (score >= 90 ? 3 : 0);
  const prev = session.best[session.idx] || { score: 0, xp: 0 };
  session.best[session.idx] = { score: Math.max(prev.score, score), xp: Math.max(prev.xp, xp) };
  if (xp > prev.xp) {
    session.xp += xp - prev.xp;
    addXp(xp - prev.xp);
  }
}

$("retryBtn").addEventListener("click", () => {
  showItem();
  playCurrent();
});
$("nextBtn").addEventListener("click", () => {
  if (session.idx < session.items.length - 1) {
    session.idx++;
    showItem();
    playCurrent();
  } else {
    finishSession();
  }
});

function finishSession() {
  const scores = session.best.map(b => b?.score ?? 0);
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  state.shadow[session.id] = Math.max(state.shadow[session.id] ?? 0, avg);
  recordActivity();
  go("summary");
  $("summaryTitle").textContent = avg >= 90 ? "ネイティブ級！🎉" : avg >= 70 ? "いい感じ！👏" : "おつかれさま！💪";
  $("summaryXp").textContent = session.xp;
  $("summaryText").textContent = `平均一致率 ${avg}%。${avg >= 70 ? "次は英文を隠すモードや1.1xにも挑戦してみよう。" : "0.75xでゆっくりまねするところから始めよう。"}`;
  renderHeader();
}
$("summaryAgain").addEventListener("click", () => startSession(session.setIdx));

// ============ study time tracker ============
// リーディング/シャドーイング画面を開いていて、90秒以内に操作がある間だけ学習時間に加算
let lastInteract = Date.now();
["pointerdown", "keydown", "scroll", "touchstart"].forEach(ev =>
  window.addEventListener(ev, () => { lastInteract = Date.now(); }, { passive: true }));
let unsavedTicks = 0;
setInterval(() => {
  const studying = ["reading", "shadow"].includes(currentView);
  const active = Date.now() - lastInteract < 90000 || listening || (window.speechSynthesis && speechSynthesis.speaking);
  if (!studying || document.hidden || !active) return;
  todayLog().sec++;
  if (++unsavedTicks >= 15) { unsavedTicks = 0; saveState(); }
}, 1000);
const flush = () => { if (unsavedTicks) { unsavedTicks = 0; saveState(); } };
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
window.addEventListener("pagehide", flush);

// ============ dashboard ============
const fmtMin = sec => {
  const m = Math.round(sec / 60);
  return m < 60 ? `${m}分` : `${Math.floor(m / 60)}時間${m % 60 ? `${m % 60}分` : ""}`;
};
const keyOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const emptyLog = { sec: 0, rq: 0, rc: 0, ss: 0, xp: 0 };
const logOf = k => state.log[k] || emptyLog;
const isStudied = l => l.sec >= 60 || l.rq > 0 || l.ss > 0;

let calMonth = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
let calMetric = "time";
let calSelected = null;

function sumRange(fromOffset, toOffset) {
  const t = { ...emptyLog };
  for (let i = fromOffset; i <= toOffset; i++) {
    const l = logOf(dayKey(i));
    for (const k in t) t[k] += l[k];
  }
  return t;
}

function weekSummary() {
  const w = sumRange(-6, 0);
  return `${fmtMin(w.sec)} ・ ${w.rq}問 ・ シャドーイング${w.ss}回`;
}

function renderDashboard() {
  const all = Object.values(state.log);
  const total = all.reduce((t, l) => { for (const k in t) t[k] += l[k] || 0; return t; }, { ...emptyLog });
  const days = Object.values(state.log).filter(isStudied).length;
  const alive = state.lastDay === dayKey() || state.lastDay === dayKey(-1);
  const acc = total.rq ? Math.round((total.rc / total.rq) * 100) : null;

  $("statDays").textContent = days;
  $("statTime").textContent = fmtMin(total.sec);
  $("statQ").textContent = total.rq;
  $("statQSub").textContent = acc === null ? "正答率 —" : `正答率 ${acc}%`;
  $("statSS").textContent = total.ss;
  $("statStreak").textContent = alive ? state.streak : 0;
  $("statBest").textContent = Math.max(state.bestStreak, alive ? state.streak : 0);

  const thisW = sumRange(-6, 0), lastW = sumRange(-13, -7);
  const diff = Math.round((thisW.sec - lastW.sec) / 60);
  $("weekLine").innerHTML = `直近7日: <b>${fmtMin(thisW.sec)}</b>・<b>${thisW.rq}</b>問・シャドーイング<b>${thisW.ss}</b>回` +
    (lastW.sec || thisW.sec ? `<span class="${diff >= 0 ? "up" : "down"}">（その前の7日より${diff >= 0 ? "+" : "−"}${Math.abs(diff)}分）</span>` : "");

  renderAnalysis();
  renderCalendar();
  renderBars();
}

// ---- calendar heatmap ----
function heatLevel(l) {
  if (calMetric === "time") {
    const m = l.sec / 60;
    return m <= 0.5 ? 0 : m < 10 ? 1 : m < 20 ? 2 : m < 40 ? 3 : 4;
  }
  const n = l.rq + l.ss;
  return n === 0 ? 0 : n < 5 ? 1 : n < 15 ? 2 : n < 30 ? 3 : 4;
}

function renderCalendar() {
  const y = calMonth.getFullYear(), mo = calMonth.getMonth();
  $("calTitle").textContent = `${y}年${mo + 1}月`;
  const first = new Date(y, mo, 1).getDay();
  const daysIn = new Date(y, mo + 1, 0).getDate();
  const today = dayKey();
  let html = "";
  for (let i = 0; i < first; i++) html += `<span class="cal-empty"></span>`;
  let studied = 0;
  for (let d = 1; d <= daysIn; d++) {
    const k = keyOf(new Date(y, mo, d));
    const l = logOf(k);
    if (isStudied(l)) studied++;
    const lv = heatLevel(l);
    const val = calMetric === "time" ? (l.sec >= 60 ? `${Math.round(l.sec / 60)}m` : "") : (l.rq + l.ss ? l.rq + l.ss : "");
    const future = k > today;
    html += `<button type="button" class="cal-day lv${lv}${state.memo[k] ? " has-memo" : ""}${k === today ? " today" : ""}${k === calSelected ? " sel" : ""}"
      data-day="${k}" ${future ? "disabled" : ""} aria-label="${mo + 1}月${d}日 ${fmtMin(l.sec)} ${l.rq}問 シャドーイング${l.ss}回">
      <span class="cal-n">${d}</span><span class="cal-v">${val}</span></button>`;
  }
  $("calGrid").innerHTML = html;
  $("calCount").textContent = `この月の学習日: ${studied}日`;
  const now = new Date();
  $("calNext").disabled = y === now.getFullYear() && mo === now.getMonth();
  renderDayDetail();
}

function renderDayDetail() {
  const box = $("dayDetail");
  if (!calSelected) { box.innerHTML = `<p class="muted small">日付をタップすると、その日の記録とメモが見られます。</p>`; return; }
  const l = logOf(calSelected);
  const [, m, d] = calSelected.split("-").map(Number);
  const memo = state.memo[calSelected] || "";
  box.innerHTML = (isStudied(l) ? `
    <p class="dd-date">${m}月${d}日の記録</p>
    <div class="dd-grid">
      <div><span>学習時間</span><b>${fmtMin(l.sec)}</b></div>
      <div><span>リーディング</span><b>${l.rq}問</b>${l.rq ? `<small>${l.rc}問正解</small>` : ""}</div>
      <div><span>シャドーイング</span><b>${l.ss}回</b></div>
      <div><span>獲得XP</span><b>${l.xp}</b></div>
    </div>` : `<p class="dd-date">${m}月${d}日</p><p class="muted small">この日の学習記録はありません。</p>`) + `
    <label class="memo">
      <span>✎ ひとことメモ</span>
      <textarea id="memoText" rows="2" maxlength="200" placeholder="例：Part 7の言い換えに気づけた！ / 明日は単語を復習する">${esc(memo)}</textarea>
    </label>
    <div class="memo-actions"><span class="muted small" id="memoState"></span><button type="button" class="btn" id="memoSave">メモを保存</button></div>`;
  $("memoSave").addEventListener("click", () => {
    const v = $("memoText").value.trim();
    if (v) state.memo[calSelected] = v; else delete state.memo[calSelected];
    saveState();
    toast(v ? "メモを保存しました" : "メモを削除しました");
    renderCalendar();
  });
}

$("calGrid").addEventListener("click", e => {
  const b = e.target.closest("[data-day]");
  if (!b) return;
  calSelected = calSelected === b.dataset.day ? null : b.dataset.day;
  renderCalendar();
});
$("calPrev").addEventListener("click", () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1); renderCalendar(); });
$("calNext").addEventListener("click", () => { calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1); renderCalendar(); });
document.querySelector(".metric").addEventListener("click", e => {
  const b = e.target.closest("[data-metric]");
  if (!b) return;
  calMetric = b.dataset.metric;
  document.querySelectorAll(".metric button").forEach(x => x.classList.toggle("on", x === b));
  renderCalendar();
});

// ---- last 14 days bar chart ----
function renderBars() {
  const wrap = $("barChart");
  const W = Math.max(280, wrap.clientWidth), H = 180;
  const pad = { l: 34, r: 8, t: 12, b: 24 };
  const days = Array.from({ length: 14 }, (_, i) => {
    const k = dayKey(i - 13);
    return { k, l: logOf(k), d: new Date(Date.now() + (i - 13) * 864e5) };
  });
  const mins = days.map(x => x.l.sec / 60);
  const max = Math.max(10, Math.ceil(Math.max(...mins) / 10) * 10);
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const slot = iw / days.length, bw = Math.min(24, slot * 0.6);
  const y = v => pad.t + ih - (v / max) * ih;

  let svg = "";
  [0, max / 2, max].forEach(v => {
    svg += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(v)}" y2="${y(v)}" class="grid"/>
      <text x="${pad.l - 6}" y="${y(v) + 4}" class="axis" text-anchor="end">${Math.round(v)}</text>`;
  });
  days.forEach((x, i) => {
    const cx = pad.l + slot * i + slot / 2;
    const h = (mins[i] / max) * ih;
    if (h > 0.5) {
      const r = Math.min(4, h, bw / 2), x0 = cx - bw / 2, y0 = pad.t + ih - h, yb = pad.t + ih;
      svg += `<path class="bar${i === 13 ? " now" : ""}" d="M${x0},${yb} V${y0 + r} Q${x0},${y0} ${x0 + r},${y0} H${x0 + bw - r} Q${x0 + bw},${y0} ${x0 + bw},${y0 + r} V${yb} Z"/>`;
    }
    if (i % 2 === 1 || W > 480) svg += `<text x="${cx}" y="${H - 6}" class="axis" text-anchor="middle">${i === 13 ? "今日" : x.d.getDate()}</text>`;
    svg += `<rect class="hit" data-i="${i}" x="${cx - slot / 2}" y="${pad.t}" width="${slot}" height="${ih}"/>`;
  });
  wrap.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="直近14日の学習時間(分)">${svg}</svg><div class="tip" id="barTip" hidden></div>`;

  const tip = $("barTip");
  const show = e => {
    const r = e.target.closest(".hit");
    if (!r) { tip.hidden = true; return; }
    const x = days[+r.dataset.i];
    tip.innerHTML = `<b>${x.d.getMonth() + 1}/${x.d.getDate()}</b> ${fmtMin(x.l.sec)}<br>${x.l.rq}問・シャドーイング${x.l.ss}回`;
    tip.hidden = false;
    const cx = +r.getAttribute("x") + slot / 2;
    tip.style.left = `${Math.min(Math.max(cx - tip.offsetWidth / 2, 0), W - tip.offsetWidth)}px`;
  };
  wrap.querySelector("svg").addEventListener("pointermove", show);
  wrap.querySelector("svg").addEventListener("click", show);
  wrap.querySelector("svg").addEventListener("pointerleave", () => { tip.hidden = true; });
}
window.addEventListener("resize", () => { if (currentView === "dashboard") renderBars(); });

// ============ goal message ============
function renderGoal() {
  const g = state.goal;
  $("goalMsg").textContent = g.text || "✎ から、自分へのメッセージや目標を書いてみよう";
  $("goalMsg").classList.toggle("placeholder", !g.text);
  let cd = "";
  if (g.exam) {
    const days = Math.round((new Date(g.exam + "T00:00:00") - new Date(dayKey() + "T00:00:00")) / 864e5);
    const [, m, d] = g.exam.split("-").map(Number);
    cd = days > 0 ? `${m}/${d} の試験まで あと${days}日` : days === 0 ? "今日は試験日！いってらっしゃい！" : "";
  }
  $("countdown").textContent = cd;
  $("countdown").hidden = !cd;
}
$("goalEdit").addEventListener("click", () => {
  $("goalText").value = state.goal.text;
  $("goalExam").value = state.goal.exam;
  $("goalForm").hidden = false;
  $("goalEdit").hidden = true;
  $("goalView").hidden = true;
  $("goalText").focus();
});
const closeGoalForm = () => {
  $("goalForm").hidden = true;
  $("goalEdit").hidden = false;
  $("goalView").hidden = false;
};
$("goalCancel").addEventListener("click", closeGoalForm);
$("goalForm").addEventListener("submit", e => {
  e.preventDefault();
  state.goal = { text: $("goalText").value.trim(), exam: $("goalExam").value };
  saveState();
  closeGoalForm();
  renderGoal();
  toast("目標を保存しました");
});

// ============ analysis ============
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function weekdayAverages() {
  const sum = Array(7).fill(0);
  for (let i = -55; i <= 0; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    sum[d.getDay()] += logOf(dayKey(i)).sec / 60;
  }
  return sum.map(v => v / 8);
}

const pct = (c, n) => Math.round((c / n) * 100);

// 学習記録から、今の自分に合ったメッセージを優先度順に作る
function insights() {
  const out = [];
  const today = logOf(dayKey());
  const alive = state.lastDay === dayKey() || state.lastDay === dayKey(-1);
  const streak = alive ? state.streak : 0;
  const studiedDays = Object.values(state.log).filter(isStudied).length;

  if (!isStudied(today) && streak > 0) out.push({ icon: "⏰", text: `${streak}日連続の記録が続いています。今日も5分だけやって、連続記録をのばそう！` });
  else if (streak >= 3) out.push({ icon: "🔥", text: `${streak}日連続で学習中！コツコツ続けられています。` });
  if (isStudied(today) && state.today.date === dayKey() && state.today.count >= DAILY_GOAL) out.push({ icon: "🎉", text: "今日のゴールを達成！よくがんばりました。" });

  const thisW = sumRange(-6, 0), lastW = sumRange(-13, -7);
  const diff = Math.round((thisW.sec - lastW.sec) / 60);
  if (lastW.sec >= 60 && diff >= 5) out.push({ icon: "📈", text: `直近7日の学習時間は、その前の7日より${diff}分多いです。いいペース！` });
  else if (lastW.sec >= 60 && diff <= -5) out.push({ icon: "🌱", text: `直近7日は、その前の7日より${-diff}分少なめ。忙しい日は1セットだけでもOK。` });

  if (studiedDays >= 7) {
    const avg = weekdayAverages();
    const best = avg.indexOf(Math.max(...avg));
    const worst = avg.indexOf(Math.min(...avg));
    if (avg[best] >= 1) out.push({ icon: "📅", text: `${WEEKDAYS[best]}曜日が一番勉強できている日です。${avg[worst] < 1 ? `${WEEKDAYS[worst]}曜日は少なめなので、短いセットから始めてみよう。` : ""}` });
  }

  const types = Object.entries(state.stats.rType).filter(([, v]) => v.q >= 4);
  if (types.length) {
    types.sort((a, b) => a[1].c / a[1].q - b[1].c / b[1].q);
    const [wt, wv] = types[0];
    const [bt, bv] = types[types.length - 1];
    if (pct(wv.c, wv.q) < 80) out.push({ icon: "🎯", text: `リーディングは「${wt}」の正答率が${pct(wv.c, wv.q)}%で一番低めです。解説で、本文のどこが言い換えられているかを確認しよう。` });
    if (types.length > 1 && pct(bv.c, bv.q) >= 80) out.push({ icon: "💪", text: `「${bt}」は正答率${pct(bv.c, bv.q)}%。得意な形式です！` });
  }

  const parts = Object.entries(state.stats.sPart).filter(([, v]) => v.n >= 3);
  if (parts.length) {
    const all = parts.reduce((a, [, v]) => ({ n: a.n + v.n, sum: a.sum + v.sum }), { n: 0, sum: 0 });
    const avg = Math.round(all.sum / all.n);
    if (avg >= 85) out.push({ icon: "🎙", text: `シャドーイングの平均一致率は${avg}%。英文を隠すモードや1.1xにも挑戦してみよう。` });
    else if (avg < 60) out.push({ icon: "🎙", text: `シャドーイングの平均一致率は${avg}%。0.75xでゆっくりまねするのが近道です。` });
  }

  const missed = Object.entries(state.stats.missed).sort((a, b) => b[1] - a[1]);
  if (missed.length && missed[0][1] >= 2) out.push({ icon: "🗣", text: `「${missed[0][0]}」が言いにくいようです。単語だけ何度か発音してから、文で練習してみよう。` });

  if (!out.length) out.push({ icon: "✨", text: studiedDays ? "今日も1セット、一緒にがんばろう！" : "まずは1セット解いてみよう！記録がたまると、ここに分析が出ます。" });
  return out;
}

function meters(rows, max, fmt) {
  if (!rows.length) return `<p class="muted small">まだデータがありません。</p>`;
  return rows.map(([label, v, sub]) => `
    <div class="meter">
      <span class="m-label">${esc(label)}</span>
      <span class="m-track"><span class="m-fill" style="width:${Math.min(100, (v / max) * 100)}%"></span></span>
      <span class="m-val">${fmt(v)}${sub ? `<small>${sub}</small>` : ""}</span>
    </div>`).join("");
}

function renderAnalysis() {
  $("insights").innerHTML = insights().slice(0, 5).map(i => `<li><span>${i.icon}</span><p>${esc(i.text)}</p></li>`).join("");

  const wd = weekdayAverages();
  $("weekdayBars").innerHTML = Object.keys(state.log).length
    ? meters(WEEKDAYS.map((w, i) => [w, wd[i]]), Math.max(10, ...wd), v => `${Math.round(v)}分`)
    : meters([], 1);

  $("typeBars").innerHTML = meters(
    Object.entries(state.stats.rType).sort((a, b) => b[1].c / b[1].q - a[1].c / a[1].q)
      .map(([t, v]) => [t, pct(v.c, v.q), `${v.c}/${v.q}問`]),
    100, v => `${v}%`);

  $("partBars").innerHTML = meters(
    SHADOW_SETS.map(s => s.name).filter(n => state.stats.sPart[n])
      .map(n => [n, Math.round(state.stats.sPart[n].sum / state.stats.sPart[n].n), `${state.stats.sPart[n].n}回`]),
    100, v => `${v}%`);

  const missed = Object.entries(state.stats.missed).sort((a, b) => b[1] - a[1]).slice(0, 5);
  $("missedList").innerHTML = missed.length
    ? missed.map(([w, n]) => `<li><button type="button" data-speak="${esc(w)}">🔊</button><b>${esc(w)}</b><span class="muted">${n}回</span></li>`).join("")
    : `<li class="muted small empty">シャドーイングで言えなかった単語がここに出ます。</li>`;
}
$("missedList").addEventListener("click", e => {
  const b = e.target.closest("[data-speak]");
  if (b) speak(b.dataset.speak, 0.75);
});

// ============ init ============
renderHome();
