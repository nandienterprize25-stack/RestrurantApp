import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomAlertService } from '../../../services/custom-alert.service';

@Component({
  selector: 'app-custom-alert',
  standalone: true,
  imports: [CommonModule],

  template: `
    @if (alert.state().visible) {

      <div class="alert-overlay" (click)="onOverlayClick($event)">

        <div class="alert-box" [class]="alert.state().type">

          <!-- ICON -->
          <div class="alert-icon">

            @switch (alert.state().type) {

              @case ('success') {
                <span>✓</span>
              }

              @case ('error') {
                <span>✕</span>
              }

              @case ('warning') {
                <span>⚠</span>
              }

              @default {
                <span>ℹ</span>
              }
            }

          </div>

          <!-- TITLE -->
          <h3 class="alert-title">
            {{ alert.state().title }}
          </h3>

          <!-- MESSAGE -->
          <p
            class="alert-message"
            [innerHTML]="formatted()"
          ></p>

          <!-- BUTTONS -->
          <div class="alert-actions">

            <!-- NORMAL OK BUTTON -->
            @if (!alert.state().showCancel) {

              <button
                class="alert-btn ok-btn"
                (click)="alert.close()"
              >
                OK
              </button>
            }

            <!-- CONFIRM BUTTONS -->
            @if (alert.state().showCancel) {

              <button
                class="alert-btn yes-btn"
                (click)="alert.close()"
              >
                Yes
              </button>

              <button
                class="alert-btn no-btn"
                (click)="alert.cancel()"
              >
                No
              </button>
            }

          </div>

        </div>

      </div>
    }
  `,

  styles: [`

    .alert-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn .2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .alert-box {
      background: #fff;
      border-radius: 18px;
      padding: 34px 28px;
      min-width: 340px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2);
      animation: slideUp .2s ease;
      border-top: 5px solid #3b82f6;
    }

    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }

      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .alert-box.success {
      border-top-color: #10b981;
    }

    .alert-box.error {
      border-top-color: #ef4444;
    }

    .alert-box.warning {
      border-top-color: #f59e0b;
    }

    .alert-box.info {
      border-top-color: #3b82f6;
    }

    .alert-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      font-size: 26px;
      font-weight: bold;
    }

    .success .alert-icon {
      background: #d1fae5;
      color: #065f46;
    }

    .error .alert-icon {
      background: #fee2e2;
      color: #991b1b;
    }

    .warning .alert-icon {
      background: #fef3c7;
      color: #92400e;
    }

    .info .alert-icon {
      background: #dbeafe;
      color: #1e3a8a;
    }

    .alert-title {
      margin-bottom: 10px;
      font-size: 1.2rem;
      font-weight: 700;
      color: #111827;
    }

    .alert-message {
      margin-bottom: 26px;
      font-size: 0.95rem;
      color: #4b5563;
      line-height: 1.6;
    }

    .alert-actions {
      display: flex;
      justify-content: center;
      gap: 14px;
    }

    .alert-btn {
      min-width: 100px;
      padding: 11px 20px;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all .15s ease;
      color: #fff;
    }

    .ok-btn {
      background: #3b82f6;
    }

    .yes-btn {
      background: #ef4444;
    }

    .no-btn {
      background: #6b7280;
    }

    .alert-btn:hover {
      transform: translateY(-1px);
      opacity: .92;
    }

  `]
})
export class CustomAlertComponent {

  alert = inject(CustomAlertService);

  formatted(): string {
    return this.alert.state().message.replace(/\n/g, '<br>');
  }

  onOverlayClick(event: MouseEvent): void {

    if (
      (event.target as HTMLElement)
      .classList.contains('alert-overlay')
    ) {
      this.alert.cancel();
    }
  }
}