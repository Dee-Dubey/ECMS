import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentDashComponent } from './component-dash.component';

describe('ComponentDashComponent', () => {
  let component: ComponentDashComponent;
  let fixture: ComponentFixture<ComponentDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentDashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComponentDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
