import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HesaplamaRoutingModule } from './hesaplama-routing.module';
import { AlanHesabiComponent } from './alan-hesabi/alan-hesabi.component';
import { TasinmazModule } from '../tasinmaz/tasinmaz.module';


@NgModule({
  declarations: [
    AlanHesabiComponent,
  ],
  imports: [
    CommonModule,
    HesaplamaRoutingModule,
    TasinmazModule
  ]
})
export class HesaplamaModule { }
