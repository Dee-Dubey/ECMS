import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { TrimRequiredValidator, TrimAndRemoveSpaces, atLeastOneCheckboxChecked } from 'src/app/validators/custom-validator.validator';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-inventory-setting',
  templateUrl: './inventory-setting.component.html',
  styleUrls: ['./inventory-setting.component.css']
})
export class InventorySettingComponent implements OnInit {

  mode: 'create' | 'edit' = 'create';
  Object = Object;
  userRights: any

  suppliers: any;
  manufacturers: any;
  companies: any;

  statusMessage = '';
  statusType: 'success' | 'error' | 'warning' | '' = '';
  loading = false;

  selectAll: boolean = false;
  selectedRows: any[] = [];
  searchText: string = '';
  activeSection: string = 'category';
  setActive(section: string) {
    this.activeSection = section;
  }

  subcategories: any = [];
  selectedCategory: string = '';
  newCategory: string = '';
  inCategoriesList: any = []

  edit: boolean = false;
  selectedItem: any;
  isEmpty: boolean = false
  create: boolean = false;
  selectedPrefix: any;
  selectedSuffix: any;
  selectedNumbericDigit: any;

  //FormGroup variable declaration
  createCategoryForm: FormGroup;
  editCategoryForm: FormGroup;
  createSubCategoryForm: FormGroup;
  createSupplierForm: FormGroup;
  editSupplierForm: FormGroup;
  createManufacturerForm: FormGroup;
  editManufacturerForm: FormGroup;
  createCompanyForm: FormGroup;
  editCompanyForm: FormGroup;

  checkboxLabels: Record<string, string> = {
    purchaseDate: 'Purchase Date',
    warrantyDate: 'Warranty Date',
    modelNo: 'Model No',
    inputVoltage: 'Input Voltage',
    key: 'Key',
    subscriptionStart: 'Subscription Start',
    subscriptionEnd: 'Subscription End',
    cpu: 'CPU',
    ram: 'RAM',
    drive: 'Drive',
    systemConfig: 'System Configuration',
    licenseInEff: 'License In Effect',
    msEffect: 'MS Effect',
    ipAddress: 'IP Address',
    internetAccess: 'Internet Access',
    softwareInstalled: 'Software Installed',
    lastUse: 'Last Use',
    description: 'Description'
  };

  constructor(private database: DatabaseService, private router: Router, private authCtx: SessionstorageService) {

    // Create IT category form
    this.createCategoryForm = new FormGroup({
      name: new FormControl('', [Validators.required])
    });

    // Edit category form
    this.editCategoryForm = new FormGroup({
      name: new FormControl('', [Validators.required])
    });

    // subcategory
    this.createSubCategoryForm = new FormGroup({
      checkedAll: new FormControl(false),
      categoryName: new FormControl('', [Validators.required]),
      subCategoryName: new FormControl('', [TrimRequiredValidator()]),
      prefix: new FormControl('', [TrimAndRemoveSpaces()]),
      suffix: new FormControl('', [TrimAndRemoveSpaces()]),
      numbericDigit: new FormControl(3, [TrimRequiredValidator()]),
      // Group all checkbox fields here
      checkboxes: new FormGroup(
        {
          purchaseDate: new FormControl(false),
          warrantyDate: new FormControl(false),
          modelNo: new FormControl(false),
          inputVoltage: new FormControl(false),
          key: new FormControl(false),
          subscriptionStart: new FormControl(false),
          subscriptionEnd: new FormControl(false),
          cpu: new FormControl(false),
          ram: new FormControl(false),
          drive: new FormControl(false),
          systemConfig: new FormControl(false),
          licenseInEff: new FormControl(false),
          msEffect: new FormControl(false),
          ipAddress: new FormControl(false),
          internetAccess: new FormControl(false),
          softwareInstalled: new FormControl(false),
          lastUse: new FormControl(false),
          description: new FormControl(false),
        },
        { validators: [atLeastOneCheckboxChecked()] }
      ),
    });

    // Create Supplier in IT-Inventory
    this.createSupplierForm = new FormGroup({
      supplierName: new FormControl('', [TrimRequiredValidator()]),
      contact: new FormControl('', [Validators.pattern(/^\+?\d{8,14}$/)]),
      email: new FormControl('', [Validators.email]),
      address: new FormControl(''),
      type: new FormControl(''),
    });

    //Edit Supplier in IT-Inventory
    this.editSupplierForm = new FormGroup({
      supplierName: new FormControl('', [TrimRequiredValidator()]),
      contact: new FormControl('', [Validators.pattern(/^\+?\d{8,14}$/)]),
      email: new FormControl('', [Validators.email]),
      address: new FormControl(''),
      type: new FormControl(''),
    });

    //Create manufacturer
    this.createManufacturerForm = new FormGroup({
      manufacturerName: new FormControl('', [TrimRequiredValidator()])
    });

    //Edit Manufacturer
    this.editManufacturerForm = new FormGroup({
      manufacturerName: new FormControl('', [TrimRequiredValidator()])
    });

    // Create Company
    this.createCompanyForm = new FormGroup({
      companyName: new FormControl('', [TrimRequiredValidator()]),
      abbreviation: new FormControl('', [TrimRequiredValidator()]),
      GSTNumber: new FormControl(''),
      address: new FormControl()
    });

    // Edit Company
    this.editCompanyForm = new FormGroup({
      companyName: new FormControl('', [TrimRequiredValidator()]),
      abbreviation: new FormControl('', [TrimRequiredValidator()]),
      GSTNumber: new FormControl(''),
      address: new FormControl()
    });

  }

  ngOnInit(): void {
    this.getITSupplier();
    this.getITManufacturer();
    this.getITSubCategory();
    this.getAllITCategory();
    this.getCompany();

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { rights } = ctx;
      this.userRights = rights || {}
    });

  }

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
  getCurrentData(): any[] {

    switch (this.activeSection) {

      case 'category':
        return this.inCategoriesList || [];

      case 'sub-category':
        return this.subcategories || [];

      case 'supplier':
        return this.suppliers || [];

      case 'manufacturer':
        return this.manufacturers || [];

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

        case 'category':
          return item.name?.toString().toLowerCase().includes(search);

        case 'sub-category':
          return (
            item.categoryName.name?.toString().toLowerCase().includes(search) ||
            item.subCategoryName?.toString().toLowerCase().includes(search) ||
            item.prefix?.toString().toLowerCase().includes(search) ||
            item.numbericDigit?.toString().toLowerCase().includes(search) ||
            item.suffix?.toString().toLowerCase().includes(search)
          );

        case 'supplier':
          return (
            item.supplierName?.toString().toLowerCase().includes(search) ||
            item.contact?.toString().toLowerCase().includes(search) ||
            item.email?.toString().toLowerCase().includes(search) ||
            item.address?.toLowerCase().includes(search) ||
            item.type?.toString().toLowerCase().includes(search)
          );

        case 'manufacturer':
          return item.name?.toString().toLowerCase().includes(search);

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
  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.selectAll = isChecked;

    if (isChecked) {
      this.selectedRows = [...this.filteredData];
    } else {
      this.selectedRows = [];
    }
  }

  //
  toggleRowSelection(item: any, event: any) {

    const isChecked = event.target.checked;

    if (isChecked) {
      if (!this.selectedRows.includes(item)) {
        this.selectedRows.push(item);
      }
    } else {
      this.selectedRows = this.selectedRows.filter(
        row => row !== item
      );
    }

    // Update Select All checkbox correctly
    this.selectAll =
      this.filteredData.length > 0 &&
      this.selectedRows.length === this.filteredData.length;
  }

  //
  exportToExcel(): void {

    const data = this.selectedRows.length > 0
      ? this.selectedRows
      : this.filteredData;

    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    let exportData: any[] = [];

    switch (this.activeSection) {

      // ================= CATEGORY =================
      case 'category':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Category Name': item.name
        }));
        break;

      // ================= SUB-CATEGORY =================
      case 'sub-category':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Category Name': item.categoryName?.name,
          'Sub-Category': item.subCategoryName,
          'Prefix': item.prefix,
          'Numeric Digit': item.numbericDigit,
          'Suffix': item.suffix
        }));
        break;

      // ================= SUPPLIER =================
      case 'supplier':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Supplier Name': item.supplierName,
          'Contact': item.contact ? item.contact.toString() : '',
          'Email': item.email,
          'Address': item.address,
          'Type': item.type
        }));
        break;

      // ================= MANUFACTURER =================
      case 'manufacturer':
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Manufacturer Name': item.name
        }));
        break;

      // ================= COMPANY =================
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

    const header = Object.keys(exportData[0]);

    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

    // Auto column width
    worksheet['!cols'] = header.map(key => ({
      wch: Math.max(
        key.length,
        ...exportData.map(row => (row[key] ? row[key].toString().length : 10))
      ) + 2
    }));

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Light Grey Header Styling
    header.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });

      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "000000" } },
        fill: { fgColor: { rgb: "E7E6E6" } }, // Light Grey
        alignment: { horizontal: "center", vertical: "center" }
      };
    });

    // Prevent scientific format for Contact
    if (this.activeSection === 'supplier') {

      const contactColIndex = header.indexOf('Contact');

      if (contactColIndex !== -1) {
        for (let rowIndex = 1; rowIndex <= exportData.length; rowIndex++) {

          const cellAddress = XLSX.utils.encode_cell({
            r: rowIndex,
            c: contactColIndex
          });

          if (worksheet[cellAddress]) {
            worksheet[cellAddress].t = 's';
            worksheet[cellAddress].z = '@';
          }
        }
      }
    }

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Report': worksheet },
      SheetNames: ['Report']
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const today = new Date().toISOString().split('T')[0];
    const fileName = `AIMS-IT-${this.activeSection}-${today}.xlsx`;

    FileSaver.saveAs(blob, fileName);

    // Reset selection after export
    this.selectedRows = [];
    this.selectAll = false;
  }

  //This is used page refresh
  pageRefresh() {
    window.location.reload()
  }

  /**
   * ======================================================================================================================
   * Category Section for all require function
   * @function
   * @function
   * @function
   * @function
   * @function
   *
  */
  //This is used to get all the categories
  getAllITCategory() {
    this.database.getITCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          // Store both formats for flexible use
          this.inCategoriesList = res.data.list; // Array form
        } else {
          this.inCategoriesList = [];
        }

        console.log('categoryList:', this.inCategoriesList);
      },
      error: (err) => {
        console.error('Failed to fetch IT category name list:', err);
        this.inCategoriesList = [];
      }
    });

  }

  //This is used to submit category
  submitCategory() {
    let nameControl = this.createCategoryForm.get('name');
    if (nameControl && typeof nameControl.value === 'string') {
      let nameValue = nameControl.value.trim();
      nameControl.setValue(nameValue);
      if (!nameValue) {
        nameControl?.setErrors({ required: true })
        return
      }
      this.database.postITCategory(this.createCategoryForm.value).subscribe((data: any) => {
        console.log(data)
        if (data.message === 'success') {
          this.getAllITCategory();
          document.getElementById('createModalCloseBtn')?.click();
        }
      })
    }
  }

  //This select the particular category for edit
  editCategory(category: any) {
    this.edit = true;
    this.selectedItem = ''
    this.selectedItem = category._id;
    this.editCategoryForm.get('name')?.patchValue(category.name)
  }

  //This is used to submit edit category
  submitEditCategory() {
    let nameControl = this.editCategoryForm.get('name');
    if (nameControl && typeof nameControl.value === 'string') {
      let nameValue = nameControl.value.trim();
      nameControl.setValue(nameValue);
      if (!nameValue) {
        nameControl.setErrors({ required: true })
        return;
      }

      this.database.updateITCategoryById(this.editCategoryForm.value, this.selectedItem).subscribe((data: any) => {
        console.log(data)
        if (data.message) {
          this.getAllITCategory()
          this.edit = false;
          this.create = true;
          this.createCategoryForm.reset()
        }
      })

    }
  }

  //This is used to check edit category name
  checkEditCategoryName() {
    const nameControl = this.editCategoryForm.get('name');
    const nameValue = nameControl?.value.trim();

    console.log("check edit category name", nameValue);
    nameControl?.setValue(nameValue)
    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }
    this.database.checkEditITCategoryName(nameValue).subscribe((data: any) => {
      if (data && data.isUnique === false) {
        this.editCategoryForm.get('name')?.setErrors({ notUnique: true })
      }
    })
  }

  //This is used to check category name
  checkITCategoryname() {
    const nameControl = this.createCategoryForm.get('name');
    const nameValue = nameControl?.value.trim();
    nameControl?.setValue(nameValue)

    if (!nameValue) {
      nameControl?.setErrors({ required: true });
      return;
    }

    this.database.checkItCategoryName(nameValue).subscribe((data: any) => {
      if (data && data.isUnique === false) {
        this.createCategoryForm.get('name')?.setErrors({ notUnique: true })
      }
    })
  }

  /**
   * ======================================================================================================================
   * Sub-Category Section for all require function
   * @function
   * @function
   * @function
   * @function
   * @function
   *
  */
  //This is used to get sub-category in IT-Inventory
  getITSubCategory(): void {
    this.database.getITSubCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.subcategories = res.data.list || [];
        } else {
          console.warn('No subcategories found or invalid response:', res);
          this.subcategories = [];
        }
        console.log('Subcategories loaded:', this.subcategories);
      },
      error: (err) => {
        console.error('Error fetching subcategory data:', err);
        this.subcategories = [];
      }
    });
  }

  toggleAllCheckboxes(event: any): void {
    const checked = event.target.checked;
    const checkboxes = this.createSubCategoryForm.get('checkboxes') as FormGroup;
    Object.keys(checkboxes.controls).forEach(key => {
      checkboxes.get(key)?.setValue(checked);
    });
  }

  onCheckboxChange(): void {
    const checkboxes = this.createSubCategoryForm.get('checkboxes') as FormGroup;
    const allChecked = Object.values(checkboxes.value).every(v => v === true);
    this.createSubCategoryForm.get('checkedAll')?.setValue(allChecked, { emitEvent: false });
  }

  onSubCategorySubmit() {
    if (this.createSubCategoryForm.invalid) return;
    const formData = this.createSubCategoryForm;
    if (this.mode === 'create') {
      this.submitSubCategory(formData);
    } else {
      this.submitEditSubCategory(formData);
    }
  }

  submitSubCategory(formData: any) {
    if (formData.invalid) {
      this.statusMessage = 'Please fill all required fields correctly.';
      this.statusType = 'warning';
      return;
    }
    this.loading = true;
    this.statusMessage = '';
    this.statusType = '';


    const subCategory = {
      categoryName: formData.value.categoryName.trim(),
      subCategoryName: formData.value.subCategoryName.trim(),
      prefix: formData.value.prefix.toUpperCase(),
      numbericDigit: formData.value.numbericDigit,
      suffix: formData.value.suffix.toUpperCase(),
      sequenceId: 0,
      fields: {
        purchaseDate: formData.value.checkboxes.purchaseDate,
        warrantyDate: formData.value.checkboxes.warrantyDate,
        modelNo: formData.value.checkboxes.modelNo,
        inputVoltage: formData.value.checkboxes.inputVoltage,
        key: formData.value.checkboxes.key,
        subscriptionStart: formData.value.checkboxes.subscriptionStart,
        subscriptionEnd: formData.value.checkboxes.subscriptionEnd,
        cpu: formData.value.checkboxes.cpu,
        ram: formData.value.checkboxes.ram,
        drive: formData.value.checkboxes.drive,
        systemConfig: formData.value.checkboxes.systemConfig,
        licenseInEff: formData.value.checkboxes.licenseInEff,
        msEffect: formData.value.checkboxes.msEffect,
        ipAddress: formData.value.checkboxes.ipAddress,
        internetAccess: formData.value.checkboxes.internetAccess,
        softwareInstalled: formData.value.checkboxes.softwareInstalled,
        lastUse: formData.value.checkboxes.lastUse,
        description: formData.value.checkboxes.description
      }
    };

    this.database.postSubCategory(subCategory).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.statusMessage = 'Sub-category created successfully.';
        this.statusType = 'success';

        setTimeout(() => {
          $('#closeModalCreate6').click();
          formData.reset();
          this.statusMessage = '';
          document.getElementById('createModalCloseBtn')?.click();
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        switch (err.status) {
          case 409:

            this.statusMessage = 'Suffix already exists.';
            this.statusType = 'warning';
            // form.get('prefix')?.setErrors({ alreadyExists: true });
            formData.get('subCategoryName')?.setErrors({ alreadyExists: true });
            formData.get('suffix')?.setErrors({ alreadyExists: true });
            break;
          case 400:
            this.statusMessage = 'Invalid data. Please check your input.';
            this.statusType = 'warning';
            break;
          case 500:
            this.statusMessage = 'Internal server error. Please try again.';
            this.statusType = 'error';
            break;
          default:
            this.statusMessage = 'Server not responding. Please try again later.';
            this.statusType = 'error';
        }
        console.error('Error:', err);
      }
    });

  }

  //This is used to submit Edit subcategory
  submitEditSubCategory(formData: any) {
    let editSubcategory = {
      categoryName: formData.value.categoryName,
      subCategoryName: formData.value.subCategoryName,

      fields: {
        purchaseDate: formData.value.checkboxes.purchaseDate,
        warrantyDate: formData.value.checkboxes.warrantyDate,
        modelNo: formData.value.checkboxes.modelNo,
        // serialNo: this.editSubCategoryForm.value.serialNo,
        inputVoltage: formData.value.checkboxes.inputVoltage,
        key: formData.value.checkboxes.key,
        subscriptionStart: formData.value.checkboxes.subscriptionStart,
        subscriptionEnd: formData.value.checkboxes.subscriptionEnd,
        cpu: formData.value.checkboxes.cpu,
        ram: formData.value.checkboxes.ram,
        drive: formData.value.checkboxes.drive,
        systemConfig: formData.value.checkboxes.systemConfig,
        licenseInEff: formData.value.checkboxes.licenseInEff,
        msEffect: formData.value.checkboxes.msEffect,
        ipAddress: formData.value.checkboxes.ipAddress,
        internetAccess: formData.value.checkboxes.internetAccess,
        softwareInstalled: formData.value.checkboxes.softwareInstalled,
        lastUse: formData.value.checkboxes.lastUse,
        description: formData.value.checkboxes.description
      }
    }
    this.database.editSubcategory(editSubcategory, this.selectedItem).subscribe({
      next: (res: any) => {
        console.log('response', res)
        this.loading = false;
        this.statusMessage = 'Sub-category created successfully.';
        this.statusType = 'success';

        setTimeout(() => {
          $('#closeModalCreate6').click();
          formData.reset();
          this.statusMessage = '';
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        switch (err.status) {
          case 409:

            this.statusMessage = 'Suffix already exists.';
            this.statusType = 'warning';
            formData.get('subCategoryName')?.setErrors({ alreadyExists: true });
            break;
          case 400:
            this.statusMessage = 'Invalid data. Please check your input.';
            this.statusType = 'warning';
            break;
          case 500:
            this.statusMessage = 'Internal server error. Please try again.';
            this.statusType = 'error';
            break;
          default:
            this.statusMessage = 'Server not responding. Please try again later.';
            this.statusType = 'error';
        }
        console.error('Error:', err);
      }
    });
  }

  //Select subcategory to edit
  editSubCategory(subCategory: any) {
    console.log('sub category', subCategory.categoryName.name)
    this.mode = 'edit'
    if (this.mode === 'edit') {
      this.createSubCategoryForm.get('prefix')?.disable()
      this.createSubCategoryForm.get('suffix')?.disable()
      this.createSubCategoryForm.get('numbericDigit')?.disable()
      this.createSubCategoryForm.get('categoryName')?.disable()
    }

    this.selectedItem = subCategory._id;
    this.createSubCategoryForm.patchValue({
      categoryName: subCategory.categoryName._id,
      subCategoryName: subCategory.subCategoryName,
      prefix: subCategory.prefix,
      suffix: subCategory.suffix,
      numbericDigit: subCategory.numbericDigit,
      checkboxes: subCategory.fields
    });

    let checkboxesGroup = this.createSubCategoryForm.get('checkboxes') as FormGroup
    let allchecked = Object.values(checkboxesGroup.value).every(v => v === true)
    this.createSubCategoryForm.get('checkedAll')?.setValue(allchecked, { emitEvent: false })
  }

  //This is used to check subcategory name
  checkSubCategoryName() {
    const subCategoryNameControl = this.createSubCategoryForm.get('subCategoryName');

    const subcategoryNameValue = subCategoryNameControl?.value.trim();
    subCategoryNameControl?.setValue(subcategoryNameValue)

    if (!subcategoryNameValue) {
      subCategoryNameControl?.setErrors({ required: true });
      return;
    }

    this.database.checkSubCategoryName(subcategoryNameValue).subscribe((data: any) => {
      if (data === false) {
        subCategoryNameControl?.setErrors({ notUnique: true });
        return;
      }
    })
  }


  //This is used to delete subcategory
  deleteSubCategory(subcategoryId: any) {
    this.database.deleteSubCategory(subcategoryId).subscribe((data: any) => {
      if (data.message) {
        this.edit = false
        this.getITSubCategory()
      }
    });
  }

  /**
   * ======================================================================================================================
   * Supplier Section for all require function
   * @function
   * @function
   * @function
   * @function
   * @function
   *
  */
  //It is used to get suppliers in IT-Inventory
  getITSupplier() {
    this.database.getITSupplierNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.suppliers = res.data.list;
          console.log('IT: Supplier list array:', this.suppliers);
        } else {
          console.warn('No supplier data found or invalid response:', res);
          this.suppliers = [];
        }
      },
      error: (err) => {
        console.error('Error fetching supplier names:', err);
        this.suppliers = [];
      }
    });
  }

  //This is used to submit supplier in IT-Inventory
  submitSupplier() {

    if (this.createSupplierForm.invalid) {
      this.createSupplierForm.markAllAsTouched();
      return;
    }

    const supplierNameControl = this.createSupplierForm.get('supplierName');
    const supplierNameValue = supplierNameControl?.value?.trim();

    supplierNameControl?.setValue(supplierNameValue);

    this.database.postInventorySupplier(this.createSupplierForm.value)
      .subscribe((data: any) => {

        if (data.message) {
          this.getITSupplier();
          this.createSupplierForm.reset();
          this.createSupplierForm.get('type')?.setValue('Local');
          document.getElementById('createModalCloseBtn')?.click();
        }

      });
  }

  //This is used to select supplier for edit
  editSupplier(supplier: any) {
    this.edit = true
    this.selectedItem = supplier._id;
    // this.editSupplierForm.get('supplierName')?.patchValue(supplier.supplierName)

    this.editSupplierForm.get('supplierName')?.patchValue(supplier.supplierName)
    this.editSupplierForm.get('contact')?.patchValue(supplier.contact)
    this.editSupplierForm.get('email')?.patchValue(supplier.email)
    this.editSupplierForm.get('address')?.patchValue(supplier.address)
    this.editSupplierForm.get('type')?.patchValue(supplier.type)
  }

  //Submit Edit Supplier
  submitEditSupplier() {

    if (this.editSupplierForm.invalid) {
      this.editSupplierForm.markAllAsTouched();
      return;
    }

    const supplierNameControl = this.editSupplierForm.get('supplierName');
    const supplierNameValue = supplierNameControl?.value?.trim();

    supplierNameControl?.setValue(supplierNameValue);

    this.database.editInventorySupplier(
      this.editSupplierForm.value,
      this.selectedItem
    ).subscribe((data: any) => {

      if (data.message) {
        this.edit = false;
        this.getITSupplier();
        this.editSupplierForm.reset();
        document.getElementById('editModalCloseBtn')?.click();
      }

    });
  }

  //This is used to check supplier
  checkSupplier() {
    const supplierNameControl = this.createSupplierForm.get('supplierName');
    const supplierNameValue = supplierNameControl?.value.trim();
    supplierNameControl?.setValue(supplierNameValue);

    if (!supplierNameValue) {
      supplierNameControl?.setErrors({ required: true });
      return;
    }

    this.database.checkSupplierInDatabase(supplierNameValue).subscribe((data: any) => {
      if (data === false) {
        this.createSupplierForm.get('supplierName')?.setErrors({ notUnique: true });
      }
    })
  }

  //This is used to check edit supplier
  checkEditSupplierName() {
    const supplierNameControl = this.editSupplierForm.get('supplierName');
    const supplierNameValue = supplierNameControl?.value.trim();
    supplierNameControl?.setValue(supplierNameValue)

    if (!supplierNameValue) {
      supplierNameControl?.setErrors({ required: true });
      return;
    }

    this.database.checkEditSupplierInDatabase(supplierNameValue).subscribe((data: any) => {
      console.log(data)
      if (data === false) {
        supplierNameControl?.setErrors({ notUnique: true });
      }
    })
  }

  //Delete Supplier
  deleteSupplier(supplierId: any) {
    this.database.deleteInvemtorySupplier(supplierId).subscribe((data: any) => {
      if (data.message) {
        this.edit = false
        this.getITSupplier()
      }
    })
  }

  /**
   * ======================================================================================================================
   * Manufacturer Section for all require function
   * @function
   * @function
   * @function
   * @function
   * @function
   *
  */
  //It is used to get manufacturers in IT-Inventory
  getITManufacturer() {
    this.database.getITManufacturerNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.manufacturers = res.data.list;
          console.log('Manufacturer list array:', this.manufacturers);
        } else {
          console.warn('No manufacturer data found or invalid response:', res);
          this.manufacturers = [];
        }
      },
      error: (err) => {
        console.error('Error fetching manufacturer names:', err);
        this.manufacturers = [];
      }
    });
  }

  //This is used to submit manufacturer
  submitManufacturer() {
    const manufacturerNameControl = this.createManufacturerForm.get('manufacturerName');
    const manufacturerNameValue = manufacturerNameControl?.value.trim();
    manufacturerNameControl?.setValue(manufacturerNameValue);

    if (!manufacturerNameValue) {
      manufacturerNameControl?.setErrors({ required: true });
      return;
    }

    this.database.postInventoryManufacturer(this.createManufacturerForm.value).subscribe((data: any) => {
      if (data.message) {
        // $('#closeModalCreate8').click();
        this.getITManufacturer();
        document.getElementById('createModalCloseBtn')?.click();
      }
    })
  }

  //Selects manufacturer to edit
  editManufacturer(manufacturer: any) {
    this.edit = true
    this.selectedItem = ''
    this.selectedItem = manufacturer._id;
    this.editManufacturerForm.get('manufacturerName')?.patchValue(manufacturer.name)
  }

  //Submit edit manufacturer
  submitEditManufacturer() {
    const manufacturerNameControl = this.editManufacturerForm.get('manufacturerName');
    const manufacturerNameValue = manufacturerNameControl?.value.trim();
    manufacturerNameControl?.setValue(manufacturerNameValue);

    if (!manufacturerNameValue) {
      manufacturerNameControl?.setErrors({ required: true });
      return;
    }

    this.database.editInventoryManufacturer(this.editManufacturerForm.value, this.selectedItem).subscribe((data: any) => {
      if (data.message) {
        this.edit = false
        this.getITManufacturer()
        this.editManufacturerForm.reset();
        document.getElementById('editModalCloseBtn')?.click();
      }
    })
  }

  //This is used to check manufacturer
  checkManufacturer() {
    const manufacturerNameControl = this.createManufacturerForm.get('manufacturerName');
    const manufacturerNameValue = manufacturerNameControl?.value.trim();
    manufacturerNameControl?.setValue(manufacturerNameValue);

    if (!manufacturerNameValue) {
      manufacturerNameControl?.setErrors({ required: true });
      return;
    }

    this.database.checkManufacturerInDatabase(manufacturerNameValue).subscribe((data: any) => {
      if (data === false) {
        manufacturerNameControl?.setErrors({ notUnique: true });
      }
    })
  }

  //This is used to check edit manufacturer
  checkEditManufacturer() {
    const manufacturerNameControl = this.editManufacturerForm.get('manufacturerName');
    const manufacturerNameValue = manufacturerNameControl?.value.trim();
    manufacturerNameControl?.setValue(manufacturerNameValue);

    if (!manufacturerNameValue) {
      manufacturerNameControl?.setErrors({ required: true });
      return;
    }

    this.database.checkEditManufacturerInDatabase(manufacturerNameValue).subscribe((data: any) => {
      if (data === false) {
        manufacturerNameControl?.setErrors({ notUnique: true });
      }
    })
  }

  //TO delete manufacturer
  deleteManufacturer(manufacturerId: any) {
    this.database.deleteInvemtoryManufacturer(manufacturerId).subscribe((data: any) => {
      if (data.message) {
        this.edit = false
        this.getITManufacturer()
      }
    })
  }

  /**
   * ======================================================================================================================
   * Company Section for all require function
   * @function
   * @function
   * @function
   * @function
   * @function
   *
  */
  //Selects company to edit
  editCompany(company: any) {
    this.edit = true;
    this.selectedItem = company._id;
    this.editCompanyForm.patchValue({ companyName: company.companyName, abbreviation: company.abbreviation, GSTNumber: company.GSTNumber, address: company.address });
  }

  // Submit Consumable Location
  submitCompany() {
    const nameControl = this.createCompanyForm.get('companyName');
    const abbrControl = this.createCompanyForm.get('abbreviation');

    if (nameControl && abbrControl) {
      const nameValue = nameControl.value?.trim();
      const abbrValue = abbrControl.value?.trim();

      nameControl.setValue(nameValue);
      abbrControl.setValue(abbrValue);

      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      if (!abbrValue) {
        abbrControl.setErrors({ required: true });
        return;
      }

      this.database.postCompany(this.createCompanyForm.value).subscribe((data: any) => {
        if (data?.message === 'success') {
          this.createCompanyForm.reset();
          document.getElementById('createModalCloseBtn')?.click();
        }
      });
    }
  }

  // Edit Consumable Location
  submitEditCompany() {
    const nameControl = this.editCompanyForm.get('companyName');
    const abbrControl = this.editCompanyForm.get('abbreviation');

    if (nameControl && abbrControl) {
      const nameValue = nameControl.value?.trim();
      const abbrValue = abbrControl.value?.trim();

      nameControl.setValue(nameValue);
      abbrControl.setValue(abbrValue);

      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      if (!abbrValue) {
        abbrControl.setErrors({ required: true });
        return;
      }

      this.database.updateCompanyById(this.editCompanyForm.value, this.selectedItem).subscribe((data: any) => {
        if (data?.message) {
          this.getCompany();
          this.edit = false;
          this.editCompanyForm.reset();
          document.getElementById('editModalCloseBtn')?.click();
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
 * <div class="single-container">
  <div class="heading">
    <h4>IT & other Inventory</h4>
  </div>
  <div class="single-btn-container">

    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.ITDepartment.ITInventory.manage === 0}"
      data-bs-target="#exampleModal6">Categorization</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.ITDepartment.ITInventory.manage === 0}"
      data-bs-target="#exampleModal7">Supplier</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights.ITDepartment.ITInventory.manage === 0}"
      data-bs-target="#exampleModal8">Manufacturer</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights?.adminDepartment?.consumableAsset?.manage === 0}"
      data-bs-target="#company">Company</button>


    <!-- <button type="button" class="btn component-btn" data-bs-toggle="modal" [ngClass]="{disabled: userRights.inventory.manage === 0}"
            data-bs-target="#exampleModal9">Location</button> -->
  </div>
</div>

<!-- Modal1  Category-->
<div class="modal modal-xl fade" id="exampleModal6" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
  data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">CATEGORIZATION</h5>
        <button type="button" id="closeModalCreate6" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="pageRefresh()"></button>
      </div>
      <div class="modal-body">
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="category-tab" data-bs-toggle="tab" data-bs-target="#category"
              type="button" role="tab" aria-controls="category" aria-selected="true">Category</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="subCategory-tab" data-bs-toggle="tab" data-bs-target="#subCategory"
              type="button" role="tab" aria-controls="subCategory" aria-selected="false">Sub
              Category</button>
          </li>
        </ul>
        <div class="tab-content" id="myTabContent">
          <!-- Category Tab Content -->
          <div class="tab-pane fade show active" id="category" role="tabpanel" aria-labelledby="category-tab">
            <div class="row">
              <div class="col-md-6 table-container">
                <table class="table table-responsive table-striped">
                  <thead>
                    <tr>
                      <th scope="col" class="align-middle background-dark">#</th>
                      <th scope="col" class="align-middle background-dark">Name</th>
                      <th scope="col" class="align-middle text-center background-dark">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="value-row" *ngFor="let category of inCategoriesList; let i = index">
                      <th scope="row" class="align-middle col">{{i+1}}</th>
                      <td class="align-middle col">{{category.name}}</td>
                      <td class="align-middle text-center col">
                        <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                          (click)="editCategory(category)">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <div class="create-form-container" *ngIf="edit == false">
                  <form [formGroup]="createCategoryForm" (submit)="submitCategory()">
                    <div class="form-group">
                      <label for="categoryname" class="form-label">Name <span class="required">*</span></label>
                      <input type="text" class="form-control" formControlName="name" (blur)="checkITCategoryname()">
                      <small
                        *ngIf="createCategoryForm.controls['name'].errors?.['required'] && createCategoryForm.controls['name'].touched"
                        class="error-message">This field is required</small>
                      <small
                        *ngIf="createCategoryForm.controls['name'].errors?.['notUnique'] && createCategoryForm.controls['name'].touched"
                        class="error-message">Name already exists!</small>
                    </div>
                    <div class="d-flex justify-content-center">
                      <button type="submit" class="btn btn-submit"
                        [disabled]="createCategoryForm.invalid">Submit</button>
                    </div>
                  </form>
                </div>
                <div class="edit-form-container" *ngIf="edit == true">
                  <form [formGroup]="editCategoryForm" (submit)="submitEditCategory()">
                    <div class="form-group">
                      <label for="">Edit Name <span class="required">*</span></label>
                      <input type="text" class="form-control" formControlName="name" (blur)="checkEditCategoryName()">
                      <small
                        *ngIf="editCategoryForm.controls['name'].errors?.['required'] && editCategoryForm.controls['name'].touched"
                        class="error-message">This field is required</small>
                      <small
                        *ngIf="editCategoryForm.controls['name'].errors?.['notUnique'] && editCategoryForm.controls['name'].touched"
                        class="error-message">Name already exists!</small>
                    </div>
                    <div class="d-flex justify-content-center">
                      <button type="submit" class="btn btn-submit" [disabled]="editCategoryForm.invalid">Update</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <!-- Sub Category Tab Content -->
          <div class="tab-pane fade" id="subCategory" role="tabpanel" aria-labelledby="subCategory-tab">
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6 table-container">
                  <table class="table table-responsive table-striped">
                    <thead>
                      <tr>
                        <th scope="col" class="align-middle background-dark">#</th>
                        <th scope="col" class="align-middle background-dark">Category</th>
                        <th scope="col" class="align-middle background-dark">Sub-category</th>
                        <th scope="col" colspan="2" class="align-middle background-dark">Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr class="value-row" *ngFor="let subcategory of subcategories; let i = index">
                        <th scope="row" class="align-middle col-1">{{i+1}}</th>
                        <td class="align-middle col-4">{{subcategory.categoryName.name}}</td>
                        <td class="align-middle col-4">{{subcategory.subCategoryName}}</td>
                        <td class="align-middle col-1">
                          <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                            (click)="editSubCategory(subcategory)">
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="col-lg-6">
                  <div class="create-form-container" *ngIf="edit === false">
                    <form [formGroup]="createSubCategoryForm" (ngSubmit)="onSubCategorySubmit()" class="px-3">
                      <div class="row g-3">
                        <!-- Category -->
                        <div class="col-md-6">
                          <label class="form-label fw-semibold">Category <span class="text-danger">*</span></label>
                          <select class="form-select" formControlName="categoryName">
                            <option *ngFor="let category of inCategoriesList" [value]="category._id">
                              {{ category.name }}
                            </option>
                          </select>
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('categoryName')?.hasError('required') && createSubCategoryForm.get('categoryName')?.touched">
                            This field is required.
                          </small>
                        </div>
                        <!-- Sub-category -->
                        <div class="col-md-6">
                          <label class="form-label fw-semibold">Sub-category <span class="text-danger">*</span></label>
                          <input type="text" class="form-control" formControlName="subCategoryName"
                            (blur)="checkSubCategoryName()" />
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('subCategoryName')?.hasError('required') && createSubCategoryForm.get('subCategoryName')?.touched">
                            This field is required.
                          </small>
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('subCategoryName')?.hasError('notUnique')">
                            Sub-category name already exists!
                          </small>
                        </div>
                        <!-- Prefix -->
                        <div class="col-md-4">
                          <label class="form-label fw-semibold">Prefix <span class="text-danger">*</span></label>
                          <input type="text" class="form-control" formControlName="prefix" />
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('prefix')?.hasError('required') && createSubCategoryForm.get('prefix')?.touched">
                            This field is required.
                          </small>
                        </div>
                        <!-- Numeric Digit -->
                        <div class="col-md-4">
                          <label class="form-label fw-semibold">Numeric Digit <span class="text-danger">*</span></label>
                          <input type="number" class="form-control" formControlName="numbericDigit" min="3" />
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('numbericDigit')?.hasError('required') && createSubCategoryForm.get('numbericDigit')?.touched">
                            This field is required.
                          </small>
                        </div>
                        <!-- Suffix -->
                        <div class="col-md-4">
                          <label class="form-label fw-semibold">Suffix <span class="text-danger">*</span></label>
                          <input type="text" class="form-control" formControlName="suffix"  />
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('suffix')?.hasError('required') && createSubCategoryForm.get('suffix')?.touched">
                            This field is required.
                          </small>
                          <small class="text-danger"
                            *ngIf="createSubCategoryForm.get('suffix')?.hasError('alreadyExists')">
                            Suffix already exists.
                          </small>
                        </div>
                      </div>
                      <!-- Checkbox Section -->
                      <div class="mt-4">
                        <h6 class="fw-semibold mb-3">Please select the fields you want to include:</h6>
                        <!-- Select All -->
                        <div class="form-check mb-2">
                          <input type="checkbox" class="form-check-input" id="selectAll" formControlName="checkedAll"
                            (change)="toggleAllCheckboxes($event)" />
                          <label for="selectAll" class="form-check-label fw-semibold">Select All</label>
                        </div>
                        <!-- Checkboxes Grid -->
                        <div formGroupName="checkboxes" class="row g-2">
                          <div class="col-md-4 col-sm-6"
                            *ngFor="let key of Object.keys(createSubCategoryForm.get('checkboxes')?.value)">
                            <div class="form-check">
                              <input type="checkbox" class="form-check-input" [id]="key" [formControlName]="key"
                                (change)="onCheckboxChange()" />
                              <label class="form-check-label" [for]="key">{{ checkboxLabels[key] }}</label>
                            </div>
                          </div>
                        </div>
                        <!-- Error Message -->
                        <div *ngIf="createSubCategoryForm.get('checkboxes')?.hasError('atLeastOneRequired')"
                          class="text-danger mt-2">
                          Please select at least one option.
                        </div>
                      </div>
                      <!-- Submit Button -->
                      <div class="d-flex justify-content-center mt-4">
                        <button type="submit" class="btn btn-primary px-4"
                          [disabled]="createSubCategoryForm.invalid || loading">
                          {{ loading ? 'Submitting...' : mode === 'create' ? 'Create' : 'Update' }}
                        </button>
                      </div>
                    </form>
                  </div>
                  <div class="create-form-container" *ngIf="edit === true">
                    <!-- <form [formGroup]="editSubCategoryForm" (ngSubmit)="submitEditSubCategory()">
                      <div class="row"></div>
                      <div class="row">
                        <div class="col-lg-6">
                          <div class="form-group">
                            <label for="">Edit Category <span class="required">*</span></label>
                            <select class="form-select" formControlName="categoryName">
                              <option *ngFor="let category of inCategoriesList" value="{{category._id}}">
                                {{category.name}}</option>
                            </select>
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('categoryName')?.errors?.['required'] && editSubCategoryForm.get('categoryName')?.touched">
                              This field is Required
                            </small>
                          </div>
                        </div>

                        <div class="col-lg-6">
                          <div class="form-group">
                            <label for="">Edit Sub-Category <span class="required">*</span></label>
                            <input type="text" class="form-control" formControlName="subCategoryName"
                              (blur)="checkEditSubCategoryName()">
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('subCategoryName')?.errors?.['required'] && editSubCategoryForm.get('subCategoryName')?.touched">
                              This field is Required
                            </small>
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.controls['subCategoryName'].errors?.['notUnique']">
                              Sub-category name is already exist!
                            </small>
                          </div>
                        </div>

                        <div class="col-lg-4">
                          <div class="form-group">
                            <label for="">Edit Prefix <span class="required">*</span></label>
                            <input type="text" class="form-control" formControlName="prefix"
                              (blur)="checkEditITPrefixSuffix()">
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('prefix')?.errors?.['required'] && editSubCategoryForm.get('prefix')?.touched">
                              This field is Required
                            </small>
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('prefix')?.errors?.['notUnique']">
                              Prefix name is already exist!
                            </small>
                          </div>
                        </div>

                        <div class="col-lg-4">
                          <div class="form-group">
                            <label for="">Edit Range <span class="required">*</span></label>
                            <input type="text" class="form-control" formControlName="range"
                              (blur)="checkEditITPrefixSuffix()">
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('range')?.errors?.['required'] && editSubCategoryForm.get('range')?.touched">
                              This field is Required
                            </small>
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('range')?.errors?.['notUnique']">
                              Range name is already exist!
                            </small>
                          </div>
                        </div>

                        <div class="col-lg-4">
                          <div class="form-group">
                            <label for="">Edit Suffix <span class="required">*</span></label>
                            <input type="text" class="form-control" formControlName="suffix"
                              (blur)="checkEditITPrefixSuffix()">
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('suffix')?.errors?.['required'] && editSubCategoryForm.get('suffix')?.touched">
                              This field is Required
                            </small>
                            <small class="error-message"
                              *ngIf="editSubCategoryForm.get('suffix')?.errors?.['notUnique']">
                              Suffix name is already exist!
                            </small>
                          </div>
                        </div>
                      </div>

                      <div class="info-text">
                        <h6>Please select the checkbox below for the sub-category you wish to
                          view.</h6>
                      </div>

                      <div class="form-check select-all">
                        <input type="checkbox" class="form-check-input" formControlName="checkedAll">
                        <label class="form-check-label"><b>Select All</b></label>
                      </div>

                      <div class="check-grid">
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="cpu">
                          <label class="form-check-label">CPU</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="description">
                          <label class="form-check-label">Description</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="drive">
                          <label class="form-check-label">HDD/SSD</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="inputVoltage">
                          <label class="form-check-label">Input voltage</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="internetAccess">
                          <label class="form-check-label">Internet Access</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="ipAddress">
                          <label class="form-check-label">IP Address</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="key">
                          <label class="form-check-label">Key</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="lastUse">
                          <label class="form-check-label">Last Use</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="licenseInEff">
                          <label class="form-check-label">License in Effect</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="modelNo">
                          <label class="form-check-label">Model no.</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="msEffect">
                          <label class="form-check-label">MS 365 in Effect</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="purchaseDate">
                          <label class="form-check-label">Purchase Date</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="ram">
                          <label class="form-check-label">RAM</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="softwareInstalled">
                          <label class="form-check-label">Software Installed</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="subscriptionEnd">
                          <label class="form-check-label">Subscription End</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="subscriptionStart">
                          <label class="form-check-label">Subscription Start</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="systemConfig">
                          <label class="form-check-label">System Configuration</label>
                        </div>
                        <div class="form-check">
                          <input type="checkbox" class="form-check-input" formControlName="warrantyDate">
                          <label class="form-check-label">Warranty Date</label>
                        </div>
                      </div>

                      <div class="d-flex justify-content-center">
                        <button type="submit" class="btn btn-submit"
                          [disabled]="editSubCategoryForm.invalid">Update</button>
                      </div>
                    </form> -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal2 Supplier -->
<div class="modal modal-lg fade" id="exampleModal7" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
  data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">SUPPLIER</h5>
        <button type="button" id="closeModalCreate7" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="pageRefresh()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" colspan="2" class="align-middle background-dark">Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let supplier of suppliers; let i = index;">
                  <th scope="row" class="align-middle col-1">{{i+1}}</th>
                  <td class="align-middle col-4">{{supplier.name}}</td>
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
                  <input type="text" class="form-control" formControlName="supplierName" (blur)="checkSupplier()">
                  <small class="error-message"
                    *ngIf="createSupplierForm.controls['supplierName'].errors?.['required'] && createSupplierForm.controls['supplierName'].touched">This
                    field is Required</small>
                  <small class="error-message"
                    *ngIf="createSupplierForm.controls['supplierName'].errors?.['notUnique']">Supplier
                    name is already exist!</small>

                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="createSupplierForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="create-form-container" *ngIf="edit === true">
              <form [formGroup]="editSupplierForm" (ngSubmit)="submitEditSupplier()">
                <div class="form-group">
                  <label>Edit Name <span class="required">*</span></label>
                  <!-- <input type="text" class="form-control" formControlName="supplierName" (blur)="checkEditSupplier()"> -->
                  <input type="text" class="form-control" formControlName="supplierName">
                  <small class="error-message"
                    *ngIf="editSupplierForm.get('supplierName')?.errors?.['required'] && editSupplierForm.get('supplierName')?.touched">This
                    field is Required</small>
                  <small class="error-message"
                    *ngIf="editSupplierForm.controls['supplierName'].errors?.['notUnique']">Supplier
                    name is already exist!</small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editSupplierForm.invalid">Update</button>
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

<!-- Modal3 Manufacturer-->
<div class="modal modal-lg fade" id="exampleModal8" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
  data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">MANUFACTURER</h5>
        <button type="button" id="closeModalCreate8" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="pageRefresh()"></button>
      </div>
      <div class="modal-body">
        <div class="row">
          <div class="col-lg-6 table-container">
            <table class="table table-responsive table-striped">
              <thead>
                <tr>
                  <th scope="col" class="align-middle background-dark">#</th>
                  <th scope="col" class="align-middle background-dark">Name</th>
                  <th scope="col" colspan="2" class="align-middle background-dark">Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="value-row" *ngFor="let manufacturer of manufacturers; let i = index">
                  <th scope="row" class="align-middle col-1">{{i+1}}</th>
                  <td class="align-middle col-4">{{manufacturer.name}}</td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons"
                      (click)="editManufacturer(manufacturer)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit === false">
              <form [formGroup]="createManufacturerForm" (ngSubmit)="submitManufacturer()">
                <div class="form-group">
                  <label>Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="manufacturerName"
                    (blur)="checkManufacturer()">
                  <small class="error-message"
                    *ngIf="createManufacturerForm.controls['manufacturerName'].errors?.['required'] && createManufacturerForm.controls['manufacturerName'].touched">This
                    field is Required</small>
                  <small class="error-message"
                    *ngIf="createManufacturerForm.controls['manufacturerName'].errors?.['notUnique']">Manufacturer
                    name is already exist!</small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]=" createManufacturerForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="create-form-container" *ngIf="edit ===  true">
              <form [formGroup]="editManufacturerForm" (ngSubmit)="submitEditManufacturer()">
                <div class="form-group">
                  <label>Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="manufacturerName"
                    (blur)="checkEditManufacturer()">
                  <small class="error-message"
                    *ngIf="editManufacturerForm.controls['manufacturerName'].errors?.['required'] && editManufacturerForm.controls['manufacturerName'].touched">This
                    field is Required</small>
                  <small class="error-message"
                    *ngIf="editManufacturerForm.controls['manufacturerName'].errors?.['notUnique']">Manufacturer
                    name is already exist!</small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editManufacturerForm.invalid">Update</button>
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

<!-- Toast-style notification -->
<div *ngIf="statusMessage !== ''"
  class="alert d-flex align-items-center justify-content-between shadow-sm position-fixed top-0 start-50 translate-middle-x mt-3"
  [ngClass]="{
    'alert-success': statusType === 'success',
    'alert-warning': statusType === 'warning',
    'alert-danger': statusType === 'error'
  }" role="alert" style="min-width: 350px; max-width: 500px; border-radius: 8px; font-weight: 500; z-index: 2000;">
  <div class="d-flex align-items-center">
    <i class="me-2" [ngClass]="{
        'bi bi-check-circle-fill text-success': statusType === 'success',
        'bi bi-exclamation-triangle-fill text-warning': statusType === 'warning',
        'bi bi-x-circle-fill text-danger': statusType === 'error'
      }" style="font-size: 1.2rem;"></i>
    <span>{{ statusMessage }}</span>
  </div>

  <button type="button" class="btn-close ms-2" aria-label="Close" (click)="statusMessage = ''"></button>
</div>
*/
