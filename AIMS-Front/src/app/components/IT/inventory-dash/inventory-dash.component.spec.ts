import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryDashComponent } from './inventory-dash.component';

describe('InventoryDashComponent', () => {
  let component: InventoryDashComponent;
  let fixture: ComponentFixture<InventoryDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventoryDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
