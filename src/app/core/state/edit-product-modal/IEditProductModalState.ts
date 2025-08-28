import { IProduct } from "../../models/shared/IProduct.model";

export interface IEditProductModalState {
	visible: boolean;
	product: IProduct | null;
	loading: boolean;
	error: string | null;
}
