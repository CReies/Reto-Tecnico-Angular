import { TestBed } from '@angular/core/testing';
import { signalStore } from '@ngrx/signals';
import { withProductState } from './products-initial-state';
import { IProductsStoreSignals } from './IProductsStore.interface';

// Type for store with only initial state
type InitialStateStore = Pick<IProductsStoreSignals, 'products' | 'searchTerm' | 'loading' | 'error'>;

describe('ProductsInitialState', () => {
  let store: InitialStateStore;
  let TestStore: any;

  beforeEach(() => {
    // Create a test store with only the initial state
    TestStore = signalStore(
      withProductState
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
      expect(store.products()).toEqual([]);
      expect(store.searchTerm()).toBe('');
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });

    it('should have all state properties as signal functions', () => {
      // Assert
      expect(typeof store.products).toBe('function');
      expect(typeof store.searchTerm).toBe('function');
      expect(typeof store.loading).toBe('function');
      expect(typeof store.error).toBe('function');
    });
  });

  describe('State Consistency', () => {
    it('should maintain consistent values across multiple calls', () => {
      // Act & Assert - Multiple calls should return same values
      for (let i = 0; i < 3; i++) {
        expect(store.products()).toEqual([]);
        expect(store.searchTerm()).toBe('');
        expect(store.loading()).toBe(false);
        expect(store.error()).toBeNull();
      }
    });

    it('should match IProductsState interface structure', () => {
      // Act
      const state = {
        products: store.products(),
        searchTerm: store.searchTerm(),
        loading: store.loading(),
        error: store.error()
      };

      // Assert
      expect(state).toEqual({
        products: [],
        searchTerm: '',
        loading: false,
        error: null
      });
    });
  });
});
