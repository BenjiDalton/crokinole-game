import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


import { AppComponent } from './app.component';
import { PhysicsService } from './services/physics.service';
import { GameStateService } from './services/game-state.service';
import { PlayerComponent } from './player/player.component';
import { WorldComponent } from './world/world.component';

@NgModule({
	declarations: [
		AppComponent,
		PlayerComponent,
		WorldComponent
	],
	imports: [
		BrowserModule,
		CommonModule
	],
	providers: [PhysicsService, GameStateService],
	bootstrap: [AppComponent]
})
export class AppModule { }
