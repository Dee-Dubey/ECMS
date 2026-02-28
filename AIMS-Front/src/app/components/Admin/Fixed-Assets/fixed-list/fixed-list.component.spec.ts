import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedListComponent } from './fixed-list.component';

describe('FixedListComponent', () => {
  let component: FixedListComponent;
  let fixture: ComponentFixture<FixedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FixedListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
