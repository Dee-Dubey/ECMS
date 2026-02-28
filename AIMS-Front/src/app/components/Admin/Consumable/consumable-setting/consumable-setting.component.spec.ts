import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumableSettingComponent } from './consumable-setting.component';

describe('ConsumableSettingComponent', () => {
  let component: ConsumableSettingComponent;
  let fixture: ComponentFixture<ConsumableSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsumableSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsumableSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
