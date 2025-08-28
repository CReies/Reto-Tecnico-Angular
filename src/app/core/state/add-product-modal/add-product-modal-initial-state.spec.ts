import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { withAddProductModalState } from './add-product-modal-initial-state';
import { IAddProductModalStoreSignals } from './IAddProductModalStore.interface';

// Type for store with only initial state
type InitialStateStore = Pick<IAddProductModalStoreSignals, 'visible' | 'product'>;

describe('AddProductModalInitialState', () => {
	let store: InitialStateStore;
	let TestStore: any;

	beforeEach(() => {
		// Create a test store with only the initial state
		TestStore = signalStore(
			withAddProductModalState
		);

		TestBed.configureTestingModule({
			providers: [TestStore]
		});

		store = TestBed.inject(TestStore) as unknown as InitialStateStore;
	});

	describe('Initial State Values', () => {
		it('should create store with correct initial state', () => {
			// Assert
			expect(store).toBeTruthy();
			expect(store.visible()).toBe(false);
			expect(store.product()).toBe(null);
		});

		it('should have all state properties as signal functions', () => {
			// Assert
			expect(typeof store.visible).toBe('function');
			expect(typeof store.product).toBe('function');
		});
	});
});
