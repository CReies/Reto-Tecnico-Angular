import { TestBed } from '@angular/core/testing';
import { EditProductModalStore } from './edit-product-modal.store';
import { IProduct } from '../../models/shared/IProduct.model';

describe('EditProductModalStore', () => {
	let store: InstanceType<typeof EditProductModalStore>;

	const mockProduct: IProduct = {
		id: 'test-id',
		name: 'Test Product',
		description: 'Test Description',
		logo: 'test-logo.png',
		date_released: new Date('2025-01-01'),
		date_revision: new Date('2026-01-01')
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [EditProductModalStore]
		});
		store = TestBed.inject(EditProductModalStore);
	});

	it('should be created', () => {
		expect(store).toBeTruthy();
	});

	it('should have initial state', () => {
		expect(store['visible']()).toBe(false);
		expect(store['product']()).toBe(null);
		expect(store['loading']()).toBe(false);
		expect(store['error']()).toBe(null);
	});

	it('should show modal with product', () => {
		store['showModal'](mockProduct);

		expect(store['visible']()).toBe(true);
		expect(store['product']()).toEqual(mockProduct);
		expect(store['loading']()).toBe(false);
		expect(store['error']()).toBe(null);
	});

	it('should hide modal', () => {
		// First show modal
		store['showModal'](mockProduct);
		expect(store['visible']()).toBe(true);

		// Then hide it
		store['hideModal']();

		expect(store['visible']()).toBe(false);
		expect(store['product']()).toBe(null);
		expect(store['loading']()).toBe(false);
		expect(store['error']()).toBe(null);
	});

	it('should set loading state', () => {
		store['setLoading'](true);
		expect(store['loading']()).toBe(true);

		store['setLoading'](false);
		expect(store['loading']()).toBe(false);
	});

	it('should set error state', () => {
		const errorMessage = 'Test error';
		store['setError'](errorMessage);
		expect(store['error']()).toBe(errorMessage);

		store['setError'](null);
		expect(store['error']()).toBe(null);
	});

	it('should reset state', () => {
		// First set some state
		store['showModal'](mockProduct);
		store['setLoading'](true);
		store['setError']('Some error');

		// Then reset
		store['resetState']();

		expect(store['visible']()).toBe(false);
		expect(store['product']()).toBe(null);
		expect(store['loading']()).toBe(false);
		expect(store['error']()).toBe(null);
	});
});
