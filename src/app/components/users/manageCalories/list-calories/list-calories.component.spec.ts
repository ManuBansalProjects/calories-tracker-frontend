import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCaloriesComponent } from './list-calories.component';

describe('ListCaloriesComponent', () => {
  let component: ListCaloriesComponent;
  let fixture: ComponentFixture<ListCaloriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCaloriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListCaloriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
