import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from './list/list.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { ViewComponent } from './view/view.component';
import { RoundVoteComponent } from './play/round-vote/round-vote.component';
import { RoundReviewComponent } from './play/round-review/round-review.component';
import { ScoreboardComponent } from './play/scoreboard/scoreboard.component';
import { PrepareComponent } from './play/prepare/prepare.component';

const GAMES_ROUTES: Routes = [
  { path: 'list', component: ListComponent },
  { path: ':id', component: ViewComponent },
];

@NgModule({
  declarations: [ListComponent, ViewComponent, RoundVoteComponent, RoundReviewComponent, ScoreboardComponent, PrepareComponent],
  imports: [CommonModule, SharedModule, RouterModule.forChild(GAMES_ROUTES)],
})
export class GamesModule {}
