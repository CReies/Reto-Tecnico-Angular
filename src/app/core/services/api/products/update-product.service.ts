import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { UpdateProductRequestMapper } from '../../../mappers/api/request/products/update-product-request.mapper';
import { UpdateProductResponseMapper } from '../../../mappers/api/response/products/update-product-response.mapper';
import { IUpdateProductRequest } from '../../../models/api/request/products/IUpdateProductRequest.model';
import { IUpdateProductResponse } from '../../../models/api/response/products/IUpdateProductResponse.model';
import { IProduct } from '../../../models/shared/IProduct.model';
import { URL_RESOURCES } from '../../../resources/url.resources';
import { HttpService } from '../../generals/http.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateProductService {
  private httpService = inject(HttpService);

  updateProduct(id: string, product: IProduct): Observable<IProduct> {
    const request: IUpdateProductRequest = UpdateProductRequestMapper.fromProduct(product);
    const updateUrl = URL_RESOURCES.products.update.replace('{id}', id);

    return from(this.httpService.put<IUpdateProductResponse>(updateUrl, JSON.stringify(request))).pipe(
      map(response => UpdateProductResponseMapper.toProduct(response, id)),
      catchError(error => {
        throw error;
      })
    );
  }
}
