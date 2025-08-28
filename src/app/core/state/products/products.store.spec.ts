import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductsStore } from './products.store';
import { GetAllProductsService } from '../../services/api/products/get-all-products.service';
import { UpdateProductService } from '../../services/api/products/update-product.service';
import { DeleteProductService } from '../../services/api/products/delete-product.service';
import { HttpService } from '../../services/generals/http.service';
import { ErrorsService } from '../../services/generals/errors.service';
import { IProduct } from '../../models/shared/IProduct.model';
import { IGetAllProductsResponse } from '../../models/api/response/products/IGetAllProductsResponse.model';
import { IProductsStore } from './IProductsStore.interface';

describe('ProductsStore', () => {
  let store: IProductsStore;
  let mockGetAllProductsService: jasmine.SpyObj<GetAllProductsService>;
  let mockUpdateProductService: jasmine.SpyObj<UpdateProductService>;
  let mockDeleteProductService: jasmine.SpyObj<DeleteProductService>;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockErrorsService: jasmine.SpyObj<ErrorsService>;
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

    mockUpdateProductService = jasmine.createSpyObj('UpdateProductService', [
      'updateProduct'
    ]);

    mockDeleteProductService = jasmine.createSpyObj('DeleteProductService', [
      'deleteProduct'
    ]);

    mockHttpService = jasmine.createSpyObj('HttpService', [
      'get', 'post', 'put', 'delete'
    ]);

    mockErrorsService = jasmine.createSpyObj('ErrorsService', [
      'extract'
    ]);

    Object.defineProperty(mockGetAllProductsService, 'products', {
      get: () => mockProductsSignal
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductsStore,
        { provide: GetAllProductsService, useValue: mockGetAllProductsService },
        { provide: UpdateProductService, useValue: mockUpdateProductService },
        { provide: DeleteProductService, useValue: mockDeleteProductService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: ErrorsService, useValue: mockErrorsService }
      ]
    });

    store = TestBed.inject(ProductsStore) as unknown as IProductsStore;
  });

  describe('Store Creation and Structure', () => {
    it('should create complete store with all features', () => {
      // Assert
      expect(store).toBeTruthy();

      // Check signals exist
      expect(typeof store.products).toBe('function');
      expect(typeof store.searchTerm).toBe('function');
      expect(typeof store.loading).toBe('function');
      expect(typeof store.error).toBe('function');
      expect(typeof store.filteredProductsBySearchTerm).toBe('function');

      // Check methods exist
      expect(typeof store.loadProducts).toBe('function');
      expect(typeof store.setProducts).toBe('function');
      expect(typeof store.setSearchTerm).toBe('function');
      expect(typeof store.addProduct).toBe('function');
      expect(typeof store.updateProduct).toBe('function');
      expect(typeof store.removeProduct).toBe('function');
      expect(typeof store.setLoading).toBe('function');
      expect(typeof store.setError).toBe('function');
    });
  });

  describe('Store Integration', () => {
    it('should integrate state, computed, and methods correctly', () => {
      // Arrange
      const newProduct = mockProducts[0];

      // Act - Test integration of all store features
      store.setProducts([newProduct]);
      store.setSearchTerm('Credit');

      // Assert - All features work together
      expect(store.products()).toHaveSize(1);
      expect(store.searchTerm()).toBe('Credit');
      expect(store.filteredProductsBySearchTerm()).toHaveSize(1);
    });

    it('should maintain state consistency across all operations', () => {
      // Arrange
      store.setProducts(mockProducts);

      // Act - Multiple operations across different features
      store.setSearchTerm('Credit');
      store.setLoading(true);
      store.setError('Test error');

      // Assert - All state remains consistent
      expect(store.products()).toEqual(mockProducts);
      expect(store.filteredProductsBySearchTerm()).toHaveSize(1); // Only "Credit Card Premium" matches "Credit"
      expect(store.loading()).toBe(true);
      expect(store.error()).toBe('Test error');
    });
  });

  describe('Full Store Async Operations', () => {
    it('should handle complete async workflow with all store features', async () => {
      // Arrange
      const mockResponse: IGetAllProductsResponse = {
        data: mockProducts
      };
      mockGetAllProductsService.exec.and.resolveTo();
      mockProductsSignal.set(mockResponse);

      // Act - Full async workflow
      await store.loadProducts();
      store.setSearchTerm('Card');

      // Assert - Complete store integration
      expect(mockGetAllProductsService.exec).toHaveBeenCalled();
      expect(store.products()).toEqual(mockProducts);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.filteredProductsBySearchTerm()).toHaveSize(1);
    });

    it('should handle error states affecting entire store', async () => {
      // Arrange
      const errorMessage = 'Load failed';
      mockGetAllProductsService.exec.and.rejectWith(new Error(errorMessage));

      // Act
      await store.loadProducts();

      // Assert - Error state affects store properly
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe(errorMessage);
      expect(store.products()).toEqual([]);
      expect(store.filteredProductsBySearchTerm()).toEqual([]);
    });
  });
});
