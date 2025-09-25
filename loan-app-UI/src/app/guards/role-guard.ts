import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';
import { Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as string[]; // ✅ plural

  if (!auth.isLoggedIn()) {
    auth.toast('Please log in to continue', 'error');
    router.navigate(['/auth/login']); // ✅ correct path
    return false;
  }

  const userRole = auth.getUserRole()?.toLowerCase() ?? '';
  if (!expectedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    auth.toast(`Access denied for role: ${userRole}`, 'error');
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};