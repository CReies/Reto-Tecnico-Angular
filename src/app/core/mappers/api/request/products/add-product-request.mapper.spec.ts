import { TestBed } from '@angular/core/testing';
import { AddProductRequestMapper } from './add-product-request.mapper';
import { IProduct } from '../../../../models/shared/IProduct.model';
import { IAddProductRequest } from '../../../../models/api/request/products/IAddProductRequest.model';

describe('AddProductRequestMapper', () => {
	let mapper: AddProductRequestMapper;

	const mockProduct: IProduct = {
		id: 'investment-fund-001',
		name: 'Growth Investment Fund',
		description: 'Aggressive growth fund targeting high returns',
		logo: 'growth-fund.png',
		date_released: new Date('2025-02-15'),
		date_revision: new Date('2026-02-15')
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [AddProductRequestMapper]
		});
		mapper = TestBed.inject(AddProductRequestMapper);
	});

	describe('Mapper Creation', () => {
		it('should be created', () => {
			// Arrange & Act & Assert
			expect(mapper).toBeTruthy();
		});
	});

	describe('map method', () => {
		it('should map IProduct to IAddProductRequest correctly', () => {
			// Arrange
			const expectedRequest: IAddProductRequest = {
				id: 'investment-fund-001',
				name: 'Growth Investment Fund',
				description: 'Aggressive growth fund targeting high returns',
				logo: 'growth-fund.png',
				date_release: '2025-02-15',
				date_revision: '2026-02-15'
			};

			// Act
			const result = mapper.map(mockProduct);

			// Assert
			expect(result).toEqual(expectedRequest);
			expect(result.id).toBe(mockProduct.id);
			expect(result.name).toBe(mockProduct.name);
			expect(result.description).toBe(mockProduct.description);
			expect(result.logo).toBe(mockProduct.logo);
			expect(result.date_release).toBe('2025-02-15');
			expect(result.date_revision).toBe('2026-02-15');
		});

		it('should convert Date objects to YYYY-MM-DD string format', () => {
			// Arrange
			const productWithSpecificDates: IProduct = {
				...mockProduct,
				date_released: new Date('2025-12-31T23:59:59.999Z'),
				date_revision: new Date('2026-01-01T00:00:00.000Z')
			};

			// Act
			const result = mapper.map(productWithSpecificDates);

			// Assert
			expect(result.date_release).toBe('2025-12-31');
			expect(result.date_revision).toBe('2026-01-01');
			expect(typeof result.date_release).toBe('string');
			expect(typeof result.date_revision).toBe('string');
		});

		it('should handle different date formats correctly', () => {
			// Arrange
			const productWithVariousDates: IProduct = {
				...mockProduct,
				date_released: new Date('2025-03-15T10:30:45.123Z'),
				date_revision: new Date('2025-06-20T14:25:10.456Z')
			};

			// Act
			const result = mapper.map(productWithVariousDates);

			// Assert
			expect(result.date_release).toBe('2025-03-15');
			expect(result.date_revision).toBe('2025-06-20');
		});

		it('should preserve all string properties unchanged', () => {
			// Arrange
			const productWithSpecialChars: IProduct = {
				...mockProduct,
				id: 'special-char-123_test',
				name: 'Fund with Special Characters & Symbols',
				description: 'Description with "quotes" and ñ characters',
				logo: 'file-name_with-dashes.png'
			};

			// Act
			const result = mapper.map(productWithSpecialChars);

			// Assert
			expect(result.id).toBe('special-char-123_test');
			expect(result.name).toBe('Fund with Special Characters & Symbols');
			expect(result.description).toBe('Description with "quotes" and ñ characters');
			expect(result.logo).toBe('file-name_with-dashes.png');
		});

		it('should handle financial product scenarios', () => {
			// Arrange
			const creditCardProduct: IProduct = {
				id: 'cc-platinum-001',
				name: 'Platinum Credit Card',
				description: 'Premium credit card with exclusive benefits and rewards',
				logo: 'platinum-card.svg',
				date_released: new Date('2025-01-01'),
				date_revision: new Date('2025-12-31')
			};

			// Act
			const result = mapper.map(creditCardProduct);

			// Assert
			expect(result).toEqual({
				id: 'cc-platinum-001',
				name: 'Platinum Credit Card',
				description: 'Premium credit card with exclusive benefits and rewards',
				logo: 'platinum-card.svg',
				date_release: '2025-01-01',
				date_revision: '2025-12-31'
			});
		});
	});
});
