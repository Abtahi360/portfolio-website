const portfolioData = {
  education: [
    {
      kicker: "Undergraduate",
      title: "B.Sc. in Computer Science",
      period: "2023 — Ongoing",
      location: "Dhaka, Bangladesh",
      institution: "American International University - Bangladesh",
      skills: "· Object-Oriented Programming (OOP) · Problem Solving · AutoCAD · C# · Data Structures · Python (Programming Language) · Data Science · Genetic Algorithms · Algorithms · Machine Learning · Academic Publishing · Oracle Database · Java Database Connectivity (JDBC) · SQL · Theory of Computation · Project Management · Project Planning · User Interface Design",
      activities: "· Chess, Football, Badminton, Volleyball, Basketball, Cricket, Ludo, Table Tennis",
      coursework: "· Data Structures and Algorithms · Database Systems · Computer Networks · Operating Systems · Artificial Intelligence · Machine Learning · Data Science",
      summary: "Built strong CS fundamentals and delivered several team projects."
    },
    {
      kicker: "Higher Secondary Certificate",
      title: "Science",
      period: "2019 — 2021",
      location: "Ishwardi, Pabna, Bangladesh",
      institution: "Ishwardi Government College",
      skills: "C++ · C (Programming Language) · HTML",
      activities: "Chess, Ludo, Cricket, Football, Badminton, Volleyball, Basketball",
      coursework: "· High Mathematics · Physics · Chemistry · Biology"
    },
    {
      kicker: "Secondary School Certificate",
      title: "Science",
      period: "2016 — 2018",
      location: "Ishwardi, Pabna, Bangladesh",
      institution: "Govt. Sara Marwari Model School and College",
      activities: "Chess, Carrom, Sudoku, Ludo",
      coursework: "· High Mathematics · Physics · Chemistry · Biology"
    }
  ],
  projects: [
    {
      key: "docx-to-excel-generator",
      kicker: "Automation & Data Processing",
      title: "Automatic Excel Sheet Generator from DOCX Book Data",
      tags: ["Python", "Automation", "Data Extraction"],
      images: ["Images/docx-to-excel-generator 1.png"],
      description: "This project automates the extraction of structured data from a Bangla DOCX book file and converts it into clean Excel sheets, including chapters, sub-sections, and hadith entries.",
      repoUrl: "https://github.com/Abtahi360/Automatic-Excel-Sheet-Generator-from-DOCX-Book-Data"
    },
    {
      key: "trigram-language-model-story-generation",
      kicker: "Natural Language Processing",
      title: "Trigram Language Model with Story Generation",
      tags: ["NLP", "Text Generation", "Python"],
      images: [
        "Images/Trigram Language Model with Story Generation 1.png",
        "Images/Trigram Language Model with Story Generation 2.png"
      ],
      description: "This project implements a Trigram Language Model from scratch in Python as part of a Natural Language Processing assignment. The model learns word patterns from a corpus and generates meaningful text using probabilistic methods.",
      repoUrl: "https://github.com/Abtahi360/Trigram-Language-Model-with-Story-Generation"
    },
    {
      key: "spring-boot-practice",
      kicker: "Spring Boot",
      title: "Spring Boot 3 Practice",
      tags: ["Java 17", "Spring 6", "Hibernate"],
      images: ["Images/spring1.png", "Images/spring2.png"],
      description: "Collection of hands-on practice modules following a Spring Boot + Hibernate course. The goal of this repository is to organize my work, show my progress, and build practical backend development skills.",
      repoUrl: "https://github.com/Abtahi360/Bootcamp-with-Spring-by-Abtahi"
    },
    {
      key: "brain-tumor-segmentation",
      kicker: "Machine Learning",
      title: "Brain Tumor MRI Segmentation",
      tags: ["Keras", "TensorFlow"],
      images: ["Images/mri1.png", "Images/mri2.png"],
      description: "Comparative sweep of Keras models for MRI segmentation - training, evaluation, and single-image demos.",
      repoUrl: "https://github.com/Abtahi360/A-Comparative-Study-of-Keras-Models-for-Brain-Tumor-MRI-Segmentation"
    },
    {
      key: "cat-vs-dog-classification",
      kicker: "Machine Learning",
      title: "Cat vs Dog Classification",
      tags: ["CNN", "TensorFlow"],
      images: ["Images/cat1.png", "Images/cat2.png"],
      description: "Binary image classifier using TensorFlow/Keras — demonstrates a full training & evaluation workflow.",
      repoUrl: "https://github.com/Abtahi360/Cat-vs-Dog-Image-Classification-using-Convolutional-Neural-Network-CNN"
    },
    {
      key: "tic-tac-toe-game",
      kicker: "Web Development",
      title: "Tic Tac Toe Game",
      tags: ["HTML", "CSS", "JavaScript"],
      images: ["Images/tic-tac-toe-game 1.png", "Images/tic-tac-toe-game 2.png"],
      description: "Interactive browser-based Tic Tac Toe game demonstrating DOM manipulation and game logic using vanilla JavaScript.",
      repoUrl: "https://github.com/Abtahi360/Tic-Tac-Toe-Game",
      liveLink: "https://tic-tac-toe-game-five-pied.vercel.app/"
    },
    {
      key: "space-shooter-game",
      kicker: "Game Development",
      title: "Space Shooter (OpenGL)",
      tags: ["C++", "C", "OpenGL"],
      images: ["Images/game1.png", "Images/game2.png"],
      description: "Three-level C++ OpenGL game with power-ups, boss fights, save/load, and final walk-home cutscene.",
      repoUrl: "https://github.com/Abtahi360/Space-Shooter-A-three-level-OpenGL-game-with-final-walk-home-cutscene"
    },
    {
      key: "presento-ai-assessment",
      kicker: "AI/ML",
      title: "Presento — AI Presentation Assessment",
      tags: ["System Design", "Figma"],
      images: ["Images/cv1.png", "Images/cv2.png"],
      description: "Multimodal system design (CV, speech, slide analysis) to evaluate presentation skills and generate reports.",
      repoUrl: "https://github.com/Abtahi360/Presento-AI-Powered-Multimodal-Presentation-Skill-Assessment"
    },
    {
      key: "network-topology-simulation",
      kicker: "Networking",
      title: "Network Topology Simulation",
      tags: ["Cisco Packet Tracer"],
      images: ["Images/cisco1.png", "Images/cisco2.png"],
      description: "Educational Packet Tracer labs: multi-level topology and router-based inter-switch communication.",
      repoUrl: "https://github.com/Abtahi360/Network-Topology-Simulation-with-Cisco-Packet-Tracer"
    },
    {
      key: "autocad-electrical-diagrams",
      kicker: "CAD",
      title: "AutoCAD Electrical Diagrams",
      tags: ["AutoCAD 2007"],
      images: ["Images/cad1.png", "Images/cad2.png"],
      description: "Four electrical circuit schematics (.dwg) created for a CAD assignment — AutoCAD 2007 format.",
      repoUrl: "https://github.com/Abtahi360/Showcasing-electrical-circuit-diagrams-designed-in-AutoCAD-2007"
    },
    {
      key: "stopwatch-timer-csharp",
      kicker: "Desktop App",
      title: "Stopwatch Timer – C# WinForms",
      tags: ["C#", ".NET"],
      images: ["Images/Stopwatch_Pink.png", "Images/Stopwatch_Dark.png"],
      description: "Simple stopwatch app with start/stop/pause/reset, history log, and dark/light theme toggle.",
      repoUrl: "https://github.com/Abtahi360/Stopwatch_Timer"
    },
    {
      key: "electricity-billing-system-java",
      kicker: "Desktop App",
      title: "Electricity Billing System – Java",
      tags: ["Java"],
      images: ["Images/bill1.png", "Images/bill2.png"],
      description: "Desktop Java application for billing, customer mgmt, and payment processing (file-based storage).",
      repoUrl: "https://github.com/Abtahi360/Electricity_Billing_System"
    },
    {
      key: "boi-jatra-bookstore-java",
      kicker: "Desktop App",
      title: "Boi Jatra – Bookstore Management",
      tags: ["Java"],
      images: ["Images/boi1.png", "Images/boi2.png"],
      description: "Text-file based bookstore app with admin/user panels, cart & payment simulation.",
      repoUrl: "https://github.com/Abtahi360/Boi_Jatra"
    }
  ],
  certificates: [
    {
      title: "Certificate Program in Applied AI (Statistics to NLP)",
      meta: "HCL GUVI - April 2026",
      skills: "Artificial Intelligence, Statistics, Natural Language Processing (NLP), Data Analysis, Text Processing.",
      image: "Images/Certificate Program in Applied AI (Statistics to NLP).png"
    },
    {
      title: "Network Smarter with AI",
      meta: "Grameenphone Academy - April 2026",
      skills: "Artificial Intelligence, AI Networking Concepts, Network Optimization, Problem Solving",
      image: "Images/Network Smarter with AI.png"
    },
    {
      title: "AI-Powered Communication",
      meta: "Grameenphone Academy - April 2026",
      skills: "Artificial Intelligence, AI Communication, Digital Communication, Smart Communication Systems, Communication Technology",
      image: "Images/AI-Powered Communication.png"
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
      image: "Images/Spring Boot 4, Spring 7 & Hibernate for Beginners.jpg"
    },
    {
      title: "Scrum Master Certification",
      meta: "Udemy - September 2025",
      skills: "Scrum, Agile Methodologies, Project Management, Project Planning, Team Leadership, Communication, Problem Solving.",
      image: "Images/Scrum Master Certification.jpg"
    },
    {
      title: "Java Complete Course Using Visual Studio Code",
      meta: "Udemy - July 2025",
      skills: "Java, Object-Oriented Programming (OOP), Microsoft Visual Studio Code, Microsoft Visual Studio Code, Debugging & Code Optimization, Software Development Fundamentals.",
      image: "Images/Java Complete Course Using Visual Studio Code.jpg"
    },
    {
      title: "IT Essentials: PC Hardware and Software",
      meta: "Cisco Networking Academy - June 2023",
      skills: "Computer Hardware Troubleshooting · Operating Systems · Networking Concepts · IT Support Basics.",
      image: "Images/IT Essentials PC Hardware and Software.jpg"
    },
    {
      title: "Computer Hardware Basics",
      meta: "Cisco Networking Academy - November 2025",
      skills: "Computer Hardware Basics.",
      image: "Images/Computer Hardware Basics.jpg"
    },
    {
      title: "Introduction to 2D Animation",
      meta: "Grameenphone Academy - November 2025",
      skills: "2D Animation · Animation Principles · Adobe Animate · Digital Illustration.",
      image: "Images/Introduction to 2D Animation.jpg"
    },
    {
      title: "Gemini Certified University Student",
      meta: "Google - November 2025",
      skills: "Google AI · Prompting and AI Usage · Responsible AI",
      image: "Images/Gemini Certified University Student.jpg"
    },
    {
      title: "Critical Thinking in the AI Era",
      meta: "HP LIFE - February 2026",
      skills: "Critical Thinking · Fact-checking · AI Literacy · Analytical Thinking.",
      image: "Images/Critical Thinking in the AI Era.png"
    },
    {
      title: "Agile Project Management",
      meta: "HP LIFE - February 2026",
      skills: "Agile Project Management · Agile Methodologies · Scrum · Project Planning · Digital Business",
      image: "Images/Agile Project Management.png"
    }
  ]
};