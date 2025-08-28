import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { signalStore } from '@ngrx/signals';
import { withProductsComputed } from './products.computed';
import { withProductState } from './products-initial-state';
import { withProductsMethods } from './products.methods';
import { IProduct } from '../../models/shared/IProduct.model';
import { IProductsStoreSignals } from './IProductsStore.interface';
import { GetAllProductsService } from '../../services/api/products/get-all-products.service';
import { UpdateProductService } from '../../services/api/products/update-product.service';
import { DeleteProductService } from '../../services/api/products/delete-product.service';
import { HttpService } from '../../services/generals/http.service';
import { ErrorsService } from '../../services/generals/errors.service';
import { IGetAllProductsResponse } from '../../models/api/response/products/IGetAllProductsResponse.model';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

// Type for store with state, computed properties and basic methods needed for testing
type ComputedTestStore = Pick<IProductsStoreSignals, 'products' | 'searchTerm' | 'loading' | 'error' | 'filteredProductsBySearchTerm'> & {
  setProducts: (products: IProduct[]) => void;
  setSearchTerm: (searchTerm: string) => void;
};

describe('ProductsComputed', () => {
  let store: ComputedTestStore;
  let mockGetAllProductsService: jasmine.SpyObj<GetAllProductsService>;
  let mockProductsSignal: WritableSignal<IGetAllProductsResponse | null>;

  const mockProducts: IProduct[] = [
    {
      id: '1',
      name: 'Credit Card Premium',
      description: 'Premium credit card with cashback benefits',
      logo: 'credit-card.png',
      date_released: new Date('2023-01-01'),
      date_revision: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Savings Account Plus',
      description: 'High-yield savings account with competitive rates',
      logo: 'savings.png',
      date_released: new Date('2023-02-01'),
      date_revision: new Date('2024-02-01')
    },
    {
      id: '3',
      name: 'Personal Loan Express',
      description: 'Quick approval personal loan with flexible terms',
      logo: 'loan.png',
      date_released: new Date('2023-03-01'),
      date_revision: new Date('2024-03-01')
    }
  ];

  beforeEach(() => {
    // Arrange
    mockProductsSignal = signal<IGetAllProductsResponse | null>(null);

    mockGetAllProductsService = jasmine.createSpyObj('GetAllProductsService', [
      'exec',
      'products'
    ]);

    const mockUpdateProductService = jasmine.createSpyObj('UpdateProductService', ['updateProduct']);
    const mockDeleteProductService = jasmine.createSpyObj('DeleteProductService', ['deleteProduct']);
    const mockHttpService = jasmine.createSpyObj('HttpService', ['get', 'post', 'put', 'delete']);
    const mockErrorsService = jasmine.createSpyObj('ErrorsService', ['extract']);
    const mockHttpClient = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);

    // Setup return values for services
    mockUpdateProductService.updateProduct.and.returnValue(of({}));
    mockDeleteProductService.deleteProduct.and.returnValue(of(''));
    mockHttpClient.get.and.returnValue(of({}));
    mockHttpClient.post.and.returnValue(of({}));
    mockHttpClient.put.and.returnValue(of({}));
    mockHttpClient.delete.and.returnValue(of({}));

    Object.defineProperty(mockGetAllProductsService, 'products', {
      get: () => mockProductsSignal
    });

    // Create a test store that includes state, computed, and methods
    const TestStore = signalStore(
      withProductState,
      withProductsComputed,
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

    store = TestBed.inject(TestStore) as unknown as ComputedTestStore;
  });

  describe('Computed Property Behavior', () => {
    it('should have filteredProductsBySearchTerm computed property that returns empty array initially', () => {
      // Assert
      expect(store).toBeTruthy();
      expect(typeof store.filteredProductsBySearchTerm).toBe('function');
      expect(store.filteredProductsBySearchTerm()).toEqual([]);
    });

    it('should return all products when search term is empty', () => {
      // Arrange
      store.setProducts(mockProducts);
      store.setSearchTerm('');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toEqual(mockProducts);
      expect(filteredProducts).toHaveSize(3);
    });

    it('should filter products by name (case insensitive)', () => {
      // Arrange
      store.setProducts(mockProducts);
      store.setSearchTerm('CREDIT');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toHaveSize(1);
      expect(filteredProducts[0].name).toBe('Credit Card Premium');
    });

    it('should filter products by description', () => {
      // Arrange
      store.setProducts(mockProducts);
      store.setSearchTerm('account');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toHaveSize(1); // Only Savings Account has "account" in description
    });

    it('should return empty array when no matches found', () => {
      // Arrange
      store.setProducts(mockProducts);
      store.setSearchTerm('NonExistent');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toEqual([]);
    });
  });

  describe('Reactivity and Dynamic Updates', () => {
    beforeEach(() => {
      store.setProducts(mockProducts);
    });

    it('should react to search term changes', () => {
      // Arrange
      store.setSearchTerm('Credit');
      expect(store.filteredProductsBySearchTerm()).toHaveSize(1);

      // Act
      store.setSearchTerm('Savings');

      // Assert
      expect(store.filteredProductsBySearchTerm()).toHaveSize(1);
      expect(store.filteredProductsBySearchTerm()[0].name).toBe('Savings Account Plus');
    });

    it('should react to products changes', () => {
      // Arrange
      store.setSearchTerm('Credit');
      expect(store.filteredProductsBySearchTerm()).toHaveSize(1);

      // Act - Remove Credit Card product
      const productsWithoutCredit = mockProducts.filter(p => !p.name.includes('Credit'));
      store.setProducts(productsWithoutCredit);

      // Assert
      expect(store.filteredProductsBySearchTerm()).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should return empty array when products list is empty', () => {
      // Arrange
      store.setProducts([]);
      store.setSearchTerm('anything');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toEqual([]);
    });

    it('should handle search terms with whitespace correctly', () => {
      // Arrange
      store.setProducts(mockProducts);
      store.setSearchTerm('  Savings  ');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toHaveSize(1);
      expect(filteredProducts[0].name).toBe('Savings Account Plus');
    });

    it('should filter products with special characters and accents', () => {
      // Arrange
      const specialProduct: IProduct = {
        id: '4',
        name: 'Cuenta Especial áéíóú',
        description: 'Special account with accents',
        logo: 'special.png',
        date_released: new Date('2023-04-01'),
        date_revision: new Date('2024-04-01')
      };
      store.setProducts([...mockProducts, specialProduct]);
      store.setSearchTerm('áéíóú');

      // Act
      const filteredProducts = store.filteredProductsBySearchTerm();

      // Assert
      expect(filteredProducts).toHaveSize(1);
      expect(filteredProducts[0]).toEqual(specialProduct);
    });
  });
});
