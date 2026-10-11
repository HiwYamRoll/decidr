import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WheelPage } from './wheel.page';

const routes: Routes = [
  {
    path: '',
    component: WheelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WheelPageRoutingModule {}
