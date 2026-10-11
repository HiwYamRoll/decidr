import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular/lazy';

import { AiJudgePageRoutingModule } from './ai-judge-routing.module';

import { AiJudgePage } from './ai-judge.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AiJudgePageRoutingModule
  ],
  declarations: [AiJudgePage]
})
export class AiJudgePageModule {}
