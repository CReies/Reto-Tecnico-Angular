import { SignalStoreFeature, patchState, withMethods } from "@ngrx/signals";
import { IDeleteProductModalState } from "./IDeleteProductModalState";

export const withDeleteProductModalMethods: SignalStoreFeature = withMethods((store) => ({

	// Show modal with product information
	showModal(productId: string, productName: string): void {
		patchState(store, {
			visible: true,
			productId,
			productName,
			loading: false,
			error: null
		});
	},

	// Hide modal and reset state
	hideModal(): void {
		patchState(store, {
			visible: false,
			productId: null,
			productName: null,
			loading: false,
			error: null
		});
	},

	// Set loading state
	setLoading(loading: boolean): void {
		patchState(store, { loading });
	},

	// Set error state
	setError(error: string | null): void {
		patchState(store, { error });
	},

	// Reset all state to initial values
	resetState(): void {
		patchState(store, {
			visible: false,
			productId: null,
			productName: null,
			loading: false,
			error: null
		});
	}
}));
