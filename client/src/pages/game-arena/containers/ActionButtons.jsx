import React from "react";

function ActionButtons({ emitEvent, socket }) {
  return (
    <div className="action-buttons">
      <button
        className="attack-button"
        onClick={() => {
          if (socket) {
            console.info("Emitting attack event");
            emitEvent("attack");
          }
        }}
      >
        Attack!
      </button>
      <button
        className="pass-button"
        onClick={() => {
          if (socket) {
            console.info("Emitting pass event");
            emitEvent("pass");
          }
        }}
      >
        Pass
      </button>
    </div>
  );
}

export default ActionButtons;