var realWorldProjects = [
  {
    /* ── Identity ───────────────────────────────────────── */
    id:       "demo-project-1",
    title:    "Electricity Billing System",
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
      { value: "1 months", label: "Timeline" },
      { value: "Solo",     label: "Team size" },
      { value: "Completed",     label: "Status" }
    ],

    /* ── Numbered sections on detail page ────────────────── */
    /* Follow the pattern: number, title, heading, body, highlights */
    sections: [
      {
        number:     "01",
        title:      "The Challenge",
        heading:    "The Challenge",
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
        number:     "02",
        title:      "The Solution",
        heading:    "The Solution",
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
        number:     "03",
        title:      "Results & Impact",
        heading:    "Results & Impact",
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
