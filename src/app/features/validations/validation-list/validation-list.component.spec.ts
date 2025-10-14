import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationListComponent } from './validation-list.component';

describe('ValidationListComponent', () => {
  let component: ValidationListComponent;
  let fixture: ComponentFixture<ValidationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
