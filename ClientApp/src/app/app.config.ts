import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'; // 👈 Import withInterceptors
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor'; // 👈 Import your functional interceptor

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // 👇 Registering your interceptor using modern Angular standards
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};