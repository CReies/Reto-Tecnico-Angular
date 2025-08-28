import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { DeleteProductService } from './delete-product.service';
import { HttpService } from '../../generals/http.service';
import { ErrorsService } from '../../generals/errors.service';
import { IDeleteProductResponse } from '../../../models/api/response/products/IDeleteProductResponse.model';

describe('DeleteProductService', () => {
	let service: DeleteProductService;
	let httpServiceSpy: jasmine.SpyObj<HttpService>;
	let errorsServiceSpy: jasmine.SpyObj<ErrorsService>;

	const mockDeleteResponse: IDeleteProductResponse = {
		message: 'Product removed successfully'
	};

	beforeEach(() => {
		const httpSpy = jasmine.createSpyObj('HttpService', ['delete']);
		const errorsSpy = jasmine.createSpyObj('ErrorsService', ['extract']);

		TestBed.configureTestingModule({
			providers: [
				DeleteProductService,
				{ provide: HttpService, useValue: httpSpy },
				{ provide: ErrorsService, useValue: errorsSpy }
			]
		});

		service = TestBed.inject(DeleteProductService);
		httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
		errorsServiceSpy = TestBed.inject(ErrorsService) as jasmine.SpyObj<ErrorsService>;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('deleteProduct', () => {
		it('should delete a product successfully', (done) => {
			// Arrange
			const productId = 'test-id';
			httpServiceSpy.delete.and.returnValue(Promise.resolve(mockDeleteResponse));

			// Act
			service.deleteProduct(productId).subscribe({
				next: (result) => {
					// Assert
					expect(result).toBe('Product removed successfully');
					expect(httpServiceSpy.delete).toHaveBeenCalledWith(
						'http://localhost:3002/bp/products/test-id'
					);
					done();
				},
				error: () => {
					fail('Should not have errored');
					done();
				}
			});
		});

		it('should handle delete errors', (done) => {
			// Arrange
			const productId = 'test-id';
			const errorMessage = 'Delete failed';
			httpServiceSpy.delete.and.returnValue(Promise.reject(errorMessage));

			// Act
			service.deleteProduct(productId).subscribe({
				next: () => {
					fail('Should not have succeeded');
					done();
				},
				error: (error) => {
					// Assert
					expect(error).toBe(errorMessage);
					done();
				}
			});
		});

		it('should call correct endpoint', (done) => {
			// Arrange
			const productId = 'another-test-id';
			httpServiceSpy.delete.and.returnValue(Promise.resolve(mockDeleteResponse));

			// Act
			service.deleteProduct(productId).subscribe({
				next: () => {
					// Assert
					expect(httpServiceSpy.delete).toHaveBeenCalledWith(
						'http://localhost:3002/bp/products/another-test-id'
					);
					done();
				},
				error: () => {
					fail('Should not have errored');
					done();
				}
			});
		});
	});
});
