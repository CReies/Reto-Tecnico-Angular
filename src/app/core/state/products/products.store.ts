import { signalStore } from "@ngrx/signals";
import { withProductState } from "./products-initial-state";
import { withProductsComputed } from "./products.computed";
import { withProductsMethods } from "./products.methods";

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withProductState,
  withProductsComputed,
  withProductsMethods
);
