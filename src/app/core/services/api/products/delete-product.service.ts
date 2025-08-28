import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { IDeleteProductResponse } from '../../../models/api/response/products/IDeleteProductResponse.model';
import { URL_RESOURCES } from '../../../resources/url.resources';
import { ErrorsService } from '../../generals/errors.service';
import { HttpService } from '../../generals/http.service';

@Injectable({
  providedIn: 'root'
})
export class DeleteProductService {
  private httpService = inject(HttpService);
  private errorsService = inject(ErrorsService);

  deleteProduct(id: string): Observable<string> {
    const deleteUrl = URL_RESOURCES.products.delete.replace('{id}', id);

    return from(this.httpService.delete<IDeleteProductResponse>(deleteUrl)).pipe(
      map(response => response.message),
      catchError(error => {
        throw error;
      })
    );
  }
}
