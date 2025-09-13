import AuthButtons from "../components/AuthButtons";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] hover:underline underline-offset-4"
          >
            Bargain Bites
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/how-it-works" className="hover:underline underline-offset-4">How it works</a>
            <AuthButtons />
          </nav>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Background oranges image */}
        <div 
          className="absolute right-0 -top-8 h-full w-1/3 bg-cover bg-left bg-no-repeat pointer-events-none"
          style={{
            backgroundImage: 'url(/background/oranges.png)',
            backgroundPosition: 'left center'
          }}
        />
        
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-14 sm:py-20 relative z-10">
       
          <h1 className="mb-5 text-4xl sm:text-6xl font-semibold tracking-tight">
            Weekly budget-friendly meals from local grocery flyers
          </h1>
          <p className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[10px] sm:text-xs tracking-[0.18em] uppercase">
            Save more. Eat better.
          </p>
          <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60 dark:text-black/60">
            Bargain Bites scrapes Canadian grocery flyers, generates 7-day meal plans, and
            builds one consolidated shopping list. Minimalist, fast, and focused on savings.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Link href="/plan" className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
              Start my plan
            </Link>
            <a href="/how-it-works" className="inline-flex items-center justify-center h-11 px-5 rounded-full border border-black/10 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:text-black dark:hover:text-white text-sm font-medium transition-colors duration-200 ease-in-out">
              Learn more
            </a>
          </div>
        </section>

        {/* Retailers carousel */}
        <section aria-labelledby="retailers" className="max-w-6xl mx-auto px-6 pb-10 relative z-10">
          <h2 id="retailers" className="sr-only">Works with</h2>
          <div className="text-xs uppercase tracking-[0.18em] text-black/60 mb-3">Works with</div>
          <div className="logo-marquee py-2">
            <div className="logo-track">
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Loblaws-Logo.png" alt="Loblaws" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/No_Frills_logo.svg.png" alt="No Frills" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Real_Canadian_Superstore_logo.svg.png" alt="Real Canadian Superstore" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Metro_Inc._logo.svg.png" alt="Metro" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Sobeys_logo.svg.png" alt="Sobeys" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/FreshCo_logo.svg.png" alt="FreshCo" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Food_Basics_Logo.png" alt="Food Basics" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Walmart_logo_(2008).svg.png" alt="Walmart" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Costco_Wholesale_logo_2010-10-26.svg.png" alt="Costco" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Farm_Boy_logo.svg.png" alt="Farm Boy" />

              {/* duplicate for seamless scroll */}
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Loblaws-Logo.png" alt="Loblaws" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/No_Frills_logo.svg.png" alt="No Frills" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Real_Canadian_Superstore_logo.svg.png" alt="Real Canadian Superstore" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Metro_Inc._logo.svg.png" alt="Metro" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Sobeys_logo.svg.png" alt="Sobeys" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/FreshCo_logo.svg.png" alt="FreshCo" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Food_Basics_Logo.png" alt="Food Basics" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Walmart_logo_(2008).svg.png" alt="Walmart" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Costco_Wholesale_logo_2010-10-26.svg.png" alt="Costco" />
              <img className="h-8 sm:h-10 w-auto object-contain opacity-80 hover:opacity-100 transition" src="/company-logos/Farm_Boy_logo.svg.png" alt="Farm Boy" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-10 sm:pb-16 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Scrapes local flyers</div>
              <p className="mt-1 text-sm text-black/60 dark:text-black/60">Pulls deals from Canadian retailers and normalizes products, prices, and dates.</p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Generates recipes</div>
              <p className="mt-1 text-sm text-black/60 dark:text-black/60">Creates a 7-day plan tailored to your budget, household size, and preferences.</p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Optimizes your trip</div>
              <p className="mt-1 text-sm text-black/60 dark:text-black/60">Minimizes cost with store routing and carry-capacity checks if you’re on foot.</p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Simple chat adjustments</div>
              <p className="mt-1 text-sm text-black/60 dark:text-black/60">Ask to swap meals, change budget, or avoid ingredients—your plan updates live.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-black/60 dark:text-black/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Bargain Bites</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline underline-offset-4">Privacy</a>
            <a href="#" className="hover:underline underline-offset-4">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

