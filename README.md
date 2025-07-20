

# FaceTracker AI 🎥🧠

A **frontend-only** Next.js application that performs **real-time face detection** using AI models and records videos with facial landmark overlays. All processing happens in-browser — ensuring full **privacy** and **lightning-fast** performance.

---

## 🚀 Live Demo
🌐 [Open App on Netlify](https://facetrackerai.netlify.app/)

---

## 📹 Demo Video
🎬 [Watch Demo on YouTube](https://youtu.be/tWF-g_qIvkw)

---

## 📌 Features

- 🔍 **Real-Time Detection** – Face detection with landmark tracking using `face-api.js`.
- 🎥 **Video Recording** – Record and download videos with AI-powered overlays.
- ⚙️ **In-Browser Processing** – No data sent to servers; runs locally.
- 💻 **Responsive UI** – TailwindCSS-based clean, adaptive layout.
- ⚡ **High Performance** – Up to 30 FPS with lightweight model usage.

---

## 🧠 Tech Stack

- ⚛️ [Next.js](https://nextjs.org/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- 🤖 [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- 📼 [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- 🧩 HTML5 Video + Canvas APIs

---

## 🗂️ Folder Structure

```

/app
├── components/
│   ├── FaceRecorder.js      # Video + detection + recording logic
│   ├── Features.js          # Feature cards & UI
│   ├── Navbar.js            # Sticky navigation bar
│   ├── Footer.js            # Footer section
├── page.js                  # Main home page layout

/public
└── models/
├── tiny\_face\_detector/  # Face detector model
└── face\_landmark\_68/    # Landmark detection model

````

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/saranshjagwani/FaceTrackerApp.git
cd FaceTrackerApp
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Models

Download required models from:
📦 [face-api.js-models](https://github.com/justadudewhohacks/face-api.js-models)

Then place them like:

```
public/models/tiny_face_detector/model.json
public/models/face_landmark_68/model.json
```

### 4. Run Locally

```bash
npm run dev
```

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 🌍 Deployment

* Deployed on [Netlify](https://netlify.com/) as a static frontend app.
* No backend required.
* Ensure `/public/models/` is included in version control or re-added post-deploy.

---

## ✨ Contact & Credits

Made by [**Saransh Jagwani**](https://github.com/saranshjagwani)
Give a ⭐ if you liked the project!


