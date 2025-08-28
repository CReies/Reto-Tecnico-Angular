import { Component, input, output, signal, OnInit, OnDestroy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.html',
  styleUrl: './dropdown-menu.css'
})
export class DropdownMenu implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);

  // Input properties
  options = input.required<DropdownOption[]>();
  disabled = input<boolean>(false);

  // Output events
  onOptionSelected = output<DropdownOption>();

  // Internal state
  isOpen = signal<boolean>(false);

  private clickListener: (event: Event) => void;

  constructor() {
    this.clickListener = this.handleDocumentClick.bind(this);
  }

  ngOnInit(): void {
    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  // Toggle dropdown
  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.isOpen.set(!this.isOpen());
    }
  }

  // Close dropdown
  closeDropdown(): void {
    this.isOpen.set(false);
  }

  // Select option
  selectOption(option: DropdownOption, event: Event): void {
    event.stopPropagation();
    this.onOptionSelected.emit(option);
    this.closeDropdown();
  }

  // Handle document click to close dropdown
  private handleDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }
}
