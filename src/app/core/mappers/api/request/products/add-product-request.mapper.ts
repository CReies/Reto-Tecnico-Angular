import { Injectable } from '@angular/core';
import { IProduct } from '../../../../models/shared/IProduct.model';
import { IAddProductRequest } from '../../../../models/api/request/products/IAddProductRequest.model';

@Injectable({
  providedIn: 'root'
})
export class AddProductRequestMapper {
  map(product: IProduct): IAddProductRequest {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_release: product.date_released.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
      date_revision: product.date_revision.toISOString().split('T')[0]  // Convert Date to YYYY-MM-DD string
    };
  }
}
