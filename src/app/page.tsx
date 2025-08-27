import Link from "next/link";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-4 pb-20 sm:p-6">
      <Navigation />
      
      <main className="max-w-4xl mx-auto mt-8 sm:mt-12 flex flex-col gap-[32px] items-center text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Welcome to Borehammer</h2>
        <p className="text-lg mb-8">
          Your one-stop resource for all tabletop wargaming content, tools, and utilities to enhance your gaming experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mt-8">
          <div className="bg-black/[.05] dark:bg-white/[.06] p-6 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">Scoreboard</h3>
            <p className="mb-4">Track points for your Warhammer battles with our easy-to-use scoreboard tool.</p>
            <Link 
              href="/scoreboard" 
              className="rounded-md bg-purple-600 hover:bg-purple-700 transition-colors text-white px-4 py-2 font-medium inline-block"
            >
              Open Scoreboard
            </Link>
          </div>
          
          <div className="bg-black/[.05] dark:bg-white/[.06] p-6 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold mb-3">Coming Soon</h3>
            <p className="mb-4">More Warhammer tools and resources are on their way! Stay tuned for updates.</p>
            <button 
              disabled 
              className="rounded-md bg-gray-400 cursor-not-allowed text-white px-4 py-2 font-medium inline-block"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </main>
      
      <footer className="w-full text-center border-t border-black/[.08] dark:border-white/[.145] pt-4 mt-12">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Borehammer. This site is fan-made and not affiliated with any game publisher.
        </p>
      </footer>
    </div>
  );
}
