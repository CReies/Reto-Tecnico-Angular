import { Component, input, model, output, ViewChild } from '@angular/core';
import { Table } from '../../elements/table/table';
import { ITableData } from '../../../core/models/shared/ITableData';
import { Input } from '../../elements/input/input';
import { Button } from '../../elements/button/button';
import { Modal } from '../../elements/modal/modal';
import { AddProductForm } from '../../blocks/add-product-form/add-product-form';
import { IProduct } from '../../../core/models/shared/IProduct.model';
import { TableAction } from '../../elements/table-actions/table-actions';

@Component({
  selector: 'app-home-page',
  imports: [Table, Input, Button, Modal, AddProductForm],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  @ViewChild(AddProductForm) addProductForm!: AddProductForm;

  searchTerm = model<string>('');

  productTableData = input.required<ITableData>();
  productLoading = input.required<boolean>();
  productError = input.required<string | null>();

  // Modal state
  modalVisible = input.required<boolean>();

  // Events
  onShowModal = output<void>();
  onHideModal = output<void>();
  onValidateId = output<string>();
  onSubmitProduct = output<IProduct>();
  onTableAction = output<TableAction>();

  // Method to set ID validation result
  setIdExistsValidation(exists: boolean): void {
    if (this.addProductForm) {
      this.addProductForm.setIdExistsValidation(exists);
    }
  }

  // Method to set form data for editing
  setFormData(product: IProduct): void {
    if (this.addProductForm) {
      this.addProductForm.setFormData(product);
    }
  }
}
