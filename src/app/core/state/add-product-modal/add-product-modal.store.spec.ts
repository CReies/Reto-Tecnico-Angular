import { TestBed } from '@angular/core/testing';
import { AddProductModalStore } from './add-product-modal.store';
import { IProduct } from '../../models/shared/IProduct.model';

describe('AddProductModalStore', () => {
	let store: any; // Using any to simplify test access

	const mockProduct: IProduct = {
		id: 'test123',
		name: 'Test Product',
		description: 'Test Description',
		logo: 'https://example.com/logo.png',
		date_released: new Date('2025-01-01'),
		date_revision: new Date('2026-01-01')
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AddProductModalStore]
		});

		store = TestBed.inject(AddProductModalStore);
	});

	describe('Store Integration', () => {
		it('should create store instance', () => {
			// Assert
			expect(store).toBeTruthy();
		});

		it('should have initial state', () => {
			// Assert
			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);
		});

		it('should have all required methods', () => {
			// Assert
			expect(typeof store.showModal).toBe('function');
			expect(typeof store.hideModal).toBe('function');
			expect(typeof store.setProduct).toBe('function');
			expect(typeof store.resetState).toBe('function');
		});

		it('should have all required signals', () => {
			// Assert
			expect(typeof store.visible).toBe('function');
			expect(typeof store.product).toBe('function');
		});
	});

	describe('Complete Workflow', () => {
		it('should handle complete modal workflow', () => {
			// Arrange - Initial state
			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);

			// Act & Assert - Show modal and set product
			store.showModal();
			store.setProduct(mockProduct);

			expect(store.visible()).toBe(true);
			expect(store.product()).toEqual(mockProduct);

			// Act & Assert - Hide modal but keep product
			store.hideModal();

			expect(store.visible()).toBe(false);
			expect(store.product()).toEqual(mockProduct);

			// Act & Assert - Reset everything
			store.resetState();

			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);
		});

		it('should handle modal with product editing workflow', () => {
			// Arrange
			const updatedProduct: IProduct = {
				...mockProduct,
				name: 'Updated Product Name',
				description: 'Updated Description'
			};

			// Act & Assert - Set initial product and show modal
			store.setProduct(mockProduct);
			store.showModal();

			expect(store.visible()).toBe(true);
			expect(store.product()).toEqual(mockProduct);

			// Act & Assert - Update product
			store.setProduct(updatedProduct);

			expect(store.product()).toEqual(updatedProduct);
			expect(store.visible()).toBe(true);

			// Act & Assert - Complete workflow
			store.resetState();

			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);
		});
	});
});
