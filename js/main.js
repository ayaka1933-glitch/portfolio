// ============ works data ============
const WORKS = [
  {
    img: "assets/work01_jp_kairo.jpg",
    title: "受験生の皆さんへ",
    client: "日本郵政株式会社",
    role: "PLANNER / PRODUCER",
    desc: "受験シーズンを迎えるにあたり、日本郵政グループとともに、学生たちを応援できるような取り組みを模索。緊張や厳しい寒さの中でもベストを尽くせるようにと、受験生の手元を温めるカイロを制作。カイロには応援のメッセージを添え、はがきに見立てたデザインに。そして共通テスト当日の朝、東京と大阪の試験会場近くで社員が直接配布。かなり前向きに受け取ってもらうことができた。挑戦する受験生を、ひとりひとり温かく応援するブランドアクションとして体現。",
    result: "",
    award: ""
  },
  {
    img: "assets/work02_jp_post.jpg",
    title: "郵便ポストが見ている世界",
    client: "日本郵政株式会社",
    role: "PLANNER / PRODUCER",
    desc: "日本郵政グループの年間でブランドコミュニケーションを担当。郵便ポストは全国に17万本以上。この圧倒的な数字に着目し、もしもポストに「目」があったなら、日本中を見渡すことができるという発想から実現。東京メトロ新宿駅で投函口を模した穴から、「ポスト主観の映像」を流すサイネージを設置。まるで自分自身がポストになったかのように、世界を覗き込める体験として話題に。",
    result: "滞在者:4,100人\nX IMP:21万\nメディア掲載:36件",
    award: "第78回広告電通賞 OOH広告部門 金賞\n2025年度 ADC賞 入選"
  },
  {
    img: "assets/work03_ginsara.jpg",
    title: "あなたと銀のさらの銀婚の年。",
    client: "株式会社ライドオンエクスプレス(銀のさら)",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "銀のさら25周年施策のプロモーションとして実施。25周年=お客さまと銀のさらの25周年とし、銀婚式風の手書きメッセージ広告を掲出し、銀の箸のプレゼント企画を実施するところまで企画・ライティングを実施。また、銀のさら店舗がある全国25ヶ所に掲出し、掲出期間中に点をつなぐと「スシ」が浮かび上がるというギミックも実施し話題となった。",
    result: "フォロワー数:+2,000人\nX IMP:21万",
    award: ""
  },
  {
    img: "assets/work04_osomatsu.jpg",
    title: "おそ松さん名場面集&おそ松さん検定",
    client: "エイベックス・ピクチャーズ株式会社",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "おそ松さん4期のTikTokでのプロモーションを実施。新規若年層の獲得に向けて、過去のキャラクターたちの魅力が伝わる企画、ストーリーの面白さの伝わる名場面集と検定を企画。1期から3期までアニメを視聴し、ファンの喜ぶ要素を踏まえたクリエイティブ表現や選定を実施し、一部の動画は100万回再生を突破。新規ユーザーにも関心を与える機会となり、おそ松さん検定においてはユーザーの2次創作コンテンツも複数生まれた。",
    result: "総再生数:170万回突破\n歴代アカウントの再生数1位",
    award: ""
  },
  {
    img: "assets/work05_newans.jpg",
    title: "#NEWANS 2025AWコラボ支援",
    client: "株式会社オンワード樫山",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "オンワードのブランド#NEWANSの2025年の秋冬コラボとして、モデル・高山都さんのキャスティングから、コラボ服の制作進行や販促企画を実施。コラボLPのコピーライティングやインタビュー動画の企画からクリエイティブディレクションまでを遂行。高山さんの「日常非日常どんな時も寄り添う服づくり」という想いや#NEWANSのブランドの軸を尊重した構成案やライティング、編集をすることができた。",
    result: "",
    award: ""
  },
  {
    img: "assets/work06_danny.jpg",
    title: "DANNY / ダニケア商品プロモーション施策",
    client: "アース製薬株式会社",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "アース製薬のInstagram運用で、通常時は進行管理を担当しているが、本企画ではプランニングからコピー制作・進行管理までを担当。「ダニは身近の見えないところに沢山いる」という観点から、家具カタログ風のクリエイティブで表現。「ダニが最大何匹いるか」を写真からAIを活用し、「ヒキ」として記載。コピーも人間向きにもダニ向きにも捉えられるようなダニケアを意識向上させるように表現した。",
    result: "",
    award: ""
  },
  {
    img: "assets/work07_nivea.jpg",
    title: "NIVEA Instagram 冬&春施策",
    client: "ニベア花王株式会社",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "ニベアのInstagramのプロモーションを冬、春をそれぞれ担当。若年層のファン化というゴールに向けて、高校生に出演してもらい、出演者へのインタビューから未来に向けて進んでいく姿をコピーライティングまで実施。春のRICH CARE&COLOR施策では、卒業の筒のサイズのニベアリップを持って、卒業する人たちへエールを贈るという企画を立案し、それぞれが春から頑張ることを汲み取ったコピーとしてライティングを実施した。",
    result: "",
    award: ""
  },
  {
    img: "assets/work08_dominos.jpg",
    title: "ドミノ・ピザ X運用",
    client: "ドミノ・ピザ ジャパン",
    role: "PLANNER / PRODUCER",
    desc: "社内で最大のフォロワー数を持つアカウントの企画・制作支援を実施。高いIMP目標を持ちクライアントへ、伸ばせるかつドミノ・ピザの意義を出せる投稿を企画し、100万IMPのバズ投稿を3ヶ月連続で輩出した。また、クライアントの体制変更などによるブランドマネージャーとのコミュニケーションを実施し、柔軟な戦略・企画とPDCA支援を実施し、代理店・先方への信頼の獲得にも貢献した。",
    result: "3ヶ月連続100万IMP達成",
    award: ""
  },
  {
    img: "assets/work09_tgtg.jpg",
    title: "TOO GOOD TO GO SNSローンチ施策",
    client: "TOO GOOD TO GO JAPAN",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "欧州で主流のフードロス削減サービスの日本ローンチに向け、認知拡大・ユーザー獲得を目的に「10日後にXXになるTOO GOOD TO GO」の企画を立案。TikTok、Instagram、Xのアカウントの立ち上げを支援した。6組のインフルエンサーがアプリの日常的メリットを伝える動画コンテンツを制作し、グローバルからハイ達成の目標値として設定されていた、Instagram再生数合計100万回を突破。",
    result: "Instagram 累計100万IMP達成\nフォロワー2万人突破",
    award: ""
  },
  {
    img: "assets/work10_raisins.jpg",
    title: "カリフォルニア・レーズン施策",
    client: "マーケット・メイカーズ・インク",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "カリフォルニア産レーズンの「認知・理解促進」と「整う」という情緒的価値の親和性が高いターゲット層を検証する施策として、3界隈の合計9名のインフルエンサーをアサインして認知拡大を図ったのちにターゲットの検証をするために、SNSキャンペーンとLP制作を追加で提案し受注。クリエイティブディレクション・広告配信設計から納品まで一貫して担当し、動画再生数KPIを200%以上達成。",
    result: "動画再生数KPI 200%以上達成",
    award: ""
  },
  {
    img: "assets/work11_meguro.jpg",
    title: "#10年支えてくれた目黒メシ",
    client: "テテマーチ株式会社",
    role: "PLANNER / COPYWRITER / PRODUCER",
    desc: "テテマーチの設立10周年企画として実施。「感謝」をテーマにした施策で、普段社員がお世話になっている飲食店にフォーカスを当てて社内で自主提案し実装まで実現。SNSマーケティングの会社であることをアピールするためSNSライクの投稿画面のデザイン。飲食店へ足を運び自ら許可どりや撮影を実施した。",
    result: "",
    award: ""
  },
  {
    img: "assets/work12_shachoten.jpg",
    title: "みんなの社長展",
    client: "白潟総合研究所株式会社",
    role: "PLANNER / COPYWRITER",
    desc: "中小企業の社長向けのコンサルティングをする白潟総研が、「社長の人生の面白さを多くの人に知ってほしい」という思いから、9人の社長の人生展を企画。「みんなの社長展」というネーミングから、コンセプト、キャッチコピー、展示内の企画まで担当。社長たちのインタビュー動画を踏まえた展示を見にくる人たちにとっての価値や親しみやすさを感じさせるライティングを心がけ届けることができた。また、さらに親近感を出してもらう上で「AI社長」や「経営トロッコ問題」など参加型の企画も考案し、訪れた顧客の心を大きく動かした。",
    result: "",
    award: ""
  }
];

// ============ render works grid ============
const grid = document.getElementById("worksGrid");
WORKS.forEach((w, i) => {
  const card = document.createElement("button");
  card.className = "work-card reveal";
  card.type = "button";
  card.setAttribute("aria-haspopup", "dialog");
  const badges = [
    w.award ? '<span class="work-badge">AWARD</span>' : "",
    w.result ? '<span class="work-badge" style="background:#14b4d4">RESULT</span>' : ""
  ].join("");
  card.innerHTML = `
    <div class="work-thumb"><img src="${w.img}" alt="${w.title}のクリエイティブ" loading="lazy"></div>
    <div class="work-info">
      <p class="work-client">CLIENT: ${w.client}</p>
      <h3 class="work-title">${w.title}</h3>
      <p class="work-role">${w.role}</p>
      ${badges}
    </div>`;
  card.addEventListener("click", () => openModal(i));
  grid.appendChild(card);
});

// ============ modal ============
const modal = document.getElementById("workModal");
const modalImg = document.getElementById("modalImg");

function openModal(i) {
  const w = WORKS[i];
  modalImg.src = w.img;
  modalImg.alt = `${w.title}のクリエイティブ`;
  document.getElementById("modalTitle").textContent = w.title;
  document.getElementById("modalClient").textContent = `CLIENT: ${w.client}`;
  document.getElementById("modalDesc").textContent = w.desc;
  document.getElementById("modalResult").textContent = w.result;
  document.getElementById("modalAward").textContent = w.award;
  document.getElementById("modalRole").textContent = w.role;
  modal.classList.add("open");
  document.body.classList.add("modal-open");
}
function closeModal() {
  modal.classList.remove("open");
  document.body.classList.remove("modal-open");
}
modal.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// ============ header on scroll ============
const header = document.getElementById("siteHeader");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

// ============ scroll reveal ============
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("visible");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
