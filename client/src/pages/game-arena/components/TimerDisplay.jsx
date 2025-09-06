import { useEffect, useState } from 'react';

function TimerDisplay({ remainingTime }) {
  const [timer, setTimer] = useState(remainingTime);

  useEffect(() => {
    setTimer(remainingTime);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Clear the interval on component unmount
    return () => clearInterval(interval);
  }, [remainingTime]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
      }}
    >
      <span>{formattedTime}</span>
    </div>
  );
}

export default TimerDisplay;