import { SignalStoreFeature, patchState, withMethods } from "@ngrx/signals";
import { IProduct } from "../../models/shared/IProduct.model";
import { IAddProductModalState } from "./IAddProductModalState";

export const withAddProductModalMethods: SignalStoreFeature = withMethods((store) => {
	return {
		showModal(): void {
			patchState(store, { visible: true });
		},

		hideModal(): void {
			patchState(store, { visible: false });
		},

		setProduct(product: IProduct | null): void {
			patchState(store, { product });
		},

		resetState(): void {
			patchState(store, {
				visible: false,
				product: null
			});
		}
	};
});
