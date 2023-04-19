import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialPreludeModule } from '../material-prelude/material-prelude.module';
import { AvatarIconComponent } from './components/avatar-icon/avatar-icon.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AvatarIconComponent, NavigationComponent],
  imports: [
    CommonModule,
    MaterialPreludeModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialPreludeModule,
    AvatarIconComponent,
    NavigationComponent,
  ],
})
export class SharedModule {}
