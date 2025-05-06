import { Component } from '@angular/core';
import { CalorieService } from '../../../../service/calorieService/calorie.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../service/userService/user.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule, MatDatepicker } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FoodService } from '../../../../service/foodService/food.service';
import { ActivityService } from '../../../../service/activityService/activity.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardContent, MatCardTitle, MatCardSubtitle} from '@angular/material/card';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface UserDetails {
  name: string,
  age : number,
  height : number,
  weight : number,
  gender : string 
  // add other properties as needed
}

interface UserCalories{
  history_date : string,
  total_food_calories : number,
  total_activity_calories : number,
  bmr : number,
  foods : [],
  activities : []
}

interface FoodGroup {
  group : string,
  foods : [object]
}
interface ActivityCategory {
  category : string,
  activities : [object]
}

@Component({
  selector: 'app-manage-user-calories',
  providers : [
    provideNativeDateAdapter()
  ],
  imports: [
    MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, 
    CommonModule, MatOptionModule, MatSelectModule, 
    MatDatepickerModule, MatCardModule, RouterModule, MatProgressSpinnerModule
  ],
  templateUrl: './manage-user-calories.component.html',
  styleUrl: './manage-user-calories.component.scss'
})
export class ManageUserCaloriesComponent {  
  
  pendingApis : number = 0;
  userId : string = '';
  userDetails : UserDetails = {
    name: '',
    age : 0,
    height : 0,
    weight : 0,
    gender : ''
  };
  _id : string = '';
  userCalories : UserCalories = {
    history_date : '',
    total_food_calories : 0,
    total_activity_calories : 0,
    bmr : 0,
    foods : [],
    activities : []
  }
  foodGroups : any;
  foodGroupKeys : any;
  activityCategories : any;
  activityCategoryKeys : any;
  form: FormGroup;
  minDate = new Date();
  maxDate = new Date();

  constructor(
    private fb: FormBuilder, 
    private calorieService : CalorieService, 
    private userService : UserService,
    private foodService : FoodService,
    private activityService : ActivityService,
    private router:Router, 
    private route: ActivatedRoute,
    private toastr : ToastrService
  ) {

    this.form = this.fb.group({
      history_date: ['', Validators.required],
      foods: this.fb.array([]),
      activities: this.fb.array([]),
      total_food_calories : [0, Validators.required],
      total_activity_calories : [0, Validators.required],
      bmr : [0, Validators.required],
      total_calories_in : [0, Validators.required],
      total_calories_out : [0, Validators.required],
      net_calories : [0, Validators.required]
    });

    this.minDate.setDate(this.maxDate.getDate() - 30);
  }

 
  ngOnInit(){
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this._id = this.route.snapshot.queryParamMap.get('_id') || '';
    if(this._id){
      this.pendingApis = 4;
      this.getCaloriesDetails();
    }else{
      this.pendingApis = 3;
      this.addFood();
      this.addActivity();
    }
    this.getUserDetails();
    this.getFoodGroups();
    this.getActivityCategories();
  }

  //api
  getUserDetails() {
    this.userService.GetUser(this.userId).subscribe(
      (data) => {
        this.userDetails = data?.data?.user;

        const bmr = this.getBMR(
          this.userDetails.gender, this.userDetails.height, this.userDetails.weight, this.userDetails.age
        );
        this.form.get('bmr')?.setValue(bmr);
        this.form.get('total_calories_out')?.setValue(bmr);
        this.form.get('net_calories')?.setValue(-bmr);

        this.decrementLoader();
      },
      (error) => {
        console.error('Error fetching user details:', error);
        this.toastr.error('There was an error fetching user details!');
      }
    );
  }
  //api
  getCaloriesDetails() {
    this.calorieService.GetCalories(this._id).subscribe(
      (data) => {
        this.userCalories = data?.data?.userCalories;

        this.form.patchValue({
          history_date : this.userCalories.history_date,
          total_food_calories : this.userCalories.total_food_calories,
          total_activity_calories : this.userCalories.total_activity_calories,
          bmr : this.userCalories.bmr,
          total_calories_in : this.userCalories.total_food_calories,
          total_calories_out : this.userCalories.total_activity_calories + this.userCalories.bmr,
          net_calories : this.userCalories.total_food_calories - (this.userCalories.total_activity_calories + this.userCalories.bmr)
        })

        this.userCalories.foods.forEach((food : any)=>{
          this.foods.push(this.fb.group({
            group: [food.group || '' , Validators.required],
            food_id: [food.food_id || '', Validators.required],
            calories: [food.calories || '', Validators.required],
            serving : [food.serving || '', Validators.required],
            quantity: [food.quantity || '', Validators.required],
            total_calories: [food.total_calories || '', Validators.required],
          }));
        })
        
        this.userCalories.activities.forEach((activity : any)=>{
          this.activities.push(this.fb.group({
            category: [activity.category || '' , Validators.required],
            activity_id: [activity.activity_id || '', Validators.required],
            minutes: [activity.minutes || '', Validators.required],
            total_calories: [activity.total_calories || '', Validators.required],
          }));
        })

        this.decrementLoader();
      },
      (error) => {
        console.error('Error fetching user calories:', error);
        this.toastr.error('There was an error fetching the user calories!');
      }
    );
  }
  //api
  getFoodGroups() {
    this.foodService.GetFoodGroups().subscribe(
      (data) => {
        const response = data?.data?.foodGroups;
        this.foodGroups = {};
        response?.forEach((foodGroup : FoodGroup)=>{
          this.foodGroups[foodGroup?.group] = foodGroup?.foods
        })
        this.foodGroupKeys = Object.keys(this.foodGroups);

        this.decrementLoader();
      },
      (error) => {
        console.error('Error fetching food groups:', error);
        this.toastr.error('There was an error fetching the food groups!');
      }
    );
  }
  //api
  getActivityCategories() {
    this.activityService.GetActivityCategories().subscribe(
      (data) => {
        const response = data?.data?.activityCategories;
        this.activityCategories = {};
        response?.forEach((activityCategory : ActivityCategory)=>{
          this.activityCategories[activityCategory?.category] = activityCategory?.activities;
        })
        this.activityCategoryKeys = Object.keys(this.activityCategories);

        this.decrementLoader();
      },
      (error) => {
        console.error('Error fetching actvity categories:', error);
        this.toastr.error('There was an error fetching the activity categories!');
      }
    );
  }

  get foods(): FormArray {
    return this.form.get('foods') as FormArray;
  }

  get activities(): FormArray {
    return this.form.get('activities') as FormArray;
  }

  createFoodGroup(): FormGroup {
    return this.fb.group({
      group: ['', Validators.required],
      food_id: ['', Validators.required],
      calories: ['', Validators.required],
      serving : ['', Validators.required],
      quantity: ['', Validators.required],
      total_calories: ['', Validators.required],
    });
  }
  addFood(): void {
    this.foods.push(this.createFoodGroup());
  }
  removeFood(index: number): void {
    this.foods.removeAt(index);
  }
  onFoodGroupChange(index: number): void {
    const group = this.foods.at(index) as FormGroup;
    const totalCaloriesDeduct = group.value.total_calories;
    const totalFoodCalories = this.form.value.total_food_calories;
    this.form.get('total_food_calories')?.setValue(totalFoodCalories - totalCaloriesDeduct);
    const totalCaloriesIn = this.form.value.total_calories_in;
    this.form.get('total_calories_in')?.setValue(totalCaloriesIn - totalCaloriesDeduct);
    const totalCaloriesInNew = totalCaloriesIn - totalCaloriesDeduct;
    const totalCaloriesOut = this.form.value.total_calories_out;
    this.form.get('net_calories')?.setValue((totalCaloriesInNew - totalCaloriesOut));

    group.get('food_id')?.reset();
    group.get('calories')?.reset();
    group.get('serving')?.reset();
    group.get('quantity')?.reset();
    group.get('total_calories')?.reset();
  }
  onFoodSelection(index: number): void {
    const group = this.foods.at(index) as FormGroup;
    const foodGroup = group.get('group')?.value;
    const selectedFoodId = group.get('food_id')?.value;
    const food = this.foodGroups[foodGroup].find((f:any) => f.food_id === selectedFoodId);

    const totalCaloriesDeduct = group.value.total_calories;
    const totalFoodCalories = this.form.value.total_food_calories;
    this.form.get('total_food_calories')?.setValue(totalFoodCalories - totalCaloriesDeduct + food.calories);
    const totalCaloriesIn = this.form.value.total_calories_in;
    this.form.get('total_calories_in')?.setValue(totalCaloriesIn - totalCaloriesDeduct + food.calories);
    const totalCaloriesInNew = totalCaloriesIn - totalCaloriesDeduct + food.calories;
    const totalCaloriesOut = this.form.value.total_calories_out;
    this.form.get('net_calories')?.setValue((totalCaloriesInNew - totalCaloriesOut));

    if (food) {
      group.get('calories')?.setValue(food.calories);
      group.get('serving')?.setValue(food.serving);
      group.get('quantity')?.setValue(1);
      group.get('total_calories')?.setValue(food.calories);
    }
  }
  onFoodQuantityChange(index: number): void {
    const group = this.foods.at(index) as FormGroup;
    const totalCaloriesDeduct = group.value.total_calories;
    const calories = Number(group.get('calories')?.value);
    const quantity = Number(group.get('quantity')?.value);
    group.get('total_calories')?.setValue(calories * quantity);
    const totalCaloriesNew = group.value.total_calories;

    const totalFoodCalories = this.form.value.total_food_calories;
    this.form.get('total_food_calories')?.setValue(totalFoodCalories - totalCaloriesDeduct + totalCaloriesNew);
    const totalCaloriesIn = this.form.value.total_calories_in;
    this.form.get('total_calories_in')?.setValue(totalCaloriesIn - totalCaloriesDeduct + totalCaloriesNew);
    const totalCaloriesInNew = totalCaloriesIn - totalCaloriesDeduct + totalCaloriesNew;
    const totalCaloriesOut = this.form.value.total_calories_out;
    this.form.get('net_calories')?.setValue(Math.abs(totalCaloriesInNew - totalCaloriesOut));
  }

  createActivityGroup(): FormGroup {
    return this.fb.group({
      category : ['', Validators.required],
      activity_id : ['', Validators.required],
      minutes: ['', [Validators.required, Validators.min(1)]],
      total_calories : ['', Validators.required],
    });
  }
  addActivity(): void {
    this.activities.push(this.createActivityGroup());
  }
  removeActivity(index: number): void {
    this.activities.removeAt(index);
  }
  onActivityCategoryChange(index: number): void {
    const group = this.activities.at(index) as FormGroup;
    const totalCaloriesDeduct = group.value.total_calories;
    const totalActivityCalories = this.form.value.total_activity_calories;
    this.form.get('total_activity_calories')?.setValue(totalActivityCalories - totalCaloriesDeduct);
    const totalCaloriesOut = this.form.value.total_calories_out;
    this.form.get('total_calories_out')?.setValue(totalCaloriesOut - totalCaloriesDeduct);
    const totalCaloriesIn = this.form.value.total_calories_in;
    const totalCaloriesOutNew = this.form.value.total_calories_out;
    this.form.get('net_calories')?.setValue(Math.abs(totalCaloriesIn - totalCaloriesOutNew));

    group.get('activity_id')?.reset();
    group.get('minutes')?.reset();
    group.get('total_calories')?.reset();
  }
  onActivitySelection(index: number): void {
    const group = this.activities.at(index) as FormGroup;
    const category = group.get('category')?.value;
    const activity_id = group.get('activity_id')?.value;
    const activity = this.activityCategories[category].find((activity:any) => activity.activity_id === activity_id);
    const activityCalories = this.getActivityCalories(1, activity.met_value);

    const totalCaloriesDeduct = group.value.total_calories;
    const totalActivityCalories = this.form.value.total_activity_calories;
    this.form.get('total_activity_calories')?.setValue(totalActivityCalories - totalCaloriesDeduct + activityCalories);
    const totalCaloriesOut = this.form.value.total_calories_out;
    this.form.get('total_calories_out')?.setValue(totalCaloriesOut - totalCaloriesDeduct + activityCalories);
    const totalCaloriesIn = this.form.value.total_calories_in;
    const totalCaloriesOutNew = this.form.value.total_calories_out;            
    this.form.get('net_calories')?.setValue(Math.abs(totalCaloriesIn - totalCaloriesOutNew));

    if (activity) {
      group.get('minutes')?.setValue(1);
      group.get('total_calories')?.setValue(activityCalories);
    }
  }
  onChangeMinutes(index: number): void {
    const group = this.activities.at(index) as FormGroup;
    const category = group.value.category;
    const activity_id = group.value.activity_id;
    const activity = this.activityCategories[category].find((activity:any) => activity.activity_id == activity_id);
    const minutes = group.value.minutes;
    const activityCalories = this.getActivityCalories(minutes, activity.met_value);
    const totalCaloriesDeduct = group.value.total_calories;
    
    group.get('total_calories')?.setValue(activityCalories);
    const totalActivityCalories = this.form.value.total_activity_calories;
    this.form.get('total_activity_calories')?.setValue(totalActivityCalories - totalCaloriesDeduct + activityCalories);
    const totalCaloriesOut = this.form.value.total_calories_out;
    this.form.get('total_calories_out')?.setValue(totalCaloriesOut - totalCaloriesDeduct + activityCalories);
    const totalCaloriesIn = this.form.value.total_calories_in;
    const totalCaloriesOutNew = this.form.value.total_calories_out;
    this.form.get('net_calories')?.setValue((totalCaloriesIn - totalCaloriesOutNew));
  }

  getBMR(gender : string, height : number,  weight : number, age : number){
    return gender == 'male'
      ? 66.4730 + (13.7516 * weight) + (5.0033 * height) - (6.7550 * age)
      : 655.0955 + ( 9.5634 * weight ) + (1.8496 * height) - (4.6756 * age)
  }
  getActivityCalories(mins:number, metValue:number){
    return metValue * this.userDetails?.weight * (mins/60);
  }
  // setBMR(){
  // }

  onSubmit(): void {
    if (this.form.valid) {
      const data = {
        ...this.form.value,
        user_id : this.userId
      }
      if(this._id){
        data._id = this._id;
        this.calorieService.UpdateCalories(data).subscribe(
          (data) => {
            this.toastr.success('Calories updated successfully');
            this.router.navigate(['user/calories/list', this.userId]);
          },
          (error) => {
            this.toastr.error(error?.error?.message || 'There was an error updating the calories');
          }
        );
      }else{  
        this.calorieService.AddCalorie(data).subscribe(
          (data) => {
            this.toastr.success('Calories Reported successfully');
            this.router.navigate(['user/calories/list', this.userId]);
          },
          (error) => {
            this.toastr.error(error?.error?.message || 'There was an error reporting the calories!');
          }
        );
      }
    } else {
      this.form.markAllAsTouched();
    }
  }

  decrementLoader() {
    this.pendingApis--;
  }
}
