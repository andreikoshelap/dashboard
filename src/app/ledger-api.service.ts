import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AskResponse, Summary } from './ledger.models';

@Injectable({ providedIn: 'root' })
export class LedgerApiService {
  private http = inject(HttpClient);

  summary(): Observable<Summary> {
    return this.http.get<Summary>('/api/summary');
  }

  ask(question: string): Observable<AskResponse> {
    return this.http.post<AskResponse>('/api/ask', { question });
  }
}
