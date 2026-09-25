import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  TrendingUp,
  Gift,
  ShieldCheck,
  Zap,
  ArrowRight,
  PhoneCall,
  Globe,
  GraduationCap,
  Crown,
  ListOrdered
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import allPromoAudios from '../data/allPromoAudios.json';

const STYLES_DATA = {
  style_website: {
    id: 'style_website',
    name: 'Website Showcase',
    icon: Globe,
    voiceDesc: '🎙️ Male Voice (Asad)',
    scenes: [
      {
        badge: '🌐 Official Website Live',
        title: 'آن لائن ارننگ ویب سائٹ',
        eng: 'OFFICIAL WEBSITE LAUNCHED',
        desc: 'پاکستان کا سب سے محفوظ اور تصدیق شدہ اسٹوڈنٹ پلیٹ فارم',
        icon: '💻✨',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-white/95 rounded-xl p-2.5 border border-slate-200 shadow-sm text-left my-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 border-b pb-1">
              <span>studentinvest.pk</span>
              <span className="text-emerald-600 font-bold">🟢 Live Platform</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-700 font-bold">Wallet Balance:</span>
              <span className="text-sm font-black text-emerald-700">Rs. 4,500</span>
            </div>
          </div>
        ),
        subUrdu: 'سنو اسٹوڈنٹس! پاکستان کی سب سے بہترین اور بھروسہ مند ارننگ ویب سائٹ لائیو ہو چکی ہے۔',
        subEng: "Pakistan's premier student earning website is now live!"
      },
      {
        badge: '📈 Daily Auto Profit',
        title: 'روزانہ منافع اور بونس',
        eng: 'DAILY AUTOMATIC INCOME',
        desc: 'ہر 24 گھنٹے بعد منافع سیدھا آپ کے اکاؤنٹ میں',
        icon: '📊💰',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 shadow-sm text-left my-2 space-y-1.5">
            <div className="flex justify-between text-[11px] font-bold text-slate-800">
              <span>Daily Profit:</span>
              <span className="text-emerald-700 font-black">+ Rs. 800 / Day</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-full w-4/5" />
            </div>
          </div>
        ),
        subUrdu: 'ویب سائٹ پر رجسٹر ہوتے ہی آپ کو ڈیلی ارننگ اور فوری منافع ملنا شروع ہو جاتا ہے۔',
        subEng: 'Instant daily profits credited right after registering.'
      },
      {
        badge: '🔥 50% Direct Referral',
        title: 'ہر انوائٹ پر 50% کیش!',
        eng: '50% INSTANT CASH PER INVITE',
        desc: 'ہر دوست کو لائیں اور 50% ریفرل کمیشن اپنے اکاؤنٹ میں پائیں',
        icon: '🎁50%',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-amber-50 rounded-xl p-2.5 border border-amber-300 shadow-sm text-center my-2">
            <span className="text-[11px] font-black text-amber-800 uppercase block">50% Referral Commission</span>
            <span className="text-base font-black text-slate-900 font-mono">Rs. 1,250 / Friend</span>
          </div>
        ),
        subUrdu: 'ہر انوائٹ پر سیدھا پچاس پرسنٹ ریفرل بونس اپنے اکاؤنٹ میں حاصل کریں۔',
        subEng: 'Earn direct 50% cash commission on every single friend.'
      },
      {
        badge: '⚡ 5 Days Capital Recovery',
        title: '5 دن میں رقم واپس!',
        eng: 'EASYPAISA & JAZZCASH',
        desc: 'پھر 50 دن تک روزانہ منافع اور فوری ودڈرا',
        icon: '📲💵',
        mockup: (
          <div className="flex items-center justify-center gap-2 my-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">🟢 EasyPaisa</span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">🟠 JazzCash</span>
          </div>
        ),
        subUrdu: 'پیسہ صرف پانچ دنوں میں واپس، اور ودڈرا سیدھا ایزی پیسہ اور جاز کیش میں!',
        subEng: 'Full recovery in 5 days, instant cashouts to mobile wallets.'
      },
      {
        badge: '🚀 Official WhatsApp Support',
        title: 'آج ہی وزٹ کریں!',
        eng: 'WHATSAPP: 0321-8956397',
        desc: 'ابھی رابطہ کریں اور آج ہی ارننگ شروع کریں',
        icon: '🚀📞',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-slate-900 text-white rounded-xl p-2.5 shadow-sm text-center my-2">
            <span className="text-[10px] text-emerald-400 font-bold block">Helpline WhatsApp:</span>
            <span className="text-base font-black font-mono text-white">0321-8956397</span>
          </div>
        ),
        subUrdu: 'ابھی ویب سائٹ وزٹ کریں یا واٹس ایپ نمبر 03218956397 پر رابطہ کریں۔',
        subEng: 'Visit website or WhatsApp 0321-8956397 right now!'
      }
    ]
  },

  style_student: {
    id: 'style_student',
    name: 'Student Pocket Money',
    icon: GraduationCap,
    voiceDesc: '🎙️ Female Voice (Uzma)',
    scenes: [
      {
        badge: '🎓 Student Special',
        title: 'اسٹوڈنٹس پاکٹ منی',
        eng: 'STUDENT DAILY INCOME',
        desc: 'گھر بیٹھے اپنے موبائل فون سے روزانہ ارننگ کریں',
        icon: '🎓💸',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-50 rounded-xl p-2.5 border border-emerald-200 shadow-sm text-center my-2">
            <span className="text-[11px] font-bold text-emerald-800">Student Free Bonus:</span>
            <span className="text-base font-black text-slate-900 block font-mono">Rs. 150 Free</span>
          </div>
        ),
        subUrdu: 'کیا آپ اسٹوڈنٹ ہیں اور پاکٹ منی کمانا چاہتے ہیں؟ تو یہ موقع مت چھوڑیں!',
        subEng: 'Are you a student looking for pocket money? Don’t miss this!'
      },
      {
        badge: '📱 Mobile Work',
        title: 'روزانہ ریئل کیش کمائیں',
        eng: 'EARN FROM MOBILE',
        desc: 'کوئی مشکل نہیں، روزانہ بٹن دبائیں اور منافع پائیں',
        icon: '📲💵',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm text-left my-2 space-y-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>Daily Claim:</span>
              <span className="text-emerald-600 font-bold">Claimed ✅</span>
            </div>
          </div>
        ),
        subUrdu: 'گھر بیٹھے اپنے موبائل سے کام کریں اور روزانہ کی بنیاد پر ریئل کیش کمائیں۔',
        subEng: 'Work from home and make real daily income.'
      },
      {
        badge: '🔥 50% Referral Bonus',
        title: 'ہر انوائٹ پر 50% منافع',
        eng: '50% CASH REWARD',
        desc: 'صرف دوستوں کو انوائٹ کریں اور آدھا پیسہ آپ کا',
        icon: '🎁50%',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-amber-50 rounded-xl p-2.5 border border-amber-300 shadow-sm text-center my-2">
            <span className="text-xs font-black text-amber-900">1 Friend = 50% Direct Cash</span>
          </div>
        ),
        subUrdu: 'صرف اپنے دوستوں کو لائیں اور ہر دوست پر پچاس پرسنٹ کیش کمیشن پائیں۔',
        subEng: 'Bring friends and earn 50% cash commission on each.'
      },
      {
        badge: '⚡ Instant Cashout',
        title: 'ایزی پیسہ اور جاز کیش',
        eng: 'DIRECT MOBILE TRANSFER',
        desc: 'بغیر کسی انتظار کے فوری کیش آؤٹ اپنے اکاؤنٹ میں',
        icon: '📲💳',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-50 rounded-xl p-2 border border-emerald-200 text-center my-2 font-bold text-xs text-emerald-800">
            Min Withdrawal: Rs. 500 Only
          </div>
        ),
        subUrdu: 'ایزی پیسہ اور جاز کیش میں فوری کیش آؤٹ، بغیر کسی انتظار کے!',
        subEng: 'Fast cashouts directly to EasyPaisa and JazzCash.'
      },
      {
        badge: '🚀 WhatsApp Help',
        title: 'ابھی رابطہ کریں',
        eng: 'WHATSAPP: 0321-8956397',
        desc: 'آج ہی اپنا اکاؤنٹ بنائیں اور کمانا شروع کریں',
        icon: '🚀📞',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-600 text-white rounded-xl p-2.5 text-center my-2 font-mono font-bold text-sm">
            0321-8956397
          </div>
        ),
        subUrdu: 'آج ہی شروع کرنے کے لیے واٹس ایپ 03218956397 پر میسج کریں۔',
        subEng: 'Message WhatsApp 03218956397 today to begin.'
      }
    ]
  },

  style_gold: {
    id: 'style_gold',
    name: '50% VIP Gold Blast',
    icon: Crown,
    voiceDesc: '🎙️ Male Voice (Asad)',
    scenes: [
      {
        badge: '👑 VIP 50% Bonus',
        title: '50% ریفرل منافع',
        eng: '50% COMMISSION BLAST',
        desc: 'پاکستان کا سب سے زیادہ ریفرل بونس دینے والا سسٹم',
        icon: '👑50%',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-amber-100 rounded-xl p-2.5 border border-amber-300 text-center my-2 font-black text-amber-900 text-xs">
            ⭐ 50% INSTANT CASH REWARD ⭐
          </div>
        ),
        subUrdu: 'ایک ایسا پلیٹ فارم جو آپ کو دے رہا ہے ہر انوائٹ پر پورے پچاس فیصد کا منافع!',
        subEng: 'A platform providing a huge 50% return on every invite!'
      },
      {
        badge: '⚡ 5-Day Full Return',
        title: '5 دن میں پیسہ ریکور',
        eng: 'FAST RECOVERY',
        desc: '5 دن میں اپنا پیسہ واپس اور پھر مسلسل روزانہ منافع',
        icon: '⚡💰',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-white rounded-xl p-2 border border-slate-200 text-center my-2 text-slate-800 text-xs font-bold">
            50 Days Continuous Daily Profits
          </div>
        ),
        subUrdu: 'پانچ دن میں آپ کی رقم مکمل ریکور اور اس کے بعد لگاتار ڈیلی کیش!',
        subEng: 'Capital recovered in 5 days, followed by daily profit.'
      },
      {
        badge: '📲 Easy Cashout',
        title: 'آسان ترین ودڈرا',
        eng: 'EASYPAISA & JAZZCASH',
        desc: 'محفوظ ڈپازٹ اور تیز رفتار کیش آؤٹ سسٹم',
        icon: '📲💵',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-50 rounded-xl p-2 border border-emerald-200 text-center my-2 text-emerald-900 text-xs font-bold">
            Direct Mobile Payout in 15-30 Mins
          </div>
        ),
        subUrdu: 'محفوظ ڈپازٹ اور آسان ترین ودڈرا کا نظام، ایزی پیسہ اور جاز کیش پر۔',
        subEng: 'Safe deposit and instant cashout on EasyPaisa & JazzCash.'
      },
      {
        badge: '🌟 Top Rated',
        title: 'ہزاروں اسٹوڈنٹس لائیو',
        eng: 'JOIN THE WINNERS',
        desc: 'ہزاروں لوگ روزانہ منافع نکال رہے ہیں',
        icon: '🎓🏆',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-slate-900 text-white rounded-xl p-2 text-center my-2 text-xs font-bold">
            🔥 10,000+ Active Students
          </div>
        ),
        subUrdu: 'ہزاروں اسٹوڈنٹس روزانہ کما رہے ہیں، آپ بھی پیچھے مت رہیں۔',
        subEng: 'Thousands of students active, join now.'
      },
      {
        badge: '🚀 Helpline',
        title: 'ابھی جوائن کریں',
        eng: 'WHATSAPP: 0321-8956397',
        desc: 'آفیشل واٹس ایپ پر فوری رابطہ کریں',
        icon: '🚀📞',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-600 text-white rounded-xl p-2.5 text-center my-2 font-mono font-black text-sm">
            0321-8956397
          </div>
        ),
        subUrdu: 'ابھی رابطہ کریں آفیشل واٹس ایپ: 03218956397 پر۔',
        subEng: 'Contact official WhatsApp 0321-8956397 now.'
      }
    ]
  },

  style_steps: {
    id: 'style_steps',
    name: '3-Step Easy Guide',
    icon: ListOrdered,
    voiceDesc: '🎙️ Female Voice (Uzma)',
    scenes: [
      {
        badge: '📋 3 Simple Steps',
        title: 'تین آسان اسٹیپس',
        eng: 'HOW IT WORKS',
        desc: 'آسان طریقہ سمجھیں اور گھر بیٹھے روزانہ کمائیں',
        icon: '1️⃣2️⃣3️⃣',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-white rounded-xl p-2 border border-slate-200 text-center my-2 text-xs font-black text-slate-800">
            1. Register ➔ 2. Earn ➔ 3. Cashout
          </div>
        ),
        subUrdu: 'تین آسان اسٹیپس میں پیسے کمانا شروع کریں!',
        subEng: 'Start earning in 3 easy steps!'
      },
      {
        badge: '1️⃣ Step One',
        title: 'اکاؤنٹ بنائیں',
        eng: 'SIGNUP & GET BONUS',
        desc: 'فری سائن اپ کریں اور 150 روپے فری بونس پائیں',
        icon: '📝🎁',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-50 rounded-xl p-2 border border-emerald-200 text-center my-2 text-xs font-bold text-emerald-800">
            Step 1: Sign up & Get Rs. 150 Bonus
          </div>
        ),
        subUrdu: 'اسٹیپ ون: ویب سائٹ پر اکاؤنٹ بنائیں اور فری بونس حاصل کریں۔',
        subEng: 'Step 1: Create an account and claim free bonus.'
      },
      {
        badge: '2️⃣ Step Two',
        title: 'روزانہ منافع اور 50% بونس',
        eng: 'EARN DAILY & 50% REF',
        desc: 'روزانہ منافع کمائیں اور ہر انوائٹ پر 50% کیش حاصل کریں',
        icon: '💰🔥',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-amber-50 rounded-xl p-2 border border-amber-300 text-center my-2 text-xs font-bold text-amber-900">
            Step 2: Daily Profit & 50% Ref Bonus
          </div>
        ),
        subUrdu: 'اسٹیپ ٹو: روزانہ منافع حاصل کریں اور دوستوں کو انوائٹ کر کے پچاس فیصد بونس پائیں۔',
        subEng: 'Step 2: Earn daily profit and 50% referral bonus.'
      },
      {
        badge: '3️⃣ Step Three',
        title: 'ایزی پیسہ ودڈرا',
        eng: 'CASHOUT INSTANTLY',
        desc: 'پیسہ سیدھا اپنے موبائل والٹ میں حاصل کریں',
        icon: '📲💵',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-50 rounded-xl p-2 border border-emerald-200 text-center my-2 text-xs font-bold text-emerald-900">
            Step 3: EasyPaisa & JazzCash Payout
          </div>
        ),
        subUrdu: 'اسٹیپ تھری: اپنا منافع ایزی پیسہ یا جاز کیش میں فوراً نکالیں۔',
        subEng: 'Step 3: Withdraw cash into mobile wallet.'
      },
      {
        badge: '🚀 Get Started',
        title: 'آج ہی شروع کریں',
        eng: 'WHATSAPP: 0321-8956397',
        desc: 'ہماری ٹیم آپ کی رہنمائی کے لیے حاضر ہے',
        icon: '🚀📞',
        mockup: (
          <div className="w-full max-w-[240px] mx-auto bg-emerald-600 text-white rounded-xl p-2.5 text-center my-2 font-mono font-bold text-sm">
            0321-8956397
          </div>
        ),
        subUrdu: 'مزید رہنمائی کے لیے ابھی واٹس ایپ 03218956397 پر رابطہ کریں۔',
        subEng: 'Contact WhatsApp 03218956397 now.'
      }
    ]
  }
};

const PromoVideo = () => {
  const [currentStyleKey, setCurrentStyleKey] = useState('style_website');
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const styleConfig = STYLES_DATA[currentStyleKey];
  const sceneList = styleConfig.scenes;

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

    const audioSrc = allPromoAudios[currentStyleKey][sceneIdx];
    const audio = new Audio(audioSrc);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setProgress(100);
      if (sceneIdx < sceneList.length - 1) {
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
  }, [isPlaying, currentScene, currentStyleKey]);

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

  const handleStyleChange = (key) => {
    stopAudio();
    setIsPlaying(false);
    setCurrentStyleKey(key);
    setCurrentScene(0);
    setProgress(0);
  };

  const downloadAudio = () => {
    const audioSrc = allPromoAudios[currentStyleKey][currentScene];
    const a = document.createElement('a');
    a.href = audioSrc;
    a.download = `${currentStyleKey}_scene_${currentScene + 1}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const scene = sceneList[currentScene];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      <PageHeader
        title="Promotional Video Studio"
        subtitle="Multi-template promo reels with synchronized Urdu voiceover and live website showcase"
        backTo="/dashboard"
      />

      {/* Style Switcher Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Choose Video Style / Template:</span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {styleConfig.voiceDesc}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.values(STYLES_DATA).map((st) => {
            const Icon = st.icon;
            const isSelected = st.id === currentStyleKey;
            return (
              <button
                key={st.id}
                onClick={() => handleStyleChange(st.id)}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-emerald-600'}`} />
                <span className="text-xs font-black truncate">{st.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Mobile Phone Reel Frame (9:16 Aspect Ratio Player) */}
        <div className="md:col-span-6 flex justify-center">
          <div className="w-full max-w-[340px] rounded-[36px] p-3 bg-white border-4 border-slate-200 shadow-2xl relative overflow-hidden">
            {/* Phone Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-slate-200 rounded-full z-20" />

            {/* Inner Phone Screen (Soft Aesthetic) */}
            <div className="w-full aspect-[9/15] rounded-[28px] bg-gradient-to-b from-emerald-50/80 via-teal-50/50 to-amber-50/50 p-4 flex flex-col justify-between relative overflow-hidden text-slate-900 border border-emerald-200 transition-colors duration-500">
              
              {/* Top Reel Progress Bars */}
              <div className="flex gap-1 pt-3 z-10">
                {sceneList.map((s, idx) => (
                  <div
                    key={idx}
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
                  {currentScene + 1} / {sceneList.length}
                </span>
              </div>

              {/* Dynamic Center Stage Content */}
              <div className="my-auto z-10 text-center space-y-1.5 py-2">
                <div className="text-4xl filter drop-shadow-sm mb-1">
                  {scene.icon}
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-snug" style={{ direction: 'rtl' }}>
                  {scene.title}
                </h4>
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wide">
                  {scene.eng}
                </p>

                {/* Mockup Display */}
                {scene.mockup}

                <p className="text-[11px] font-medium text-slate-600 max-w-xs mx-auto leading-relaxed" style={{ direction: 'rtl' }}>
                  {scene.desc}
                </p>
              </div>

              {/* Subtitles Bar */}
              <div className="bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-emerald-100 shadow-sm text-center space-y-0.5 z-10">
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
            <h3 className="font-black text-slate-900 text-sm">Video Player & Export</h3>

            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'Pause Reel' : 'Play Video Reel'}</span>
              </button>
              <button
                onClick={restart}
                className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={downloadAudio}
                className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shadow-2xs flex items-center gap-1 font-bold text-xs"
                title="Download MP3 Audio Voiceover"
              >
                <Download className="w-4 h-4" />
                <span>MP3</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1">
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

            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              💡 <strong>Social Media Tip</strong>: Mobile par screen recording on karein aur <strong>"Play Video Reel"</strong> dabayein. Har template alag voice aur visual layout ke sath chalegi jise aap WhatsApp status, TikTok ya Instagram Reels par upload kar sakte hain!
            </p>
          </div>

          {/* Scene Playlist */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">Select Scene</h4>
            <div className="space-y-2">
              {sceneList.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentScene(idx);
                    setProgress(0);
                    if (!isPlaying) setIsPlaying(true);
                  }}
                  className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    currentScene === idx
                      ? 'bg-emerald-50 border-emerald-500 shadow-2xs font-bold ring-1 ring-emerald-400'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${currentScene === idx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs text-slate-900 font-bold">{s.title}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{s.eng}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {idx === currentScene ? 'Playing' : 'Preview'}
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
