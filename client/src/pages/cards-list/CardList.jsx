import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import card1 from '../../assets/card1.png';
import card2 from '../../assets/card2.png';
import card3 from '../../assets/card3.png';
import card4 from '../../assets/card4.png';
import card5 from '../../assets/card5.png';
import card6 from '../../assets/card6.png';
import card7 from '../../assets/card7.png';
import card8 from '../../assets/card8.png';
import card9 from '../../assets/card9.png';

import Card from '../../components/Card/Card';
import './CardsList.css';

const cards = [
  { id: 1, name: 'Splash Bee', img: card1, mana: 3, lore: 'A buzzing defender of the hive.' },
  { id: 2, name: 'Galactic Goblin', img: card2, mana: 5, lore: 'A mischievous traveler of the stars.' },
  { id: 3, name: 'Chamiligon', img: card3, mana: 2, lore: 'A sneaky creature that blends in anywhere.' },
  { id: 4, name: 'Chamilifenix', img: card4, mana: 4 },
  { id: 5, name: 'Chamilisaur', img: card5, mana: 6 },
  { id: 6, name: 'Chamilisaur', img: card6, mana: 1 },
  { id: 7, name: 'Chamilisaur', img: card7, mana: 3 },
  { id: 8, name: 'Chamilisaur', img: card8, mana: 2 },
  { id: 9, name: 'Chamilisaur', img: card9, mana: 4 },
];

function CardsListPage() {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="cards-list">
        {cards.map((card) => (
          <Card key={card.id} card={card} isActionable={true} />
        ))}
      </div>
    </DndProvider>
  );
}

export default CardsListPage;