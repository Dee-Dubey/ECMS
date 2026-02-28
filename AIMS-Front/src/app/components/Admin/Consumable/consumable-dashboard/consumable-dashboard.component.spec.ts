import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumableDashboardComponent } from './consumable-dashboard.component';

describe('ConsumableDashboardComponent', () => {
  let component: ConsumableDashboardComponent;
  let fixture: ComponentFixture<ConsumableDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumableDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumableDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
