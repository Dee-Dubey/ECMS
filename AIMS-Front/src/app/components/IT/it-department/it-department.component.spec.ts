import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItDepartmentComponent } from './it-department.component';

describe('ItDepartmentComponent', () => {
  let component: ItDepartmentComponent;
  let fixture: ComponentFixture<ItDepartmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItDepartmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItDepartmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
