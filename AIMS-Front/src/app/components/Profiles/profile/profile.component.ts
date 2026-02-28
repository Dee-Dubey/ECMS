import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

interface PermissionView {
  department: string;
  module: string;
  permissions: string[];
}

interface Responsibility {
  department: string;
  module: string;
  actions: string[];
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userDetail: any = null;
  rights: any = null;

  permissionViewList: PermissionView[] = [];
  responsibilities: Responsibility[] = [];

  /** IT Department*/
  employeeCode: string = '';
  assignedITStockHistory: any = []
  itAssignedCount: number = 0;

  /** Electronic Department*/
  assignedStockHistory: any = []
  electronicAssignedCount: number = 0;

  /** Testing equipments*/
  testingAssignedCount: number = 0;

  /** Fixed Assets*/
  fixedAssetsAssignedCount: number = 0;

  constructor(private database: DatabaseService, private router: Router, private authCtx: SessionstorageService) { }

  ngOnInit(): void {
    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) return;

      const { user } = ctx
      this.employeeCode = user.employeeCode;

      this.userDetail = ctx.user;
      this.resolveRole()
      this.rights = ctx.rights;

      this.buildPermissionView(this.rights);
      this.buildResponsibilities(this.rights);
    });

    this.loadStockHistory();
    this.loadITStockHistory();
  }

  /* ================= ROLE ================= */

  roleInfo: { label: string; css: string } = {
    label: 'Unknown',
    css: 'unknown'
  };

  private resolveRole(): void {
    if (!this.userDetail) return;

    if (this.userDetail.userType === '0') {
      this.roleInfo = { label: 'Admin', css: 'admin' };
      return;
    }

    // if (this.userDetail.staffType === '1') {
    //   this.roleInfo = { label: 'Employee', css: 'employee' };
    //   return;
    // }

    this.roleInfo = { label: 'User', css: 'user' };
  }


  /* ================= ACCESS OVERVIEW ================= */

  private buildPermissionView(rights: any): void {
    const list: PermissionView[] = [];

    Object.entries(rights || {}).forEach(([department, modules]: any) => {
      Object.entries(modules).forEach(([moduleName, perms]: any) => {

        const enabled = Object.entries(perms)
          .filter(([_, v]) => v === 1)
          .map(([k]) => k);

        list.push({
          department,
          module: moduleName,
          permissions: enabled
        });
      });
    });

    this.permissionViewList = list;
  }

  /* ================= RESPONSIBILITIES ================= */

  private buildResponsibilities(rights: any): void {
    const list: Responsibility[] = [];

    Object.entries(rights || {}).forEach(([department, modules]: any) => {
      Object.entries(modules).forEach(([moduleName, perms]: any) => {

        const actions = Object.entries(perms)
          // .filter(([k, v]) => v === 1 && k !== 'view')
          .filter(([k, v]) => v === 1)
          .map(([k]) => k);

        if (actions.length > 0) {
          list.push({
            department,
            module: moduleName,
            actions
          });
        }
      });
    });

    this.responsibilities = list;
  }

  formatLabel(value: string): string {
    if (!value) return '';

    return value
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  formatPermissions(permissions: string[]): string {
    if (!permissions || permissions.length === 0) {
      return 'No Access';
    }

    return permissions
      .map(p => this.formatLabel(p))
      .join(', ');
  }

  /** ===================== IT Department =================== */
  loadITStockHistory() {
    let employeeCode = this.employeeCode;
    if (employeeCode) {
      this.database.getITAssignedUserData(employeeCode).subscribe((res: any) => {
        const data = Array.isArray(res) ? res : res?.data;

        if (!data || !Array.isArray(data)) {
          this.itAssignedCount = 0;
          return;
        }

        const processedData = data.map((item: any) => ({
          categoryName: item.categoryName,
          subCategoryName: item.subCategoryName,
          manufacturer: item.manufacturer,
          inventoryId: item.code,
          transactionType: 'Assigned',
          updatedAt: item.updatedAt
        }));

        this.assignedITStockHistory = processedData;
        this.itAssignedCount = processedData.length;

        console.log("IT Assigned Count:", this.itAssignedCount);
      });
    } else {
      this.itAssignedCount = 0;
    }
  }

  /** ==================== Electronic Department ================== */
  loadStockHistory() {
    let employeeCode = this.employeeCode
    console.log('employee code', employeeCode)
    if (employeeCode) {
      this.database.getStockHistoryFromIssuedUser(employeeCode).subscribe((data: any) => {
        console.log('data user', data)
        if (!data || !Array.isArray(data)) {
          this.assignedStockHistory = 0;
          return;
        }
        this.assignedStockHistory = this.processStockHistory(data);

        // ✅ Calculate total Electronic assigned
        this.electronicAssignedCount = this.assignedStockHistory.length;
      })
    }
  }

  //This process the stock history in component
  processStockHistory(data: any[]) {
    let stockMap = new Map<string, any>()
    data.forEach(item => {
      let key = `${item.componentId.manufacturerPartNumber}-${item.projectName}`
      if (!stockMap.has(key)) {
        stockMap.set(key, {
          manufacturerPartNumber: item.componentId.manufacturerPartNumber,
          projectName: item.projectName,
          totalIssued: 0,
          totalReturnOrConsumed: 0,
          dateUpdate: item.date,
        })
      }
      let entry = stockMap.get(key);
      if (item.transactionType === 'issue') {
        entry.totalIssued += item.quantity;
      } else if (item.transactionType === 'returned' || item.transactionType === 'consumed') {
        entry.totalReturnOrConsumed += item.quantity;
      }
      if (new Date(item.date) > new Date(entry.dateUpdate)) {
        entry.dateUpdate = item.date
      }
    })
    let result = Array.from(stockMap.values()).map(entry => ({
      manufacturerPartNumber: entry.manufacturerPartNumber,
      projectName: entry.projectName,
      finalQuantity: entry.totalIssued - entry.totalReturnOrConsumed,
      dateUpdate: entry.dateUpdate,
      transactionType: 'Assigned'
    })).filter(entry => entry.finalQuantity !== 0);

    // Sort by dateUpdate in descending order (newest first)
    result.sort((a, b) => new Date(b.dateUpdate).getTime() - new Date(a.dateUpdate).getTime());

    return result;
  }

}
