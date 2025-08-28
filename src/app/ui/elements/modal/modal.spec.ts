import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Modal } from './modal';

@Component({
  template: `
    <app-modal
      [visible]="visible()"
      (onClose)="handleClose()">
      <h2>Test Modal Content</h2>
      <p>This is the modal body content for testing</p>
    </app-modal>
  `,
  standalone: true,
  imports: [Modal]
})
class TestHostComponent {
  visible = signal(false);
  closeCallCount = 0;

  handleClose(): void {
    this.closeCallCount++;
    this.visible.set(false);
  }
}

@Component({
  template: `<app-modal></app-modal>`,
  standalone: true,
  imports: [Modal]
})
class MinimalTestHostComponent { }

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Modal, TestHostComponent, MinimalTestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create', () => {
      // Arrange & Act
      fixture.detectChanges();

      // Assert
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      // Arrange
      const minimalFixture = TestBed.createComponent(MinimalTestHostComponent);

      // Act
      minimalFixture.detectChanges();
      const modalComponent = minimalFixture.debugElement.query(By.directive(Modal)).componentInstance;

      // Assert
      expect(modalComponent.visible()).toBe(false);
    });
  });

  describe('Visibility Control', () => {
    it('should not display modal when visible is false', () => {
      // Arrange
      hostComponent.visible.set(false);

      // Act
      hostFixture.detectChanges();
      const modalBackdrop = hostFixture.debugElement.query(By.css('.modal-component'));

      // Assert
      expect(modalBackdrop).toBeNull();
    });

    it('should display modal when visible is true', () => {
      // Arrange
      hostComponent.visible.set(true);

      // Act
      hostFixture.detectChanges();
      const modalBackdrop = hostFixture.debugElement.query(By.css('.modal-component'));

      // Assert
      expect(modalBackdrop).toBeTruthy();
    });

    it('should display projected content when visible', () => {
      // Arrange
      hostComponent.visible.set(true);

      // Act
      hostFixture.detectChanges();
      const modalBody = hostFixture.debugElement.query(By.css('.modal-component__body'));

      // Assert
      expect(modalBody).toBeTruthy();
      expect(modalBody.nativeElement.textContent).toContain('Test Modal Content');
      expect(modalBody.nativeElement.textContent).toContain('This is the modal body content for testing');
    });
  });

  describe('Close Functionality', () => {
    it('should emit onClose when close button is clicked', () => {
      // Arrange
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      const closeButton = hostFixture.debugElement.query(By.css('.modal-component__close-button'));

      // Act
      closeButton.nativeElement.click();

      // Assert
      expect(hostComponent.closeCallCount).toBe(1);
    });

    it('should emit onClose when backdrop is clicked', () => {
      // Arrange
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      const backdrop = hostFixture.debugElement.query(By.css('.modal-component'));

      // Act
      backdrop.nativeElement.click();

      // Assert
      expect(hostComponent.closeCallCount).toBe(1);
    });

    it('should not close when modal container is clicked', () => {
      // Arrange
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      const modalContainer = hostFixture.debugElement.query(By.css('.modal-component__container'));

      // Act
      modalContainer.nativeElement.click();

      // Assert
      expect(hostComponent.closeCallCount).toBe(0);
    });

    it('should emit onClose when escape key is pressed', () => {
      // Arrange
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      const backdrop = hostFixture.debugElement.query(By.css('.modal-component'));
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });

      // Act
      backdrop.nativeElement.dispatchEvent(escapeEvent);

      // Assert
      expect(hostComponent.closeCallCount).toBe(1);
    });

    it('should not close when non-escape key is pressed', () => {
      // Arrange
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      const backdrop = hostFixture.debugElement.query(By.css('.modal-component'));
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });

      // Act
      backdrop.nativeElement.dispatchEvent(enterEvent);

      // Assert
      expect(hostComponent.closeCallCount).toBe(0);
    });
  });

  describe('Modal Structure', () => {
    it('should render close button with correct attributes', () => {
      // Arrange
      hostComponent.visible.set(true);

      // Act
      hostFixture.detectChanges();
      const closeButton = hostFixture.debugElement.query(By.css('.modal-component__close-button'));

      // Assert
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.type).toBe('button');
      expect(closeButton.nativeElement.getAttribute('aria-label')).toBe('Close modal');
      expect(closeButton.nativeElement.textContent.trim()).toBe('✕');
    });

    it('should render modal with correct CSS classes', () => {
      // Arrange
      hostComponent.visible.set(true);

      // Act
      hostFixture.detectChanges();
      const backdrop = hostFixture.debugElement.query(By.css('.modal-component'));
      const container = hostFixture.debugElement.query(By.css('.modal-component__container'));
      const header = hostFixture.debugElement.query(By.css('.modal-component__header'));
      const body = hostFixture.debugElement.query(By.css('.modal-component__body'));

      // Assert
      expect(backdrop).toBeTruthy();
      expect(container).toBeTruthy();
      expect(header).toBeTruthy();
      expect(body).toBeTruthy();
    });

    it('should set focus attributes correctly', () => {
      // Arrange
      hostComponent.visible.set(true);

      // Act
      hostFixture.detectChanges();
      const backdrop = hostFixture.debugElement.query(By.css('.modal-component'));

      // Assert
      expect(backdrop.nativeElement.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete open and close workflow', () => {
      // Arrange
      expect(hostComponent.closeCallCount).toBe(0);

      // Act - Open modal
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      let modalBackdrop = hostFixture.debugElement.query(By.css('.modal-component'));

      // Assert - Modal is open
      expect(modalBackdrop).toBeTruthy();

      // Act - Close modal via button
      const closeButton = hostFixture.debugElement.query(By.css('.modal-component__close-button'));
      closeButton.nativeElement.click();

      // Assert - Close event emitted and modal state updated
      expect(hostComponent.closeCallCount).toBe(1);
      expect(hostComponent.visible()).toBe(false);

      // Act - Check DOM after close
      hostFixture.detectChanges();
      modalBackdrop = hostFixture.debugElement.query(By.css('.modal-component'));

      // Assert - Modal is hidden
      expect(modalBackdrop).toBeNull();
    });

    it('should handle dynamic content changes', () => {
      // Arrange
      hostComponent.visible.set(true);
      hostFixture.detectChanges();

      // Act
      const initialContent = hostFixture.debugElement.query(By.css('.modal-component__body')).nativeElement.textContent;

      // Assert
      expect(initialContent).toContain('Test Modal Content');
      expect(initialContent).toContain('This is the modal body content for testing');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid open/close toggles', () => {
      // Arrange & Act
      hostComponent.visible.set(true);
      hostFixture.detectChanges();
      hostComponent.visible.set(false);
      hostFixture.detectChanges();
      hostComponent.visible.set(true);
      hostFixture.detectChanges();

      // Assert
      const modalBackdrop = hostFixture.debugElement.query(By.css('.modal-component'));
      expect(modalBackdrop).toBeTruthy();
    });

    it('should handle escape key when modal is not visible', () => {
      // Arrange
      hostComponent.visible.set(false);
      hostFixture.detectChanges();
      const modalComponent = hostFixture.debugElement.query(By.directive(Modal)).componentInstance;

      // Act
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      modalComponent.onEscapeKey(escapeEvent);

      // Assert
      expect(hostComponent.closeCallCount).toBe(0);
    });
  });
});
