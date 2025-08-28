import { IProduct } from '../../../shared/IProduct.model';

export interface IAddProductResponse {
	message: string;
	data: IProduct;
}
