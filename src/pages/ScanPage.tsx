import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Image as ImageIcon,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  X,
  RotateCw,
  Zap,
  ZapOff,
  KeyRound,
  Send,
} from "lucide-react";
import jsQR from "jsqr";
import { TopHeader } from "@/components/TopHeader";
import { BottomNavBar } from "@/components/BottomNavBar";
import { ThemedLoading } from "@/components/ThemedLoading";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface CheckinResult {
  ok: boolean;
  activityTitle: string;
  locationName: string;
  pointsAdded: number;
  pointTotal: number;
  duplicate: boolean;
  venueCapped?: boolean;
  message: string;
}

export const ScanPage: React.FC = () => {
  const { firebaseUser, profile, refreshProfile } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScanTimeRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);

  const [verifying, setVerifying] = useState<boolean>(false);
  const [checkinResult, setCheckinResult] = useState<CheckinResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual code entry state
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualCode, setManualCode] = useState<string>("");

  // Play auspicious success chime using Web Audio API
  const playSuccessChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.2); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // Audio not permitted or supported
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  const handleVerifyPayload = useCallback(
    async (payload: string) => {
      stopCamera();
      setVerifying(true);
      setErrorMessage(null);

      try {
        const token = firebaseUser ? await firebaseUser.getIdToken() : "";
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch("/api/checkin", {
          method: "POST",
          headers,
          body: JSON.stringify({ qrPayload: payload.trim() }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "ไม่สามารถเช็กอินได้");
        }

        playSuccessChime();
        setCheckinResult(data);
        await refreshProfile();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตรวจสอบ QR Code");
      } finally {
        setVerifying(false);
      }
    },
    [firebaseUser, playSuccessChime, refreshProfile, stopCamera]
  );

  // Toggle Torch (Flashlight)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    try {
      const nextTorch = !torchOn;
      await (track as MediaStreamTrack & { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn("Torch not supported or failed to toggle:", err);
    }
  };

  // Flip Camera (environment <-> user)
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setErrorMessage(null);
    setCheckinResult(null);

    let stream: MediaStream | null = null;

    try {
      // 1. Try with preferred facingMode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback to basic video stream without constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream) {
        throw new Error("Unable to obtain video stream");
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      await video.play();

      setCameraActive(true);
      isScanningRef.current = true;

      // Check if torch is available
      const track = stream.getVideoTracks()[0];
      if (track) {
        const caps = (track.getCapabilities?.() || {}) as { torch?: boolean };
        setHasTorch(Boolean(caps.torch));
      }

      // Hardware BarcodeDetector if available
      const BarcodeDetectorAPI =
        typeof window !== "undefined" && "BarcodeDetector" in window
          ? (window as unknown as { BarcodeDetector: new (opts?: { formats: string[] }) => { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } }).BarcodeDetector
          : null;

      let nativeDetector: { detect: (src: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } | null = null;
      if (BarcodeDetectorAPI) {
        try {
          nativeDetector = new BarcodeDetectorAPI({ formats: ["qr_code"] });
        } catch {
          nativeDetector = null;
        }
      }

      // Pre-allocate downscaled canvas once to avoid garbage collection spikes
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      const TARGET_WIDTH = 480;

      const scanLoop = async (timestamp: number) => {
        if (!isScanningRef.current) return;

        // Throttle scans to once every 100ms
        if (timestamp - lastScanTimeRef.current >= 100) {
          lastScanTimeRef.current = timestamp;

          const currentVideo = videoRef.current;
          if (currentVideo && currentVideo.readyState >= 2 && currentVideo.videoWidth > 0) {
            // 1. Try Hardware-accelerated BarcodeDetector
            if (nativeDetector) {
              try {
                const barcodes = await nativeDetector.detect(currentVideo);
                if (barcodes.length > 0 && barcodes[0].rawValue) {
                  isScanningRef.current = false;
                  void handleVerifyPayload(barcodes[0].rawValue);
                  return;
                }
              } catch {
                // Fall through to jsQR
              }
            }

            // 2. Fallback to jsQR on optimized downscaled canvas
            if (canvas && ctx) {
              const vW = currentVideo.videoWidth;
              const vH = currentVideo.videoHeight;
              const scale = Math.min(1, TARGET_WIDTH / vW);
              const dW = Math.floor(vW * scale);
              const dH = Math.floor(vH * scale);

              if (canvas.width !== dW || canvas.height !== dH) {
                canvas.width = dW;
                canvas.height = dH;
              }

              ctx.drawImage(currentVideo, 0, 0, dW, dH);
              const imgData = ctx.getImageData(0, 0, dW, dH);
              const code = jsQR(imgData.data, imgData.width, imgData.height, {
                inversionAttempts: "dontInvert",
              });

              if (code?.data) {
                isScanningRef.current = false;
                void handleVerifyPayload(code.data);
                return;
              }
            }
          }
        }

        frameRef.current = requestAnimationFrame(scanLoop);
      };

      frameRef.current = requestAnimationFrame(scanLoop);
    } catch {
      setCameraError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์ หรือกดอัปโหลดรูปภาพ / กรอกรหัส");
      setCameraActive(false);
      isScanningRef.current = false;
    }
  }, [facingMode, handleVerifyPayload, stopCamera]);

  useEffect(() => {
    if (firebaseUser) {
      void startCamera();
    }
    return stopCamera;
  }, [facingMode, firebaseUser, startCamera, stopCamera]);

  // Image Upload Scanner Fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVerifying(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1000;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: "attemptBoth",
          });
          if (code?.data) {
            void handleVerifyPayload(code.data);
          } else {
            setVerifying(false);
            setErrorMessage("ไม่พบ QR Code ในรูปภาพที่อัปโหลด กรุณาถ่ายภาพให้เห็น QR ชัดเจนและสว่างขึ้น");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    void handleVerifyPayload(manualCode.trim());
  };

  const recentTransactions = profile?.transactions || [];

  return (
    <div className="mobile-viewport">
      <TopHeader title="สแกน QR" />

      {/* Hero Header */}
      <div className="chinese-hero" style={{ paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <h1 className="chinese-hero-title" style={{ fontSize: 24 }}>สแกน QR เช็กอิน</h1>
          <HelpCircle style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
        </div>
        <p className="chinese-hero-desc">
          สแกน QR Code ณ จุดเช็กอินหรือกิจกรรมภายในงาน เพื่อสะสมคะแนนและร่วมสุ่มกล่องสวรรค์
        </p>
      </div>

      <div className="ivory-card" style={{ paddingBottom: 100 }}>
        {/* Viewfinder Container */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 320,
            height: 290,
            margin: "0 auto 16px",
            borderRadius: 20,
            overflow: "hidden",
            background: "#040d0f",
            boxShadow: "0 10px 32px rgba(0, 0, 0, 0.45)",
            border: "2px solid var(--border-gold-subtle)",
          }}
        >
          {cameraActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
                textAlign: "center",
                background: "radial-gradient(circle, #0d252b 0%, #040d0f 100%)",
              }}
            >
              <img
                src="/src/assets/characters/azure-dragon-mascot.svg"
                alt=""
                style={{ width: 85, height: 85, opacity: 0.85, marginBottom: 12 }}
              />
              <div style={{ color: "var(--color-gold-300)", fontSize: 13, fontWeight: 700 }}>
                {cameraError ? "กล้องปิดอยู่" : "กดปุ่มเปิดกล้องเพื่อเริ่มสแกน"}
              </div>
            </div>
          )}

          <canvas ref={canvasRef} hidden />

          {/* Ornamental Chinese Corners Over Viewfinder */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "url(/src/assets/decorations/qr-frame.svg) center / contain no-repeat",
            }}
          />

          {/* Camera Viewfinder Controls Overlay (Top Right) */}
          {cameraActive && (
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                gap: 8,
                zIndex: 10,
              }}
            >
              {hasTorch && (
                <button
                  type="button"
                  onClick={toggleTorch}
                  title="ไฟฉาย"
                  style={{
                    background: torchOn ? "var(--color-gold-500)" : "rgba(4, 13, 15, 0.75)",
                    color: torchOn ? "#040d0f" : "#ffffff",
                    border: "1px solid rgba(212, 175, 55, 0.5)",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "grid",
                    placeItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {torchOn ? <Zap style={{ width: 18, height: 18 }} /> : <ZapOff style={{ width: 18, height: 18 }} />}
                </button>
              )}

              <button
                type="button"
                onClick={toggleFacingMode}
                title="สลับกล้องหน้า/หลัง"
                style={{
                  background: "rgba(4, 13, 15, 0.75)",
                  color: "#ffffff",
                  border: "1px solid rgba(212, 175, 55, 0.5)",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                }}
              >
                <RotateCw style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}

          {/* Instruction Pill */}
          <div
            style={{
              position: "absolute",
              bottom: 12,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(4, 13, 15, 0.88)",
              padding: "5px 14px",
              borderRadius: 9999,
              color: "#fef08a",
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: "nowrap",
              border: "1px solid rgba(212, 175, 55, 0.5)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            {cameraActive ? "จัดวาง QR Code ให้อยู่ในกรอบ" : "พร้อมเปิดกล้อง"}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 12,
              color: "#991b1b",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Camera & Input Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <button
            type="button"
            onClick={startCamera}
            className="chinese-btn-primary"
            style={{ fontSize: 13, padding: "10px 14px" }}
          >
            <Camera style={{ width: 17, height: 17 }} />
            <span>{cameraActive ? "รีสตาร์ตกล้อง" : "เปิดกล้อง"}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="chinese-btn-secondary"
            style={{ fontSize: 13, padding: "10px 14px" }}
          >
            <ImageIcon style={{ width: 17, height: 17 }} />
            <span>อัปโหลดรูป QR</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileUpload}
          />
        </div>

        {/* Fallback: Manual Code Entry Toggle */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setShowManualInput((prev) => !prev)}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-gold-700)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              textDecoration: "underline",
            }}
          >
            <KeyRound style={{ width: 14, height: 14 }} />
            <span>{showManualInput ? "ซ่อนช่องกรอกรหัส" : "กล้องสแกนไม่ได้? กรอกรหัสเช็กอินด้วยตนเอง"}</span>
          </button>

          <AnimatePresence>
            {showManualInput && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleManualSubmit}
                style={{ marginTop: 12, overflow: "hidden" }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="ใส่รหัสจุดเช็กอิน เช่น ACT-DRAGON-01 หรือ FATU26..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="chinese-input"
                    style={{ flex: 1, fontSize: 13 }}
                  />
                  <button
                    type="submit"
                    className="chinese-btn-primary"
                    style={{ padding: "0 16px", borderRadius: 10 }}
                  >
                    <Send style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Check-in Instructions */}
        <div className="ivory-card-inner" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-red-900)", marginBottom: 10 }}>
            กติกาการเช็กอิน & สะสมแต้ม
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-dark-secondary)", textAlign: "center" }}>
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-dark-primary)" }}>1. สแกน QR</div>
              <div>ประจำซุ้ม/ฐาน</div>
            </div>
            <ArrowRight style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-dark-primary)" }}>2. รับคะแนน</div>
              <div>ฐานแรกของโซน</div>
            </div>
            <ArrowRight style={{ width: 14, height: 14, color: "var(--color-gold-600)" }} />
            <div>
              <div style={{ fontWeight: 700, color: "var(--text-dark-primary)" }}>3. สุ่มรางวัล</div>
              <div>กล่องสวรรค์ 1 ครั้ง</div>
            </div>
          </div>
        </div>

        {/* Real Check-in History */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--color-red-900)", margin: 0 }}>
              ประวัติการเช็กอินของคุณ ({recentTransactions.length})
            </h3>
            <Link to="/profile" style={{ fontSize: 12, color: "var(--color-gold-700)", textDecoration: "none", fontWeight: 700 }}>
              ดูใบเบิกทาง →
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "24px 16px",
                background: "#fafaf9",
                borderRadius: 12,
                border: "1px dashed var(--border-gold-subtle)",
              }}
            >
              <img
                src="/src/assets/animations/checkin-stamp.svg"
                alt=""
                style={{ width: 44, height: 44, opacity: 0.45, margin: "0 auto 8px" }}
              />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-dark-primary)" }}>
                ยังไม่มีประวัติการเช็กอิน
              </div>
              <div style={{ fontSize: 11, color: "var(--text-dark-muted)", marginTop: 2 }}>
                สแกน QR ณ กิจกรรมหรือสถานที่เพื่อเริ่มสะสมคะแนน
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {recentTransactions.slice(0, 6).map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    background: "#ffffff",
                    border: "1px solid var(--border-gold-subtle)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: "var(--shadow-card-ivory)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src="/src/assets/animations/checkin-stamp.svg"
                      alt=""
                      style={{ width: 36, height: 36 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-dark-primary)" }}>
                        {tx.activityTitle || "กิจกรรม FATU Open House"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dark-muted)", marginTop: 2 }}>
                        {tx.venueName || "สถานที่จัดงาน"} • {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "วันนี้"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: tx.points > 0 ? "#15803d" : "#64748b",
                      background: tx.points > 0 ? "#f0fdf4" : "#f1f5f9",
                      padding: "4px 8px",
                      borderRadius: 6,
                      border: `1px solid ${tx.points > 0 ? "#bbf7d0" : "#cbd5e1"}`,
                    }}
                  >
                    {tx.points > 0 ? `+${tx.points} แต้ม` : "เข้าร่วมแล้ว"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Celebratory Check-in Success Banner / Modal */}
      <AnimatePresence>
        {checkinResult && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: "fixed",
              bottom: 80,
              left: "50%",
              transform: "translateX(-50%)",
              width: "calc(100% - 32px)",
              maxWidth: 440,
              background: checkinResult.duplicate
                ? "linear-gradient(135deg, #1e293b, #0f172a)"
                : "linear-gradient(135deg, #14532d, #064e3b)",
              border: `2px solid ${checkinResult.duplicate ? "#94a3b8" : "#4ade80"}`,
              borderRadius: 16,
              padding: 16,
              color: "#ffffff",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: checkinResult.duplicate ? "rgba(148, 163, 184, 0.2)" : "rgba(74, 222, 128, 0.2)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <CheckCircle style={{ width: 28, height: 28, color: checkinResult.duplicate ? "#94a3b8" : "#4ade80" }} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>
                  {checkinResult.duplicate ? "บันทึกไว้แล้ว" : "เช็กอินสำเร็จ!"}
                </div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>
                  {checkinResult.message}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!checkinResult.duplicate && checkinResult.pointsAdded > 0 && (
                <div style={{ fontSize: 16, fontWeight: 900, color: "#fef08a" }}>
                  +{checkinResult.pointsAdded}
                </div>
              )}
              <button
                type="button"
                onClick={() => setCheckinResult(null)}
                style={{ background: "none", border: "none", color: "#ffffff", cursor: "pointer", padding: 4 }}
              >
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {verifying && <ThemedLoading fullscreen message="กำลังตรวจสอบจุดเช็กอิน..." />}

      <BottomNavBar />
    </div>
  );
};
