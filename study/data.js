// ============ reading passages (TOEIC Part 7 style) ============
// targetSec: TOEIC本番ペース(1問あたり約60秒)を目安にした目標時間
const PASSAGES = [
  {
    id: "r01",
    type: "E-mail",
    title: "Office Relocation",
    level: "basic",
    targetSec: 120,
    text: `To: All Staff
From: Karen Mills, Office Manager
Subject: Office relocation

Dear colleagues,

As announced last month, our team will relocate to the third floor of the Harbor Building on May 12. Movers will arrive on Friday afternoon, so please pack your personal belongings in the boxes provided by Thursday evening. Label each box with your name and new desk number.

The IT department will reconnect all computers over the weekend. If your equipment does not work properly on Monday morning, please contact the help desk at extension 204.

Thank you for your cooperation.`,
    ja: "宛先：全スタッフ\n差出人：カレン・ミルズ（オフィスマネージャー）\n件名：オフィス移転\n\n同僚の皆さま\n\n先月お知らせしたとおり、私たちのチームは5月12日にハーバービルの3階へ移転します。金曜日の午後に引越し業者が来るので、木曜日の夜までに、支給された箱に私物を詰めてください。各箱には名前と新しい座席番号のラベルを貼ってください。\n\nIT部門が週末のうちにすべてのコンピューターを接続し直します。月曜の朝に機器が正常に動かない場合は、内線204のヘルプデスクに連絡してください。\n\nご協力ありがとうございます。",
    glossary: [
      { w: "relocate", ja: "移転する" },
      { w: "belongings", ja: "所持品" },
      { w: "provided", ja: "支給された" },
      { w: "label", ja: "ラベルを貼る" },
      { w: "equipment", ja: "機器・備品" },
      { w: "properly", ja: "正常に、きちんと" },
      { w: "extension", ja: "内線" },
      { w: "cooperation", ja: "協力" }
    ],
    questions: [
      {
        q: "What is the purpose of the e-mail?",
        choices: [
          "To announce a new office manager",
          "To give instructions about an office move",
          "To introduce a new IT system",
          "To request volunteers for the weekend"
        ],
        answer: 1,
        evidence: ["our team will relocate to the third floor of the Harbor Building on May 12", "please pack your personal belongings in the boxes provided by Thursday evening"],
        explain: "冒頭で移転日を伝え、荷造りやラベル貼りの指示をしているので「移転に関する指示」が目的。"
      },
      {
        q: "By when should employees pack their belongings?",
        choices: ["Monday morning", "Thursday evening", "Friday afternoon", "May 12"],
        answer: 1,
        evidence: ["please pack your personal belongings in the boxes provided by Thursday evening"],
        explain: "\"pack your personal belongings ... by Thursday evening\" とある。金曜午後は業者が来る時間なので注意。"
      }
    ]
  },
  {
    id: "r02",
    type: "Notice",
    title: "Library Renovation",
    level: "basic",
    targetSec: 120,
    text: `NOTICE TO ALL VISITORS

The Westfield Public Library will be closed from June 3 to June 17 for renovation work. During this period, new shelves will be installed and the reading room will be expanded.

Books that are due during the closure may be returned to the drop box located beside the main entrance. No late fees will be charged for items due during this time.

Online services, including e-book loans, will remain available. We apologize for any inconvenience and look forward to welcoming you to our improved facility.`,
    ja: "ご来館の皆さまへのお知らせ\n\nウェストフィールド公共図書館は、改装工事のため6月3日から6月17日まで休館します。この期間中に新しい本棚が設置され、閲覧室が広くなります。\n\n休館中に返却期限を迎える本は、正面玄関の横にある返却ボックスに返却できます。この期間に期限を迎える資料には、延滞料はかかりません。\n\n電子書籍の貸し出しを含むオンラインサービスは、引き続きご利用いただけます。ご不便をおかけして申し訳ありません。改装後の施設で皆さまをお迎えするのを楽しみにしております。",
    glossary: [
      { w: "renovation", ja: "改装" },
      { w: "installed", ja: "設置される" },
      { w: "expanded", ja: "拡張される" },
      { w: "due", ja: "期限の" },
      { w: "closure", ja: "閉鎖(期間)" },
      { w: "located", ja: "位置している" },
      { w: "late fees", ja: "延滞料" },
      { w: "inconvenience", ja: "不便" },
      { w: "facility", ja: "施設" }
    ],
    questions: [
      {
        q: "What will happen during the closure?",
        choices: [
          "Staff will be trained",
          "The reading room will be made larger",
          "Old books will be sold",
          "The entrance will be moved"
        ],
        answer: 1,
        evidence: ["the reading room will be expanded"],
        explain: "\"the reading room will be expanded\" の言い換え。expanded = made larger。"
      },
      {
        q: "What is indicated about the library's online services?",
        choices: [
          "They will be unavailable",
          "They require a new password",
          "They will continue to operate",
          "They will charge a fee"
        ],
        answer: 2,
        evidence: ["Online services, including e-book loans, will remain available"],
        explain: "\"will remain available\" = 引き続き利用できる。TOEICは本文の言い換えを選ぶ問題が多い。"
      }
    ]
  },
  {
    id: "r03",
    type: "Advertisement",
    title: "Green Table Catering",
    level: "basic",
    targetSec: 150,
    text: `Green Table Catering — Fresh Food for Every Occasion

Planning a business lunch, a product launch, or a company party? Green Table Catering offers a wide selection of dishes made with locally grown ingredients.

This month only, first-time customers will receive 15 percent off any order of over $300. Orders must be placed at least three days in advance. Free delivery is available within the city limits.

To view our full menu or to request a quote, visit www.greentablecatering.com or call 555-0182.`,
    ja: "グリーンテーブル・ケータリング ― あらゆる場面に新鮮な料理を\n\nビジネスランチ、新商品の発表会、会社のパーティーを計画中ですか？グリーンテーブル・ケータリングは、地元で育った食材を使った豊富な料理をご用意しています。\n\n今月限定で、初めてのお客様は、300ドルを超えるご注文が15%引きになります。ご注文は少なくとも3日前までにお願いします。市内であれば配達は無料です。\n\nメニューの全体をご覧になるか、見積もりをご依頼になる場合は、www.greentablecatering.com にアクセスするか、555-0182までお電話ください。",
    glossary: [
      { w: "occasion", ja: "行事・機会" },
      { w: "launch", ja: "発売(イベント)" },
      { w: "selection", ja: "品ぞろえ" },
      { w: "ingredients", ja: "材料" },
      { w: "in advance", ja: "前もって" },
      { w: "within", ja: "〜以内で" },
      { w: "quote", ja: "見積もり" }
    ],
    questions: [
      {
        q: "What is mentioned about the food?",
        choices: [
          "It is imported from abroad",
          "It uses ingredients from the local area",
          "It is prepared at the customer's office",
          "It is suitable for vegetarians only"
        ],
        answer: 1,
        evidence: ["dishes made with locally grown ingredients"],
        explain: "\"locally grown ingredients\" = 地元で育った材料。"
      },
      {
        q: "Who is eligible for the discount?",
        choices: [
          "Customers who order every month",
          "Any customer who orders three days ahead",
          "New customers whose order exceeds $300",
          "Customers living outside the city"
        ],
        answer: 2,
        evidence: ["first-time customers will receive 15 percent off any order of over $300"],
        explain: "\"first-time customers ... any order of over $300\" の言い換え。first-time = new、over = exceeds。"
      },
      {
        q: "How can customers get a price estimate?",
        choices: ["By visiting the store", "By sending a letter", "By visiting a Web site", "By attending a party"],
        answer: 2,
        evidence: ["To view our full menu or to request a quote, visit www.greentablecatering.com"],
        explain: "\"to request a quote, visit www...\" とある。quote = price estimate。"
      }
    ]
  },
  {
    id: "r04",
    type: "Text messages",
    title: "Delivery Delay",
    level: "basic",
    targetSec: 120,
    text: `Tom Becker [9:42 A.M.]
Hi Lisa, the printer paper we ordered still hasn't arrived. Do you know anything about it?

Lisa Chen [9:45 A.M.]
I just checked the tracking number. The truck was delayed by the snowstorm, so it should arrive tomorrow instead.

Tom Becker [9:46 A.M.]
That's a problem. I need to print the handouts for this afternoon's client meeting.

Lisa Chen [9:48 A.M.]
I'll pick up a few packs at the stationery store on my way back from lunch.

Tom Becker [9:49 A.M.]
That would be great. Thanks!`,
    ja: "トム・ベッカー［午前9時42分］\nリサ、注文したプリンター用紙がまだ届いていないんだ。何か知ってる？\n\nリサ・チェン［午前9時45分］\n今、追跡番号を確認したよ。吹雪でトラックが遅れているから、代わりに明日届くはず。\n\nトム・ベッカー［午前9時46分］\nそれは困ったな。今日の午後の顧客との会議用に、配布資料を印刷しないといけないんだ。\n\nリサ・チェン［午前9時48分］\nお昼から戻るときに、文房具店で何パックか買ってくるね。\n\nトム・ベッカー［午前9時49分］\nそれはすごく助かる。ありがとう！",
    glossary: [
      { w: "tracking number", ja: "追跡番号" },
      { w: "delayed", ja: "遅れた" },
      { w: "instead", ja: "代わりに" },
      { w: "handouts", ja: "配布資料" },
      { w: "pick up", ja: "買ってくる・受け取る" },
      { w: "stationery", ja: "文房具" }
    ],
    questions: [
      {
        q: "Why has the order not arrived?",
        choices: [
          "The wrong address was used",
          "The weather caused a delay",
          "The item was out of stock",
          "The payment was not completed"
        ],
        answer: 1,
        evidence: ["The truck was delayed by the snowstorm"],
        explain: "\"delayed by the snowstorm\" = 天候による遅延。"
      },
      {
        q: "At 9:49 A.M., what does Mr. Becker mean when he writes, \"That would be great\"?",
        choices: [
          "He is pleased with the client meeting",
          "He likes the idea of having lunch together",
          "He appreciates Ms. Chen's offer to buy paper",
          "He wants the delivery to come tomorrow"
        ],
        answer: 2,
        evidence: ["I'll pick up a few packs at the stationery store on my way back from lunch."],
        explain: "意図問題。直前のLisaの「文房具店で紙を買ってくる」という申し出に感謝している。"
      }
    ]
  },
  {
    id: "r05",
    type: "Article",
    title: "Local Bakery Expands",
    level: "basic",
    targetSec: 150,
    text: `RIVERTON (April 8) — Sunrise Bakery, a family-owned business that opened on Main Street twelve years ago, announced on Monday that it will open a second location in the Lakeside Shopping Center this summer.

According to owner Maria Lopez, the new shop will be twice the size of the original store and will include a café area with seating for 40 customers. "Our customers have been asking for a place where they can sit and relax," Ms. Lopez said.

The bakery plans to hire around fifteen new employees, including bakers and cashiers. Applications are being accepted through the company's Web site until May 15.`,
    ja: "リバートン（4月8日）― 12年前にメインストリートで開業した家族経営のサンライズ・ベーカリーは月曜日、今年の夏にレイクサイド・ショッピングセンターに2号店を開くと発表した。\n\nオーナーのマリア・ロペス氏によると、新店舗は元の店の2倍の広さで、40席のカフェスペースを備える予定だ。「お客様から、座ってくつろげる場所がほしいとずっと言われていたんです」とロペス氏は話した。\n\n同ベーカリーは、パン職人やレジ係を含む約15人の従業員を新たに雇う予定だ。応募は5月15日まで、同社のウェブサイトで受け付けている。",
    glossary: [
      { w: "family-owned", ja: "家族経営の" },
      { w: "location", ja: "店舗・拠点" },
      { w: "according to", ja: "〜によると" },
      { w: "original", ja: "元の・最初の" },
      { w: "seating", ja: "座席" },
      { w: "hire", ja: "雇う" },
      { w: "applications", ja: "応募(書類)" },
      { w: "accepted", ja: "受け付けられる" }
    ],
    questions: [
      {
        q: "What is the article mainly about?",
        choices: [
          "A bakery's new business opening",
          "A change in bakery ownership",
          "A cooking contest on Main Street",
          "The closing of a shopping center"
        ],
        answer: 0,
        evidence: ["announced on Monday that it will open a second location in the Lakeside Shopping Center this summer"],
        explain: "主題問題は第1段落を見る。2号店のオープンが中心テーマ。"
      },
      {
        q: "What is indicated about the new shop?",
        choices: [
          "It will be on Main Street",
          "It will be smaller than the first store",
          "It will have a place for customers to sit",
          "It will open in May"
        ],
        answer: 2,
        evidence: ["will include a café area with seating for 40 customers"],
        explain: "\"a café area with seating for 40 customers\" の言い換え。サイズは2倍、場所はLakeside、開店は夏。"
      },
      {
        q: "How can people apply for a job?",
        choices: ["In person at the store", "Through a Web site", "By phone", "By e-mail to Ms. Lopez"],
        answer: 1,
        evidence: ["Applications are being accepted through the company's Web site until May 15."],
        explain: "\"Applications are being accepted through the company's Web site\" とある。"
      }
    ]
  },
  {
    id: "r06",
    type: "Memo",
    title: "Expense Reports",
    level: "basic",
    targetSec: 120,
    text: `MEMO
To: Sales Department
From: Daniel Park, Finance
Date: October 1

Starting next month, all expense reports must be submitted through the new online system instead of on paper. Receipts should be scanned and attached to each report.

Reports must be submitted within 30 days of the expense. Late reports will not be processed until the following month.

A short training session on the new system will be held on October 10 in Conference Room B. Attendance is strongly recommended for anyone who travels for business.`,
    ja: "社内連絡\n宛先：営業部\n差出人：ダニエル・パーク（経理部）\n日付：10月1日\n\n来月から、すべての経費報告書は紙ではなく新しいオンラインシステムで提出しなければなりません。領収書はスキャンして、各報告書に添付してください。\n\n報告書は、経費が発生してから30日以内に提出してください。期限を過ぎた報告書は、翌月まで処理されません。\n\n新しいシステムの短い研修が、10月10日に会議室Bで行われます。出張がある人は、出席を強くおすすめします。",
    glossary: [
      { w: "expense reports", ja: "経費報告書" },
      { w: "submitted", ja: "提出される" },
      { w: "receipts", ja: "領収書" },
      { w: "attached", ja: "添付される" },
      { w: "processed", ja: "処理される" },
      { w: "following", ja: "次の" },
      { w: "attendance", ja: "出席" },
      { w: "recommended", ja: "推奨される" }
    ],
    questions: [
      {
        q: "What change is being announced?",
        choices: [
          "A new travel destination",
          "A new way to submit expense reports",
          "A reduction in travel budgets",
          "A new finance manager"
        ],
        answer: 1,
        evidence: ["all expense reports must be submitted through the new online system instead of on paper"],
        explain: "紙ではなくオンラインシステムで提出する、という変更。"
      },
      {
        q: "Who should attend the training session?",
        choices: [
          "Only finance staff",
          "New employees",
          "Employees who take business trips",
          "Conference room managers"
        ],
        answer: 2,
        evidence: ["Attendance is strongly recommended for anyone who travels for business."],
        explain: "\"anyone who travels for business\" = 出張する人。"
      }
    ]
  },
  {
    id: "r07",
    level: "800",
    type: "Web page + E-mail",
    title: "Marketing Summit (2文書)",
    targetSec: 300,
    text: `[文書1: Web page]
Northgate Marketing Summit — Registration

The Northgate Marketing Summit will take place at the Clayton Convention Center from September 18 to 20. Participants may choose one of the following registration options.

Standard Pass ($350): Access to all keynote speeches and panel discussions
Premium Pass ($520): Standard Pass benefits plus entry to hands-on workshops
Workshop-Only Pass ($200): Entry to workshops on September 20 only

Those who register before August 15 will receive a 10 percent discount. Groups of five or more from the same organization are eligible for an additional 5 percent off. Please note that workshop seating is limited and is assigned on a first-come, first-served basis.

[文書2: E-mail]
To: registration@northgatesummit.com
From: Hannah Ortiz <h.ortiz@brightlinemedia.com>
Date: August 20
Subject: Registration question

Hello,

I registered for the summit last week and selected the Standard Pass. However, my manager has just approved funding for me to attend the hands-on workshops as well, so I would like to change my registration. Could you tell me how much more I will need to pay?

Also, two of my colleagues will join me, but they have not registered yet. Would we qualify for any group discount?

Best regards,
Hannah Ortiz
Brightline Media`,
    ja: `[文書1: ウェブページ]
ノースゲート・マーケティング・サミット ― 参加登録

ノースゲート・マーケティング・サミットは、9月18日から20日まで、クレイトン・コンベンションセンターで開催されます。参加者は、次の登録プランから1つを選べます。

スタンダードパス（350ドル）：すべての基調講演とパネルディスカッションに参加できます
プレミアムパス（520ドル）：スタンダードパスの内容に加えて、実践ワークショップに参加できます
ワークショップのみのパス（200ドル）：9月20日のワークショップのみ参加できます

8月15日より前に登録した方は10%割引になります。同じ組織から5人以上で参加するグループは、さらに5%割引になります。ワークショップの席には限りがあり、先着順で割り当てられますのでご注意ください。

[文書2: Eメール]
宛先：registration@northgatesummit.com
差出人：ハンナ・オルティス <h.ortiz@brightlinemedia.com>
日付：8月20日
件名：登録についての質問

こんにちは

先週サミットに登録し、スタンダードパスを選びました。ですが、上司が実践ワークショップへの参加費用も出してくれることになったので、登録を変更したいと思います。追加でいくら支払えばよいか教えていただけますか？

また、同僚2人も一緒に参加する予定ですが、まだ登録していません。私たちはグループ割引の対象になりますか？

よろしくお願いいたします。
ハンナ・オルティス
ブライトライン・メディア`,
    glossary: [
      { w: "take place", ja: "開催される" },
      { w: "keynote", ja: "基調(講演)" },
      { w: "hands-on", ja: "実践的な" },
      { w: "eligible for", ja: "〜の対象になる" },
      { w: "first-come, first-served", ja: "先着順" },
      { w: "approved", ja: "承認した" },
      { w: "funding", ja: "資金" },
      { w: "qualify for", ja: "〜の資格を得る" }
    ],
    questions: [
      {
        q: "What is NOT mentioned about the summit?",
        choices: ["Its location", "Its registration options", "Its parking fees", "Its early registration discount"],
        answer: 2,
        evidence: ["Clayton Convention Center", "Those who register before August 15 will receive a 10 percent discount."],
        explain: "NOT問題。場所（Clayton Convention Center）、登録プラン、早期割引は書かれているが、駐車料金はどこにもない。NOT問題は、選択肢を1つずつ本文と照らし合わせて消していくのが確実。"
      },
      {
        q: "What is suggested about the workshops?",
        choices: ["They are held on all three days.", "They may fill up quickly.", "They are free for Standard Pass holders.", "They are led by keynote speakers."],
        answer: 1,
        evidence: ["workshop seating is limited and is assigned on a first-come, first-served basis"],
        explain: "suggested（推測）問題。「席に限りがあり先着順」→「すぐに満席になるかもしれない」と言える。本文にそのまま書いていなくても、確実に言える内容を選ぶ。"
      },
      {
        q: "Which pass does Ms. Ortiz most likely want to change to?",
        choices: ["Standard Pass", "Premium Pass", "Workshop-Only Pass", "A group pass"],
        answer: 1,
        evidence: ["attend the hands-on workshops as well", "Premium Pass ($520): Standard Pass benefits plus entry to hands-on workshops"],
        explain: "2文書を組み合わせる問題。メールの「ワークショップ“も”参加したい（as well）」と、ウェブページの「スタンダードの内容＋ワークショップ＝プレミアム」をつなげる。Workshop-Onlyだと講演に出られなくなるのでひっかけ。"
      },
      {
        q: "What is true about Ms. Ortiz's original registration?",
        choices: [
          "It was made before the early registration deadline.",
          "It included entry to the workshops.",
          "It was paid for by a colleague.",
          "It was submitted as part of a group."
        ],
        answer: 0,
        evidence: ["Date: August 20", "I registered for the summit last week", "Those who register before August 15 will receive a 10 percent discount."],
        explain: "メールの日付は8月20日で、登録したのは「先週」＝8月13日ごろ。ウェブページの早期割引の締め切り（8月15日）より前だとわかる。日付や数字は2文書をまたいで計算させる問題によく使われる。"
      },
      {
        q: "Why will Ms. Ortiz's team probably NOT receive the group discount?",
        choices: [
          "They registered too late.",
          "They work for different companies.",
          "There are fewer than five of them.",
          "They chose different passes."
        ],
        answer: 2,
        evidence: ["two of my colleagues will join me", "Groups of five or more from the same organization are eligible for an additional 5 percent off."],
        explain: "本人＋同僚2人＝3人。グループ割引は5人以上なので対象外。人数を自分で数える必要がある。"
      }
    ]
  },
  {
    id: "r08",
    level: "800",
    type: "Article",
    title: "Repair Service (文挿入)",
    targetSec: 240,
    text: `CEDAR FALLS (March 3) — Harlow Outdoor Gear announced yesterday that it will begin offering a repair service for its jackets, tents, and backpacks at all twelve of its stores. [1] Customers will be able to bring damaged items to any location, where trained staff will assess the damage and provide an estimate within 48 hours.

"Many of our customers keep their gear for ten years or longer," said CEO Patricia Wen. "We want to help them extend the life of the products they already love." [2]

The company expects the service to reduce waste and strengthen customer loyalty. Industry analysts note that similar programs at other retailers have generated steady foot traffic, as customers who drop off items often make additional purchases. [3]

Repairs will be free for items purchased within the past two years. For older items, prices will depend on the type of repair. [4] The service will launch on April 1.`,
    ja: `シーダーフォールズ（3月3日）― ハーロウ・アウトドアギアは昨日、全12店舗でジャケット、テント、バックパックの修理サービスを始めると発表した。[1] 客は傷んだ商品をどの店舗にも持ち込むことができ、研修を受けたスタッフが損傷を評価して、48時間以内に見積もりを出す。

「多くのお客様が、10年以上も道具を使い続けてくださっています」とCEOのパトリシア・ウェン氏は話した。「すでに愛用している商品を、より長く使えるようお手伝いしたいのです」[2]

同社は、このサービスによって廃棄物を減らし、顧客の愛着を強められると期待している。業界のアナリストによると、ほかの小売店の同様の取り組みでは、安定した来店客数が生まれているという。商品を預けに来た客が、ほかの商品も買っていくことが多いからだ。[3]

過去2年以内に購入した商品の修理は無料になる。それより古い商品は、修理の種類によって料金が変わる。[4] サービスは4月1日に始まる。

※ 挿入する文「価格表は、事前に同社のウェブサイトに掲載される予定だ。」は [4] に入る。`,
    glossary: [
      { w: "assess", ja: "評価する" },
      { w: "estimate", ja: "見積もり" },
      { w: "extend", ja: "延ばす" },
      { w: "loyalty", ja: "愛着・ひいき" },
      { w: "generated", ja: "生み出した" },
      { w: "foot traffic", ja: "来店客数" },
      { w: "drop off", ja: "預ける" },
      { w: "launch", ja: "始まる・開始する" }
    ],
    questions: [
      {
        q: "What is the article mainly about?",
        choices: ["The opening of new stores", "A company's new service", "A change in company leadership", "A sale on outdoor equipment"],
        answer: 1,
        evidence: ["it will begin offering a repair service for its jackets, tents, and backpacks at all twelve of its stores"],
        explain: "主題問題は第1段落の最初の文を見る。修理サービスを始める＝新しいサービスの話。"
      },
      {
        q: "The word \"assess\" in paragraph 1, line 3, is closest in meaning to",
        choices: ["repair", "evaluate", "report", "charge"],
        answer: 1,
        evidence: ["assess the damage"],
        explain: "語彙問題。assess the damage＝損傷を評価する。evaluate（評価する）が同じ意味。repairは文脈から連想しやすいひっかけ。単語の辞書的な意味より、文中での意味で選ぶ。"
      },
      {
        q: "According to the article, how might the service help increase sales?",
        choices: [
          "Repair prices will be high.",
          "Customers often buy other products when they visit.",
          "Fewer stores will be needed.",
          "Repaired products will be sold online."
        ],
        answer: 1,
        evidence: ["customers who drop off items often make additional purchases"],
        explain: "make additional purchases（追加で買う）＝buy other products の言い換え。"
      },
      {
        q: "In which of the positions marked [1], [2], [3], and [4] does the following sentence best belong?\n\"A price list will be posted on the company's Web site in advance.\"",
        choices: ["[1]", "[2]", "[3]", "[4]"],
        answer: 3,
        evidence: ["For older items, prices will depend on the type of repair."],
        explain: "文挿入問題。挿入文のキーワードは price list（価格表）。直前に「料金は修理の種類で変わる」とある [4] に入れると、「料金が変わる→だから価格表を事前に出す」と自然につながる。"
      }
    ]
  },
  {
    id: "r09",
    level: "800",
    type: "Online chat",
    title: "Video Shoot (チャット)",
    targetSec: 240,
    text: `Mark Ellis [10:02 A.M.]
Quick update: the client wants to move the product video shoot from Thursday to Tuesday.

Aiko Sato [10:03 A.M.]
Tuesday? The studio is already booked by another team that day.

Mark Ellis [10:04 A.M.]
I know. I'm checking whether we can use the rooftop instead.

Daniel Kim [10:06 A.M.]
The forecast for Tuesday looks clear, so that could actually work better for the outdoor scenes.

Aiko Sato [10:07 A.M.]
Good point. But we'd still need the lighting equipment, and it's stored in the studio.

Daniel Kim [10:08 A.M.]
Leave that to me. I'll arrange to have it moved on Monday evening.

Mark Ellis [10:09 A.M.]
Perfect. I'll let the client know we can make Tuesday work and send everyone a revised schedule by noon.`,
    ja: `マーク・エリス［午前10時2分］
取り急ぎ共有です。クライアントが、商品動画の撮影を木曜日から火曜日に変更したいそうです。

サトウ・アイコ［午前10時3分］
火曜日ですか？その日のスタジオは、別のチームがもう予約していますよ。

マーク・エリス［午前10時4分］
わかっています。代わりに屋上を使えるか確認しているところです。

ダニエル・キム［午前10時6分］
火曜日の予報は晴れなので、屋外のシーンにはむしろそのほうがいいかもしれません。

サトウ・アイコ［午前10時7分］
確かに。でも照明機材は必要で、それはスタジオに保管されています。

ダニエル・キム［午前10時8分］
それは任せてください。月曜日の夜に運んでもらうよう手配します。

マーク・エリス［午前10時9分］
完璧です。クライアントには火曜日で大丈夫だと伝えて、正午までに修正したスケジュールを全員に送ります。`,
    glossary: [
      { w: "booked", ja: "予約されている" },
      { w: "forecast", ja: "(天気)予報" },
      { w: "equipment", ja: "機材" },
      { w: "arrange", ja: "手配する" },
      { w: "revised", ja: "修正された" }
    ],
    questions: [
      {
        q: "What problem does Ms. Sato mention?",
        choices: ["The client has canceled the shoot.", "A location is unavailable.", "The weather will be bad.", "Some equipment is broken."],
        answer: 1,
        evidence: ["The studio is already booked by another team that day."],
        explain: "「スタジオは別のチームが予約済み」＝場所が使えない。is unavailable への言い換え。"
      },
      {
        q: "What is suggested about the rooftop?",
        choices: ["It is smaller than the studio.", "It requires special permission.", "It may be suitable for some scenes.", "It has its own lighting equipment."],
        answer: 2,
        evidence: ["that could actually work better for the outdoor scenes"],
        explain: "キムさんの「屋外のシーンにはむしろいいかも」から、一部のシーンに適していると推測できる。照明はスタジオから運ぶ必要があるので D は誤り。"
      },
      {
        q: "At 10:08 A.M., what does Mr. Kim most likely mean when he writes, \"Leave that to me\"?",
        choices: [
          "He will take care of moving the equipment.",
          "He wants to film the scenes by himself.",
          "He will contact the client.",
          "He disagrees with Ms. Sato."
        ],
        answer: 0,
        evidence: ["I'll arrange to have it moved on Monday evening."],
        explain: "意図問題。that が指すのは直前の「照明機材がスタジオにある」問題。直後の「月曜の夜に運ぶよう手配する」がヒント。意図問題は前後1〜2行を必ず読む。"
      },
      {
        q: "What will Mr. Ellis most likely do next?",
        choices: ["Book a different studio", "Inform the client of the new plan", "Check the weather forecast", "Cancel Thursday's meeting"],
        answer: 1,
        evidence: ["I'll let the client know we can make Tuesday work"],
        explain: "次の行動を問う問題は、最後のほうの I'll 〜 を探す。let the client know＝inform the client。"
      }
    ]
  },
  {
    id: "r10",
    level: "800",
    type: "Letter",
    title: "Fitness Club Changes (手紙)",
    targetSec: 240,
    text: `Dear Mr. Grant,

Thank you for your loyalty as a member of the Riverside Fitness Club over the past five years. We are writing to inform you of several changes that will take effect on July 1.

First, due to rising operating costs, the monthly membership fee will increase from $45 to $52. However, members who switch to an annual plan before June 30 can continue to pay the current rate for the next twelve months.

Second, the swimming pool will close for maintenance every Monday morning until 11:00 A.M. All other facilities will keep their regular hours.

Finally, we are pleased to announce that group classes, which were previously limited to the evening, will now also be offered on weekend mornings. A full class schedule is enclosed with this letter.

If you have any questions, please do not hesitate to speak with our front desk staff.

Sincerely,
Olivia Brooks
Membership Manager`,
    ja: `グラント様

この5年間、リバーサイド・フィットネスクラブの会員としてご愛顧いただき、ありがとうございます。7月1日から実施されるいくつかの変更についてお知らせいたします。

まず、運営費の上昇により、月会費が45ドルから52ドルに上がります。ただし、6月30日までに年間プランに切り替えた会員は、今後12か月間、現在の料金のままお支払いいただけます。

次に、プールは点検のため、毎週月曜日の午前11時まで閉鎖します。そのほかの施設は通常どおりの営業時間です。

最後に、これまで夜だけだったグループクラスを、週末の朝にも開催することになりました。クラスのスケジュール全体を、この手紙に同封しています。

ご質問があれば、お気軽に受付スタッフにお声がけください。

敬具
オリビア・ブルックス
会員担当マネージャー`,
    glossary: [
      { w: "loyalty", ja: "ご愛顧" },
      { w: "take effect", ja: "実施される" },
      { w: "operating costs", ja: "運営費" },
      { w: "annual", ja: "年間の" },
      { w: "maintenance", ja: "点検・整備" },
      { w: "previously", ja: "以前は" },
      { w: "enclosed", ja: "同封された" },
      { w: "hesitate", ja: "ためらう" }
    ],
    questions: [
      {
        q: "Why was the letter sent to Mr. Grant?",
        choices: [
          "To thank him for referring a friend",
          "To explain upcoming changes at a club",
          "To remind him of an unpaid fee",
          "To invite him to a special event"
        ],
        answer: 1,
        evidence: ["We are writing to inform you of several changes that will take effect on July 1."],
        explain: "目的問題は We are writing to 〜 を探す。感謝の言葉は冒頭のあいさつで、手紙の目的ではない。"
      },
      {
        q: "How can Mr. Grant avoid the fee increase for a year?",
        choices: [
          "By attending weekend classes",
          "By speaking with the front desk",
          "By switching to a yearly plan by the end of June",
          "By using the pool only on Mondays"
        ],
        answer: 2,
        evidence: ["members who switch to an annual plan before June 30 can continue to pay the current rate for the next twelve months"],
        explain: "annual plan＝yearly plan、before June 30＝by the end of June、current rate を払い続ける＝値上げを避けられる。言い換えが3つ重なっている。"
      },
      {
        q: "What is NOT mentioned as a change?",
        choices: ["A higher monthly fee", "Shorter pool hours on Mondays", "Additional times for group classes", "A new locker room"],
        answer: 3,
        evidence: ["the monthly membership fee will increase from $45 to $52", "the swimming pool will close for maintenance every Monday morning until 11:00 A.M.", "will now also be offered on weekend mornings"],
        explain: "NOT問題。月会費の値上げ（A）、月曜のプール閉鎖（B）、週末朝のクラス追加（C）は本文にある。ロッカールームの話はない。"
      },
      {
        q: "What is included with the letter?",
        choices: ["A membership card", "A class schedule", "A payment receipt", "A discount coupon"],
        answer: 1,
        evidence: ["A full class schedule is enclosed with this letter."],
        explain: "enclosed（同封された）は手紙やメールでよく出る重要語。何が同封されているかはよく問われる。"
      }
    ]
  }
];

// ============ shadowing sentences ============
const SHADOW_SETS = [
  {
    id: "p2",
    name: "Part 2",
    desc: "短い質問と応答。まずはここから！",
    items: [
      { en: "Where should I put these boxes?", ja: "これらの箱はどこに置けばいいですか?" },
      { en: "Just leave them by the front desk.", ja: "受付の横に置いておいてください。" },
      { en: "When does the meeting start?", ja: "会議は何時に始まりますか?" },
      { en: "It's been moved to three o'clock.", ja: "3時に変更になりました。" },
      { en: "Would you like me to make copies of the report?", ja: "報告書のコピーを取りましょうか?" },
      { en: "Thanks, that would be very helpful.", ja: "ありがとう、とても助かります。" },
      { en: "Who's in charge of the new project?", ja: "新しいプロジェクトの担当は誰ですか?" },
      { en: "I think Ms. Tanaka is leading it.", ja: "田中さんが率いていると思います。" }
    ]
  },
  {
    id: "p3",
    name: "Part 3",
    desc: "職場の会話。自然なリズムをまねしよう。",
    items: [
      { en: "I'm calling about the job opening I saw on your Web site.", ja: "御社のウェブサイトで見た求人についてお電話しました。" },
      { en: "Could you send me the updated schedule by the end of the day?", ja: "今日中に更新されたスケジュールを送ってもらえますか?" },
      { en: "Unfortunately, that item is out of stock at the moment.", ja: "あいにく、その商品は現在在庫切れです。" },
      { en: "Let's ask the marketing team for their opinion first.", ja: "まずマーケティングチームに意見を聞きましょう。" },
      { en: "I'd like to reserve a table for six people on Friday evening.", ja: "金曜の夜に6名で予約したいのですが。" },
      { en: "The client wants to change the design before we start printing.", ja: "印刷を始める前に、顧客がデザインを変更したいそうです。" },
      { en: "We're running a little behind, so let's skip the coffee break.", ja: "少し遅れているので、休憩は飛ばしましょう。" },
      { en: "Have you had a chance to look at the budget proposal?", ja: "予算案に目を通す時間はありましたか?" }
    ]
  },
  {
    id: "p4",
    name: "Part 4",
    desc: "アナウンス・スピーチ。長めの文に挑戦。",
    items: [
      { en: "Attention, shoppers. The store will be closing in fifteen minutes.", ja: "お客様にお知らせします。当店はあと15分で閉店いたします。" },
      { en: "Thank you all for coming to today's workshop on customer service.", ja: "本日の顧客サービス研修にお越しいただき、ありがとうございます。" },
      { en: "Due to heavy rain, the outdoor concert has been postponed until next Saturday.", ja: "大雨のため、野外コンサートは来週土曜日に延期されました。" },
      { en: "Please have your boarding pass ready when you approach the gate.", ja: "ゲートに近づく際は搭乗券をご用意ください。" },
      { en: "Our new product line will be available in stores starting next month.", ja: "新製品ラインは来月から店頭で発売されます。" },
      { en: "If you have any questions, please feel free to contact our support team.", ja: "ご質問があれば、お気軽にサポートチームまでご連絡ください。" },
      { en: "This tour will last approximately two hours, including a lunch break.", ja: "このツアーは昼休憩を含めて約2時間です。" },
      { en: "Before we begin, I'd like to introduce our guest speaker.", ja: "始める前に、ゲストスピーカーをご紹介します。" }
    ]
  }
];

// ============ listening (TOEIC Part 2-4 style) ============
// 音声はブラウザの読み上げ機能で再生する。M=男性、W=女性の声
const LISTENING = [
  {
    id: "l2",
    name: "Part 2",
    desc: "応答問題。選択肢は印刷されていないので、耳だけで選ぶ。",
    kind: "response",
    items: [
      {
        q: "When will the new printer be delivered?", qja: "新しいプリンターはいつ届きますか？",
        choices: ["It prints in color.", "Sometime next week.", "On the third floor."],
        cja: ["カラーで印刷できます。", "来週のどこかで。", "3階です。"],
        answer: 1, voice: ["W", "M"],
        explain: "When（いつ）には時で答える。A は printer から連想させるひっかけ、C は Where への答え。最初の疑問詞を絶対に聞き逃さないこと。"
      },
      {
        q: "Who's going to lead the training session?", qja: "研修は誰が担当するんですか？",
        choices: ["Mr. Patel volunteered.", "About two hours.", "In the main hall."],
        cja: ["パテルさんが引き受けてくれました。", "2時間くらいです。", "メインホールで。"],
        answer: 0, voice: ["M", "W"],
        explain: "Who（誰）には人で答える。B は How long、C は Where への答え。"
      },
      {
        q: "Why is the store closed today?", qja: "今日はなぜお店が閉まっているんですか？",
        choices: ["It's a national holiday.", "I'll close the window.", "Yes, it's very close."],
        cja: ["祝日だからです。", "窓を閉めますね。", "はい、とても近いです。"],
        answer: 0, voice: ["W", "M"],
        explain: "B と C は closed と同じ音の close を使ったひっかけ。同じ単語・似た音が聞こえる選択肢は不正解のことが多い。疑問詞の質問に Yes/No では答えられないので C も×。"
      },
      {
        q: "Would you like to join us for lunch?", qja: "一緒にお昼を食べませんか？",
        choices: ["Thanks, but I have a meeting.", "The lunch menu has changed.", "Yes, I joined last year."],
        cja: ["ありがとう。でも会議があるんです。", "ランチメニューが変わりました。", "はい、去年入りました。"],
        answer: 0, voice: ["M", "W"],
        explain: "誘いに対して、理由をつけて断る応答。Part 2 では、このような遠回しの答えが正解になることがとても多い。C は join の音のひっかけ。"
      },
      {
        q: "Didn't you send the invoice yesterday?", qja: "昨日、請求書を送りませんでしたか？",
        choices: ["Yes, it went out in the afternoon.", "Her voice was very clear.", "Please send it by mail."],
        cja: ["はい、午後に送りました。", "彼女の声はとてもはっきりしていました。", "郵便で送ってください。"],
        answer: 0, voice: ["W", "M"],
        explain: "否定疑問文（Didn't you 〜?）は、普通の疑問文と同じように考えればよい。送ったなら Yes。B は invoice と voice の音のひっかけ。"
      },
      {
        q: "Where can I find the quarterly report?", qja: "四半期報告書はどこにありますか？",
        choices: ["Every three months.", "It's on the shared drive.", "I reported it to the manager."],
        cja: ["3か月ごとです。", "共有ドライブにあります。", "マネージャーに報告しました。"],
        answer: 1, voice: ["M", "W"],
        explain: "Where には場所で答える。A は quarterly（四半期の）の意味から連想させるひっかけ、C は report の音のひっかけ。"
      },
      {
        q: "Should we take a taxi or the train to the airport?", qja: "空港へはタクシーと電車のどちらで行きましょうか？",
        choices: ["The train is faster at this time of day.", "Yes, we should.", "At gate twelve."],
        cja: ["この時間帯なら電車のほうが速いですよ。", "はい、そうしましょう。", "12番ゲートです。"],
        answer: 0, voice: ["W", "M"],
        explain: "A or B の選択疑問文には Yes/No で答えられない。どちらかを選ぶか、「どちらでもいい」などが正解になる。"
      },
      {
        q: "The budget meeting has been postponed, hasn't it?", qja: "予算会議は延期になったんですよね？",
        choices: ["Until next Friday, I heard.", "I'll post it online.", "The budget is very limited."],
        cja: ["来週の金曜日まで、と聞きました。", "オンラインに投稿します。", "予算はとても限られています。"],
        answer: 0, voice: ["M", "W"],
        explain: "付加疑問文（〜, hasn't it?）は確認の質問。「いつまで延期か」を答えている A が自然。B は postponed と post、C は budget の音のひっかけ。"
      },
      {
        q: "How did the client presentation go?", qja: "顧客へのプレゼンはどうでしたか？",
        choices: ["By train.", "They seemed very interested.", "Next Tuesday at ten."],
        cja: ["電車で。", "とても興味を持ってくれたようです。", "来週火曜の10時です。"],
        answer: 1, voice: ["W", "M"],
        explain: "How did 〜 go? は「〜はどうだった？」と結果を聞く表現。A は How を「手段」と取り違えさせるひっかけ。"
      },
      {
        q: "I can't find my access card anywhere.", qja: "入館カードがどこにも見つからないんです。",
        choices: ["Have you checked with security?", "Yes, I can.", "It's a credit card."],
        cja: ["警備室に確認しましたか？", "はい、できます。", "それはクレジットカードです。"],
        answer: 0, voice: ["M", "W"],
        explain: "質問ではない文（平叙文）には、提案やアドバイスで返すのが定番。B は can の音、C は card の音のひっかけ。"
      }
    ]
  },
  {
    id: "l3",
    name: "Part 3",
    desc: "会話問題。音声の前に設問を読んで、聞くポイントを決めておく。",
    kind: "set",
    items: [
      {
        intro: "Questions 1 through 3 refer to the following conversation.",
        lines: [
          { s: "W", t: "Hi, I'm calling about the desk I ordered from your Web site last week. It was supposed to arrive yesterday, but it still hasn't come.", ja: "もしもし、先週そちらのウェブサイトで注文した机について電話しました。昨日届くはずだったのですが、まだ届いていないんです。" },
          { s: "M", t: "I'm sorry to hear that. Could I have your order number, please?", ja: "申し訳ございません。注文番号を教えていただけますか？" },
          { s: "W", t: "Sure, it's four, seven, two, nine, one.", ja: "はい、47291です。" },
          { s: "M", t: "Thank you. It looks like the delivery truck had mechanical problems. Your desk will be delivered tomorrow morning, and we'll refund the shipping fee.", ja: "ありがとうございます。配送トラックが故障したようです。机は明日の朝お届けし、送料は返金いたします。" },
          { s: "W", t: "That's fine. I'll be working from home tomorrow anyway.", ja: "大丈夫です。どのみち明日は在宅勤務なので。" }
        ],
        questions: [
          { q: "Why is the woman calling?", choices: ["To place an order", "To ask about a late delivery", "To return a damaged item", "To change her address"], answer: 1, explain: "最初の発言の「昨日届くはずがまだ来ない」から、配送の遅れの問い合わせ。電話の目的は最初の1〜2文で言われることが多い。" },
          { q: "What caused the problem?", choices: ["A wrong address", "Bad weather", "A vehicle problem", "A missing item"], answer: 2, explain: "the delivery truck had mechanical problems（トラックの機械的な故障）＝ a vehicle problem の言い換え。" },
          { q: "What does the man offer to do?", choices: ["Give a discount on her next order", "Refund a fee", "Send a different desk", "Call her tomorrow"], answer: 1, explain: "we'll refund the shipping fee（送料を返金する）。offer の問題は、男性の we'll / I'll / Would you like 〜 を聞き取る。" }
        ]
      },
      {
        intro: "Questions 4 through 6 refer to the following conversation.",
        lines: [
          { s: "M", t: "Sarah, do you have a minute? I'm putting together the slides for Friday's sales meeting.", ja: "サラ、ちょっといい？金曜日の営業会議のスライドを作っているところなんだ。" },
          { s: "W", t: "Sure. What do you need?", ja: "いいよ。何が必要？" },
          { s: "M", t: "I'd like to include last quarter's sales figures, but I can't find the final numbers.", ja: "前の四半期の売上の数字を入れたいんだけど、確定した数字が見つからなくて。" },
          { s: "W", t: "Oh, accounting sent them out by e-mail this morning. Check your inbox. The subject line is \"Q3 results.\"", ja: "ああ、経理が今朝メールで送っていたよ。受信箱を見てみて。件名は「Q3 results」だよ。" },
          { s: "M", t: "Great, thanks. Would you mind reviewing the slides once I'm done?", ja: "助かる、ありがとう。できあがったら、スライドを確認してもらえるかな？" },
          { s: "W", t: "Not at all. Just send them to me by Thursday afternoon.", ja: "もちろん。木曜日の午後までに送ってね。" }
        ],
        questions: [
          { q: "What is the man working on?", choices: ["A budget report", "A presentation", "A job advertisement", "A sales contract"], answer: 1, explain: "putting together the slides（スライドを作っている）＝プレゼン資料。sales（営業）が聞こえても D の sales contract はひっかけ。" },
          { q: "According to the woman, what did the accounting department do?", choices: ["It sent some figures by e-mail.", "It canceled a meeting.", "It hired a new employee.", "It changed a deadline."], answer: 0, explain: "accounting sent them out by e-mail this morning。them は sales figures（売上の数字）を指す。" },
          { q: "What does the woman agree to do?", choices: ["Lead the meeting", "Contact the accounting team", "Review some materials", "Print some handouts"], answer: 2, explain: "Would you mind reviewing 〜?（〜してもらえる？）に Not at all（いいですよ）と答えている。Would you mind 〜? への「OK」は No / Not at all になるので注意。" }
        ]
      },
      {
        intro: "Questions 7 through 9 refer to the following conversation.",
        lines: [
          { s: "W", t: "Welcome to the Greenfield Hotel. How may I help you?", ja: "グリーンフィールド・ホテルへようこそ。ご用件を承ります。" },
          { s: "M", t: "Hi, I have a reservation under the name Carter. I know check-in is at three, but my flight arrived early. Is there any chance I could check in now?", ja: "こんにちは、カーターの名前で予約しています。チェックインは3時だとわかっているのですが、飛行機が早く着いてしまって。今チェックインできたりしませんか？" },
          { s: "W", t: "Let me see. I'm afraid your room isn't ready yet. But we can keep your luggage at the front desk, and you're welcome to use our lounge on the second floor.", ja: "確認いたします。あいにく、お部屋の準備がまだできておりません。ですが、お荷物をフロントでお預かりできますし、2階のラウンジもご自由にお使いいただけます。" },
          { s: "M", t: "That would be great. I have some e-mails to answer anyway.", ja: "それは助かります。どのみち返信するメールがいくつかあるので。" },
          { s: "W", t: "The lounge has free Wi-Fi. I'll call your mobile phone as soon as your room is ready.", ja: "ラウンジには無料のWi-Fiがございます。お部屋の準備ができ次第、携帯電話にお電話いたします。" }
        ],
        questions: [
          { q: "Where most likely does the conversation take place?", choices: ["At an airport", "At a hotel", "At a restaurant", "At a travel agency"], answer: 1, explain: "Welcome to the Greenfield Hotel と最初に言っている。場所の問題は最初の一言が大事。flight が聞こえても A はひっかけ。" },
          { q: "What does the man ask for?", choices: ["A room upgrade", "An early check-in", "A ride to the airport", "A late checkout"], answer: 1, explain: "Is there any chance I could check in now?（今チェックインできませんか？）＝早めのチェックインの依頼。" },
          { q: "What does the woman say she will do?", choices: ["Call the man", "Carry his luggage to his room", "Give him a meal coupon", "Change his reservation"], answer: 0, explain: "I'll call your mobile phone（携帯に電話します）。最後の I'll 〜 は次の行動の問題でよく使われる。" }
        ]
      }
    ]
  },
  {
    id: "l4",
    name: "Part 4",
    desc: "説明文問題。アナウンスや留守電を1人が話す。",
    kind: "set",
    items: [
      {
        intro: "Questions 1 through 3 refer to the following announcement.",
        lines: [
          { s: "W", t: "Attention, Fresh Mart shoppers. This weekend only, all fruits and vegetables in our produce section are twenty percent off.", ja: "フレッシュマートをご利用のお客様にお知らせします。今週末に限り、青果売り場の果物と野菜がすべて20%引きです。" },
          { s: "W", t: "And don't forget to visit our bakery near the main entrance, where you can try free samples of our new whole-wheat bread.", ja: "また、正面入口近くのベーカリーにもぜひお立ち寄りください。新しい全粒粉パンの試食を無料でお楽しみいただけます。" },
          { s: "W", t: "Also, starting next month, Fresh Mart will be open until eleven P.M. every night. Thank you for shopping with us.", ja: "さらに来月から、フレッシュマートは毎晩午後11時まで営業いたします。ご来店ありがとうございます。" }
        ],
        questions: [
          { q: "Where is the announcement being made?", choices: ["At a supermarket", "At a farm", "At a restaurant", "At a bank"], answer: 0, explain: "shoppers（買い物客）、produce section（青果売り場）からスーパーだとわかる。produce は「農産物」の意味で TOEIC 頻出。" },
          { q: "What is available near the main entrance?", choices: ["Discount coupons", "Free samples", "Shopping carts", "Cooking classes"], answer: 1, explain: "bakery near the main entrance, where you can try free samples（入口近くのベーカリーで無料試食）。" },
          { q: "What will change next month?", choices: ["Product prices", "Business hours", "The bakery's location", "Parking rules"], answer: 1, explain: "will be open until eleven P.M.（午後11時まで営業）＝営業時間の変更。starting next month が聞こえたら直後に集中。" }
        ]
      },
      {
        intro: "Questions 4 through 6 refer to the following telephone message.",
        lines: [
          { s: "W", t: "Hi, this is Laura from Bennett Dental Clinic, calling for Mr. Jacobs. I'm calling to remind you of your appointment tomorrow at two P.M.", ja: "もしもし、ベネット歯科のローラです。ジェイコブス様宛てのお電話です。明日の午後2時のご予約について、確認のお電話をしました。" },
          { s: "W", t: "Unfortunately, Dr. Bennett will be attending a conference, so your checkup will be done by Dr. Lee instead.", ja: "あいにくベネット先生は学会に出席するため、代わりにリー先生が検診を担当します。" },
          { s: "W", t: "If you'd prefer to see Dr. Bennett, we have an opening next Wednesday morning. Please call us back at five, five, five, zero, one, four, seven to let us know which you'd prefer.", ja: "ベネット先生をご希望の場合は、来週水曜日の午前に空きがございます。どちらがよいか、555-0147まで折り返しお電話ください。" }
        ],
        questions: [
          { q: "What is the purpose of the call?", choices: ["To confirm an appointment", "To request a payment", "To announce a new clinic", "To offer a job"], answer: 0, explain: "I'm calling to remind you of your appointment（予約の確認の電話）。I'm calling to 〜 は目的を言うときの決まり文句。" },
          { q: "What has changed?", choices: ["The time of the appointment", "The doctor who will see the patient", "The location of the clinic", "The cost of a checkup"], answer: 1, explain: "Dr. Lee instead（代わりにリー先生）＝担当医の変更。時間は変わっていない。" },
          { q: "What is the listener asked to do?", choices: ["Arrive early", "Fill out a form", "Return the call", "Visit a Web site"], answer: 2, explain: "Please call us back（折り返し電話して）＝ Return the call。Please 〜 は「頼まれていること」の問題のヒント。" }
        ]
      },
      {
        intro: "Questions 7 through 9 refer to the following excerpt from a meeting.",
        lines: [
          { s: "M", t: "Good morning, everyone. Before we start, I have some good news. Our new mobile app, which we launched in June, has already been downloaded more than fifty thousand times.", ja: "皆さん、おはようございます。始める前に良い知らせがあります。6月にリリースした新しいモバイルアプリが、すでに5万回以上ダウンロードされました。" },
          { s: "M", t: "That's twice what we expected. Because of this success, management has decided to expand the development team. We'll be hiring three new engineers this fall.", ja: "これは予想の2倍です。この成功を受けて、経営陣は開発チームの拡大を決めました。この秋、新しいエンジニアを3人採用します。" },
          { s: "M", t: "If you know anyone who might be a good fit, please send their information to Kevin in human resources.", ja: "ぴったりの人を知っていたら、人事部のケビンに情報を送ってください。" }
        ],
        questions: [
          { q: "What is the speaker mainly discussing?", choices: ["A product's success", "A change in office location", "A new safety policy", "A customer complaint"], answer: 0, explain: "アプリのダウンロード数が予想を超えた＝製品の成功。主題は最初の good news のあとに来る。" },
          { q: "What does the speaker say about the number of downloads?", choices: ["It was lower than expected.", "It was double the target.", "It decreased in June.", "It will be announced later."], answer: 1, explain: "twice what we expected（予想の2倍）＝ double the target の言い換え。" },
          { q: "What are listeners asked to do?", choices: ["Download the app", "Recommend possible candidates", "Attend a training session", "Contact a customer"], answer: 1, explain: "ぴったりの人を知っていたら情報を送って＝候補者を推薦して。please send 〜 がヒント。" }
        ]
      }
    ]
  }
];
