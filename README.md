# 🤖 Smart WhatsApp Bot (Node.js + Firebase + Gemini AI)

This project is a virtual assistant for WhatsApp that combines **state logic (Menus)** with **Generative Artificial Intelligence**. It uses **Firebase** for data persistence (long-term memory) and **Google Gemini** for natural language processing.

The goal is to create a hybrid customer service experience: precise when necessary (menus) and natural for answering complex questions (AI).

## 🚀 Features

- **📲 Connection via QR Code:** Uses the `whatsapp-web.js` library to simulate a web browser client.
- **🧠 Integrated AI:** Answers complex queries using the **Google Gemini 1.5 Flash** model (fast and cost-effective).
- **💾 Cloud Memory:** Saves user state and conversation history in **Firebase Firestore**.
- **🗣️ Conversational Context:** The AI "remembers" the last few messages exchanged to maintain a fluid dialogue.
- **📊 Audit Logs:** Records all sent and received messages for future analysis.
- **🔀 Hybrid Flow:** Allows switching between AI-driven assistance and fixed option menus.

## 🛠️ Tech Stack

- **[Node.js](https://nodejs.org/)**: JavaScript runtime environment.
- **[whatsapp-web.js](https://wwebjs.dev/)**: Non-official WhatsApp client.
- **[Firebase Firestore](https://firebase.google.com/)**: Real-time NoSQL database.
- **[Google Generative AI SDK](https://ai.google.dev/)**: Integration with the Gemini model.
- **qrcode-terminal**: Generates the login QR Code in the terminal.

---

## ⚙️ Prerequisites

Before you begin, you need to have installed:
* [Node.js](https://nodejs.org/en/) (Version 18 or higher)
* A [Google Firebase](https://console.firebase.google.com/) account
* An API Key from [Google AI Studio](https://aistudio.google.com/)

---

## 📝 Installation and Setup

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/your-project-name.git](https://github.com/your-username/your-project-name.git)
cd your-project-name
