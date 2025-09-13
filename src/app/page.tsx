export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-black/10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em]">Bargain Bites</div>
          <nav className="flex items-center gap-6 text-sm">
            <a href="#how-it-works" className="hover:underline underline-offset-4">How it works</a>
            <a href="#get-started" className="rounded-full border border-black/10 px-4 py-1.5 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a]">Get started</a>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-6 py-14 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[10px] sm:text-xs tracking-[0.18em] uppercase">
            Save more. Eat better.
          </p>
          <h1 className="mt-5 text-4xl sm:text-6xl font-semibold tracking-tight">
            Weekly budget-friendly meals from local grocery flyers
          </h1>
          <p className="mt-4 max-w-[60ch] text-sm sm:text-base text-black/60 dark:text-white/60">
            Bargain Bites scrapes Canadian grocery flyers, generates 7-day meal plans, and
            builds one consolidated shopping list. Minimalist, fast, and focused on savings.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <a href="#get-started" className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
              Generate my plan
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center h-11 px-5 rounded-full border border-black/10 hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] text-sm font-medium">
              Learn more
            </a>
          </div>
        </section>

        {/* Retailers carousel */}
        <section aria-labelledby="retailers" className="max-w-6xl mx-auto px-6 pb-10">
          <h2 id="retailers" className="sr-only">Works with</h2>
          <div className="text-xs uppercase tracking-[0.18em] text-black/60 mb-3">Works with</div>
          <div className="logo-marquee logo-fade py-2">
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
        <section id="how-it-works" className="max-w-5xl mx-auto px-6 pb-10 sm:pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Scrapes local flyers</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">Pulls deals from Canadian retailers and normalizes products, prices, and dates.</p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Generates recipes</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">Creates a 7-day plan tailored to your budget, household size, and preferences.</p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Optimizes your trip</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">Minimizes cost with store routing and carry-capacity checks if you’re on foot.</p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Simple chat adjustments</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">Ask to swap meals, change budget, or avoid ingredients—your plan updates live.</p>
            </div>
          </div>
        </section>

        {/* Starter form */}
        <section id="get-started" className="max-w-5xl mx-auto px-6 pb-20">
          <div className="rounded-xl border border-black/10 p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Tell us about your week</h2>
            <p className="mt-1 text-sm text-black/60 dark:text-white/60">These details help us build a plan that fits your budget and lifestyle.</p>

            <form action="#" method="get" className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="postal" className="text-sm font-medium">Postal code</label>
                <input id="postal" name="postal" placeholder="e.g., M5V 2T6" className="h-10 rounded-md border border-black/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-black/20" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="household" className="text-sm font-medium">Household size</label>
                <select id="household" name="household" className="h-10 rounded-md border border-black/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-black/20">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8+</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="experience" className="text-sm font-medium">Cooking experience</label>
                <select id="experience" name="experience" className="h-10 rounded-md border border-black/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-black/20">
                  <option>Beginner</option>
                  <option>Comfortable</option>
                  <option>Pro</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pantry" className="text-sm font-medium">Pantry staples on hand</label>
                <select id="pantry" name="pantry" className="h-10 rounded-md border border-black/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-black/20">
                  <option>None</option>
                  <option>Some</option>
                  <option>Well-stocked</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="budget" className="text-sm font-medium">Weekly budget (CAD)</label>
                <input id="budget" name="budget" type="number" min="0" placeholder="e.g., 60" className="h-10 rounded-md border border-black/15 bg-transparent px-3 outline-none focus:ring-2 focus:ring-black/20" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium">Equipment at home</span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                  <label className="flex items-center gap-2"><input type="checkbox" name="equip" value="stovetop" className="accent-current"/> Stovetop</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="equip" value="oven" className="accent-current"/> Oven</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="equip" value="microwave" className="accent-current"/> Microwave</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="equip" value="blender" className="accent-current"/> Blender</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="equip" value="airfryer" className="accent-current"/> Air fryer</label>
                  <label className="flex items-center gap-2"><input type="checkbox" name="equip" value="bbq" className="accent-current"/> BBQ</label>
                </div>
              </div>

              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90">
                  Continue
                </button>
                <span className="ml-3 text-xs text-black/60 dark:text-white/60">No account needed to start.</span>
              </div>
            </form>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-black/60 dark:text-white/60 flex items-center justify-between">
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

