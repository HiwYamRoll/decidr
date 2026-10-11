import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    const token = localStorage.getItem('decidr_token');
    const user = localStorage.getItem('decidr_user');
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (e) {
        this.logout();
      }
    }
  }

  register(userData: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, userData).pipe(
      tap(res => {
        if (res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  private setSession(token: string, user: any) {
    localStorage.setItem('decidr_token', token);
    localStorage.setItem('decidr_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
    localStorage.removeItem('decidr_token');
    localStorage.removeItem('decidr_user');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('decidr_token');
  }

  getToken(): string | null {
    return localStorage.getItem('decidr_token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
