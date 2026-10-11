import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { WheelPageRoutingModule } from './wheel-routing.module';

import { WheelPage } from './wheel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WheelPageRoutingModule
  ],
  declarations: [WheelPage]
})
export class WheelPageModule {}
