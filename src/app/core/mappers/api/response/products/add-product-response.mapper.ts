import { Injectable } from '@angular/core';
import { IAddProductResponse } from '../../../../models/api/response/products/IAddProductResponse.model';
import { IProduct } from '../../../../models/shared/IProduct.model';

@Injectable({
	providedIn: 'root'
})
export class AddProductResponseMapper {
	map(response: any): IAddProductResponse {
		return {
			message: response.message,
			data: {
				id: response.data.id,
				name: response.data.name,
				description: response.data.description,
				logo: response.data.logo,
				date_released: new Date(response.data.date_release),
				date_revision: new Date(response.data.date_revision)
			}
		};
	}
}
