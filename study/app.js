// ============ storage ============
const STORE_KEY = "road745";
const DAILY_GOAL = 5;
const RANKS = ["Starter", "Beginner", "Explorer", "Challenger", "Runner", "Climber", "Achiever", "Advanced", "Expert", "745 Master"];

function loadState() {
  const base = { xp: 0, streak: 0, lastDay: "", today: { date: "", count: 0 }, reading: {}, shadow: {}, words: [] };
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

// 1セット終えるごとに呼ぶ: 連続日数と今日のゴールを更新
function recordActivity() {
  const today = dayKey();
  if (state.lastDay !== today) {
    state.streak = state.lastDay === dayKey(-1) ? state.streak + 1 : 1;
    state.lastDay = today;
  }
  if (state.today.date !== today) state.today = { date: today, count: 0 };
  state.today.count++;
  saveState();
  if (state.today.count === DAILY_GOAL) toast("🎉 今日のゴール達成！");
}

function addXp(n) {
  if (n <= 0) return;
  const before = levelInfo().level;
  state.xp += n;
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
    items = SHADOW_SETS[setIdx].items;
    id = SHADOW_SETS[setIdx].id;
  } else {
    items = SHADOW_SETS.flatMap(s => s.items).sort(() => Math.random() - 0.5).slice(0, 10);
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

// ============ init ============
renderHome();
