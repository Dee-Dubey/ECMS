import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.css']
})
export class GuideComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  selectedSection: string = 'it';
  electronicHistories: any[] = [];
  testingHistories: any[] = [];
  fixedAssetHistories: any[] = [];
  consumableHistories: any[] = [];
  ITStockHistories: any[] = [];
  selectSection(section: string) { this.selectedSection = section; }

  ngOnInit(): void {

    //For Section routing
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        // Find the element with the corresponding ID
        const element = document.getElementById(fragment);
        if (element) {
          // Scroll to the element
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });

  }

}
