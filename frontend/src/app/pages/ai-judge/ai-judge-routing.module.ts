import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AiJudgePage } from './ai-judge.page';

const routes: Routes = [
  {
    path: '',
    component: AiJudgePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AiJudgePageRoutingModule {}
