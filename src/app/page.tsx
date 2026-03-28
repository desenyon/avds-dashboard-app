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
};

const scenarios: Scenario[] = [
  { scenario_id: "V1+P1", co2e_total_kg: 14790.73, cost_total_usd: 198000, avg_travel_time_min: 49.22, landfill_kg: 1141.08, water_stress_adjusted_l: 40353.6, mode_share_car: 0.3529, mode_share_transit: 0.3722, mode_share_shuttle: 0.1254, mode_share_walkbike: 0.1495 },
  { scenario_id: "V1+P2", co2e_total_kg: 12148.72, cost_total_usd: 227400, avg_travel_time_min: 42.05, landfill_kg: 379.53, water_stress_adjusted_l: 40353.6, mode_share_car: 0.0699, mode_share_transit: 0.2638, mode_share_shuttle: 0.6178, mode_share_walkbike: 0.0485 },
  { scenario_id: "V1+P3", co2e_total_kg: 13295.09, cost_total_usd: 210050, avg_travel_time_min: 50.64, landfill_kg: 489.42, water_stress_adjusted_l: 40353.6, mode_share_car: 0.2637, mode_share_transit: 0.4592, mode_share_shuttle: 0.1181, mode_share_walkbike: 0.159 },
  { scenario_id: "V2+P1", co2e_total_kg: 10078.31, cost_total_usd: 168000, avg_travel_time_min: 47.81, landfill_kg: 1141.08, water_stress_adjusted_l: 38895.36, mode_share_car: 0.2442, mode_share_transit: 0.4777, mode_share_shuttle: 0.1123, mode_share_walkbike: 0.1658 },
  { scenario_id: "V2+P2", co2e_total_kg: 8220.67, cost_total_usd: 197400, avg_travel_time_min: 40.93, landfill_kg: 379.53, water_stress_adjusted_l: 38895.36, mode_share_car: 0.0489, mode_share_transit: 0.3375, mode_share_shuttle: 0.5589, mode_share_walkbike: 0.0548 },
  { scenario_id: "V2+P3", co2e_total_kg: 8927.67, cost_total_usd: 180050, avg_travel_time_min: 47.87, landfill_kg: 489.42, water_stress_adjusted_l: 38895.36, mode_share_car: 0.1698, mode_share_transit: 0.5642, mode_share_shuttle: 0.0984, mode_share_walkbike: 0.1677 },
  { scenario_id: "V3+P1", co2e_total_kg: 9022.12, cost_total_usd: 126000, avg_travel_time_min: 38.0, landfill_kg: 1141.08, water_stress_adjusted_l: 38062.08, mode_share_car: 0.5445, mode_share_transit: 0.267, mode_share_shuttle: 0.0778, mode_share_walkbike: 0.1107 },
  { scenario_id: "V3+P2", co2e_total_kg: 6688.51, cost_total_usd: 155400, avg_travel_time_min: 36.84, landfill_kg: 379.53, water_stress_adjusted_l: 38062.08, mode_share_car: 0.1538, mode_share_transit: 0.2476, mode_share_shuttle: 0.5452, mode_share_walkbike: 0.0534 },
  { scenario_id: "V3+P3", co2e_total_kg: 7807.79, cost_total_usd: 138050, avg_travel_time_min: 40.09, landfill_kg: 489.42, water_stress_adjusted_l: 38062.08, mode_share_car: 0.4379, mode_share_transit: 0.358, mode_share_shuttle: 0.079, mode_share_walkbike: 0.1251 },
];

const baseline = scenarios.find((s) => s.scenario_id === "V1+P1")!;
const winner = scenarios.find((s) => s.scenario_id === "V3+P2")!;

const constraints = [
  "Capacity must be satisfied",
  "Budget cannot be exceeded",
  "Accessibility threshold must pass",
  "Average travel threshold must pass",
  "P95 travel threshold must pass",
  "Venue and policy must be compatible",
];

const processSteps = [
  {
    title: "Frame The Decision",
    copy: "Lock metro, event type, baseline, venue options, and policy bundles so optimization cannot be tuned after seeing results.",
    output: "Frozen case definition",
  },
  {
    title: "Assemble Evidence",
    copy: "Ingest and harmonize OD travel, mode behavior, venue factors, and operations assumptions into canonical tables with provenance.",
    output: "Traceable modeling inputs",
  },
  {
    title: "Simulate All Scenarios",
    copy: "Run every venue-policy combination through travel, emissions, cost, waste, and water models under common assumptions.",
    output: "9 fully comparable scenarios",
  },
  {
    title: "Filter And Rank",
    copy: "Apply hard feasibility constraints first, then rank feasible scenarios by balanced multi-objective performance under uncertainty.",
    output: "Robust winner recommendation",
  },
];

const evidenceRows = [
  { tier: "DIRECT", meaning: "Primary measured or official inputs", examples: "ACS, TIGER, GTFS, Open-Meteo pulls" },
  { tier: "PROXY", meaning: "Closest defensible approximation", examples: "Behavior priors and fallback factors" },
  { tier: "MANUAL_PUBLIC", meaning: "Publicly documented reference", examples: "External sustainability benchmark" },
  { tier: "ASSUMPTION", meaning: "Explicit assumption with audit note", examples: "Deterministic fallback parameters" },
];

const qaChecks = [
  "14 of 14 QA checks passed",
  "OD pair coverage complete",
  "Transit viability flags valid",
  "Origin and mode shares reconcile to 1.0",
  "Policy emission monotonicity check passed",
];

function fmtNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function pct(delta: number, base: number) {
  return (delta / base) * 100;
}

function fmtSigned(n: number) {
  return `${n > 0 ? "+" : ""}${fmtNum(n)}`;
}

function fmtSignedPct(n: number) {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function SlideHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="slide-header">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle ? <p className="slide-subtitle">{subtitle}</p> : null}
    </div>
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
    <section className="deck-card chart-card">
      <h3>{title}</h3>
      <div className="bars">
        {scenarios.map((s) => {
          const val = Number(s[field]);
          return (
            <div className="bar-row" key={`${title}-${s.scenario_id}`}>
              <span>{s.scenario_id}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(val / max) * 100}%`, background: color }} />
              </div>
              <strong>{formatter(val)}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ModeStack() {
  return (
    <section className="deck-card chart-card">
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
      <div className="legend">
        <span><i style={{ background: "#a43f2a" }} />Car</span>
        <span><i style={{ background: "#1e7a63" }} />Transit</span>
        <span><i style={{ background: "#1f4f7f" }} />Shuttle</span>
        <span><i style={{ background: "#d8a53d" }} />Walk/Bike</span>
      </div>
    </section>
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
      <nav className="deck-nav" aria-label="Section navigation">
        <a href="#problem">Problem</a>
        <a href="#solution">Solution</a>
        <a href="#evidence">Evidence</a>
        <a href="#results">Results</a>
        <a href="#landscape">Scenarios</a>
      </nav>

      <section className="slide intro" id="intro">
        <p className="eyebrow">AVDS Presentation Site</p>
        <h1>Metro Event Siting and Operations Optimizer</h1>
        <p className="hero-copy">
          A judge-ready decision narrative for Chicago: from problem definition and method to evidence-backed recommendation.
        </p>
        <div className="headline-grid">
          <article>
            <small>Recommended scenario</small>
            <h3>{winner.scenario_id}</h3>
            <p>Robust best feasible option across objectives.</p>
          </article>
          <article>
            <small>Baseline comparator</small>
            <h3>{baseline.scenario_id}</h3>
            <p>Reference for quantifying improvements.</p>
          </article>
          <article>
            <small>Decision scope</small>
            <h3>3 venues x 3 policies</h3>
            <p>All 9 combinations evaluated consistently.</p>
          </article>
        </div>
      </section>

      <section className="slide" id="problem">
        <SlideHeader
          eyebrow="1. Problem"
          title="What Problem Are We Solving?"
          subtitle="Choose one venue-policy scenario that reduces impact without breaking operations, access, or budget."
        />

        <div className="deck-grid two">
          <article className="deck-card problem-card">
            <h3>Operational Reality</h3>
            <ul>
              <li>Venue decisions affect travel emissions, attendee burden, and operating cost simultaneously.</li>
              <li>Single-metric optimization often creates regressions in at least one critical objective.</li>
              <li>Judges need a transparent decision process, not just a leaderboard.</li>
            </ul>
          </article>

          <article className="deck-card constraint-card" id="solution">
            <h3>How We Fix It</h3>
            <p>
              AVDS runs all scenarios through the same pipeline, enforces hard constraints before ranking,
              then selects the most robust feasible winner.
            </p>
            <div className="pill-grid">
              {constraints.map((item) => (
                <span className="pill" key={item}>{item}</span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="slide">
        <SlideHeader
          eyebrow="2. Process"
          title="How The Decision Was Built"
          subtitle="From case framing to robust recommendation in four auditable steps."
        />

        <div className="process-grid">
          {processSteps.map((step, idx) => (
            <article className="process-card" key={step.title}>
              <p className="step-id">Step {idx + 1}</p>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
              <b>{step.output}</b>
            </article>
          ))}
        </div>
      </section>

      <section className="slide" id="evidence">
        <SlideHeader
          eyebrow="3. Evidence and QA"
          title="Why Judges Can Trust This"
          subtitle="Each claim is tied to source tiering, reproducible artifacts, and quality gates."
        />

        <div className="deck-grid two">
          <article className="deck-card">
            <h3>Evidence Tiers</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Tier</th>
                    <th>Meaning</th>
                    <th>Examples In This Case</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceRows.map((row) => (
                    <tr key={row.tier}>
                      <td>{row.tier}</td>
                      <td>{row.meaning}</td>
                      <td>{row.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="deck-card">
            <h3>Validation Signals</h3>
            <ul className="qa-list">
              {qaChecks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
            <p className="support-note">
              External plausibility reference included: McCormick Place sustainability documentation.
            </p>
          </article>
        </div>
      </section>

      <section className="slide" id="results">
        <SlideHeader
          eyebrow="4. Results"
          title="Outcome: V3+P2 Beats Baseline Across Core Metrics"
          subtitle="Baseline is V1+P1. Negative deltas indicate improvement."
        />

        <div className="result-grid">
          <article className="result-card">
            <small>Total CO2e</small>
            <h3>{fmtSigned(co2Delta)} kg</h3>
            <p>{fmtSignedPct(pct(co2Delta, baseline.co2e_total_kg))} vs baseline</p>
          </article>
          <article className="result-card">
            <small>Total Cost</small>
            <h3>{fmtSigned(costDelta)} USD</h3>
            <p>{fmtSignedPct(pct(costDelta, baseline.cost_total_usd))} vs baseline</p>
          </article>
          <article className="result-card">
            <small>Average Travel Time</small>
            <h3>{fmtSigned(travelDelta)} min</h3>
            <p>{fmtSignedPct(pct(travelDelta, baseline.avg_travel_time_min))} vs baseline</p>
          </article>
          <article className="result-card">
            <small>Landfill</small>
            <h3>{fmtSigned(landfillDelta)} kg</h3>
            <p>{fmtSignedPct(pct(landfillDelta, baseline.landfill_kg))} vs baseline</p>
          </article>
          <article className="result-card">
            <small>Water Stress Adjusted Use</small>
            <h3>{fmtSigned(waterDelta)} L</h3>
            <p>{fmtSignedPct(pct(waterDelta, baseline.water_stress_adjusted_l))} vs baseline</p>
          </article>
          <article className="result-card emphasis">
            <small>Final Recommendation</small>
            <h3>{winner.scenario_id}</h3>
            <p>Feasible, lower-impact, and robust under uncertainty.</p>
          </article>
        </div>
      </section>

      <section className="slide" id="landscape">
        <SlideHeader
          eyebrow="5. Scenario Landscape"
          title="How The Winner Compares Against Every Alternative"
        />

        <div className="deck-grid two">
          <MetricBars
            title="Total CO2e by Scenario"
            field="co2e_total_kg"
            formatter={(v) => `${fmtNum(v)} kg`}
            color="linear-gradient(90deg, #de7b3f, #be3e1f)"
          />
          <MetricBars
            title="Total Cost by Scenario"
            field="cost_total_usd"
            formatter={(v) => `$${fmtNum(v)}`}
            color="linear-gradient(90deg, #4b8bb6, #245777)"
          />
          <MetricBars
            title="Average Travel Time by Scenario"
            field="avg_travel_time_min"
            formatter={(v) => `${fmtNum(v)} min`}
            color="linear-gradient(90deg, #64a083, #3a6f53)"
          />
          <ModeStack />
        </div>
      </section>

      <section className="slide">
        <SlideHeader
          eyebrow="6. Full Comparison"
          title="Scenario Metrics Table"
          subtitle="Sorted by total CO2e to show the environmental frontier quickly."
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
        AVDS deployable presentation dashboard. Structured for judges: problem, method, evidence, decision, and outcomes.
      </footer>
    </main>
  );
}
