import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDashboardComponent } from './fixed-dashboard.component';

describe('FixedDashboardComponent', () => {
  let component: FixedDashboardComponent;
  let fixture: ComponentFixture<FixedDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
