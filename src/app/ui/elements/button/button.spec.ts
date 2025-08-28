import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';

import { Button } from './button';

@Component({
  template: `
    <app-button
      [label]="label()"
      [type]="type()"
      [disabled]="disabled()"
      (clicked)="onButtonClick()">
    </app-button>
  `,
  standalone: true,
  imports: [Button]
})
class TestHostComponent {
  label = signal('Test Button');
  type = signal<'button' | 'submit' | 'reset'>('button');
  disabled = signal(false);
  clickCount = 0;

  onButtonClick(): void {
    this.clickCount++;
  }
}

@Component({
  template: `<app-button [label]="'Test Label'"></app-button>`,
  standalone: true,
  imports: [Button]
})
class MinimalTestHostComponent { }

describe('Button', () => {
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button, TestHostComponent, MinimalTestHostComponent]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      // Arrange & Act
      hostFixture.detectChanges();
      const buttonComponent = hostFixture.debugElement.query(By.directive(Button)).componentInstance;

      // Assert
      expect(buttonComponent).toBeTruthy();
    });

    it('should initialize with default values when minimal inputs provided', () => {
      // Arrange
      const minimalFixture = TestBed.createComponent(MinimalTestHostComponent);

      // Act
      minimalFixture.detectChanges();
      const buttonComponent = minimalFixture.debugElement.query(By.directive(Button)).componentInstance;

      // Assert
      expect(buttonComponent.label()).toBe('Test Label');
      expect(buttonComponent.type()).toBe('button');
      expect(buttonComponent.disabled()).toBe(false);
    });
  });

  describe('Input Properties', () => {
    it('should accept and display label input', () => {
      // Arrange
      const testLabel = 'Click Me';
      hostComponent.label.set(testLabel);

      // Act
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Assert
      expect(buttonElement.nativeElement.textContent.trim()).toBe(testLabel);
    });

    it('should set button type correctly', () => {
      // Arrange
      hostComponent.type.set('submit');

      // Act
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Assert
      expect(buttonElement.nativeElement.type).toBe('submit');
    });

    it('should disable button when disabled is true', () => {
      // Arrange
      hostComponent.disabled.set(true);

      // Act
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Assert
      expect(buttonElement.nativeElement.disabled).toBe(true);
    });

    it('should apply basic CSS class correctly', () => {
      // Arrange
      hostFixture.detectChanges();

      // Act
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Assert
      expect(buttonElement.nativeElement.className).toBe('btn');
    });
  });

  describe('Click Handling', () => {
    it('should emit clicked event when button is clicked', () => {
      // Arrange
      hostFixture.detectChanges();
      const buttonComponent = hostFixture.debugElement.query(By.directive(Button)).componentInstance;
      spyOn(buttonComponent.clicked, 'emit');
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      buttonElement.nativeElement.click();

      // Assert
      expect(buttonComponent.clicked.emit).toHaveBeenCalledOnceWith();
    });

    it('should not emit clicked event when button is disabled', () => {
      // Arrange
      hostComponent.disabled.set(true);
      hostFixture.detectChanges();
      const buttonComponent = hostFixture.debugElement.query(By.directive(Button)).componentInstance;
      spyOn(buttonComponent.clicked, 'emit');
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      buttonElement.nativeElement.click();

      // Assert
      expect(buttonComponent.clicked.emit).not.toHaveBeenCalled();
    });

    it('should call handleClick method when button is clicked', () => {
      // Arrange
      hostFixture.detectChanges();
      const buttonComponent = hostFixture.debugElement.query(By.directive(Button)).componentInstance;
      spyOn(buttonComponent, 'handleClick');
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      buttonElement.nativeElement.click();

      // Assert
      expect(buttonComponent.handleClick).toHaveBeenCalledOnceWith();
    });
  });

  describe('Host Component Integration', () => {
    it('should pass all properties correctly through host component', () => {
      // Arrange
      hostComponent.label.set('Integration Test');
      hostComponent.type.set('submit');
      hostComponent.disabled.set(true);

      // Act
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Assert
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Integration Test');
      expect(buttonElement.nativeElement.type).toBe('submit');
      expect(buttonElement.nativeElement.disabled).toBe(true);
      expect(buttonElement.nativeElement.className).toBe('btn');
    });

    it('should trigger host component click handler', () => {
      // Arrange
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      buttonElement.nativeElement.click();

      // Assert
      expect(hostComponent.clickCount).toBe(1);
    });

    it('should handle multiple clicks correctly', () => {
      // Arrange
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      buttonElement.nativeElement.click();
      buttonElement.nativeElement.click();
      buttonElement.nativeElement.click();

      // Assert
      expect(hostComponent.clickCount).toBe(3);
    });

    it('should not trigger click when disabled through host component', () => {
      // Arrange
      hostComponent.disabled.set(true);
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      buttonElement.nativeElement.click();

      // Assert
      expect(hostComponent.clickCount).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty label gracefully', () => {
      // Arrange
      hostComponent.label.set('');

      // Act
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Assert
      expect(buttonElement.nativeElement.textContent.trim()).toBe('');
    });

    it('should handle all button types', () => {
      const types: Array<'button' | 'submit' | 'reset'> = ['button', 'submit', 'reset'];

      types.forEach(type => {
        // Arrange
        hostComponent.type.set(type);

        // Act
        hostFixture.detectChanges();
        const buttonElement = hostFixture.debugElement.query(By.css('button'));

        // Assert
        expect(buttonElement.nativeElement.type).toBe(type);
      });
    });

    it('should handle dynamic label changes', () => {
      // Arrange
      hostComponent.label.set('Initial Label');
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      hostComponent.label.set('Updated Label');
      hostFixture.detectChanges();

      // Assert
      expect(buttonElement.nativeElement.textContent.trim()).toBe('Updated Label');
    });

    it('should handle enable/disable state changes', () => {
      // Arrange
      hostComponent.disabled.set(false);
      hostFixture.detectChanges();
      const buttonElement = hostFixture.debugElement.query(By.css('button'));

      // Act
      hostComponent.disabled.set(true);
      hostFixture.detectChanges();

      // Assert
      expect(buttonElement.nativeElement.disabled).toBe(true);

      // Act
      hostComponent.disabled.set(false);
      hostFixture.detectChanges();

      // Assert
      expect(buttonElement.nativeElement.disabled).toBe(false);
    });
  });
});
