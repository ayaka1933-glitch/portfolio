// ============ reading passages (TOEIC Part 7 style) ============
// targetSec: TOEIC本番ペース(1問あたり約60秒)を目安にした目標時間
const PASSAGES = [
  {
    id: "r01",
    type: "E-mail",
    title: "Office Relocation",
    targetSec: 120,
    text: `To: All Staff
From: Karen Mills, Office Manager
Subject: Office relocation

Dear colleagues,

As announced last month, our team will relocate to the third floor of the Harbor Building on May 12. Movers will arrive on Friday afternoon, so please pack your personal belongings in the boxes provided by Thursday evening. Label each box with your name and new desk number.

The IT department will reconnect all computers over the weekend. If your equipment does not work properly on Monday morning, please contact the help desk at extension 204.

Thank you for your cooperation.`,
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
        explain: "冒頭で移転日を伝え、荷造りやラベル貼りの指示をしているので「移転に関する指示」が目的。"
      },
      {
        q: "By when should employees pack their belongings?",
        choices: ["Monday morning", "Thursday evening", "Friday afternoon", "May 12"],
        answer: 1,
        explain: "\"pack your personal belongings ... by Thursday evening\" とある。金曜午後は業者が来る時間なので注意。"
      }
    ]
  },
  {
    id: "r02",
    type: "Notice",
    title: "Library Renovation",
    targetSec: 120,
    text: `NOTICE TO ALL VISITORS

The Westfield Public Library will be closed from June 3 to June 17 for renovation work. During this period, new shelves will be installed and the reading room will be expanded.

Books that are due during the closure may be returned to the drop box located beside the main entrance. No late fees will be charged for items due during this time.

Online services, including e-book loans, will remain available. We apologize for any inconvenience and look forward to welcoming you to our improved facility.`,
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
        explain: "\"will remain available\" = 引き続き利用できる。TOEICは本文の言い換えを選ぶ問題が多い。"
      }
    ]
  },
  {
    id: "r03",
    type: "Advertisement",
    title: "Green Table Catering",
    targetSec: 150,
    text: `Green Table Catering — Fresh Food for Every Occasion

Planning a business lunch, a product launch, or a company party? Green Table Catering offers a wide selection of dishes made with locally grown ingredients.

This month only, first-time customers will receive 15 percent off any order of over $300. Orders must be placed at least three days in advance. Free delivery is available within the city limits.

To view our full menu or to request a quote, visit www.greentablecatering.com or call 555-0182.`,
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
        explain: "\"first-time customers ... any order of over $300\" の言い換え。first-time = new、over = exceeds。"
      },
      {
        q: "How can customers get a price estimate?",
        choices: ["By visiting the store", "By sending a letter", "By visiting a Web site", "By attending a party"],
        answer: 2,
        explain: "\"to request a quote, visit www...\" とある。quote = price estimate。"
      }
    ]
  },
  {
    id: "r04",
    type: "Text messages",
    title: "Delivery Delay",
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
        explain: "意図問題。直前のLisaの「文房具店で紙を買ってくる」という申し出に感謝している。"
      }
    ]
  },
  {
    id: "r05",
    type: "Article",
    title: "Local Bakery Expands",
    targetSec: 150,
    text: `RIVERTON (April 8) — Sunrise Bakery, a family-owned business that opened on Main Street twelve years ago, announced on Monday that it will open a second location in the Lakeside Shopping Center this summer.

According to owner Maria Lopez, the new shop will be twice the size of the original store and will include a café area with seating for 40 customers. "Our customers have been asking for a place where they can sit and relax," Ms. Lopez said.

The bakery plans to hire around fifteen new employees, including bakers and cashiers. Applications are being accepted through the company's Web site until May 15.`,
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
        explain: "\"a café area with seating for 40 customers\" の言い換え。サイズは2倍、場所はLakeside、開店は夏。"
      },
      {
        q: "How can people apply for a job?",
        choices: ["In person at the store", "Through a Web site", "By phone", "By e-mail to Ms. Lopez"],
        answer: 1,
        explain: "\"Applications are being accepted through the company's Web site\" とある。"
      }
    ]
  },
  {
    id: "r06",
    type: "Memo",
    title: "Expense Reports",
    targetSec: 120,
    text: `MEMO
To: Sales Department
From: Daniel Park, Finance
Date: October 1

Starting next month, all expense reports must be submitted through the new online system instead of on paper. Receipts should be scanned and attached to each report.

Reports must be submitted within 30 days of the expense. Late reports will not be processed until the following month.

A short training session on the new system will be held on October 10 in Conference Room B. Attendance is strongly recommended for anyone who travels for business.`,
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
        explain: "\"anyone who travels for business\" = 出張する人。"
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
