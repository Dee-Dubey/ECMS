import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { Papa } from 'ngx-papaparse';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-it-department',
  templateUrl: './it-department.component.html',
  styleUrls: ['./it-department.component.css']
})
export class ItDepartmentComponent {

  inventoryType: any;

  userRights: any;
  employeeRights: any;
  employeeCode: string = '';
  outOfStockComponents: any = []

  comManufacturers: Array<any> = []
  comCategories: Array<any> = []
  comProjects: Array<any> = []
  comSuppliers: Array<any> = []
  shelfs: Array<any> = []
  boxNames: Array<any> = []

  componentsList: Array<any> = []

  csvFile: any
  inventoryCsvFile: any

  categories: any = [];
  subCategoryList: any = [];
  subCategoriesData: any = [];

  inputFieldsObject: any = {}

  supplierList: any = []
  manufacturerList: any = []

  repeatedComponents: any = []
  parentObject: any = {}

  comCategory: string = ''

  // autoComplete search for export csv
  keyword = 'name';
  selectedProject: any;
  checkChoice: boolean = false

  projectNameList: any
  categoryNameList: any
  supplierNameList: any
  manufacturerNameList: any
  shelfLocationNameList: any

  ITSubCategoryNameList: any
  ITCategoryNameList: any
  ITSupplierNameList: any
  ITManufacturerNameList: any

  serialNumberInput: string = "";
  serialNumberArray: any = []

  categoryName: string | null = null;
  subCategoryName: string | null = null;
  subCategoryArray: Array<any> = []



  // for open the please wait modal
  isModalOpen = false;

  categorySubcategoryMap: Map<string, Set<string>> = new Map();

  inventorySubCategory: any = [];

  createInventory: FormGroup

  constructor(private papa: Papa, private database: DatabaseService, private router: Router, private socket: WebsocketService, private authCtx: SessionstorageService) {

    this.createInventory = new FormGroup({
      categoryName: new FormControl(null, [Validators.required]),
      subCategoryName: new FormControl(null, [Validators.required]),
      status: new FormControl('0', [Validators.required]),
      supplier: new FormControl(null, [Validators.required]),
      purchaseDate: new FormControl(''),
      amount: new FormControl('', [Validators.required]),
      warrantyDate: new FormControl(''),
      manufacturer: new FormControl(null, [Validators.required]),
      modelNo: new FormControl(''),
      serialNo: new FormControl([]),
      quantity: new FormControl(1),
      inputVoltage: new FormControl(''),
      key: new FormControl(''),
      subscriptionStart: new FormControl(''),
      subscriptionEnd: new FormControl(''),
      cpu: new FormControl(''),
      ram: new FormControl(''),
      drive: new FormControl(''),
      systemConfig: new FormControl(''),
      licenseInEff: new FormControl(''),
      msInEff: new FormControl(''),
      ipAddress: new FormControl(''),
      internetAccess: new FormControl(''),
      softwareInstalled: new FormControl(''),
      lastUse: new FormControl(''),
      description: new FormControl(''),
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

      const { user, rights } = ctx;
      this.employeeCode = user.employeeCode;
      this.employeeRights = user.staffType;
      this.userRights = rights || {};
    });

    // IT Inventory data subscriptions
    this.database.getITCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          // Store both formats for flexible use
          this.categories = res.data.list; // Array form
          this.ITCategoryNameList = res.data.map;   // Key-value form
        } else {
          this.categories = [];
          this.ITCategoryNameList = {};
        }
      },
      error: (err) => {
        console.error('Failed to fetch IT category name list:', err);
        this.categories = [];
        this.ITCategoryNameList = {};
      }
    });

    this.database.getITSupplierNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.ITSupplierNameList = res.data.map;
          this.supplierList = res.data.list;
        } else {
          console.warn('No supplier data found or invalid response:', res);
          this.ITSupplierNameList = {};
          this.supplierList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching supplier names:', err);
        this.ITSupplierNameList = {};
        this.supplierList = [];
      }
    });

    this.database.getITSubCategoryNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.subCategoriesData = res.data.list || [];
          this.ITSubCategoryNameList = res.data.map || {};
        } else {
          console.warn('No subcategories found or invalid response:', res);
          this.subCategoriesData = [];
          this.ITSubCategoryNameList = {};
        }

        console.log('Subcategories loaded:', this.subCategoriesData);
      },
      error: (err) => {
        console.error('Error fetching subcategory data:', err);
        this.subCategoriesData = [];
        this.ITSubCategoryNameList = {};
      }
    });

    this.database.getITManufacturerNameList().subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.ITManufacturerNameList = res.data.map;
          this.manufacturerList = res.data.list;
        } else {
          console.warn('No manufacturer data found or invalid response:', res);
          this.ITManufacturerNameList = {};
          this.manufacturerList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching manufacturer names:', err);
        this.ITManufacturerNameList = {};
        this.manufacturerList = [];
      }
    });

    // Socket related code (commented out)
    this.socket.emit("notification", null);
    this.socket.listen('notification').subscribe((data) => {
      // console.log(data);
      this.outOfStockComponents = data;
    });

  }

  //For change Category in IT-Inventory
  changeCategory() {
    this.inputFieldsObject = {};
    this.subCategoryList = []
    const selectedCategory = this.createInventory.value.categoryName
    this.subCategoriesData.forEach((subCategory: any) => {
      if (subCategory.categoryName._id === selectedCategory) {
        this.subCategoryList.push(subCategory)
      }
    });
  }

  //Change Sub category in IT-Inventory
  changeSubCategory() {
    this.inputFieldsObject = {};
    // Assuming this.createInventory.value.subCategoryName contains the _id you're looking for
    const subCategory = this.subCategoriesData.find((subCategory: any) => subCategory._id === this.createInventory.value.subCategoryName);
    if (subCategory) {
      this.inputFieldsObject = subCategory.fields;
    }
  }

  //submit create inventory
  submitCreateInventory() {
    console.log(this.createInventory.value);
    if (this.createInventory.value.serialNo.length > 0 && this.createInventory.value.serialNo.length !== this.createInventory.value.quantity) {
      alert("Please enter serial numbers equal to the quantity of items that has been set.");
      return;
    }
    /*---------------------------------------------------------------------------*/
    let purchaseDateString = this.createInventory.value.purchaseDate;
    let purchasedDateResult;
    if (purchaseDateString) {
      purchasedDateResult = new Date(purchaseDateString);
    } else {
      purchasedDateResult = '';
    }
    /*---------------------------------------------------------------------------*/
    let warrantyDateString = this.createInventory.value.warrantyDate;
    let warrantyDateResult;
    if (warrantyDateString) {
      warrantyDateResult = new Date(warrantyDateString);
    } else {
      warrantyDateResult = '';
    }
    /*---------------------------------------------------------------------------*/
    let subscriptionStartDateString = this.createInventory.value.subscriptionStart;
    let subscriptionStartDateResult;
    if (subscriptionStartDateString) {
      subscriptionStartDateResult = new Date(subscriptionStartDateString);
    } else {
      subscriptionStartDateResult = '';
    }
    /*---------------------------------------------------------------------------*/
    let subscriptionEndDateString = this.createInventory.value.subscriptionEnd;
    let subscriptionEndDateResult;
    if (subscriptionEndDateString) {
      subscriptionEndDateResult = new Date(subscriptionEndDateString);
    } else {
      subscriptionEndDateResult = '';
    }
    /*---------------------------------------------------------------------------*/
    let quantity = this.createInventory.value.quantity || '';
    let inventory = {
      creator: this.employeeCode,
      categoryName: this.createInventory.value.categoryName,
      subCategoryName: this.createInventory.value.subCategoryName,
      description: this.createInventory.value.description || '',
      status: this.createInventory.value.status || '',
      supplier: this.createInventory.value.supplier || '',
      purchaseDate: purchasedDateResult,
      amount: this.createInventory.value.amount || '',
      warrantyDate: warrantyDateResult,
      manufacturer: this.createInventory.value.manufacturer || '',
      modelNo: this.createInventory.value.modelNo || '',
      serialNo: this.createInventory.value.serialNo || '',
      inputVoltage: this.createInventory.value.inputVoltage || '',
      key: this.createInventory.value.key || '',
      subscriptionStart: subscriptionStartDateResult,
      subscriptionEnd: subscriptionEndDateResult,
      cpu: this.createInventory.value.cpu || '',
      ram: this.createInventory.value.ram || '',
      drive: this.createInventory.value.drive || '',
      systemConfig: this.createInventory.value.systemConfig || '',
      licenseInEff: this.createInventory.value.licenseInEff || '',
      msEffect: this.createInventory.value.msEffect || '',
      ipAddress: this.createInventory.value.ipAddress || '',
      internetAccess: this.createInventory.value.internetAccess || '',
      softwareInstalled: this.createInventory.value.softwareInstalled || '',
      lastUse: this.createInventory.value.lastUse || '',
      transactionType: 'create',
      user: null,
    }

    // this.database.postDashInventory(inventory, quantity).subscribe((data: any) => {
    //   if (data.message) { // Assuming your API returns { success: true/false }
    //     this.pageRefreshIT()
    //   }
    // });
    this.database.postDashInventory(inventory, quantity)
      .subscribe({
        next: (res: any) => {
          if (res?.success === true) {
            this.pageRefreshIT(); // or update state instead of full refresh
          } else {
            console.error('Inventory API failed:', res);
            alert(res?.message || 'Inventory update failed');
          }
        },

        error: (err) => {
          console.error('HTTP Error:', err);
          alert('Server error. Please try again.');
        },

        complete: () => {
          this.pageRefreshIT();
        }
      });

  }

  // Clear inventory CSV form
  clearInventoryCsvForm() {
    $('#closeModalUpload').click();
    this.createInventory.reset();
    this.createInventory.get('quantity')?.patchValue(1);
    this.createInventory.get('status')?.setValue(0);
    this.inputFieldsObject = {};
    this.subCategoryList = [];
    let inventoryCsvInputField = document.getElementsByName('inventoryCsvFile')[0] as HTMLInputElement
    inventoryCsvInputField.value = '';
  }

  // Open Modal
  openModal() {
    this.isModalOpen = true;
  }

  // Example method to close the modal
  closeModal() {
    this.isModalOpen = false;
  }

  //select csv file for component
  selectComponentCSVFile(event: any) {
    if (event.target.files.length > 0) {
      this.csvFile = event.target.files[0]
    }
  }

  //Submit Component through upload csv
  submitCSVFile() {
    if (!this.csvFile) {
      alert('No file selected');
      return;
    }
    let formData = new FormData();
    formData.append('file', this.csvFile);

    let reader = new FileReader();
    reader.readAsText(this.csvFile);
    reader.onload = () => {

      this.openModal(); // Open wait modal

      this.papa.parse(reader.result as string, {
        complete: (parsedData: any) => {
          let componentJsonData = parsedData.data;
          let keyArray: any = [];
          let keyValueCheck: any = [];
          const standardComponentArray = [
            'manufacturerPartNumber', 'manufacturer', 'description', 'package',
            'projectName', 'quantity', 'supplierName', 'supplierPartNo',
            'categoryName', 'shelfName', 'boxNames', 'comment',
            'notificationQuantity'
          ];


          // Get the keys from the header row
          componentJsonData.forEach((row: any, index: number) => {

            // console.log('row , index', row, index)

            if (index === 0) {
              // console.log('row of index 0', row)
              row.forEach((keyString: any) => {
                keyArray.push(keyString.replace(/\s/g, ''));
              });
              // Check if all required keys are present
              let missingKeys = standardComponentArray.filter(value => !keyArray.includes(value));
              if (missingKeys.length > 0) {
                console.error('Missing keys:', missingKeys);
                return;
              }
            }
          });

          let componentDataArray: any[] = [];
          let componentDataMap: any = {}; // To track existing components by manufacturerPartNumber

          // Check Component data
          let checkComponentArray: any = []

          // Create maps for validation and replacement
          let manufacturerMap = new Map(this.comManufacturers.map((m: any) => [m.name, m._id]));
          let categoryMap = new Map(this.comCategories.map((c: any) => [c.name, c._id]));
          let projectMap = new Map(this.comProjects.map((p: any) => [p.name, p._id]));
          let supplierMap = new Map(this.comSuppliers.map((s: any) => [s.name, s._id]));
          let shelfMap = new Map(this.shelfs.map((s: any) => [s.shelfName, s._id]));

          // get the manufacturer data and map manufacturer name with the manufacturerId and other also
          // console.log('manufacturermap, categoryMap, projectMap, supplierMap, shelfMap', manufacturerMap, categoryMap, projectMap, supplierMap, shelfMap)

          // Create a map for box names to box IDs
          let boxNamesMap = new Map();
          this.shelfs.forEach((shelf) => {
            if (shelf.boxNames) {
              shelf.boxNames.forEach((box: any) => {
                boxNamesMap.set(box.name.toLowerCase().trim(), box._id);
              });
            }


            // console.log('box name map', boxNamesMap)

          });

          //getting the data of the component data with the component header
          // console.log('component Json data', componentJsonData)

          componentJsonData.forEach((row: any, index: number) => {


            // console.log('row', row)

            // Skip empty rows and cell which is having empty string
            if (index > 0 && row.length && row.some((cell: any) => cell !== '')) {

              // console.log('row', row)

              // Trim spaces from each field
              row = row.map((field: any) => field ? field.trim() : field);


              // console.log('row after trim', row)

              let manufacturerPartNumberIndex = keyArray.indexOf('manufacturerPartNumber');
              let manufacturerPartNumber = row[manufacturerPartNumberIndex];
              let projectName = row[keyArray.indexOf('projectName')];
              let quantity = parseInt(row[keyArray.indexOf('quantity')]);

              let notificationQuantity = parseInt(row[keyArray.indexOf('notificationQuantity')]) || 0;
              // if (!manufacturerPartNumber) {
              //   keyValueCheck.push({ row: index, key: 'manufacturerPartNumber', message: 'Missing manufacturerPartNumber' });
              //   return;
              // }

              // if (!projectName) {
              //   keyValueCheck.push({ row: index, key: 'projectName', message: 'Missing projectName' });
              // }

              // if (!quantity) {
              //   keyValueCheck.push({ row: index, key: 'quantity', message: 'Missing or invalid quantity' });
              // }

              // Normalize box name from CSV
              let boxName = row[keyArray.indexOf('boxNames')] ? row[keyArray.indexOf('boxNames')].toLowerCase().trim() : null;

              // Use the box name to retrieve the corresponding ID from the boxNamesMap
              let boxId = boxName ? boxNamesMap.get(boxName) : null;

              // console.log('boxId', boxId)

              // Validation for missing required fields
              const requiredFields = ['manufacturerPartNumber', 'description', 'package', 'manufacturer', 'projectName', 'quantity', 'categoryName'];
              requiredFields.forEach(field => {
                let fieldIndex = keyArray.indexOf(field);
                if (!row[fieldIndex]) {
                  keyValueCheck.push({ row: index + 1, key: field, message: `Missing ${field}` });
                }
              });

              // Replace names with _id for manufacturer, supplier, category
              let manufacturerName = row[keyArray.indexOf('manufacturer')];
              let manufacturer = manufacturerMap.get(manufacturerName);
              if (!manufacturer) {
                keyValueCheck.push({ row: index + 1, key: 'manufacturer', message: `Invalid manufacturer: ${manufacturerName}` });
              }

              let supplierName = row[keyArray.indexOf('supplierName')];
              let supplier = supplierMap.get(supplierName);
              if (!supplier) {
                keyValueCheck.push({ row: index + 1, key: 'supplierName', message: `Invalid supplier: ${supplierName}` });
              }

              let supplierPartNo = row[keyArray.indexOf('supplierPartNo')];
              // if (!supplierPartNo) {
              //     keyValueCheck.push({ row: index, key: 'supplierPartNo', message: 'Missing supplierPartNo' });
              // }

              let categoryName = row[keyArray.indexOf('categoryName')];
              let category = categoryMap.get(categoryName);
              if (!category) {
                keyValueCheck.push({ row: index + 1, key: 'categoryName', message: `Invalid category: ${categoryName}` });
              }

              let project = projectMap.get(projectName);
              if (!project) {
                keyValueCheck.push({ row: index + 1, key: 'projectName', message: `Invalid project: ${projectName}` });
              }

              let shelfName = row[keyArray.indexOf('shelfName')];
              let shelf = shelfMap.get(shelfName);

              // if (keyValueCheck.length > 0) {
              //   return; // Skip this row if there are validation errors
              // }

              // Check if notificationQuantity is greater than quantity
              if (notificationQuantity >= quantity) {
                keyValueCheck.push({ row: index + 1, key: 'notificationQuantity', message: 'Notification quantity cannot be greater than quantity' });
              }

              // Make objecgt to check the component data
              let checkComponentData = {
                footPrint: row[keyArray.indexOf('package')] || null,
                description: row[keyArray.indexOf('description')] || null,
                manufacturer: manufacturer,
                manufacturerPartNumber: manufacturerPartNumber,
                categoryName: category,
                projectName: projectMap.get(projectName) || projectName,
                quantity: quantity,
                supplierName: supplier || null,
                supplierPartNo: supplierPartNo || null,

              }

              // push checkComponentData in the checkComponentArray
              checkComponentArray.push(checkComponentData)


              let stockDetail = {
                projectName: projectMap.get(projectName) || projectName,
                quantity: quantity,
                modifier: this.employeeCode,
                modifiedDate: new Date(),
                locationDetail: {
                  // shelfName: shelfMap.get(row[keyArray.indexOf('shelfName')]) || row[keyArray.indexOf('shelfName')] || null,
                  shelfName: shelf || null,
                  boxNames: boxId || null,
                },
                supplierName: supplier || null,
                supplierPartNo: supplierPartNo || null,
                // notificationQuantity: parseInt(row[keyArray.indexOf('notificationQuantity')]) || null,
                notificationQuantity: notificationQuantity,

              };

              // Check for duplicate based on manufacturerPartNumber, supplierName, projectName, and supplierPartNumber
              let isDuplicate = componentDataArray.some(component => {
                return component.manufacturerPartNumber === manufacturerPartNumber &&
                  component.manufacturer === manufacturer &&
                  component.stockDetails.some((detail: any) => {
                    return detail.projectName === stockDetail.projectName &&
                      detail.supplierName === stockDetail.supplierName
                    //  &&
                    // detail.supplierPartNo === stockDetail.supplierPartNo;
                  });
              });

              if (isDuplicate) {
                keyValueCheck.push({ row: index + 1, message: `Duplicate entry found  of manufacturerPartNumber: ${manufacturerPartNumber}` });
                // return;
              }

              // console.log('component data mapping', componentDataMap)

              if (componentDataMap[manufacturerPartNumber]) {
                let existingComponent = componentDataMap[manufacturerPartNumber];
                existingComponent.stockDetails.push(stockDetail);
                existingComponent.totalQuantity += stockDetail.quantity;
              } else {
                // If the component does not exist, create a new one
                let componentData = {
                  creator: this.employeeCode,
                  footPrint: row[keyArray.indexOf('package')] || null,
                  description: row[keyArray.indexOf('description')] || null,
                  totalQuantity: stockDetail.quantity,
                  stockDetails: [stockDetail],
                  manufacturer: manufacturer,
                  manufacturerPartNumber: manufacturerPartNumber,
                  categoryName: category,
                  // notificationQuantity: parseInt(row[keyArray.indexOf('notificationQuantity')]) || null,
                  comment: row[keyArray.indexOf('comment')] || null,
                };
                componentDataMap[manufacturerPartNumber] = componentData;
                componentDataArray.push(componentData);
              }
            }
          });
          console.log('check Component Array', checkComponentArray)
          this.parentObject = {
            components: componentDataArray,
          };
          // console.log('Parent Object:', parentObject);
          if (keyValueCheck.length > 0) {
            // console.error('Errors:', keyValueCheck);
            let errorMessages = keyValueCheck.map((error: any) => {
              return JSON.stringify(error); // Convert each error object to a formatted string
            }).join('\n'); // Join the array of strings with newline characters
            alert('Errors: ' + errorMessages); // Display the errors in an alert
            this.closeModal(); // Close wait modal
          } else {
            // console.log('Parent Object:', this.parentObject);
            this.database.checkUploadComponentCSV(checkComponentArray).subscribe((data: any) => {
              // console.log('upload component csv file', data)
              if (data.components.length > 0) {
                this.repeatedComponents = data.components
                // console.log('repeated data', this.repeatedComponents)
                this.closeModal();
                $('#successModalButton').click();
              } else if (data.components.length === 0) {
                this.database.uploadComponentCSV(this.parentObject).subscribe((data: any) => {
                  if (data.status === 'success') {
                    this.closeModal(); // Close wait modal on success
                    alert(data.message);
                    $('#closeModalUpload').click();
                    this.pageRefresh();
                  } else {
                    this.closeModal();
                    alert(data.error);
                  }
                });
              } else {
                this.closeModal();
                alert(data.error);
              }
            })
          }
        }
      });
    }
  }

  //Confirmation for upload csv
  confirmUpload() {
    this.openModal(); // Open wait modal
    this.database.uploadComponentCSV(this.parentObject).subscribe((data: any) => {
      console.log('component', data);
      this.closeModal(); // Close wait modal


      if (data.status === 'success') {

        alert(data.message);
        $('#closeModalUpload').click();
        $('#closeSuccessModal').click();
        this.pageRefresh();
      } else {
        this.closeModal(); // Ensure the modal is closed even on error
        alert(data.error);
      }
    });
  }

  //Submit Export csv for Component
  exportCSVFile() {
    let exportData = {
      // selectedProject: this.selectedProject._id,
      selectedProject: this.selectedProject,
      checkChoice: this.checkChoice
    }
    this.database.exportProjectData(exportData).subscribe((data: any) => {
      if (data.error) {
        return alert(data.error)
      }
      if (exportData.checkChoice === false) {
        let csvData = this.formatComponentDataToCSV(data.histories);
        this.downloadCSV(csvData, 'components.csv');
      } else {
        let csvData = this.formatComponentDataWithHistoriesToCSV(data.histories);
        this.downloadCSV(csvData, 'components.csv');
      }
    })
  }

  //Export csv with histories in Component
  formatComponentDataWithHistoriesToCSV(histories: any) {
    let csvContent = 'Manufacturer Part No, Manufacturer, Description, package, Project Name, Quantity, Category Name, Shelf, Box, Comment\n';
    histories.forEach((componentHistory: any) => {
      componentHistory.component.stockDetails.forEach((stockDetail: any) => {
        if (stockDetail.projectName === this.selectedProject) {
          const manufacturer = this.manufacturerNameList[componentHistory.component.manufacturer] || 'null';
          const projectName = this.projectNameList[stockDetail.projectName] || 'null';
          const categoryName = this.categoryNameList[componentHistory.component.categoryName] || 'null';
          const shelfName = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.shelfName || 'null';
          const boxNames = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.boxNames[stockDetail.locationDetail.boxNames] || 'null';
          const comment = componentHistory.component.comment || 'null'
          csvContent += `${componentHistory.component.manufacturerPartNumber}, ${manufacturer}, ${componentHistory.component.description}, ${componentHistory.component.footPrint}, ${projectName}, ${stockDetail.quantity}, ${categoryName}, ${shelfName}, ${boxNames}, ${comment}\n`;

          csvContent += '\n';

          csvContent += 'Transaction Type, Quantity, Inventory Handler, Issue To, Supplier Name, Supplier Part No, Note, Date\n';
          componentHistory.historys.forEach((history: any) => {
            console.log("histoory data:", history)
            const transactionType = history.transactionType || 'null';
            const quantity = history.quantity || 'null';
            const inventoryHandler = history.inventoryHandler || 'null';
            const issueTo = `${history?.issuedTo?.employeeCode ?? ''} ${history?.issuedTo?.loginId ?? ''}`.trim() || 'null';

            const supplierName = this.supplierNameList[history.supplierName] || 'null';
            const supplierPartNo = history.supplierPartNo || 'null';
            const note = history.note || 'null';
            const date = history.date ? new Date(history.date).toLocaleString() : 'null';

            csvContent += `${transactionType}, ${quantity}, ${inventoryHandler}, ${issueTo}, ${supplierName}, ${supplierPartNo}, ${note}, ${date}\n`;
          });

          // Add a blank line between each component and its history
          csvContent += '\n\n';

        }
      })
    })

    return csvContent
  }

  //Export csv without stock histories in Component
  formatComponentDataToCSV(histories: any) {
    let csvContent = 'Manufacturer Part No, Manufacturer, Description, package, Project Name, Quantity, Category Name, Shelf, Box, Comment\n';
    histories.forEach((componentHistory: any) => {
      componentHistory.component.stockDetails.forEach((stockDetail: any) => {
        if (stockDetail.projectName === this.selectedProject) {
          // Replace undefined values with null
          const manufacturer = this.manufacturerNameList[componentHistory.component.manufacturer] || 'null';
          const projectName = this.projectNameList[stockDetail.projectName] || 'null';
          const categoryName = this.categoryNameList[componentHistory.component.categoryName] || 'null';
          const shelfName = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.shelfName || 'null';
          const boxNames = this.shelfLocationNameList[stockDetail.locationDetail.shelfName]?.boxNames[stockDetail.locationDetail.boxNames] || 'null';

          // Construct CSV line with semicolons
          csvContent += `${componentHistory.component.manufacturerPartNumber}, ${manufacturer}, ${componentHistory.component.description},${componentHistory.component.footPrint}, ${projectName}, ${stockDetail.quantity}, ${categoryName}, ${shelfName}, ${boxNames}, ${componentHistory.component.comment}\n`;
        }
      });
    });

    return csvContent;
  }

  //For download csv
  downloadCSV(csvData: any, filename: string) {
    let blob = new Blob([csvData], { type: 'text/csv' })
    let url = window.URL.createObjectURL(blob)
    let a = document.createElement('a');
    console.log(a)
    a.setAttribute('href', url);
    a.setAttribute('download', filename)
    a.click();
  }


  //For selecting inventory csv file
  selectInventoryCSVFile(event: any) {
    this.inventoryCsvFile = event.target.files[0];
  }

  //For submit inventory csv
  submitInventoryCsv() {
    let result: any = [];
    let errorMessage: any = [];

    if (!this.inventoryCsvFile) {
      alert('No file is selected');
      return;
    }

    // Create category to subcategory mapping
    this.createCategorySubcategoryMapping();

    let reader = new FileReader();
    reader.readAsText(this.inventoryCsvFile);
    reader.onload = () => {
      const inventoryCsvData = reader.result as string;
      let lines = inventoryCsvData.split('\n').map(line => line.trim())
        .filter(line => line.length > 0 && line.split(',').some(cell => cell.trim() !== ''));

      let headers = lines[0].split(',').map(header => header.trim());

      for (let i = 1; i < lines.length; i++) {
        let invObj: any = {};
        let currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
          invObj[headers[j]?.trim()] = currentLine[j]?.trim();
        }

        let manufacturerName = invObj['manufacturer'];
        if (manufacturerName) {
          let manufacturerId = Object.keys(this.ITManufacturerNameList).find((key: any) => this.ITManufacturerNameList[key] === manufacturerName);
          if (manufacturerId) {
            invObj['manufacturer'] = manufacturerId;
          } else {
            errorMessage.push(`Row ${i + 1}: Invalid manufacturer '${manufacturerName}'`);
          }
        } else {
          errorMessage.push(`Row ${i + 1}: Missing manufacturer '${manufacturerName}'`);
        }

        // Category validation
        let categoryName = invObj['categoryName'];
        if (categoryName) {
          let categoryId = Object.keys(this.ITCategoryNameList).find((key: any) => this.ITCategoryNameList[key] === categoryName);
          if (categoryId) {
            invObj['categoryName'] = categoryId;
          } else {
            errorMessage.push(`Row ${i + 1}: Invalid category name '${categoryName}'`);
          }
        } else {
          errorMessage.push(`Row ${i + 1}: Missing category name '${categoryName}'`);
        }

        // Subcategory validation
        let subCategoryName = invObj['subCategoryName'];
        if (subCategoryName) {
          let subCategoryId = Object.keys(this.ITSubCategoryNameList).find((key: any) => this.ITSubCategoryNameList[key] === subCategoryName);
          if (subCategoryId) {
            if (this.categorySubcategoryMap.has(categoryName) &&
              !this.categorySubcategoryMap.get(categoryName)!.has(subCategoryName)) {
              errorMessage.push(`Row ${i + 1}: Subcategory '${subCategoryName}' does not match with category '${categoryName}'`);
            }
            invObj['subCategoryName'] = subCategoryId;
          } else {
            errorMessage.push(`Row ${i + 1}: Invalid subcategory name '${subCategoryName}'`);
          }
        } else {
          errorMessage.push(`Row ${i + 1}: Missing subcategory name '${subCategoryName}'`);
        }

        let supplierName = invObj['supplier'];
        if (supplierName) {
          let supplierId = Object.keys(this.ITSupplierNameList).find((key: any) => this.ITSupplierNameList[key] === supplierName);
          if (supplierId) {
            invObj['supplier'] = supplierId;
          } else {
            errorMessage.push(`Row ${i + 1}: Invalid supplier name '${supplierName}'`);
          }
        } else {
          errorMessage.push(`Row ${i + 1}: Missing supplier name '${supplierName}'`);

        }

        // Validate amount and quantity
        if (isNaN(Number(invObj['amount'])) || Number(invObj['amount']) <= 0) {
          errorMessage.push(`Row ${i + 1}: Invalid amount '${invObj['amount']}'`);
        }

        if (isNaN(Number(invObj['quantity'])) || Number(invObj['quantity']) <= 0) {
          errorMessage.push(`Row ${i + 1}: Invalid quantity '${invObj['quantity']}'`);
        }

        let purchaseDate = invObj['purchaseDate'];
        if (purchaseDate) {
          let newPurchaseDate = new Date(purchaseDate);
          invObj['purchaseDate'] = newPurchaseDate;
        } else {
          invObj['purchaseDate'] = '';
        }

        let warrantyDate = invObj['warrantyDate'];
        if (warrantyDate) {
          let newWarrantyDate = new Date(warrantyDate);
          invObj['warrantyDate'] = newWarrantyDate;
        } else {
          invObj['warrantyDate'] = '';
        }

        let subscriptionStart = invObj['subscriptionStart'];
        if (subscriptionStart) {
          let newSubscriptionStartDate = new Date(subscriptionStart);
          invObj['subscriptionStart'] = newSubscriptionStartDate;
        } else {
          invObj['subscriptionStart'] = '';
        }

        let subscriptionEnd = invObj['subscriptionEnd'];
        if (subscriptionEnd) {
          let newSubscriptionEndDate = new Date(subscriptionEnd);
          invObj['subscriptionEnd'] = newSubscriptionEndDate;
        } else {
          invObj['subscriptionEnd'] = '';
        }


        let extraData = {
          creator: this.employeeCode,
          status: '0',
          transactionType: 'create',
          modifiedDate: new Date()
        };

        let combinedObj = {
          ...invObj,
          ...extraData
        };

        result.push(combinedObj);
      }

      if (errorMessage.length > 0) {
        alert('Errors encountered:\n' + errorMessage.join('\n'));
        console.log('Errors:', errorMessage);
        return;
      } else {
        console.log("combined data", result);
        // $('#CSVUploadWaitButton').click()
        this.openModal();
        this.database.uploadInventoryCSV(result).subscribe((data: any) => {
          this.closeModal();
          console.log("sending upload inventory data", data);
          if (data.status === 'success') {
            $('closeWaitModal').click()
            console.log("status", data.status);
            alert(data.message);
            window.location.reload()
            // $('#closeModalUpload').click();
            // this.closeModal();
          } else {
            this.closeModal()
            console.log("error in response", data);
            alert(data.error);
          }
        });
      }

    };
  }

  // Export CSV File functions

  // Populate sub category by changing category
  populateSubcategoryByChangingCategory() {
    if (!this.categoryName) {
      alert('Please select the category');
      this.subCategoryArray = [];
      this.subCategoryName = null;
      return;
    }
    this.subCategoryName = null;
    const selectedCategoryName = this.ITCategoryNameList[this.categoryName];
    this.subCategoryArray = this.subCategoriesData.filter((subcategory: any) => {
      return subcategory.categoryName.name === selectedCategoryName
    })
  }

  exportITAssetCSVFile() {
    if (this.categoryName === '') {
      alert('Please select the category')
      return
    }
    let exportParameter = {
      category: this.categoryName,
      subCategory: this.subCategoryName
    }

    this.database.exportITAssetData(exportParameter).subscribe((data: any) => {
      console.log('data', data)

      if (data.length <= 0) {
        alert('Asset is not found')
        return
      }

      const header = ['Category', 'Subcategory', 'Manufacturer', 'Supplier', 'Asset Id', 'Amount', 'Status', 'Purchase Date', 'Warranty Date', 'Model No', 'Serial No', 'Subcription Start', 'Subscription End'];
      const csvRows = [header.join(',')]

      data.forEach((item: any) => {
        let purchaseDate = item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '--';
        let warrantyDate = item.warrantyDate ? new Date(item.warrantyDate).toLocaleDateString() : '--';
        let subscriptionStart = item.subscriptionStart ? new Date(item.subscriptionStart).toLocaleDateString() : '--';
        let subscriptionEnd = item.subscriptionEnd ? new Date(item.subscriptionEnd).toLocaleDateString() : '--';

        const status = item.status === 0 ? 'Working' :
          item.status === 1 ? 'Dead' :
            item.status === 2 ? 'Repairable' :
              item.status === 3 ? 'Scrap' :
                '--';

        console.log('purchase date and warranty date', purchaseDate, warrantyDate)

        let row = [
          this.ITCategoryNameList[item.categoryName] || '--',
          this.ITSubCategoryNameList[item.subCategoryName] || '--',
          this.ITManufacturerNameList[item.manufacturer] || '--',
          this.ITSupplierNameList[item.supplier] || '--',
          item.code || '--',
          item.amount || '--',
          status,
          purchaseDate,
          warrantyDate,
          item.modelNo || '--',
          item.serialNo || '--',
          subscriptionStart,
          subscriptionEnd
        ]

        csvRows.push(row.join(','))
      });

      let csvString = csvRows.join('\n')

      console.log(csvString)
      let blob = new Blob([csvString], { type: 'text/csv' })
      let url = window.URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url;
      a.download = 'asset_data.csv';

      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    });
  }

  //Mapping category and sub-category in IT-Inventory
  createCategorySubcategoryMapping() {
    this.categorySubcategoryMap = new Map<string, Set<string>>();
    this.subCategoriesData.forEach((item: any) => {
      const categoryName = item.categoryName.name.trim(); // Extract name only
      const subCategoryName = item.subCategoryName.trim(); // Ensure no extra spaces

      if (!this.categorySubcategoryMap.has(categoryName)) {
        this.categorySubcategoryMap.set(categoryName, new Set<string>());
      }
      this.categorySubcategoryMap.get(categoryName)!.add(subCategoryName);
    });
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

  /** Add serial number function*/
  addSerialNumber() {
    const entry = this.serialNumberInput.trim();
    // Validate box name
    if (entry === undefined || entry === "") {
      alert('Please enter a serial number.');
      return;
    }

    if (this.serialNumberArray.some((serial: any) => serial.name === entry) === true) {
      alert('Serial number already exists');
      return;
    }

    // Prepare the box object

    this.serialNumberArray.push(entry);

    this.createInventory.get('serialNo')?.patchValue(this.serialNumberArray);
    this.serialNumberInput = "";
  }

  /** Remove serial number function*/
  removeSerial(index: any) {
    const boxName = this.serialNumberArray[index].name;
    this.serialNumberArray.splice(index, 1)
    this.createInventory.get('serialNo')?.patchValue(this.serialNumberArray);
  }

}
