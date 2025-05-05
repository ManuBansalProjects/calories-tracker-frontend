import { Routes } from '@angular/router';
import { UserComponent } from './components/users/user/user.component';


export const routes: Routes = [
    { path: '', component: UserComponent },
    {
        path: 'user/calories/list/:userId',
        loadComponent: () => import('./components/users/manageCalories/list-calories/list-calories.component')
        .then(m => m.ListCaloriesComponent)
    },
    {
        path: 'user/calories/manage-calories/:userId',
        loadComponent: () => import('./components/users/manageCalories/manage-user-calories/manage-user-calories.component')
        .then(m => m.ManageUserCaloriesComponent)
    },
    { path: '**', redirectTo: '' } // fallback route
];
