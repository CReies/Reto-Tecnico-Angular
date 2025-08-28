import { Component, input, output } from '@angular/core';
import { Button } from '../../elements/button/button';

@Component({
  selector: 'app-delete-product-alert',
  standalone: true,
  imports: [Button],
  templateUrl: './delete-product-alert.html',
  styleUrl: './delete-product-alert.css'
})
export class DeleteProductAlert {
  productName = input.required<string>();

  onCancel = output<void>();
  onConfirm = output<void>();

  handleCancel(): void {
    this.onCancel.emit();
  }

  handleConfirm(): void {
    this.onConfirm.emit();
  }
}
