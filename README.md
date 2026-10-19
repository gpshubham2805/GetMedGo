# 💊 GetMedGo — AI-Powered Prescription Assistant

**GetMedGo** is a mobile application designed to help users understand prescription information in simpler language. It combines prescription scanning, medicine information, and an AI-powered assistant in one place.

🌐 **Website:** https://getmedgo-official.netlify.app  
💻 **GitHub Repository:** https://github.com/gpshubham2805/GetMedGo

---

## ✨ Features

- 📷 **Prescription Analysis** — Scan or upload a prescription image for AI-assisted information extraction.
- 💊 **Medicine Information** — View medicine details and explanations in simpler language.
- 🔎 **Medicine Search** — Search for medicines and explore available information.
- 🤖 **AI Chat Assistant** — Ask general medicine-related questions.
- 🇮🇳 **Language Support** — Designed to provide responses in English, Hindi, or Hinglish where supported.
- 📋 **Scan History** — Review previously analyzed prescriptions.
- 📱 **Mobile Experience** — Built with React Native and Expo.
- 🌐 **Project Website** — Access the project's website and app download page.

## 🛠️ Tech Stack

- **Mobile App:** React Native, Expo, TypeScript
- **Navigation:** Expo Router
- **Backend:** Node.js, Express.js
- **AI Integration:** Gemini API and OpenAI API integration
- **Website:** Project website hosted on Netlify
- **Version Control:** Git and GitHub
- **Build and Updates:** Expo Application Services (EAS)

## 🏗️ Project Structure

```text
GetMedGo/
├── app/          # App screens and navigation
├── assets/       # Images, icons, and other assets
├── backend/      # Backend API and server logic
├── components/   # Reusable UI components
├── constants/    # Shared constants and theme
├── hooks/        # Custom React hooks
├── types/        # TypeScript type definitions
├── utils/        # Helper functions
├── website/      # Website source files
├── app.json      # Expo application configuration
├── eas.json      # EAS build configuration
├── package.json  # Dependencies and scripts
└── tsconfig.json # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) or an Android development environment, depending on the features you want to test.

### 1. Clone the repository

```bash
git clone https://github.com/gpshubham2805/GetMedGo.git
cd GetMedGo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Configure the backend and any required API credentials using environment variables. Check the backend configuration and project documentation for the exact variable names.

**Important:** Never commit API keys, passwords, or private `.env` files to GitHub.

### 4. Run the application

Use the scripts defined in `package.json`. For a typical Expo development setup, you can start with:

```bash
npx expo start
```

Follow the Expo terminal instructions to open the app on a supported device or emulator.

### 5. Run the backend

Follow the backend's setup instructions and configure the required environment variables before starting the server. The mobile app must be configured to use a reachable backend URL when testing on another device.

## 🧠 What I Learned

This project provides practical experience with:

- Building a mobile application using React Native and Expo.
- Structuring reusable components and TypeScript types.
- Connecting a mobile frontend to a backend API.
- Integrating AI APIs into an application workflow.
- Handling prescription image analysis and presenting extracted information.
- Managing project versions with Git and GitHub.
- Building and distributing Android application packages using EAS.
- Deploying a project website.

## 🔒 Medical Disclaimer

GetMedGo is an informational project and is not a substitute for professional medical advice, diagnosis, or treatment. AI-generated prescription analysis may contain errors or omit important information. Always verify prescription details with a qualified healthcare professional or pharmacist. Do not start, stop, or change medication based solely on AI-generated information.

## 👨‍💻 Developer

**Shubham Shukla**

- GitHub: [@gpshubham2805](https://github.com/gpshubham2805)
- Website: https://getmedgo-official.netlify.app
- Instagram: [@gpshubham_shukla](https://www.instagram.com/gpshubham_shukla)
- LinkedIn: [Shubham Shukla](https://www.linkedin.com/in/shubham-shukla-65714231b)
- Email: gpshubham69@gmail.com

## 📄 License

See the [LICENSE](LICENSE) file for the project's licensing terms.

---

*Built as a learning and portfolio project to explore mobile development, backend integration, and AI-assisted application workflows.*
