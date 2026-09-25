import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  TrendingUp,
  Gift,
  ShieldCheck,
  Zap,
  ArrowRight,
  PhoneCall
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SCENES = [
  {
    id: 1,
    title: 'Student Earning Hub',
    subtitle: 'Pakistan Ka #1 Earning Platform',
    voiceText: 'Kya aap student hain aur apne mobile se daily pocket money kamana chahte hain? Welcome to Student Invest Hub! Account banate hi payein one fifty rupees free signup bonus!',
    badge: '🚀 OFFICIAL LAUNCH',
    icon: TrendingUp,
    bgGradient: 'from-emerald-950 via-slate-900 to-emerald-900',
    content: (
      <div className="text-center space-y-3 py-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
          <TrendingUp className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          STUDENT <span className="text-emerald-400">INVEST</span> HUB
        </h2>
        <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
          Daily cash profits, direct mobile wallet payouts, and instant referral bonuses.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>🎁 Rs. 150 Free Signup Bonus</span>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: 'Daily Guaranteed Returns',
    subtitle: 'Earn Every 24 Hours for 50 Days',
    voiceText: 'Bronze plan par do sau rupay daily, Silver par char sau rupay, aur Gold plan par aath sau rupay daily profit hasil karein.',
    badge: '💎 HIGH PROFIT PLANS',
    icon: Zap,
    bgGradient: 'from-slate-950 via-emerald-950 to-slate-900',
    content: (
      <div className="space-y-2 py-3 animate-in fade-in slide-in-from-right duration-500">
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-emerald-400 font-bold uppercase block">Bronze Plan (Rs. 1,000)</span>
            <span className="text-base font-black text-white">Rs. 200 / Day</span>
          </div>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg">
            Total Rs. 10,000
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-amber-400 font-bold uppercase block">Silver Plan (Rs. 2,500)</span>
            <span className="text-base font-black text-white">Rs. 400 / Day</span>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-1 rounded-lg">
            Total Rs. 20,000
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] text-teal-400 font-bold uppercase block">Gold Plan (Rs. 5,000)</span>
            <span className="text-base font-black text-white">Rs. 800 / Day</span>
          </div>
          <span className="text-xs font-bold text-teal-300 bg-teal-500/20 px-2 py-1 rounded-lg">
            Total Rs. 40,000
          </span>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: '50% Instant Referral Bonus',
    subtitle: 'Har Friend Ke Invite Par 50% Cash',
    voiceText: 'Aur sab se zabardast offer! Har ek friend ko invite karne par payein direct 50 percent cash commission instant apne wallet mein!',
    badge: '🔥 50% DIRECT CASH',
    icon: Gift,
    bgGradient: 'from-amber-950 via-slate-900 to-emerald-950',
    content: (
      <div className="space-y-3 py-4 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Gift className="w-10 h-10 text-amber-400" />
        </div>
        <div className="space-y-1">
          <span className="text-3xl font-black text-amber-400 block tracking-wider drop-shadow-md">
            50% BONUS
          </span>
          <h4 className="text-sm font-bold text-white">
            Har Ek Invite Par 50% Direct Cash!
          </h4>
        </div>
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200">
          Dost ke plan buy karte hi 50% commission instant aapke account mein transfer ho jayega!
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: 'Fast EasyPaisa & JazzCash',
    subtitle: '15-Minute Direct Cashouts',
    voiceText: 'Apna daily profit aur referral commission direct EasyPaisa aur JazzCash mein sirf pandrah minute mein withdraw karein.',
    badge: '⚡ 15-MIN CASHOUTS',
    icon: ShieldCheck,
    bgGradient: 'from-emerald-950 via-slate-900 to-teal-950',
    content: (
      <div className="space-y-3 py-4 text-center animate-in fade-in slide-in-from-right duration-500">
        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-xs">
            🟢 EasyPaisa
          </div>
          <div className="px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs">
            🟠 JazzCash
          </div>
        </div>
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 space-y-1">
          <p className="font-bold text-white text-sm">Minimum Cashout: Rs. 500 Only</p>
          <p className="text-slate-400 text-[11px]">Instant manual TID verification and direct payment transfer.</p>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: 'WhatsApp Help & Register',
    subtitle: 'WhatsApp: 0321-8956397',
    voiceText: 'Kisi bhi help ya information ke liye hamare WhatsApp number 0321-8956397 par abhi message karein aur aaj hi register karein!',
    badge: '📲 24/7 SUPPORT',
    icon: PhoneCall,
    bgGradient: 'from-emerald-900 via-slate-950 to-emerald-900',
    content: (
      <div className="text-center space-y-3 py-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-3 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/40 text-white space-y-1">
          <span className="text-[10px] text-emerald-300 uppercase font-bold block">Official Helpline</span>
          <span className="text-xl font-black text-emerald-400 block font-mono">0321-8956397</span>
        </div>
        <p className="text-[11px] text-slate-300">
          Abhi join karein aur daily mobile earning start karein!
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 py-3 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl shadow-emerald-500/30 transition-transform active:scale-95"
        >
          <span>Create Free Account Now</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
    )
  }
];

const PromoVideo = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const timerRef = useRef(null);

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const playScene = (index) => {
    setCurrentScene(index);
    speakText(SCENES[index].voiceText);
  };

  useEffect(() => {
    if (isPlaying) {
      speakText(SCENES[currentScene].voiceText);
      timerRef.current = setTimeout(() => {
        if (currentScene < SCENES.length - 1) {
          setCurrentScene((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 7000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentScene]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    setIsPlaying(false);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setCurrentScene(0);
    setTimeout(() => {
      setIsPlaying(true);
    }, 200);
  };

  const scene = SCENES[currentScene];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <PageHeader
        title="Promotional Video Studio"
        subtitle="Animated marketing reel player with Urdu voiceover for social media promotion"
        backTo="/dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Mobile Phone Reel Frame (9:16 Aspect Ratio Player) */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-full max-w-[340px] rounded-[36px] p-3 bg-slate-900 border-4 border-slate-700 shadow-2xl shadow-emerald-950/40 relative overflow-hidden">
            {/* Phone Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-950 rounded-full z-20" />

            {/* Inner Phone Screen */}
            <div className={`w-full aspect-[9/16] rounded-[28px] bg-gradient-to-b ${scene.bgGradient} p-4 flex flex-col justify-between relative overflow-hidden text-white border border-white/10 transition-colors duration-700`}>
              {/* Top Reel Progress Bars */}
              <div className="flex gap-1 pt-3 z-10">
                {SCENES.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden"
                  >
                    <div
                      className={`h-full bg-emerald-400 transition-all ${
                        idx < currentScene
                          ? 'w-full'
                          : idx === currentScene && isPlaying
                          ? 'w-full duration-[7000ms] ease-linear'
                          : 'w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Scene Badge Header */}
              <div className="flex items-center justify-between pt-2 z-10">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-sm">
                  {scene.badge}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {currentScene + 1} / {SCENES.length}
                </span>
              </div>

              {/* Dynamic Center Stage Content */}
              <div className="my-auto z-10">
                <div className="text-center mb-2">
                  <h4 className="text-lg font-black text-white drop-shadow-sm">{scene.title}</h4>
                  <p className="text-[11px] text-emerald-300 font-semibold">{scene.subtitle}</p>
                </div>
                {scene.content}
              </div>

              {/* Voice Subtitles Bar */}
              <div className="bg-slate-950/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center space-y-1 z-10">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  <span>Urdu Voice Narration</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-snug font-medium italic">
                  "{scene.voiceText}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Controls & Scene Navigator */}
        <div className="md:col-span-6 space-y-4">
          {/* Main Control Panel */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm">Video Player Controls</h3>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause Animation' : 'Play Video Reel'}</span>
              </button>
              <button
                onClick={restart}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-3 rounded-xl border transition-colors ${
                  voiceEnabled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
                title={voiceEnabled ? 'Mute Voice' : 'Enable Voice'}
              >
                {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              💡 <strong>Tip for Social Media</strong>: Mobile par screen recording on karein aur <strong>"Play Video Reel"</strong> dabayein. Ye video automatically Urdu voice ke sath play hogi jise aap direct WhatsApp Status, TikTok, ya Reels par upload kar sakte hain!
            </p>
          </div>

          {/* Scene Playlist */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Jump to Scene</h4>
            <div className="space-y-2">
              {SCENES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => playScene(idx)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    currentScene === idx
                      ? 'bg-emerald-50 border-emerald-500 shadow-2xs font-bold ring-1 ring-emerald-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${currentScene === idx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs text-slate-900 font-bold">{s.title}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{s.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {idx === currentScene ? 'Active' : 'Preview'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoVideo;
