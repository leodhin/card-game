class Card {
	constructor(id, name, img, lore, attack, defense) {
		this.id = id;
		this.name = name;
		this.img = img;
		this.lore = lore;
		this.userId = null;
		this.attack = Number(attack);;
		this.defense = Number(defense);
		this.cost = 0;
		this.powers = null;

	}

	calculateCardCost() {
		this.cost = Math.ceil((this.attack * 1.2 + this.defense) / 2);
	}
}

module.exports = Card;