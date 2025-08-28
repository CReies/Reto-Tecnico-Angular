import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { withAddProductModalState } from './add-product-modal-initial-state';
import { withAddProductModalMethods } from './add-product-modal.methods';
import { IAddProductModalStore } from './IAddProductModalStore.interface';
import { IProduct } from '../../models/shared/IProduct.model';

describe('AddProductModalMethods', () => {
	let store: IAddProductModalStore;
	let TestStore: any;

	const mockProduct: IProduct = {
		id: 'test123',
		name: 'Test Product',
		description: 'Test Description',
		logo: 'https://example.com/logo.png',
		date_released: new Date('2025-01-01'),
		date_revision: new Date('2026-01-01')
	};

	beforeEach(() => {
		// Create a test store with state and methods
		TestStore = signalStore(
			withAddProductModalState,
			withAddProductModalMethods
		);

		TestBed.configureTestingModule({
			providers: [TestStore]
		});

		store = TestBed.inject(TestStore) as unknown as IAddProductModalStore;
	});

	describe('Modal Visibility Methods', () => {
		it('should show modal', () => {
			// Arrange
			expect(store.visible()).toBe(false);

			// Act
			store.showModal();

			// Assert
			expect(store.visible()).toBe(true);
		});

		it('should hide modal', () => {
			// Arrange
			store.showModal();
			expect(store.visible()).toBe(true);

			// Act
			store.hideModal();

			// Assert
			expect(store.visible()).toBe(false);
		});
	});

	describe('Product Management Methods', () => {
		it('should set product', () => {
			// Arrange
			expect(store.product()).toBe(null);

			// Act
			store.setProduct(mockProduct);

			// Assert
			expect(store.product()).toEqual(mockProduct);
		});

		it('should clear product by setting null', () => {
			// Arrange
			store.setProduct(mockProduct);
			expect(store.product()).toEqual(mockProduct);

			// Act
			store.setProduct(null);

			// Assert
			expect(store.product()).toBe(null);
		});
	});

	describe('Reset State Method', () => {
		it('should reset all state to initial values', () => {
			// Arrange
			store.showModal();
			store.setProduct(mockProduct);
			expect(store.visible()).toBe(true);
			expect(store.product()).toEqual(mockProduct);

			// Act
			store.resetState();

			// Assert
			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);
		});

		it('should reset state even when already at initial values', () => {
			// Arrange
			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);

			// Act
			store.resetState();

			// Assert
			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);
		});
	});

	describe('Method Types', () => {
		it('should have all methods as functions', () => {
			// Assert
			expect(typeof store.showModal).toBe('function');
			expect(typeof store.hideModal).toBe('function');
			expect(typeof store.setProduct).toBe('function');
			expect(typeof store.resetState).toBe('function');
		});
	});
});
