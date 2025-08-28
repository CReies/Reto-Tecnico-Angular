import { Injectable, signal } from '@angular/core';
import { GetAllProductsResponseMapper } from '../../../mappers/api/response/products/get-all-products-response.mapper';
import { IGetAllProductsResponse } from '../../../models/api/response/products/IGetAllProductsResponse.model';
import { HttpService } from '../../generals/http.service';
import { URL_RESOURCES } from '../../../resources/url.resources';

@Injectable({
  providedIn: 'root'
})
export class GetAllProductsService {
  private productsSignal = signal<IGetAllProductsResponse | null>(null);

  constructor(
    private readonly http: HttpService,
    private readonly resMapper: GetAllProductsResponseMapper
  ) { }

  get products() {
    return this.productsSignal.asReadonly();
  }

  get loading() {
    return this.http.loading;
  }

  get error() {
    return this.http.error;
  }

  async exec(): Promise<void> {
    try {
      const url = URL_RESOURCES.products.getAll;
      const response = await this.http.get<any>(url);
      const mappedResponse = this.resMapper.map(response);
      this.productsSignal.set(mappedResponse);
    } catch (error) {
      this.productsSignal.set(null);
      throw error;
    }
  }
}
