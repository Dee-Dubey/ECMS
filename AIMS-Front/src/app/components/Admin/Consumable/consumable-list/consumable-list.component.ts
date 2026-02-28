import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DatabaseService } from 'src/app/services/database.service';
import { SessionstorageService } from 'src/app/services/sessionstorage.service';
import { billChallanValidator } from 'src/app/validators/custom-validator.validator';
import { of } from 'rxjs';


@Component({
  selector: 'app-consumable-list',
  templateUrl: './consumable-list.component.html',
  styleUrls: ['./consumable-list.component.css']
})
export class ConsumableListComponent {

  // Export CSV

  // Upload CSV

  // Create consumable

  // Add new item
  itemMap: any;

  isSubmitting = false;
  itemNameList: any = [];
  itemMasterList: any = [];

  allBrandList: any[] = [];
  filteredBrandList: any[] = [];
  showBrandSuggestions = false;




  // Add challan number
  challanMasterList: any[] = [];
  challanNumberList: any[] = [];
  challanMap: any = {};


  // Add bill number

  // Delete History

  userRights: any;
  employeeRights: any;
  consumableCsvFile: any;

  employeeCode: string = '';

  supplierList: any = [];
  shelfLocation: any = [];
  brandList: any[] = [];
  companyList: any[] = [];
  categoryList: Array<any> = [];
  locationList: Array<any> = [];
  consumableList: Array<any> = [];
  selectedBrandId: string | null = null;
  brandSelectedFromList: boolean = false;


  selectedConsumable: any = {};
  consumableCategoryNameList: any;
  consumableSupplierNameList: any;
  consumableLocationNameList: any;
  consumableCompanyNameList: any;
  consumableItemNameList: any;

  filteredStockHistories: any[] = [];

  selectedConsumableDetails: any = {};

  selectedFilterStockHistory: string = 'all';

  subCategoryName: string = '';

  selectedCategory: string = '';
  selectedSupplier: string = '';
  selectedLocation: string = '';

  pageLimit = 10;
  currentPageNo = 1;
  totalPages: any;

  inputSearchText: string = '';

  categoryName: any;
  supplierName: any;

  startDate: any;
  endDate: any;

  consumableStockHistories: any = [];

  selectedRow: number | null = null;

  isItemNameExists = false;

  addItemName: FormGroup;
  addChallanNumber: FormGroup;
  addBillNumber: FormGroup;

  addAssets: FormGroup;
  modifyAddItemName: FormGroup;
  consumeAssets: FormGroup;
  modifyConsumableForm: FormGroup;

  constructor(private database: DatabaseService, private authCtx: SessionstorageService) {

    // Add Item Name
    this.addItemName = new FormGroup({
      category: new FormControl({ value: '', disabled: false }, [Validators.required]),
      itemName: new FormControl({ value: '', disabled: false }, [Validators.required]),
      brandName: new FormControl({ value: '', disabled: false }),
      location: new FormControl({ value: '', disabled: false }, [Validators.required]),
      description: new FormControl({ value: '', disabled: false }),
      totalIntake: new FormControl(),
      totalConsume: new FormControl()
    });

    // Add Challan Number
    this.addChallanNumber = new FormGroup({
      challanDate: new FormControl({ value: '', disabled: false }, [Validators.required]),
      challanNumber: new FormControl({ value: '', disabled: false }, [Validators.required]),
      billNumber: new FormControl(null),
      supplier: new FormControl({ value: '', disabled: false }, [Validators.required]),
      companyName: new FormControl({ value: '', disabled: false }, [Validators.required]),
      GSTNumber: new FormControl({ value: '', disabled: false }),
      totalQuantity: new FormControl({ value: '', disabled: false }, [Validators.required]),
      totalBaseAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
      totalGSTAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
      totalAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),

      items: new FormArray([
        new FormGroup({
          itemName: new FormControl({ value: '', disabled: false }, [Validators.required]),
          hsnCode: new FormControl(''),
          quantity: new FormControl({ value: 1, disabled: false }, [Validators.required]),
          unitPrice: new FormControl({ value: 1, disabled: false }, [Validators.required]),
          CGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          SGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          IGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          baseAmount: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          GSTAmount: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          totalAmount: new FormControl({ value: 0, disabled: false }, [Validators.required])
        })
      ]),
    });

    // Add Challan Number
    this.addBillNumber = new FormGroup({
      billDate: new FormControl({ value: '', disabled: false }, [Validators.required]),
      billNumber: new FormControl({ value: '', disabled: false }, [Validators.required]),
      hasChallan: new FormControl({ value: 'no', disabled: false }, [Validators.required]),
      challanIds: new FormControl({ value: '', disabled: false }),
      supplier: new FormControl({ value: '', disabled: false }),
      companyName: new FormControl({ value: '', disabled: false }),
      GSTNumber: new FormControl({ value: '', disabled: false }),
      totalQuantity: new FormControl({ value: '', disabled: false }, [Validators.required]),
      totalBaseAmount: new FormControl({ vale: '', disabled: false }, [Validators.required]),
      totalGSTAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
      totalAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
      hasAddItems: new FormControl({ value: 'yes', disabled: false }, [Validators.required]),
      billItems: new FormArray([
        new FormGroup({
          itemName: new FormControl({ value: '', disabled: false }, [Validators.required]),
          hsnCode: new FormControl({ value: '', disabled: false }),
          quantity: new FormControl({ value: 1, disabled: false }, [Validators.required]),
          unitPrice: new FormControl({ value: 1, disabled: false }, [Validators.required]),
          CGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          SGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          IGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          baseAmount: new FormControl({ value: 0, disabled: false }, Validators.required),
          GSTAmount: new FormControl({ value: 0, disabled: false }, [Validators.required]),
          totalAmount: new FormControl({ value: 0, disabled: false }, [Validators.required])
        }),
      ]),
    }, {
      validators: billChallanValidator     // ✅ CUSTOM VALIDATOR ONLY
    });



    //Modify Item Name
    this.modifyAddItemName = new FormGroup({
      categoryList: new FormControl({ value: '', disabled: false }, [Validators.required]),
      itemName: new FormControl({ value: '', disabled: false }, [Validators.required])
    })

    //Modify Consumable
    this.modifyConsumableForm = new FormGroup({
      billNumber: new FormControl({ value: '', disabled: true }, [Validators.required]),
      supplierList: new FormControl({ value: '', disabled: true }, [Validators.required]),
      categoryList: new FormControl({ value: '', disabled: true }, [Validators.required]),
      locationList: new FormControl({ value: '', disabled: false }, [Validators.required]),
      quantity: new FormControl(1),
      amount: new FormControl(),
      totalAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
    });

    //Consume Quantity
    this.consumeAssets = new FormGroup({
      categoryList: new FormControl({ value: '', disabled: true }, [Validators.required]),
      quantity: new FormControl(1),
      consumeQuantity: new FormControl({ value: '', disabled: false }, [Validators.required]),
    });

    // Add Assets
    this.addAssets = new FormGroup({
      categoryList: new FormControl({ value: '', disabled: true }, [Validators.required]),
      billNumber: new FormControl({ value: '', disabled: false }, [Validators.required]),
      supplierList: new FormControl({ value: '', disabled: false }, [Validators.required]),
      locationList: new FormControl({ value: '', disabled: false }, [Validators.required]),
      quantity: new FormControl(1),
      amount: new FormControl(),
      totalAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
    });

  }

  ngOnInit(): void {

    // Subscribe to auth context and update employee/user rights when context becomes available
    this.authCtx.context$.subscribe(ctx => {
      if (!ctx) {
        return
      }

      const { user, rights } = ctx;
      this.employeeCode = user.employeeCode;
      this.employeeRights = user.staffType;
      this.userRights = rights || {};
    });

    // GET: consumable category name list
    this.database.fetchConsumableCategory().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.data?.list)) {
          // this.categoryList = res.data.list || [];
          // this.categoryList = res.data.list.map((item: any) => item.categoryName);

          // ✅ KEEP BOTH ID + NAME
          this.categoryList = res.data.list.map((item: any) => ({
            _id: item._id,
            category: item.categoryName
          }));

          // Optional if you still need map
          this.consumableCategoryNameList = res.data.map;

          console.log('Category list:', this.categoryList);

        } else {
          this.categoryList = [];
          this.consumableCategoryNameList = {};
        }
      },
      error: () => {
        this.categoryList = [];
        this.consumableCategoryNameList = {};
      }
    });

    // GET: consumable supplier name List
    this.database.fetchConsumableSupplier().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.data)) {

          this.supplierList = res.data.map((item: any) => ({
            _id: item._id,
            supplierName: item.supplierName,
            contactPerson: item.contactPerson,
            contactNumber: item.contactNumber,
            email: item.email,
            GSTNumber: item.GSTNumber,
            address: item.address,
            type: item.type
          }));

          console.log('Supplier list:', this.supplierList);

        } else {
          console.warn('No supplier data found or invalid response:', res);
          this.supplierList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching supplier List:', err);
        this.supplierList = [];
      }
    });

    // GET: consumable location name list
    this.database.fetchConsumableLocation().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res?.data?.list)) {

          this.locationList = res.data.list.map((item: any) => ({
            _id: item._id,
            location: item.locationName
          }));

          this.consumableLocationNameList = res.data.map || {};

          console.log('Location list:', this.locationList);

        } else {
          this.locationList = [];
          this.consumableLocationNameList = {};
        }
      },
      error: (err) => {
        console.error('Error fetching location list:', err);
        this.locationList = [];
        this.consumableLocationNameList = {};
      }
    });

    // GET: Consumable company name List
    this.database.getCompanyNameList().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {

          // keep full object if needed later
          this.consumableCompanyNameList = res.data;

          // ✅ object list for ng-select
          this.companyList = res.data.map((item: any) => ({
            _id: item._id,
            companyName: item.companyName
          }));

          console.log('Company list:', this.companyList);

        } else {
          console.warn('No Company Name List data found or invalid response:', res);
          this.consumableCompanyNameList = [];
          this.companyList = [];
        }
      },
      error: (err) => {
        console.error('Error fetching company name list:', err);
        this.consumableCompanyNameList = [];
        this.companyList = [];
      }
    });

    // GET: Consumable item name list
    // this.database.fetchItem().subscribe({
    //   next: (res: any) => {
    //     // console.log('-----******************-----', res);
    //     if (res?.success && Array.isArray(res.data)) {

    //       // 🔹 store FULL item objects (important for later use)
    //       this.itemMasterList = res.data;

    //       // 🔹 dropdown list (ONLY id + name)
    //       this.itemNameList = res.data.map((item: any) => ({
    //         _id: item._id,
    //         itemName: item.itemName
    //       }));

    //       // 🔹 quick lookup map (optional but very useful)
    //       this.itemMap = {};
    //       res.data.forEach((item: any) => {
    //         this.itemMap[item._id] = item;
    //       });

    //       console.log('Item list:', this.itemNameList);
    //       // console.log('Item full map:', this.itemMap);

    //     } else {
    //       console.warn('Invalid item response', res);
    //       this.itemMasterList = [];
    //       this.itemNameList = [];
    //       this.itemMap = {};
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error fetching items', err);
    //     this.itemMasterList = [];
    //     this.itemNameList = [];
    //     this.itemMap = {};
    //   }
    // });

    // GET: Consumable item name list
    this.database.fetchItem().subscribe({
      next: (res: any) => {

        if (res?.success && Array.isArray(res.data)) {

          /* ===============================
             🔥 ADD inStock CALCULATION
          =============================== */

          this.itemMasterList = res.data.map((item: any) => {

            const intake = item.totalIntake || 0;
            const consume = item.totalConsume || 0;

            return {
              ...item,
              inStock: intake - consume
            };
          });

          /* ===============================
             🔹 dropdown list (ONLY id + name)
          =============================== */

          this.itemNameList = this.itemMasterList.map((item: any) => ({
            _id: item._id,
            itemName: item.itemName
          }));

          /* ===============================
             🔹 quick lookup map
          =============================== */

          this.itemMap = {};

          this.itemMasterList.forEach((item: any) => {
            this.itemMap[item._id] = item;
          });

          console.log('Item list:', this.itemNameList);

        } else {

          console.warn('Invalid item response', res);

          this.itemMasterList = [];
          this.itemNameList = [];
          this.itemMap = {};
        }

      },

      error: (err) => {

        console.error('Error fetching items', err);

        this.itemMasterList = [];
        this.itemNameList = [];
        this.itemMap = {};
      }
    });


    //GET: Consumable challan list
    this.database.fetchChallan().subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.data)) {

          // 🔹 store FULL challan objects
          this.challanMasterList = res.data;

          // 🔹 dropdown list (ONLY id + challanNumber)
          this.challanNumberList = res.data.map((challan: any) => ({
            _id: challan._id,
            challanNumber: challan.challanNumber
          }));

          // 🔹 quick lookup map (IMPORTANT)
          this.challanMap = {};
          res.data.forEach((challan: any) => {
            this.challanMap[challan._id] = challan;
          });

          console.log('Challan list:', this.challanNumberList);
          // console.log('Full challan map:', this.challanMap);

        } else {
          console.warn('Invalid challan response', res);
          this.challanMasterList = [];
          this.challanNumberList = [];
          this.challanMap = {};
        }
      },
      error: (err) => {
        console.error('Error fetching challans', err);
        this.challanMasterList = [];
        this.challanNumberList = [];
        this.challanMap = {};
      }
    });

    // Recalculate item and bill totals whenever any bill item value changes
    this.billItems.controls.forEach(ctrl => {
      ctrl.valueChanges.subscribe(() => {
        this.calculateItemAndBillTotals();
      });
    });

    // Initial calculation
    this.calculateItemAndBillTotals();

    // Recalculates item totals whenever any item value changes
    this.items.controls.forEach(ctrl => {
      ctrl.valueChanges.subscribe(() => {
        this.calculateChallanItemsAndTotals();
      });
    });

    // Calculates challan item totals and overall amounts
    this.calculateChallanItemsAndTotals();

    // Get challan toggle details
    this.addBillNumber.get('hasChallan')?.valueChanges.subscribe(val => {
      const hasAddItems = this.addBillNumber.get('hasAddItems');

      if (val === 'no') {
        hasAddItems?.setValue('yes', { emitEvent: false });
        hasAddItems?.disable({ emitEvent: false });
      } else {
        hasAddItems?.enable({ emitEvent: false });
      }

      this.addBillNumber.updateValueAndValidity();
    });

    // Get add item details
    this.addBillNumber.get('hasAddItems')?.valueChanges.subscribe(val => {

      this.billItems.controls.forEach(item => {

        if (val === 'yes') {
          // ✅ ENABLE item validators
          item.get('itemName')?.setValidators(Validators.required);
          item.get('quantity')?.setValidators(Validators.required);
          item.get('unitPrice')?.setValidators(Validators.required);
          item.get('CGST')?.setValidators(Validators.required);
          item.get('SGST')?.setValidators(Validators.required);
          item.get('IGST')?.setValidators(Validators.required);
        } else {
          // ❌ CLEAR item validators
          item.get('itemName')?.clearValidators();
          item.get('quantity')?.clearValidators();
          item.get('unitPrice')?.clearValidators();
          item.get('CGST')?.clearValidators();
          item.get('SGST')?.clearValidators();
          item.get('IGST')?.clearValidators();
        }

        // 🔁 UPDATE
        const fg = item as FormGroup;

        Object.keys(fg.controls).forEach(key => {
          fg.get(key)?.updateValueAndValidity({ emitEvent: false });
        });
      });

      this.addBillNumber.updateValueAndValidity();
    });

    // this.itemNameUniqueCheck();
    this.initBrandSearch();
    billChallanValidator(this.addBillNumber);

  }



  /**
   * ======================================================================================================================
   * Export CSV File
  */
  // Export consumable CSV file
  exportConsumableCSVFile() {
    // Check category or supplier (at least one required)
    if (!this.categoryName && !this.supplierName) {
      alert('Please select either Category or Supplier');
      return;
    }

    // Check start and end date (both required)
    if (!this.startDate || !this.endDate) {
      alert('Please select both Start Date and End Date');
      return;
    }

    let exportParameter = {
      category: this.categoryName,
      supplier: this.supplierName,
      startDate: this.startDate,
      endDate: this.endDate
    }

    this.database.exportConsumableAssetData(exportParameter).subscribe((data: any) => {
      console.log('data', data)

      if (data.length <= 0) {
        alert('Asset is not found !!!')
        return
      }

      const header = ['Date', 'Category', 'Supplier', 'Bill Number', 'Challan Number', 'Shelf Location', 'Quantity', 'GST', 'Amount', 'Total Amount'];
      const csvRows = [header.join(',')]

      /**
        _id: new ObjectId('6979f4b6073f0abcbf3b4656'),
        date: '2026-01-28',
        billNumber: '101202126',
        supplierList: 'Demart',
        categoryList: 'Tissue BOX',
        locationList: 'TSL-101',
        quantity: 10,
        amount: 100,
        totalAmount: 100,
        createdAt: 2026-01-28T11:36:22.905Z,
        updatedAt: 2026-01-28T11:36:22.905Z,
      */

      data.forEach((item: any) => {
        let row = [
          item.date || '--',
          item.category || '--',
          item.supplier || '--',
          item.billNumber || '--',
          item.challanNumber || '--',
          item.shelfLocation || '--',
          item.quantity || '--',
          item.GST || '--',
          item.amount || '--',
          item.totalAmount || '--'
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

  // Clear export CSV section
  clearExportCSV() {
    $('#closeExportCSV').click();
  }
  /** ====================================================================================================================== */



  /**
   * ======================================================================================================================
   * Upload CSV File
  */
  // For submit inventory csv
  submitConsumableCsv() {
    let result: any = [];
    let errorMessage: any = [];
  }

  // For selecting inventory csv file
  selectConsumableCSVFile(event: any) {
    this.consumableCsvFile = event.target.files[0];
  }

  // Clear upload CSV section
  clearUploadCSV() {
    $('#closeUploadCSV').click();
  }
  /** ====================================================================================================================== */



  /**
   * ======================================================================================================================
   * Create consumable section
  */
  // Clear consumable create section
  clearConsumableSection() {
    $('closeConsumableSection').click();
  }

  /** ==================== Add item name ==================== */
  // Item name unique check
  itemNameUniqueCheck() {

    const itemControl = this.addItemName.get('itemName');

    itemControl?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {

        if (!value) {
          this.isItemNameExists = false;
          itemControl.setErrors(null);
          return;
        }

        this.database.checkItemNameExists(value).subscribe((res: any) => {

          this.isItemNameExists = res.exists;

          if (res.exists) {
            itemControl.setErrors({ notUnique: true });
          } else {
            // ✅ Clear only notUnique error
            if (itemControl.hasError('notUnique')) {
              itemControl.setErrors(null);
            }
          }

        }, () => {
          // optional: handle API error silently
          this.isItemNameExists = false;
        });

      });
  }

  //
  initBrandSearch() {

    const brandControl = this.addItemName.get('brandName');

    brandControl?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => {

        if (!value || !value.trim()) {
          this.filteredBrandList = [];
          this.showBrandSuggestions = false;
          return of(null);
        }

        // 🔥 Call your existing fetchItem API
        return this.database.fetchItem();

      })
    )
      .subscribe((res: any) => {

        if (!res || !res.success) {
          this.filteredBrandList = [];
          this.showBrandSuggestions = false;
          return;
        }

        const typedValue = this.addItemName.get('brandName')?.value.toLowerCase();

        // 🔥 Extract unique brands from items
        const brandSet = new Set<string>();

        res.data.forEach((item: any) => {

          if (item.brandName?.brandName) {
            brandSet.add(item.brandName.brandName);
          }

          if (item.branded) {
            brandSet.add(item.branded);
          }

        });

        const allBrands = Array.from(brandSet);

        // 🔥 Filter based on typed text
        this.filteredBrandList = allBrands
          .filter(name => name.toLowerCase().includes(typedValue))
          .map(name => ({ brandName: name }));

        this.showBrandSuggestions = this.filteredBrandList.length > 0;

      });

  }

  //
  showAddItemNameForm(): boolean {
    return this.userRights?.adminDepartment?.consumableAsset.manage === 1;
  }

  // Add new item name form submit section
  addItemNameForm() {
    if (this.addItemName.invalid || this.isItemNameExists) {
      alert('Please fix errors before submitting');
      return;
    }

    const brandValue = this.addItemName.value.brandName?.trim() || '';

    const brandExists = this.brandList.some(
      (b: any) => b?.brandName?.toLowerCase() === brandValue.toLowerCase()
    );

    if (brandExists && !this.brandSelectedFromList) {
      alert('Please select the brand from the suggestion list');
      return;
    }

    // ✅ CATEGORY LOCATION ID (_id because of bindValue)
    const categoryId = this.addItemName.value.category;
    const location = this.addItemName.value.location;

    // 🔹 BUILD PAYLOAD
    const payload: any = {
      category: categoryId,
      itemName: this.addItemName.value.itemName,
      location: location,
      description: this.addItemName.value.description,
      totalIntake: 0,
      totalConsume: 0
    };

    if (brandValue) {
      if (this.brandSelectedFromList && this.selectedBrandId) {
        payload.brandName = this.selectedBrandId;
      } else {
        payload.branded = brandValue;
      }
    }

    // 🔹 DISABLE BUTTON (OPTIONAL UX)
    this.isSubmitting = true;

    console.log('FINAL PAYLOAD 👉', payload);

    /* ✅ API CALL (NO RETURN BEFORE THIS) */
    this.database.createItem(payload).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;

        if (res?.success) {
          alert('Item added successfully ✅');

          // Reset form
          this.addItemName.reset();
          this.brandSelectedFromList = false;
          this.selectedBrandId = null;

          // GET: Consumable item name list
          this.database.fetchItem().subscribe({
            next: (res: any) => {
              // console.log('-----******************-----', res);
              if (res?.success && Array.isArray(res.data)) {

                // 🔹 store FULL item objects (important for later use)
                this.itemMasterList = res.data;

                // 🔹 dropdown list (ONLY id + name)
                this.itemNameList = res.data.map((item: any) => ({
                  _id: item._id,
                  itemName: item.itemName
                }));
                document.getElementById('closeConsumableSection')?.click();

                console.log('Item list:', this.itemNameList);

              } else {
                console.warn('Invalid item response', res);
                this.itemMasterList = [];
                this.itemNameList = [];
              }
            },
            error: (err) => {
              console.error('Error fetching items', err);
              this.itemMasterList = [];
              this.itemNameList = [];
            }
          });

        } else {
          alert(res?.message || 'Failed to add item');
        }
      },

      error: (err) => {
        this.isSubmitting = false;

        console.error('Create Item Error →', err);

        if (err?.error?.message) {
          alert(err.error.message);
        } else {
          alert('Server error. Please try again later.');
        }
      }
    });
  }



  /** ==================== Add challan number section ==================== */
  //
  get items(): FormArray {
    return this.addChallanNumber.get('items') as FormArray;
  }

  //
  addItem() {
    const itemGroup = new FormGroup({
      itemName: new FormControl('', Validators.required),
      hsnCode: new FormControl(''),
      quantity: new FormControl(1, Validators.required),
      unitPrice: new FormControl(1, Validators.required),
      CGST: new FormControl(0, Validators.required),
      SGST: new FormControl(0, Validators.required),
      IGST: new FormControl(0, Validators.required),
      baseAmount: new FormControl(0),
      GSTAmount: new FormControl(0),
      totalAmount: new FormControl(0)
    });

    // 🔥 LIVE AUTO CALC
    itemGroup.valueChanges.subscribe(() => {
      this.calculateChallanItemsAndTotals();
    });

    this.items.push(itemGroup);

    // Initial calculation
    this.calculateChallanItemsAndTotals();

    // this.items.push(
    //   new FormGroup({
    //     itemName: new FormControl({ value: '', disabled: false }, [Validators.required]),
    //     hsnCode: new FormControl(''),
    //     quantity: new FormControl({ value: 1, disabled: false }, [Validators.required]),
    //     unitPrice: new FormControl(''),
    //     CGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
    //     SGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
    //     IGST: new FormControl({ value: 0, disabled: false }, [Validators.required]),
    //     GSTAmount: new FormControl({ value: 0, disabled: false }, [Validators.required]),
    //     totalAmount: new FormControl({ value: 0, disabled: false }, [Validators.required])
    //   })
    // );
  }

  //
  removeItem(index: number) {
    this.items.removeAt(index);
    this.calculateChallanItemsAndTotals();
  }

  //
  showChallanNumberForm(): boolean {
    return this.userRights?.adminDepartment?.consumableAsset.manage === 1;
  }

  //
  onItemChange(itemId: string, index: number) {
    const item = this.itemMap[itemId];
    if (!item) return;

    const row = this.items.at(index);
    row.patchValue({
      // example auto-fills
      // location: item.location,
      // description: item.description
    });
  }

  //
  calculateChallanItemsAndTotals() {

    let totalQty = 0;
    let totalBaseAmount = 0; // ✅ ADDED
    let totalGSTAmount = 0;
    let totalAmount = 0;

    this.items.controls.forEach((ctrl) => {

      const qty = Number(ctrl.get('quantity')?.value) || 0;
      const price = Number(ctrl.get('unitPrice')?.value) || 0;

      // ✅ BASE AMOUNT (quantity × unitPrice)
      const baseAmount = qty * price;

      const CGST = Number(ctrl.get('CGST')?.value) || 0;
      const SGST = Number(ctrl.get('SGST')?.value) || 0;
      const IGST = Number(ctrl.get('IGST')?.value) || 0;

      const gstAmount =
        (baseAmount * CGST) / 100 +
        (baseAmount * SGST) / 100 +
        (baseAmount * IGST) / 100;

      const itemTotal = baseAmount + gstAmount;

      // 🔥 ONLY ADD baseAmount PATCH
      ctrl.patchValue({
        baseAmount: Number(baseAmount.toFixed(2)), // ✅ ADDED
        GSTAmount: Number(gstAmount.toFixed(2)),
        totalAmount: Number(itemTotal.toFixed(2))
      }, { emitEvent: false });

      totalQty += qty;
      totalBaseAmount += baseAmount; // ✅ ADDED
      totalGSTAmount += gstAmount;
      totalAmount += itemTotal;
    });

    // 🔥 HEADER PATCH (ONLY ADD)
    this.addChallanNumber.patchValue({
      totalQuantity: totalQty,
      totalBaseAmount: Number(totalBaseAmount.toFixed(2)), // ✅ ADDED
      totalGSTAmount: Number(totalGSTAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    }, { emitEvent: false });
  }

  //
  addChallanNumberForm() {
    // const payload = this.addChallanNumber.getRawValue();
    // console.log(payload);

    if (this.addChallanNumber.invalid) {
      this.addChallanNumber.markAllAsTouched();
      return;
    }

    const raw = this.addChallanNumber.getRawValue();

    let totalQuantity = 0;
    let totalBaseAmount = 0;
    let totalGSTAmount = 0;
    let grandTotalAmount = 0;

    // 🔹 Process item list
    const items = raw.items.map((item: any) => {

      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;

      const baseAmount = quantity * unitPrice;

      const cgst = Number(item.CGST) || 0;
      const sgst = Number(item.SGST) || 0;
      const igst = Number(item.IGST) || 0;

      const GSTAmount =
        (baseAmount * cgst) / 100 +
        (baseAmount * sgst) / 100 +
        (baseAmount * igst) / 100;

      const totalAmount = baseAmount + GSTAmount;

      totalQuantity += quantity;
      totalBaseAmount += baseAmount;
      totalGSTAmount += GSTAmount;
      grandTotalAmount += totalAmount;

      return {
        itemName: item.itemName,
        hsnCode: item.hsnCode || null,
        quantity,
        unitPrice,
        CGST: cgst,
        SGST: sgst,
        IGST: igst,
        baseAmount,
        GSTAmount,
        totalAmount
      };
    });

    // 🔹 FINAL PAYLOAD
    const payload = {
      challanDate: raw.challanDate,
      challanNumber: raw.challanNumber,
      billNumber: raw.billNumber || null,

      supplier: raw.supplier,
      companyName: raw.companyName,
      GSTNumber: raw.GSTNumber || null,

      totalQuantity,
      totalBaseAmount,
      totalGSTAmount,
      totalAmount: grandTotalAmount,

      items
    };

    console.log('FINAL PAYLOAD 👉', payload);

    // 🔹 API CALL
    this.isSubmitting = true;

    this.database.createChallan(payload).subscribe({

      next: (res: any) => {
        this.isSubmitting = false;

        if (res?.success) {
          alert('Challan saved successfully ✅');

          // reset form
          this.addChallanNumber.reset();

          //GET: Consumable challan list
          this.database.fetchChallan().subscribe({
            next: (res: any) => {
              if (res?.success && Array.isArray(res.data)) {

                // 🔹 store FULL challan objects
                this.challanMasterList = res.data;

                // 🔹 dropdown list (ONLY id + challanNumber)
                this.challanNumberList = res.data.map((challan: any) => ({
                  _id: challan._id,
                  challanNumber: challan.challanNumber
                }));

                document.getElementById('closeConsumableSection')?.click();

                console.log('Challan list:', this.challanNumberList);

              } else {
                console.warn('Invalid challan response', res);
                this.challanMasterList = [];
                this.challanNumberList = [];
              }
            },
            error: (err) => {
              console.error('Error fetching challans', err);
              this.challanMasterList = [];
              this.challanNumberList = [];
            }
          });

        } else {
          alert(res?.message || 'Failed to save challan');
        }
      },

      error: (err) => {
        this.isSubmitting = false;

        console.error('Create Challan Error →', err);

        if (err?.error?.message) {
          alert(err.error.message);
        } else {
          alert('Server error. Please try again later.');
        }
      }
    });

  }

  /** ==================== Add bill number section ==================== */
  //
  get billItems(): FormArray {
    return this.addBillNumber.get('billItems') as FormArray;
  }

  //
  billAddItem() {
    const itemGroup = new FormGroup({
      itemName: new FormControl('', Validators.required),
      hsnCode: new FormControl(''),
      quantity: new FormControl(1, Validators.required),
      unitPrice: new FormControl(1, Validators.required),
      CGST: new FormControl(0, Validators.required),
      SGST: new FormControl(0, Validators.required),
      IGST: new FormControl(0, Validators.required),
      baseAmount: new FormControl(0),
      GSTAmount: new FormControl(0),
      totalAmount: new FormControl(0)
    });

    // 🔥 LISTEN TO ITEM CHANGES
    itemGroup.valueChanges.subscribe(() => {
      this.calculateItemAndBillTotals();
    });

    this.billItems.push(itemGroup);

    // Calculate immediately
    this.calculateItemAndBillTotals();
  }

  //
  billRemoveItem(index: number) {
    this.billItems.removeAt(index);
    this.calculateItemAndBillTotals();
  }

  //
  showBillNumberForm(): boolean {
    return this.userRights?.adminDepartment?.consumableAsset.manage === 1;
  }

  //Extra function for get more data with challan number
  onChallanSelectionChange(ids: string[]) {
    let totalQty = 0;
    let totalBase = 0;
    let totalGST = 0;
    let totalAmount = 0;

    ids.forEach(id => {
      const c = this.challanMap[id];
      if (!c) return;

      totalQty += c.totalQuantity;
      totalBase += c.totalBaseAmount;
      totalGST += c.totalGSTAmount;
      totalAmount += c.totalAmount;
    });

    this.addBillNumber.patchValue({
      totalQuantity: totalQty,
      totalBaseAmount: totalBase,
      totalGSTAmount: totalGST,
      totalAmount: totalAmount
    });
  }

  //
  calculateItemAndBillTotals() {

    let totalQty = 0;
    let totalBaseAmount = 0; // ✅ ADDED
    let totalGST = 0;
    let totalAmount = 0;

    this.billItems.controls.forEach((ctrl) => {

      const qty = Number(ctrl.get('quantity')?.value) || 0;
      const price = Number(ctrl.get('unitPrice')?.value) || 0;

      // ✅ BASE AMOUNT (NO GST)
      const baseAmount = qty * price;

      const CGST = Number(ctrl.get('CGST')?.value) || 0;
      const SGST = Number(ctrl.get('SGST')?.value) || 0;
      const IGST = Number(ctrl.get('IGST')?.value) || 0;

      const gstAmount =
        baseAmount * (CGST / 100) +
        baseAmount * (SGST / 100) +
        baseAmount * (IGST / 100);

      const itemTotal = baseAmount + gstAmount;

      // 🔥 PATCH ITEM (ONLY ADD baseAmount)
      ctrl.patchValue({
        baseAmount: Number(baseAmount.toFixed(2)), // ✅ ADDED
        GSTAmount: Number(gstAmount.toFixed(2)),
        totalAmount: Number(itemTotal.toFixed(2))
      }, { emitEvent: false });

      totalQty += qty;
      totalBaseAmount += baseAmount; // ✅ ADDED
      totalGST += gstAmount;
      totalAmount += itemTotal;
    });

    // 🔥 PATCH HEADER (ONLY ADD totalBaseAmount)
    this.addBillNumber.patchValue({
      totalQuantity: totalQty,
      totalBaseAmount: Number(totalBaseAmount.toFixed(2)), // ✅ ADDED
      totalGSTAmount: Number(totalGST.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    }, { emitEvent: false });
  }

  //
  // addBillNumberForm() {
  //   this.addBillNumber.markAllAsTouched();
  //   if (this.addBillNumber.invalid) return;

  //   const formValue = this.addBillNumber.value;

  //   let payload: any = {
  //     BillDate: formValue.billDate,
  //     billNumber: formValue.billNumber
  //   };

  //   /* ---------------- ONLY CHALLAN ---------------- */
  //   if (formValue.hasChallan === 'yes' && formValue.hasAddItems === 'no') {

  //     payload = {
  //       BillDate: formValue.billDate,
  //       billNumber: formValue.billNumber,
  //       challanIds: formValue.challanIds
  //     };

  //     console.log('FINAL PAYLOAD →', payload);
  //     return; // 🔴 VERY IMPORTANT
  //   }

  //   /* ---------------- CHALLAN + ITEMS ---------------- */
  //   if (formValue.hasChallan === 'yes' && formValue.hasAddItems === 'yes') {
  //     payload.challanIds = formValue.challanIds;
  //     payload.supplier = formValue.supplier;
  //     payload.companyName = formValue.companyName;
  //   }

  //   /* ---------------- NO CHALLAN ---------------- */
  //   if (formValue.hasChallan === 'no') {
  //     payload.supplier = formValue.supplier;
  //     payload.companyName = formValue.companyName;
  //   }

  //   /* ---------------- ITEMS ---------------- */
  //   if (formValue.hasAddItems === 'yes') {
  //     payload.items = this.billItems.value.map((item: any) => ({
  //       itemName: item.itemName,
  //       hsnCode: item.hsnCode || null,
  //       quantity: item.quantity,
  //       unitPrice: item.unitPrice,
  //       CGST: item.CGST,
  //       SGST: item.SGST,
  //       IGST: item.IGST,
  //       baseAmount: item.baseAmount,
  //       GSTAmount: item.GSTAmount,
  //       totalAmount: item.totalAmount
  //     }));

  //     payload.GSTNumber = formValue.GSTNumber || null;
  //     payload.totalQuantity = formValue.totalQuantity;
  //     payload.totalBaseAmount = formValue.totalBaseAmount;
  //     payload.totalGSTAmount = formValue.totalGSTAmount;
  //     payload.totalAmount = formValue.totalAmount;
  //   }

  //   console.log('FINAL PAYLOAD →', payload);

  //   // API CALL
  //   this.database.createBill(payload).subscribe({

  //     next: (res: any) => {
  //       this.isSubmitting = false;

  //       if (res?.success) {
  //         alert('Bill saved successfully ✅');

  //         // reset form
  //         this.addBillNumber.reset();
  //       } else {
  //         alert(res?.message || 'Failed to save bill');
  //       }
  //     },

  //     error: (err) => {
  //       this.isSubmitting = false;

  //       console.error('Create Bill Error →', err);

  //       if (err?.error?.message) {
  //         alert(err.error.message);
  //       } else {
  //         alert('Server error. Please try again later.');
  //       }
  //     }
  //   });

  // }

  // addBillNumberForm() {
  //   this.addBillNumber.markAllAsTouched();
  //   if (this.addBillNumber.invalid) return;

  //   this.isSubmitting = true;

  //   const formValue = this.addBillNumber.value;

  //   let payload: any = {
  //     BillDate: formValue.billDate,
  //     billNumber: formValue.billNumber
  //   };

  //   /* ---------------- ONLY CHALLAN ---------------- */
  //   if (formValue.hasChallan === 'yes' && formValue.hasAddItems === 'no') {

  //     payload = {
  //       BillDate: formValue.billDate,
  //       billNumber: formValue.billNumber,
  //       challanIds: formValue.challanIds
  //     };
  //   }

  //   /* ---------------- CHALLAN + ITEMS ---------------- */
  //   if (formValue.hasChallan === 'yes' && formValue.hasAddItems === 'yes') {
  //     payload.challanIds = formValue.challanIds;
  //     payload.supplier = formValue.supplier;
  //     payload.companyName = formValue.companyName;
  //   }

  //   /* ---------------- NO CHALLAN ---------------- */
  //   if (formValue.hasChallan === 'no') {
  //     payload.supplier = formValue.supplier;
  //     payload.companyName = formValue.companyName;
  //   }

  //   /* ---------------- ITEMS ---------------- */
  //   if (formValue.hasAddItems === 'yes') {
  //     payload.items = this.billItems.value.map((item: any) => ({
  //       itemName: item.itemName,
  //       hsnCode: item.hsnCode || null,
  //       quantity: item.quantity,
  //       unitPrice: item.unitPrice,
  //       CGST: item.CGST,
  //       SGST: item.SGST,
  //       IGST: item.IGST,
  //       baseAmount: item.baseAmount,
  //       GSTAmount: item.GSTAmount,
  //       totalAmount: item.totalAmount
  //     }));

  //     payload.GSTNumber = formValue.GSTNumber || null;
  //     payload.totalQuantity = formValue.totalQuantity;
  //     payload.totalBaseAmount = formValue.totalBaseAmount;
  //     payload.totalGSTAmount = formValue.totalGSTAmount;
  //     payload.totalAmount = formValue.totalAmount;
  //   }

  //   console.log('FINAL PAYLOAD →', payload);

  //   /* ✅ API CALL (NO RETURN BEFORE THIS) */
  //   // this.database.createBill(payload).subscribe({

  //   //   next: (res: any) => {
  //   //     this.isSubmitting = false;

  //   //     if (res?.success) {
  //   //       alert('Bill saved successfully ✅');
  //   //       this.addBillNumber.reset();
  //   //       this.billItems.clear();
  //   //       window.location.reload();
  //   //     } else {
  //   //       alert(res?.message || 'Failed to save bill');
  //   //     }
  //   //   },

  //   //   error: (err) => {
  //   //     this.isSubmitting = false;

  //   //     console.error('Create Bill Error →', err);

  //   //     if (err?.error?.message) {
  //   //       alert(err.error.message);
  //   //     } else {
  //   //       alert('Server error. Please try again later.');
  //   //     }
  //   //   }
  //   // });
  // }

  addBillNumberForm() {
    this.addBillNumber.markAllAsTouched();
    if (this.addBillNumber.invalid) return;

    this.isSubmitting = true;

    const formValue = this.addBillNumber.value;

    const isChallan = formValue.hasChallan === 'yes';
    const isAddItems = formValue.hasAddItems === 'yes';

    let payload: any = {
      BillDate: formValue.billDate,
      billNumber: formValue.billNumber
    };

    /* ---------------- CHALLAN ---------------- */
    if (isChallan) {
      payload.challanIds = formValue.challanIds;
    }

    /* ---------------- SUPPLIER & COMPANY ---------------- */
    // if (!isChallan || isAddItems) {
    //   payload.supplier = formValue.supplier;
    //   payload.companyName = formValue.companyName;
    // }

    /* ---------------- SUPPLIER & COMPANY ---------------- */
    payload.supplier = formValue.supplier;
    if (!isChallan || isAddItems) {
      payload.companyName = formValue.companyName;
    }


    /* ---------------- ITEMS ---------------- */
    if (!isChallan || isAddItems) {
      payload.items = this.billItems.value.map((item: any) => ({
        itemName: item.itemName,
        hsnCode: item.hsnCode || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        CGST: item.CGST,
        SGST: item.SGST,
        IGST: item.IGST,
        baseAmount: item.baseAmount,
        GSTAmount: item.GSTAmount,
        totalAmount: item.totalAmount
      }));

      payload.GSTNumber = formValue.GSTNumber || null;
      payload.totalQuantity = formValue.totalQuantity;
      payload.totalBaseAmount = formValue.totalBaseAmount;
      payload.totalGSTAmount = formValue.totalGSTAmount;
      payload.totalAmount = formValue.totalAmount;
    }

    console.log('FINAL PAYLOAD →', payload);

    /* ✅ API CALL (NO RETURN BEFORE THIS) */
    this.database.createBill(payload).subscribe({

      next: (res: any) => {
        this.isSubmitting = false;

        if (res?.success) {
          alert('Bill saved successfully ✅');
          this.addBillNumber.reset({ hasChallan: 'no', hasAddItems: 'yes' });
          this.billItems.clear();
          document.getElementById('closeConsumableSection')?.click();
          this.billAddItem();
        }
      },

      error: (err) => {
        this.isSubmitting = false;

        console.error('Create Bill Error →', err);

        // ✅ Supplier mismatch error
        if (err?.error?.mismatchedData) {

          const details = err.error.mismatchedData
            .map((c: any) => `Challan: ${c.challanNumber}`)
            .join('\n');

          alert(
            `Selected challan belongs to different supplier.\n\n${details}\n\nPlease correct and try again.`
          );

        } else if (err?.error?.message) {

          alert(err.error.message);

        } else {

          alert('Server error. Please try again.');

        }
      }
    });
  }
  /** ====================================================================================================================== */



  /**
   *======================================================================================================================
   * Delete consumable history section
  */

  //
  clearDeleteHistorySection() {
    $('closeDeleteHistorySection').click();
  }
  /** ====================================================================================================================== */













  //This is used to apply changes
  applyFilter() {
    this.currentPageNo = 1;     //Reset the current page to 1
    this.getFilteredConsumable();
  }

  //This is used to get inventory by applying filters
  getFilteredConsumable() {
    this.database.getAllConsumableByFilter({
      category: this.selectedCategory,
      supplierList: this.selectedSupplier,
      location: this.selectedLocation,
    },
      this.currentPageNo, this.pageLimit).subscribe((data: any) => {
        this.consumableList = data.inventoryItems;
        this.totalPages = data.totalPages;
      });
  }

  //Search content for consumable
  getAllConsumable() {
    this.currentPageNo = 1;
    if (this.inputSearchText === '') {
      console.log("input search text", this.inputSearchText)
      this.getFilteredConsumable();
    }
  }

  //This gives the filtered search consumable after searching
  filterSearchedConsumable() {
    let searchedText = this.inputSearchText
    if (this.inputSearchText !== '') {
      this.database.filterSearchedConsumable({ searchedText }, this.currentPageNo, this.pageLimit).subscribe((data: any) => {
        this.consumableList = data.inventories;
        this.totalPages = data.totalPages;
      });
    } else {
      this.getFilteredConsumable();
    }

  }

  openConsumableEdit(consumable: any) {
    this.selectedConsumable = consumable;
    // console.log('Selected consumable:', this.selectedConsumable);
    this.modifyConsumableForm.patchValue({
      billNumber: consumable.billNumber,
      supplierList: consumable.supplierList,
      categoryList: consumable.categoryList,
      locationList: consumable.locationList,
      quantity: consumable.quantity,
      amount: consumable.amount,
      totalAmount: consumable.totalAmount
    });

    this.consumeAssets.patchValue({
      categoryList: consumable.categoryList,
      quantity: consumable.quantity,
      // consumeQuantity: consumable.consumeQuantity
    });

    this.addAssets.patchValue({
      categoryList: consumable.categoryList,
      billNumber: consumable.billNumber,
      supplierList: consumable.supplierList,
      locationList: consumable.locationList,
      quantity: consumable.quantity,
      amount: consumable.amount,
      totalAmount: consumable.totalAmount
    });

  }

  //This opens the stock history modal
  openStockHistoryModal(consumable: any) {
    this.selectedConsumable = {};
    this.selectedConsumable = consumable;
    this.getITInventoryStockHistory(consumable);
  }

  //This is used for getting stock history in Consumable
  getITInventoryStockHistory(consumable: any) {
    this.database.getConsumableHistoryById(consumable._id).subscribe((data) => {
      console.log('--------------------', data);
      this.consumableStockHistories = data;
      this.applyFilterOnStockHistory();
    });
  }

  /**-----------------------------------Create------------------------------------------------------*/

  deleteConsumableHistory() {
    // console.log('--------------', this.startDate, this.endDate);
    if (this.startDate === undefined || this.endDate === undefined) {
      alert('Please select the start date and end date')
      return
    }
  }

  /** ----------------------------------------------Details---------------------------------------*/
  //This is used to reset fields/form
  clearSelection() {
    $('#modify-tab').click();
  }

  /**------------------------------------------Edit Section ---------------------------------------*/
  /**---------------------------------------(Modify)------------------------------------*/


  //This is used to submit modify consumable
  submitModifyConsumable() {
    const modifiedConsume = {
      billNumber: this.modifyConsumableForm.value.billNumber,
      supplierList: this.modifyConsumableForm.value.supplierList,
      categoryList: this.modifyConsumableForm.value.categoryList,
      locationList: this.modifyConsumableForm.value.shelfLocation,
      quantity: this.modifyConsumableForm.value.quantity,
      amount: this.modifyConsumableForm.value.amount,
      totalAmount: this.modifyConsumableForm.value.totalAmount,
    }

    // console.log('=====================', modifiedConsume);
    this.database.updateConsumableModifyById(modifiedConsume, this.selectedConsumable._id).subscribe((data: any) => {
      // console.log('--------***------', data)
      if (!data.error) {
        window.location.reload();
      }
    });
  }

  /**---------------------------------------(consume assets)------------------------------------*/


  //This is used to submit modify consumable
  submitConsumeAssets() {
    const modifiedConsumeAssets = {
      categoryList: this.consumeAssets.value.categoryList,
      quantity: this.consumeAssets.value.quantity,
      consumeQuantity: this.consumeAssets.value.consumeQuantity,
    }

    // console.log('-----------V------------', modifiedConsumeAssets);
    this.database.updateConsumableConsumeAssetsById(modifiedConsumeAssets, this.selectedConsumable._id).subscribe((data: any) => {
      if (!data.error) {
        window.location.reload();
      }
    });
  }

  /**---------------------------------------(Modify)------------------------------------*/
  //This is used to display modify form with respect to user rights
  shouldShowAddAssetsForm(): boolean {
    return this.userRights?.adminDepartment?.consumableAsset.manage === 1;
  }

  //This is used to submit modify consumable
  submitAddAssets() {
    const modifiedAddAssets = {
      categoryList: this.addAssets.value.categoryList,
      billNumber: this.addAssets.value.billNumber,
      supplierList: this.addAssets.value.supplierList,
      locationList: this.addAssets.value.locationList,
      quantity: this.addAssets.value.quantity,
      amount: this.addAssets.value.amount,
      totalAmount: this.addAssets.value.totalAmount,
    }


    console.log('-----------------', modifiedAddAssets);
    this.database.updateConsumableAddAssetsById(modifiedAddAssets, this.selectedConsumable._id).subscribe((data: any) => {
      if (!data.error) {
        window.location.reload();
      }
    })
  }

  /** ------------------------------------- Consumable History ----------------------------*/

  //For apply history in according to TransactionType
  applyFilterOnStockHistory() {
    if (this.selectedFilterStockHistory === 'all') {
      this.filteredStockHistories = this.consumableStockHistories
    } else {
      this.filteredStockHistories = this.consumableStockHistories.filter((stock: any) => stock.transactionType === this.selectedFilterStockHistory);
    }
  }

  //
  stockHistoryAll() {
    // this.selectedRow = null;
    this.selectedFilterStockHistory = 'all';
    this.applyFilterOnStockHistory();
  }

  //Display History for create TransactionType
  stockHistoryCreate() {
    // this.selectedRow = null;
    this.selectedFilterStockHistory = 'create';
    this.applyFilterOnStockHistory();
  }

  //Display History for issue TransactionType
  stockHistoryIssue() {
    // this.selectedRow = null;
    this.selectedFilterStockHistory = 'issue';
    this.applyFilterOnStockHistory();
  }

  //Display History for return TransactionType
  stockHistoryReturned() {
    // this.selectedRow = null;
    this.selectedFilterStockHistory = 'returned';
    this.applyFilterOnStockHistory();
  }

  //This gives the filtered search consumable after searching
  filterSearchedInventory() {
    let searchedText = this.inputSearchText
    if (this.inputSearchText !== '') {
      this.database.filterSearchedInventory({ searchedText }, this.currentPageNo, this.pageLimit).subscribe((data: any) => {
        this.consumableList = data.inventories;
        this.totalPages = data.totalPages
      })
    } else {
      this.getFilteredConsumable();
    }

  }





  /**
   * ======================================================================================================================
   * Pagination
  */
  //To change limit for data in per page
  changeDataLimit() {
    this.currentPageNo = 1;
    this.updatedInventoryList()
  }

  //This gives the updated data after pagination
  updatedInventoryList() {
    if (this.inputSearchText) {
      this.filterSearchedInventory()
    } else {
      this.getFilteredConsumable()
    }
  }

  //This takes you to previous page
  previousPage() {
    if (this.currentPageNo > 3) {
      this.currentPageNo -= 3;
      this.updatedInventoryList();
    } else {
      this.currentPageNo = 1;
      this.updatedInventoryList();
    }
  }

  //This takes you to render any page
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPageNo = page;

      this.updatedInventoryList()
    }

  }

  //This takes you to next page
  nextPage() {
    if (this.currentPageNo + 3 <= this.totalPages) {
      this.currentPageNo += 3;
      this.updatedInventoryList();
    } else {
      this.currentPageNo = this.totalPages;
      this.updatedInventoryList();
    }
  }

  //It is used to go on first page
  goToFirstPage(): void {
    this.currentPageNo = 1;
    this.updatedInventoryList();
  }

  //It is used to go on last page
  goToLastPage(): void {
    this.currentPageNo = this.totalPages;
    this.updatedInventoryList();
  }

  //This calculates the page to take 3 pages
  getPagesToShow(): number[] {
    const pages = [];
    const startPage = Math.max(1, this.currentPageNo - 1);
    const endPage = Math.min(this.totalPages, startPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
  /** ====================================================================================================================== */



  toggleCollapse(index: number) {
    // if (this.selectedRow === index) {
    //   this.selectedRow = null;
    // } else {
    //   this.selectedRow = index;
    // }
  }

}
