
const featuredProjects = [
  {
    id: "agribot",
    title: "AgriBot — Agricultural Advisory Chatbot",
    tagline: "AI-powered crop & fertilizer prediction system for Bangladeshi farmers",
    category: "AI / Machine Learning",
    status: "Completed",
    year: "2026",
    coverImage: "view/assets/Images/agribot-cover.png",   // add your cover image
    screenshots: [
      "view/assets/Images/agribot-cover.png"              // add more screenshots
    ],
    tags: ["Python", "DistilBERT", "FastAPI", "RandomForest", "NLP"],
    stars: 0,
    forks: 0,
    repoUrl: "https://github.com/Abtahi360/AgriBot",
    liveUrl: "",
    youtubeId: "YOUR_YOUTUBE_VIDEO_ID",  // ← paste your YouTube video ID here
    // e.g. for https://www.youtube.com/watch?v=dQw4w9WgXcQ → "dQw4w9WgXcQ"
    problem: "Farmers in Bangladesh lack easy access to data-driven advice on which crops to grow and what fertilizers to apply, leading to reduced yields and economic losses.",
    solution: "AgriBot combines NLP intent classification (DistilBERT) with ensemble ML models (RandomForest + GradientBoosting) to provide real-time crop and fertilizer recommendations through a conversational chatbot interface.",
    features: [
      "Intent classification using fine-tuned DistilBERT model",
      "Crop recommendation based on soil & weather data (RandomForest)",
      "Fertilizer prediction using ensemble ML models",
      "Disease knowledge base with rule-based responses",
      "RESTful FastAPI backend with CORS support",
      "Self-contained chatbot UI with real-time responses",
      "Trained on 3 agricultural datasets"
    ],
    techStack: {
      "ML/NLP": ["DistilBERT", "RandomForest", "GradientBoosting", "scikit-learn"],
      "Backend": ["Python", "FastAPI", "Uvicorn"],
      "Frontend": ["HTML", "CSS", "JavaScript"],
      "Data": ["Pandas", "NumPy", "Jupyter Notebook"],
      "Datasets": ["Crop Recommendation", "Fertilizer Prediction", "Soil/Weather Data"]
    },
    impact: "Provides data-driven agricultural guidance to farmers without requiring technical expertise, supporting food security and economic empowerment."
  }
  // ── Add more featured projects below ─────────────────────
  // {
  //   id: "your-next-project",
  //   title: "Your Next Real-World Project",
  //   ...
  // }
];
