import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { dateRangeValidator } from 'src/app/validators/custom-validator.validator';
import { DatabaseService } from 'src/app/services/database.service';
import { DataFormatService } from 'src/app/services/data-format.service';

@Component({
  selector: 'app-expired-amc',
  templateUrl: './expired-amc.component.html',
  styleUrls: ['./expired-amc.component.css']
})
export class ExpiredAmcComponent {

  @Output() amcHistoryRequested = new EventEmitter<{ id: string, filter: string }>
  @Output() amcDetailRequested = new EventEmitter<{ id: string }>
  @Output() openItemRequested = new EventEmitter<{ id: string }>
  @Output() submitExtendedRequested = new EventEmitter<{ payload: any, onSuccess: any }>
  @Input() historyList: any[] = [];
  @Input() selectedAMC: any = {};
  @Input() editAMC: any = {};
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

  pageLimit = 10;
  currentPageNo = 1;
  totalPages: any;

  expiredAMCList: any[] = [];
  amcHistoryList: any[] = [];
  selectedAMCName: string = ''

  selectedName: string = '';
  selectedID: string = '';
  activeList: any;
  selectedDepartment: string = '';

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

  reNewAMCForm: FormGroup;

  constructor(private database: DatabaseService, private dataformat: DataFormatService) {

    this.reNewAMCForm = new FormGroup({
      amcName: new FormControl({ value: '', disabled: true }, [Validators.required]),
      id: new FormControl({ value: '', disabled: true }, [Validators.required]),
      startDate: new FormControl(null, [Validators.required]),
      endDate: new FormControl(null, [Validators.required]),
      serviceProvider: new FormControl({ value: '', disabled: true }, [Validators.required]),
      invoiceNumber: new FormControl({ value: '', disabled: true }, [Validators.required]),
      cost: new FormControl(null, [Validators.required]),
      frequency: new FormControl(null, [Validators.required]),
      amcType: new FormControl(null, [Validators.required]),
      additionalNotes: new FormControl(null),
      paymentMode: new FormControl(null),
      paymentInfo: new FormControl(null),
    }, {
      validators: dateRangeValidator
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

    this.loadAMCs();
  }

  loadAMCs() {
    this.database.getAllAMCs(this.currentPageNo, this.pageLimit, 'Expired').subscribe({
      next: (res: any) => {
        if (res?.status === 1) {
          this.expiredAMCList = res.data || [];
          this.totalPages = res.totalPages || 1;
          console.log(this.expiredAMCList)
        } else {
          this.expiredAMCList = [];
        }
      },
      error: (err: any) => {
        console.error("Error:", err);
        this.expiredAMCList = [];
      }
    });
  }

  clearSelection() {
    $('#expiredAMCDetailsLabel').click();
  }

  clearReNewForm() {
    $('#expiredAMCRenewModalLabel').click();
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
    }
  }

  patchAMCForms() {
    console.log('edit', this.editAMC)
    this.reNewAMCForm.patchValue({
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

  submitReNewAMC() {
    if (this.reNewAMCForm.invalid) {
      this.reNewAMCForm.markAllAsTouched();
      return;
    }
    const formValue = this.reNewAMCForm.getRawValue();
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
        this.reNewAMCForm.reset();
        this.closePopup();
      }
    });

  }

  changeHisttoryFilter(event: any) {
    this.selectedFilterHistory = event.target.value;
    this.amcHistoryRequested.emit({
      id: this.selectedID,
      filter: this.selectedFilterHistory
    })
  }

  openHistory(item: any) {
    this.selectedID = item._id
    this.selectedFilterHistory = 'all';
    this.selectedName = item.amcName
    this.amcHistoryRequested.emit({
      id: item._id,
      filter: this.selectedFilterHistory
    })
  }

  openEdit(item: any) {
    this.selectedName = item.amcName
    this.openItemRequested.emit({
      id: item._id,
    });
  }

  openDetails(item: any) {
    this.selectedName = item.amcName
    this.amcDetailRequested.emit({ id: item._id });
  }

  closePopup() {
    console.log('popup close!!!');
    window.location.reload();
  }

  //This function is used to toggle the details in add/create
  toggleCollapse(index: number) {
    if (this.selectedRow === index) {
      this.selectedRow = null;
    } else {
      this.selectedRow = index;
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

  /**----------------------------------------------------------------------------------------------------------------------------**/
  //This gives the updated data after pagination

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
