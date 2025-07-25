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

  // Calculate padding and piece size for the puzzle (ensures big pieces)
  const tabPaddingPx = Math.ceil(
    Math.min(puzzleWidth, puzzleHeight) / Math.max(horizontalPieces, verticalPieces) * 0.17
  );

  const innerWidth = puzzleWidth - 2 * tabPaddingPx;
  const innerHeight = puzzleHeight - 2 * tabPaddingPx;

  // Use 0.95 to leave a small gap between pieces (no division by 1.6 anymore!)
  const pieceSize = Math.floor(
    Math.min(innerWidth / horizontalPieces / 1.6,  innerHeight / verticalPieces / 1.6) * 0.95
  );

  // Update parent with piece size and padding
  useEffect(() => {
    setPieceSize && setPieceSize(pieceSize);
    setTabPaddingPx && setTabPaddingPx(tabPaddingPx);
  }, [pieceSize, tabPaddingPx, setPieceSize, setTabPaddingPx]);

  useEffect(() => {
    // Do not generate puzzle if the container is too small (prevents tiny pieces)
    if (puzzleWidth < 200 || puzzleHeight < 200) return;

    if (canvasRef.current) {
      canvasRef.current = null;
    }

    // Prepare image for puzzle background (with "cover" logic)
    const image = new window.Image();
    image.src = imageSrc;
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const imgRatio = image.width / image.height;
      const canvasRatio = puzzleWidth / puzzleHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgRatio > canvasRatio) {
        // Image is wider than the canvas: crop horizontally
        drawHeight = puzzleHeight;
        drawWidth = drawHeight * imgRatio;
        offsetX = -(drawWidth - puzzleWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller: crop vertically
        drawWidth = puzzleWidth;
        drawHeight = drawWidth / imgRatio;
        offsetX = 0;
        offsetY = -(drawHeight - puzzleHeight) / 2;
      }

      // Draw image into an offscreen canvas, "cover" style
      const offscreen = document.createElement('canvas');
      offscreen.width = puzzleWidth;
      offscreen.height = puzzleHeight;
      const ctx = offscreen.getContext('2d');
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

      const processedImage = new window.Image();
      processedImage.src = offscreen.toDataURL();

      processedImage.onload = () => {
        // Init headbreaker puzzle with correct size and processed image
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

        // Generate pieces and shuffle
        canvas.adjustImagesToPuzzleHeight();
        canvas.autogenerate({
          horizontalPiecesCount: horizontalPieces,
          verticalPiecesCount: verticalPieces,
          grid: true,
          borderFill: pieceSize / 10,
        });

        canvas.shuffleGrid();
        canvas.draw();

        // Puzzle solved detection (manual or via button)
        canvas.attachSolvedValidator();
        canvas.onValid(() => {
          console.log("Puzzle solved (manual drag&drop)!");
          onSolved && onSolved();
        });

        canvasRef.current = canvas;

        // Reset solved overlay each time a new puzzle is generated
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

  // Call this for "Solve Puzzle" button
  const handleSolve = () => {
    if (canvasRef.current) {
      canvasRef.current.solve();
      canvasRef.current.redraw();
      console.log("Puzzle solved (by button)!");
      onSolved && onSolved();
    }
  };

  // Call this for "Shuffle" button
  const handleShuffle = () => {
    if (canvasRef.current) {
      canvasRef.current.shuffleGrid();
      canvasRef.current.redraw();
      if (resetSolved) resetSolved();
    }
  };

  // Expose handlers to parent via refs
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

  // Fallback is large enough to prevent tiny puzzle on first load
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState(700);

  // Make the puzzle fully responsive on resize
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

  // Handlers for controlling puzzle from UI buttons
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

  // Called when the puzzle is solved (by drag or by button)
  function handleSolved() {
    setSolved(true);
    console.log("Solved state set!");
  }

  // Called to hide the solved overlay (e.g. on shuffle or preset/image change)
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
              <span>🎉 Congratulations, you solved the puzzle!</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
