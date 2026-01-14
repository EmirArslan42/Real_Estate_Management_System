import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent{
  errorMessage: string = '';
  isLoading:boolean=false;
  loginForm: FormGroup;

  constructor(
    fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = fb.group({
      email: fb.control('', [Validators.required, Validators.email]), // formControl name
      password: fb.control('', [Validators.required]),
    });
  }

  showErrorAlert(errorMessage:string){
    this.errorMessage = errorMessage;
    setTimeout(() => {
      this.errorMessage = "";
    }, 2000);
  }

  login() {
    if (this.loginForm.invalid) {
      this.showErrorAlert("Lütfen tüm alanları doğru doldurun!");
      return;
    }
    this.isLoading=true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.authService.saveToken(res.token);
        localStorage.setItem(
          'isAdmin',
          res.user.role == 'Admin' ? 'true' : 'false'
        );
        this.router.navigate(['/dashboard/tasinmaz/list']);
      },
      error: (err) => {
        this.showErrorAlert("Giriş yapılırken bir hata oluştu!")
        this.isLoading=false;
      },
    });
  }
}
