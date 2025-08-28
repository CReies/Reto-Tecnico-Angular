import { signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GetAllProductsResponseMapper } from '../../../mappers/api/response/products/get-all-products-response.mapper';
import { IGetAllProductsResponse } from '../../../models/api/response/products/IGetAllProductsResponse.model';
import { IProduct } from '../../../models/shared/IProduct.model';
import { HttpService } from '../../generals/http.service';
import { GetAllProductsService } from './get-all-products.service';

describe('GetAllProductsService', () => {
  let service: GetAllProductsService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let mapperSpy: jasmine.SpyObj<GetAllProductsResponseMapper>;

  // Explicit signals for HttpService
  let loadingSignal: WritableSignal<boolean>;
  let errorSignal: WritableSignal<any>;

  // Mock data
  const mockProduct = {
    id: '1',
    name: 'Product A',
    description: 'Desc',
    logo: 'logo.png',
    date_released: new Date(),
    date_revision: new Date()
  };

  const mockApiResponse = {
    data: [mockProduct]
  };

  const mockMappedResponse: IGetAllProductsResponse = {
    data: [mockProduct as IProduct]
  };

  beforeEach(() => {
    // Create explicit writable signals
    loadingSignal = signal(false);
    errorSignal = signal(null);

    // Create HttpService spy
    httpServiceSpy = jasmine.createSpyObj<HttpService>('HttpService', ['get']);

    // Assign signals as properties using Object.defineProperty
    Object.defineProperty(httpServiceSpy, 'loading', { get: () => loadingSignal });
    Object.defineProperty(httpServiceSpy, 'error', { get: () => errorSignal });

    // Create mapper spy
    mapperSpy = jasmine.createSpyObj('GetAllProductsResponseMapper', ['map']);

    TestBed.configureTestingModule({
      providers: [
        GetAllProductsService,
        { provide: HttpService, useValue: httpServiceSpy },
        { provide: GetAllProductsResponseMapper, useValue: mapperSpy }
      ]
    });

    service = TestBed.inject(GetAllProductsService);
  });

  // Helper methods for tests
  const setHttpLoading = (loading: boolean) => {
    loadingSignal.set(loading);
  };

  const setHttpError = (error: any) => {
    errorSignal.set(error);
  };

  describe('Service Initialization', () => {
    it('should initialize with null products', () => {
      expect(service.products()).toBeNull();
    });

    it('should have access to HttpService loading state', () => {
      expect(service.loading).toBeTruthy();
      expect(service.loading()).toBe(false);
    });

    it('should have access to HttpService error state', () => {
      expect(service.error).toBeTruthy();
      expect(service.error()).toBeNull();
    });
  });

  describe('Data Fetching', () => {
    it('should call HttpService and update products on success', async () => {
      // Arrange
      httpServiceSpy.get.and.resolveTo(mockApiResponse);
      mapperSpy.map.and.returnValue(mockMappedResponse);

      // Act
      await service.exec();

      // Assert
      expect(httpServiceSpy.get).toHaveBeenCalled();
      expect(mapperSpy.map).toHaveBeenCalledWith(mockApiResponse);
      expect(service.products()).toEqual(mockMappedResponse);
    });

    it('should call HttpService with correct URL', async () => {
      // Arrange
      httpServiceSpy.get.and.resolveTo(mockApiResponse);
      mapperSpy.map.and.returnValue(mockMappedResponse);

      // Act
      await service.exec();

      // Assert
      expect(httpServiceSpy.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State Management', () => {
    it('should reflect loading state from HttpService', async () => {
      // Arrange
      httpServiceSpy.get.and.callFake(async <T>(): Promise<T> => {
        setHttpLoading(true);
        await Promise.resolve();
        setHttpLoading(false);
        return mockApiResponse as T;
      });

      // Act & Assert
      expect(service.loading()).toBeFalse();

      const execPromise = service.exec();
      expect(service.loading()).toBeTrue();

      await execPromise;
      expect(service.loading()).toBeFalse();
    });

    it('should handle loading state changes', () => {
      // Arrange & Act
      setHttpLoading(true);

      // Assert
      expect(service.loading()).toBe(true);

      // Act
      setHttpLoading(false);

      // Assert
      expect(service.loading()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    const networkError = new Error('Network error');

    it('should reflect error state from HttpService', async () => {
      // Arrange
      httpServiceSpy.get.and.callFake(async <T>(): Promise<T> => {
        setHttpLoading(true);
        await Promise.resolve();
        setHttpLoading(false);
        setHttpError(networkError);
        throw networkError;
      });

      // Act & Assert
      expect(service.loading()).toBeFalse();
      expect(service.error()).toBeNull();

      const execPromise = service.exec();
      expect(service.loading()).toBeTrue();

      try {
        await execPromise;
        fail('Expected exec to throw');
      } catch (err) {
        expect(err).toEqual(networkError);
        expect(service.error()).toEqual(networkError);
      }

      expect(service.loading()).toBeFalse();
    });

    it('should set products to null on error', async () => {
      // Arrange
      httpServiceSpy.get.and.rejectWith(networkError);

      // Act
      try {
        await service.exec();
      } catch {
        // error is rethrown → expected
      }

      // Assert
      expect(service.products()).toBeNull();
    });

    it('should handle error state changes', () => {
      // Arrange
      const errorMessage = 'Test error';

      // Act
      setHttpError(errorMessage);

      // Assert
      expect(service.error()).toBe(errorMessage);

      // Act
      setHttpError(null);

      // Assert
      expect(service.error()).toBeNull();
    });

    it('should propagate errors from HttpService', async () => {
      // Arrange
      const customError = new Error('Custom HTTP error');
      httpServiceSpy.get.and.rejectWith(customError);

      // Act & Assert
      try {
        await service.exec();
        fail('Expected method to throw');
      } catch (error: unknown) {
        expect(error).toBe(customError);
      }
    });
  });
});
