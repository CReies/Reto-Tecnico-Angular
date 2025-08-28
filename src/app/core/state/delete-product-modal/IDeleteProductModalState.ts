export interface IDeleteProductModalState {
	visible: boolean;
	productId: string | null;
	productName: string | null;
	loading: boolean;
	error: string | null;
}
