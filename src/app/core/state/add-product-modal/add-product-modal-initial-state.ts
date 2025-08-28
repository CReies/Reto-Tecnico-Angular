import { SignalStoreFeature, withState } from "@ngrx/signals";
import { IAddProductModalState } from "./IAddProductModalState";

const addProductModalInitialState: IAddProductModalState = {
	visible: false,
	product: null
};

export const withAddProductModalState: SignalStoreFeature = withState(addProductModalInitialState);
