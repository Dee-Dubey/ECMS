import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicDashboardComponent } from './electronic-dashboard.component';

describe('ElectronicDashboardComponent', () => {
  let component: ElectronicDashboardComponent;
  let fixture: ComponentFixture<ElectronicDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElectronicDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElectronicDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
