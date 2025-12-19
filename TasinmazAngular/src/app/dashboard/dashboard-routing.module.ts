// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';

// const routes: Routes = [

// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule]
// })
// export class DashboardRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { LogListComponent } from './admin/logs/log-list/log-list.component';
import { UserListComponent } from './admin/users/user-list/user-list.component';
import { ShortSummaryComponent } from './admin/summary/short-summary/short-summary.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'tasinmaz', pathMatch: 'full' },

      {
        path: 'tasinmaz',
        loadChildren: () =>
          import('./tasinmaz/tasinmaz.module').then((m) => m.TasinmazModule),
      },

      { path: 'profile', component: ProfileComponent },
      {
        path: 'admin',
        component: AdminComponent,
        children: [
           { path: 'summary', component:ShortSummaryComponent },
          { path: 'logs', component: LogListComponent },
          { path: 'users', component: UserListComponent },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
