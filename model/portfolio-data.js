const portfolioData = {
  /* ── Experience ───────────────────────────────────────────────────────────
     Rendered by controller/experience.js, newest first (array order is display order).
     EVERY entry below is DEMO placeholder content. Replace the whole array with real
     roles; nothing else needs to change.

     Fields
       id            unique string
       role          job title
       company       organisation name
       period        "2025 - Present" (a hyphen becomes a typographic dash)
       location      city / "Remote"
       type          Internship | Full-time | Part-time | Research | Freelance | Volunteer | Project-based | ...
       current       true marks the role you hold now (adds a subtle persistent emphasis)
       summary       one or two sentences
       technologies  array of short strings
       contributions array of bullet strings (revealed under "Key contributions")
       companyUrl    optional https:// link (opens in a new tab)
       logo          optional image path/URL; replaces the monogram tile
       monogram      optional 1-3 letters; otherwise derived from the company name
     ─────────────────────────────────────────────────────────────────────── */
  experience: [
    {
      id: "exp-01",
      role: "Research Assistant",
      company: "IdeaXLab",
      period: "2026 - Present",
      location: "Dhaka, Bangladesh",
      type: "Research",
      current: true,
      summary: "Contributing to multiple research projects at IdeaXLab, with a focus on AI/ML research, scientific analysis, and academic manuscript development. Supporting research activities from literature review and methodology refinement to experimental analysis and preparation of research outputs.",
      contributions: [
        "Conduct literature reviews to identify research gaps and support research development.",
        "Contribute to multiple research papers through methodology development, data analysis, and experimental evaluation.",
        "Assist with interpreting research findings, refining technical content, and preparing manuscripts for publication."
      ],
      technologies: [
        "Python",
        "Machine Learning",
        "Natural Language Processing",
        "Data Analysis",
        "Scientific Research"
      ],
      companyUrl: "https://ideaxlab.org/",
      logo: "view/assets/Images/IdeaXLab_Logo.png"
    },
    // {
    //   id: "exp-01",
    //   role: "[DEMO] Software Engineer Intern",
    //   company: "[DEMO COMPANY A]",
    //   period: "2025 - Present",
    //   location: "Dhaka, Bangladesh",
    //   type: "Internship",
    //   current: true,
    //   summary: "[DEMO] Placeholder summary. Replace this with a short description of your responsibilities and the team you worked with.",
    //   contributions: [
    //     "[DEMO] Built and documented backend APIs for an internal product",
    //     "[DEMO] Improved database workflows and query performance",
    //     "[DEMO] Collaborated on production features through code review"
    //   ],
    //   technologies: ["Java", "Spring Boot", "SQL"],
    //   companyUrl: ""
    // },
    // {
    //   id: "exp-02",
    //   role: "[DEMO] Machine Learning Research Intern",
    //   company: "[DEMO COMPANY B]",
    //   period: "2024 - 2025",
    //   location: "Remote",
    //   type: "Research",
    //   current: false,
    //   summary: "[DEMO] Placeholder summary for a research-oriented role. Describe the problem, the method and the outcome.",
    //   contributions: [
    //     "[DEMO] Prepared and cleaned datasets for model experiments",
    //     "[DEMO] Trained and evaluated baseline classification models",
    //     "[DEMO] Presented findings to the research group"
    //   ],
    //   technologies: ["Python", "PyTorch", "Scikit-learn"],
    //   companyUrl: ""
    // },
    // {
    //   id: "exp-03",
    //   role: "[DEMO] Full-Stack Developer",
    //   company: "[DEMO COMPANY C]",
    //   period: "2023 - 2024",
    //   location: "Dhaka, Bangladesh",
    //   type: "Freelance",
    //   current: false,
    //   summary: "[DEMO] Placeholder summary for project-based client work. Describe what was delivered and for whom.",
    //   contributions: [
    //     "[DEMO] Designed and shipped a responsive web application",
    //     "[DEMO] Set up deployment and basic monitoring",
    //     "[DEMO] Communicated scope and progress with the client"
    //   ],
    //   technologies: ["JavaScript", "Node.js", "MongoDB"],
    //   companyUrl: ""
    // },
    // {
    //   id: "exp-04",
    //   role: "[DEMO] Technical Volunteer",
    //   company: "[DEMO ORGANIZATION D]",
    //   period: "2022 - 2023",
    //   location: "Dhaka, Bangladesh",
    //   type: "Volunteer",
    //   current: false,
    //   summary: "[DEMO] Placeholder summary for volunteer or community work.",
    //   contributions: [
    //     "[DEMO] Supported community events with technical setup",
    //     "[DEMO] Mentored newcomers on programming fundamentals"
    //   ],
    //   technologies: ["Community", "Mentoring"],
    //   companyUrl: ""
    // }
  ],

  education: [
    {
      kicker: "Undergraduate",
      title: "B.Sc. in Computer Science",
      period: "2023 - Ongoing",
      location: "Dhaka, Bangladesh",
      institution: "American International University - Bangladesh",
      skills: "· Object-Oriented Programming (OOP) · Problem Solving · AutoCAD · C# · Data Structures · Python (Programming Language) · Data Science · Genetic Algorithms · Algorithms · Machine Learning · Academic Publishing · Oracle Database · Java Database Connectivity (JDBC) · SQL · Theory of Computation · Project Management · Project Planning · User Interface Design",
      activities: "· Chess, Football, Badminton, Volleyball, Basketball, Cricket, Ludo, Table Tennis",
      coursework: "· Data Structures and Algorithms · Database Systems · Computer Networks · Operating Systems · Artificial Intelligence · Machine Learning · Data Science",
      summary: "Built strong CS fundamentals and delivered several team projects.",
      focus: ["Algorithms", "Machine Learning", "Data Science"]
    },
    {
      kicker: "Higher Secondary Certificate",
      title: "Science",
      period: "2019 - 2021",
      location: "Ishwardi, Pabna, Bangladesh",
      institution: "Ishwardi Government College",
      skills: "C++ · C (Programming Language) · HTML",
      activities: "Chess, Ludo, Cricket, Football, Badminton, Volleyball, Basketball",
      coursework: "· High Mathematics · Physics · Chemistry · Biology"
    },
    {
      kicker: "Secondary School Certificate",
      title: "Science",
      period: "2016 - 2018",
      location: "Ishwardi, Pabna, Bangladesh",
      institution: "Govt. Sara Marwari Model School and College",
      activities: "Chess, Carrom, Sudoku, Ludo",
      coursework: "· High Mathematics · Physics · Chemistry · Biology"
    }
  ],
  /* ── Other Projects ─────────────────────────────────────────────────────
     Rendered by controller/main.js as "Gallery Exhibit" cards and filtered by
     controller/project-filter.js.
       group   ml | software | systems   (labels: projectGroups below)
       media   1–2 images, 1200×750 WebP (16:10) in view/assets/Images/projects/
               the first is the front of the stack, the second sits behind it */
  projectGroups: [
    { id: "ml", label: "AI & ML" },
    { id: "software", label: "Software & Web" },
    { id: "systems", label: "Systems & Engineering" }
  ],
  projects: [
    {
      key: "docx-to-excel-generator",
      kicker: "Automation & Data Processing",
      title: "Automatic Excel Sheet Generator from DOCX Book Data",
      tags: ["Python", "Automation", "Data Extraction"],
      group: "software",
      media: [
        { src: "view/assets/Images/projects/docx-to-excel-generator-1.webp", alt: "Notebook output listing the chapters, sub-sections and 33 hadith entries extracted from the Bangla DOCX book into Excel files" }
      ],
      description: "This project automates the extraction of structured data from a Bangla DOCX book file and converts it into clean Excel sheets, including chapters, sub-sections, and hadith entries.",
      repoUrl: "https://github.com/Abtahi360/Automatic-Excel-Sheet-Generator-from-DOCX-Book-Data"
    },
    {
      key: "trigram-language-model-story-generation",
      kicker: "Natural Language Processing",
      title: "Trigram Language Model with Story Generation",
      tags: ["NLP", "Text Generation", "Python"],
      group: "ml",
      media: [
        { src: "view/assets/Images/projects/trigram-language-model-1.webp", alt: "Sample console output: vocabulary size, text generated from the seed \"the king\", and a test-sentence perplexity of 120.45" },
        { src: "view/assets/Images/projects/trigram-language-model-2.webp", alt: "Diagram of how corpus words are broken into trigram counts" }
      ],
      description: "This project implements a Trigram Language Model from scratch in Python as part of a Natural Language Processing assignment. The model learns word patterns from a corpus and generates meaningful text using probabilistic methods.",
      repoUrl: "https://github.com/Abtahi360/Trigram-Language-Model-with-Story-Generation"
    },
    {
      key: "spring-boot-practice",
      kicker: "Spring Boot",
      title: "Spring Boot 3 Practice",
      tags: ["Java 17", "Spring 6", "Hibernate"],
      group: "software",
      media: [
        { src: "view/assets/Images/projects/spring-boot-practice-1.webp", alt: "Spring Boot 3 logo" }
      ],
      description: "Collection of hands-on practice modules following a Spring Boot + Hibernate course. The goal of this repository is to organize my work, show my progress, and build practical backend development skills.",
      repoUrl: "https://github.com/Abtahi360/Bootcamp-with-Spring-by-Abtahi"
    },
    {
      key: "brain-tumor-segmentation",
      kicker: "Machine Learning",
      title: "Brain Tumor MRI Segmentation",
      tags: ["Keras", "TensorFlow"],
      group: "ml",
      media: [
        { src: "view/assets/Images/projects/brain-tumor-segmentation-1.webp", alt: "Project banner comparing segmentation IoU: Xception 0.82, ResNet50V2 0.85, EfficientNetV2-B3 0.88" },
        { src: "view/assets/Images/projects/brain-tumor-segmentation-2.webp", alt: "NASNetLarge confusion matrix across glioma, meningioma, pituitary and no-tumor classes" }
      ],
      description: "Comparative sweep of Keras models for MRI segmentation - training, evaluation, and single-image demos.",
      repoUrl: "https://github.com/Abtahi360/A-Comparative-Study-of-Keras-Models-for-Brain-Tumor-MRI-Segmentation"
    },
    {
      key: "cat-vs-dog-classification",
      kicker: "Machine Learning",
      title: "Cat vs Dog Classification",
      tags: ["CNN", "TensorFlow"],
      group: "ml",
      media: [
        { src: "view/assets/Images/projects/cat-vs-dog-classification-1.webp", alt: "Confusion matrix: 290 of 295 cats classified correctly, all 52 dogs predicted as cats" },
        { src: "view/assets/Images/projects/cat-vs-dog-classification-2.webp", alt: "ROC curve with an AUC of 0.4904" }
      ],
      description: "Binary image classifier using TensorFlow/Keras - demonstrates a full training & evaluation workflow.",
      repoUrl: "https://github.com/Abtahi360/Cat-vs-Dog-Image-Classification-using-Convolutional-Neural-Network-CNN"
    },
    {
      key: "tic-tac-toe-game",
      kicker: "Web Development",
      title: "Tic Tac Toe Game",
      tags: ["HTML", "CSS", "JavaScript"],
      group: "software",
      media: [
        { src: "view/assets/Images/projects/tic-tac-toe-game-1.webp", alt: "Tic Tac Toe board mid-game with a column of three X marks" },
        { src: "view/assets/Images/projects/tic-tac-toe-game-2.webp", alt: "Tic Tac Toe start screen with Player vs Player and Player vs Computer options" }
      ],
      description: "Interactive browser-based Tic Tac Toe game demonstrating DOM manipulation and game logic using vanilla JavaScript.",
      repoUrl: "https://github.com/Abtahi360/Tic-Tac-Toe-Game",
      liveLink: "https://tic-tac-toe-abtahiislam.vercel.app/"
    },
    {
      key: "space-shooter-game",
      kicker: "Game Development",
      title: "Space Shooter (OpenGL)",
      tags: ["C++", "C", "OpenGL"],
      group: "software",
      media: [
        { src: "view/assets/Images/projects/space-shooter-game-1.webp", alt: "Space Shooter main menu with New Game, Save Game, Leader Board and Music options" },
        { src: "view/assets/Images/projects/space-shooter-game-2.webp", alt: "Space Shooter gameplay with the player ship facing enemy fighters and health bars" }
      ],
      description: "Three-level C++ OpenGL game with power-ups, boss fights, save/load, and final walk-home cutscene.",
      repoUrl: "https://github.com/Abtahi360/Space-Shooter-A-three-level-OpenGL-game-with-final-walk-home-cutscene"
    },
    {
      key: "presento-ai-assessment",
      kicker: "AI/ML",
      title: "Presento - AI Presentation Assessment",
      tags: ["System Design", "Figma"],
      group: "ml",
      media: [
        { src: "view/assets/Images/projects/presento-ai-assessment-1.webp", alt: "Presento progress dashboard showing overall score, improvement, filler words per minute and gesture score" },
        { src: "view/assets/Images/projects/presento-ai-assessment-2.webp", alt: "Presento student report page with PDF and CSV export and a share link" }
      ],
      description: "Multimodal system design (CV, speech, slide analysis) to evaluate presentation skills and generate reports.",
      repoUrl: "https://github.com/Abtahi360/Presento-AI-Powered-Multimodal-Presentation-Skill-Assessment"
    },
    {
      key: "network-topology-simulation",
      kicker: "Networking",
      title: "Network Topology Simulation",
      tags: ["Cisco Packet Tracer"],
      group: "systems",
      media: [
        { src: "view/assets/Images/projects/network-topology-simulation-1.webp", alt: "Packet Tracer topology linking a hub, two switches and a bridge across eight PCs" },
        { src: "view/assets/Images/projects/network-topology-simulation-2.webp", alt: "Packet Tracer router-based inter-switch topology with the simulation event list" }
      ],
      description: "Educational Packet Tracer labs: multi-level topology and router-based inter-switch communication.",
      repoUrl: "https://github.com/Abtahi360/Network-Topology-Simulation-with-Cisco-Packet-Tracer"
    },
    {
      key: "autocad-electrical-diagrams",
      kicker: "CAD",
      title: "AutoCAD Electrical Diagrams",
      tags: ["AutoCAD 2007"],
      group: "systems",
      media: [
        { src: "view/assets/Images/projects/autocad-electrical-diagrams-1.webp", alt: "AutoCAD electrical circuit schematic with labelled resistors and capacitors" },
        { src: "view/assets/Images/projects/autocad-electrical-diagrams-2.webp", alt: "AutoCAD electrical wiring layout of a floor plan" }
      ],
      description: "Four electrical circuit schematics (.dwg) created for a CAD assignment - AutoCAD 2007 format.",
      repoUrl: "https://github.com/Abtahi360/Showcasing-electrical-circuit-diagrams-designed-in-AutoCAD-2007"
    },
    {
      key: "stopwatch-timer-csharp",
      kicker: "Desktop App",
      title: "Stopwatch Timer – C# WinForms",
      tags: ["C#", ".NET"],
      group: "software",
      media: [
        { src: "view/assets/Images/projects/stopwatch-timer-csharp-1.webp", alt: "Stopwatch Timer app in the dark theme with start, stop, pause and reset controls and a lap timer" },
        { src: "view/assets/Images/projects/stopwatch-timer-csharp-2.webp", alt: "Stopwatch Timer app in the pink theme with recorded laps" }
      ],
      description: "Simple stopwatch app with start/stop/pause/reset, history log, and dark/light theme toggle.",
      repoUrl: "https://github.com/Abtahi360/Stopwatch_Timer"
    },
    // {
    //   key: "electricity-billing-system-java",
    //   kicker: "Desktop App",
    //   title: "Electricity Billing System – Java",
    //   tags: ["Java"],
    //   images: ["view/assets/Images/bill1.png", "view/assets/Images/bill2.png"],
    //   description: "Desktop Java application for billing, customer mgmt, and payment processing (file-based storage).",
    //   repoUrl: "https://github.com/Abtahi360/Electricity_Billing_System"
    // },
    {
      key: "boi-jatra-bookstore-java",
      kicker: "Desktop App",
      title: "Boi Jatra – Bookstore Management",
      tags: ["Java"],
      group: "software",
      media: [
        { src: "view/assets/Images/projects/boi-jatra-bookstore-java-1.webp", alt: "Boi Jatra home screen showing a grid of book covers" },
        { src: "view/assets/Images/projects/boi-jatra-bookstore-java-2.webp", alt: "Boi Jatra book detail screen with price, quantity and Add to Cart" }
      ],
      description: "Text-file based bookstore app with admin/user panels, cart & payment simulation.",
      repoUrl: "https://github.com/Abtahi360/Boi_Jatra"
    }
  ],
  /* ── Research & Publications ──────────────────────────────────────────────
     Rendered by controller/research.js in array order (newest first).
     Only verified metadata belongs here: leave a field out rather than guess.
     A missing year, author list or DOI is simply not shown, and the APA
     "Cite" button only appears when authors, year and venue are all known.
       type          Journal | Conference | Preprint | ...
       authors       full names in publication order (selfName is emphasised)
       citationAuthors  APA author string, used by the Cite button
       citationTitle    APA sentence-case title (optional; falls back to title)
       facts         short, verifiable highlights shown as chips
       methods       methods named in the abstract
       contribution  your own part of the work
       doi           bare DOI (10.xxxx/...); links.researchgate is optional */
  selfName: "Abtahi Islam",
  research: [
    {
      key: "ai-ethics-academic-work",
      type: "Journal",
      year: 2026,
      date: "2026-04-01",
      title: "The Ethics of AI Technology in Academic Work: Assessing the Line Between Assistance and Plagiarism",
      citationTitle: "The ethics of AI technology in academic work: Assessing the line between assistance and plagiarism",
      authors: [
        "Md. Owafeeuzzaman Patwary",
        "Md. Reazul Islam",
        "Abtahi Islam",
        "Nur-e Sarjina Khan",
        "Md. Abdullah Al-Jubair",
        "Md. Jakir Hossen",
        "M. F. Mridha"
      ],
      citationAuthors: "Patwary, M. O., Islam, M. R., Islam, A., Khan, N.-e. S., Al-Jubair, M. A., Hossen, M. J., & Mridha, M. F.",
      venue: "International Journal of Electrical and Computer Engineering (IJECE)",
      publisher: "Institute of Advanced Engineering and Science",
      issn: "2088-8708",
      volume: 16,
      issue: 2,
      pages: "924–944",
      facts: ["Q3 journal", "n = 498 respondents", "Survey study"],
      tldr: "A survey of 498 respondents found correlations between AI usage frequency, dependency and critical engagement, and surfaced concerns about inaccuracies, misuse and absent institutional policies.",
      methods: ["Survey", "Statistical analysis"],
      contribution: ["Survey design", "Statistical analysis", "Chi-square testing", "Regression modeling", "Ethical framework development"],
      abstract: "This study explores the ethical boundaries of AI in academic work, examining assistance versus plagiarism. A survey of 498 respondents revealed correlations between AI usage frequency, dependency, and critical engagement. Statistical analysis highlighted concerns about inaccuracies, misuse, and absent institutional policies. Findings emphasize responsible integration, ethical frameworks, and educational interventions to ensure AI enhances learning while preserving academic integrity.",
      keywords: ["AI Ethics", "AI Dependency", "Academic Integrity", "Responsible AI Integration", "AI Tools in Education"],
      doi: "10.11591/ijece.v16i2.pp924-944"
    },
    {
      key: "ai-textile-waste-management",
      type: "Conference",
      title: "Artificial Intelligence in Textile Waste Management: Exploring Predictive Modelling, Recycling Innovations, and Sustainable Solutions",
      venue: "3rd International Conference on Textile Science and Engineering",
      venueDetail: "BUTEX",
      facts: ["Conference paper", "Survey study"],
      tldr: "Occupation strongly influences AI awareness, while high costs and limited awareness remain the key barriers to adopting AI in textile waste management.",
      methods: ["Survey", "SPSS", "Chi-square testing", "Multinomial logistic regression"],
      contribution: ["Survey design", "SPSS analysis", "Chi-square testing", "Regression modeling", "Research interpretation"],
      abstract: "This study explores the role of artificial intelligence in sustainable textile waste management, focusing on predictive modelling, recycling innovation, and AI-driven waste reduction strategies. This study examines AI adoption in textile waste management using survey data, SPSS analysis, chi-square testing, and multinomial logistic regression. Findings show that occupation strongly influences AI awareness, while high costs and limited awareness remain key barriers to implementation.",
      keywords: ["Artificial Intelligence", "Textile Waste Management", "Predictive Modelling", "Recycling Innovation", "Sustainability"],
      links: {
        researchgate: "https://www.researchgate.net/publication/400526019_Artificial_Intelligence_in_Textile_Waste_Management_Exploring_Predictive_Modelling_Recycling_Innovations_and_Sustainable_Solutions"
      }
    }
  ],

  certificates: [
    {
      title: "Code to Cloud: Practical DevOps with AWS",
      meta: "Cloudly Infotech Limited - May 2026",
      skills: "DevOps Fundamentals, AWS Cloud Services, CI/CD Pipelines, Deployment Workflows, Cloud Infrastructure, Cloud-based Application Deployment.",
      image: "view/assets/Images/Code to Cloud.jpg",
      premium: true
    },
    {
      title: "Certificate Program in Applied AI (Statistics to NLP)",
      meta: "HCL GUVI - April 2026",
      skills: "Artificial Intelligence, Statistics, Natural Language Processing (NLP), Data Analysis, Text Processing.",
      image: "view/assets/Images/Certificate Program in Applied AI (Statistics to NLP).png",
      premium: true
    },
    {
      title: "Network Smarter with AI",
      meta: "Grameenphone Academy - April 2026",
      skills: "Artificial Intelligence, AI Networking Concepts, Network Optimization, Problem Solving",
      image: "view/assets/Images/Network Smarter with AI.png"
    },
    {
      title: "AI-Powered Communication",
      meta: "Grameenphone Academy - April 2026",
      skills: "Artificial Intelligence, AI Communication, Digital Communication, Smart Communication Systems, Communication Technology",
      image: "view/assets/Images/AI-Powered Communication.png"
    },
    {
      title: "Android Course Build 3 Applications from Scratch with Java",
      meta: "Udemy - May 2025",
      skills: "Java, Android Development, Mobile Application Development, Object-Oriented Programming (OOP), UI/UX Implementation.",
      image: "https://www.udemy.com/certificate/UC-9f75f1ea-f89c-456c-83ff-4073415177c4/"
    },
    {
      title: "Spring Boot 4, Spring 7 & Hibernate for Beginners",
      meta: "Udemy - January 2026",
      skills: "Spring Boot 3, Spring Framework 6, REST API development, Spring MVC, Spring Security, MySQL + Hibernate/JPA, Maven, Thymeleaf, IntelliJ IDEA, Backend Architecture, AOP Logging.",
      image: "view/assets/Images/Spring Boot 4, Spring 7 & Hibernate for Beginners.jpg",
      premium: true
    },
    {
      title: "Scrum Master Certification",
      meta: "Udemy - September 2025",
      skills: "Scrum, Agile Methodologies, Project Management, Project Planning, Team Leadership, Communication, Problem Solving.",
      image: "view/assets/Images/Scrum Master Certification.jpg"
    },
    {
      title: "Java Complete Course Using Visual Studio Code",
      meta: "Udemy - July 2025",
      skills: "Java, Object-Oriented Programming (OOP), Microsoft Visual Studio Code, Microsoft Visual Studio Code, Debugging & Code Optimization, Software Development Fundamentals.",
      image: "view/assets/Images/Java Complete Course Using Visual Studio Code.jpg"
    },
    {
      title: "IT Essentials: PC Hardware and Software",
      meta: "Cisco Networking Academy - June 2023",
      skills: "Computer Hardware Troubleshooting · Operating Systems · Networking Concepts · IT Support Basics.",
      image: "view/assets/Images/IT Essentials PC Hardware and Software.jpg"
    },
    {
      title: "Computer Hardware Basics",
      meta: "Cisco Networking Academy - November 2025",
      skills: "Computer Hardware Basics.",
      image: "view/assets/Images/Computer Hardware Basics.jpg"
    },
    {
      title: "Introduction to 2D Animation",
      meta: "Grameenphone Academy - November 2025",
      skills: "2D Animation · Animation Principles · Adobe Animate · Digital Illustration.",
      image: "view/assets/Images/Introduction to 2D Animation.jpg"
    },
    {
      title: "Gemini Certified University Student",
      meta: "Google - November 2025",
      skills: "Google AI · Prompting and AI Usage · Responsible AI",
      image: "view/assets/Images/Gemini Certified University Student.jpg"
    },
    {
      title: "Critical Thinking in the AI Era",
      meta: "HP LIFE - February 2026",
      skills: "Critical Thinking · Fact-checking · AI Literacy · Analytical Thinking.",
      image: "view/assets/Images/Critical Thinking in the AI Era.png"
    },
    {
      title: "Agile Project Management",
      meta: "HP LIFE - February 2026",
      skills: "Agile Project Management · Agile Methodologies · Scrum · Project Planning · Digital Business",
      image: "view/assets/Images/Agile Project Management.png"
    }
  ],

  /* ── Photo Gallery ────────────────────────────────────────────────────────
     Media is NOT listed here. It is discovered at runtime from the public Google
     Drive folder by the Netlify Function (netlify/functions/gallery.js).
     This block only configures the front end. Folder ID is a public share
     identifier, not a secret; the API key lives in Netlify environment variables only. */
  gallery: {
    provider: "google-drive",
    folderId: "1dsPV2x0nEvN-8j6FlfVRo1ehscXLZ_ov",
    recursive: true,
    pageSize: 24
  }
};
