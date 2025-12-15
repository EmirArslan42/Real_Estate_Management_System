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

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'tasinmaz', pathMatch: 'full' },

      {
        path: 'tasinmaz',
        loadChildren: () =>
          import('./tasinmaz/tasinmaz.module').then(m => m.TasinmazModule),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/users.module').then(m => m.UsersModule),
      },
      {
        path: 'logs',
        loadChildren: () =>
          import('./logs/logs.module').then(m => m.LogsModule),
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
