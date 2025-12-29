import { TestBed } from '@angular/core/testing';

import { AlanAnalizService } from './alan-analiz.service';

describe('AlanAnalizService', () => {
  let service: AlanAnalizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlanAnalizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
