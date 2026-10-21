# NeuroLearn – Adaptive Learning Platform

## 📌 Overview

NeuroLearn is an AI-powered adaptive learning platform designed to provide a personalized and accessible learning experience for neurodivergent learners.

The platform is designed for learners with different learning requirements, including ADHD, Autism Spectrum Disorder (ASD), Dyslexia, and sensory processing sensitivities.

Instead of providing the same learning experience to every student, NeuroLearn dynamically adapts the learning interface and learning activities based on student interaction, focus, learning progress, and individual preferences.

---

## 🎯 Problem Statement

Traditional educational platforms generally provide the same learning interface and assessment methods to every student.

However, students can have different:

- Learning preferences
- Attention levels
- Reading difficulties
- Sensory sensitivities
- Learning speeds
- Ways of demonstrating understanding

NeuroLearn addresses this problem by combining Artificial Intelligence, Machine Learning, Soft Computing, Assistive Technology, and Adaptive Learning.

---

## 💡 Proposed Solution

NeuroLearn continuously analyzes student interaction data and uses intelligent algorithms to personalize the learning experience.

The system can:

- Estimate student focus
- Adapt typography and visual presentation
- Track concept mastery
- Recommend learning actions
- Provide adaptive quizzes
- Support multiple submission formats
- Provide assistive reading features
- Help teachers monitor student progress
- Provide personalized teacher feedback

---

## ✨ Key Features

### 🧠 Adaptive Learning

The system adapts learning activities according to student performance and learning progress.

### 📊 Focus Score

A Mamdani Fuzzy Inference System estimates a continuous Focus Score using factors such as:

- Quiz accuracy
- Response time
- Self-reported mood

### 🔤 Adaptive Typography

The ANFIS/Sugeno neuro-fuzzy controller can dynamically adapt:

- Font size
- Line spacing
- Background/theme

### 📚 Knowledge Tracking

Bayesian Knowledge Tracing (BKT) estimates the student's mastery of individual concepts.

### 🤖 Machine Learning

The platform uses several machine-learning approaches including:

- Bayesian Knowledge Tracing
- K-Nearest Neighbors
- Naive Bayes
- Q-Learning
- Item Response Theory

### 🎮 Neuro-Friendly Gamification

The platform uses a non-punitive gamification approach with a calm learning environment instead of traditional competitive leaderboards.

### 🎤 Multimodal Submissions

Students can demonstrate their understanding through:

- Text
- Audio
- Video
- Interactive mind maps

### 👨‍🏫 Teacher Feedback

Teachers can:

- Review submissions
- Listen to audio
- Watch videos
- Inspect transcripts
- Provide actionable suggestions
- Recognize student strengths
- Recommend accommodations

### ♿ Assistive Technologies

The platform includes:

- Bionic Reading
- Reading Focus Ruler
- Color/Tint Overlay
- Text-to-Speech
- Speech-to-Text
- Sensory-friendly audio feedback

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       STUDENT           │
                    │       / TEACHER         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │   UI + Assistive Layer  │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Adaptive AI Layer     │
                    │                         │
                    │  • Mamdani FIS          │
                    │  • ANFIS                 │
                    │  • BKT                   │
                    │  • KNN                   │
                    │  • Naive Bayes           │
                    │  • Q-Learning            │
                    │  • IRT                   │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Express Backend     │
                    │       REST API           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Persistent Storage   │
                    └─────────────────────────┘
```

---

## 🧮 Algorithms

| Algorithm | Purpose |
|---|---|
| Mamdani FIS | Calculates student Focus Score |
| ANFIS / Sugeno | Adapts typography and visual presentation |
| Bayesian Knowledge Tracing | Tracks concept mastery |
| KNN | Classifies learner archetypes |
| Naive Bayes | Estimates fatigue/disengagement |
| Q-Learning | Recommends learning actions |
| Item Response Theory | Supports adaptive question difficulty |
| DAG Knowledge Graph | Controls prerequisite progression |
| NLU Verification | Checks the quality of student explanations |

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS

### Backend

- Node.js
- Express.js

### AI / Machine Learning

- Bayesian Knowledge Tracing
- K-Nearest Neighbors
- Naive Bayes
- Q-Learning
- Item Response Theory

### Soft Computing

- Mamdani Fuzzy Inference
- ANFIS / Sugeno Neuro-Fuzzy Controller
- Genetic Algorithm-inspired optimization

### Assistive Technologies

- Web Speech API
- Text-to-Speech
- Speech-to-Text
- Bionic Reading
- Reading Focus Ruler
- Color/Tint Overlay

---

## 📁 Project Structure

```text
src/
├── algorithms/
│   ├── softComputing.ts
│   ├── aiMlEngine.ts
│   └── neuroGamificationEngine.ts
│
├── components/
│
├── pages/
│   ├── AdaptiveQuiz.tsx
│   ├── LessonView.tsx
│   ├── StudentDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── MultiModalSubmissionPage.tsx
│   └── TeacherSubmissionsPage.tsx
│
├── utils/
├── types.ts
├── mockData.ts
├── App.tsx
└── main.tsx

server.ts
vite.config.ts
tsconfig.json
package.json
```

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/neurolearn-adaptive-learning-platform.git
```

### 2. Navigate into the project

```bash
cd neurolearn-adaptive-learning-platform
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

The application should then be available through the local development URL shown in the terminal.

---

## 👥 User Roles

### Student

Students can:

- Access lessons
- Take adaptive quizzes
- Track progress
- Use assistive reading features
- Submit assignments
- Submit text/audio/video/mind-map responses
- Receive teacher feedback

### Teacher

Teachers can:

- Manage students
- Manage lessons
- Create quiz questions
- Review submissions
- Monitor analytics
- Provide feedback
- Recommend accommodations

---

## 🔄 Adaptive Learning Workflow

```text
Student Interaction
        ↓
Collect Learning Data
        ↓
Focus & Performance Analysis
        ↓
AI / Soft Computing Algorithms
        ↓
Personalized Adaptation
        ↓
Student Learning
        ↓
Knowledge Mastery Update
        ↓
Teacher Feedback
        ↓
Further Personalization
```

---

## 🎓 Academic Project

This project was developed as a Capstone Project to explore the application of Artificial Intelligence, Machine Learning, Soft Computing, and Assistive Technology in adaptive education.

---

## 🔮 Future Scope

Possible future improvements include:

- Cloud-based database
- Larger real-world datasets
- More advanced deep-learning models
- Improved speech and NLP analysis
- Mobile application
- Real-time teacher analytics
- Integration with existing Learning Management Systems
- More extensive accessibility testing
- Personalized curriculum generation

---

## ⚠️ Disclaimer

NeuroLearn is an academic/prototype project designed to demonstrate adaptive learning concepts and assistive educational technologies.

It should not be considered a diagnostic or medical system.

---

## 👨‍💻 Team

**Capstone Project – NeuroLearn**

 team members 

- Hardik Patil 
- Sahil Parte 
- Anant Naringrekar 


---
