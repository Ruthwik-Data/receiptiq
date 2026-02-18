# ReceiptIQ — Expense Intelligence 💼

ReceiptIQ is a premium finance dashboard and AI-powered expense extraction tool. Built for speed and precision, it transforms messy receipt images and text into structured, actionable financial data.

**[Live Demo](https://receiptiq-topaz.vercel.app)**

## 🚀 Key Features

- **AI-Powered Extraction**: Uses GPT-4o Vision to accurately parse merchant, dates, taxes, and line items.
- **Instant Financial Insights**: Real-time computation of tax rates, net spend, and category classification.
- **Premium Dashboard**: A sleek, indigo-themed interface with dynamic spending visualizations using Recharts.
- **Budget Intelligence**: Intelligent category tagging with persistence for long-term spending tracking.
- **Export Ready**: Instant JSON and CSV downloads for integration with accounting software.
- **Hybrid Input**: Support for both camera capture/file uploads and quick text-based pasting.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (Turbopack)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **AI**: [OpenAI GPT-4o](https://openai.com/)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)

## 🏁 Getting Started

### 1. Prerequisites
- Node.js 20+
- OpenAI API Key
- Supabase Project URL & Anon Key

### 2. Installation
```bash
git clone <repository-url>
cd receiptiq
npm install
```

### 3. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📝 Demo Mode
Includes a built-in sample receipt feature for instant demonstration without requiring an immediate OpenAI key or image upload.

---
*Built with ❤️ for financial clarity.*
