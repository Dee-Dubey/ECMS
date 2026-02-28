import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedSettingComponent } from './fixed-setting.component';

describe('FixedSettingComponent', () => {
  let component: FixedSettingComponent;
  let fixture: ComponentFixture<FixedSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
