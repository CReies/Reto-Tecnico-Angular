import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpService } from './http.service';
import { ErrorsService } from './errors.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('HttpService', () => {
  let service: HttpService;
  let httpMock: HttpTestingController;
  let errorsServiceSpy: jasmine.SpyObj<ErrorsService>;

  beforeEach(() => {
    errorsServiceSpy = jasmine.createSpyObj('ErrorsService', ['extract']);

    TestBed.configureTestingModule({
      providers: [
        HttpService,
        { provide: ErrorsService, useValue: errorsServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(HttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ---------------------------
  // GET
  // ---------------------------
  it('should perform a successful GET request', async () => {
    const mockData = { id: 1, name: 'Product A' };

    const promise = service.get('/api/products');

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('GET');

    req.flush(mockData);

    const result = await promise;
    expect(result).toEqual(mockData);
    expect(service.loading()).toBeFalse();
    expect(service.error()).toBeNull();
  });

  it('should handle an error in GET', async () => {
    const httpError = new HttpErrorResponse({
      error: [{ errorMessage: 'Something went wrong' }],
      status: 500,
      statusText: 'Server Error'
    });

    errorsServiceSpy.extract.and.returnValue(httpError);

    const promise = service.get('/api/products');

    const req = httpMock.expectOne('/api/products');
    req.flush(
      [{ errorMessage: 'Something went wrong' }],
      { status: 500, statusText: 'Server Error' }
    );

    await expectAsync(promise).toBeRejected();

    expect(errorsServiceSpy.extract).toHaveBeenCalled();
    expect(service.error()).toEqual(httpError);
    expect(service.loading()).toBeFalse();
  });

  // ---------------------------
  // POST
  // ---------------------------
  it('should perform a successful POST request', async () => {
    const mockResponse = { success: true };
    const body = { name: 'Product B' };

    const promise = service.post('/api/products', body);

    const req = httpMock.expectOne('/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should handle an error in POST', async () => {
    const httpError = new HttpErrorResponse({
      error: [{ errorMessage: 'Invalid input' }],
      status: 400,
      statusText: 'Bad Request'
    });

    errorsServiceSpy.extract.and.returnValue(httpError);

    const promise = service.post('/api/products', {});

    const req = httpMock.expectOne('/api/products');
    req.flush(
      [{ errorMessage: 'Invalid input' }],
      { status: 400, statusText: 'Bad Request' }
    );

    await expectAsync(promise).toBeRejected();
    expect(service.error()).toEqual(httpError);
  });

  // ---------------------------
  // PUT
  // ---------------------------
  it('should perform a successful PUT request', async () => {
    const mockResponse = { success: true };
    const body = { id: 1, name: 'Updated Product' };

    const promise = service.put('/api/products/1', JSON.stringify(body));

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(JSON.stringify(body));

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should handle an error in PUT', async () => {
    const httpError = new HttpErrorResponse({
      error: [{ errorMessage: 'Update failed' }],
      status: 500,
      statusText: 'Server Error'
    });

    errorsServiceSpy.extract.and.returnValue(httpError);

    const promise = service.put('/api/products/1', JSON.stringify({}));

    const req = httpMock.expectOne('/api/products/1');
    req.flush(
      [{ errorMessage: 'Update failed' }],
      { status: 500, statusText: 'Server Error' }
    );

    await expectAsync(promise).toBeRejected();
    expect(service.error()).toEqual(httpError);
  });

  // ---------------------------
  // DELETE
  // ---------------------------
  it('should perform a successful DELETE request', async () => {
    const mockResponse = { deleted: true };

    const promise = service.delete('/api/products/1');

    const req = httpMock.expectOne('/api/products/1');
    expect(req.request.method).toBe('DELETE');

    req.flush(mockResponse);

    const result = await promise;
    expect(result).toEqual(mockResponse);
  });

  it('should handle an error in DELETE', async () => {
    const httpError = new HttpErrorResponse({
      error: [{ errorMessage: 'Delete failed' }],
      status: 500,
      statusText: 'Server Error'
    });

    errorsServiceSpy.extract.and.returnValue(httpError);

    const promise = service.delete('/api/products/1');

    const req = httpMock.expectOne('/api/products/1');
    req.flush(
      [{ errorMessage: 'Delete failed' }],
      { status: 500, statusText: 'Server Error' }
    );

    await expectAsync(promise).toBeRejected();
    expect(service.error()).toEqual(httpError);
  });
});
