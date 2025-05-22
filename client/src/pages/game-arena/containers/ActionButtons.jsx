function ActionButtons({ onPass, onAttack }) {
  return (
    <div className="action-buttons">
      <button
        className="attack-button"
        onClick={onAttack}
      >
        Attack!
      </button>
      <button
        className="pass-button"
        onClick={onPass}
      >
        Pass
      </button>
    </div>
  );
}

export default ActionButtons;