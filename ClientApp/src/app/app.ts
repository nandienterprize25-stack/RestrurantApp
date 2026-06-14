import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// 1. Import your custom alert component
import { CustomAlertComponent } from './components/shared/custom-alert/custom-alert.component'; 

@Component({
  selector: 'app-root',
  standalone: true, 
  // 2. Add CustomAlertComponent to the imports array here
  imports: [RouterOutlet, CustomAlertComponent], 
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('ClientApp');
}