import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HardwareElectronicComponent } from './hardware-electronic.component';

describe('HardwareElectronicComponent', () => {
  let component: HardwareElectronicComponent;
  let fixture: ComponentFixture<HardwareElectronicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HardwareElectronicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HardwareElectronicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
