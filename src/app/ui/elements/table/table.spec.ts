import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Table } from './table';
import { ITableData } from '../../../core/models/shared/ITableData';
import { ISelectOption } from '../../../core/models/shared/ISelectOption';
import { TableAction } from '../table-actions/table-actions';

@Component({
  template: `<app-table [tableData]="tableData()" />`,
  imports: [Table]
})
class TestHostComponent {
  tableData = signal<ITableData>({
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' }
    ],
    data: [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' }
    ]
  });
}

@Component({
  template: `<app-table [tableData]="nullishTableData()" />`,
  imports: [Table]
})
class NullishTestHostComponent {
  nullishTableData = signal<ITableData>({
    columns: null as any,
    data: undefined as any
  });
}

@Component({
  template: `<app-table [tableData]="tableData()" [pageSizeOptions]="customPageSizeOptions()" />`,
  imports: [Table]
})
class TestHostWithCustomOptionsComponent {
  tableData = signal<ITableData>({
    columns: [
      { key: 'id', label: 'ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' }
    ],
    data: [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' }
    ]
  });

  customPageSizeOptions = signal<ISelectOption[]>([
    { value: '2', label: '2' },
    { value: '4', label: '4' },
    { value: '6', label: '6' }
  ]);
}

describe('Table', () => {
  let component: Table;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(Table)).componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly calculate total results', () => {
    // Arrange
    fixture.detectChanges();

    // Act & Assert
    expect(component.totalResults()).toBe(3);
  });

  it('should handle nullish tableData properties with fallback to empty arrays', () => {
    // Arrange - Set tableData with nullish properties
    hostComponent.tableData.set({
      columns: null as any,
      data: undefined as any
    });
    fixture.detectChanges();

    // Act & Assert - Should use empty arrays as fallback
    expect(component.columns()).toEqual([]);
    expect(component.allRows()).toEqual([]);
    expect(component.totalResults()).toBe(0);
    expect(component.rows()).toEqual([]);
  });

  describe('updatePageSize', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update page size and affect rows display', () => {
      // Act
      component.updatePageSize('10');

      // Assert
      expect(component.pageSize()).toBe(10);
      expect(component.rows()).toHaveSize(3);
    });

    it('should handle various page size values correctly', () => {
      // Test only valid page sizes from pageSizeOptions
      const testCases = [
        { input: '5', expected: 5, expectedRows: 3 },
        { input: '10', expected: 10, expectedRows: 3 },
        { input: '20', expected: 20, expectedRows: 3 },
        { input: '50', expected: 50, expectedRows: 3 }
      ];

      testCases.forEach(testCase => {
        // Act
        component.updatePageSize(testCase.input);

        // Assert
        expect(component.pageSize()).toBe(testCase.expected);
        expect(component.rows()).toHaveSize(testCase.expectedRows);
      });
    });

    it('should handle edge cases properly and set default value of 5', () => {
      // Test edge case: zero (should default to 5)
      component.updatePageSize('0');
      expect(component.pageSize()).toBe(5);
      expect(component.rows()).toHaveSize(3);

      // Test edge case: negative number (should default to 5)
      component.updatePageSize('-1');
      expect(component.pageSize()).toBe(5);
      expect(component.rows()).toHaveSize(3);

      // Test edge case: decimal number (should default to 5)
      component.updatePageSize('2.5');
      expect(component.pageSize()).toBe(5);

      // Test edge case: invalid string (should default to 5)
      component.updatePageSize('invalid');
      expect(component.pageSize()).toBe(5);
    });

    it('should accept only valid pageSizeOptions or default to first option', () => {
      // Test valid page sizes from pageSizeOptions: '5', '10', '20', '50'
      const validSizes = ['5', '10', '20', '50'];

      validSizes.forEach(size => {
        // Act
        component.updatePageSize(size);

        // Assert
        expect(component.pageSize()).toBe(Number(size));
      });

      // Test invalid values (including valid integers not in options)
      const invalidSizes = ['0', '-1', '1', '2', '3', '15', '25', '100', '2.5', '3.14', 'abc', '', ' '];

      invalidSizes.forEach(invalidSize => {
        // Act
        component.updatePageSize(invalidSize);

        // Assert - Should default to first option (5)
        expect(component.pageSize()).toBe(5);
      });
    });

    it('should validate against actual pageSizeOptions values', () => {
      // Arrange
      const pageSizeOptions = component.pageSizeOptions();
      const validValues = pageSizeOptions.map(option => option.value);

      // Assert
      expect(validValues).toEqual(['5', '10', '20', '50']);

      // Test each valid option
      validValues.forEach(value => {
        // Act
        component.updatePageSize(value);

        // Assert
        expect(component.pageSize()).toBe(Number(value));
      });

      // Test that values not in options are rejected
      const invalidButPositiveValues = ['1', '3', '7', '15', '25', '30', '100'];

      invalidButPositiveValues.forEach(value => {
        // Act
        component.updatePageSize(value);

        // Assert
        expect(component.pageSize()).toBe(5);
      });
    });

    it('should maintain data integrity when changing page size', () => {
      // Arrange
      const originalData = component.allRows();
      const originalTotal = component.totalResults();

      // Act
      component.updatePageSize('10');

      // Assert - Data integrity should be maintained
      expect(component.allRows()).toEqual(originalData);
      expect(component.totalResults()).toBe(originalTotal);
      expect(component.rows()).toHaveSize(3); // All 3 items since 10 > 3

      // Act - Change to a larger page size
      component.updatePageSize('20');

      // Assert - All data should still be visible
      expect(component.allRows()).toEqual(originalData);
      expect(component.totalResults()).toBe(originalTotal);
      expect(component.rows()).toHaveSize(3); // All 3 items since 20 > 3
    });
  });
});

describe('Table with Custom Page Size Options', () => {
  let component: Table;
  let hostComponent: TestHostWithCustomOptionsComponent;
  let fixture: ComponentFixture<TestHostWithCustomOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostWithCustomOptionsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostWithCustomOptionsComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(Table)).componentInstance;
    fixture.detectChanges();
  });

  it('should use custom page size options', () => {
    // Arrange
    const customOptions = component.pageSizeOptions();
    const expectedValues = ['2', '4', '6'];

    // Assert
    expect(customOptions).toHaveSize(3);
    expect(customOptions.map(option => option.value)).toEqual(expectedValues);
  });

  it('should validate against custom page size options', () => {
    // Test valid custom options
    component.updatePageSize('2');
    expect(component.pageSize()).toBe(2);
    expect(component.rows()).toHaveSize(2);

    component.updatePageSize('4');
    expect(component.pageSize()).toBe(4);
    expect(component.rows()).toHaveSize(3);

    component.updatePageSize('6');
    expect(component.pageSize()).toBe(6);
    expect(component.rows()).toHaveSize(3);
  });

  it('should reject values not in custom options and default to first custom option', () => {
    // Test standard values that are not in custom options
    component.updatePageSize('5');
    expect(component.pageSize()).toBe(2);

    component.updatePageSize('10');
    expect(component.pageSize()).toBe(2);

    // Test invalid values
    component.updatePageSize('0');
    expect(component.pageSize()).toBe(2);

    component.updatePageSize('invalid');
    expect(component.pageSize()).toBe(2);
  });
});

describe('Table with Nullish Table Data', () => {
  let component: Table;
  let hostComponent: NullishTestHostComponent;
  let fixture: ComponentFixture<NullishTestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NullishTestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NullishTestHostComponent);
    hostComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(Table)).componentInstance;
    fixture.detectChanges();
  });

  it('should handle nullish tableData properties with nullish coalescing fallbacks', () => {
    // Assert - columns should use ?? [] fallback
    expect(component.columns()).toEqual([]);

    // Assert - allRows should use ?? [] fallback
    expect(component.allRows()).toEqual([]);

    // Assert - computed properties should work with empty arrays
    expect(component.totalResults()).toBe(0);
    expect(component.rows()).toEqual([]);
  });

  it('should handle dynamic changes to nullish values', () => {
    // Arrange - Start with nullish values
    expect(component.columns()).toEqual([]);
    expect(component.allRows()).toEqual([]);

    // Act - Change to valid data
    hostComponent.nullishTableData.set({
      columns: [{ key: 'test', label: 'Test', type: 'text' }],
      data: [{ test: 'value' }]
    });
    fixture.detectChanges();

    // Assert - Should now have valid data
    expect(component.columns()).toHaveSize(1);
    expect(component.allRows()).toHaveSize(1);
    expect(component.totalResults()).toBe(1);

    // Act - Change back to nullish
    hostComponent.nullishTableData.set({
      columns: null as any,
      data: undefined as any
    });
    fixture.detectChanges();

    // Assert - Should fall back to empty arrays again
    expect(component.columns()).toEqual([]);
    expect(component.allRows()).toEqual([]);
    expect(component.totalResults()).toBe(0);
  });

  describe('handleTableAction', () => {
    it('should emit table action when handleTableAction is called', () => {
      // Arrange
      const mockAction: TableAction = {
        type: 'edit',
        productId: 'PROD001'
      };
      spyOn(component.onTableAction, 'emit');

      // Act
      component.handleTableAction(mockAction);

      // Assert
      expect(component.onTableAction.emit).toHaveBeenCalledWith(mockAction);
    });

    it('should emit delete action correctly', () => {
      // Arrange
      const deleteAction: TableAction = {
        type: 'delete',
        productId: 'PROD002'
      };
      spyOn(component.onTableAction, 'emit');

      // Act
      component.handleTableAction(deleteAction);

      // Assert
      expect(component.onTableAction.emit).toHaveBeenCalledWith(deleteAction);
    });

    it('should emit edit action correctly', () => {
      // Arrange
      const editAction: TableAction = {
        type: 'edit',
        productId: 'PROD003'
      };
      spyOn(component.onTableAction, 'emit');

      // Act
      component.handleTableAction(editAction);

      // Assert
      expect(component.onTableAction.emit).toHaveBeenCalledWith(editAction);
    });

    it('should handle different product IDs', () => {
      // Arrange
      const actions: TableAction[] = [
        { type: 'edit', productId: 'PROD001' },
        { type: 'delete', productId: 'PROD002' },
        { type: 'edit', productId: 'PROD003' }
      ];
      spyOn(component.onTableAction, 'emit');

      // Act & Assert
      actions.forEach(action => {
        component.handleTableAction(action);
        expect(component.onTableAction.emit).toHaveBeenCalledWith(action);
      });

      expect(component.onTableAction.emit).toHaveBeenCalledTimes(3);
    });

    it('should handle empty product ID', () => {
      // Arrange
      const actionWithEmptyId: TableAction = {
        type: 'edit',
        productId: ''
      };
      spyOn(component.onTableAction, 'emit');

      // Act
      component.handleTableAction(actionWithEmptyId);

      // Assert
      expect(component.onTableAction.emit).toHaveBeenCalledWith(actionWithEmptyId);
    });

    it('should handle special characters in product ID', () => {
      // Arrange
      const actionWithSpecialChars: TableAction = {
        type: 'delete',
        productId: 'PROD-123_$#@!'
      };
      spyOn(component.onTableAction, 'emit');

      // Act
      component.handleTableAction(actionWithSpecialChars);

      // Assert
      expect(component.onTableAction.emit).toHaveBeenCalledWith(actionWithSpecialChars);
    });
  });
});
