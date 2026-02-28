import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../../services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  issuedStockHistory: any[] = [];
  projectNameList: any = {};
  employeeCode: string = ''

  ITStockHistories: any[] = [];

  ITSubCategoryNameList: any
  ITCategoryNameList: any
  ITManufacturerNameList: any

  selectedSection: string = 'it';
  electronicHistories: any[] = [];
  testingHistories: any[] = [];
  fixedAssetHistories: any[] = [];
  consumableHistories: any[] = [];
  selectSection(section: string) { this.selectedSection = section; }

  constructor(private database: DatabaseService, private authCtx: SessionstorageService) { }

  ngOnInit(): void {

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { user } = ctx;
      this.employeeCode = user.employeeCode
    });

    //This is used to get history of particular user
    this.database.getStockHistoryFromIssuedUser(this.employeeCode).subscribe((data: any) => {

      if (data.error) {
        alert(data.error)
      } else {
        this.issuedStockHistory = data
      }
    });

    //Get project list
    this.database.getProjectNameList().subscribe((data: any) => {
      this.projectNameList = data;
    });


    // Fetch the IT setting name list with mapped id
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

    //Get Sub-category in IT-Inventory
    this.database.getITSubCategoryNameList().subscribe({
      next: (res: any) => {
        // Validate the backend response
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


    //Get IT-Manufacturer in IT-Inventory
    this.database.getITManufacturerNameList().subscribe((res: any) => {
      if (res?.success && res?.data?.map) {
        this.ITManufacturerNameList = res.data.map;   // ✅ use map only
      } else {
        this.ITManufacturerNameList = {};
      }

      console.log('IT Manufacturer Map:', this.ITManufacturerNameList);
    });

    //Used to get stock history for individual user in IT-Inventory
    this.database.getITStockHistoryData(this.employeeCode).subscribe((data: any) => {
      if (data.error) {
        alert(data.error)
      } else {
        this.ITStockHistories = data
        console.log('=========================', this.ITStockHistories);
      }
    });
  }

}
