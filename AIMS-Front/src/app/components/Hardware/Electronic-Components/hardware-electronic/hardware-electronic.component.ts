import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import * as XLSX from 'xlsx';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { nonZeroPositiveIntegerValidator } from 'src/app/validators/custom-validator.validator';

@Component({
  selector: 'app-hardware-electronic',
  templateUrl: './hardware-electronic.component.html',
  styleUrls: ['./hardware-electronic.component.css']
})
export class HardwareElectronicComponent {

  inventoryType: any;
  userRights: any;
  employeeRights: any;
  employeeCode: string = '';

  outOfStockComponents: any = [];

  comManufacturers: Array<any> = [];
  comCategories: Array<any> = [];
  comProjects: Array<any> = [];
  comSuppliers: Array<any> = [];
  shelfs: Array<any> = [];
  boxNames: Array<any> = [];

  componentsList: Array<any> = [];

  // csvFile: any;
  excelFile: File | null = null;
  inputFieldsObject: any = {};

  repeatedComponents: any = [];
  parentObject: any = {};
  comCategory: string = '';

  // autoComplete search for export csv
  selectedProject: any;
  checkChoice: boolean = false;

  projectNameList: any;
  categoryNameList: any;
  supplierNameList: any;
  manufacturerNameList: any;
  shelfLocationNameList: any;

  // for open the please wait modal
  isModalOpen = false;

  // csvRawData: any[][] = [];
  csvRawData: any[] = [];
  columnMapping: (string | null)[] = [];

  systemHeaders = [
    { key: 'manufacturerPartNumber', label: 'Manufacturer Part Number', required: true },
    { key: 'manufacturer', label: 'Manufacturer', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'package', label: 'Package', required: true },
    { key: 'projectName', label: 'Project Name', required: true },
    { key: 'quantity', label: 'Quantity', required: true },
    { key: 'supplierName', label: 'Supplier Name', required: false },
    { key: 'supplierPartNo', label: 'Supplier Part No', required: false },
    { key: 'categoryName', label: 'Category Name', required: true },
    { key: 'shelfName', label: 'Shelf Name', required: false },
    { key: 'boxNames', label: 'Box Name', required: false },
    { key: 'comment', label: 'Comment', required: false },
    { key: 'notificationQuantity', label: 'Notification Quantity', required: false }
  ];

  createComponent: FormGroup;

  constructor(private papa: Papa, private database: DatabaseService, private router: Router, private socket: WebsocketService, private authCtx: SessionstorageService) {

    this.createComponent = new FormGroup({
      categoryName: new FormControl(null, [Validators.required]),
      manufacturerPartNumber: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      quantity: new FormControl(null, [Validators.required, nonZeroPositiveIntegerValidator]),
      manufacturerName: new FormControl(null, [Validators.required]),
      package: new FormControl('', [Validators.required]),
      supplierName: new FormControl(null, [Validators.required]),
      supplierPartNumber: new FormControl(''),
      projectName: new FormControl(null, [Validators.required]),
      shelfName: new FormControl(null),
      boxName: new FormControl(null),
      notificationQuantity: new FormControl(0),
      comment: new FormControl('')
    }, {
      validators: this.notificationQuantityValidators
    });

  }

  ngOnInit(): void {
    // Retrieve session data
    let activeData = JSON.parse(sessionStorage.getItem('active') || '{"active": "component"}');
    this.inventoryType = activeData.active;

    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }

      const { user, rights } = ctx
      this.employeeCode = user.employeeCode
      this.employeeRights = user.staffType;
      this.userRights = rights

    });

    // Call methods to retrieve data
    this.getManufacturer();
    this.getCategory();
    this.getProject();
    this.getShelf();
    this.getSupplier();

    // Socket related code (commented out)
    this.socket.emit("notification", null);

    this.socket.listen('notification').subscribe((data) => {
      // console.log(data);
      this.outOfStockComponents = data;
    });

  }

  //For getting manufacturer in component
  getManufacturer() {
    this.database.getAllManufacturer().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.comManufacturers = res.list;      // full manufacturer list
        this.manufacturerNameList = res.nameMap; // id → name map
        console.log("NameMap:", this.manufacturerNameList);
      },
      error: (err) => {
        console.error("Failed to fetch manufacturers", err);
      }
    });
  }

  //For getting categories in component
  getCategory() {
    this.database.getAllCategory().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.comCategories = res.list;
        this.categoryNameList = res.nameMap || {};

        console.log("Categories Loaded:", this.comCategories.length);
        console.log("Category Name Map:", this.categoryNameList);
      },
      error: (err) => {
        console.error("Failed to fetch categories", err);
      }
    });
  }

  //For getting project in component
  getProject() {
    this.database.getAllProject().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.comProjects = res.list;     // full project list
        this.projectNameList = res.nameMap; // id → name mapping

      },
      error: (err) => {
        console.error("Failed to load projects:", err);
      }
    });
  }

  //For getting suppliers in component
  getSupplier() {
    this.database.getAllSupplier().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.comSuppliers = res.list || [];     // full list
        this.supplierNameList = res.nameMap || {}; // id → name map

        console.log("Suppliers:", this.comSuppliers);
        console.log("Supplier Name Map:", this.supplierNameList);
      },
      error: (err) => {
        console.error("Failed to load suppliers:", err);
      }
    });
  }

  //For getting shelf in component
  getShelf() {
    this.database.getAllShelf().subscribe({
      next: (res: any) => {

        if (!res || !res.list || !Array.isArray(res.list)) {
          console.error("Invalid category API response", res);
          return;
        }

        this.shelfs = res.list;       // full shelf list
        this.shelfLocationNameList = res.nameMap; // id → shelfName + boxNames
      },
      error: (err) => {
        console.error("Failed to load shelves", err);
      }
    });
  }



  // Change shelf value
  changeShelfValue() {
    var tempShelf = this.createComponent.value.shelfName;
    this.createComponent.get('boxName')?.setValue(null);
    if (!this.createComponent.value.shelfName) {
      this.boxNames = []
    } else {
      for (let i = 0; i < this.shelfs.length; i++) {
        if (tempShelf === this.shelfs[i]._id) {
          this.boxNames = this.shelfs[i].boxNames;
        }
      }
    }
  }

  // submit create components
  //done with notification quantity
  submitCreateComponent() {
    var updatedComponent = {
      amc: null,
      creator: this.employeeCode,
      // name: this.createComponent.value.componentName,
      package: this.createComponent.value.package.trim(),
      description: this.createComponent.value.description.trim(),
      totalQuantity: this.createComponent.value.quantity,
      stockDetails: [{
        projectName: this.createComponent.value.projectName,
        quantity: this.createComponent.value.quantity,
        // modifier: sessionStorage.getItem('employeeCode'),
        modifier: this.employeeCode,
        modifiedDate: new Date,
        locationDetail: {
          shelfName: this.createComponent.value.shelfName,
          boxNames: this.createComponent.value.boxName,
        },
        notificationQuantity: this.createComponent.value.notificationQuantity,
      }],
      manufacturer: this.createComponent.value.manufacturerName,
      manufacturerPartNumber: this.createComponent.value.manufacturerPartNumber.trim(),
      projectName: this.createComponent.value.projectName,
      categoryName: this.createComponent.value.categoryName,
      comment: this.createComponent.value.comment
    }
    var supplierDetails = {
      supplierPartNo: this.createComponent.value.supplierPartNumber,
      supplierName: this.createComponent.value.supplierName,
    }
    this.database.postDashComponentData({ updatedComponent, supplierDetails }).subscribe((data: any) => {
      if (data.message) {
        $('#closeModalCreate').click();
        this.pageRefresh();
      }
    })
  }

  // Clear component form
  clearComponentForm() {
    $('#closeModalUpload').click();
    $('#closeSuccessModal').click();
    this.createComponent.reset()
    this.repeatedComponents = []
    // Reset the notificationQuantity FormControl to 0
    this.createComponent.get('notificationQuantity')?.setValue(0);
    // this is remove the value of the select input field
    let csvInputField = document.getElementsByName('componentCsvFile')[0] as HTMLInputElement
    csvInputField.value = ''
  }

  // Open module
  openModal() {
    this.isModalOpen = true;
  }

  // Example method to close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  //select csv file for component

  selectComponentExcelFile(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xls' && ext !== 'xlsx') {
      alert('Only Excel files (.xls, .xlsx) are allowed');
      event.target.value = '';
      return;
    }

    this.excelFile = file;
  }



  submitExcelFile() {
    if (!this.excelFile) {
      alert('No file selected');
      return;
    }

    // this.openModal();

    const reader = new FileReader();
    reader.readAsArrayBuffer(this.excelFile);

    reader.onload = () => {
      try {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet → array of arrays (same structure as CSV)
        // this.csvRawData = XLSX.utils.sheet_to_json(worksheet, {
        //   header: 1,
        //   defval: ''
        // }).slice(1) as any[];

        const sheetData: any[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false
        });

        if (!sheetData.length) {
          // this.closeModal();
          alert('Excel file is empty');
          return;
        }

        const excelHeaders = sheetData[0].map((h: any) =>
          String(h).toLowerCase().trim()
        );
        this.csvRawData = sheetData.slice();

        if (!this.csvRawData.length) {
          alert('Excel file is empty');
          return;
        }
        this.initializeSequentialMapping(excelHeaders.length);
        $('#csvPreviewModal').modal('show');

      } catch (err) {
        alert('Invalid Excel file');
      }
    };
  }

  initializeSequentialMapping(columnCount: number) {
    this.columnMapping = Array.from({ length: columnCount }, (_, i) => {
      return this.systemHeaders[i]?.key || null;
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  isMapped(key: string, currentIndex: number): boolean {
    return this.columnMapping.some(
      (mappedKey, idx) => mappedKey === key && idx !== currentIndex
    );
  }

  onMapChange(index: number, key: string) {
    this.columnMapping[index] = key || null;
  }

  confirmMapping() {
    this.openModal();
    const requiredKeys = this.systemHeaders
      .filter(h => h.required)
      .map(h => h.key);

    const missing = requiredKeys.filter(
      key => !this.columnMapping.includes(key)
    );

    if (missing.length) {
      this.closeModal()
      alert('Required fields missing: ' + missing.join(', '));
      return;
    }

    $('#csvPreviewModal').modal('hide');
    this.buildJsonFromMapping();
  }

  buildJsonFromMapping() {
    const mappedRows: any[] = [];
    this.csvRawData.slice(1).forEach((row, rowIndex) => {
      let obj: any = {};
      row.forEach((cell: any, colIndex: number) => {
        const key = this.columnMapping[colIndex];
        if (key) {
          // obj[key] = cell?.trim();
          obj[key] = typeof cell === 'string' ? cell.trim() : cell;
        }
      });

      if (Object.keys(obj).length === 0) {
        return;
      }
      mappedRows.push(obj);
    });

    this.processMappedComponentData(mappedRows);
  }

  processMappedComponentData(mappedRows: any[]) {
    let componentDataArray: any[] = [];
    let componentDataMap: any = {};
    let checkComponentArray: any[] = [];
    let keyValueCheck: any[] = [];

    const manufacturerMap = new Map(this.comManufacturers.map((m: any) => [m.name, m._id]));
    const categoryMap = new Map(this.comCategories.map((c: any) => [c.name, c._id]));
    const projectMap = new Map(this.comProjects.map((p: any) => [p.name, p._id]));
    const supplierMap = new Map(this.comSuppliers.map((s: any) => [s.name, s._id]));
    const shelfMap = new Map(this.shelfs.map((s: any) => [s.shelfName, s._id]));

    const boxNamesMap = new Map();
    this.shelfs.forEach(shelf => {
      shelf.boxNames?.forEach((box: any) => {
        boxNamesMap.set(box.name.toLowerCase().trim(), box._id);
      });
    });

    mappedRows.forEach((row, index) => {
      const hasAnyValue = Object.values(row).some(
        v => v !== null && v !== undefined && String(v).trim() !== ''
      );

      if (!hasAnyValue) {
        return;
      }

      const manufacturerPartNumber = row.manufacturerPartNumber;
      const manufacturerName = row.manufacturer;
      const description = row.description;
      const packageType = row.package;
      const projectName = row.projectName;
      const quantity = Number(row.quantity);
      const notificationQuantity = Number(row.notificationQuantity || 0);
      const supplierName = row.supplierName;
      const supplierPartNo = row.supplierPartNo;
      const categoryName = row.categoryName;
      const shelfName = row.shelfName;
      const boxName = row.boxNames?.toLowerCase().trim();
      const comment = row.comment || null;

      // ===== REQUIRED FIELD VALIDATION =====
      [
        ['manufacturerPartNumber', manufacturerPartNumber],
        ['manufacturer', manufacturerName],
        ['description', description],
        ['package', packageType],
        ['projectName', projectName],
        ['quantity', quantity],
        ['categoryName', categoryName],
      ].forEach(([key, value]) => {
        if (!value) {
          keyValueCheck.push({
            row: index + 2,
            key,
            message: `Missing ${key}`
          });
        }
      });

      if (!Number.isInteger(quantity)) {
        keyValueCheck.push({
          row: index + 2,
          key: 'quantity',
          message: 'Quantity must be a whole number (no decimals allowed)'
        });
      }

      if (!Number.isInteger(notificationQuantity)) {
        keyValueCheck.push({
          row: index + 2,
          key: 'notificationQuantity',
          message: 'Notification quantity must be a whole number (no decimals allowed)'
        });
      }

      if (quantity <= 0) {
        keyValueCheck.push({
          row: index + 2,
          key: 'quantity',
          message: 'Quantity must be greater than 0'
        });
      }

      if (notificationQuantity >= quantity) {
        keyValueCheck.push({
          row: index + 2,
          key: 'notificationQuantity',
          message: 'Notification quantity cannot be greater than quantity'
        });
      }

      // ===== LOOKUPS =====
      const manufacturer = manufacturerMap.get(manufacturerName);
      if (!manufacturer) {
        keyValueCheck.push({
          row: index + 2,
          key: 'manufacturer',
          message: `Invalid manufacturer: ${manufacturerName}`
        });
      }

      const category = categoryMap.get(categoryName);
      if (!category) {
        keyValueCheck.push({
          row: index + 2,
          key: 'categoryName',
          message: `Invalid category: ${categoryName}`
        });
      }

      const project = projectMap.get(projectName);
      if (!project) {
        keyValueCheck.push({
          row: index + 2,
          key: 'projectName',
          message: `Invalid project: ${projectName}`
        });
      }

      const supplier = supplierName ? supplierMap.get(supplierName) : null;
      const shelf = shelfName ? shelfMap.get(shelfName) : null;
      const boxId = boxName ? boxNamesMap.get(boxName) : null;

      checkComponentArray.push({
        package: packageType,
        description,
        manufacturer,
        manufacturerPartNumber,
        categoryName: category,
        projectName: project,
        quantity,
        supplierName: supplier,
        supplierPartNo
      });

      const stockDetail = {
        projectName: project,
        quantity,
        // modifier: sessionStorage.getItem('employeeCode'),
        modifier: this.employeeCode,
        modifiedDate: new Date(),
        locationDetail: {
          shelfName: shelf,
          boxNames: boxId
        },
        supplierName: supplier,
        supplierPartNo,
        notificationQuantity
      };

      if (componentDataMap[manufacturerPartNumber]) {
        componentDataMap[manufacturerPartNumber].stockDetails.push(stockDetail);
        componentDataMap[manufacturerPartNumber].totalQuantity += quantity;
      } else {
        componentDataMap[manufacturerPartNumber] = {
          // creator: sessionStorage.getItem('employeeCode'),
          creator: this.employeeCode,
          package: packageType,
          description,
          totalQuantity: quantity,
          stockDetails: [stockDetail],
          manufacturer,
          manufacturerPartNumber,
          categoryName: category,
          comment
        };
        componentDataArray.push(componentDataMap[manufacturerPartNumber]);
      }
    });

    if (keyValueCheck.length) {
      this.closeModal()
      alert(keyValueCheck.map(e => `Row ${e.row}: ${e.message}`).join('\n'));
      return;
    }
    this.parentObject = { components: componentDataArray };
    this.database.checkUploadComponentCSV(checkComponentArray).subscribe((data: any) => {

      if (data.components?.length > 0) {
        this.repeatedComponents = data.components;
        $('#successModalButton').click();
        return;
      }

      this.database.uploadComponentCSV(this.parentObject).subscribe((res: any) => {
        if (res.status === 'success') {
          alert(res.message);
          $('#closeModalUpload').click();
          this.pageRefresh();
        } else {
          this.closeModal()
          alert(res.error.message);
        }
      });
    });
  }

  // Confirmation for upload csv
  confirmUpload() {
    this.database.uploadComponentCSV(this.parentObject).subscribe({
      next: (data: any) => {
        // Always close modal first (single source of truth)
        this.closeModal();
        $('#closeModalUpload').click();
        $('#closeSuccessModal').click();

        if (!data) {
          alert('No response from server');
          return;
        }

        if (data.status === 'success') {
          alert(data.message || 'Upload successful');
        } else {
          alert(data.error || data.message || 'Upload failed');
        }
      },
      error: (err) => {
        this.closeModal();
        $('#closeModalUpload').click();
        $('#closeSuccessModal').click();

        const errorMessage =
          err?.error?.message ||
          err?.error?.error ||
          err?.message ||
          'Server error during upload';
        alert(errorMessage);
      }
    });
  }

  //Submit Export csv for Component
  // exportCSVFile() {
  //   let exportData = {
  //     selectedProject: this.selectedProject,
  //     checkChoice: this.checkChoice
  //   }
  //   this.database.exportProjectData(exportData).subscribe((data: any) => {
  //     if (data.error) {
  //       return alert(data.error)
  //     }

  //     // let excelData
  //     // if (exportData.checkChoice === false) {
  //     //   excelData = this.formatComponentDataToCSV(data.histories);
  //     // } else {
  //     //   excelData = this.formatComponentDataWithHistoriesToCSV(data.histories);
  //     // }
  //     // this.downloadCSV(excelData, 'components.csv');
  //   })
  // }


  // exportCSVFile() {
  //   this.database.exportProjectData({
  //     selectedProject: this.selectedProject,
  //     checkChoice: this.checkChoice
  //   }).subscribe(blob => {
  //     const url = window.URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = 'components.xlsx';
  //     a.click();
  //     URL.revokeObjectURL(url);
  //   });
  // }

  exportCSVFile() {

    if (!this.selectedProject) {
      alert("Please select a project to proceed with the export.");
      return;
    }

    this.database.exportProjectData({
      selectedProject: this.selectedProject,
      checkChoice: this.checkChoice
    }).subscribe({

      next: (blob: Blob) => {

        // Download file
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'components.xlsx';
        a.click();
        URL.revokeObjectURL(url);

        // ✅ Close modal after success
        this.closeExportModal();
      },

      error: (err) => {
        console.error(err);
        alert("Something went wrong while exporting file.");

        // ❌ Close modal even on error
        this.closeExportModal();
      }

    });
  }

  closeExportModal() {
    const modalElement = document.getElementById('exampleModalExport');
    if (modalElement) {
      const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }

    this.resetExportForm();
  }

  resetExportForm() {
    this.selectedProject = null;
    this.checkChoice = false;
  }

  //Export csv with histories in Component
  // formatComponentDataWithHistoriesToCSV(histories: any) {
  //   let csvContent = 'Manufacturer Part No, Manufacturer, Description, package, Project Name, Quantity, Category Name, Shelf, Box, Comment\n';
  //   histories.forEach((componentHistory: any) => {
  //     componentHistory.component.stockDetails.forEach((stockDetail: any) => {
  //       // if (stockDetail.projectName === this.selectedProject._id) {
  //       if (stockDetail.projectName === this.selectedProject) {
  //         const manufacturer = this.manufacturerNameList[componentHistory.component.manufacturer] || 'null';
  //         const projectName = this.projectNameList[stockDetail.projectName] || 'null';
  //         const categoryName = this.categoryNameList[componentHistory.component.categoryName] || 'null';
  //         const shelfName = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.shelfName || 'null';
  //         const boxNames = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.boxNames[stockDetail.locationDetail.boxNames] || 'null';
  //         const comment = componentHistory.component.comment || 'null'
  //         csvContent += `${componentHistory.component.manufacturerPartNumber}, ${manufacturer}, ${componentHistory.component.description}, ${componentHistory.component.package}, ${projectName}, ${stockDetail.quantity}, ${categoryName}, ${shelfName}, ${boxNames}, ${comment}\n`;

  //         csvContent += '\n';

  //         csvContent += 'Transaction Type, Quantity, Inventory Handler, Issue To, Supplier Name, Supplier Part No, Note, Date\n';
  //         componentHistory.historys.forEach((history: any) => {
  //           console.log("history data:", history)
  //           const transactionType = history.transactionType || 'null';
  //           const quantity = history.quantity || 'null';
  //           const inventoryHandler = history.inventoryHandler || 'null';
  //           const issueTo = `${history?.issuedTo?.employeeCode ?? ''} ${history?.issuedTo?.loginId ?? ''}`.trim() || 'null';

  //           const supplierName = this.supplierNameList[history.supplierName] || 'null';
  //           const supplierPartNo = history.supplierPartNo || 'null';
  //           const note = history.note || 'null';
  //           const date = history.date ? new Date(history.date).toLocaleString() : 'null';

  //           csvContent += `${transactionType}, ${quantity}, ${inventoryHandler}, ${issueTo}, ${supplierName}, ${supplierPartNo}, ${note}, ${date}\n`;
  //         });

  //         // Add a blank line between each component and its history
  //         csvContent += '\n\n';

  //       }
  //     })
  //   })

  //   return csvContent
  // }

  // //Export csv without stock histories in Component
  // formatComponentDataToCSV(histories: any) {
  //   let csvContent = 'Manufacturer Part No, Manufacturer, Description, package, Project Name, Quantity, Category Name, Shelf, Box, Comment\n';
  //   histories.forEach((componentHistory: any) => {
  //     componentHistory.component.stockDetails.forEach((stockDetail: any) => {
  //       if (stockDetail.projectName === this.selectedProject) {
  //         // Replace undefined values with null
  //         const manufacturer = this.manufacturerNameList[componentHistory.component.manufacturer] || 'null';
  //         const projectName = this.projectNameList[stockDetail.projectName] || 'null';
  //         const categoryName = this.categoryNameList[componentHistory.component.categoryName] || 'null';
  //         const shelfName = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.shelfName || 'null';
  //         const boxNames = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.boxNames[stockDetail.locationDetail.boxNames] || 'null';

  //         csvContent += `${componentHistory.component.manufacturerPartNumber}, ${manufacturer}, ${componentHistory.component.description},${componentHistory.component.package}, ${projectName}, ${stockDetail.quantity}, ${categoryName}, ${shelfName}, ${boxNames}, ${componentHistory.component.comment}\n`;
  //       }
  //     });
  //   });

  //   return csvContent;
  // }

  //For download csv
  // downloadCSV(csvData: any, filename: string) {
  //   let blob = new Blob([csvData], { type: 'text/csv' })
  //   let url = window.URL.createObjectURL(blob)
  //   let a = document.createElement('a');
  //   console.log(a)
  //   a.setAttribute('href', url);
  //   a.setAttribute('download', filename)
  //   a.click();
  // }

  //For Checking of manufacturer part no in Component
  checkManufacturerPartNo() {
    this.database.checkManufacturerPartNo(this.createComponent.value.manufacturerPartNumber).subscribe((data: any) => {
      if (data === false) {
        this.createComponent.get('manufacturerPartNumber')?.setErrors({ notUnique: true });
      }
    })
  }

  // page reload
  pageRefresh() {
    window.location.reload()
  }

  // page reload for IT-Inventory
  pageRefreshIT() {
    window.location.reload()
  }

  //validator for 0 and negative quantizes in Component
  nonZeroPositiveValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value <= 0) {
      return { nonZeroPositive: true };
    }
    return null;
  }

  //Notification quantity validator
  notificationQuantityValidators(control: AbstractControl) {
    let notificationQuantity = control.get('notificationQuantity')?.value;
    let quantity = control.get('quantity')?.value
    if (notificationQuantity < 0 || notificationQuantity >= quantity) {
      return { greaterThanQuantity: true };
    }
    return null
  }

}
