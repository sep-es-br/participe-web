import { AuthService } from './../../shared/services/auth.service';
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'tt-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor(
    private authSrv: AuthService
  ) {

  }

  signIn() {
    this.authSrv.signInAcessoCidadao();
  }

}
