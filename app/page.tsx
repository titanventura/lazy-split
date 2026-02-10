import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SplitLink</h1>
        <p className="text-gray-600 mb-8">Split bills instantly. No app needed.</p>
        <Link
          href="/create"
          className="inline-block bg-green-600 text-white font-semibold px-8 py-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Create a Split
        </Link>
      </div>
    </main>
  );
}
