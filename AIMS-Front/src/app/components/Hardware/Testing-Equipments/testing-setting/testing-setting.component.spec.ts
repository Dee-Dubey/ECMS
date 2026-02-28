import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingSettingComponent } from './testing-setting.component';

describe('TestingSettingComponent', () => {
  let component: TestingSettingComponent;
  let fixture: ComponentFixture<TestingSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
