  import supplierDependency from "@/assets/supplier_dependency.png";
  export const metadata = {
  title: "We Think We Have Diversified Supply Chains. We Don't.",
  description:
    "Most companies think their supply chains are diversified—but hidden dependencies tell a different story. Learn why resilience strategies fail.",
  keywords: [
    "supply chain diversification",
    "supply chain risk",
    "global supply chain disruption",
    "supply chain strategy"
  ],
};

export default function SupplyChainBlogPage() {
  

return (
    <main className="min-h-screen bg-white text-zinc-900 font-serif">
<div className="mx-auto max-w-4xl px-6 py-20 md:px-8 lg:py-28">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-50 to-white">
          

            {/* <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            
              We Think We Have Diversified Supply Chains. We Don't.
            </h1> */}
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-zinc-900">
            Supply Chain Diversification Is Failing in 2026—Here’s What Companies Are Getting Wrong
            </h1>
            <div className="mt-6 max-w-2xl ml-2 md:ml-6 space-y-4 text-lg leading-8 text-zinc-700">
            <p className="mt-6 text-sm font-medium">
              Inspired by insights from Dustin Burke (TED)
            </p>
            

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              When we think of supply chain disruption, we think of major events.
            </p>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-700">
              The Iran conflict disrupting oil prices. The COVID-19 toilet paper shortage. The global chip shortage that made it nearly impossible to buy cars or electronics.
            </p>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-700">
              These are the disruptions that make headlines. But they're not the most common ones.
            </p>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-700">
              Supply chain disruptions happen far more often than we think. According to studies from the Business Continuity Institute, Institute for Supply Management, and Deloitte, 80% of companies experienced one to ten supply chain disruptions over the past year.
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
            {/* <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
             The Resilience Playbook Isn't Working
            </h2> */}
           
            <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
              Why Traditional Supply Chain Risk Strategies Fail
            </h2>
            <p className="text-lg leading-8 text-zinc-700">
              Companies use a range of strategies to mitigate disruption risk:
              Buffer stock (safety inventory): Keep extra units on hand in case of supply shock. This works, but not all of the time.
              Supplier diversification (multi-sourcing): Work with multiple suppliers in different locations so you're not dependent on a single source.
              On paper, these strategies look solid. In practice, they often create a false sense of security.

            </p>
          </section>

          {/* SECTION 1 */}
          <section className="space-y-5 pt-10">
            {/* <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
              The Toilet Paper Problem Nobody Talks About
            </h2> */}
            
            <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
              Supply Chain Disruptions: The Hidden Demand Shift Problem
            </h2>
            <p className="text-lg leading-8 text-zinc-700">
              When COVID hit, consumers panic-bought toilet paper—buying 3x to 5x their normal volume for home use.
              But here's the part most people forget: toilet paper for home use is different from toilet paper made for commercial or office use. Different packaging. Different suppliers. Different supply chains.
              When demand shifted overnight from commercial to consumer, suppliers couldn't pivot fast enough. The manufacturing lines, logistics networks, and distribution channels weren't designed to handle that kind of reallocation.
              The disruption wasn't a lack of toilet paper. It was a structural mismatch between supply chain design and actual demand.

            </p>
          </section>

          {/* SECTION 2 */}
          <section className="space-y-5 pt-10">
            {/* <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
             Why Car Manufacturers Competed With PlayStation 5
            </h2> */}
            <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
            Shared Supply Chain Dependencies Across Industries
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              Before COVID, car manufacturers expected demand to fall, so they reduced or canceled semiconductor chip orders.
              At the same time, demand for laptops, smartphones, and gaming consoles surged as people stayed home. Chip manufacturers shifted their limited production capacity to meet this growing demand.
              When car sales recovered faster than expected, automakers tried to reorder chips—but production was already fully allocated to consumer electronics.
              The situation worsened when a severe drought in Taiwan impacted TSMC, one of the world's largest chip producers. Car manufacturers couldn't secure the chips they needed, leading to production delays and vehicle shortages worldwide.
              The lesson: Global supply chains are more interconnected than they appear. What looks like separate industries (cars vs. gaming consoles) often share the same upstream dependencies.

            </p>

          </section>

          {/* SECTION 3 */}
        <section className="space-y-5 pt-10">
          {/* <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
            The Diversification Illusion
          </h2> */}

          <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
            The Supply Chain Diversification Illusion: Hidden Upstream Risks
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
           Many companies claim they are implementing supply chain diversification strategies. But in many cases, that diversification is only surface-level.
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            On paper, businesses may work with multiple suppliers across different regions. In reality, many of those “separate” suppliers depend on the same upstream manufacturers or raw material sources.
          </p>

          <div className="max-w-2xl ml-2 md:ml-6 space-y-2">
            <p className="text-sm font-semibold text-zinc-700">Example</p>
            <ul className="text-sm text-zinc-700 space-y-1">
              <li>• Supplier A in Vietnam</li>
              <li>• Supplier B in Thailand</li>
              <li>• Supplier C in India</li>
            </ul>
          </div>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            It looks diversified. But if all three rely on the same manufacturer in China for raw materials, the risk has not been reduced—it has only been hidden.
          </p>
          <div className="my-10 flex justify-center">
            <img
              src={supplierDependency}
              alt="Supplier dependency illustration"
              className="w-full max-w-2xl rounded-xl shadow-md"
            />
          </div>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            When that upstream supplier faces disruption—whether from environmental issues, tariffs, or geopolitical events—all three of your “diversified” suppliers can fail at the same time.
          </p>

       
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              43.6% of organizations experienced supply chain disruption due to third-party failures—even after implementing diversification strategies.
            </p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              Source: Business Continuity Institute
            </p>


          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            True diversification requires visibility beyond Tier-1 suppliers. Most companies stop at their direct suppliers and assume they are protected. They are not.
          </p>
        </section>

              <section className="space-y-5 pt-10">
          {/* <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-900">
            Forecasting Isn’t Foolproof
          </h2> */}
         
          <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
            Why Supply Chain Forecasting Fails in Uncertain Markets
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            Even with advanced analytics and AI, predicting consumer demand is far from perfect.
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            Buying patterns shift quickly due to trends, economic changes, or unexpected global events. AI and machine learning tools are only as good as the data they are trained on—and they struggle when sudden, unpredictable changes occur.
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            As a result, suppliers often do not see disruptions or demand spikes coming until it is too late.
          </p>

          
           <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              This creates a double risk
            </p>
            <ul className="text-sm text-zinc-700 space-y-1">
              <li>• Hidden structural dependencies (the diversification illusion)</li>
              <li>• Limited predictive visibility (forecasting gaps)</li>
            </ul>
     

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            When something unexpected happens, companies are hit from both sides.
          </p>
        </section>
        <section className="space-y-5 pt-10">
          <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
            What Actually Works
          </h2>

          <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
            How to Build a Resilient and Visible Supply Chain
          </h2>
         <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            The companies that manage disruptions well do not just diversify suppliers. They build visibility into upstream dependencies.
          </p>


          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              They ask
            </p>
            <ul className="text-sm text-zinc-700 space-y-1">
              <li>• Who supplies my suppliers?</li>
              <li>• What raw materials are shared across my network?</li>
              <li>• Which geographies or manufacturers represent single points of failure?</li>
            </ul>



          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              They monitor
            </p>
            <ul className="text-sm text-zinc-700 space-y-1">
              <li>• Macro signals (FX, commodities, freight rates)</li>
              <li>• Geopolitical shifts (sanctions, tariffs, trade restrictions)</li>
              <li>• Financial stress indicators (late payments, credit downgrades)</li>
            </ul>


        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            And they do this in real time, not quarterly.
          </p>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
            The goal is not to predict every disruption. It is to recognize warning signs early enough to act.
          </p>
        </section>
        {/* SECTION 8 */}
        <section className="space-y-5 pt-10">
          <h2 className="text-3xl md:text-4xlfont-semibold tracking-tight text-zinc-900">
            Conclusion
          </h2>
<p className="text-base leading-8 text-zinc-700">
            Supply chain resilience is not about having more suppliers. It is about having visibility into the dependencies that actually matter.
          </p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
           <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-700">
              When disruption hits, the companies that survive are not the ones with the most suppliers—they are the ones who saw it coming.
            </p>
          </div>
          
        </section>

       </article>
      </section>
      </div>
    </main>
  );
}