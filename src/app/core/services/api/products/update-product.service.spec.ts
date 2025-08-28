import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { UpdateProductService } from './update-product.service';
import { HttpService } from '../../generals/http.service';
import { ErrorsService } from '../../generals/errors.service';
import { IProduct } from '../../../models/shared/IProduct.model';
import { IUpdateProductResponse } from '../../../models/api/response/products/IUpdateProductResponse.model';

describe('UpdateProductService', () => {
	let service: UpdateProductService;
	let httpServiceSpy: jasmine.SpyObj<HttpService>;
	let errorsServiceSpy: jasmine.SpyObj<ErrorsService>;

	const mockProduct: IProduct = {
		id: 'test-id',
		name: 'Test Product',
		description: 'Test Description',
		logo: 'test-logo.png',
		date_released: new Date('2025-01-01'),
		date_revision: new Date('2026-01-01')
	};

	const mockUpdateResponse: IUpdateProductResponse = {
		message: 'Product updated successfully',
		data: {
			name: 'Test Product',
			description: 'Test Description',
			logo: 'test-logo.png',
			date_release: '2025-01-01',
			date_revision: '2026-01-01'
		}
	};

	beforeEach(() => {
		const httpSpy = jasmine.createSpyObj('HttpService', ['put']);
		const errorsSpy = jasmine.createSpyObj('ErrorsService', ['extract']);

		TestBed.configureTestingModule({
			providers: [
				UpdateProductService,
				{ provide: HttpService, useValue: httpSpy },
				{ provide: ErrorsService, useValue: errorsSpy }
			]
		});

		service = TestBed.inject(UpdateProductService);
		httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
		errorsServiceSpy = TestBed.inject(ErrorsService) as jasmine.SpyObj<ErrorsService>;
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	describe('updateProduct', () => {
		it('should update a product successfully', (done) => {
			// Arrange
			const productId = 'test-id';
			httpServiceSpy.put.and.returnValue(Promise.resolve(mockUpdateResponse));

			// Act
			service.updateProduct(productId, mockProduct).subscribe({
				next: (result) => {
					// Assert
					expect(result).toEqual(mockProduct);
					expect(httpServiceSpy.put).toHaveBeenCalledWith(
						'http://localhost:3002/bp/products/test-id',
						jasmine.any(String)
					);
					done();
				},
				error: () => {
					fail('Should not have errored');
					done();
				}
			});
		});

		it('should handle update errors', (done) => {
			// Arrange
			const productId = 'test-id';
			const errorMessage = 'Update failed';
			httpServiceSpy.put.and.returnValue(Promise.reject(errorMessage));

			// Act
			service.updateProduct(productId, mockProduct).subscribe({
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

		it('should send correct request body', (done) => {
			// Arrange
			const productId = 'test-id';
			httpServiceSpy.put.and.returnValue(Promise.resolve(mockUpdateResponse));

			// Act
			service.updateProduct(productId, mockProduct).subscribe({
				next: () => {
					// Assert
					const expectedRequest = JSON.stringify({
						name: 'Test Product',
						description: 'Test Description',
						logo: 'test-logo.png',
						date_release: '2025-01-01',
						date_revision: '2026-01-01'
					});
					expect(httpServiceSpy.put).toHaveBeenCalledWith(
						'http://localhost:3002/bp/products/test-id',
						expectedRequest
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
