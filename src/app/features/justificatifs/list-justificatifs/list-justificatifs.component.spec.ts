import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListJustificatifsComponent } from './list-justificatifs.component';

describe('ListJustificatifsComponent', () => {
  let component: ListJustificatifsComponent;
  let fixture: ComponentFixture<ListJustificatifsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListJustificatifsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListJustificatifsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
