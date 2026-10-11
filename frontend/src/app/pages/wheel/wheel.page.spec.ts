import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WheelPage } from './wheel.page';

describe('WheelPage', () => {
  let component: WheelPage;
  let fixture: ComponentFixture<WheelPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WheelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
