// src/app/components/emi-calculator.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface AmortizationRow {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

@Component({
  selector: 'app-emi-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emi-calculator.html',
  styleUrl: './emi-calculator.css'
})
export class EmiCalculator {
  amount = 500000;
  interestRate = 8.5;
  tenureMonths = 60;
  emi = 0;
  totalPayment = 0;
  totalInterest = 0;
  principalAmount = 0;

  amortizationSchedule: AmortizationRow[] = [];
  showSchedule = false;

  ngOnInit(): void {
    this.calculateEMI();
  }

  calculateEMI(): void {
    if (this.amount <= 0 || this.interestRate <= 0 || this.tenureMonths <= 0) {
      this.emi = 0;
      this.totalPayment = 0;
      this.totalInterest = 0;
      this.principalAmount = 0;
      return;
    }

    const principal = this.amount;
    const monthlyRate = this.interestRate / (12 * 100);
    const months = this.tenureMonths;

    const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
    const denominator = Math.pow(1 + monthlyRate, months) - 1;

    this.emi = Math.round(numerator / denominator);
    this.totalPayment = this.emi * months;
    this.totalInterest = this.totalPayment - principal;
    this.principalAmount = principal;

    this.generateAmortizationSchedule();
  }

  generateAmortizationSchedule(): void {
    this.amortizationSchedule = [];
    let balance = this.amount;
    const monthlyRate = this.interestRate / (12 * 100);

    for (let month = 1; month <= this.tenureMonths; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = this.emi - interestPayment;
      balance = balance - principalPayment;

      this.amortizationSchedule.push({
        month,
        emi: this.emi,
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.max(0, Math.round(balance))
      });
    }
  }

  getPrincipalPercentage(): number {
    if (this.totalPayment === 0) return 0;
    return Math.round((this.principalAmount / this.totalPayment) * 100);
  }

  getInterestPercentage(): number {
    if (this.totalPayment === 0) return 0;
    return Math.round((this.totalInterest / this.totalPayment) * 100);
  }

  toggleSchedule(): void {
    this.showSchedule = !this.showSchedule;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  }
}


