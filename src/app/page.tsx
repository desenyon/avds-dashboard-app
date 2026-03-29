type Scenario = {
  scenario_id: string;
  co2e_total_kg: number;
  cost_total_usd: number;
  avg_travel_time_min: number;
  landfill_kg: number;
  water_stress_adjusted_l: number;
  mode_share_car: number;
  mode_share_transit: number;
  mode_share_shuttle: number;
  mode_share_walkbike: number;
  travel_co2e_kg: number;
  venue_co2e_kg: number;
  waste_co2e_kg: number;
};

type DataSourceRow = {
  source: string;
  coverage: string;
  variables: string;
  role: string;
};

const scenarios: Scenario[] = [
  { scenario_id: "V1+P1", co2e_total_kg: 14790.73, cost_total_usd: 198000, avg_travel_time_min: 49.22, landfill_kg: 1141.08, water_stress_adjusted_l: 40353.6, mode_share_car: 0.3529, mode_share_transit: 0.3722, mode_share_shuttle: 0.1254, mode_share_walkbike: 0.1495, travel_co2e_kg: 3515.04, venue_co2e_kg: 10545.44, waste_co2e_kg: 730.24 },
  { scenario_id: "V1+P2", co2e_total_kg: 12148.72, cost_total_usd: 227400, avg_travel_time_min: 42.05, landfill_kg: 379.53, water_stress_adjusted_l: 40353.6, mode_share_car: 0.0699, mode_share_transit: 0.2638, mode_share_shuttle: 0.6178, mode_share_walkbike: 0.0485, travel_co2e_kg: 2583.45, venue_co2e_kg: 9221.95, waste_co2e_kg: 343.32 },
  { scenario_id: "V1+P3", co2e_total_kg: 13295.09, cost_total_usd: 210050, avg_travel_time_min: 50.64, landfill_kg: 489.42, water_stress_adjusted_l: 40353.6, mode_share_car: 0.2637, mode_share_transit: 0.4592, mode_share_shuttle: 0.1181, mode_share_walkbike: 0.159, travel_co2e_kg: 3051.59, venue_co2e_kg: 9842.88, waste_co2e_kg: 400.62 },
  { scenario_id: "V2+P1", co2e_total_kg: 10078.31, cost_total_usd: 168000, avg_travel_time_min: 47.81, landfill_kg: 1141.08, water_stress_adjusted_l: 38895.36, mode_share_car: 0.2442, mode_share_transit: 0.4777, mode_share_shuttle: 0.1123, mode_share_walkbike: 0.1658, travel_co2e_kg: 3083.8, venue_co2e_kg: 6264.27, waste_co2e_kg: 730.24 },
  { scenario_id: "V2+P2", co2e_total_kg: 8220.67, cost_total_usd: 197400, avg_travel_time_min: 40.93, landfill_kg: 379.53, water_stress_adjusted_l: 38895.36, mode_share_car: 0.0489, mode_share_transit: 0.3375, mode_share_shuttle: 0.5589, mode_share_walkbike: 0.0548, travel_co2e_kg: 2473.34, venue_co2e_kg: 5404.0, waste_co2e_kg: 343.32 },
  { scenario_id: "V2+P3", co2e_total_kg: 8927.67, cost_total_usd: 180050, avg_travel_time_min: 47.87, landfill_kg: 489.42, water_stress_adjusted_l: 38895.36, mode_share_car: 0.1698, mode_share_transit: 0.5642, mode_share_shuttle: 0.0984, mode_share_walkbike: 0.1677, travel_co2e_kg: 2719.44, venue_co2e_kg: 5807.61, waste_co2e_kg: 400.62 },
  { scenario_id: "V3+P1", co2e_total_kg: 9022.12, cost_total_usd: 126000, avg_travel_time_min: 38.0, landfill_kg: 1141.08, water_stress_adjusted_l: 38062.08, mode_share_car: 0.5445, mode_share_transit: 0.267, mode_share_shuttle: 0.0778, mode_share_walkbike: 0.1107, travel_co2e_kg: 4023.6, venue_co2e_kg: 4268.28, waste_co2e_kg: 730.24 },
  { scenario_id: "V3+P2", co2e_total_kg: 6688.51, cost_total_usd: 155400, avg_travel_time_min: 36.84, landfill_kg: 379.53, water_stress_adjusted_l: 38062.08, mode_share_car: 0.1538, mode_share_transit: 0.2476, mode_share_shuttle: 0.5452, mode_share_walkbike: 0.0534, travel_co2e_kg: 2672.48, venue_co2e_kg: 3672.71, waste_co2e_kg: 343.32 },
  { scenario_id: "V3+P3", co2e_total_kg: 7807.79, cost_total_usd: 138050, avg_travel_time_min: 40.09, landfill_kg: 489.42, water_stress_adjusted_l: 38062.08, mode_share_car: 0.4379, mode_share_transit: 0.358, mode_share_shuttle: 0.079, mode_share_walkbike: 0.1251, travel_co2e_kg: 3455.03, venue_co2e_kg: 3952.13, waste_co2e_kg: 400.62 },
];

const baseline = scenarios.find((s) => s.scenario_id === "V1+P1")!;
const winner = scenarios.find((s) => s.scenario_id === "V3+P2")!;

const venueLegend = [
  "V1: McCormick Place Lakeside",
  "V2: Navy Pier Grand Ballroom",
  "V3: UIC Forum",
];

const policyLegend = [
  "P1: Business-as-usual operations",
  "P2: Full low-impact bundle (transit incentive, shuttle, waste and energy upgrades)",
  "P3: Partial low-impact bundle",
];

const dataSources: DataSourceRow[] = [
  {
    source: "ACS + TIGER",
    coverage: "15 origin zones",
    variables: "population, commute context, centroid geometry",
    role: "origin demand and geography",
  },
  {
    source: "GTFS (CTA feed)",
    coverage: "Chicago transit schedule snapshot",
    variables: "stops, trips, service windows, fare attributes",
    role: "transit accessibility and generalized travel cost",
  },
  {
    source: "OSRM routing",
    coverage: "45 OD pairs (zones x venues)",
    variables: "travel time, distance",
    role: "car travel burden and routing baseline",
  },
  {
    source: "Open-Meteo",
    coverage: "event-date weather profile",
    variables: "temperature, precipitation",
    role: "venue energy and comfort context",
  },
  {
    source: "eGRID + EPA GHG Hub + WARM",
    coverage: "regional factor set",
    variables: "kg CO2e/kWh, mode factors, waste factors",
    role: "emissions accounting for travel and operations",
  },
  {
    source: "WRI Aqueduct",
    coverage: "regional stress factor",
    variables: "water stress index",
    role: "stress-adjusted water impact",
  },
  {
    source: "Venue public documentation",
    coverage: "3 venues",
    variables: "capacity, accessibility score, rental cost",
    role: "feasibility and cost constraints",
  },
  {
    source: "External validation artifact",
    coverage: "1 benchmark",
    variables: "waste diversion plausibility reference",
    role: "sanity check against real sustainability reporting",
  },
];

const methodSteps = [
  "Case lock and baseline definition",
  "Data acquisition and canonical table build",
  "OD, mode choice, and routing burden estimation",
  "Venue energy, waste, water, and cost accounting",
  "Feasibility filtering and robust multi-objective ranking",
];

const feasibilityStages = [
  { label: "All combinations", value: 9 },
  { label: "Pass capacity", value: 9 },
  { label: "Pass budget", value: 9 },
  { label: "Pass ADA", value: 9 },
  { label: "Pass avg and P95 travel", value: 9 },
  { label: "Feasible set", value: 9 },
  { label: "Selected", value: 1 },
];

const qaChecks = [
  "14/14 QA checks passed",
  "OD pair coverage complete (45 expected, 45 observed)",
  "Mode probabilities reconcile to 1.0",
  "Transit viability flags are valid",
  "Policy emission monotonicity check passed",
];

const limitations = [
  "Single metro and single event type reduce immediate external generalization.",
  "Attendee behavior is modeled, not observed from ticket ZIP-code traces.",
  "Some operations estimates rely on proxy factors where direct meter data is unavailable.",
  "Transit and routing conditions are snapshot-based and can vary on event day.",
];

const sensitivityPriority = [
  { factor: "Demand allocation uncertainty", score: 92 },
  { factor: "Mode-choice elasticity", score: 84 },
  { factor: "Event-day travel time shift", score: 71 },
  { factor: "Venue energy factor uncertainty", score: 63 },
  { factor: "Waste diversion factor uncertainty", score: 55 },
  { factor: "Water stress factor uncertainty", score: 41 },
];

const futureRoadmap = [
  {
    phase: "Phase 1",
    title: "Calibration Upgrade",
    detail: "Integrate observed attendee origin data and post-event surveys for calibration.",
  },
  {
    phase: "Phase 2",
    title: "Higher-Fidelity Inputs",
    detail: "Use venue utility and waste invoices to reduce proxy-driven uncertainty.",
  },
  {
    phase: "Phase 3",
    title: "Scale-Out",
    detail: "Extend to more metros, event types, and expanded venue catalogs.",
  },
  {
    phase: "Phase 4",
    title: "Planner Product",
    detail: "Deploy interactive what-if controls for organizer-facing operations planning.",
  },
];

function fmtNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function signed(n: number) {
  return `${n > 0 ? "+" : ""}${fmtNum(n)}`;
}

function signedPct(n: number) {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function pctChange(delta: number, base: number) {
  return (delta / base) * 100;
}

function SlideHeader({ num, title, subtitle }: { num: string; title: string; subtitle?: string }) {
  return (
    <header className="slide-header">
      <p className="eyebrow">Slide {num}</p>
      <h2>{title}</h2>
      {subtitle ? <p className="slide-subtitle">{subtitle}</p> : null}
    </header>
  );
}

function BaselineComposition() {
  const components = [
    { label: "Travel CO2e", value: baseline.travel_co2e_kg, color: "#c85a32" },
    { label: "Venue energy CO2e", value: baseline.venue_co2e_kg, color: "#2a6289" },
    { label: "Waste CO2e", value: baseline.waste_co2e_kg, color: "#2b8a6f" },
  ];

  const baselineByVenue = ["V1+P1", "V2+P1", "V3+P1"].map((id) => scenarios.find((s) => s.scenario_id === id)!);
  const maxVenue = Math.max(...baselineByVenue.map((s) => s.co2e_total_kg));

  return (
    <div className="deck-grid two">
      <article className="deck-card">
        <h3>Baseline Impact Composition (V1+P1)</h3>
        <div className="stacked-track" aria-label="Baseline composition">
          {components.map((item) => (
            <div
              key={item.label}
              className="stacked-segment"
              style={{ width: `${(item.value / baseline.co2e_total_kg) * 100}%`, background: item.color }}
              title={`${item.label}: ${fmtNum(item.value)} kg`}
            />
          ))}
        </div>
        <div className="legend compact">
          {components.map((item) => (
            <span key={item.label}>
              <i style={{ background: item.color }} />
              {item.label}: {fmtNum(item.value)} kg
            </span>
          ))}
        </div>
      </article>

      <article className="deck-card">
        <h3>Baseline CO2e Across Venue Choices</h3>
        <div className="bars">
          {baselineByVenue.map((s) => (
            <div className="bar-row" key={s.scenario_id}>
              <span>{s.scenario_id}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${(s.co2e_total_kg / maxVenue) * 100}%`, background: "linear-gradient(90deg, #cf7440, #b33c1d)" }}
                />
              </div>
              <strong>{fmtNum(s.co2e_total_kg)} kg</strong>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function FeasibilityFunnel() {
  const max = Math.max(...feasibilityStages.map((s) => s.value));

  return (
    <article className="deck-card">
      <h3>Feasibility Funnel</h3>
      <div className="funnel-grid">
        {feasibilityStages.map((stage) => (
          <div className="funnel-row" key={stage.label}>
            <span>{stage.label}</span>
            <div className="funnel-track">
              <div className="funnel-fill" style={{ width: `${(stage.value / max) * 100}%` }} />
            </div>
            <strong>{stage.value}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function ParetoScatter() {
  const minCost = Math.min(...scenarios.map((s) => s.cost_total_usd));
  const maxCost = Math.max(...scenarios.map((s) => s.cost_total_usd));
  const minCo2 = Math.min(...scenarios.map((s) => s.co2e_total_kg));
  const maxCo2 = Math.max(...scenarios.map((s) => s.co2e_total_kg));
  const minTravel = Math.min(...scenarios.map((s) => s.avg_travel_time_min));
  const maxTravel = Math.max(...scenarios.map((s) => s.avg_travel_time_min));
  const co2Span = maxCo2 - minCo2 || 1;
  const costSpan = maxCost - minCost || 1;

  return (
    <article className="deck-card">
      <h3>Pareto view: CO2e vs cost</h3>
      <p className="muted">
        Axes match the interactive dashboard: x = total CO2e (kg), y = total cost (USD). Point size encodes average travel time. Lower-left is better.
      </p>
      <div className="scatter-wrap" aria-label="CO2e versus cost scatter">
        {scenarios.map((s) => {
          const x = ((s.co2e_total_kg - minCo2) / co2Span) * 100;
          const y = ((s.cost_total_usd - minCost) / costSpan) * 100;
          const r = 8 + ((s.avg_travel_time_min - minTravel) / (maxTravel - minTravel || 1)) * 8;
          const winnerClass = s.scenario_id === winner.scenario_id ? " winner-dot" : "";

          return (
            <div
              key={`dot-${s.scenario_id}`}
              className={`scatter-dot${winnerClass}`}
              style={{ left: `${x}%`, bottom: `${y}%`, width: `${r * 2}px`, height: `${r * 2}px` }}
              title={`${s.scenario_id} | CO2e ${fmtNum(s.co2e_total_kg)} kg | Cost ${fmtNum(s.cost_total_usd)} USD | Travel ${fmtNum(s.avg_travel_time_min)} min`}
            >
              <span>{s.scenario_id}</span>
            </div>
          );
        })}
      </div>
      <div className="axis-caption">
        <span>Lower CO2e</span>
        <span>Higher CO2e</span>
      </div>
      <p className="scatter-y-note">Vertical position: total cost (USD); bottom = lower cost.</p>
    </article>
  );
}

function KpiComparison() {
  const rows = [
    { label: "Total CO2e (kg)", base: baseline.co2e_total_kg, win: winner.co2e_total_kg },
    { label: "Total Cost (USD)", base: baseline.cost_total_usd, win: winner.cost_total_usd },
    { label: "Avg Travel Time (min)", base: baseline.avg_travel_time_min, win: winner.avg_travel_time_min },
    { label: "Landfill (kg)", base: baseline.landfill_kg, win: winner.landfill_kg },
    { label: "Water Stress Adjusted (L)", base: baseline.water_stress_adjusted_l, win: winner.water_stress_adjusted_l },
  ];

  return (
    <article className="deck-card">
      <h3>Baseline vs Recommended (Index, baseline = 100)</h3>
      <div className="compare-grid">
        {rows.map((row) => {
          const winnerIndex = (row.win / row.base) * 100;
          return (
            <div className="compare-row" key={row.label}>
              <span>{row.label}</span>
              <div className="compare-bars">
                <div className="compare-track">
                  <div className="compare-fill base" style={{ width: "100%" }} />
                </div>
                <div className="compare-track">
                  <div className="compare-fill win" style={{ width: `${winnerIndex}%` }} />
                </div>
              </div>
              <div className="compare-values">
                <small>B: {fmtNum(row.base)}</small>
                <small>W: {fmtNum(row.win)}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="legend compact">
        <span><i style={{ background: "#527996" }} />Baseline</span>
        <span><i style={{ background: "#2f8a72" }} />Winner</span>
      </div>
    </article>
  );
}

function ModeStack() {
  return (
    <article className="deck-card chart-card">
      <h3>Mode Share Composition</h3>
      <div className="bars">
        {scenarios.map((s) => (
          <div className="mode-row" key={`mode-${s.scenario_id}`}>
            <span>{s.scenario_id}</span>
            <div className="stack">
              <div style={{ width: `${s.mode_share_car * 100}%`, background: "#a43f2a" }} />
              <div style={{ width: `${s.mode_share_transit * 100}%`, background: "#1e7a63" }} />
              <div style={{ width: `${s.mode_share_shuttle * 100}%`, background: "#1f4f7f" }} />
              <div style={{ width: `${s.mode_share_walkbike * 100}%`, background: "#d8a53d" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="legend compact">
        <span><i style={{ background: "#a43f2a" }} />Car</span>
        <span><i style={{ background: "#1e7a63" }} />Transit</span>
        <span><i style={{ background: "#1f4f7f" }} />Shuttle</span>
        <span><i style={{ background: "#d8a53d" }} />Walk/Bike</span>
      </div>
    </article>
  );
}

function MetricBars({
  title,
  field,
  formatter,
  color,
}: {
  title: string;
  field: keyof Scenario;
  formatter: (v: number) => string;
  color: string;
}) {
  const values = scenarios.map((s) => Number(s[field]));
  const max = Math.max(...values);

  return (
    <article className="deck-card chart-card">
      <h3>{title}</h3>
      <div className="bars">
        {scenarios
          .slice()
          .sort((a, b) => Number(a[field]) - Number(b[field]))
          .map((s) => {
            const val = Number(s[field]);
            const isWinner = s.scenario_id === winner.scenario_id;
            return (
              <div className="bar-row" key={`${title}-${s.scenario_id}`}>
                <span>{s.scenario_id}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill${isWinner ? " winner-bar" : ""}`}
                    style={{ width: `${(val / max) * 100}%`, background: color }}
                  />
                </div>
                <strong>{formatter(val)}</strong>
              </div>
            );
          })}
      </div>
    </article>
  );
}

function DeltaBars() {
  const deltas = [
    { label: "Total CO2e", delta: winner.co2e_total_kg - baseline.co2e_total_kg, unit: "kg" },
    { label: "Total Cost", delta: winner.cost_total_usd - baseline.cost_total_usd, unit: "USD" },
    { label: "Average Travel", delta: winner.avg_travel_time_min - baseline.avg_travel_time_min, unit: "min" },
    { label: "Landfill", delta: winner.landfill_kg - baseline.landfill_kg, unit: "kg" },
    { label: "Water Stress Adjusted", delta: winner.water_stress_adjusted_l - baseline.water_stress_adjusted_l, unit: "L" },
  ];

  const pctValues = deltas.map((row) => {
    const base =
      row.label === "Total CO2e"
        ? baseline.co2e_total_kg
        : row.label === "Total Cost"
          ? baseline.cost_total_usd
          : row.label === "Average Travel"
            ? baseline.avg_travel_time_min
            : row.label === "Landfill"
              ? baseline.landfill_kg
              : baseline.water_stress_adjusted_l;
    return Math.abs(pctChange(row.delta, base));
  });
  const maxAbsPct = Math.max(...pctValues);

  return (
    <article className="deck-card">
      <h3>Impact Delta Bars (vs baseline)</h3>
      <div className="delta-grid">
        {deltas.map((row) => {
          const base =
            row.label === "Total CO2e"
              ? baseline.co2e_total_kg
              : row.label === "Total Cost"
                ? baseline.cost_total_usd
                : row.label === "Average Travel"
                  ? baseline.avg_travel_time_min
                  : row.label === "Landfill"
                    ? baseline.landfill_kg
                    : baseline.water_stress_adjusted_l;
          const pct = pctChange(row.delta, base);
          return (
            <div className="delta-row" key={row.label}>
              <span>{row.label}</span>
              <div className="delta-track">
                <div
                  className={`delta-fill ${row.delta <= 0 ? "good" : "bad"}`}
                  style={{ width: `${(Math.abs(pct) / maxAbsPct) * 100}%` }}
                />
              </div>
              <strong>{signed(row.delta)} {row.unit} ({signedPct(pct)})</strong>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function SensitivityChart() {
  const max = Math.max(...sensitivityPriority.map((s) => s.score));

  return (
    <article className="deck-card">
      <h3>Sensitivity Priority (Relative)</h3>
      <p className="muted">Tornado-style ranking used to prioritize uncertainty stress tests.</p>
      <div className="bars">
        {sensitivityPriority.map((item) => (
          <div className="bar-row" key={item.factor}>
            <span>{item.factor}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(item.score / max) * 100}%`, background: "linear-gradient(90deg, #7e5b99, #5d3f80)" }}
              />
            </div>
            <strong>{item.score}</strong>
          </div>
        ))}
      </div>
    </article>
  );
}

function Roadmap() {
  return (
    <div className="roadmap-grid">
      {futureRoadmap.map((item) => (
        <article className="roadmap-card" key={item.phase}>
          <p>{item.phase}</p>
          <h3>{item.title}</h3>
          <span>{item.detail}</span>
        </article>
      ))}
    </div>
  );
}

export default function Home() {
  const co2Delta = winner.co2e_total_kg - baseline.co2e_total_kg;
  const costDelta = winner.cost_total_usd - baseline.cost_total_usd;
  const travelDelta = winner.avg_travel_time_min - baseline.avg_travel_time_min;
  const landfillDelta = winner.landfill_kg - baseline.landfill_kg;
  const waterDelta = winner.water_stress_adjusted_l - baseline.water_stress_adjusted_l;

  return (
    <main className="deck-shell">
      <nav className="deck-nav" aria-label="Slide navigation">
        <a href="#s1">1</a>
        <a href="#s2">2</a>
        <a href="#s3">3</a>
        <a href="#s4">4</a>
        <a href="#s5">5</a>
        <a href="#s6">6</a>
        <a href="#s7">7</a>
        <a href="#s8">8</a>
        <a href="#s9">9</a>
        <a href="#s10">10</a>
        <a href="#appendix">Appendix</a>
      </nav>

      <section className="slide intro" id="s1">
        <SlideHeader
          num="1"
          title="EcoPlan-OR (AVDS): A Data-Driven Optimizer for Sustainable Event Siting"
          subtitle="AVDS stands for Advanced Venue Decision System"
        />
        <div className="title-grid">
          <article className="deck-card">
            <h3>Project Identity</h3>
            <p>Metro: Chicago, IL</p>
            <p>Event: single-day indoor data science conference</p>
            <p>Case date: 2026-06-20</p>
          </article>
          <article className="deck-card">
            <h3>Decision Context</h3>
            <p>Baseline: {baseline.scenario_id}</p>
            <p>Recommended: {winner.scenario_id}</p>
            <p>Scope: 3 venues x 3 policy bundles</p>
          </article>
          <article className="deck-card">
            <h3>Submission Links</h3>
            <div className="link-stack">
              <a href="https://dashboard-app-beta-seven.vercel.app" target="_blank" rel="noopener noreferrer">Live Dashboard (Vercel)</a>
              <a href="https://github.com/desenyon/avds-dashboard-app" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
              <a href="https://drive.google.com/drive/u/0/folders/1vxJd7hspLyiX8mDB6_H5G2ioATSgSjyp" target="_blank" rel="noopener noreferrer">Submission Link</a>
            </div>
          </article>
        </div>
      </section>

      <section className="slide" id="s2">
        <SlideHeader
          num="2"
          title="The Problem"
          subtitle="Venue-first planning hides tradeoffs. We need an explicit multi-objective decision process."
        />
        <div className="deck-grid two">
          <article className="deck-card problem-card">
            <h3>Why This Matters</h3>
            <ul>
              <li>Event choices affect travel, venue energy, waste outcomes, and water stress simultaneously.</li>
              <li>A cheap or convenient venue can still perform poorly once all impacts are counted.</li>
              <li>Organizers need a feasible recommendation that is explainable to judges and stakeholders.</li>
            </ul>
          </article>
          <article className="deck-card stats-card">
            <h3>Who Is Affected</h3>
            <ul>
              <li>Event organizers</li>
              <li>Attendees and accessibility groups</li>
              <li>Venue operators</li>
              <li>Host city and surrounding communities</li>
            </ul>
          </article>
        </div>
        <BaselineComposition />
      </section>

      <section className="slide" id="s3">
        <SlideHeader
          num="3"
          title="Research Question"
          subtitle="Which venue-policy scenario minimizes impact while satisfying hard feasibility constraints?"
        />
        <div className="deck-grid two">
          <article className="deck-card">
            <h3>Formal Question</h3>
            <p>
              For a Chicago metro single-day indoor event, choose scenario $s = (v, p)$ that minimizes
              total CO2e, landfill, and stress-adjusted water while staying feasible on budget, capacity,
              accessibility, and travel burden.
            </p>
            <p className="muted">
              Hypothesis: a transit-accessible venue plus targeted operations bundle outperforms business-as-usual baseline.
            </p>
          </article>
          <article className="deck-card">
            <h3>Scenario Legend</h3>
            <div className="legend-group">
              <p><b>Venue IDs</b></p>
              <ul>{venueLegend.map((item) => <li key={item}>{item}</li>)}</ul>
              <p><b>Policy IDs</b></p>
              <ul>{policyLegend.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </article>
        </div>
      </section>

      <section className="slide" id="s4">
        <SlideHeader
          num="4"
          title="Data Sources"
          subtitle="Multi-source public-data framework with explicit coverage, variables, and model role."
        />
        <article className="deck-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Coverage</th>
                  <th>Important Variables</th>
                  <th>Role In Model</th>
                </tr>
              </thead>
              <tbody>
                {dataSources.map((row) => (
                  <tr key={row.source}>
                    <td>{row.source}</td>
                    <td>{row.coverage}</td>
                    <td>{row.variables}</td>
                    <td>{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="slide" id="s5">
        <SlideHeader
          num="5"
          title="Data Analysis and Methods"
          subtitle="Feasibility-first multi-objective workflow with explicit optimization and tradeoff visualizations."
        />
        <article className="deck-card">
          <h3>Pipeline Flow</h3>
          <div className="flow-line">
            {methodSteps.map((step, idx) => (
              <div className="flow-step" key={step}>
                <b>{idx + 1}</b>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <code>min_s f(s) = [CO2e(s), Cost(s), AvgTravel(s), Landfill(s), WaterStressAdj(s)]</code>
          <p className="muted">subject to capacity, budget, ADA, avg travel, P95 travel, and venue-policy compatibility.</p>
        </article>
        <div className="deck-grid two">
          <FeasibilityFunnel />
          <ParetoScatter />
        </div>
      </section>

      <section className="slide" id="s6">
        <SlideHeader
          num="6"
          title="Key Findings"
          subtitle="V3+P2 dominates baseline with simultaneous improvements across all headline metrics."
        />
        <div className="result-grid three-up">
          <article className="result-card">
            <small>Winner</small>
            <h3>{winner.scenario_id}</h3>
            <p>Selected by robust feasible ranking</p>
          </article>
          <article className="result-card">
            <small>Feasible scenarios</small>
            <h3>9 / 9</h3>
            <p>All candidates satisfy hard constraints in this case lock</p>
          </article>
          <article className="result-card">
            <small>QA status</small>
            <h3>14 / 14</h3>
            <p>All QA gates passed</p>
          </article>
        </div>
        <div className="deck-grid two">
          <KpiComparison />
          <MetricBars
            title="Scenario Frontier: Total CO2e"
            field="co2e_total_kg"
            formatter={(v) => `${fmtNum(v)} kg`}
            color="linear-gradient(90deg, #de7b3f, #be3e1f)"
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <ModeStack />
        </div>
      </section>

      <section className="slide" id="s7">
        <SlideHeader
          num="7"
          title="Proposed Solution"
          subtitle="Deploy the AVDS workflow as an organizer decision tool and execute V3+P2 for this case."
        />
        <div className="deck-grid two">
          <article className="deck-card">
            <h3>Operational Decision Flow</h3>
            <div className="solution-flow">
              <div><b>Inputs</b><span>attendance, date, budget, venues, policy options</span></div>
              <div><b>Optimizer</b><span>scenario simulation + feasibility filter + robust ranking</span></div>
              <div><b>Outputs</b><span>winner, backup option, KPI justification, memo-ready rationale</span></div>
            </div>
          </article>
          <article className="deck-card">
            <h3>Implementation Steps</h3>
            <ol className="ordered">
              <li>Lock case assumptions and constraints.</li>
              <li>Run pipeline and pass QA gates.</li>
              <li>Inspect tradeoff charts and robustness ranking.</li>
              <li>Select and publish the final scenario recommendation.</li>
            </ol>
          </article>
        </div>
      </section>

      <section className="slide" id="s8">
        <SlideHeader
          num="8"
          title="Impact"
          subtitle="Baseline V1+P1 to recommended V3+P2, shown as absolute and percent deltas."
        />
        <div className="result-grid">
          <article className="result-card">
            <small>Total CO2e</small>
            <h3>{signed(co2Delta)} kg</h3>
            <p>{signedPct(pctChange(co2Delta, baseline.co2e_total_kg))}</p>
          </article>
          <article className="result-card">
            <small>Total Cost</small>
            <h3>{signed(costDelta)} USD</h3>
            <p>{signedPct(pctChange(costDelta, baseline.cost_total_usd))}</p>
          </article>
          <article className="result-card">
            <small>Average Travel</small>
            <h3>{signed(travelDelta)} min</h3>
            <p>{signedPct(pctChange(travelDelta, baseline.avg_travel_time_min))}</p>
          </article>
          <article className="result-card">
            <small>Landfill</small>
            <h3>{signed(landfillDelta)} kg</h3>
            <p>{signedPct(pctChange(landfillDelta, baseline.landfill_kg))}</p>
          </article>
          <article className="result-card">
            <small>Water Stress Adjusted</small>
            <h3>{signed(waterDelta)} L</h3>
            <p>{signedPct(pctChange(waterDelta, baseline.water_stress_adjusted_l))}</p>
          </article>
          <article className="result-card emphasis">
            <small>Bottom Line</small>
            <h3>Lower impact, lower cost</h3>
            <p>Winner improves all five KPI categories in this case lock.</p>
          </article>
        </div>
        <div style={{ marginTop: 12 }}>
          <DeltaBars />
        </div>
      </section>

      <section className="slide" id="s9">
        <SlideHeader
          num="9"
          title="Limitations"
          subtitle="Current assumptions and uncertainty drivers to keep interpretation honest."
        />
        <div className="deck-grid two">
          <article className="deck-card">
            <ul className="qa-list">
              {limitations.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
          <SensitivityChart />
        </div>
      </section>

      <section className="slide" id="s10">
        <SlideHeader
          num="10"
          title="Future Work"
          subtitle="Roadmap to increase realism, transferability, and deployment maturity."
        />
        <Roadmap />
      </section>

      <section className="slide" id="appendix">
        <SlideHeader
          num="Appendix"
          title="Full Scenario Comparison"
          subtitle="Reference table for judges who want the full frontier view."
        />
        <article className="deck-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>CO2e (kg)</th>
                  <th>Cost (USD)</th>
                  <th>Avg Travel (min)</th>
                  <th>Landfill (kg)</th>
                  <th>Water Stress (L)</th>
                </tr>
              </thead>
              <tbody>
                {scenarios
                  .slice()
                  .sort((a, b) => a.co2e_total_kg - b.co2e_total_kg)
                  .map((s) => (
                    <tr key={`row-${s.scenario_id}`} className={s.scenario_id === winner.scenario_id ? "winner" : ""}>
                      <td>{s.scenario_id}</td>
                      <td>{fmtNum(s.co2e_total_kg)}</td>
                      <td>{fmtNum(s.cost_total_usd)}</td>
                      <td>{fmtNum(s.avg_travel_time_min)}</td>
                      <td>{fmtNum(s.landfill_kg)}</td>
                      <td>{fmtNum(s.water_stress_adjusted_l)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <footer className="footer-note">
        EcoPlan-OR powered by AVDS (Advanced Venue Decision System). Rubric-aligned presentation with reproducibility links.
      </footer>
    </main>
  );
}
