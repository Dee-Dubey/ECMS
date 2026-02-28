import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveRepairTransactionComponent } from './active-repair-transaction.component';

describe('ActiveRepairTransactionComponent', () => {
  let component: ActiveRepairTransactionComponent;
  let fixture: ComponentFixture<ActiveRepairTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveRepairTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveRepairTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
