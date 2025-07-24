"use client";
// @ts-ignore
import * as headbreaker from "headbreaker";
import { useEffect, useRef, useState } from "react";

function DemoJigsaw({
  id,
  puzzleWidth,
  puzzleHeight,
  horizontalPieces,
  verticalPieces,
  imageSrc,
}) {
  const puzzleRef = useRef(null);
  const canvasRef = useRef(null);

  // 🟢 Ajustare: piesele NU ies din container!
  // Padding calculat în pixeli
  const tabPaddingPx = Math.ceil(
    Math.min(puzzleWidth, puzzleHeight) / Math.max(horizontalPieces, verticalPieces) * 0.17
  );
  const innerWidth = puzzleWidth - 2 * tabPaddingPx;
  const innerHeight = puzzleHeight - 2 * tabPaddingPx;
  const pieceSize = Math.floor(
    Math.min(innerWidth / horizontalPieces / 1.6, innerHeight / verticalPieces / 1.6)
  );

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
        offset: { // Cheia magiei: offset ca să centrezi puzzle-ul în container
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

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
            background: "#fafafa",
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
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <button onClick={handleSolve}>Solve Puzzle</button>
        <div style={{ fontSize: 14, color: "#999", marginTop: 6 }}>
          Dimensiune piesă: <b>{pieceSize}</b> px, Padding: <b>{tabPaddingPx}</b> px
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const CONTAINER_SIZE = 1000;
  const images = ["/puzzle.jpg", "/puzzle1.jpg", "/puzzle2.jpg"];
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

  const [hPieces, setHPieces] = useState(3);
  const [vPieces, setVPieces] = useState(3);
  const [imageSrc, setImageSrc] = useState(getRandomImage());

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

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>🧩 Headbreaker Puzzle (robust & clean)</h1>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          flexWrap: "wrap",
        }}
      >
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
        <label style={{ alignSelf: "center" }}>Alege imagine:&nbsp;</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ alignSelf: "center" }}
        />
      </div>

      <div
        style={{
          width: CONTAINER_SIZE,
          height: CONTAINER_SIZE,
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "4px solid #333",
          background: "#fff",
        }}
      >
        <DemoJigsaw
          id="puzzle"
          puzzleWidth={CONTAINER_SIZE}
          puzzleHeight={CONTAINER_SIZE}
          horizontalPieces={hPieces}
          verticalPieces={vPieces}
          imageSrc={imageSrc}
        />
      </div>
    </main>
  );
}
