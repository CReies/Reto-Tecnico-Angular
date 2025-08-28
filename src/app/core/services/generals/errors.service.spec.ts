import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorsService } from './errors.service';

describe('ErrorsService', () => {
  let service: ErrorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorsService);

    // Spy on the global alert function to avoid actual alerts during testing
    spyOn(window, 'alert');
  });

  // Helper method to create mock HttpErrorResponse
  function createMockHttpErrorResponse(errorMessages: string[]): HttpErrorResponse {
    const errorArray = errorMessages.map(message => ({ errorMessage: message }));
    return {
      error: errorArray,
      status: 400,
      statusText: 'Bad Request',
      url: 'http://test-url.com',
      name: 'HttpErrorResponse',
      message: 'Http failure response',
      ok: false
    } as HttpErrorResponse;
  }

  describe('Component Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Error Extraction', () => {
    it('should extract error and show alert with first error message', () => {
      // Arrange
      const errorMessages = ['First error message', 'Second error message'];
      const mockError = createMockHttpErrorResponse(errorMessages);

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('First error message');
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(result.error).toBe(mockError);
    });

    it('should handle single error message', () => {
      // Arrange
      const errorMessages = ['Single error message'];
      const mockError = createMockHttpErrorResponse(errorMessages);

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('Single error message');
      expect(result.error).toBe(mockError);
    });

    it('should show only first error message when multiple errors exist', () => {
      // Arrange
      const errorMessages = [
        'Critical error occurred',
        'Secondary error',
        'Third error'
      ];
      const mockError = createMockHttpErrorResponse(errorMessages);

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('Critical error occurred');
      expect(window.alert).not.toHaveBeenCalledWith('Secondary error');
      expect(window.alert).not.toHaveBeenCalledWith('Third error');
      expect(window.alert).toHaveBeenCalledTimes(1);
    });

    it('should return HttpErrorResponse with original error nested', () => {
      // Arrange
      const errorMessages = ['Test error message'];
      const mockError = createMockHttpErrorResponse(errorMessages);

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(result).toBeInstanceOf(Object);
      expect(result.error).toBe(mockError);
      expect(typeof result).toBe('object');
    });
  });

  describe('Error Message Handling', () => {
    it('should handle error messages with special characters', () => {
      // Arrange
      const specialMessage = 'Error: áéíóú ñ "quotes" & symbols @#$%';
      const mockError = createMockHttpErrorResponse([specialMessage]);

      // Act
      service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith(specialMessage);
    });

    it('should handle empty error message', () => {
      // Arrange
      const mockError = createMockHttpErrorResponse(['']);

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('');
      expect(result.error).toBe(mockError);
    });

    it('should handle long error messages', () => {
      // Arrange
      const longMessage = 'This is a very long error message that contains many words and could potentially be displayed in an alert dialog to the user with detailed information about what went wrong';
      const mockError = createMockHttpErrorResponse([longMessage]);

      // Act
      service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith(longMessage);
    });

    it('should handle error messages with HTML content', () => {
      // Arrange
      const htmlMessage = '<b>Error:</b> Invalid <em>request</em> with <script>tags</script>';
      const mockError = createMockHttpErrorResponse([htmlMessage]);

      // Act
      service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith(htmlMessage);
    });
  });

  describe('Edge Cases', () => {
    it('should handle HttpErrorResponse with different status codes', () => {
      // Arrange
      const mockError = {
        error: [{ errorMessage: 'Server error' }],
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://test-url.com',
        name: 'HttpErrorResponse',
        message: 'Http failure response',
        ok: false
      } as HttpErrorResponse;

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('Server error');
      expect(result.error).toBe(mockError);
    });

    it('should handle HttpErrorResponse with additional properties', () => {
      // Arrange
      const mockError = {
        error: [
          {
            errorMessage: 'Validation failed',
            code: 'VALIDATION_ERROR',
            field: 'email'
          }
        ],
        status: 422,
        statusText: 'Unprocessable Entity',
        url: 'http://test-url.com/api/users',
        name: 'HttpErrorResponse',
        message: 'Http failure response',
        ok: false,
        headers: {} as any
      } as HttpErrorResponse;

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('Validation failed');
      expect(result.error).toBe(mockError);
    });

    it('should maintain original error properties in returned response', () => {
      // Arrange
      const mockError = {
        error: [{ errorMessage: 'Test error' }],
        status: 404,
        statusText: 'Not Found',
        url: 'http://example.com/api/resource',
        name: 'HttpErrorResponse',
        message: 'Http failure response',
        ok: false
      } as HttpErrorResponse;

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(result.error).toBe(mockError);
      expect(result.error.status).toBe(404);
      expect(result.error.statusText).toBe('Not Found');
      expect(result.error.url).toBe('http://example.com/api/resource');
    });
  });

  describe('Multiple Calls', () => {
    it('should handle multiple consecutive error extractions', () => {
      // Arrange
      const error1 = createMockHttpErrorResponse(['First error']);
      const error2 = createMockHttpErrorResponse(['Second error']);
      const error3 = createMockHttpErrorResponse(['Third error']);

      // Act
      service.extract(error1);
      service.extract(error2);
      service.extract(error3);

      // Assert
      expect(window.alert).toHaveBeenCalledTimes(3);

      const calls = (window.alert as jasmine.Spy).calls.all();
      expect(calls[0].args[0]).toBe('First error');
      expect(calls[1].args[0]).toBe('Second error');
      expect(calls[2].args[0]).toBe('Third error');
    });

    it('should reset alert spy and handle fresh error extraction', () => {
      // Arrange
      const mockError = createMockHttpErrorResponse(['Fresh error']);
      (window.alert as jasmine.Spy).calls.reset();

      // Act
      const result = service.extract(mockError);

      // Assert
      expect(window.alert).toHaveBeenCalledWith('Fresh error');
      expect(window.alert).toHaveBeenCalledTimes(1);
      expect(result.error).toBe(mockError);
    });
  });
});
