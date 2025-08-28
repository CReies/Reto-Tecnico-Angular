import { TestBed } from '@angular/core/testing';
import { VerifyProductIdService } from './verify-product-id.service';
import { HttpService } from '../../generals/http.service';
import { URL_RESOURCES } from '../../../resources/url.resources';

describe('VerifyProductIdService', () => {
  let service: VerifyProductIdService;
  let mockHttpService: jasmine.SpyObj<HttpService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['get']);

    TestBed.configureTestingModule({
      providers: [
        VerifyProductIdService,
        { provide: HttpService, useValue: httpSpy }
      ]
    });

    service = TestBed.inject(VerifyProductIdService);
    mockHttpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('ID Verification', () => {
    it('should return true when product ID exists', async () => {
      // Arrange
      const testId = 'TEST123';
      const expectedUrl = `${URL_RESOURCES.products.verify}/${testId}`;
      mockHttpService.get.and.returnValue(Promise.resolve(true));

      // Act
      const result = await service.exec(testId);

      // Assert
      expect(mockHttpService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toBe(true);
    });

    it('should return false when product ID does not exist', async () => {
      // Arrange
      const testId = 'NONEXISTENT';
      const expectedUrl = `${URL_RESOURCES.products.verify}/${testId}`;
      mockHttpService.get.and.returnValue(Promise.resolve(false));

      // Act
      const result = await service.exec(testId);

      // Assert
      expect(mockHttpService.get).toHaveBeenCalledWith(expectedUrl);
      expect(result).toBe(false);
    });

    it('should handle HTTP errors and rethrow them', async () => {
      // Arrange
      const testId = 'TEST123';
      const error = new Error('Network error');
      const expectedUrl = `${URL_RESOURCES.products.verify}/${testId}`;
      mockHttpService.get.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act & Assert
      try {
        await service.exec(testId);
        fail('Expected error to be thrown');
      } catch (thrownError) {
        expect(thrownError).toBe(error);
        expect(mockHttpService.get).toHaveBeenCalledWith(expectedUrl);
        expect(console.error).toHaveBeenCalledWith('Error verifying product ID:', error);
      }
    });

    it('should construct correct URL with special characters in ID', async () => {
      // Arrange
      const testId = 'ID-with-special_chars123';
      const expectedUrl = `${URL_RESOURCES.products.verify}/${testId}`;
      mockHttpService.get.and.returnValue(Promise.resolve(false));

      // Act
      await service.exec(testId);

      // Assert
      expect(mockHttpService.get).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('Error Handling', () => {
    it('should log error when HTTP request fails', async () => {
      // Arrange
      const testId = 'TEST123';
      const error = new Error('HTTP 500 Error');
      mockHttpService.get.and.returnValue(Promise.reject(error));
      spyOn(console, 'error');

      // Act
      try {
        await service.exec(testId);
      } catch (e) {
        // Expected to throw
      }

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error verifying product ID:', error);
    });

    it('should throw error when HTTP request fails', async () => {
      // Arrange
      const testId = 'TEST123';
      const error = new Error('Connection timeout');
      mockHttpService.get.and.returnValue(Promise.reject(error));

      // Act & Assert
      await expectAsync(service.exec(testId)).toBeRejectedWith(error);
    });
  });
});
