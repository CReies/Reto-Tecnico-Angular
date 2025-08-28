import { Routes } from '@angular/router';
import { LayoutMain } from './ui/layouts/layout-main/layout-main';
import { HomePageContainer } from './containers/home-page-container/home-page-container';

export const routes: Routes = [
  {
    path: '',
    component: LayoutMain,
    children: [{ path: '', component: HomePageContainer, outlet: 'main' }]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];
