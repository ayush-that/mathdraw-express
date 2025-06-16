import React, { useRef, useEffect, useState } from "react";

interface DrawingCanvasProps {
  onCanvasChange: (imageData: string | null) => void;
  width?: number;
  height?: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  onCanvasChange,
  width = 280,
  height = 120,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    canvas.width = width;
    canvas.height = height;

    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [width, height]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(e);

    setIsDrawing(true);
    setLastPoint(pos);

    ctx.fillStyle = "#000000";
    ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(e);

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    setLastPoint(pos);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    setIsDrawing(false);
    setLastPoint(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasContent = imageData.data.some(
          (channel, index) => index % 4 === 3 && channel > 0
        );

        if (hasContent) {
          const canvasDataURL = canvas.toDataURL("image/png");
          onCanvasChange(canvasDataURL);
        } else {
          onCanvasChange(null);
        }
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onCanvasChange(null);
  };

  return (
    <div style={{ marginBottom: 6 }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: "1px solid #ccc",
          borderRadius: 4,
          background: "#ffffff",
          cursor: "crosshair",
          display: "block",
        }}
      />
      <button
        onClick={clearCanvas}
        style={{
          width: "100%",
          marginTop: 6,
          padding: "8px 0",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          fontSize: 12,
          fontWeight: "bold",
        }}
      >
        Clear canvas
      </button>
    </div>
  );
};

export default DrawingCanvas;
