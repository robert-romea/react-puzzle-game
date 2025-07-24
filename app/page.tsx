"use client";
// @ts-ignore
import * as headbreaker from "headbreaker";
import { useEffect, useRef, useState } from "react";

// COMPONENTA PUZZLE
function DemoJigsaw({
  id,
  puzzleWidth,
  puzzleHeight,
  horizontalPieces,
  verticalPieces,
  imageSrc,
  solveRef,
  setPieceSize,
  setTabPaddingPx,
}) {
  const puzzleRef = useRef(null);
  const canvasRef = useRef(null);

  // Ajustare: piesele NU ies din container!
  const tabPaddingPx = Math.ceil(
    Math.min(puzzleWidth, puzzleHeight) / Math.max(horizontalPieces, verticalPieces) * 0.17
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

  // Expune solve-ul către parent
  useEffect(() => {
    if (solveRef) {
      solveRef.current = handleSolve;
    }
  }, [solveRef, handleSolve]);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        style={{
          width: puzzleWidth,
          height: puzzleHeight,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#e8e6e6",
          border: "2px solid #bc2121",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          ref={puzzleRef}
          id={id}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        ></div>
      </div>
    </div>
  );
}

// COMPONENTA PRINCIPALĂ
export default function Home() {
  const CONTAINER_SIZE = 800;
  const images = ["/puzzle.jpg", "/puzzle1.jpg", "/puzzle2.jpg"];
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

  const [hPieces, setHPieces] = useState(3);
  const [vPieces, setVPieces] = useState(3);
  const [imageSrc, setImageSrc] = useState(getRandomImage());
  const [pieceSize, setPieceSize] = useState(0);
  const [tabPaddingPx, setTabPaddingPx] = useState(0);

  // Referință pentru solve
  const demoJigsawRef = useRef();

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

  return (
    <main style={{ padding: 20 }}>
      {/* Bara de sus: preseturi + solve */}
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          minHeight: 60,
        }}
      >
        <div style={{ display: "flex", gap: 15, alignItems: "center" }}>
          <button
            onClick={() => handlePreset(3, 3)}
            style={{
              fontWeight: hPieces === 3 && vPieces === 3 ? "bold" : "normal",
              background: hPieces === 3 && vPieces === 3 ? "#f2e8ff" : undefined,
            }}
          >
            3×3
          </button>
          <button
            onClick={() => handlePreset(4, 4)}
            style={{
              fontWeight: hPieces === 4 && vPieces === 4 ? "bold" : "normal",
              background: hPieces === 4 && vPieces === 4 ? "#f2e8ff" : undefined,
            }}
          >
            4×4
          </button>
          <button
            onClick={() => handlePreset(5, 5)}
            style={{
              fontWeight: hPieces === 5 && vPieces === 5 ? "bold" : "normal",
              background: hPieces === 5 && vPieces === 5 ? "#f2e8ff" : undefined,
            }}
          >
            5×5
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
          <button onClick={handleSolve} style={{ marginBottom: 4, fontWeight: 600 }}>
            Solve Puzzle
          </button>
          {/* <div style={{ fontSize: 13, color: "#999", textAlign: "right" }}>
            Dimensiune piesă: <b>{pieceSize}</b> px,
            Padding: <b>{tabPaddingPx}</b> px
          </div> */}
        </div>
      </div>

      <div
        style={{
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <DemoJigsaw
          id="puzzle"
          puzzleWidth={CONTAINER_SIZE}
          puzzleHeight={CONTAINER_SIZE}
          horizontalPieces={hPieces}
          verticalPieces={vPieces}
          imageSrc={imageSrc}
          solveRef={demoJigsawRef}
          setPieceSize={setPieceSize}
          setTabPaddingPx={setTabPaddingPx}
        />
      </div>
    </main>
  );
}
