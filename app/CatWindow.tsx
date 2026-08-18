"use client";

import { useRef } from "react";

export function CatWindow() {
  const sceneRef = useRef<HTMLDivElement>(null);

  function followPointer(clientX: number, clientY: number) {
    const scene = sceneRef.current;
    if (!scene) return;
    const rect = scene.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
    const y = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
    scene.style.setProperty("--look-x", `${x * 8}px`);
    scene.style.setProperty("--look-y", `${y * 6}px`);
  }

  return (
    <div
      className="window-scene"
      ref={sceneRef}
      onPointerMove={(event) => followPointer(event.clientX, event.clientY)}
      onPointerLeave={() => {
        sceneRef.current?.style.setProperty("--look-x", "0px");
        sceneRef.current?.style.setProperty("--look-y", "0px");
      }}
      aria-label="一隻趴在夜晚窗台上的黑色大眼貓，眼睛會跟著游標移動"
      role="img"
    >
      <div className="moon" />
      <i className="star star-a" /><i className="star star-b" /><i className="star star-c" />
      <div className="cloud cloud-a" /><div className="cloud cloud-b" />
      <div className="window-frame vertical" /><div className="window-frame horizontal" />
      <div className="cat">
        <div className="cat-tail" />
        <div className="cat-body" />
        <div className="cat-head">
          <span className="ear left" /><span className="ear right" />
          <span className="eye left"><i /></span><span className="eye right"><i /></span>
          <span className="muzzle" />
          <span className="nose" /><span className="mouth left" /><span className="mouth right" />
          <span className="whisker w1" /><span className="whisker w2" /><span className="whisker w3" />
          <span className="whisker wr1" /><span className="whisker wr2" /><span className="whisker wr3" />
        </div>
        <div className="paw paw-left" /><div className="paw paw-right" />
      </div>
      <div className="sill"><span>move your cursor — the night is watching</span></div>
    </div>
  );
}
