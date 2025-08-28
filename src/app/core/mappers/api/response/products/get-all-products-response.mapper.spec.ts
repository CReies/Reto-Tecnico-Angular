import { TestBed } from "@angular/core/testing";
import { GetAllProductsResponseMapper } from "./get-all-products-response.mapper";
import { IGetAllProductsResponse } from "../../../../models/api/response/products/IGetAllProductsResponse.model";
import { IProduct } from "../../../../models/shared/IProduct.model";

describe("GetAllProductsResponseMapper", () => {
  let mapper: GetAllProductsResponseMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetAllProductsResponseMapper]
    });
    mapper = TestBed.inject(GetAllProductsResponseMapper);
  });

  // Helper method to setup test environment
  function createMockApiResponse(products: any[]) {
    return {
      data: products
    };
  }

  describe('Component Initialization', () => {
    it('should be created', () => {
      expect(mapper).toBeTruthy();
    });
  });

  describe('Data Mapping', () => {
    it('should map single product from API response to IGetAllProductsResponse', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          logo: 'test-logo.png',
          date_release: '2023-01-01',
          date_revision: '2024-01-01'
        }
      ]);

      const expectedResult: IGetAllProductsResponse = {
        data: [
          {
            id: '1',
            name: 'Test Product',
            description: 'Test Description',
            logo: 'test-logo.png',
            date_released: new Date('2023-01-01'),
            date_revision: new Date('2024-01-01')
          }
        ]
      };

      // Act
      const result = mapper.map(mockApiData);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(result.data).toHaveSize(1);
      expect(result.data[0].date_released).toBeInstanceOf(Date);
      expect(result.data[0].date_revision).toBeInstanceOf(Date);
    });

    it('should map multiple products from API response', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '1',
          name: 'Product A',
          description: 'Description A',
          logo: 'logo-a.png',
          date_release: '2023-01-01',
          date_revision: '2024-01-01'
        },
        {
          id: '2',
          name: 'Product B',
          description: 'Description B',
          logo: 'logo-b.png',
          date_release: '2023-02-01',
          date_revision: '2024-02-01'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);

      // Assert
      expect(result.data).toHaveSize(2);
      expect(result.data[0].id).toBe('1');
      expect(result.data[1].id).toBe('2');
      expect(result.data[0].name).toBe('Product A');
      expect(result.data[1].name).toBe('Product B');
    });

    it('should handle empty products array', () => {
      // Arrange
      const mockApiData = createMockApiResponse([]);

      // Act
      const result = mapper.map(mockApiData);

      // Assert
      expect(result.data).toEqual([]);
      expect(result.data).toHaveSize(0);
    });
  });

  describe('Date Conversion', () => {
    it('should correctly convert date strings to Date objects', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          logo: 'test-logo.png',
          date_release: '2023-12-25',
          date_revision: '2024-06-15'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);

      // Assert
      expect(result.data[0].date_released).toEqual(new Date('2023-12-25'));
      expect(result.data[0].date_revision).toEqual(new Date('2024-06-15'));
      expect(result.data[0].date_released.getFullYear()).toBe(2023);
      expect(result.data[0].date_revision.getMonth()).toBe(5); // June is month 5 (0-indexed)
    });

    it('should handle different date formats', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          logo: 'test-logo.png',
          date_release: '2023-06-15',
          date_revision: '2024-12-31'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);

      // Assert
      expect(result.data[0].date_released).toBeInstanceOf(Date);
      expect(result.data[0].date_revision).toBeInstanceOf(Date);
      expect(result.data[0].date_released.getFullYear()).toBe(2023);
      expect(result.data[0].date_revision.getFullYear()).toBe(2024);
    });

    it('should handle ISO date format correctly', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          logo: 'test-logo.png',
          date_release: '2023-06-15T12:00:00.000Z',
          date_revision: '2024-06-15T12:00:00.000Z'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);
      const releaseDate = result.data[0].date_released;
      const revisionDate = result.data[0].date_revision;

      // Assert
      expect(releaseDate).toBeInstanceOf(Date);
      expect(revisionDate).toBeInstanceOf(Date);
      // Test that the dates are valid and parse correctly, regardless of timezone
      expect(releaseDate.getTime()).toBeGreaterThan(0);
      expect(revisionDate.getTime()).toBeGreaterThan(0);
      expect(revisionDate.getTime()).toBeGreaterThan(releaseDate.getTime());
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all product properties during mapping', () => {
      // Arrange
      const mockProduct = {
        id: 'unique-id-123',
        name: 'Comprehensive Product Name',
        description: 'Detailed product description with special characters: áéíóú',
        logo: 'https://example.com/logo.png',
        date_release: '2023-03-15',
        date_revision: '2024-03-15'
      };
      const mockApiData = createMockApiResponse([mockProduct]);

      // Act
      const result = mapper.map(mockApiData);
      const mappedProduct = result.data[0];

      // Assert
      expect(mappedProduct.id).toBe(mockProduct.id);
      expect(mappedProduct.name).toBe(mockProduct.name);
      expect(mappedProduct.description).toBe(mockProduct.description);
      expect(mappedProduct.logo).toBe(mockProduct.logo);
      expect(mappedProduct.date_released).toEqual(new Date(mockProduct.date_release));
      expect(mappedProduct.date_revision).toEqual(new Date(mockProduct.date_revision));
    });

    it('should maintain correct data types for all properties', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '1',
          name: 'Test Product',
          description: 'Test Description',
          logo: 'test-logo.png',
          date_release: '2023-01-01',
          date_revision: '2024-01-01'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);
      const product = result.data[0];

      // Assert
      expect(typeof product.id).toBe('string');
      expect(typeof product.name).toBe('string');
      expect(typeof product.description).toBe('string');
      expect(typeof product.logo).toBe('string');
      expect(product.date_released).toBeInstanceOf(Date);
      expect(product.date_revision).toBeInstanceOf(Date);
    });
  });

  describe('Edge Cases', () => {
    it('should handle products with minimal data', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: '',
          name: '',
          description: '',
          logo: '',
          date_release: '2023-01-01',
          date_revision: '2024-01-01'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);

      // Assert
      expect(result.data[0].id).toBe('');
      expect(result.data[0].name).toBe('');
      expect(result.data[0].description).toBe('');
      expect(result.data[0].logo).toBe('');
      expect(result.data[0].date_released).toBeInstanceOf(Date);
      expect(result.data[0].date_revision).toBeInstanceOf(Date);
    });

    it('should handle products with special characters', () => {
      // Arrange
      const mockApiData = createMockApiResponse([
        {
          id: 'id-with-special-chars-áéíóú',
          name: 'Product with émojis 🚀 and spëcial chars',
          description: 'Description with "quotes" and symbols: @#$%^&*()',
          logo: 'logo-with-special-chars_123.png',
          date_release: '2023-01-01',
          date_revision: '2024-01-01'
        }
      ]);

      // Act
      const result = mapper.map(mockApiData);
      const product = result.data[0];

      // Assert
      expect(product.id).toContain('áéíóú');
      expect(product.name).toContain('🚀');
      expect(product.description).toContain('"quotes"');
      expect(product.logo).toContain('_123');
    });
  });
});
