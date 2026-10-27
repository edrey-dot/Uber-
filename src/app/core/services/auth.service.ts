import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  User,
  UserRole,
  LoginRequest,
  RegisterClientRequest,
  RegisterDriverRequest,
  AuthResponse,
  MeResponse,
  GenericResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signals reactivas para el estado del usuario y token
  private currentUserSignal = signal<User | null>(this.getStoredUser());
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));

  // Propiedades públicas computadas para componentes
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => !!this.tokenSignal());
  public userRole = computed(() => this.currentUserSignal()?.role || null);

  constructor() {}

  /**
   * Inicia sesión con correo electrónico o teléfono y contraseña
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.access_token) {
          this.saveSession(res.access_token, res.user);
        }
      })
    );
  }

  /**
   * Registra a un nuevo usuario con rol de cliente
   */
  registerClient(data: RegisterClientRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {
        if (res.success && res.access_token) {
          this.saveSession(res.access_token, res.user);
        }
      })
    );
  }

  /**
   * Registra a un nuevo usuario con rol de conductor (incluye vehículo y licencia)
   */
  registerDriver(data: RegisterDriverRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap((res) => {
        if (res.success && res.access_token) {
          this.saveSession(res.access_token, res.user);
        }
      })
    );
  }

  /**
   * Obtiene la información del usuario autenticado actual desde la API
   */
  getMe(): Observable<MeResponse> {
    return this.http.get<MeResponse>(`${this.apiUrl}/me`).pipe(
      tap((res) => {
        if (res.success && res.user) {
          this.currentUserSignal.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  /**
   * Cierra sesión invalidando el token en el servidor y limpiando los datos locales
   */
  logout(): void {
    // Intentamos notificar al servidor para invalidar el token
    this.http.post<GenericResponse>(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => this.clearSessionAndRedirect(),
      error: () => this.clearSessionAndRedirect(), // Si falla la red, cerramos localmente de todos modos
    });
  }

  /**
   * Guarda el token y el usuario en el navegador
   */
  private saveSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
  }

  /**
   * Limpia datos locales y redirige a la pantalla de login
   */
  public clearSessionAndRedirect(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  /**
   * Lee el usuario previamente guardado en localStorage
   */
  private getStoredUser(): User | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  public getToken(): string | null {
    return this.tokenSignal();
  }

  public getUser(): User | null {
    return this.currentUserSignal();
  }
}
