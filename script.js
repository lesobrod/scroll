class Word {
	constructor(numLetters) {
		this.letters = Array.from(
			{ length: numLetters }, 
			(_,k) => new Letter(k, this)
		);
		
	}
}

class Letter {
	constructor(index) {
		this.strokes = this.createStrokes();
		this.index   = index;
	}
	
	createStrokes() {
		let arr = [...Array(12).keys()].sort(
		() => (Math.random() > .5) ? 1 : -1);
		let res = [];
		while (arr.length > 3) {
			res.push(arr.splice(0, Scroll.rndInt(2,3)));
		}
		res.push(arr);
		return res;
	}
}

class Scroll {
	constructor() {
		this.screenRate   = 12;
		this.widthCoeff   = 0.0002;
		this.GR           = 1.61803;
		// Искривление квадрик
		this.flection     = 0.19;
		this.cnv          = document.querySelector('canvas');
		this.ctx          = this.cnv.getContext('2d');
		
		this.isAnimate    = true;
		
		window.onclick = () => {
			if (this.cnv.style.animationPlayState == "paused") {
				this.cnv.style.animationPlayState = "running";
				} else {
				this.cnv.style.animationPlayState = "paused";
			}
		};
		
		window.onresize = () => {
      this.cnv.style.animationPlayState = "running";
			this.drawAnimation();
		};
		
		screen.orientation.onchange = () => {
      this.cnv.style.animationPlayState = "running";
			this.drawAnimation();
		};
		
		this.drawAnimation();
	}
	
	static rndReal = (mn, mx) => 
	Math.random() * (mx - mn) + mn;
	
	static rndInt  = (mn, mx) => 
	Math.floor(Math.random() * (mx - mn + 1) + mn);
	
	static myRed() {
		const hue  = Math.random() > 0.5 ? Scroll.rndInt(345, 359) : 
		Scroll.rndInt(0, 10);
		
		const sat  =  Scroll.rndInt(50, 80);
		const lght =  Scroll.rndInt(30, 50);
		return `hsl(${hue}, ${sat}%, ${lght}%)`;
	}
	
	fadeIn = () => {
		return new Promise(resolve => {
			this.cnv.classList.add('fadeIn');
			this.cnv.onanimationend = () => {
				this.cnv.classList.remove('fadeIn');
				resolve('Done fadeIn');
			}});
	}
	
	fadeOut = () => {
		return new Promise(resolve => {
			this.cnv.classList.add('fadeOut');
			this.cnv.onanimationend = () => {
				this.cnv.classList.remove('fadeOut');
				resolve('Done fadeOut');
			}});
	}
	
	setCanvasSize() {
		this.w = this.cnv.width  = window.innerWidth;
		this.h = this.cnv.height = window.innerHeight;
	}
	
	
	setScreenRate(){
		switch (screen.orientation.type) {
			case "landscape-primary":
			case "landscape-secondary":
			this.screenRate = 0.111;
			this.widthCoeff = 0.05;
			break;
			
			case "portrait-primary":
			case "portrait-secondary":
			this.screenRate = 0.1;
			this.widthCoeff = 0.05;
			break;
			default:
			alert("Screen not supported");
		}
	}
	
	drawWord(word) {
		
		this.ctx.strokeStyle = this.ctx.fillStyle = Scroll.myRed();
		// Толщина зависит от ориентации и ширины экрана
		this.ctx.lineWidth   = this.widthCoeff * this.w ** 0.2	;
		this.ctx.lineCap     = "round";
		this.ctx.lineJoin    = "round";
		// Ширина буквы зависит от  ориентации и ширины экрана
		const letterWidth    = this.w * this.screenRate;
		// Пробел межжду буквами в долях от ширины буквы
		const letterSpace    = 0.8 * letterWidth ** 0.3;
		const startWordX     = (this.w - 1.2 * letterWidth * word.letters.length) / 2;
		const letterHeight   = this.GR * letterWidth;
		const startWordY     = (this.h - letterHeight) / 2;
		console.log(letterWidth, letterSpace );
		
		const drawQuadric = (xb, yb, xe, ye) => {
			const p1 = Scroll.rndReal(0, this.flection); 
			const p2 = Scroll.rndReal(-this.flection, this.flection);
			const p3 = Scroll.rndReal(0, this.flection);
			const p4 = Scroll.rndReal(-this.flection, this.flection);
			const vx = xe - xb;
			const vy = ye - yb;
			const wx = -vy;
			const wy = vx;	
			const xc1 = xb + p1 * vx + p2 * wx;
			const yc1 = yb + p1 * vy + p2 * wy;
			const xc2 = xe - p3 * vx + p4 * wx;
			const yc2 = ye - p3 * vy + p4 * wy;
			this.ctx.bezierCurveTo(xc1, yc1, xc2, yc2, xe, ye);
		}
		
		const drawLetter = (letter) => {
			const toPos = (pointIndex) => {
				const rndX = Scroll.rndReal(-0.01, 0.01);
				const rndY = Scroll.rndReal(-0.01, 0.01);
				let x = (pointIndex % 3);
				let y = parseInt(pointIndex / 3) ;
				return [x + rndX, y + rndY];
			}
			
			this.ctx.translate(letter.index > 0 ? letterSpace : 0, 0);	
			
			for (let elem of letter.strokes) {
				this.ctx.beginPath();
				this.ctx.moveTo(...toPos(elem[0]));
				if (elem.length == 1) {
					drawQuadric(...toPos(elem[0]), ...toPos(elem[0]));
					this.ctx.stroke();
					continue;
				}
				
				drawQuadric(...toPos(elem[0]), ...toPos(elem[1]));
				if (elem.length > 2) {
					drawQuadric(...toPos(elem[1]), ...toPos(elem[2]));
				}
				this.ctx.stroke();
			}
		}
		
		return new Promise(resolve => 
			{
				this.ctx.resetTransform();
				this.ctx.clearRect(0, 0, this.w, this.h); 
			//	this.ctx.scale( 1/ this.DPR, 1/this.DPR);
				this.ctx.transform(
					letterWidth / 2, 
					0.0,
					0.0, 
					letterHeight / 3, 
					startWordX,
					startWordY
				);
				
				word.letters.forEach(letter => drawLetter(letter));
				resolve('Done draw word');
			}	);
	}
	
	async drawAnimation() {
		
		await this.setScreenRate();
		await this.setCanvasSize();	
		this.cnv.className = await "";
		
		while (this.isAnimate) {
			let word = await new Word(Scroll.rndInt(1, 5));
			await this.drawWord(word);
			await this.fadeIn();
			await this.fadeOut();
		}
	}
}


window.onload = () => {
	scroll = new Scroll();
}
