import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { ProductsToTableMapper } from "../../core/mappers/shared/products-to-table.mapper";
import { IProduct } from "../../core/models/shared/IProduct.model";
import { ITableData } from "../../core/models/shared/ITableData";
import { ProductsStore } from "../../core/state/products/products.store";
import { AddProductModalStore } from "../../core/state/add-product-modal/add-product-modal.store";
import { DeleteProductModalStore } from "../../core/state/delete-product-modal/delete-product-modal.store";
import { EditProductModalStore } from "../../core/state/edit-product-modal/edit-product-modal.store";
import { AddProductService } from "../../core/services/api/products/add-product.service";
import { GetAllProductsService } from "../../core/services/api/products/get-all-products.service";
import { VerifyProductIdService } from "../../core/services/api/products/verify-product-id.service";

@Injectable()
export class HomePageContainerFacade {
  private readonly productsStore = inject(ProductsStore);
  private readonly addProductModalStore = inject(AddProductModalStore);
  private readonly deleteProductModalStore = inject(DeleteProductModalStore);
  private readonly editProductModalStore = inject(EditProductModalStore);
  private readonly addProductService = inject(AddProductService);
  private readonly getAllProductsService = inject(GetAllProductsService);
  private readonly verifyProductIdService = inject(VerifyProductIdService);

  // Store Signals
  public readonly loading = computed(() => this.productsStore['loading']());
  public readonly error = computed(() => this.productsStore['error']());

  // Modal signals
  public readonly modalVisible = computed(() => this.addProductModalStore['visible']());

  // Edit modal signals
  public readonly editModalVisible = computed(() => this.editProductModalStore['visible']());
  public readonly editModalProduct = computed(() => this.editProductModalStore['product']());
  public readonly editModalLoading = computed(() => this.editProductModalStore['loading']());
  public readonly editModalError = computed(() => this.editProductModalStore['error']());

  // Delete modal signals
  public readonly deleteModalVisible = computed(() => this.deleteProductModalStore['visible']());
  public readonly deleteModalProductId = computed(() => this.deleteProductModalStore['productId']());
  public readonly deleteModalProductName = computed(() => this.deleteProductModalStore['productName']());
  public readonly deleteModalLoading = computed(() => this.deleteProductModalStore['loading']());
  public readonly deleteModalError = computed(() => this.deleteProductModalStore['error']());

  // Local signals
  public readonly searchTerm = signal('');

  constructor() {
    effect(() => {
      const term = this.searchTerm();
      this.productsStore['setSearchTerm'](term);
    });
  }

  public readonly tableData = computed<ITableData>(() => {
    const productsStoreKey = this.searchTerm() ? 'filteredProductsBySearchTerm' : 'products';

    const products = this.productsStore[productsStoreKey]() || [];
    return ProductsToTableMapper.mapToTable(products);
  });

  async loadProducts(): Promise<void> {
    try {
      await this.productsStore['loadProducts']();
    } catch (error) {
      throw error;
    }
  }

  updateSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  addProduct(product: IProduct): void {
    this.productsStore['addProduct'](product);
  }

  updateProduct(productId: string, product: IProduct): void {
    this.productsStore['updateProduct'](productId, product);
  }

  removeProduct(productId: string): void {
    this.productsStore['removeProduct'](productId);
  }

  // Modal methods
  showModal(): void {
    this.addProductModalStore['showModal']();
  }

  hideModal(): void {
    this.addProductModalStore['hideModal']();
  }

  resetModalState(): void {
    this.addProductModalStore['resetState']();
    this.addProductService.reset();
  }

  async submitProduct(product: IProduct): Promise<void> {
    try {
      // Validate product data
      if (!this.isValidProduct(product)) {
        console.log(product)
        throw new Error('Invalid product data');
      }

      this.addProductModalStore['setProduct'](product);
      await this.addProductService.exec(product);

      this.addProduct(product);

      await this.loadProducts();

      this.hideModal();
      this.resetModalState();

    } catch (error) {
      this.addProductService.reset();

      console.error('Error submitting product:', error);
      throw error;
    }
  }

  async validateProductId(id: string): Promise<boolean> {
    try {
      return await this.verifyProductIdService.exec(id);
    } catch (error) {
      console.error('Error validating product ID:', error);
      return false;
    }
  }

  findProductById(productId: string): IProduct | undefined {
    const products = this.productsStore['products']();
    return products.find((product: IProduct) => product.id === productId);
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.productsStore['deleteProductAsync'](productId);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateProductAsync(productId: string, product: IProduct): Promise<void> {
    try {
      await this.productsStore['updateProductAsync'](productId, product);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  private isValidProduct(product: IProduct): boolean {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Convert product dates to YYYY-MM-DD format for comparison
    const releaseDate = new Date(product.date_released).toISOString().split('T')[0];
    const revisionDate = new Date(product.date_revision).toISOString().split('T')[0];

    return !!(
      product &&
      product.id &&
      product.name &&
      product.description &&
      product.logo &&
      product.date_released &&
      product.date_revision &&
      product.id.length >= 3 &&
      product.id.length <= 10 &&
      product.name.length >= 5 &&
      product.name.length <= 100 &&
      product.description.length >= 10 &&
      product.description.length <= 200 &&
      releaseDate >= today &&
      revisionDate > releaseDate
    );
  }

  showDeleteModal(productId: string, productName: string): void {
    this.deleteProductModalStore['showModal'](productId, productName);
  }

  hideDeleteModal(): void {
    this.deleteProductModalStore['hideModal']();
  }

  resetDeleteModalState(): void {
    this.deleteProductModalStore['resetState']();
  }

  async confirmDeleteProduct(): Promise<void> {
    const productId = this.deleteModalProductId();
    if (!productId) {
      console.error('No product ID found for deletion');
      return;
    }

    try {
      this.deleteProductModalStore['setLoading'](true);
      this.deleteProductModalStore['setError'](null);

      await this.deleteProduct(productId);

      this.hideDeleteModal();

      await this.loadProducts();

    } catch (error) {
      console.error('Error deleting product:', error);
      this.deleteProductModalStore['setError'](
        error instanceof Error ? error.message : 'Error al eliminar el producto'
      );
    } finally {
      this.deleteProductModalStore['setLoading'](false);
    }
  }

  showEditModal(product: IProduct): void {
    this.editProductModalStore['showModal'](product);
  }

  hideEditModal(): void {
    this.editProductModalStore['hideModal']();
  }

  resetEditModalState(): void {
    this.editProductModalStore['resetState']();
  }

  async updateProductFromModal(product: IProduct): Promise<void> {
    const currentProduct = this.editModalProduct();
    if (!currentProduct) {
      console.error('No product found for update');
      return;
    }

    try {
      this.editProductModalStore['setLoading'](true);
      this.editProductModalStore['setError'](null);

      await this.updateProductAsync(currentProduct.id, product);

      this.hideEditModal();

      await this.loadProducts();

    } catch (error) {
      console.error('Error updating product:', error);
      this.editProductModalStore['setError'](
        error instanceof Error ? error.message : 'Error al actualizar el producto'
      );
    } finally {
      this.editProductModalStore['setLoading'](false);
    }
  }
}
