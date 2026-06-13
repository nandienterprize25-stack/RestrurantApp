import { Injectable, isDevMode } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  logInfo(message: string, context?: any): void {
    if (isDevMode()) {
      console.log(`%c[INFO] [${new Date().toLocaleTimeString()}] ${message}`, 'color: #2563eb; font-weight: bold;', context || '');
    }
    // Remote diagnostic monitoring pipelines hook up here (e.g., Application Insights)
  }

  logWarning(message: string, context?: any): void {
    if (isDevMode()) {
      console.warn(`[WARN] [${new Date().toLocaleTimeString()}] ${message}`, context || '');
    }
  }

  logError(message: string, error?: any): void {
    // 🛑 Log to system dev tools window inside dev cycles ONLY
    if (isDevMode()) {
      console.error(`%c[CRITICAL ERROR] [${new Date().toLocaleTimeString()}] ${message}`, 'color: #ef4444; font-weight: bold;', error || '');
    }
    
    // In production environments, securely transmit telemetry arrays to endpoint sinks
    // this.http.post('/api/diagnostics/logs', { trace: message, errorStack: error?.toString() }).subscribe();
  }
}