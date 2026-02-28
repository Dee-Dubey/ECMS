import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataFormatService } from 'src/app/services/data-format.service';
import { DatabaseService } from 'src/app/services/database.service';

@Component({
  selector: 'app-active-service-transaction',
  templateUrl: './active-service-transaction.component.html',
  styleUrls: ['./active-service-transaction.component.css']
})
export class ActiveServiceTransactionComponent {

  @Output() openItemRequested = new EventEmitter<{ id: string }>
  @Output() amcCloseRequested = new EventEmitter<{ id: string }>
  @Output() amcEditRequested = new EventEmitter<{ id: string }>
  @Output() serviceDetailsRequested = new EventEmitter<{ serviceNumber: string }>
  @Output() serviceCloseRequested = new EventEmitter<any>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() editServiceRequest = new EventEmitter<{ payload: any, onSuccess: any }>
  @Input() selectedAMC: any = {};
  @Input() selectedService: any = {};
  @Input() serviceDetails: any = {};
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

  selectedName: any = ''
  pageLimit = 5;
  currentPageNo = 1;
  totalPages: any;

  activeList: any;
  selectedDepartment: string = '';
  openServices: any[] = []
  mapSelectedAsset: any[] = []

  checkBoxIds: string[] = [];
  activeAMCList: any[] = [];

  initiateServiceForm: FormGroup;
  serviceCloseForm: FormGroup;

  constructor(private database: DatabaseService, private dataFormat: DataFormatService) {

    this.initiateServiceForm = new FormGroup({
      invoiceNumber: new FormControl(null, [Validators.required]),
      estimatedCost: new FormControl(null, [Validators.required]),
      serviceDetails: new FormControl(null),
      additionalNotes: new FormControl(null),
    });

    this.serviceCloseForm = new FormGroup({
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

    this.loadInitiateService();

  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['serviceDetails'] && this.serviceDetails) {
      const assets = this.serviceDetails.servicedAssets;
      if (!assets || !Array.isArray(assets)) {
        this.mapSelectedAsset = [];
      } else {
        this.mapSelectedAsset = JSON.parse(JSON.stringify(assets));
      };
      this.patchServiceDetailsForms();
    }
  }

  patchServiceDetailsForms() {
    this.serviceCloseForm.patchValue({
      serviceNumber: this.serviceDetails?.serviceNumber ?? '',
      cost: this.serviceDetails?.estimatedCost ?? '',
      serviceDetails: this.serviceDetails?.serviceDetails ?? '',
      paymentMode: this.serviceDetails?.paymentMode ?? '',
      paymentInfo: this.serviceDetails?.paymentInfo ?? '',
      additionalNotes: this.serviceDetails?.additionalNotes ?? '',
    });

    this.initiateServiceForm.patchValue({
      invoiceNumber: this.serviceDetails?.invoiceNumber ?? '',
      estimatedCost: this.serviceDetails?.estimatedCost ?? '',
      serviceDetails: this.serviceDetails?.serviceDetails ?? '',
      additionalNotes: this.serviceDetails?.additionalNotes ?? '',
    });
  }

  /** ---------------------------------------------------------*/
  clearInitiateServiceForm() {
    $('#initiateServiceModalLabel').click();
  }

  clearSelection() {
    $('#activeServiceDetailsLabel').click();
  }

  clearInitiateServiceClose() {
    $('#initiateServiceCloseModalLabel').click();
  }

  /** --------------------------------------------------------*/
  openDetails(item: any) {
    this.selectedName = item.amcID.amcName
    this.serviceDetailsRequested.emit({
      serviceNumber: item.serviceNumber
    });
  }

  openEdit(item: any) {
    console.log(item.serviceNumber)
    this.selectedName = item.amcID.amcName
    // this.openItemRequested.emit({
    //   id: item.amcID._id,
    // });

    this.serviceDetailsRequested.emit({
      serviceNumber: item.serviceNumber
    });

    this.patchServiceDetailsForms()
  }

  openClose(item: any) {
    this.serviceDetails = null;
    this.selectedName = item.amcID.amcName;
    // this.serviceCloseForm.reset()
    // this.amcCloseRequested.emit({
    //   id: item.amcID._id,
    // })

    if (item?.serviceNumber !== undefined) {
      this.serviceDetailsRequested.emit({
        serviceNumber: item.serviceNumber
      });

      this.patchServiceDetailsForms();
    } else {
      this.serviceDetails = null
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

  /** ---------------------------------------------------------*/
  getHeaders(assets: any[]): string[] {
    if (!assets?.length) return [];
    return this.dataFormat.filterKeys(Object.keys(assets[0]));
  }

  toDisplayName(key: string) {
    return this.dataFormat.toDisplayName(key);
  }

  checkBoxInputId(id: string) {
    this.checkBoxIds.push(id);
  }

  resolveValue(asset: any, key: string, dept: string) {
    return this.dataFormat.resolveValue(asset, key, dept, this.ITSettingData, this.ECSettingData);
  }

  /** ---------------------------------------------------------*/
  onSubmitInitiateService() {
    if (this.initiateServiceForm.invalid) {
      this.initiateServiceForm.markAllAsTouched();
      return;
    }
    const formValue = this.initiateServiceForm.getRawValue();

    const selectedAsset = this.mapSelectedAsset
      .flatMap((b: any) => b.assets)
      .map((a: any) => a._id);

    if (selectedAsset.length === 0) {
      return alert('Atleast 1 serviced Asset is selected')
    }

    const payload = {
      amcID: this.serviceDetails.amcID,
      serviceNumber: this.serviceDetails.serviceNumber,
      invoiceNumber: formValue.invoiceNumber,
      estimatedCost: formValue.estimatedCost,
      serviceDetails: formValue.serviceDetails,
      additionalNotes: formValue.additionalNotes,
      servicedAssets: selectedAsset
    };

    console.log("update Service AMC Payload", payload);
    this.editServiceRequest.emit({
      payload,
      onSuccess: () => {
        this.initiateServiceForm.reset();
        this.closePopup();
      }
    });
  }

  submitInitiateServiceClose() {
    if (this.serviceCloseForm.invalid) {
      this.serviceCloseForm.markAllAsTouched();
      return;
    }
    const formValue = this.serviceCloseForm.getRawValue();
    const payload = {
      amcID: this.serviceDetails.amcID,
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

  /**--------------------------------------------------------------**/
  //This gives the updated data after pagination
  loadInitiateService() {
    this.database
      .getOpenOnlyServices({
        currentPageNo: this.currentPageNo,
        pageLimit: this.pageLimit,
        transactionType: "service initiate"
      })
      .subscribe({
        next: (res) => {
          console.log("pagination response", res);

          if (res?.status === 1) {
            this.openServices = res.data || [];
            // IMPORTANT: Set pagination values from backend
            this.totalPages = res.totalPages || 1;
            this.currentPageNo = res.currentPageNo || 1;
            // this.totalRecords = res.totalRecords || 0;

          } else {
            this.openServices = [];
            this.totalPages = 1;
            // this.totalRecords = 0;
          }
        },

        error: (err) => {
          console.error("Error fetching services:", err);
          this.openServices = [];
          this.totalPages = 1;
          // this.totalRecords = 0;
        }
      });
  }

  changeDataLimit() {
    this.currentPageNo = 1;
    this.loadInitiateService();
  }

  goToFirstPage() {
    if (this.currentPageNo !== 1) {
      this.currentPageNo = 1;
      this.loadInitiateService();
    }
  }

  previousPage() {
    if (this.currentPageNo > 1) {
      this.currentPageNo--;
      this.loadInitiateService();
    }
  }

  goToPage(page: number) {
    if (page !== this.currentPageNo) {
      this.currentPageNo = page;
      this.loadInitiateService();
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
      this.loadInitiateService();
    }
  }

  goToLastPage() {
    if (this.currentPageNo !== this.totalPages) {
      this.currentPageNo = this.totalPages;
      this.loadInitiateService();
    }
  }

}
