# gatto dashboard (Angular)

Precision-ledger dashboard over the Slice 1–2 backend: monthly revenue/expenses/profit,
per-account breakdown, and a natural-language "ask the ledger" box wired to the agent.

## Run

```bash
# 1) fresh Angular app (standalone is the default in Angular 19+)
ng new gatto-dashboard --style=css --routing=false --skip-tests
cd gatto-dashboard
```

Copy these three into `src/app/` (they're version-agnostic):

```
src/app/dashboard.component.ts
src/app/ledger-api.service.ts
src/app/ledger.models.ts
```

Then wire two things in the project's generated files. Naming differs by Angular
version (`app.ts`/`App` in v20+, `app.component.ts`/`AppComponent` in v18–19) — edit
whichever your project has:

1. **Provide HttpClient** — in `src/app/app.config.ts`, ADD to the `providers` array
   (don't remove what's already there):
   ```ts
   import { provideHttpClient, withFetch } from '@angular/common/http';
   // providers: [ ...existing, provideHttpClient(withFetch()) ]
   ```

2. **Render the dashboard** — in the root component (`app.ts` or `app.component.ts`),
   import `DashboardComponent` and make its template just:
   ```ts
   import { DashboardComponent } from './dashboard.component';
   // @Component({ imports: [DashboardComponent], template: `<app-dashboard />` })
   ```
   (`app.component.ts` in this folder is a ready example for the classic naming.)

Run it:

```bash
# backend in another terminal (Laravel project):  php artisan serve   # :8000
ng serve --proxy-config proxy.conf.json                                # :4200
# open http://localhost:4200
```

The proxy forwards `/api/*` to Laravel on :8000 — no CORS config needed in dev.
For production, build the Angular app and serve it from Laravel's `public/` or a CDN
with a CORS policy allowing the frontend origin.

## Notes
- No charting library — the monthly chart is hand-rolled SVG (zero extra deps).
- All figures use tabular numerals; numbers come from the API, never the browser.
- The ask box posts to `/api/ask`; the first response takes a few seconds (LLM + tools).
- If `ng new` rejects `--routing=false`, just answer the prompt with "no".
