import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-it-allotments',
  templateUrl: './it-allotments.component.html',
  styleUrls: ['./it-allotments.component.css']
})
export class ItAllotmentsComponent {

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  ITSubCategoryNameList: any
  ITCategoryNameList: any
  ITManufacturerNameList: any

  selectTable: string = "assigned";
  searchText: string = '';

  selectedEmployee: any = null;
  selectedEmployeeId: string | null = null;

  showDropdown: boolean = true;
  ITAssignedFlag: boolean = false;
  ITHistoryFlag: boolean = false;
  componentAssignedFlag: boolean = false;
  componentHistoryFlag: boolean = false;

  projectNameList: any = {};
  filteredEmployees: any[] = [];
  allEmployees: Array<any> = []
  assignedITStockHistory: any = []
  assignedStockHistory: any = []
  ITStockHistories: any[] = [];
  issuedStockHistory: any[] = [];

  allotmentsDetails = {
    totalItems: 0,
    noOfIt: 0,
    noOfComponent: 0,
    noOfConsumable: 0,
  }

  constructor(private database: DatabaseService) { }

  ngOnInit(): void {

    /** get all user API request*/
    this.database.getAllUsers('all').subscribe((data: any) => {
      this.allEmployees = data;
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {

    if (!this.searchContainer) return;

    const clickedInside = this.searchContainer.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.showDropdown = false;
    }
  }

  openUserList() {
    this.searchText = '';
    this.filteredEmployees = this.allEmployees;
    this.showDropdown = true;
  }

  filterEmployees() {
    const value = this.searchText?.trim().toLowerCase();

    if (value) {
      this.filteredEmployees = this.allEmployees.filter(emp =>
        (emp.firstName + ' ' + emp.lastName)
          .toLowerCase()
          .includes(value)
      );

      this.showDropdown = true;  // Open dropdown when typing
    } else {
      this.filteredEmployees = [];
      this.showDropdown = false; // Hide when empty
    }
  }

  selectEmployee(employee: any) {
    this.selectedEmployeeId = employee._id;
    this.searchText = employee.firstName + ' ' + employee.lastName;
    this.selectTable = 'assigned';
    this.filteredEmployees = [];
    this.showDropdown = false;
    this.onEmployeeSelect(); // call your old function
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

  /** This function display all assigned Item*/
  updateTotalItems() {
    const itLength = this.assignedITStockHistory?.length || 0;
    const componentLength = this.assignedStockHistory?.length || 0;

    this.allotmentsDetails.totalItems = itLength + componentLength;
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

  clearSearch() {

    // Clear search input
    this.searchText = '';

    // Reset dropdown list
    this.filteredEmployees = [...this.allEmployees];
    this.showDropdown = false;

    // Remove selected employee
    this.selectedEmployeeId = null;
    this.selectedEmployee = null;

    // 🔥 HARD RESET ALL DATA
    this.assignedITStockHistory = [];
    this.ITStockHistories = [];
    this.assignedStockHistory = [];
    this.issuedStockHistory = [];

    // Reset flags
    this.ITAssignedFlag = false;
    this.ITHistoryFlag = false;
    this.componentAssignedFlag = false;
    this.componentHistoryFlag = false;

    // Reset stats numbers
    this.allotmentsDetails = {
      totalItems: 0,
      noOfIt: 0,
      noOfComponent: 0,
      noOfConsumable: 0
    };

    // Reset tab
    this.selectTable = 'assigned';
  }

}
