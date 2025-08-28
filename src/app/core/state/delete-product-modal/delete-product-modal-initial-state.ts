import { withState } from "@ngrx/signals";
import { IDeleteProductModalState } from "./IDeleteProductModalState";

const initialState: IDeleteProductModalState = {
	visible: false,
	productId: null,
	productName: null,
	loading: false,
	error: null
};

export const withDeleteProductModalState = withState(initialState);
