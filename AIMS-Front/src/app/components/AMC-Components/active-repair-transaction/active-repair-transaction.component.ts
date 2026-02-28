import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataFormatService } from 'src/app/services/data-format.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-active-repair-transaction',
  templateUrl: './active-repair-transaction.component.html',
  styleUrls: ['./active-repair-transaction.component.css']
})
export class ActiveRepairTransactionComponent {

  @Output() openItemRequested = new EventEmitter<{ id: string }>
  @Output() amcCloseRequested = new EventEmitter<{ id: string }>
  @Output() amcEditRequested = new EventEmitter<{ id: string }>
  @Output() repairDetailsRequested = new EventEmitter<{ serviceNumber: string }>
  @Output() repairCloseRequested = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() editRepairRequest = new EventEmitter<{ payload: any, onSuccess: any }>
  @Input() selectedService: any = {};
  @Input() repairDetails: any = {};
  @Input() openServiceNumber: any = {};
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

  selectedName: string = '';
  pageLimit = 5;
  currentPageNo = 1;
  totalPages: any;

  activeList: any;
  selectedDepartment: string = '';
  openRepair: any[] = []
  mapSelectedAsset: any[] = []

  checkBoxIds: string[] = [];
  activeAMCList: any[] = [];
  openServices: any[] = []

  repairInitiatedForm: FormGroup;
  repairCloseForm: FormGroup;

  constructor(private database: DatabaseService, private dataformat: DataFormatService) {

    this.repairInitiatedForm = new FormGroup({
      invoiceNumber: new FormControl(null, [Validators.required]),
      estimatedCost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

    this.repairCloseForm = new FormGroup({
      serviceNumber: new FormControl({ value: '', disabled: true }, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      paymentMode: new FormControl(null),
      paymentInfo: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

  }

  ngOnInit(): void {
    /** Get session storage Active List*/
    this.activeList = sessionStorage.getItem('active');

    /** Check condition Get session storage Active List*/
    if (this.activeList) {
      this.activeList = JSON.parse(this.activeList);
      this.selectedDepartment = this.activeList.active; // e.g. "IT Department"
    }
    this.loadInitiateRepair();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['repairDetails'] && this.repairDetails) {
      console.log('on change repair detail', this.repairDetails)
      const assets = this.repairDetails.servicedAssets;
      if (!assets || !Array.isArray(assets)) {
        this.mapSelectedAsset = [];
      } else {
        this.mapSelectedAsset = JSON.parse(JSON.stringify(assets));
      };
      this.patchRepairDetailsForms();
    }
  }

  /**-------------------------------------------------- */
  patchRepairDetailsForms() {
    console.log('repair details', this.repairDetails)
    this.repairCloseForm.patchValue({
      serviceNumber: this.repairDetails?.serviceNumber,
      cost: this.repairDetails?.estimatedCost ?? '',
      serviceDetails: this.repairDetails?.serviceDetails ?? '',
      paymentMode: this.repairDetails?.paymentMode ?? '',
      paymentInfo: this.repairDetails?.paymentInfo ?? '',
      additionalNotes: this.repairDetails?.additionalNotes ?? '',
    });

    this.repairInitiatedForm.patchValue({
      invoiceNumber: this.repairDetails?.invoiceNumber ?? '',
      estimatedCost: this.repairDetails?.estimatedCost ?? '',
      serviceDetails: this.repairDetails?.serviceDetails ?? '',
      additionalNotes: this.repairDetails?.additionalNotes ?? '',
    });
  }

  /** -----------------------------------------------*/
  clearInitiateRepairForm() {
    $('#initiateRepairModalLabel').click();
  }

  clearSelection() {
    $('#activeRepairDetailsLabel').click();
  }

  clearInitiateRepairClose() {
    $('#initiateRepairCloseModalLabel').click();
  }

  /** -----------------------------------------*/
  submitRepairInitiated() {
    if (this.repairInitiatedForm.invalid) {
      this.repairInitiatedForm.markAllAsTouched();
      return;
    }
    const formValue = this.repairInitiatedForm.getRawValue();

    const selectedAsset = this.mapSelectedAsset
      .flatMap((b: any) => b.assets)
      .map((a: any) => a._id);

    if (selectedAsset.length === 0) {
      return alert('Atleast 1 serviced Asset is selected')
    }

    const payload = {
      serviceNumber: this.repairDetails.serviceNumber,
      invoiceNumber: formValue.invoiceNumber,
      estimatedCost: formValue.estimatedCost,
      serviceDetails: formValue.serviceDetails,
      additionalNotes: formValue.additionalNotes,
      servicedAssets: selectedAsset
    };
    console.log("Repair Initiated AMC Payload", payload);
    this.editRepairRequest.emit({
      payload,
      onSuccess: () => {
        this.repairCloseForm.reset();
        this.closePopup();
      }
    });
  }

  initiateRepairClose() {
    if (this.repairCloseForm.invalid) {
      this.repairCloseForm.markAllAsTouched();
      return;
    }
    const formValue = this.repairCloseForm.getRawValue();
    const payload = {
      amcID: this.repairDetails.amcID,
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

  /** -----------------------------------------------*/
  openDetails(item: any) {
    this.selectedName = item.amcID.amcName
    this.repairDetailsRequested.emit({
      serviceNumber: item.serviceNumber
    })
  }

  openEdit(item: any) {
    this.selectedName = item.amcID.amcName

    this.repairDetailsRequested.emit({
      serviceNumber: item.serviceNumber
    });
    this.patchRepairDetailsForms()
  }

  openClose(item: any) {
    this.repairDetails = null
    this.selectedName = item.amcID.amcName
    this.repairCloseForm.reset()

    if (item?.serviceNumber !== undefined) {
      this.repairDetailsRequested.emit({
        serviceNumber: item?.serviceNumber
      })
      this.patchRepairDetailsForms();
    } else {
      this.repairDetails = null
    }
  }

  closePopup() {
    console.log('popup close!!!');
    window.location.reload();
  }

  changeServicedAsset(event: any, asset: any, department: string) {
    const isChecked = event.target.checked;
    const dept = this.mapSelectedAsset.find((d: any) => d.department === department);
    console.log('dept', dept)
    if (!dept) return;
    if (isChecked) {
      const exists = dept.assets.some((a: any) => a._id === asset._id)
      if (!exists) {
        dept.assets.push(asset);
      }
    } else {
      dept.assets = dept.assets.filter((a: any) => a._id !== asset._id)
    }
    console.log('map selected ASset', this.mapSelectedAsset)
  }

  checkBoxInputId(id: string) {
    this.checkBoxIds.push(id);
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

  /**----------------------------------------------------------------------------------------------------------------------------**/
  //This gives the updated data after pagination
  loadInitiateRepair() {
    this.database
      .getOpenOnlyServices({
        currentPageNo: this.currentPageNo,
        pageLimit: this.pageLimit,
        transactionType: "repair initiate"
      })
      .subscribe({
        next: (res) => {
          console.log("pagination response", res);

          if (res?.status === 1) {
            this.openRepair = res.data || [];
            this.totalPages = res.totalPages || 1;
            this.currentPageNo = res.currentPageNo || 1;

          } else {
            this.openRepair = [];
            this.totalPages = 1;
          }
        },

        error: (err) => {
          console.error("Error fetching services:", err);
          this.openRepair = [];
          this.totalPages = 1;
          // this.totalRecords = 0;
        }
      });
  }

  changeDataLimit() {
    this.currentPageNo = 1;
    this.loadInitiateRepair();
  }

  goToFirstPage() {
    if (this.currentPageNo !== 1) {
      this.currentPageNo = 1;
      this.loadInitiateRepair();
    }
  }

  previousPage() {
    if (this.currentPageNo > 1) {
      this.currentPageNo--;
      this.loadInitiateRepair();
    }
  }

  goToPage(page: number) {
    if (page !== this.currentPageNo) {
      this.currentPageNo = page;
      this.loadInitiateRepair();
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
      this.loadInitiateRepair();
    }
  }

  goToLastPage() {
    if (this.currentPageNo !== this.totalPages) {
      this.currentPageNo = this.totalPages;
      this.loadInitiateRepair();
    }
  }

}
