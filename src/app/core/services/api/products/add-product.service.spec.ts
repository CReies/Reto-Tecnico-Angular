import { TestBed } from '@angular/core/testing';
import { AddProductService } from './add-product.service';
import { HttpService } from '../../generals/http.service';
import { AddProductRequestMapper } from '../../../mappers/api/request/products/add-product-request.mapper';
import { AddProductResponseMapper } from '../../../mappers/api/response/products/add-product-response.mapper';
import { IProduct } from '../../../models/shared/IProduct.model';
import { IAddProductResponse } from '../../../models/api/response/products/IAddProductResponse.model';

describe('AddProductService', () => {
  let service: AddProductService;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockReqMapper: jasmine.SpyObj<AddProductRequestMapper>;
  let mockResMapper: jasmine.SpyObj<AddProductResponseMapper>;

  const mockProduct: IProduct = {
    id: 'test-product-001',
    name: 'Test Investment Fund',
    description: 'High-yield investment fund for portfolio diversification',
    logo: 'test-logo.png',
    date_released: new Date('2025-01-01'),
    date_revision: new Date('2026-01-01')
  };

  const mockRequestBody = {
    id: 'test-product-001',
    name: 'Test Investment Fund',
    description: 'High-yield investment fund for portfolio diversification',
    logo: 'test-logo.png',
    date_release: '2025-01-01',
    date_revision: '2026-01-01'
  };

  const mockApiResponse = {
    message: 'Product added successfully',
    data: {
      id: 'test-product-001',
      name: 'Test Investment Fund',
      description: 'High-yield investment fund for portfolio diversification',
      logo: 'test-logo.png',
      date_release: '2025-01-01',
      date_revision: '2026-01-01'
    }
  };

  const mockMappedResponse: IAddProductResponse = {
    message: 'Product added successfully',
    data: {
      id: 'test-product-001',
      name: 'Test Investment Fund',
      description: 'High-yield investment fund for portfolio diversification',
      logo: 'test-logo.png',
      date_released: new Date('2025-01-01'),
      date_revision: new Date('2026-01-01')
    }
  };

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['post'], {
      loading: jasmine.createSpy().and.returnValue(false),
      error: jasmine.createSpy().and.returnValue(null)
    });
    const reqMapperSpy = jasmine.createSpyObj('AddProductRequestMapper', ['map']);
    const resMapperSpy = jasmine.createSpyObj('AddProductResponseMapper', ['map']);

    TestBed.configureTestingModule({
      providers: [
        AddProductService,
        { provide: HttpService, useValue: httpSpy },
        { provide: AddProductRequestMapper, useValue: reqMapperSpy },
        { provide: AddProductResponseMapper, useValue: resMapperSpy }
      ]
    });

    service = TestBed.inject(AddProductService);
    mockHttpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    mockReqMapper = TestBed.inject(AddProductRequestMapper) as jasmine.SpyObj<AddProductRequestMapper>;
    mockResMapper = TestBed.inject(AddProductResponseMapper) as jasmine.SpyObj<AddProductResponseMapper>;
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      // Arrange & Act & Assert
      expect(service).toBeTruthy();
    });

    it('should initialize with null result', () => {
      // Arrange & Act & Assert
      expect(service.result()).toBeNull();
    });
  });

  describe('Property Getters', () => {
    it('should return loading state from http service', () => {
      // Arrange & Act
      const loading = service.loading;

      // Assert
      expect(loading).toBeDefined();
      expect(loading).toBe(mockHttpService.loading);
    });

    it('should return error state from http service', () => {
      // Arrange & Act
      const error = service.error;

      // Assert
      expect(error).toBeDefined();
      expect(error).toBe(mockHttpService.error);
    });
  });

  describe('exec method', () => {
    it('should successfully create a product', async () => {
      // Arrange
      mockReqMapper.map.and.returnValue(mockRequestBody);
      mockHttpService.post.and.returnValue(Promise.resolve(mockApiResponse));
      mockResMapper.map.and.returnValue(mockMappedResponse);

      // Act
      await service.exec(mockProduct);

      // Assert
      expect(mockReqMapper.map).toHaveBeenCalledOnceWith(mockProduct);
      expect(mockHttpService.post).toHaveBeenCalledOnceWith(
        'http://localhost:3002/bp/products',
        mockRequestBody
      );
      expect(mockResMapper.map).toHaveBeenCalledOnceWith(mockApiResponse);
      expect(service.result()).toEqual(mockMappedResponse);
    });

    it('should handle api errors and reset result', async () => {
      // Arrange
      const mockError = new Error('API Error');
      mockReqMapper.map.and.returnValue(mockRequestBody);
      mockHttpService.post.and.returnValue(Promise.reject(mockError));

      // Act & Assert
      await expectAsync(service.exec(mockProduct)).toBeRejectedWith(mockError);
      expect(service.result()).toBeNull();
      expect(mockReqMapper.map).toHaveBeenCalledOnceWith(mockProduct);
      expect(mockHttpService.post).toHaveBeenCalledOnceWith(
        'http://localhost:3002/bp/products',
        mockRequestBody
      );
      expect(mockResMapper.map).not.toHaveBeenCalled();
    });

    it('should handle mapper errors during request mapping', async () => {
      // Arrange
      const mockError = new Error('Request Mapping Error');
      mockReqMapper.map.and.throwError(mockError);

      // Act & Assert
      await expectAsync(service.exec(mockProduct)).toBeRejectedWith(mockError);
      expect(service.result()).toBeNull();
      expect(mockReqMapper.map).toHaveBeenCalledOnceWith(mockProduct);
      expect(mockHttpService.post).not.toHaveBeenCalled();
      expect(mockResMapper.map).not.toHaveBeenCalled();
    });

    it('should handle mapper errors during response mapping', async () => {
      // Arrange
      const mockError = new Error('Response Mapping Error');
      mockReqMapper.map.and.returnValue(mockRequestBody);
      mockHttpService.post.and.returnValue(Promise.resolve(mockApiResponse));
      mockResMapper.map.and.throwError(mockError);

      // Act & Assert
      await expectAsync(service.exec(mockProduct)).toBeRejectedWith(mockError);
      expect(service.result()).toBeNull();
      expect(mockReqMapper.map).toHaveBeenCalledOnceWith(mockProduct);
      expect(mockHttpService.post).toHaveBeenCalledOnceWith(
        'http://localhost:3002/bp/products',
        mockRequestBody
      );
      expect(mockResMapper.map).toHaveBeenCalledOnceWith(mockApiResponse);
    });
  });

  describe('reset method', () => {
    it('should reset result to null', async () => {
      // Arrange
      mockReqMapper.map.and.returnValue(mockRequestBody);
      mockHttpService.post.and.returnValue(Promise.resolve(mockApiResponse));
      mockResMapper.map.and.returnValue(mockMappedResponse);
      await service.exec(mockProduct);
      expect(service.result()).toEqual(mockMappedResponse);

      // Act
      service.reset();

      // Assert
      expect(service.result()).toBeNull();
    });

    it('should reset result when called multiple times', () => {
      // Arrange & Act
      service.reset();
      service.reset();
      service.reset();

      // Assert
      expect(service.result()).toBeNull();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete workflow for financial product creation', async () => {
      // Arrange
      const financialProduct: IProduct = {
        id: 'savings-premium-001',
        name: 'Premium Savings Account',
        description: 'High-interest savings account with premium benefits',
        logo: 'premium-savings.png',
        date_released: new Date('2025-03-01'),
        date_revision: new Date('2026-03-01')
      };

      const expectedRequest = {
        id: 'savings-premium-001',
        name: 'Premium Savings Account',
        description: 'High-interest savings account with premium benefits',
        logo: 'premium-savings.png',
        date_release: '2025-03-01',
        date_revision: '2026-03-01'
      };

      const apiResponse = {
        message: 'Product added successfully',
        data: expectedRequest
      };

      const expectedMappedResponse: IAddProductResponse = {
        message: 'Product added successfully',
        data: {
          ...financialProduct,
          date_released: new Date('2025-03-01'),
          date_revision: new Date('2026-03-01')
        }
      };

      mockReqMapper.map.and.returnValue(expectedRequest);
      mockHttpService.post.and.returnValue(Promise.resolve(apiResponse));
      mockResMapper.map.and.returnValue(expectedMappedResponse);

      // Act
      await service.exec(financialProduct);

      // Assert
      expect(service.result()).toEqual(expectedMappedResponse);
      expect(service.result()?.message).toBe('Product added successfully');
      expect(service.result()?.data.id).toBe('savings-premium-001');
      expect(service.result()?.data.name).toBe('Premium Savings Account');
    });
  });
});
