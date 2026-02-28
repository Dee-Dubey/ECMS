import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-inventory-dash',
  templateUrl: './inventory-dash.component.html',
  styleUrls: ['./inventory-dash.component.css']
})
export class InventoryDashComponent implements OnInit {

  subCategoryList: Array<any> = [];
  selectedSubCategory: string | null = null;

  categoryList: Array<any> = [];
  selectedCategory: string | null = null;

  manufacturerList: Array<any> = [];
  selectedManufacturer: string | null = null;

  supplierList: Array<any> = [];
  selectedSupplier: string | null = null;

  ITInventoryList: Array<any> = [];

  ItStockHistories: any = [];

  selectedFilterStockHistory: string = 'all';
  selectedRow: number | null = null;

  selectedITInventory: any = {};

  filteredStockHistories: any[] = [];
  inputFields: any = {};

  users: any[] = [];
  filteredUsers: Array<any> = []
  isViewingDetails: boolean = false;

  //Default Inventory status
  ITInventoryStatus: any = 0;
  inputSearchText: string = ''

  pageLimit = 10;
  currentPageNo = 1;
  totalPages: any

  userRights: any
  employeeRights: any;
  employeeCode: string = '';
  ITSubCategoryNameList: any
  ITCategoryNameList: any
  ITSupplierNameList: any
  ITManufacturerNameList: any

  currentTransactionType: any = {};

  // FormGroups
  modifyITInventoryForm: FormGroup;
  issueITInventoryForm: FormGroup;
  returnITInventoryForm: FormGroup;

  constructor(private database: DatabaseService, private router: Router, private authCtx: SessionstorageService) {

    //ModifyForm
    this.modifyITInventoryForm = new FormGroup({
      categoryName: new FormControl({ value: null, disabled: true }, [Validators.required]),
      subCategoryName: new FormControl({ value: null, disabled: true }, [Validators.required]),
      supplier: new FormControl(null),
      purchaseDate: new FormControl(''),
      amount: new FormControl('', [Validators.required]),
      warrantyDate: new FormControl(''),
      manufacturer: new FormControl(null, [Validators.required]),
      modelNo: new FormControl(''),
      serialNo: new FormControl(''),
      inputVoltage: new FormControl(''),
      key: new FormControl(''),
      subscriptionStart: new FormControl(''),
      subscriptionEnd: new FormControl(''),
      cpu: new FormControl(''),
      ram: new FormControl(''),
      drive: new FormControl(''),
      systemConfig: new FormControl(''),
      licenseInEff: new FormControl(''),
      msEffect: new FormControl(''),
      ipAddress: new FormControl(''),
      internetAccess: new FormControl(''),
      softwareInstalled: new FormControl(''),
      lastUse: new FormControl(''),
      description: new FormControl('')
    });

    this.issueITInventoryForm = new FormGroup({
      issuedDate: new FormControl('', [Validators.required]),
      issuedTo: new FormControl('', [Validators.required]),
      note: new FormControl('')
    });

    this.returnITInventoryForm = new FormGroup({
      returnedDate: new FormControl('', [Validators.required]),
      note: new FormControl('')
    });

  }

  ngOnInit(): void {
    this.selectedITInventory = { status: 0 }

    this.authCtx.context$.subscribe(ctx => {
      if(!ctx){
        return
      }

      const {user, rights} = ctx;
      this.employeeCode = user.employeeCode;
      this.employeeRights = user.staffType;
      this.userRights = rights;
    });

    //Updated inventory status
    this.ITInventoryStatus = this.selectedITInventory.status || 0;
    this.isViewingDetails = true;

    //GET ALL USERS
    this.database.getAllUsers('all').subscribe((data: any) => {
      this.users = data;
      this.filteredUsers = this.users.filter(user => user.status !== 2 && user.status !== 0);
    });

    //IT Inventory Name Lists
    this.database.getITCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.categoryList = res.data.list; // Array form
          this.ITCategoryNameList = res.data.map;   // Key-value form
        } else {
          this.categoryList = [];
          this.ITCategoryNameList = {};
        }

        console.log('categoryList:', this.categoryList);
        console.log('ITCategoryNameMap:', this.ITCategoryNameList);
      },
      error: (err) => {
        console.error('Failed to fetch IT category name list:', err);
        this.categoryList = [];
        this.ITCategoryNameList = {};
      }
    });

    this.database.getITSupplierNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          // Store both map (for lookups) and list (for dropdowns or iteration)
          this.ITSupplierNameList = res.data.map;
          this.supplierList = res.data.list;

          console.log('Supplier name map:', this.ITSupplierNameList);
          console.log('Supplier list array:', this.supplierList);
        } else {
          console.warn('No supplier data found or invalid response:', res);
          this.ITSupplierNameList = {};
          this.supplierList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching supplier names:', err);
        this.ITSupplierNameList = {};
        this.supplierList = [];
      }
    });

    this.database.getITSubCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.subCategoryList = res.data.list || [];
          this.ITSubCategoryNameList = res.data.map || {};
        } else {
          console.warn('No subcategories found or invalid response:', res);
          this.subCategoryList = [];
          this.ITSubCategoryNameList = {};
        }
        console.log('Subcategories loaded:', this.ITSubCategoryNameList);
      },
      error: (err) => {
        console.error('Error fetching subcategory data:', err);
        this.subCategoryList = [];
        this.ITSubCategoryNameList = {};
      }
    });

    this.database.getITManufacturerNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          // Save both list and map for flexibility in UI usage
          this.ITManufacturerNameList = res.data.map;
          this.manufacturerList = res.data.list;

          console.log('Manufacturer name map:', this.ITManufacturerNameList);
          console.log('Manufacturer list array:', this.manufacturerList);
        } else {
          console.warn('No manufacturer data found or invalid response:', res);
          this.ITManufacturerNameList = {};
          this.manufacturerList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching manufacturer names:', err);
        this.ITManufacturerNameList = {};
        this.manufacturerList = [];
      }
    });

    this.getFilteredITInventory();
    this.modifyITInventoryForm.get('categoryName')?.disable;
    this.modifyITInventoryForm.get('subcategoryName')?.disable;
    this.modifyITInventoryForm.get('quantity')?.disable;
    this.refreshData();

  }

  //This is used to Refresh Inventory
  refreshData() {
    this.getFilteredITInventory();
  }

  //This is used to apply changes
  applyFilter() {
    this.currentPageNo = 1;     //Reset the current page to 1
    this.getFilteredITInventory();
  }

  //This is used to get inventory by applying filters
  getFilteredITInventory() {
    this.database.getAllInventorytByFilter({
      category: this.selectedCategory,
      manufacturer: this.selectedManufacturer,
      subcategory: this.selectedSubCategory
    }, this.currentPageNo, this.pageLimit).subscribe((data: any) => {
      this.ITInventoryList = data.inventoryItems;
      this.totalPages = data.totalPages;
    });
  }

  //This is used to reset fields/form
  clearSelection() {
    $('#modify-tab').click();
    this.modifyITInventoryForm.reset();
    this.issueITInventoryForm.reset();
    this.returnITInventoryForm.reset();
    this.selectedFilterStockHistory = 'all';
    this.selectedRow = null
  }

  //This is used to display data with respect to category in IT-Inventory
  changeCategory() {
    this.getFilteredITInventory();
  }

  //This is used to display data with respect to subcategory in IT-Inventory
  changeSubCategory() {
    this.getFilteredITInventory();
  }

  //This is used to display data with respect to manufacturer in IT-Inventory
  changeManufacturer() {
    this.getFilteredITInventory();
  }

  //This is used for getting stock history in IT-Inventory
  getITInventoryStockHistory(ITInventory: any) {
    this.database.getITStockHistoryByInventoryId(ITInventory._id).subscribe((data) => {
      this.ItStockHistories = data;
      this.applyFilterOnStockHistory();
    });
  }

  //This opens the stock history modal
  openStockHistoryModal(inventory: any) {
    this.selectedITInventory = {};
    this.selectedITInventory = inventory;
    this.getITInventoryStockHistory(inventory);
  }

  //This opens Edit modal
  openITInventoryEdit(ITInventory: any) {
    this.currentTransactionType = {};
    this.inputFields = {}
    this.selectedITInventory = {};
    this.selectedITInventory = ITInventory;
    console.log('see the user section', this.selectedITInventory)

    //setting the inventory status
    this.ITInventoryStatus = ITInventory.status

    this.subCategoryList.forEach(subcategory => {
      let subcategoryId = subcategory._id
      let categotoryId = subcategory.categoryName._id
      if (this.selectedITInventory.categoryName._id === categotoryId && this.selectedITInventory.subCategoryName._id === subcategoryId) {
        this.inputFields = subcategory.fields
      }
    })

    let newPurchaseDate = ITInventory.purchaseDate ? new Date(ITInventory.purchaseDate).toISOString().split('T')[0] : '';
    let newWarrantyDate = ITInventory.warrantyDate ? new Date(ITInventory.warrantyDate).toISOString().split('T')[0] : '';
    let newSubscriptionStartDate = ITInventory.subscriptionStart ? new Date(ITInventory.subscriptionStart).toISOString().split('T')[0] : '';
    let newSubscriptionEndDate = ITInventory.subscriptionEnd ? new Date(ITInventory.subscriptionEnd).toISOString().split('T')[0] : '';

    this.currentTransactionType = ITInventory.transactionType
    console.log('it inventory', ITInventory)
    this.modifyITInventoryForm.patchValue({
      categoryName: ITInventory.categoryName._id,
      subCategoryName: ITInventory.subCategoryName._id,
      description: ITInventory.description,
      supplier: ITInventory.supplier?._id,
      purchaseDate: newPurchaseDate,
      amount: ITInventory.amount,
      warrantyDate: newWarrantyDate,
      manufacturer: ITInventory.manufacturer._id,
      modelNo: ITInventory.modelNo,
      serialNo: ITInventory.serialNo,
      inputVoltage: ITInventory.inputVoltage,
      key: ITInventory.key || '',
      subscriptionStart: newSubscriptionStartDate,
      subscriptionEnd: newSubscriptionEndDate,
      cpu: ITInventory.cpu,
      ram: ITInventory.ram,
      drive: ITInventory.drive,
      systemConfig: ITInventory.systemConfig,
      licenseInEff: ITInventory.licenseInEff,
      msEffect: ITInventory.msEffect,
      ipAddress: ITInventory.ipAddress,
      internetAccess: ITInventory.internetAccess,
      softwareInstalled: ITInventory.softwareInstalled,
      lastUse: ITInventory.lastUse

    })
  }

  //This is used to display issue form with respect to user rights
  shouldShowIssueForm(): boolean {
    if (this.userRights.ITDepartment.ITInventory.issue !== 1) {
      return false;
    }
    if (this.selectedITInventory.status === 1 || this.selectedITInventory.status === 2) {
      return false;
    }
    if (this.selectedITInventory.transactionType !== 'returned' && this.selectedITInventory.transactionType !== 'create') {
      return false;
    }
    return true;
  }

  //This is used to display return form with respect to user rights
  shouldShowReturnForm(): boolean {
    return (
      this.userRights.ITDepartment.ITInventory.return === 1 &&
      this.selectedITInventory.transactionType === 'issue' &&
      this.userRights.ITDepartment.ITInventory.manage === 0
    );
  }

  //This is used to display modify form with respect to user rights
  shouldShowModifyForm(): boolean {
    return this.userRights.ITDepartment.ITInventory.manage === 1;
  }

  //For displaying all stock histories in IT-Inventory
  stockHistoryAll() {
    this.selectedRow = null;
    this.selectedFilterStockHistory = 'all';
    this.applyFilterOnStockHistory();
  }

  //For apply history in according to TransactionType
  applyFilterOnStockHistory() {
    if (this.selectedFilterStockHistory === 'all') {
      this.filteredStockHistories = this.ItStockHistories
    } else {
      this.filteredStockHistories = this.ItStockHistories.filter((stock: any) => stock.transactionType === this.selectedFilterStockHistory);
    }
  }

  //Display History for create TransactionType
  stockHistoryCreate() {
    this.selectedRow = null;
    this.selectedFilterStockHistory = 'create';
    this.applyFilterOnStockHistory();
  }

  //Display History for issue TransactionType
  stockHistoryIssue() {
    this.selectedRow = null;
    this.selectedFilterStockHistory = 'issue';
    this.applyFilterOnStockHistory();
  }

  //Display History for return TransactionType
  stockHistoryReturned() {
    this.selectedRow = null;
    this.selectedFilterStockHistory = 'returned';
    this.applyFilterOnStockHistory();
  }

  // page reload
  pageRefresh() {
    window.location.reload();
  }

  //This is used to submit modify Inventory
  submitModifyInventory() {
    const modifiedITInventory = {
      categoryName: this.modifyITInventoryForm.value.categoryName,
      subCategoryName: this.modifyITInventoryForm.value.subCategoryName,
      description: this.modifyITInventoryForm.value.description,
      supplier: this.modifyITInventoryForm.value.supplier,
      purchaseDate: this.modifyITInventoryForm.value.purchaseDate,
      amount: this.modifyITInventoryForm.value.amount,
      warrantyDate: this.modifyITInventoryForm.value.warrantyDate || '',
      manufacturer: this.modifyITInventoryForm.value.manufacturer,
      modelNo: this.modifyITInventoryForm.value.modelNo,
      serialNo: this.modifyITInventoryForm.value.serialNo,
      inputVoltage: this.modifyITInventoryForm.value.inputVoltage,
      key: this.modifyITInventoryForm.value.key,
      subscriptionStart: this.modifyITInventoryForm.value.subscriptionStart,
      subscriptionEnd: this.modifyITInventoryForm.value.subscriptionEnd,
      cpu: this.modifyITInventoryForm.value.cpu,
      ram: this.modifyITInventoryForm.value.ram,
      drive: this.modifyITInventoryForm.value.drive || '',
      systemConfig: this.modifyITInventoryForm.value.systemConfig,
      licenseInEff: this.modifyITInventoryForm.value.licenseInEff || '',
      msEffect: this.modifyITInventoryForm.value.msEffect || '',
      ipAddress: this.modifyITInventoryForm.value.ipAddress,
      internetAccess: this.modifyITInventoryForm.value.internetAccess,
      softwareInstalled: this.modifyITInventoryForm.value.softwareInstalled,
      lastUse: this.modifyITInventoryForm.value.lastUse
    }
    this.database.updateInvenDashById(modifiedITInventory, this.selectedITInventory._id).subscribe((data: any) => {
      if (!data.error) {
        window.location.reload()
      }
    })
  }

  //For submitting issue
  submitITIssueInventory() {
    const ITHistory = {
      inventoryId: this.selectedITInventory._id,
      transactionType: 'issue',
      status: this.selectedITInventory.status,
      inventoryHandler: this.employeeCode,
      quantity: this.selectedITInventory.quantity,
      code: this.selectedITInventory.code,
      issuedTo: this.issueITInventoryForm.value.issuedTo,
      date: new Date,
      note: this.issueITInventoryForm.value.note,
    }

    this.selectedITInventory.transactionType = 'issue';
    this.selectedITInventory.user = this.issueITInventoryForm.value.issuedTo
    this.database.postIssuedITInventory({ inventory: this.selectedITInventory, stock: ITHistory }).subscribe((data: any) => {
      if (data.message) {
        window.location.reload()
      }
    })
  }

  //Return IT Inventory
  submitReturnInventory() {
    // Fetch stock history based on selected inventory ID
    this.database.getITStockHistoryByInventoryId(this.selectedITInventory._id).subscribe((stockHistory: any) => {
      // Filter stock entries with transactionType 'issue'
      const issuedStocks = stockHistory.filter((entry: any) => entry.transactionType === 'issue');
      // Sort the filtered entries by date in descending order
      const sortedIssuedStocks = issuedStocks.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      // Get the latest issued stock entry
      const lastIssuedStock = sortedIssuedStocks[0];
      if (!lastIssuedStock) {
        console.error("No issued stock entry found for the selected inventory");
        return;
      }
      const ITHistory = {
        inventoryId: this.selectedITInventory._id,
        transactionType: 'returned',
        status: this.selectedITInventory.status,
        inventoryHandler: this.employeeCode,
        quantity: this.selectedITInventory.quantity,
        code: this.selectedITInventory.code,
        issuedTo: lastIssuedStock.issuedTo, // Access issuedTo from the last issued stock entry
        date: new Date(),
        note: this.returnITInventoryForm.value.note
      };
      this.selectedITInventory.transactionType = 'returned';
      this.selectedITInventory.user = null
      this.database.postReturnInventory({ inventory: this.selectedITInventory, stock: ITHistory }).subscribe((data: any) => {
        if (data.message) {
          window.location.reload()
        }
      })

    }, (error) => {
      console.error("Error fetching stock history:", error);
    });
  }

  // This is used to update the status for inventory
  updateStatus() {
    const inventoryId = this.selectedITInventory._id

    const updatedStatus = this.ITInventoryStatus;
    this.database.updateinventoryStatus(inventoryId, updatedStatus).subscribe((data: any) => {
      if (data.message) {
        window.location.reload()
      }
    })
  }

  //Search content for IT Inventory
  getAllInventories() {
    this.currentPageNo = 1;
    if (this.inputSearchText === '') {
      console.log("input search text", this.inputSearchText)
      this.getFilteredITInventory();
    }
  }

  //This gives the filtered search iIT-Inventory after searching
  filterSearchedInventory() {
    let searchedText = this.inputSearchText
    if (this.inputSearchText !== '') {
      this.database.filterSearchedInventory({ searchedText }, this.currentPageNo, this.pageLimit).subscribe((data: any) => {
        this.ITInventoryList = data.inventories;
        this.totalPages = data.totalPages
      })
    } else {
      this.getFilteredITInventory();
    }

  }

  //To change limit for data in per page
  changeDataLimit() {
    this.currentPageNo = 1;
    this.updatedInventoryList()
  }

  //This gives the updated data after pagination
  updatedInventoryList() {
    if (this.inputSearchText) {
      this.filterSearchedInventory()
    } else {
      this.getFilteredITInventory()
    }
  }

  //This takes you to previous page
  previousPage() {
    if (this.currentPageNo > 3) {
      this.currentPageNo -= 3;
      this.updatedInventoryList();
    } else {
      this.currentPageNo = 1;
      this.updatedInventoryList();
    }
  }

  //This takes you to render any page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageNo = page;

      this.updatedInventoryList()
    }

  }

  //This takes you to next page
  nextPage() {
    if (this.currentPageNo + 3 <= this.totalPages) {
      this.currentPageNo += 3;
      this.updatedInventoryList();
    } else {
      this.currentPageNo = this.totalPages;
      this.updatedInventoryList();
    }
  }

  //It is used to go on first page
  goToFirstPage(): void {
    this.currentPageNo = 1;
    this.updatedInventoryList();
  }

  //It is used to go on last page
  goToLastPage(): void {
    this.currentPageNo = this.totalPages;
    this.updatedInventoryList();
  }

  //This calculates the page to take 3 pages
  getPagesToShow(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPageNo - 1);
    const endPage = Math.min(this.totalPages, startPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

}
