import { Component, inject } from '@angular/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatTabGroup, MatTab, MatTabsModule } from '@angular/material/tabs';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle } from "@angular/material/card";
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {  Validators, ReactiveFormsModule, FormBuilder, FormGroup,  } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-access',
  imports: [MatTabGroup, MatTab, MatTabsModule, MatInputModule, MatProgressSpinnerModule, MatFormField, MatLabel, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatError, ReactiveFormsModule, MatProgressSpinner],
  templateUrl: './access.html',
  styleUrl: './access.scss',
  standalone: true
})
export class Access {
  private fb = inject(FormBuilder)
   auth = inject(AuthService)

   registerSuccessMsg: string | null = null;


  registerForm: FormGroup = this.fb.group({
    name: ['', Validators.required, Validators.minLength(3)],
    lastname: ['', Validators.required, Validators.minLength(3)],
    email: ['', Validators.required, Validators.email],
    password: ['', Validators.required, Validators.minLength(8)],
    confirmPassword: ['',Validators.required, Validators.minLength(8)]
  })

  loginForm = this.fb.group({
    email: ['', Validators.required, Validators.email],
    password: ['', Validators.required]
  })

  


  onRegister(){
    if (this.registerForm.invalid) return;

    const {name, lastname, email, password, confirmPassword} = this.registerForm.getRawValue();

    if (password !== confirmPassword) {
      this.auth.error.set('Le password non corrispondono');
      return;
    }

    this.auth.register({
      name: name!,
      lastname: lastname!,
      email: email!,
      password: password!,
    }).subscribe(res => {
      if (!res) return;

      this.registerSuccessMsg = res.msg ?? 'Registrazione effettuata con Successo!';
      this.registerForm.reset()
    })

  }

  onLogin(){
    if (this.loginForm.invalid) return;

    const {email, password } = this.loginForm.getRawValue();

    this.auth.login({
      email: email!,
      password: password!,
    }).subscribe();

  }
}
