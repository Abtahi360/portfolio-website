var realWorldProjects = [
  {
    /* ── Identity ───────────────────────────────────────── */
    id:       "demo-project-1",
    title:    "Demo Real-World Project",
    subtitle: "A placeholder — replace with your actual project details.",

    /* ── Card thumbnail ──────────────────────────────────── */
    coverImage: "view/assets/Images/ElectricityBillingSystem.png",

    /* ── Pill tags shown on card & detail ────────────────── */
    tags: ["Python", "Machine Learning", "Flask"],

    /* ── GitHub stars / forks counters ───────────────────── */
    stars: 0,
    forks: 0,

    /* ── Short description for card ──────────────────────── */
    description:
      "This is a demo entry. Replace with a real description of the problem you " +
      "solved, your approach, and the measurable impact.",

    /* ── Links ───────────────────────────────────────────── */
    repoUrl: "https://github.com/Abtahi360/Electricity_Billing_System",
    liveUrl: "",

    /* ── Stats row on detail page (like the reference) ───── */
    /* Remove or add items freely */
    stats: [
      { value: "3 months", label: "Timeline" },
      { value: "Solo",     label: "Team size" },
      { value: "Demo",     label: "Status" }
    ],

    /* ── Numbered sections on detail page ────────────────── */
    /* Follow the pattern: number, title, heading, body, highlights */
    sections: [
      {
        number:     "01",
        title:      "The Challenge",
        heading:    "The Challenge",
        body:
          "Describe the real-world problem you set out to solve. What pain point " +
          "existed? Who was affected? What were the constraints?",
        highlights: [
          "Specific bottleneck or user pain point",
          "Scale or scope of the problem",
          "Existing solutions and why they fell short"
        ]
      },
      {
        number:     "02",
        title:      "The Solution",
        heading:    "The Solution",
        body:
          "Explain the architecture and approach you chose. What technologies did " +
          "you select and why? What trade-offs did you make?",
        highlights: [
          "Key technical decision and rationale",
          "Architecture pattern used",
          "Notable implementation detail"
        ]
      },
      {
        number:     "03",
        title:      "Results & Impact",
        heading:    "Results & Impact",
        body:
          "Share measurable outcomes. Numbers matter: speed improvements, " +
          "accuracy gains, time saved, users served.",
        highlights: [
          "Quantified result #1 (e.g. 40% faster inference)",
          "Quantified result #2 (e.g. 95% classification accuracy)",
          "User or stakeholder feedback"
        ]
      }
    ],

    /* ── Tech stack shown in sidebar ─────────────────────── */
    techStack: [
      { category: "Language",   items: ["Python 3.11"] },
      { category: "Framework",  items: ["Flask", "Scikit-learn"] },
      { category: "ML / Data",  items: ["Pandas", "NumPy", "Matplotlib"] },
      { category: "Deployment", items: ["Render"] }
    ],

    /* ── YouTube video ID ─────────────────────────────────── */
    /* Paste only the ID part of the YouTube URL: ?v=THIS_PART */
    /* Leave empty "" if no video yet */
    youtubeVideoId: "xjgRr8oeGkQ",

    /* ── Gallery screenshots ──────────────────────────────── */
    gallery: [
      "view/assets/Images/ElectricityBillingSystem.png",
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
