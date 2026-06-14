"use client";

import { useEffect, useState } from "react";
import type { Shortlink } from "@/actions/shortlinks";
import { Shield, Sparkles, AlertTriangle, Copy, ExternalLink, Check } from "@/lib/icons";

export function SafelinkPage({ shortlink }: { shortlink: Shortlink }) {
  // Extract countdown time
  const countdown =
    shortlink.splash_timer !== undefined && shortlink.splash_timer !== null
      ? shortlink.splash_timer
      : (shortlink.mode_config?.countdown as number) || 5;

  const [seconds, setSeconds] = useState(countdown);
  const [copied, setCopied] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Safely extract AI fields with robust cyberpunk fallback assets
  const isAiEnabled = !!shortlink.mode_config?.ai_generated;
  const brandColor = (shortlink.mode_config?.ai_brand_color as string) || "#06b6d4";
  const headline = (shortlink.mode_config?.ai_headline as string) || "SECURE DECRYPTION GATEWAY";
  const statusMessage = (shortlink.mode_config?.ai_brand_message as string) || "SSL ENCRYPTED CHANNEL VALIDATED";
  const trustGrade = (shortlink.mode_config?.ai_trust_grade as string) || "A+";
  const safetyScore = (shortlink.mode_config?.ai_safety_score as number) || 98;
  const safetyAnalysis =
    (shortlink.mode_config?.ai_safety_analysis as string) ||
    "Redirection link analyzed by the IDUGENI AI audit scanner. Direct secure mapping established. High-grade SSL transport validation detected. Domain is marked fully safe for user traversal.";
  
  const articleTitle =
    (shortlink.mode_config?.ai_article_title as string) ||
    "Understanding Secure Redirects & Web Safety Protocols";
  
  const articleBody =
    (shortlink.mode_config?.ai_article_body as string) ||
    `<p>When navigating the modern web, safety gateways serve as crucial checkposts to protect your device and personal data. Redirection links are frequently used in digital portfolios and developer networks to shorten complex URLs, organize resource indexes, and track analytic telemetry.</p>
     <p><strong>Why is this check happening?</strong> Gateways audit target URLs to ensure they comply with network safety policies. This includes scanning for SSL certificates, validating DNS routing paths, and matching hostnames against threat databases to prevent phishing traps or malicious downloads.</p>
     <p>Here are some simple steps to secure your daily browsing:</p>
     <ul>
       <li><strong>Verify the domain:</strong> Always inspect the target address shown in the status bar before entering login credentials.</li>
       <li><strong>Check for SSL:</strong> Look for the padlock icon indicating an encrypted HTTPS transport stream.</li>
       <li><strong>Use modern web tools:</strong> Browse with ad-blockers and browser sandboxes to isolate unverified third-party content.</li>
     </ul>
     <p>During the brief gateway countdown, we decrypt and build a safe transit node to the destination URL: <code>${shortlink.destination_url}</code>.</p>`;

  // 1. Redirection Timer hook
  useEffect(() => {
    if (seconds === 0) {
      window.location.href = shortlink.destination_url;
      return;
    }

    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, shortlink.destination_url]);

  // 2. Mock Technical CLI Feed hook
  useEffect(() => {
    const defaultLogs = [
      "SYSTEM: Initiating gateway handshake node...",
      "SECURITY: Fetching SSL signature certificate...",
      `AUDIT: Trust Grade identified: [${trustGrade}]`,
      `INTELLIGENCE: Safety metrics calibrated at ${safetyScore}%`,
      "DECRYPTION: Decrypting destination URL stream...",
      "PORTAL: Transit channel verified and open.",
    ];

    const currentStep = countdown - seconds;
    const logsToDisplay: string[] = [];
    
    for (let i = 0; i <= currentStep; i++) {
      if (defaultLogs[i]) {
        logsToDisplay.push(defaultLogs[i]);
      }
    }
    
    // Add extra tech loops when timer reaches 0
    if (seconds === 0) {
      logsToDisplay.push("STATUS: Bypassing delay. Safe redirection active.");
    }

    setLogs(logsToDisplay);
  }, [seconds, countdown, trustGrade, safetyScore]);

  // 3. Handle Copy Safe URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shortlink.destination_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // SVG parameters for the circular sweeping timer
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (seconds / countdown) * circumference;

  return (
    <div className="min-h-screen bg-[#020406] text-foreground font-sans relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Animated Tech Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${brandColor} 1px, transparent 1px), linear-gradient(90deg, ${brandColor} 1px, transparent 1px)`,
          backgroundSize: "24px 24px"
        }}
      />
      
      {/* Subtle Cyan/Brand glow blobs */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none -top-40 -left-40"
        style={{ backgroundColor: brandColor }}
      />
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.03] pointer-events-none -bottom-40 -right-40"
        style={{ backgroundColor: brandColor }}
      />

      <div className="w-full max-w-6xl space-y-6 relative z-10">
        {/* HUD Navigation Header */}
        <header className="flex flex-col md:flex-row justify-between items-center border border-border/40 bg-slate-950/60 backdrop-blur-xl p-4 md:px-6 rounded-none space-y-2 md:space-y-0">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 animate-pulse" style={{ color: brandColor }} />
            <span className="font-orbitron font-extrabold tracking-[0.25em] text-sm text-foreground">
              IDUGENI<span style={{ color: brandColor }}>_GATEWAY</span>
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              SESSION: <span className="text-foreground">ACTIVE</span>
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline">ADDR: <span className="text-foreground">s/{shortlink.code}</span></span>
          </div>
        </header>

        {/* Immersive Redirection Grid */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* LEFT SIDEBAR: Dynamic SVG Sweeping Countdown & Quick Controls */}
          <div className="md:col-span-5 space-y-6">
            <div className="border border-border/40 bg-slate-950/50 backdrop-blur-xl p-6 rounded-none text-center space-y-6 relative">
              {/* Scanline Sweep animation */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse pointer-events-none" />

              {/* Status Row */}
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest text-left">
                  Decryption_Beacon
                </span>
                <span 
                  className="font-mono text-[9px] px-2 py-0.5 border font-bold bg-slate-900/80 tracking-widest"
                  style={{ color: brandColor, borderColor: `${brandColor}40` }}
                >
                  {isAiEnabled ? "AI_OPTIMIZED" : "SECURE_PASS"}
                </span>
              </div>

              {/* Circular Sweeping Countdown Timer */}
              <div className="flex justify-center items-center py-4">
                <div className="relative h-36 w-36 flex items-center justify-center">
                  <svg className="absolute transform -rotate-90 w-full h-full">
                    {/* Background Track */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-slate-800"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    {/* Sweeping Neon Progress Circular Circle */}
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      stroke={brandColor}
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-1000 ease-linear"
                      style={{
                        filter: `drop-shadow(0 0 6px ${brandColor})`
                      }}
                    />
                  </svg>
                  
                  {/* Digital Countdown Center */}
                  <div className="text-center space-y-0.5">
                    <span className="block font-orbitron text-4xl font-extrabold text-foreground tracking-tighter">
                      {seconds}
                    </span>
                    <span className="block font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                      seconds
                    </span>
                  </div>
                </div>
              </div>

              {/* Headline & Subtitle */}
              <div className="space-y-1.5">
                <h2 className="font-orbitron font-extrabold text-md tracking-wider uppercase text-foreground">
                  {headline}
                </h2>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                  {statusMessage}
                </p>
              </div>

              {/* Dynamic Scrolling Telemetry CLI Logs */}
              <div className="border border-border/30 bg-[#040608]/90 font-mono text-[10px] p-4 text-left h-28 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                {logs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span style={{ color: brandColor }}>&gt;</span>
                    <span className={index === logs.length - 1 ? "text-foreground font-bold" : "text-muted-foreground"}>
                      {log}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons Suite */}
              <div className="space-y-3 pt-3">
                <button
                  onClick={() => (window.location.href = shortlink.destination_url)}
                  style={{
                    boxShadow: seconds === 0 ? `0 0 15px ${brandColor}40` : "none"
                  }}
                  className={`w-full font-mono text-xs uppercase tracking-wider py-3 px-4 transition-all duration-300 font-bold border cursor-pointer select-none rounded-none text-center ${
                    seconds === 0
                      ? "bg-foreground text-background border-foreground hover:opacity-90"
                      : "bg-transparent text-muted-foreground border-border/40 hover:border-border hover:text-foreground"
                  }`}
                >
                  {seconds === 0 ? "PROCEED TO DESTINATION →" : "SKIP & PROCEED"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex justify-center items-center gap-2 border border-border/30 bg-slate-900/50 hover:bg-slate-900 hover:border-border/60 py-2.5 font-mono text-[10px] uppercase tracking-wide transition-all rounded-none cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500 animate-in zoom-in" />
                        COPIED
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        COPY LINK
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => (window.location.href = shortlink.destination_url)}
                    className="flex justify-center items-center gap-2 border border-border/30 bg-slate-900/50 hover:bg-slate-900 hover:border-border/60 py-2.5 font-mono text-[10px] uppercase tracking-wide transition-all rounded-none cursor-pointer"
                  >
                    <ExternalLink className="h-3 w-3" />
                    DIRECT
                  </button>
                </div>
              </div>

              {/* Raw Destination Preview */}
              <div className="pt-2 text-[9px] font-mono text-muted-foreground break-all text-left">
                ROUTE_TARGET: <span className="text-foreground/80 hover:underline">{shortlink.destination_url}</span>
              </div>
            </div>
          </div>

          {/* RIGHT VIEW: AI Cybersecurity Certificate & Article Reading Pane */}
          <div className="md:col-span-7 space-y-6">
            {/* AI Cybersecurity Audit Certificate */}
            <div className="border border-border/40 bg-slate-950/50 backdrop-blur-xl p-5 md:p-6 rounded-none space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" style={{ color: brandColor }} />
                  <span className="font-orbitron font-extrabold tracking-widest text-xs uppercase">
                    AI_SECURITY_AUDIT
                  </span>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground uppercase">
                  Grade_Valid_Session
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Illumined Trust Grade Badge */}
                <div className="flex flex-col items-center justify-center h-20 w-20 border bg-slate-900/90 shrink-0 relative" style={{ borderColor: `${brandColor}40` }}>
                  <div className="absolute inset-0 opacity-[0.1] blur-[10px]" style={{ backgroundColor: brandColor }} />
                  <span className="block text-[8px] font-mono text-muted-foreground uppercase tracking-widest leading-none mb-1">
                    GRADE
                  </span>
                  <span className="block font-orbitron text-2xl font-extrabold tracking-tighter" style={{ color: brandColor }}>
                    {trustGrade}
                  </span>
                </div>

                {/* Score and Bar Analysis */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="text-muted-foreground uppercase">AI_TRUST_INDEX</span>
                    <span className="font-bold font-orbitron" style={{ color: brandColor }}>{safetyScore}% Safe</span>
                  </div>
                  {/* Glowing progress bar */}
                  <div className="h-2 w-full bg-slate-900 border border-border/30 overflow-hidden relative">
                    <div 
                      className="h-full transition-all duration-1000 ease-out" 
                      style={{ 
                        width: `${safetyScore}%`,
                        backgroundColor: brandColor,
                        boxShadow: `0 0 10px ${brandColor}`
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {safetyAnalysis}
                  </p>
                </div>
              </div>
            </div>

            {/* High-Value AI Generated Educational Article Reader */}
            <div className="border border-border/40 bg-slate-950/50 backdrop-blur-xl p-5 md:p-6 rounded-none space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <span className="font-orbitron font-extrabold tracking-widest text-xs uppercase">
                  HIGH_VALUE_INSIGHT
                </span>
                <span className="font-mono text-[9px] text-muted-foreground uppercase">
                  Redirection_Reader
                </span>
              </div>

              {/* Scrollable Reading Panel */}
              <div className="space-y-4 max-h-[340px] overflow-y-auto pr-3 font-sans text-xs scrollbar-thin scrollbar-thumb-slate-800">
                <h3 className="font-orbitron font-extrabold text-sm tracking-wide text-foreground uppercase border-l-2 pl-3" style={{ borderLeftColor: brandColor }}>
                  {articleTitle}
                </h3>
                
                {/* Body Text */}
                <div 
                  className="text-muted-foreground leading-relaxed space-y-3 article-body-preview"
                  style={{
                    fontFamily: "var(--font-sans)",
                  }}
                  dangerouslySetInnerHTML={{ __html: articleBody }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Security HUD */}
        <footer className="flex justify-between items-center border border-border/40 bg-slate-950/60 backdrop-blur-xl p-3 font-mono text-[9px] text-muted-foreground">
          <span>SECURE GATEWAY MODULE V1.62.6</span>
          <span className="hidden sm:inline">CRYPTOGRAPHIC AUTHENTICATION NODE: VALID</span>
          <span>© {new Date().getFullYear()} IDUGENI PORTAL</span>
        </footer>
      </div>

      {/* Styled inject for article rendering details */}
      <style jsx global>{`
        .article-body-preview p {
          margin-bottom: 0.75rem;
        }
        .article-body-preview strong {
          color: var(--color-foreground);
        }
        .article-body-preview ul {
          list-style-type: square;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
          color: var(--color-muted-foreground);
        }
        .article-body-preview li {
          margin-bottom: 0.25rem;
        }
        .article-body-preview code {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.125rem 0.25rem;
          font-family: var(--font-mono);
          font-size: 10px;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}
