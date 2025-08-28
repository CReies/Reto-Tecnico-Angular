import { Signal } from '@angular/core';
import { IProduct } from '../../models/shared/IProduct.model';
import { IProductsState } from './IProductsState';

export interface IProductsStoreSignals {
  // State signals
  products: Signal<IProduct[]>;
  searchTerm: Signal<string>;
  loading: Signal<boolean>;
  error: Signal<string | null>;

  // Computed signals
  filteredProductsBySearchTerm: Signal<IProduct[]>;
}

export interface IProductsStoreMethods {
  // CRUD methods
  loadProducts(): Promise<void>;
  setProducts(products: IProduct[]): void;
  addProduct(product: IProduct): void;
  updateProduct(productId: string, updatedProduct: IProduct): void;
  removeProduct(productId: string): void;

  // Async API methods
  updateProductAsync(productId: string, product: IProduct): Promise<void>;
  deleteProductAsync(productId: string): Promise<void>;

  // State management methods
  setSearchTerm(searchTerm: string): void;
  setLoading(isLoading: boolean): void;
  setError(error: string | null): void;
}

export interface IProductsStore extends IProductsStoreSignals, IProductsStoreMethods { }
