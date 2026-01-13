import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent{
  errorMessage: string = '';
  successMessage: string = '';
  registerForm!: FormGroup;
  isLoading:boolean=false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm=fb.group({
      name: fb.control('', [Validators.required]),
      email: fb.control('', [Validators.required, Validators.email]),
      password: fb.control('', [Validators.required,Validators.minLength(8),Validators.pattern('^(?=.*[a-z])(?=.*[A-Z]).{8,}$')]),
    })
  }

  showErrorAlert(errorMessage:string){
    this.errorMessage = errorMessage;
    setTimeout(() => {
      this.errorMessage = "";
    }, 2000);
  }
  showSuccessAlert(successMessage:string){
  this.successMessage = successMessage;
    setTimeout(() => {
      this.successMessage = "";
    }, 2000);
  }

  register() {
    if(this.registerForm.invalid){
      this.showErrorAlert("Lütfen tüm alanları doğru doldurun.");
      return;
    }
    this.isLoading=true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.showSuccessAlert("Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...");
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: () => {
        this.showErrorAlert("Kayıt sırasında bir hata oluştu.");
        this.isLoading=false;
      },
    });
  }
}
