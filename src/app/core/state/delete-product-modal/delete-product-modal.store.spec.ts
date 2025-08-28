import { TestBed } from '@angular/core/testing';
import { DeleteProductModalStore } from './delete-product-modal.store';

describe('DeleteProductModalStore', () => {
	let store: InstanceType<typeof DeleteProductModalStore>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [DeleteProductModalStore]
		});

		store = TestBed.inject(DeleteProductModalStore);
	});

	describe('Store Creation and Initial State', () => {
		it('should create store with correct initial state', () => {
			// Assert
			expect(store).toBeTruthy();
			expect(store.visible()).toBe(false);
			expect(store.productId()).toBeNull();
			expect(store.productName()).toBeNull();
			expect(store.loading()).toBe(false);
			expect(store.error()).toBeNull();
		});

		it('should have all required methods', () => {
			// Assert
			expect(typeof store['showModal']).toBe('function');
			expect(typeof store['hideModal']).toBe('function');
			expect(typeof store['setLoading']).toBe('function');
			expect(typeof store['setError']).toBe('function');
			expect(typeof store['resetState']).toBe('function');
		});
	});

	describe('Modal Visibility Management', () => {
		it('should show modal with product information', () => {
			// Arrange
			const productId = 'PROD001';
			const productName = 'Test Product';

			// Act
			store['showModal'](productId, productName);

			// Assert
			expect(store.visible()).toBe(true);
			expect(store.productId()).toBe(productId);
			expect(store.productName()).toBe(productName);
			expect(store.loading()).toBe(false);
			expect(store.error()).toBeNull();
		});

		it('should hide modal and reset product data', () => {
			// Arrange - First show the modal
			store['showModal']('PROD001', 'Test Product');
			expect(store.visible()).toBe(true);

			// Act
			store['hideModal']();

			// Assert
			expect(store.visible()).toBe(false);
			expect(store.productId()).toBeNull();
			expect(store.productName()).toBeNull();
			expect(store.loading()).toBe(false);
			expect(store.error()).toBeNull();
		});
	});

	describe('State Management', () => {
		it('should set loading state', () => {
			// Act
			store['setLoading'](true);

			// Assert
			expect(store.loading()).toBe(true);

			// Act
			store['setLoading'](false);

			// Assert
			expect(store.loading()).toBe(false);
		});

		it('should set error state', () => {
			// Arrange
			const errorMessage = 'Failed to delete product';

			// Act
			store['setError'](errorMessage);

			// Assert
			expect(store.error()).toBe(errorMessage);

			// Act
			store['setError'](null);

			// Assert
			expect(store.error()).toBeNull();
		});

		it('should reset all state', () => {
			// Arrange
			store['showModal']('PROD001', 'Test Product');
			store['setLoading'](true);
			store['setError']('Some error');

			// Act
			store['resetState']();

			// Assert
			expect(store.visible()).toBe(false);
			expect(store.productId()).toBeNull();
			expect(store.productName()).toBeNull();
			expect(store.loading()).toBe(false);
			expect(store.error()).toBeNull();
		});
	});
});
