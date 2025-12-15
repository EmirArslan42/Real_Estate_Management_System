import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasinmazRoutingModule } from './tasinmaz-routing.module';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import {ReactiveFormsModule} from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [
    ListComponent,
    AddComponent,
    EditComponent
  ],
  imports: [
    CommonModule,
    TasinmazRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class TasinmazModule { }
