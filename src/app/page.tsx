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

type DataSourceRow = {
  source: string;
  coverage: string;
  variables: string;
  role: string;
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

const venueLegend = [
  "V1: McCormick Place Lakeside",
  "V2: Navy Pier Grand Ballroom",
  "V3: UIC Forum",
];

const policyLegend = [
  "P1: Business-as-usual operations",
  "P2: Full low-impact bundle (transit incentive, shuttle, waste/energy upgrades)",
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
    coverage: "1 public benchmark",
    variables: "waste diversion plausibility reference",
    role: "sanity check against public sustainability outcomes",
  },
];

const qaChecks = [
  "14/14 QA checks passed",
  "OD pair coverage complete (45 expected, 45 observed)",
  "Mode probabilities reconcile to 1.0",
  "Transit viability flags are valid",
  "Policy emission monotonicity check passed",
];

const methodSteps = [
  {
    title: "Case Lock",
    detail: "Freeze event type, metro, date, venues, policy bundles, and baseline before simulation to prevent hindsight tuning.",
  },
  {
    title: "Scenario Enumeration",
    detail: "Generate all venue-policy combinations: 3 x 3 = 9 scenarios.",
  },
  {
    title: "Travel + Mode Modeling",
    detail: "Compute OD travel burden and mode shares under each scenario, then aggregate weighted attendee impacts.",
  },
  {
    title: "Impact Aggregation",
    detail: "Combine travel, venue energy, waste, water, and cost into comparable scenario-level metrics.",
  },
  {
    title: "Feasibility + Ranking",
    detail: "Filter by hard constraints first, then rank feasible scenarios on multi-objective performance and robustness.",
  },
];

const limitations = [
  "Single metro and single event type reduce immediate external generalization.",
  "Attendee behavior is modeled, not observed from ticket ZIP-code traces.",
  "Some physical operations estimates rely on proxy factors where direct meter data is unavailable.",
  "Transit and routing conditions are snapshot-based and can vary on event day.",
];

const futureWork = [
  "Integrate observed attendance origin data and post-event surveys for calibration.",
  "Ingest direct venue utility and waste hauler invoices to reduce proxy usage.",
  "Scale to additional metros, event types, and larger venue sets.",
  "Add interactive what-if controls for organizer-facing planning workflows.",
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
          title="EcoPlan-OR: Metro Event Siting and Operations Optimizer"
          subtitle="Chicago case: single-day indoor data science conference"
        />
        <div className="title-grid">
          <article className="deck-card">
            <h3>Team</h3>
            <p>AVDS</p>
            <p className="muted">Advanced Venue Decision System</p>
          </article>
          <article className="deck-card">
            <h3>Decision Context</h3>
            <p>Baseline: {baseline.scenario_id}</p>
            <p>Recommended: {winner.scenario_id}</p>
            <p>Scope: 3 venues x 3 policies</p>
          </article>
          <article className="deck-card">
            <h3>Submission Links</h3>
            <div className="link-stack">
              <a href="https://dashboard-app-beta-seven.vercel.app" target="_blank" rel="noopener noreferrer">Live Dashboard (Vercel)</a>
              <a href="https://github.com/desenyon/avds-dashboard-app" target="_blank" rel="noopener noreferrer">GitHub Repository</a>
            </div>
          </article>
        </div>
      </section>

      <section className="slide" id="s2">
        <SlideHeader
          num="2"
          title="The Problem"
          subtitle="Event sustainability decisions are often made too late, after venue lock-in creates avoidable impact."
        />
        <div className="deck-grid two">
          <article className="deck-card problem-card">
            <h3>Why This Matters</h3>
            <ul>
              <li>Venue and operations decisions determine travel emissions, waste outcomes, energy demand, and water burden.</li>
              <li>Optimizing a single metric can worsen another critical metric.</li>
              <li>Organizers need a feasible plan, not just a low-emissions hypothetical.</li>
            </ul>
          </article>
          <article className="deck-card stats-card">
            <h3>Case Facts</h3>
            <ul>
              <li>Metro: Chicago, IL</li>
              <li>Event: single-day indoor data science conference</li>
              <li>Date: 2026-06-20</li>
              <li>Attendance prior: 1,200 to 1,800</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="slide" id="s3">
        <SlideHeader
          num="3"
          title="Research Question"
          subtitle="Which venue-policy combination minimizes environmental impact while staying feasible on budget, capacity, accessibility, and travel burden?"
        />
        <div className="deck-grid two">
          <article className="deck-card">
            <h3>Formal Question</h3>
            <p>
              For a Chicago metro single-day indoor event, which scenario $s = (v, p)$ minimizes
              CO2e, landfill, and stress-adjusted water while satisfying hard feasibility constraints?
            </p>
            <p className="muted">
              Hypothesis: a transit-accessible venue with stronger operations policy will outperform business-as-usual baseline.
            </p>
          </article>
          <article className="deck-card">
            <h3>Scenario Legend</h3>
            <div className="legend-group">
              <p><b>Venue IDs</b></p>
              <ul>
                {venueLegend.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p><b>Policy IDs</b></p>
              <ul>
                {policyLegend.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="slide" id="s4">
        <SlideHeader
          num="4"
          title="Data Sources"
          subtitle="Public-data stack with explicit coverage and variable usage for each modeling role."
        />
        <article className="deck-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Observations/Coverage</th>
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
          subtitle="Feasibility-first, multi-objective workflow with scenario comparability and QA gates."
        />
        <div className="process-grid">
          {methodSteps.map((step) => (
            <article className="process-card" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
        <article className="deck-card equation-card">
          <h3>Optimization Framing</h3>
          <p>Minimize objective vector across feasible scenarios:</p>
          <code>min_s f(s) = [CO2e(s), Cost(s), AvgTravel(s), Landfill(s), WaterStressAdj(s)]</code>
          <p className="muted">subject to feasibility constraints: capacity, budget, ADA, avg travel, P95 travel, and venue-policy compatibility.</p>
        </article>
      </section>

      <section className="slide" id="s6">
        <SlideHeader
          num="6"
          title="Key Findings"
          subtitle="V3+P2 is the strongest robust feasible option among 9 evaluated scenarios."
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
            <p>All candidates passed hard constraints in this case lock</p>
          </article>
          <article className="result-card">
            <small>QA status</small>
            <h3>14 / 14</h3>
            <p>All QA gates passed</p>
          </article>
        </div>
        <article className="deck-card">
          <ul className="qa-list">
            {qaChecks.map((check) => <li key={check}>{check}</li>)}
          </ul>
        </article>
      </section>

      <section className="slide" id="s7">
        <SlideHeader
          num="7"
          title="Proposed Solution"
          subtitle="Deploy the optimizer workflow for pre-event planning and select V3+P2 for this locked case."
        />
        <div className="deck-grid two">
          <article className="deck-card">
            <h3>Recommended Plan</h3>
            <p>
              Choose <b>{winner.scenario_id}</b> for this event: it balances environmental gains, travel burden,
              and budget while maintaining feasibility.
            </p>
            <p className="muted">Organizer workflow: lock case inputs, run pipeline, inspect dashboard, publish decision memo.</p>
          </article>
          <article className="deck-card">
            <h3>Implementation Steps</h3>
            <ol className="ordered">
              <li>Freeze event assumptions and constraints.</li>
              <li>Run AVDS pipeline and QA checks.</li>
              <li>Review scenario frontier and robustness output.</li>
              <li>Select top feasible plan and communicate rationale.</li>
            </ol>
          </article>
        </div>
      </section>

      <section className="slide" id="s8">
        <SlideHeader
          num="8"
          title="Impact"
          subtitle="Baseline V1+P1 to recommended V3+P2 (absolute and relative improvements)."
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
            <small>Avg Travel Time</small>
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
            <p>Recommended plan improves all five headline metrics vs baseline.</p>
          </article>
        </div>
      </section>

      <section className="slide" id="s9">
        <SlideHeader
          num="9"
          title="Limitations"
          subtitle="Current constraints and modeling assumptions that affect transferability."
        />
        <article className="deck-card">
          <ul className="qa-list">
            {limitations.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>

      <section className="slide" id="s10">
        <SlideHeader
          num="10"
          title="Future Work"
          subtitle="Path to increase realism, scale, and deployment readiness."
        />
        <article className="deck-card">
          <ul className="qa-list">
            {futureWork.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </article>
      </section>

      <section className="slide" id="appendix">
        <SlideHeader
          num="Appendix"
          title="Scenario Landscape and Comparison Table"
          subtitle="Reference visuals for judges who want the complete frontier."
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

        <article className="deck-card" style={{ marginTop: 12 }}>
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
        AVDS rubric-aligned presentation site. Includes problem framing, methods, solution, impact, and reproducibility links.
      </footer>
    </main>
  );
}
