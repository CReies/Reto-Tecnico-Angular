import { signalStore } from "@ngrx/signals";
import { withAddProductModalState } from "./add-product-modal-initial-state";
import { withAddProductModalMethods } from "./add-product-modal.methods";

export const AddProductModalStore = signalStore(
	{ providedIn: 'root' },
	withAddProductModalState,
	withAddProductModalMethods
);
