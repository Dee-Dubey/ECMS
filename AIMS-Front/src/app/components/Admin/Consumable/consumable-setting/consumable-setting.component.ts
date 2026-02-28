import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';


@Component({
  selector: 'app-consumable-setting',
  templateUrl: './consumable-setting.component.html',
  styleUrls: ['./consumable-setting.component.css']
})
export class ConsumableSettingComponent {

  suppliers: any;
  locations: any;
  companies: any;
  selectedItem: any;

  userRights: any = {};
  searchText: string = '';

  selectAll: boolean = false;
  selectedRows: any[] = [];
  activeSection: string = 'category';
  setActive(section: string) {
    this.activeSection = section;
  }

  inCategoriesList: any = [];

  edit: boolean = false;

  createLocationForm: FormGroup;
  createSupplierForm: FormGroup;
  editCategoryForm: FormGroup;
  editSupplierForm: FormGroup;
  editLocationForm: FormGroup;
  createCategoryForm: FormGroup;
  createCompanyForm: FormGroup;
  editCompanyForm: FormGroup;

  constructor(private database: DatabaseService, private authCtx: SessionstorageService) {

    // Create category form
    this.createCategoryForm = new FormGroup({
      categoryName: new FormControl('', [Validators.required])
    });

    // Edit category form
    this.editCategoryForm = new FormGroup({
      categoryName: new FormControl('', [Validators.required])
    });

    // Create Supplier in IT-Inventory
    this.createSupplierForm = new FormGroup({
      supplierName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      contactPerson: new FormControl('', [Validators.minLength(2), Validators.maxLength(30)]),
      contactNumber: new FormControl('', [Validators.pattern(/^\+?\d{8,14}$/)]),
      email: new FormControl('', [Validators.email]),
      GSTNumber: new FormControl(''),
      address: new FormControl(''),
      type: new FormControl('')
    });

    //Edit Supplier in IT-Inventory
    this.editSupplierForm = new FormGroup({
      supplierName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]),
      contactPerson: new FormControl('', [Validators.minLength(2), Validators.maxLength(30)]),
      contactNumber: new FormControl('', [Validators.pattern(/^\+?\d{8,14}$/)]),
      email: new FormControl('', [Validators.email]),
      GSTNumber: new FormControl(''),
      address: new FormControl(''),
      type: new FormControl('')
    });

    //Create location
    this.createLocationForm = new FormGroup({
      locationName: new FormControl('', [Validators.required]),
      shelfLocation: new FormControl('')
    });

    //Edit Location
    this.editLocationForm = new FormGroup({
      locationName: new FormControl('', [Validators.required]),
      shelfLocation: new FormControl('')
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
    this.getConsumableSupplier();
    this.getConsumableCategory();
    this.getConsumableLocation();
    this.getCompany();

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }
      const { rights } = ctx;
      this.userRights = rights
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
      case 'category': return this.inCategoriesList || [];
      case 'supplier': return this.suppliers || [];
      case 'location': return this.locations || [];
      case 'company': return this.companies || [];
      default: return [];
    }
  }

  //
  get filteredData(): any[] {

    const search = this.searchText.toLowerCase().trim();

    if (!search) {
      return this.getCurrentData();
    }

    return this.getCurrentData().filter((item: any) => {

      switch (this.activeSection) {

        case 'category':
          return item.categoryName?.toString().toLowerCase().includes(search);

        case 'supplier':
          return (
            item.supplierName?.toString().toString().toLowerCase().includes(search) ||
            item.contactPerson?.toString().toLowerCase().includes(search) ||
            item.contactNumber?.toString().toLowerCase().includes(search) ||
            item.email?.toString().toLowerCase().includes(search) ||
            item.GSTNumber?.toString().toLowerCase().includes(search) ||
            item.address?.toString().toLowerCase().includes(search) ||
            item.type?.toString().toLowerCase().includes(search)
          );

        case 'location':
          return item.locationName?.toString().toLowerCase().includes(search);

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

    const data = this.selectedRows.length > 0 ? this.selectedRows : this.filteredData;

    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    let exportData: any[] = [];
    let sheetName = '';
    const today = new Date().toISOString().split('T')[0];

    switch (this.activeSection) {

      // ================= CATEGORY =================
      case 'category':
        sheetName = 'Category';
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Category Name': item.categoryName
        }));
        break;

      // ================= SUPPLIER =================
      case 'supplier':
        sheetName = 'Supplier';
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Supplier Name': item.supplierName,
          'Contact Person': item.contactPerson,
          'Contact Number': item.contactNumber,
          'E-Mail': item.email,
          'GST Number': item.GSTNumber,
          'Address': item.address,
          'Type': item.type
        }));
        break;

      // ================= LOCATION =================
      case 'location':
        sheetName = 'Location';
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Shelf Name': item.locationName,
          'Shelf Location': item.shelfLocation
        }));
        break;

      // ================= COMPANY =================
      case 'company':
        sheetName = 'Company';
        exportData = data.map((item, index) => ({
          '#': index + 1,
          'Company Name': item.companyName,
          'Abbreviation': item.abbreviation,
          'GST Number': item.GSTNumber,
          'Address': item.address
        }));
        break;

      default:
        return;
    }

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    const header = Object.keys(exportData[0]);
    XLSX.utils.sheet_add_aoa(worksheet, [header], { origin: 'A1' });

    // Auto column width
    worksheet['!cols'] = header.map(key => ({
      wch: Math.max(
        key.length,
        ...exportData.map(row => row[key] ? row[key].toString().length : 10)
      ) + 2
    }));

    // Freeze header row
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    // Header styling
    header.forEach((_, colIndex) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });

      if (!worksheet[cellAddress]) return;

      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2F75B5" } }, // Professional Blue
        alignment: { horizontal: "center", vertical: "center" }
      };
    });

    // Force Contact Number column as text (Prevent scientific format)
    if (this.activeSection === 'supplier') {

      const contactColIndex = header.indexOf('Contact Number');

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
      Sheets: { [sheetName]: worksheet },
      SheetNames: [sheetName]
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const fileName = `AIMS-Consumable-${sheetName}-${today}.xlsx`;

    FileSaver.saveAs(blob, fileName);

    // Reset selection after export
    this.selectAll = false;
    this.selectedRows = [];
  }

  /**
   * ======================================================================================================================
   * Category
   * */
  /**
   * Enables edit mode for a selected category.
   *
   * - Sets the component to edit state.
   * - Stores the selected category ID for update operation.
   * - Pre-fills the edit form with the existing category name.
   *
   * @param category Selected category object containing _id and categoryName.
   */
  editCategory(category: any) {
    this.edit = true;
    this.selectedItem = category._id;
    this.editCategoryForm.get('categoryName')?.patchValue(category.categoryName);
  }

  /**
   * Submits a new consumable category.
   *
   * - Trims whitespace from category name input.
   * - Validates that the category name is not empty.
   * - Calls the API to create the category.
   * - Refreshes the category list and resets the form on success.
   */
  submitConsumableCategory() {
    let nameControl = this.createCategoryForm.get('categoryName');
    if (nameControl && typeof nameControl.value === 'string') {
      let nameValue = nameControl.value.trim();
      nameControl.setValue(nameValue);
      if (!nameValue) {
        nameControl?.setErrors({ required: true });
        return;
      }

      this.database.createConsumableCategory(this.createCategoryForm.value).subscribe({
        next: (data: any) => {
          console.log('Category create response from DB:', data);
          if (data.success === true) {
            this.getConsumableCategory();
            this.createCategoryForm.reset();
            document.getElementById('createModalCloseBtn')?.click();
          }
        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
    }
  }

  /**
   * Updates an existing consumable category.
   *
   * - Trims whitespace from the category name.
   * - Validates that the category name is not empty.
   * - Calls the API to update the selected category by ID.
   * - Refreshes the category list after successful update.
   * - Resets the form and exits edit mode.
   */
  submitEditCategory() {
    let nameControl = this.editCategoryForm.get('categoryName');
    if (nameControl && typeof nameControl.value === 'string') {
      let nameValue = nameControl.value.trim();
      nameControl.setValue(nameValue);
      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      this.database.updateConsumableCategoryById(this.editCategoryForm.value, this.selectedItem).subscribe({
        next: (data: any) => {
          if (data.success === true) {
            console.log('Category update response from DB', data);
            this.getConsumableCategory();
            this.edit = false;
            this.editCategoryForm.reset();
            document.getElementById('editModalCloseBtn')?.click();
          }
        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
    }
  }

  /**
   * Fetches all consumable categories from the database.
   *
   * - Calls the API to retrieve category list.
   * - Stores the received category data into local array.
   * - Refreshes the page/view after successful data load.
   * - Handles invalid responses and API errors gracefully.
   */
  getConsumableCategory() {
    this.database.fetchConsumableCategory().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.inCategoriesList = res.data.list;
          console.log('Category list array:', this.inCategoriesList);
        } else {
          console.warn('No Category data found or invalid response:', res);
          this.inCategoriesList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching Category names:', err);
        this.inCategoriesList = [];
      }
    });
  }



  /**
   *  ======================================================================================================================
   * -Supplier
   * */
  /**
   * Enables edit mode for a selected supplier.
   *
   * - Activates edit state in the UI.
   * - Stores the selected supplier ID for update operation.
   * - Pre-fills the edit form with existing supplier details.
   * - Provides default fallback values to prevent null/undefined issues.
   *
   * @param supplier Selected supplier object containing supplier details.
   */
  editSupplier(supplier: any) {
    this.edit = true;
    this.selectedItem = supplier._id;

    this.editSupplierForm.patchValue({
      supplierName: supplier.supplierName || '',
      contactPerson: supplier.contactPerson || '',
      contactNumber: supplier.contactNumber || '',
      email: supplier.email || '',
      GSTNumber: supplier.GSTNumber || '',
      address: supplier.address || '',
      type: supplier.type || 'Local'
    });
  }

  /**
   * Submits a new consumable supplier.
   *
   * - Extracts and trims form input values.
   * - Prepares cleaned supplier data object.
   * - Validates required fields (supplier name).
   * - Calls the API to create a new supplier.
   * - Refreshes supplier list and resets form on success.
   */
  submitSupplier() {

    const formValue = this.createSupplierForm.value;

    const cleanedData = {
      supplierName: formValue.supplierName?.trim(),
      contactPerson: formValue.contactPerson?.trim(),
      contactNumber: formValue.contactNumber?.trim(),
      email: formValue.email?.trim(),
      GSTNumber: formValue.GSTNumber?.trim(),
      address: formValue.address?.trim(),
      type: formValue.type
    };

    if (!cleanedData.supplierName) {
      this.createSupplierForm.get('supplierName')?.setErrors({ required: true });
      return;
    }

    this.database.createConsumableSupplier(cleanedData).subscribe({
      next: (data: any) => {
        if (data.success === true) {
          this.getConsumableSupplier();
          this.createSupplierForm.reset();
          document.getElementById('createModalCloseBtn')?.click();
        }
      },
      error: (err) => {
        console.log('Error log:', err);
      }
    });
  }

  /**
   * Updates an existing consumable supplier.
   *
   * - Extracts and trims form input values.
   * - Prepares a cleaned supplier data object.
   * - Validates required fields (supplier name).
   * - Calls the API to update supplier by selected ID.
   * - Refreshes supplier list, exits edit mode, and resets form on success.
   */
  submitEditSupplier() {

    const formValue = this.editSupplierForm.value;

    const cleanedData = {
      supplierName: formValue.supplierName?.trim(),
      contactPerson: formValue.contactPerson?.trim(),
      contactNumber: formValue.contactNumber?.trim(),
      email: formValue.email?.trim(),
      GSTNumber: formValue.GSTNumber?.trim(),
      address: formValue.address?.trim(),
      type: formValue.type
    };

    if (!cleanedData.supplierName) {
      this.editSupplierForm.get('supplierName')?.setErrors({ required: true });
      return;
    }

    this.database.updateConsumableSupplierById(cleanedData, this.selectedItem)
      .subscribe({
        next: (data: any) => {
          if (data.success === true) {
            this.getConsumableSupplier();
            this.edit = false;
            this.editSupplierForm.reset();
            document.getElementById('editModalCloseBtn')?.click();
          }
        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
  }

  /**
   * Fetches all consumable suppliers from the database.
   *
   * - Calls the API to retrieve supplier data.
   * - Stores full supplier objects in local suppliers array.
   * - Handles invalid responses gracefully.
   * - Clears supplier list in case of error.
   */
  getConsumableSupplier() {
    this.database.fetchConsumableSupplier().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.suppliers = res.data;  // 👈 full supplier objects
          console.log('Full Supplier Data:', this.suppliers);
        } else {
          console.warn('No supplier data found or invalid response:', res);
          this.suppliers = [];
        }
      },
      error: (err) => {
        console.error('Error fetching supplier:', err);
        this.suppliers = [];
      }
    });
  }



  /**
   *  ======================================================================================================================
   * -Location
   * */
  /**
   * Enables edit mode for a selected location.
   *
   * - Activates edit state in the UI.
   * - Stores the selected location ID for update operation.
   * - Pre-fills the edit form with the existing location name.
   *
   * @param location Selected location object containing _id and locationName.
   */
  editLocation(location: any) {
    this.edit = true;
    this.selectedItem = location._id;
    this.editLocationForm.patchValue({ locationName: location.locationName, shelfLocation: location.shelfLocation });
  }

  /**
   * Submits a new consumable location.
   *
   * - Trims whitespace from the location name.
   * - Validates that the location name is not empty.
   * - Calls the API to create a new location.
   * - Refreshes location list and resets the form on success.
   */
  submitLocation() {

    const nameControl = this.createLocationForm.get('locationName');
    const shelfLocationControl = this.createLocationForm.get('shelfLocation'); // ✅ NEW

    if (nameControl && typeof nameControl.value === 'string') {

      const nameValue = nameControl.value.trim();
      nameControl.setValue(nameValue);

      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      const locationData = {
        locationName: nameValue,
        shelfLocation: shelfLocationControl?.value   // ✅ NEW FIELD
      };

      this.database.createConsumableLocation(locationData).subscribe({
        next: (data: any) => {

          if (data.success === true) {

            this.getConsumableLocation();
            this.createLocationForm.reset();
            document.getElementById('createModalCloseBtn')?.click();
          }
        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
    }
  }

  /**
   * Updates an existing consumable location.
   *
   * - Trims whitespace from the location name.
   * - Validates that the location name is not empty.
   * - Calls the API to update the selected location by ID.
   * - Refreshes the location list after successful update.
   * - Exits edit mode and resets the form.
   */
  submitEditLocation() {

    const nameControl = this.editLocationForm.get('locationName');
    const shelfLocationControl = this.editLocationForm.get('shelfLocation'); // ✅ NEW

    if (nameControl && typeof nameControl.value === 'string') {

      const nameValue = nameControl.value.trim();
      nameControl.setValue(nameValue);

      if (!nameValue) {
        nameControl.setErrors({ required: true });
        return;
      }

      const updateData = {
        locationName: nameValue,
        shelfLocation: shelfLocationControl?.value   // ✅ NEW FIELD
      };

      this.database.updateConsumableLocationById(updateData, this.selectedItem).subscribe({
        next: (data: any) => {

          if (data.success === true) {

            this.getConsumableLocation();
            this.edit = false;
            this.editLocationForm.reset();
            document.getElementById('editModalCloseBtn')?.click();
          }
        },
        error: (err) => {
          console.log('Error log:', err);
        }
      });
    }
  }

  /**
   * Fetches all consumable locations from the database.
   *
   * - Calls the API to retrieve location list.
   * - Stores the received locations into local array.
   * - Refreshes the UI after successful data load.
   * - Handles invalid responses and API errors gracefully.
   */
  getConsumableLocation() {
    this.database.fetchConsumableLocation().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.locations = res.data.list;
          console.log('Location list array:', this.locations);
        } else {
          console.warn('No location data found or invalid response:', res);
          this.locations = [];
        }
      },
      error: (err) => {
        console.error('Error fetching location names:', err);
        this.locations = [];
      }
    });
  }



  /**
   * ======================================================================================================================
   * -Company
   *
  */
  /**
   * Enables edit mode for a selected company.
   *
   * - Activates edit state in the UI.
   * - Stores the selected company ID for update operation.
   * - Pre-fills the edit form with existing company details.
   *
   * @param company Selected company object containing company information.
   */
  editCompany(company: any) {
    this.edit = true;
    this.selectedItem = company._id;
    this.editCompanyForm.patchValue({ companyName: company.companyName, abbreviation: company.abbreviation, GSTNumber: company.GSTNumber, address: company.address });
  }

  /**
   * Submits a new company.
   *
   * - Trims required fields (company name and abbreviation).
   * - Validates mandatory inputs before submission.
   * - Trims optional fields (GST number and address).
   * - Calls the API to create a new company record.
   * - Refreshes company list and resets the form on success.
   */
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

  /**
   * Updates an existing company.
   *
   * - Trims required fields (company name and abbreviation).
   * - Validates mandatory inputs before submission.
   * - Trims optional fields (GST number and address).
   * - Calls the API to update the selected company by ID.
   * - Refreshes company list, exits edit mode, and resets the form on success.
   */
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
            this.edit = false;
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

  /**
   * Fetches all companies for the consumable module.
   *
   * - Calls the API to retrieve company list.
   * - Stores the received company data into local array.
   * - Refreshes the UI after successful data load.
   * - Handles invalid responses and API errors gracefully.
   */
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
   * Page refresh
   *
  */
  pageRefresh() {
    // window.location.reload();
    $('#category').click();
  }

}

/**
 * <div class="single-container">
  <div class="heading">
    <h4>Consumable</h4>
  </div>
  <div class="single-btn-container">

    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights?.adminDepartment?.consumableAsset?.manage === 0}" data-bs-target="#category">Category</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights?.adminDepartment?.consumableAsset?.manage === 0}" data-bs-target="#supplier">Supplier</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights?.adminDepartment?.consumableAsset?.manage === 0}" data-bs-target="#location">Location</button>
    <button type="button" class="btn component-btn" data-bs-toggle="modal"
      [ngClass]="{disabled: userRights?.adminDepartment?.consumableAsset?.manage === 0}" data-bs-target="#company">Company</button>
  </div>
</div>


<!-- Modal1 Category-->
<div class="modal modal-lg fade" id="category" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
  data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">CATEGORIZATION</h5>
        <button type="button" id="closeModalCreate6" class="btn-close btn-close-white" data-bs-dismiss="modal"
          aria-label="Close" (click)="pageRefresh()"></button>
      </div>
      <div class="modal-body">
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
                      <td class="align-middle col">{{category?.categoryName}}</td>
                      <td class="align-middle text-center col">
                        <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons" (click)="editCategory(category)">
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <div *ngIf="edit == false" class="create-form-container">
                  <form [formGroup]="createCategoryForm" (submit)="submitConsumableCategory()">
                    <div class="form-group">
                      <label for="categoryname" class="form-label">Name <span class="required">*</span></label>
                      <input type="text" class="form-control" formControlName="categoryName">
                      <small class="error-message" *ngIf="createCategoryForm.controls['categoryName'].errors?.['required'] && createCategoryForm.controls['categoryName'].touched">This field is required</small>
                      <small class="error-message" *ngIf="createCategoryForm.controls['categoryName'].errors?.['notUnique'] && createCategoryForm.controls['categoryName'].touched">Name already exists!</small>
                    </div>
                    <div class="d-flex justify-content-center">
                      <button type="submit" class="btn btn-submit" [disabled]="createCategoryForm.invalid">Submit</button>
                    </div>
                  </form>
                </div>
                <div *ngIf="edit == true" class="edit-form-container">
                  <form [formGroup]="editCategoryForm" (submit)="submitEditCategory()">
                    <div class="form-group">
                      <label for="">Edit Name <span class="required">*</span></label>
                      <input type="text" class="form-control" formControlName="categoryName">
                      <small *ngIf="editCategoryForm.controls['categoryName'].errors?.['required'] && editCategoryForm.controls['categoryName'].touched" class="error-message">This field is required</small>
                      <small *ngIf="editCategoryForm.controls['categoryName'].errors?.['notUnique'] && editCategoryForm.controls['categoryName'].touched" class="error-message">Name already exists!</small>
                    </div>
                    <div class="d-flex justify-content-center">
                      <button type="submit" class="btn btn-submit" [disabled]="editCategoryForm.invalid">Update</button>
                    </div>
                  </form>
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
<div class="modal modal-lg fade" id="supplier" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
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
                  <td class="align-middle col-4">{{supplier?.supplierName}}</td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons" (click)="editSupplier(supplier)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div *ngIf="edit === false" class="create-form-container">
              <form [formGroup]="createSupplierForm"  (ngSubmit)="submitSupplier()">

                <!-- Supplier Name -->
                <div class="form-group">
                  <label> Supplier Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="supplierName">
                  <small class="error-message" *ngIf="createSupplierForm.controls['supplierName'].errors?.['required'] && createSupplierForm.controls['supplierName'].touched">This field is Required</small>
                  <small class="error-message" *ngIf="createSupplierForm.controls['supplierName'].errors?.['notUnique']">Supplier name is already exist!</small>
                </div>

                <!-- Contact person -->
                <div class="form-group">
                  <label> Contact Person </label>
                  <input type="text" class="form-control" formControlName="contactPerson">
                </div>

                <!-- Contact Number -->
                <div class="form-group">
                  <label>Contact Number </label>
                  <input type="text" class="form-control" formControlName="contactNumber">
                  <!-- <small class="error-message" *ngIf="createSupplierForm.controls['contactNumber'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- Email -->
                <div class="form-group">
                  <label>E-Mail </label>
                  <input type="text" class="form-control" formControlName="email">
                  <!-- <small class="error-message" *ngIf="createSupplierForm.controls['email'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- GST Number -->
                <div class="form-group">
                  <label> GST Number </label>
                  <input type="text" class="form-control" formControlName="GSTNumber">
                  <!-- <small class="error-message" *ngIf="createSupplierForm.controls['GSTNumber'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- Address -->
                <div class="form-group">
                  <label> Address </label>
                  <input type="text" class="form-control" formControlName="address">
                </div>

                <!-- Type -->
                <div class="form-group">
                  <label> Type </label>
                  <select class="form-select form-control" aria-label="Default select example" formControlName="type">
                    <option value="Local" class="type-option">Local</option>
                    <option value="Imported" class="type-option">Imported</option>
                  </select>
                </div>

                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="createSupplierForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div *ngIf="edit === true" class="create-form-container">
              <form [formGroup]="editSupplierForm" (ngSubmit)="submitEditSupplier()">

                <!-- Supplier Name -->
                <div class="form-group">
                  <label>Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="supplierName">
                  <small class="error-message" *ngIf="editSupplierForm.get('supplierName')?.errors?.['required'] && editSupplierForm.get('supplierName')?.touched">This field is Required</small>
                  <small class="error-message" *ngIf="editSupplierForm.controls['supplierName'].errors?.['notUnique']">Supplier name is already exist!</small>
                </div>

                <!-- Contact person -->
                <div class="form-group">
                  <label> Contact Person </label>
                  <input type="text" class="form-control" formControlName="contactPerson">
                  <small class="error-message" *ngIf="editSupplierForm.controls['contactPerson'].errors?.['required'] && editSupplierForm.controls['contactPerson'].touched">This field is Required</small>
                  <small class="error-message" *ngIf="editSupplierForm.controls['contactPerson'].errors?.['notUnique']">Supplier name is already exist!</small>
                </div>

                <!-- Contact Number -->
                <div class="form-group">
                  <label> Contact Number </label>
                  <input type="text" class="form-control" formControlName="contactNumber">
                  <!-- <small class="error-message" *ngIf="editSupplierForm.controls['contactNumber'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- Email -->
                <div class="form-group">
                  <label> E-Mail </label>
                  <input type="text" class="form-control" formControlName="email">
                  <!-- <small class="error-message" *ngIf="editSupplierForm.controls['email'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- GST Number -->
                <div class="form-group">
                  <label> GST Number </label>
                  <input type="text" class="form-control" formControlName="GSTNumber">
                  <!-- <small class="error-message" *ngIf="editSupplierForm.controls['GSTNumber'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- Address -->
                <div class="form-group">
                  <label> Address </label>
                  <input type="text" class="form-control" formControlName="address">
                  <!-- <small class="error-message" *ngIf="editSupplierForm.controls['address'].errors?.['notUnique']">Supplier name is already exist!</small> -->
                </div>

                <!-- Type -->
                <div class="form-group">
                  <label>Type </label>
                  <select class="form-select form-control" aria-label="Default select example" formControlName="type">
                    <option value="Local" class="type-option">Local</option>
                    <option value="Imported" class="type-option">Imported</option>
                  </select>

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

<!-- Modal3 Location-->
<div class="modal modal-lg fade" id="location" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"
  data-bs-backdrop="static" data-bs-keyboard="false">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Location</h5>
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
                <tr class="value-row" *ngFor="let location of locations; let i = index">
                  <th scope="row" class="align-middle col-1">{{i+1}}</th>
                  <td class="align-middle col-4">{{location?.locationName}}</td>
                  <td class="align-middle col-1">
                    <img src="../../../assets/icons/edit.svg" alt="edit icons" class="icons" (click)="editLocation(location)">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="col-lg-6">
            <div class="create-form-container" *ngIf="edit === false">
              <form [formGroup]="createLocationForm" (ngSubmit)="submitLocation()">
                <div class="form-group">
                  <label>Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="locationName">
                  <small class="error-message" *ngIf="createLocationForm.controls['locationName'].errors?.['required'] && createLocationForm.controls['locationName'].touched">This field is Required</small>
                  <small class="error-message" *ngIf="createLocationForm.controls['locationName'].errors?.['notUnique']">Location name is already exist!</small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]=" createLocationForm.invalid">Submit</button>
                </div>
              </form>
            </div>
            <div class="create-form-container" *ngIf="edit ===  true">
              <form [formGroup]="editLocationForm" (ngSubmit)="submitEditLocation()">
                <div class="form-group">
                  <label>Edit Name <span class="required">*</span></label>
                  <input type="text" class="form-control" formControlName="locationName">
                  <small class="error-message" *ngIf="editLocationForm.controls['locationName'].errors?.['required'] && editLocationForm.controls['locationName'].touched">This field is Required</small>
                  <small class="error-message" *ngIf="editLocationForm.controls['locationName'].errors?.['notUnique']">Location name is already exist!</small>
                </div>
                <div class="d-flex justify-content-center">
                  <button type="submit" class="btn btn-submit" [disabled]="editLocationForm.invalid">Update</button>
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
*/
