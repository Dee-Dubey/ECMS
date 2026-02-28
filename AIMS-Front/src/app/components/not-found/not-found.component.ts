import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

interface PermissionView {
  department: string;
  module: string;
  permissions: string[];
}

interface Responsibility {
  department: string;
  module: string;
  actions: string[];
}

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  userDetail: any = null;
  rights: any = null;

  permissionViewList: PermissionView[] = [];
  responsibilities: Responsibility[] = [];

  constructor(private router: Router) { }

  ngOnInit(): void { }

  goToHome() {
    this.router.navigate(['/']);
  }

}
