# LexDoc AI Frontend

This is the frontend component of **LexDoc AI**, an intelligent multi-modal college document management system.

## 🚀 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS targeted at a premium "Liquid Glassmorphism" aesthetic
- **Animations**: GSAP (GreenSock Animation Platform)
- **Scrolling**: Lenis Smooth Scroll
- **Authentication & Database**: Supabase (PostgreSQL, Row Level Security)
- **Icons**: Lucide React

## 🛠️ Features

- **Hybrid Authentication**: Secure Google OAuth + Email domain restriction + Password verification pattern.
- **Liquid Glass UI**: Highly responsive cards, dynamic gradients, blur dropshadows, and magnetic hover effects.
- **Micro-Animations**: Custom cursor implementation, page transition animations, and scroll-triggered reveals using GSAP.
- **Access Control Views**: Real-time rendering of documents respecting strict Row Level Security (RLS) rules fetched from the Supabase backend.

## 🔧 Installation & Setup

1. **Clone the repository** (or navigate to the frontend directory)
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Environment Setup**:
   Create a `.env` file referencing your Supabase project keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Deployment
To build for production, run:
```bash
npm run build
```
This generates the optimized bundle in the `dist` directory.
