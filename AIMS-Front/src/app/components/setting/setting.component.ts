import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {

  userRights: any;
  pillsActive: any;
  activeList: any;

  userType: string | null = '';
  staffType: string | null = '';

  private navbarListSubscription!: Subscription;

  constructor(private dataService: DataService, private authCtx: SessionstorageService) { }

  ngOnInit(): void {

    this.authCtx.context$.subscribe(ctx =>{
      if(!ctx){
        return
      }
      const {user, rights} = ctx;

      this.userRights = rights || {};
      this.userType = user.userType;
      this.staffType = user.staffType

    })

    /** Get Active from the session storage*/
    this.pillsActive = JSON.parse(sessionStorage.getItem('active') || '{}');

    this.navbarListSubscription = this.dataService.listenActiveDepartment().subscribe(dept => this.activeList = dept);

  }

  ngOnDestroy() {
    this.navbarListSubscription.unsubscribe();
  }

}
