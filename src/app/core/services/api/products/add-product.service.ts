import { Injectable, signal } from '@angular/core';
import { IProduct } from '../../../models/shared/IProduct.model';
import { IAddProductResponse } from '../../../models/api/response/products/IAddProductResponse.model';
import { AddProductRequestMapper } from '../../../mappers/api/request/products/add-product-request.mapper';
import { AddProductResponseMapper } from '../../../mappers/api/response/products/add-product-response.mapper';
import { HttpService } from '../../generals/http.service';
import { URL_RESOURCES } from '../../../resources/url.resources';

@Injectable({
  providedIn: 'root'
})
export class AddProductService {
  private resultSignal = signal<IAddProductResponse | null>(null);

  constructor(
    private readonly http: HttpService,
    private readonly reqMapper: AddProductRequestMapper,
    private readonly resMapper: AddProductResponseMapper
  ) { }

  get result() {
    return this.resultSignal.asReadonly();
  }

  get loading() {
    return this.http.loading;
  }

  get error() {
    return this.http.error;
  }

  async exec(product: IProduct): Promise<void> {
    try {
      const url = URL_RESOURCES.products.create;
      const requestBody = this.reqMapper.map(product);
      const response = await this.http.post<any>(url, requestBody);
      const mappedResponse = this.resMapper.map(response);
      this.resultSignal.set(mappedResponse);
    } catch (error) {
      this.resultSignal.set(null);
      throw error;
    }
  }

  reset(): void {
    this.resultSignal.set(null);
  }
}
