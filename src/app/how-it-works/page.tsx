import AuthButtons from "@/components/AuthButtons";
import Link from "next/link";

export default function HowItWorks() {
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
            <Link href="/" className="hover:underline underline-offset-4">
              Home
            </Link>
            <AuthButtons />
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Page hero */}
        <section className="max-w-5xl mx-auto px-6 py-14 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1 text-[10px] sm:text-xs tracking-[0.18em] uppercase">
            How it works
          </p>
          <h1 className="mt-5 text-4xl sm:text-6xl font-semibold tracking-tight">
            Plan a week of budget-friendly meals from local flyers
          </h1>
          <p className="mt-4 max-w-[70ch] text-sm sm:text-base text-black/60 dark:text-white/60">
            Bargain Bites scans Canadian grocery flyers near you, picks the
            best-value items, and turns them into a 7-day meal plan with a
            single, optimized shopping list.
          </p>
        </section>

        {/* Steps */}
        <section className="max-w-5xl mx-auto px-6 pb-10 sm:pb-16">
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 list-decimal list-inside">
            <li className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Choose your preferences</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                Set budget, household size, dietary preferences, and any
                ingredients to avoid.
              </p>
            </li>
            <li className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">We scrape local flyers</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                We pull deals from major Canadian retailers and normalize
                products, prices, and dates.
              </p>
            </li>
            <li className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Get a 7-day meal plan</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                We generate recipes around those deals to maximize savings while
                keeping prep simple.
              </p>
            </li>
            <li className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Shop with one list</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                Receive a consolidated shopping list and suggested store route to
                minimize total cost.
              </p>
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="max-w-5xl mx-auto px-6 pb-10 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-semibold">FAQ</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">What regions are supported?</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                We focus on Canadian flyers first. Coverage improves as we add
                more sources and localities.
              </p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Can I swap meals or ingredients?</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                Yes. Use simple chat adjustments to swap meals, change budget,
                or avoid ingredients—your plan updates live.
              </p>
            </div>
            <div className="rounded-lg border border-black/10 p-4">
              <div className="font-medium">Do I need an account?</div>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                You can browse publicly, but signing in saves preferences,
                plans, and lists across devices.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="rounded-xl border border-black/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">
                Ready to try it?
              </h3>
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                Generate your first plan in under a minute.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90"
            >
              Generate my plan
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-black/60 dark:text-white/60 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Bargain Bites</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline underline-offset-4">
              Privacy
            </a>
            <a href="#" className="hover:underline underline-offset-4">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}