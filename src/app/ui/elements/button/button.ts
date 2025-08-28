import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  // Input properties
  label = input.required<string>();
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);

  // Output event
  clicked = output<void>();

  // Click handler
  handleClick(): void {
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }
}
