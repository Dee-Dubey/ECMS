import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveServiceTransactionComponent } from './active-service-transaction.component';

describe('ActiveServiceTransactionComponent', () => {
  let component: ActiveServiceTransactionComponent;
  let fixture: ComponentFixture<ActiveServiceTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveServiceTransactionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveServiceTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
