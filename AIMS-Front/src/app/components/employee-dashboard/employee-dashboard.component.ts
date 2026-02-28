import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-employee-dashboard',
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {

  employeeDetail: any;
  resetPasswordFrom: FormGroup;

  constructor(private database: DatabaseService, private router: Router) {

    this.resetPasswordFrom = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, {
      validators: this.matchPasswordValidators
    });

  }

  ngOnInit(): void {
    this.database.getAllUsers('all').subscribe((data: any) => {
      const employee = data.find((emp: any) => sessionStorage['employeeCode'] === emp.employeeCode);
      if (employee) {
        // console.log(employee);
        this.employeeDetail = employee;
      }
    });

  }

  /** This function submit reset password form*/
  submitResetPasswordForm() {
    var updatedPasswordData = {
      password: this.resetPasswordFrom.value.password
    }
    this.database.resetUserPassword(updatedPasswordData, this.employeeDetail.loginId).subscribe((data: any) => {
      if (data.status === true) {
        console.log('status is good')
        $('#editSuccessButton').click();
      } else {
        $('#editErrorButton').click();
        console.log('status is bad')
      }
    })
  }

  /** This function page refresh*/
  pageRefresh() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl])
    })
  }

  /** This function match password validators*/
  matchPasswordValidators(control: AbstractControl) {
    if (control.get('password')?.value != control.get('confirmPassword')?.value) {
      return { misMatch: true }
    }
    return null
  }

}
