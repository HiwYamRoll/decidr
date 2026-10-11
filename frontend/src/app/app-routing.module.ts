import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'wheel',
    pathMatch: 'full'
  },
  {
    path: 'folder/:folder',
    loadChildren: () => import('./folder/folder.module').then( m => m.FolderPageModule)
  },
  {
    path: 'wheel',
    loadChildren: () => import('./pages/wheel/wheel.module').then( m => m.WheelPageModule)
  },
  {
    path: 'ai-judge',
    loadChildren: () => import('./pages/ai-judge/ai-judge.module').then( m => m.AiJudgePageModule)
  },
  {
    path: 'history',
    loadChildren: () => import('./pages/history/history.module').then( m => m.HistoryPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, bindToComponentInputs: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
