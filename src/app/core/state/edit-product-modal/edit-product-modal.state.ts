import { IEditProductModalState } from "./IEditProductModalState";

export const editProductModalInitialState: IEditProductModalState = {
	visible: false,
	product: null,
	loading: false,
	error: null
};
