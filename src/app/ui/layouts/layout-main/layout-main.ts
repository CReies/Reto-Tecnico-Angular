import { Component } from '@angular/core';
import { HeaderContainer } from '../../../containers/header-container/header-container';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-main',
  imports: [HeaderContainer, RouterOutlet],
  templateUrl: './layout-main.html',
  styleUrl: './layout-main.css'
})
export class LayoutMain {

}
