

# AkshayRides 🚗

Discover thousands of verified vehicles with our smart car search platform. Use text or image search to instantly locate the perfect match, book test drives online, and enjoy a secure, hassle-free buying experience — all with **Akshay’s trusted car discovery system**.

🌐 [Live Demo](https://akshaycarverse.vercel.app)

---

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/)
- **UI**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Clerk
- **Storage & Realtime**: Supabase

---

## 📂 Project Structure

```bash
AkshayRides/
├── app/                 # App routing and pages
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and logic
├── prisma/              # Prisma schema and configuration
├── public/              # Static assets
├── styles/              # Global and Tailwind styles
├── middleware.js        # Middleware logic
├── next.config.mjs      # Next.js configuration
└── README.md            # Project documentation
````

---

## 🛠️ Environment Variables

To run the project locally, create a `.env` file in the root directory and add the following variables:

```env
# 🔐 Gemini API (Google Generative Model)
GEMINI_API_KEY=YOUR_GOOGLE_API_KEY

# 🗄️ PostgreSQL / Prisma
DATABASE_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME?pgbouncer=true"
DIRECT_URL="postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_DB_HOST:YOUR_DB_PORT/YOUR_DB_NAME"

# 🔐 Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

> ⚠️ **Important:**
>
> * **NEVER** commit your `.env` file to version control (GitHub, GitLab, etc.).
> * Always list `.env` in your `.gitignore` to keep your credentials safe.
> * You can share a public-safe `.env.example` file for contributors.

---

## 🧪 Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Features

* 🔍 Smart search using text or image input
* ✅ Verified vehicle listings
* 🚗 Book test drives online
* 🔐 Secure login/signup via Clerk
* 📊 Admin dashboard for managing listings and settings

---

## 📦 Deployment

Deployed on [Vercel](https://vercel.com/) — optimized for seamless Next.js integration.


---

## 👨‍💻 Author

Created with ❤️ by **Akshay Kalangi**
📫 [LinkedIn](https://www.linkedin.com) | [Email](mailto:akshaykalangi9@gmail.com)

```

---

Let me know if you'd like:
- Badge support (build, deploy, etc.)
- `README.md` translated or localized
- A CI/CD section for GitHub Actions or Vercel config

Ready to copy and paste into your project root! ✅
```
