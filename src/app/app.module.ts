import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';


import { AppComponent } from './app.component';
import { PhysicsService } from './services/physics.service';
import { GameStateService } from './services/game-state.service';
import { PlayerComponent } from './components/player/player.component';
import { WorldComponent } from './components/world/world.component';
import { NameEntryComponent } from './components/name-entry/name-entry.component';

@NgModule({
	declarations: [
		AppComponent,
		PlayerComponent,
		WorldComponent,
 		NameEntryComponent
	],
	imports: [
		BrowserModule,
		CommonModule
	],
	providers: [PhysicsService, GameStateService],
	bootstrap: [AppComponent]
})
export class AppModule { }
