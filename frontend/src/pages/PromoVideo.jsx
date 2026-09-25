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
import promoAudios from '../data/promoAudios.json';

const SCENES = [
  {
    id: 0,
    title: 'سنو اسٹوڈنٹس!',
    engTitle: 'STUDENTS REAL EARNING',
    subtitle: 'گھر بیٹھے روزانہ ریل کیش کمائیں۔ پاکستان کا نمبر ون پلیٹ فارم!',
    badge: '100% Real & Verified',
    icon: '🎓💸',
    bgGradient: 'from-emerald-50 via-teal-50 to-amber-50',
    borderColor: 'border-emerald-300',
    subUrdu: 'سنو اسٹوڈنٹس! گھر بیٹھے روزانہ ریل کیش کمائیں۔',
    subEng: 'Listen Students! Earn real daily cash from home.'
  },
  {
    id: 1,
    title: 'ہر انوائٹ پر 50% بونس!',
    engTitle: '50% DIRECT CASH REWARD',
    subtitle: 'ہر دوست کو بلانے پر آدھا پیسہ آپ کا سیدھا منافع',
    badge: '🔥 50% Referral Bonus',
    icon: '🎁50%',
    bgGradient: 'from-amber-50 via-orange-50 to-emerald-50',
    borderColor: 'border-amber-300',
    subUrdu: 'ہر انوائٹ پر سیدھا پچاس پرسنٹ ریفرل بونس حاصل کریں!',
    subEng: 'Get direct 50% referral cash on every single invite!'
  },
  {
    id: 2,
    title: '5 دنوں میں پورا پیسہ واپس!',
    engTitle: '5 DAYS FULL RETURN',
    subtitle: 'صرف 5 دن میں سرمایہ واپس، پھر 50 دن تک روزانہ صرف منافع ہی منافع',
    badge: '⚡ Fast 5-Day Recovery',
    icon: '⚡💰⚡',
    bgGradient: 'from-emerald-50 via-cyan-50 to-emerald-100',
    borderColor: 'border-emerald-400',
    subUrdu: 'صرف 5 دنوں میں رقم واپس، پھر 50 دن تک روزانہ منافع ہی منافع!',
    subEng: 'Full capital recovery in 5 days, then daily pure profit!'
  },
  {
    id: 3,
    title: 'ایزی پیسہ اور جاز کیش ودڈرا',
    engTitle: 'EASYPAISA & JAZZCASH',
    subtitle: 'آپ کے اپنے موبائل اکاؤنٹ میں فوری ٹرانسفر',
    badge: '📲 Instant Direct Cashout',
    icon: '📱💵',
    bgGradient: 'from-teal-50 via-emerald-50 to-green-50',
    borderColor: 'border-teal-300',
    subUrdu: 'پیسہ سیدھا اپنے ایزی پیسہ اور جاز کیش میں حاصل کریں۔',
    subEng: 'Fast payout directly into your mobile wallet.'
  },
  {
    id: 4,
    title: 'آج ہی رابطہ کریں!',
    engTitle: 'OFFICIAL WHATSAPP SUPPORT',
    subtitle: 'آفیشل واٹس ایپ: 03218956397',
    badge: '🚀 WhatsApp: 03218956397',
    icon: '🚀📞',
    bgGradient: 'from-emerald-50 via-teal-50 to-slate-50',
    borderColor: 'border-emerald-400',
    subUrdu: 'ابھی واٹس ایپ 03218956397 پر رابطہ کریں اور ارننگ شروع کریں!',
    subEng: 'Contact WhatsApp 03218956397 right now!'
  }
];

const PromoVideo = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
  };

  const playSceneAudio = (sceneIdx) => {
    stopAudio();
    if (!voiceEnabled) return;

    const audio = new Audio(promoAudios[sceneIdx]);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setProgress(100);
      if (sceneIdx < SCENES.length - 1) {
        setCurrentScene(sceneIdx + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (isPlaying) {
      playSceneAudio(currentScene);
    } else {
      stopAudio();
    }
    return () => {
      stopAudio();
    };
  }, [isPlaying, currentScene]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const restart = () => {
    stopAudio();
    setIsPlaying(false);
    setCurrentScene(0);
    setProgress(0);
    setTimeout(() => {
      setIsPlaying(true);
    }, 150);
  };

  const scene = SCENES[currentScene];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <PageHeader
        title="Promotional Video Reel"
        subtitle="Soft modern promotional video reel with real human Urdu voiceover"
        backTo="/dashboard"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Mobile Phone Reel Frame (9:16 Aspect Ratio Player) */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-full max-w-[340px] rounded-[36px] p-3 bg-white border-4 border-slate-200 shadow-2xl relative overflow-hidden">
            {/* Phone Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-200 rounded-full z-20" />

            {/* Inner Phone Screen (Soft Light Aesthetic) */}
            <div className={`w-full aspect-[9/15] rounded-[28px] bg-gradient-to-b ${scene.bgGradient} p-4 flex flex-col justify-between relative overflow-hidden text-slate-900 border ${scene.borderColor} transition-colors duration-500`}>
              
              {/* Top Reel Progress Bars */}
              <div className="flex gap-1 pt-3 z-10">
                {SCENES.map((s, idx) => (
                  <div
                    key={s.id}
                    className="flex-1 h-1 rounded-full bg-emerald-200/60 overflow-hidden"
                  >
                    <div
                      className="h-full bg-emerald-600 transition-all"
                      style={{
                        width:
                          idx < currentScene
                            ? '100%'
                            : idx === currentScene
                            ? `${progress}%`
                            : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Scene Badge Header */}
              <div className="flex items-center justify-between pt-2 z-10">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 backdrop-blur-sm shadow-2xs">
                  {scene.badge}
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {currentScene + 1} / {SCENES.length}
                </span>
              </div>

              {/* Dynamic Center Stage Content */}
              <div className="my-auto z-10 text-center space-y-2 py-4">
                <div className="text-5xl filter drop-shadow-sm animate-bounce mb-2">
                  {scene.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 leading-snug" style={{ direction: 'rtl' }}>
                  {scene.title}
                </h4>
                <p className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wide">
                  {scene.engTitle}
                </p>
                <p className="text-xs font-medium text-slate-600 max-w-xs mx-auto leading-relaxed" style={{ direction: 'rtl' }}>
                  {scene.subtitle}
                </p>
              </div>

              {/* Human Voice Subtitles Bar */}
              <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-emerald-100 shadow-sm text-center space-y-1 z-10">
                <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-700 font-black uppercase tracking-wide">
                  <Volume2 className="w-3 h-3 animate-pulse text-emerald-600" />
                  <span>Real Urdu Human Voice 🎙️</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug" style={{ direction: 'rtl' }}>
                  "{scene.subUrdu}"
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
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause Video' : 'Play With Human Voice'}</span>
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

            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <a
                href="https://api.whatsapp.com/send?phone=923218956397&text=Assalam-o-Alaikum!%20Mujhe%20Student%20Earning%20App%20k%20bare%20me%20guide%20karein"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-black flex items-center justify-center gap-1.5 transition-all"
              >
                <span>💬</span> WhatsApp: 0321-8956397
              </a>
              <div className="py-2.5 px-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-black flex items-center justify-center gap-1.5">
                <span>⚡</span> 50% Direct Referral
              </div>
            </div>
          </div>

          {/* Scene Playlist */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Select Scene</h4>
            <div className="space-y-2">
              {SCENES.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentScene(idx);
                    setProgress(0);
                    if (!isPlaying) setIsPlaying(true);
                  }}
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
                    {idx === currentScene ? 'Playing' : 'Jump'}
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
