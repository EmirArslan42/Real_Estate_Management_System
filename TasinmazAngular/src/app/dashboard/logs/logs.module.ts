import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogsRoutingModule } from './logs-routing.module';
import { ListComponent } from './list/list.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListComponent
  ],
  imports: [
    CommonModule,
    LogsRoutingModule,
    ReactiveFormsModule,
  ]
})
export class LogsModule { }
