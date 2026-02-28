import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventorySettingComponent } from './inventory-setting.component';

describe('InventorySettingComponent', () => {
  let component: InventorySettingComponent;
  let fixture: ComponentFixture<InventorySettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InventorySettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventorySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
