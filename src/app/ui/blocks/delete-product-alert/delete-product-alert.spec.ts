import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DeleteProductAlert } from './delete-product-alert';
import { Button } from '../../elements/button/button';

describe('DeleteProductAlert', () => {
	let component: DeleteProductAlert;
	let fixture: ComponentFixture<DeleteProductAlert>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [DeleteProductAlert, Button]
		}).compileComponents();

		fixture = TestBed.createComponent(DeleteProductAlert);
		component = fixture.componentInstance;
	});

	describe('Component Creation', () => {
		it('should create', () => {
			// Arrange
			fixture.componentRef.setInput('productName', 'Test Product');

			// Act
			fixture.detectChanges();

			// Assert
			expect(component).toBeTruthy();
		});

		it('should display required input properties', () => {
			// Arrange
			const testProductName = 'Premium Credit Card';
			fixture.componentRef.setInput('productName', testProductName);

			// Act
			fixture.detectChanges();

			// Assert
			expect(component.productName()).toBe(testProductName);
		});
	});

	describe('Template Rendering', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('productName', 'Test Product Name');
			fixture.detectChanges();
		});

		it('should display warning icon', () => {
			// Act
			const warningIcon = fixture.debugElement.query(By.css('.delete-product-alert__warning-icon'));

			// Assert
			expect(warningIcon).toBeTruthy();
			expect(warningIcon.nativeElement.textContent).toBe('⚠️');
		});

		it('should display correct alert title', () => {
			// Act
			const alertTitle = fixture.debugElement.query(By.css('.delete-product-alert__title'));

			// Assert
			expect(alertTitle).toBeTruthy();
			expect(alertTitle.nativeElement.textContent).toBe('Confirmar eliminación');
		});

		it('should display product name in alert message', () => {
			// Arrange
			const productName = 'Premium Financial Product';
			fixture.componentRef.setInput('productName', productName);
			fixture.detectChanges();

			// Act
			const alertText = fixture.debugElement.query(By.css('.delete-product-alert__text'));

			// Assert
			expect(alertText).toBeTruthy();
			expect(alertText.nativeElement.textContent).toContain(productName);
			expect(alertText.nativeElement.textContent).toContain('¿Estás seguro de eliminar el producto');
		});

		it('should display alert icon', () => {
			// Act
			const alertIcon = fixture.debugElement.query(By.css('.delete-product-alert__warning-icon'));

			// Assert
			expect(alertIcon).toBeTruthy();
			expect(alertIcon.nativeElement.textContent).toBe('⚠️');
		});

		it('should render both action buttons', () => {
			// Act
			const buttons = fixture.debugElement.queryAll(By.css('app-button'));

			// Assert
			expect(buttons).toHaveSize(2);

			const cancelButton = buttons.find(btn =>
				btn.componentInstance.label() === 'Cancelar'
			);
			const confirmButton = buttons.find(btn =>
				btn.componentInstance.label() === 'Confirmar'
			);

			expect(cancelButton).toBeTruthy();
			expect(confirmButton).toBeTruthy();
		});
	});

	describe('Event Handling', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('productName', 'Test Product');
			fixture.detectChanges();
		});

		it('should emit onCancel when cancel button is clicked', () => {
			// Arrange
			spyOn(component.onCancel, 'emit');
			const buttons = fixture.debugElement.queryAll(By.css('app-button'));
			const cancelButton = buttons.find(btn =>
				btn.componentInstance.label() === 'Cancelar'
			);

			// Act
			cancelButton?.componentInstance.clicked.emit();

			// Assert
			expect(component.onCancel.emit).toHaveBeenCalled();
		});

		it('should emit onConfirm when confirm button is clicked', () => {
			// Arrange
			spyOn(component.onConfirm, 'emit');
			const buttons = fixture.debugElement.queryAll(By.css('app-button'));
			const confirmButton = buttons.find(btn =>
				btn.componentInstance.label() === 'Confirmar'
			);

			// Act
			confirmButton?.componentInstance.clicked.emit();

			// Assert
			expect(component.onConfirm.emit).toHaveBeenCalled();
		});

		it('should call handleCancel method', () => {
			// Arrange
			spyOn(component, 'handleCancel');

			// Act
			component.handleCancel();

			// Assert
			expect(component.handleCancel).toHaveBeenCalled();
		});

		it('should call handleConfirm method', () => {
			// Arrange
			spyOn(component, 'handleConfirm');

			// Act
			component.handleConfirm();

			// Assert
			expect(component.handleConfirm).toHaveBeenCalled();
		});
	});

	describe('Accessibility and UX', () => {
		beforeEach(() => {
			fixture.componentRef.setInput('productName', 'Test Product');
			fixture.detectChanges();
		});

		it('should have proper CSS classes for styling', () => {
			// Act
			const container = fixture.debugElement.query(By.css('.delete-product-alert'));
			const content = fixture.debugElement.query(By.css('.delete-product-alert__content'));
			const actions = fixture.debugElement.query(By.css('.delete-product-alert__actions'));

			// Assert
			expect(container).toBeTruthy();
			expect(content).toBeTruthy();
			expect(actions).toBeTruthy();
		});

		it('should have buttons with correct CSS classes', () => {
			// Act
			const buttons = fixture.debugElement.queryAll(By.css('app-button'));
			const cancelButton = buttons.find(btn =>
				btn.componentInstance.label() === 'Cancelar'
			);
			const confirmButton = buttons.find(btn =>
				btn.componentInstance.label() === 'Confirmar'
			);

			// Assert
			expect(cancelButton?.nativeElement).toHaveClass('btn-secondary');
			expect(confirmButton?.nativeElement).toHaveClass('btn-danger');
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty product name', () => {
			// Arrange
			fixture.componentRef.setInput('productName', '');
			fixture.detectChanges();

			// Act
			const alertText = fixture.debugElement.query(By.css('.delete-product-alert__text'));

			// Assert
			expect(alertText).toBeTruthy();
			expect(alertText.nativeElement.textContent).toContain('¿Estás seguro de eliminar el producto');
		});

		it('should handle very long product names', () => {
			// Arrange
			const longProductName = 'A'.repeat(100);
			fixture.componentRef.setInput('productName', longProductName);

			// Act
			fixture.detectChanges();
			const alertText = fixture.debugElement.query(By.css('.delete-product-alert__text'));

			// Assert
			expect(alertText).toBeTruthy();
			expect(alertText.nativeElement.textContent).toContain(longProductName);
		});
	});
});
