import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 font-sans text-white p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          SafeCampus <span className="text-purple-500">Admin</span>
        </h1>
        <p className="text-zinc-400 text-lg">
          Welcome to the SafeCampus Admin portal. Access your account or create a new one below.
        </p>
        
        <div className="flex flex-col gap-4">
          <Link 
            href="/auth/login"
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 transition-colors rounded-xl font-bold text-lg text-center"
          >
            Login to Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
