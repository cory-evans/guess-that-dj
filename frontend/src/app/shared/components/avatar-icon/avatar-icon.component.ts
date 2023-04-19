import { Component, Input, OnInit } from '@angular/core';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-avatar-icon',
  templateUrl: './avatar-icon.component.html',
})
export class AvatarIconComponent implements OnInit {
  @Input() userId?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() rounded = true;

  url?: string;

  constructor(private avatarService: AvatarService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.avatarService
        .getAvatarForUser(this.userId)
        .subscribe((url) => (this.url = url));
    } else {
      const n = Math.floor(Math.random() * 9);
      this.url = `http://localhost:8090/_/images/avatars/avatar${n}.svg`;
    }
  }
}
