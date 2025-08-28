import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HomePage } from './home-page';
import { ITableData } from '../../../core/models/shared/ITableData';
import { IProduct } from '../../../core/models/shared/IProduct.model';
import { AddProductForm } from '../../blocks/add-product-form/add-product-form';

@Component({
  template: `
    <app-home-page
      [productTableData]="tableData"
      [productLoading]="loading"
      [productError]="error"
      [modalVisible]="modalVisible">
    </app-home-page>
  `,
  imports: [HomePage]
})
class TestHostComponent {
  tableData: ITableData = { columns: [], data: [] };
  loading: boolean = false;
  error: string | null = null;
  modalVisible: boolean = false;
}

describe('HomePage', () => {
  let component: HomePage;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(HomePage)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setIdExistsValidation', () => {
    it('should call setIdExistsValidation on addProductForm when form is available', () => {
      // Arrange
      const mockForm = jasmine.createSpyObj('AddProductForm', ['setIdExistsValidation']);
      component.addProductForm = mockForm;

      // Act
      component.setIdExistsValidation(true);

      // Assert
      expect(mockForm.setIdExistsValidation).toHaveBeenCalledWith(true);
    });

    it('should call setIdExistsValidation with false on addProductForm', () => {
      // Arrange
      const mockForm = jasmine.createSpyObj('AddProductForm', ['setIdExistsValidation']);
      component.addProductForm = mockForm;

      // Act
      component.setIdExistsValidation(false);

      // Assert
      expect(mockForm.setIdExistsValidation).toHaveBeenCalledWith(false);
    });

    it('should not throw error when addProductForm is not available', () => {
      // Arrange
      component.addProductForm = undefined as any;

      // Act & Assert
      expect(() => component.setIdExistsValidation(true)).not.toThrow();
      expect(() => component.setIdExistsValidation(false)).not.toThrow();
    });
  });

  describe('setFormData', () => {
    const mockProduct: IProduct = {
      id: 'PROD001',
      name: 'Test Product',
      description: 'Test Description for the product',
      logo: 'test-logo.png',
      date_released: new Date('2025-01-01'),
      date_revision: new Date('2026-01-01')
    };

    it('should call setFormData on addProductForm when form is available', () => {
      // Arrange
      const mockForm = jasmine.createSpyObj('AddProductForm', ['setFormData']);
      component.addProductForm = mockForm;

      // Act
      component.setFormData(mockProduct);

      // Assert
      expect(mockForm.setFormData).toHaveBeenCalledWith(mockProduct);
    });

    it('should handle different product data correctly', () => {
      // Arrange
      const mockForm = jasmine.createSpyObj('AddProductForm', ['setFormData']);
      component.addProductForm = mockForm;

      const anotherProduct: IProduct = {
        id: 'PROD002',
        name: 'Another Test Product',
        description: 'Another test description for the product',
        logo: 'another-logo.png',
        date_released: new Date('2025-02-01'),
        date_revision: new Date('2026-02-01')
      };

      // Act
      component.setFormData(anotherProduct);

      // Assert
      expect(mockForm.setFormData).toHaveBeenCalledWith(anotherProduct);
    });

    it('should not throw error when addProductForm is not available', () => {
      // Arrange
      component.addProductForm = undefined as any;

      // Act & Assert
      expect(() => component.setFormData(mockProduct)).not.toThrow();
    });

    it('should handle null addProductForm gracefully', () => {
      // Arrange
      component.addProductForm = null as any;

      // Act & Assert
      expect(() => component.setFormData(mockProduct)).not.toThrow();
    });
  });
});
