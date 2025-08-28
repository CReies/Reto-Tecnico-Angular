import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { HomePageContainerFacade } from './home-page-container.facade';
import { ProductsStore } from '../../core/state/products/products.store';
import { AddProductModalStore } from '../../core/state/add-product-modal/add-product-modal.store';
import { DeleteProductModalStore } from '../../core/state/delete-product-modal/delete-product-modal.store';
import { EditProductModalStore } from '../../core/state/edit-product-modal/edit-product-modal.store';
import { ProductsToTableMapper } from '../../core/mappers/shared/products-to-table.mapper';
import { IProduct } from '../../core/models/shared/IProduct.model';
import { ITableData, ITableColumn } from '../../core/models/shared/ITableData';
import { GetAllProductsService } from '../../core/services/api/products/get-all-products.service';
import { AddProductService } from '../../core/services/api/products/add-product.service';
import { VerifyProductIdService } from '../../core/services/api/products/verify-product-id.service';

describe('HomePageContainerFacade', () => {
  let facade: HomePageContainerFacade;
  let mockProductsStore: jasmine.SpyObj<any>;
  let mockAddProductModalStore: jasmine.SpyObj<any>;
  let mockDeleteProductModalStore: jasmine.SpyObj<any>;
  let mockEditProductModalStore: jasmine.SpyObj<any>;
  let mockGetAllProductsService: jasmine.SpyObj<GetAllProductsService>;
  let mockAddProductService: jasmine.SpyObj<AddProductService>;
  let mockVerifyProductIdService: jasmine.SpyObj<VerifyProductIdService>;

  // Explicit signals for ProductsStore
  let mockLoadingSignal: WritableSignal<boolean>;
  let mockErrorSignal: WritableSignal<string | null>;
  let mockProductsSignal: WritableSignal<IProduct[]>;
  let mockSearchTermSignal: WritableSignal<string>;
  let mockFilteredProductsSignal: WritableSignal<IProduct[]>;

  // Explicit signals for AddProductModalStore
  let mockModalVisibleSignal: WritableSignal<boolean>;
  let mockModalProductSignal: WritableSignal<IProduct | null>;

  // Explicit signals for DeleteProductModalStore
  let mockDeleteModalVisibleSignal: WritableSignal<boolean>;
  let mockDeleteModalProductIdSignal: WritableSignal<string | null>;
  let mockDeleteModalProductNameSignal: WritableSignal<string | null>;
  let mockDeleteModalLoadingSignal: WritableSignal<boolean>;
  let mockDeleteModalErrorSignal: WritableSignal<string | null>;

  // Explicit signals for EditProductModalStore
  let mockEditModalVisibleSignal: WritableSignal<boolean>;
  let mockEditModalProductSignal: WritableSignal<IProduct | null>;
  let mockEditModalLoadingSignal: WritableSignal<boolean>;
  let mockEditModalErrorSignal: WritableSignal<string | null>;

  // Mock data
  const mockProducts: IProduct[] = [
    {
      id: 'PROD001',
      name: 'Premium Financial Product A',
      description: 'This is a comprehensive financial product with advanced features for enterprise clients.',
      logo: 'logo-a.png',
      date_released: new Date('2026-01-01'),
      date_revision: new Date('2027-01-01')
    },
    {
      id: 'PROD002',
      name: 'Premium Financial Product B',
      description: 'This is another comprehensive financial product designed for modern banking solutions.',
      logo: 'logo-b.png',
      date_released: new Date('2026-02-01'),
      date_revision: new Date('2027-02-01')
    }
  ];

  const mockTableData: ITableData = {
    columns: [
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'name', label: 'Product Name', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'date_released', label: 'Release Date', type: 'text' },
      { key: 'date_revision', label: 'Revision Date', type: 'text' },
      { key: 'actions', label: 'Acciones', type: 'actions' }
    ],
    data: [
      {
        id: 'PROD001',
        name: 'Premium Financial Product A',
        description: 'This is a comprehensive financial product with advanced features for enterprise clients.',
        logo: 'logo-a.png',
        date_released: '01/01/2026',
        date_revision: '01/01/2027',
        actions: 'PROD001'
      },
      {
        id: 'PROD002',
        name: 'Premium Financial Product B',
        description: 'This is another comprehensive financial product designed for modern banking solutions.',
        logo: 'logo-b.png',
        date_released: '01/02/2026',
        date_revision: '01/02/2027',
        actions: 'PROD002'
      }
    ]
  };

  beforeEach(() => {
    mockLoadingSignal = signal(false);
    mockErrorSignal = signal(null);
    mockProductsSignal = signal<IProduct[]>([]);
    mockSearchTermSignal = signal('');
    mockFilteredProductsSignal = signal<IProduct[]>([]);

    // Initialize AddProductModalStore signals
    mockModalVisibleSignal = signal(false);
    mockModalProductSignal = signal<IProduct | null>(null);

    // Initialize DeleteProductModalStore signals
    mockDeleteModalVisibleSignal = signal(false);
    mockDeleteModalProductIdSignal = signal<string | null>(null);
    mockDeleteModalProductNameSignal = signal<string | null>(null);
    mockDeleteModalLoadingSignal = signal(false);
    mockDeleteModalErrorSignal = signal<string | null>(null);

    // Initialize EditProductModalStore signals
    mockEditModalVisibleSignal = signal(false);
    mockEditModalProductSignal = signal<IProduct | null>(null);
    mockEditModalLoadingSignal = signal(false);
    mockEditModalErrorSignal = signal<string | null>(null);

    mockGetAllProductsService = jasmine.createSpyObj('GetAllProductsService', [
      'exec',
      'products'
    ]);

    mockAddProductService = jasmine.createSpyObj('AddProductService', [
      'exec',
      'reset'
    ]);

    mockVerifyProductIdService = jasmine.createSpyObj('VerifyProductIdService', [
      'exec'
    ]);

    mockProductsStore = jasmine.createSpyObj('ProductsStore', [
      'loadProducts',
      'setProducts',
      'setSearchTerm',
      'addProduct',
      'updateProduct',
      'removeProduct',
      'setLoading',
      'setError',
      'deleteProductAsync',
      'updateProductAsync'
    ]);

    mockAddProductModalStore = jasmine.createSpyObj('AddProductModalStore', [
      'showModal',
      'hideModal',
      'setProduct',
      'resetState'
    ]);

    mockDeleteProductModalStore = jasmine.createSpyObj('DeleteProductModalStore', [
      'showModal',
      'hideModal',
      'setLoading',
      'setError',
      'resetState'
    ]);

    mockEditProductModalStore = jasmine.createSpyObj('EditProductModalStore', [
      'showModal',
      'hideModal',
      'setLoading',
      'setError',
      'resetState'
    ]);

    // Assign signals as properties using Object.defineProperty
    Object.defineProperty(mockProductsStore, 'loading', {
      get: () => mockLoadingSignal
    });
    Object.defineProperty(mockProductsStore, 'error', {
      get: () => mockErrorSignal
    });
    Object.defineProperty(mockProductsStore, 'products', {
      get: () => mockProductsSignal,
      configurable: true
    });
    Object.defineProperty(mockProductsStore, 'searchTerm', {
      get: () => mockSearchTermSignal
    });
    Object.defineProperty(mockProductsStore, 'filteredProductsBySearchTerm', {
      get: () => mockFilteredProductsSignal
    });

    // Assign signals for AddProductModalStore
    Object.defineProperty(mockAddProductModalStore, 'visible', {
      get: () => mockModalVisibleSignal
    });
    Object.defineProperty(mockAddProductModalStore, 'product', {
      get: () => mockModalProductSignal
    });

    // Assign signals for DeleteProductModalStore
    Object.defineProperty(mockDeleteProductModalStore, 'visible', {
      get: () => mockDeleteModalVisibleSignal
    });
    Object.defineProperty(mockDeleteProductModalStore, 'productId', {
      get: () => mockDeleteModalProductIdSignal
    });
    Object.defineProperty(mockDeleteProductModalStore, 'productName', {
      get: () => mockDeleteModalProductNameSignal
    });
    Object.defineProperty(mockDeleteProductModalStore, 'loading', {
      get: () => mockDeleteModalLoadingSignal
    });
    Object.defineProperty(mockDeleteProductModalStore, 'error', {
      get: () => mockDeleteModalErrorSignal
    });

    // Assign signals for EditProductModalStore
    Object.defineProperty(mockEditProductModalStore, 'visible', {
      get: () => mockEditModalVisibleSignal
    });
    Object.defineProperty(mockEditProductModalStore, 'product', {
      get: () => mockEditModalProductSignal
    });
    Object.defineProperty(mockEditProductModalStore, 'loading', {
      get: () => mockEditModalLoadingSignal
    });
    Object.defineProperty(mockEditProductModalStore, 'error', {
      get: () => mockEditModalErrorSignal
    });

    // Setup ProductsToTableMapper spy
    spyOn(ProductsToTableMapper, 'mapToTable').and.returnValue(mockTableData);

    // Setup test environment
    facade = setupTestEnvironment();
  });

  // Helper method to setup test environment
  function setupTestEnvironment(): HomePageContainerFacade {
    TestBed.configureTestingModule({
      providers: [
        HomePageContainerFacade,
        { provide: ProductsStore, useValue: mockProductsStore },
        { provide: AddProductModalStore, useValue: mockAddProductModalStore },
        { provide: DeleteProductModalStore, useValue: mockDeleteProductModalStore },
        { provide: EditProductModalStore, useValue: mockEditProductModalStore },
        { provide: GetAllProductsService, useValue: mockGetAllProductsService },
        { provide: AddProductService, useValue: mockAddProductService },
        { provide: VerifyProductIdService, useValue: mockVerifyProductIdService }
      ]
    });

    return TestBed.inject(HomePageContainerFacade);
  }

  describe('Component Initialization', () => {
    it('should be created', () => {
      expect(facade).toBeTruthy();
    });

    it('should initialize searchTerm signal with empty string', () => {
      // Act
      const searchTerm = facade.searchTerm();

      // Assert
      expect(searchTerm).toBe('');
    });

    it('should reflect store loading state', () => {
      // Arrange
      mockLoadingSignal.set(true);

      // Act
      const loadingState = facade.loading();

      // Assert
      expect(loadingState).toBe(true);

      // Arrange
      mockLoadingSignal.set(false);

      // Act
      const updatedLoadingState = facade.loading();

      // Assert
      expect(updatedLoadingState).toBe(false);
    });

    it('should reflect store error state', () => {
      // Arrange
      const errorMessage = 'Test error';
      mockErrorSignal.set(errorMessage);

      // Act
      const errorState = facade.error();

      // Assert
      expect(errorState).toBe(errorMessage);

      // Arrange
      mockErrorSignal.set(null);

      // Act
      const clearedErrorState = facade.error();

      // Assert
      expect(clearedErrorState).toBeNull();
    });
  });

  describe('Search Functionality', () => {
    it('should update searchTerm when updateSearchTerm is called', () => {
      // Arrange
      const searchTerm = 'test search';

      // Act
      facade.updateSearchTerm(searchTerm);

      // Assert
      expect(facade.searchTerm()).toBe(searchTerm);
    });

    it('should call store setSearchTerm when searchTerm changes due to effect', async () => {
      // Arrange
      const searchTerm = 'test search';

      // Act
      facade.updateSearchTerm(searchTerm);
      TestBed.tick();

      // Assert
      expect(mockProductsStore.setSearchTerm).toHaveBeenCalledWith(searchTerm);
    });

    it('should trigger setSearchTerm effect when searchTerm changes', async () => {
      // Arrange
      mockProductsStore.setSearchTerm.calls.reset();

      // Act
      facade.updateSearchTerm('new search');
      TestBed.tick();

      // Assert
      expect(mockProductsStore.setSearchTerm).toHaveBeenCalledWith('new search');
    });

    it('should call setSearchTerm multiple times when searchTerm changes multiple times', async () => {
      // Arrange
      mockProductsStore.setSearchTerm.calls.reset();

      // Act
      facade.updateSearchTerm('search 1');
      TestBed.tick();

      facade.updateSearchTerm('search 2');
      TestBed.tick();

      facade.updateSearchTerm('');
      TestBed.tick();

      // Assert
      expect(mockProductsStore.setSearchTerm).toHaveBeenCalledTimes(3);
      expect(mockProductsStore.setSearchTerm).toHaveBeenCalledWith('search 1');
      expect(mockProductsStore.setSearchTerm).toHaveBeenCalledWith('search 2');
      expect(mockProductsStore.setSearchTerm).toHaveBeenCalledWith('');
    });
  });

  describe('Table Data Computation', () => {
    it('should return table data from products when no search term', () => {
      // Arrange
      mockProductsSignal.set(mockProducts);
      mockSearchTermSignal.set('');

      // Act
      const tableData = facade.tableData();

      // Assert
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith(mockProducts);
      expect(tableData).toEqual(mockTableData);
    });

    it('should return table data from filtered products when search term exists', () => {
      // Arrange
      const filteredProducts = [mockProducts[0]];
      mockFilteredProductsSignal.set(filteredProducts);
      facade.updateSearchTerm('Product A');

      // Act
      const tableData = facade.tableData();

      // Assert
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith(filteredProducts);
      expect(tableData).toEqual(mockTableData);
    });

    it('should handle empty products array', () => {
      // Arrange
      mockProductsSignal.set([]);
      mockSearchTermSignal.set('');

      const expectedEmptyTableData: ITableData = {
        columns: [
          { key: 'logo', label: 'Logo', type: 'image' },
          { key: 'name', label: 'Product Name', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' },
          { key: 'date_released', label: 'Release Date', type: 'text' },
          { key: 'date_revision', label: 'Revision Date', type: 'text' },
          { key: 'actions', label: 'Acciones', type: 'actions' }
        ],
        data: []
      };

      (ProductsToTableMapper.mapToTable as jasmine.Spy).and.returnValue(expectedEmptyTableData);

      // Act
      const tableData = facade.tableData();

      // Assert
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith([]);
      expect(tableData).toEqual(expectedEmptyTableData);
    });

    it('should handle null/undefined products with fallback to empty array', () => {
      // Arrange - Store original values to restore later
      const originalProducts = mockProductsSignal();
      const originalFiltered = mockFilteredProductsSignal();

      const expectedEmptyTableData: ITableData = {
        columns: [
          { key: 'logo', label: 'Logo', type: 'image' },
          { key: 'name', label: 'Product Name', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' },
          { key: 'date_released', label: 'Release Date', type: 'text' },
          { key: 'date_revision', label: 'Revision Date', type: 'text' },
          { key: 'actions', label: 'Acciones', type: 'actions' }
        ],
        data: []
      };

      (ProductsToTableMapper.mapToTable as jasmine.Spy).and.returnValue(expectedEmptyTableData);

      // Test Case 1: No search term with null products
      // Directly set the signal to null to simulate the store returning null
      (mockProductsSignal as any).set(null);
      mockSearchTermSignal.set('');
      facade.updateSearchTerm('');

      // Act
      const tableData1 = facade.tableData();

      // Assert - Should call mapper with empty array (fallback from null)
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith([]);
      expect(tableData1).toEqual(expectedEmptyTableData);

      // Test Case 2: With search term and undefined filtered products
      (ProductsToTableMapper.mapToTable as jasmine.Spy).calls.reset();
      (mockFilteredProductsSignal as any).set(undefined);
      facade.updateSearchTerm('test search');

      // Act
      const tableData2 = facade.tableData();

      // Assert - Should call mapper with empty array (fallback from undefined)
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith([]);
      expect(tableData2).toEqual(expectedEmptyTableData);

      // Cleanup - Restore original values
      mockProductsSignal.set(originalProducts);
      mockFilteredProductsSignal.set(originalFiltered);
    });

    it('should use correct products source based on search term', () => {
      // Arrange - Case 1: No search term
      mockSearchTermSignal.set('');
      mockProductsSignal.set(mockProducts);
      facade.updateSearchTerm('');

      // Act
      facade.tableData();

      // Assert
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith(mockProducts);

      // Arrange - Case 2: With search term
      (ProductsToTableMapper.mapToTable as jasmine.Spy).calls.reset();
      const filteredProducts = [mockProducts[0]];
      mockFilteredProductsSignal.set(filteredProducts);
      facade.updateSearchTerm('Product A');

      // Act
      facade.tableData();

      // Assert
      expect(ProductsToTableMapper.mapToTable).toHaveBeenCalledWith(filteredProducts);
    });
  });

  describe('Products Management', () => {
    it('should call store loadProducts method', async () => {
      // Arrange
      mockProductsStore.loadProducts.and.resolveTo();

      // Act
      await facade.loadProducts();

      // Assert
      expect(mockProductsStore.loadProducts).toHaveBeenCalled();
    });

    it('should call store addProduct method', () => {
      // Arrange
      const newProduct = mockProducts[0];

      // Act
      facade.addProduct(newProduct);

      // Assert
      expect(mockProductsStore.addProduct).toHaveBeenCalledWith(newProduct);
    });

    it('should call store updateProduct method', () => {
      // Arrange
      const productId = '1';
      const updatedProduct = { ...mockProducts[0], name: 'Updated Product' };

      // Act
      facade.updateProduct(productId, updatedProduct);

      // Assert
      expect(mockProductsStore.updateProduct).toHaveBeenCalledWith(productId, updatedProduct);
    });

    it('should call store removeProduct method', () => {
      // Arrange
      const productId = '1';

      // Act
      facade.removeProduct(productId);

      // Assert
      expect(mockProductsStore.removeProduct).toHaveBeenCalledWith(productId);
    });
  });

  describe('Error Handling', () => {
    it('should handle loadProducts errors', async () => {
      // Arrange
      const error = new Error('Failed to load products');
      mockProductsStore.loadProducts.and.rejectWith(error);

      // Act & Assert
      try {
        await facade.loadProducts();
        fail('Expected error to be thrown');
      } catch (thrownError) {
        expect(thrownError).toBe(error);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should correctly format dates through mapper', () => {
      // Arrange
      (ProductsToTableMapper.mapToTable as jasmine.Spy).and.callThrough();
      mockProductsSignal.set(mockProducts);
      mockSearchTermSignal.set('');

      // Act
      const tableData = facade.tableData();

      // Assert
      expect(tableData.data[0]['date_released']).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      expect(tableData.data[0]['date_revision']).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should have correct column structure', () => {
      // Arrange
      (ProductsToTableMapper.mapToTable as jasmine.Spy).and.callThrough();
      mockProductsSignal.set([]);

      // Act
      const tableData = facade.tableData();

      // Assert
      expect(tableData.columns).toEqual([
        { key: 'logo', label: 'Logo', type: 'image' },
        { key: 'name', label: 'Nombre del producto', type: 'text' },
        { key: 'description', label: 'Descripción', type: 'text' },
        { key: 'date_released', label: 'Fecha de liberación', type: 'text' },
        { key: 'date_revision', label: 'Fecha de reestructuración', type: 'text' },
        { key: 'actions', label: 'Acciones', type: 'actions' }
      ]);
    });
  });

  describe('Modal Management', () => {
    it('should show modal', () => {
      // Act
      facade.showModal();

      // Assert
      expect(mockAddProductModalStore.showModal).toHaveBeenCalled();
    });

    it('should hide modal', () => {
      // Act
      facade.hideModal();

      // Assert
      expect(mockAddProductModalStore.hideModal).toHaveBeenCalled();
    });

    it('should get modal visibility state', () => {
      // Arrange
      mockModalVisibleSignal.set(true);

      // Act
      const visible = facade.modalVisible();

      // Assert
      expect(visible).toBe(true);
    });
  });

  describe('Product Submission', () => {
    it('should validate ID successfully and submit product', async () => {
      // Arrange
      const testProduct = mockProducts[0];
      mockAddProductService.exec.and.returnValue(Promise.resolve());

      // Act
      await facade.submitProduct(testProduct);

      // Assert
      expect(mockAddProductService.exec).toHaveBeenCalledWith(testProduct);
      expect(mockProductsStore.addProduct).toHaveBeenCalledWith(testProduct);
      expect(mockAddProductModalStore.hideModal).toHaveBeenCalled();
      expect(mockAddProductService.reset).toHaveBeenCalled();
    });

    it('should handle product submission errors', async () => {
      // Arrange
      const testProduct = mockProducts[0];
      const error = new Error('Submission failed');
      mockAddProductService.exec.and.rejectWith(error);

      // Act & Assert
      try {
        await facade.submitProduct(testProduct);
        fail('Expected error to be thrown');
      } catch (thrownError) {
        expect(thrownError).toBe(error);
        expect(mockAddProductService.reset).toHaveBeenCalled();
      }
    });

    it('should handle invalid product data and throw error', async () => {
      // Arrange - Create an invalid product (fails validation)
      const invalidProduct: IProduct = {
        id: '1', // Too short (should be 3-10 chars)
        name: 'A', // Too short (should be 5-100 chars)
        description: 'Short', // Too short (should be 10-200 chars)
        logo: 'logo.png',
        date_released: new Date('2020-01-01'), // Past date (should be >= current date)
        date_revision: new Date('2020-02-01')
      };

      // Act & Assert
      try {
        await facade.submitProduct(invalidProduct);
        fail('Expected error to be thrown for invalid product');
      } catch (error) {
        expect(error).toEqual(jasmine.any(Error));
        expect((error as Error).message).toBe('Invalid product data');
        expect(mockAddProductService.exec).not.toHaveBeenCalled();
        expect(mockAddProductService.reset).toHaveBeenCalled();
      }
    });

    it('should call VerifyProductIdService when validating product ID', async () => {
      // Arrange
      const testId = 'test123';
      mockVerifyProductIdService.exec.and.returnValue(Promise.resolve(false));

      // Act
      const result = await facade.validateProductId(testId);

      // Assert
      expect(mockVerifyProductIdService.exec).toHaveBeenCalledWith(testId);
      expect(result).toBe(false);
    });

    it('should handle errors in validateProductId and return false', async () => {
      // Arrange
      const testId = 'test123';
      const error = new Error('API error');
      mockVerifyProductIdService.exec.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act
      const result = await facade.validateProductId(testId);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error validating product ID:', error);
      expect(mockVerifyProductIdService.exec).toHaveBeenCalledWith(testId);
    });

    it('should return true when product ID exists via API', async () => {
      // Arrange
      const existingId = 'EXISTING_ID';
      mockVerifyProductIdService.exec.and.returnValue(Promise.resolve(true));

      // Act
      const result = await facade.validateProductId(existingId);

      // Assert
      expect(result).toBe(true);
      expect(mockVerifyProductIdService.exec).toHaveBeenCalledWith(existingId);
    });

    it('should return false when product ID does not exist via API', async () => {
      // Arrange
      const nonExistingId = 'NONEXISTENT';
      mockVerifyProductIdService.exec.and.returnValue(Promise.resolve(false));

      // Act
      const result = await facade.validateProductId(nonExistingId);

      // Assert
      expect(result).toBe(false);
      expect(mockVerifyProductIdService.exec).toHaveBeenCalledWith(nonExistingId);
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      const testId = 'NETWORK_ERROR_TEST';
      const networkError = new Error('Network timeout');
      mockVerifyProductIdService.exec.and.returnValue(Promise.reject(networkError));
      spyOn(console, 'error');

      // Act
      const result = await facade.validateProductId(testId);

      // Assert
      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error validating product ID:', networkError);
      expect(mockVerifyProductIdService.exec).toHaveBeenCalledWith(testId);
    });
  });

  describe('Product Search and Find', () => {
    it('should find product by ID when product exists', () => {
      // Arrange
      mockProductsSignal.set(mockProducts);
      const productId = 'PROD001';

      // Act
      const foundProduct = facade.findProductById(productId);

      // Assert
      expect(foundProduct).toEqual(mockProducts[0]);
    });

    it('should return undefined when product does not exist', () => {
      // Arrange
      mockProductsSignal.set(mockProducts);
      const nonExistentId = 'NONEXISTENT';

      // Act
      const foundProduct = facade.findProductById(nonExistentId);

      // Assert
      expect(foundProduct).toBeUndefined();
    });

    it('should return undefined when products array is empty', () => {
      // Arrange
      mockProductsSignal.set([]);
      const productId = 'PROD001';

      // Act
      const foundProduct = facade.findProductById(productId);

      // Assert
      expect(foundProduct).toBeUndefined();
    });
  });

  describe('Delete Product Operations', () => {
    it('should call deleteProductAsync from store', async () => {
      // Arrange
      const productId = 'PROD001';
      mockProductsStore.deleteProductAsync.and.returnValue(Promise.resolve());

      // Act
      await facade.deleteProduct(productId);

      // Assert
      expect(mockProductsStore.deleteProductAsync).toHaveBeenCalledWith(productId);
    });

    it('should handle delete product errors', async () => {
      // Arrange
      const productId = 'PROD001';
      const error = new Error('Delete failed');
      mockProductsStore.deleteProductAsync.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act & Assert
      await expectAsync(facade.deleteProduct(productId)).toBeRejected();
      expect(console.error).toHaveBeenCalledWith('Error deleting product:', error);
    });
  });

  describe('Update Product Operations', () => {
    it('should call updateProductAsync from store', async () => {
      // Arrange
      const productId = 'PROD001';
      const updatedProduct = { ...mockProducts[0], name: 'Updated Product' };
      mockProductsStore.updateProductAsync.and.returnValue(Promise.resolve());

      // Act
      await facade.updateProductAsync(productId, updatedProduct);

      // Assert
      expect(mockProductsStore.updateProductAsync).toHaveBeenCalledWith(productId, updatedProduct);
    });

    it('should handle update product errors', async () => {
      // Arrange
      const productId = 'PROD001';
      const updatedProduct = { ...mockProducts[0], name: 'Updated Product' };
      const error = new Error('Update failed');
      mockProductsStore.updateProductAsync.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act & Assert
      await expectAsync(facade.updateProductAsync(productId, updatedProduct)).toBeRejected();
      expect(console.error).toHaveBeenCalledWith('Error updating product:', error);
    });
  });

  describe('Delete Modal Operations', () => {
    it('should show delete modal with product info', () => {
      // Arrange
      const productId = 'PROD001';
      const productName = 'Test Product';

      // Act
      facade.showDeleteModal(productId, productName);

      // Assert
      expect(mockDeleteProductModalStore.showModal).toHaveBeenCalledWith(productId, productName);
    });

    it('should hide delete modal', () => {
      // Act
      facade.hideDeleteModal();

      // Assert
      expect(mockDeleteProductModalStore.hideModal).toHaveBeenCalled();
    });

    it('should reset delete modal state', () => {
      // Act
      facade.resetDeleteModalState();

      // Assert
      expect(mockDeleteProductModalStore.resetState).toHaveBeenCalled();
    });

    it('should confirm delete product successfully', async () => {
      // Arrange
      const productId = 'PROD001';
      mockDeleteModalProductIdSignal.set(productId);
      mockProductsStore.deleteProductAsync.and.returnValue(Promise.resolve());
      mockProductsStore.loadProducts.and.returnValue(Promise.resolve());

      // Act
      await facade.confirmDeleteProduct();

      // Assert
      expect(mockDeleteProductModalStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockDeleteProductModalStore.setError).toHaveBeenCalledWith(null);
      expect(mockProductsStore.deleteProductAsync).toHaveBeenCalledWith(productId);
      expect(mockDeleteProductModalStore.hideModal).toHaveBeenCalled();
      expect(mockProductsStore.loadProducts).toHaveBeenCalled();
      expect(mockDeleteProductModalStore.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle delete product error in confirm', async () => {
      // Arrange
      const productId = 'PROD001';
      const error = new Error('Delete failed');
      mockDeleteModalProductIdSignal.set(productId);
      mockProductsStore.deleteProductAsync.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act
      await facade.confirmDeleteProduct();

      // Assert
      expect(mockDeleteProductModalStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockDeleteProductModalStore.setError).toHaveBeenCalledWith(error.message);
      expect(mockDeleteProductModalStore.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith('Error deleting product:', error);
    });

    it('should handle non-Error object in delete product confirm', async () => {
      // Arrange
      const productId = 'PROD001';
      const error = 'String error'; // Not an Error instance
      mockDeleteModalProductIdSignal.set(productId);
      mockProductsStore.deleteProductAsync.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act
      await facade.confirmDeleteProduct();

      // Assert
      expect(mockDeleteProductModalStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockDeleteProductModalStore.setError).toHaveBeenCalledWith('Error al eliminar el producto');
      expect(mockDeleteProductModalStore.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith('Error deleting product:', error);
    });

    it('should handle missing product ID in confirm delete', async () => {
      // Arrange
      mockDeleteModalProductIdSignal.set(null);
      spyOn(console, 'error');

      // Act
      await facade.confirmDeleteProduct();

      // Assert
      expect(console.error).toHaveBeenCalledWith('No product ID found for deletion');
      expect(mockProductsStore.deleteProductAsync).not.toHaveBeenCalled();
    });
  });

  describe('Edit Modal Operations', () => {
    it('should show edit modal with product', () => {
      // Arrange
      const product = mockProducts[0];

      // Act
      facade.showEditModal(product);

      // Assert
      expect(mockEditProductModalStore.showModal).toHaveBeenCalledWith(product);
    });

    it('should hide edit modal', () => {
      // Act
      facade.hideEditModal();

      // Assert
      expect(mockEditProductModalStore.hideModal).toHaveBeenCalled();
    });

    it('should reset edit modal state', () => {
      // Act
      facade.resetEditModalState();

      // Assert
      expect(mockEditProductModalStore.resetState).toHaveBeenCalled();
    });

    it('should update product from modal successfully', async () => {
      // Arrange
      const currentProduct = mockProducts[0];
      const updatedProduct = { ...currentProduct, name: 'Updated Product' };
      mockEditModalProductSignal.set(currentProduct);
      mockProductsStore.updateProductAsync.and.returnValue(Promise.resolve());
      mockProductsStore.loadProducts.and.returnValue(Promise.resolve());

      // Act
      await facade.updateProductFromModal(updatedProduct);

      // Assert
      expect(mockEditProductModalStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockEditProductModalStore.setError).toHaveBeenCalledWith(null);
      expect(mockProductsStore.updateProductAsync).toHaveBeenCalledWith(currentProduct.id, updatedProduct);
      expect(mockEditProductModalStore.hideModal).toHaveBeenCalled();
      expect(mockProductsStore.loadProducts).toHaveBeenCalled();
      expect(mockEditProductModalStore.setLoading).toHaveBeenCalledWith(false);
    });

    it('should handle update product error in modal', async () => {
      // Arrange
      const currentProduct = mockProducts[0];
      const updatedProduct = { ...currentProduct, name: 'Updated Product' };
      const error = new Error('Update failed');
      mockEditModalProductSignal.set(currentProduct);
      mockProductsStore.updateProductAsync.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act
      await facade.updateProductFromModal(updatedProduct);

      // Assert
      expect(mockEditProductModalStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockEditProductModalStore.setError).toHaveBeenCalledWith(error.message);
      expect(mockEditProductModalStore.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith('Error updating product:', error);
    });

    it('should handle non-Error object in update product modal', async () => {
      // Arrange
      const currentProduct = mockProducts[0];
      const updatedProduct = { ...currentProduct, name: 'Updated Product' };
      const error = 'String error'; // Not an Error instance
      mockEditModalProductSignal.set(currentProduct);
      mockProductsStore.updateProductAsync.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act
      await facade.updateProductFromModal(updatedProduct);

      // Assert
      expect(mockEditProductModalStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockEditProductModalStore.setError).toHaveBeenCalledWith('Error al actualizar el producto');
      expect(mockEditProductModalStore.setLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith('Error updating product:', error);
    });

    it('should handle missing current product in update', async () => {
      // Arrange
      const updatedProduct = mockProducts[0];
      mockEditModalProductSignal.set(null);
      spyOn(console, 'error');

      // Act
      await facade.updateProductFromModal(updatedProduct);

      // Assert
      expect(console.error).toHaveBeenCalledWith('No product found for update');
      expect(mockProductsStore.updateProductAsync).not.toHaveBeenCalled();
    });
  });

  describe('Computed Properties - Edit Modal', () => {
    it('should reflect edit modal visible state', () => {
      // Arrange
      mockEditModalVisibleSignal.set(true);

      // Act
      const isVisible = facade.editModalVisible();

      // Assert
      expect(isVisible).toBe(true);

      // Arrange
      mockEditModalVisibleSignal.set(false);

      // Act
      const isVisibleAfter = facade.editModalVisible();

      // Assert
      expect(isVisibleAfter).toBe(false);
    });

    it('should reflect edit modal product', () => {
      // Arrange
      const product = mockProducts[0];
      mockEditModalProductSignal.set(product);

      // Act
      const modalProduct = facade.editModalProduct();

      // Assert
      expect(modalProduct).toEqual(product);
    });

    it('should reflect edit modal loading state', () => {
      // Arrange
      mockEditModalLoadingSignal.set(true);

      // Act
      const isLoading = facade.editModalLoading();

      // Assert
      expect(isLoading).toBe(true);
    });

    it('should reflect edit modal error state', () => {
      // Arrange
      const error = 'Update failed';
      mockEditModalErrorSignal.set(error);

      // Act
      const modalError = facade.editModalError();

      // Assert
      expect(modalError).toBe(error);
    });
  });

  describe('Computed Properties - Delete Modal', () => {
    it('should reflect delete modal visible state', () => {
      // Arrange
      mockDeleteModalVisibleSignal.set(true);

      // Act
      const isVisible = facade.deleteModalVisible();

      // Assert
      expect(isVisible).toBe(true);
    });

    it('should reflect delete modal product ID', () => {
      // Arrange
      const productId = 'PROD001';
      mockDeleteModalProductIdSignal.set(productId);

      // Act
      const modalProductId = facade.deleteModalProductId();

      // Assert
      expect(modalProductId).toBe(productId);
    });

    it('should reflect delete modal product name', () => {
      // Arrange
      const productName = 'Test Product';
      mockDeleteModalProductNameSignal.set(productName);

      // Act
      const modalProductName = facade.deleteModalProductName();

      // Assert
      expect(modalProductName).toBe(productName);
    });

    it('should reflect delete modal loading state', () => {
      // Arrange
      mockDeleteModalLoadingSignal.set(true);

      // Act
      const isLoading = facade.deleteModalLoading();

      // Assert
      expect(isLoading).toBe(true);
    });

    it('should reflect delete modal error state', () => {
      // Arrange
      const error = 'Delete failed';
      mockDeleteModalErrorSignal.set(error);

      // Act
      const modalError = facade.deleteModalError();

      // Assert
      expect(modalError).toBe(error);
    });
  });
});
