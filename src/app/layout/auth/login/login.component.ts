import { Component, signal } from '@angular/core';
import { email, form, FormField, required, minLength } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (schemaModel) => {
    required(schemaModel.email, { message: 'Email is required' });
    email(schemaModel.email);
    required(schemaModel.password, { message: 'Password is required' });
    minLength(schemaModel.password, 8, { message: 'Password must be at least 8 characters long' });
  });

  onSubmit(event: Event) {
    event.preventDefault();
    console.log('Form submitted:', this.loginModel());
    
  }
}
