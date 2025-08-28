import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '../../elements/input/input';
import { Button } from '../../elements/button/button';
import { IProduct } from '../../../core/models/shared/IProduct.model';

interface FormErrors {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_released: string;
  date_revision: string;
}

interface FormData {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_released: string;
  date_revision: string;
}

@Component({
  selector: 'app-add-product-form',
  standalone: true,
  imports: [CommonModule, Input, Button],
  templateUrl: './add-product-form.html',
  styleUrl: './add-product-form.css'
})
export class AddProductForm {
  // Input properties
  loading = input<boolean>(false);
  isEditMode = input<boolean>(false);
  initialProduct = input<IProduct | null>(null);

  // Output events
  onSubmit = output<IProduct>();
  onValidateId = output<string>();

  // Form data signals
  formData = signal<FormData>({
    id: '',
    name: '',
    description: '',
    logo: '',
    date_released: '',
    date_revision: ''
  });

  // Validation errors
  errors = signal<FormErrors>({
    id: '',
    name: '',
    description: '',
    logo: '',
    date_released: '',
    date_revision: ''
  });

  // ID validation state
  idExists = signal<boolean>(false);
  idValidating = signal<boolean>(false);

  isFormValid = computed(() => {
    const currentErrors = this.errors();
    const currentData = this.formData();

    const hasAllValues = Object.values(currentData).every(value => value.trim() !== '');
    const hasNoErrors = Object.values(currentErrors).every(error => error === '');

    return hasAllValues && hasNoErrors && !this.idExists();
  });

  hasFormErrors = computed(() => {
    const currentErrors = this.errors();
    return Object.values(currentErrors).some(error => error !== '');
  });

  constructor() {
    effect(() => {
      const product = this.initialProduct();
      const isEdit = this.isEditMode();

      if (isEdit && product) {
        this.setFormData(product);
      } else if (!isEdit) {
        this.resetForm();
      }
    });
  }

  updateFormField(field: keyof FormData, value: string): void {
    this.formData.update(data => ({
      ...data,
      [field]: value
    }));

    if (field === 'date_released' && value) {
      const revisionDate = this.calculateRevisionDate(value);
      this.formData.update(data => ({
        ...data,
        date_revision: revisionDate
      }));
    }

    this.validateField(field, value);

    if (field === 'id' && value.length >= 3 && !this.isEditMode()) {
      this.validateIdExists(value);
    }
  }

  validateField(field: keyof FormData, value: string): void {
    let error = '';

    switch (field) {
      case 'id':
        if (!value.trim()) {
          error = 'El ID es requerido';
        } else if (value.length < 3) {
          error = 'El ID debe tener mínimo 3 caracteres';
        } else if (value.length > 10) {
          error = 'El ID debe tener máximo 10 caracteres';
        } else if (!this.isEditMode() && this.idExists()) {
          error = 'Este ID ya existe';
        }
        break;

      case 'name':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.length < 5) {
          error = 'El nombre debe tener mínimo 5 caracteres';
        } else if (value.length > 100) {
          error = 'El nombre debe tener máximo 100 caracteres';
        }
        break;

      case 'description':
        if (!value.trim()) {
          error = 'La descripción es requerida';
        } else if (value.length < 10) {
          error = 'La descripción debe tener mínimo 10 caracteres';
        } else if (value.length > 200) {
          error = 'La descripción debe tener máximo 200 caracteres';
        }
        break;

      case 'logo':
        if (!value.trim()) {
          error = 'El logo es requerido';
        }
        break;

      case 'date_released':
        if (!value) {
          error = 'La fecha de liberación es requerida';
        } else {
          const selectedDate = new Date(value + 'T00:00:00');
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            error = 'La fecha debe ser igual o mayor a la fecha actual';
          }
        }
        break;

      case 'date_revision':
        if (!value) {
          error = 'La fecha de revisión es requerida';
        }
        break;
    }

    this.errors.update(errors => ({
      ...errors,
      [field]: error
    }));
  }

  calculateRevisionDate(releaseDate: string): string {
    if (!releaseDate) return '';

    const date = new Date(releaseDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  }

  validateIdExists(id: string): void {
    this.idValidating.set(true);
    this.onValidateId.emit(id);
  }

  setIdExistsValidation(exists: boolean): void {
    this.idExists.set(exists);
    this.idValidating.set(false);

    this.validateField('id', this.formData().id);
  }

  setFormData(product: IProduct): void {
    this.formData.set({
      id: product.id,
      name: product.name,
      description: product.description,
      logo: product.logo,
      date_released: product.date_released.toISOString().split('T')[0],
      date_revision: product.date_revision.toISOString().split('T')[0]
    });

    this.errors.set({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_released: '',
      date_revision: ''
    });

    this.idExists.set(false);
    this.idValidating.set(false);
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Reset form
  resetForm(): void {
    this.formData.set({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_released: '',
      date_revision: ''
    });

    this.errors.set({
      id: '',
      name: '',
      description: '',
      logo: '',
      date_released: '',
      date_revision: ''
    });

    this.idExists.set(false);
    this.idValidating.set(false);
  }

  // Submit form
  submitForm(): void {
    if (!this.isFormValid()) {
      Object.keys(this.formData()).forEach(key => {
        this.validateField(key as keyof FormData, this.formData()[key as keyof FormData]);
      });
      return;
    }

    const data = this.formData();
    const product: IProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      logo: data.logo,
      date_released: new Date(data.date_released),
      date_revision: new Date(data.date_revision)
    };

    this.onSubmit.emit(product);
  }
}
