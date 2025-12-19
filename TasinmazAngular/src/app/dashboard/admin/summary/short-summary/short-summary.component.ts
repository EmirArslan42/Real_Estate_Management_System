import { Component } from '@angular/core';
import { AdminService } from 'src/app/dashboard/admin/admin.service';

@Component({
  selector: 'app-short-summary',
  templateUrl: './short-summary.component.html',
  styleUrls: ['./short-summary.component.css']
})
export class ShortSummaryComponent {
 constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadAdminData();
  }

  totalUsers = 0;
  totalTasinmaz = 0;
  todayLogCount = 0;

  loadAdminData() {
    this.adminService.getUsers().subscribe(users => {
      this.totalUsers = users.length;
    });

    this.adminService.getTasinmazlar().subscribe(tasinmazlar => {
      this.totalTasinmaz = tasinmazlar.length;
    });

    this.adminService.getLogs().subscribe(logs => {
      const today = new Date().toDateString();
      this.todayLogCount = logs.filter(log => new Date(log.timestamp).toDateString() === today).length;
    });

  }
}
