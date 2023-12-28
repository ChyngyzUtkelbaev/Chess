import './App.css';
import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import axios from 'axios';

function createYouTubeEmbedUrl(videoId) {
  return `https://www.youtube.com/embed/${videoId}`;
}

function App() {
  const [game, setGame] = useState(new Chess());
  const [videoUrl, setVideoUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');

  const searchQueries = ['Chess', 'Checkmate', 'Chess strategy']; // Массив ключевых слов

  const playRandomVideo = async () => {
    try {
      // Выбираем случайное ключевое слово из массива
      const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyCJbjdTwX23vcipDpUixJJoaoONX2uSSQA',
          q: randomQuery,
          type: 'video',
          videoEmbeddable: true,
          order: 'viewCount',
        },
      });

      const randomVideoId = response.data.items[0]?.id.videoId;
      console.log('Random Video ID:', randomVideoId);

      if (randomVideoId) {
        setVideoUrl(`https://www.youtube.com/watch?v=${randomVideoId}`);
        setEmbedUrl(createYouTubeEmbedUrl(randomVideoId));
      } else {
        console.error('Random Video ID is empty or invalid.');
      }
    } catch (error) {
      console.error('Error fetching random video:', error);
    }
  };

  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function makeRandomMove() {
    const possibleMoves = game.moves();

    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);

    safeGameMutate((game) => {
      game.move(possibleMoves[randomIndex]);
    });

    playRandomVideo();
  }

  function onDrop(source, target) {
    let move = null;

    safeGameMutate((game) => {
      move = game.move({
        from: source,
        to: target,
        promotion: 'q',
      });
    });

    if (move === null) return false;

    setTimeout(makeRandomMove, 200);
    return true;
  }

  useEffect(() => {
    // Вызывать playRandomVideo только если сделан хотя бы один ход
    if (game.history().length > 0) {
      playRandomVideo();
    }
  }, [game]);

  return (
    <div className="app">
      <Chessboard position={game.fen()} onPieceDrop={onDrop} />
      {embedUrl && (
        <iframe
          width="560"
          height="315"
          src={embedUrl}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      )}
    </div>
  );
}

export default App;
