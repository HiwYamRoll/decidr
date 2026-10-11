import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  // Wheels API
  getWheels(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/wheels`);
  }

  getWheelById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/wheels/${id}`);
  }

  createWheel(wheelData: { title: string; category?: string; options: any[] }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/wheels`, wheelData, {
      headers: this.getHeaders()
    });
  }

  recordSpin(wheelId: number, resultLabel: string): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/wheels/${wheelId}/spin`,
      { result_label: resultLabel },
      { headers: this.getHeaders() }
    );
  }

  // Dilemma & AI Judge
  judgeDilemma(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/dilemmas/judge`, formData, {
      headers: this.getHeaders()
    });
  }

  getMyDilemmas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/dilemmas/my`, {
      headers: this.getHeaders()
    });
  }

  updateFeedback(id: number, feedback: 'proud' | 'regret'): Observable<any> {
    return this.http.put<any>(
      `${this.baseUrl}/dilemmas/${id}/feedback`,
      { feedback },
      { headers: this.getHeaders() }
    );
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dilemmas/stats`, {
      headers: this.getHeaders()
    });
  }
}
