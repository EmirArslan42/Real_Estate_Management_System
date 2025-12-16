import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/shared/admin.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  users:any[]=[];
  filteredUsers:any[]=[];
  filteredForm!:FormGroup;
  isLoading:boolean=false;

  constructor(private fb:FormBuilder,private adminService:AdminService) { }

  ngOnInit(): void {
    this.filteredForm=this.fb.group({
      role:[''],
      email:['']
    });
   this.loadUsers();

    this.filteredForm.valueChanges.subscribe(()=>{
      this.applyFilters();
    });

  }

  loadUsers(){
    this.isLoading=true;
    this.adminService.getUsers().subscribe({
      next:(res)=>{
        this.users=res;
        this.filteredUsers=res;
        this.isLoading=false;
      },
      error:(err)=>{
        console.error('Kullanıcılar yüklenirken hata oluştu:',err);
        this.isLoading=false;
      }
    });
  }

  applyFilters(){
    const roleFilter=this.filteredForm.get('role')?.value;
    const emailFilter=this.filteredForm.get('email')?.value;

    this.filteredUsers=this.users.filter(user=>{
      const matchesRole=roleFilter ? user.role===roleFilter : true;
      const matchesEmail=emailFilter ? user.email.toLowerCase().includes(emailFilter) : true;

      return matchesRole && matchesEmail;
    });
  }
}
