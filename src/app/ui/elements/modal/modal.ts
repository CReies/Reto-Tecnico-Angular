import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  // Input properties
  visible = input<boolean>(false);

  // Output events
  onClose = output<void>();

  // Handle backdrop click
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  // Handle escape key
  onEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.visible()) {
      this.close();
    }
  }

  // Close modal
  close(): void {
    this.onClose.emit();
  }

  // Prevent body scroll when modal is open
  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      if (this.visible()) {
        document.body.style.overflow = 'hidden';
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }
}
