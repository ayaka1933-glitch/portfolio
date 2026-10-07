// ============ Q&A Dojo: プレゼン後の質疑応答 ============
// 設定: 新商品のSNSキャンペーン企画をクライアントにプレゼンした直後
// phrases: 答えの中で使えたらボーナスになる「型」のフレーズ（部分一致で判定）
const QA_SETS = [
  {
    id: "qa1",
    name: "Basics",
    title: "定番の質問",
    desc: "どのプレゼンでも聞かれる質問。まずは型で答える練習。",
    items: [
      {
        q: "Could you tell us a little more about your target audience?",
        ja: "ターゲット層についてもう少し教えてもらえますか？",
        tip: "結論（誰か）→ 理由 → 具体例の順。PREPの型で30秒。",
        model: "Sure. Our main target is women in their late twenties who use Instagram every day. We chose them because they are the most likely to share products with their friends. For example, in our last campaign, this group created over half of all the posts.",
        modelJa: "はい。主なターゲットは、毎日Instagramを使う20代後半の女性です。友人に商品をシェアする可能性が最も高いので選びました。例えば前回のキャンペーンでは、この層が全投稿の半分以上を作りました。",
        phrases: ["sure", "our main", "because", "for example"]
      },
      {
        q: "Why do you think this idea will work?",
        ja: "なぜこのアイデアがうまくいくと思うのですか？",
        tip: "「理由は2つあります」と先に数を宣言すると、話しながら整理できる。",
        model: "There are two main reasons. First, the idea is easy to join. People only need to take one photo. Second, it connects to a feeling everyone has, so it is easy to share. That's why we believe it will spread quickly.",
        modelJa: "主な理由は2つあります。まず、参加しやすいこと。写真を1枚撮るだけです。次に、誰もが持っている感情とつながっているので、シェアしやすいこと。だから早く広がると考えています。",
        phrases: ["two", "first", "second", "that's why"]
      },
      {
        q: "What is the timeline for this campaign?",
        ja: "このキャンペーンのスケジュールは？",
        tip: "時系列は first / then / finally でつなぐと聞きやすい。",
        model: "We plan to start in April. First, we will spend two weeks creating content with influencers. Then the campaign will run for one month. Finally, we will share a report with you in early June.",
        modelJa: "4月開始を予定しています。まず2週間インフルエンサーとコンテンツを作ります。その後1か月キャンペーンを実施し、最後に6月上旬にレポートを共有します。",
        phrases: ["we plan to", "first", "then", "finally"]
      },
      {
        q: "How is this different from what your competitors are doing?",
        ja: "競合がやっていることとどう違うのですか？",
        tip: "相手の質問を一度言い換えてから答えると、考える時間ができる。",
        model: "That's a good question. Most competitors focus on discounts. Our idea is different because it focuses on an experience, not a price. So people talk about the brand, not just the deal.",
        modelJa: "良い質問ですね。多くの競合は割引に注力しています。私たちの案は価格ではなく体験に焦点を当てている点が違います。だから人々はお得情報ではなく、ブランドについて話してくれます。",
        phrases: ["good question", "most", "different", "so"]
      },
      {
        q: "What do you need from us to get started?",
        ja: "始めるために、私たちから何が必要ですか？",
        tip: "依頼は would / need で丁寧に。最後に締めの一言。",
        model: "Thank you for asking. We would need two things: your approval on the budget, and access to your product photos. If we can get those by the end of this month, we can start on schedule.",
        modelJa: "ありがとうございます。2つ必要です。予算の承認と、商品写真の提供です。今月末までにいただければ、予定どおり始められます。",
        phrases: ["thank you", "we would need", "if we can"]
      }
    ]
  },
  {
    id: "qa2",
    name: "Numbers",
    title: "数字・成果を聞かれる",
    desc: "KPI、予算、効果測定。数字は「ざっくり＋根拠」で答える。",
    items: [
      {
        q: "How will you measure the success of this campaign?",
        ja: "このキャンペーンの成功をどう測りますか？",
        tip: "指標を2〜3個に絞って、それぞれ一言ずつ。",
        model: "We will look at three numbers: the number of posts, the engagement rate, and the change in online sales. Our main goal is ten thousand posts in one month.",
        modelJa: "3つの数字を見ます。投稿数、エンゲージメント率、オンライン売上の変化です。主な目標は1か月で1万投稿です。",
        phrases: ["we will look at", "three", "our main goal"]
      },
      {
        q: "Where does that number come from?",
        ja: "その数字の根拠は？",
        tip: "based on 〜（〜に基づいて）が万能。過去データを根拠に。",
        model: "It's based on our past campaigns. Similar campaigns got around eight thousand posts. With the new influencer plan, we expect about twenty percent more.",
        modelJa: "過去のキャンペーンに基づいています。似たキャンペーンでは約8千投稿でした。新しいインフルエンサー施策で、約2割増を見込んでいます。",
        phrases: ["based on", "around", "we expect"]
      },
      {
        q: "Isn't the budget a little high?",
        ja: "予算が少し高くないですか？",
        tip: "まず理解を示す（I understand）→ 内訳 → 代替案。",
        model: "I understand your concern. Most of the budget goes to influencer fees, because they create the content. If needed, we can reduce the number of influencers and start with a smaller test.",
        modelJa: "ご懸念はわかります。予算の大部分はコンテンツを作るインフルエンサーの費用です。必要なら人数を減らして、小さなテストから始めることもできます。",
        phrases: ["i understand", "most of", "if needed", "we can"]
      },
      {
        q: "What results did you get last time?",
        ja: "前回はどんな結果でしたか？",
        tip: "数字＋それが意味すること（which means…）をセットで。",
        model: "Last time, we got about eight thousand posts and sales went up by fifteen percent, which means the campaign paid for itself in two months.",
        modelJa: "前回は約8千投稿、売上は15%増えました。つまり2か月で費用を回収できたということです。",
        phrases: ["last time", "went up", "which means"]
      },
      {
        q: "What if the numbers don't reach the goal?",
        ja: "数字が目標に届かなかったら？",
        tip: "「週ごとに確認して調整する」はどんな案件にも使える答え。",
        model: "Good point. We will check the numbers every week. If they are lower than expected, we will change the content or the posting time quickly, so we don't waste the budget.",
        modelJa: "良いご指摘です。毎週数字を確認します。想定より低ければ、コンテンツや投稿時間をすぐ変更して、予算を無駄にしないようにします。",
        phrases: ["good point", "every week", "if they", "so we"]
      }
    ]
  },
  {
    id: "qa3",
    name: "Pushback",
    title: "反論・懸念に答える",
    desc: "否定されても慌てない。受け止める → 根拠 → 前向きに。",
    items: [
      {
        q: "I'm not sure young people will be interested in this.",
        ja: "若い人がこれに興味を持つかどうか、疑問です。",
        tip: "That's a fair point. で受け止めてから、データで返す。",
        model: "That's a fair point. Actually, we tested the idea with fifty people in their twenties, and most of them said they would join. But we can test it again before the launch to make sure.",
        modelJa: "もっともなご指摘です。実は20代の50人でアイデアをテストし、ほとんどが参加したいと答えました。ただ、念のためローンチ前にもう一度テストできます。",
        phrases: ["fair point", "actually", "make sure"]
      },
      {
        q: "Don't you think this is a bit risky for our brand?",
        ja: "ブランドにとって少しリスクが高いと思いませんか？",
        tip: "リスクを認めたうえで、対策を具体的に1つ示す。",
        model: "I see what you mean. There is always some risk with social media. To reduce it, we will check every post before it goes live, and we will have a team ready to respond quickly.",
        modelJa: "おっしゃることはわかります。SNSには常にリスクがあります。それを減らすため、全投稿を公開前に確認し、すぐ対応できるチームも用意します。",
        phrases: ["i see what you mean", "to reduce", "we will"]
      },
      {
        q: "We tried something similar before, and it didn't work.",
        ja: "以前似たことを試して、うまくいきませんでした。",
        tip: "相手の経験を質問で掘る → 違いを説明。質問返しはOK。",
        model: "Thank you for sharing that. May I ask what didn't work last time? The big difference this time is that the content is made by real users, not by the brand, so it feels more natural.",
        modelJa: "共有ありがとうございます。前回は何がうまくいかなかったか伺ってもいいですか？今回の大きな違いは、コンテンツをブランドではなく実際のユーザーが作るので、より自然に感じられる点です。",
        phrases: ["thank you for", "may i ask", "the big difference"]
      },
      {
        q: "Why should we choose your agency over others?",
        ja: "なぜ他社ではなく御社を選ぶべきなのですか？",
        tip: "強みは3語で言えるくらいシンプルに。",
        model: "Because we don't just make ads, we make people talk. Our team has run over twenty social campaigns, and we can move fast from idea to launch.",
        modelJa: "私たちは広告を作るだけでなく、人に話題にしてもらう仕組みを作るからです。チームは20以上のSNSキャンペーンを手がけ、アイデアからローンチまで素早く動けます。",
        phrases: ["because", "not just", "our team"]
      },
      {
        q: "Honestly, I think the idea is too simple.",
        ja: "正直、アイデアがシンプルすぎると思います。",
        tip: "否定をメリットに言い換える（That's actually our point.）。",
        model: "I appreciate your honesty. Actually, that's on purpose. Simple ideas are easier to join and easier to share. But we can add more creative options if you'd like.",
        modelJa: "率直なご意見ありがとうございます。実はそれは意図的です。シンプルなアイデアほど参加しやすく、シェアしやすいのです。ただ、ご希望ならクリエイティブの選択肢を増やせます。",
        phrases: ["i appreciate", "on purpose", "if you'd like"]
      }
    ]
  },
  {
    id: "qa4",
    name: "Rescue",
    title: "困った時の切り返し",
    desc: "聞き取れない・わからない・時間がない。止まらないための一言。",
    items: [
      {
        q: "So, regarding the attribution model for the cross-channel funnel, how are you planning to handle it?",
        ja: "クロスチャネルのファネルのアトリビューションモデルについて、どう扱う予定ですか？",
        tip: "聞き取れなかったら確認するのが正解。黙るのが一番NG。",
        model: "Sorry, could you say that again a little more slowly? I want to make sure I understand your question correctly.",
        modelJa: "すみません、もう少しゆっくりもう一度言っていただけますか？ご質問を正しく理解したいので。",
        phrases: ["sorry", "could you", "make sure"]
      },
      {
        q: "What will the exact cost per click be in the second month?",
        ja: "2か月目のクリック単価は正確にいくらになりますか？",
        tip: "わからない時は正直に → いつまでに返すかを約束。",
        model: "That's a great question, but I don't have the exact number right now. Let me check with my team and get back to you by Friday.",
        modelJa: "良い質問ですが、今は正確な数字を持っていません。チームに確認して、金曜までにご連絡します。",
        phrases: ["don't have", "let me check", "get back to you"]
      },
      {
        q: "Can you also explain how this connects to our TV strategy, our store events, and our new website?",
        ja: "テレビ戦略、店舗イベント、新しいウェブサイトとどうつながるかも説明してもらえますか？",
        tip: "大きすぎる質問は「まず1つだけ」と絞る。",
        model: "That's a big question, so let me start with one part. For the website, we will link every post to a special campaign page. We can talk about TV and events in our next meeting.",
        modelJa: "大きなご質問なので、まず1つから。ウェブサイトについては、全投稿を特設ページにリンクします。テレビとイベントは次回の打ち合わせでお話しできます。",
        phrases: ["let me start with", "for the", "next meeting"]
      },
      {
        q: "Sorry, I didn't quite follow the part about the influencers. What did you mean?",
        ja: "すみません、インフルエンサーのところがよくわかりませんでした。どういう意味ですか？",
        tip: "In other words / Simply put で、もっと簡単に言い直す。",
        model: "No problem. Simply put, we will ask ten influencers to post first, so that normal users feel comfortable joining. In other words, they start the wave.",
        modelJa: "大丈夫です。簡単に言うと、まず10人のインフルエンサーに投稿してもらい、一般ユーザーが参加しやすくします。つまり、彼らが波を起こすんです。",
        phrases: ["no problem", "simply put", "in other words"]
      },
      {
        q: "We're almost out of time. Could you summarize your proposal in one sentence?",
        ja: "時間がほとんどありません。提案を一文でまとめてもらえますか？",
        tip: "In short, 〜. の一文を、プレゼン前に必ず用意しておく。",
        model: "In short, we want to turn your customers into your best advertisers with one simple photo campaign.",
        modelJa: "要するに、シンプルな写真キャンペーンひとつで、お客様を最高の広告塔にしたいということです。",
        phrases: ["in short"]
      }
    ]
  }
];

// ============ Role Play: 分岐する会話 ============
// nodes[id] = { them, ja, replies: [{ en, ja, next }] }。next が null なら会話終了
const ROLEPLAYS = [
  {
    id: "rp1",
    icon: "🎤",
    title: "After the Presentation",
    desc: "プレゼン後、参加者が話しかけてきた。",
    partner: "Emma",
    start: "a",
    nodes: {
      a: { them: "Hi! That was a great presentation. I really enjoyed it.", ja: "こんにちは！素晴らしいプレゼンでした。とても楽しかったです。",
        replies: [
          { en: "Thank you so much! I'm glad you enjoyed it.", ja: "ありがとうございます！楽しんでもらえてうれしいです。", next: "b" },
          { en: "Thanks! I was a little nervous, to be honest.", ja: "ありがとう！正直、少し緊張していました。", next: "c" }
        ] },
      b: { them: "Which part was the most difficult to prepare?", ja: "準備で一番大変だったのはどこですか？",
        replies: [
          { en: "The data part. It took a long time to collect the numbers.", ja: "データの部分です。数字を集めるのに時間がかかりました。", next: "d" },
          { en: "Making it simple. I had too many ideas at first.", ja: "シンプルにすることです。最初はアイデアが多すぎて。", next: "d" }
        ] },
      c: { them: "Really? You didn't look nervous at all!", ja: "本当に？全然緊張しているようには見えませんでした！",
        replies: [
          { en: "That's good to hear. I practiced a lot.", ja: "それを聞いて安心しました。たくさん練習したので。", next: "b" },
          { en: "Really? That's nice of you to say.", ja: "本当に？そう言ってもらえてうれしいです。", next: "b" }
        ] },
      d: { them: "I see. By the way, I work in marketing too. Could we keep in touch?", ja: "なるほど。ところで私もマーケティングの仕事をしています。連絡を取り合えますか？",
        replies: [
          { en: "Of course! Here's my card. Let's connect on LinkedIn too.", ja: "もちろん！名刺をどうぞ。LinkedInでもつながりましょう。", next: "e" },
          { en: "Sure. What kind of marketing do you do?", ja: "ぜひ。どんなマーケティングをされているんですか？", next: "f" }
        ] },
      f: { them: "Mostly digital ads for food brands. I'd love to hear more about your campaign sometime.", ja: "主に食品ブランドのデジタル広告です。いつかあなたのキャンペーンの話をもっと聞きたいです。",
        replies: [
          { en: "That sounds interesting. Let's have coffee next week!", ja: "面白そうですね。来週コーヒーでもどうですか！", next: "e" }
        ] },
      e: { them: "Perfect. It was really nice meeting you!", ja: "いいですね。お会いできて本当によかったです！",
        replies: [
          { en: "Nice meeting you too. Thanks again for coming!", ja: "こちらこそ。来てくれてありがとう！", next: null }
        ] }
    }
  },
  {
    id: "rp2",
    icon: "☕",
    title: "Coffee Break",
    desc: "カンファレンスの休憩中、隣の人と雑談。",
    partner: "Daniel",
    start: "a",
    nodes: {
      a: { them: "Hi, is this seat taken?", ja: "こんにちは、この席空いてますか？",
        replies: [
          { en: "No, please go ahead.", ja: "いえ、どうぞ。", next: "b" },
          { en: "Not at all. Have a seat.", ja: "全然。どうぞ座ってください。", next: "b" }
        ] },
      b: { them: "Thanks. So, what brings you to this conference?", ja: "ありがとう。このカンファレンスにはどうして来たんですか？",
        replies: [
          { en: "I'm here to learn about new trends in advertising.", ja: "広告の新しいトレンドを学びに来ました。", next: "c" },
          { en: "My company sent me. I'm actually giving a talk tomorrow.", ja: "会社に送り込まれました。実は明日登壇するんです。", next: "d" }
        ] },
      c: { them: "Me too. Have you seen any good sessions so far?", ja: "私もです。ここまでで良いセッションはありました？",
        replies: [
          { en: "Yes, the one about short videos was really useful.", ja: "はい、ショート動画のセッションがすごく役に立ちました。", next: "e" },
          { en: "Not yet. Do you have any recommendations?", ja: "まだです。おすすめはありますか？", next: "e" }
        ] },
      d: { them: "Oh, wow! What's your talk about?", ja: "わあ！何について話すんですか？",
        replies: [
          { en: "It's about how to make people share ads on social media.", ja: "人にSNSで広告をシェアしてもらう方法についてです。", next: "e" }
        ] },
      e: { them: "Nice. Where are you from, by the way?", ja: "いいですね。ところで、どちらから来たんですか？",
        replies: [
          { en: "I'm from Tokyo. Have you ever been to Japan?", ja: "東京からです。日本に行ったことはありますか？", next: "f" },
          { en: "Japan. This is my first time here.", ja: "日本です。ここは初めてなんです。", next: "g" }
        ] },
      f: { them: "Once, for a week. I loved the food, especially the ramen!", ja: "一度だけ、1週間。食べ物が大好きでした、特にラーメン！",
        replies: [
          { en: "Next time, you should try ramen in Fukuoka. It's amazing.", ja: "次は福岡のラーメンを食べてみて。最高ですよ。", next: "h" }
        ] },
      g: { them: "Welcome! How do you like it so far?", ja: "ようこそ！ここまでどうですか？",
        replies: [
          { en: "I love it. Everyone is so friendly.", ja: "最高です。みんなとても親切で。", next: "h" }
        ] },
      h: { them: "Oh, looks like the next session is starting. Good luck with everything!", ja: "あ、次のセッションが始まるみたい。いろいろ頑張って！",
        replies: [
          { en: "Thanks, you too! Enjoy the rest of the conference.", ja: "ありがとう、あなたも！残りも楽しんで。", next: null }
        ] }
    }
  },
  {
    id: "rp3",
    icon: "💻",
    title: "Online Meeting",
    desc: "オンライン会議の始まり。トラブルもある。",
    partner: "Mark",
    start: "a",
    nodes: {
      a: { them: "Hi everyone. Can you hear me okay?", ja: "皆さんこんにちは。声は聞こえますか？",
        replies: [
          { en: "Yes, I can hear you clearly.", ja: "はい、はっきり聞こえます。", next: "b" },
          { en: "Sorry, your voice is breaking up a little.", ja: "すみません、少し音声が途切れています。", next: "c" }
        ] },
      c: { them: "How about now? I moved closer to my router.", ja: "今はどうですか？ルーターの近くに移動しました。",
        replies: [
          { en: "Much better, thank you.", ja: "ずっと良くなりました、ありがとう。", next: "b" }
        ] },
      b: { them: "Great. Before we start, how's everything on your side? It must be late in Tokyo.", ja: "よかった。始める前に、そちらはどうですか？東京はもう遅い時間ですよね。",
        replies: [
          { en: "Yes, it's nine p.m. here, but I'm fine.", ja: "はい、こちらは夜9時ですが、大丈夫です。", next: "d" },
          { en: "It's okay. I had a big coffee, so I'm ready!", ja: "大丈夫です。コーヒーをたっぷり飲んだので準備万端です！", next: "d" }
        ] },
      d: { them: "Ha ha, good. So, would you like to share your screen and walk us through the plan?", ja: "ははは、よかった。では画面を共有して、プランを説明してもらえますか？",
        replies: [
          { en: "Sure. Let me share my screen. Can you see it now?", ja: "はい。画面を共有しますね。見えていますか？", next: "e" }
        ] },
      e: { them: "Hmm, I can only see a black screen.", ja: "うーん、黒い画面しか見えません。",
        replies: [
          { en: "Sorry about that. Let me try again. How about now?", ja: "失礼しました。もう一度やってみます。今はどうですか？", next: "f" },
          { en: "Oh, I'll send the slides in the chat instead.", ja: "あ、代わりにチャットでスライドを送りますね。", next: "f" }
        ] },
      f: { them: "Perfect, I've got it now. Please go ahead.", ja: "完璧、見えました。どうぞ始めてください。",
        replies: [
          { en: "Thank you. Today, I'd like to talk about three things.", ja: "ありがとうございます。今日は3つのことについてお話しします。", next: null }
        ] }
    }
  },
  {
    id: "rp4",
    icon: "🍽",
    title: "Dinner with a Client",
    desc: "海外クライアントとの会食。仕事以外の話題も。",
    partner: "Sarah",
    start: "a",
    nodes: {
      a: { them: "Thank you for taking us to this restaurant. Everything looks delicious!", ja: "このお店に連れてきてくれてありがとう。全部おいしそう！",
        replies: [
          { en: "My pleasure. This place is famous for its tempura.", ja: "どういたしまして。ここは天ぷらで有名なんです。", next: "b" },
          { en: "I'm glad you like it. Is there anything you can't eat?", ja: "気に入ってもらえてよかった。食べられないものはありますか？", next: "c" }
        ] },
      c: { them: "I eat almost everything, but I'm not good with very spicy food.", ja: "ほとんど何でも食べますが、すごく辛いものは苦手です。",
        replies: [
          { en: "No worries. Japanese food is usually not spicy.", ja: "大丈夫ですよ。和食はたいてい辛くないです。", next: "b" }
        ] },
      b: { them: "So, what do you like to do on weekends?", ja: "ところで、週末は何をするのが好きですか？",
        replies: [
          { en: "I like visiting museums and cafes.", ja: "美術館やカフェに行くのが好きです。", next: "d" },
          { en: "Honestly, I'm studying English these days!", ja: "正直、最近は英語の勉強をしています！", next: "e" }
        ] },
      d: { them: "That sounds relaxing. Any favorite museum in Tokyo?", ja: "リラックスできそう。東京で好きな美術館はありますか？",
        replies: [
          { en: "I love a small art museum near my office. Maybe I can take you there.", ja: "オフィスの近くの小さな美術館が好きです。今度ご案内しますね。", next: "f" }
        ] },
      e: { them: "Really? Your English is already very good!", ja: "本当に？もう英語とても上手ですよ！",
        replies: [
          { en: "Thank you. I want to speak more naturally in meetings.", ja: "ありがとう。会議でもっと自然に話したくて。", next: "f" }
        ] },
      f: { them: "I'd like that. Shall we make a toast to our project?", ja: "ぜひ。プロジェクトに乾杯しましょうか？",
        replies: [
          { en: "Yes! To a successful launch. Cheers!", ja: "はい！ローンチの成功に。乾杯！", next: null }
        ] }
    }
  }
];

// ============ Quick Response: 瞬間英作文 ============
const QUICK_SETS = [
  {
    id: "qr1",
    title: "プレゼンの始め方・つなぎ",
    items: [
      { ja: "今日は3つのことについてお話しします。", en: "Today, I'd like to talk about three things." },
      { ja: "まず、背景から始めます。", en: "First, let me start with the background." },
      { ja: "次のスライドをご覧ください。", en: "Please take a look at the next slide." },
      { ja: "ここが一番大事なポイントです。", en: "This is the most important point." },
      { ja: "では、次に進みましょう。", en: "Now, let's move on." },
      { ja: "まとめると、私たちの目標は売上を伸ばすことです。", en: "To sum up, our goal is to increase sales." },
      { ja: "ご清聴ありがとうございました。", en: "Thank you for your attention." },
      { ja: "何か質問はありますか？", en: "Do you have any questions?" }
    ]
  },
  {
    id: "qr2",
    title: "質疑応答の決まり文句",
    items: [
      { ja: "良い質問ですね。", en: "That's a good question." },
      { ja: "もう一度言っていただけますか？", en: "Could you say that again?" },
      { ja: "ご質問は予算についてということですね？", en: "So your question is about the budget, right?" },
      { ja: "確認して後ほどご連絡します。", en: "Let me check and get back to you." },
      { ja: "おっしゃることはわかります。", en: "I see what you mean." },
      { ja: "簡単に言うと、それはテストです。", en: "Simply put, it's a test." },
      { ja: "その点については後で話させてください。", en: "Let me talk about that later." },
      { ja: "お答えになっていますか？", en: "Does that answer your question?" }
    ]
  },
  {
    id: "qr3",
    title: "会議・雑談",
    items: [
      { ja: "お時間をいただきありがとうございます。", en: "Thank you for your time." },
      { ja: "その意見に賛成です。", en: "I agree with that idea." },
      { ja: "ちょっと付け加えてもいいですか？", en: "Can I add something?" },
      { ja: "それは良さそうですね。", en: "That sounds good." },
      { ja: "週末はどうでしたか？", en: "How was your weekend?" },
      { ja: "お仕事は何をされていますか？", en: "What do you do?" },
      { ja: "また近いうちに話しましょう。", en: "Let's talk again soon." },
      { ja: "お会いできてよかったです。", en: "It was nice meeting you." }
    ]
  }
];

// ============ Stories: 楽しく読む → 話す ============
const STORIES = [
  {
    id: "s1",
    emoji: "🛗",
    title: "The 30-Second Pitch",
    genre: "Short story",
    level: "やさしい",
    text: `Mika was a junior designer. One morning, she stepped into the elevator, and the company president stepped in after her. He smiled and asked, "So, what are you working on these days?"

Her mind went blank. The elevator would reach his floor in about thirty seconds. Then she remembered her team's motto: one idea, one reason, one example.

"I'm working on a campaign that turns customers into photographers," she said. "People trust photos from friends more than ads. For example, our test post got five times more likes than our normal ads."

The doors opened. The president stopped and held the door. "Interesting," he said. "Send me the plan this afternoon."

Mika didn't remember walking back to her desk. But she remembered one thing forever: a short, clear answer can open doors — sometimes literally.`,
    glossary: [
      { w: "junior", ja: "若手の" }, { w: "president", ja: "社長" }, { w: "went blank", ja: "真っ白になった" },
      { w: "motto", ja: "モットー" }, { w: "trust", ja: "信頼する" }, { w: "literally", ja: "文字どおり" }
    ],
    questions: [
      { q: "What rule helped Mika answer?", choices: ["Speak slowly and clearly", "One idea, one reason, one example", "Always ask a question back"], a: 1 },
      { q: "What did the president ask her to do?", choices: ["Send the plan that afternoon", "Join his team", "Take photos of customers"], a: 0 }
    ],
    talk: { q: "What are you working on these days? Answer in thirty seconds, like Mika.", ja: "最近何に取り組んでいますか？ミカのように30秒で答えてみよう。",
      sample: "I'm working on a new social media campaign for a snack brand. I think short videos work best, because people watch them till the end. For example, our last video got twice as many views." }
  },
  {
    id: "s2",
    emoji: "🧠",
    title: "Stories Beat Slides",
    genre: "Essay",
    level: "ふつう",
    text: `Think about the last presentation you saw. Do you remember the numbers on the slides? Probably not. But you might remember a story the speaker told.

There is a simple reason for this. When we hear a list of facts, we try to store each one. When we hear a story, our brain follows a path: there is a person, a problem, and a change. A path is much easier to remember than a pile of facts.

This is why good speakers often start with "Let me tell you about a customer." Then they show the data. The story gives the numbers a place to live.

Next time you prepare a presentation, try this: before the first slide, write one short story. Who had a problem? What changed? If your audience remembers that story, they will remember your message too.`,
    glossary: [
      { w: "probably", ja: "たぶん" }, { w: "store", ja: "記憶する、保存する" }, { w: "path", ja: "道筋" },
      { w: "pile", ja: "山、積み重ね" }, { w: "audience", ja: "聴衆" }, { w: "message", ja: "伝えたいこと" }
    ],
    questions: [
      { q: "Why are stories easier to remember, according to the writer?", choices: ["They are shorter than lists", "They follow a path of person, problem and change", "They use more numbers"], a: 1 },
      { q: "What does the writer suggest doing before the first slide?", choices: ["Write one short story", "Check all the numbers", "Practice in front of a mirror"], a: 0 }
    ],
    talk: { q: "Tell a short story about a customer or a person who had a problem, and what changed.", ja: "問題を抱えていたお客さん（または誰か）と、何が変わったかを短い話にしてみよう。",
      sample: "One of our customers was a small bakery. They had great bread, but nobody knew about it. We helped them post one photo a day on Instagram. After three months, there was a line in front of the shop every morning." }
  },
  {
    id: "s3",
    emoji: "☔",
    title: "A Very Wet Day in London",
    genre: "Short story",
    level: "やさしい",
    text: `On my first business trip to London, I wanted to look perfect. I wore my best suit and new leather shoes. The weather app said "light rain," so I left my umbrella at the hotel.

That was a mistake. By the time I reached the office, I looked like I had just come out of a swimming pool. My shoes made a funny squeaking sound with every step.

The receptionist looked at me and laughed — kindly. "Welcome to London," she said, and handed me a towel. In the meeting room, my client said, "Don't worry, it happens to all of us. In London, 'light rain' means 'bring a boat.'"

Everyone laughed, and the meeting started in a warm, relaxed mood. I learned two things that day: always carry an umbrella in London, and a little bad luck can be a great icebreaker.`,
    glossary: [
      { w: "business trip", ja: "出張" }, { w: "leather", ja: "革の" }, { w: "squeaking", ja: "キュッキュッと鳴る" },
      { w: "receptionist", ja: "受付係" }, { w: "mood", ja: "雰囲気" }, { w: "icebreaker", ja: "場を和ませるもの" }
    ],
    questions: [
      { q: "Why did the writer get wet?", choices: ["The hotel had no umbrellas", "They left their umbrella at the hotel", "They walked to a swimming pool"], a: 1 },
      { q: "How did the meeting start?", choices: ["In a relaxed mood", "Very late", "With a serious problem"], a: 0 }
    ],
    talk: { q: "Tell me about a small mistake or bad luck you had on a trip or at work.", ja: "旅行や仕事でのちょっとした失敗・不運を話してみよう。",
      sample: "Once, I went to a meeting on the wrong day. I arrived at the office, and nobody was there. I felt so embarrassed, but my client thought it was funny. Now we always laugh about it." }
  },
  {
    id: "s4",
    emoji: "⏸",
    title: "The Power of the Pause",
    genre: "Tips",
    level: "ふつう",
    text: `Many people think that good speakers talk without stopping. In fact, the opposite is often true. Great speakers use silence.

When someone asks you a difficult question, it is natural to feel pressure to answer right away. But a short pause of two or three seconds does not look weak. It looks thoughtful. It tells the audience, "I am taking your question seriously."

A pause also helps you. It gives you time to choose your first sentence. Many speakers use a simple phrase to fill that moment, like "That's a good question" or "Let me think about that for a second."

So, the next time you face a hard question, don't panic. Breathe, pause, and then answer. Your audience will not hear silence. They will hear confidence.`,
    glossary: [
      { w: "opposite", ja: "反対" }, { w: "silence", ja: "沈黙" }, { w: "pressure", ja: "プレッシャー" },
      { w: "thoughtful", ja: "思慮深い" }, { w: "panic", ja: "慌てる" }, { w: "confidence", ja: "自信" }
    ],
    questions: [
      { q: "How does a short pause look to the audience?", choices: ["Weak", "Thoughtful", "Rude"], a: 1 },
      { q: "What is one way to fill the pause?", choices: ["Say \"Let me think about that for a second\"", "Look at your phone", "Change the slide"], a: 0 }
    ],
    talk: { q: "What do you do when you get a difficult question? Try using a pause before you answer!", ja: "難しい質問をされたらどうする？答える前に「間」を使ってみよう。",
      sample: "That's a good question. Let me think for a second. Usually, I try to repeat the question first. It helps me understand it, and it gives me a little time to think." }
  },
  {
    id: "s5",
    emoji: "💬",
    title: "Small Talk Is Not Small",
    genre: "Essay",
    level: "ふつう",
    text: `Some people hate small talk. "Why talk about the weather?" they ask. "Let's just talk about business."

But small talk has an important job. It is not really about the weather. It is a way of saying, "I am friendly, and you can relax with me." In many countries, people want to know you a little before they work with you.

The good news is that small talk follows simple patterns. Ask an easy question: "How was your weekend?" Listen for one interesting word in the answer. Then ask about that word: "Oh, you went hiking? Where did you go?"

You don't need perfect English for this. You need curiosity. If you are interested in the other person, the conversation will keep going — and the business talk that comes later will be much easier.`,
    glossary: [
      { w: "small talk", ja: "雑談" }, { w: "relax", ja: "くつろぐ" }, { w: "patterns", ja: "型、パターン" },
      { w: "hiking", ja: "ハイキング" }, { w: "curiosity", ja: "好奇心" }, { w: "conversation", ja: "会話" }
    ],
    questions: [
      { q: "What is the real job of small talk?", choices: ["To share weather information", "To show you are friendly and help people relax", "To finish meetings quickly"], a: 1 },
      { q: "What should you do after asking an easy question?", choices: ["Talk about business", "Listen for one interesting word and ask about it", "Tell your own story"], a: 1 }
    ],
    talk: { q: "How was your weekend? Tell me what you did, and add one detail.", ja: "週末はどうだった？やったことと、ひとつ具体的なエピソードを。",
      sample: "It was nice, thank you. On Saturday, I went to a new cafe near my house. They had amazing cheesecake, so I think I'll go back next weekend." }
  },
  {
    id: "s6",
    emoji: "☕",
    title: "The Coffee Machine Mystery",
    genre: "Short story",
    level: "やさしい",
    text: `Every morning at nine, the coffee machine on the fifth floor was empty. Every morning, someone had to make a new pot. And every morning, people complained: "Who keeps drinking all the coffee?"

Tom from accounting decided to solve the mystery. On Monday, he came in at eight. He hid behind a plant with a notebook. At 8:15, the cleaner came and filled the machine. At 8:30, the sales team arrived and took four cups each. By 8:45, the pot was empty.

At the team meeting, Tom showed his notes like a detective. Everyone laughed. The sales team apologized and promised to make the next pot. The next day, there was a new sign on the machine: "Last cup? Make a new pot. — The Management (and Tom)."

Since then, the coffee has never run out.`,
    glossary: [
      { w: "complained", ja: "文句を言った" }, { w: "accounting", ja: "経理" }, { w: "solve", ja: "解決する" },
      { w: "detective", ja: "探偵" }, { w: "apologized", ja: "謝った" }, { w: "run out", ja: "なくなる" }
    ],
    questions: [
      { q: "Who drank most of the coffee?", choices: ["The cleaner", "The sales team", "Tom"], a: 1 },
      { q: "What did the new sign say to do?", choices: ["Make a new pot after the last cup", "Drink only one cup", "Come in at eight"], a: 0 }
    ],
    talk: { q: "Describe a funny or strange thing that happened at your office or school.", ja: "職場や学校で起きた、面白い・不思議な出来事を話してみよう。",
      sample: "At my office, someone always leaves a snack on my desk, but I don't know who. It has happened for two months. I think it's my manager, but she says it isn't her." }
  }
];

// ============ AI Talk: 話題のヒント ============
const AI_TOPICS = [
  { label: "週末の話", en: "weekend plans and hobbies" },
  { label: "仕事の紹介", en: "my job and what I do every day" },
  { label: "好きな広告", en: "an advertisement or campaign I like" },
  { label: "旅行", en: "travel and places I want to visit" },
  { label: "食べ物", en: "favorite food and restaurants in Tokyo" },
  { label: "最近のニュース", en: "an interesting trend I noticed recently" }
];
