import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BomToolsComponent } from './bom-tools.component';

describe('BomToolsComponent', () => {
  let component: BomToolsComponent;
  let fixture: ComponentFixture<BomToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BomToolsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BomToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
