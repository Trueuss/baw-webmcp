import Link from 'next/link';
import { InviteForm } from '@/components/brand/InviteForm';

export default function Home() {
  return (
    <main>
      {/* ============== HERO ============== */}
      <section className="hero">
        <div className="container-x">
          <div className="hero-grid">
            <div>
              <div className="eyebrow">v0.1 · private beta · WebMCP enabled</div>
              <h1>
                Black. White. <em>You.</em>
              </h1>
              <p className="hero-tag">
                BAW is a privacy-first AI stylist that lives entirely in your browser.
                Upload your wardrobe and a selfie, get a four-axis verdict, and let any
                agent collaborate with you through <em>document.modelContext</em>.
              </p>
              <div className="hero-cta">
                <Link href="/stylelab" className="btn btn-primary">
                  Start styling →
                </Link>
                <Link href="/stylist" className="btn btn-ghost">
                  Open the Pair Stylist
                </Link>
              </div>
              <div className="hero-meta">
                <span><span className="dot">●</span> 3,842 in beta waitlist</span>
                <span>SOC 2 · GDPR</span>
                <span>Beijing · Shanghai · NYC</span>
              </div>
            </div>
            <div className="hero-side">
              <div className="hero-side-text">
                <h3>look no. 042</h3>
                <p className="mono" style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  oversized blazer · cropped trouser · white leather sneaker
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== MARQUEE ============== */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          <span>Vogue</span><span>WWD</span><span>Hypebeast</span>
          <span>i-D</span><span>Dazed</span><span>System</span>
          <span>032c</span><span>Highsnobiety</span>
          <span><em>BAW</em></span>
          <span>Vogue</span><span>WWD</span><span>Hypebeast</span>
          <span>i-D</span><span>Dazed</span><span>System</span>
          <span>032c</span><span>Highsnobiety</span>
          <span><em>BAW</em></span>
        </div>
      </div>

      {/* ============== DEMO ============== */}
      <section className="section demo-wrap" id="demo">
        <div className="container-x">
          <div className="section-head">
            <span className="num">// 01</span>
            <h2>Two photos in. <em>One verdict out.</em></h2>
          </div>
          <p style={{ maxWidth: 640, color: 'var(--muted)', fontSize: 18, lineHeight: 1.6 }}>
            Drop a flatlay of your outfit and a mirror selfie. BAW scores silhouette,
            palette, texture and occasion fit in under four seconds — and never sends a
            single byte outside your device.
          </p>
          <div className="demo">
            <div className="demo-left">
              <h3>Try the demo</h3>
              <p className="mono" style={{ color: 'var(--muted)', fontSize: 12, marginTop: 8 }}>
                baw://stylist/local-session
              </p>
              <div className="demo-actions">
                <div className="demo-drop">
                  <div className="drop-icon">⌬</div>
                  <div className="drop-text">
                    <strong>Garment flatlay</strong>
                    <span>top · bottom · shoes</span>
                  </div>
                </div>
                <div className="demo-drop">
                  <div className="drop-icon">◉</div>
                  <div className="drop-text">
                    <strong>Today&rsquo;s selfie</strong>
                    <span>half-body or full-body</span>
                  </div>
                </div>
                <Link href="/stylelab" className="btn btn-primary" style={{ marginTop: 12 }}>
                  Analyze now →
                </Link>
                <p className="mono" style={{ color: 'var(--muted-2)', fontSize: 12 }}>
                  on-device · 0 uploads · model · baw-vl-1.3b · avg latency · 3.4s
                </p>
              </div>
            </div>
            <div className="demo-right">
              <div className="demo-result">
                <div className="result-head">
                  <h4>Outfit report — no. 001</h4>
                  <div className="overall">
                    8.6 <small>/10</small>
                  </div>
                </div>
                {[
                  { l: 'silhouette', v: 87 },
                  { l: 'palette', v: 92 },
                  { l: 'texture', v: 78 },
                  { l: 'occasion', v: 86 }
                ].map((row) => (
                  <div className="score-row" key={row.l}>
                    <span className="label">{row.l}</span>
                    <span className="bar"><i style={{ width: `${row.v}%` }} /></span>
                    <span className="num">{(row.v / 10).toFixed(1)}</span>
                  </div>
                ))}
                <div className="result-notes">
                  <p>
                    <strong>Silhouette.</strong> Overall X-shape — shoulder-to-hip
                    ratio near the golden 1:1.4. A belt would harden the waist.
                  </p>
                  <p>
                    <strong>Palette.</strong> ~95% greyscale with a 5% silver pop.
                    Textbook BAW — the eye has somewhere to land.
                  </p>
                  <p>
                    <strong>Next time.</strong> Same white shirt + black trouser,
                    try a black merino turtleneck as the inner layer.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PILLARS ============== */}
      <section className="section" id="how">
        <div className="container-x">
          <div className="section-head">
            <span className="num">// 02</span>
            <h2>Not just a score. <em>It knows why you dressed that way.</em></h2>
          </div>
          <div className="pillars">
            <div className="pillar">
              <div className="pp-num">[ 01 ]</div>
              <h3>Sees <em>silhouette</em> &amp; fabric</h3>
              <p>
                From shoulder drop to hem weight, from wool micron count to leather
                grain. BAW describes every inch of what you&rsquo;re wearing like a
                senior buyer would.
              </p>
              <div className="pp-meta">
                <span className="bar" /> silhouette · 92%
              </div>
            </div>
            <div className="pillar">
              <div className="pp-num">[ 02 ]</div>
              <h3>Reads <em>colour rhythm</em></h3>
              <p>
                A 120k street-style dataset taught BAW not just whether your
                outfit is black-and-white, but whether it&rsquo;s{' '}
                <em>advanced</em> black-and-white.
              </p>
              <div className="pp-meta">
                <span className="bar" /> tone curve · 12-step
              </div>
            </div>
            <div className="pillar">
              <div className="pp-num">[ 03 ]</div>
              <h3>Says the <em>occasion</em></h3>
              <p>
                The same white shirt gets a different verdict on a creative
                Monday and a banking Friday. BAW knows which room you&rsquo;re
                walking into.
              </p>
              <div className="pp-meta">
                <span className="bar" /> casual · smart · formal
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== PRIVACY ============== */}
      <section className="section privacy" id="privacy">
        <div className="container-x">
          <div className="section-head">
            <span className="num">// 03</span>
            <h2>Your wardrobe. Your face. <em>Only yours.</em></h2>
          </div>
          <div className="privacy-grid">
            <div>
              <p style={{ color: '#b4b4b4', fontSize: 18, lineHeight: 1.7, maxWidth: 460 }}>
                The default BAW model runs in your browser. We don&rsquo;t have a
                database to leak, because we never built one. Open DevTools and
                watch it not phone home.
              </p>
              <div className="privacy-callout">
                <div><span className="green">$</span> /usr/local/bin/baw trace --session current</div>
                <div style={{ paddingLeft: 12 }}>listening on wss://*.baw.app ...</div>
                <div style={{ paddingLeft: 12 }}>captured events:</div>
                <div style={{ paddingLeft: 24 }}>
                  outbound requests: <span className="green">0</span>
                </div>
                <div style={{ paddingLeft: 24 }}>
                  image bytes uploaded: <span className="green">0</span>
                </div>
                <div style={{ paddingLeft: 24 }}>
                  ✓ privacy score: <span className="green">A+</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <span className="green">$</span> baw model --info
                </div>
                <div style={{ paddingLeft: 12 }}>name: baw-vl-1.3b-q4</div>
                <div style={{ paddingLeft: 12 }}>runtime: WebGPU + WASM</div>
                <div style={{ paddingLeft: 12 }}>memory: 412 MB peak</div>
                <div style={{ paddingLeft: 12 }}>cold start: 1.8s · warm: 3.4s</div>
              </div>
            </div>
            <div className="privacy-points">
              <div className="pp">
                <div className="pp-num">/01 · on-device</div>
                <h4>Edge inference, not cloud</h4>
                <p>
                  A 1.3B-parameter vision model, quantised, fits on a modern phone
                  NPU. Decoding, understanding and scoring happen inside a
                  WebAssembly sandbox.
                </p>
              </div>
              <div className="pp">
                <div className="pp-num">/02 · zero retention</div>
                <h4>Close the tab. It&rsquo;s gone.</h4>
                <p>
                  No thumbnails, no embeddings, no "service improvement" copies. The
                  second the tab unloads, the vector store evaporates with it.
                </p>
              </div>
              <div className="pp">
                <div className="pp-num">/03 · verifiable</div>
                <h4>Open the DevTools. Count the requests.</h4>
                <p>
                  The BAW client is open source. If you find a single outbound
                  request, we&rsquo;ll send you a year of Studio for free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== RITUAL / STEPS ============== */}
      <section className="section" id="ritual">
        <div className="container-x">
          <div className="section-head">
            <span className="num">// 04</span>
            <h2>Three minutes a day. <em>Better than doomscrolling.</em></h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01 — Capture</div>
              <h3>Snap <em>today&rsquo;s you</em></h3>
              <p>
                One selfie. BAW reads your body shape, skin tone, hair and energy
                for the day. No account, no body measurements.
              </p>
              <div className="step-meta">
                <i /> step 01 · image captured
              </div>
            </div>
            <div className="step">
              <div className="step-num">02 — Understand</div>
              <h3>Let the model <em>see</em></h3>
              <p>
                The vision model understands clothes and people at the same time.
                Silhouette, palette, fabric, proportion, occasion — plus a
                one-line verdict.
              </p>
              <div className="step-meta">
                <i /> baw-vl-1.3b · thinking
              </div>
            </div>
            <div className="step">
              <div className="step-num">03 — Refine</div>
              <h3>Dress <em>better next time</em></h3>
              <p>
                Every score becomes part of your wardrobe diary: which pieces you
                over-wear, which combos you&rsquo;ve never tried, where the
                utilisation curve is climbing.
              </p>
              <div className="step-meta">
                <i /> wardrobe utilisation ↑ 38%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============== LOOKBOOK ============== */}
      <section className="section" id="lookbook">
        <div className="container-x">
          <div className="section-head">
            <span className="num">// 05</span>
            <h2>A style diary, <em>written in black &amp; white.</em></h2>
          </div>
          <div className="showcase-grid">
            {[
              { id: '042', name: 'oversized blazer · cropped trouser', score: '9.2', items: 'FLATLAY · 3 ITEMS' },
              { id: '017', name: 'white oxford · raw denim · chelsea', score: '8.8', items: 'BUSINESS-CASUAL' },
              { id: '009', name: 'turtleneck · trouser · white sneaker', score: '7.4', items: 'TOTAL WHITE' },
              { id: '028', name: 'stripe contrast blazer · black trouser', score: '9.0', items: 'EVENING' }
            ].map((look) => (
              <Link key={look.id} href="/lookbook" className="look">
                <div className="look-img" />
                <div className="look-meta">
                  <strong>look no. {look.id}</strong>
                  <div style={{ marginTop: 4, fontSize: 12, color: 'var(--muted)' }}>
                    {look.name}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <small>{look.items}</small>
                    <small style={{ color: 'var(--ink)' }}>{look.score}/10</small>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============== PRICING ============== */}
      <section className="section" id="pricing">
        <div className="container-x">
          <div className="section-head">
            <span className="num">// 06</span>
            <h2>Free to start. <em>Upgrade when you&rsquo;re hooked.</em></h2>
          </div>
          <div className="pricing-grid">
            <div className="plan">
              <div className="eyebrow">Free</div>
              <div className="plan-name">Local</div>
              <div className="plan-price">¥0 <small>/ month</small></div>
              <ul>
                <li>Local inference · no signup · core scoring</li>
                <li>5 outfit scores per day</li>
                <li>1.3B on-device vision model</li>
                <li>Basic silhouette / palette / occasion scores</li>
                <li>7-day outfit diary</li>
              </ul>
              <Link href="/stylelab" className="btn btn-ghost" style={{ marginTop: 'auto' }}>
                Get started →
              </Link>
            </div>
            <div className="plan featured">
              <div className="eyebrow">Studio · most loved</div>
              <div className="plan-name">Studio</div>
              <div className="plan-price">¥39 <small>/ month</small></div>
              <ul>
                <li>Unlimited outfit scores</li>
                <li>7B vision model in the cloud (login required)</li>
                <li>Multi-axis deep analysis · trend compare</li>
                <li>Permanent outfit diary</li>
                <li>Weekly wardrobe health report</li>
                <li>Style inspiration feed</li>
              </ul>
              <Link href="/stylelab" className="btn btn-accent" style={{ marginTop: 'auto' }}>
                Start free trial →
              </Link>
            </div>
            <div className="plan">
              <div className="eyebrow">Atelier</div>
              <div className="plan-name">Atelier</div>
              <div className="plan-price">Custom <small>/ by quote</small></div>
              <ul>
                <li>For buyers, stylists, brands</li>
                <li>Team workspaces · multi-client profiles</li>
                <li>Private model fine-tune on your SKU</li>
                <li>API &amp; Shopify integration</li>
                <li>Dedicated stylist partner</li>
                <li>Customer data stays on-prem</li>
              </ul>
              <Link href="/stylelab" className="btn btn-ghost" style={{ marginTop: 'auto' }}>
                Talk to us →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============== CTA STRIP ============== */}
      <section className="cta-strip">
        <div className="container-x">
          <h2>Ready when <em>you</em> are.</h2>
          <p style={{ color: 'var(--muted)', maxWidth: 540, margin: '20px auto 0' }}>
            BAW is in private beta. Drop your email and we&rsquo;ll send an invite
            within two weeks — plus a small zine on dressing with intention.
          </p>
          <form style={{ margin: '36px auto 0', maxWidth: 460, display: 'flex', gap: 8 }} action="#">
            <input type="email" placeholder="you@goodtaste.com" style={{ flex: 1, padding: '14px 18px', border: '1px solid var(--line-2)', borderRadius: 999, background: 'var(--paper)' }} />
            <button type="submit" className="btn btn-primary">Request invite →</button>
          </form>
          <small>no spam · unsubscribe any time · 3,842 on the list · 158 beta spots left</small>
        </div>
      </section>
    </main>
  );
}
