import { IProduct } from '../../../../models/shared/IProduct.model';
import { IUpdateProductResponse } from '../../../../models/api/response/products/IUpdateProductResponse.model';

export class UpdateProductResponseMapper {
	static toProduct(response: IUpdateProductResponse, id: string): IProduct {
		return {
			id: id,
			name: response.data.name,
			description: response.data.description,
			logo: response.data.logo,
			date_released: new Date(response.data.date_release),
			date_revision: new Date(response.data.date_revision)
		};
	}
}
