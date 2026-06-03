import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GAME_LEVELS } from './data/gameLevels';
import { PlayerState, GameLevel, DialogueTrigger } from './types';
import { playSound } from './utils/audio';

// @ts-ignore
import levelEightCover from './assets/images/level_eight_cover_1780398896096.png';
// @ts-ignore
import badge2018 from './assets/images/badge_2018_lanyard_1780402711323.png';
// @ts-ignore
import badge2026 from './assets/images/badge_2026_lanyard_1780402731263.png';

import PlatformerGame from './components/PlatformerGame';
import RetroHUD from './components/RetroHUD';
import NarrativePanel from './components/NarrativePanel';

import { 
  Play, Zap, Volume2, VolumeX, RefreshCw, Key, Award, Trophy,
  Compass, GitFork, Users, ShieldAlert, Cpu, Eye, BookOpen,
  Mail, Calendar, ArrowRight, CornerRightDown, Github, UserCheck, CreditCard,
  Heart, Sparkles, Laptop, Globe, Flame, Shield, HelpCircle, MessageSquare, Lightbulb, Smile, Star, ArrowDown
} from 'lucide-react';

export default function App() {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'level_complete' | 'boss_choice' | 'credits'>('start');
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(true); // Auto-play is a superb default for presentation!
  const [muted, setMuted] = useState<boolean>(false);
  const [activeDialogue, setActiveDialogue] = useState<DialogueTrigger | null>(null);
  
  // Climax choices states
  const [bossChoice, setBossChoice] = useState<string | null>(null);
  const [bossChoiceResult, setBossChoiceResult] = useState<string | null>(null);
  const [showBadgesRevealed, setShowBadgesRevealed] = useState<boolean>(false);

  // Core Yoyo player states
  const [playerState, setPlayerState] = useState<PlayerState>({
    x: 80,
    y: 250,
    vx: 0,
    vy: 0,
    width: 28,
    height: 48,
    isGrounded: false,
    isJumping: false,
    facing: 'right',
    energy: 100,
    skills: [],
    collectedTools: [],
    growth: 0
  });

  const currentLevel = GAME_LEVELS[currentLevelIndex];

  // Control background music synthesis loop on mute/change
  useEffect(() => {
    if (gameState === 'playing' && !muted) {
      playSound.startBgm(false);
    } else {
      playSound.stopBgm();
    }
    return () => playSound.stopBgm();
  }, [gameState, muted]);

  // Restart game back to Level 1
  const handleRestartFullGame = () => {
    playSound.levelUp();
    setCurrentLevelIndex(0);
    setGameState('start');
    setBossChoice(null);
    setBossChoiceResult(null);
    setShowBadgesRevealed(false);
    
    // Clear trigger logs in game levels
    GAME_LEVELS.forEach(lvl => {
      lvl.dialogues.forEach(d => d.hasTriggered = false);
      lvl.enemies.forEach(e => e.isDefeated = false);
      lvl.collectibles.forEach(c => c.pickedUp = false);
      if (lvl.platforms) {
        lvl.platforms.forEach(p => p.isHit = false);
      }
    });

    setPlayerState({
      x: 80,
      y: 250,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      isGrounded: false,
      isJumping: false,
      facing: 'right',
      energy: 100,
      skills: [],
      collectedTools: [],
      growth: 0
    });
  };

  const handleStartGame = (autoPilotMode: boolean) => {
    playSound.levelUp();
    setIsAutoPlay(autoPilotMode);
    setGameState('playing');
    setActiveDialogue(null);
    
    // Auto trigger first dialogue in Level 1
    const firstDiag = currentLevel.dialogues[0];
    if (firstDiag) {
      firstDiag.hasTriggered = true;
      setActiveDialogue(firstDiag);
    }
  };

  const handleNextLevel = () => {
    playSound.levelUp();
    
    // Unlocked and append current level skill
    const skillName = currentLevel.acquiredSkill.name;
    setPlayerState((prev) => {
      const updatedSkills = prev.skills.includes(skillName) ? prev.skills : [...prev.skills, skillName];
      return {
        ...prev,
        skills: updatedSkills,
        growth: prev.growth + 20
      };
    });

    if (currentLevelIndex < GAME_LEVELS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
      setGameState('playing');
      setActiveDialogue(null);

      // Auto trigger the introductory dialogue block for the new level
      setTimeout(() => {
        const nextDiag = GAME_LEVELS[currentLevelIndex + 1]?.dialogues[0];
        if (nextDiag) {
          nextDiag.hasTriggered = true;
          setActiveDialogue(nextDiag);
        }
      }, 300);
    } else {
      // Finished LEVEL 6 Accept -> leads to Finale
      setGameState('credits');
    }
  };

  const handleTriggerDialogue = (diag: DialogueTrigger) => {
    setActiveDialogue(diag);
  };

  const handleCloseDialogue = () => {
    setActiveDialogue(null);
  };

  const triggerBossChoice = () => {
    playSound.bounce();
    setGameState('boss_choice');
  };

  const handleBossChoiceSelection = (choice: string) => {
    setBossChoice(choice);
    if (choice === 'attack') {
      playSound.hurt();
      setBossChoiceResult('“攻击”失败！镜像 Yoyo 淡然拂过你的招式，微笑道：\n“工作从来不是用来对抗打败的，用好胜和刺角去解决工作难题，只会制造更多冲突和心结。”');
    } else if (choice === 'escape') {
      playSound.hurt();
      setBossChoiceResult('“回避”无果！你向着远方走去，却被环绕的山壁挡住，虚空的内心声音回响：\n“逃避指标或环境，只会将它堆积。真正的高峰不因离去而妥协，唯有自省直面，才能超越它的重担。”');
    } else {
      // True Choice! Support self accept
      playSound.swell();
      setBossChoiceResult('“接受并在内心中拥抱自我”！\n那一瞬间，漫天的紫金群星大亮！镜像微笑着流下一滴眼泪并融入你的身体。\n你抛下了对外界评定、绩效与他人眼光的焦虑与执念，获得了内心的清澈与安宁！\n\n【创造力之巅 已攀越！】你可以走上前打开那只神秘宝箱了！');
      
      // Defeat the mirror
      const mirrorLvl = GAME_LEVELS[5]; // level 6
      const boss = mirrorLvl.enemies.find(e => e.type === 'mirror');
      if (boss) {
        boss.isDefeated = true;
      }
    }
  };

  const closeBossChoiceModal = () => {
    if (bossChoice === 'accept') {
      setGameState('playing');
    } else {
      setBossChoice(null);
      setBossChoiceResult(null);
      setGameState('playing');
    }
  };

  // When Level 4 boss 'Fear' is squashed, trigger nice dialog automatically
  const handleFearBossDefeated = () => {
    setPlayerState(prev => ({
      ...prev,
      skills: prev.skills.includes('韧性 (Resilience)') ? prev.skills : [...prev.skills, '韧性 (Resilience)'],
      growth: prev.growth + 30
    }));
    
    // Append a congratulatory dialogue detailing resilience
    setActiveDialogue({
      id: 'l4-d-victory',
      triggerX: 0,
      speaker: 'System',
      hasTriggered: true,
      text: [
        '“太棒了！你依靠坚韧踩扁并驱散了心魔与焦虑！”',
        '“现在迷雾已彻底散去，快前行前往 2026 未来智能化之城吧！”'
      ]
    });
  };

  return (
    <div className={`min-h-screen relative overflow-hidden select-none transition-colors duration-300 ${gameState === 'start' ? 'bg-[#FCF5EB]' : 'bg-[#080d1e]'}`}>
      
      {/* Background decoration grid for high poster vibe */}
      {gameState === 'playing' && (
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      )}

      {/* Ambient gradient glow in the base */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-96 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.06),transparent_50%)]" />

      {/* Main Header navigation and status bar */}
      <header className={`relative z-10 border-b-4 border-slate-950 ${gameState === 'start' ? 'bg-[#FCF5EB] text-slate-900 shadow-[0_4px_0_0_rgba(120,53,15,0.15)]' : 'bg-[#0c122c]/95 text-slate-100 shadow-[0_4px_0_0_rgba(0,0,0,0.3)]'} px-2 py-1.5 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          <div className="flex items-center space-x-3.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-3 border-slate-900 bg-amber-400 font-retro-header text-lg font-black text-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-bounce">
              ?
            </span>
            <div>
              <h1 className={`text-xs font-black tracking-widest uppercase sm:text-sm font-retro-header ${gameState === 'start' ? 'text-[#854D0E]' : 'text-[#FDE047]'}`}>
                YOANA'S LEVEL 8 ADVENTURE
              </h1>
              <p className={`text-[10px] tracking-wide font-cute-chinese font-bold mt-0.5 ${gameState === 'start' ? 'text-amber-800' : 'text-slate-300'}`}>
                《LEVEL 8》 一个字节校招生的8年升级冒险
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs">
            {gameState !== 'start' && (
              <button
                onClick={handleRestartFullGame}
                className="flex items-center space-x-1.5 px-3 py-1.5 font-bold tracking-wide text-white rounded-lg bg-red-500 hover:bg-red-400 border-2 border-slate-950 shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer font-cute-chinese text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>返回大冒险海报</span>
              </button>
            )}
            <span className={`hidden leading-none md:inline font-retro-header text-[9px] px-2 py-1 rounded-md border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${gameState === 'start' ? 'bg-amber-100 text-amber-900' : 'bg-slate-950 text-slate-100'}`}>
              PLAY.NES
            </span>
          </div>
        </div>
      </header>

      {/* Primary body view switcher container */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        
        <AnimatePresence mode="wait">
          
          {/* SCREEN 1: SPLASH COVER SCREEN */}
          {gameState === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 text-slate-900"
            >
              {/* Cute Title Banner - "Yoyo大冒险" with bubble effects */}
              <div className="text-center relative py-6">
                {/* Decorative floating CSS clouds around heading */}
                <div className="absolute top-0 left-8 md:left-24 animate-bounce duration-1000 opacity-60">
                  <div className="h-6 w-14 bg-white rounded-full relative shadow-sm">
                    <div className="h-5 w-5 bg-white rounded-full absolute -top-2 left-3" />
                    <div className="h-6 w-6 bg-white rounded-full absolute -top-3 left-6" />
                  </div>
                </div>
                <div className="absolute top-10 right-8 md:right-24 animate-pulse opacity-60">
                  <div className="h-7 w-16 bg-white rounded-full relative shadow-sm">
                    <div className="h-6 w-6 bg-white rounded-full absolute -top-2.5 left-3" />
                    <div className="h-7 w-7 bg-white rounded-full absolute -top-3 left-7" />
                  </div>
                </div>

                <div className="inline-block relative z-10">
                  <h1 className="text-5xl md:text-7xl font-sans tracking-wider font-extrabold pb-2 select-none">
                    <span 
                      className="inline-block transition duration-200 hover:scale-110 cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 font-black"
                      style={{
                        filter: "drop-shadow(4px 4px 0px #1e293b)",
                        WebkitTextStroke: "1.5px #0f172a"
                      }}
                      onClick={() => playSound.collect()}
                    >
                      Yoyo大冒险
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl font-cute-chinese font-black tracking-widest text-[#B45309] mt-2 bg-amber-100/90 border-2 border-amber-900/30 rounded-full px-6 py-1 inline-flex items-center gap-1.5 shadow-[3px_3px_0_0_rgba(180,83,9,0.2)]">
                    <Sparkles className="h-4 w-4 text-amber-600 fill-amber-300 animate-spin" />
                    <span>用创意和工具，闯关打怪，升级打怪！</span>
                    <Sparkles className="h-4 w-4 text-amber-600 fill-amber-300 animate-spin" style={{ animationDirection: 'reverse' }} />
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch">
                
                {/* LEFT BLOCK: "Yoyo大冒险" Interactive Stage Board (8 columns) */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                  
                  {/* Decorative Frame of Mario-Theme Landscape stage */}
                  <div className="rounded-3xl border-4 border-slate-900 bg-gradient-to-b from-sky-300 to-sky-100 p-4 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden flex flex-col justify-between h-[360px] select-none group">
                    
                    {/* Parallax elements inside canvas area */}
                    <div className="absolute top-12 left-1/4 h-2 w-16 bg-white/40 rounded-full" />
                    <div className="absolute top-16 left-1/2 h-2 w-24 bg-white/40 rounded-full" />
                    
                    {/* Top status HUD bar in the stage */}
                    <div className="flex items-center justify-between border-b-2 border-slate-900/10 pb-2 relative z-10 bg-white/40 backdrop-blur-sm rounded-xl px-3.5 py-1.5 shadow-sm">
                      <div className="flex items-center space-x-2">
                        {/* Custom Avatar for Yoyo (Peach circle matching ponytail jacket) */}
                        <div className="relative h-[28px] w-[28px] rounded-full border-2 border-slate-900 bg-amber-200 overflow-hidden shadow-[1.5px_1.5px_0_0_rgba(0,0,0,1)]">
                          {/* Pixelated head representation */}
                          <div className="absolute bottom-0 inset-x-0 h-4 bg-red-500" /> {/* Red jacket */}
                          <div className="absolute inset-x-1.5 top-1.5 h-3.5 w-3.5 bg-rose-200 rounded-full" /> {/* head */}
                          <div className="absolute top-0.5 left-1 h-3.5 w-5 bg-[#78350F] rounded-t-full" /> {/* brown hair */}
                          <div className="absolute top-2 right-0.5 h-1.5 w-1.5 bg-red-600 rounded-full" /> {/* ponytail hairband */}
                        </div>
                        <span className="font-retro-header text-xs tracking-tight font-black text-slate-900">YOYO x 05</span>
                      </div>

                      <div className="flex items-center space-x-1 bg-amber-400/90 text-slate-950 px-2 py-0.5 rounded-md border border-slate-900 text-xs font-black shadow-[1.5px_1.5px_0_0_rgba(0,0,0,1)]">
                        <span>🪙</span>
                        <span className="font-retro-header tracking-tighter">x 168</span>
                      </div>

                      <div className="flex items-center space-x-0.5">
                        <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500 drop-shadow-[1px_1px_0_rgba(0,0,0,0.4)] animate-pulse" />
                        <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500 drop-shadow-[1px_1px_0_rgba(0,0,0,0.4)] animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <Heart className="h-4.5 w-4.5 text-red-500 fill-red-500 drop-shadow-[1px_1px_0_rgba(0,0,0,0.4)] animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>

                    {/* The Scene Graphics Center Area */}
                    <div className="relative flex-1 flex items-center justify-between px-6 mt-2">
                      
                      {/* Signboard on the left */}
                      <div className="border-2 border-slate-900 bg-amber-100 p-2 text-center rounded-xl shadow-[2px_2px_0_0_rgba(15,23,42,1)] max-w-[140px] relative z-10 rotate-[-1deg]">
                        <span className="text-[9px] font-retro-header bg-amber-500 text-amber-950 px-1 py-0.5 rounded block uppercase font-bold tracking-tight">目标 / GOAL</span>
                        <span className="font-cute-chinese font-black text-slate-900 text-xs leading-normal mt-1 block">创造价值 丰富生活</span>
                        <div className="absolute top-full left-1/2 -ml-1 w-2 h-4 bg-amber-900/40 border-r border-l border-slate-900" /> {/* board stick */}
                      </div>

                      {/* 5 hovering tool blocks above question brick [?] columns! */}
                      <div className="flex items-center justify-center space-x-4 md:space-x-8 absolute left-1/2 -ml-[160px] top-6 z-20">
                        {[
                          { name: '飞书风神', desc: '风神：召唤大风吹走险阻', color: 'from-sky-400 to-cyan-505', icon: <Compass className="h-3.5 w-3.5 text-white" /> },
                          { name: 'AIME/AI', desc: 'AIME：AI助理答疑解惑', color: 'from-purple-500 to-indigo-505', icon: <Cpu className="h-3.5 w-3.5 text-white" /> },
                          { name: '飞书妙记', desc: '飞书妙记：灵感纪实转换机', color: 'from-red-400 to-orange-505', icon: <MessageSquare className="h-3.5 w-3.5 text-white" /> },
                          { name: '多维表格', desc: '飞书多维表格：组织协作拼图', color: 'from-emerald-500 to-teal-505', icon: <GitFork className="h-3.5 w-3.5 text-white animate-pulse" /> },
                          { name: '飞书文档', desc: '飞书文档：全球网络实时同步', color: 'from-blue-500 to-sky-505', icon: <BookOpen className="h-3.5 w-3.5 text-white" /> },
                        ].map((tool, idx) => (
                          <div 
                            key={idx} 
                            className="flex flex-col items-center select-none cursor-pointer relative"
                            onMouseEnter={() => {
                              playSound.bounce();
                              setActiveTooltip(tool.desc);
                            }}
                            onMouseLeave={() => setActiveTooltip(null)}
                            onClick={() => {
                              playSound.collect();
                              setActiveTooltip(tool.desc);
                            }}
                          >
                            {/* Floating glowing tool icon bubble */}
                            <motion.div 
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.25 }}
                              className={`h-7 w-7 rounded-full bg-gradient-to-tr ${tool.color} flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.2)] border border-white hover:scale-115 transition-transform duration-200`}
                            >
                              {tool.icon}
                            </motion.div>
                            
                            {/* Connector wave */}
                            <div className="h-3 w-0.5 bg-slate-900/30 border-dashed border-l border-slate-900/40 my-0.5" />

                            {/* Retro Mario yellow question block [?] below */}
                            <div className="h-6 w-6 rounded border-2 border-slate-900 bg-amber-400 font-retro-header text-xs text-amber-950 font-black flex items-center justify-center shadow-[1.5px_1.5px_0_0_rgba(0,0,0,1)] hover:bg-amber-300 hover:translate-y-[-1px] transition-all">
                              ?
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Characters representation scene: Yoyo running towards standard foes */}
                      <div className="absolute inset-x-0 bottom-4 flex items-end justify-between px-10">
                        {/* Waving Yoyo mini character illustration */}
                        <div className="relative animate-bounce duration-700 flex flex-col items-center">
                          {/* Chat bubble over her head */}
                          <div className="bg-white border-2 border-slate-950 px-2 py-0.5 rounded-lg text-[9px] font-black text-slate-900 absolute -top-8 left-1/2 -ml-12 w-24 text-center leading-normal shadow-[1px_1px_0_0_rgba(0,0,0,1)]">
                            一起升级冒险吧! 🏃‍♀️💨
                          </div>
                          <div className="h-11 w-7 rounded-sm relative">
                            {/* ponytail custom drawing inline */}
                            <div className="absolute top-1 right-5 h-4 w-4 rounded-full bg-[#78350F]" /> {/* ponytail */}
                            <div className="absolute top-1.5 right-4 h-1.5 w-1.5 bg-red-605" /> {/* ribbon */}
                            <div className="absolute top-0 left-0.5 h-6 w-6 bg-rose-200 rounded-full border-2 border-slate-900" /> {/* head skin */}
                            <div className="absolute top-0.5 left-0.5 h-3 w-5 bg-[#78350F] rounded-t-full" /> {/* hair bang */}
                            <div className="absolute top-3.5 left-0.5 h-6 w-[22px] bg-red-500 rounded-md border-2 border-slate-900" /> {/* body red jacket */}
                            <div className="absolute top-9 left-1 w-2 h-3 bg-[#78350F] border border-slate-900" /> {/* leg left */}
                            <div className="absolute top-9 left-4 w-2 h-3 bg-[#78350F] border border-slate-900" /> {/* leg right */}
                          </div>
                          <p className="text-[8px] font-retro-header bg-slate-900 text-white px-1 py-0.5 rounded mt-1 shadow-[1px_1px_0_0_rgba(0,0,0,1)]">YOANA</p>
                        </div>

                        {/* Middle brick stand with Goomba-style block monster */}
                        <div className="flex flex-col items-center">
                          <div className="h-6 w-6 bg-orange-600 rounded-md border-2 border-slate-900 relative shadow-sm flex items-center justify-center">
                            <div className="flex space-x-1.5 absolute top-1.5">
                              <span className="h-1.5 w-1 bg-slate-900 rotate-[20deg]" />
                              <span className="h-1.5 w-1 bg-slate-900 rotate-[-20deg]" />
                            </div>
                            <span className="h-1 w-2.5 bg-slate-950 absolute bottom-1.5 rounded-sm" /> {/* mouth */}
                          </div>
                          <span className="text-[7.5px] font-black uppercase text-amber-900 tracking-tighter mt-1 bg-amber-100 px-1 rounded border border-amber-900/20 font-retro-header">MONSTER</span>
                        </div>

                        {/* Final giant purple brick boss with eyebrows (representative of complexity/confusion) on standard pedestal bricks */}
                        <div className="flex flex-col items-center">
                          {/* HP outline meter */}
                          <div className="w-8 h-2 bg-slate-950 border border-slate-900 rounded p-[0.5px] mb-1">
                            <div className="w-[80%] h-full bg-red-500 rounded-sm" />
                          </div>
                          <div className="h-8 w-8 bg-purple-600 rounded-lg border-2.5 border-slate-900 relative shadow-md flex items-center justify-center animate-pulse">
                            {/* Angry eyebrows/eyes */}
                            <div className="absolute top-1 inset-x-1 flex justify-between">
                              <span className="h-1 w-2 bg-slate-950 rotate-[-15deg]" />
                              <span className="h-1 w-2 bg-slate-950 rotate-[15deg]" />
                            </div>
                            <div className="flex space-x-2 absolute top-2">
                              <span className="h-1.5 w-1.5 bg-white relative rounded-full"><span className="absolute top-0.5 left-0.5 h-0.5 w-0.5 bg-black rounded-full" /></span>
                              <span className="h-1.5 w-1.5 bg-white relative rounded-full"><span className="absolute top-0.5 left-0.5 h-0.5 w-0.5 bg-black rounded-full" /></span>
                            </div>
                            <span className="h-1.5 w-4 bg-amber-400 absolute bottom-1.5 rounded" /> {/* gold tooth mouth */}
                          </div>
                          <span className="text-[7.5px] font-black uppercase text-purple-900 tracking-tighter mt-1 bg-purple-100 px-1 rounded border border-purple-900/20 font-retro-header">BOSS BOSS</span>
                        </div>

                      </div>

                    </div>

                    {/* Grass soil texture bottom floor */}
                    <div className="h-7 w-[105%] -ml-[2.5%] relative border-t-4 border-slate-900 bg-gradient-to-r from-emerald-500 to-green-600 select-none z-10">
                      {/* Brick lines underneath */}
                      <div className="absolute inset-x-0 bottom-0 top-1.5 bg-[repeating-linear-gradient(45deg,#047857,#047857_10px,#059669_10px,#059669_20px)] opacity-55" />
                    </div>

                    {/* Active tooltip popover overlays */}
                    {activeTooltip && (
                      <div className="absolute bottom-10 left-4 right-4 bg-slate-950/95 border-2 border-amber-405 text-amber-300 p-2 text-xs font-cute-chinese font-black rounded-xl shadow-lg z-30 transition-all flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span>{activeTooltip}</span>
                      </div>
                    )}

                  </div>

                  {/* SIX CHAPTERS / ADVENTURE MAPS STORYROAD PANEL (Identical references from poster) */}
                  <div className="space-y-2 pt-2 select-none">
                    <h3 className="text-sm font-black text-amber-900 flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-700 font-bold" />
                      <span>我的成长大地图 (6个冒险章节) — 点击对应章节卡片试听或快速跳转！</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {[
                        { step: '1. 出发！', year: '2018', d: '带着好奇心，开启冒险之旅！', col: 'bg-blue-100 border-blue-900 text-blue-900 hover:bg-blue-200' },
                        { step: '2. 获取技能！', year: '2019', d: '顶开金币砖块，技能掉落，斩获多维武器！', col: 'bg-purple-100 border-purple-900 text-purple-900 hover:bg-purple-200' },
                        { step: '3. 挑战怪兽！', year: '2023', d: '团队遭遇混乱迷墙！使用妙记表格击散阴影！', col: 'bg-amber-100 border-amber-900 text-amber-900 hover:bg-amber-200' },
                        { step: '4. 升级成长！', year: '2025', d: '心魔袭来！用【韧性防雷神盾】完成升级重组！', col: 'bg-rose-100 border-rose-900 text-rose-900 hover:bg-rose-200' },
                        { step: '5. 到达终点！', year: '2026', d: '踏入AI未来共创城！体验十倍效率流！', col: 'bg-emerald-100 border-emerald-900 text-emerald-900 hover:bg-emerald-200' },
                        { step: '6. 隐藏关卡', year: '终局山顶', d: '拥抱本源创造本心，获得自由生机胸章！', col: 'bg-teal-100 border-teal-900 text-teal-900 hover:bg-teal-200' },
                      ].map((item, index) => (
                        <div 
                          key={index}
                          onClick={() => {
                            playSound.levelUp();
                            setCurrentLevelIndex(index >= 6 ? 5 : index);
                            setGameState('playing');
                            setActiveDialogue(null);
                          }}
                          className={`rounded-2xl border-2.5 p-3.5 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between cursor-pointer transform hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] transition-all ${item.col}`}
                        >
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-xs">{item.step}</span>
                              <span className="text-[10px] font-retro-header bg-white/70 border border-slate-900/20 px-1 py-0.2 rounded font-bold">{item.year}</span>
                            </div>
                            <p className="text-[11px] leading-relaxed font-sans">{item.d}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* GAME CONTROL CALLS TO ACTION */}
                  <div className="flex flex-col gap-3 sm:flex-row pt-3">
                    {/* Auto presentation mode */}
                    <button
                      type="button"
                      onClick={() => handleStartGame(true)}
                      className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-amber-400 hover:bg-amber-300 py-3.5 font-black text-slate-950 border-3 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer p-2 text-sm font-cute-chinese"
                    >
                      <Zap className="h-5 w-5 text-slate-950 fill-slate-950 animate-bounce" />
                      <span>AI 沉浸漫游讲演 (Auto Run) —— 自动演示模式</span>
                    </button>

                    {/* Manual control mode */}
                    <button
                      type="button"
                      onClick={() => handleStartGame(false)}
                      className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-sky-500 hover:bg-sky-400 py-3.5 text-sm font-black text-white border-3 border-slate-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer p-2 font-cute-chinese"
                    >
                      <Play className="h-4.5 w-4.5 text-white fill-white" />
                      <span>硬核手动挑战 —— 键盘 A/D/W 跳砖块</span>
                    </button>
                  </div>

                </div>

                {/* RIGHT BLOCK: "游戏创意说明" & "我的技能库" (4 columns) - Exact replica of right-side panel */}
                <div className="lg:col-span-4 flex flex-col justify-between space-y-5">
                  
                  {/* Container for specification */}
                  <div className="rounded-3xl border-4 border-slate-900 bg-[#FCF5EB] p-5 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] space-y-4 flex-1">
                    
                    {/* Retro section divider */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-retro-header uppercase text-amber-700 tracking-wider font-bold">Concept Blueprint / 概念蓝图</div>
                      <h3 className="text-lg font-black text-slate-900 font-cute-chinese flex items-center gap-1.5">
                        <BookOpen className="h-4.5 w-4.5 text-amber-700" />
                        <span>游戏创意说明</span>
                      </h3>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-sans bg-amber-100/50 p-3 rounded-2xl border border-amber-905/20 text-justify">
                      你扮演的 <b>Yoyo</b> 是一个 2018 年的字节校招生，在如同马里奥般温馨而充满未知的职场天地中冒险闯关。通过向上跳顶，掉落出带有<b>“飞书核心协作工具”</b>标志的技能砖块，从而实时吸收高能装备点，克制并碾碎不同时期的阻挡怪兽与业务阴影。
                      <br /><br />
                      每一个内部工具技能，都是对Yoyo 8年成长磨练的深刻诠释。它完美融合了个人职场飞跃路线、激发心流创意价值的主旨，是一部具有深刻自省思考的关卡之合！
                    </p>

                    <div className="border-t-2 border-dashed border-amber-900/20 pt-4 space-y-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 font-cute-chinese flex items-center gap-1">
                        <Award className="h-4 w-4 text-amber-700" />
                        <span>我的技能库 (飞书超级技能包)</span>
                      </h3>
                      
                      <div className="space-y-2">
                        {[
                          { name: '风神 (Windgod Project)', d: '召唤龙卷旋风，吹散数据孤岛与复杂险阻', bg: 'bg-sky-100 border-sky-305 text-sky-800', sign: '🌀' },
                          { name: 'AIME (Intelligent AI)', d: 'AI极速脑暴小助手，一键拆解战役痛点', bg: 'bg-purple-100 border-purple-305 text-purple-800', sign: '💡' },
                          { name: '飞书妙记 (Smart Audio)', d: '语音同声直达转写，完美沉淀回忆录', bg: 'bg-rose-100 border-rose-305 text-rose-800', sign: '🎙️' },
                          { name: '飞书多维表格 (Database)', d: '多端网络协同，让复杂工作流清晰拼合', bg: 'bg-emerald-100 border-emerald-305 text-emerald-800', sign: '📊' },
                          { name: '飞书文档 (Lark Docs)', d: '多人无界实时大屏，创意同步从不卡顿', bg: 'bg-blue-100 border-blue-305 text-blue-800', sign: '📝' },
                        ].map((skill, si) => (
                          <div 
                            key={si}
                            onClick={() => playSound.collect()}
                            className={`flex items-start space-x-2 p-2.5 rounded-xl border-1.5 text-[11px] leading-relaxed cursor-pointer hover:scale-[1.01] transition-transform ${skill.bg}`}
                          >
                            <span className="text-base select-none">{skill.sign}</span>
                            <div>
                              <div className="font-bold">{skill.name}</div>
                              <p className="text-[10px] opacity-85">{skill.d}</p>
                            </div>
                          </div>
                        ))}

                        <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-100 border border-slate-300 text-[11px] text-slate-500 justify-center">
                          <Star className="h-3 w-3 text-amber-550 animate-pulse fill-amber-300" />
                          <span className="font-bold">更多飞书超级工具... 持续解锁中！</span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* SECTION: 5 BENTO BOXES REPRESENTING HIGH-FIDELITY STORY MILESTONES (关卡主题示例) */}
              <div className="space-y-3 pt-4 select-none">
                <div className="text-center">
                  <h3 className="text-lg font-black text-[#854D0E] font-cute-chinese">✨ 关卡主题里程碑亮点展示 (Milestone Milestones)</h3>
                  <p className="text-xs text-amber-800 mt-1">八年大闯关，凝聚了我在工作和生活的 5 类极佳高潮画面演绎：</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  {[
                    { title: '职场挑战', t: '勇毅笃行 · 迎难而上', d: '2018新手训练营，带着满身好奇心和新鲜热情打破未来的层层陌生谜底迷障。', icon: <Laptop className="h-6 w-6 text-blue-600" />, grad: 'from-blue-50 to-indigo-100 border-blue-200' },
                    { title: '创意爆发', t: '星火照耀 · 灵感如潮', d: '东南亚大 Campaign 狂飙！用脑暴出无限金点子引爆全服，创造前所未有的业务突破。', icon: <Lightbulb className="h-6 w-6 text-amber-600 animate-pulse" />, grad: 'from-amber-50 to-yellow-10 border-amber-200' },
                    { title: '跨文化沟通', t: '世界回响 · 无界畅行', d: '拓展中东以及全球各异国度！打破不同语言屏障，让多维语言在同一空间精彩合奏。', icon: <Globe className="h-6 w-6 text-purple-600 animate-wiggle" />, grad: 'from-purple-50 to-fuchsia-100 border-purple-200' },
                    { title: '生活平衡', t: '工作生活 · 怡然自适', d: '抛去盲目堆叠指标！寻找真正的自由节奏，完成内心与自然之间的柔美和弦升华。', icon: <Smile className="h-6 w-6 text-rose-600" />, grad: 'from-rose-50 to-pink-100 border-rose-200' },
                  ].map((box, bi) => (
                    <div 
                      key={bi}
                      className={`rounded-2xl border-2 p-4 flex flex-col justify-between space-y-2.5 shadow-[2.5px_2.5px_0_0_rgba(15,23,42,1)] ${box.grad}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black font-cute-chinese text-[#854D0E] text-xs uppercase bg-white/80 px-2 py-0.5 rounded-full border border-amber-900/10 shadow-[1px_1px_0_0_rgba(0,0,0,0.15)]">{box.title}</span>
                        {box.icon}
                      </div>
                      <div>
                        <div className="font-bold text-[11px] text-slate-900 mb-0.5">{box.t}</div>
                        <p className="text-[10px] text-slate-700 leading-normal font-sans">{box.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CORE VALUE PANEL & SLOGAN BANNER WITH CUSTOM SVG YOANA (一起冒险吧！用创意和工具，创造更好的未来！) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 select-none">
                
                {/* Core values block */}
                <div className="md:col-span-6 bg-slate-900 text-slate-100 rounded-3xl p-5 border-4 border-slate-950 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-retro-header text-amber-400 block tracking-widest font-bold">CORE PHILOSOPHY / 核心追求</span>
                    <h4 className="text-sm font-black font-cute-chinese">游戏的核心传达理念</h4>
                  </div>
                  
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-xl">💡</span>
                      <div>
                        <div className="text-[11px] font-bold text-amber-300">激发创造 (Spark Creativity)</div>
                        <p className="text-[10px] text-slate-300">使用飞书多维协作箱，最大化发掘内在深处无拘无束的好玩创意。</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-xl">❤️</span>
                      <div>
                        <div className="text-[11px] font-bold text-rosy-300 text-rose-300">丰富生活 (Enrich Everyday Life)</div>
                        <p className="text-[10px] text-slate-300">把工作中的工具化为个人生活的小帮手，过出轻盈愉快的浪漫日常。</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-xl">🏆</span>
                      <div>
                        <div className="text-[11px] font-bold text-[#60A5FA]">成长突破 (Limitless Climb Higher)</div>
                        <p className="text-[10px] text-slate-300">在一次次的飞跃和跌撞间，洗去铅华。成长，从来就在每一里征途上！</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Slogan invitation + Waving Yoyo artwork block */}
                <div className="md:col-span-6 bg-[#FEF3C7] rounded-3xl p-5 border-4 border-amber-900 shadow-[4px_4px_0_0_rgba(15,23,42,1)] flex items-center justify-between">
                  <div className="space-y-2 max-w-[65%]">
                    <h3 className="text-2xl font-black text-[#78350F] font-cute-chinese leading-snug">
                      一起冒险吧！
                    </h3>
                    <p className="text-xs text-amber-955 text-[#78350F]/90 leading-relaxed font-sans font-bold">
                      用创意和工具，踏上属于你的奇妙航路，创造更好玩、更有价值的明天！
                    </p>
                  </div>

                  {/* Cute custom SVG waving cartoon Yoyo vector matching her real avatar! */}
                  <div className="w-24 h-24 relative select-none flex items-center justify-center">
                    <svg className="w-full h-full animate-bounce duration-[1.5s]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Brown hair ponytail background */}
                      <path d="M22 45 C15 45 12 35 15 28 C18 20 28 22 28 28 Z" fill="#78350F" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      {/* Tail ribbon hairband */}
                      <rect x="25" y="32" width="6" height="5" rx="1" fill="#DC2626" stroke="#0F172A" strokeWidth="2" />
                      
                      {/* Hair main */}
                      <circle cx="50" cy="40" r="20" fill="#78350F" stroke="#0F172A" strokeWidth="2.5" />
                      
                      {/* Face skin circle */}
                      <circle cx="50" cy="43" r="16" fill="#FECACA" />
                      
                      {/* Bangs strand */}
                      <path d="M34 32 C40 28 48 30 50 34 C52 30 60 28 66 32 C66 32 62 40 50 38 C38 40 34 32 34 32 Z" fill="#78350F" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" />
                      
                      {/* Closed eyes of happiness */}
                      <path d="M42 43 C44 45 46 45 46 43" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                      <path d="M54 43 C56 45 58 45 58 43" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* Blushing cheeks circles */}
                      <circle cx="39" cy="47" r="2.5" fill="#FB7185" fillOpacity="0.8" />
                      <circle cx="61" cy="47" r="2.5" fill="#FB7185" fillOpacity="0.8" />

                      {/* Sweet smile */}
                      <path d="M48 49 C50 51 52 51 52 49" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />

                      {/* Body red jacket */}
                      <path d="M36 59 C36 58 64 58 64 59 L62 76 L38 76 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round" />
                      {/* Collar white */}
                      <path d="M44 59 L46 64 L50 64 L52 59 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />

                      {/* Left arm waving up and down */}
                      <path d="M36 63 L24 53 C22 51 18 55 20 57 L31 68 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="2" strokeLinejoin="round" className="origin-[35px_62px] [animation:wave_1.5s_infinite_ease-in-out]" />
                    </svg>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div 
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              
              {/* HUD interface layer */}
              <RetroHUD 
                level={currentLevel}
                playerState={playerState}
                isAutoPlay={isAutoPlay}
                setIsAutoPlay={setIsAutoPlay}
                muted={muted}
                setMuted={setMuted}
              />

              {/* Central Physics Engine Platform canvas */}
              <PlatformerGame 
                level={currentLevel}
                playerState={playerState}
                setPlayerState={setPlayerState}
                isAutoPlay={isAutoPlay}
                onLevelComplete={() => setGameState('level_complete')}
                onTriggerDialogue={handleTriggerDialogue}
                activeDialogue={activeDialogue}
                onCloseDialogue={handleCloseDialogue}
                triggerBossChoice={triggerBossChoice}
                onBossDefeated={handleFearBossDefeated}
              />

              {/* Story backgrounds description card */}
              <NarrativePanel 
                level={currentLevel}
                playerState={playerState}
                gameState="playing"
                onNextLevel={handleNextLevel}
                onRestartLevel={() => {
                  playSound.bounce();
                  setGameState('playing');
                }}
              />

            </motion.div>
          )}

          {/* SCREEN 3: TRANSITIONAL LEVEL COMPLETE */}
          {gameState === 'level_complete' && (
            <motion.div 
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto rounded-3xl border border-emerald-500/30 bg-[#061A12] p-8 text-center space-y-6 shadow-2xl"
            >
              <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Award className="h-8 w-8 animate-bounce text-emerald-400" />
              </div>
              
              <div className="space-y-2">
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  CHAPTER CLEAR APPROVED · 通关验证成功
                </span>
                <h2 className="text-2xl font-black text-white">
                  你顺利完成了 {currentLevel.title}
                </h2>
                <p className="max-w-md mx-auto text-xs text-slate-300 leading-relaxed italic">
                  {currentLevel.completedQuote}
                </p>
              </div>

              {/* Badge visual banner */}
              <div className="inline-flex flex-col items-center justify-center bg-slate-900 border border-white/5 rounded-2xl p-4 w-full max-w-sm">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  ★
                </div>
                <h3 className="mt-2 text-sm font-bold text-slate-100">
                  获得升级 Badge: <b>【{currentLevel.acquiredSkill.name}】</b>
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 text-center leading-normal">
                  {currentLevel.acquiredSkill.description}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3.5">
                <button
                  onClick={handleNextLevel}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 px-6 py-2.5 font-bold text-slate-950 transition hover:from-emerald-400 hover:to-teal-400"
                >
                  <span>继续冒险前进</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* SCREEN 4: LEVEL 6 BOSS CHIME CLIMAX CHOICE MODAL */}
          {gameState === 'boss_choice' && (
            <motion.div 
              key="boss"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto rounded-3xl border border-amber-500/30 bg-[#1e1302]/85 backdrop-blur-xl p-8 space-y-6 shadow-2xl relative"
            >
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Eye className="h-7 w-7 text-amber-400 fill-amber-450" />
              </div>

              <div className="text-center space-y-1.5">
                <span className="font-mono text-xs uppercase tracking-widest text-amber-400 font-bold block">
                  星空彼端 的 双子自审 · INNER CLIMAX DIALOGUE
                </span>
                <h3 className="text-xl font-bold text-white">
                  「如果没有职级、没有绩效、没有晋等赞许，你是否还会充满热忱继续大步创造？」
                </h3>
                <p className="text-xs text-slate-450 leading-relaxed font-sans max-w-lg mx-auto">
                  在你面前的，是八年汗水累积出的虚影——镜像 Yoyo。
                  她静静等待着你的回应。不同的选择代表着对这八年攀登之路的不同审视。
                </p>
              </div>

              {/* Choices button stack */}
              {!bossChoice ? (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 pt-3">
                  <button
                    onClick={() => handleBossChoiceSelection('attack')}
                    className="flex flex-col items-center justify-center py-4 px-3 rounded-xl border border-red-500/20 bg-red-950/20 text-red-300 hover:bg-red-900/30 transition text-xs font-bold leading-normal gap-1"
                  >
                    <span>⚔ 攻击 (Combat Fight)</span>
                    <span className="text-[10px] font-normal text-red-400">用工作业绩击垮提问</span>
                  </button>

                  <button
                    onClick={() => handleBossChoiceSelection('escape')}
                    className="flex flex-col items-center justify-center py-4 px-3 rounded-xl border border-slate-500/20 bg-slate-950 text-slate-350 hover:bg-slate-800 transition text-xs font-bold leading-normal gap-1"
                  >
                    <span>🏃 逃跑 (Safe Retreat)</span>
                    <span className="text-[10px] font-normal text-slate-400">绕开发难离职躲避</span>
                  </button>

                  <button
                    onClick={() => handleBossChoiceSelection('accept')}
                    className="flex flex-col items-center justify-center py-4 px-3 rounded-xl border-amber-500/40 bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 text-amber-300 hover:from-amber-500/30 hover:to-yellow-500/30 transition text-xs font-bold leading-normal gap-1"
                  >
                    <span>🤝 接受并拥抱自我 (Acknowledge)</span>
                    <span className="text-[10px] font-normal text-amber-400 animate-pulse">卸下功利枷锁,拥抱本心</span>
                  </button>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="rounded-xl border border-white/10 bg-slate-950 p-4 space-y-4"
                >
                  <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
                    {bossChoiceResult}
                  </p>
                  
                  <div className="flex justify-end pt-2 border-t border-white/5">
                    <button
                      onClick={closeBossChoiceModal}
                      className="rounded bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/10 hover:bg-amber-400 transition"
                    >
                      {bossChoice === 'accept' ? '返回开启尘封宝箱' : '重新冷静选择'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* SCREEN 5: FINALE CREDITS AND CERTIFICATE SCHEME */}
          {gameState === 'credits' && (
            <motion.div
              key="credits"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              
              {/* Core summary typography block */}
              <div className="text-center space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/25 border border-yellow-405/40 text-yellow-300">
                  ★
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl leading-tight">
                  LEVEL 8 等级解锁 · ACHIEVEMENT UNLOCKED!
                </h2>
                <p className="text-xs tracking-widest text-[#FBBF24] font-mono font-bold uppercase">
                  勇攀高峰 · Climb Higher, Create Boundary-free
                </p>
                <div className="max-w-xl mx-auto border-t border-b border-white/5 py-4 leading-relaxed italic text-sm text-slate-300">
                  “八年前，我来到了这里寻找完美的答案。”<br />
                  “八年后，我终于发现，完美名牌和终点勋章从来不在陡峭的九天山顶。”<br />
                  <b className="text-white mt-1 block">“而是在这一路上顽强升级、磨出厚茧、内心丰盈的那个自己。”</b>
                </div>
              </div>

              {/* COMMEMORATIVE OFFICIAL ASCENT POSTER COVER IMAGE */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-col items-center justify-center space-y-3 py-2"
              >
                <div className="relative group max-w-lg w-full rounded-2xl overflow-hidden border-4 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)] bg-slate-900">
                  <img 
                    src={levelEightCover} 
                    alt="Yoyo Level 8 Climb Higher Poster" 
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300 font-retro-header">Official Ascent Commemorative Graphic</span>
                    <h3 className="text-sm font-black text-white font-cute-chinese mt-0.5">《LEVEL 8》 攀越巅峰合影纪念卡 · Yoyo 2026 荣誉登顶</h3>
                  </div>
                </div>
              </motion.div>

              {/* TWO BADGES PRESENTATION GRID: 2018 campus recruitee VS 2026 senior leader */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                
                {/* 2018 Intern Rookie ID Badge */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-slate-900/40 to-[#0c1328]/80 p-5 shadow-2xl relative flex flex-col justify-between"
                >
                  <div className="absolute top-4 right-4 text-[10px] bg-blue-500/10 px-2 py-0.5 rounded text-blue-400 font-mono">
                    2018 ROOKIE
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-3 border-blue-500/30 bg-slate-950 shadow-inner">
                      <img 
                        src={badge2018} 
                        alt="2018 Badge" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="border-t border-white/5 pt-3.5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">部门：</span>
                        <span className="text-slate-300 text-right">新人训练营 Bootcamp</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">初始装备：</span>
                        <span className="text-blue-400 font-bold">【好奇心（Curiosity）】</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 leading-normal font-sans">
                    “懵懂入舱的新人，背着沉沉的数据、陌生的智能协作表格，却能点亮飞书知识库，向未来发起第一次开局挑战。”
                  </div>
                </motion.div>

                {/* 2026 Veteran Singapore Campus HQ Lanyard */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="rounded-3xl border border-amber-500/25 bg-gradient-to-b from-amber-950/20 via-slate-900/40 to-[#271907]/80 p-5 shadow-2xl relative flex flex-col justify-between"
                >
                  <div className="absolute top-4 right-4 text-[10px] bg-amber-500/10 px-2 py-0.5 rounded text-amber-400 font-mono">
                    2026 VETERAN
                  </div>

                  <div className="space-y-4">
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-3 border-amber-500/30 bg-slate-950 shadow-inner">
                      <img 
                        src={badge2026} 
                        alt="2026 Badge" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="border-t border-white/5 pt-3.5 space-y-2 text-xs font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">成长历程：</span>
                        <span className="text-slate-300 text-right">从 2018 到 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">主线职务：</span>
                        <span className="text-slate-300 text-right">担任大型任务负责人</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">坚守底牌：</span>
                        <span className="text-amber-400 font-bold">【本源创造力及韧性探索】</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-white/5 text-[11px] text-slate-400 leading-normal font-sans">
                    “经历过风暴、泪水和智能大爆发，不再依靠级别作为唯一的保护，拥有了为了心中热爱而不断前行攀登的韧性力量。”
                  </div>
                </motion.div>

              </div>

              {/* LEVEL RE-ENTRY STAGE TICKETS PANEL */}
              <div className="rounded-3xl border border-white/10 bg-[#0b0f19]/85 p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <span>★</span>
                  <span>章节自由复盘点 (Jump Back Level Select)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  想念哪个时期的自己？随时可以重返任何历史时期去重新漫游或玩耍体验：
                </p>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-6 text-xs">
                  {GAME_LEVELS.map((lvl, index) => (
                    <button
                      key={lvl.id}
                      onClick={() => {
                        playSound.bounce();
                        setCurrentLevelIndex(index);
                        setGameState('playing');
                        setBossChoice(null);
                        setBossChoiceResult(null);
                      }}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center transition hover:bg-slate-800 hover:text-white"
                    >
                      <div className="text-[10px] text-blue-400 font-bold block">{lvl.year}</div>
                      <div className="mt-0.5 truncate text-[11px] font-sans font-bold text-slate-200">{lvl.title.substring(9)}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-center pt-3">
                  <button
                    onClick={handleRestartFullGame}
                    className="flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-500/25"
                  >
                    <span>重新开始八年完整升级之战</span>
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Humble professional credit margins footer - Anti-tech larping / clean & elegant design constraint */}
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-slate-500 relative z-10 font-sans">
        <p>© Yoyo (Yoyo Xiao). Spark Creative Contest 2026. All rights preserved.</p>
        <p className="mt-1 text-[10px] text-slate-650 font-mono">Singapore Global HQ · Singapore Permanent Resident</p>
      </footer>
    </div>
  );
}
