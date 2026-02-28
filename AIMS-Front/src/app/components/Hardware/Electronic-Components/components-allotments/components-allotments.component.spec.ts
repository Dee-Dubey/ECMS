import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsAllotmentsComponent } from './components-allotments.component';

describe('ComponentsAllotmentsComponent', () => {
  let component: ComponentsAllotmentsComponent;
  let fixture: ComponentFixture<ComponentsAllotmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentsAllotmentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentsAllotmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
