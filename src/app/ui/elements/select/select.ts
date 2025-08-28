import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ISelectOption } from '../../../core/models/shared/ISelectOption';


@Component({
  selector: 'app-select',
  imports: [FormsModule],
  templateUrl: './select.html',
  styleUrl: './select.css'
})
export class Select {
  value = model<string>('');

  label = input<string>('');
  options = input.required<ISelectOption[]>();
  placeholder = input<string>('Selecciona una opción');
  required = input<boolean>(false);
  disabled = input<boolean>(false);

  getSelectedOption(): ISelectOption | undefined {
    return this.options().find(option => option.value === this.value());
  }
}
