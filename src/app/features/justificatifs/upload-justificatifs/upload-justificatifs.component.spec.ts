import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadJustificatifsComponent } from './upload-justificatifs.component';

describe('UploadJustificatifsComponent', () => {
  let component: UploadJustificatifsComponent;
  let fixture: ComponentFixture<UploadJustificatifsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadJustificatifsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadJustificatifsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
