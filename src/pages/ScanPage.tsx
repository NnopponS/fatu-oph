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
import { InkStamp } from "@/components/InkStamp";
import { sfx } from "@/lib/sfx";
import { DragonScroll } from "@/components/DragonScroll";
import { useVenues } from "@/data/content";
import { placeName, realmForPlace } from "@/lib/realms";
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
  const venues = useVenues();
  const resultRef = useRef<HTMLDivElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScanTimeRef = useRef<number>(0);
  const cameraGenerationRef = useRef(0);
  const verifyingRef = useRef(false);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStarting, setCameraStarting] = useState(false);
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

  const resultVisible = Boolean(checkinResult);
  useEffect(() => {
    if (!resultVisible) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    resultRef.current?.focus({ preventScroll: true });
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") setCheckinResult(null);
      if (event.key !== "Tab") return;
      const controls = Array.from(resultRef.current?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") || []);
      const first = controls[0]; const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === resultRef.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === resultRef.current)) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keys);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", keys); previousFocus?.focus({ preventScroll: true }); };
  }, [resultVisible]);

  const stopCamera = useCallback(() => {
    cameraGenerationRef.current += 1;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    isScanningRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraStarting(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  const handleVerifyPayload = useCallback(
    async (payload: string) => {
      if (verifyingRef.current) return;
      if (!firebaseUser) {
        setVerifying(false);
        setErrorMessage("กรุณาเข้าสู่ระบบก่อนเช็กอินเพื่อบันทึกแต้มลงใบเบิกทาง");
        return;
      }
      verifyingRef.current = true;
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

        if (data.duplicate) sfx.select();
        setCheckinResult(data);
        await refreshProfile();
      } catch (err: unknown) {
        sfx.error();
        setErrorMessage(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการตรวจสอบ QR Code");
      } finally {
        verifyingRef.current = false;
        setVerifying(false);
      }
    },
    [firebaseUser, refreshProfile, stopCamera]
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
    if (verifyingRef.current) return;
    stopCamera();
    const generation = cameraGenerationRef.current;
    setCameraStarting(true);
    setCameraError(null);
    setErrorMessage(null);
    setCheckinResult(null);

    let stream: MediaStream | null = null;

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("เบราว์เซอร์นี้ไม่รองรับกล้อง กรุณาเปิดผ่าน HTTPS หรือใช้รูป QR");
      }
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
      } catch (error) {
        if (error instanceof DOMException && ["NotAllowedError", "SecurityError"].includes(error.name)) throw error;
        // Fallback to basic video stream without constraints
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (!stream) {
        throw new Error("Unable to obtain video stream");
      }

      if (generation !== cameraGenerationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("ไม่พบหน้าต่างแสดงภาพกล้อง กรุณาลองเปิดกล้องอีกครั้ง");

      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      await video.play();

      if (generation !== cameraGenerationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

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
        if (!isScanningRef.current || generation !== cameraGenerationRef.current) return;

        // Throttle scans to once every 100ms
        if (timestamp - lastScanTimeRef.current >= 100) {
          lastScanTimeRef.current = timestamp;

          const currentVideo = videoRef.current;
          if (currentVideo && currentVideo.readyState >= 2 && currentVideo.videoWidth > 0) {
            // 1. Try Hardware-accelerated BarcodeDetector
            if (nativeDetector) {
              try {
                const barcodes = await nativeDetector.detect(currentVideo);
                if (!isScanningRef.current || generation !== cameraGenerationRef.current) return;
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
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      if (generation !== cameraGenerationRef.current) return;
      stopCamera();
      setCameraError(error instanceof DOMException && error.name === "NotFoundError"
        ? "ไม่พบกล้องในอุปกรณ์นี้ ใช้อัปโหลดรูป QR หรือกรอกรหัสแทนได้"
        : "เปิดกล้องไม่ได้ กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์ แล้วกดเปิดกล้องอีกครั้ง หรือใช้รูป QR / กรอกรหัส");
    } finally {
      if (generation === cameraGenerationRef.current) setCameraStarting(false);
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
    stopCamera();
    e.target.value = "";

    setVerifying(true);
    setErrorMessage(null);

    const reader = new FileReader();
    const failRead = () => {
      setVerifying(false);
      setErrorMessage("อ่านรูปภาพไม่ได้ กรุณาเลือกรูป QR ที่ชัดเจนอีกครั้ง");
    };
    reader.onerror = failRead;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = failRead;
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
        } else failRead();
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
    <div className="scan-page">

      {/* Hero Header */}
      <div className="chinese-hero" style={{ paddingBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <h1 className="chinese-hero-title" style={{ fontSize: 24 }}>สแกน QR เช็กอิน</h1>
          <HelpCircle style={{ width: 18, height: 18, color: "var(--color-gold-400)" }} />
        </div>
        <p className="chinese-hero-desc">
          เปิดคัมภีร์ สแกน QR ที่จุดกิจกรรม แล้วรับตราประทับและพลังจากผู้พิทักษ์
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
          <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              aria-label="ภาพสดจากกล้องสแกน QR"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: cameraActive ? 1 : 0 }}
            />
          {!cameraActive && (
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
                src="/assets/brand/dragon-seal.svg"
                alt=""
                className="scan-dormant-mark"
                style={{ width: 85, height: 85, opacity: 0.85, marginBottom: 12 }}
              />
              <div style={{ color: "var(--color-gold-300)", fontSize: 13, fontWeight: 700 }}>
                {cameraStarting ? "กำลังเปิดกล้อง..." : cameraError ? "กล้องปิดอยู่" : "กดปุ่มเปิดกล้องเพื่อเริ่มสแกน"}
              </div>
            </div>
          )}
          {cameraActive && <div className="scanner-energy-line" aria-hidden="true" />}

          <canvas ref={canvasRef} hidden />

          {/* Ornamental Chinese Corners Over Viewfinder */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "url(/assets/decorations/qr-frame.svg) center / contain no-repeat",
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

        {cameraError && <div className="scanner-camera-error" role="alert"><AlertTriangle size={18} /><p>{cameraError}</p></div>}

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
            disabled={cameraStarting || verifying}
            className="chinese-btn-primary"
            style={{ fontSize: 13, padding: "10px 14px" }}
          >
            <Camera style={{ width: 17, height: 17 }} />
            <span>{cameraStarting ? "กำลังเปิดกล้อง..." : cameraActive ? "รีสตาร์ตกล้อง" : "เปิดกล้อง"}</span>
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
                src="/assets/animations/checkin-stamp.svg"
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
                      src="/assets/animations/checkin-stamp.svg"
                      alt=""
                      style={{ width: 36, height: 36 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "var(--text-dark-primary)" }}>
                        {tx.activityTitle || "กิจกรรม FATU Open House"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-dark-muted)", marginTop: 2 }}>
                        {placeName(tx.venueName || "สถานที่จัดงาน")} • {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "วันนี้"}
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

      <AnimatePresence>
        {checkinResult && <motion.div ref={resultRef} tabIndex={-1} className="checkin-celebration" role="dialog" aria-modal="true" aria-labelledby="checkin-result-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="checkin-result-card" initial={{ y: 24, scale: .92 }} animate={{ y: 0, scale: 1 }}>
            {!checkinResult.duplicate && <><div className="checkin-energy-background" aria-hidden="true" /><div className="checkin-power-label">THE GUARDIAN'S BLESSING</div><DragonScroll empowered identity={realmForPlace(checkinResult.locationName)?.[0] || venues.items.find(venue => venue.name === checkinResult.locationName)?.visualIdentityKey || "azure-dragon"} /></>}
            <button className="checkin-close" aria-label="ปิดผลเช็กอิน" onClick={() => setCheckinResult(null)}><X size={20} /></button>
            {!checkinResult.duplicate ? <InkStamp label="ประทับตราสำเร็จ" points={checkinResult.pointsAdded} /> : <div className="checkin-duplicate"><CheckCircle size={50} /><h2>บันทึกไว้แล้ว</h2></div>}
            <h2 id="checkin-result-title">{placeName(checkinResult.locationName)}</h2>
            <strong>{checkinResult.activityTitle}</strong>
            <p>{checkinResult.message}</p>
            <div className="checkin-total">แต้มในใบเบิกทาง <b>{checkinResult.pointTotal}</b></div>
            <Link className="button-imperial-red" to="/schedule">เลือกภารกิจถัดไป <ArrowRight size={17} /></Link>
            <button className="button-gold-outline" onClick={() => { setCheckinResult(null); void startCamera(); }}>สแกนกิจกรรมต่อไป</button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>

      {verifying && <ThemedLoading fullscreen message="กำลังตรวจสอบจุดเช็กอิน..." />}

    </div>
  );
};
