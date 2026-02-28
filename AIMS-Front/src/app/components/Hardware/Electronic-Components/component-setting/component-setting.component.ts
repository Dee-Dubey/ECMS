import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { TrimRequiredValidator, minArrayLengthValidator } from 'src/app/validators/custom-validator.validator'
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-component-setting',
  templateUrl: './component-setting.component.html',
  styleUrls: ['./component-setting.component.css']
})
export class ComponentSettingComponent {

  userRights: any
  companies: any;
  selectedItem: any;

  // create: boolean = true;
  // edit: boolean = false;

  isEmpty: boolean = false
  selectAll: boolean = false;

  selectedRows: any[] = [];
  manufacturersList: Array<any> = []
  categoriesList: Array<any> = []
  suppliersList: Array<any> = []
  projectsList: Array<any> = []
  shelfList: Array<any> = []

  boxArray: any = []
  boxEditArray: any = [];

  createManufacturerForm: FormGroup;
  editManufacturerForm: FormGroup;

  createCategoryForm: FormGroup;
  editCategoryForm: FormGroup;

  createSupplierForm: FormGroup;
  editSupplierForm: FormGroup;

  createProjectForm: FormGroup;
  editProjectForm: FormGroup;

  createShelfForm: FormGroup;
  editShelfForm: FormGroup;

  createCompanyForm: FormGroup;
  editCompanyForm: FormGroup;

  selectedComponentId: any
  selectedComponentName: any
  selectedAbbreviationName: any


  searchText: string = '';

  activeSection: string = 'category';
  setActive(section: string) {
    this.activeSection = section;
  }

  constructor(private database: DatabaseService, private router: Router, private authCtx: SessionstorageService) {

    // manufacturer
    this.createManufacturerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)])
    });

    this.editManufacturerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)])
    });


    // category
    this.createCategoryForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      abbreviation: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(6)])
    });

    this.editCategoryForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      abbreviation: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(6)])
    });

    // supplier
    this.createSupplierForm = new FormGroup({
      name: new FormControl('', [Validators.minLength(2), Validators.maxLength(30), TrimRequiredValidator()]),
      contact: new FormControl('', [Validators.pattern(/^\+?\d{8,14}$/)]),
      email: new FormControl('', [Validators.email]),
      address: new FormControl(''),
      type: new FormControl('', [Validators.required]),
    });

    this.editSupplierForm = new FormGroup({
      name: new FormControl('', [Validators.minLength(2), Validators.maxLength(30), TrimRequiredValidator()]),
      contact: new FormControl('', [Validators.pattern(/^\+?\d{8,14}$/)]),
      email: new FormControl('', [Validators.email]),
      address: new FormControl(''),
      type: new FormControl('', [Validators.required]),
    });

    // project
    this.createProjectForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      clientName: new FormControl(''),
      startYear: new FormControl('')
    });

    this.editProjectForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      clientName: new FormControl(''),
      startYear: new FormControl('')
    });

    // shelf location
    this.createShelfForm = new FormGroup({
      name: new FormControl('', [Validators.minLength(2), Validators.maxLength(30)]),
      shelfLocation: new FormControl('', [Validators.minLength(2), Validators.maxLength(30)]),
      boxName: new FormControl(''),
      boxesValue: new FormControl([], [minArrayLengthValidator(1)])
    });

    this.editShelfForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      shelfLocation: new FormControl('', [Validators.minLength(2), Validators.maxLength(30)]),
      boxName: new FormControl(''),
      boxesValue: new FormControl([], [minArrayLengthValidator(1)])
    });

    // Create Company
    this.createCompanyForm = new FormGroup({
      companyName: new FormControl('', [Validators.required]),
      abbreviation: new FormControl('', [Validators.required]),
      GSTNumber: new FormControl(''),
      address: new FormControl()
    });

    // Edit Company
    this.editCompanyForm = new FormGroup({
      companyName: new FormControl('', [Validators.required]),
      abbreviation: new FormControl('', [Validators.required]),
      GSTNumber: new FormControl(''),
      address: new FormControl()
    });
  }

  ngOnInit(): void {
    this.getManufacturerData()
    this.getCategoryData()
    this.getSupplierData()
    this.getProjectData()
    this.getShelfLocationData()
    this.getCompany();

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { rights } = ctx;
      this.userRights = rights
    });
  }

  //
  getCurrentData(): any[] {

    switch (this.activeSection) {

      case 'manufacturer':
        return this.manufacturersList || [];

      case 'category':
        return this.categoriesList || [];

      case 'supplier':
        return this.suppliersList || [];

      case 'project':
        return this.projectsList || [];

      case 'location':
        return this.shelfList || [];

      case 'company':
        return this.companies || [];

      default:
        return [];
    }
  }

  //
  get filteredData(): any[] {

    const search = this.searchText?.toLowerCase().trim();

    if (!search) {
      return this.getCurrentData();
    }

    return this.getCurrentData().filter((item: any) => {

      switch (this.activeSection) {

        case 'manufacturer':
          return item.name?.toString().toLowerCase().includes(search);

        case 'category':
          return (
            item.name?.toString().toLowerCase().includes(search) ||
            item.abbreviation?.toString().toLowerCase().includes(search)
          );

        case 'supplier':
          return (
            item.name?.toString().toLowerCase().includes(search) ||
            item.contact?.toString().toLowerCase().includes(search) ||
            item.email?.toString().toLowerCase().includes(search) ||
            item.address?.toString().toLowerCase().includes(search) ||
            item.type?.toString().toLowerCase().includes(search)
          );

        case 'project':
          return (
            item.name?.toString().toLowerCase().includes(search) ||
            item.clientName?.toString().toLowerCase().includes(search) ||
            item.startYear?.toString().includes(search)
          );

        case 'location':
          return (
            item.shelfName?.toString().toLowerCase().includes(search) ||
            item.shelfLocation?.toString().toLowerCase().includes(search) ||
            item.boxNames?.some((box: any) =>
              box.name?.toLowerCase().includes(search)
            )
          );

        case 'company':
          return (
            item.companyName?.toString().toLowerCase().includes(search) ||
            item.abbreviation?.toString().toLowerCase().includes(search) ||
            item.GSTNumber?.toString().toLowerCase().includes(search) ||
            item.address?.toString().toLowerCase().includes(search)
          );

        default:
          return false;
      }

    });
  }

  //
  getSectionIcon(): string {
    switch (this.activeSection) {
      case 'electronicDevice':
        return 'bi-cpu-fill';
      case 'testingEquipment':
        return 'bi-tools';
      case 'inventory':
        return 'bi-box-seam';
      case 'users':
        return 'bi-people-fill';
      case 'consumableAsset':
        return 'bi-bag-fill';
      case 'fixedAsset':
        return 'bi-building';
      default:
        return 'bi-grid-fill';
    }
  }

  //
  toggleSelectAll(event: any) {
    this.selectAll = event.target.checked;

    if (this.selectAll) {
      this.selectedRows = [...this.filteredData];
    } else {
      this.selectedRows = [];
    }
  }
  //
  toggleRowSelection(item: any, event: any) {
    if (event.target.checked) {
      this.selectedRows.push(item);
    } else {
      this.selectedRows = this.selectedRows.filter(
        row => row !== item
      );
    }

    this.selectAll = this.selectedRows.length === this.filteredData.length;
  }
  //
  exportToExcel(): void {

    // const data = this.filteredData;
    const data = this.selectedRows.length > 0 ? this.selectedRows : this.filteredData;

    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    let exportData: any[] = [];

    switch (this.activeSection) {

      case 'manufacturer':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Manufacturer Name': item.name
        }));
        break;

      case 'category':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Category Name': item.name,
          'Abbreviation': item.abbreviation
        }));
        break;

      case 'supplier':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Supplier Name': item.name,
          'Contact': item.contact,
          'Email': item.email,
          'Address': item.address,
          'Type': item.type
        }));
        break;

      case 'project':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Project Name': item.name,
          'Client Name': item.clientName,
          'Start Year': item.startYear
        }));
        break;

      case 'location':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Room/Location': item.shelfLocation,
          'Cupboard ID': item.shelfName,
          'Box Names': item.boxNames?.map((b: any) => b.name).join(', ')
        }));
        break;

      case 'company':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Company Name': item.companyName,
          'Abbreviation': item.abbreviation,
          'GST Number': item.GSTNumber,
          'Address': item.address
        }));
        break;

      default:
        exportData = data;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // 🔹 Get column keys
    const header = Object.keys(exportData[0]);

    // 🔹 Add header manually (so we can style it)
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

    // 🔹 Auto column width
    const colWidths = header.map(key => ({
      wch: Math.max(
        key.length,
        ...exportData.map(row => (row[key] ? row[key].toString().length : 10))
      ) + 2
    }));
    worksheet['!cols'] = colWidths;

    // 🔹 Freeze first row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // 🔹 Header Styling (bold + background)
    header.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F4E78" } }, // Dark Blue Header
        alignment: { horizontal: "center", vertical: "center" }
      };
    });

    // 🔹 Force Contact Column as Text (Prevent Scientific Format)
    if (this.activeSection === 'supplier') {

      const contactColIndex = header.indexOf('Contact');

      if (contactColIndex !== -1) {

        for (let rowIndex = 1; rowIndex <= exportData.length; rowIndex++) {

          const cellAddress = XLSX.utils.encode_cell({
            r: rowIndex,
            c: contactColIndex
          });

          if (worksheet[cellAddress]) {
            worksheet[cellAddress].t = 's';  // Force string type
            worksheet[cellAddress].z = '@';  // Text format
          }
        }
      }
    }

    // 🔹 Create workbook
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Report': worksheet },
      SheetNames: ['Report']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true   // IMPORTANT for styles
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const today = new Date().toISOString().split('T')[0];
    const fileName = `AIMS-Components-${this.activeSection}-${today}.xlsx`;

    FileSaver.saveAs(blob, fileName);
  }

  //
  pageRefresh() {
    window.location.reload();
  }

  /**
   * ======================================================================================================================
   * Manufacturer Section for all require function
   * @function editManufacturer
   * @function getManufacturerData
   * @function submitManufacturer
   * @function submitEditManufacturer
   * @function deleteManufacturer
   * @function checkManufacturerName
   * @function checkEditManufacturerName
   *
  */
  // editing manufacturer form
  editManufacturer(manufacturer: any) {
    // this.edit = true;
    // this.create = false;
    this.selectedComponentId = manufacturer._id;
    this.selectedComponentName = manufacturer.name
    this.editManufacturerForm.get('name')?.patchValue(manufacturer.name)
  }

  // fetching the manufacturer data
  getManufacturerData() {
    this.database.getAllManufacturer().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.manufacturersList = res.list;      // full manufacturer list
        console.log("Manufacturers:", this.manufacturersList);
      },
      error: (err) => {
        console.error("Failed to fetch manufacturers", err);
      }
    });
  }

  submitManufacturer() {
    try {
      const nameControl = this.createManufacturerForm.get('name');
      if (!nameControl) {
        return;
      }
      const nameValue = nameControl.value?.trim();
      nameControl.setValue(nameValue);

      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      this.database.postManufacturer(this.createManufacturerForm.value)
        .subscribe({

          next: (data: any) => {
            if (data?.message) {
              this.getManufacturerData();
              this.createManufacturerForm.reset();
              document.getElementById('createModalCloseBtn')?.click();
            }
          },
          error: (err) => {
            console.error('Error creating manufacturer:', err);
            alert('Failed to create manufacturer. Please try again.');
          }
        });
    } catch (error) {
      console.error('Unexpected error in submitManufacturer:', error);
      alert('Failed to create manufacturer. Please try again.');
    }
  }

  // submit manufacturer edit form
  submitEditManufacturer() {

    const nameControl = this.editManufacturerForm.get('name');
    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedValue = nameControl.value.trim();
      nameControl.setValue(trimmedValue);

      //Check if trimmed value is empty
      if (!trimmedValue) {
        nameControl.setErrors({ 'required': true })
        return
      }
    }

    const updateManufacturerData = {
      name: nameControl?.value
    }

    this.database.updateManufacturerById(updateManufacturerData, this.selectedComponentId).subscribe((data: any) => {

      if (data.message === true) {
        this.getManufacturerData()

        // this.create = true;
        this.createManufacturerForm.reset();
        // this.edit = false;
        document.getElementById('editModalCloseBtn')?.click();
      }
    });

  }

  // deleting the data logic
  deleteManufacturer(manufacturerName: string) {
    this.database.deleteManufacturerByName(manufacturerName).subscribe((data: any) => {
      if (data.message) {
        this.getManufacturerData()
        // this.create = true
        // this.edit = false
      }

    });
  }

  // check the manufacturer name by create
  checkManufacturerName() {
    const nameControl = this.createManufacturerForm.get('name');
    const nameValue = nameControl?.value.trim();
    nameControl?.setValue(nameValue);
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkManufacturerName(nameValue).subscribe((data: any) => {
      console.log("data", data)
      if (data === false) {
        nameControl?.setErrors({ notUnique: true })
      }

    });
  }

  // check the manufacturer name by edit
  checkEditManufacturerName() {
    const nameControl = this.editManufacturerForm.get('name');
    const nameValue = nameControl?.value.trim();

    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    if (this.selectedComponentName !== nameValue) {
      this.database.checkManufacturerName(nameValue).subscribe((data: any) => {

        if (data === false) {
          nameControl?.setErrors({ notUnique: true })
        }

      });
    } else {
      nameControl?.setErrors(null)
    }
  }
  /** * =================================================================================================================*/


  /**
   * ======================================================================================================================
   * Category Section for all require function
   * @function editCategory
   * @function getCategoryData
   * @function submitCategory
   * @function submitEditCategory
   * @function deleteCategory
   * @function checkCategoryName
   * @function checkEditCategoryName
   * @function checkAbbreviatedName
   * @function checkEditAbbreviatedName
   *
  */
  // edit category
  editCategory(category: any) {
    // this.edit = true;
    // this.create = false;
    this.selectedComponentId = category._id;
    this.selectedComponentName = category.name;
    this.selectedAbbreviationName = category.abbreviation
    this.editCategoryForm.get('name')?.patchValue(category.name)
    this.editCategoryForm.get('abbreviation')?.patchValue(category.abbreviation)
  }

  // fetching the category data
  getCategoryData() {
    this.database.getAllCategory().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.categoriesList = res.list;

        console.log("Categories Loaded:", this.categoriesList.length);
      },
      error: (err) => {
        console.error("Failed to fetch categories", err);
      }
    });

  }

  // submit category data
  submitCategory() {
    // console.log(this.createCategoryForm.value)
    const nameControl = this.createCategoryForm.get('name');
    const abbreviationControl = this.createCategoryForm.get('abbreviation');

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedName = nameControl.value.trim();
      nameControl.setValue(trimmedName);

      if (!trimmedName) {
        nameControl.setErrors({ 'required': true });
        return;
      }
    }

    if (abbreviationControl && typeof abbreviationControl.value === 'string') {
      const trimmedAbbreviation = abbreviationControl.value.trim();
      abbreviationControl.setValue(trimmedAbbreviation);

      if (!trimmedAbbreviation) {
        abbreviationControl.setErrors({ 'required': true });
        return;
      }
    }

    let category = {
      name: nameControl?.value,
      abbreviation: abbreviationControl?.value.toUpperCase(),
      sequenceId: 0
    }
    this.database.postCategory(category).subscribe((data: any) => {
      if (data.message) {
        this.createCategoryForm.reset();
        this.getCategoryData();
        document.getElementById('createModalCloseBtn')?.click();
      }
    });
  }

  //submit category edit form
  submitEditCategory() {

    const nameControl = this.editCategoryForm.get('name');
    const abbreviationControl = this.editCategoryForm.get('abbreviation');

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedName = nameControl.value.trim();
      nameControl.setValue(trimmedName);

      if (!trimmedName) {
        nameControl.setErrors({ 'required': true });
        return; // Exit the function early if the name is empty
      }
    }

    if (abbreviationControl && typeof abbreviationControl.value === 'string') {
      const trimmedAbbreviation = abbreviationControl.value.trim();
      abbreviationControl.setValue(trimmedAbbreviation);

      if (!trimmedAbbreviation) {
        abbreviationControl.setErrors({ 'required': true });
        return;
      }
    }

    const updateCategoryData = {
      name: nameControl?.value,
      abbreviation: abbreviationControl?.value.toUpperCase()
    }
    this.database.updateCategoryById(updateCategoryData, this.selectedComponentId).subscribe((data: any) => {
      if (data.message === true) {
        // this.create = true;
        this.createCategoryForm.reset();
        this.getCategoryData();
        // this.edit = false;
        document.getElementById('editModalCloseBtn')?.click();
      }
    });
  }

  // delete category by name
  deleteCategory(categoryName: string) {
    this.database.deleteCategoryByName(categoryName).subscribe((data: any) => {
      if (data.message) {
        this.getCategoryData()
        // this.create = true
        // this.edit = false
      }
    });
  }

  // check the category name by create
  checkCategoryName() {
    const nameControl = this.createCategoryForm.get('name');
    const nameValue = nameControl?.value.trim();
    nameControl?.setValue(nameValue)
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkCategoryName(this.createCategoryForm.value.name).subscribe((data: any) => {

      if (data === false) {
        this.createCategoryForm.get('name')?.setErrors({ notUnique: true })
      }
    });
  }

  // check the category name by edit
  checkEditCategoryName() {
    const nameControl = this.editCategoryForm.get('name');
    const nameValue = nameControl?.value.trim();

    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    if (this.selectedComponentName !== nameValue) {
      this.database.checkCategoryName(nameValue).subscribe((data: any) => {

        if (data === false) {
          nameControl?.setErrors({ notUnique: true })
        }
      });
    } else {
      nameControl?.setErrors(null)
    }
  }

  //To check the abbreviated name in create category form
  checkAbbreviatedName() {
    const abbNameControl = this.createCategoryForm.get('abbreviation');
    const abbValue = abbNameControl?.value.toUpperCase().trim()
    abbNameControl?.setValue(abbValue)
    if (!abbValue) {
      abbNameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkAbbreviatedName(abbValue).subscribe((data: any) => {
      if (data === false) {
        abbNameControl?.setErrors({ notUnique: true })
      }
    });

  }

  //To check the abbreviated name in Edit category form
  checkEditAbbreviatedName() {
    // console.log('selected Abbreviation', this.selectedAbbreviationName)
    const abbNameControl = this.editCategoryForm.get('abbreviation');
    const abbValue = abbNameControl?.value.toUpperCase()
    console.log('abb', abbValue)
    if (!abbValue) {
      abbNameControl?.setErrors({ required: true });
      return;
    }
    if (this.selectedAbbreviationName !== abbValue)
      this.database.checkAbbreviatedName(abbValue).subscribe((data: any) => {
        if (data === false) {
          abbNameControl?.setErrors({ notUnique: true })
        }
      });

  }
  /** * =================================================================================================================*/



  /**
   * ======================================================================================================================
   * Supplier Section for all require function
   * @function editSupplier
   * @function getSupplierData
   * @function submitSupplier
   * @function submitEditSupplier
   * @function deleteSupplier
   * @function checkSupplierName
   * @function checkEditSupplierName
   *
  */
  // edit supplier
  editSupplier(supplier: any) {
    // this.edit = true;
    // this.create = false;

    this.selectedComponentId = supplier._id;
    this.selectedComponentName = supplier.name;

    this.editSupplierForm.get('name')?.patchValue(supplier.name)
    this.editSupplierForm.get('contact')?.patchValue(supplier.contact)
    this.editSupplierForm.get('email')?.patchValue(supplier.email)
    this.editSupplierForm.get('address')?.patchValue(supplier.address)
    this.editSupplierForm.get('type')?.patchValue(supplier.type)
  }

  // fetching the supplier data
  getSupplierData() {
    this.database.getAllSupplier().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.suppliersList = res.list || [];     // full list

        console.log("Suppliers:", this.suppliersList);
      },
      error: (err) => {
        console.error("Failed to load suppliers:", err);
      }
    });
  }

  // submit supplier data
  submitSupplier() {
    console.log('supplier create data', this.createSupplierForm.value)

    const formControls = this.createSupplierForm.controls;

    // Trim all form control values
    for (const key in formControls) {
      if (formControls.hasOwnProperty(key)) {
        const control = formControls[key];

        if (control && typeof control.value === 'string') {
          const trimmedValue = control.value.trim();
          control.setValue(trimmedValue);
        }
      }
    }

    this.database.postSupplier(this.createSupplierForm.value).subscribe((data: any) => {
      if (data.message) {
        this.createSupplierForm.reset();
        this.getSupplierData();
        document.getElementById('createModalCloseBtn')?.click();
      }
    });
  }

  //submit supplier edit form
  submitEditSupplier() {
    const nameControl = this.editSupplierForm.get('name');
    const contactControl = this.editSupplierForm.get('contact');
    const emailControl = this.editSupplierForm.get('email');
    const addressControl = this.editSupplierForm.get('address');
    const typeControl = this.editSupplierForm.get('type');

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedValue = nameControl.value.trim();
      nameControl.setValue(trimmedValue);

      //Check if trimmed value is empty
      if (!trimmedValue) {
        nameControl.setErrors({ 'required': true })
        return
      }
    }

    if (contactControl && typeof contactControl.value === 'string') {
      const trimmedContact = contactControl.value.trim();
      contactControl.setValue(trimmedContact);

    }

    if (emailControl && typeof emailControl.value === 'string') {
      const trimmedEmail = emailControl.value.trim();
      emailControl.setValue(trimmedEmail);
      // Add validation logic if needed
    }

    if (addressControl && typeof addressControl.value === 'string') {
      const trimmedAddress = addressControl.value.trim();
      addressControl.setValue(trimmedAddress);
      // Add validation logic if needed
    }

    if (typeControl && typeof typeControl.value === 'string') {
      const trimmedType = typeControl.value.trim();
      typeControl.setValue(trimmedType);
      // Add validation logic if needed
    }

    var updateSupplierData = {
      name: nameControl?.value,
      contact: contactControl?.value,
      email: emailControl?.value,
      address: addressControl?.value,
      type: typeControl?.value
    }
    this.database.updateSupplierById(updateSupplierData, this.selectedComponentId).subscribe((data: any) => {
      if (data.message === true) {
        // this.create = true;
        this.createSupplierForm.reset();
        this.getSupplierData();
        // this.edit = false;
        document.getElementById('editModalCloseBtn')?.click();
      }
    });

  }

  // delete supplier by name
  deleteSupplier(supplierName: string) {
    this.database.deleteSupplierByName(supplierName).subscribe((data: any) => {
      if (data.message) {
        this.getSupplierData()
        // this.create = true
        // this.edit = false
      }
    });
  }

  // check the category name by create
  checkSupplierName() {
    const nameControl = this.createSupplierForm.get('name');
    const nameValue = nameControl?.value.trim()
    nameControl?.setValue(nameValue)
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkSupplierName(nameValue).subscribe((data: any) => {
      if (data === false) {
        nameControl?.setErrors({ notUnique: true })
      }
    });
  }

  // check the category name by edit
  checkEditSupplierName() {
    const nameControl = this.editSupplierForm.get('name');
    const nameValue = nameControl?.value.trim();
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    if (this.selectedComponentName !== nameValue) {
      this.database.checkSupplierName(nameValue).subscribe((data: any) => {
        if (data === false) {
          nameControl?.setErrors({ notUnique: true })
        }
      });
    } else {
      nameControl?.setErrors(null)
    }
  }



  /**
   * ======================================================================================================================
   * Project Section for all require function
   * @function submitProject
   * @function getProjectData
   * @function submitEditProject
   * @function editProject
   * @function deleteProject
   * @function checkProjectName
   * @function checkEditProjectName
   *
  */
  // fetching the project data
  getProjectData() {
    this.database.getAllProject().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }
        this.projectsList = res.list;     // full project list
      },
      error: (err) => {
        console.error("Failed to load projects:", err);
      }
    });
  }

  // submit project data
  submitProject() {
    // console.log(this.createProjectForm.value)
    let nameControl = this.createProjectForm.get('name');
    let clientControl = this.createProjectForm.get('clientName');
    let startYearControl = this.createProjectForm.get('startYear');

    // console.log('controlName, clientControl, controlStartYear', nameControl?.value, clientControl?.value, startYearControl?.value);

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedName = nameControl.value.trim();
      nameControl.setValue(trimmedName);
      if (!trimmedName) {
        nameControl.setErrors({ 'required': true });
        return;
      }
    }

    if (clientControl && typeof clientControl.value === 'string') {
      let trimmedClientName = clientControl.value.trim()
      clientControl.setValue(trimmedClientName)
      // if (!trimmedClientName) {
      //   clientControl.setErrors({ 'required': true });
      //   return;
      // }
    }

    const trimmedFormValue = {
      name: nameControl?.value,
      clientName: clientControl?.value,
      startYear: startYearControl?.value
    };

    this.database.postProject(trimmedFormValue).subscribe((data: any) => {
      if (data.message) {
        this.createProjectForm.reset();
        this.getProjectData()
        document.getElementById('createModalCloseBtn')?.click();
      }
    });

  }

  //submit project edit form
  submitEditProject() {
    const nameControl = this.editProjectForm.get('name');
    const clientControl = this.editProjectForm.get('clientName');
    const startYearControl = this.editProjectForm.get('startYear');

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedName = nameControl.value.trim();
      nameControl.setValue(trimmedName);

      if (!trimmedName) {
        nameControl.setErrors({ 'required': true });
        return;
      }
    }

    if (clientControl && typeof clientControl.value === 'string') {
      const trimmedClient = clientControl.value.trim();
      clientControl.setValue(trimmedClient);

      // if (!trimmedClient) {
      //   clientControl.setErrors({ 'required': true });
      //   return;
      // }
    }

    const updateProjectData = {
      name: nameControl?.value,
      clientName: clientControl?.value,
      startYear: startYearControl?.value
    }
    this.database.updateProjectById(updateProjectData, this.selectedComponentId).subscribe((data: any) => {
      if (data.message === true) {
        this.getProjectData()
        // this.create = true;
        // this.edit = false;
        this.createProjectForm.reset();
        document.getElementById('editModalCloseBtn')?.click();
      }
    })
  }

  // edit project
  editProject(project: any) {
    // this.edit = true;
    // this.create = false;
    this.selectedComponentId = project._id;
    this.selectedComponentName = project.name;
    this.editProjectForm.get('name')?.patchValue(project.name)
    this.editProjectForm.get('clientName')?.patchValue(project.clientName)
    this.editProjectForm.get('startYear')?.patchValue(project.startYear)
  }

  // delete project by name
  deleteProject(projectName: string) {
    this.database.deleteProjectByName(projectName).subscribe((data: any) => {
      if (data.message) {
        this.getProjectData()
        // this.create = true
        // this.edit = false
      }
    });
  }

  // check the project name by create
  checkProjectName() {
    const nameControl = this.createProjectForm.get('name');
    const nameValue = nameControl?.value.trim();
    nameControl?.setValue(nameValue)

    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkProjectName(nameValue).subscribe((data: any) => {
      if (data === false) {
        nameControl?.setErrors({ notUnique: true })
      }
    });
  }

  // check the project name by edit
  checkEditProjectName() {
    const nameControl = this.editProjectForm.get('name');
    const nameValue = nameControl?.value.trim();
    // nameControl?.setValue(nameValue)

    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    if (this.selectedComponentName !== nameValue) {
      this.database.checkProjectName(nameValue).subscribe((data: any) => {

        if (data === false) {
          nameControl?.setErrors({ notUnique: true })
        }
      });
    }
  }



  /**
   * ======================================================================================================================
   * Project Section for all require function
   * @function submitShelf
   * @function getShelfLocationData
   * @function submitEditShelfLocation
   * @function editShelfLocation
   * @function deleteShelfLocation
   * @function addBoxValue
   * @function addEditBoxValue
   * @function removeBoxValue
   * @function checkShelfName
   * @function checkEditShelfName
   *
  */
  // fetching the Shelf Location data
  getShelfLocationData() {
    this.database.getAllShelf().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.shelfList = res.list;       // full shelf lis

      },
      error: (err) => {
        console.error("Failed to load shelves", err);
      }
    });
  }

  // Shelf Location
  submitShelf() {
    let nameControl = this.createShelfForm.get('name');
    let shelfLocationControl = this.createShelfForm.get('shelfLocation')

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedName = nameControl.value.trim();
      nameControl.setValue(trimmedName);

      if (!trimmedName) {
        nameControl.setErrors({ 'required': true });
        return;
      }
    }

    if (shelfLocationControl && typeof shelfLocationControl.value === 'string') {
      const trimmedShelfLocation = shelfLocationControl.value.trim();
      shelfLocationControl.setValue(trimmedShelfLocation);
    }


    // console.log('create shelf submit', this.createShelfForm.value)
    // temporary changes
    var shelfLocationValue = {
      shelfName: nameControl?.value,
      shelfLocation: shelfLocationControl?.value,
      boxNames: this.boxArray
    }
    // console.log('shelf location value', shelfLocationValue)
    this.database.postShelfLocation(shelfLocationValue).subscribe((data: any) => {
      if (data.message) {
        this.createShelfForm.reset();
        this.boxArray = []
        this.getShelfLocationData();
        document.getElementById('createModalCloseBtn')?.click();
      }
    });
  }

  //submit Shelf Location edit form
  submitEditShelfLocation() {

    const nameControl = this.editShelfForm.get('name');
    const shelfLocationControl = this.editShelfForm.get('shelfLocation');

    if (nameControl && typeof nameControl.value === 'string') {
      const trimmedName = nameControl.value.trim();
      nameControl.setValue(trimmedName);

      if (!trimmedName) {
        nameControl.setErrors({ 'required': true });
        return;
      }
    }

    if (shelfLocationControl && typeof shelfLocationControl.value === 'string') {
      const trimmedShelfLocation = shelfLocationControl.value.trim();
      shelfLocationControl.setValue(trimmedShelfLocation);
    }

    const updateShelfData = {
      shelfName: nameControl?.value,
      shelfLocation: shelfLocationControl?.value,
      boxNames: this.boxEditArray
    }
    // console.log('update shelf location value', updateShelfData)
    this.database.updateShelfById(updateShelfData, this.selectedComponentId).subscribe((data: any) => {
      if (data.message === true) {
        // this.create = true;
        this.editShelfForm.reset();
        this.boxEditArray = []
        this.getShelfLocationData();
        document.getElementById('editModalCloseBtn')?.click();
      }
    })
  }

  // edit Shelf Location
  editShelfLocation(shelf: any) {
    console.log(this.editShelfForm)
    // this.edit = true;
    // this.create = false;
    let newShelf = JSON.parse(JSON.stringify(shelf))
    this.selectedComponentId = newShelf._id;
    this.selectedComponentName = newShelf.shelfName
    this.editShelfForm.get('name')?.patchValue(newShelf.shelfName)
    this.editShelfForm.get('shelfLocation')?.patchValue(newShelf.shelfLocation);
    this.boxEditArray = newShelf.boxNames;
    // this.editShelfForm.value.boxesValue = this.boxEditArray
    this.editShelfForm.get('boxesValue')?.setValue(this.boxEditArray);
    this.editShelfForm.get('boxesValue')?.updateValueAndValidity();
  }

  // delete Shelf Location by name
  deleteShelfLocation(shelfName: string) {
    console.log('shelfName', shelfName)
    this.database.deleteShelfByName(shelfName).subscribe((data: any) => {
      if (data.message) {
        this.getShelfLocationData()
      }
    })
  }


  addBoxValue() {
    const rawName = this.createShelfForm.get('boxName')?.value;
    const name = rawName ? rawName.trim() : '';
    if (!name) return;
    const normalizedName = name.toLowerCase();
    const isDuplicate = this.boxArray.some(
      (box: any) => box.name.toLowerCase() === normalizedName
    );
    if (isDuplicate) {
      this.createShelfForm.get('boxName')?.setErrors({ duplicate: true });
      return;
    }
    const tempBoxValue = { name };
    this.boxArray.push(tempBoxValue);
    const boxesValue = this.createShelfForm.get('boxesValue')?.value || [];
    boxesValue.push(tempBoxValue);
    this.createShelfForm.get('boxesValue')?.setValue(boxesValue);
    this.createShelfForm.get('boxName')?.patchValue('');
  }


  addEditBoxValue() {
    const rawName = this.editShelfForm.get('boxName')?.value;
    const name = rawName ? rawName.trim() : '';
    if (!name) return;
    const normalizedName = name.toLowerCase();
    const isDuplicate = this.boxEditArray.some(
      (box: any) => box.name.toLowerCase() === normalizedName
    );
    if (isDuplicate) {
      this.editShelfForm.get('boxName')?.setErrors({ duplicate: true });
      return;
    }
    const tempEditBoxValue = { name };
    // Update UI state
    this.boxEditArray = [...this.boxEditArray, tempEditBoxValue];
    // Sync form with NEW reference
    this.editShelfForm.get('boxesValue')?.setValue([...this.boxEditArray]);

    this.editShelfForm.get('boxName')?.reset();
  }




  // remove the box value
  removeBoxValue(index: number) {
    const boxName = this.boxArray[index].name;
    const isConfirmed = confirm(`Are you sure you want to delete the box "${boxName}"?`);
    if (isConfirmed) {
      this.boxArray.splice(index, 1);
      this.createShelfForm.get('boxesValue')?.setValue([...this.boxArray]);
      this.createShelfForm.get('boxesValue')?.updateValueAndValidity();
    }
  }

  removeEditBoxValue(index: number) {
    const boxName = this.boxEditArray[index].name;
    const isConfirmed = confirm(`Are you sure you want to delete the box "${boxName}"?`);
    if (isConfirmed) {
      this.boxEditArray.splice(index, 1);
      this.editShelfForm.get('boxesValue')?.setValue([...this.boxEditArray]);
      this.editShelfForm.get('boxesValue')?.updateValueAndValidity();
    }
  }

  //For clear or reset the values
  clearModalForm() {
    // this.create = true;
    // this.edit = false
    this.boxArray = [];
    this.createShelfForm.get('boxesValue')?.setValue([]);
    this.createManufacturerForm.reset()
    this.editManufacturerForm.reset()
    this.createCategoryForm.reset()
    this.editCategoryForm.reset()
    this.createSupplierForm.reset()
    this.editSupplierForm.reset()
    this.createProjectForm.reset()
    this.editProjectForm.reset();
    this.createShelfForm.reset();
    this.editShelfForm.reset();
  }

  // check the shelf name by create
  checkShelfName() {
    const nameControl = this.createShelfForm.get('name');
    const nameValue = nameControl?.value.trim();
    nameControl?.setValue(nameValue)
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkShelfName(nameValue).subscribe((data: any) => {
      if (data === false) {
        nameControl?.setErrors({ notUnique: true })
      }
    })
  }

  // check the shelf name by edit
  checkEditShelfName() {
    const nameControl = this.editShelfForm.get('name');
    const nameValue = nameControl?.value.trim();

    // nameControl?.setValue(nameValue)
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    if (this.selectedComponentName !== nameValue) {
      this.database.checkShelfName(nameValue).subscribe((data: any) => {
        if (data === false) {
          nameControl?.setErrors({ notUnique: true })
        }
      })
    } else {
      nameControl?.setErrors(null)
    }
  }



  /**
   * ======================================================================================================================
   * Company Section for all require function
   * @function editCompany
   * @function submitCompany
   * @function submitEditCompany
   * @function getCompany
   *
  */
  //Selects company to edit
  editCompany(company: any) {
    // this.edit = true;
    this.selectedItem = company._id;
    this.editCompanyForm.patchValue({ companyName: company.companyName, abbreviation: company.abbreviation, GSTNumber: company.GSTNumber, address: company.address });
  }

  // Submit Consumable Location
  submitCompany() {
    const nameControl = this.createCompanyForm.get('companyName');
    const abbrControl = this.createCompanyForm.get('abbreviation');
    const GSTNumberControl = this.createCompanyForm.get('GSTNumber');
    const addressControl = this.createCompanyForm.get('address');

    if (nameControl && abbrControl) {

      // Trim required fields
      const nameValue = nameControl.value?.trim();
      const abbrValue = abbrControl.value?.trim();

      nameControl.setValue(nameValue);
      abbrControl.setValue(abbrValue);

      // Required validation
      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      if (!abbrValue) {
        abbrControl.setErrors({ required: true });
        return;
      }

      // Trim optional fields (no required validation)
      if (GSTNumberControl) {
        const gstValue = GSTNumberControl.value?.trim();
        GSTNumberControl.setValue(gstValue || '');
      }

      if (addressControl) {
        const addressValue = addressControl.value?.trim();
        addressControl.setValue(addressValue || '');
      }

      this.database.postCompany(this.createCompanyForm.value).subscribe({
        next: (data: any) => {
          if (data.success === true) {
            console.log('Company create response from DB:', data);
            this.getCompany();
            this.createCompanyForm.reset();
            document.getElementById('createModalCloseBtn')?.click();
          }
        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
    }
  }

  // Edit Consumable Location
  submitEditCompany() {

    const nameControl = this.editCompanyForm.get('companyName');
    const abbrControl = this.editCompanyForm.get('abbreviation');
    const GSTNumberControl = this.editCompanyForm.get('GSTNumber');
    const addressControl = this.editCompanyForm.get('address');

    if (nameControl && abbrControl) {

      // Trim required fields
      const nameValue = nameControl.value?.trim();
      const abbrValue = abbrControl.value?.trim();

      nameControl.setValue(nameValue);
      abbrControl.setValue(abbrValue);

      // Required validation
      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      if (!abbrValue) {
        abbrControl.setErrors({ required: true });
        return;
      }

      // Trim optional fields (NOT required)
      if (GSTNumberControl) {
        const gstValue = GSTNumberControl.value?.trim();
        GSTNumberControl.setValue(gstValue || '');
      }

      if (addressControl) {
        const addressValue = addressControl.value?.trim();
        addressControl.setValue(addressValue || '');
      }

      this.database.updateCompanyById(
        this.editCompanyForm.value,
        this.selectedItem
      ).subscribe({
        next: (data: any) => {
          if (data.success === true) {
            console.log('Company update response from DB:', data);
            this.getCompany();
            // this.edit = false;
            this.editCompanyForm.reset();
            document.getElementById('editModalCloseBtn')?.click();
          }

        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
    }
  }

  //It is used to get Company in consumable
  getCompany() {
    this.database.getCompanyNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.companies = res.data;
          console.log('Company list array:', this.companies);
        } else {
          console.warn('No Company data found or invalid response:', res);
          this.companies = [];
        }
      },
      error: (err) => {
        console.error('Error fetching company names:', err);
        this.companies = [];
      }
    });
  }



  /** ======================================================================================================================
   * Search function for consumable section setting
   *
  */


}

/**
 * <!-- <p>component-setting works!</p> -->
<div class="single-container">
  <div class="heading">
    <h4>Electronic Components</h4>
  </div>

  <div class="single-btn-container">
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.hardwareDepartment.electronicDevice.manage === 0}" data-bs-target="#exampleModal1">Manufacturer</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.hardwareDepartment.electronicDevice.manage === 0}" data-bs-target="#exampleModal2">Category</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.hardwareDepartment.electronicDevice.manage === 0}" data-bs-target="#exampleModal3">Supplier</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.hardwareDepartment.electronicDevice.manage === 0}" data-bs-target="#exampleModal4">Project</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.hardwareDepartment.electronicDevice.manage === 0}" data-bs-target="#exampleModal5">Shelf Location</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights?.adminDepartment?.consumableAsset?.manage === 0}" data-bs-target="#company">Company</button>
  </div>
</div>

<!-- Modal1 -->
<div class="modal modal-lg fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel"
  data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">MANUFACTURER</h5>
        <button type="button" id="closeModalCreate" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="clearModalForm()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container background-dark">

            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" class="align-middle background-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let manufacturer of manufacturersList; let i = index">
                  <th scope="row" class="align-middle col-1">
                    {{i+1}}
                  </th>
                  <td class="align-middle col-4">
                    {{manufacturer.name}}
                  </td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                      (click)="editManufacturer(manufacturer)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit == false">
              <form [formGroup]="createManufacturerForm" (ngSubmit)="submitManufacturer()">
                <div class="form-group">
                  <label>Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkManufacturerName()">
                  <small
                    *ngIf="createManufacturerForm.controls['name'].errors?.['required'] && createManufacturerForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createManufacturerForm.controls['name']?.errors?.['maxlength'] && createManufacturerForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="createManufacturerForm.controls['name'].errors?.['notUnique'] && createManufacturerForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit"
                    [disabled]="createManufacturerForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="edit-form-container" *ngIf="edit == true">
              <form [formGroup]="editManufacturerForm" (ngSubmit)="submitEditManufacturer()">
                <div class="form-group">
                  <label for="">Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (input)="checkEditManufacturerName()">
                  <small
                    *ngIf="editManufacturerForm.controls['name'].errors?.['required'] && editManufacturerForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="editManufacturerForm.controls['name']?.errors?.['maxlength'] && editManufacturerForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="editManufacturerForm.controls['name'].errors?.['notUnique'] && editManufacturerForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editManufacturerForm.invalid">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bs-dismiss="modal" (click)="clearModalForm()">Close</button>
      </div>
    </div>
  </div>
</div>
<!-- Modal1 -->

<!-- Modal2 -->
<div class="modal modal-lg fade" id="exampleModal2" tabindex="-1" aria-labelledby="exampleModalLabel"
  data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">CATEGORY</h5>
        <button type="button" id="closeModalCreate1" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="clearModalForm()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container background-dark">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" class="align-middle background-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let category of categoriesList; let i = index">
                  <th scope="row" class="align-middle col-1">
                    {{i+1}}
                  </th>
                  <td class="align-middle col-4">
                    {{category.name}}
                  </td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                      (click)="editCategory(category)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit == false">
              <form [formGroup]="createCategoryForm" (ngSubmit)="submitCategory()">
                <div class="form-group">
                  <label>Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkCategoryName()">
                  <small
                    *ngIf="createCategoryForm.controls['name'].errors?.['required'] && createCategoryForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createCategoryForm.controls['name']?.errors?.['maxlength'] && createCategoryForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="createCategoryForm.controls['name'].errors?.['notUnique'] && createCategoryForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label>Abbreviated Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="abbreviation"
                    (blur)="checkAbbreviatedName()">
                  <small
                    *ngIf="createCategoryForm.controls['abbreviation'].errors?.['required'] && createCategoryForm.controls['abbreviation'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createCategoryForm.controls['abbreviation']?.errors?.['maxlength'] && createCategoryForm.controls['abbreviation']?.touched"
                    class="error-message">
                    Abbreviation Name cannot exceed 6 characters.
                  </small>
                  <small
                    *ngIf="createCategoryForm.controls['abbreviation'].touched && createCategoryForm.controls['abbreviation'].errors?.['notUnique']"
                    class="error-message">
                    Abbreviation Name already exists !
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="createCategoryForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="edit-form-container" *ngIf="edit == true">
              <form [formGroup]="editCategoryForm" (ngSubmit)="submitEditCategory()">
                <div class="form-group">
                  <label for="">Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (input)="checkEditCategoryName()">
                  <small
                    *ngIf="editCategoryForm.controls['name'].errors?.['required'] && editCategoryForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="editCategoryForm.controls['name']?.errors?.['maxlength'] && editCategoryForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="editCategoryForm.controls['name'].errors?.['notUnique'] && editCategoryForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label>Edit Abbreviated Name <span class="required">*</span></label>
                  <input type="text" class="form-control" style="text-transform:uppercase"
                    formControlName="abbreviation" (blur)="checkEditAbbreviatedName()">
                  <small
                    *ngIf="editCategoryForm.controls['abbreviation'].errors?.['required'] && editCategoryForm.controls['abbreviation'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="editCategoryForm.controls['abbreviation']?.errors?.['maxlength'] && editCategoryForm.controls['abbreviation']?.touched"
                    class="error-message">
                    Abbreviation Name cannot exceed 6 characters.
                  </small>
                  <small
                    *ngIf="editCategoryForm.controls['abbreviation'].touched && editCategoryForm.controls['abbreviation'].errors?.['notUnique']"
                    class="error-message">
                    Abbreviation Name already exists !
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editCategoryForm.invalid">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bs-dismiss="modal" (click)="clearModalForm()">Close</button>
      </div>
    </div>
  </div>
</div>
<!-- Modal2 -->


<!-- Modal3 supplier-->
<div class="modal modal-lg fade" id="exampleModal3" tabindex="-1" aria-labelledby="exampleModalLabel"
  data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">SUPPLIER</h5>
        <button type="button" id="closeModalCreate2" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="clearModalForm()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container background-dark">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" class="align-middle background-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let supplier of suppliersList; let i = index">
                  <th scope="row" class="align-middle col-1">
                    {{i+1}}
                  </th>
                  <td class="align-middle col-4">
                    {{supplier.name}}
                  </td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                      (click)="editSupplier(supplier)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit === false">
              <form [formGroup]="createSupplierForm" (ngSubmit)="submitSupplier()">
                <div class="form-group">
                  <label>Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkSupplierName()">
                  <small
                    *ngIf="createSupplierForm.controls['name'].errors?.['required'] && createSupplierForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createSupplierForm.controls['name']?.errors?.['maxlength'] && createSupplierForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="createSupplierForm.controls['name'].errors?.['notUnique'] && createSupplierForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label for="contact">Telephone/Mobile No</label>
                  <input type="text" id="contact" class="form-control" formControlName="contact">
                  <div
                    *ngIf="createSupplierForm.controls['contact'].touched && (createSupplierForm.controls['contact'].invalid && createSupplierForm.controls['contact'].errors?.['pattern'])"
                    class="error-message">Please Enter a valid phone number
                  </div>
                </div>
                <div class="form-group">
                  <label>Supplier E-Mail</label>
                  <input type="email" class="form-control" formControlName="email">
                  <div
                    *ngIf="createSupplierForm.controls['email'].invalid && createSupplierForm.controls['email'].touched"
                    class="error-message">
                    Please enter a valid email address.
                  </div>
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" class="form-control" formControlName="address">
                </div>
                <div class="form-group">
                  <label>Type <span class="required">*</span></label>
                  <select class="form-select form-control" aria-label="Default select example" formControlName="type">
                    <option value="Local" class="type-option">Local</option>
                    <option value="Imported" class="type-option">Imported</option>
                  </select>
                  <small
                    *ngIf="createSupplierForm.controls['type'].errors?.['required'] && createSupplierForm.controls['type'].touched"
                    class="error-message">This
                    field is required
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="createSupplierForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="edit-form-container" *ngIf="edit === true">
              <form [formGroup]="editSupplierForm" (ngSubmit)="submitEditSupplier()">
                <div class="form-group">
                  <label for="">Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (input)="checkEditSupplierName()">
                  <small
                    *ngIf="editSupplierForm.controls['name'].errors?.['required'] && editSupplierForm.controls['name'].touched"
                    class="error-message">
                    This field is required
                  </small>
                  <small
                    *ngIf="editSupplierForm.controls['name']?.errors?.['maxlength'] && editSupplierForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="editSupplierForm.controls['name'].errors?.['notUnique'] && editSupplierForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label for="contact">Edit Telephone/Mobile No</label>
                  <input type="text" id="contact" class="form-control" formControlName="contact">
                  <div
                    *ngIf="editSupplierForm.controls['contact'].touched && (editSupplierForm.controls['contact'].invalid && editSupplierForm.controls['contact'].errors?.['pattern'])"
                    class="error-message">Please Enter a valid phone number
                  </div>
                </div>
                <div class="form-group">
                  <label>Edit E-Mail</label>
                  <input type="email" class="form-control" formControlName="email">
                  <div *ngIf="editSupplierForm.controls['email'].invalid && editSupplierForm.controls['email'].touched"
                    class="error-message">
                    Please enter a valid email address.
                  </div>
                </div>
                <div class="form-group">
                  <label for="">Edit Address</label>
                  <input type="text" class="form-control" formControlName="address">
                </div>
                <div class="form-group">
                  <label for="">Edit Types <span class="required">*</span></label>
                  <select class="form-select form-control" aria-label="Default select example" formControlName="type">
                    <option value="Local" class="type-option">Local</option>
                    <option value="Imported" class="type-option">Imported</option>
                  </select>
                  <small
                    *ngIf="editSupplierForm.controls['type'].errors?.['required'] && editSupplierForm.controls['type'].touched"
                    class="error-message">
                    This field is required
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editSupplierForm.invalid">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bs-dismiss="modal" (click)="clearModalForm()">Close</button>
      </div>
    </div>
  </div>
</div>
<!-- Modal3 -->


<!-- Modal4 project-->
<div class="modal modal-lg fade" id="exampleModal4" tabindex="-1" aria-labelledby="exampleModalLabel"
  data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">PROJECT</h5>
        <button type="button" id="closeModalCreate3" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="clearModalForm()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container background-dark">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" class="align-middle background-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let project of projectsList; let i = index">
                  <th scope="row" class="align-middle col-1">
                    {{i+1}}
                  </th>
                  <td class="align-middle col-4">
                    {{project.name}}
                  </td>

                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                      (click)="editProject(project)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit == false">
              <form [formGroup]="createProjectForm" (ngSubmit)="submitProject()">
                <div class="form-group">
                  <label>Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkProjectName()">
                  <small
                    *ngIf="createProjectForm.controls['name'].errors?.['required'] && createProjectForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createProjectForm.controls['name']?.errors?.['maxlength'] && createProjectForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="createProjectForm.controls['name'].errors?.['notUnique'] && createProjectForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label>Client Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="clientName">
                  <small
                    *ngIf="createProjectForm.controls['clientName'].errors?.['required'] && createProjectForm.controls['clientName'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createProjectForm.controls['clientName']?.errors?.['maxlength'] && createProjectForm.controls['clientName']?.touched"
                    class="error-message">
                    Client Name cannot exceed 30 characters.
                  </small>
                </div>
                <div class="form-group">
                  <label>Start Year <span class="required">*</span></label>
                  <input type="month" placeholder="MM/YYYY" class="form-control" formControlName="startYear">
                  <small
                    *ngIf="createProjectForm.controls['startYear'].errors?.['required'] && createProjectForm.controls['startYear'].touched"
                    class="error-message">This
                    field is required
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="createProjectForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="edit-form-container" *ngIf="edit == true">
              <form [formGroup]="editProjectForm" (ngSubmit)="submitEditProject()">
                <div class="form-group">
                  <label for="">Edit Project Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkEditProjectName()">
                  <small
                    *ngIf="editProjectForm.controls['name'].errors?.['required'] && editProjectForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="editProjectForm.controls['name']?.errors?.['maxlength'] && editProjectForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="editProjectForm.controls['name'].errors?.['notUnique'] && editProjectForm.controls['name'].touched"
                    class="error-message">
                    Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label for="">Edit Client Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="clientName">
                  <small
                    *ngIf="editProjectForm.controls['clientName'].errors?.['required'] && editProjectForm.controls['clientName'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="editProjectForm.controls['clientName']?.errors?.['maxlength'] && editProjectForm.controls['clientName']?.touched"
                    class="error-message">
                    Client Name cannot exceed 30 characters.
                  </small>
                </div>
                <div class="form-group">
                  <label for="">Edit Start Year <span class="required">*</span></label>
                  <input type="month" placeholder="MM/YYYY" class="form-control" formControlName="startYear">
                  <small
                    *ngIf="editProjectForm.controls['startYear'].errors?.['required'] && editProjectForm.controls['startYear'].touched"
                    class="error-message">This
                    field is required
                  </small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editProjectForm.invalid">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bs-dismiss="modal" (click)="clearModalForm()">Close</button>
      </div>
    </div>
  </div>
</div>
<!-- Modal4 -->


<!-- Moda5 shelf Location-->
<div class="modal modal-lg fade" id="exampleModal5" tabindex="-1" aria-labelledby="exampleModalLabel"
  data-bs-backdrop="static" data-bs-keyboard="false" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">SHELF LOCATION</h5>
        <button type="button" id="closeModalCreate4" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="clearModalForm()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container background-dark">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" class="align-middle background-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let shelf of shelfList; let i = index">
                  <th scope="row" class="align-middle col-1">
                    {{i+1}}
                  </th>
                  <td class="align-middle col-4">
                    {{shelf.shelfName}}
                  </td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                      (click)="editShelfLocation(shelf)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit == false">
              <form [formGroup]="createShelfForm" (ngSubmit)="submitShelf()">
                <div class="form-group">
                  <label>Shelf Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkShelfName()">
                  <small
                    *ngIf="createShelfForm.controls['name'].errors?.['required'] && createShelfForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="createShelfForm.controls['name']?.errors?.['maxlength'] && createShelfForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="createShelfForm.controls['name'].errors?.['notUnique'] && createShelfForm.controls['name'].touched"
                    class="error-message">
                    Shelf Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label>Shelf Location</label>
                  <input type="text" class="form-control" formControlName="shelfLocation">
                  <small
                    *ngIf="createShelfForm.controls['shelfLocation']?.errors?.['maxlength'] && createShelfForm.controls['shelfLocation']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                </div>
                <div class="form-group">
                  <label>Box Names <span class="required">*</span></label>
                  <div class="input-group mb-3">
                    <input type="text" class="form-control" formControlName="boxName">
                    <button class="btn btn-add" type="button" (click)="addBoxValue()">Add</button>
                  </div>
                  <div class="error-message"
                    *ngIf="createShelfForm.controls['boxName'].touched && this.boxArray.length === 0">
                    <small>Please enter atleast one box name</small>
                  </div>
                </div>
                <ul class="wrapper">
                  <li *ngFor="let box of boxArray; let i = index" class="list"><img
                      src="../../../assets/icons/cross.svg" alt="cross icon" class="cross-icon"
                      (click)="removeBoxValue(i)"> {{box.name}}</li>
                </ul>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit"
                    [disabled]="createShelfForm.invalid || boxArray.length === 0">Submit</button>
                </div>
              </form>
            </div>
            <div class="edit-form-container" *ngIf="edit == true">
              <form [formGroup]="editShelfForm" (ngSubmit)="submitEditShelfLocation()">
                <div class="form-group">
                  <label for="">Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="name" (blur)="checkEditShelfName()">
                  <small
                    *ngIf="editShelfForm.controls['name'].errors?.['required'] && editShelfForm.controls['name'].touched"
                    class="error-message">This
                    field is required
                  </small>
                  <small
                    *ngIf="editShelfForm.controls['name']?.errors?.['maxlength'] && editShelfForm.controls['name']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                  <small
                    *ngIf="editShelfForm.controls['name'].errors?.['notUnique'] && editShelfForm.controls['name'].touched"
                    class="error-message">
                    Shelf Name already exists !
                  </small>
                </div>
                <div class="form-group">
                  <label for="">Edit Shelf Location</label>
                  <input type="text" class="form-control" formControlName="shelfLocation">
                  <small
                    *ngIf="editShelfForm.controls['shelfLocation']?.errors?.['maxlength'] && editShelfForm.controls['shelfLocation']?.touched"
                    class="error-message">
                    Name cannot exceed 30 characters.
                  </small>
                </div>
                <div class="form-group">
                  <label>Edit Box Names <span class="required">*</span></label>
                  <div class="input-group mb-3">
                    <input type="text" class="form-control" formControlName="boxName">
                    <button class="btn btn-add" type="button" (click)="addEditBoxValue()">Add</button>
                  </div>
                  <div class="error-message"
                    *ngIf="editShelfForm.controls['boxName'].touched && this.boxEditArray.length === 0">
                    <small>Please enter atleast one box name</small>
                  </div>
                </div>

                <ul class="wrapper">
                  <li *ngFor="let editBox of boxEditArray; let i = index" class="list"><img
                      src="../../../assets/icons/cross.svg" alt="cross icon" class="cross-icon"
                      (click)="removeEditBoxValue(i)"> {{editBox.name}}</li>
                </ul>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit"
                    [disabled]="editShelfForm.invalid || this.boxEditArray.length === 0">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bs-dismiss="modal" (click)="clearModalForm()">Close</button>
      </div>
    </div>
  </div>
</div>
<!-- Modal5 -->

<!-- Modal3 Company-->
<div class="modal modal-xl fade" id="company" tabindex="-1" aria-labelledby="companyModalLabel" aria-hidden="true"
  data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="companyModalLabel">Company</h5>
        <button type="button" id="closeModalCreate8" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="pageRefresh()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-9 table-container">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Company Name</th>
                  <th scope="col" class="align-middle background-dark">Abbreviation</th>
                  <th scope="col" class="align-middle background-dark">GST Number</th>
                  <th scope="col" class="align-middle background-dark">Address</th>
                  <th scope="col" colspan="2" class="align-middle background-dark">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let company of companies; let i = index">
                  <th scope="row" class="align-middle col-1">{{i+1}}</th>
                  <td class="align-middle col-3">{{company?.companyName || '--'}}</td>
                  <td class="align-middle col-2">{{company?.abbreviation || '--'}}</td>
                  <td class="align-middle col-3">{{company?.GSTNumber || '--'}}</td>
                  <td class="align-middle col-3">{{company?.address || '--'}}</td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons" (click)="editCompany(company)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-3">
            <div class="create-form-container" *ngIf="edit === false">
              <form [formGroup]="createCompanyForm" (ngSubmit)="submitCompany()">
                <div class="col">
                  <!-- Company Name -->
                  <div class="col-md-12 form-group">
                    <label>Company Name
                      <span class="required">*</span>
                    </label>
                    <input type="text" class="form-control" formControlName="companyName">
                    <small class="error-message" *ngIf="createCompanyForm.controls['companyName'].errors?.['required'] && createCompanyForm.controls['companyName'].touched">This field is Required</small>
                    <small class="error-message" *ngIf="createCompanyForm.controls['companyName'].errors?.['notUnique']">Company name is already exist!</small>
                  </div>

                  <!-- Company Abbreviation -->
                  <div class="col-md-12 form-group">
                    <label> Abbreviation
                      <span class="required">*</span>
                    </label>
                    <input type="text" class="form-control" formControlName="abbreviation">
                    <small class="error-message" *ngIf="createCompanyForm.controls['abbreviation'].errors?.['required'] && createCompanyForm.controls['abbreviation'].touched">This field is Required</small>
                    <small class="error-message" *ngIf="createCompanyForm.controls['abbreviation'].errors?.['notUnique']">Company Abbreviation is already exist!</small>
                  </div>

                  <!-- GST Number -->
                  <div class="col-md-12 form-group">
                    <label> GST Number
                      <!-- <span class="required">*</span> -->
                    </label>
                    <input type="text" class="form-control" formControlName="GSTNumber">
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['GSTNumber'].errors?.['required'] && createCompanyForm.controls['GSTNumber'].touched">This field is Required</small> -->
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['GSTNumber'].errors?.['notUnique']">Company name is already exist!</small> -->
                  </div>

                  <!-- Address -->
                  <div class="col-md-12 form-group">
                    <label> Address
                      <!-- <span class="required">*</span> -->
                    </label>
                    <input type="text" class="form-control" formControlName="address">
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['address'].errors?.['required'] && createCompanyForm.controls['address'].touched">This field is Required</small> -->
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['address'].errors?.['notUnique']">Company name is already exist!</small> -->
                  </div>

                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]=" createCompanyForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="create-form-container" *ngIf="edit ===  true">
              <form [formGroup]="editCompanyForm" (ngSubmit)="submitEditCompany()">
                <div class="col">

                  <!-- Edit Company Name -->
                  <div class="col-md-12 form-group">
                    <label>Edit Company Name <span class="required">*</span></label>
                    <input type="text" class="form-control" formControlName="companyName">
                    <small class="error-message" *ngIf="editCompanyForm.controls['companyName'].errors?.['required'] && editCompanyForm.controls['companyName'].touched">This field is Required</small>
                    <small class="error-message" *ngIf="editCompanyForm.controls['companyName'].errors?.['notUnique']">Company name is already exist!</small>
                  </div>

                  <!-- Edit Abbreviation -->
                  <div class="col-md-12 form-group">
                    <label>Edit Abbreviation
                      <span class="required">*</span>
                    </label>
                    <input type="text" class="form-control" formControlName="abbreviation">
                    <small class="error-message" *ngIf="editCompanyForm.controls['abbreviation'].errors?.['required'] && editCompanyForm.controls['abbreviation'].touched">This field is Required</small>
                    <small class="error-message" *ngIf="editCompanyForm.controls['abbreviation'].errors?.['notUnique']">Company Abbreviation is already exist!</small>
                  </div>

                  <!-- GST Number -->
                  <div class="col-md-12 form-group">
                    <label> GST Number
                      <!-- <span class="required">*</span> -->
                    </label>
                    <input type="text" class="form-control" formControlName="GSTNumber">
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['GSTNumber'].errors?.['required'] && createCompanyForm.controls['GSTNumber'].touched">This field is Required</small> -->
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['GSTNumber'].errors?.['notUnique']">Company name is already exist!</small> -->
                  </div>

                  <!-- Address -->
                  <div class="col-md-12 form-group">
                    <label> Address
                      <!-- <span class="required">*</span> -->
                    </label>
                    <input type="text" class="form-control" formControlName="address">
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['address'].errors?.['required'] && createCompanyForm.controls['address'].touched">This field is Required</small> -->
                    <!-- <small class="error-message" *ngIf="createCompanyForm.controls['address'].errors?.['notUnique']">Company name is already exist!</small> -->
                  </div>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editCompanyForm.invalid">Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn" data-bs-dismiss="modal" (click)="pageRefresh()">Close</button>
      </div>
    </div>
  </div>
</div>
*/
