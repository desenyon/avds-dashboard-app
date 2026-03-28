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

const problemStatement =
  "For a large Chicago event, organizers must choose one venue and one policy bundle that cut environmental impact without increasing attendee burden or violating hard operational limits.";

const processSteps = [
  {
    title: "Define The Decision Space",
    detail:
      "Lock case assumptions first: metro, event type, baseline, venues, policies, and data sources. This prevents hindsight tuning.",
  },
  {
    title: "Build Comparable Scenario Inputs",
    detail:
      "Generate OD accessibility, mode probabilities, venue energy, waste, water, and cost inputs with source provenance and QA checks.",
  },
  {
    title: "Apply Constraints Before Ranking",
    detail:
      "Drop scenarios that fail capacity, budget, ADA/accessibility, or travel thresholds so only feasible options remain.",
  },
  {
    title: "Choose Robust Winner",
    detail:
      "From feasible scenarios, select the option with strongest emissions-cost-travel tradeoff and stable rank under uncertainty.",
  },
];

const hardConstraints = [
  "Capacity",
  "Budget",
  "Accessibility threshold",
  "Average travel threshold",
  "P95 travel threshold",
  "Venue-policy compatibility",
];

const qaConfidence = [
  "14/14 QA checks passed",
  "OD pair coverage complete",
  "Mode probabilities sum to 1",
  "Policy emission monotonicity check passed",
];

function fmtNum(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function fmtPct(n: number) {
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}

function deltaPct(current: number, base: number) {
  return ((current - base) / base) * 100;
}

function DeltaCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  const good = value < 0;
  return (
    <article className="delta-card">
      <p>{label}</p>
      <h3 className={good ? "good" : "bad"}>{`${value >= 0 ? "+" : ""}${fmtNum(value)} ${unit}`}</h3>
    </article>
  );
}

function StoryCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="story-card">
      <h3>{title}</h3>
      <p>{text}</p>
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
    <section className="panel">
      <h2>{title}</h2>
      <div className="bars">
        {scenarios.map((s) => {
          const val = Number(s[field]);
          const width = `${(val / max) * 100}%`;
          return (
            <div className="bar-row" key={`${title}-${s.scenario_id}`}>
              <span>{s.scenario_id}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width, background: color }} />
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
    <section className="panel">
      <h2>Mode Share Composition</h2>
      <div className="bars">
        {scenarios.map((s) => (
          <div className="mode-row" key={`mode-${s.scenario_id}`}>
            <span>{s.scenario_id}</span>
            <div className="stack">
              <div style={{ width: `${s.mode_share_car * 100}%`, background: "#c75434" }} />
              <div style={{ width: `${s.mode_share_transit * 100}%`, background: "#1d7f68" }} />
              <div style={{ width: `${s.mode_share_shuttle * 100}%`, background: "#0f5a92" }} />
              <div style={{ width: `${s.mode_share_walkbike * 100}%`, background: "#e3b44c" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i style={{ background: "#c75434" }} /> Car</span>
        <span><i style={{ background: "#1d7f68" }} /> Transit</span>
        <span><i style={{ background: "#0f5a92" }} /> Shuttle</span>
        <span><i style={{ background: "#e3b44c" }} /> Walk/Bike</span>
      </div>
    </section>
  );
}

export default function Home() {
  const co2Delta = winner.co2e_total_kg - baseline.co2e_total_kg;
  const costDelta = winner.cost_total_usd - baseline.cost_total_usd;
  const travelDelta = winner.avg_travel_time_min - baseline.avg_travel_time_min;
  const landfillDelta = winner.landfill_kg - baseline.landfill_kg;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">AVDS Judge Dashboard</p>
        <h1>Metro Event Siting and Operations Optimizer</h1>
        <p className="subtitle">{problemStatement}</p>
        <div className="story-grid">
          <StoryCard
            title="The Problem"
            text="Event siting usually optimizes one metric at a time. That leads to hidden tradeoffs between emissions, cost, and attendee access."
          />
          <StoryCard
            title="How We Fix It"
            text="AVDS scores every venue-policy combination under the same assumptions, enforces hard constraints, then selects the most robust feasible option."
          />
          <StoryCard
            title="Decision"
            text={`Recommended plan: ${winner.scenario_id}. Baseline comparison uses ${baseline.scenario_id} to quantify improvement.`}
          />
        </div>
        <div className="hero-kpis">
          <div><small>Recommended Plan</small><b>{winner.scenario_id}</b></div>
          <div><small>QA Gates Passed</small><b>14/14</b></div>
          <div><small>Feasible Scenarios</small><b>9</b></div>
          <div><small>Scope</small><b>3 venues x 3 policies</b></div>
        </div>
      </section>

      <section className="panel narrative">
        <h2>1) Problem Definition and Constraints</h2>
        <p className="intro-text">
          Objective: choose one scenario that lowers total impact while staying feasible for operations and attendee mobility.
          Every candidate must satisfy all constraints below before it can be ranked.
        </p>
        <div className="pill-grid">
          {hardConstraints.map((item) => (
            <span key={item} className="pill">{item}</span>
          ))}
        </div>
      </section>

      <section className="panel narrative">
        <h2>2) Process Used to Solve It</h2>
        <div className="process-grid">
          {processSteps.map((step, idx) => (
            <article className="process-card" key={step.title}>
              <p className="step-id">Step {idx + 1}</p>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel narrative">
        <h2>3) Why {winner.scenario_id} Is Recommended</h2>
        <div className="decision-grid">
          <article>
            <h3>Selection Logic</h3>
            <p>
              {winner.scenario_id} remains feasible and delivers the strongest combined reduction in emissions,
              travel burden, landfill, and cost relative to baseline.
            </p>
            <ul>
              <li>CO2e change: {fmtNum(co2Delta)} kg ({fmtPct(deltaPct(winner.co2e_total_kg, baseline.co2e_total_kg))})</li>
              <li>Cost change: {fmtNum(costDelta)} USD ({fmtPct(deltaPct(winner.cost_total_usd, baseline.cost_total_usd))})</li>
              <li>Avg travel change: {fmtNum(travelDelta)} min ({fmtPct(deltaPct(winner.avg_travel_time_min, baseline.avg_travel_time_min))})</li>
              <li>Landfill change: {fmtNum(landfillDelta)} kg ({fmtPct(deltaPct(winner.landfill_kg, baseline.landfill_kg))})</li>
            </ul>
          </article>
          <article>
            <h3>Judge Confidence</h3>
            <p>Decision confidence comes from reproducibility, validation, and consistency checks:</p>
            <ul>
              {qaConfidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="grid-4">
        <DeltaCard label="CO2e vs Baseline" value={co2Delta} unit="kg" />
        <DeltaCard label="Cost vs Baseline" value={costDelta} unit="USD" />
        <DeltaCard label="Avg Travel vs Baseline" value={travelDelta} unit="min" />
        <DeltaCard label="Landfill vs Baseline" value={landfillDelta} unit="kg" />
      </section>

      <section className="grid-2">
        <MetricBars title="Total CO2e by Scenario" field="co2e_total_kg" formatter={(v) => `${fmtNum(v)} kg`} color="linear-gradient(90deg, #d9793c, #c1481f)" />
        <MetricBars title="Total Cost by Scenario" field="cost_total_usd" formatter={(v) => `$${fmtNum(v)}`} color="linear-gradient(90deg, #3e7fb2, #1f4f78)" />
        <MetricBars title="Average Travel Time by Scenario" field="avg_travel_time_min" formatter={(v) => `${fmtNum(v)} min`} color="linear-gradient(90deg, #61a07e, #2f6d4c)" />
        <ModeStack />
      </section>

      <section className="panel">
        <h2>Scenario Table</h2>
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
      </section>

      <footer className="footer-note">
        Built with Next.js for presentation and deployment. Data from the AVDS optimization pipeline and QA-validated artifacts.
      </footer>
    </main>
  );
}
