import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/dashboard/admin/admin.service';

@Component({
  selector: 'app-log-list',
  templateUrl: './log-list.component.html',
  styleUrls: ['./log-list.component.css'],
})
export class LogListComponent implements OnInit {

  logs: any[] = [];
  filteredLogs: any[] = [];
  filterForm!: FormGroup;
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      operationType: ['']
    });

    this.loadLogs();

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilter();
    });
  }

  loadLogs() {
    this.adminService.getLogs().subscribe({
      next: (data) => {
        this.logs = data;
        this.filteredLogs = data;
        this.isLoading = false;
      },
      error: () => {
        alert("Loglar yüklenemedi")
        this.isLoading = false;
      },
    });
  }

  applyFilter() {
    const { operationType } = this.filterForm.value;

    if (!operationType) {
      this.filteredLogs = this.logs;
      return;
    }

    this.filteredLogs = this.logs.filter(
      log => log.operationType === operationType
    );
  }
}