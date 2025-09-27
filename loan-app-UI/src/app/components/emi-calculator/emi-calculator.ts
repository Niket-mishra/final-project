import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-emi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emi-calculator.html',
  styleUrl: './emi-calculator.css'
})
export class EmiCalculator {
  amount = 0;
  interestRate = 0;
  tenureMonths = 0;
  emi = 0;

  calculateEMI(): void {
    if (this.amount <= 0 || this.interestRate <= 0 || this.tenureMonths <= 0) {
      this.emi = 0;
      return;
    }

    const principal = this.amount;
    const monthlyRate = this.interestRate / (12 * 100);
    const months = this.tenureMonths;

    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    this.emi = Math.round(numerator / denominator);
  }
}