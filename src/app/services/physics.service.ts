import { Injectable } from '@angular/core';
import { Bodies, Body, Composite, Constraint, Engine, Events, Mouse, MouseConstraint, Render, Runner, Vector, Common, Vertices, Collision, IBodyDefinition, Composites } from 'matter-js';
import { Observable, Subject, firstValueFrom, of } from 'rxjs';

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
	private mouse: Mouse;
	private width = 2040;
	private height = 1290;
	private normalPegState = '#F5CC7C';
	private activePegState = '#F3EC06';
	private boardCenterRadius = 21;
	private boardCenterColor = 'black';
	private boardCenterActiveColor = '#CE3D00'
	private _renderElement: HTMLCanvasElement;
	private mouseConstraint: any;

	private _scratchSubject = new Subject<string>();
	public scratchSubject = this._scratchSubject.asObservable();


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

  	constructor() { }

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
	public addBody(body: Body): void {
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
			for (let i = 0, j = pairs.length; i != j; ++i) {
				let pair = pairs[i];
				if (pair.bodyB.label === 'gamePiece') {
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
		Events.on(this.engine, 'collisionActive', (event) => {
			let pairs = event.pairs;
			for (let i = 0, j = pairs.length; i != j; ++i) {
				let pair = pairs[i];
				if (pair.bodyB.label === 'gamePiece') {
					switch (pair.bodyA.label) {
						case 'boardCenter':
							if (pair.bodyB.speed < 0.2 && Math.abs(pair.bodyB.position.x - pair.bodyA.position.x) < 1) {
								this.activateCenter(pair.bodyA);
							}
							break;
						case 'innerCircle':
							if (pair.bodyB.speed < 0.2) {
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
			for (let i = 0, j = pairs.length; i != j; ++i) {
				const pair = pairs[i];
				if (pair.bodyB.label === 'gamePiece') {
					switch (pair.bodyA.label) {
						case 'boundary': 
							pair.bodyB.frictionAir = 0.04;
							break;
					};
				};
			};
		});
	}
	public sendScratch(): void {
		this._scratchSubject.next('ooooof ya scratched');
	}
}
