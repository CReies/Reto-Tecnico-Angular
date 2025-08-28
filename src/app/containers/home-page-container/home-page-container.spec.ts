import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HomePageContainer } from './home-page-container';
import { HomePageContainerFacade } from './home-page-container.facade';
import { HomePage } from '../../ui/pages/home-page/home-page';
import { ProductsStore } from '../../core/state/products/products.store';
import { ITableData } from '../../core/models/shared/ITableData';
import { IProduct } from '../../core/models/shared/IProduct.model';
import { signal, WritableSignal } from '@angular/core';
import { Modal } from '../../ui/elements/modal/modal';
import { DeleteProductAlert } from '../../ui/blocks/delete-product-alert/delete-product-alert';
import { AddProductForm } from '../../ui/blocks/add-product-form/add-product-form';

// Mock HomePage component to avoid external dependencies
@Component({
  selector: 'app-home-page',
  template: '<div>Mock HomePage</div>',
})
class MockHomePage {
  @Input() searchTerm: string = '';
  @Input() productTableData!: ITableData;
  @Input() productLoading!: boolean;
  @Input() productError!: string | null;
  @Input() modalVisible!: boolean;

  @Output() onShowModal = new EventEmitter<void>();
  @Output() onHideModal = new EventEmitter<void>();
  @Output() onValidateId = new EventEmitter<string>();
  @Output() onSubmitProduct = new EventEmitter<IProduct>();
  @Output() onTableAction = new EventEmitter<any>();

  // Method to set ID validation result
  setIdExistsValidation(exists: boolean): void {
    // Mock implementation
  }
}

// Mock Modal component
@Component({
  selector: 'app-modal',
  template: '<div><ng-content></ng-content></div>',
})
class MockModal {
  @Input() visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();
}

// Mock AddProductForm component
@Component({
  selector: 'app-add-product-form',
  template: '<div>Mock AddProductForm</div>',
})
class MockAddProductForm {
  @Input() loading: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() initialProduct: IProduct | null = null;
  @Output() onSubmit = new EventEmitter<IProduct>();
  @Output() onValidateId = new EventEmitter<string>();
}

// Mock DeleteProductAlert component
@Component({
  selector: 'app-delete-product-alert',
  template: '<div>Mock DeleteProductAlert</div>',
})
class MockDeleteProductAlert {
  @Input() productName: string = '';
  @Output() onCancel = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();
}

describe('HomePageContainer', () => {
  let component: HomePageContainer;
  let fixture: ComponentFixture<HomePageContainer>;
  let facadeSpy: jasmine.SpyObj<HomePageContainerFacade>;

  // Explicit signals for facade
  let loadingSignal: WritableSignal<boolean>;
  let errorSignal: WritableSignal<string | null>;
  let searchTermSignal: WritableSignal<string>;
  let tableDataSignal: WritableSignal<ITableData>;
  let modalVisibleSignal: WritableSignal<boolean>;

  // Edit modal signals
  let editModalVisibleSignal: WritableSignal<boolean>;
  let editModalProductSignal: WritableSignal<IProduct | null>;
  let editModalLoadingSignal: WritableSignal<boolean>;
  let editModalErrorSignal: WritableSignal<string | null>;

  // Delete modal signals
  let deleteModalVisibleSignal: WritableSignal<boolean>;
  let deleteModalProductIdSignal: WritableSignal<string | null>;
  let deleteModalProductNameSignal: WritableSignal<string | null>;
  let deleteModalLoadingSignal: WritableSignal<boolean>;
  let deleteModalErrorSignal: WritableSignal<string | null>;

  // Mock data
  const mockTableData: ITableData = {
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'actions', label: 'Acciones', type: 'actions' }
    ],
    data: [
      { id: '1', name: 'Product 1', price: 100, actions: '1' },
      { id: '2', name: 'Product 2', price: 200, actions: '2' }
    ]
  };

  beforeEach(async () => {
    // Create explicit writable signals
    loadingSignal = signal(false);
    errorSignal = signal(null);
    searchTermSignal = signal('');
    tableDataSignal = signal(mockTableData);
    modalVisibleSignal = signal(false);

    // Edit modal signals
    editModalVisibleSignal = signal(false);
    editModalProductSignal = signal(null);
    editModalLoadingSignal = signal(false);
    editModalErrorSignal = signal(null);

    // Delete modal signals
    deleteModalVisibleSignal = signal(false);
    deleteModalProductIdSignal = signal(null);
    deleteModalProductNameSignal = signal(null);
    deleteModalLoadingSignal = signal(false);
    deleteModalErrorSignal = signal(null);

    // Create facade spy with explicit signals
    facadeSpy = jasmine.createSpyObj('HomePageContainerFacade', {
      // Methods
      'loadProducts': Promise.resolve(),
      'updateSearchTerm': undefined,
      'addProduct': undefined,
      'updateProduct': undefined,
      'removeProduct': undefined,
      'showModal': undefined,
      'hideModal': undefined,
      'submitProduct': Promise.resolve(),
      'validateProductId': Promise.resolve(false),
      'findProductById': undefined,
      // Edit modal methods
      'showEditModal': undefined,
      'hideEditModal': undefined,
      'updateProductFromModal': Promise.resolve(),
      'resetEditModalState': undefined,
      // Delete modal methods
      'showDeleteModal': undefined,
      'hideDeleteModal': undefined,
      'confirmDeleteProduct': Promise.resolve(),
      'resetDeleteModalState': undefined
    });

    // Assign signals as properties using Object.defineProperty
    Object.defineProperty(facadeSpy, 'loading', { get: () => loadingSignal });
    Object.defineProperty(facadeSpy, 'error', { get: () => errorSignal });
    Object.defineProperty(facadeSpy, 'searchTerm', { get: () => searchTermSignal });
    Object.defineProperty(facadeSpy, 'tableData', { get: () => tableDataSignal });
    Object.defineProperty(facadeSpy, 'modalVisible', { get: () => modalVisibleSignal });

    // Edit modal signals
    Object.defineProperty(facadeSpy, 'editModalVisible', { get: () => editModalVisibleSignal });
    Object.defineProperty(facadeSpy, 'editModalProduct', { get: () => editModalProductSignal });
    Object.defineProperty(facadeSpy, 'editModalLoading', { get: () => editModalLoadingSignal });
    Object.defineProperty(facadeSpy, 'editModalError', { get: () => editModalErrorSignal });

    // Delete modal signals
    Object.defineProperty(facadeSpy, 'deleteModalVisible', { get: () => deleteModalVisibleSignal });
    Object.defineProperty(facadeSpy, 'deleteModalProductId', { get: () => deleteModalProductIdSignal });
    Object.defineProperty(facadeSpy, 'deleteModalProductName', { get: () => deleteModalProductNameSignal });
    Object.defineProperty(facadeSpy, 'deleteModalLoading', { get: () => deleteModalLoadingSignal });
    Object.defineProperty(facadeSpy, 'deleteModalError', { get: () => deleteModalErrorSignal });

    const mockProductsStore = jasmine.createSpyObj('ProductsStore', {
      'loadProducts': Promise.resolve(),
      'setProducts': undefined,
      'setSearchTerm': undefined,
      'addProduct': undefined,
      'updateProduct': undefined,
      'removeProduct': undefined
    }, {
      'loading': signal(false),
      'error': signal(null),
      'products': signal([]),
      'searchTerm': signal(''),
      'filteredProductsBySearchTerm': signal([])
    });

    await TestBed.configureTestingModule({
      imports: [HomePageContainer],
      providers: [
        // HTTP config for testing
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: HomePageContainerFacade, useValue: facadeSpy },
        { provide: ProductsStore, useValue: mockProductsStore }
      ]
    })
      // Override the component's providers with mocks
      .overrideComponent(HomePageContainer, {
        remove: {
          imports: [HomePage, Modal, DeleteProductAlert, AddProductForm],
          providers: [HomePageContainerFacade]
        },
        add: {
          imports: [MockHomePage, MockModal, MockDeleteProductAlert, MockAddProductForm]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(HomePageContainer);
    component = fixture.componentInstance;
  });

  // Helper methods for tests - now using explicit signals
  const setFacadeLoading = (loading: boolean) => {
    loadingSignal.set(loading);
  };

  const setFacadeError = (error: string | null) => {
    errorSignal.set(error);
  };

  const setFacadeTableData = (tableData: ITableData) => {
    tableDataSignal.set(tableData);
  };

  const setFacadeSearchTerm = (searchTerm: string) => {
    searchTermSignal.set(searchTerm);
  };

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should inject facade correctly', () => {
      expect((component as any).facade).toBeTruthy();
      expect((component as any).facade).toBe(facadeSpy);
    });

    it('should have access to facade methods', () => {
      const facade = (component as any).facade;
      expect(typeof facade.loadProducts).toBe('function');
      expect(typeof facade.updateSearchTerm).toBe('function');
      expect(typeof facade.addProduct).toBe('function');
      expect(typeof facade.updateProduct).toBe('function');
      expect(typeof facade.removeProduct).toBe('function');
    });

    it('should have access to facade signals', () => {
      const facade = (component as any).facade;
      expect(facade.loading).toBeTruthy();
      expect(facade.error).toBeTruthy();
      expect(facade.searchTerm).toBeTruthy();
      expect(facade.tableData).toBeTruthy();
    });
  });

  describe('Component Lifecycle', () => {
    describe('ngOnInit', () => {
      it('should call loadProducts on initialization', (done) => {
        // Arrange
        facadeSpy.loadProducts.and.resolveTo();

        // Act
        component.ngOnInit()
          .then(() => {
            // Assert
            expect(facadeSpy.loadProducts).toHaveBeenCalledTimes(1);
            done();
          })
          .catch(done.fail);
      });

      it('should handle successful product loading', (done) => {
        // Arrange
        facadeSpy.loadProducts.and.resolveTo();

        // Act
        component.ngOnInit()
          .then(() => {
            // Assert
            expect(facadeSpy.loadProducts).toHaveBeenCalled();
            done();
          })
          .catch(done.fail);
      });

      it('should handle failed product loading', (done) => {
        // Arrange
        const error = new Error('Failed to load products');
        facadeSpy.loadProducts.and.rejectWith(error);

        // Act
        component.ngOnInit()
          .then(() => {
            done.fail('Should have thrown an error');
          })
          .catch((err: unknown) => {
            // Assert
            expect(err).toBe(error);
            expect(facadeSpy.loadProducts).toHaveBeenCalled();
            done();
          });
      });

      it('should propagate errors from loadProducts', (done) => {
        // Arrange
        const customError = new Error('Network error');
        facadeSpy.loadProducts.and.rejectWith(customError);

        // Act & Assert
        component.ngOnInit()
          .then(() => {
            done.fail('Expected method to throw');
          })
          .catch((error: unknown) => {
            expect(error).toBe(customError);
            done();
          });
      });
    });
  });

  describe('Product Management', () => {
    describe('loadProducts method', () => {
      it('should call facade loadProducts method', (done) => {
        // Arrange
        facadeSpy.loadProducts.and.resolveTo();

        // Act
        (component as any).loadProducts()
          .then(() => {
            // Assert
            expect(facadeSpy.loadProducts).toHaveBeenCalledTimes(1);
            done();
          })
          .catch(done.fail);
      });

      it('should handle loadProducts success', (done) => {
        // Arrange
        facadeSpy.loadProducts.and.resolveTo();

        // Act
        (component as any).loadProducts()
          .then(() => {
            // Assert
            expect(facadeSpy.loadProducts).toHaveBeenCalled();
            done();
          })
          .catch(done.fail);
      });

      it('should handle loadProducts error', (done) => {
        // Arrange
        const error = new Error('Load failed');
        facadeSpy.loadProducts.and.rejectWith(error);

        // Act
        (component as any).loadProducts()
          .then(() => {
            done.fail('Expected error to be thrown');
          })
          .catch((err: unknown) => {
            // Assert
            expect(err).toBe(error);
            expect(facadeSpy.loadProducts).toHaveBeenCalled();
            done();
          });
      });

      it('should rethrow errors from facade', (done) => {
        // Arrange
        const originalError = new Error('Original error');
        facadeSpy.loadProducts.and.rejectWith(originalError);

        // Act
        (component as any).loadProducts()
          .then(() => {
            done.fail('Expected error to be rethrown');
          })
          .catch((error: unknown) => {
            // Assert
            expect(error).toBe(originalError);
            done();
          });
      });
    });
  });

  describe('Template Integration', () => {
    it('should render without errors when facade signals have default values', () => {
      // Act
      fixture.detectChanges();

      // Assert
      expect(fixture.debugElement).toBeTruthy();
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle loading state changes', () => {
      // Arrange
      setFacadeLoading(false);

      // Act
      fixture.detectChanges();
      setFacadeLoading(true);
      fixture.detectChanges();

      // Assert
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle error state changes', () => {
      // Arrange
      setFacadeError(null);

      // Act
      fixture.detectChanges();
      setFacadeError('Something went wrong');
      fixture.detectChanges();

      // Assert
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle table data changes', () => {
      // Arrange
      const newTableData: ITableData = {
        columns: [
          { key: 'id', label: 'ID', type: 'text' },
          { key: 'description', label: 'Description', type: 'text' }
        ],
        data: [
          { id: '3', description: 'New product' }
        ]
      };

      // Act
      fixture.detectChanges();
      setFacadeTableData(newTableData);
      fixture.detectChanges();

      // Assert
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle search term changes', () => {
      // Arrange
      setFacadeSearchTerm('');

      // Act
      fixture.detectChanges();
      setFacadeSearchTerm('test search');
      fixture.detectChanges();

      // Assert
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle facade loading state', () => {
      // Arrange & Act
      setFacadeLoading(true);
      fixture.detectChanges();

      // Assert
      expect(facadeSpy.loading()).toBe(true);
    });

    it('should handle facade error state', () => {
      // Arrange & Act
      const errorMessage = 'Test error message';
      setFacadeError(errorMessage);
      fixture.detectChanges();

      // Assert
      expect(facadeSpy.error()).toBe(errorMessage);
    });

    it('should handle null error state', () => {
      // Arrange & Act
      setFacadeError(null);
      fixture.detectChanges();

      // Assert
      expect(facadeSpy.error()).toBeNull();
    });
  });

  describe('Data Management', () => {
    it('should handle empty table data', () => {
      // Arrange
      const emptyTableData: ITableData = {
        columns: [],
        data: []
      };

      // Act
      setFacadeTableData(emptyTableData);
      fixture.detectChanges();

      // Assert
      expect(facadeSpy.tableData()).toEqual(emptyTableData);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle table data with multiple rows', () => {
      // Arrange
      const multiRowTableData: ITableData = {
        columns: [
          { key: 'id', label: 'ID', type: 'text' },
          { key: 'name', label: 'Name', type: 'text' }
        ],
        data: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
          { id: '3', name: 'Product 3' }
        ]
      };

      // Act
      setFacadeTableData(multiRowTableData);
      fixture.detectChanges();

      // Assert
      expect(facadeSpy.tableData()).toEqual(multiRowTableData);
    });

    it('should handle search term updates', () => {
      // Arrange
      const searchTerms = ['', 'test', 'product', 'search term'];

      // Act & Assert
      searchTerms.forEach(term => {
        setFacadeSearchTerm(term);
        fixture.detectChanges();
        expect(facadeSpy.searchTerm()).toBe(term);
      });
    });
  });

  describe('Event Handlers', () => {
    describe('Modal Events', () => {
      it('should call facade.showModal when onShowModal is called', () => {
        // Act
        component.onShowModal();

        // Assert
        expect(facadeSpy.showModal).toHaveBeenCalled();
      });

      it('should call facade.hideModal when onHideModal is called', () => {
        // Act
        component.onHideModal();

        // Assert
        expect(facadeSpy.hideModal).toHaveBeenCalled();
      });
    });

    describe('Product Events', () => {
      it('should call facade.validateProductId when onValidateId is called', async () => {
        // Arrange
        const testId = 'TEST123';
        facadeSpy.validateProductId.and.returnValue(Promise.resolve(true));

        // Act
        await component.onValidateId(testId);

        // Assert
        expect(facadeSpy.validateProductId).toHaveBeenCalledWith(testId);
        // Note: ViewChild interaction is tested in integration tests
      });

      it('should call setIdExistsValidation with true when validation succeeds and homePage is available', async () => {
        // Arrange
        const testId = 'TEST123';
        const mockHomePage = jasmine.createSpyObj('HomePage', ['setIdExistsValidation']);
        component.homePage = mockHomePage;
        facadeSpy.validateProductId.and.returnValue(Promise.resolve(true));

        // Act
        await component.onValidateId(testId);

        // Assert
        expect(facadeSpy.validateProductId).toHaveBeenCalledWith(testId);
        expect(mockHomePage.setIdExistsValidation).toHaveBeenCalledWith(true);
      });

      it('should call setIdExistsValidation with false when validation succeeds with false result', async () => {
        // Arrange
        const testId = 'TEST123';
        const mockHomePage = jasmine.createSpyObj('HomePage', ['setIdExistsValidation']);
        component.homePage = mockHomePage;
        facadeSpy.validateProductId.and.returnValue(Promise.resolve(false));

        // Act
        await component.onValidateId(testId);

        // Assert
        expect(facadeSpy.validateProductId).toHaveBeenCalledWith(testId);
        expect(mockHomePage.setIdExistsValidation).toHaveBeenCalledWith(false);
      });

      it('should handle validation errors in onValidateId', async () => {
        // Arrange
        const testId = 'TEST123';
        const error = new Error('Validation failed');
        facadeSpy.validateProductId.and.rejectWith(error);
        spyOn(console, 'error');

        // Act
        await component.onValidateId(testId);

        // Assert
        expect(facadeSpy.validateProductId).toHaveBeenCalledWith(testId);
        expect(console.error).toHaveBeenCalledWith('Error validating product ID:', error);
        // Note: ViewChild interaction is tested in integration tests
      });

      it('should call setIdExistsValidation with false when validation fails and homePage is available', async () => {
        // Arrange
        const testId = 'TEST123';
        const error = new Error('Validation failed');
        const mockHomePage = jasmine.createSpyObj('HomePage', ['setIdExistsValidation']);
        component.homePage = mockHomePage;
        facadeSpy.validateProductId.and.rejectWith(error);
        spyOn(console, 'error');

        // Act
        await component.onValidateId(testId);

        // Assert
        expect(facadeSpy.validateProductId).toHaveBeenCalledWith(testId);
        expect(console.error).toHaveBeenCalledWith('Error validating product ID:', error);
        expect(mockHomePage.setIdExistsValidation).toHaveBeenCalledWith(false);
      });

      it('should call facade.submitProduct when onSubmitProduct is called', async () => {
        // Arrange
        const testProduct: IProduct = {
          id: 'PROD001',
          name: 'Test Product',
          description: 'Test Description for validation',
          logo: 'test-logo.png',
          date_released: new Date('2026-01-01'),
          date_revision: new Date('2027-01-01')
        };
        facadeSpy.submitProduct.and.returnValue(Promise.resolve());

        // Act
        await component.onSubmitProduct(testProduct);

        // Assert
        expect(facadeSpy.submitProduct).toHaveBeenCalledWith(testProduct);
      });

      it('should handle submission errors in onSubmitProduct', async () => {
        // Arrange
        const testProduct: IProduct = {
          id: 'PROD001',
          name: 'Test Product',
          description: 'Test Description for validation',
          logo: 'test-logo.png',
          date_released: new Date('2026-01-01'),
          date_revision: new Date('2027-01-01')
        };
        const error = new Error('Submission failed');
        facadeSpy.submitProduct.and.rejectWith(error);
        spyOn(console, 'error');

        // Act
        await component.onSubmitProduct(testProduct);

        // Assert
        expect(facadeSpy.submitProduct).toHaveBeenCalledWith(testProduct);
        expect(console.error).toHaveBeenCalledWith('Error submitting product:', error);
      });
    });

    describe('Edit Modal Operations', () => {
      it('should hide edit modal in onHideEditModal', () => {
        // Act
        component.onHideEditModal();

        // Assert
        expect(facadeSpy.hideEditModal).toHaveBeenCalled();
      });

      it('should submit edit product successfully', async () => {
        // Arrange
        const testProduct: IProduct = {
          id: 'PROD001',
          name: 'Updated Product',
          description: 'Updated Description for validation',
          logo: 'updated-logo.png',
          date_released: new Date('2026-01-01'),
          date_revision: new Date('2027-01-01')
        };
        facadeSpy.updateProductFromModal.and.returnValue(Promise.resolve());

        // Act
        await component.onSubmitEditProduct(testProduct);

        // Assert
        expect(facadeSpy.updateProductFromModal).toHaveBeenCalledWith(testProduct);
      });

      it('should handle edit submission errors', async () => {
        // Arrange
        const testProduct: IProduct = {
          id: 'PROD001',
          name: 'Updated Product',
          description: 'Updated Description for validation',
          logo: 'updated-logo.png',
          date_released: new Date('2026-01-01'),
          date_revision: new Date('2027-01-01')
        };
        const error = new Error('Update failed');
        facadeSpy.updateProductFromModal.and.rejectWith(error);
        spyOn(console, 'error');

        // Act
        await component.onSubmitEditProduct(testProduct);

        // Assert
        expect(facadeSpy.updateProductFromModal).toHaveBeenCalledWith(testProduct);
        expect(console.error).toHaveBeenCalledWith('Error updating product:', error);
      });
    });

    describe('Table Actions', () => {
      const mockProduct: IProduct = {
        id: 'PROD001',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'test-logo.png',
        date_released: new Date('2026-01-01'),
        date_revision: new Date('2027-01-01')
      };

      beforeEach(() => {
        facadeSpy.findProductById.and.returnValue(mockProduct);
      });

      it('should handle edit action in onTableAction', async () => {
        // Arrange
        const editAction = { type: 'edit' as const, productId: 'PROD001' };

        // Act
        await component.onTableAction(editAction);

        // Assert
        expect(facadeSpy.findProductById).toHaveBeenCalledWith('PROD001');
        expect(facadeSpy.showEditModal).toHaveBeenCalledWith(mockProduct);
      });

      it('should handle delete action in onTableAction', async () => {
        // Arrange
        const deleteAction = { type: 'delete' as const, productId: 'PROD001' };

        // Act
        await component.onTableAction(deleteAction);

        // Assert
        expect(facadeSpy.findProductById).toHaveBeenCalledWith('PROD001');
        expect(facadeSpy.showDeleteModal).toHaveBeenCalledWith('PROD001', mockProduct.name);
      });

      it('should handle edit product when product exists', async () => {
        // Arrange
        const productId = 'PROD001';

        // Act
        await (component as any).handleEditProduct(productId);

        // Assert
        expect(facadeSpy.findProductById).toHaveBeenCalledWith(productId);
        expect(facadeSpy.showEditModal).toHaveBeenCalledWith(mockProduct);
      });

      it('should handle edit product when product not found', async () => {
        // Arrange
        const productId = 'NONEXISTENT';
        facadeSpy.findProductById.and.returnValue(undefined);
        spyOn(console, 'error');

        // Act
        await (component as any).handleEditProduct(productId);

        // Assert
        expect(facadeSpy.findProductById).toHaveBeenCalledWith(productId);
        expect(facadeSpy.showEditModal).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Product not found for editing:', productId);
      });

      it('should handle edit product with error', async () => {
        // Arrange
        const productId = 'PROD001';
        const error = new Error('Find product failed');
        facadeSpy.findProductById.and.throwError(error);
        spyOn(console, 'error');

        // Act
        await (component as any).handleEditProduct(productId);

        // Assert
        expect(console.error).toHaveBeenCalledWith('Error handling edit product:', error);
      });

      it('should handle delete product when product exists', async () => {
        // Arrange
        const productId = 'PROD001';

        // Act
        await (component as any).handleDeleteProduct(productId);

        // Assert
        expect(facadeSpy.findProductById).toHaveBeenCalledWith(productId);
        expect(facadeSpy.showDeleteModal).toHaveBeenCalledWith(productId, mockProduct.name);
      });

      it('should handle delete product when product not found', async () => {
        // Arrange
        const productId = 'NONEXISTENT';
        facadeSpy.findProductById.and.returnValue(undefined);
        spyOn(console, 'error');

        // Act
        await (component as any).handleDeleteProduct(productId);

        // Assert
        expect(facadeSpy.findProductById).toHaveBeenCalledWith(productId);
        expect(facadeSpy.showDeleteModal).not.toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Product not found for deletion:', productId);
      });

      it('should handle delete product with error', async () => {
        // Arrange
        const productId = 'PROD001';
        const error = new Error('Find product failed');
        facadeSpy.findProductById.and.throwError(error);
        spyOn(console, 'error');

        // Act
        await (component as any).handleDeleteProduct(productId);

        // Assert
        expect(console.error).toHaveBeenCalledWith('Error handling delete product:', error);
      });
    });

    describe('Delete Modal Operations', () => {
      it('should confirm delete successfully', async () => {
        // Arrange
        facadeSpy.confirmDeleteProduct.and.returnValue(Promise.resolve());

        // Act
        await component.onConfirmDelete();

        // Assert
        expect(facadeSpy.confirmDeleteProduct).toHaveBeenCalled();
      });

      it('should handle confirm delete errors', async () => {
        // Arrange
        const error = new Error('Delete confirmation failed');
        facadeSpy.confirmDeleteProduct.and.rejectWith(error);
        spyOn(console, 'error');

        // Act
        await component.onConfirmDelete();

        // Assert
        expect(facadeSpy.confirmDeleteProduct).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalledWith('Error confirming delete:', error);
      });

      it('should cancel delete in onCancelDelete', () => {
        // Act
        component.onCancelDelete();

        // Assert
        expect(facadeSpy.hideDeleteModal).toHaveBeenCalled();
      });
    });
  });

});
