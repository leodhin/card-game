class Card {
	constructor(id, name, img, cost, lore, attack, defense) {
		this.id = id;
		this.name = name;
		this.img = img;
		this.cost = cost;
		this.lore = lore;
		this.userId = null;
		this.attack = attack;
		this.defense = defense;
		this.attributes = null;
	}
}

module.exports = Card;