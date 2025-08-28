import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {
  extract(error: HttpErrorResponse): HttpErrorResponse {
    alert(error.error[0].errorMessage);
    return {
      error,
    } as HttpErrorResponse;
  }
}
