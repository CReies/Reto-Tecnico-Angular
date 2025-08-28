import { inject } from '@angular/core';
import { SignalStoreFeature, patchState, withMethods } from "@ngrx/signals";
import { IProduct } from "../../models/shared/IProduct.model";
import { IProductsState } from "./IProductsState";
import { GetAllProductsService } from "../../services/api/products/get-all-products.service";
import { UpdateProductService } from "../../services/api/products/update-product.service";
import { DeleteProductService } from "../../services/api/products/delete-product.service";

export const withProductsMethods: SignalStoreFeature = withMethods((store) => {
  const getAllProductsService = inject(GetAllProductsService);
  const updateProductService = inject(UpdateProductService);
  const deleteProductService = inject(DeleteProductService);

  return {
    async loadProducts(): Promise<void> {
      try {
        patchState(store, { loading: true, error: null });

        await getAllProductsService.exec();
        const response = getAllProductsService.products();

        if (response) {
          this.setProducts(response.data);
        }
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Error loading products');
      }
      finally {
        this.setLoading(false);
      }
    },

    setProducts(products: IProduct[]): void {
      patchState(store, () => ({ products }));
    },

    setSearchTerm(searchTerm: string): void {
      patchState(store, { searchTerm });
    },

    addProduct(product: IProduct): void {
      patchState(store,
        (state: IProductsState) => ({
          products: [...state.products, product]
        })
      );
    },

    updateProduct(productId: string, updatedProduct: IProduct): void {
      patchState(store,
        (state: IProductsState) => ({
          products: state.products.map(product =>
            product.id === productId ? updatedProduct : product
          )
        })
      );
    },

    removeProduct(productId: string): void {
      patchState(store,
        (state: IProductsState) => ({
          products: state.products.filter(product => product.id !== productId)
        })
      );
    },

    setLoading(isLoading: boolean): void {
      patchState(store, { loading: isLoading });
    },

    setError(error: string | null): void {
      patchState(store, { error });
    },

    async updateProductAsync(productId: string, product: IProduct): Promise<void> {
      try {
        patchState(store, { loading: true, error: null });

        const updatedProduct = await new Promise<IProduct>((resolve, reject) => {
          updateProductService.updateProduct(productId, product).subscribe({
            next: (result) => resolve(result),
            error: (error) => reject(error)
          });
        });

        this.updateProduct(productId, updatedProduct);
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Error updating product');
        throw error;
      } finally {
        this.setLoading(false);
      }
    },

    async deleteProductAsync(productId: string): Promise<void> {
      try {
        patchState(store, { loading: true, error: null });

        await new Promise<string>((resolve, reject) => {
          deleteProductService.deleteProduct(productId).subscribe({
            next: (result) => resolve(result),
            error: (error) => reject(error)
          });
        });

        this.removeProduct(productId);
      } catch (error) {
        this.setError(error instanceof Error ? error.message : 'Error deleting product');
        throw error;
      } finally {
        this.setLoading(false);
      }
    }
  };
});
