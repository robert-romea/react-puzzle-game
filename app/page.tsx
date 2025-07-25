"use client";
// @ts-ignore
import * as headbreaker from "headbreaker";
import { useEffect, useRef, useState } from "react";
import "./page.scss";

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
  onSolved,
  resetSolved,
}) {
  const puzzleRef = useRef(null);
  const canvasRef = useRef(null);

  // -- FIX PIESE MARI (NU mai împărți la 1.6) --
  const tabPaddingPx = Math.ceil(
    Math.min(puzzleWidth, puzzleHeight) / Math.max(horizontalPieces, verticalPieces) * 0.17
  );
  const innerWidth = puzzleWidth - 2 * tabPaddingPx;
  const innerHeight = puzzleHeight - 2 * tabPaddingPx;
  const pieceSize = Math.floor(
    Math.min(innerWidth / horizontalPieces / 1.6, innerHeight / verticalPieces / 1.6) * 0.95
  );

  useEffect(() => {
    setPieceSize && setPieceSize(pieceSize);
    setTabPaddingPx && setTabPaddingPx(tabPaddingPx);
  }, [pieceSize, tabPaddingPx, setPieceSize, setTabPaddingPx]);

  useEffect(() => {
    // -- NU genera puzzle-ul dacă e prea mic containerul --
    if (puzzleWidth < 200 || puzzleHeight < 200) return;

    if (canvasRef.current) {
      canvasRef.current = null;
    }

    const image = new window.Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const imgRatio = image.width / image.height;
      const canvasRatio = puzzleWidth / puzzleHeight;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        drawHeight = puzzleHeight;
        drawWidth = drawHeight * imgRatio;
        offsetX = -(drawWidth - puzzleWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = puzzleWidth;
        drawHeight = drawWidth / imgRatio;
        offsetX = 0;
        offsetY = -(drawHeight - puzzleHeight) / 2;
      }

      const offscreen = document.createElement('canvas');
      offscreen.width = puzzleWidth;
      offscreen.height = puzzleHeight;
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      const processedImage = new window.Image();
      processedImage.src = offscreen.toDataURL();

      processedImage.onload = () => {
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
          image: { content: processedImage },
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

        canvas.attachSolvedValidator();
        canvas.onValid(() => {
          console.log("Puzzle solved (manual drag&drop)!");
          onSolved && onSolved();
        });

        canvasRef.current = canvas;

        if (resetSolved) resetSolved();
      };
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
      console.log("Puzzle solved (by button)!");
      onSolved && onSolved();
    }
  };

  const handleShuffle = () => {
    if (canvasRef.current) {
      canvasRef.current.shuffleGrid();
      canvasRef.current.redraw();
      if (resetSolved) resetSolved();
    }
  };

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

export default function Home() {
  const images = ["/puzzle.jpg", "/puzzle1.jpg", "/puzzle2.jpg"];
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

  const [hPieces, setHPieces] = useState(3);
  const [vPieces, setVPieces] = useState(3);
  const [imageSrc, setImageSrc] = useState(getRandomImage());
  const [pieceSize, setPieceSize] = useState(0);
  const [tabPaddingPx, setTabPaddingPx] = useState(0);
  const [solved, setSolved] = useState(false);

  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(700); // fallback decent, dar va fi actualizat rapid

  useEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = window.innerHeight * 0.8;
        const size = Math.floor(Math.min(width, height, 800));
        setContainerSize(size);
      }
    }

    updateSize();

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

  const demoJigsawRef = useRef();
  const demoJigsawShuffleRef = useRef();

  function handlePreset(h, v) {
    setHPieces(h);
    setVPieces(v);
    setSolved(false);
  }

  function handleImageChange(e) {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      setSolved(false);
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
      setSolved(false);
    }
  }

  function handleSolved() {
    setSolved(true);
    console.log("Solved state set!");
  }

  function handleResetSolved() {
    setSolved(false);
  }

  return (
    <main className="jpz-main">
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
          <button className="jpz-btn shuffle" onClick={handleShuffle}>
            Shuffle
          </button>
          <button className="jpz-btn solve" onClick={handleSolve}>
            Solve Puzzle
          </button>
          {/* <input type="file" accept="image/*" onChange={handleImageChange} /> */}
        </div>
      </div>

      <div ref={containerRef} className="jpz-container-outer">
        <div className="jpz-container-inner" style={{ position: "relative" }}>
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
            onSolved={handleSolved}
            resetSolved={handleResetSolved}
          />
          {solved && (
            <div className="jpz-solved-overlay">
              <span>🎉 Felicitări, ai rezolvat puzzle-ul!</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
