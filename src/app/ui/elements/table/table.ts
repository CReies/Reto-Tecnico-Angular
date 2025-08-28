import { Component, computed, input, output, signal } from '@angular/core';
import { ITableData } from '../../../core/models/shared/ITableData';
import { Select } from '../select/select';
import { ISelectOption } from '../../../core/models/shared/ISelectOption';
import { TableActions, TableAction } from '../table-actions/table-actions';

@Component({
  selector: 'app-table',
  imports: [Select, TableActions],
  templateUrl: './table.html',
  styleUrl: './table.css'
})
export class Table {
  tableData = input.required<ITableData>();

  pageSizeOptions = input<ISelectOption[]>([
    { value: '5', label: '5' },
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' }
  ]);

  // Output for table actions
  onTableAction = output<TableAction>();

  columns = computed(() => this.tableData()?.columns ?? []);
  allRows = computed(() => this.tableData()?.data ?? []);
  totalResults = computed(() => this.allRows().length);

  pageSize = signal<number>(5);

  rows = computed(() => {
    return this.allRows().slice(0, this.pageSize());
  });

  updatePageSize(size: string): void {
    const numericSize = Number(size);

    const validSizes = this.pageSizeOptions().map(option => Number(option.value));

    if (validSizes.includes(numericSize)) {
      this.pageSize.set(numericSize);
    } else {
      this.pageSize.set(validSizes[0]);
    }
  }

  // Handle table actions
  handleTableAction(action: TableAction): void {
    this.onTableAction.emit(action);
  }
}
