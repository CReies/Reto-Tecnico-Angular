import { signalStore } from "@ngrx/signals";
import { withDeleteProductModalState } from "./delete-product-modal-initial-state";
import { withDeleteProductModalMethods } from "./delete-product-modal.methods";

export const DeleteProductModalStore = signalStore(
	{ providedIn: 'root' },
	withDeleteProductModalState,
	withDeleteProductModalMethods
);
