import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { AskResponse, Summary } from './ledger.models';

@Injectable({ providedIn: 'root' })
export class LedgerApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  summary(): Observable<Summary> {
    return this.http.get<Summary>(`${this.base}/summary`);
  }

  ask(question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.base}/ask`, { question });
  }
}
