"use client";
// @ts-ignore
import * as headbreaker from "headbreaker";
import { useEffect, useRef, useState } from "react";
import "./page.scss";

// COMPONENTA PUZZLE RESPONSIVĂ
function DemoJigsaw({
  id,
  puzzleWidth,
  puzzleHeight,
  horizontalPieces,
  verticalPieces,
  imageSrc,
  solveRef,
  shuffleRef,
  setPieceSize,
  setTabPaddingPx,
}) {
  const puzzleRef = useRef(null);
  const canvasRef = useRef(null);

  // Ajustare: piesele NU ies din container!
  const tabPaddingPx = Math.ceil(
    Math.min(puzzleWidth, puzzleHeight) /
      Math.max(horizontalPieces, verticalPieces) *
      0.17
  );
  const innerWidth = puzzleWidth - 2 * tabPaddingPx;
  const innerHeight = puzzleHeight - 2 * tabPaddingPx;
  const pieceSize = Math.floor(
    Math.min(innerWidth / horizontalPieces / 1.6, innerHeight / verticalPieces / 1.6)
  );

  // Update info piesă & padding către parent
  useEffect(() => {
    setPieceSize && setPieceSize(pieceSize);
    setTabPaddingPx && setTabPaddingPx(tabPaddingPx);
  }, [pieceSize, tabPaddingPx, setPieceSize, setTabPaddingPx]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current = null;
    }

    const image = new window.Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = new headbreaker.Canvas(id, {
        width: puzzleWidth,
        height: puzzleHeight,
        outline: new headbreaker.outline.Rounded(),
        proximity: pieceSize / 5,
        borderFill: pieceSize / 10,
        grid: true,
        strokeWidth: 2,
        lineSoftness: 0.18,
        pieceSize: pieceSize,
        image: { content: image },
        maxPiecesCount: {
          x: horizontalPieces,
          y: verticalPieces,
        },
        painter: new headbreaker.painters.Konva(),
        offset: {
          x: tabPaddingPx,
          y: tabPaddingPx,
        },
      });

      canvas.adjustImagesToPuzzleHeight();
      canvas.autogenerate({
        horizontalPiecesCount: horizontalPieces,
        verticalPiecesCount: verticalPieces,
        grid: true,
        borderFill: pieceSize / 10,
      });

      canvas.shuffleGrid();
      canvas.draw();

      canvasRef.current = canvas;
    };
  }, [
    id,
    puzzleWidth,
    puzzleHeight,
    horizontalPieces,
    verticalPieces,
    imageSrc,
    pieceSize,
    tabPaddingPx,
    innerWidth,
    innerHeight,
  ]);

  const handleSolve = () => {
    if (canvasRef.current) {
      canvasRef.current.solve();
      canvasRef.current.redraw();
    }
  };

  const handleShuffle = () => {
    if (canvasRef.current) {
      canvasRef.current.shuffleGrid();
      canvasRef.current.redraw();
    }
  };

  // Expune solve și shuffle către parent
  useEffect(() => {
    if (solveRef) {
      solveRef.current = handleSolve;
    }
    if (shuffleRef) {
      shuffleRef.current = handleShuffle;
    }
  }, [solveRef, shuffleRef, handleSolve, handleShuffle]);

  return (
    <div className="jpz-puzzle-box">
      <div
        ref={puzzleRef}
        id={id}
        className="jpz-puzzle-canvas"
      ></div>
    </div>
  );
}

// COMPONENTA PRINCIPALĂ, FULL RESPONSIVE
export default function Home() {
  const images = ["/puzzle.jpg", "/puzzle1.jpg", "/puzzle2.jpg"];
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

  const [hPieces, setHPieces] = useState(3);
  const [vPieces, setVPieces] = useState(3);
  const [imageSrc, setImageSrc] = useState(getRandomImage());
  const [pieceSize, setPieceSize] = useState(0);
  const [tabPaddingPx, setTabPaddingPx] = useState(0);

  // Responsivitate:
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(400); // default mic, ca fallback

  // Update containerSize la orice resize
  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        // Ia cât de mare poate fi containerul, cât să fie mereu pătrat și max 98vw sau 80vh
        const width = containerRef.current.offsetWidth;
        const height = window.innerHeight * 0.8;
        const size = Math.floor(Math.min(width, height, 800)); // max 800px
        setContainerSize(size);
      }
    }

    updateSize(); // la montare

    let observer;
    if (window.ResizeObserver) {
      observer = new ResizeObserver(updateSize);
      if (containerRef.current) observer.observe(containerRef.current);
    } else {
      window.addEventListener("resize", updateSize);
    }

    window.addEventListener("resize", updateSize);

    return () => {
      if (observer && containerRef.current) observer.unobserve(containerRef.current);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  // Referințe pentru solve și shuffle
  const demoJigsawRef = useRef();
  const demoJigsawShuffleRef = useRef();

  function handlePreset(h, v) {
    setHPieces(h);
    setVPieces(v);
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
    }
  }

  function handleSolve() {
    if (demoJigsawRef.current) {
      demoJigsawRef.current();
    }
  }

  function handleShuffle() {
    if (demoJigsawShuffleRef.current) {
      demoJigsawShuffleRef.current();
    }
  }

  return (
    <main className="jpz-main">
      {/* Bara de sus: preseturi + solve + shuffle */}
      <div className="jpz-topbar">
        <div className="jpz-presets">
          <button
            className={`jpz-btn-preset${hPieces === 3 && vPieces === 3 ? " active" : ""}`}
            onClick={() => handlePreset(3, 3)}
          >
            3×3
          </button>
          <button
            className={`jpz-btn-preset${hPieces === 4 && vPieces === 4 ? " active" : ""}`}
            onClick={() => handlePreset(4, 4)}
          >
            4×4
          </button>
          <button
            className={`jpz-btn-preset${hPieces === 5 && vPieces === 5 ? " active" : ""}`}
            onClick={() => handlePreset(5, 5)}
          >
            5×5
          </button>
        </div>
        <div className="jpz-controls">
          <button
            className="jpz-btn shuffle"
            onClick={handleShuffle}
          >
            Shuffle
          </button>
          <button
            className="jpz-btn solve"
            onClick={handleSolve}
          >
            Solve Puzzle
          </button>
        </div>
      </div>

      {/* Container responsive */}
      <div ref={containerRef} className="jpz-container-outer">
        <div className="jpz-container-inner">
          <DemoJigsaw
            id="puzzle"
            puzzleWidth={containerSize}
            puzzleHeight={containerSize}
            horizontalPieces={hPieces}
            verticalPieces={vPieces}
            imageSrc={imageSrc}
            solveRef={demoJigsawRef}
            shuffleRef={demoJigsawShuffleRef}
            setPieceSize={setPieceSize}
            setTabPaddingPx={setTabPaddingPx}
          />
        </div>
      </div>
    </main>
  );
}
