import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HesaplamaRoutingModule } from './hesaplama-routing.module';
import { AlanHesabiComponent } from './alan-hesabi/alan-hesabi.component';
import { TasinmazModule } from '../tasinmaz/tasinmaz.module';
// import { AlanAnalizMapComponent } from './alan-analiz-map/alan-analiz-map.component';


@NgModule({
  declarations: [
    AlanHesabiComponent,
    // AlanAnalizMapComponent,
  ],
  imports: [
    CommonModule,
    HesaplamaRoutingModule,
    TasinmazModule
  ],
  exports:[
    
  ]
})
export class HesaplamaModule { }
