import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './input.html',
  styleUrl: './input.css'
})
export class Input {
  value = model<string>('');

  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'password' | 'email' | 'number' | 'date'>('text');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  error = input<string>('');
  id = input<string>('');
}
