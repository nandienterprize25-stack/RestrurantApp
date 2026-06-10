import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-box">
        <h1>Restaurant Management System</h1>
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Username</label>
            <input type="text" formControlName="username" class="form-control" />
            <div *ngIf="loginForm.get('username')?.hasError('required')" class="error">
              Username is required
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" formControlName="password" class="form-control" />
            <div *ngIf="loginForm.get('password')?.hasError('required')" class="error">
              Password is required
            </div>
          </div>

          <button type="submit" class="btn-login" [disabled]="!loginForm.valid || isLoading">
            {{ isLoading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <p class="demo-hint">Demo: username=admin, password=Admin@123</p>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-box {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
      font-size: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .btn-login {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.3s;
    }

    .btn-login:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .error {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .error-message {
      margin-top: 20px;
      padding: 10px;
      background: #ffe6e6;
      color: #c0392b;
      border-radius: 5px;
      text-align: center;
    }

    .demo-hint {
      text-align: center;
      color: #999;
      font-size: 12px;
      margin-top: 20px;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/menu']);
      },
      error: (err) => {
        this.errorMessage = 'Invalid username or password';
        this.isLoading = false;
      }
    });
  }
}
