import { SignalStoreFeature, withState } from "@ngrx/signals";
import { IProductsState } from "./IProductsState";

const productsInitialState: IProductsState = {
	products: [],
	searchTerm: '',
	loading: false,
	error: null
};

export const withProductState: SignalStoreFeature = withState(productsInitialState);