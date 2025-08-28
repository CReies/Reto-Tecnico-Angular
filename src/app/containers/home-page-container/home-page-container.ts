import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { HomePage } from '../../ui/pages/home-page/home-page';
import { HomePageContainerFacade } from './home-page-container.facade';
import { IProduct } from '../../core/models/shared/IProduct.model';
import { TableAction } from '../../ui/elements/table-actions/table-actions';
import { Modal } from '../../ui/elements/modal/modal';
import { DeleteProductAlert } from '../../ui/blocks/delete-product-alert/delete-product-alert';
import { AddProductForm } from '../../ui/blocks/add-product-form/add-product-form';

@Component({
  selector: 'app-home-page-container',
  imports: [HomePage, Modal, DeleteProductAlert, AddProductForm],
  providers: [HomePageContainerFacade],
  templateUrl: './home-page-container.html',
})
export class HomePageContainer implements OnInit {
  @ViewChild(HomePage) homePage!: HomePage;

  protected readonly facade = inject(HomePageContainerFacade);

  async ngOnInit(): Promise<void> {
    await this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    try {
      await this.facade.loadProducts();
    } catch (error) {
      throw error;
    }
  }

  // Modal event handlers
  onShowModal(): void {
    this.facade.showModal();
  }

  onHideModal(): void {
    this.facade.hideModal();
  }

  async onValidateId(id: string): Promise<void> {
    try {
      const exists = await this.facade.validateProductId(id);
      if (this.homePage) {
        this.homePage.setIdExistsValidation(exists);
      }
    } catch (error) {
      console.error('Error validating product ID:', error);
      if (this.homePage) {
        this.homePage.setIdExistsValidation(false);
      }
    }
  }

  async onSubmitProduct(product: IProduct): Promise<void> {
    try {
      await this.facade.submitProduct(product);
    } catch (error) {
      console.error('Error submitting product:', error);
    }
  }

  onHideEditModal(): void {
    this.facade.hideEditModal();
  }

  async onSubmitEditProduct(product: IProduct): Promise<void> {
    try {
      await this.facade.updateProductFromModal(product);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  }

  async onTableAction(action: TableAction): Promise<void> {
    switch (action.type) {
      case 'edit':
        await this.handleEditProduct(action.productId);
        break;
      case 'delete':
        await this.handleDeleteProduct(action.productId);
        break;
    }
  }

  private async handleEditProduct(productId: string): Promise<void> {
    try {
      const product = this.facade.findProductById(productId);

      if (product) {
        this.facade.showEditModal(product);
      } else {
        console.error('Product not found for editing:', productId);
      }
    } catch (error) {
      console.error('Error handling edit product:', error);
    }
  }

  private async handleDeleteProduct(productId: string): Promise<void> {
    try {
      const product = this.facade.findProductById(productId);

      if (product) {
        this.facade.showDeleteModal(productId, product.name);
      } else {
        console.error('Product not found for deletion:', productId);
      }
    } catch (error) {
      console.error('Error handling delete product:', error);
    }
  }

  async onConfirmDelete(): Promise<void> {
    try {
      await this.facade.confirmDeleteProduct();
    } catch (error) {
      console.error('Error confirming delete:', error);
    }
  }

  onCancelDelete(): void {
    this.facade.hideDeleteModal();
  }
}
