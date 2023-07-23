import { Injectable } from '@angular/core';
import { Body, Collision, Composite, Detector, Engine, Events, Mouse, MouseConstraint, Pairs, Render, Runner } from 'matter-js';
import { WorldComponent } from '../world/world.component';

@Injectable({
  providedIn: 'root'
})
export class PhysicsService {
	private engine = Engine.create({
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
		Events.on(this.mouseConstraint, 'startdrag', event => {
			if ( event.body.label === 'gamePiece' && this._activePiece !== event.body ) {
				console.log("hey dont touch that")
			}
		});
		Events.on(this.mouseConstraint, "enddrag", event => {
			if ( this._activePiece === event.body ) {
				
				Events.on(this.engine, 'collisionStart', event =>  {
					let pairs = event.pairs;
					for ( let i = 0, j = pairs.length; i != j; ++i ) {
						let pair = pairs[i];
						if ( pair.bodyA.label === 'gamePiece' && pair.bodyB.label === 'gamePiece' ) {
							console.log("body A: ", pair.bodyA, "body B: ", pair.bodyB)
						}
						
						// if ( pair.bodyB.label === 'gamePiece' ) {
						// 	switch (pair.bodyA.label) {
						// 		case 'boundary':
						// 			pair.bodyB.frictionAir = 1;
						// 			break;
						// 		case 'peg': 
						// 			this.activatePeg(pair.bodyA);
						// 			break;
						// 	};
						// };
					};
				});
				// for ( const otherPiece of this.engine.world.bodies ) {
				// 	if ( otherPiece.label === 'gamePiece' ) {
				// 		if ( otherPiece !== this._activePiece ) {
				// 			// console.log(Detector.collisions())
				// 			// if ( Collision.collides(this._activePiece, otherPiece) !== null ) {

				// 			// 	console.log("hello")

				// 			// 	console.log(`${this._activePiece} collided with ${otherPiece}!`);
				// 			// };
				// 		}
				// 	}
				// }	
			}
		});
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
		  }, 
		  500
		);
	}
	private collisionDetect(): void {
		Events.on(this.engine, 'collisionStart', event =>  {
			let pairs = event.pairs;
			for ( let i = 0, j = pairs.length; i != j; ++i ) {
				let pair = pairs[i];
				if ( pair.bodyB.label === 'gamePiece' ) {
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
				if ( pair.bodyB.label === 'gamePiece' ) {
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
				if ( pair.bodyB.label === 'gamePiece' ) {
					switch ( pair.bodyA.label ) {
						case 'boundary': 
							pair.bodyB.frictionAir = 0.04;
							break;
					};
				};
			};
		});
	}
	public removeBody(body: Body): void {
		const index = this.engine.world.bodies.indexOf(body);
		if ( index !== -1 ) {
			Composite.remove(this.engine.world, body);
		}
	}
}
