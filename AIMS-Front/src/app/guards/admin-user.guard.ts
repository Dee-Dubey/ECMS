import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionstorageService } from '../services/sessionstorage.service';
import { filter, firstValueFrom } from 'rxjs';

export const adminUserGuard: CanActivateFn = async (route) => {
  const router = inject(Router);
  const authCtx = inject(SessionstorageService)

  await firstValueFrom(
    authCtx.ready$.pipe(filter(r => r === true))
  );

  const ctx = authCtx.snapShot;
  if (!ctx) {
    return router.parseUrl('/login');
  }

  if (!authCtx.isReady) {
    return router.parseUrl('/login');
  }

  const { user, rights } = ctx;
  const userType = user.userType;
  const staffType = user.staffType;

  // Normalize roles
  const isAdmin = userType === '0';
  // const isEmployee = !isAdmin && staffType === '1';
  // const isUser = !isAdmin && staffType === '0';

  // Admin bypass
  if (isAdmin) {
    return true;
  }

  // Employee whitelist
  // if (isEmployee) {
  //   const employeeAllowed = ['guide', 'history', 'assigned'];
  //   const path = route.routeConfig?.path ?? '';
  //   return employeeAllowed.includes(path)
  //     ? true
  //     : router.parseUrl('/guide');
  // }

  // User must have permissions
  // if (isUser) {
  //   if (!rights) {
  //     console.log('------------1--------------------');
  //     return router.parseUrl('/not-authorized');
  //   }

  //   const permission = route.data?.['permission'];
  //   if (!permission) {
  //     return true;
  //   }

  //   const moduleRights = rights[permission.module];
  //   if (!moduleRights) {
  //     console.log('------+++----++----', rights);
  //     console.log('------+++++----', permission.module);
  //     console.log('------=====----', moduleRights);
  //     console.log('------------2--------------------');
  //     return router.parseUrl('/not-authorized');
  //   }

  //   switch (permission.mode) {
  //     case 'ANY': {
  //       const sectionPerms = moduleRights[permission.section];
  //       if (sectionPerms && Object.values(sectionPerms).some(v => v === 1)) {
  //         return true;
  //       }
  //       break;
  //     }
  //     case 'ACTION': {
  //       if (moduleRights[permission.section]?.[permission.action] === 1) {
  //         return true;
  //       }
  //       break;
  //     }
  //     case 'OR_SECTIONS': {
  //       if (
  //         permission.sections.some((sec: any) =>
  //           moduleRights[sec.section]?.[sec.action] === 1
  //         )
  //       ) {
  //         return true;
  //       }
  //       break;
  //     }
  //   }
  //   console.log('------3,,,,,----', rights);
  //   console.log('------3+++++----', permission.mode);
  //   console.log('------3\\\\\\\----', permission.section);
  //   console.log('------3=====----', moduleRights);
  //   console.log('------------3--------------------');
  //   return router.parseUrl('/not-authorized');
  // }

  // If user has no rights, treat as employee
  const hasAnyRights = rights && Object.keys(rights).length > 0;

  if (!hasAnyRights) {
    const employeeAllowed = ['guide', 'history', 'assigned'];
    const path = route.routeConfig?.path ?? '';
    return employeeAllowed.includes(path)
      ? true
      : router.parseUrl('/guide');
  }

  // User has rights → check permission
  const permission = route.data?.['permission'];
  if (!permission) return true; // no permission required, allow

  const moduleRights = rights[permission.module];
  if (!moduleRights) return router.parseUrl('/not-authorized');

  switch (permission.mode) {
    case 'ANY': {
      const sectionPerms = moduleRights[permission.section];
      if (sectionPerms && Object.values(sectionPerms).some(v => v === 1)) return true;
      break;
    }
    case 'ACTION': {
      if (moduleRights[permission.section]?.[permission.action] === 1) return true;
      break;
    }
    case 'OR_SECTIONS': {
      if (permission.sections.some((sec: any) =>
          moduleRights[sec.section]?.[sec.action] === 1
        )) return true;
      break;
    }
  }

  return router.parseUrl('/login');
};
