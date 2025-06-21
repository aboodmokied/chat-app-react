# 💬 React Chat App (Frontend)

A real-time chat application frontend built with **React**, **Socket.IO**, and **Vite**. It connects to a NestJS backend and enables authenticated real-time messaging between users.

---

## 🚀 Getting Started

### 1. Clone the repo

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```
VITE_API_URL=https://chat-api-nestjs.onrender.com
```

> You can change the URL to your local or production backend.

### 4. Run the app

```bash
npm run dev
```

The app should now be running at [http://localhost:8000](http://localhost:8000)

---

## 🔐 Authentication

* Register or login using the REST API.
* JWT is stored in localStorage and used for API and socket authentication.


---

## 📦 Features

* User registration and login
* Real-time chat via Socket.IO
* Private chat rooms
* Message seen status
* Chat list and message history

---

## 🧪 Demo

https://chat-app-react-ebon.vercel.app

> 💡 **Hint:** You can sign up with any fake email/password for testing.

---

## 🛠 Tech Stack

* **React** with Vite
* **Socket.IO Client**
* **Axios** for HTTP requests
* **Tailwind CSS** for UI styling

---

