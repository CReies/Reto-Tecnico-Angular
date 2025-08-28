import { IProduct } from "../../models/shared/IProduct.model";
import { ITableData } from "../../models/shared/ITableData";

export class ProductsToTableMapper {
  public static mapToTable(products: IProduct[]): ITableData {
    return {
      columns: [
        { key: 'logo', label: 'Logo', type: 'image' },
        { key: 'name', label: 'Nombre del producto', type: 'text' },
        { key: 'description', label: 'Descripción', type: 'text' },
        { key: 'date_released', label: 'Fecha de liberación', type: 'text' },
        { key: 'date_revision', label: 'Fecha de reestructuración', type: 'text' },
        { key: 'actions', label: 'Acciones', type: 'actions' }
      ],
      data: products.map(product => ({
        ...product,
        date_released: this.formatDate(product.date_released),
        date_revision: this.formatDate(product.date_revision),
        actions: product.id
      }))
    };
  }

  private static formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
