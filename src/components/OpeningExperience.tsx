import React, { useEffect, useState, useRef } from "react";
import { Sparkles, X, Compass, Award, Shield, ArrowRight, CheckCircle2, ChevronRight, RotateCcw } from "lucide-react";
import { animate, createScope, spring, prefersReducedMotion } from "@/lib/anime";
import { MythicRealmScene3D, RealmKey } from "@/components/MythicRealmScene3D";

interface RealmChoice {
  key: RealmKey;
  name: string;
  beast: string;
  place: string;
  dept: string;
  roleTitle: string;
  quote: string;
  perk: string;
  color: string;
  borderColor: string;
  image: string;
}

const REALM_CHOICES: RealmChoice[] = [
  {
    key: "azure-dragon",
    name: "แดนมังกรฟ้า",
    beast: "มังกรฟ้าสวรรค์",
    place: "โรงละคร",
    dept: "ศิลปะการแสดง",
    roleTitle: "จอมยุทธ์สะกดเวที แสง สี เสียง",
    quote: "ร่ายมนตร์สะกดผู้ชมด้วยบทบาท การแสดงสด และพลังแห่งเวที!",
    perk: "วิชาศาสตร์การละคร แสง สี เสียง และการออกแบบเวทีระดับมืออาชีพ",
    color: "#0284c7",
    borderColor: "#38bdf8",
    image: "/images/azure-dragon-art.jpg",
  },
  {
    key: "white-tiger",
    name: "แดนพยัคฆ์ขาว",
    beast: "พยัคฆ์ขาวคำราม",
    place: "ตึกคณะ",
    dept: "ทัศนศิลป์ & ออกแบบ",
    roleTitle: "จอมยุทธ์พู่กันทอง ปั้นแต่งจินตนาการ",
    quote: "สรรค์สร้างผลงานศิลปะ วาดเส้น จิตรกรรม และประติมากรรมวิจิตร!",
    perk: "วิชาศิลปะภาพวาด วิจิตรศิลป์ จิตรกรรม และประติมากรรมสร้างสรรค์",
    color: "#d97706",
    borderColor: "#fbbf24",
    image: "/images/white-tiger-art.jpg",
  },
  {
    key: "nine-tailed-fox",
    name: "แดนจิ้งจอกเก้าหาง",
    beast: "จิ้งจอกเก้าหางพยากรณ์",
    place: "โรงทอ",
    dept: "ออกแบบพัสตราภรณ์",
    roleTitle: "จอมเวทเส้นใย แฟชั่นร่วมสมัย",
    quote: "ถักทอแฟชั่นล้ำยุค นวัตกรรมสิ่งทอ และการแต่งกายแห่งอนาคต!",
    perk: "วิชานวัตกรรมสิ่งทอ แฟชั่นล้ำยุค และการออกแบบเครื่องแต่งกายระดับสากล",
    color: "#db2777",
    borderColor: "#f472b6",
    image: "/images/nine-tailed-fox-art.jpg",
  },
  {
    key: "red-phoenix",
    name: "แดนวิหคเพลิง",
    beast: "วิหคเพลิงอมตะ",
    place: "ตึก SC3",
    dept: "สื่อสร้างสรรค์ & ดนตรี",
    roleTitle: "จอมทัพประกายไฟ แอนิเมชัน & นวัตกรรม",
    quote: "จุดประกายสื่อดิจิทัล โมชันกราฟิก และเกมสะสมแต้มท้าทายปัญญา!",
    perk: "วิชาดิจิทัลคอนเทนต์ แอนิเมชัน ซาวด์ดีไซน์ และสื่ออินเทอร์แอคทีฟ",
    color: "#dc2626",
    borderColor: "#f87171",
    image: "/images/red-phoenix-art.jpg",
  },
];

export const OpeningExperience: React.FC = () => {
  const [show, setShow] = useState<boolean>(false);
  const [stage, setStage] = useState<number>(0);
  const [selectedRealm, setSelectedRealm] = useState<RealmKey>("azure-dragon");
  const [isAwakening, setIsAwakening] = useState<boolean>(false);
  const [isStamped, setIsStamped] = useState<boolean>(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);

  // Check if first visit
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const hasSeen = sessionStorage.getItem("fatu_story_intro_seen");
    if (!hasSeen) {
      setShow(true);
    }

    // Support replay anywhere in the app
    const handleReplay = () => {
      setStage(0);
      setIsStamped(false);
      setShow(true);
    };

    window.addEventListener("replay_story_intro", handleReplay);
    return () => window.removeEventListener("replay_story_intro", handleReplay);
  }, []);

  // Animate content on stage change using Anime.js v4
  useEffect(() => {
    if (!show || !contentCardRef.current || prefersReducedMotion()) return;

    const scope = createScope({ root: contentCardRef.current }).add(() => {
      animate(contentCardRef.current, {
        opacity: [0.35, 1],
        translateY: [10, 0],
        duration: 360,
        ease: "out(3)",
      });

      const items = contentCardRef.current?.querySelectorAll(".roleplay-stagger-item");
      if (items && items.length > 0) {
        animate(items, {
          opacity: [0, 1],
          translateY: [8, 0],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          delay: (_el: any, i: number) => i * 45 + 30,
          duration: 300,
          ease: "out(3)",
        });
      }
    });

    return () => scope.revert();
  }, [show, stage]);

  const handleClose = () => {
    sessionStorage.setItem("fatu_chosen_realm", selectedRealm);
    sessionStorage.setItem("fatu_story_intro_seen", "true");

    if (overlayRef.current && !prefersReducedMotion()) {
      animate(overlayRef.current, {
        opacity: [1, 0],
        scale: [1, 1.02],
        duration: 300,
        ease: "in(2)",
        onComplete: () => {
          setShow(false);
        },
      });
    } else {
      setShow(false);
    }
  };

  // Stage 0: Tap to Awaken Action
  const handleAwaken = () => {
    setIsAwakening(true);
    if (!prefersReducedMotion()) {
      animate(".awaken-pulse-circle", {
        scale: [1, 1.8],
        opacity: [0.8, 0],
        duration: 650,
        ease: "out(2)",
      });
    }
    setTimeout(() => {
      setIsAwakening(false);
      setStage(1);
    }, 450);
  };

  // Stage 3: Stamp & Enter Action
  const handleStampAndEnter = () => {
    setIsStamped(true);
    sessionStorage.setItem("fatu_chosen_realm", selectedRealm);
    sessionStorage.setItem("fatu_story_intro_seen", "true");

    if (!prefersReducedMotion()) {
      animate(".final-ceremony-stamp", {
        scale: [2.2, 1],
        opacity: [0, 1],
        rotate: [-35, -12],
        duration: 520,
        ease: spring({ bounce: 0.35, duration: 500 }),
      });
    }

    setTimeout(() => {
      handleClose();
    }, 1100);
  };

  if (!show) return null;

  const currentChoice = REALM_CHOICES.find((c) => c.key === selectedRealm) || REALM_CHOICES[0];

  return (
    <div
      ref={overlayRef}
      className="story-intro-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(12, 10, 8, 0.96)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
      }}
    >
      {/* Mobile-First Shell: Always strictly constrained to mobile ratio (max-w-[430px]), perfectly centered */}
      <div
        className="mobile-first-shell"
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100dvh",
          maxHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fcfaf4",
          boxShadow: "0 0 50px rgba(0, 0, 0, 0.75), 0 0 20px rgba(205, 163, 79, 0.3)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top Header Bar: Mission Title & Skip Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "#20140e",
            borderBottom: "1.5px solid rgba(205, 163, 79, 0.4)",
            flexShrink: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-gold-400)", fontSize: 11, fontWeight: 800 }}>
            <Sparkles style={{ width: 14, height: 14, color: "#fef08a" }} />
            <span>ยุทธภพศิลปกรรม · FATU 2026</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => {
                setStage(0);
                setIsStamped(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#d6d3d1",
                fontSize: 10,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                cursor: "pointer",
                padding: "3px 6px",
              }}
              title="เริ่มบทนำใหม่"
            >
              <RotateCcw style={{ width: 12, height: 12 }} />
              <span>เริ่มใหม่</span>
            </button>

            <button
              type="button"
              onClick={handleClose}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(205, 163, 79, 0.4)",
                borderRadius: 16,
                padding: "3px 10px",
                color: "#f5f5f4",
                fontSize: 11,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              <span>ข้าม</span>
              <X style={{ width: 13, height: 13 }} />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* UPPER SECTION: 3D WEBGL REALM SCENE (Prominent 40vh Hero Stage)     */}
        {/* =================================================================== */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "40vh",
            minHeight: 310,
            maxHeight: 380,
            background: "radial-gradient(circle at center, #2e1208 0%, #150904 100%)",
            borderBottom: "2px solid var(--color-gold-500)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {/* Top 3D Overlay Badge */}
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 10,
              right: 10,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(20, 10, 5, 0.8)",
                border: "1px solid rgba(205, 163, 79, 0.5)",
                borderRadius: 14,
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 800,
                color: "#fef08a",
                backdropFilter: "blur(6px)",
              }}
            >
              ✦ แผนผังมิติ ๔ เทวสถาน ✦
            </div>

            <div
              style={{
                background: "rgba(20, 10, 5, 0.8)",
                border: `1px solid ${currentChoice.borderColor}`,
                borderRadius: 14,
                padding: "3px 10px",
                fontSize: 10,
                fontWeight: 800,
                color: currentChoice.color,
                backdropFilter: "blur(6px)",
              }}
            >
              {currentChoice.name}
            </div>
          </div>

          {/* The 3D Canvas Viewport */}
          <MythicRealmScene3D
            stage={stage}
            selectedRealm={selectedRealm}
            onSelectRealm={(key) => setSelectedRealm(key)}
            height="100%"
          />

          {/* Bottom 3D Touch Hint */}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "rgba(20, 10, 5, 0.75)",
                border: "1px solid rgba(205, 163, 79, 0.4)",
                borderRadius: 12,
                padding: "3px 12px",
                fontSize: 9,
                fontWeight: 700,
                color: "#fef3c7",
                backdropFilter: "blur(4px)",
              }}
            >
              👆 แตะหมุนลากมุมกล้อง 3D เพื่อสำรวจยุทธภพ
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* LOWER SECTION: INTERACTIVE ROLEPLAY NARRATIVE & CEREMONY PANEL      */}
        {/* =================================================================== */}
        <div
          ref={contentCardRef}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "12px 14px 10px",
            background: "linear-gradient(180deg, #fdfbf7 0%, #f6f0e4 100%)",
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {/* ACT 0: THE AWAKENING (เสียงเรียกแห่งยุทธภพศิลป์) */}
          {stage === 0 && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--color-gold-700)", letterSpacing: "0.12em" }}>
                    คณะศิลปกรรมศาสตร์ มหาวิทยาลัยธรรมศาสตร์
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: "var(--color-red-950)", margin: "2px 0 3px", lineHeight: 1.25 }}>
                    เจ้า... ผู้มาเยือน จงลืมตาขึ้น!
                  </h2>
                  <p style={{ fontSize: 11, color: "var(--text-dark-secondary)", lineHeight: 1.45, margin: 0 }}>
                    ประตูสวรรค์ ๔ มหาเทวสถานคลายผนึกแล้ว พลังปราณกำลังรอรับศิษย์รุ่นใหม่... เจ้าพร้อมจะก้าวสู่ยุทธภพหรือไม่?
                  </p>
                </div>

                {/* Imperial Decree Parchment Box */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.85)",
                    border: "1.5px dashed var(--color-gold-500)",
                    borderRadius: 12,
                    padding: "8px 10px",
                    textAlign: "left",
                    boxShadow: "0 2px 6px rgba(179, 134, 40, 0.08)",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 800, color: "var(--color-gold-800)", marginBottom: 2 }}>
                    📜 สารจากเจ้าสำนักศิลปกรรมฯ
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dark-main)", lineHeight: 1.45 }}>
                    "ผู้ก้าวเข้ามาต้องเลือกสังกัดดินแดนแห่งโชคชะตา เดินเท้าสะสมแต้ม ณ สถานที่จริง และสลักนามตนลงในใบเบิกทางจอมยุทธ์ เพื่อพิชิตรางวัลสูงสุด!"
                  </div>
                </div>

                {/* 4 Sacred Realms Preview Strip */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-700)" }}>
                    ๔ เทวสถานพยากรณ์ประจำคณะ:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                    {REALM_CHOICES.map((rc) => (
                      <button
                        key={rc.key}
                        type="button"
                        onClick={() => setSelectedRealm(rc.key)}
                        style={{
                          background: selectedRealm === rc.key ? `${rc.color}18` : "#ffffff",
                          border: selectedRealm === rc.key ? `1.5px solid ${rc.color}` : "1px solid rgba(205, 163, 79, 0.3)",
                          borderRadius: 8,
                          padding: "5px 2px",
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div style={{ fontSize: 9, fontWeight: 800, color: rc.color }}>
                          {rc.name.replace("แดน", "")}
                        </div>
                        <div style={{ fontSize: 8, color: "#78716c", marginTop: 1 }}>
                          {rc.place}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3 Core Steps of the Quest */}
                <div style={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "left" }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-700)" }}>
                    ๓ ขั้นตอนเบิกทางสู่ยอดฝีมือ:
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.9)", padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(205, 163, 79, 0.25)" }}>
                      <span style={{ fontSize: 11 }}>🔮</span>
                      <span style={{ fontSize: 10, color: "var(--text-dark-main)" }}><strong>๑. ผูกดวงชะตา:</strong> เลือกแดนประจำตัวเพื่อรับฉายาและวิชา</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.9)", padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(205, 163, 79, 0.25)" }}>
                      <span style={{ fontSize: 11 }}>🧭</span>
                      <span style={{ fontSize: 10, color: "var(--text-dark-main)" }}><strong>๒. ลุยเช็กอินจริง:</strong> สแกน QR ตาม ๔ มหาเทวสถานสะสมแต้ม</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255, 255, 255, 0.9)", padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(205, 163, 79, 0.25)" }}>
                      <span style={{ fontSize: 11 }}>🎁</span>
                      <span style={{ fontSize: 10, color: "var(--text-dark-main)" }}><strong>๓. เสี่ยงโชคสวรรค์:</strong> สุ่มกล่องกาชา 3D ชิง Art Toy สัตว์เทพ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button Section */}
              <div style={{ marginTop: "auto", paddingTop: 8 }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 6, width: "100%" }}>
                  <div
                    className="awaken-pulse-circle"
                    style={{
                      position: "absolute",
                      inset: -6,
                      borderRadius: 18,
                      background: "radial-gradient(circle, rgba(205, 163, 79, 0.75) 0%, transparent 70%)",
                      pointerEvents: "none",
                      opacity: isAwakening ? 1 : 0.45,
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAwaken}
                    className="button-imperial-red"
                    style={{
                      width: "100%",
                      padding: "11px 16px",
                      fontSize: 14,
                      fontWeight: 900,
                      borderRadius: 14,
                      boxShadow: "0 6px 20px rgba(125, 18, 18, 0.45)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Sparkles style={{ width: 17, height: 17 }} />
                    <span>แตะฝ่ามือเพื่อปลุกพลังปราณมังกร!</span>
                  </button>
                </div>

                <div style={{ fontSize: 9, color: "var(--color-gold-700)", fontWeight: 700 }}>
                  ✦ สัมผัสปุ่มเพื่อเริ่มพิธีปลดผนึก ๔ มหาเทวสถาน ✦
                </div>
              </div>
            </div>
          )}

          {/* ACT 1: CHOOSE YOUR AFFINITY (สถิตแดนแห่งโชคชะตา) */}
          {stage === 1 && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-700)", letterSpacing: "0.1em", textAlign: "center" }}>
                    STEP 1: SELECT YOUR REALM AFFINITY
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--color-red-950)", margin: "1px 0 2px", textAlign: "center" }}>
                    เลือกสายวิชา & สังกัดแดนแรก
                  </h3>
                  <p style={{ fontSize: 10, color: "var(--text-dark-secondary)", margin: 0, textAlign: "center" }}>
                    แตะเลือกแดนที่ตรงใจ กล้อง 3D จะบินโฉบไปหน้าพระวิหารทันที!
                  </p>
                </div>

                {/* 4 Interactive Realm Cards (2x2 Grid) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {REALM_CHOICES.map((choice) => {
                    const isSelected = selectedRealm === choice.key;
                    return (
                      <button
                        key={choice.key}
                        type="button"
                        onClick={() => setSelectedRealm(choice.key)}
                        className="roleplay-stagger-item"
                        style={{
                          background: isSelected ? "rgba(125, 18, 18, 0.06)" : "#ffffff",
                          border: isSelected ? `2px solid ${choice.borderColor}` : "1.5px solid var(--border-gold-subtle)",
                          borderRadius: 12,
                          padding: "8px 8px",
                          textAlign: "left",
                          cursor: "pointer",
                          position: "relative",
                          boxShadow: isSelected ? `0 4px 14px ${choice.color}33` : "0 1px 4px rgba(0,0,0,0.02)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {isSelected && (
                          <div
                            style={{
                              position: "absolute",
                              top: 5,
                              right: 5,
                              background: choice.color,
                              borderRadius: "50%",
                              width: 15,
                              height: 15,
                              display: "grid",
                              placeItems: "center",
                              color: "#ffffff",
                            }}
                          >
                            <CheckCircle2 style={{ width: 11, height: 11 }} />
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <img
                            src={choice.image}
                            alt={choice.name}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: `1.5px solid ${choice.borderColor}`,
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--color-red-950)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {choice.name}
                            </div>
                            <div style={{ fontSize: 9, fontWeight: 800, color: choice.color }}>
                              {choice.place}
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: 8, color: "var(--text-dark-muted)", marginTop: 3, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {choice.dept}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Persona Lore Banner */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px dashed var(--color-gold-500)",
                    borderRadius: 10,
                    padding: "7px 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: "0 2px 6px rgba(179, 134, 40, 0.08)",
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: currentChoice.color,
                      display: "grid",
                      placeItems: "center",
                      color: "#ffffff",
                      fontSize: 13,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✦
                  </div>
                  <div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: "var(--color-gold-700)" }}>
                      ฉายาประจำตัวที่ได้รับ:
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 900, color: "var(--color-red-950)" }}>
                      {currentChoice.roleTitle}
                    </div>
                    <div style={{ fontSize: 8, color: "var(--text-dark-muted)", marginTop: 1 }}>
                      "{currentChoice.quote}"
                    </div>
                  </div>
                </div>

                {/* Major Technique Perk Card */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(205, 163, 79, 0.3)",
                    borderRadius: 9,
                    padding: "6px 9px",
                    fontSize: 9,
                    color: "var(--text-dark-secondary)",
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: currentChoice.color }}>วิชาเอกประจำแดน:</strong> {currentChoice.perk}
                  <div style={{ color: "var(--color-gold-800)", marginTop: 2, fontWeight: 700 }}>
                    📍 จุดสแกนหลัก: {currentChoice.place} ({currentChoice.dept})
                  </div>
                </div>
              </div>

              {/* Bottom Nav Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setStage(0)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-dark-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  &lt; ย้อนกลับ
                </button>

                <button
                  type="button"
                  onClick={() => setStage(2)}
                  className="button-imperial-red"
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 800,
                    borderRadius: 12,
                    gap: 5,
                    boxShadow: "0 4px 14px rgba(125, 18, 18, 0.4)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <span>ยืนยันสายวิชา & ไปต่อ</span>
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          )}

          {/* ACT 2: MISSION BRIEFING (กฎแห่งยุทธภพ Open House) */}
          {stage === 2 && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-700)", letterSpacing: "0.1em", textAlign: "center" }}>
                    STEP 2: MISSION RULES & REWARDS
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--color-red-950)", margin: "1px 0 2px", textAlign: "center" }}>
                    บรีฟกฎแห่งยุทธภพ Open House
                  </h3>
                  <p style={{ fontSize: 10, color: "var(--text-dark-secondary)", margin: 0, textAlign: "center" }}>
                    หีบสวรรค์ 3D เปิดออกแล้ว! ภารกิจล่าแต้ม ๓ ประการ:
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <div className="roleplay-stagger-item" style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#ffffff", padding: "7px 10px", borderRadius: 10, border: "1px solid var(--border-gold-subtle)" }}>
                    <Compass style={{ width: 17, height: 17, color: "var(--color-gold-600)", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 900, color: "var(--color-red-950)", fontSize: 11 }}>
                        ๑. ลุยแดนจริงตามแผนที่
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-dark-secondary)", marginTop: 1, lineHeight: 1.35 }}>
                        เดินเท้าไปยังสถานที่จริง เปิดกล้องในเว็บ <strong>สแกน QR ด้วยตนเอง</strong> เพื่อรับแต้ม!
                      </div>
                    </div>
                  </div>

                  <div className="roleplay-stagger-item" style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#ffffff", padding: "7px 10px", borderRadius: 10, border: "1px solid var(--border-gold-subtle)" }}>
                    <Award style={{ width: 17, height: 17, color: "var(--color-red-700)", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 900, color: "var(--color-red-950)", fontSize: 11 }}>
                        ๒. เสี่ยงโชคกล่องสวรรค์ (Lucky Draw)
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-dark-secondary)", marginTop: 1, lineHeight: 1.35 }}>
                        สะสมแต้มครบ ได้สิทธิ์ <strong>สุ่มกาชาเปิดกล่อง 1 ครั้ง</strong> ลุ้นรับ Art Toy สัตว์เทพ
                      </div>
                    </div>
                  </div>

                  <div className="roleplay-stagger-item" style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "#ffffff", padding: "7px 10px", borderRadius: 10, border: "1px solid var(--border-gold-subtle)" }}>
                    <Shield style={{ width: 17, height: 17, color: "var(--color-jade-700)", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <div style={{ fontWeight: 900, color: "var(--color-red-950)", fontSize: 11 }}>
                        ๓. รับตราประทับครบ ๔ แดน
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-dark-secondary)", marginTop: 1, lineHeight: 1.35 }}>
                        นำ <strong>ใบเบิกทางจอมยุทธ์ (通关文牒)</strong> มารับของที่ระลึกจริงที่บูธกลาง มธ.
                      </div>
                    </div>
                  </div>

                  {/* Rewards Showcase Strip */}
                  <div style={{ background: "rgba(255, 255, 255, 0.85)", border: "1px solid rgba(205, 163, 79, 0.35)", borderRadius: 9, padding: "6px 8px" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-800)", marginBottom: 4, textAlign: "center" }}>
                      🎁 ไฮไลต์ของรางวัลลิมิเต็ดในงาน:
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                      <div style={{ background: "#fbf8f1", border: "1px solid rgba(205, 163, 79, 0.2)", borderRadius: 6, padding: "3px 2px", textAlign: "center" }}>
                        <div style={{ fontSize: 11 }}>🎎</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "var(--color-red-950)", marginTop: 1 }}>Art Toy เทพ</div>
                      </div>
                      <div style={{ background: "#fbf8f1", border: "1px solid rgba(205, 163, 79, 0.2)", borderRadius: 6, padding: "3px 2px", textAlign: "center" }}>
                        <div style={{ fontSize: 11 }}>🧵</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "var(--color-red-950)", marginTop: 1 }}>พวงกุญแจผ้า</div>
                      </div>
                      <div style={{ background: "#fbf8f1", border: "1px solid rgba(205, 163, 79, 0.2)", borderRadius: 6, padding: "3px 2px", textAlign: "center" }}>
                        <div style={{ fontSize: 11 }}>✨</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "var(--color-red-950)", marginTop: 1 }}>โฮโลแกรม</div>
                      </div>
                      <div style={{ background: "#fbf8f1", border: "1px solid rgba(205, 163, 79, 0.2)", borderRadius: 6, padding: "3px 2px", textAlign: "center" }}>
                        <div style={{ fontSize: 11 }}>🎨</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "var(--color-red-950)", marginTop: 1 }}>โปสการ์ดศิลป์</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Nav Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setStage(1)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-dark-muted)",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  &lt; ย้อนกลับ
                </button>

                <button
                  type="button"
                  onClick={() => setStage(3)}
                  className="button-imperial-red"
                  style={{
                    padding: "8px 18px",
                    fontSize: 13,
                    fontWeight: 800,
                    borderRadius: 12,
                    gap: 5,
                    boxShadow: "0 4px 14px rgba(125, 18, 18, 0.4)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <span>รับทราบกฎ! เตรียมรับใบเบิกทาง</span>
                  <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          )}

          {/* ACT 3: TRAVEL PASS CEREMONY (พิธีประทับตราใบเบิกทาง) */}
          {stage === 3 && (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%", textAlign: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-700)", letterSpacing: "0.1em" }}>
                    FINAL CEREMONY: CLAIM YOUR PASS
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: "var(--color-red-950)", margin: "1px 0 2px" }}>
                    สลักนามสู่ใบเบิกทางจอมยุทธ์
                  </h3>
                  <p style={{ fontSize: 10, color: "var(--text-dark-secondary)", margin: 0 }}>
                    ใบเบิกทางประทับตราหลวงจะเปิดประตูสู่กิจกรรม เช็กอินสะสมแต้ม และสุ่มกาชากล่องสวรรค์
                  </p>
                </div>

                {/* Travel Pass Preview Certificate */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #fbf8f1 100%)",
                    border: "1.5px solid var(--color-gold-500)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    margin: "0 auto",
                    width: "100%",
                    position: "relative",
                    boxShadow: "0 6px 18px rgba(179, 134, 40, 0.16)",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(205, 163, 79, 0.3)", paddingBottom: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--color-gold-700)" }}>
                      通关文牒 · FATU OPEN HOUSE 2026
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: "var(--color-red-800)" }}>
                      ตราประทับทอง
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <img
                      src={currentChoice.image}
                      alt={currentChoice.name}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: `2px solid ${currentChoice.borderColor}`,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 900, color: "var(--color-red-950)" }}>
                        จอมยุทธ์ผู้มาเยือน
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: currentChoice.color, marginTop: 1 }}>
                        {currentChoice.roleTitle}
                      </div>
                      <div style={{ fontSize: 9, color: "var(--text-dark-muted)", marginTop: 1 }}>
                        สังกัดเริ่มต้น: {currentChoice.name} ({currentChoice.place})
                      </div>
                    </div>
                  </div>

                  {/* 4 Sacred Realm Seal Verification Slots */}
                  <div style={{ borderTop: "1px dashed rgba(205, 163, 79, 0.3)", paddingTop: 5, marginBottom: 5 }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color: "var(--color-gold-800)", marginBottom: 3 }}>
                      ตราประทับผ่านด่าน ๔ มหาเทวสถาน (จุดสแกนจริง):
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
                      {REALM_CHOICES.map((rc) => {
                        const isInit = rc.key === selectedRealm;
                        return (
                          <div
                            key={rc.key}
                            style={{
                              border: isInit ? `1.5px solid ${rc.color}` : "1px dashed #d6d3d1",
                              background: isInit ? `${rc.color}15` : "#fafaf9",
                              borderRadius: 6,
                              padding: "3px 2px",
                              textAlign: "center",
                              fontSize: 8,
                            }}
                          >
                            <div style={{ fontWeight: 800, color: isInit ? rc.color : "#78716c" }}>
                              {rc.name.replace("แดน", "")}
                            </div>
                            <div style={{ fontSize: 7, color: isInit ? rc.color : "#a8a29e", marginTop: 1 }}>
                              {isInit ? "★ สถิตแล้ว" : "○ รอเยือน"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3 Pass Features */}
                  <div style={{ background: "rgba(255, 255, 255, 0.9)", border: "1px solid rgba(205, 163, 79, 0.25)", borderRadius: 7, padding: "5px 7px", fontSize: 9, color: "var(--text-dark-secondary)", lineHeight: 1.35, marginBottom: 5 }}>
                    <div>⚡ <strong>บันทึกตราประทับดิจิทัล:</strong> อัตโนมัติเมื่อสแกน QR หน้างานจริง</div>
                    <div>🎁 <strong>เปิดกล่องสวรรค์ 3D:</strong> สะสมแต้มครบปลดล็อกสิทธิ์สุ่มกาชาทันที</div>
                  </div>

                  {/* Starter Mission Directive */}
                  <div style={{ background: "rgba(125, 18, 18, 0.05)", border: "1px solid rgba(125, 18, 18, 0.15)", borderRadius: 7, padding: "5px 7px", fontSize: 9, color: "var(--color-red-950)", lineHeight: 1.35 }}>
                    <strong>⚔️ ภารกิจแรก:</strong> เดินทางสู่ <strong>{currentChoice.place} ({currentChoice.name})</strong> สแกน QR ประจำจุดเพื่อรับแต้มแรกและเปิดกล่องสวรรค์!
                  </div>

                  {/* Final Ceremony Vermilion Stamp */}
                  {isStamped && (
                    <div
                      className="final-ceremony-stamp"
                      style={{
                        position: "absolute",
                        right: 10,
                        bottom: 8,
                        width: 58,
                        height: 58,
                        border: "3px solid #b91c1c",
                        borderRadius: 8,
                        color: "#b91c1c",
                        display: "grid",
                        placeItems: "center",
                        fontWeight: 900,
                        fontSize: 9,
                        textAlign: "center",
                        transform: "rotate(-12deg)",
                        background: "rgba(185, 28, 28, 0.12)",
                        boxShadow: "0 0 16px rgba(185, 28, 28, 0.25)",
                      }}
                    >
                      ประทับตรา
                      <br />
                      ๒๕๖๙
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button Section */}
              <div style={{ marginTop: "auto", paddingTop: 4 }}>
                <button
                  type="button"
                  onClick={handleStampAndEnter}
                  className="button-imperial-red"
                  style={{
                    width: "100%",
                    padding: "11px",
                    fontSize: 14,
                    fontWeight: 900,
                    borderRadius: 14,
                    boxShadow: "0 6px 18px rgba(125, 18, 18, 0.45)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <span>ประทับตรา & ก้าวสู่ยุทธภพ!</span>
                  <ArrowRight style={{ width: 18, height: 18 }} />
                </button>
              </div>
            </div>
          )}

          {/* Footer Navigation Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6, paddingTop: 4, borderTop: "1px solid rgba(205, 163, 79, 0.2)" }}>
            {[0, 1, 2, 3].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => setStage(step)}
                style={{
                  width: step === stage ? 22 : 7,
                  height: 5,
                  borderRadius: 3,
                  background: step === stage ? "var(--color-red-900)" : "rgba(205, 163, 79, 0.35)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                }}
                aria-label={`Act ${step + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
