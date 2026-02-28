import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NonNullableFormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { nonZeroPositiveIntegerValidator, integerRangeValidator } from 'src/app/validators/custom-validator.validator';

@Component({
  selector: 'app-component-dash',
  templateUrl: './component-dash.component.html',
  styleUrls: ['./component-dash.component.css']
})
export class ComponentDashComponent implements OnInit {

  componentsList: Array<any> = [];
  allEmployees: Array<any> = []
  filteredEmployees: Array<any> = []
  stockHistoryIssued: Array<any> = []
  stockHistory: Array<any> = []
  supplierDetail: any = {}
  categoryList: Array<any> = [];
  // selectedCategory: string = '';
  selectedCategory: string | null = null;
  manufacturerList: Array<any> = [];
  selectedManufacturer: string | null = null;
  supplierList: Array<any> = [];
  selectedSupplier: string | null = null;
  projectList: Array<any> = [];
  selectedProject: string | null = null;
  shelfList: Array<any> = []
  boxNames: Array<any> = []
  batchList: Array<any> = [];
  selectedBatch: string = '';
  selectedComponentId: any = '';
  selectedComponentProjectList: Array<any> = [];
  selectedSearchCategory: string = 'name';
  searchedText: string = '';
  userRights: any;
  employeeCode: string = '';
  selectedFilterStockHistory: string = 'all'; // Default selection
  previousProjectNameIndex: number | null = null;
  projectNameList: any = {};
  categoryNameList: any = {};
  supplierNameList: any = {};
  manufacturerNameList: any = {};
  shelfLocationNameList: any = {};
  available: number = 0;
  availableNotificationQty = 0
  availableIssueQuantity: number = 0;
  stockHistories: any = [];
  selectedRow: number | null = null;
  selectedComponent: any = {
    "locationDetail": {
      "shelfName": "",
      "boxNames": ""
    },
    "creator": "",
    "manufacturerPartNumber": "",
    "package": "",
    "description": "",
    "id": "",
    "totalQuantity": "",
    "stockDetails": [
      {
        "projectName": "",
        "quantity": "",
        "modifier": "",
        "modifiedDate": "",
        "notificationQuantity": "0",
      }
    ],
    "manufacturer": "",
    "categoryName": "",
    "_id": "",
    "comment": ""
  };
  projectOptions: any[] = [];
  issueHistory: any = [{ project: '', qty: 0 }]
  currentPage = 1;
  totalPages: any;
  limit = 10;
  newTotalQuantity: number = 0
  newProjectQuantity: number = 0
  availableComponentPerProject: number = 0
  availableReturnsForEmployee: number = 0
  availableConsumptionForEmployee: number = 0
  availableStockToMovedForProject: number = 0
  newTotalIssuedQuantity: number = 0
  projectCompQuantityAfterIssued: number = 0
  returnHistoryList: Array<any> = [];
  consumptionHistoryList: Array<any> = [];
  modifyComponentForm: FormGroup;
  changeLocationForm: FormGroup;
  newProjectForm: FormGroup;
  editProjectForm: FormGroup;
  issueComponentForm: FormGroup;
  returnComponentForm: FormGroup;
  consumptionComponentForm: FormGroup;
  notificationQtyForm: FormGroup
  movedComponentForm: FormGroup;
  OtherProjectNames: Array<any> = [];

  constructor(private database: DatabaseService, private router: Router, private authCtx: SessionstorageService) {

    // Modify a component form
    this.modifyComponentForm = new FormGroup({
      categoryName: new FormControl(null, [Validators.required]),
      manufacturerName: new FormControl(null, [Validators.required]),
      manufacturerPartNumber: new FormControl('', [Validators.required]),
      package: new FormControl('', [Validators.required]),
      inStockQuantity: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      comment: new FormControl('')
    });

    // Change Location of Project Inventory Form
    this.changeLocationForm = new FormGroup({
      projectName: new FormControl(null, [Validators.required]),
      shelfName: new FormControl(null),
      boxNames: new FormControl(null)
    });

    // add new project to stock form
    this.newProjectForm = new FormGroup({
      projectName: new FormControl(null, [Validators.required]),
      quantity: new FormControl(null, [Validators.required, nonZeroPositiveIntegerValidator]),
      supplierName: new FormControl(null, [Validators.required]),
      supplierPartNumber: new FormControl(''),
      note: new FormControl(''),
      shelfName: new FormControl(null),
      boxNames: new FormControl(null),
      notificationQuantity: new FormControl(0)
    }, {
      validators: this.notificationQuantityValidators
    });

    // add to existing project in stock form
    this.editProjectForm = new FormGroup({
      projectName: new FormControl(null, [Validators.required]),
      quantity: new FormControl(null, [Validators.required, nonZeroPositiveIntegerValidator]),
      supplierName: new FormControl(null, [Validators.required]),
      supplierPartNumber: new FormControl(''),
      note: new FormControl('')
    });

    // issued stock section
    this.issueComponentForm = new FormGroup({
      projectName: new FormControl(null, [Validators.required]),
      issueQuantity: new FormControl('', [Validators.required, integerRangeValidator(1, () => this.availableIssueQuantity)]),
      issuedPerson: new FormControl(null, [Validators.required]),
      note: new FormControl('')
    });

    // return component form
    this.returnComponentForm = new FormGroup({
      returnedPerson: new FormControl(null, [Validators.required]),
      projectName: new FormControl(null, Validators.required),
      returnedQuantity: new FormControl('', [Validators.required, integerRangeValidator(1, () => this.availableReturnsForEmployee)]),
      note: new FormControl('')
    });

    // Consumption Component Form
    this.consumptionComponentForm = new FormGroup({
      consumedBy: new FormControl('', [Validators.required]),
      projectName: new FormControl(null, Validators.required),
      consumedQuantity: new FormControl('', [Validators.required, integerRangeValidator(1, () => this.availableConsumptionForEmployee)]),
      note: new FormControl('')
    });

    // Change Notification Quantity form
    this.notificationQtyForm = new FormGroup({
      projectName: new FormControl(null, [Validators.required]),
      notificationQuantity: new FormControl(0, [Validators.required, integerRangeValidator(0, () => this.availableNotificationQty - 1)])
    });

    // Moved stock component form
    this.movedComponentForm = new FormGroup({
      movedFromProjectName: new FormControl(null, [Validators.required]),
      movedToProjectName: new FormControl(null, [Validators.required]),
      movedQuantity: new FormControl('', [Validators.required, integerRangeValidator(1, () => this.available)]),
      note: new FormControl('')
    });

  }

  async ngOnInit(): Promise<void> {
    // sessionStorage.setItem('active', '{"active": "Electronic Component"}');
    // sessionStorage.setItem('active', '{"active": "component"}');

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { user, rights } = ctx;
      this.employeeCode = user.employeeCode
      this.userRights = rights || {};
    })

    this.database.getAllUsers('all').subscribe((data: any) => {
      this.allEmployees = data;
      this.filteredEmployees = this.allEmployees.filter(employee => employee.status !== 2 && employee.status !== 0);
    });

    // Fetch all the category
    this.database.getAllCategory().subscribe({
      next: (res: any) => {
        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }
        this.categoryList = res.list;
        this.categoryNameList = res.nameMap || {};
      },
      error: (err) => {
        console.error("Failed to fetch categories", err);
      }
    });

    // Fetch all the Manufacturer
    this.database.getAllManufacturer().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.manufacturerList = res.list;      // full manufacturer list
        this.manufacturerNameList = res.nameMap; // id → name map
      },
      error: (err) => {
        console.error("Failed to fetch manufacturers", err);
      }
    });

    // Fetch all the Supplier
    this.database.getAllSupplier().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.supplierList = res.list || [];     // full list
        this.supplierNameList = res.nameMap || {}; // id → name map
      },
      error: (err) => {
        console.error("Failed to load suppliers:", err);
      }
    });

    // Fetch all the Project
    this.database.getAllProject().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.projectList = res.list;     // full project list
        this.projectNameList = res.nameMap; // id → name mapping
      },
      error: (err) => {
        console.error("Failed to load projects:", err);
      }
    });

    // Fetch all the Shelf Location
    this.database.getAllShelf().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }
        this.shelfList = res.list;       // full shelf list
        this.shelfLocationNameList = res.nameMap; // id → shelfName + boxNames
      },
      error: (err) => {
        console.error("Failed to load shelves", err);
      }
    });

    // this.getFilteredBatchNo()
    this.getFilteredComponent();
  }

  //This function is used to reset the fields
  clearSelection() {
    $('#modify-tab').click()
    if ((this.userRights.hardwareDepartment.electronicDevice.manage === 0 && this.userRights.hardwareDepartment.electronicDevice.return === 0) || this.userRights.hardwareDepartment.electronicDevice.manage === 0) {
      $('#issue-tab').click()
    }
    if (this.userRights.hardwareDepartment.electronicDevice.manage === 0 && this.userRights.hardwareDepartment.electronicDevice.issue === 0) {
      $('#return-tab').click()
    }
    this.selectedComponent = {
      "locationDetail": {
        "shelfName": "",
        "boxNames": ""
      },
      "creator": "",
      // "name": "",
      "manufacturerPartNumber": "",
      "package": "",
      "description": "",
      "id": "",
      "totalQuantity": "",
      "stockDetails": [
        {
          "projectName": "",
          "quantity": "",
          "modifier": "",
          "modifiedDate": "",
          "notificationQuantity": "0",
        }
      ],
      "manufacturer": "",
      "categoryName": "",
      "_id": "",
      "comment": ""
    }

    this.availableIssueQuantity = 0;
    this.availableReturnsForEmployee = 0;
    this.availableConsumptionForEmployee = 0;
    this.available = 0;
    this.availableNotificationQty = 0
    this.changeLocationForm.reset();
    this.newProjectForm.reset();
    this.editProjectForm.reset();
    this.issueComponentForm.reset();
    this.returnComponentForm.reset();
    this.consumptionComponentForm.reset();
    this.notificationQtyForm.reset()
    this.movedComponentForm.reset();
    this.changeLocationForm.get('projectName')?.setValue('');
    this.newProjectForm.get('projectName')?.setValue('');
    this.editProjectForm.get('projectName')?.setValue('');
    this.issueComponentForm.get('projectName')?.setValue('');
    this.returnComponentForm.get('projectName')?.setValue('');
    this.consumptionComponentForm.get('projectName')?.setValue('');
    this.notificationQtyForm.get('projectName')?.setValue('');
    this.movedComponentForm.get('movedFromProjectName')?.setValue('');
    this.movedComponentForm.get('movedToProjectName')?.setValue('');
    this.selectedFilterStockHistory = 'all'; // Default selection
    this.selectedRow = null
    this.stockHistories = []
    this.newProjectForm.get('notificationQuantity')?.setValue(0);
  }

  //This is used to change the data limit for per page
  changeDataLimit() {
    this.currentPage = 1;
    this.updatedComponentList();
  }

  //This helps to display updated component data in table after search
  updatedComponentList() {
    if (this.searchedText) {
      this.filterSearchedComponent();
    } else {
      this.getFilteredComponent();
    }
  }

  //This is used to filter data by category manufacturer and supplier
  getFilteredComponent() {
    this.database.getAllComponentByFilter({ category: this.selectedCategory, manufacturer: this.selectedManufacturer, supplier: this.selectedSupplier, project: this.selectedProject, batchNo: this.selectedBatch }, this.currentPage, this.limit).subscribe((data: any) => {
      // console.log('component list', data)
      this.componentsList = data.components;
      console.log('component list', this.componentsList)
      this.totalPages = data.totalPages
    });
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.updatedComponentList();
  }

  //This navigates to a specific page in a page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatedComponentList();
    }
  }

  //This navigates to next page
  nextPage(): void {
    if (this.currentPage + 3 <= this.totalPages) {
      this.currentPage += 3;
      this.updatedComponentList();
    } else {
      this.currentPage = this.totalPages;
      this.updatedComponentList();
    }
  }

  //This navigates to previous page
  previousPage(): void {
    if (this.currentPage > 3) {
      this.currentPage -= 3;
      this.updatedComponentList();
    } else {
      this.currentPage = 1;
      this.updatedComponentList();
    }
  }

  //This is used to navigate to the first page in the pagination
  goToFirstPage(): void {
    this.currentPage = 1;
    this.updatedComponentList();
  }

  //This is used to navigate to the last page in the pagination
  goToLastPage(): void {
    this.currentPage = this.totalPages;
    this.updatedComponentList();
  }

  //This function gives filtered data after searching through text
  filterSearchedComponent() {
    let searchText = this.searchedText
    if (this.searchedText !== '') {
      this.database.filterSearchedComponent({ searchText }, this.currentPage, this.limit).subscribe((data: any) => {
        this.componentsList = data.components
        this.totalPages = data.totalPages;
      })
    } else {
      this.getFilteredComponent()
    }
  }

  //To calculates which page should be visible
  getPagesToShow(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPage - 1);
    const endPage = Math.min(this.totalPages, startPage + 2);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  //This checks the shelf value
  checkChangeShelfValue() {
    if (this.modifyComponentForm.value.shelfName) {
      this.changeShelfValue()
    }
  }

  // This used to change shelf location in Add New Project Form
  changeShelfValue() {
    var tempShelf = this.newProjectForm.value.shelfName;
    if (this.newProjectForm.value.shelfName) {
      for (let i = 0; i < this.shelfList.length; i++) {
        if (tempShelf === this.shelfList[i]._id) {
          this.boxNames = this.shelfList[i].boxNames
        }
      }
    }
  }

  // update submit modified component form
  submitModifyComponent() {
    this.modifyComponentForm.patchValue({
      categoryName: this.modifyComponentForm.value.categoryName,
      manufacturerName: this.modifyComponentForm.value.manufacturerName,
      manufacturerPartNumber: this.modifyComponentForm.value.manufacturerPartNumber,
      package: this.modifyComponentForm.value.package,
      description: this.modifyComponentForm.value.description,
      comment: this.modifyComponentForm.value.comment
    });
    if (this.modifyComponentForm.invalid === true) {
      return;
    }
    var updateEditComponent = {
      categoryName: this.modifyComponentForm.value.categoryName,
      id: this.modifyComponentForm.value.componentId,
      manufacturer: this.modifyComponentForm.value.manufacturerName,
      manufacturerPartNumber: this.modifyComponentForm.value.manufacturerPartNumber,
      package: this.modifyComponentForm.value.package,
      totalQuantity: this.modifyComponentForm.value.inStockQuantity,
      description: this.modifyComponentForm.value.description,
      comment: this.modifyComponentForm.value.comment
    }
    this.database.updateDashComponentById(updateEditComponent, this.selectedComponent._id).subscribe((data: any) => {
      console.log("data:", updateEditComponent)
      if (data.message) {
        this.pageRefresh()
      }
    });
  }

  //It is used for select component for Edit/Modify
  selectComponentEdit(component: any) {
    this.previousProjectNameIndex = null
    this.selectedComponent = {};
    this.selectedComponent = component;
    this.selectedComponentProjectList = [];
    this.selectedComponent.stockDetails.forEach((element: any) => {
      this.selectedComponentProjectList.push(element.projectName)
    });
    this.modifyComponentForm.get('categoryName')?.patchValue(component.categoryName),
      this.modifyComponentForm.get('componentId')?.patchValue(component.id),
      this.modifyComponentForm.get('manufacturerName')?.patchValue(component.manufacturer),
      this.modifyComponentForm.get('manufacturerPartNumber')?.patchValue(component.manufacturerPartNumber),
      this.modifyComponentForm.get('package')?.patchValue(component.package),
      this.modifyComponentForm.get('inStockQuantity')?.patchValue(component.totalQuantity),
      this.modifyComponentForm.get('description')?.patchValue(component.description),
      this.modifyComponentForm.get('comment')?.patchValue(component.comment),
      this.modifyComponentForm.get('shelfName')?.patchValue(component.locationDetail.shelfName),
      this.modifyComponentForm.get('boxName')?.patchValue(component.locationDetail.boxNames)
    this.checkChangeShelfValue()
    this.newTotalQuantity = this.selectedComponent.totalQuantity
    this.newTotalIssuedQuantity = this.selectedComponent.totalQuantity
  }

  selectComponent(component: any) {
    this.selectedComponent = {}
    this.selectedComponent = component;
    this.selectedComponentProjectList = [];
  }

  //This fetches the Component's stock history
  getComponentStockHistory(component: any) {
    this.selectedComponent = {}
    this.selectedComponent = component
    this.database.getStockHistoryByComponentId(component._id).subscribe((data: any) => {
      this.stockHistories = data
    });
  }

  // Add Stock section
  submitNewProjectForm() {
    const projectNameControl = this.newProjectForm.get('projectName');
    const quantityControl = this.newProjectForm.get('quantity');
    const supplierNameControl = this.newProjectForm.get('supplierName');
    const supplierPartNumberControl = this.newProjectForm.get('supplierPartNumber');
    const noteControl = this.newProjectForm.get('note');
    const shelfNameControl = this.newProjectForm.get('shelfName');
    const boxNamesControl = this.newProjectForm.get('boxNames');
    const notificationQuantityControl = this.newProjectForm.get('notificationQuantity')
    const trimControlValue = (control: any) => {
      if (control && typeof control.value === 'string') {
        const trimmedValue = control.value.trim();
        control.setValue(trimmedValue);
        if (control.hasValidator(Validators.required) && !trimmedValue) {
          control.setErrors({ 'required': true });
          return false;
        }
      }
      return true;
    }

    const allControlsValid = [
      projectNameControl,
      supplierNameControl
    ].map(trimControlValue).every(valid => valid);
    if (!allControlsValid || !quantityControl || quantityControl.invalid) {
      return;
    }
    this.selectedComponent.totalQuantity = Number(this.selectedComponent.totalQuantity) + Number(quantityControl.value);
    var updateStockDetail = {
      projectName: projectNameControl?.value,
      quantity: quantityControl?.value,
      // modifier: sessionStorage.getItem('employeeCode'),
      modifier: this.employeeCode,
      modifiedDate: new Date(),
      supplierName: supplierNameControl?.value,
      supplierPartNumber: supplierPartNumberControl?.value,
      locationDetail: {
        shelfName: shelfNameControl?.value,
        boxNames: boxNamesControl?.value,
      },
      notificationQuantity: notificationQuantityControl?.value
    }
    var history = {
      componentId: this.selectedComponent._id,
      projectName: projectNameControl?.value,
      quantity: quantityControl?.value,
      // inventoryHandler: sessionStorage.getItem('employeeCode'),
      inventoryHandler: this.employeeCode,
      issuedTo: null,
      date: new Date(),
      transactionType: 'add',
      supplierName: supplierNameControl?.value,
      supplierPartNo: supplierPartNumberControl?.value,
      note: noteControl?.value
    }
    this.selectedComponent.stockDetails.push(updateStockDetail);
    this.database.postNewProject({ component: this.selectedComponent, stockHistory: history }).subscribe((data: any) => {
      if (data.message) {
        this.pageRefresh()
      }
    });
  }

  // Change input of project Name
  changeProjectName(selectComponent: any) {
    this.issueComponentForm.get('issueQuantity')?.setValue('');
    this.issueComponentForm.get('issuedPerson')?.setValue('');
    this.movedComponentForm.get('movedToProjectName')?.setValue('');
    this.movedComponentForm.get('movedQuantity')?.setValue('');
    const selectedValue = {
      editStock: this.editProjectForm.get('projectName')?.value,
      moveStock: this.movedComponentForm.get('movedFromProjectName')?.value,
      issueStock: this.issueComponentForm.get('projectName')?.value,
      notificationQtyStock: this.notificationQtyForm.get('projectName')?.value
    }
    this.selectedComponentProjectList?.find(project => project === selectedValue.moveStock)
    const foundItem = this.selectedComponent?.stockDetails?.find((item: any) => {
      return item.projectName === selectedValue.moveStock;
    });
    if (foundItem) {
      this.available = foundItem.quantity;
    }
    this.OtherProjectNames = this.selectedComponentProjectList?.filter(project => project !== selectedValue.moveStock);
    if (this.OtherProjectNames.length == 0) {
      this.movedComponentForm.disable();
    }
    const filteredStockDetailsIssue = this.selectedComponent?.stockDetails?.find((item: any) => {
      return item.projectName === selectedValue.issueStock;
    });
    if (filteredStockDetailsIssue) {
      this.availableIssueQuantity = filteredStockDetailsIssue.quantity;
    }
    if (this.availableIssueQuantity === 0) {
      this.issueComponentForm.get('issuedPerson')?.disable();
      this.issueComponentForm.get('note')?.disable();
    } else {
      this.issueComponentForm.get('issuedPerson')?.enable();
      this.issueComponentForm.get('note')?.enable();
    }
    let filterNotificationProjectQty = this.selectedComponent?.stockDetails?.find((item: any) => {
      return item.projectName === selectedValue.notificationQtyStock;
    });
    if (filterNotificationProjectQty) {
      this.availableNotificationQty = filterNotificationProjectQty.quantity
      console.log('notification qty', this.availableNotificationQty)
    }
  }

  // change input value of quantity of the project
  changeQuantity() {
    this.selectedComponent.stockDetails.forEach((element: any) => {
      if (element.projectName === this.editProjectForm.value.projectName) {
        this.newProjectQuantity = Number(this.editProjectForm.value.quantity) + Number(element.quantity)
        this.newTotalQuantity = Number(this.selectedComponent.totalQuantity) + Number(this.newProjectQuantity) - Number(element.quantity)
      }
    })
  }

  // Submit form of edit project form
  submitEditProject() {
    this.selectedComponent.totalQuantity = this.newTotalQuantity
    var updatedEditStockDetail: any = {
      projectName: this.editProjectForm.value.projectName,
      quantity: this.newProjectQuantity,
      // modifier: sessionStorage.getItem('employeeCode'),
      modifier: this.employeeCode,
      modifiedDate: new Date,
    }
    var history = {
      componentId: this.selectedComponent._id,
      projectName: this.editProjectForm.value.projectName,
      quantity: this.editProjectForm.value.quantity,
      // inventoryHandler: sessionStorage.getItem('employeeCode'),
      inventoryHandler: this.employeeCode,
      issuedTo: null,
      date: new Date,
      transactionType: 'add',
      supplierName: this.editProjectForm.value.supplierName,
      supplierPartNo: this.editProjectForm.value.supplierPartNumber,
      note: this.editProjectForm.value.note
    }
    for (let i = 0; i < this.selectedComponent.stockDetails.length; i++) {
      if (this.selectedComponent.stockDetails[i].projectName === this.editProjectForm.value.projectName) {
        updatedEditStockDetail["locationDetail"] = this.selectedComponent.stockDetails[i].locationDetail;
        updatedEditStockDetail["notificationQuantity"] = this.selectedComponent.stockDetails[i].notificationQuantity
        this.selectedComponent.stockDetails[i] = updatedEditStockDetail
      }
    }
    this.database.postExistingProject({ component: this.selectedComponent, stockHistory: history }).subscribe((data: any) => {
      if (data.message) {
        this.pageRefresh()
      }
    })
  }

  //This function is used to submit issue component form
  // submitIssueComponent() {
  //   this.selectedComponent.totalQuantity = Number(this.selectedComponent.totalQuantity) - Number(this.issueComponentForm.value.issueQuantity);
  //   for (let i = 0; i < this.selectedComponent.stockDetails.length; i++) {
  //     if (this.selectedComponent.stockDetails[i].projectName === this.issueComponentForm.value.projectName) {
  //       this.selectedComponent.stockDetails[i].modifiedDate = new Date;
  //       // this.selectedComponent.stockDetails[i].modifier = sessionStorage.getItem('employeeCode');
  //       this.selectedComponent.stockDetails[i].modifier = this.employeeCode;
  //       this.selectedComponent.stockDetails[i].quantity = Number(this.selectedComponent.stockDetails[i].quantity) - Number(this.issueComponentForm.value.issueQuantity);
  //     }
  //   }
  //   var history = {
  //     componentId: this.selectedComponent._id,
  //     projectName: this.issueComponentForm.value.projectName,
  //     quantity: this.issueComponentForm.value.issueQuantity,
  //     // inventoryHandler: sessionStorage.getItem('employeeCode'),
  //     inventoryHandler: this.employeeCode,
  //     issuedTo: this.issueComponentForm.value.issuedPerson,
  //     supplierName: null,
  //     supplierPartNo: null,
  //     date: new Date,
  //     transactionType: 'issue',
  //     note: this.issueComponentForm.value.note
  //   }
  //   this.database.postIssuedComponent({ component: this.selectedComponent, stockHistory: history }).subscribe((data: any) => {
  //     if (data.message) {
  //       this.pageRefresh()
  //     }
  //   })
  // }


  submitIssueComponent() {
    if (this.issueComponentForm.invalid) {
      return;
    }

    const issueQty = Number(this.issueComponentForm.value.issueQuantity);

    const history = {
      componentId: this.selectedComponent._id,
      projectName: this.issueComponentForm.value.projectName,
      quantity: issueQty,
      inventoryHandler: this.employeeCode,
      issuedTo: this.issueComponentForm.value.issuedPerson,
      supplierName: null,
      supplierPartNo: null,
      date: new Date(),
      transactionType: 'issue',
      note: this.issueComponentForm.value.note
    };

    // IMPORTANT: Do NOT mutate selectedComponent here
    // Let backend be the source of truth

    this.database.postIssuedComponent({
      component: this.selectedComponent,
      stockHistory: history
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.pageRefresh(); // fetch fresh data from DB
        } else {
          alert(res.message || 'Issue failed');
          this.pageRefresh();
        }
      },
      error: (err) => {
        console.error('API Error:', err);

        let errorMessage = 'Something went wrong while issuing component';

        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          errorMessage = 'Network error. Server unreachable.';
        } else if (err.status === 500) {
          errorMessage = 'Server error. Please contact admin.';
        }

        alert(errorMessage);
      }
    });
  }





  // return section
  changeEmployeeName() {
    let issuedToPerson = this.returnComponentForm.get('returnedPerson')?.value;
    this.returnComponentForm.controls['projectName'].setValue("");
    this.returnComponentForm.controls['returnedQuantity'].setValue("");
    this.availableReturnsForEmployee = 0;
    let filter = {
      componentId: this.selectedComponent._id,
      issuedTo: issuedToPerson
    };
    this.database.getStockHistoryByFilter(filter).subscribe((data: any) => {
      let issueHist: any = {};
      data.forEach((entry: any) => {
        const { projectName, quantity, transactionType } = entry;
        if (issueHist.hasOwnProperty(projectName)) {
          if (transactionType === "issue") {
            issueHist[projectName] += quantity;
          } else if (transactionType === "returned") {
            issueHist[projectName] -= quantity;
          } else if (transactionType === "consumed") {
            issueHist[projectName] -= quantity;
          }
        } else {
          issueHist[projectName] = transactionType === "issue" ? quantity : transactionType === "returned" ? -quantity : transactionType === "consumed" ? -quantity : 0;
        }
      });
      this.returnHistoryList = Object.entries(issueHist).map(([projectName, quantity]) => ({ projectName, quantity })).filter((obj: any) => obj.quantity > 0);
    })
  }

  // Display Available return quantity
  displayAvailableReturnQuantity() {
    this.returnComponentForm.controls['returnedQuantity'].setValue("");
    if (this.returnComponentForm.controls['projectName'].value !== "") {
      this.availableReturnsForEmployee = this.returnHistoryList[this.returnComponentForm.controls['projectName'].value].quantity;
    }
  }

  // Submit return component
  submitReturnComponent() {
    if (this.returnComponentForm.invalid) {
      return;
    }

    const returnQty = Number(this.returnComponentForm.value.returnedQuantity);

    if (!returnQty || returnQty <= 0) {
      alert('Return quantity must be greater than 0');
      return;
    }

    const selectedProject =
      this.returnHistoryList[this.returnComponentForm.value.projectName];

    if (!selectedProject) {
      alert('Invalid project selected');
      return;
    }

    const history = {
      componentId: this.selectedComponent._id,
      projectName: selectedProject.projectName,
      quantity: returnQty,
      inventoryHandler: this.employeeCode,
      issuedTo: this.returnComponentForm.value.returnedPerson,
      supplierName: null,
      supplierPartNo: null,
      date: new Date(),
      transactionType: 'returned',
      note: this.returnComponentForm.value.note
    };

    // IMPORTANT:
    // Do NOT mutate selectedComponent.totalQuantity
    // Do NOT update stockDetails in frontend
    // Backend is the source of truth

    this.database.postReturnComponent({ stockHistory: history }).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Always fetch fresh DB state
          this.pageRefresh();
        } else {
          alert(res.message || 'Return failed');
        }
      },
      error: (err) => {
        console.error('Return API Error:', err);

        let errorMessage = 'Failed to return component';

        if (err?.error?.message) {
          errorMessage = err.error.message;
        } else if (err.status === 0) {
          errorMessage = 'Network error: Server unreachable';
        } else if (err.status === 500) {
          errorMessage = 'Server error while returning component';
        }

        alert(errorMessage);
      }
    });
  }


  // Change consumption Employee Name
  changeConsumptionEmployeeName() {
    let issuedToPerson = this.consumptionComponentForm.get('consumedBy')?.value
    this.consumptionComponentForm.controls['projectName'].setValue("");
    this.consumptionComponentForm.controls['consumedQuantity'].setValue("");
    this.availableConsumptionForEmployee = 0;
    let filter = {
      componentId: this.selectedComponent._id,
      issuedTo: issuedToPerson
    }
    this.database.getStockHistoryByFilter(filter).subscribe((data: any) => {
      let issueHist: any = {};
      data.forEach((entry: any) => {
        const { projectName, quantity, transactionType } = entry;
        if (issueHist.hasOwnProperty(projectName)) {
          if (transactionType === "issue") {
            issueHist[projectName] += quantity;
          } else if (transactionType === "returned") {
            issueHist[projectName] -= quantity;
          } else if (transactionType === "consumed") {
            issueHist[projectName] -= quantity;
          }
        } else {
          issueHist[projectName] = transactionType === "issue" ? quantity : transactionType === "returned" ? -quantity : transactionType === "consumed" ? -quantity : 0;
        }
      })
      this.consumptionHistoryList = Object.entries(issueHist).map(([projectName, quantity]) => ({ projectName, quantity })).filter((obj: any) => obj.quantity > 0);
    })
  }

  // Display Available consumption quantity
  displayAvailableConsumptionQuantity() {
    this.consumptionComponentForm.controls['consumedQuantity'].setValue("");
    if (this.consumptionComponentForm.controls['projectName'].value !== "") {
      this.availableConsumptionForEmployee = this.consumptionHistoryList[this.consumptionComponentForm.controls['projectName'].value].quantity;
    }
  }

  // Submit consumption form
  // submitConsumptionForm() {
  //   for (let i = 0; i < this.selectedComponent.stockDetails.length; i++) {
  //     if (this.selectedComponent.stockDetails[i].projectName === this.consumptionHistoryList[this.consumptionComponentForm.value.projectName].projectName) {
  //       this.selectedComponent.stockDetails[i].modifiedDate = new Date;
  //       // this.selectedComponent.stockDetails[i].modifier = sessionStorage.getItem('employeeCode');
  //       this.selectedComponent.stockDetails[i].modifier = this.employeeCode;
  //     }
  //   }
  //   var history = {
  //     componentId: this.selectedComponent._id,
  //     projectName: this.consumptionHistoryList[this.consumptionComponentForm.value.projectName].projectName,
  //     quantity: this.consumptionComponentForm.value.consumedQuantity,
  //     // inventoryHandler: sessionStorage.getItem('employeeCode'),
  //     inventoryHandler: this.employeeCode,
  //     issuedTo: this.consumptionComponentForm.value.consumedBy,
  //     supplierName: null,
  //     supplierPartNo: null,
  //     date: new Date,
  //     transactionType: "consumed",
  //     note: this.consumptionComponentForm.value.note
  //   }
  //   this.database.postConsumedComponent({ component: this.selectedComponent, stockHistory: history }).subscribe((data: any) => {
  //     this.pageRefresh()
  //   })
  // }


  submitConsumptionForm() {

    if (this.consumptionComponentForm.invalid) {
      return;
    }

    const consumeQty = Number(this.consumptionComponentForm.value.consumedQuantity);

    if (!consumeQty || consumeQty <= 0) {
      alert('Consumed quantity must be greater than 0');
      return;
    }

    const selectedProject =
      this.consumptionHistoryList[this.consumptionComponentForm.value.projectName];

    if (!selectedProject) {
      alert('Invalid project selected');
      return;
    }

    const history = {
      componentId: this.selectedComponent._id,
      projectName: selectedProject.projectName,
      quantity: consumeQty,
      inventoryHandler: this.employeeCode,
      issuedTo: this.consumptionComponentForm.value.consumedBy,
      supplierName: null,
      supplierPartNo: null,
      date: new Date(),
      transactionType: "consumed",
      note: this.consumptionComponentForm.value.note
    };

    // IMPORTANT:
    // Do NOT modify selectedComponent
    // Do NOT update stockDetails
    // Do NOT touch totalQuantity
    // Backend handles everything

    this.database.postConsumedComponent({ stockHistory: history })
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.pageRefresh(); // must re-fetch from backend
          } else {
            alert(res.message || 'Consumption failed');
          }
        },
        error: (err) => {
          console.error('Consume API Error:', err);

          let errorMessage = 'Failed to consume component';

          if (err?.error?.message) {
            errorMessage = err.error.message;
          } else if (err.status === 0) {
            errorMessage = 'Server unreachable';
          } else if (err.status === 500) {
            errorMessage = 'Internal server error';
          }

          alert(errorMessage);
        }
      });
  }

  //This is used to submit Notification Quantity Form
  submitNotificationQtyForm() {
    let selectedProjectNameIndex = this.notificationQtyForm.value.projectName
    let selectedComponentCopy = JSON.parse(JSON.stringify(this.selectedComponent))
    let selectedStockDetail = selectedComponentCopy.stockDetails.find((detail: any) => detail.projectName === selectedProjectNameIndex);
    selectedStockDetail.notificationQuantity = this.notificationQtyForm.value.notificationQuantity
    this.database.postNotificationQuantity(selectedComponentCopy).subscribe((data: any) => {
      if (data.message) {
        this.pageRefresh()
      }
    })
  }

  // Chnage the shelf location and box name
  changeShelfValueLocation(event: any, form: FormGroup) {
    form.get('boxNames')?.setValue(null);
    if (event === null || event === 'null' || event === '' || event === undefined) {
      this.boxNames = []
    }
    else {
      this.boxNames = event.boxNames || [];
    }
  }

  // Submit the Change component location
  submitChangeLocationForm() {
    var selectedProjectNameIndex = this.changeLocationForm.value.projectName;
    this.selectedComponent.stockDetails[selectedProjectNameIndex].locationDetail.shelfName = this.changeLocationForm.value.shelfName
    this.selectedComponent.stockDetails[selectedProjectNameIndex].locationDetail.boxNames = this.changeLocationForm.value.boxNames
    this.database.postUpdatedLocationDetail(this.selectedComponent).subscribe((data: any) => {
      if (data.message) {
        this.pageRefresh()
      }
    })

  }

  // For submitting Move Stock in Component
  submitMovedStock() {
    let movedFromQuantity;
    let movedToQuantity;
    const stockDetails = this.selectedComponent.stockDetails;
    const formValues = this.movedComponentForm.value;
    // const employeeCode = sessionStorage.getItem('employeeCode');
    const employeeCode = this.employeeCode;
    const currentDate = new Date();
    for (let i = 0; i < stockDetails.length; i++) {
      if (stockDetails[i].projectName === formValues.movedFromProjectName) {
        movedFromQuantity = Number(stockDetails[i].quantity) - Number(formValues.movedQuantity);
        stockDetails[i].quantity = movedFromQuantity;
      }
      if (stockDetails[i].projectName === formValues.movedToProjectName) {
        movedToQuantity = Number(stockDetails[i].quantity) + Number(formValues.movedQuantity);
        stockDetails[i].quantity = movedToQuantity;
        stockDetails[i].modifier = employeeCode;
        stockDetails[i].modifiedDate = currentDate;
      }
    }
    const addStockHistory = {
      componentId: this.selectedComponent._id,
      projectName: formValues.movedToProjectName,
      movedFromProjectName: formValues.movedFromProjectName,
      quantity: formValues.movedQuantity,
      inventoryHandler: employeeCode,
      issuedTo: null,
      supplierName: null,
      supplierPartNo: null,
      date: currentDate,
      transactionType: 'move',
      note: formValues.note
    };
    this.database.postMovedStockComponent({ component: this.selectedComponent, stockHistory: addStockHistory }).subscribe((data: any) => {
      if (data.message) {
        this.pageRefresh();
      }
    });
  }

  //USed to display supplier's details in the history in Add and Create TransactionType
  displaySupplierDetail(stockHistory: any) {
    if (stockHistory.supplierName) {
      this.supplierDetail = stockHistory;
    } else { }
  }

  //This is the popup to confirm the change of Project Name in Change Location Form
  alertChangeProjectName(event: any) {
    const selectedValue = event;
    if (selectedValue === '') {
      return;
    }
    const confirmed = confirm('Are you sure you want to select the project name?');
    if (!confirmed) {
      this.changeLocationForm.get('projectName')
        ?.setValue(this.previousProjectNameIndex, { emitEvent: false });
    } else {
      this.previousProjectNameIndex = selectedValue;
    }
  }

  //For getting all the components
  getAllcomponent() {
    this.currentPage = 1
    if (this.searchedText === '') {
      this.getFilteredComponent()
    }
  }

  //For Filtration in StockHistory by TransactionType
  applyFilterOnStockHistory(component: any) {
    switch (this.selectedFilterStockHistory) {
      case 'all':
        this.stockHistoryAll(component);
        break;
      case 'create':
        this.stockHistoryFilterCreate(component);
        break;
      case 'issue':
        this.stockHistoryFilterIssue(component);
        break;
      case 'consumed':
        this.stockHistoryFilterConsumed(component);
        break;
      case 'returned':
        this.stockHistoryFilterReturn(component);
        break;
      case 'move':
        this.stockHistoryFilterMove(component);
        break;
    }
  }

  //For getting all stock history
  stockHistoryAll(component: any) {
    this.selectedRow = null
    this.getComponentStockHistory(component);
  }

  //For getting histories by create and add Transaction Type
  stockHistoryFilterCreate(component: any) {
    this.selectedRow = null
    this.stockHistories = [];
    const selectedComponentId = component._id;
    this.database.filterStockHistoryByTransactionType({ componentId: selectedComponentId, transactionType1: 'create', transactionType2: 'add' })
      .subscribe((data: any) => {
        this.stockHistories = data;
      });
  }

  //For getting histories by issue Transaction Type
  stockHistoryFilterIssue(component: any) {
    this.selectedRow = null
    this.stockHistories = [];
    const selectedComponentId = component._id;
    this.database.filterStockHistoryByTransactionType({ componentId: selectedComponentId, transactionType1: 'issue' })
      .subscribe((data: any) => {
        this.stockHistories = data;
      });
  }

  //For getting histories by consumed Transaction Type
  stockHistoryFilterConsumed(component: any) {
    this.selectedRow = null
    this.stockHistories = [];
    const selectedComponentId = component._id;
    this.database.filterStockHistoryByTransactionType({ componentId: selectedComponentId, transactionType1: 'consumed' }).subscribe((data: any) => {
      this.stockHistories = data;
    });
  }

  //For getting histories by return Transaction Type
  stockHistoryFilterReturn(component: any) {
    this.selectedRow = null
    this.stockHistories = [];
    const selectedComponentId = component._id;
    this.database.filterStockHistoryByTransactionType({ componentId: selectedComponentId, transactionType1: 'returned' })
      .subscribe((data: any) => {
        this.stockHistories = data;
      });
  }

  //For getting histories by move Transaction Type
  stockHistoryFilterMove(component: any) {
    this.selectedRow = null
    this.stockHistories = [];
    const selectedComponentId = component._id;
    this.database.filterStockHistoryByTransactionType({ componentId: selectedComponentId, transactionType1: 'move' }).subscribe((data: any) => {
      this.stockHistories = data;
    });
  }

  //This function is used to toggle the details in add/create
  toggleCollapse(index: number) {
    if (this.selectedRow === index) {
      this.selectedRow = null;
    } else {
      this.selectedRow = index;
    }
  }

  pageRefresh() {
    window.location.reload();
  }


  // Custom Validators to Check issue quantity
  // private checkIssueQuantity(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     if (control.value === undefined || control.value === null) {
  //       return { 'required': true };
  //     } else if (control.value < 1 || control.value > this.availableIssueQuantity) {
  //       return { 'range': true };
  //     } else {
  //       return null;
  //     }
  //   }
  // }

  // //For check notification quantity
  // private checkNotificationQty(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     if (control.value === undefined || control.value === null) {
  //       return { 'required': true };
  //     } else if (control.value < 0 || control.value >= this.availableNotificationQty) {
  //       return { 'range': true };
  //     } else {
  //       return null
  //     }
  //   }

  // }

  // // Custom Validators to Check Return quantity
  // private checkReturnQuantity(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     if (control.value === undefined || control.value === null) {
  //       return { 'required': true };
  //     } else if (control.value < 1 || control.value > this.availableReturnsForEmployee) {
  //       return { 'range': true };
  //     } else {
  //       return null;
  //     }
  //   }
  // }

  // // Custom Validators to Check consumption quantity
  // private checkConsumptionQuantity(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     if (control.value === undefined || control.value === null) {
  //       return { 'required': true };
  //     } else if (control.value < 1 || control.value > this.availableConsumptionForEmployee) {
  //       return { 'range': true };
  //     } else {
  //       return null;
  //     }
  //   }
  // }

  // // Custom Validators to Check Moved quantity
  // private checkMovedQuantity(): ValidatorFn {
  //   return (control: AbstractControl): { [key: string]: boolean } | null => {
  //     if (control.value === undefined || control.value === null) {
  //       return { 'required': true };
  //     } else if (control.value < 1 || control.value > this.available) {
  //       return { 'range': true };
  //     } else {
  //       return null;
  //     }
  //   }
  // }

  // check manufacturer part number
  checkModifiedManufacturerPartNo() {
    this.database.checkManufacturerPartNo(this.modifyComponentForm.value.manufacturerPartNumber).subscribe((data: any) => {
      console.log(data)
      if (data === false) {
        this.modifyComponentForm.get('manufacturerPartNumber')?.setErrors({ notUnique: true });
      }
    })
  }

  notificationQuantityValidators(control: AbstractControl) {
    let notificationQuantity = control.get('notificationQuantity')?.value;
    let quantity = control.get('quantity')?.value
    if (notificationQuantity < 0 || notificationQuantity >= quantity) {
      return { greaterThanQuantity: true };
    }
    return null
  }

}
