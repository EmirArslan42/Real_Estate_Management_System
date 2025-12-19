import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html'
})
export class UserListComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  isLoading = false;

  editForm!: FormGroup;
  filteredForm!: FormGroup;
  addForm!: FormGroup;
  showAddForm = false;
  selectedUser: any = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUsers();

    this.filteredForm = this.fb.group({
    role: [''],
    email: ['']
    });

    this.editForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['',[Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/)]] // opsiyonel
    });

    this.addForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['User', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/)]],
  });

    this.filteredForm.valueChanges.subscribe(() => {
    this.applyFilter();
  });
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe(res => {
      this.users = res;
      this.filteredUsers = res;
      this.isLoading = false;
      this.filteredUsers = res;
    });
  }

  openAddForm() {
  this.showAddForm = true;
  this.addForm.reset({ role: 'User' });
}

submitAdd() {
  if (this.addForm.invalid) return;

  this.userService.addUser(this.addForm.value).subscribe(() => {
    this.loadUsers();
    this.showAddForm = false;
  });
}

  openEdit(user: any) {
    this.selectedUser = user;

    this.editForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
  }

  submitEdit() {
    if (!this.selectedUser || this.editForm.invalid) return;

    this.userService
      .updateUser(this.selectedUser.id, this.editForm.value)
      .subscribe(() => {
        this.loadUsers();
        this.selectedUser = null;
      });
  }

  toggleStatus(user: any) {
    this.userService.changeUserStatus(user.id).subscribe(() => {
      user.isActive = !user.isActive;
    });
  }

  deleteUser(user: any) {
    if (!confirm('Bu kullanıcı silinsin mi?')) return;

    this.userService.deleteUser(user.id).subscribe(() => {
      this.loadUsers();
    });
  }

  applyFilter() {
  const { role, email } = this.filteredForm.value;

  this.filteredUsers = this.users.filter(u => {
    const roleMatch = role ? u.role === role : true;
    const emailMatch = email
      ? u.email.toLowerCase().includes(email.toLowerCase())
      : true;

    return roleMatch && emailMatch;
  });
}


}
