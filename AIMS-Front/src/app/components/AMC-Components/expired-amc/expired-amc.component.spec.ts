import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiredAmcComponent } from './expired-amc.component';

describe('ExpiredAmcComponent', () => {
  let component: ExpiredAmcComponent;
  let fixture: ComponentFixture<ExpiredAmcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpiredAmcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpiredAmcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
