import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  // imports: [AppRoutingModule],
})
export class RegisterComponent implements OnInit {
  errorMessage: string = '';
  successMessage: string = '';
  registerForm!: FormGroup;

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

  register() {
    if(this.registerForm.invalid){
      this.errorMessage='Lütfen tüm alanları doğru doldurun.';
      return;
    }
    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.successMessage = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage ='Kayıt sırasında bir hata oluştu.';
      },
    });
  }

  ngOnInit(): void {}

}
