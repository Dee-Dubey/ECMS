import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-allotments',
  templateUrl: './allotments.component.html',
  styleUrls: ['./allotments.component.css']
})
export class AllotmentsComponent {

  activeList: any;
  userType: string | null = '';
  staffType: string | null = '';
  userRights: any;
  pillsActive: any;

  ITSubCategoryNameList: any
  ITCategoryNameList: any
  ITManufacturerNameList: any

  allEmployees: Array<any> = []
  assignedITStockHistory: any = []
  assignedStockHistory: any = []
  ITStockHistories: any[] = [];
  issuedStockHistory: any[] = [];

  searchText: string = '';
  filteredEmployees: any[] = [];
  selectedEmployeeId: string | null = null;
  showDropdown: boolean = true;

  projectNameList: any = {};

  selectTable: string = "assigned";
  // selectedEmployeeId: string = '';

  selectedEmployeeDetails: any = null;
  selectedEmployee: any = null;

  ITAssignedFlag: boolean = false;
  ITHistoryFlag: boolean = false;
  componentAssignedFlag: boolean = false;
  componentHistoryFlag: boolean = false;

  allotmentsDetails = {
    totalItems: 0,
    noOfIt: 0,
    noOfComponent: 0,
    noOfConsumable: 0,
  }

  private navbarListSubscription!: Subscription;

  constructor(private database: DatabaseService, private authCtx: SessionstorageService, private dataService: DataService,) { }

  ngOnInit(): void {

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { user, rights } = ctx;

      this.userRights = rights || {};
      this.userType = user.userType;
      this.staffType = user.staffType

    });

    /** Get Active from the session storage*/
    this.pillsActive = JSON.parse(sessionStorage.getItem('active') || '{}');
    this.navbarListSubscription = this.dataService.listenActiveDepartment().subscribe(dept => this.activeList = dept);


    

    /** get all user API request*/
    this.database.getAllUsers('all').subscribe((data: any) => {
      this.allEmployees = data;
    });

    /** get IT category name list*/
    this.database.getITCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          // Store both formats for flexible use
          this.ITCategoryNameList = res.data.map;   // Key-value form
        } else {
          this.ITCategoryNameList = {};
        }
        console.log('ITCategoryNameMap:', this.ITCategoryNameList);
      },
      error: (err) => {
        console.warn('Failed to fetch IT category name list:', err);
        this.ITCategoryNameList = {};
      }
    });

    /** get IT sub category name list*/
    this.database.getITSubCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.ITSubCategoryNameList = res.data.map || {};
        } else {
          console.warn('No subcategories found or invalid response:', res);
          this.ITSubCategoryNameList = {};
        }
        console.log('Subcategories loaded:', this.ITSubCategoryNameList);
      },
      error: (err) => {
        console.error('Error fetching subcategory data:', err);
        this.ITSubCategoryNameList = {};
      }
    });

    /** get IT manufacture name list*/
    this.database.getITManufacturerNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          // Save both list and map for flexibility in UI usage
          this.ITManufacturerNameList = res.data.map;
          // this.ITManufacturerListArray = res.data.list;

          console.log('Manufacturer name map:', this.ITManufacturerNameList);
          // console.log('Manufacturer list array:', this.ITManufacturerListArray);
        } else {
          console.warn('No manufacturer data found or invalid response:', res);
          this.ITManufacturerNameList = {};
          // this.ITManufacturerListArray = [];
        }
      },
      error: (err) => {
        console.error('Error fetching manufacturer names:', err);
        this.ITManufacturerNameList = {};
        // this.ITManufacturerListArray = [];
      }
    });

    /** get project name list*/
    this.database.getProjectNameList().subscribe((data: any) => {
      this.projectNameList = data;
    });

  }

  ngOnDestroy() {
    this.navbarListSubscription.unsubscribe();
  }

  filterEmployees() {
    const value = this.searchText.trim().toLowerCase();

    if (value) {
      this.filteredEmployees = this.allEmployees.filter(emp =>
        (emp.firstName + ' ' + emp.lastName).toLowerCase().includes(value)
      );
      this.showDropdown = true;   // open when typing
    } else {
      this.filteredEmployees = [];
      this.showDropdown = false;  // hide when empty
    }
  }

  selectEmployee(employee: any) {
    this.selectedEmployeeId = employee._id;
    this.searchText = employee.firstName + ' ' + employee.lastName;
    this.selectTable = 'assigned';
    this.filteredEmployees = [];
    this.onEmployeeSelect(); // call your old function
  }

  clearSearch() {
    this.searchText = '';
    this.filteredEmployees = this.allEmployees;
    this.selectedEmployeeId = null;
    this.showDropdown = false;
  }



  /** This function get IT stock history*/
  getITStockHistory() {
    this.database.getITStockHistoryData(this.selectedEmployee.employeeCode).subscribe((data: any) => {
      if (data.error) {
        alert(data.error)
      } else {
        this.ITStockHistories = data;

        if (this.ITStockHistories.length === 0) {
          this.ITHistoryFlag = true
        } else {
          this.ITHistoryFlag = false;
        }
      }
    });
  }

  onEmployeeSelect() {
    // HARD RESET — NO MERCY
    this.assignedITStockHistory = [];
    this.ITStockHistories = [];
    this.assignedStockHistory = [];
    this.issuedStockHistory = [];

    this.ITAssignedFlag = false;
    this.ITHistoryFlag = false;
    this.componentAssignedFlag = false;
    this.componentHistoryFlag = false;

    this.selectedEmployee = this.allEmployees.find(
      emp => emp._id === this.selectedEmployeeId
    );

    if (!this.selectedEmployee) return;

    this.loadITStockHistory();
    this.getITStockHistory();
    this.loadStockHistory();
    this.getHistoryComponent();
  }

  /** This function display all assigned Item*/
  updateTotalItems() {
    const itLength = this.assignedITStockHistory?.length || 0;
    const componentLength = this.assignedStockHistory?.length || 0;

    this.allotmentsDetails.totalItems = itLength + componentLength;
  }

  /** Assigned data display base on selected user*/
  loadITStockHistory() {
    let employeeCode = this.selectedEmployee.employeeCode;
    if (employeeCode) {
      this.database.getITAssignedUserData(employeeCode).subscribe((data: any) => {
        const processedData = data.map((item: any) => ({
          categoryName: item.categoryName,
          subCategoryName: item.subCategoryName,
          manufacturer: item.manufacturer,
          inventoryId: item.code,
          transactionType: 'Assigned', // Set transactionType statically
          updatedAt: item.updatedAt
        }));

        this.assignedITStockHistory = processedData
        this.allotmentsDetails.noOfIt = this.assignedITStockHistory.length;
        this.updateTotalItems();

        if (this.assignedITStockHistory.length === 0) {
          this.ITAssignedFlag = true;
        } else {
          this.ITAssignedFlag = false;
        }
      });
    }
  }

  /** This function load stock history*/
  loadStockHistory() {
    let employeeCode = this.selectedEmployee.employeeCode;
    if (employeeCode) {
      this.database.getStockHistoryFromIssuedUser(employeeCode).subscribe((data: any) => {
        this.assignedStockHistory = this.processStockHistory(data);
        this.allotmentsDetails.noOfComponent = this.assignedStockHistory.length;
        this.updateTotalItems();

        if (this.assignedStockHistory.length === 0) {
          this.componentAssignedFlag = true
        } else {
          this.componentAssignedFlag = false;
        }
      });
    }
  }

  /** This process the stock history in component*/
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

  /** This is used to get history of particular user*/
  getHistoryComponent() {
    this.database.getStockHistoryFromIssuedUser(this.selectedEmployee.employeeCode).subscribe((data: any) => {
      if (data.error) {
        alert(data.error)
      } else {
        this.issuedStockHistory = data
        if (this.issuedStockHistory.length === 0) {
          this.componentHistoryFlag = true;
        } else {
          this.componentHistoryFlag = false;
        }
      }
    });
  }



















  /**
   *   <div class="wrapper">

    <!-- ================= SIDEBAR ================= -->

    <div class="sidebar">
      <div class="stats-card">

        <div class="stats-title">Electronic Component</div>

        <!-- PCB ICON -->
        <svg width="120" height="120" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="pcbGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#2E8B57"/>
              <stop offset="100%" stop-color="#1E6B46"/>
            </linearGradient>
          </defs>

          <rect x="15" y="15" width="90" height="90" rx="20" fill="url(#pcbGrad)"/>
          <rect x="45" y="45" width="30" height="30" rx="5" fill="#333"/>

          <!-- gold lines -->
          <line x1="60" y1="15" x2="60" y2="45" stroke="#FFD700" stroke-width="3"/>
          <line x1="15" y1="60" x2="45" y2="60" stroke="#FFD700" stroke-width="3"/>
          <line x1="105" y1="60" x2="75" y2="60" stroke="#FFD700" stroke-width="3"/>
          <line x1="60" y1="105" x2="60" y2="75" stroke="#FFD700" stroke-width="3"/>

          <circle cx="30" cy="30" r="6" fill="#FFD700"/>
          <circle cx="90" cy="30" r="6" fill="#FFD700"/>
          <circle cx="30" cy="90" r="6" fill="#FFD700"/>
          <circle cx="90" cy="90" r="6" fill="#FFD700"/>
        </svg>

        <div class="stats-number">0</div>
        <div style="color:#777;">Total Electronic Components</div>

      </div>
    </div>

    <!-- ================= MAIN ================= -->

    <div class="main">

      <div class="topbar">
        <div class="tabs" *ngIf="selectedEmployeeId">
          <div class="tab" [ngClass]="{'active': selectTable === 'assigned'}" (click)="selectTable = 'assigned'">
            Assigned
          </div>

          <div class="tab" [ngClass]="{'active': selectTable === 'history'}" (click)="selectTable = 'history'">
            History
          </div>
        </div>

        <div class="search-wrapper">
          <div class="search-box">
            🔍
            <input type="text" placeholder="Search users..." [(ngModel)]="searchText" (input)="filterEmployees()">
            <span *ngIf="searchText && filteredEmployees.length > 0" (click)="clearSearch()" style="cursor:pointer;">❌</span>
          </div>

          <div class="search-result" *ngIf="showDropdown && filteredEmployees.length > 0">
            <div class="result-item" *ngFor="let employee of filteredEmployees" (click)="selectEmployee(employee)">
              {{ employee.firstName }} {{ employee.lastName }}
            </div>
          </div>
        </div>
      </div>

      <div class="empty" *ngIf="!selectedEmployeeId">
        <h2>Please select a user from the list to continue.</h2>

        <div class="empty-card">

          <!-- MAGNIFIER ILLUSTRATION -->
          <svg width="400" height="250" viewBox="0 0 500 300">
            <rect x="40" y="60" width="300" height="160" rx="20" fill="#EEF2F7"/>

            <circle cx="100" cy="100" r="12" fill="#cdd5df"/>
            <rect x="130" y="90" width="120" height="10" rx="5" fill="#cdd5df"/>

            <circle cx="100" cy="140" r="12" fill="#cdd5df"/>
            <rect x="130" y="130" width="120" height="10" rx="5" fill="#cdd5df"/>

            <circle cx="100" cy="180" r="12" fill="#cdd5df"/>
            <rect x="130" y="170" width="120" height="10" rx="5" fill="#cdd5df"/>

            <!-- lens -->
            <circle cx="320" cy="170" r="70" fill="#8BB5D9"/>
            <circle cx="320" cy="170" r="50" fill="#CFE5F5"/>

            <!-- handle -->
            <rect x="370" y="210" width="120" height="25"
                  transform="rotate(45 370 210)"
                  fill="#5B7EA6"/>
          </svg>

          <p>Select a user from the dropdown above to view assigned and history.</p>

          <button class="btn">View Users</button>

        </div>
      </div>

      <!-- ================= Show only when employee selected for Electronic Components ================= -->
      <div class="accordion" id="accordionExample" *ngIf="selectedEmployeeId">

        <!-- Assigned Section -->
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button accordian-head" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAssigned">
              Electronic Component - Assigned
            </button>
          </h2>

          <div *ngIf="selectTable === 'assigned'">

            <div class="accordion-body">

              <!-- If Data Available -->
              <div *ngIf="assignedStockHistory?.length > 0; else noAssignedData">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Manufacturer Part No</th>
                      <th>Transaction Type</th>
                      <th>Project Name</th>
                      <th>Quantity</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let assignedData of assignedStockHistory; let i = index">
                      <td>{{i+1}}</td>
                      <td>{{assignedData.manufacturerPartNumber}}</td>
                      <td>{{assignedData.transactionType}}</td>
                      <td>{{projectNameList[assignedData.projectName]}}</td>
                      <td>{{assignedData.finalQuantity}}</td>
                      <td>{{assignedData.dateUpdate | date:'short'}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- No Data Template -->
              <ng-template #noAssignedData>
                <span class="fs-5">No component inventory assigned to this user.</span>
              </ng-template>

            </div>
          </div>
        </div>

        <!-- History Section -->
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button collapsed accordian-head" type="button" data-bs-toggle="collapse" data-bs-target="#collapseHistory">
              Electronic Component - History
            </button>
          </h2>

          <div *ngIf="selectTable === 'history'">

            <div class="accordion-body">

              <div *ngFor="let stockHistory of issuedStockHistory; let i = index">
                <table class="table table-striped">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Manufacturer Part No</th>
                      <th>Transaction Type</th>
                      <th>Project Name</th>
                      <th>Inventory Handler</th>
                      <th>Quantity</th>
                      <th>Date</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let stockHistory of issuedStockHistory; let i = index">
                      <td>{{i+1}}</td>
                      <td>{{stockHistory.componentId.manufacturerPartNumber}}</td>
                      <td>{{stockHistory.transactionType}}</td>
                      <td>{{projectNameList[stockHistory.projectName]}}</td>
                      <td>{{stockHistory.inventoryHandler}}</td>
                      <td>{{stockHistory.quantity}}</td>
                      <td>{{stockHistory.date | date:'short'}}</td>
                      <td>{{stockHistory.note || '--'}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ng-template #noHistoryData>
                <span class="fs-5">No component inventory history available for this user.</span>
              </ng-template>

            </div>
          </div>
        </div>

      </div>

      <!-- ================= Show only when employee selected for IT SECTION ================= -->
      <div class="accordion" *ngIf="selectedEmployeeId">

        <!-- Assigned -->
        <div *ngIf="selectTable === 'assigned'">
          <div class="accordion-body">

            <div *ngIf="!ITAssignedFlag; else noITAssigned">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Inventory Id</th>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                    <th>Manufacturer</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of assignedITStockHistory; let i = index">
                    <td>{{i+1}}</td>
                    <td>{{item.inventoryId}}</td>
                    <td>{{item.transactionType}}</td>
                    <td>{{ITCategoryNameList?.[item.categoryName]}}</td>
                    <td>{{ITSubCategoryNameList?.[item.subCategoryName]}}</td>
                    <td>{{ITManufacturerNameList?.[item.manufacturer]}}</td>
                    <td>{{item.updatedAt | date:'short'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noITAssigned>
              <span class="fs-5">No IT inventory assigned to this user.</span>
            </ng-template>

          </div>
        </div>


        <!-- History -->
        <div *ngIf="selectTable === 'history'">
          <div class="accordion-body">

            <div *ngIf="!ITHistoryFlag; else noITHistory">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Inventory Id</th>
                    <th>Transaction</th>
                    <th>Category</th>
                    <th>Sub Category</th>
                    <th>Manufacturer</th>
                    <th>Handler</th>
                    <th>Date</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of ITStockHistories; let i = index">
                    <td>{{i+1}}</td>
                    <td>{{item.inventoryId?.code}}</td>
                    <td>{{item.transactionType}}</td>
                    <td>{{ITCategoryNameList?.[item.inventoryId?.categoryName]}}</td>
                    <td>{{ITSubCategoryNameList?.[item.inventoryId?.subCategoryName]}}</td>
                    <td>{{ITManufacturerNameList?.[item.inventoryId?.manufacturer]}}</td>
                    <td>{{item.inventoryHandler}}</td>
                    <td>{{item.date | date:'short'}}</td>
                    <td>{{item.note || '--'}}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ng-template #noITHistory>
              <span class="fs-5">No IT inventory history available for this user.</span>
            </ng-template>

          </div>
        </div>

      </div>

    </div>

  </div>

  <div class="row hero">
    <div class="col-lg-2 info-container">
      <div class="statistics">
        <div class="row">
          <div class="col-md-12 text-center">
            Total Number of Items Assigned:
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 text-center">
            <b> {{allotmentsDetails.totalItems}} </b>
          </div>
        </div>

        <hr>
        <div class="row">
          <div class="col-md-12 text-center">
            Total Number of IT and Other Inventory:
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 text-center">
            <b> {{allotmentsDetails.noOfIt}} </b>
          </div>
        </div>

        <hr>
        <div class="row">
          <div class="col-md-12 text-center">
            Total Number of Component Inventory:
          </div>
        </div>
        <div class="row">
          <div class="col-md-12 text-center">
            <b> {{allotmentsDetails.noOfComponent}} </b>
          </div>
        </div>

        <div class="row" style="display: none;">
          <div class="col-md-12 text-center">
            Total Number of Consumable Inventory:
          </div>
        </div>
        <div class="row" style="display: none;">
          <div class="col-md-12 text-center">
            <b> {{allotmentsDetails.noOfConsumable}} </b>
          </div>
        </div>
      </div>
    </div>

    <div class="col-lg-10 primary-container">
      <div class="row">
        <div class="col-sm-8">
          <div class="row">
            <div class="col-sm-4">
              <div class="btn-group" role="group" aria-label="Basic radio toggle button group">
                <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" value="assigned" [(ngModel)]="selectTable">

                <label class="btn btn-outline-secondary" [ngClass]="{'active': selectTable === 'assigned'}"
                  for="btnradio1">Assigned</label>

                <input type="radio" class="btn-check" name="btnradio" id="btnradio2" autocomplete="off" value="history"
                  [(ngModel)]="selectTable">
                <label class="btn btn-outline-secondary" [ngClass]="{'active': selectTable === 'history'}"
                  for="btnradio2">History</label>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4" style="display: flex;">
          <ng-select style="width: 100%;" [(ngModel)]="selectedEmployeeId" [searchable]="true"
            placeholder="Issued Person" (change)="onEmployeeSelect()">
            <ng-container *ngFor="let employee of allEmployees">
              <ng-option [value]="employee._id">
                {{employee.firstName}} {{employee.lastName}}
              </ng-option>
            </ng-container>
          </ng-select>
        </div>
      </div>

      <hr><br>

      <div *ngIf="!selectedEmployeeId" class="text-center fs-1">
        Please select a user from the list to continue.
      </div>

      IT section
      <div class="accordion" id="accordionExample-IT" *ngIf="selectedEmployeeId">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button accordian-head" type="button" [attr.data-bs-toggle]="'collapse'"
              [attr.data-bs-target]="'#collapse-IT'" [attr.aria-controls]="'collapse'" [attr.aria-expanded]="true">
              IT and Others
            </button>
          </h2>

          IT assigned section
          <div [id]="'collapse-IT'" class="accordion-collapse collapse show" data-bs-parent="#accordionExample-IT"
            [ngClass]="{'hide': selectTable === 'history'}">
            <div class="accordion-body">

              <div [ngClass]="{'hide': ITAssignedFlag === true}" class="table-container">
                <div class="usertable-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">Inventory Id</th>
                        <th scope="col" class="align-middle background-dark">Transaction Type</th>
                        <th scope="col" class="align-middle background-dark">Category Name</th>
                        <th scope="col" class="align-middle background-dark">Sub-category Name</th>
                        <th scope="col" class="align-middle background-dark">Manufacturer Name</th>
                        <th scope="col" class="align-middle background-dark">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="value-row" *ngFor="let assignedData of assignedITStockHistory; let i = index">
                        <th scope="row" class="align-middle text-center">{{i+1}}</th>
                        <td class="align-middle text-center">{{assignedData.inventoryId}}</td>
                        <td class="align-middle text-center">{{assignedData.transactionType}}</td>
                        <td class="align-middle text-center">{{ITCategoryNameList[assignedData.categoryName]}}</td>
                        <td class="align-middle text-center">{{ITSubCategoryNameList[assignedData.subCategoryName]}}
                        </td>
                        <td class="align-middle text-center">{{ITManufacturerNameList[assignedData.manufacturer]}}</td>
                        <td class="align-middle text-center">{{assignedData.updatedAt | date:'shortDate'}}
                          {{assignedData.updatedAt | date:'shortTime'}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div [ngClass]="{'hide': ITAssignedFlag === false}">
                <span class="fs-5">No IT inventory assigned to this user.</span>
              </div>

            </div>
          </div>

          IT history section
          <div [id]="'collapse-IT'" class="accordion-collapse collapse show" data-bs-parent="#accordionExample-IT"
            [ngClass]="{'hide': selectTable === 'assigned'}">
            <div class="accordion-body">

              <div [ngClass]="{'hide': ITHistoryFlag === true}" class="table-container">
                <div [id]="'collapse'" class="usertable-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">Inventory Id</th>
                        <th scope="col" class="align-middle background-dark">Transaction Type</th>
                        <th scope="col" class="align-middle background-dark">Category Name</th>
                        <th scope="col" class="align-middle background-dark">Sub-category Name</th>
                        <th scope="col" class="align-middle background-dark">Manufacturer Name</th>
                        <th scope="col" class="align-middle text-center background-dark">Inventory Handler</th>
                        <th scope="col" class="align-middle background-dark">Date</th>
                        <th scope="col" class="align-middle text-center background-dark">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="value-row" *ngFor="let stockHistory of ITStockHistories; let i = index">
                        <th scope="row" class="align-middle text-center">{{i+1}}</th>
                        <td class="align-middle text-center">{{stockHistory.inventoryId.code}}</td>
                        <td class="align-middle text-center">{{stockHistory.transactionType}}</td>
                        <td class="align-middle text-center">
                          {{ITCategoryNameList[stockHistory.inventoryId.categoryName]}}</td>
                        <td class="align-middle text-center">
                          {{ITSubCategoryNameList[stockHistory.inventoryId.subCategoryName]}}</td>
                        <td class="align-middle text-center">
                          {{ITManufacturerNameList[stockHistory.inventoryId.manufacturer]}}</td>
                        <td class="align-middle text-center">{{stockHistory.inventoryHandler}}</td>
                        <td class="align-middle text-center">{{stockHistory.date | date:'shortDate'}}
                          {{stockHistory.date | date:'shortTime'}}</td>
                        <td class="align-middle text-center">{{stockHistory.note ? stockHistory.note : '--'}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div [ngClass]="{'hide': ITHistoryFlag === false}">
                <span class="fs-5">No IT inventory history is available for this user.</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      Component Section
      <div class="accordion" id="accordionExample" *ngIf="selectedEmployeeId">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button accordian-head" type="button" [attr.data-bs-toggle]="'collapse'"
              [attr.data-bs-target]="'#collapse-COM'" [attr.aria-controls]="'collapse'">
              Component
            </button>
          </h2>

          Component assigned section
          <div [id]="'collapse-COM'" class="accordion-collapse collapse" data-bs-parent="#accordionExample"
            [ngClass]="{'hide': selectTable === 'history'}">
            <div class="accordion-body">

              <div [ngClass]="{'hide': componentAssignedFlag === true}" class="table-container">
                <div class="usertable-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">Manufacturer Part No</th>
                        <th scope="col" class="align-middle background-dark">Transaction Type</th>
                        <th scope="col" class="align-middle background-dark">Project Name</th>
                        <th scope="col" class="align-middle background-dark">Quantity</th>
                        <th scope="col" class="align-middle background-dark">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="value-row" *ngFor="let assignedData of assignedStockHistory;  let i = index">
                        <th scope="row" class="align-middle text-center">{{i+1}}</th>
                        <td class="align-middle text-center">{{assignedData.manufacturerPartNumber}}</td>
                        <td class="align-middle text-center">{{assignedData.transactionType}}</td>
                        <td class="align-middle text-center">{{projectNameList[assignedData.projectName]}}</td>
                        <td class="align-middle text-center">{{assignedData.finalQuantity}}</td>
                        <td class="align-middle text-center">{{assignedData.dateUpdate | date:'shortDate'}} {{
                          assignedData.dateUpdate | date:'shortTime' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div [ngClass]="{'hide': componentAssignedFlag === false}">
                <span class="fs-5">No component inventory assigned to this user.</span>
              </div>

            </div>
          </div>

          Component history section
          <div [id]="'collapse-COM'" class="accordion-collapse collapse" data-bs-parent="#accordionExample"
            [ngClass]="{'hide': selectTable === 'assigned'}">
            <div class="accordion-body">

              <div [ngClass]="{'hide': componentHistoryFlag === true}" class="table-container">
                <div [id]="'collapse'" class="usertable-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">Manufacturer Part No</th>
                        <th scope="col" class="align-middle background-dark">Transaction Type</th>
                        <th scope="col" class="align-middle background-dark">Project Name</th>
                        <th scope="col" class="align-middle background-dark">Inventory handler</th>
                        <th scope="col" class="align-middle background-dark">Quantity</th>
                        <th scope="col" class="align-middle background-dark">Date</th>
                        <th scope="col" class="align-middle background-dark">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="value-row" *ngFor="let stockHistory of issuedStockHistory;  let i = index">
                        <th scope="row" class="align-middle text-center">{{i+1}}</th>
                        <td class="align-middle text-center">{{stockHistory.componentId.manufacturerPartNumber}}</td>
                        <td class="align-middle text-center">{{stockHistory.transactionType}}</td>
                        <td class="align-middle text-center">{{projectNameList[stockHistory.projectName]}}</td>
                        <td class="align-middle text-center">{{stockHistory.inventoryHandler}}</td>
                        <td class="align-middle text-center">{{stockHistory.quantity}}</td>
                        <td class="align-middle text-center">{{stockHistory.date | date:'shortDate'}} {{
                          stockHistory.date | date:'shortTime' }}</td>
                        <td class="align-middle text-center">{{stockHistory.note ? stockHistory.note : '--'}}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div [ngClass]="{'hide': componentHistoryFlag === false}">
                <span class="fs-5">No component inventory history is available for this user.</span>
              </div>

            </div>
          </div>

        </div>
      </div>

      Consumable Section
      <div class="accordion" id="accordionExample" style="display: none;" *ngIf="selectedEmployeeId">
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button accordian-head" type="button" [attr.data-bs-toggle]="'collapse'"
              [attr.data-bs-target]="'#collapse'" [attr.aria-controls]="'collapse'">
              Consumable
            </button>
          </h2>

          Consumable assigned section
          <div [id]="'collapse'" class="accordion-collapse collapse" data-bs-parent="#accordionExample"
            [ngClass]="{'hide': selectTable === 'assigned'}">
            <div class="accordion-body">
              <div class="table-container">
                <div class="usertable-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="value-row">
                        <th scope="row" class="align-middle text-center">--</th>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          Consumable history section
          <div [id]="'collapse'" class="accordion-collapse collapse" data-bs-parent="#accordionExample"
            [ngClass]="{'hide': selectTable === 'history'}">
            <div class="accordion-body">
              <div class="table-container">
                <div [id]="'collapse'" class="usertable-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">--</th>
                        <th scope="col" class="align-middle background-dark">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr class="value-row">
                        <th scope="row" class="align-middle text-center">--</th>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                        <td class="align-middle text-center">--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
  */
}
