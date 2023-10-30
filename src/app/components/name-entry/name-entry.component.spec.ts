import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NameEntryComponent } from './name-entry.component';

describe('NameEntryComponent', () => {
  let component: NameEntryComponent;
  let fixture: ComponentFixture<NameEntryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NameEntryComponent]
    });
    fixture = TestBed.createComponent(NameEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
