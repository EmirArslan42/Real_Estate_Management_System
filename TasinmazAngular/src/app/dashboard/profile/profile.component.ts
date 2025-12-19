import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any; 
  constructor(private authService:AuthService) { }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe(user=>{
      this.user=user;
    });
  }

}
