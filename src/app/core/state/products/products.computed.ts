import { computed, Signal } from '@angular/core';
import { SignalStoreFeature, withComputed } from "@ngrx/signals";
import { IProduct } from "../../models/shared/IProduct.model";

export const withProductsComputed: SignalStoreFeature = withComputed((store) => ({
  filteredProductsBySearchTerm: computed(() => {
    const products = (store['products'] as Signal<IProduct[]>)();
    const searchTerm = (store['searchTerm'] as Signal<string>)();
    const term = searchTerm.toLowerCase().trim();

    return products.filter((product: IProduct) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term)
    );
  })
}));
