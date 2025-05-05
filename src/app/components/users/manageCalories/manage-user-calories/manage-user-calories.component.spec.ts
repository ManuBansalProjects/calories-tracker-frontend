import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageUserCaloriesComponent } from './manage-user-calories.component';

describe('ManageUserCaloriesComponent', () => {
  let component: ManageUserCaloriesComponent;
  let fixture: ComponentFixture<ManageUserCaloriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageUserCaloriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageUserCaloriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
