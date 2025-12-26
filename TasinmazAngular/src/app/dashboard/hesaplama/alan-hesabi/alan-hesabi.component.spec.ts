import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlanHesabiComponent } from './alan-hesabi.component';

describe('AlanHesabiComponent', () => {
  let component: AlanHesabiComponent;
  let fixture: ComponentFixture<AlanHesabiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlanHesabiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlanHesabiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
