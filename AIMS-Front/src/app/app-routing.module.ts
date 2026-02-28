import { AmcComponent } from './components/AMC-Components/amc/amc.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './components/user/user.component';
import { LoginComponent } from './components/login/login.component';
import { SettingComponent } from './components/setting/setting.component';
import { GuideComponent } from './components/Profiles/guide/guide.component';
import { AssignedComponent } from './components/Profiles/assigned/assigned.component';
import { HistoryComponent } from './components/Profiles/history/history.component';
import { adminUserGuard } from './guards/admin-user.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SummaryComponent } from './components/summary/summary.component';
import { BomToolsComponent } from './components/bom-tools/bom-tools.component';
import { AllotmentsComponent } from './components/allotments/allotments.component';
import { ItDepartmentComponent } from './components/IT/it-department/it-department.component';
import { HardwareElectronicComponent } from './components/Hardware/Electronic-Components/hardware-electronic/hardware-electronic.component';
import { ItDashboardComponent } from './components/IT/it-dashboard/it-dashboard.component';
import { ElectronicDashboardComponent } from './components/Hardware/Electronic-Components/electronic-dashboard/electronic-dashboard.component';
import { TestingDashboardComponent } from './components/Hardware/Testing-Equipments/testing-dashboard/testing-dashboard.component';
import { FixedDashboardComponent } from './components/Admin/Fixed-Assets/fixed-dashboard/fixed-dashboard.component';
import { ConsumableDashboardComponent } from './components/Admin/Consumable/consumable-dashboard/consumable-dashboard.component';
import { LoginRedirectGuard } from './guards/login-redirect.guard';
import { ProfileComponent } from './components/Profiles/profile/profile.component';
import { FixedListComponent } from './components/Admin/Fixed-Assets/fixed-list/fixed-list.component';
import { ConsumableListComponent } from './components/Admin/Consumable/consumable-list/consumable-list.component';
import { TestingListComponent } from './components/Hardware/Testing-Equipments/testing-list/testing-list.component';
import { ComponentsAllotmentsComponent } from './components/Hardware/Electronic-Components/components-allotments/components-allotments.component';


const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [LoginRedirectGuard] },
  { path: 'users',
    component: UserComponent,
    canActivate: [adminUserGuard],
    data: {
    permission: {
      mode: 'ACTION',
      module: 'hrDepartment',
      section: 'user',
      action: 'manage'
    }
  } },
  { path: 'setting', component: SettingComponent, canActivate: [adminUserGuard] },
  { path: 'allotments', component: AllotmentsComponent, canActivate: [adminUserGuard] },
  { path: 'amc', component: AmcComponent, canActivate: [adminUserGuard] },

  /** Profile */
  {
    path: 'profile',
    canActivate: [adminUserGuard],
    children: [
      { path: '', component: ProfileComponent },
      { path: 'assigned', component: AssignedComponent },
      { path: 'history', component: HistoryComponent }
    ]
  },

  /** Guide */
  {
    path: 'guide',
    component: GuideComponent,
    canActivate: [adminUserGuard]
  },

  /** Summary */
  {
    path: 'summary',
    component: SummaryComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ACTION',
        module: 'ITDepartment',
        section: 'ITInventory',
        action: 'view'
      }
    }
  },

  /** Boom-tool*/
  {
    path: 'bom-tools',
    component: BomToolsComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'OR_SECTIONS',
        module: 'hardwareDepartment',
        sections: [
          { section: 'electronicDevice', action: 'BOM' },
          { section: 'testingEquipment', action: 'BOM' }
        ]
      }
    }
  },

  /** IT*/
  {
    path: 'it-dashboard',
    component: ItDashboardComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'ITDepartment',
        section: 'ITInventory'
      }
    }
  },
  {
    path: 'it-list',
    component: ItDepartmentComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'ITDepartment',
        section: 'ITInventory'
      }
    }
  },

  /** Hardware - Electronic Components*/
  {
    path: 'electronic-dashboard',
    component: ElectronicDashboardComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'hardwareDepartment',
        section: 'electronicDevice'
      }
    }
  },
  {
    path: 'hardware-electronic',
    component: HardwareElectronicComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'hardwareDepartment',
        section: 'electronicDevice'
      }
    }
  },
  // {
  //   path:'electronic-allotments',
  //   component: ComponentsAllotmentsComponent,
  //   canActivate: [adminUserGuard],
  //   data : {
  //     permission: {
  //       mode: 'ANY',
  //       module: 'hardwareDepartment',
  //       section: 'electronicDevice',
  //     }
  //   }
  // },

  /** Hardware - Testing Equipments*/
  {
    path: 'testing-dashboard',
    component: TestingDashboardComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'hardwareDepartment',
        section: 'testingEquipment'
      }
    }
  },
  {
    path: 'testing-list',
    component: TestingListComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'hardwareDepartment',
        section: 'testingEquipment'
      }
    }
  },

  /** Admin - Fixed Assets*/
  {
    path: 'fixed-dashboard',
    component: FixedDashboardComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'adminDepartment',
        section: 'fixedAsset'
      }
    }
  },
  {
    path: 'fixed-list',
    component: FixedListComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'adminDepartment',
        section: 'fixedAsset'
      }
    }
  },

  /** Admin - Consumable*/
  {
    path: 'consumable-dashboard',
    component: ConsumableDashboardComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'adminDepartment',
        section: 'consumableAsset'
      }
    }
  },
  {
    path: 'consumable-list',
    component: ConsumableListComponent,
    canActivate: [adminUserGuard],
    data: {
      permission: {
        mode: 'ANY',
        module: 'adminDepartment',
        section: 'consumableAsset'
      }
    }
  },

  { path: '**', component: NotFoundComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // anchorScrolling: 'enabled',
    enableTracing: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
