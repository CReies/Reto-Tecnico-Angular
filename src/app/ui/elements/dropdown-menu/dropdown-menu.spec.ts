import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DropdownMenu, DropdownOption } from './dropdown-menu';

// Test host component to test the dropdown menu
@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [DropdownMenu],
  template: `
    <app-dropdown-menu
      [options]="options"
      [disabled]="disabled"
      (onOptionSelected)="onOptionSelected($event)">
    </app-dropdown-menu>
  `
})
class TestHostComponent {
  options: DropdownOption[] = [
    { label: 'Edit', value: 'edit', icon: 'edit' },
    { label: 'Delete', value: 'delete', icon: 'delete' },
    { label: 'View', value: 'view' }
  ];
  disabled = false;
  selectedOption: DropdownOption | null = null;

  onOptionSelected(option: DropdownOption): void {
    this.selectedOption = option;
  }
}

describe('DropdownMenu', () => {
  let component: DropdownMenu;
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let dropdownElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    dropdownElement = fixture.debugElement.query(By.directive(DropdownMenu));
    component = dropdownElement.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with closed dropdown', () => {
      expect(component.isOpen()).toBe(false);
    });

    it('should receive options input', () => {
      expect(component.options()).toEqual(hostComponent.options);
    });

    it('should initialize as not disabled', () => {
      expect(component.disabled()).toBe(false);
    });
  });

  describe('Dropdown Toggle Functionality', () => {
    it('should open dropdown when toggle is called', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(true);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should close dropdown when toggle is called and dropdown is open', () => {
      // First open the dropdown
      component.isOpen.set(true);

      const event = new Event('click');
      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(false);
    });

    it('should not toggle dropdown when disabled', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      const event = new Event('click');
      component.toggleDropdown(event);

      expect(component.isOpen()).toBe(false);
    });

    it('should close dropdown when closeDropdown is called', () => {
      component.isOpen.set(true);

      component.closeDropdown();

      expect(component.isOpen()).toBe(false);
    });
  });

  describe('Option Selection', () => {
    it('should emit selected option and close dropdown', () => {
      spyOn(component.onOptionSelected, 'emit');
      const testOption = hostComponent.options[0];
      const event = new Event('click');
      spyOn(event, 'stopPropagation');

      component.selectOption(testOption, event);

      expect(component.onOptionSelected.emit).toHaveBeenCalledWith(testOption);
      expect(component.isOpen()).toBe(false);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should trigger onOptionSelected in host component', () => {
      const testOption = hostComponent.options[1];
      const event = new Event('click');

      component.selectOption(testOption, event);

      expect(hostComponent.selectedOption).toEqual(testOption);
    });
  });

  describe('Document Click Handling', () => {
    let documentClickListener: (event: Event) => void;

    beforeEach(() => {
      // Get the click listener that was added to document
      documentClickListener = (component as any).clickListener;
    });

    it('should close dropdown when clicking outside', () => {
      component.isOpen.set(true);

      // Create a mock event that targets an element outside the dropdown
      const outsideElement = document.createElement('div');
      const event = { target: outsideElement } as any;

      spyOn(component['elementRef'].nativeElement, 'contains').and.returnValue(false);

      documentClickListener(event);

      expect(component.isOpen()).toBe(false);
    });

    it('should not close dropdown when clicking inside', () => {
      component.isOpen.set(true);

      // Create a mock event that targets an element inside the dropdown
      const insideElement = document.createElement('div');
      const event = { target: insideElement } as any;

      spyOn(component['elementRef'].nativeElement, 'contains').and.returnValue(true);

      documentClickListener(event);

      expect(component.isOpen()).toBe(true);
    });
  });

  describe('Lifecycle Hooks', () => {
    it('should add document click listener on init', () => {
      spyOn(document, 'addEventListener');

      component.ngOnInit();

      expect(document.addEventListener).toHaveBeenCalledWith('click', (component as any).clickListener);
    });

    it('should remove document click listener on destroy', () => {
      spyOn(document, 'removeEventListener');

      component.ngOnDestroy();

      expect(document.removeEventListener).toHaveBeenCalledWith('click', (component as any).clickListener);
    });
  });

  describe('Template Rendering', () => {
    it('should render all options when dropdown is open', () => {
      component.isOpen.set(true);
      fixture.detectChanges();

      const optionElements = fixture.debugElement.queryAll(By.css('.dropdown-menu-component__option'));
      expect(optionElements.length).toBe(hostComponent.options.length);
    });

    it('should not render options when dropdown is closed', () => {
      component.isOpen.set(false);
      fixture.detectChanges();

      const dropdownMenu = fixture.debugElement.query(By.css('.dropdown-menu'));
      expect(dropdownMenu).toBeFalsy();
    });

    it('should apply disabled class when disabled', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      const dropdownTrigger = fixture.debugElement.query(By.css('.dropdown-menu-component__trigger'));
      expect(dropdownTrigger.nativeElement.disabled).toBe(true);
    });

    it('should show dropdown menu when dropdown is open', () => {
      component.isOpen.set(true);
      fixture.detectChanges();

      const dropdownMenu = fixture.debugElement.query(By.css('.dropdown-menu-component'));
      expect(dropdownMenu).toBeTruthy();
    });
  });

  describe('Integration Tests', () => {
    it('should complete full interaction flow', () => {
      // Start with closed dropdown
      expect(component.isOpen()).toBe(false);

      // Click to open dropdown
      const button = fixture.debugElement.query(By.css('.dropdown-menu-component__trigger'));
      button.nativeElement.click();
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);

      // Click on an option
      const optionElements = fixture.debugElement.queryAll(By.css('.dropdown-menu-component__option'));
      expect(optionElements.length).toBeGreaterThan(0);

      optionElements[0].nativeElement.click();
      fixture.detectChanges();

      // Dropdown should be closed and option should be selected
      expect(component.isOpen()).toBe(false);
      expect(hostComponent.selectedOption).toEqual(hostComponent.options[0]);
    });

    it('should handle disabled state correctly', () => {
      hostComponent.disabled = true;
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('.dropdown-menu-component__trigger'));
      button.nativeElement.click();
      fixture.detectChanges();

      // Dropdown should remain closed when disabled
      expect(component.isOpen()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      hostComponent.options = [];
      fixture.detectChanges();

      component.isOpen.set(true);
      fixture.detectChanges();

      const optionElements = fixture.debugElement.queryAll(By.css('.dropdown-menu-component__option'));
      expect(optionElements.length).toBe(0);
    });

    it('should handle options without icons', () => {
      const optionsWithoutIcons: DropdownOption[] = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ];

      hostComponent.options = optionsWithoutIcons;
      fixture.detectChanges();

      component.isOpen.set(true);
      fixture.detectChanges();

      const optionElements = fixture.debugElement.queryAll(By.css('.dropdown-menu-component__option'));
      expect(optionElements.length).toBe(2);
    });
  });
});
