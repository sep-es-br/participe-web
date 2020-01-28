import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { Login } from '@app/shared/dto/login';
import { LoginService } from '@app/shared/services/login.service';
import { HomeService } from '@app/shared/services/home.service';

@Component({
  selector: 'tt-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private loginService: LoginService,
    private homeService: HomeService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.validarLogin();
    this.messageService.add({
      severity: 'success',
      summary: 'Teste',
      detail: 'Teste conteudo.'
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      email: ['', Validators.compose([ Validators.required ])],
      senha: ['', Validators.compose([ Validators.required ])]
    })
  }

  private async validarLogin() {
    const token = await this.loginService.buscarToken();
    if (token) {
      const resposta = await this.homeService.show(token);
    }
  }

  async submit(event) {
    event.preventDefault();

    try {

      const login: Login = { ...this.form.value }

      const { token } = await this.loginService.login(login);
      if (token) {
        this.loginService.salvarToken(token)
        this.router.navigate(['/home'])
      }
    } catch (err) {
      console.error(err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Usuário inexistente ou senha incorreta.'
      });
    }
  }
}
