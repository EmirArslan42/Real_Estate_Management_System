import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlanHesabiComponent } from './alan-hesabi/alan-hesabi.component';

const routes: Routes = [
  {path:'', redirectTo:'alan-hesabi',pathMatch:'full'},
  {path:'alan-hesabi',component:AlanHesabiComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HesaplamaRoutingModule { }
