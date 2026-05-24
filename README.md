# 🎓 Teach.AI 

> **Next-Generation AI-Powered E-Learning & Interactive Study Platform**

Learnify is a state-of-the-art, feature-rich learning management system (LMS) and personalized study assistant built using Next.js 15, React 19, and MongoDB. It bridges the gap between students and teachers by offering specialized dashboards, interactive classroom environments, and cutting-edge artificial intelligence tools—including a **local, in-browser AI tutor** and smart concept visualization.

---

## 🌟 Key Features

### 🤖 1. AI-Tutor & Study Assistant
* **Local In-Browser AI:** Integrated with `@mlc-ai/web-llm` to run lightweight LLMs directly inside the user's browser, ensuring absolute privacy, zero latency, and offline availability.
* **Hybrid Cloud Fallback:** Seamlessly connects with OpenRouter and Google Gemini APIs for advanced complex query solving.
* **Smart Article & Material Summarization:** Extract key topics, concepts, and generate instant study notes.

### 🗺️ 2. Dynamic Mind Mapping & Concept Flows
* **Interactive Visualizations:** Built with `@xyflow/react` (React Flow) to generate dynamic mind maps, helping students visualize complex connection structures and learning paths.
* **Custom Nodes:** Customize nodes with rich text, markdown, or direct visual diagrams.

### 👥 3. Advanced Multi-Role Portals
* **Student Dashboard:**
  * **Interactive Classrooms:** Participate in digital classrooms, complete assignments, and track progression.
  * **Smart Quizzes:** Self-assess with automated, interactive quizzes featuring immediate evaluation.
  * **Personal Library:** Store, bookmark, and organize learning materials.
  * **Practice Sandbox:** Test skills on custom tailored exercises.
* **Teacher Dashboard:**
  * **Classroom Management:** Create classrooms, assign study guides, and review student progress.
  * **Automated Material Generator:** Create comprehensive study materials, notes, and quizzes using AI templates.

### 🧮 4. Rich Content Rendering
* **LaTeX Support:** Full math and scientific formula support powered by **KaTeX** (`react-katex`).
* **Rich Markdown:** Seamless rendering of dynamic AI-generated text using `react-markdown`.

### 🔒 5. Premium Authentication & Security
* **NextAuth.js (v5 Beta):** Role-based access control (RBAC) separating student and teacher environments seamlessly.
* **Database Security:** Direct Mongoose integration for secure user management and storage.

---

## 🛠️ Tech Stack

* **Core Framework:** Next.js 15 (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS v4, Custom CSS Modules, Lucide React (Icons)
* **Database & ORM:** MongoDB, Mongoose
* **State Management:** Zustand
* **AI/LLM Engine:** `@mlc-ai/web-llm` (Local WebGPU Web-LLM), OpenRouter API, Gemini API
* **Diagramming:** `@xyflow/react` (React Flow)
* **Formatting & Math:** KaTeX, Cheerio, jsPDF (PDF generation & export)

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed:
* [Node.js](https://nodejs.org/) (v18.x or later recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas Connection URI)

### ⚙️ Environment Configuration
Create an `env.local` (already set up in your local environment) in the root directory and configure the following variables:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_atlas_connection_uri
JWT_SECRET=your_jwt_secret_key
AUTH_SECRET=your_auth_secret_key
```

### 📦 Installation
Install the project dependencies:
```bash
npm install
```

### 💻 Running Locally
To launch the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 🏗️ Production Build
To create an optimized production build:
```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
c:/Teach.AI
├── public/                 # Static assets and images
├── src/
│   ├── actions/            # Server Actions
│   ├── app/                # Next.js App Router (Layouts & Pages)
│   │   ├── (auth)/         # Login, Register, & Auth views
│   │   ├── api/            # API endpoints (Auth, AI, Database operations)
│   │   ├── student/        # Student dashboard, tutor, practice, quizzes
│   │   └── teacher/        # Teacher dashboard, classrooms, generators
│   ├── components/         # Reusable UI Components
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Database config & utility helpers
│   ├── models/             # Mongoose schemas (User, Classroom, Quiz, etc.)
│   ├── store/              # Zustand global state stores
│   └── types/              # TypeScript typings
└── package.json            # Scripts & dependencies
```

---

## 🤝 Contribution & License
This project is developed for the Innerve Hackathon. All rights reserved.
