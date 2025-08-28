import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TableActions, TableAction } from './table-actions';
import { DropdownMenu, DropdownOption } from '../dropdown-menu/dropdown-menu';

// Test host component to test the table actions
@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [TableActions],
  template: `
    <app-table-actions
      [productId]="productId"
      (onActionSelected)="onActionSelected($event)">
    </app-table-actions>
  `
})
class TestHostComponent {
  productId = 'test-product-123';
  selectedAction: TableAction | null = null;

  onActionSelected(action: TableAction): void {
    this.selectedAction = action;
  }
}

describe('TableActions', () => {
  let component: TableActions;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let tableActionsElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    tableActionsElement = fixture.debugElement.query(By.directive(TableActions));
    component = tableActionsElement.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should receive productId input', () => {
      expect(component.productId()).toBe(hostComponent.productId);
    });

    it('should have predefined dropdown options', () => {
      expect(component.dropdownOptions).toEqual([
        { label: 'Editar', value: 'edit', icon: '✏️' },
        { label: 'Eliminar', value: 'delete', icon: '🗑️' }
      ]);
    });

    it('should have exactly 2 dropdown options', () => {
      expect(component.dropdownOptions.length).toBe(2);
    });
  });

  describe('Dropdown Menu Integration', () => {
    let dropdownComponent: DropdownMenu;

    beforeEach(() => {
      const dropdownElement = fixture.debugElement.query(By.directive(DropdownMenu));
      dropdownComponent = dropdownElement.componentInstance;
    });

    it('should render dropdown menu component', () => {
      expect(dropdownComponent).toBeTruthy();
    });

    it('should pass options to dropdown menu', () => {
      expect(dropdownComponent.options()).toEqual(component.dropdownOptions);
    });

    it('should not be disabled by default', () => {
      expect(dropdownComponent.disabled()).toBe(false);
    });
  });

  describe('Action Selection Handling', () => {
    it('should handle edit action selection', () => {
      // Arrange
      const editOption: DropdownOption = { label: 'Editar', value: 'edit', icon: '✏️' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(editOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'edit',
        productId: hostComponent.productId
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });

    it('should handle delete action selection', () => {
      // Arrange
      const deleteOption: DropdownOption = { label: 'Eliminar', value: 'delete', icon: '🗑️' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(deleteOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'delete',
        productId: hostComponent.productId
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });

    it('should emit action to host component', () => {
      // Arrange
      const editOption: DropdownOption = { label: 'Editar', value: 'edit', icon: '✏️' };

      // Act
      component.handleOptionSelected(editOption);

      // Assert
      expect(hostComponent.selectedAction).toEqual({
        type: 'edit',
        productId: hostComponent.productId
      });
    });
  });

  describe('Product ID Handling', () => {
    it('should handle different product IDs', () => {
      // Arrange
      const newProductId = 'different-product-456';
      hostComponent.productId = newProductId;
      fixture.detectChanges();

      const editOption: DropdownOption = { label: 'Editar', value: 'edit', icon: '✏️' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(editOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'edit',
        productId: newProductId
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });

    it('should handle empty product ID', () => {
      // Arrange
      hostComponent.productId = '';
      fixture.detectChanges();

      const deleteOption: DropdownOption = { label: 'Eliminar', value: 'delete', icon: '🗑️' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(deleteOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'delete',
        productId: ''
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });
  });

  describe('Dropdown Option Properties', () => {
    it('should have correct labels for options', () => {
      const editOption = component.dropdownOptions.find(opt => opt.value === 'edit');
      const deleteOption = component.dropdownOptions.find(opt => opt.value === 'delete');

      expect(editOption?.label).toBe('Editar');
      expect(deleteOption?.label).toBe('Eliminar');
    });

    it('should have correct values for options', () => {
      const editOption = component.dropdownOptions.find(opt => opt.label === 'Editar');
      const deleteOption = component.dropdownOptions.find(opt => opt.label === 'Eliminar');

      expect(editOption?.value).toBe('edit');
      expect(deleteOption?.value).toBe('delete');
    });

    it('should have icons for all options', () => {
      component.dropdownOptions.forEach(option => {
        expect(option.icon).toBeTruthy();
      });
    });

    it('should have correct icons', () => {
      const editOption = component.dropdownOptions.find(opt => opt.value === 'edit');
      const deleteOption = component.dropdownOptions.find(opt => opt.value === 'delete');

      expect(editOption?.icon).toBe('✏️');
      expect(deleteOption?.icon).toBe('🗑️');
    });
  });

  describe('Integration Tests', () => {
    it('should complete full interaction flow with edit action', () => {
      // Arrange
      const dropdownElement = fixture.debugElement.query(By.directive(DropdownMenu));
      const dropdownComponent = dropdownElement.componentInstance;

      // Act
      const editOption = component.dropdownOptions.find(opt => opt.value === 'edit')!;
      dropdownComponent.onOptionSelected.emit(editOption);

      // Assert
      expect(hostComponent.selectedAction).toEqual({
        type: 'edit',
        productId: hostComponent.productId
      });
    });

    it('should complete full interaction flow with delete action', () => {
      // Arrange
      const dropdownElement = fixture.debugElement.query(By.directive(DropdownMenu));
      const dropdownComponent = dropdownElement.componentInstance;

      // Act
      const deleteOption = component.dropdownOptions.find(opt => opt.value === 'delete')!;
      dropdownComponent.onOptionSelected.emit(deleteOption);

      // Assert
      expect(hostComponent.selectedAction).toEqual({
        type: 'delete',
        productId: hostComponent.productId
      });
    });
  });

  describe('Type Safety', () => {
    it('should emit TableAction with correct type for edit', () => {
      // Arrange
      const editOption: DropdownOption = { label: 'Editar', value: 'edit', icon: '✏️' };
      let emittedAction: TableAction | undefined;

      component.onActionSelected.subscribe((action: TableAction) => {
        emittedAction = action;
      });

      // Act
      component.handleOptionSelected(editOption);

      // Assert
      expect(emittedAction?.type).toBe('edit');
      expect(typeof emittedAction?.productId).toBe('string');
    });

    it('should emit TableAction with correct type for delete', () => {
      // Arrange
      const deleteOption: DropdownOption = { label: 'Eliminar', value: 'delete', icon: '🗑️' };
      let emittedAction: TableAction | undefined;

      component.onActionSelected.subscribe((action: TableAction) => {
        emittedAction = action;
      });

      // Act
      component.handleOptionSelected(deleteOption);

      // Assert
      expect(emittedAction?.type).toBe('delete');
      expect(typeof emittedAction?.productId).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle option with different value types (type assertion)', () => {
      // Arrange
      const customOption: DropdownOption = { label: 'Custom', value: 'edit', icon: '⚡' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(customOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'edit',
        productId: hostComponent.productId
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });

    it('should handle very long product IDs', () => {
      // Arrange
      const longProductId = 'a'.repeat(100);
      hostComponent.productId = longProductId;
      fixture.detectChanges();

      const editOption: DropdownOption = { label: 'Editar', value: 'edit', icon: '✏️' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(editOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'edit',
        productId: longProductId
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });

    it('should handle special characters in product ID', () => {
      // Arrange
      const specialProductId = 'product-123_$#@!';
      hostComponent.productId = specialProductId;
      fixture.detectChanges();

      const deleteOption: DropdownOption = { label: 'Eliminar', value: 'delete', icon: '🗑️' };
      spyOn(component.onActionSelected, 'emit');

      // Act
      component.handleOptionSelected(deleteOption);

      // Assert
      const expectedAction: TableAction = {
        type: 'delete',
        productId: specialProductId
      };
      expect(component.onActionSelected.emit).toHaveBeenCalledWith(expectedAction);
    });
  });

  describe('Component Structure', () => {
    it('should have proper template structure', () => {
      // The component should render the dropdown menu
      const dropdownMenu = fixture.debugElement.query(By.css('app-dropdown-menu'));
      expect(dropdownMenu).toBeTruthy();
    });

    it('should pass correct properties to dropdown', () => {
      const dropdownElement = fixture.debugElement.query(By.directive(DropdownMenu));
      const dropdownComponent = dropdownElement.componentInstance;

      expect(dropdownComponent.options()).toEqual(component.dropdownOptions);
      expect(dropdownComponent.disabled()).toBe(false);
    });
  });
});
