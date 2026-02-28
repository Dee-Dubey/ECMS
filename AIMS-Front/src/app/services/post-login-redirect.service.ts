import { Injectable } from '@angular/core';
import { SessionstorageService } from './sessionstorage.service';

@Injectable({
  providedIn: 'root'
})
export class PostLoginRedirectService {

  constructor(private authCtx: SessionstorageService) {}
  redirectUser() {
    const ctx = this.authCtx.snapShot;
    if (!ctx) {
      return '/login';
    }
    const { user, rights } = ctx;
    const userType = user.userType;
    
    // if (userType === '0') return '/it-dashboard';

    // if (rights.ITDepartment.ITInventory.view) return '/it-dashboard'
    if (rights.hardwareDepartment.electronicDevice.view) return '/electronic-dashboard'
    // if (rights.hardwareDepartment.testingEquipment.view) return '/consumable-dashboard'
    // if (rights.adminDepartment.consumableAsset.view) return '/it-dashboard'
    // if (rights.adminDepartment.fixedAsset.view) return '/fixed-dashboard'
    if (rights.hrDepartment.user.manage) return '/users'

    return '/guide'
  }

}
