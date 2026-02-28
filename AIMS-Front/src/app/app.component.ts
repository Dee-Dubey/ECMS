import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from './services/database.service';
import { SessionstorageService } from './services/sessionstorage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AIMS_Front';

  constructor(private router: Router, private database: DatabaseService, private authContext: SessionstorageService) { }

  ngOnInit() {
    const token = sessionStorage.getItem('auth-token');
    if (!token) {
      this.authContext.clear();
      return;
    }
    this.database.authContext().subscribe({
      next: ctx => this.authContext.setContext(ctx),
      error: () => {
        sessionStorage.removeItem('auth-token');
        this.authContext.clear();
        this.router.navigateByUrl('/login');
      }
    });
  }
}
