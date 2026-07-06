import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-6">
        <h1 className="text-6xl font-black text-blue-500">404</h1>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-white/50 text-sm">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
