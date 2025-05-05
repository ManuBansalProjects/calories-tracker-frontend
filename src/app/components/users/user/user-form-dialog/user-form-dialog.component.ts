import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserService } from '../../../../service/userService/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-form-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, 
    CommonModule, MatOptionModule, MatSelectModule ],
  templateUrl: './user-form-dialog.component.html',
  styleUrl: './user-form-dialog.component.scss'
})
export class UserFormDialogComponent {
  form: FormGroup;
  userId : string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private toastr : ToastrService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(0)]],
      gender: ['', Validators.required],
      height: ['', [Validators.required, Validators.min(30)]],
      weight: ['', [Validators.required, Validators.min(1)]],
    });

    if (data) {
      this.userId = data.user_id;
      this.form.patchValue(data);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const submittedData = this.form.value;

      if(this.userId){
        submittedData._id = this.userId;
        this.userService.UpdateUser(submittedData).subscribe(
          (res) => {
            console.log('User updated:', res);
            this.dialogRef.close({userId : this.userId});
          },
          (err) => {
            console.error('Update failed:', err);
            this.toastr.error('Error updating user');
          }
        );
      }else{
        this.userService.createUser(submittedData).subscribe(
          (res) => {
            console.log('User created:', res);
            this.dialogRef.close({});
          },
          (err) => {
            console.error('Creation failed:', err);
            alert('Error creating user');
            this.toastr.error('Error creating user');
          }
        );
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
