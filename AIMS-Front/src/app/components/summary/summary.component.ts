import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {

  ITCategoryNameList: any;
  ITSubCategoryNameList: any;

  summariesAssets: any = []

  constructor(private database: DatabaseService) { }

  ngOnInit(): void {

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

    /** Get IT sub category name list*/
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

    /** Get IT stock summary*/
    this.database.getITStockSummary().subscribe((data: any) => {
      console.log(data)
      this.summariesAssets = data
    });

  }

}
