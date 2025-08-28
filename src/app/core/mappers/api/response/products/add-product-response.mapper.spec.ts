import { TestBed } from '@angular/core/testing';
import { AddProductResponseMapper } from './add-product-response.mapper';
import { IAddProductResponse } from '../../../../models/api/response/products/IAddProductResponse.model';

describe('AddProductResponseMapper', () => {
	let mapper: AddProductResponseMapper;

	const mockApiResponse = {
		message: 'Product added successfully',
		data: {
			id: 'mortgage-premium-001',
			name: 'Premium Mortgage Package',
			description: 'Comprehensive mortgage solution with competitive rates',
			logo: 'mortgage-package.png',
			date_release: '2025-04-01',
			date_revision: '2026-04-01'
		}
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AddProductResponseMapper]
		});
		mapper = TestBed.inject(AddProductResponseMapper);
	});

	describe('Mapper Creation', () => {
		it('should be created', () => {
			// Arrange & Act & Assert
			expect(mapper).toBeTruthy();
		});
	});

	describe('map method', () => {
		it('should map API response to IAddProductResponse correctly', () => {
			// Arrange
			const expectedResponse: IAddProductResponse = {
				message: 'Product added successfully',
				data: {
					id: 'mortgage-premium-001',
					name: 'Premium Mortgage Package',
					description: 'Comprehensive mortgage solution with competitive rates',
					logo: 'mortgage-package.png',
					date_released: new Date('2025-04-01'),
					date_revision: new Date('2026-04-01')
				}
			};

			// Act
			const result = mapper.map(mockApiResponse);

			// Assert
			expect(result).toEqual(expectedResponse);
			expect(result.message).toBe('Product added successfully');
			expect(result.data.id).toBe('mortgage-premium-001');
			expect(result.data.name).toBe('Premium Mortgage Package');
			expect(result.data.description).toBe('Comprehensive mortgage solution with competitive rates');
			expect(result.data.logo).toBe('mortgage-package.png');
		});

		it('should convert string dates to Date objects', () => {
			// Arrange & Act
			const result = mapper.map(mockApiResponse);

			// Assert
			expect(result.data.date_released).toBeInstanceOf(Date);
			expect(result.data.date_revision).toBeInstanceOf(Date);
			expect(result.data.date_released.getFullYear()).toBe(2025);
			expect(result.data.date_released.getMonth()).toBe(2); // March (due to timezone conversion from '2025-04-01')
			expect(result.data.date_released.getDate()).toBe(31); // March 31st
			expect(result.data.date_revision.getFullYear()).toBe(2026);
			expect(result.data.date_revision.getMonth()).toBe(2); // March (due to timezone conversion from '2026-04-01')
			expect(result.data.date_revision.getDate()).toBe(31); // March 31st
		});

		it('should handle different date string formats', () => {
			// Arrange
			const responseWithISODates = {
				...mockApiResponse,
				data: {
					...mockApiResponse.data,
					date_release: '2025-12-25T00:00:00.000Z',
					date_revision: '2026-06-15T12:30:45.123Z'
				}
			};

			// Act
			const result = mapper.map(responseWithISODates);

			// Assert
			expect(result.data.date_released).toBeInstanceOf(Date);
			expect(result.data.date_revision).toBeInstanceOf(Date);
			expect(result.data.date_released.toISOString()).toContain('2025-12-25');
			expect(result.data.date_revision.toISOString()).toContain('2026-06-15');
		});

		it('should preserve all string properties in data object', () => {
			// Arrange
			const responseWithSpecialChars = {
				message: 'Producto agregado exitosamente',
				data: {
					id: 'special-id_123-test',
					name: 'Tarjeta de Crédito Única',
					description: 'Descripción con caracteres especiales: áéíóú & símbolos',
					logo: 'tarjeta_especial-2025.svg',
					date_release: '2025-01-01',
					date_revision: '2025-12-31'
				}
			};

			// Act
			const result = mapper.map(responseWithSpecialChars);

			// Assert
			expect(result.message).toBe('Producto agregado exitosamente');
			expect(result.data.id).toBe('special-id_123-test');
			expect(result.data.name).toBe('Tarjeta de Crédito Única');
			expect(result.data.description).toBe('Descripción con caracteres especiales: áéíóú & símbolos');
			expect(result.data.logo).toBe('tarjeta_especial-2025.svg');
		});

		it('should handle different success messages', () => {
			// Arrange
			const responses = [
				{ ...mockApiResponse, message: 'Product created successfully' },
				{ ...mockApiResponse, message: 'Financial product added to portfolio' },
				{ ...mockApiResponse, message: 'New product registered in system' }
			];

			responses.forEach(response => {
				// Act
				const result = mapper.map(response);

				// Assert
				expect(result.message).toBe(response.message);
				expect(result.data).toBeDefined();
			});
		});

		it('should handle financial product response scenarios', () => {
			// Arrange
			const savingsAccountResponse = {
				message: 'Savings account product created successfully',
				data: {
					id: 'savings-high-yield-001',
					name: 'High Yield Savings Account',
					description: 'Competitive interest rates with no minimum balance',
					logo: 'high-yield-savings.png',
					date_release: '2025-02-01',
					date_revision: '2026-02-01'
				}
			};

			// Act
			const result = mapper.map(savingsAccountResponse);

			// Assert
			expect(result.message).toBe('Savings account product created successfully');
			expect(result.data.id).toBe('savings-high-yield-001');
			expect(result.data.name).toBe('High Yield Savings Account');
			expect(result.data.description).toBe('Competitive interest rates with no minimum balance');
			expect(result.data.date_released).toBeInstanceOf(Date);
			expect(result.data.date_revision).toBeInstanceOf(Date);
		});

		it('should handle API response with minimal data', () => {
			// Arrange
			const minimalResponse = {
				message: 'Success',
				data: {
					id: 'min-001',
					name: 'Basic Product',
					description: 'Simple description',
					logo: 'basic.png',
					date_release: '2025-01-01',
					date_revision: '2025-01-02'
				}
			};

			// Act
			const result = mapper.map(minimalResponse);

			// Assert
			expect(result.message).toBe('Success');
			expect(result.data.id).toBe('min-001');
			expect(result.data.name).toBe('Basic Product');
			expect(result.data.description).toBe('Simple description');
			expect(result.data.logo).toBe('basic.png');
			expect(result.data.date_released).toBeInstanceOf(Date);
			expect(result.data.date_revision).toBeInstanceOf(Date);
		});
	});
});
