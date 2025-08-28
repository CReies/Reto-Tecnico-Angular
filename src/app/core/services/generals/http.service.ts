import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, firstValueFrom, throwError } from 'rxjs';
import { ErrorsService } from './errors.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<any>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly errorService: ErrorsService,
  ) { }

  get loading() {
    return this.loadingSignal.asReadonly();
  }

  get error() {
    return this.errorSignal.asReadonly();
  }

  private get headers(): HttpHeaders {
    return new HttpHeaders()
      .append('Content-Type', 'application/json');
  }

  async get<T>(url: string): Promise<T> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http
          .get<T>(url, { headers: this.headers })
          .pipe(catchError((error) => this.handleError(error)))
      );
      return response;
    } catch (error) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async post<T>(url: string, body: any): Promise<T> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http
          .post<T>(url, body, { headers: this.headers })
          .pipe(catchError((error) => this.handleError(error)))
      );
      return response;
    } catch (error) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async put<T>(url: string, body: string): Promise<T> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http
          .put<T>(url, body, { headers: this.headers })
          .pipe(catchError((error) => this.handleError(error)))
      );
      return response;
    } catch (error) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async delete<T>(url: string): Promise<T> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    try {
      const response = await firstValueFrom(
        this.http
          .delete<T>(url, { headers: this.headers })
          .pipe(catchError((error) => this.handleError(error)))
      );
      return response;
    } catch (error) {
      this.errorSignal.set(error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => this.errorService.extract(error));
  }
}
