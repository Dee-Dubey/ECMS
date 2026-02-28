import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  date: Date = new Date();
  appVersion: string | number = "--"

  constructor(private database: DatabaseService){}

  ngOnInit(): void {
    
    this.database.getAppVersion().subscribe((data: any)=>{
      this.appVersion = data.appVersion;
    });
  }

}
