var projectDetails = {
  "spring-boot-practice": {
    title: "Spring Boot 3 Practice – Udemy Learning Projects",
    body: `
      <h3>About This Repository</h3>
      <p>This repository contains all the hands-on practice work I complete while learning from the Udemy course: “Spring Boot 3, Spring 6 & Hibernate for Beginners” – Chad Darby. Each folder represents a separate module, demo, or real-time project built during my learning.</p>
      <h3>What’s Included</h3>
      <ul>
        <li><b>Spring Boot Essentials:</b> Project setup, Starters, Java-based bean configuration, Dependency injection.</li>
        <li><b>REST API Development:</b> REST controllers, CRUD operations, Exception handling, ResponseEntity patterns.</li>
        <li><b>Hibernate & JPA:</b> Entity classes, One-to-One/One-to-Many mappings, JPQL, Database CRUD.</li>
        <li><b>Spring Data JPA:</b> JpaRepository, Pagination and sorting, Derived queries.</li>
        <li><b>Spring Security:</b> Basic login, Role-based access, Password encryption (bcrypt), JDBC authentication.</li>
        <li><b>Spring MVC + Thymeleaf:</b> Form handling, Data binding, Server-side validation.</li>
        <li><b>AOP:</b> Logging aspects, Reusable pointcuts.</li>
      </ul>
      <h3>Skills Gained</h3>
      <ul>
        <li>Spring Boot 3 & Spring Framework 6</li>
        <li>REST API development</li>
        <li>Spring MVC & Spring Security</li>
        <li>MySQL + Hibernate/JPA</li>
        <li>Maven & Thymeleaf</li>
        <li>Backend Architecture & AOP</li>
      </ul>
      <h3>Purpose of This Repository</h3>
      <p>Track my Spring Boot learning progress, practice real industry-level backend development, and build strong fundamentals in Java + Spring.</p>
    `
  },
  "brain-tumor-segmentation": {
    title: "Brain Tumor MRI Segmentation using Keras",
    body: `
      <h3>Project Overview</h3>
      <p>A hands-on comparison of one model from each major Keras application family (35 models total in the original sweep) trained and tested on a Brain Tumor MRI dataset. The goal is to see how each pretrained Keras model behaves for this medical imaging task, compare qualitative and quantitative metrics, and identify which models give the best trade-off between performance and cost.</p>
      <h3>Models Compared</h3>
      <ul>
        <li><b>Xception:</b> Lightweight, good feature extraction.</li>
        <li><b>VGG19:</b> High parameters, slower training.</li>
        <li><b>ResNet Family (50V2, 101V2, 152V2):</b> Balanced depth and strong performance.</li>
        <li><b>InceptionV3 & InceptionResNetV2:</b> Multi-scale feature extraction.</li>
        <li><b>MobileNetV2:</b> Fast and efficient.</li>
        <li><b>DenseNet201:</b> Strong gradient flow.</li>
        <li><b>EfficientNet & ConvNeXt:</b> Modern architectures with excellent accuracy.</li>
      </ul>
      <h3>What I Compared</h3>
      <ul>
        <li>Used a shared helper function for consistent model instantiation.</li>
        <li>Kept training settings consistent for fair comparisons.</li>
        <li>Collected quantitative metrics (accuracy, loss) and qualitative outputs (predicted masks).</li>
      </ul>
      <h3>Dataset Information</h3>
      <p>Dataset: <a href="https://www.kaggle.com/datasets/sartajbhuvaji/brain-tumor-classification-mri" target="_blank">Brain Tumor Classification MRI</a></p>
    `
  },
  "cat-vs-dog-classification": {
    title: "Cat vs Dog Classification using CNN",
    body: `
      <h3>Project Overview</h3>
      <p>Purpose: Build, train and evaluate a Convolutional Neural Network (CNN) that classifies images into two classes: cat and dog. This project demonstrates a typical supervised deep learning workflow (data preparation, model design, training, validation, and inference).</p>
      <h3>Model Architecture</h3>
      <ul>
        <li><b>Layers:</b> Input → Conv2D → ReLU → MaxPooling → Conv2D → ReLU → MaxPooling → Flatten → Dense → Dropout → Dense (output)</li>
        <li><b>Activation:</b> ReLU for hidden layers, Sigmoid for output.</li>
        <li><b>Loss:</b> binary_crossentropy</li>
        <li><b>Optimizer:</b> Adam</li>
      </ul>
      <h3>Training Configuration</h3>
      <ul>
        <li><b>Image size:</b> 128 x 128 (resizable)</li>
        <li><b>Batch size:</b> 32</li>
        <li><b>Epochs:</b> 20–50</li>
        <li><b>Hardware:</b> Google Colab with GPU runtime</li>
      </ul>
      <h3>Future Improvements</h3>
      <ul>
        <li>Use transfer learning (VGG, ResNet, MobileNet).</li>
        <li>Hyperparameter tuning and larger image sizes.</li>
        <li>Quantization / pruning for deployment on edge devices.</li>
      </ul>
    `
  },
  "tic-tac-toe-game": {
    title: "Tic Tac Toe Game",
    body: `
    <h3>Project Overview</h3>
    <p>Purpose: Develop a simple and interactive Tic Tac Toe game using HTML, CSS, and JavaScript. This project demonstrates core front-end development concepts including DOM manipulation, event handling, and game logic implementation.</p>

    <h3>Game Features</h3>
    <ul>
      <li><b>Mode:</b> Two-player (Player X vs Player O)</li>
      <li><b>Logic:</b> Real-time win detection and draw condition</li>
      <li><b>UI:</b> Clean and responsive interface</li>
      <li><b>Controls:</b> Reset / Restart game functionality</li>
    </ul>

    <h3>Technical Implementation</h3>
    <ul>
      <li><b>Structure:</b> HTML for layout</li>
      <li><b>Styling:</b> CSS for design and responsiveness</li>
      <li><b>Logic:</b> JavaScript for game mechanics</li>
      <li><b>Concepts:</b> DOM manipulation, event listeners, conditional logic</li>
    </ul>

    <h3>Future Improvements</h3>
    <ul>
      <li>Add AI opponent (Single-player mode)</li>
      <li>Score tracking system</li>
      <li>Sound effects and animations</li>
      <li>Mobile UI enhancements</li>
    </ul>
  `
  },
  "space-shooter-game": {
    title: "Space Shooter Game using OpenGL",
    body: `
      <h3>Project Summary</h3>
      <p>A simple, fun space shooter where the player controls a plane, fights waves of enemy planes, and defeats one boss per level. The game has three progressively harder levels. Each level changes background and enemies.</p>
      <h3>Core Features</h3>
      <ul>
        <li><b>Player:</b> Move, fire bullets, limited lives/health.</li>
        <li><b>Enemies:</b> Different types per level with movement patterns.</li>
        <li><b>Bosses:</b> One boss per level with special attacks.</li>
        <li><b>Power-ups:</b> Shield, rapid fire, health restore.</li>
        <li><b>Game Management:</b> Save/Load progress, Leaderboard, Help menu.</li>
      </ul>
      <h3>Finishing Scene</h3>
      <p>After level three, a short cutscene shows the pilot exiting the plane and walking toward a house, marking game completion.</p>
      <h3>Technical Stack</h3>
      <ul>
        <li><b>Language:</b> C++</li>
        <li><b>API:</b> OpenGL</li>
        <li><b>IDE:</b> Code::Blocks</li>
      </ul>
    `
  },
  "presento-ai-assessment": {
    title: "Presento – AI-Powered Multimodal Presentation Skill Assessment",
    body: `
      <h3>Project Overview</h3>
      <p>Presento provides automated, multimodal feedback on students’ presentation skills. It leverages computer vision, speech analysis, and slide evaluation to give learners objective, data-driven insights.</p>
      <h3>Key Features</h3>
      <ul>
        <li><b>Multimodal Feedback:</b> Posture, gestures, voice delivery, and slide quality.</li>
        <li><b>AI Integration:</b> Whisper (speech), BlazePose (posture), CNN and BERT-based models.</li>
        <li><b>Report Generation:</b> Annotated visuals, transcripts, and shareable PDFs.</li>
        <li><b>Dashboards:</b> Progress tracking for students and overview for instructors.</li>
      </ul>
      <h3>SDLC Phases Covered</h3>
      <p>Comprehensive documentation covering Requirement Analysis (PRD), Planning (COCOMO), Design (UML & Figma), and Testing (Acceptance-driven).</p>
      <h3>Future Work</h3>
      <ul>
        <li>Real-time feedback during live presentations.</li>
        <li>Emotion detection & engagement measurement.</li>
        <li>Multilingual support.</li>
      </ul>
    `
  },
  "network-topology-simulation": {
    title: "Network Topology Simulation with Cisco Packet Tracer",
    body: `
      <h3>Project Overview</h3>
      <p>A hands-on demonstration of configuring multi-level network topologies and router-based inter-switch communication using Cisco Packet Tracer.</p>
      <h3>Tasks Included</h3>
      <ul>
        <li><b>Task 1: Multi-Level Network Topology:</b> PC0 to PC5 transmission through Hub, Switches, and Bridge.</li>
        <li><b>Task 2: Router-Based Inter-Switch Communication:</b> Packet routing between two subnets using a router.</li>
      </ul>
      <h3>Key Features</h3>
      <ul>
        <li>Static IP addressing and subnet masks.</li>
        <li>Simulation Mode to see data movement.</li>
        <li>Practical LAN and inter-subnet scenarios.</li>
      </ul>
      <h3>Devices Used</h3>
      <p>PCs, Hub, Switches, Bridge, Router, Copper Straight-Through/Crossover cables.</p>
    `
  },
  "autocad-electrical-diagrams": {
    title: "Electrical Circuit Diagrams Designed in AutoCAD 2007",
    body: `
      <h3>Overview</h3>
      <p>This repository contains four electrical circuit diagrams (1A, 1B, 1C, 1D) created as part of a CAD midterm assignment. Each circuit is meticulously drawn to demonstrate proficiency in AutoCAD for electrical design.</p>
      <h3>Functions and Features</h3>
      <ul>
        <li>Four unique circuits organized in a single .dwg file.</li>
        <li>Accurate electrical schematics using standard symbols.</li>
        <li>Layered design for easy editing and visibility control.</li>
      </ul>
      <h3>Technical Details</h3>
      <ul>
        <li><b>Software:</b> AutoCAD 2007</li>
        <li><b>File Format:</b> .dwg</li>
        <li><b>Compatibility:</b> Accessible for older versions and scalable in newer versions.</li>
      </ul>
    `
  },
  "stopwatch-timer-csharp": {
    title: "Stopwatch Timer using C# WinForms",
    body: `
      <h3>Project Overview</h3>
      <p>A simple and elegant Stopwatch Timer application built using C# and Windows Forms. It provides core stopwatch functionalities with a modern UI and theme customization.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Start, Stop, Pause, and Reset Timer.</li>
        <li>History Log on Reset.</li>
        <li>Dark Mode & Light Mode Toggle.</li>
        <li>Accurate Time Count (Milliseconds to Hours).</li>
      </ul>
      <h3>Technologies Used</h3>
      <ul>
        <li>C# (.NET Framework)</li>
        <li>Windows Forms (WinForms)</li>
        <li>System.Timers</li>
      </ul>
    `
  },
  "electricity-billing-system-java": {
    title: "Electricity Billing System using Java",
    body: `
      <h3>Project Overview</h3>
      <p>A Java-based desktop application designed to automate and streamline electricity billing operations. It helps utility companies manage customer data, calculate bills, process payments, and generate details.</p>
      <h3>Key Features</h3>
      <ul>
        <li>Customer registration and login.</li>
        <li>Meter details management.</li>
        <li>Automatic bill calculation.</li>
        <li>Payment gateway integration (Bkash, Bank).</li>
        <li>Admin dashboard and billing overview.</li>
      </ul>
      <h3>Modules / Classes</h3>
      <p>Includes modules for Bank, BillDetails, Bkash, CalculateBill, CustomerDetails, MeterInfo, and more.</p>
      <h3>Technologies Used</h3>
      <ul>
        <li>Java (Swing for GUI)</li>
        <li>File I/O (Text file-based storage)</li>
        <li>OOP Concepts</li>
      </ul>
    `
  },
  "boi-jatra-bookstore-java": {
    title: "Boi Jatra – Bookstore Management System (Java)",
    body: `
      <h3>Project Overview</h3>
      <p>Boi Jatra is a Java-based bookstore application that simulates a virtual book purchasing system. The system uses text files instead of a database to store all information.</p>
      <h3>Key Features</h3>
      <ul>
        <li><b>Admin Panel:</b> Manage users, books, and order data.</li>
        <li><b>User Panel:</b> Browse categories, cart functionality, and checkout.</li>
        <li><b>Payment Integration:</b> Bkash or Bank transfer simulation.</li>
      </ul>
      <h3>Technologies Used</h3>
      <ul>
        <li>Java (Swing for GUI)</li>
        <li>File I/O (Text file-based storage)</li>
        <li>OOP Concepts</li>
      </ul>
    `
  },
  "trigram-language-model-story-generation": {
    title: "Trigram Language Model with Story Generation",
    body: `
      <h3>About This Repository</h3>
      <p>This repository contains my hands-on implementation of a trigram-based language model built from scratch as part of my NLP learning journey. The project focuses on understanding how statistical language models work without using any built-in n-gram libraries.</p>

      <h3>What’s Included</h3>
      <ul>
        <li><b>Text Preprocessing:</b> Lowercasing, punctuation removal, and tokenization.</li>
        <li><b>Trigram Language Model:</b> Word sequence probability using frequency counts.</li>
        <li><b>Laplace Smoothing:</b> Add-1 smoothing to handle unseen word sequences.</li>
        <li><b>Text Generation:</b> Greedy-based 30-word story generation from a seed input.</li>
        <li><b>Perplexity Evaluation:</b> Measuring model performance.</li>
        <li><b>Interpolation (Bonus):</b> Combining unigram, bigram, and trigram probabilities.</li>
      </ul>
      <h3>Skills Gained</h3>
      <ul>
        <li>Natural Language Processing (NLP)</li>
        <li>Statistical Language Modeling</li>
        <li>Probability & Smoothing Techniques</li>
        <li>Model Evaluation (Perplexity)</li>
        <li>Python-based NLP Implementation</li>
      </ul>
      <h3>Purpose of This Repository</h3>
      <p>Track my NLP learning progress, build strong fundamentals in language modeling, and gain practical experience in implementing core NLP concepts from scratch.</p>
    `
  },
  "docx-to-excel-generator": {
    title: "Automatic Excel Sheet Generator from DOCX Book Data",
    body: `
    <h3>About This Repository</h3>
    <p>This repository contains a Python-based automation tool that extracts structured information from a Bangla .docx book file and converts it into organized Excel files. The system detects chapters, bold sub-sections, and numbered hadith entries without manual effort.</p>

    <h3>What’s Included</h3>
    <ul>
      <li><b>Chapter Extraction:</b> Automatically identifies all "অধ্যায়" sections.</li>
      <li><b>Sub-section Detection:</b> Detects bold text blocks with proper formatting.</li>
      <li><b>Hadith Extraction:</b> Extracts numbered entries like [১], [২], etc.</li>
      <li><b>Data Cleaning:</b> Removes blank lines and unnecessary spaces.</li>
      <li><b>Excel Generation:</b> Creates three structured .xlsx files with IDs.</li>
    </ul>

    <h3>Skills Gained</h3>
    <ul>
      <li>Python Programming</li>
      <li>Text Processing & Pattern Recognition</li>
      <li>Data Extraction from Documents</li>
      <li>Data Cleaning & Structuring</li>
      <li>Automation with Pandas & python-docx</li>
    </ul>

    <h3>Real-Life Use Cases & Impact</h3>
    <ul>
      <li>Convert books into structured datasets for research</li>
      <li>Build searchable databases (e.g., hadith collections)</li>
      <li>Reduce manual data entry time and errors</li>
      <li>Prepare clean data for NLP and machine learning tasks</li>
      <li>Useful for digital libraries and content management systems</li>
    </ul>

    <h3>Purpose of This Repository</h3>
    <p>The main purpose of this project is to automate repetitive document-to-Excel tasks, improve efficiency, and make unstructured text data easy to use for analysis, applications, and research.</p>
  `
  }
};

function initProjectModal() {
  if (typeof document === "undefined") {
    return;
  }
  if (typeof projectDetails === "undefined") {
    return;
  }
  var backdrop = document.getElementById("project-modal-backdrop");
  var titleEl = document.getElementById("project-modal-title");
  var bodyEl = document.getElementById("project-modal-body");
  var closeBtn = document.getElementById("project-modal-close-btn");
  var closeIconBtn = backdrop ? backdrop.querySelector(".project-modal-close") : null;
  if (!backdrop || !titleEl || !bodyEl || !closeBtn || !closeIconBtn) {
    return;
  }

  var lastFocused = null;

  function openModal(key) {
    var data = projectDetails[key];
    if (!data) {
      return;
    }
    titleEl.textContent = data.title || "";
    bodyEl.innerHTML = data.body || "";
    backdrop.classList.add("open");
    backdrop.setAttribute("aria-hidden", "false");
    lastFocused = document.activeElement;
    closeIconBtn.focus();
  }

  function closeModal() {
    backdrop.classList.remove("open");
    backdrop.setAttribute("aria-hidden", "true");
    bodyEl.innerHTML = "";
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  closeBtn.addEventListener("click", function () {
    closeModal();
  });

  closeIconBtn.addEventListener("click", function () {
    closeModal();
  });

  backdrop.addEventListener("click", function (event) {
    if (event.target === backdrop) {
      closeModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && backdrop.classList.contains("open")) {
      closeModal();
    }
  });

  var projectCards = document.querySelectorAll("#projects .cards-grid .card");
  projectCards.forEach(function (card) {
    var key = card.getAttribute("data-project-key");
    if (!key) {
      return;
    }
    card.addEventListener("click", function (event) {
      var anchor = event.target.closest("a");
      if (anchor) {
        return;
      }
      event.preventDefault();
      openModal(key);
    });
    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(key);
      }
    });
    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }
    if (!card.hasAttribute("role")) {
      card.setAttribute("role", "button");
    }
    var titleNode = card.querySelector(".card-title");
    if (titleNode && !card.hasAttribute("aria-label")) {
      card.setAttribute("aria-label", "View details for " + titleNode.textContent.trim());
    }
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectModal);
  } else {
    initProjectModal();
  }
}
