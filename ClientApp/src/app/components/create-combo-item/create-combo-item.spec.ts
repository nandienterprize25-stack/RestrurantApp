import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateComboItem } from './create-combo-item';

describe('CreateComboItem', () => {
  let component: CreateComboItem;
  let fixture: ComponentFixture<CreateComboItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateComboItem],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateComboItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
