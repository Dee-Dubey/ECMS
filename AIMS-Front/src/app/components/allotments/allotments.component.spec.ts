import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllotmentsComponent } from './allotments.component';

describe('AllotmentsComponent', () => {
  let component: AllotmentsComponent;
  let fixture: ComponentFixture<AllotmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllotmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllotmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
