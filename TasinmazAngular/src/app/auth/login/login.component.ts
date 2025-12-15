import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  errorMessage: string = '';
  loginForm: FormGroup;

  constructor(fb: FormBuilder,private authService: AuthService,
    private router: Router,) {
    this.loginForm = fb.group({
      email: fb.control('', [Validators.required,Validators.email]), // formControl name
      password: fb.control('', [Validators.required]),
    });
  }

  ngOnInit() {  }

  login() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Lütfen tüm alanları doğru doldurun!';
      return;
    }
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        this.router.navigate(['/dashboard/tasinmaz/list']);
      },
      error: (err) => {
        this.errorMessage = 'E-posta veya şifre hatalı !';
      },
    });
  }
}
 