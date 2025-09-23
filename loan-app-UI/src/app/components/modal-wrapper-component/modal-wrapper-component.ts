import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-wrapper',
  standalone: true,
  templateUrl: './modal-wrapper-component.html',
  styleUrls: ['./modal-wrapper-component.css']
})
export class ModalWrapperComponent {
  @Input() title = '';
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  closeModal(): void {
    this.close.emit();
  }
}