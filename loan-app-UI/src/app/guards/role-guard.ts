import { CanActivateFn } from '@angular/router';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
    const auth = inject(Auth);
  const router = inject(Router);
  const expectedRole = route.data['role'];

  if (auth.getUserRole() !== expectedRole) {
    router.navigate(['/unauthorized']);
    return false;
  }
  return true;

};
