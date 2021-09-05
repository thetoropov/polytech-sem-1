function getElement(id) {
	return document.getElementById(id);
}

function getCoordinates(el) {
	const coords = el.getBoundingClientRect();
	return {
		left: coords.left + window.pageXOffset,
		right: coords.right + window.pageXOffset,
		top: coords.top + window.pageYOffset,
		bottom: coords.bottom + window.pageYOffset
	};
}

function getRandom(n){
    return Math.floor(Math.random() * (n + 1));
}

let startGame = false;
let isHandlerController = false;
let compShot = false;

const humanField = getElement('field_human');
const computerField = getElement('field_computer');

const instruction = getElement('instruction');
const userName = getElement('userName')

const scoreText = getElement('score_text');
let humanScore = 0;
let compScore = 0;

const toptext = getElement('text_top');
const buttonPlay = getElement('play');


class Field {
	static SHIP_SIDE = 33;
	static SHIP_DATA = {
		fourdeck: [1, 4],
		tripledeck: [2, 3],
		doubledeck: [3, 2],
		singledeck: [4, 1]
	};

	constructor(field) {
		this.field = field;
		this.squadron = {};
		this.matrix = [];
		let {left, right, top, bottom} = getCoordinates(this.field);
		this.fieldLeft = left;
		this.fieldTop = top;
	}

	static createMatrix() {
		return [...Array(10)].map(() => Array(10).fill(0));
	}

	cleanField() {
		while (this.field.firstChild) {
			this.field.removeChild(this.field.firstChild);
		}
		this.squadron = {};
		this.matrix = Field.createMatrix();
	}

	checkLocationShip(obj, decks) {
		let {x, y, kx, ky, fromX, toX, fromY, toY} = obj;

		fromX = (x === 0) ? x : x - 1;

		if (x + kx * decks === 10 && kx === 1) toX = x + kx * decks;
		else if (x + kx * decks < 10 && kx === 1) toX = x + kx * decks + 1;
		else if (x === 9 && kx === 0) toX = x + 1;
		else if (x < 9 && kx === 0) toX = x + 2;

		fromY = (y === 0) ? y : y - 1;
		if (y + ky * decks === 10 && ky === 1) toY = y + ky * decks;
		else if (y + ky * decks < 10 && ky === 1) toY = y + ky * decks + 1;
		else if (y === 9 && ky === 0) toY = y + 1;
		else if (y < 9 && ky === 0) toY = y + 2;

		if (toX === undefined || toY === undefined) return false;

		return this.matrix.slice(fromX, toX)
			.filter(arr => arr.slice(fromY, toY).includes(1))
			.length <= 0;
	}

	getCoordsDecks(decks) {
		let kx = getRandom(1), ky = (kx === 0) ? 1 : 0, x, y;

		if (kx === 0) {
			x = getRandom(9);
			y = getRandom(10 - decks);
		} else {
			x = getRandom(10 - decks);
			y = getRandom(9);
		}

		const obj = {x, y, kx, ky}

		const result = this.checkLocationShip(obj, decks);
		if (!result) return this.getCoordsDecks(decks);
		return obj;
	}

	randomLocationShips() {
		for (let type in Field.SHIP_DATA) {
			let count = Field.SHIP_DATA[type][0];
			let decks = Field.SHIP_DATA[type][1];
			for (let i = 0; i < count; i++) {
				let options = this.getCoordsDecks(decks);
				options.decks = decks;
				options.shipname = type + String(i + 1);
				const ship = new Ships(this, options);
				ship.createShip();
			}
		}
	}
}

class Ships {
	constructor(self, {x, y, kx, ky, decks, shipname}) {
		this.player = (self === human) ? human : computer;
		this.field = self.field;
		this.shipname = shipname;
		this.decks = decks;
		this.x = x;
		this.y = y;
		this.kx = kx;
		this.ky = ky;
		this.hits = 0;
		this.arrDecks = [];
	}

	static showShip(self, shipname, x, y, kx) {
		const div = document.createElement('div');
		const classname = shipname.slice(0, -1);
		const dir = (kx === 1) ? ' vertical' : '';
		div.setAttribute('id', shipname);
		div.className = `ship ${classname}${dir}`;
		div.style.cssText = `left:${y * Field.SHIP_SIDE}px; top:${x * Field.SHIP_SIDE}px;`;
		self.field.appendChild(div);
	}

	createShip() {
		let {player, field, shipname, decks, x, y, kx, ky, hits, arrDecks, k = 0} = this;

		while (k < decks) {
			let i = x + k * kx, j = y + k * ky;
			player.matrix[i][j] = 1;
			arrDecks.push([i, j]);
			k++;
		}

		player.squadron[shipname] = {arrDecks, hits, x, y, kx, ky};
		if (player === human) {
			Ships.showShip(human, shipname, x, y, kx);
		}
	}
}

const human = new Field(humanField);
let computer = {};

let control = null;

class Controller {
	static SERVICE_TEXT = getElement('service_text');

	constructor() {
		this.player = '';
		this.opponent = '';
		this.text = '';
		this.coordsRandomHit = [];
		this.resetTempShip();
	}

	resetTempShip() {
		this.tempShip = {
			hits: 0,
			firstHit: [],
			kx: 0,
			ky: 0
		};
	}

	static showServiceText(text) {
		Controller.SERVICE_TEXT.innerHTML = text;
	}

	static getCoordsIcon(el) {
		const x = el.style.top.slice(0, -2) / Field.SHIP_SIDE;
		const y = el.style.left.slice(0, -2) / Field.SHIP_SIDE;
		return [x, y];
	}

	transformCoordsInMatrix(e, self) {
		const x = Math.trunc((e.pageY - self.fieldTop) / Field.SHIP_SIDE);
		const y = Math.trunc((e.pageX - self.fieldLeft) / Field.SHIP_SIDE);
		return [x, y];
	}

	init() {
		const random = getRandom(1);
		this.player = (random === 0) ? human : computer;
		this.opponent = (this.player === human) ? computer : human;

		for (let i = 0; i < 10; i++) {
			for(let j = 0; j < 10; j++) {
				this.coordsRandomHit.push([i, j]);
			}
		}
		this.coordsRandomHit.sort(() => Math.random() - 0.5);

		if (!isHandlerController) {
			computerField.addEventListener('click', this.makeShot.bind(this));
			computerField.addEventListener('contextmenu', this.setUselessCell.bind(this));
			isHandlerController = true;
		}

		if (this.player === human) {
			compShot = false;
			this.text = 'Ваша очередь стрелять';
		} else {
			compShot = true;
			this.text = 'Ожидание хода компьютера';
			setTimeout(() => this.makeShot(), 2000);
		}
		Controller.showServiceText(this.text);
	}

	checkUselessCell(coords) {
		if (computer.matrix[coords[0]][coords[1]] > 1) return false;

		const icons = this.opponent.field.querySelectorAll('.shaded-cell');
		if (icons.length === 0) return true;

		for (let icon of icons) {
			const [x, y] = Controller.getCoordsIcon(icon);
			if (coords[0] === x && coords[1] === y) {
				icon.remove();
				return false;
			}
		}
		return true;
	}

	showIcons(opponent, [x, y], iconClass) {
		const field = opponent.field;
		if (iconClass === 'dot' || iconClass === 'red-cross') {
			setTimeout(() => fn(), 400);
		} else {
			fn();
		}
		function fn() {
			const span = document.createElement('span');
			span.className = `icon-field ${iconClass}`;
			span.style.cssText = `left:${y * Field.SHIP_SIDE}px; top:${x * Field.SHIP_SIDE}px;`;
			field.appendChild(span);
		}
	}

	setUselessCell(e) {
		e.preventDefault();
		if (e.which !== 3 || compShot) return;

		const coords = this.transformCoordsInMatrix(e, computer);
		const check = this.checkUselessCell(coords);

		if (check) {
			this.showIcons(this.opponent, coords, 'shaded-cell');
		}
	}

	static removeElementArray(arr, [x, y]) {
		return arr.filter(item => item[0] !== x || item[1] !== y);
	}

	removeCoordsFromArrays(coords) {
		this.coordsRandomHit = Controller.removeElementArray(this.coordsRandomHit, coords);
	}

	getCoordsForShot() {
		const coords = this.coordsRandomHit.pop();
		this.removeCoordsFromArrays(coords);
		return coords;
	}

	showExplosion(x, y) {
		this.showIcons(this.opponent, [x, y], 'explosion');
		const explosion = this.opponent.field.querySelector('.explosion');
		explosion.classList.add('active');
		setTimeout(() => explosion.remove(), 430);
	}

	makeShot(e) {
		let x, y;
		if (e !== undefined) {
			if (e.which !== 1 || compShot) return;
			[x, y] = this.transformCoordsInMatrix(e, this.opponent);
			const check = this.checkUselessCell([x, y]);
			if (!check) return;
		} else {
			[x, y] = this.getCoordsForShot();
		}

		this.showExplosion(x, y);

		const v	= this.opponent.matrix[x][y];
		switch(v) {
			case 0:
				this.miss(x, y);
				break;
			case 1:
				this.hit(x, y);
				break;
			case 3:
			case 4:
				Controller.showServiceText('Вы уже выполняли выстрел по этим координатам!');
				break;
		}
	}

	miss(x, y) {
		let text = '';
		this.showIcons(this.opponent, [x, y], 'dot');
		this.opponent.matrix[x][y] = 3;

		if (this.player === human) {
			text = 'Промах. Ожидание хода компьютера.';
			this.player = computer;
			this.opponent = human;
			compShot = true;
			setTimeout(() => this.makeShot(), 1000);
		} else {
			text = 'Компьютер промахнулся. Ваша очередь.';
			this.player = human;
			this.opponent = computer;
			compShot = false;
		}
		setTimeout(() => Controller.showServiceText(text), 400);
	}

	hit(x, y) {
		let text = '';
		this.showIcons(this.opponent, [x, y], 'red-cross');
		this.opponent.matrix[x][y] = 4;
		if (this.player === human){
			text = 'Попадание! Ваша очередь.';
			humanScore += 1;
			scoreText.innerText = humanScore + ' - ' + compScore;
		}
		else{
			text = 'Компьютер попал! Ожидание выстрела компьютера.';
			compScore += 1;
			scoreText.innerText = humanScore + ' - ' + compScore;
		}
		setTimeout(() => Controller.showServiceText(text), 400);

		for (let name in this.opponent.squadron) {
			const dataShip = this.opponent.squadron[name];
			for (let value of dataShip.arrDecks) {
				if (value[0] !== x || value[1] !== y) continue;
				dataShip.hits++;
				if (dataShip.hits < dataShip.arrDecks.length) break;
				if (this.opponent === human) {
					this.tempShip.x0 = dataShip.x;
					this.tempShip.y0 = dataShip.y;
				}
				delete this.opponent.squadron[name];
				break;
			}
		}

		if (Object.keys(this.opponent.squadron).length === 0) {
			if (this.opponent === human) {
				text = 'Поражение!';
				toptext.innerHTML = 'Подведение итогов боя';
				for (let name in computer.squadron) {
					const dataShip = computer.squadron[name];
					Ships.showShip(computer, name, dataShip.x, dataShip.y, dataShip.kx );
				}
			} else {
				text = 'Ура! Победа!';
				toptext.innerHTML = 'Подведение итогов боя';
				humanField.parentElement.hidden = true;
				computerField.parentElement.hidden = true;
				instruction.hidden = false;
				instruction.innerHTML = '<p>' + userName.value + ' ваш счет '+ humanScore +'.</p>';
			}
			Controller.showServiceText(text);
			// buttonNewGame.hidden = false;
		} else if (this.opponent === human) {
			this.tempShip.hits++;
			setTimeout(() => this.makeShot(), 1000);
		}
	}
}


buttonPlay.addEventListener('click', function(e) {
	buttonPlay.hidden = true;
	instruction.hidden = true;

	human.cleanField();
	human.randomLocationShips();

	humanField.parentElement.hidden = false;
	computerField.parentElement.hidden = false;
	toptext.innerHTML = 'Начался морской бой';
	scoreText.innerText = humanScore + ' - ' + compScore;

	computer = new Field(computerField);

	computer.cleanField();
	computer.randomLocationShips();

	startGame = true;

	if (!control) control = new Controller();

	control.init();
});