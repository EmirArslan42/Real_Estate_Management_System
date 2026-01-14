import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';
import { AdminComponent } from './admin/admin.component';
import { LogListComponent } from './admin/logs/log-list/log-list.component';
import { UserListComponent } from './admin/users/user-list/user-list.component';
import { ShortSummaryComponent } from './admin/summary/short-summary/short-summary.component';


@NgModule({
  declarations: [
    DashboardLayoutComponent,
    ProfileComponent,
    AdminComponent,
    LogListComponent,
    UserListComponent,
    ShortSummaryComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports:[]
})
export class DashboardModule { }
