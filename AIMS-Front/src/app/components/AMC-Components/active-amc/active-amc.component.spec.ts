import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveAmcComponent } from './active-amc.component';

describe('ActiveAmcComponent', () => {
  let component: ActiveAmcComponent;
  let fixture: ComponentFixture<ActiveAmcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveAmcComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveAmcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
