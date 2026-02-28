import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import * as $ from 'jquery';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit {

  userRights: any;
  userForm: FormGroup
  editUserForm: FormGroup;
  resetPasswordFrom: FormGroup;

  selectTable: string = "user";
  users: any = [];
  employees: any = [];

  selectedFile: File | null = null;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  showResetPassword: boolean = false;
  showResetConfirmPassword: boolean = false;

  selectedUserName: any;
  selectedUserIndex: any;
  selectedUserLoginId: any;
  selectedUserEmployeeCode: any;
  selectedUserStatus: any;

  modalTitle: string = '';
  modalMessage: string = '';
  modalState: 'loading' | 'success' | 'error' = 'loading';

  searchText: string = '';
  selectUserStatus: string = 'all';
  selectRole: string = 'all';

  filteredUsers: any[] = [];
  filteredEmployees: any[] = [];

  canManageUsers(): boolean { return this.userRights?.hrDepartment?.user?.manage === 1; }


  statistics = {
    totalUsers: 0,
    noOfUsers: 0,
    noOfEmployees: 0,
    noOfActiveUsers: 0,
    noOfDisabledUsers: 0,
    noOfTerminatedUsers: 0
  }

  constructor(private database: DatabaseService, private router: Router, private authCtx: SessionstorageService) {

    this.userForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
      loginId: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      employeeCode: new FormControl('', [Validators.required]),
      organizationEmail: new FormControl('', [Validators.email, Validators.required]),
      // type: new FormControl('0', [Validators.required]),
      userManage: new FormControl(false, [Validators.required]),
      // ITInventoryView: new FormControl(false, [Validators.required]),
      // ITInventoryManage: new FormControl(false, [Validators.required]),
      // ITInventoryIssue: new FormControl(false, [Validators.required]),
      // ITInventoryReturn: new FormControl(false, [Validators.required]),
      electronicView: new FormControl(false, [Validators.required]),
      electronicManage: new FormControl(false, [Validators.required]),
      electronicIssue: new FormControl(false, [Validators.required]),
      electronicReturn: new FormControl(false, [Validators.required]),
      electronicBOM: new FormControl(false, [Validators.required]),
      // testingEquipmentView: new FormControl(false, [Validators.required]),
      // testingEquipmentManage: new FormControl(false, [Validators.required]),
      // testingEquipmentIssue: new FormControl(false, [Validators.required]),
      // testingEquipmentReturn: new FormControl(false, [Validators.required]),
      // testingEquipmentBOM: new FormControl(false, [Validators.required]),
      // consumableAssetView: new FormControl(false, [Validators.required]),
      // consumableAssetManage: new FormControl(false, [Validators.required]),
      // consumableAssetIssue: new FormControl(false, [Validators.required]),
      // consumableAssetReturn: new FormControl(false, [Validators.required]),
      // fixedAssetView: new FormControl(false, [Validators.required]),
      // fixedAssetManage: new FormControl(false, [Validators.required]),
      // fixedAssetIssue: new FormControl(false, [Validators.required]),
      // fixedAssetReturn: new FormControl(false, [Validators.required]),
      status: new FormControl(1, [Validators.required])
    }, {
      validators: this.matchPasswordValidators
    });

    this.editUserForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
      loginId: new FormControl('', [Validators.required]),
      employeeCode: new FormControl('', [Validators.required]),
      organizationEmail: new FormControl('', [Validators.email, Validators.required]),
      // type: new FormControl('0', [Validators.required]),
      userManage: new FormControl(false, [Validators.required]),
      // ITInventoryView: new FormControl(false, [Validators.required]),
      // ITInventoryManage: new FormControl(false, [Validators.required]),
      // ITInventoryIssue: new FormControl(false, [Validators.required]),
      // ITInventoryReturn: new FormControl(false, [Validators.required]),
      electronicView: new FormControl(false, [Validators.required]),
      electronicManage: new FormControl(false, [Validators.required]),
      electronicIssue: new FormControl(false, [Validators.required]),
      electronicReturn: new FormControl(false, [Validators.required]),
      electronicBOM: new FormControl(false, [Validators.required]),
      // testingEquipmentView: new FormControl(false, [Validators.required]),
      // testingEquipmentManage: new FormControl(false, [Validators.required]),
      // testingEquipmentIssue: new FormControl(false, [Validators.required]),
      // testingEquipmentReturn: new FormControl(false, [Validators.required]),
      // testingEquipmentBOM: new FormControl(false, [Validators.required]),
      // consumableAssetView: new FormControl(false, [Validators.required]),
      // consumableAssetManage: new FormControl(false, [Validators.required]),
      // consumableAssetIssue: new FormControl(false, [Validators.required]),
      // consumableAssetReturn: new FormControl(false, [Validators.required]),
      // fixedAssetView: new FormControl(false, [Validators.required]),
      // fixedAssetManage: new FormControl(false, [Validators.required]),
      // fixedAssetIssue: new FormControl(false, [Validators.required]),
      // fixedAssetReturn: new FormControl(false, [Validators.required]),
      status: new FormControl(1, [Validators.required])
    });

    this.resetPasswordFrom = new FormGroup({
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
    }, {
      validators: this.matchPasswordValidators
    });
  }


  async ngOnInit(): Promise<void> {

    this.filteredUsers = [...this.users];
    this.filteredEmployees = [...this.employees];

    this.applyPermissionRules(this.userForm);
    this.applyPermissionRules(this.editUserForm);

    var usersPromise = new Promise((res) => {
      this.database.getAllUsers('all').subscribe((data: any) => {
        console.log('users', data)
        this.users = [];
        this.employees = [];

        data.forEach((u: any) => {
          if (this.hasValidRights(u.rights)) {
            this.users.push(u);
            this.filteredUsers.push(u);
          } else {
            this.employees.push(u);
            this.filteredEmployees.push(u);
          }
        });

        res(null)
      });
    });

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { user, rights } = ctx
      console.log('rights', rights)
      this.userRights = rights || '{}'
    })

    // this.userRights = JSON.parse(sessionStorage.getItem('rights') || '{}')
    await usersPromise;
    this.calculateStatistics();
  }

  filterByStatus() {

    const filterStatus = (item: any) => {

      if (this.selectUserStatus === 'all') return true;

      if (this.selectUserStatus === 'active') return item.status === 1;

      if (this.selectUserStatus === 'disabled') return item.status === 0;

      if (this.selectUserStatus === 'terminated') return item.status === 2;

      return true;
    };

    this.filteredUsers = this.users.filter(filterStatus);
    this.filteredEmployees = this.employees.filter(filterStatus);
  }

  getRoleFromRights(item: any): string {

    const rights = [
      item.userManage,
      // item.ITInventoryView,
      // item.ITInventoryManage,
      // item.ITInventoryIssue,
      // item.ITInventoryReturn,
      item.electronicView,
      item.electronicManage,
      item.electronicIssue,
      item.electronicReturn,
      item.electronicBOM,
      // item.testingEquipmentView,
      // item.testingEquipmentManage,
      // item.testingEquipmentIssue,
      // item.testingEquipmentReturn,
      // item.testingEquipmentBOM,
      // item.consumableAssetView,
      // item.consumableAssetManage,
      // item.consumableAssetIssue,
      // item.consumableAssetReturn,
      // item.fixedAssetView,
      // item.fixedAssetManage,
      // item.fixedAssetIssue,
      // item.fixedAssetReturn
    ];

    // Convert to boolean safely (in case values are 1/0 or "true")
    const normalizedRights = rights.map(r => r === true || r === 1);
    const allSelected = normalizedRights.every(r => r === true);
    const noneSelected = normalizedRights.every(r => r === false);

    if (allSelected) return 'admin';
    if (noneSelected) return 'user';

    return 'user'; // partial rights = user (change if needed)
  }

  filterByRole() {
    const filterRole = (item: any) => {
      const role = this.getRoleFromRights(item);

      if (this.selectRole === 'all') return true;

      if (this.selectRole === 'admin') return role === 'admin';

      if (this.selectRole === 'user') return role === 'user';

      return true;
    };

    this.filteredUsers = this.users.filter(filterRole);
    this.filteredEmployees = this.employees.filter(filterRole);
  }

  applyFilter() {

    const filterLogic = (item: any) => {

      const statusMatch =
        this.selectUserStatus === 'all' ||
        (this.selectUserStatus === 'active' && item.status === 1) ||
        (this.selectUserStatus === 'disabled' && item.status === 0) ||
        (this.selectUserStatus === 'terminated' && item.status === 2);

      const roleMatch =
        this.selectRole === 'all' ||
        item.role === this.selectRole;

      return statusMatch && roleMatch;
    };

    this.filteredUsers = this.users.filter(filterLogic);
    this.filteredEmployees = this.employees.filter(filterLogic);
  }

  resetFilter() {
    this.selectUserStatus = 'all';
    this.selectRole = 'all';
    this.filteredUsers = [...this.users];
    this.filteredEmployees = [...this.employees];
  }

  applySearch() {

    const search = this.searchText.toLowerCase().trim();

    const filterLogic = (item: any) => {

      /* -------- STATUS FILTER -------- */
      const statusMatch =
        this.selectUserStatus === 'all' ||
        (this.selectUserStatus === 'active' && item.status === 1) ||
        (this.selectUserStatus === 'disabled' && item.status === 0) ||
        (this.selectUserStatus === 'terminated' && item.status === 2);

      /* -------- SEARCH FILTER -------- */
      const searchMatch =
        search === '' ||
        item.firstName?.toLowerCase().includes(search) ||
        item.middleName?.toLowerCase().includes(search) ||
        item.lastName?.toLowerCase().includes(search) ||
        item.loginId?.toLowerCase().includes(search) ||
        item.employeeCode?.toLowerCase().includes(search) ||
        item.organizationEmail?.toLowerCase().includes(search);

      return statusMatch && searchMatch;
    };

    this.filteredUsers = this.users.filter(filterLogic);
    this.filteredEmployees = this.employees.filter(filterLogic);
  }

  clearSearch() {
    this.searchText = '';
    this.filteredUsers = [...this.users];
    this.filteredEmployees = [...this.employees];
    this.applyFilter();
  }

  hasValidRights(rights: any): boolean {
    if (!rights) return false;

    // 1. Check HR manage
    if (rights?.hrDepartment?.user?.manage === 1) {
      return true;
    }

    // 2. Check "view" in all other departments
    for (const departmentKey of Object.keys(rights)) {
      const department = rights[departmentKey];
      // Skip HR since already handled
      if (departmentKey === 'hrDepartment') continue;
      for (const moduleKey of Object.keys(department)) {
        const module = department[moduleKey];

        if (module?.view === 1) {
          return true;
        }
      }
    }
    return false;
  }



  applyPermissionRules(form: FormGroup) {
    // this.bindPermissionSection(
    //   form,
    //   'ITInventoryView',
    //   ['ITInventoryManage', 'ITInventoryIssue', 'ITInventoryReturn']
    // );

    this.bindPermissionSection(
      form,
      'electronicView',
      ['electronicManage', 'electronicIssue', 'electronicReturn', 'electronicBOM']
    );

    // this.bindPermissionSection(
    //   form,
    //   'testingEquipmentView',
    //   ['testingEquipmentManage', 'testingEquipmentIssue', 'testingEquipmentReturn', 'testingEquipmentBOM']
    // );

    // this.bindPermissionSection(
    //   form,
    //   'consumableAssetView',
    //   ['consumableAssetManage', 'consumableAssetIssue', 'consumableAssetReturn']
    // );

    // this.bindPermissionSection(
    //   form,
    //   'fixedAssetView',
    //   ['fixedAssetManage', 'fixedAssetIssue', 'fixedAssetReturn']
    // );
  }


  bindPermissionSection(form: FormGroup, viewKey: string, actionKeys: string[]) {
    const viewCtrl = form.get(viewKey);
    const actionCtrls = actionKeys.map(key => form.get(key));

    if (!viewCtrl || actionCtrls.includes(null)) {
      throw new Error(`Invalid permission keys for ${viewKey}`);
    }

    // Any action (Manage / Issue / Return) → View must be true
    actionCtrls.forEach(ctrl => {
      ctrl!.valueChanges.subscribe((value: boolean) => {
        if (value && !viewCtrl.value) {
          viewCtrl.setValue(true, { emitEvent: false });
        }
      });
    });

    // View unchecked → all actions must be false
    viewCtrl.valueChanges.subscribe((view: boolean) => {
      if (!view) {
        actionCtrls.forEach(ctrl => {
          if (ctrl!.value) {
            ctrl!.setValue(false, { emitEvent: false });
          }
        });
      }
    });
  }


  /** This function for  is clear selection*/
  clearSelection() {
    $('#home-tab').click();
    this.userForm.reset({
      firstName: '',
      middleName: '',
      lastName: '',
      loginId: '',
      password: '',
      confirmPassword: '',
      employeeCode: '',
      organizationEmail: '',
      userManage: false,
      // ITInventoryView: false,
      // ITInventoryManage: false,
      // ITInventoryIssue: false,
      // ITInventoryReturn: false,
      electronicView: false,
      electronicManage: false,
      electronicIssue: false,
      electronicReturn: false,
      electronicBOM: false,
      // testingEquipmentView: false,
      // testingEquipmentManage: false,
      // testingEquipmentIssue: false,
      // testingEquipmentReturn: false,
      // testingEquipmentBOM: false,
      // consumableAssetView: false,
      // consumableAssetManage: false,
      // consumableAssetIssue: false,
      // consumableAssetReturn: false,
      // fixedAssetView: false,
      // fixedAssetManage: false,
      // fixedAssetIssue: false,
      // fixedAssetReturn: false,
      status: 1
    });
    this.resetPasswordFrom.reset();
    // this.pageRefresh();
  }

  openModal(title: string, message: string, state: 'loading' | 'success' | 'error') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalState = state;
    $('#statusButton').click();
  }

  updateModal(title: string, message: string, state: 'loading' | 'success' | 'error') {
    this.modalTitle = title;
    this.modalMessage = message;
    this.modalState = state;
  }


  /** This function for  submit user form*/
  submitUserForm() {
    this.selectedUserName = this.userForm.value.firstName;
    this.openModal(
      'Create User',
      `Please wait while creating user: ${this.selectedUserName}`,
      'loading'
    );

    var user_data = {
      firstName: this.userForm.value.firstName,
      middleName: this.userForm.value.middleName,
      lastName: this.userForm.value.lastName,
      loginId: this.userForm.value.loginId,
      password: this.userForm.value.password,
      employeeCode: this.userForm.value.employeeCode,
      organizationEmail: this.userForm.value.organizationEmail,
      // type: this.userForm.value.type,
      rights: {
        hrDepartment: {
          user: {
            manage: this.userForm.value.userManage === true ? 1 : 0,
          }
        },
        // ITDepartment: {
        //   ITInventory: {
        //     view: this.userForm.value.ITInventoryView === true ? 1 : 0,
        //     manage: this.userForm.value.ITInventoryManage === true ? 1 : 0,
        //     issue: this.userForm.value.ITInventoryIssue === true ? 1 : 0,
        //     return: this.userForm.value.ITInventoryReturn === true ? 1 : 0
        //   }
        // },
        hardwareDepartment: {
          electronicDevice: {
            view: this.userForm.value.electronicView === true ? 1 : 0,
            manage: this.userForm.value.electronicManage === true ? 1 : 0,
            issue: this.userForm.value.electronicIssue === true ? 1 : 0,
            return: this.userForm.value.electronicReturn === true ? 1 : 0,
            BOM: this.userForm.value.electronicBOM === true ? 1 : 0
          },
          // testingEquipment: {
          //   view: this.userForm.value.testingEquipmentView === true ? 1 : 0,
          //   manage: this.userForm.value.testingEquipmentManage === true ? 1 : 0,
          //   issue: this.userForm.value.testingEquipmentIssue === true ? 1 : 0,
          //   return: this.userForm.value.testingEquipmentReturn === true ? 1 : 0,
          //   BOM: this.userForm.value.testingEquipmentBOM === true ? 1 : 0
          // }
        },
        // adminDepartment: {
        //   consumableAsset: {
        //     view: this.userForm.value.consumableAssetView === true ? 1 : 0,
        //     manage: this.userForm.value.consumableAssetManage === true ? 1 : 0,
        //     issue: this.userForm.value.consumableAssetIssue === true ? 1 : 0,
        //     return: this.userForm.value.consumableAssetReturn === true ? 1 : 0,
        //   },
        //   fixedAsset: {
        //     view: this.userForm.value.fixedAssetView === true ? 1 : 0,
        //     manage: this.userForm.value.fixedAssetManage === true ? 1 : 0,
        //     issue: this.userForm.value.fixedAssetIssue === true ? 1 : 0,
        //     return: this.userForm.value.fixedAssetReturn === true ? 1 : 0,
        //   }
        // }
      },
      status: 1
    }
    this.database.postUser(user_data).subscribe({
      next: (res: any) => {
        if (res.success) {

          this.updateModal(
            'Create User',
            `User: ${this.selectedUserName} created successfully`,
            'success'
          );

          this.userForm.reset({
            firstName: '',
            middleName: '',
            lastName: '',
            loginId: '',
            password: '',
            confirmPassword: '',
            employeeCode: '',
            organizationEmail: '',
            userManage: false,
            // ITInventoryView: false,
            // ITInventoryManage: false,
            // ITInventoryIssue: false,
            // ITInventoryReturn: false,
            electronicView: false,
            electronicManage: false,
            electronicIssue: false,
            electronicReturn: false,
            electronicBOM: false,
            // testingEquipmentView: false,
            // testingEquipmentManage: false,
            // testingEquipmentIssue: false,
            // testingEquipmentReturn: false,
            // testingEquipmentBOM: false,
            // consumableAssetView: false,
            // consumableAssetManage: false,
            // consumableAssetIssue: false,
            // consumableAssetReturn: false,
            // fixedAssetView: false,
            // fixedAssetManage: false,
            // fixedAssetIssue: false,
            // fixedAssetReturn: false,
            status: 1
          });

        }
      },
      error: (err) => {

        let errorMessage = 'Something went wrong';

        if (err.status === 400 && err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 500) {
          errorMessage = 'Server error. Contact administrator.';
        }

        this.updateModal(
          'Create User',
          `Error creating user: ${this.selectedUserName} - ${errorMessage}`,
          'error'
        );
      }
    });

  }

  /** This function for  submit edit user form*/
  submitEditUserForm() {
    this.openModal(
      'Edit User',
      `Please wait while editing user: ${this.selectedUserName}`,
      'loading'
    );
    var updatedData = {
      loginId: this.editUserForm.value.loginId,
      employeeCode: this.editUserForm.value.employeeCode,
      organizationEmail: this.editUserForm.value.organizationEmail,
      firstName: this.editUserForm.value.firstName,
      middleName: this.editUserForm.value.middleName,
      lastName: this.editUserForm.value.lastName,
      rights: {
        hrDepartment: {
          user: {
            manage: this.editUserForm.value.userManage,
          }
        },
        // ITDepartment: {
        //   ITInventory: {
        //     view: this.editUserForm.value.ITInventoryView,
        //     manage: this.editUserForm.value.ITInventoryManage,
        //     issue: this.editUserForm.value.ITInventoryIssue,
        //     return: this.editUserForm.value.ITInventoryReturn
        //   }
        // },
        hardwareDepartment: {
          electronicDevice: {
            view: this.editUserForm.value.electronicView,
            manage: this.editUserForm.value.electronicManage,
            issue: this.editUserForm.value.electronicIssue,
            return: this.editUserForm.value.electronicReturn,
            BOM: this.editUserForm.value.electronicBOM
          },
          // testingEquipment: {
          //   view: this.editUserForm.value.testingEquipmentView,
          //   manage: this.editUserForm.value.testingEquipmentManage,
          //   issue: this.editUserForm.value.testingEquipmentIssue,
          //   return: this.editUserForm.value.testingEquipmentReturn,
          //   BOM: this.editUserForm.value.testingEquipmentBOM
          // }
        },
        // adminDepartment: {
        //   consumableAsset: {
        //     view: this.editUserForm.value.consumableAssetView,
        //     manage: this.editUserForm.value.consumableAssetManage,
        //     issue: this.editUserForm.value.consumableAssetIssue,
        //     return: this.editUserForm.value.consumableAssetReturn
        //   },
        //   fixedAsset: {
        //     view: this.editUserForm.value.fixedAssetView,
        //     manage: this.editUserForm.value.fixedAssetManage,
        //     issue: this.editUserForm.value.fixedAssetIssue,
        //     return: this.editUserForm.value.fixedAssetReturn
        //   }
        // }
      }
    }

    console.log('Updated data', updatedData)
    this.database.updateUser(updatedData, this.selectedUserLoginId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.updateModal(
            'Edit User',
            `User: ${this.selectedUserName} edited successfully`,
            'success'
          );
          if (this.selectedUserLoginId === this.authCtx.snapShot.user.loginId) {
            sessionStorage.clear();
            location.reload();
            this.router.navigate(['/login']);
          }
        }
      },
      error: (err) => {
        let errorMessage = 'Something went wrong while updating user';
        if (err.status === 404) {
          errorMessage = 'User not found';
        } else if (err.status === 500) {
          errorMessage = 'Server error';
        } else if (err.status === 0) {
          errorMessage = 'Network error';
        }
        this.updateModal(
          'Edit User',
          `Error editing user: ${this.selectedUserName} - ${errorMessage}`,
          'error'
        );
      }
    });
  }

  /** This function for  submit reset password form*/
  submitResetPasswordForm() {
    this.openModal(
      'Reset Password',
      `Please wait while resetting password for ${this.selectedUserLoginId}`,
      'loading'
    );
    var updatedPasswordData = {
      password: this.resetPasswordFrom.value.password
    }
    this.database.resetUserPassword(updatedPasswordData, this.selectedUserLoginId)
      .subscribe({
        next: (res: any) => {

          if (res.status === true) {
            this.updateModal(
              'Reset Password',
              'Password updated successfully',
              'success'
            );

            if (this.selectedUserLoginId === this.authCtx.snapShot.user.loginId) {
              sessionStorage.clear();
              location.reload();
              this.router.navigate(['/login']);
            }

          } else {
            this.updateModal(
              'Reset Password',
              res.message || 'Failed to update password',
              'error'
            );
          }
        },

        error: (err) => {

          let errorMessage = 'Something went wrong';

          if (err.status === 400) {
            errorMessage = err.error?.message || 'Invalid request';
          } else if (err.status === 404) {
            errorMessage = 'User not found';
          } else if (err.status === 500) {
            errorMessage = 'Server error. Contact administrator';
          } else if (err.status === 0) {
            errorMessage = 'Network error. Check connection';
          }

          this.updateModal(
            'Reset Password',
            errorMessage,
            'error'
          );
        }
      });
  }

  /** This function for  change user status*/
  changeUserStatus() {
    this.openModal(
      'Update Status',
      `Updating status for ${this.selectedUserLoginId}...`,
      'loading'
    );
    var statusData = {
      status: this.selectedUserStatus
    }

    this.database.updateUserStatus(statusData, this.selectedUserLoginId)
      .subscribe({
        next: (res: any) => {

          if (res.status === true) {
            this.updateModal(
              'Update Status',
              'User status updated successfully',
              'success'
            );

            if (this.selectedUserLoginId === this.authCtx.snapShot.user.loginId) {
              sessionStorage.clear();
              location.reload();
              this.router.navigate(['/login']);
            }
          } else {
            this.updateModal(
              'Update Status',
              res.message || 'Failed to update status',
              'error'
            );
          }
        },

        error: (err) => {

          let errorMessage = 'Something went wrong';

          if (err.status === 400) {
            errorMessage = err.error?.message || 'Invalid request';
          } else if (err.status === 404) {
            errorMessage = 'User not found';
          } else if (err.status === 500) {
            errorMessage = 'Server error. Contact administrator';
          } else if (err.status === 0) {
            errorMessage = 'Network error. Check connection';
          }

          this.updateModal(
            'Update Status',
            errorMessage,
            'error'
          );
        }
      });
  }


  /** This function for apply filter on user*/
  applyFilterOnUser() {
    switch (this.selectUserStatus) {
      case 'all':
        break;
      case 'disbaled':
        break;
      case 'terminated':
        break;
      default:
        break;
    }
  }

  /** This function for calculate statistic*/
  calculateStatistics() {
    this.statistics.totalUsers = this.users.length + this.employees.length;
    this.statistics.noOfUsers = this.users.length;
    this.statistics.noOfEmployees = this.employees.length;

    let activeUser = 0;
    let disabledUser = 0;
    let terminatedUser = 0;

    // Count Users
    this.users.forEach((element: any) => {
      if (element.status === 0) disabledUser++;
      if (element.status === 1) activeUser++;
      if (element.status === 2) terminatedUser++;
    });

    // Count Employees (YOU WERE MISSING THIS)
    this.employees.forEach((element: any) => {
      if (element.status === 0) disabledUser++;
      if (element.status === 1) activeUser++;
      if (element.status === 2) terminatedUser++;
    });

    this.statistics.noOfActiveUsers = activeUser;
    this.statistics.noOfDisabledUsers = disabledUser;
    this.statistics.noOfTerminatedUsers = terminatedUser;
  }



  /** This function for check login ID*/
  checkLoginId() {
    this.database.checkLoginIdInDatabse(this.userForm.value.loginId).subscribe((data: any) => {
      if (data === false) {
        this.userForm.get('loginId')?.setErrors({ notUnique: true });
      } else {
        this.userForm.get('loginId')?.setErrors(null);
      }
    });
  }

  /** This function for check edit login ID*/
  checkEditLoginId() {
    if (this.selectedUserLoginId !== this.editUserForm.value.loginId) {
      this.database.checkLoginIdInDatabse(this.editUserForm.value.loginId).subscribe((data: any) => {
        if (data === false) {
          this.editUserForm.get('loginId')?.setErrors({ notUnique: true });
        } else {
          this.editUserForm.get('loginId')?.setErrors(null);
        }
      });
    } else {
      this.editUserForm.get('loginId')?.setErrors(null);
    }

  }

  /** This function for check employee code*/
  checkEmployeeCode() {
    this.database.checkEmployeeCode(this.userForm.value.employeeCode).subscribe((data: any) => {
      if (data === false) {
        this.userForm.get('employeeCode')?.setErrors({ notUnique: true });
      } else {
        this.userForm.get('employeeCode')?.setErrors(null);
      }
    });
  }

  /** This function for check edit employee code*/
  checkEditEmployeeCode() {
    if (this.selectedUserEmployeeCode === this.editUserForm.value.employeeCode) {
      this.database.checkEmployeeCode(this.editUserForm.value.employeeCode).subscribe((data: any) => {
        if (data === false) {
          this.editUserForm.get('employeeCode')?.setErrors({ notUnique: true });
        } else {
          this.editUserForm.get('employeeCode')?.setErrors(null);
        }
      });
    } else {
      this.editUserForm.get('employeeCode')?.setErrors(null);
    }

  }

  /** This function for match password validators*/
  matchPasswordValidators(control: AbstractControl) {
    if (control.get('password')?.value != control.get('confirmPassword')?.value) {
      return { misMatch: true }
    }
    return null
  }


  selectCSVFile(event: any) {
    const file = event.target.files[0];

    if (!file) {
      this.selectedFile = null;
      return;
    }

    const validTypes = [
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload CSV or XLSX file.');
      this.selectedFile = null;
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
  }

  uploadCSVFile() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // this.isUploading = true;
    this.openModal(
      'Uploading File',
      'Please wait, file is uploading...',
      'loading'
    );

    this.database.uploadUserCSV(formData).subscribe({
      next: (res: any) => {
        // this.isUploading = false;

        if (res.status === 'success') {
          this.updateModal(
            'Upload Successful',
            `New Users Inserted: ${res.inserted}
Skipped Rows: ${res.skipped || 0}`,
            'success'
          );
        }
        else if (res.status === 'partial') {
          this.updateModal(
            'Partial Upload Completed',
            `Inserted: ${res.inserted}\nFailed Rows: ${res.errors?.length || 0}`,
            'success'
          );
        }
        else {
          this.updateModal(
            'Upload Failed',
            res.message || 'Upload failed',
            'error'
          );
        }
      },
      error: (err) => {
        this.updateModal(
          'Server Error',
          err?.error?.message || 'Server error during upload',
          'error'
        );
      }
    });
  }


  /** This function for select user*/
  selectUser(index: number, name: string, loginId: string) {
    this.selectedUserIndex = index;
    this.selectedUserName = name;
    this.selectedUserLoginId = loginId;
  }

  /** This function for select user edit*/
  selectUserEdit(user: any) {
    this.selectedUserName = `${user.firstName} ${user.lastName}`;
    this.selectedUserLoginId = user.loginId;
    this.selectedUserStatus = user.status;
    this.selectedUserEmployeeCode = user.employeeCode;

    // Fill Edit User Form
    this.editUserForm.get('firstName')?.patchValue(user.firstName);
    this.editUserForm.get('middleName')?.patchValue(user.middleName);
    this.editUserForm.get('lastName')?.patchValue(user.lastName);
    this.editUserForm.get('loginId')?.patchValue(user.loginId);
    this.editUserForm.get('employeeCode')?.patchValue(user.employeeCode);
    // this.editUserForm.get('type')?.patchValue(user.type);
    this.editUserForm.get('organizationEmail')?.patchValue(user.organizationEmail);
    this.editUserForm.get('userManage')?.patchValue(user.rights.hrDepartment.user.manage);
    // this.editUserForm.get('ITInventoryView')?.patchValue(user.rights.ITDepartment.ITInventory.view);
    // this.editUserForm.get('ITInventoryManage')?.patchValue(user.rights.ITDepartment.ITInventory.manage);
    // this.editUserForm.get('ITInventoryIssue')?.patchValue(user.rights.ITDepartment.ITInventory.issue);
    // this.editUserForm.get('ITInventoryReturn')?.patchValue(user.rights.ITDepartment.ITInventory.return);
    this.editUserForm.get('electronicView')?.patchValue(user.rights.hardwareDepartment.electronicDevice.view);
    this.editUserForm.get('electronicManage')?.patchValue(user.rights.hardwareDepartment.electronicDevice.manage);
    this.editUserForm.get('electronicIssue')?.patchValue(user.rights.hardwareDepartment.electronicDevice.issue);
    this.editUserForm.get('electronicReturn')?.patchValue(user.rights.hardwareDepartment.electronicDevice.return);
    this.editUserForm.get('electronicBOM')?.patchValue(user.rights.hardwareDepartment.electronicDevice.BOM);
    // this.editUserForm.get('testingEquipmentView')?.patchValue(user.rights.hardwareDepartment.testingEquipment.view);
    // this.editUserForm.get('testingEquipmentManage')?.patchValue(user.rights.hardwareDepartment.testingEquipment.manage);
    // this.editUserForm.get('testingEquipmentIssue')?.patchValue(user.rights.hardwareDepartment.testingEquipment.issue);
    // this.editUserForm.get('testingEquipmentReturn')?.patchValue(user.rights.hardwareDepartment.testingEquipment.return);
    // this.editUserForm.get('testingEquipmentBOM')?.patchValue(user.rights.hardwareDepartment.testingEquipment.BOM);
    // this.editUserForm.get('consumableAssetView')?.patchValue(user.rights.adminDepartment.consumableAsset.view);
    // this.editUserForm.get('consumableAssetManage')?.patchValue(user.rights.adminDepartment.consumableAsset.manage);
    // this.editUserForm.get('consumableAssetIssue')?.patchValue(user.rights.adminDepartment.consumableAsset.issue);
    // this.editUserForm.get('consumableAssetReturn')?.patchValue(user.rights.adminDepartment.consumableAsset.return);
    // this.editUserForm.get('fixedAssetView')?.patchValue(user.rights.adminDepartment.fixedAsset.view);
    // this.editUserForm.get('fixedAssetManage')?.patchValue(user.rights.adminDepartment.fixedAsset.manage);
    // this.editUserForm.get('fixedAssetIssue')?.patchValue(user.rights.adminDepartment.fixedAsset.issue);
    // this.editUserForm.get('fixedAssetReturn')?.patchValue(user.rights.adminDepartment.fixedAsset.return);
  }

  /** This function for page refresh*/
  pageRefresh() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  /** this function for delete user*/
  deleteUser() {
    var loginId = this.selectedUserLoginId;
    this.database.deleteUser(loginId).subscribe((data: any) => {
      console.log(data);
      if (data.status === true) {
        $('#deleteSuccessButton').click();
      } else {
        $('#deleteErrorButton').click();
      }
    });
  }

}
