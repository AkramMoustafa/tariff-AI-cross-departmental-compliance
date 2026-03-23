"use client";

import React, { useMemo } from "react";
import Map from "react-map-gl";
import DeckGL from "@deck.gl/react";
import { ScatterplotLayer, ArcLayer } from "@deck.gl/layers";

const MAPBOX_TOKEN = "pk.eyJ1IjoibW91c3QxYW0iLCJhIjoiY21teGo1NWZ3MzNheDJvcHM0eTB4OXNqayJ9.cuH343hAl-_mIvDhKfUVlA";


const suppliers = [
  { id: 1, name: "USA", coordinates: [-95, 37], risk: 0.2 },
  { id: 2, name: "Germany", coordinates: [10, 51], risk: 0.6 },
  { id: 3, name: "China", coordinates: [105, 35], risk: 0.8 },
  { id: 4, name: "India", coordinates: [78, 22], risk: 0.5 },
];

const routes = [
  { from: [-95, 37], to: [10, 51] },
  { from: [105, 35], to: [-95, 37] },
  { from: [78, 22], to: [10, 51] },
];

const INITIAL_VIEW_STATE = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 30,
  bearing: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

export default function SexyAILandingPage() {
  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: "suppliers",
        data: suppliers,
        getPosition: (d: any) => d.coordinates,
        getFillColor: (d: any) => {
          const r = Math.floor(255 * d.risk);
          const g = Math.floor(255 * (1 - d.risk));
          return [r, g, 80];
        },
        getRadius: 200000,
        pickable: true,
      }),

      new ArcLayer({
        id: "routes",
        data: routes,
        getSourcePosition: (d: any) => d.from,
        getTargetPosition: (d: any) => d.to,
        getSourceColor: [0, 200, 255],
        getTargetColor: [255, 100, 100],
        getWidth: 2,
      }),
    ];
  }, []);

  return (
    <main className="bg-black text-white min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">
        Supplier Risk Intelligence Map
      </h1>

      <div className="w-full h-[600px] rounded-2xl overflow-hidden shadow-lg">
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE as any}
          controller={true}
          layers={layers}
        >
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v11"
          />
        </DeckGL>
      </div>
    </main>
  );
}

// export default function SexyAILandingPage() {
//   const notifications = [
//     {
//       title: "Finish strong?",
//       body: "You’ve been focused for 2h 14m. Want to close this task now?",
//       tag: "Focus",
//     },
//     {
//       title: "Reset window",
//       body: "Energy looks low. Take a 20-minute reset and come back sharper.",
//       tag: "Recovery",
//     },
//     {
//       title: "Gym check-in",
//       body: "You said fitness matters this week. Want to log today’s workout?",
//       tag: "Growth",
//     },
//   ];

//   const features = [
//     {
//       title: "Understands your rhythm",
//       desc: "Learns when you’re locked in, fading out, or drifting into distraction.",
//     },
//     {
//       title: "Guides the next move",
//       desc: "Push, pause, reset, recover—right when the decision actually matters.",
//     },
//     {
//       title: "Works across your day",
//       desc: "Desktop, phone, routines, habits, goals—one intelligence layer over everything.",
//     },
//   ];

//   const comparisons = [
//     ["Tracks activity", "Interprets behavior"],
//     ["Shows dashboards", "Suggests next actions"],
//     ["Waits for input", "Proactively nudges"],
//     ["Generic advice", "Personalized guidance"],
//   ];

//   return (
//     <div className="min-h-screen bg-neutral-950 text-white selection:bg-white/20 selection:text-white">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute left-1/2 top-[-12rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
//         <div className="absolute right-[-8rem] top-[20rem] h-[24rem] w-[24rem] rounded-full bg-cyan-400/15 blur-3xl" />
//         <div className="absolute bottom-[-10rem] left-[-8rem] h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-3xl" />
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.02),transparent_35%,rgba(255,255,255,0.02))]" />
//       </div>

//       <div className="relative mx-auto max-w-7xl px-6 py-6 sm:px-8 lg:px-10">
//         <header className="sticky top-0 z-50 mx-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
//           <div className="flex items-center gap-3">
//             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-neutral-950 shadow-2xl shadow-white/20">
//               <span className="text-lg font-black">A</span>
//             </div>
//             <div>
//               <div className="text-sm font-semibold tracking-[0.2em] text-white/90 uppercase">Aether</div>
//               <div className="text-xs text-white/45">Your decision engine</div>
//             </div>
//           </div>

//           <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
//             <a href="#features" className="transition hover:text-white">Features</a>
//             <a href="#how" className="transition hover:text-white">How it works</a>
//             <a href="#privacy" className="transition hover:text-white">Privacy</a>
//           </nav>

//           <div className="flex items-center gap-3">
//             <button className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/25 hover:bg-white/5 md:inline-flex">
//               See demo
//             </button>
//             <button className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition hover:scale-[1.02]">
//               Join waitlist
//             </button>
//           </div>
//         </header>

//         <main>
//           <section className="grid min-h-[92vh] items-center gap-16 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
//             <div>
//               <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur-xl">
//                 <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
//                 AI guidance for work, health, and momentum
//               </div>

//               <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] text-white sm:text-6xl lg:text-8xl">
//                 Stop guessing <br />
//                 <span className="bg-gradient-to-r from-white via-white to-white/55 bg-clip-text text-transparent">
//                   what to do next.
//                 </span>
//               </h1>

//               <p className="mt-7 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
//                 A beautiful AI layer that understands your behavior across work and life—then tells you when to push, pause, recover, or refocus.
//               </p>

//               <div className="mt-10 flex flex-col gap-4 sm:flex-row">
//                 <button className="rounded-full bg-white px-7 py-4 text-base font-semibold text-neutral-950 shadow-2xl shadow-white/15 transition hover:scale-[1.02]">
//                   Get early access
//                 </button>
//                 <button className="rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-medium text-white/85 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/10">
//                   Watch concept
//                 </button>
//               </div>

//               <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/45">
//                 <span>Understands your patterns</span>
//                 <span>•</span>
//                 <span>Nudges at the right moment</span>
//                 <span>•</span>
//                 <span>Built with privacy control</span>
//               </div>
//             </div>

//             <div className="relative mx-auto w-full max-w-xl">
//               <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-b from-white/15 to-transparent blur-2xl" />
//               <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl">
//                 <div className="rounded-[1.6rem] border border-white/10 bg-neutral-900/90 p-4">
//                   <div className="mb-4 flex items-center justify-between">
//                     <div>
//                       <div className="text-sm text-white/45">Live guidance</div>
//                       <div className="text-lg font-semibold">Today’s momentum</div>
//                     </div>
//                     <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
//                       Active
//                     </div>
//                   </div>

//                   <div className="mb-4 grid grid-cols-3 gap-3">
//                     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                       <div className="text-xs text-white/45">Deep work</div>
//                       <div className="mt-2 text-2xl font-bold">3.2h</div>
//                     </div>
//                     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                       <div className="text-xs text-white/45">Distraction</div>
//                       <div className="mt-2 text-2xl font-bold">31m</div>
//                     </div>
//                     <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
//                       <div className="text-xs text-white/45">Energy</div>
//                       <div className="mt-2 text-2xl font-bold">74%</div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     {notifications.map((n) => (
//                       <div
//                         key={n.title}
//                         className="rounded-[1.4rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.03] p-4 transition hover:border-white/20 hover:bg-white/[0.09]"
//                       >
//                         <div className="mb-2 flex items-center justify-between gap-3">
//                           <div className="text-sm font-semibold text-white/90">{n.title}</div>
//                           <div className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-white/50">
//                             {n.tag}
//                           </div>
//                         </div>
//                         <p className="text-sm leading-6 text-white/60">{n.body}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section className="py-8">
//             <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-8 py-10 text-center backdrop-blur-xl sm:px-12">
//               <p className="text-2xl font-semibold tracking-[-0.03em] text-white/90 sm:text-4xl">
//                 You don’t have a time problem. <span className="text-white/45">You have a decision problem.</span>
//               </p>
//             </div>
//           </section>

//           <section id="features" className="py-24">
//             <div className="mb-12 max-w-2xl">
//               <div className="mb-4 text-sm uppercase tracking-[0.24em] text-white/40">Why it hits differently</div>
//               <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
//                 It doesn’t just track your life. <span className="text-white/45">It guides it.</span>
//               </h2>
//             </div>

//             <div className="grid gap-6 md:grid-cols-3">
//               {features.map((feature) => (
//                 <div
//                   key={feature.title}
//                   className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
//                 >
//                   <div className="mb-6 h-14 w-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5" />
//                   <h3 className="text-2xl font-semibold tracking-[-0.03em]">{feature.title}</h3>
//                   <p className="mt-4 text-base leading-7 text-white/60">{feature.desc}</p>
//                 </div>
//               ))}
//             </div>
//           </section>

//           <section id="how" className="grid gap-8 py-24 lg:grid-cols-[0.9fr_1.1fr]">
//             <div>
//               <div className="mb-4 text-sm uppercase tracking-[0.24em] text-white/40">How it works</div>
//               <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
//                 A personal decision engine for your entire day.
//               </h2>
//               <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
//                 It learns your patterns, understands your energy, and surfaces the next best move with perfect timing.
//               </p>
//             </div>

//             <div className="grid gap-5">
//               {[
//                 ["01", "Understands you", "Connect your workflow, habits, goals, and routines."],
//                 ["02", "Learns your patterns", "Knows when you’re focused, tired, avoiding, or ready."],
//                 ["03", "Guides your next move", "Push harder, take a break, go train, or reset—without overthinking."],
//               ].map(([num, title, desc]) => (
//                 <div
//                   key={num}
//                   className="flex gap-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
//                 >
//                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-sm font-bold text-white/70">
//                     {num}
//                   </div>
//                   <div>
//                     <h3 className="text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
//                     <p className="mt-3 text-base leading-7 text-white/60">{desc}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>

//           <section className="py-24">
//             <div className="mb-10 max-w-2xl">
//               <div className="mb-4 text-sm uppercase tracking-[0.24em] text-white/40">Not another productivity app</div>
//               <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-6xl">
//                 Less dashboard. <span className="text-white/45">More direction.</span>
//               </h2>
//             </div>

//             <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] backdrop-blur-xl">
//               <div className="grid grid-cols-2 border-b border-white/10 bg-white/[0.03] px-6 py-4 text-sm uppercase tracking-[0.18em] text-white/45">
//                 <div>Old tools</div>
//                 <div>Your product</div>
//               </div>
//               {comparisons.map(([left, right]) => (
//                 <div key={left} className="grid grid-cols-2 border-b border-white/10 px-6 py-5 last:border-none">
//                   <div className="text-lg text-white/50">{left}</div>
//                   <div className="text-lg font-medium text-white">{right}</div>
//                 </div>
//               ))}
//             </div>
//           </section>

//           <section id="privacy" className="py-24">
//             <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
//               <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
//                 <div className="mb-4 text-sm uppercase tracking-[0.24em] text-white/40">Privacy</div>
//                 <h2 className="text-4xl font-black tracking-[-0.04em] sm:text-5xl">
//                   Sexy product. <br /> Safe boundaries.
//                 </h2>
//                 <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">
//                   This only works if people trust it. Users choose what gets tracked, what stays private, and when the AI should speak up.
//                 </p>
//               </div>

//               <div className="grid gap-4">
//                 {[
//                   "Permission-based tracking only",
//                   "Clear control over notifications",
//                   "Personalized guidance without creepy overload",
//                 ].map((item) => (
//                   <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6 text-lg text-white/80 backdrop-blur-xl">
//                     {item}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </section>

//           <section className="pb-24 pt-8">
//             <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.05] p-10 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-14">
//               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_36%)]" />
//               <div className="relative">
//                 <div className="mb-4 text-sm uppercase tracking-[0.24em] text-white/40">Final call</div>
//                 <h2 className="mx-auto max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
//                   Become the person you keep saying you want to be.
//                 </h2>
//                 <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
//                   One intelligent layer. Better timing. Better decisions. Better days.
//                 </p>
//                 <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
//                   <button className="rounded-full bg-white px-7 py-4 text-base font-semibold text-neutral-950 transition hover:scale-[1.02]">
//                     Join the waitlist
//                   </button>
//                   <button className="rounded-full border border-white/15 bg-white/5 px-7 py-4 text-base font-medium text-white/85 transition hover:bg-white/10">
//                     Book a preview
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </section>
//         </main>
//       </div>
//     </div>
//   );
// }

