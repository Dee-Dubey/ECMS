import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestingAllotmentsComponent } from './testing-allotments.component';

describe('TestingAllotmentsComponent', () => {
  let component: TestingAllotmentsComponent;
  let fixture: ComponentFixture<TestingAllotmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestingAllotmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestingAllotmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
