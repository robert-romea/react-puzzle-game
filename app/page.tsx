"use client";
// @ts-ignore
import * as headbreaker from "headbreaker";
import { useEffect, useRef, useState } from "react";

function DemoJigsaw({
  id,
  width,
  height,
  pieceSize,
}: {
  id: string;
  width: number;
  height: number;
  pieceSize: number;
}) {
  const puzzleRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<any>(null);

  useEffect(() => {
    const image = new Image();
    image.src = "/puzzle.jpg";
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = new headbreaker.Canvas(id, {
        width,
        height,
        pieceSize,
        outline: new headbreaker.outline.Rounded(),
        proximity: pieceSize / 5,
        borderFill: pieceSize / 10,
        strokeWidth: 2,
        lineSoftness: 0.18,
        image: { content: image },
        maxPiecesCount: {
          x: Math.floor(width / pieceSize),
          y: Math.floor(height / pieceSize),
        },
        painter: new headbreaker.painters.Konva(),
      });

      canvas.adjustImagesToPuzzleHeight();

      canvas.autogenerate({
        horizontalPiecesCount: Math.floor(width / pieceSize),
        verticalPiecesCount: Math.floor(height / pieceSize),
      });

      canvas.shuffleGrid();
      canvas.draw();

      canvasRef.current = canvas;
    };
  }, [id, width, height, pieceSize]);

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
          border: "4px solid #333",
          padding: "20px",
        }}
      >
        <div style={{  width: width + 20, height: height + 20, display: "flex", justifyContent: "center", border: "2px solid #bc2121" }}>
  <div
          ref={puzzleRef}
          id={id}
          style={{
            border: "2px dashed #999",
            padding: "10px",
            background: "#fafafa",
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
  const [pieceSize, setPieceSize] = useState(100);
  const [width, setWidth] = useState(900);
  const [height, setHeight] = useState(900);

  return (
    <main style={{ padding: 20 }}>
      <h1 style={{ textAlign: "center" }}>🧩 Headbreaker Puzzle cu Imagine</h1>

      <div
        style={{
          marginBottom: 20,
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <label>Piece Size:&nbsp;</label>
        <input
          type="number"
          value={pieceSize}
          onChange={(e) => setPieceSize(+e.target.value)}
        />
        <label>Width:&nbsp;</label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(+e.target.value)}
        />
        <label>Height:&nbsp;</label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(+e.target.value)}
        />
      </div>
        

      <DemoJigsaw id="puzzle" width={width } height={height} pieceSize={pieceSize} />


    </main>
  );
}
