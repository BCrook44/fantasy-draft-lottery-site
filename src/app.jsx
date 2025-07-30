
import React, { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [countdown, setCountdown] = useState({});
  const [lotteryStarted, setLotteryStarted] = useState(false);
  const [lotteryResults, setLotteryResults] = useState([]);
  const [smackTalkLines, setSmackTalkLines] = useState([]);
  const [smackTalk, setSmackTalk] = useState("Scanning roster... deploying insult in 3... 2... 1");

  const targetDate = new Date("2025-08-19T01:00:00Z");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setLotteryStarted(true);
        clearInterval(interval);
        startLottery();
      } else {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("/smack_talk_dynasty_unique.json")
      .then((res) => res.json())
      .then((data) => {
        const allLines = Object.values(data).flat();
        setSmackTalkLines(allLines);
      });
  }, []);

  useEffect(() => {
    if (!smackTalkLines.length) return;
    const interval = setInterval(() => {
      const randomLine =
        smackTalkLines[Math.floor(Math.random() * smackTalkLines.length)];
      setSmackTalk(randomLine);
    }, 9000);
    return () => clearInterval(interval);
  }, [smackTalkLines]);

  const startLottery = async () => {
    const saved = localStorage.getItem("lotteryResults");
    if (saved) {
      setLotteryResults(JSON.parse(saved));
      return;
    }

    const res = await fetch("/lottery_teams.json");
    const teams = await res.json();
    const expanded = [];
    teams.forEach((t) =>
      expanded.push(...Array(Math.round(t.odds * 100)).fill(t.name))
    );
    const picked = [];
    while (picked.length < 6) {
      const rand = expanded[Math.floor(Math.random() * expanded.length)];
      if (!picked.includes(rand)) picked.push(rand);
    }

    localStorage.setItem("lotteryResults", JSON.stringify(picked));
    setLotteryResults(picked);
  };

  return (
    <div className="min-h-screen bg-black text-white font-arcade flex items-center justify-center text-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-5xl md:text-6xl pixel-header px-6 py-3 border-4 border-white inline-block tracking-widest">
          F*ck You Rob Manfred Lottery Reveal
        </h1>

        {!lotteryStarted ? (
          <div className="arcade-panel p-6 border-4 border-green-400 bg-black text-center space-y-6">
            <div className="text-2xl text-lime-300 bg-gray-900 border border-lime-400 py-4 countdown-box">
              {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
            </div>
            <div className="text-red-400 bg-gray-900 p-2 scoreboard-box border-2 border-red-400 uppercase">
              {smackTalk}
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {lotteryResults.map((team, idx) => (
              <div
                key={idx}
                className="text-xl bg-red-800 text-yellow-300 border-2 border-yellow-400 py-2 px-4 font-bold tracking-wide pixel-header"
              >
                #{idx + 1} Pick: {team}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
