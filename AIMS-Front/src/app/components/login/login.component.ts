import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { PostLoginRedirectService } from 'src/app/services/post-login-redirect.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginError: string | null = null
  loginForm: FormGroup

  constructor(private database: DatabaseService, private authContext: SessionstorageService, private postLoginRedirect: PostLoginRedirectService, private router: Router) {

    this.loginForm = new FormGroup({
      loginId: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });

  }

  ngOnInit(): void { }

  /**
   * ---------------------------------------------------------------------
   * Function: loginData
   *
   * File: login.component.ts
   * Description:
   *   Handles the login process for users by verifying credentials through
   *   the backend API. On successful authentication, it stores user session
   *   details (such as token, user rights, and basic info) in sessionStorage.
   *   Based on user type and access rights, it redirects the user to the
   *   appropriate dashboard.
   *
   * Workflow:
   *   1. Sends login credentials to the server via DatabaseService.
   *   2. Handles various login responses (user not found, incorrect password,
   *      disabled or terminated accounts).
   *   3. Stores authenticated user details and access permissions.
   *   4. Determines the active department and dashboard to redirect.
   *
   * Parameters:
   *   None
   *
   * Last Modified: 29 October 2025
   * Modified By: Raza A [AS-127]
   * ---------------------------------------------------------------------
   */
  loginData() {
    // const subActive = {
    //   "IT Department": "IT-Dashboard",
    //   "Electronic Components": "Electronic-Dashboard",
    //   "Testing Equipments": "Testing-Dashboard",
    //   "Fixed Asset": "Fixed-Dashboard",
    //   "Consumable": "Consumable-Dashboard"
    // };

    this.database.login(this.loginForm.value).subscribe((data: any) => {
      if (data.status === 'login') {
        this.loginError = 'User Is not found';
      } else if (data.status === 'password') {
        this.loginError = 'Password is incorrect';
      } else if (data.status === 'sucess') {
        if (data.userStatus === 0) {
          this.loginError = 'This user has been disabled, Please contact the administrator.';
        } else if (data.userStatus === 2) {
          this.loginError = 'This user has been terminated.';
        } else {
          sessionStorage.setItem("auth-token", data.token);

          this.database.authContext().subscribe((ctx: any) => {
            this.authContext.setContext(ctx); // context service now has data

            // redirect AFTER context is set
            const route = this.postLoginRedirect.redirectUser();
            console.log('route', route)
            this.router.navigateByUrl(route);
          });
        }
      }
    });

  }

}
