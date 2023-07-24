import { Injectable } from '@angular/core';
import { Body, Collision, Composite, Detector, Engine, Events, Mouse, MouseConstraint, Pairs, Render, Runner } from 'matter-js';
import { WorldComponent } from '../world/world.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
	public engine = Engine.create({
		velocityIterations: 16,
		positionIterations: 24
	});
    private renderer: Render;
    private runner = Runner.create({
		delta: 144
	});
	private _renderElement: HTMLCanvasElement;
	private mouse: Mouse;
	private mouseConstraint: any;
	
	private width = 2040;
	private height = 1290;
	private normalPegState = '#F5CC7C';
	private activePegState = '#F3EC06';
	private boardCenterRadius = 21;
	private boardCenterColor = 'black';
	private boardCenterActiveColor = '#CE3D00'
	private _activePiece: any;
	private _playerTurnOver = new Subject<any>();
	public playerTurnOver = this._playerTurnOver.asObservable();


	public set renderElement(element: HTMLCanvasElement) {
		this._renderElement = element;
		this.renderer = Render.create({
			engine: this.engine,
			canvas: element,
			options: {
				height: this.height,
				width: this.width,
				wireframes: false,
				// showPerformance: true
			}
		});
		this.mouse = Mouse.create(element);
		this.setupMouseConstraint();
		this.renderer.mouse = this.mouse;
		this.setupEngine();
		this.collisionDetect();
	}
	public get renderElement(): HTMLCanvasElement {
		return this._renderElement;
	}
	public set activePiece(piece: any) {
		this._activePiece = piece;
		this.addBody(this._activePiece);
		this.handlePlayersTurn();
	}

  	constructor() { 
	}

	private setupEngine(): void {
		this.engine.gravity.y = 0;
		Render.run(this.renderer);
		Runner.run(this.runner, this.engine);
	}
	private setupMouseConstraint(): void {
		this.mouseConstraint = MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
		
		Composite.add(this.engine.world, this.mouseConstraint);
	}
	public addBody(body: Body | Body[]): void {
		Composite.add(this.engine.world, body);
	}
	public addComposite(composite: Composite): void {
		Composite.add(this.engine.world, composite);
	}
	private activatePeg(peg: Body): void {
		peg.render.fillStyle = this.activePegState;
		peg.circleRadius = 12;
		setTimeout(() => {
			peg.render.fillStyle = this.normalPegState;
			peg.circleRadius = 8;
		  }, 
		  100
		);
	}
	private activateCenter(center: Body): void {
		center.render.fillStyle = this.boardCenterActiveColor;
		center.circleRadius = 25;
		setTimeout(() => {
			center.render.fillStyle = this.boardCenterColor;
			center.circleRadius = this.boardCenterRadius;
		}, 500);
	}
	private collisionDetect(): void {
		Events.on(this.engine, 'collisionStart', event =>  {
			let pairs = event.pairs;
			for ( let i = 0, j = pairs.length; i != j; ++i ) {
				let pair = pairs[i];
				if ( pair.bodyB.label.includes('gamePiece') ) {
					switch (pair.bodyA.label) {
						case 'boundary':
							pair.bodyB.frictionAir = 1;
							break;
						case 'peg': 
							this.activatePeg(pair.bodyA);
							break;
					};
				};
			};
		});
		Events.on(this.engine, 'collisionActive', event => {
			let pairs = event.pairs;
			for ( let i = 0, j = pairs.length; i != j; ++i ) {
				let pair = pairs[i];
				if ( pair.bodyB.label.includes('gamePiece') ) {
					switch ( pair.bodyA.label ) {
						case 'boardCenter':
							if ( pair.bodyB.speed < 0.2 && Math.abs(pair.bodyB.position.x - pair.bodyA.position.x) < 1 && Math.abs(pair.bodyB.position.y - pair.bodyA.position.y) < 1 ) {
								this.activateCenter(pair.bodyA);
							}
							break;
						case 'innerCircle':
							if ( pair.bodyB.speed < 0.2 ) {
								console.log('add 15')
							}
							break;	
						case 'middleCircle':
							break;
						case 'outerCircle':
							break;	
					};
				};
			};
		});
		Events.on(this.engine, 'collisionEnd', event =>  {
			let pairs = event.pairs;
			for ( let i = 0, j = pairs.length; i != j; ++i ) {
				const pair = pairs[i];
				if ( pair.bodyB.label.includes('gamePiece') ) {
					switch ( pair.bodyA.label ) {
						case 'boundary': 
							pair.bodyB.frictionAir = 0.04;
							break;
					};
				};
			};
		});
		
	}
	private handlePlayersTurn(): void {
		let collisionInfo: null | { body: any; timestamp: number; } = null;
		Events.on(this.mouseConstraint, "enddrag", event => {
			if ( this._activePiece === event.body ) {
				collisionInfo = {
					body: event.body,
					timestamp: performance.now() 
				};
				// setTimeout(() => {
				// 		this.determineScore();
				// 	}, 5000);

				this._playerTurnOver.next(true);
			}
		});
		Events.on(this.engine, 'collisionStart', event => {
			let pairs = event.pairs;
			for ( let i = 0, j = pairs.length; i < j; ++i ) {
			  let pair = pairs[i];
			//   this.collisionDetector.bodies.push()
				if ( pair.bodyA.label.includes('gamePiece') && pair.bodyB.label.includes('gamePiece') ) {
					if (collisionInfo && collisionInfo.body === pair.bodyB) {
						if (pair.bodyA.label === pair.bodyB.label) {
							console.log("Invalid move. You must hit the other player's pieces first");
							setTimeout(() => {
								this.removeBody(pair.bodyB);  
								
							}, 5000);
						}
						collisionInfo = null;
						return;
					}
				return;
				} 
				// else {
				// 	console.log("Invalid move. You must hit the other player's pieces first");
				// 	setTimeout(() => {
				// 		this.removeBody(pair.bodyB);  
						
				// 	}, 5000);
				// }
			}
		});
		
	}
	public removeBody(body: Body): void {
		const index = this.engine.world.bodies.indexOf(body);
		if ( index !== -1 ) {
			Composite.remove(this.engine.world, body);
		}
	}
	public determineScore(): void {
		// const scores: { [key: string]: number} = {
		// 	'p1': 0,
		// 	'p2': 0
		// }
		// const scoredPieces: Map<string, Set<string>> = new Map();
		// Events.on(this.engine, 'collisionActive', event => {
		// 	let pairs = event.pairs;
			
		// 	for ( let [playerID, score] of Object.entries(scores) ) {
		// 		if (!scoredPieces.has(playerID)) {
		// 			scoredPieces.set(playerID, new Set());
		// 		}
		// 		for ( let i = 0, j = pairs.length; i != j; ++i ) {
		// 			let pair = pairs[i];
		// 			if ( pair.bodyB.label.includes(playerID) && pair.bodyB.label.includes('gamePiece') ) {
		// 				if ( !scoredPieces.get(playerID)?.has(pair.bodyA.id.toString()) ) {
		// 					switch ( pair.bodyA.label ) {
		// 						case 'pieceContainer':
		// 							break;
		// 						case 'boardCenter':
		// 							if ( pair.bodyB.speed < 0.2 && Math.abs(pair.bodyB.position.x - pair.bodyA.position.x) < 1 && Math.abs(pair.bodyB.position.y - pair.bodyA.position.y) < 1 ) {
		// 								this.activateCenter(pair.bodyA);
		// 							}
		// 							break;
		// 						case 'innerCircle':
		// 							if ( pair.bodyB.speed < 0.2 ) {
		// 								score += 15;
		// 							}
		// 							break;	
		// 						case 'middleCircle':
		// 							if ( pair.bodyB.speed < 0.2 ) {
		// 								score += 10;
		// 							}
		// 							break;
		// 						case 'outerCircle':
		// 							if ( pair.bodyB.speed < 0.2 ) {
		// 								score += 5;
		// 							}
		// 							break;	
		// 					};
		// 					scoredPieces.get(playerID)?.add(pair.bodyA.id.toString());
		// 					scores[playerID] = score;
		// 					console.log(scores)
		// 				}
		// 			}
		// 		}
		// 	}
		// });
		
	}
}
