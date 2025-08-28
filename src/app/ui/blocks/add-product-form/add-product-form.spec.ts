import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProductForm } from './add-product-form';
import { IProduct } from '../../../core/models/shared/IProduct.model';

describe('AddProductForm', () => {
  let component: AddProductForm;
  let fixture: ComponentFixture<AddProductForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductForm]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty form data', () => {
      const formData = component.formData();
      expect(formData.id).toBe('');
      expect(formData.name).toBe('');
      expect(formData.description).toBe('');
      expect(formData.logo).toBe('');
      expect(formData.date_released).toBe('');
      expect(formData.date_revision).toBe('');
    });

    it('should initialize with no errors', () => {
      const errors = component.errors();
      expect(Object.values(errors).every(error => error === '')).toBe(true);
    });
  });

  describe('Form Validation', () => {
    it('should be invalid when form is empty', () => {
      expect(component.isFormValid()).toBe(false);
    });

    it('should validate ID field correctly', () => {
      // Test empty ID
      component.updateFormField('id', '');
      expect(component.errors().id).toBe('El ID es requerido');

      // Test short ID
      component.updateFormField('id', 'ab');
      expect(component.errors().id).toBe('El ID debe tener mínimo 3 caracteres');

      // Test long ID
      component.updateFormField('id', '12345678901');
      expect(component.errors().id).toBe('El ID debe tener máximo 10 caracteres');

      // Test valid ID
      component.updateFormField('id', 'test123');
      expect(component.errors().id).toBe('');
    });

    it('should show error when ID already exists', () => {
      // Arrange - Set a valid ID first
      component.updateFormField('id', 'test123');
      expect(component.errors().id).toBe(''); // Initially no error

      // Act - Simulate that this ID already exists
      component.setIdExistsValidation(true);

      // Assert - Should now show the ID exists error
      expect(component.errors().id).toBe('Este ID ya existe');
      expect(component.idExists()).toBe(true);
    });

    it('should validate name field correctly', () => {
      // Test empty name
      component.updateFormField('name', '');
      expect(component.errors().name).toBe('El nombre es requerido');

      // Test short name
      component.updateFormField('name', 'abc');
      expect(component.errors().name).toBe('El nombre debe tener mínimo 5 caracteres');

      // Test long name
      component.updateFormField('name', 'a'.repeat(101));
      expect(component.errors().name).toBe('El nombre debe tener máximo 100 caracteres');

      // Test valid name
      component.updateFormField('name', 'Valid Product Name');
      expect(component.errors().name).toBe('');
    });

    it('should validate description field correctly', () => {
      // Test empty description
      component.updateFormField('description', '');
      expect(component.errors().description).toBe('La descripción es requerida');

      // Test short description
      component.updateFormField('description', 'short');
      expect(component.errors().description).toBe('La descripción debe tener mínimo 10 caracteres');

      // Test long description
      component.updateFormField('description', 'a'.repeat(201));
      expect(component.errors().description).toBe('La descripción debe tener máximo 200 caracteres');

      // Test valid description
      component.updateFormField('description', 'This is a valid product description');
      expect(component.errors().description).toBe('');
    });

    it('should validate logo field correctly', () => {
      // Test empty logo
      component.updateFormField('logo', '');
      expect(component.errors().logo).toBe('El logo es requerido');

      // Test valid logo
      component.updateFormField('logo', 'https://example.com/logo.png');
      expect(component.errors().logo).toBe('');
    });

    it('should validate release date correctly', () => {
      // Test empty date
      component.updateFormField('date_released', '');
      expect(component.errors().date_released).toBe('La fecha de liberación es requerida');

      // Test past date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.updateFormField('date_released', yesterday.toISOString().split('T')[0]);
      expect(component.errors().date_released).toBe('La fecha debe ser igual o mayor a la fecha actual');

      // Test today's date
      const today = new Date().toISOString().split('T')[0];
      component.updateFormField('date_released', today);
      expect(component.errors().date_released).toBe('');
    });
  });

  describe('Date Calculation', () => {
    it('should automatically calculate revision date when release date changes', () => {
      const releaseDate = '2025-01-01';
      component.updateFormField('date_released', releaseDate);

      // Trigger change detection to ensure effects run
      fixture.detectChanges();

      // Revision date should be one year later
      expect(component.formData().date_revision).toBe('2026-01-01');
    });

    it('should calculate revision date correctly', () => {
      const result = component.calculateRevisionDate('2025-06-15');
      expect(result).toBe('2026-06-15');
    });

    it('should return empty string for empty release date', () => {
      const result = component.calculateRevisionDate('');
      expect(result).toBe('');
    });

    it('should return today date in YYYY-MM-DD format', () => {
      // Act
      const todayDate = component.getTodayDate();

      // Assert
      expect(todayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/); // Should match YYYY-MM-DD format

      // Verify it's actually today's date
      const expectedDate = new Date().toISOString().split('T')[0];
      expect(todayDate).toBe(expectedDate);
    });
  });

  describe('Form Actions', () => {
    it('should reset form correctly', () => {
      // Fill form with data
      component.updateFormField('id', 'test123');
      component.updateFormField('name', 'Test Product');
      component.updateFormField('description', 'Test Description');
      component.updateFormField('logo', 'https://example.com/logo.png');
      component.updateFormField('date_released', '2024-12-31');

      // Reset form
      component.resetForm();

      // Check that all fields are empty
      const formData = component.formData();
      expect(formData.id).toBe('');
      expect(formData.name).toBe('');
      expect(formData.description).toBe('');
      expect(formData.logo).toBe('');
      expect(formData.date_released).toBe('');
      expect(formData.date_revision).toBe('');

      // Check that all errors are cleared
      const errors = component.errors();
      expect(Object.values(errors).every(error => error === '')).toBe(true);
    });

    it('should emit product data on valid form submission', () => {
      spyOn(component.onSubmit, 'emit');

      // Fill form with valid data
      component.updateFormField('id', 'test123');
      component.updateFormField('name', 'Test Product');
      component.updateFormField('description', 'This is a test product description');
      component.updateFormField('logo', 'https://example.com/logo.png');
      component.updateFormField('date_released', '2026-12-31');

      // Ensure ID validation passes (simulate ID not existing)
      component.setIdExistsValidation(false);

      // Trigger change detection
      fixture.detectChanges();

      // Submit form
      component.submitForm();

      // Check that onSubmit was called with correct data
      expect(component.onSubmit.emit).toHaveBeenCalledWith(jasmine.objectContaining({
        id: 'test123',
        name: 'Test Product',
        description: 'This is a test product description',
        logo: 'https://example.com/logo.png'
      }));
    });

    it('should not submit invalid form', () => {
      spyOn(component.onSubmit, 'emit');

      // Submit empty form
      component.submitForm();

      // Check that onSubmit was not called
      expect(component.onSubmit.emit).not.toHaveBeenCalled();
    });

    it('should work with valid form submission', () => {
      // Arrange
      spyOn(component.onSubmit, 'emit');

      // Set up valid form data
      component.updateFormField('id', 'test123');
      component.updateFormField('name', 'Test Product');
      component.updateFormField('description', 'This is a test product description');
      component.updateFormField('logo', 'https://example.com/logo.png');
      component.updateFormField('date_released', '2026-12-31');

      // Ensure ID validation passes
      component.setIdExistsValidation(false);

      // Act
      component.submitForm();

      // Assert
      expect(component.onSubmit.emit).toHaveBeenCalled();
    });
  });

  describe('ID Validation', () => {
    it('should set ID validation state correctly', () => {
      // Set ID as existing
      component.setIdExistsValidation(true);
      expect(component.idExists()).toBe(true);
      expect(component.idValidating()).toBe(false);

      // Set ID as not existing
      component.setIdExistsValidation(false);
      expect(component.idExists()).toBe(false);
      expect(component.idValidating()).toBe(false);
    });

    it('should emit ID validation request for valid length ID', () => {
      spyOn(component.onValidateId, 'emit');

      // Update ID with valid length
      component.updateFormField('id', 'test123');

      // Check that validation was requested
      expect(component.onValidateId.emit).toHaveBeenCalledWith('test123');
    });

    it('should not emit ID validation for short ID', () => {
      spyOn(component.onValidateId, 'emit');

      // Update ID with short length
      component.updateFormField('id', 'ab');

      // Check that validation was not requested
      expect(component.onValidateId.emit).not.toHaveBeenCalled();
    });
  });

  describe('Error State Management', () => {
    it('should detect form errors correctly', () => {
      // Initially no errors
      expect(component.hasFormErrors()).toBe(false);

      // Add an error
      component.updateFormField('id', '');
      expect(component.hasFormErrors()).toBe(true);

      // Fix the error
      component.updateFormField('id', 'valid123');
      expect(component.hasFormErrors()).toBe(false);
    });
  });

  describe('setFormData', () => {
    const mockProduct: IProduct = {
      id: 'PROD001',
      name: 'Test Product Name',
      description: 'Test product description for testing purposes',
      logo: 'test-logo.png',
      date_released: new Date('2025-01-01'),
      date_revision: new Date('2026-01-01')
    };

    it('should set form data correctly', () => {
      // Act
      component.setFormData(mockProduct);

      // Assert
      const formData = component.formData();
      expect(formData.id).toBe(mockProduct.id);
      expect(formData.name).toBe(mockProduct.name);
      expect(formData.description).toBe(mockProduct.description);
      expect(formData.logo).toBe(mockProduct.logo);
      expect(formData.date_released).toBe('2025-01-01');
      expect(formData.date_revision).toBe('2026-01-01');
    });

    it('should clear all errors when setting form data', () => {
      // Arrange - set some errors first
      component.updateFormField('id', '');
      component.updateFormField('name', 'ab');
      expect(component.hasFormErrors()).toBe(true);

      // Act
      component.setFormData(mockProduct);

      // Assert
      const errors = component.errors();
      expect(Object.values(errors).every(error => error === '')).toBe(true);
      expect(component.hasFormErrors()).toBe(false);
    });

    it('should reset validation states', () => {
      // Arrange - set validation states
      component.idExists.set(true);
      component.idValidating.set(true);

      // Act
      component.setFormData(mockProduct);

      // Assert
      expect(component.idExists()).toBe(false);
      expect(component.idValidating()).toBe(false);
    });

    it('should handle different date formats correctly', () => {
      // Arrange
      const productWithDifferentDates: IProduct = {
        ...mockProduct,
        date_released: new Date('2025-12-31'),
        date_revision: new Date('2026-12-31')
      };

      // Act
      component.setFormData(productWithDifferentDates);

      // Assert
      const formData = component.formData();
      expect(formData.date_released).toBe('2025-12-31');
      expect(formData.date_revision).toBe('2026-12-31');
    });
  });
});

describe('AddProductForm - Edit Mode', () => {
  let component: AddProductForm;
  let fixture: ComponentFixture<AddProductForm>;

  const mockProduct: IProduct = {
    id: 'PROD001',
    name: 'Test Product Name',
    description: 'Test product description for testing purposes',
    logo: 'test-logo.png',
    date_released: new Date('2025-01-01'),
    date_revision: new Date('2026-01-01')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProductForm]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProductForm);
    component = fixture.componentInstance;
  });

  describe('Constructor Effect - Edit Mode', () => {
    it('should call setFormData when isEditMode is true and initialProduct is provided', () => {
      // Arrange
      spyOn(component, 'setFormData');
      fixture.componentRef.setInput('isEditMode', true);
      fixture.componentRef.setInput('initialProduct', mockProduct);

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.setFormData).toHaveBeenCalledWith(mockProduct);
    });

    it('should call resetForm when isEditMode is false', () => {
      // Arrange
      spyOn(component, 'resetForm');
      fixture.componentRef.setInput('isEditMode', false);
      fixture.componentRef.setInput('initialProduct', null);

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.resetForm).toHaveBeenCalled();
    });

    it('should not call setFormData when isEditMode is true but initialProduct is null', () => {
      // Arrange
      spyOn(component, 'setFormData');
      fixture.componentRef.setInput('isEditMode', true);
      fixture.componentRef.setInput('initialProduct', null);

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.setFormData).not.toHaveBeenCalled();
    });

    it('should update form data when switching from add to edit mode', () => {
      // Arrange - start in add mode
      fixture.componentRef.setInput('isEditMode', false);
      fixture.componentRef.setInput('initialProduct', null);
      fixture.detectChanges();

      // Initially should have empty form
      expect(component.formData().id).toBe('');

      // Act - switch to edit mode with product
      fixture.componentRef.setInput('isEditMode', true);
      fixture.componentRef.setInput('initialProduct', mockProduct);
      fixture.detectChanges();

      // Assert - should now have product data
      expect(component.formData().id).toBe(mockProduct.id);
      expect(component.formData().name).toBe(mockProduct.name);
    });

    it('should reset form when switching from edit to add mode', () => {
      // Arrange - start in edit mode
      fixture.componentRef.setInput('isEditMode', true);
      fixture.componentRef.setInput('initialProduct', mockProduct);
      fixture.detectChanges();

      // Should have product data
      expect(component.formData().id).toBe(mockProduct.id);

      // Act - switch to add mode
      fixture.componentRef.setInput('isEditMode', false);
      fixture.componentRef.setInput('initialProduct', null);
      fixture.detectChanges();

      // Assert - should now have empty form
      expect(component.formData().id).toBe('');
      expect(component.formData().name).toBe('');
    });
  });
});
