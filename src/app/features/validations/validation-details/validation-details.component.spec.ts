import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDetailsComponent } from './validation-details.component';

describe('ValidationDetailsComponent', () => {
  let component: ValidationDetailsComponent;
  let fixture: ComponentFixture<ValidationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
