import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';

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
        localStorage.setItem('isAdmin', res.user.role == 'Admin' ? 'true' : 'false');
        //console.log(res.user.role);
        //console.log(localStorage.getItem("isAdmin"));

        if(!this.authService.isAdmin()){
        this.router.navigate(['/dashboard/tasinmaz/list']);
        
      }else{
        this.router.navigate(['/dashboard/admin/summary']);
      }
      },
        error: (err) => {
        if (err.status === 401) {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Bir hata oluştu';
        }
     }

    });
  }
}
 