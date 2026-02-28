import { Component } from '@angular/core';
import * as bootstrap from 'bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DatabaseService } from 'src/app/services/database.service';
import { requiredIfNotNull, dateRangeValidator } from 'src/app/validators/custom-validator.validator';
import { FilterService } from 'src/app/services/filter.service';

@Component({
  selector: 'app-amc',
  templateUrl: './amc.component.html',
  styleUrls: ['./amc.component.css']
})
export class AmcComponent {
  category: any = [];
  subcategory: any = [];
  manufacturer: any = [];

  filteredList: Array<any> = [];
  selectedAsset: Array<any> = [];
  categoryList: Array<any> = [];
  subCategoryList: Array<any> = [];
  manufacturerList: Array<any> = [];
  subCategoryMap: any = {};
  categoryMap: any = {};
  manufacturerMap: any = {};
  mapSelectedAsset: any = [
    { department: 'IT Department', assets: [] },
    { department: 'Electronic Component', assets: [] }
  ];

  amcHistoryList: any[] = [];
  selectedAMC: any = {};
  selectedService: any = {}
  selectedServiceNumber: string = '';
  serviceInitiatedDetailsA: any = {};
  serviceInitiatedDetailsB: any = {};
  repairInitiatedDetailsA: any = {};
  repairInitiatedDetailsB: any = {};
  editAMC: any = {}
  avaiableAssets: any[] = [];
  availableAssetIDs: any[] = [];
  openServiceNumber: any = {}
  serviceInitiated: any[] = [];
  repairInitiated: any[] = [];
  providers: any[] = [];
  activeList: any;
  ITSettingData: any = {}
  ECSettingData: any = {}
  manufacturerPartNo: any = ''

  selectedProviderId: string = '';
  modalInstance: any;

  edit: boolean = false;
  selectedItem: any;
  suppliers: any;

  serviceProvider: any = [

  ]

  amcFrequency: any = [
    'Monthly',
    'Quarterly',
    'Half Yearly',
    'Annual',
    '2-Years',
    '3-Years',
    '5-Years',
    'Lifetime'
  ];

  amcType: any = [
    'Comprehensive',
    'Non-Comprehensive',
    'On-Call',
    'Preventive'
  ];

  assetCodeFieldMap: Record<string, string> = {
    "IT Department": "code",
    "Electronic Component": "id",
    "Testing Equipment": "assetTag",
    "Fixed Assets": "faCode",
    "Consumable": "itemCode"
  };

  department: any = [
    'Consumable',
    'IT Department',
    'Electronic Component',
    'Testing Equipment',
    'Fixed Assets'
  ];

  filter: any = {
    department: '',
    category: '',
    subcategory: '',
    manufacturer: '',
    manufacturerPartNumber: '',
  }


  createAMC: FormGroup;
  editServiceProvider: FormGroup;
  createServiceProvider: FormGroup;

  constructor(private database: DatabaseService, private filterService: FilterService) {

    /** New Create AMC */
    this.createAMC = new FormGroup({
      amcName: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      assetsCode: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      startDate: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      endDate: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      serviceProvider: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      cost: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      frequency: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      invoiceNumber: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      amcType: new FormControl(null, [Validators.required, requiredIfNotNull()]),
      additionalNotes: new FormControl(null),
      addCoveredAssets: new FormControl(null),
      paymentInfo: new FormControl(null),
      paymentMode: new FormControl(null),
    }, {
      validators: dateRangeValidator
    });

    /** New Service provider form */
    this.createServiceProvider = new FormGroup({
      serviceProviderName: new FormControl('', [Validators.required]),
      contactInfo: new FormControl(''),
      address: new FormControl(''),
    });

    /** Edit Service provider form */
    this.editServiceProvider = new FormGroup({
      serviceProviderName: new FormControl('', [Validators.required]),
      contactInfo: new FormControl(''),
      address: new FormControl(''),
    });

  }

  ngOnInit(): void {
    /** Get session storage Active List*/
    this.activeList = sessionStorage.getItem('active');
    if (this.activeList) {
      this.activeList = JSON.parse(this.activeList);
      this.filter.department = this.activeList.active;
    }

    this.database.getServiceProvider().subscribe({
      next: (res: any) => {
        this.providers = res.data
        console.log('this is the provider', this.providers)
      },
      error: (e) => {
        console.error(e)
      }
    })

    forkJoin({
      subcats: this.database.getITSubCategoryNameList(),
      cats: this.database.getITCategoryNameList(),
      mans: this.database.getITManufacturerNameList(),
      categories: this.database.getAllCategory(),
      manufacturers: this.database.getAllManufacturer(),
      suppliers: this.database.getAllSupplier(),
    }).subscribe({
      next: (res: any) => {
        this.ITSettingData = {
          subCategoryList: res.subcats?.data?.list || [],
          subCategoryMap: res.subcats?.data?.map || {},
          categoryList: res.cats?.data?.list || [],
          categoryMap: res.cats?.data?.map || {},
          manufacturerList: res.mans?.data?.list || [],
          manufacturerMap: res.mans?.data?.map || {},
        };
        this.ECSettingData = {
          categoryList: res.categories?.list || [],
          categoryMap: res.categories?.nameMap || {},
          manufacturerList: res.manufacturers?.list || [],
          manufacturerMap: res.manufacturers?.nameMap || {},
          supplierList: res.suppliers?.list || [],
          supplierMap: res.suppliers?.nameMap || {},
        }
        if (this.filter.department) {
          this.onDepartmentChange();
        }
      },
      error: (e) => console.error(e)
    });
  }

  // Clear inventory CSV form
  clearInventoryCsvForm() {
    $('#closeModalUpload').click();
  }

  getAssetCode(item: any): string {
    const field = this.assetCodeFieldMap[this.filter.department];
    return item[field] ?? "-";
  }

  get selectedBucket() {
    return (
      this.mapSelectedAsset.find((b: any) => b.department === this.filter.department)
        ?.assets || []
    );
  }

  isSelected(item: any): boolean {
    const dept = this.filter?.department;
    if (!dept) return false;
    const bucket = this.mapSelectedAsset.find((b: any) => b.department === dept);
    return bucket.assets.some((a: any) => a._id === item._id);
  }

  onDepartmentChange() {
    this.category = []
    this.manufacturer = []
    this.subcategory = []
    this.filteredList = []
    this.manufacturerPartNo = ''
    this.filter.category = ''
    this.filter.subcategory = ''
    this.filter.manufacturer = ''
    this.filter.manufacturerPartNo = ''
    const configMap: Record<string, () => void> = {
      'IT Department': () => {
        this.category = this.ITSettingData.categoryList;
        this.subcategory = this.ITSettingData.subCategoryList;
        this.manufacturer = this.ITSettingData.manufacturerList;
      },
      'Electronic Component': () => {
        this.category = this.ECSettingData.categoryList; // Assuming same list
        this.manufacturer = this.ECSettingData.manufacturerList;
      },
      'Testing Equipment': () => {
        this.category = this.ITSettingData.categoryList;
      },
      'Fixed Assets': () => {
        this.category = this.ITSettingData.categoryList;
      },
      'Consumable': () => {
        this.category = this.ITSettingData.categoryList;
      }
    }

    const config = configMap[this.filter.department]
    if (config) config()
  }

  moveAssetToAMC(event: any, asset: any) {
    const isChecked = event?.target?.checked;
    const dept = this.filter.department
    if (!dept) return;
    const bucket = this.mapSelectedAsset.find((b: any) => b.department === dept)
    if (!bucket) return;
    if (isChecked) {
      if (!bucket.assets.some((a: any) => a._id === asset._id)) {
        bucket.assets.push(asset);
      }
    } else {
      bucket.assets = bucket.assets.filter((a: any) => a._id !== asset._id);
    }
  }

  removeFromSelected(event: any, asset: any) {
    const isChecked = event?.target?.checked;
    const dept = this.filter.department;
    if (isChecked) return;
    if (!dept) return;
    const bucket = this.mapSelectedAsset.find((b: any) => b.department === dept);
    if (!bucket) return;
    bucket.assets = bucket.assets.filter((a: any) => a._id !== asset._id);
  }

  onChildFilter(childFilter: any) {
    this.fetchFilteredInventory(childFilter)
  }

  applyParentFilter() {
    this.fetchFilteredInventory(this.filter)
  }

  fetchFilteredInventory(filter: any) {
    this.filteredList = []
    this.filterService.getFilteredInventory(filter)
      .subscribe({
        next: (res: any) => this.filteredList = res.data,
        error: (err) => console.error(err)
      });
  }

  openCreateAMC() {
    this.filteredList = [];
    const bucket = this.mapSelectedAsset.find(
      (b: any) => b.department === this.filter.department
    );

    if (bucket) {
      bucket.assets = [];   // <-- clear the real data
    }
  }

  submitCreateAMC() {
    if (this.createAMC.invalid) {
      this.createAMC.markAllAsTouched();
      console.error("Create AMC Form is invalid");
      return;
    }

    const selectedAsset = this.mapSelectedAsset
      .flatMap((b: any) => b.assets)
      .map((a: any) => a._id);

    if (!selectedAsset || selectedAsset.length === 0) {
      console.error("No assets selected for AMC");
      return;
    }

    const payload = {
      amcName: this.createAMC.value.amcName?.trim(),
      assetsCode: this.createAMC.value.assetsCode.trim(),
      startDate: this.createAMC.value.startDate,
      endDate: this.createAMC.value.endDate,
      serviceProvider: this.createAMC.value.serviceProvider?.trim(),
      cost: Number(this.createAMC.value.cost),
      frequency: this.createAMC.value.frequency,
      invoiceNumber: this.createAMC.value.invoiceNumber,
      amcType: this.createAMC.value.amcType,
      additionalNotes: this.createAMC.value.additionalNotes || '',
      paymentInfo: this.createAMC.value.paymentInfo || null,
      paymentMode: this.createAMC.value.paymentMode || null,
      // include selected assets here
      coveredAssets: selectedAsset
    };
    console.log("Final AMC Payload:", payload);
    this.database.createAMC(payload).
    subscribe({
      next: (res) => {
        console.log("AMC Created Successfully:", res);
        this.createAMC.reset();
        window.location.reload();
      },
      error: (err) => {
        console.error("AMC Creation Failed:", err);
      }
    });
  }
  submitExtended(event: any) {
    this.database.extendedAMC(event.payload).subscribe({
      next: res => {
        console.log("Extended AMC Response", res);
        event.onSuccess();
      },
      error: err => {
        console.error("Extended AMC Error", err);
      }
    });
  }

  getAmcHistory(event: any) {
    let amcID = event.id
    let filter = event.filter || 'all'
    if (!amcID) {
      console.error("AMC ID is missing");
      this.amcHistoryList = [];
      return;
    }
    this.database.getAMCHistory(amcID, filter).subscribe({
      next: (res) => {
        if (res?.status === 1) {
          this.amcHistoryList = res.data || [];
          console.log('amc hostory', this.amcHistoryList)
        } else {
          this.amcHistoryList = [];
          console.warn("Failed to fetch AMC history:", res?.message);
        }
      },
      error: (err) => {
        console.error("Error fetching AMC history:", err);
        this.amcHistoryList = [];
      },
      complete: () => {

      }
    });
  }

  getAMCById(event: any) {
    let amcID = event?.id
    if (!amcID) {
      console.error("AMC ID is missing");
      return;
    }
    this.selectedAMC = null
    this.database.getAMCById(amcID).subscribe({
      next: (res) => {
        if (res?.status === 1) {
          this.selectedAMC = res.data;
          console.log("AMC Details:", this.selectedAMC);
        } else {
          console.warn("Failed to fetch AMC:", res?.message);
          this.selectedAMC = null;
        }
      },
      error: (err) => {
        console.error("Error fetching AMC:", err);
        this.selectedAMC = null;
      }
    });
  }

  handleOpenItem(event: any) {
    this.getAMCAvailableAssets(event);
    this.getOpenOnlyServices(event);
  }

  getAMCAvailableAssets(event: any) {
    let amcID = event.id
    // this.selectedAMCName = ''
    console.log('amcid', amcID)
    if (!amcID) {
      console.error("AMC ID is missing");
      return;
    }
    this.editAMC = null
    this.database.getAMCAvailableAssets(amcID).subscribe({
      next: (res) => {
        if (res?.status === 1) {
          this.editAMC = res.data;
          this.avaiableAssets = res.data.availableAsset
          this.availableAssetIDs = res.data.availableAssetIDs
          console.log("AMC edit:", this.editAMC);
        } else {
          console.warn("Failed to fetch AMC:", res?.message);
          this.editAMC = null;
        }
      },
      error: (err) => {
        console.error("Error fetching AMC:", err);
        this.editAMC = null;
      }
    });
  }

  getOpenOnlyServices(event: any) {
    let amcID = event.id;
    // this.selectedAMCName = ''
    if (!amcID) {
      console.error("AMC ID is missing");
      return;
    }
    // 2. Call backend
    this.database.getOpenOnlyServiceByID(amcID)
      .subscribe({
        next: (res) => {
          console.log('response', res)
          this.openServiceNumber = {
            serviceInitiated: res?.serviceInitiated || [],
            repairInitiated: res?.repairInitiated || []
          }
        },
        error: (err) => {
          console.error("Open-only services API failed", err);
          this.openServiceNumber = {
            serviceInitiated: [],
            repairInitiated: []
          }
        }
      });
  }

  loadServiceInitiated(e: any, which: 'A' | 'B') {
    console.log('parent component', e.serviceNumber)
    console.log('which', which)
    if (!e.serviceNumber) return;
    const payload = { serviceNumber: e.serviceNumber };

    this.database.getServiceDetailsByNumber(payload)
      .subscribe({
        next: (res: any) => {
          const payload = res.status === 1 ? res.data : null;
          console.log('payload--------------', payload)
          if (which === 'A') this.serviceInitiatedDetailsA = payload;
          else this.serviceInitiatedDetailsB = payload;
        },
        error: (err) => {
          console.error("Error loading service details:", err);
        }
      });
  }

  onServiceCloseFromChild(event: any, which: 'A' | 'B') {
    console.log(event)
    if (!event?.payload?.amcID) {
      console.error('missing amcID');
      return;
    }
    this.database.serviceClose(event?.payload).subscribe({
      next: (res) => {
        console.log('Closed', which, res);
        event.onSuccess();
        if (which === 'A') this.serviceInitiatedDetailsA = null;
        else this.serviceInitiatedDetailsB = null;
      },
      error: err => console.error('close failed', err)
    });
  }


  onRepairCloseFromChild(event: any, which: 'A' | 'B') {
    if (!event?.payload?.amcID) {
      console.error('missing amcID');
      return;
    }
    this.database.repairClose(event?.payload).subscribe({
      next: (res) => {
        console.log('Closed', which, res);
        event.onSuccess();
        if (which === 'A') this.repairInitiatedDetailsA = null;
        else this.repairInitiatedDetailsB = null;
      },
      error: err => console.error('close failed', err)
    });
  }

  loadRepairInitiated(e: any, which: 'A' | 'B') {
    console.log('parent component', e.serviceNumber)
    console.log('which', which)
    if (!e.serviceNumber) return;
    const payload = { serviceNumber: e.serviceNumber };

    this.database.getServiceDetailsByNumber(payload)
      .subscribe({
        next: (res: any) => {
          const payload = res.status === 1 ? res.data : null;
          console.log('payload', payload)
          if (which === 'A') this.repairInitiatedDetailsA = payload;
          else this.repairInitiatedDetailsB = payload;
        },
        error: (err) => {
          console.error("Error loading service details:", err);
        }
      });
  }


  /**
   * --------------------------------------------------------------------------------------------------
   * Add new Service provider Section
   *
  */
  submitServiceProvider() {
    if (this.createServiceProvider.invalid) {
      this.createServiceProvider.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.createServiceProvider.value.serviceProviderName.trim(),
      contact: this.createServiceProvider.value.contactInfo,
      address: this.createServiceProvider.value.address
    };

    this.database.createServiceProvider(payload)
      .subscribe({
        next: (res) => {
          console.log('Created:', res);

          // Reset form + close popup (emit event or hide modal)
          this.createServiceProvider.reset();
          window.location.reload();
        },
        error: (err) => {
          if (err.status === 409) {
            alert('Service Provider already exists');
          } else {
            console.error(err);
          }
        }
      });
  }

  submitEditServiceProvider() {
    if (this.editServiceProvider.invalid) {
      this.editServiceProvider.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.editServiceProvider.value.serviceProviderName.trim(),
      contact: this.editServiceProvider.value.contactInfo,
      address: this.editServiceProvider.value.address
    };

    this.database.updateServiceProvider(this.selectedProviderId, payload)
      .subscribe({
        next: (res) => {
          console.log('Created:', res);

          // Reset form + close popup (emit event or hide modal)
          this.createServiceProvider.reset();
          window.location.reload();
        },
        error: (err) => {
          if (err.status === 409) {
            alert('Service Provider already exists');
          } else {
            console.error(err);
          }
        }
      });
  }


  editServiceProviderForm(item: any) {
    this.edit = true;
    this.selectedProviderId = item._id
    this.editServiceProvider.patchValue({
      serviceProviderName: item.name,
      contactInfo: item.contact,
      address: item.address
    });
  }

  closeServiceProviderPopup() {
    this.edit = false;
  }

  /** ----------------------------------*/
  submitInitiateService(event: any) {
    console.log("Initiate Service AMC Payload-----------------------------", event.payload);
    this.database.initiateService(event.payload).subscribe({
      next: res => {
        console.log("Initiate service AMC Response", res);
        event.onSuccess();
      },
      error: err => {
        console.error("Initiate service AMC Error", err);
      }
    });
  }


  updateServiceByNumber(event: any) {
    console.log("Update Service AMC Payload", event.payload);
    this.database.updateServiceByNumber(event.payload).subscribe({
      next: res => {
        console.log("Service update ", res);
        event.onSuccess();
      },
      error: err => {
        console.error("Initiate service AMC Error", err);
      }
    });
  }

  submitInitiateRepair(event: any) {
    console.log("Initiate Repair AMC Payload", event.payload);

    this.database.initiateRepair(event.payload).subscribe({
      next: res => {
        console.log("Initiate Repair AMC Response", res);
        event.onSuccess();
      },
      error: err => {
        console.error("Initiate Repair AMC Error", err);
      }
    });
  }

  submitInitiateRepairClose(event: any) {
    console.log("Initiate Repair AMC Payload", event.payload);

    this.database.repairClose(event.payload).subscribe({
      next: res => {
        console.log("Initiate Repair AMC Response", res);
      },
      error: err => {
        console.error("Initiate Repair AMC Error", err);
      }
    });
  }

}
