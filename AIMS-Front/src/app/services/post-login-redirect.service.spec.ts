import { TestBed } from '@angular/core/testing';

import { PostLoginRedirectService } from './post-login-redirect.service';

describe('PostLoginRedirectService', () => {
  let service: PostLoginRedirectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostLoginRedirectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
