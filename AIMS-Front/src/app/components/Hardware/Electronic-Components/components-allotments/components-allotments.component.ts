import { Component, HostListener, ElementRef, ViewChild } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-components-allotments',
  templateUrl: './components-allotments.component.html',
  styleUrls: ['./components-allotments.component.css']
})
export class ComponentsAllotmentsComponent {

  @ViewChild('searchContainer') searchContainer!: ElementRef;

  selectTable: string = "assigned";
  searchText: string = '';

  selectedEmployee: any = null;
  selectedEmployeeId: string | null = null;

  showDropdown: boolean = true;
  componentAssignedFlag: boolean = false;
  componentHistoryFlag: boolean = false;

  projectNameList: any = {};
  filteredEmployees: any[] = [];
  allEmployees: Array<any> = []
  assignedStockHistory: any = []
  issuedStockHistory: any[] = [];

  allotmentsDetails = {
    totalItems: 0,
    noOfIt: 0,
    noOfComponent: 0,
    noOfConsumable: 0,
  }

  constructor(private database: DatabaseService, private elementRef: ElementRef) { }

  ngOnInit(): void {

    /** get all user API request*/
    this.database.getAllUsers('all').subscribe((data: any) => {
      this.allEmployees = data;
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
    this.assignedStockHistory = [];
    this.issuedStockHistory = [];

    this.componentAssignedFlag = false;
    this.componentHistoryFlag = false;

    this.selectedEmployee = this.allEmployees.find(
      emp => emp._id === this.selectedEmployeeId
    );

    if (!this.selectedEmployee) return;

    this.loadStockHistory();
    this.getHistoryComponent();
  }

  openUserList() {
    this.searchText = '';
    this.filteredEmployees = this.allEmployees;
    this.showDropdown = true;
  }

  /** This function display all assigned Item*/
  updateTotalItems() {
    const componentLength = this.assignedStockHistory?.length || 0;

    this.allotmentsDetails.totalItems + componentLength;
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
    this.assignedStockHistory = [];
    this.issuedStockHistory = [];

    // Reset flags
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
