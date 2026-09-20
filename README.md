# Aptiflux Platform

An online aptitude mock test platform designed to help students prepare for technical and aptitude interviews. 

Built with **Next.js 15 (App Router)**, **Tailwind CSS**, and **Supabase**.

## Features

- **Authentication:** Secure signup, login, and session management using JWT and Supabase.
- **Adaptive Testing:** Practice tests with multiple-choice questions across different topics (Number System, Geometry, Coding, etc.).
- **Progress Tracking:** Interactive leaderboards and history tracking.
- **Responsive UI:** Modern, glassmorphic design utilizing Tailwind CSS and CSS variables.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database / Auth:** [Supabase](https://supabase.com/)
- **AI Integration:** Google GenAI / Groq SDK for content generation (Admin tools).

## Environment Variables

To run this project locally or deploy to a host like Vercel, you must set the following environment variables. Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
JWT_SECRET=your_jwt_secret_key
```

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/new).

1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add the required Environment Variables in the Vercel project settings.
4. Deploy!

*(Note: Ensure your `.env.local` is **not** committed to version control. It is ignored by `.gitignore` by default).*

## License

This project is licensed under the terms defined in the `LICENSE` file located in the root of the repository.
