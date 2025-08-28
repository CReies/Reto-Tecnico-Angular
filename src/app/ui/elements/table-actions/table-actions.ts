import { Component, input, output } from '@angular/core';
import { DropdownMenu, DropdownOption } from '../dropdown-menu/dropdown-menu';

export interface TableAction {
  type: 'edit' | 'delete';
  productId: string;
}

@Component({
  selector: 'app-table-actions',
  standalone: true,
  imports: [DropdownMenu],
  templateUrl: './table-actions.html',
  styleUrl: './table-actions.css'
})
export class TableActions {
  // Input properties
  productId = input.required<string>();

  // Output events
  onActionSelected = output<TableAction>();

  // Dropdown options
  readonly dropdownOptions: DropdownOption[] = [
    { label: 'Editar', value: 'edit', icon: '✏️' },
    { label: 'Eliminar', value: 'delete', icon: '🗑️' }
  ];

  // Handle option selection
  handleOptionSelected(option: DropdownOption): void {
    const action: TableAction = {
      type: option.value as 'edit' | 'delete',
      productId: this.productId()
    };

    this.onActionSelected.emit(action);
  }
}
