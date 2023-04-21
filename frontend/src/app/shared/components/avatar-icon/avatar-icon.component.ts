import { Component, Input, OnInit } from '@angular/core';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-avatar-icon',
  templateUrl: './avatar-icon.component.html',
})
export class AvatarIconComponent implements OnInit {
  @Input() userId?: string;
  @Input() size: 'sm' | 'md' | 'lg' | 'auto' = 'md';
  @Input() rounded = true;

  url?: string;

  constructor(private avatarService: AvatarService) {}

  ngOnInit(): void {
    this.avatarService
      .getAvatarForUser(this.userId)
      .subscribe((url) => (this.url = url));
  }
}
