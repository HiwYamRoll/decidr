import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiJudgePage } from './ai-judge.page';

describe('AiJudgePage', () => {
  let component: AiJudgePage;
  let fixture: ComponentFixture<AiJudgePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AiJudgePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
