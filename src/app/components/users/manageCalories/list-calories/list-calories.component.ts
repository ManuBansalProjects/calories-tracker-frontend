import { Component, ViewChild } from '@angular/core';
import { UserService } from '../../../../service/userService/user.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CalorieService } from '../../../../service/calorieService/calorie.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';

export interface PeriodicElement {
  _id : string,
  history_date : string,
  total_food_calories : number,
  total_activity_calories : number,
  bmr : number,
  total_in_calories : number,
  total_out_calories : number,
  net__calories : number,
}

interface UserDetails {
  name?: string;
  // add other properties as needed
}

@Component({
  selector: 'app-list-calories',
  imports: [MatTableModule, MatPaginatorModule, 
    MatIconModule, MatButtonModule, MatDividerModule, MatCardModule, RouterModule
  ],
  templateUrl: './list-calories.component.html',
  styleUrl: './list-calories.component.scss'
})
export class ListCaloriesComponent {

  userId : string = '';
  userDetails : UserDetails = {};
  totalCaloriesCount = 0;

  //paginator code
  displayedColumns: string[] = [
    'history_date', 'total_food_calories', 'total_activity_calories', 'bmr', 
    'total_in_calories', 'total_out_calories', 'net__calories', 'actions'
  ];
  dataSource = new MatTableDataSource<PeriodicElement>([]);
  totalUsers = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private calorieService : CalorieService, 
    private userService : UserService,
    private router:Router, 
    private route: ActivatedRoute,
    private toastr : ToastrService
  ) {}

  ngOnInit(){
    this.userId = this.route.snapshot.paramMap.get('userId') || '';
    this.loadCalories(0, 10);  
    this.getUserDetails();
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.loadCalories(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  // Method to load the list of users from the backend
  loadCalories(pageIndex:number, pageSize:number) {
    this.calorieService.ListCalories({ skip : pageIndex*pageSize, limit : pageSize, userId : this.userId }).subscribe(
      (data) => {
        console.log('Fetched calories:', data);
        // Transform the data into the format expected by the table
        this.dataSource.data = data?.data?.calories?.map((calorie: any) => ({
          _id : calorie._id,
          history_date : (new Date(calorie.history_date)).toDateString(),
          total_food_calories: calorie.total_food_calories,
          total_activity_calories: calorie.total_activity_calories,
          bmr: calorie.bmr,
          total_in_calories: calorie.total_in_calories,
          total_out_calories : calorie.total_out_calories,
          net_calories : calorie.net_calories
        }));

        this.totalCaloriesCount= data?.data?.count;
      },
      (error) => {
        console.error('Error fetching calories:', error);
        alert('There was an error fetching the calories!');
      }
    );
  }

  getUserDetails() {
    this.userService.GetUser(this.userId).subscribe(
      (data) => {
        this.userDetails = data?.data?.user;
      },
      (error) => {
        console.error('Error fetching calories:', error);
        this.toastr.error('There was an error fetching the calories!');
      }
    );
  }
  

  //add or update calory function
  manageCalories(_id : string | null){
    // this.router.navigate(['/user/calories/manage-calories', _id]);
    this.router.navigate(
      ['/user/calories/manage-calories', this.userId], 
      { queryParams: { _id: _id } }
    );
  }
  
  deleteCalories(_id : string){
    this.calorieService.DeleteCalories(_id).subscribe(
      (data) => {
        this.toastr.success('Calories deleted successfully');
        this.loadCalories(0, 10);
      },
      (error) => {
        console.error('Error deleting calories:', error);
        this.toastr.error('Error deleting calories');
      }
    );
  }
}
