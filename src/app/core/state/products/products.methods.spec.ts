import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withProductState } from './products-initial-state';
import { withProductsMethods } from './products.methods';
import { GetAllProductsService } from '../../services/api/products/get-all-products.service';
import { UpdateProductService } from '../../services/api/products/update-product.service';
import { DeleteProductService } from '../../services/api/products/delete-product.service';
import { HttpService } from '../../services/generals/http.service';
import { ErrorsService } from '../../services/generals/errors.service';
import { IProduct } from '../../models/shared/IProduct.model';
import { IGetAllProductsResponse } from '../../models/api/response/products/IGetAllProductsResponse.model';
import { IProductsStoreSignals, IProductsStoreMethods } from './IProductsStore.interface';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';

// Type for store with state and methods (without computed properties)
type MethodsTestStore = Pick<IProductsStoreSignals, 'products' | 'searchTerm' | 'loading' | 'error'> & IProductsStoreMethods;

describe('ProductsMethods', () => {
  let store: MethodsTestStore;
  let mockGetAllProductsService: jasmine.SpyObj<GetAllProductsService>;
  let mockUpdateProductService: jasmine.SpyObj<UpdateProductService>;
  let mockDeleteProductService: jasmine.SpyObj<DeleteProductService>;
  let mockProductsSignal: WritableSignal<IGetAllProductsResponse | null>;

  const mockProducts: IProduct[] = [
    {
      id: '1',
      name: 'Credit Card Premium',
      description: 'Premium credit card with exclusive benefits',
      logo: 'credit-card-premium.png',
      date_released: new Date('2023-01-01'),
      date_revision: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Savings Account Plus',
      description: 'High-yield savings account with competitive rates',
      logo: 'savings-account-plus.png',
      date_released: new Date('2023-02-01'),
      date_revision: new Date('2024-02-01')
    }
  ];

  beforeEach(() => {
    // Arrange
    mockProductsSignal = signal<IGetAllProductsResponse | null>(null);

    mockGetAllProductsService = jasmine.createSpyObj('GetAllProductsService', [
      'exec',
      'products'
    ]);

    mockUpdateProductService = jasmine.createSpyObj('UpdateProductService', ['updateProduct']);
    mockDeleteProductService = jasmine.createSpyObj('DeleteProductService', ['deleteProduct']);
    const mockHttpService = jasmine.createSpyObj('HttpService', ['get', 'post', 'put', 'delete']);
    const mockErrorsService = jasmine.createSpyObj('ErrorsService', ['extract']);
    const mockHttpClient = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    // Setup return values for services
    mockUpdateProductService.updateProduct.and.returnValue(of(mockProducts[0]));
    mockDeleteProductService.deleteProduct.and.returnValue(of('Product deleted successfully'));
    mockHttpClient.get.and.returnValue(of({}));
    mockHttpClient.post.and.returnValue(of({}));
    mockHttpClient.put.and.returnValue(of({}));
    mockHttpClient.delete.and.returnValue(of({}));

    Object.defineProperty(mockGetAllProductsService, 'products', {
      get: () => mockProductsSignal
    });

    const TestStore = signalStore(
      withProductState,
      withProductsMethods
    );

    TestBed.configureTestingModule({
      providers: [
        TestStore,
        { provide: GetAllProductsService, useValue: mockGetAllProductsService },
        { provide: UpdateProductService, useValue: mockUpdateProductService },
        { provide: DeleteProductService, useValue: mockDeleteProductService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ErrorsService, useValue: mockErrorsService },
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    store = TestBed.inject(TestStore) as unknown as MethodsTestStore;
  });

  describe('Product CRUD Operations', () => {
    describe('setProducts', () => {
      it('should set and replace products correctly', () => {
        // Arrange
        const initialProducts = [mockProducts[0]];
        const newProducts = [mockProducts[1]];

        // Act & Assert - Set initial products
        store.setProducts(initialProducts);
        expect(store.products()).toEqual(initialProducts);
        expect(store.products()).toHaveSize(1);

        // Act & Assert - Replace with new products
        store.setProducts(newProducts);
        expect(store.products()).toEqual(newProducts);
        expect(store.products()).toHaveSize(1);
        expect(store.products()).not.toContain(mockProducts[0]);

        // Act & Assert - Handle empty array
        store.setProducts([]);
        expect(store.products()).toEqual([]);
        expect(store.products()).toHaveSize(0);
      });
    });

    describe('addProduct', () => {
      it('should add products correctly maintaining immutability', () => {
        // Arrange - Start with empty store
        expect(store.products()).toHaveSize(0);

        // Act & Assert - Add first product
        store.addProduct(mockProducts[0]);
        expect(store.products()).toHaveSize(1);
        expect(store.products()[0]).toEqual(mockProducts[0]);

        // Act & Assert - Add second product
        const originalArray = store.products();
        store.addProduct(mockProducts[1]);
        const newArray = store.products();

        expect(newArray).toHaveSize(2);
        expect(newArray).not.toBe(originalArray); // Different references (immutability)
        expect(newArray).toContain(mockProducts[0]);
        expect(newArray).toContain(mockProducts[1]);
      });
    });

    describe('updateProduct', () => {
      beforeEach(() => {
        store.setProducts([mockProducts[0], mockProducts[1]]);
      });

      it('should update existing products and handle non-existing ones', () => {
        // Arrange
        const updatedProduct: IProduct = {
          ...mockProducts[0],
          name: 'Credit Card Premium Plus',
          description: 'Enhanced premium credit card with additional benefits'
        };
        const originalProducts = store.products();

        // Act & Assert - Update existing product
        store.updateProduct('1', updatedProduct);
        const products = store.products();

        expect(products).toHaveSize(2);
        expect(products[0]).toEqual(updatedProduct);
        expect(products[0].name).toBe('Credit Card Premium Plus');
        expect(products[1]).toEqual(mockProducts[1]); // unchanged
        expect(products).not.toBe(originalProducts); // Different reference (immutability)

        // Act & Assert - Try to update non-existing product
        const beforeUpdate = store.products();
        store.updateProduct('non-existing-id', updatedProduct);
        expect(store.products()).toEqual(beforeUpdate); // No change
      });
    });

    describe('removeProduct', () => {
      beforeEach(() => {
        store.setProducts([mockProducts[0], mockProducts[1]]);
      });

      it('should remove products correctly and handle non-existing ones', () => {
        // Arrange
        expect(store.products()).toHaveSize(2);
        const originalArray = store.products();

        // Act & Assert - Remove existing product
        store.removeProduct('1');
        const newArray = store.products();

        expect(newArray).toHaveSize(1);
        expect(newArray).not.toBe(originalArray); // Different reference (immutability)
        expect(newArray).toContain(mockProducts[1]);
        expect(newArray).not.toContain(mockProducts[0]);

        // Act & Assert - Try to remove non-existing product
        const beforeRemove = store.products();
        store.removeProduct('non-existing-id');
        expect(store.products()).toEqual(beforeRemove); // No change

        // Act & Assert - Remove last product
        store.removeProduct('2');
        expect(store.products()).toEqual([]);
        expect(store.products()).toHaveSize(0);
      });
    });
  });

  describe('State Management Methods', () => {
    describe('setSearchTerm', () => {
      it('should handle search term updates correctly', () => {
        // Act & Assert - Set search term
        store.setSearchTerm('test search');
        expect(store.searchTerm()).toBe('test search');

        // Act & Assert - Update search term
        store.setSearchTerm('updated search');
        expect(store.searchTerm()).toBe('updated search');

        // Act & Assert - Empty string
        store.setSearchTerm('');
        expect(store.searchTerm()).toBe('');

        // Act & Assert - Special characters
        store.setSearchTerm('search with áéíóú & symbols!');
        expect(store.searchTerm()).toBe('search with áéíóú & symbols!');
      });
    });

    describe('setLoading and setError', () => {
      it('should manage loading and error states independently', () => {
        // Act & Assert - Set loading
        store.setLoading(true);
        expect(store.loading()).toBe(true);

        store.setLoading(false);
        expect(store.loading()).toBe(false);

        // Act & Assert - Set error
        store.setError('Test error');
        expect(store.error()).toBe('Test error');

        store.setError(null);
        expect(store.error()).toBeNull();

        store.setError('');
        expect(store.error()).toBe('');

        // Act & Assert - Loading and error are independent
        store.setLoading(true);
        store.setError('Some error');
        expect(store.loading()).toBe(true);
        expect(store.error()).toBe('Some error');
      });
    });
  });

  describe('Async Operations', () => {
    describe('loadProducts', () => {
      it('should load products successfully with proper state management', async () => {
        // Arrange
        const mockResponse: IGetAllProductsResponse = { data: mockProducts };
        mockGetAllProductsService.exec.and.resolveTo();
        mockProductsSignal.set(mockResponse);

        // Act
        await store.loadProducts();

        // Assert
        expect(mockGetAllProductsService.exec).toHaveBeenCalled();
        expect(store.products()).toEqual(mockProducts);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
      });

      it('should handle loading errors with proper state management', async () => {
        // Arrange
        const errorMessage = 'Failed to load products';
        mockGetAllProductsService.exec.and.rejectWith(new Error(errorMessage));

        // Act
        await store.loadProducts();

        // Assert
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe(errorMessage);
        expect(store.products()).toEqual([]); // Should remain empty

        // Test non-Error object
        mockGetAllProductsService.exec.and.rejectWith('String error');
        await store.loadProducts();
        expect(store.error()).toBe('Error loading products');
      });

      it('should handle null response and clear previous errors', async () => {
        // Arrange - Set previous error
        store.setError('Previous error');
        mockGetAllProductsService.exec.and.resolveTo();
        mockProductsSignal.set(null);

        // Act
        await store.loadProducts();

        // Assert
        expect(store.loading()).toBe(false);
        expect(store.products()).toEqual([]);
        expect(store.error()).toBeNull();
      });
    });
  });

  describe('Async Product Operations', () => {
    beforeEach(() => {
      store.setProducts([mockProducts[0], mockProducts[1]]);
    });

    describe('updateProductAsync', () => {
      it('should update product successfully via API', async () => {
        // Arrange
        const productId = '1';
        const updatedProduct: IProduct = {
          ...mockProducts[0],
          name: 'Updated Premium Card',
          description: 'Updated description for premium card'
        };
        mockUpdateProductService.updateProduct.and.returnValue(of(updatedProduct));

        // Act
        await store.updateProductAsync(productId, updatedProduct);

        // Assert
        expect(mockUpdateProductService.updateProduct).toHaveBeenCalledWith(productId, updatedProduct);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe(null);

        // Verify product was updated in store
        const products = store.products();
        const updated = products.find(p => p.id === productId);
        expect(updated).toEqual(updatedProduct);
      });

      it('should handle update product API errors', async () => {
        // Arrange
        const productId = '1';
        const updatedProduct = { ...mockProducts[0], name: 'Updated' };
        const error = new Error('API Error');
        mockUpdateProductService.updateProduct.and.returnValue(throwError(() => error));

        // Act & Assert
        await expectAsync(store.updateProductAsync(productId, updatedProduct)).toBeRejected();

        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('API Error');
      });

      it('should handle non-Error objects in update product', async () => {
        // Arrange
        const productId = '1';
        const updatedProduct = { ...mockProducts[0], name: 'Updated' };
        const error = 'String error';
        mockUpdateProductService.updateProduct.and.returnValue(throwError(() => error));

        // Act & Assert
        await expectAsync(store.updateProductAsync(productId, updatedProduct)).toBeRejected();

        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Error updating product');
      });

      it('should set loading state during update operation', async () => {
        // Arrange
        const productId = '1';
        const updatedProduct = { ...mockProducts[0], name: 'Updated' };
        let loadingDuringOperation = false;

        mockUpdateProductService.updateProduct.and.callFake(() => {
          loadingDuringOperation = store.loading();
          return of(updatedProduct);
        });

        // Act
        await store.updateProductAsync(productId, updatedProduct);

        // Assert
        expect(loadingDuringOperation).toBe(true);
        expect(store.loading()).toBe(false);
      });
    });

    describe('deleteProductAsync', () => {
      it('should delete product successfully via API', async () => {
        // Arrange
        const productId = '1';
        const initialCount = store.products().length;
        mockDeleteProductService.deleteProduct.and.returnValue(of('Deleted successfully'));

        // Act
        await store.deleteProductAsync(productId);

        // Assert
        expect(mockDeleteProductService.deleteProduct).toHaveBeenCalledWith(productId);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe(null);

        // Verify product was removed from store
        const products = store.products();
        expect(products.length).toBe(initialCount - 1);
        expect(products.find(p => p.id === productId)).toBeUndefined();
      });

      it('should handle delete product API errors', async () => {
        // Arrange
        const productId = '1';
        const error = new Error('Delete API Error');
        mockDeleteProductService.deleteProduct.and.returnValue(throwError(() => error));

        // Act & Assert
        await expectAsync(store.deleteProductAsync(productId)).toBeRejected();

        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Delete API Error');

        // Verify product was not removed
        const products = store.products();
        expect(products.find(p => p.id === productId)).toBeDefined();
      });

      it('should handle non-Error objects in delete product', async () => {
        // Arrange
        const productId = '1';
        const error = 'Delete failed';
        mockDeleteProductService.deleteProduct.and.returnValue(throwError(() => error));

        // Act & Assert
        await expectAsync(store.deleteProductAsync(productId)).toBeRejected();

        expect(store.loading()).toBe(false);
        expect(store.error()).toBe('Error deleting product');
      });

      it('should set loading state during delete operation', async () => {
        // Arrange
        const productId = '1';
        let loadingDuringOperation = false;

        mockDeleteProductService.deleteProduct.and.callFake(() => {
          loadingDuringOperation = store.loading();
          return of('Deleted');
        });

        // Act
        await store.deleteProductAsync(productId);

        // Assert
        expect(loadingDuringOperation).toBe(true);
        expect(store.loading()).toBe(false);
      });

      it('should handle deleting non-existent product', async () => {
        // Arrange
        const nonExistentId = 'non-existent';
        mockDeleteProductService.deleteProduct.and.returnValue(of('Deleted'));

        // Act
        await store.deleteProductAsync(nonExistentId);

        // Assert
        expect(mockDeleteProductService.deleteProduct).toHaveBeenCalledWith(nonExistentId);
        expect(store.loading()).toBe(false);
        expect(store.error()).toBe(null);

        // Products should remain unchanged since ID doesn't exist
        const products = store.products();
        expect(products.length).toBe(2);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex multi-method operations maintaining consistency', () => {
      // Arrange
      const newProduct: IProduct = {
        id: '3',
        name: 'New Product',
        description: 'New Description',
        logo: 'new.png',
        date_released: new Date('2023-03-01'),
        date_revision: new Date('2024-03-01')
      };

      // Act - Complex sequence of operations
      store.setProducts([mockProducts[0]]);
      store.addProduct(mockProducts[1]);
      store.updateProduct('1', { ...mockProducts[0], name: 'Updated' });
      store.addProduct(newProduct);
      store.removeProduct('2');
      store.setSearchTerm('test search');
      store.setLoading(true);
      store.setError('test error');

      // Assert - Final state consistency
      const finalProducts = store.products();
      expect(finalProducts).toHaveSize(2);
      expect(finalProducts[0].name).toBe('Updated');
      expect(finalProducts[1]).toEqual(newProduct);
      expect(store.searchTerm()).toBe('test search');
      expect(store.loading()).toBe(true);
      expect(store.error()).toBe('test error');
    });
  });
});
