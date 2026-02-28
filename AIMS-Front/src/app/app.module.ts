import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserComponent } from './components/user/user.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FooterComponent } from './components/footer/footer.component';
import { EmployeeDashboardComponent } from './components/employee-dashboard/employee-dashboard.component';
import { ComponentDashComponent } from './components/Hardware/Electronic-Components/component-dash/component-dash.component';
import { InventoryDashComponent } from './components/IT/inventory-dash/inventory-dash.component';
import { SettingComponent } from './components/setting/setting.component';
import { ComponentSettingComponent } from './components/Hardware/Electronic-Components/component-setting/component-setting.component';
import { InventorySettingComponent } from './components/IT/inventory-setting/inventory-setting.component';
import { ConsumableSettingComponent } from './components/Admin/Consumable/consumable-setting/consumable-setting.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { GuideComponent } from './components/Profiles/guide/guide.component';
import { AssignedComponent } from './components/Profiles/assigned/assigned.component';
import { HistoryComponent } from './components/Profiles/history/history.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SummaryComponent } from './components/summary/summary.component';
import { BomToolsComponent } from './components/bom-tools/bom-tools.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AllotmentsComponent } from './components/allotments/allotments.component';
import { ItDepartmentComponent } from './components/IT/it-department/it-department.component';
import { HardwareElectronicComponent } from './components/Hardware/Electronic-Components/hardware-electronic/hardware-electronic.component';
import { ItDashboardComponent } from './components/IT/it-dashboard/it-dashboard.component';
import { ElectronicDashboardComponent } from './components/Hardware/Electronic-Components/electronic-dashboard/electronic-dashboard.component';
import { TestingDashboardComponent } from './components/Hardware/Testing-Equipments/testing-dashboard/testing-dashboard.component';
import { FixedDashboardComponent } from './components/Admin/Fixed-Assets/fixed-dashboard/fixed-dashboard.component';
import { ConsumableDashboardComponent } from './components/Admin/Consumable/consumable-dashboard/consumable-dashboard.component';
import { TestingSettingComponent } from './components/Hardware/Testing-Equipments/testing-setting/testing-setting.component';
import { FixedSettingComponent } from './components/Admin/Fixed-Assets/fixed-setting/fixed-setting.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { NotificationComponent } from './components/notification/notification.component';
import { AmcComponent } from './components/AMC-Components/amc/amc.component';
import { ActiveAmcComponent } from './components/AMC-Components/active-amc/active-amc.component';
import { ExpiredAmcComponent } from './components/AMC-Components/expired-amc/expired-amc.component';
import { ActiveServiceTransactionComponent } from './components/AMC-Components/active-service-transaction/active-service-transaction.component';
import { ActiveRepairTransactionComponent } from './components/AMC-Components/active-repair-transaction/active-repair-transaction.component';
import { AuthInterceptor } from './interceptor/auth.interceptor';
import { ProfileComponent } from './components/Profiles/profile/profile.component';
import { FixedListComponent } from './components/Admin/Fixed-Assets/fixed-list/fixed-list.component';
import { ConsumableListComponent } from './components/Admin/Consumable/consumable-list/consumable-list.component';
import { TestingListComponent } from './components/Hardware/Testing-Equipments/testing-list/testing-list.component';
import { ConsumableAllotmentsComponent } from './components/Admin/Consumable/consumable-allotments/consumable-allotments.component';
import { ComponentsAllotmentsComponent } from './components/Hardware/Electronic-Components/components-allotments/components-allotments.component';
import { TestingAllotmentsComponent } from './components/Hardware/Testing-Equipments/testing-allotments/testing-allotments.component';
import { ItAllotmentsComponent } from './components/IT/it-allotments/it-allotments.component';



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserComponent,
    NavbarComponent,
    FooterComponent,
    EmployeeDashboardComponent,
    ComponentDashComponent,
    InventoryDashComponent,
    SettingComponent,
    ComponentSettingComponent,
    InventorySettingComponent,
    ConsumableSettingComponent,
    SidebarComponent,
    GuideComponent,
    AssignedComponent,
    HistoryComponent,
    NotFoundComponent,
    SummaryComponent,
    BomToolsComponent,
    AllotmentsComponent,
    ItDepartmentComponent,
    HardwareElectronicComponent,
    ItDashboardComponent,
    ElectronicDashboardComponent,
    TestingDashboardComponent,
    FixedDashboardComponent,
    ConsumableDashboardComponent,
    TestingSettingComponent,
    FixedSettingComponent,
    NotificationComponent,
    AmcComponent,
    ActiveAmcComponent,
    ExpiredAmcComponent,
    ActiveServiceTransactionComponent,
    ActiveRepairTransactionComponent,
    ProfileComponent,
    FixedListComponent,
    ConsumableListComponent,
    TestingListComponent,
    ConsumableAllotmentsComponent,
    ComponentsAllotmentsComponent,
    TestingAllotmentsComponent,
    ItAllotmentsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatSelectModule,
    NoopAnimationsModule,
    AutocompleteLibModule,
    NgSelectModule,
    NgApexchartsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
