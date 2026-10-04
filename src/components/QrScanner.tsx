import { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export function QrScanner({ onScan }: { onScan: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const generation = useRef(0);
  const mounted = useRef(false);
  const callback = useRef(onScan);
  callback.current = onScan;
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    generation.current++;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    stop();
    const attempt = generation.current;
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (!mounted.current || attempt !== generation.current) { stream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) { stop(); return; }
      video.srcObject = stream;
      await video.play();
      if (!mounted.current || attempt !== generation.current) return;

      const scan = () => {
        const canvas = canvasRef.current;
        const currentVideo = videoRef.current;
        if (!canvas || !currentVideo || !streamRef.current) return;
        if (currentVideo.readyState >= 2 && currentVideo.videoWidth && currentVideo.videoHeight) {
          canvas.width = currentVideo.videoWidth;
          canvas.height = currentVideo.videoHeight;
          const context = canvas.getContext("2d", { willReadFrequently: true });
          if (context) {
            context.drawImage(currentVideo, 0, 0, canvas.width, canvas.height);
            const image = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(image.data, image.width, image.height);
            if (code?.data) {
              stop();
              callback.current(code.data);
              return;
            }
          }
        }
        frameRef.current = requestAnimationFrame(scan);
      };
      frameRef.current = requestAnimationFrame(scan);
    } catch {
      if (mounted.current && attempt === generation.current) setError("เปิดกล้องไม่ได้ กรุณาอนุญาตสิทธิ์กล้องหรือกรอกโค้ดด้วยตนเอง");
    }
  }, [stop]);

  useEffect(() => {
    mounted.current = true;
    void start();
    return () => { mounted.current = false; stop(); };
  }, [start, stop]);

  return (
    <div className="qr-scanner">
      <video ref={videoRef} playsInline muted aria-label="กล้องสแกน QR" />
      <canvas ref={canvasRef} hidden />
      {error ? <p className="form-error">{error}</p> : null}
      <button className="secondary-button" type="button" onClick={() => void start()}>
        เปิดกล้องอีกครั้ง
      </button>
    </div>
  );
}
