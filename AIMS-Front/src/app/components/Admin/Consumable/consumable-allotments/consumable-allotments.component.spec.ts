import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumableAllotmentsComponent } from './consumable-allotments.component';

describe('ConsumableAllotmentsComponent', () => {
  let component: ConsumableAllotmentsComponent;
  let fixture: ComponentFixture<ConsumableAllotmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumableAllotmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumableAllotmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
