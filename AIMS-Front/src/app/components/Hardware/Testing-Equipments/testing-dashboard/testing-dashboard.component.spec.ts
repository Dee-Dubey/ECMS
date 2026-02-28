import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingDashboardComponent } from './testing-dashboard.component';

describe('TestingDashboardComponent', () => {
  let component: TestingDashboardComponent;
  let fixture: ComponentFixture<TestingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
