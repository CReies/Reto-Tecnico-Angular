import { IProduct } from '../../../../models/shared/IProduct.model';
import { IUpdateProductRequest } from '../../../../models/api/request/products/IUpdateProductRequest.model';

export class UpdateProductRequestMapper {
	static fromProduct(product: IProduct): IUpdateProductRequest {
		return {
			name: product.name,
			description: product.description,
			logo: product.logo,
			date_release: product.date_released.toISOString().split('T')[0],
			date_revision: product.date_revision.toISOString().split('T')[0]
		};
	}
}
