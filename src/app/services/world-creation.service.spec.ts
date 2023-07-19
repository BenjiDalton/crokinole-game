import { TestBed } from '@angular/core/testing';

import { WorldCreationService } from './world-creation.service';

describe('WorldCreationService', () => {
  let service: WorldCreationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorldCreationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
