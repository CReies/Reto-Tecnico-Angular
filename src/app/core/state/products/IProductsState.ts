import { IProduct } from "../../models/shared/IProduct.model";

export interface IProductsState {
	products: IProduct[];
	searchTerm: string;
	loading: boolean;
	error: string | null;
}
