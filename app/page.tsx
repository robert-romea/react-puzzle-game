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
        proximity: Math.min(puzzleWidth, puzzleHeight) / 25, // ajustabil pentru "snap"
        borderFill: 0.18,
        grid: true,
        strokeWidth: 2,
        lineSoftness: 0.18,
        // merge: true, // dacă ai painter HTML
        image: { content: image },
        maxPiecesCount: {
          x: horizontalPieces,
          y: verticalPieces,
        },
        painter: new headbreaker.painters.Konva(),
      });

      canvas.adjustImagesToPuzzleHeight();

      canvas.autogenerate({
        horizontalPiecesCount: horizontalPieces,
        verticalPiecesCount: verticalPieces,
        grid: true,
                borderFill: 0.18

      });

      canvas.shuffleGrid();
      canvas.draw();

      canvasRef.current = canvas;
    };
  }, [id, puzzleWidth, puzzleHeight, horizontalPieces, verticalPieces, imageSrc]);

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
      </div>
    </>
  );
}

export default function Home() {
  // Poți pune orice dimensiune vrei, containerul nu se schimbă niciodată!
  const CONTAINER_SIZE = 1000;
  const images = ["/puzzle.jpg", "/puzzle1.jpg", "/puzzle2.jpg"];
  const getRandomImage = () => images[Math.floor(Math.random() * images.length)];

  // 3x3 default
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

      {/* Container puzzle fix */}
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
