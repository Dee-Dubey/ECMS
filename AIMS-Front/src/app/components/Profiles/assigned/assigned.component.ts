import { Component, OnInit } from '@angular/core';
import { isArray } from 'chart.js/dist/helpers/helpers.core';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-assigned',
  templateUrl: './assigned.component.html',
  styleUrls: ['./assigned.component.css']
})
export class AssignedComponent implements OnInit {

  issuedStockHistory: any[] = [];
  projectNameList: any = {};

  assignedStockHistory: any = []

  assignedITStockHistory: any = []
  employeeCode: string = '';

  ITSubCategoryNameList: any
  ITCategoryNameList: any
  ITManufacturerNameList: any

  selectedSection: string = 'it';
  electronicHistories: any[] = [];
  testingHistories: any[] = [];
  fixedAssetHistories: any[] = [];
  consumableHistories: any[] = [];
  ITStockHistories: any[] = [];
  selectSection(section: string) { this.selectedSection = section; }


  constructor(private database: DatabaseService, private authCtx: SessionstorageService) { }

  ngOnInit(): void {

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { user } = ctx
      this.employeeCode = user.employeeCode;

    })

    // Fetch the project data form map the Project name with the id
    this.database.getProjectNameList().subscribe((data: any) => {
      this.projectNameList = data;
    });

    // Fetch the category name for IT Stock
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
        console.error('Failed to fetch IT category name list:', err);
        this.ITCategoryNameList = {};
      }
    });


    // Fetch the sub category name for IT Stock
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

    //Fetch the manufacturer for IT Stock
    this.database.getITManufacturerNameList().subscribe({
      next: (res: any) => {
        console.log('res', res)
        if (res?.success && res?.data) {
          this.ITManufacturerNameList = res.data.map;
          // this.ITManufacturerListArray = res.data.list;
          console.log('Manufacturer name map:', this.ITManufacturerNameList);
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

    this.loadStockHistory();
    this.loadITStockHistory();
  }

  //This loads the stock history for component
  loadStockHistory() {
    let employeeCode = this.employeeCode
    if (employeeCode) {
      this.database.getStockHistoryFromIssuedUser(employeeCode).subscribe((data: any) => {
        if(!data || !Array.isArray(data)){
          this.assignedStockHistory = []
          return
        }
        this.assignedStockHistory = this.processStockHistory(data)
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

  //Loads the Stock history in IT
  loadITStockHistory() {
    let employeeCode = this.employeeCode
    if (employeeCode) {
      this.database.getITAssignedUserData(employeeCode).subscribe((data: any) => {
        if(!data || !Array.isArray(data)){
          this.assignedITStockHistory = []
          return
        }
        const processedData = data.map((item: any) => ({
          categoryName: item.categoryName,
          subCategoryName: item.subCategoryName,
          manufacturer: item.manufacturer,
          inventoryId: item.code,
          transactionType: 'Assigned', // Set transactionType statically
          updatedAt: item.updatedAt
        }));

        this.assignedITStockHistory = processedData
      });
    }
  }

}
