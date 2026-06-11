import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LedgerApiService } from './ledger-api.service';
import { AccountRow, MonthRow } from './ledger.models';
import { DICT, Lang } from './i18n';

interface Bar { x: number; y: number; w: number; h: number; cls: string; }
interface Group { label: string; bars: Bar[]; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="wrap">
      <header class="head">
        <div>
          <p class="eyebrow">{{ t().eyebrow }}</p>
          <h1>{{ tenant() || '—' }}</h1>
        </div>
        <div class="head-right">
          <div class="lang" role="group" aria-label="Language">
            <button [class.on]="lang() === 'en'" (click)="lang.set('en')">EN</button>
            <button [class.on]="lang() === 'et'" (click)="lang.set('et')">ET</button>
          </div>
          <p class="src">{{ t().source }}</p>
        </div>
      </header>

      @if (loading()) {
        <p class="muted">{{ t().loading }}</p>
      } @else {
        <section class="kpis">
          <div class="kpi">
            <span class="kpi-label">{{ t().kpiRevenue }}</span>
            <span class="kpi-val pos">{{ fmt(totals().revenue) }}</span>
          </div>
          <div class="kpi">
            <span class="kpi-label">{{ t().kpiProfit }}</span>
            <span class="kpi-val">{{ fmt(totals().profit) }}</span>
          </div>
          <div class="kpi">
            <span class="kpi-label">{{ t().kpiCashflow }}</span>
            <span class="kpi-val" [class.pos]="totals().cashflow >= 0" [class.neg]="totals().cashflow < 0">
              {{ fmt(totals().cashflow) }}
            </span>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <h2>{{ t().monthlyTitle }}</h2>
            <div class="legend">
              <span><i class="sw rev"></i>{{ t().legendRevenue }}</span>
              <span><i class="sw exp"></i>{{ t().legendExpenses }}</span>
              <span><i class="sw prof"></i>{{ t().legendProfit }}</span>
            </div>
          </div>
          <svg [attr.viewBox]="'0 0 ' + chartW() + ' 180'" class="chart" role="img">
            <line class="axis" x1="8" y1="156" [attr.x2]="chartW() - 8" y2="156" />
            @for (g of chart(); track g.label) {
              @for (b of g.bars; track b.x) {
                <rect [attr.x]="b.x" [attr.y]="b.y" [attr.width]="b.w" [attr.height]="b.h"
                      [attr.class]="'bar ' + b.cls" rx="1.5" />
              }
              <text [attr.x]="g.bars[0].x + 33" y="172" class="xlabel">{{ g.label }}</text>
            }
          </svg>
        </section>

        <section class="panel">
          <div class="panel-head"><h2>{{ t().accountsTitle }}</h2></div>
          <table class="ledger">
            <thead>
              <tr>
                <th>{{ t().colCode }}</th><th>{{ t().colName }}</th><th>{{ t().colType }}</th>
                <th class="num">{{ t().colDebit }}</th><th class="num">{{ t().colCredit }}</th>
                <th class="num">{{ t().colBalance }}</th>
              </tr>
            </thead>
            <tbody>
              @for (a of accounts(); track a.code) {
                <tr>
                  <td class="code">{{ a.code }}</td>
                  <td>{{ a.name }}</td>
                  <td><span class="tag" [attr.data-t]="a.type">{{ a.type }}</span></td>
                  <td class="num">{{ fmt(a.debit) }}</td>
                  <td class="num">{{ fmt(a.credit) }}</td>
                  <td class="num" [class.pos]="a.net > 0" [class.neg]="a.net < 0">{{ fmt(a.net) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </section>

        <section class="panel ask">
          <div class="panel-head"><h2>{{ t().askTitle }}</h2></div>
          <div class="ask-row">
            <span class="prompt">&gt;</span>
            <input [(ngModel)]="q" (keyup.enter)="ask()"
                   [placeholder]="t().askPlaceholder" [disabled]="asking()" />
            <button (click)="ask()" [disabled]="asking() || !q.trim()">
              {{ asking() ? '…' : t().askButton }}
            </button>
          </div>
          @if (answer()) {
            <p class="answer">{{ answer() }}</p>
          }
          <p class="hint">{{ t().askHint }}</p>
        </section>
      }
    </div>
  `,
  styles: [`
    :host {
      --paper: #f6f7f9; --ink: #11202e; --muted: #6b7a88; --line: #dfe4ea;
      --rev: #0e7c86; --exp: #c2683a; --prof: #11202e; --pos: #0e7c86; --neg: #b4472a;
      --mono: ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace;
      display: block; background: var(--paper); color: var(--ink);
      font-family: 'Inter', system-ui, sans-serif; min-height: 100vh;
    }
    .wrap { max-width: 1040px; margin: 0 auto; padding: 40px 28px 80px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end;
            border-bottom: 2px solid var(--ink); padding-bottom: 16px; }
    .head-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
    .lang { display: inline-flex; border: 1px solid var(--line); border-radius: 4px; overflow: hidden; }
    .lang button { border: 0; background: #fff; color: var(--muted); font-size: 12px;
                   padding: 4px 10px; cursor: pointer; font-family: var(--mono); }
    .lang button.on { background: var(--ink); color: #fff; }
    .eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase;
               color: var(--muted); margin: 0 0 6px; }
    h1 { font-size: 30px; margin: 0; letter-spacing: -.01em; }
    .src { font-family: var(--mono); font-size: 12px; color: var(--muted); margin: 0; }
    .muted { color: var(--muted); }
    h2 { font-size: 14px; text-transform: uppercase; letter-spacing: .08em; margin: 0; color: var(--muted); }

    .kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
            background: var(--line); border: 1px solid var(--line); margin: 28px 0; }
    .kpi { background: #fff; padding: 20px 22px; display: flex; flex-direction: column; gap: 8px; }
    .kpi-label { font-size: 12px; color: var(--muted); }
    .kpi-val { font-family: var(--mono); font-size: 26px; font-variant-numeric: tabular-nums; }

    .panel { background: #fff; border: 1px solid var(--line); padding: 22px; margin-bottom: 22px; }
    .panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .legend { display: flex; gap: 16px; font-size: 12px; color: var(--muted); }
    .legend span { display: inline-flex; align-items: center; gap: 6px; }
    .sw { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
    .sw.rev, i.rev { background: var(--rev); } .sw.exp, i.exp { background: var(--exp); }
    .sw.prof, i.prof { background: var(--prof); }

    .chart { width: 100%; height: auto; }
    .axis { stroke: var(--line); stroke-width: 1; }
    .bar.rev { fill: var(--rev); } .bar.exp { fill: var(--exp); } .bar.prof { fill: var(--prof); }
    .xlabel { font-family: var(--mono); font-size: 11px; fill: var(--muted); text-anchor: middle; }

    table.ledger { width: 100%; border-collapse: collapse; font-size: 13px; }
    .ledger th { text-align: left; font-weight: 600; color: var(--muted); font-size: 11px;
                 text-transform: uppercase; letter-spacing: .06em; padding: 8px 10px;
                 border-bottom: 1px solid var(--line); }
    .ledger td { padding: 9px 10px; border-bottom: 1px solid var(--line); }
    .ledger .code, .num { font-family: var(--mono); font-variant-numeric: tabular-nums; }
    .num { text-align: right; }
    .tag { font-size: 11px; padding: 2px 7px; border-radius: 3px; background: #eef1f4; color: var(--muted); }
    .tag[data-t="income"] { background: #e2f1f0; color: var(--rev); }
    .tag[data-t="expense"] { background: #f6e9e1; color: var(--exp); }
    .pos { color: var(--pos); } .neg { color: var(--neg); }

    .ask-row { display: flex; align-items: center; gap: 10px;
               border: 1px solid var(--ink); padding: 10px 14px; background: var(--paper); }
    .prompt { font-family: var(--mono); color: var(--rev); font-weight: 700; }
    .ask-row input { flex: 1; border: 0; background: transparent; font-size: 15px; color: var(--ink); outline: none; }
    .ask-row button { border: 0; background: var(--ink); color: #fff; padding: 8px 16px;
                      font-size: 13px; cursor: pointer; letter-spacing: .03em; }
    .ask-row button:disabled { opacity: .45; cursor: default; }
    .answer { font-size: 15px; line-height: 1.55; margin: 16px 2px 6px; }
    .hint { font-size: 12px; color: var(--muted); margin: 6px 2px 0; }

    @media (max-width: 720px) {
      .kpis { grid-template-columns: 1fr; }
      .head { flex-direction: column; align-items: flex-start; gap: 8px; }
      .head-right { align-items: flex-start; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private api = inject(LedgerApiService);

  lang = signal<Lang>('en');
  t = computed(() => DICT[this.lang()]);

  tenant = signal('');
  months = signal<MonthRow[]>([]);
  accounts = signal<AccountRow[]>([]);
  loading = signal(true);

  q = '';
  answer = signal('');
  asking = signal(false);

  totals = computed(() => {
    const m = this.months();
    const sum = (k: keyof MonthRow) => m.reduce((s, x) => s + (x[k] as number), 0);
    return { revenue: sum('revenue'), profit: sum('profit'), cashflow: sum('cashflow') };
  });

  private max = computed(() =>
    Math.max(1, ...this.months().flatMap(m => [m.revenue, m.expenses, Math.abs(m.profit)])));

  chartW = computed(() => Math.max(320, this.months().length * 96 + 24));

  chart = computed<Group[]>(() => {
    const max = this.max(), H = 132, top = 18, groupW = 96;
    return this.months().map((m, i) => {
      const gx = i * groupW + 20;
      const series = [{ v: m.revenue, cls: 'rev' }, { v: m.expenses, cls: 'exp' }, { v: m.profit, cls: 'prof' }];
      const bars = series.map((s, j) => {
        const h = Math.max(2, Math.round((Math.abs(s.v) / max) * H));
        return { x: gx + j * 22, y: top + (H - h), w: 18, h, cls: s.cls };
      });
      return { label: this.monthLabel(m.period), bars };
    });
  });

  ngOnInit(): void {
    this.api.summary().subscribe({
      next: s => { this.tenant.set(s.tenant); this.months.set(s.months);
                   this.accounts.set(s.accounts); this.loading.set(false); },
      error: () => { this.answer.set(''); this.loading.set(false); },
    });
  }

  ask(): void {
    const q = this.q.trim();
    if (!q || this.asking()) return;
    this.asking.set(true); this.answer.set('');
    this.api.ask(q).subscribe({
      next: r => { this.answer.set(r.answer); this.asking.set(false); },
      error: () => { this.answer.set(this.t().askError); this.asking.set(false); },
    });
  }

  fmt(n: number): string {
    return new Intl.NumberFormat(this.t().locale, { maximumFractionDigits: 0 }).format(n) + ' €';
  }

  private monthLabel(period: string): string {
    const mm = Number(period.slice(5, 7));
    return this.t().months[mm - 1] ?? period;
  }
}
