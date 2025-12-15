import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { DashboardLayoutComponent } from './dashboard/dashboard-layout/dashboard-layout.component';
//import { AuthGuard } from './shared/auth.guard';

// const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   //auth
//   { path: 'login', component: LoginComponent },
//   { path: 'register', component: RegisterComponent },
//   //dashboard
//   {
//     path: 'dashboard',
//     component: DashboardLayoutComponent,
//     //canActivate: [AuthGuard],
//     children: [
//       {path:'',redirectTo:'tasinmaz',pathMatch:'full'},
//       {
//         path: 'tasinmaz',
//         loadChildren: () =>
//           import('./dashboard/tasinmaz/tasinmaz.module').then(
//             (m) => m.TasinmazModule
//           ),
//       },
//       {
//         path: 'users',
//         loadChildren: () =>
//           import('./dashboard/users/users.module').then((m) => m.UsersModule),
//       },
//       {
//         path: 'logs',
//         loadChildren: () =>
//           import('./dashboard/logs/logs.module').then((m) => m.LogsModule),
//       },
//     ],
//   },
//   {path:'**',redirectTo:'login'} // rota yanlışsa -> login
// ];

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },

  { path: '**', redirectTo: 'login' }
];





@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
