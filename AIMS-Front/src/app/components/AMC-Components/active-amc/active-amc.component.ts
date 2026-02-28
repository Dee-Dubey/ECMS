import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators, FormGroupName } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataFormatService } from 'src/app/services/data-format.service';
import { DatabaseService } from 'src/app/services/database.service';
import { FilterService } from 'src/app/services/filter.service';
import { dateRangeValidator } from 'src/app/validators/custom-validator.validator';

@Component({
  selector: 'app-active-amc',
  templateUrl: './active-amc.component.html',
  styleUrls: ['./active-amc.component.css']
})
export class ActiveAmcComponent {

  @Output() amcHistoryRequested = new EventEmitter<{ id: string, filter: string }>
  @Output() amcDetailRequested = new EventEmitter<{ id: string }>
  @Output() openItemRequested = new EventEmitter<{ id: string }>
  @Output() amcServiceRequested = new EventEmitter<{ id: string }>
  @Output() serviceDetailsRequested = new EventEmitter<{ serviceNumber: string }>
  @Output() repairDetailsRequested = new EventEmitter<{ serviceNumber: string }>
  @Output() filterChange = new EventEmitter<any>();
  @Output() submitServiceInitiatedRequest = new EventEmitter<{ payload: any, onSuccess: any }>
  @Output() submitRepairInitiatedRequest = new EventEmitter<{ payload: any, onSuccess: any }>
  @Output() submitExtendedRequested = new EventEmitter<{ payload: any, onSuccess: any }>
  @Output() serviceCloseRequested = new EventEmitter<any>();
  @Output() repairCloseRequested = new EventEmitter<any>();

  @Input() providers: any[] = [];
  @Input() historyList: any[] = [];
  @Input() selectedAMC: any = {};
  @Input() serviceDetails: any = {};
  @Input() repairDetails: any = {};
  @Input() openServiceNumber: any = {};
  @Input() editAMC: any = {};
  @Input() avaiableAssets: any[] = [];
  @Input() availableAssetIDs: any[] = [];
  @Input() mapSelectedAsset: any[] = []
  @Input() ITSettingData!: {
    subCategoryList: any[],
    subCategoryMap: Record<string, any>,
    categoryList: any[],
    categoryMap: Record<string, any>,
    manufacturerList: any[],
    manufacturerMap: Record<string, any>
  };
  @Input() ECSettingData!: {
    supplierList: any[],
    supplierMap: Record<string, any>,
    categoryList: any[],
    categoryMap: Record<string, any>,
    manufacturerList: any[],
    manufacturerMap: Record<string, any>
  };
  @Input() department: string[] = [];
  @Input() filteredList: any;


  selectedName: string = '';
  selectedID: string = '';
  subCategoryList: Array<any> = [];
  categoryList: Array<any> = [];
  manufacturerList: Array<any> = [];

  pageLimit = 10;
  currentPageNo = 1;
  totalPages: any;
  checkBoxIds: string[] = [];

  activeAMCList: any[] = [];
  amcHistoryList: any[] = [];
  selectedAMCName: string = ''

  activeList: any;
  selectedDepartment: string = '';
  manufacturerPartNo: any = ''
  category: any = [];
  subcategory: any = [];
  manufacturer: any = [];
  selectedFilterHistory: string = 'all'

  selectedRow: number | null = null;

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

  filter: any = {
    department: '',
    category: '',
    subcategory: '',
    manufacturer: '',
    manufacturerPartNumber: '',
  }

  assetCodeFieldMap: Record<string, string> = {
    "IT Department": "code",
    "Electronic Component": "id",
    "Testing Equipment": "assetTag",
    "Fixed Assets": "faCode",
    "Consumable": "itemCode"
  };

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

  modifyAMCForm: FormGroup;
  initiateServiceForm: FormGroup;
  serviceCloseForm: FormGroup;
  repairCloseForm: FormGroup;
  repairInitiatedForm: FormGroup;
  extendedForm: FormGroup;

  constructor(private database: DatabaseService, private filterService: FilterService, private dataformat: DataFormatService) {

    this.modifyAMCForm = new FormGroup({
      amcName: new FormControl({ value: '', disabled: true }, [Validators.required]),
      assetsCode: new FormControl(null, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      serviceProvider: new FormControl(null, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      frequency: new FormControl(null, [Validators.required]),
      invoiceNumber: new FormControl(null, [Validators.required]),
      amcType: new FormControl(null, [Validators.required]),
      additionalNotes: new FormControl(null),
      addCoverAssets: new FormControl(null),
    }, {
      validators: dateRangeValidator
    });

    this.extendedForm = new FormGroup({
      amcName: new FormControl({ value: '', disabled: true }, [Validators.required]),
      id: new FormControl({ value: '', disabled: true }, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      serviceProvider: new FormControl(null, [Validators.required]),
      invoiceNumber: new FormControl(null, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      frequency: new FormControl(null, [Validators.required]),
      amcType: new FormControl(null, [Validators.required]),
      additionalNotes: new FormControl(null),
      paymentMode: new FormControl(null),
      paymentInfo: new FormControl(null),
    }, {
      validators: dateRangeValidator
    });

    this.initiateServiceForm = new FormGroup({
      invoiceNumber: new FormControl(null, [Validators.required]),
      estimatedCost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

    this.serviceCloseForm = new FormGroup({
      serviceNumber: new FormControl(null, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      paymentMode: new FormControl(null),
      paymentInfo: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

    this.repairInitiatedForm = new FormGroup({
      invoiceNumber: new FormControl(null, [Validators.required]),
      estimatedCost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

    this.repairCloseForm = new FormGroup({
      serviceNumber: new FormControl(null, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      paymentMode: new FormControl(null),
      paymentInfo: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

  }

  ngOnInit(): void {
    this.activeList = sessionStorage.getItem('active');

    if (this.activeList) {
      this.activeList = JSON.parse(this.activeList);
      this.filter.department = this.activeList.active;
    }

    this.loadAMCs()
  }

  formatDate(dateString: any) {
    if (!dateString) return null; // prevent invalid value
    const dt = new Date(dateString);
    if (isNaN(dt.getTime())) return null; // still invalid
    return dt.toISOString().substring(0, 10);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['editAMC'] && this.editAMC) {
      this.patchAMCForms();
      this.updateCoveredAssets();
    }

    if (changes['serviceDetails'] && this.serviceDetails) {
      this.patchServiceDetailsForms();
    }

    if (changes['repairDetails'] && this.repairDetails) {
      this.patchRepairDetailsForms();
    }

    if (
      changes['ITSettingData'] ||
      changes['ECSettingData'] ||
      changes['filter']
    ) {
      if (
        this.ITSettingData &&
        this.ECSettingData &&
        this.filter?.department &&
        this.editAMC &&
        this.editAMC.coveredAssets
      ) {
        this.updateCoveredAssets();
      }
    }
  }

  patchServiceDetailsForms() {
    this.serviceCloseForm.patchValue({
      cost: this.serviceDetails.estimatedCost ?? '',
      serviceDetails: this.serviceDetails.serviceDetails ?? '',
      paymentMode: this.serviceDetails.paymentMode ?? '',
      paymentInfo: this.serviceDetails.paymentInfo ?? '',
      additionalNotes: this.serviceDetails.additionalNotes ?? '',
    });
  }

  patchRepairDetailsForms() {
    this.repairCloseForm.patchValue({
      cost: this.repairDetails.estimatedCost ?? '',
      serviceDetails: this.repairDetails.serviceDetails ?? '',
      paymentMode: this.repairDetails.paymentMode ?? '',
      paymentInfo: this.repairDetails.paymentInfo ?? '',
      additionalNotes: this.repairDetails.additionalNotes ?? '',
    });
  }

  patchAMCForms() {
    this.modifyAMCForm.patchValue({
      amcName: this.editAMC.amcName,
      assetsCode: this.editAMC.assetsCode,
      startDate: this.formatDate(this.editAMC.startDate),
      endDate: this.formatDate(this.editAMC.endDate),
      serviceProvider: this.editAMC.serviceProvider,
      cost: this.editAMC.cost,
      frequency: this.editAMC.frequency,
      invoiceNumber: this.editAMC.invoiceNumber,
      amcType: this.editAMC.amcType,
      additionalNotes: this.editAMC.additionalNotes,
    });

    this.extendedForm.patchValue({
      amcName: this.editAMC.amcName,
      id: this.editAMC.assetsCode,
      startDate: this.formatDate(this.editAMC.startDate),
      endDate: this.formatDate(this.editAMC.endDate),
      serviceProvider: this.editAMC.serviceProvider,
      invoiceNumber: this.editAMC.invoiceNumber,
      cost: this.editAMC.cost,
      frequency: this.editAMC.frequency,
      amcType: this.editAMC.amcType,
      additionalNotes: this.editAMC.additionalNotes,
      paymentMode: this.editAMC.paymentMode,
      paymentInfo: this.editAMC.paymentInfo,
    });
  }

  updateCoveredAssets() {
    if (
      !this.editAMC ||
      !this.editAMC.coveredAssets ||
      !Array.isArray(this.editAMC.coveredAssets)
    ) {
      // Nothing to update yet, avoid crash
      return;
    }
    this.mapSelectedAsset.forEach((m: any) => {
      const match = this.editAMC.coveredAssets.find(
        (item: any) => item.department === m.department
      );
      m.assets = match?.assets ? [...match.assets] : [];
    });
  }

  loadAMCs() {
    this.database.getAllAMCs(this.currentPageNo, this.pageLimit, 'Active').subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          this.activeAMCList = res.data || [];
          this.totalPages = res.totalPages || 1;
          console.log('active AMC list', this.activeAMCList)
        } else {
          this.activeAMCList = [];
        }
      },
      error: (err: any) => {
        console.error("Error:", err);
        this.activeAMCList = [];
      }
    });
  }

  submitModifyAMC() {
    if (this.modifyAMCForm.invalid) {
      this.modifyAMCForm.markAllAsTouched();
      return;
    }
    const formValue = this.modifyAMCForm.getRawValue();

    const selectedAsset = this.mapSelectedAsset
      .flatMap((b: any) => b.assets)
      .map((a: any) => a._id);

    const payload = {
      amcName: formValue.amcName,
      assetsCode: formValue.assetsCode,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      serviceProvider: formValue.serviceProvider,
      cost: formValue.cost,
      frequency: formValue.frequency,
      invoiceNumber: formValue.invoiceNumber,
      amcType: formValue.amcType,
      additionalNotes: formValue.additionalNotes,

      // Your final asset selection (IDs only)
      coveredAssets: selectedAsset
    };
    console.log("Modify AMC Payload", payload);
    // API call
    this.database.updateAMC(this.editAMC._id, payload)
      .subscribe({
        next: (res) => {
          this.modifyAMCForm.reset();
          // this.closePopup();
          console.log("AMC updated:", res);
        },
        error: (err) => {
          console.error("Update error:", err);
        }
      });
  }

  submitExtended() {
    if (this.extendedForm.invalid) {
      this.extendedForm.markAllAsTouched();
      return;
    }
    const formValue = this.extendedForm.getRawValue();
    const payload = {
      amcID: this.editAMC._id,
      amcName: formValue.amcName,
      id: formValue.id,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      serviceProvider: formValue.serviceProvider,
      invoiceNumber: formValue.invoiceNumber,
      cost: formValue.cost,
      frequency: formValue.frequency,
      amcType: formValue.amcType,
      additionalNotes: formValue.additionalNotes,
      paymentMode: formValue.paymentMode,
      paymentInfo: formValue.paymentInfo,
    };
    console.log("ExtendedForm AMC Payload", payload);
    this.submitExtendedRequested.emit({
      payload,
      onSuccess: () => {
        this.extendedForm.reset();
        this.closePopup();
      }
    })
  }

  onSubmitInitiateService() {
    if (this.initiateServiceForm.invalid) {
      this.initiateServiceForm.markAllAsTouched();
      return;
    }
    const formValue = this.initiateServiceForm.getRawValue();

    const payload = {
      amcID: this.editAMC._id,
      invoiceNumber: formValue.invoiceNumber,
      estimatedCost: formValue.estimatedCost,
      serviceDetails: formValue.serviceDetails,
      additionalNotes: formValue.additionalNotes,
      servicedAssets: this.checkBoxIds
    };
    this.submitServiceInitiatedRequest.emit({
      payload,
      onSuccess: () => {
        this.initiateServiceForm.reset();
        // this.closePopup();
      }
    });
  }

  submitServiceClose() {
    if (this.serviceCloseForm.invalid) {
      this.serviceCloseForm.markAllAsTouched();
      return;
    }
    const formValue = this.serviceCloseForm.getRawValue();
    const payload = {
      amcID: this.editAMC._id,
      serviceNumber: formValue.serviceNumber,
      cost: formValue.cost,
      paymentMode: formValue.paymentMode,
      paymentInfo: formValue.paymentInfo,
      serviceDetails: formValue.serviceDetails,
      additionalNotes: formValue.additionalNotes,
    };
    this.serviceCloseRequested.emit({
      payload,
      onSuccess: () => {
        this.serviceCloseForm.reset();
        this.closePopup();
      }
    });
  }

  submitRepairInitiated() {
    if (this.repairInitiatedForm.invalid) {
      this.repairInitiatedForm.markAllAsTouched();
      return;
    }
    const formValue = this.repairInitiatedForm.getRawValue();

    const payload = {
      amcID: this.editAMC._id,
      invoiceNumber: formValue.invoiceNumber,
      estimatedCost: formValue.estimatedCost,
      serviceDetails: formValue.serviceDetails,
      additionalNotes: formValue.additionalNotes,
      servicedAssets: this.checkBoxIds
    };
    console.log(payload)
    this.submitRepairInitiatedRequest.emit({
      payload,
      onSuccess: () => {
        this.repairInitiatedForm.reset();
        this.closePopup();
      }
    });
  }

  submitRepairClose() {
    if (this.repairCloseForm.invalid) {
      this.repairCloseForm.markAllAsTouched();
      return;
    }
    const formValue = this.repairCloseForm.getRawValue();
    const payload = {
      amcID: this.editAMC._id,
      serviceNumber: formValue.serviceNumber,
      cost: formValue.cost,
      paymentMode: formValue.paymentMode,
      paymentInfo: formValue.paymentInfo,
      serviceDetails: formValue.serviceDetails,
      additionalNotes: formValue.additionalNotes,
    };
    this.repairCloseRequested.emit({
      payload,
      onSuccess: () => {
        this.repairCloseForm.reset();
        this.closePopup();
      }
    });
  }


  checkBoxInputId(id: string) {
    this.checkBoxIds.push(id);
  }

  clearSelection() {
    $('#ActiveAMCDetailsLabel').click();
  }

  //This function is used to toggle the details in add/create
  toggleCollapse(index: number) {
    if (this.selectedRow === index) {
      this.selectedRow = null;
    } else {
      this.selectedRow = index;
    }
  }

  getAssetCode(item: any): string {
    const field = this.assetCodeFieldMap[this.filter.department];
    return item[field] ?? "-";
  }

  applyFilter() {
    this.filterChange.emit(this.filter);
  }

  onDepartmentChange() {
    this.category = [];
    this.manufacturer = [];
    this.subcategory = [];
    this.filteredList = [];
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
        this.category = this.ECSettingData.categoryList;
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


  changeHistoryFilter(event: any) {
    this.selectedFilterHistory = event.target.value;
    this.amcHistoryRequested.emit({
      id: this.selectedID,
      filter: event.target.value
    })
  }

  openHistory(item: any) {
    this.selectedID = item._id
    this.selectedFilterHistory = 'all'
    this.selectedName = item.amcName
    this.amcHistoryRequested.emit({
      id: item._id,
      filter: this.selectedFilterHistory
    })
  }

  openDetails(item: any) {
    this.selectedName = item.amcName
    this.amcDetailRequested.emit({
      id: item._id,
    })
  }

  openEdit(item: any) {
    this.selectedName = item.amcName
    this.openItemRequested.emit({
      id: item._id,
    });
  }

  closePopup() {
    console.log('popup close!!!');
    window.location.reload();
  }

  changeServiceNumber(event: any) {
    if (event?.serviceNumber !== undefined) {
      this.serviceDetailsRequested.emit({
        serviceNumber: event?.serviceNumber
      })
    } else {
      this.serviceDetails = {}
    }
  }

  changeRepairNumber(event: any) {
    if (event?.serviceNumber !== undefined) {
      this.repairDetailsRequested.emit({
        serviceNumber: event?.serviceNumber
      })
    } else {
      this.repairDetails = {}
    }
  }

  getHeaders(assets: any[]): string[] {
    if (!assets?.length) return [];
    return this.dataformat.filterKeys(Object.keys(assets[0]));
  }

  resolveValue(asset: any, key: string, dept: string) {
    return this.dataformat.resolveValue(asset, key, dept, this.ITSettingData, this.ECSettingData);
  }

  toDisplayName(key: string) {
    return this.dataformat.toDisplayName(key);
  }

  /**------------------------------------------------------**/

  changeDataLimit() {
    this.currentPageNo = 1;
    this.loadAMCs();
  }

  //It is used to go on first page
  goToFirstPage() {
    if (this.currentPageNo !== 1) {
      this.currentPageNo = 1;
      this.loadAMCs();
    }
  }

  previousPage() {
    if (this.currentPageNo > 1) {
      this.currentPageNo--;
      this.loadAMCs();
    }
  }

  goToPage(page: number) {
    if (page !== this.currentPageNo) {
      this.currentPageNo = page;
      this.loadAMCs();
    }
  }

  getPagesToShow(): number[] {
    const pages: number[] = [];

    const start = Math.max(1, this.currentPageNo - 1);
    const end = Math.min(this.totalPages, this.currentPageNo + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  nextPage() {
    if (this.currentPageNo < this.totalPages) {
      this.currentPageNo++;
      this.loadAMCs();
    }
  }

  goToLastPage() {
    if (this.currentPageNo !== this.totalPages) {
      this.currentPageNo = this.totalPages;
      this.loadAMCs();
    }
  }

}
