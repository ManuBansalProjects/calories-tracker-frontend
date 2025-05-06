import {AfterViewInit, Component, ViewChild, inject, Inject, ChangeDetectionStrategy, OnInit} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogModule, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserFormDialogComponent } from './user-form-dialog/user-form-dialog.component';
import { UserService } from '../../../service/userService/user.service';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

export interface PeriodicElement {
  user_id : string,
  name: string;
  age : number,
  gender : string,
  weight: number;
  height : number,
}

@Component({
  selector: 'app-user',
  imports: [
    MatTableModule, MatPaginatorModule, 
    MatIconModule, MatButtonModule, MatDividerModule, 
    MatDialogModule, MatCardModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements AfterViewInit, OnInit{

   //paginator code
   displayedColumns: string[] = ['name', 'gender', 'age', 'weight', 'height', 'actions'];
   dataSource = new MatTableDataSource<PeriodicElement>([]);
   totalUsers = 0;
   @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog, 
    private userService : UserService, 
    private router:Router,
    private toastr : ToastrService
  ) {}

  ngOnInit(){
    this.loadUsers(0, 10);
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.loadUsers(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  //dialog code
  openDialog(data:object | null) {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '400px',
      data: data // optional
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Form result:', result);
        this.loadUsers(0, 10);
        this.toastr.success(`User ${result.userId ? 'updated' : 'created'} successfully`);
      }
    });
  }
  
  // Method to load the list of users from the backend
  loadUsers(pageIndex:number, pageSize:number) {
    this.userService.ListUsers({ skip : pageIndex*pageSize, limit : pageSize}).subscribe(
      (data) => {
        console.log('Fetched users:', data);
        // Transform the data into the format expected by the table
        this.dataSource.data = data?.data?.users?.map((user: any) => ({
          user_id : user._id,
          name: user.name,
          age: user.age,
          gender: user.gender,
          weight: user.weight,
          height: user.height
        }));

        this.totalUsers= data?.data?.count;
      },
      (error) => {
        console.error('Error fetching users:', error);
        alert('There was an error fetching the users!');
      }
    );
  }
  
  deleteUser(userId:string){
    this.userService.DeleteUser(userId).subscribe(
      (data) => {
        this.toastr.success('User deleted successfully');
        this.loadUsers(0, 10);
      },
      (error) => {
        console.error('Error deleting user:', error);
        this.toastr.error('Error deleting user');
      }
    );
  }

  listCalories(userId: string) {
    this.router.navigate(['/user/calories/list', userId]);
  }
}

