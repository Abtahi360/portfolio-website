var realWorldProjects = [
  {
    /* ── Identity ───────────────────────────────────────── */
    id: "demo-project-1",
    title: "AgriBot - Agricultural Advisory Chatbot",
    subtitle: "AgriBot is a full-stack AI chatbot built to give smallholder farmers instant, reliable advice in natural English. A farmer can type something like \"My rice leaves are turning yellow, what's wrong?\" or \"How much urea should I use per acre?\" and get a clear, specific answer." +
      "The system combines a fine-tuned language model for understanding what the farmer is asking, traditional machine learning models for crop and fertilizer recommendations, and a rule-based reasoning engine for dosage and suitability logic. A live weather API integration adds real-world context to every planting advice query.",

    /* ── Card thumbnail ──────────────────────────────────── */
    coverImage: "view/assets/Images/agriBot/agriBot Cover Photo.png",

    tags: ["NLP", "Machine Learning", "FastAPI", "Python", "Chatbot"],

    stars: 0,
    forks: 0,

    /* ── Short description for card ──────────────────────── */
    description:
      "AgriBot is a conversational AI chatbot that gives farmers instant, practical advice on crops, fertilizers, plant diseases, and planting weather. " +
      "AgriBot fills that gap by combining natural language understanding with real agricultural science, so a farmer can simply type what they're seeing and get a reliable answer in seconds.",

    repoUrl: "https://github.com/Abtahi360/AgriBot-Agricultural-Advisory-Chatbot-for-Farmers",
    liveUrl: "https://agribot-by-abtahi.vercel.app",


    stats: [
      { value: "3 months", label: "Timeline" },
      { value: "Solo", label: "Team size" },
      { value: "Completed", label: "Status" }
    ],

    /* ── Numbered sections on detail page ────────────────── */
    /* Follow the pattern: number, title, heading, body, highlights */
    sections: [
      {
        number: "01",
        title: "The Challenge",
        heading: "The Challenge",
        body:
          "Farmers - especially in rural South and Southeast Asia - rarely have access to " +
          "agronomists or agricultural experts when problems arise. When a crop starts failing " +
          "or a disease spreads, the window to act is short. " +
          "Existing digital tools either speak in technical language that farmers don't use " +
          "(pH levels, N/P/K ratios, rainfall data) or give generic advice that doesn't apply " +
          "to a specific crop, soil, or region. The specific problems this project needed to solve were:",
        highlights: [
          "Farmers ask questions casually and informally - existing systems can't understand that",
          "No tool gave dosage-specific answers - \"how much urea?\" would return a fertilizer name, not a quantity",
          "Standard fertilizer datasets had randomly assigned labels - making it impossible for any model to learn",
          "State-averaged soil data mapped the same values to 30+ crops - breaking crop classification entirely",
          "No reasoning existed for crop suitability - the system had no way to say \"38°C is too hot for rice\"",
        ]
      },

      {
        number: "02",
        title: "The Solution",
        heading: "The Solution",
        body:
          "The approach was to build a 4-layer hybrid system that combines NLP, machine learning, " +
          "rule-based logic, and live weather data - each layer doing what it does best. " +
          "A fine-tuned DistilBERT model reads every message and classifies what kind of help the farmer needs. " +
          "A reasoning engine then handles dosage queries and suitability checks using real agronomic rules. " +
          "Trained ML models handle crop recommendation, fertilizer prediction, disease detection, and yield estimation. " +
          "Finally, live weather from OpenWeatherMap adds real-world context to every planting advice query.",
        highlights: [
          "DistilBERT intent classifier - 4 classes, 100% accuracy, chosen over full BERT for 2× faster inference",
          "Rule-based reasoning engine - handles \"how much\" dosage queries and temperature suitability checks",
          "RandomForest crop classifier - trained only on plant-level data, not state averages (99.55% accuracy)",
          "Synthetic fertilizer data - built from N/P/K deficit rules after discovering the original dataset had random labels",
          "EfficientNetB0 for disease classification (98.43%) and YOLOv8 for field-level lesion detection",
          "Confidence routing - if ML confidence drops below 75%, the reasoning engine takes over automatically",
        ]
      },

      {
        number: "03",
        title: "Results & Impact",
        heading: "Results & Impact",
        body:
          "The system was tested against 100 realistic farmer queries written in natural, informal English. " +
          "Overall accuracy across all intents reached 98%. Beyond the numbers, the project demonstrated " +
          "that careful data decisions - not just model choice - are what make or break a real-world ML system.",
        highlights: [
          "Farmers get dosage-specific answers, not just fertilizer names",
          "Temperature and humidity suitability is checked before every crop recommendation",
          "30 Indian state profiles built from 24 years of real soil and weather data (1997–2020)",
          "Yield regressor predicts crop output in tonnes per hectare with R² = 0.99",
          "The chatbot handles natural, messy English - no technical knowledge required from the user",
          "Full REST API documented and ready for integration with mobile apps or third-party platforms",
        ],
        table: {
          headers: ["Task", "Model Used", "Accuracy"],
          rows: [
            ["Crop Recommendation", "Random Forest", "99.55%"],
            ["Fertilizer Recommendation", "Random Forest", "97.60%"],
            ["Disease Classification", "EfficientNetB0", "98.43%"],
            ["Disease Detection", "YOLOv8n", "72.10% mAP@50"],
            ["NLP Intent Classification", "DistilBERT", "100%"],
            ["Yield Prediction", "RF Regressor", "R² = 0.99"],
            ["Live Test (100 queries)", "Full Pipeline", "98%"],
          ]
        }
      },

      {
        number: "04",
        title: "Key Technical Decisions",
        heading: "Key Technical Decisions",
        body:
          "A few decisions made during development had a much bigger impact than the model choices themselves. " +
          "These are the ones worth highlighting:",
        highlights: [
          "Synthetic fertilizer data - the original 100k dataset had random labels (verified by near-zero correlation). Building rule-based data pushed accuracy from 14% to 97.6%",
          "Excluded state-averaged soil data from the crop classifier - the same N/P/K values mapped to 30+ crops, making classification mathematically impossible",
          "Chose DistilBERT over full BERT - both reached 100% accuracy, but DistilBERT is 40% smaller and twice as fast at inference",
          "Built a reasoning engine alongside ML - a pure ML pipeline classifies intent but cannot reason about dosage or suitability. The engine bridges that gap",
        ]
      },
    ],

    /* ── Tech stack shown in sidebar ─────────────────────── */
    techStack: [
      { category: "Language", items: ["Python 3.10+"] },
      { category: "Framework", items: ["FastAPI", "Uvicorn", "HuggingFace Transformers", "PyTorch", "TensorFlow / Keras"] },
      { category: "ML / Data", items: ["scikit-learn", "XGBoost", "Pandas", "NumPy", "EfficientNetB0", "YOLOv8"] },
      { category: "Deployment", items: ["Google Colab + ngrok", "Render", "Docker"] },
      { category: "Other", items: ["OpenWeatherMap API", "REST API", "NLP", "Rule-Based Reasoning"] },
    ],

    /* ── YouTube video ID ─────────────────────────────────── */
    /* Paste only the ID part of the YouTube URL: ?v=THIS_PART */
    youtubeVideoId: "yyUPy2xRNHM",
    
    /* ── Gallery screenshots ──────────────────────────────── */
    gallery: [
      "view/assets/Images/agriBot/1.png",
      "view/assets/Images/agriBot/2.png",
      "view/assets/Images/agriBot/3.png",
    ]
  },
  {
    /* ── Identity ───────────────────────────────────────── */
    id: "demo-project-2",
    title: "Electricity Billing System",
    subtitle: "The Electricity Billing System is a Java desktop application built to simplify electricity billing operations. It is designed for utility companies and billing staff who need a better way to manage customer information, meter data, bill calculations, and payment records." +
      "The main goal of the project is to reduce manual billing work and make the process faster and more organized. Customers can register, log in, view billing information, and make payments through integrated payment options. The system also gives administrators a clear dashboard to manage and track billing activity." +
      "The core idea is simple: store and handle electricity billing data in a structured way so the full billing process becomes easier, faster, and more reliable.",

    /* ── Card thumbnail ──────────────────────────────────── */
    coverImage: "view/assets/Images/ElectricityBillingSystem.png",

    tags: ["Java", "Swing GUI", "File I/O", "OOP", "Desktop Application"],

    stars: 0,
    forks: 0,

    /* ── Short description for card ──────────────────────── */
    description:
      "A Java-based desktop application that improves accuracy, " +
      "reduces manual work, and makes billing easier for both staff and customers.",

    repoUrl: "https://github.com/Abtahi360/Electricity_Billing_System",
    liveUrl: "",


    stats: [
      { value: "1 month", label: "Timeline" },
      { value: "Solo", label: "Team size" },
      { value: "Completed", label: "Status" }
    ],

    /* ── Numbered sections on detail page ────────────────── */
    /* Follow the pattern: number, title, heading, body, highlights */
    sections: [
      {
        number: "01",
        title: "The Challenge",
        heading: "The Challenge",
        body:
          "Managing electricity billing manually can be time-consuming and difficult to maintain. " +
          "Utility companies need to handle customer information, meter data, bill calculations, payment records, and billing history accurately. As the number of customers grows, manual processes become harder to manage and more prone to errors.",
        highlights: [
          "Manual bill calculation increases the risk of mistakes.",
          "Customer and meter information can become difficult to organize.",
          "Tracking payment history requires significant administrative effort.",
          "Different user roles required separate interfaces and workflows."
        ]
      },
      {
        number: "02",
        title: "The Solution",
        heading: "The Solution",
        body:
          "To address these challenges, a Java-based desktop application was developed to centralize electricity " +
          "billing operations. The system combines customer management, meter tracking, bill calculation, payment processing, and billing history into a single user-friendly platform.",
        highlights: [
          "Authentication system for user registration and login.",
          "Separate interfaces for administrators and customers.",
          "Modular class-based structure following OOP principles."
        ]
      },
      {
        number: "03",
        title: "Results & Impact",
        heading: "Results & Impact",
        body:
          "The system makes electricity billing more organized and less time-consuming. It supports faster customer data handling, automatic bill calculation, and better tracking of payment records." +
          "For users, the main benefit is convenience. For administrators, the benefit is a clearer and more efficient billing workflow. Even without a database, the project provides a functional and structured solution for basic billing operations."
      }
    ],

    /* ── Tech stack shown in sidebar ─────────────────────── */
    techStack: [
      { category: "Language", items: ["Java"] },
      { category: "Framework", items: ["Swing"] },
      { category: "ML / Data", items: ["File I/O", "text file-based storage"] },
      /*{ category: "Deployment", items: ["Render"] },*/
      { category: "Other", items: ["OOP", "Desktop Application"] }
    ],

    /* ── YouTube video ID ─────────────────────────────────── */
    /* Paste only the ID part of the YouTube URL: ?v=THIS_PART */
    youtubeVideoId: "IsSQt_O2Qqc",

    /* ── Gallery screenshots ──────────────────────────────── */
    gallery: [
      "view/assets/Images/Electricity Billing System/1.png",
      "view/assets/Images/Electricity Billing System/2.png",
      "view/assets/Images/Electricity Billing System/3.png",
      "view/assets/Images/Electricity Billing System/4.png",
      "view/assets/Images/Electricity Billing System/5.png",
      "view/assets/Images/Electricity Billing System/6.png",
      "view/assets/Images/Electricity Billing System/7.png",
    ]
  }

  /* ── Add more projects here ──────────────────────────────
  ,{
    id:            "my-project",
    title:         "My Real Project",
    subtitle:      "One-line tagline",
    coverImage:    "view/assets/Images/my-cover.png",
    tags:          ["Java", "Spring Boot", "MySQL"],
    stars: 0, forks: 0,
    description:   "Short card description...",
    repoUrl:       "https://github.com/Abtahi360/my-repo",
    liveUrl:       "https://my-live-demo.com",
    stats: [
      { value: "2 months", label: "Timeline" },
      { value: "Solo",     label: "Team size" },
      { value: "Live",     label: "Status" }
    ],
    sections: [
      { number:"01", title:"The Challenge", heading:"The Challenge", body:"...", highlights:["..."] },
      { number:"02", title:"The Solution",  heading:"The Solution",  body:"...", highlights:["..."] },
      { number:"03", title:"Results",       heading:"Results",       body:"...", highlights:["..."] }
    ],
    techStack: [
      { category: "Backend",  items: ["Java 21", "Spring Boot 3"] },
      { category: "Database", items: ["MySQL"] }
    ],
    youtubeVideoId: "dQw4w9WgXcQ",
    gallery: ["view/assets/Images/my-screenshot.png"]
  }
  ─────────────────────────────────────────────────────── */
];
