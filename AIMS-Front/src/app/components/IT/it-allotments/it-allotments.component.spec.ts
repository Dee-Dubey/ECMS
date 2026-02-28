import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItAllotmentsComponent } from './it-allotments.component';

describe('ItAllotmentsComponent', () => {
  let component: ItAllotmentsComponent;
  let fixture: ComponentFixture<ItAllotmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItAllotmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItAllotmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
