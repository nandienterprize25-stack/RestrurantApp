import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  visible:  boolean;
  type:     AlertType;
  title:    string;
  message:  string;
  /** Emits true when user clicks the OK button */
  onClose?: () => void;
  onConfirm?: () => void;
onCancel?: () => void;
showCancel?: boolean;
}

// 🌟 NEW: Options wrapper matching the schema you want to use
export interface ShowAlertOptions {
  type: AlertType;
  title: string;
  message: string;
  showCancel?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}


/**
 * CustomAlertService — Singleton service (provided in root).
 * Replaces window.alert() with an in-app modal dialog.
 * Components subscribe to `state` signal and render the modal themselves,
 * OR use the <app-custom-alert> shared component.
 */
@Injectable({ providedIn: 'root' })
export class CustomAlertService {

  // Reactive signal — any component reading this re-renders automatically
  state = signal<AlertState>({
    visible: false,
    type:    'info',
    title:   '',
    message: ''
  });

  // Emits after the user clicks OK (used for post-confirm navigation)
  private _closed$ = new Subject<void>();
  closed$ = this._closed$.asObservable();

 // ── 🌟 NEW UNIFIED SHOW METHOD ───────────────────────────────────────────
  show(options: ShowAlertOptions): void {
    this.state.set({
      visible: true,
      type: options.type,
      title: options.title,
      message: options.message,
      showCancel: options.showCancel || false,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel
    });
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  success(message: string, onClose?: () => void): void {
    this._show('success', 'Success', message, onClose);
  }

  error(message: string, onClose?: () => void): void {
    this._show('error', 'Error', message, onClose);
  }

  warning(message: string, onClose?: () => void): void {
    this._show('warning', 'Warning', message, onClose);
  }

  info(message: string, onClose?: () => void): void {
    this._show('info', 'Info', message, onClose);
  }

  /** Called by the alert component when the user clicks OK */
  close(): void {
    //const cb = this.state().onClose;
    const cb = this.state().onConfirm; // For confirm dialogs, we want to call onConfirm when user clicks OK
    this.state.set({ visible: false, type: 'info', title: '', message: '' });
    this._closed$.next();
    if (cb) cb();
  }
  cancel(): void {

  const cb = this.state().onCancel;

  this.state.set({
    visible: false,
    type: 'info',
    title: '',
    message: '',
    showCancel: false
  });

  if (cb) cb();
}



  confirm(
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void {

  this.state.set({
    visible: true,
    type: 'warning',
    title: 'Confirm Delete',
    message,
    onConfirm,
    onCancel,
    showCancel: true
  });
}
  // ── Private ─────────────────────────────────────────────────────────────────

  private _show(type: AlertType, title: string, message: string, onClose?: () => void): void {
    this.state.set({ visible: true, type, title, message, onClose });
  }

  
}