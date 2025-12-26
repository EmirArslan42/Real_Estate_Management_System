import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TasinmazRoutingModule } from './tasinmaz-routing.module';
import { ListComponent } from './list/list.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';
import {ReactiveFormsModule} from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { TasinmazMapComponent } from './tasinmaz-map/tasinmaz-map.component';


@NgModule({
  declarations: [
    ListComponent,
    AddComponent,
    EditComponent,
    TasinmazMapComponent
  ],
  imports: [
    CommonModule,
    TasinmazRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports:[
    TasinmazMapComponent
  ]
})
export class TasinmazModule { }
