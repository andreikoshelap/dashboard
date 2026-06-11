export type Lang = 'en' | 'et';

export interface Strings {
  eyebrow: string;
  source: string;
  loading: string;
  loadError: string;
  kpiRevenue: string;
  kpiProfit: string;
  kpiCashflow: string;
  monthlyTitle: string;
  legendRevenue: string;
  legendExpenses: string;
  legendProfit: string;
  accountsTitle: string;
  colCode: string;
  colName: string;
  colType: string;
  colDebit: string;
  colCredit: string;
  colBalance: string;
  askTitle: string;
  askPlaceholder: string;
  askButton: string;
  askError: string;
  askHint: string;
  months: string[]; // 12 short names, index 0 = January
  locale: string;   // Intl locale for number formatting
}

// Add a new language by adding one more entry here — no template changes.
export const DICT: Record<Lang, Strings> = {
  en: {
    eyebrow: 'general ledger · real-time',
    source: 'source: smartaccounts',
    loading: 'Loading the ledger…',
    loadError: 'Could not load the ledger. Is the backend running?',
    kpiRevenue: 'Revenue this quarter',
    kpiProfit: 'Profit',
    kpiCashflow: 'Cashflow',
    monthlyTitle: 'Monthly trend',
    legendRevenue: 'revenue',
    legendExpenses: 'expenses',
    legendProfit: 'profit',
    accountsTitle: 'Breakdown by account',
    colCode: 'Account',
    colName: 'Name',
    colType: 'Type',
    colDebit: 'Debit',
    colCredit: 'Credit',
    colBalance: 'Balance',
    askTitle: 'Ask the ledger',
    askPlaceholder: 'what was the cashflow in March 2026?',
    askButton: 'Ask',
    askError: 'Could not get an answer — check the backend is running (php artisan serve).',
    askHint: 'Figures are computed by Postgres through tools — the model never invents them.',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    locale: 'en-IE',
  },
  et: {
    eyebrow: 'pearaamat · reaalajas',
    source: 'allikas: smartaccounts',
    loading: 'Pearaamatu laadimine…',
    loadError: 'Pearaamatut ei õnnestunud laadida. Kas backend töötab?',
    kpiRevenue: 'Käive selles kvartalis',
    kpiProfit: 'Kasum',
    kpiCashflow: 'Rahavoog',
    monthlyTitle: 'Kuude dünaamika',
    legendRevenue: 'käive',
    legendExpenses: 'kulud',
    legendProfit: 'kasum',
    accountsTitle: 'Jaotus kontode kaupa',
    colCode: 'Konto',
    colName: 'Nimetus',
    colType: 'Tüüp',
    colDebit: 'Deebet',
    colCredit: 'Kreedit',
    colBalance: 'Saldo',
    askTitle: 'Küsi pearaamatult',
    askPlaceholder: 'milline oli rahavoog 2026. aasta märtsis?',
    askButton: 'Küsi',
    askError: 'Vastust ei saadud — kontrolli, kas backend töötab (php artisan serve).',
    askHint: 'Numbrid arvutab Postgres tööriistade kaudu — mudel neid ei väljamõtle.',
    months: ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets'],
    locale: 'et-EE',
  },
};
