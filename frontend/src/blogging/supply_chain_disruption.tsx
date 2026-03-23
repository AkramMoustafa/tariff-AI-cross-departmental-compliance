export default function SupplyChainBlogPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-20 md:px-8 lg:py-28">

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
            Blog
          </p>

          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Why Global Supply Chain Disruption Is Becoming the New Normal
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Global supply chains once operated as invisible systems that quietly moved
            goods across borders, through factories, and into stores. Today, that
            system is under pressure. From geopolitical tensions to shifting trade
            policies and economic uncertainty, businesses are facing a new reality:
            disruption is no longer occasional. It is becoming part of everyday
            operations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {["Supply Chain", "Business Strategy", "Global Trade"].map(tag => (
              <span
                key={tag}
                className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-100"
              >
                {tag}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ARTICLE */}
      <section className="px-6 py-16 md:px-8">
        <article className="max-w-4xl mx-auto space-y-20">

          {/* INTRO */}
          <section className="space-y-4">
            <p className="text-lg leading-8 text-zinc-800">
              For years, many companies built their supply chains around efficiency.
              The goal was simple: source materials at the lowest possible cost,
              manufacture where expenses were lowest, and move products quickly through
              a tightly coordinated global network. That model worked well when the
              world felt relatively stable. But stability can no longer be assumed.
            </p>
          </section>

          {/* SECTION 1 */}
          <section className="space-y-5 border-t border-zinc-200 pt-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              Businesses are no longer planning for stability
            </h2>

            <p className="text-lg leading-8 text-zinc-800">
              One of the clearest takeaways from the discussion around supply chain
              disruption is that companies are changing how they think.
            </p>

            <p className="text-zinc-600 leading-7">
              Instead of treating disruptions as rare emergencies, businesses are starting
              to view them as recurring risks that must be built into day-to-day planning.
            </p>

            <p className="text-zinc-600 leading-7">
              That shift matters. It changes supply chain management from a logistical
              function into a strategic one. Companies are not just asking how to move
              products faster. They are asking how to keep operating when ports are
              delayed, regulations change, or global tensions interrupt the flow of goods.
            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-5 border-t border-zinc-200 pt-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              What is driving the disruption?
            </h2>

            <p className="text-lg leading-8 text-zinc-800">
              The pressure on supply chains is coming from several directions at once.
            </p>

            <p className="text-zinc-600 leading-7">
              Geopolitical tensions are a major factor, especially when conflict or
              strained international relationships affect trade routes, sourcing, or
              cross-border cooperation.
            </p>

            <p className="text-zinc-600 leading-7">
              Tariffs and policy changes add another layer of uncertainty, making it
              harder for businesses to predict costs and maintain stable supplier
              relationships.
            </p>

            <p className="text-zinc-600 leading-7">
              Economic instability also plays a central role. Inflation, fluctuating
              demand, and slowing growth can reshape how companies purchase, produce,
              and distribute goods.
            </p>
          </section>

          {/* SECTION 3 */}
          <section className="space-y-5 border-t border-zinc-200 pt-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              Why this matters beyond the boardroom
            </h2>

            <p className="text-lg leading-8 text-zinc-800">
              Supply chain disruption may sound like a technical business issue, but its
              effects are highly visible in everyday life.
            </p>

            <p className="text-zinc-600 leading-7">
              Consumers feel it first through higher prices, delayed deliveries,
              reduced availability, and less consistency in the products they rely on.
            </p>

            <p className="text-zinc-600 leading-7">
              For businesses, the consequences can be even more severe. Delays slow
              production. Rising costs reduce margins. Uncertainty makes it harder to
              forecast demand and manage inventory.
            </p>
          </section>

          {/* SECTION 4 */}
          <section className="space-y-5 border-t border-zinc-200 pt-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              The strategic shift from efficiency to resilience
            </h2>

            <p className="text-lg leading-8 text-zinc-800">
              Perhaps the most important development is how companies are responding.
            </p>

            <p className="text-zinc-600 leading-7">
              Rather than focusing exclusively on efficiency, many are beginning to
              prioritize resilience. That means diversifying suppliers, reducing
              dependence on a single region, and building backup plans.
            </p>

            <p className="text-zinc-600 leading-7">
              A supply chain that is fast and low-cost can still be fragile. A resilient
              system may cost more short term, but is far more sustainable long term.
            </p>
          </section>

          {/* SECTION 5 */}
          <section className="space-y-5 border-t border-zinc-200 pt-10">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              A new baseline for global business
            </h2>

            <p className="text-lg leading-8 text-zinc-800">
              Supply chain disruption is not a temporary phase. It is becoming a baseline
              condition of operating in a global economy.
            </p>

            <p className="text-zinc-600 leading-7">
              Companies that adapt will be better positioned to navigate uncertainty.
              Those that plan for perfect stability will continue to face risk.
            </p>

            <p className="text-zinc-600 leading-7">
              In the years ahead, the strongest businesses will not be the leanest —
              they will be the most resilient.
            </p>
          </section>

        </article>
      </section>
    </main>
  );
}