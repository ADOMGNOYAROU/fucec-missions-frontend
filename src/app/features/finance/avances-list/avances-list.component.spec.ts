import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvancesListComponent } from './avances-list.component';

describe('AvancesListComponent', () => {
  let component: AvancesListComponent;
  let fixture: ComponentFixture<AvancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvancesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
