import React from 'react';
import { PlayerState, GameLevel } from '../types';
import { 
  Volume2, VolumeX, Zap, Award, Compass, GitFork, 
  Users, ShieldAlert, Cpu, Eye, BookOpen, Sliders, Rocket, Flame, Code, Wind, Heart
} from 'lucide-react';

interface RetroHUDProps {
  level: GameLevel;
  playerState: PlayerState;
  isAutoPlay: boolean;
  setIsAutoPlay: (val: boolean) => void;
  muted: boolean;
  setMuted: (val: boolean) => void;
}

export default function RetroHUD({
  level,
  playerState,
  isAutoPlay,
  setIsAutoPlay,
  muted,
  setMuted
}: RetroHUDProps) {
  
  // Icon finder helper
  const getSkillIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'compass': return <Compass className="h-4 w-4" />;
      case 'gitfork': return <GitFork className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'shieldalert': return <ShieldAlert className="h-4 w-4" />;
      case 'cpu': return <Cpu className="h-4 w-4" />;
      case 'eye': return <Eye className="h-4 w-4" />;
      default: return <Award className="h-4 w-4" />;
    }
  };

  const getToolIcon = (name: string) => {
    if (name.includes('知识库')) return <BookOpen className="h-3 w-3 text-sky-400" />;
    if (name.includes('看板') || name.includes('榜单')) return <Sliders className="h-3 w-3 text-purple-400" />;
    if (name.includes('Campaign') || name.includes('文档')) return <Rocket className="h-3 w-3 text-red-400" />;
    if (name.includes('心') || name.includes('勇气')) return <Heart className="h-3 w-3 text-emerald-400" />;
    if (name.includes('风神') || name.includes('AIME')) return <Wind className="h-3 w-3 text-cyan-400" />;
    if (name.includes('Code')) return <Code className="h-3 w-3 text-emerald-300" />;
    return <Zap className="h-3 w-3 text-yellow-400" />;
  };

  return (
    <div className="w-full rounded-2xl border-4 border-slate-950 bg-[#0c122c]/90 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Level & Year Indicator Block */}
        <div className="flex items-center space-x-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-500 border-3 border-slate-950 font-retro-header text-sm font-black text-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
            {level.id === 6 ? '★' : level.id}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md border-2 border-slate-950 bg-blue-500 px-2 py-0.5 font-retro-header text-[8px] font-bold text-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                {level.year}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                CAMPUS RECRUIT UPGRADE
              </span>
            </div>
            <h2 className="text-sm font-black text-white md:text-base font-cute-chinese tracking-wide mt-0.5">
              {level.title}
            </h2>
          </div>
        </div>

        {/* Growth XP Level Meter */}
        <div className="flex flex-1 max-w-xs flex-col gap-1.5">
          <div className="flex justify-between text-[11px] font-mono">
            <span className="text-slate-400 font-bold font-cute-chinese tracking-wide">Yoyo 阶段成长：</span>
            <span className="font-bold text-yellow-400 font-retro-header text-[8px]">{playerState.growth} XP</span>
          </div>
          <div className="h-4.5 w-full overflow-hidden rounded-md bg-slate-950 border-2 border-slate-950 p-[1.5px] shadow-[1.5px_1.5px_0px_0px_rgba(255,255,255,0.06)]">
            <div 
              className="h-full rounded-sm bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-300 pattern-isometric"
              style={{ width: `${Math.min(100, (playerState.growth / 120) * 100)}%` }}
            />
          </div>
        </div>

        {/* Dynamic audio configuration, mute and auto-pilot widgets */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Autoplay / AI Assist Button toggle */}
          <button 
            type="button"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-black tracking-wide mario-btn font-cute-chinese uppercase transition ${
              isAutoPlay 
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300' 
                : 'bg-slate-850 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${isAutoPlay ? 'fill-slate-950 text-slate-950' : ''}`} />
            <span>{isAutoPlay ? 'AI 托管中 (AUTO)' : '经典摇杆模式'}</span>
          </button>

          {/* Sound Toggle */}
          <button 
            type="button"
            onClick={() => setMuted(!muted)}
            className="flex items-center justify-center rounded-lg bg-slate-900 text-slate-200 px-3 py-1.5 mario-btn transition hover:bg-slate-850"
            title={muted ? '开启环境声效' : '静音'}
          >
            {muted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-green-400" />}
          </button>
        </div>

      </div>

      {/* Skills list & tools shelf strip */}
      <div className="mt-4 grid grid-cols-1 gap-2 border-t border-white/5 pt-3.5 sm:grid-cols-2">
        {/* Unlocked badges list */}
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            已解锁职业技能 Badges ({playerState.skills.length})
          </span>
          <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
            {playerState.skills.length === 0 ? (
              <span className="text-xs font-mono text-slate-600">在关卡尾声习得...</span>
            ) : (
              playerState.skills.map((sk) => (
                <div key={sk} className="flex items-center space-x-1.5 rounded-full border border-blue-500/20 bg-blue-950/50 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 block" />
                  <span>{sk}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Collected core tools shelf */}
        <div className="space-y-1 sm:border-l sm:border-white/5 sm:pl-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
            飞书及工作利器 Tools ({playerState.collectedTools.length})
          </span>
          <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
            {playerState.collectedTools.length === 0 ? (
              <span className="text-xs font-mono text-slate-600">顶起黄色？砖块或触碰水晶卡片收集...</span>
            ) : (
              playerState.collectedTools.map((t) => (
                <div key={t} className="flex items-center space-x-1 rounded bg-slate-950/90 border border-slate-800 px-2 py-0.5 text-[11px] text-slate-300 font-mono">
                  {getToolIcon(t)}
                  <span>{t}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
