import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentSettingComponent } from './component-setting.component';

describe('ComponentSettingComponent', () => {
  let component: ComponentSettingComponent;
  let fixture: ComponentFixture<ComponentSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
