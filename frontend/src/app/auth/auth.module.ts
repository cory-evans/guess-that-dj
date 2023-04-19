import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SigninComponent } from './signin/signin.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { CallbackComponent } from './callback/callback.component';
import { SignoutComponent } from './signout/signout.component';

const AUTH_ROUTES: Routes = [
  { path: 'signin', component: SigninComponent },
  { path: 'signout', component: SignoutComponent },
  { path: 'callback', component: CallbackComponent },
];

@NgModule({
  declarations: [SigninComponent, CallbackComponent, SignoutComponent],
  imports: [CommonModule, RouterModule.forChild(AUTH_ROUTES), SharedModule],
})
export class AuthModule {}
