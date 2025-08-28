import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Select } from './select';
import { ISelectOption } from '../../../core/models/shared/ISelectOption';

@Component({
  template: `
    <app-select
      [(value)]="selectedValue"
      [label]="label()"
      [options]="options()"
      [placeholder]="placeholder()"
      [required]="required()"
      [disabled]="disabled()"
    />
  `,
  imports: [Select]
})
class TestHostComponent {
  selectedValue = signal<string>('');
  label = signal<string>('Test Label');
  placeholder = signal<string>('Select an option');
  required = signal<boolean>(false);
  disabled = signal<boolean>(false);

  options = signal<ISelectOption[]>([
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]);
}

@Component({
  template: `<app-select [options]="minimalOptions()" />`,
  imports: [Select]
})
class MinimalTestHostComponent {
  minimalOptions = signal<ISelectOption[]>([
    { value: 'test', label: 'Test Option' }
  ]);
}

describe('Select', () => {
  let component: Select;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(Select)).componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have default values', () => {
      // Assert
      expect(component.value()).toBe('');
      expect(component.label()).toBe('Test Label');
      expect(component.placeholder()).toBe('Select an option');
      expect(component.required()).toBe(false);
      expect(component.disabled()).toBe(false);
      expect(component.options()).toHaveSize(3);
    });
  });

  describe('Input Properties', () => {
    it('should accept and display label input', () => {
      // Act
      hostComponent.label.set('Updated Label');
      fixture.detectChanges();

      // Assert
      expect(component.label()).toBe('Updated Label');
    });

    it('should accept and use placeholder input', () => {
      // Act
      hostComponent.placeholder.set('Choose your option');
      fixture.detectChanges();

      // Assert
      expect(component.placeholder()).toBe('Choose your option');
    });

    it('should accept and reflect required input', () => {
      // Act
      hostComponent.required.set(true);
      fixture.detectChanges();

      // Assert
      expect(component.required()).toBe(true);
    });

    it('should accept and reflect disabled input', () => {
      // Act
      hostComponent.disabled.set(true);
      fixture.detectChanges();

      // Assert
      expect(component.disabled()).toBe(true);
    });

    it('should accept and use options input', () => {
      // Arrange
      const newOptions: ISelectOption[] = [
        { value: 'new1', label: 'New Option 1' },
        { value: 'new2', label: 'New Option 2' }
      ];

      // Act
      hostComponent.options.set(newOptions);
      fixture.detectChanges();

      // Assert
      expect(component.options()).toEqual(newOptions);
      expect(component.options()).toHaveSize(2);
    });
  });

  describe('Value Model', () => {
    it('should have empty value initially', () => {
      // Assert
      expect(component.value()).toBe('');
    });

    it('should update value when changed', () => {
      // Act
      component.value.set('option2');

      // Assert
      expect(component.value()).toBe('option2');
    });

    it('should sync with parent component value', () => {
      // Act
      hostComponent.selectedValue.set('option1');
      fixture.detectChanges();

      // Assert
      expect(component.value()).toBe('option1');
    });

    it('should update parent component when value changes', () => {
      // Act
      component.value.set('option3');

      // Assert
      expect(hostComponent.selectedValue()).toBe('option3');
    });
  });

  describe('getSelectedOption method', () => {
    it('should return undefined when no option is selected', () => {
      // Arrange
      component.value.set('');

      // Act
      const selectedOption = component.getSelectedOption();

      // Assert
      expect(selectedOption).toBeUndefined();
    });

    it('should return the correct option when a valid value is selected', () => {
      // Arrange
      component.value.set('option2');

      // Act
      const selectedOption = component.getSelectedOption();

      // Assert
      expect(selectedOption).toBeDefined();
      expect(selectedOption?.value).toBe('option2');
      expect(selectedOption?.label).toBe('Option 2');
    });

    it('should return undefined when selected value does not match any option', () => {
      // Arrange
      component.value.set('nonexistent');

      // Act
      const selectedOption = component.getSelectedOption();

      // Assert
      expect(selectedOption).toBeUndefined();
    });

    it('should update when options change', () => {
      // Arrange
      component.value.set('option1');
      expect(component.getSelectedOption()?.label).toBe('Option 1');

      // Act
      const newOptions: ISelectOption[] = [
        { value: 'option1', label: 'Updated Option 1' },
        { value: 'option4', label: 'Option 4' }
      ];
      hostComponent.options.set(newOptions);
      fixture.detectChanges();

      // Assert
      const selectedOption = component.getSelectedOption();
      expect(selectedOption?.label).toBe('Updated Option 1');
    });

    it('should handle edge cases correctly', () => {
      // Test with empty options array
      hostComponent.options.set([]);
      fixture.detectChanges();
      component.value.set('anything');
      expect(component.getSelectedOption()).toBeUndefined();

      // Test with special characters in values
      const specialOptions: ISelectOption[] = [
        { value: 'special-value_123', label: 'Special Option' },
        { value: 'áéíóú', label: 'Accented Option' }
      ];
      hostComponent.options.set(specialOptions);
      fixture.detectChanges();

      component.value.set('áéíóú');
      const specialSelected = component.getSelectedOption();
      expect(specialSelected?.label).toBe('Accented Option');
    });
  });

  describe('Dynamic Behavior', () => {
    it('should react to options changes while maintaining selected value', () => {
      // Arrange
      component.value.set('option2');
      const initialSelected = component.getSelectedOption();
      expect(initialSelected?.label).toBe('Option 2');

      // Act
      const extendedOptions: ISelectOption[] = [
        ...hostComponent.options(),
        { value: 'option4', label: 'Option 4' },
        { value: 'option5', label: 'Option 5' }
      ];
      hostComponent.options.set(extendedOptions);
      fixture.detectChanges();

      // Assert
      expect(component.options()).toHaveSize(5);
      expect(component.value()).toBe('option2');
      expect(component.getSelectedOption()?.label).toBe('Option 2');
    });

    it('should handle value clearing correctly', () => {
      // Arrange
      component.value.set('option1');
      expect(component.getSelectedOption()).toBeDefined();

      // Act
      component.value.set('');

      // Assert
      expect(component.value()).toBe('');
      expect(component.getSelectedOption()).toBeUndefined();
    });
  });
});

describe('Select with Minimal Configuration', () => {
  let component: Select;
  let hostComponent: MinimalTestHostComponent;
  let fixture: ComponentFixture<MinimalTestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinimalTestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MinimalTestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(Select)).componentInstance;
    fixture.detectChanges();
  });

  it('should work with minimal configuration', () => {
    // Assert
    expect(component).toBeTruthy();
    expect(component.value()).toBe('');
    expect(component.label()).toBe('');
    expect(component.placeholder()).toBe('Selecciona una opción');
    expect(component.required()).toBe(false);
    expect(component.disabled()).toBe(false);
    expect(component.options()).toHaveSize(1);
  });

  it('should work with minimal options', () => {
    // Act
    component.value.set('test');

    // Assert
    const selectedOption = component.getSelectedOption();
    expect(selectedOption?.value).toBe('test');
    expect(selectedOption?.label).toBe('Test Option');
  });
});
