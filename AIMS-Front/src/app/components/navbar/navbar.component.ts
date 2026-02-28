import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  outOfStockComponents: any[] = []
  lowStockItems: any[] = [];

  userRights: any = null;
  userDetails: any = null
  userType: string | null = '';
  staffType: string | null = ''

  showProfile: boolean = false;

  activeItem: { active: string | null } = { active: null };
  subActiveItem: string | null = null;

  constructor(private router: Router, private dataService: DataService, private authCtx: SessionstorageService, private socket: WebsocketService) {

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('events-----', event.urlAfterRedirects)
        this.updateNavbarFromRoute(event.urlAfterRedirects);
      }
    });

  }


  ngOnInit(): void {
    this.socket.emit("notification", null);
    this.socket.listen('notification').subscribe((data) => {
      this.outOfStockComponents = data;
    });

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { user, rights } = ctx;
      this.userDetails = user;
      this.userRights = rights;
      this.userType = user.userType || '';
      this.staffType = user.staffType || '';
    });

  }

  get hasDepartmentAccess(): boolean {
    if (!this.userRights) return false;

    return (
      this.userRights?.ITDepartment?.ITInventory?.view === 1 ||
      this.userRights?.hardwareDepartment?.electronicDevice?.view === 1 ||
      this.userRights?.hardwareDepartment?.testingEquipment?.view === 1 ||
      this.userRights?.adminDepartment?.fixedAsset?.view === 1 ||
      this.userRights?.adminDepartment?.consumableAsset?.view === 1
    );
  }

  get isDepartmentSelected(): boolean {
    return !!this.activeItem?.active;
  }

  get isIT(): boolean {
    return this.activeItem?.active === 'IT Department';
  }

  get isHardware(): boolean {
    return (
      this.activeItem?.active === 'Electronic Components' ||
      this.activeItem?.active === 'Testing Equipments'
    );
  }

  get showBOM(): boolean {
    // ONLY when hardware department is selected
    if (!this.isHardware) return false;

    return (
      this.userRights?.hardwareDepartment?.electronicDevice?.BOM === 1 ||
      this.userRights?.hardwareDepartment?.testingEquipment?.BOM === 1
    );
  }

  get showSummary(): boolean {
    // ONLY for IT department
    return (
      this.isIT &&
      this.userRights?.ITDepartment?.ITInventory?.view === 1
    );
  }

  get showAMC(): boolean {
    // Hide AMC when hardware selected (your rule)
    if (this.isHardware) return false;

    return (
      this.userRights?.ITDepartment?.ITInventory?.view === 1 ||
      this.userRights?.adminDepartment?.fixedAsset?.view === 1 ||
      this.userRights?.adminDepartment?.consumableAsset?.view === 1
    );
  }

  get showSettings(): boolean {
    // Only when a department is selected
    return this.isDepartmentSelected;
  }


  updateNavbarFromRoute(url: string) {
    const cleanUrl = url.split('?')[0];
    const mapping = this.routeToNavMap[cleanUrl];

    if (!mapping) return;

    if (mapping.independent) {
      // Do NOT touch department or subItem
      return;
    }

    const storedDept = sessionStorage.getItem('activeDepartment');

    // 1) Resolve department
    let finalDept = mapping.department ?? storedDept ?? null;

    if (finalDept) {
      this.activeItem = { active: finalDept };
      sessionStorage.setItem('activeDepartment', finalDept);
    } else {
      this.activeItem = { active: '' };
    }

    // 2) Resolve sub-item
    if (mapping.subItem) {
      this.subActiveItem = mapping.subItem;

      // Always store subActive under the resolved finalDept
      if (finalDept) {
        let subStore = JSON.parse(sessionStorage.getItem('subActive') || '{}');
        subStore[finalDept] = mapping.subItem;
        sessionStorage.setItem('subActive', JSON.stringify(subStore));
      }
    }
  }


  private routeToNavMap: { [key: string]: { department: string | null; subItem: string | null; independent?: boolean; } } = {
    '/it-dashboard': { department: 'IT Department', subItem: 'IT-Dashboard' },
    '/it-list': { department: 'IT Department', subItem: 'IT-List' },

    '/electronic-dashboard': { department: 'Electronic Components', subItem: 'Electronic-Dashboard' },
    '/hardware-electronic': { department: 'Electronic Components', subItem: 'Electronic-List' },

    '/testing-dashboard': { department: 'Testing Equipments', subItem: 'Testing-Dashboard' },
    '/testing-list': { department: 'Testing Equipments', subItem: 'Testing-List' },

    '/fixed-dashboard': { department: 'Fixed Asset', subItem: 'Fixed-Dashboard' },
    '/fixed-list': { department: 'Fixed Asset', subItem: 'Fixed-List' },

    '/consumable-dashboard': { department: 'Consumable', subItem: 'Consumable-Dashboard' },
    '/consumable-list': { department: 'Consumable', subItem: 'Consumable-List' },

    '/allotments': { department: null, subItem: 'Allotments' },
    '/amc': { department: null, subItem: 'AMC' },
    '/bom-tools': { department: 'Electronic Components', subItem: 'BOM' },
    '/setting': { department: null, subItem: 'Settings' },
    '/summary': { department: 'IT Department', subItem: 'Summary' },
    '/users': { department: null, subItem: 'Users' },

    '/guide': { department: null, subItem: null, independent: true },
    '/history': { department: null, subItem: null, independent: true },
    '/assigned': { department: null, subItem: null, independent: true },
  };



  /** This is used to display user/employee details*/
  showLoginProfile() {
    if (this.showProfile === false) {
      this.showProfile = true;
    } else {
      this.showProfile = false
    }
  }

  /** This function is used to logout from component/inventory*/
  logout() {
    if (sessionStorage.getItem('auth-token')) {
      sessionStorage.removeItem('auth-token');
      sessionStorage.removeItem('active');
      sessionStorage.removeItem('subActive');
      sessionStorage.removeItem('activeDepartment');

      this.router.navigateByUrl('/login');
    } else {
      this.router.navigateByUrl('/login');
    }
  }

  selectDepartment(department: string) {
    this.activeItem = { active: department };
    console.log('Active Item', this.activeItem)
    this.dataService.setActiveDepartment(department);
    const subStore = JSON.parse(sessionStorage.getItem('subActive') || '{}');
    const defaultSubActive: Record<string, string> = {
      'IT Department': 'IT-Dashboard',
      'Electronic Components': 'Electronic-Dashboard',
      'Testing Equipments': 'Testing-Dashboard',
      'Fixed Asset': 'Fixed-Dashboard',
      'Consumable': 'Consumable-Dashboard'
    };

    let finalSub = subStore[department] || defaultSubActive[department];

    // Save default when first time
    if (!subStore[department] && finalSub) {
      subStore[department] = finalSub;
      sessionStorage.setItem('subActive', JSON.stringify(subStore));
    }

    if (finalSub) {
      this.subActiveItem = finalSub;
      this.router.navigate([this.getRoute(finalSub)]);
    }
  }


  selectSubItem(subItem: string) {
    this.subActiveItem = subItem;
    console.log('Subitems', subItem)
    //Check if this sub-item belongs to a known department
    let mappedDept: string | null = null;

    for (const route in this.routeToNavMap) {
      if (this.routeToNavMap[route].subItem === subItem) {
        mappedDept = this.routeToNavMap[route].department;
        break;
      }
    }

    //Read currently active department
    const currentDept = sessionStorage.getItem('activeDepartment');
    // Final department decision
    const finalDept = mappedDept || currentDept;
    //Update UI + session
    if (finalDept) {
      this.activeItem = { active: finalDept };
      // sessionStorage.setItem('activeDepartment', finalDept);
      this.dataService.setActiveDepartment(finalDept);
      const subStore = JSON.parse(sessionStorage.getItem('subActive') || '{}');
      subStore[finalDept] = subItem;
      sessionStorage.setItem('subActive', JSON.stringify(subStore));
    }
    console.log('this is my get route', this.getRoute(subItem))
    this.router.navigate([this.getRoute(subItem)]);
  }


  // Helper to map subItem to route
  getRoute(subItem: string): string {
    const routeMap: Record<string, string> = {
      'IT-Dashboard': '/it-dashboard',
      'IT-List': '/it-list',
      'Electronic-Dashboard': '/electronic-dashboard',
      'Electronic-List': '/hardware-electronic',
      'Testing-Dashboard': '/testing-dashboard',
      'Testing-List': '/testing-list',
      'Fixed-Dashboard': '/fixed-dashboard',
      'Fixed-List': '/fixed-list',
      'Consumable-Dashboard': '/consumable-dashboard',
      'Consumable-List': '/consumable-list',
      'Assign': '/assign',
      'Allotments': '/allotments',
      'AMC': '/amc',
      'BOM': '/bom-tools',
      'Settings': '/setting',
      'Summary': '/summary',
      'Users': '/users'
    };

    return routeMap[subItem] || '/';
  }

}
