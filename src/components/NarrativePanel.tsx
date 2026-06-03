import React from 'react';
import { motion } from 'motion/react';
import { GameLevel, PlayerState } from '../types';
import { 
  ArrowRight, Shield, Award, HelpCircle, User, Sparkles, Sliders, Play, Rocket 
} from 'lucide-react';

interface NarrativePanelProps {
  level: GameLevel;
  playerState: PlayerState;
  gameState: 'playing' | 'level_complete' | 'level_intro';
  onNextLevel: () => void;
  onRestartLevel: () => void;
}

export default function NarrativePanel({
  level,
  playerState,
  gameState,
  onNextLevel,
  onRestartLevel
}: NarrativePanelProps) {
  
  return (
    <div className="flex flex-col gap-4 rounded-2xl border-4 border-slate-950 bg-[#0c122c]/90 p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.5)] md:p-5 font-sans">
      
      {/* Narrative Section Header */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-[#FBBF24] font-cute-chinese flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-yellow-400 fill-yellow-400 animate-pulse" />
          <span>故事与背景叙事 · BACKGROUND STORY</span>
        </h3>
        <p className="mt-1.5 text-xs text-slate-350 leading-relaxed italic">
          {level.introQuote}
        </p>
      </div>

      {/* HIGHLIGHT: NEW TIMELINE POLAROID MEMORIES RECREATION ALBUM (真实时光闪光相册) */}
      <div className="border-t border-b border-white/5 py-4 my-1 select-none">
        <h4 className="text-[11px] font-black tracking-wider text-indigo-400 font-cute-chinese mb-3 uppercase flex items-center justify-between">
          <span>✨ Yoyo 的时光成长相片手札 (Yoyo's Real Memories Polaroid)</span>
          <span className="text-[9px] bg-indigo-500/10 px-2 py-0.5 rounded text-indigo-300 font-bold font-mono">第 {level.id} 帧回忆</span>
        </h4>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Polaroid visual design representation card (8 columns) */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div 
              whileHover={{ rotate: 1, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative w-full max-w-[310px] bg-stone-50 border-3 border-amber-950/20 rounded-2xl p-3.5 shadow-[5px_5px_15px_rgba(0,0,0,0.6)] flex flex-col justify-between overflow-hidden"
              style={{ transform: "rotate(-1.5deg)" }}
            >
              {/* Glossy filter reflections layer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

              {/* Photo Area with specific CSS recreation drawing based on current level */}
              <div className="relative aspect-video w-full rounded-lg bg-zinc-950 overflow-hidden flex flex-col justify-center items-center p-2.5 shadow-inner border-2 border-amber-950/10">
                
                {/* LEVEL 1: Newbie workdesk photo */}
                {level.id === 1 && (
                  <div className="w-full h-full flex flex-col justify-between p-1.5 relative bg-gradient-to-b from-sky-950/80 to-slate-900">
                    <div className="flex justify-between items-center text-[8px] font-mono text-cyan-400">
                      <span>🖥️ YOANA'S FIRST WORKSTATION</span>
                      <span>BOOTCAMP 101</span>
                    </div>

                    {/* Workdesk item illustration */}
                    <div className="flex-1 flex justify-center items-end space-x-3 mb-2">
                      <div className="h-6 w-9 bg-zinc-800 rounded flex flex-col items-center justify-center border border-zinc-700 shadow relative">
                        <div className="w-6 h-4 bg-cyan-900 text-[6px] text-cyan-300 overflow-hidden font-mono flex items-center justify-center">LARK:DEV</div>
                        <div className="w-1 h-2 bg-zinc-800" />
                        <div className="absolute -top-3 -right-2 text-xs animate-bounce">📚</div>
                      </div>
                      <div className="text-xl animate-pulse">☕</div>
                      <div className="text-xl">🌵</div>
                    </div>

                    <div className="text-center text-[10px] text-amber-200 font-cute-chinese font-black tracking-wide bg-amber-500/10 py-0.5 rounded border border-amber-500/20">
                      获得新手装备：好奇心与飞书知识集 🚀
                    </div>
                  </div>
                )}

                {/* LEVEL 2: ByteDance Feishu Midnight chats recreation */}
                {level.id === 2 && (
                  <div className="w-full h-full flex flex-col justify-between p-1 text-[8px] font-mono text-slate-350 bg-slate-950 overflow-y-auto">
                    <div className="flex justify-between items-center text-[7px] text-indigo-400 border-b border-indigo-950/40 pb-1 mb-1 font-bold">
                      <span>💬 LARK CHAT: #OPERATIONS-ONLINE</span>
                      <span>BEIJING 23:42</span>
                    </div>
                    
                    {/* Chat Bubble log simulation */}
                    <div className="space-y-1 my-1.5 flex-1 flex flex-col justify-center">
                      <div className="flex items-start space-x-1">
                        <span className="text-rose-400 font-bold">Yoyo:</span>
                        <span className="bg-slate-900 px-1 py-0.5 rounded border border-indigo-950 text-[7px]">"等下哈 我上个活动" \ 23:42</span>
                      </div>
                      <div className="flex items-start space-x-1 pl-3">
                        <span className="text-blue-400 font-bold">Zara:</span>
                        <span className="bg-slate-900 px-1 py-0.5 rounded border border-indigo-950 text-[7px]">"好的，等后在北京上活动" \ 23:43</span>
                      </div>
                      <div className="flex items-start space-x-1">
                        <span className="text-rose-400 font-bold">Yoyo:</span>
                        <span className="bg-indigo-950/60 px-1 py-0.5 rounded border border-indigo-500/30 text-[7px] text-cyan-300">"纪念通宵下班 🌧️ 北京下了雨" \ 06:00</span>
                      </div>
                    </div>

                    <div className="text-center text-[9px] text-[#A855F7] font-bold bg-[#A855F7]/10 py-0.5 rounded border border-[#A855F7]/20 font-cute-chinese">
                      #熬夜上线中东与东南亚多元Campaign王战
                    </div>
                  </div>
                )}

                {/* LEVEL 3: Core Empathy Map & global sync */}
                {level.id === 3 && (
                  <div className="w-full h-full flex flex-col justify-between p-1.5 bg-gradient-to-tr from-slate-950 to-emerald-950">
                    <div className="flex justify-between items-center text-[8px] font-mono text-emerald-400">
                      <span>🌍 GLOBAL TEAM OKR SYNC</span>
                      <span>SINGAPORE-RIVADH</span>
                    </div>
                    
                    {/* Flight paths visual connector map */}
                    <div className="flex-1 flex justify-center items-center space-x-5 relative my-1">
                      <div className="text-center">
                        <div className="text-base">🇸🇬</div>
                        <span className="text-[7.5px] font-bold text-slate-400 block font-mono">HQ Site</span>
                      </div>
                      <div className="flex-1 h-0.5 border-dashed border-t border-emerald-400/50 animate-pulse relative">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px]">✈️</span>
                      </div>
                      <div className="text-center">
                        <div className="text-base">🇸🇦</div>
                        <span className="text-[7.5px] font-bold text-slate-400 block font-mono">Riyadh</span>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-emerald-300 font-cute-chinese font-black tracking-wide bg-emerald-500/10 py-0.5 rounded border border-emerald-500/20">
                      凝聚多文化团队：以同理心攻克偏见 🤝
                    </div>
                  </div>
                )}

                {/* LEVEL 4: Spooky lantern of Mist Forest */}
                {level.id === 4 && (
                  <div className="w-full h-full flex flex-col justify-between p-1.5 bg-gradient-to-b from-zinc-900 via-slate-950 to-zinc-900">
                    <div className="flex justify-between items-center text-[8px] font-mono text-amber-500">
                      <span>🌫️ FOREST OF APPREHENSION</span>
                      <span>SELF-RESILIENCE LOCK</span>
                    </div>

                    {/* Dark landscape with glowing lantern */}
                    <div className="flex-1 flex justify-center items-center space-x-3 my-2">
                      <div className="text-3xl animate-pulse filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">🕯️</div>
                      <div className="text-left space-y-1">
                        <span className="text-[8px] font-bold bg-amber-500/10 border border-amber-500/30 px-1 py-0.2 rounded text-amber-300 block">心魔自审中...</span>
                        <p className="text-[7px] text-slate-400 font-mono">"如果不靠红圈勋章，你是谁？"</p>
                      </div>
                    </div>

                    <div className="text-center text-[10px] text-rose-300 font-cute-chinese font-black tracking-wide bg-rose-500/10 py-0.5 rounded border border-rose-500/20">
                      流泪成长：破除对级别/赞许的表现执念 🧗
                    </div>
                  </div>
                )}

                {/* LEVEL 5: Co-creation Compiler machine */}
                {level.id === 5 && (
                  <div className="w-full h-full flex flex-col justify-between p-1.5 bg-gradient-to-tr from-slate-950 to-cyan-950">
                    <div className="flex justify-between items-center text-[8px] font-mono text-cyan-400">
                      <span>⚙️ AI INTELLIGENT MODEL SYNTAX</span>
                      <span>AIME PARTNER ACTIVE</span>
                    </div>

                    {/* Grid nodes flowing pattern */}
                    <div className="flex-1 flex justify-center items-center space-x-4 my-2 relative">
                      <span className="text-2xl animate-spin" style={{ animationDuration: "6s" }}>🧠</span>
                      <span className="text-indigo-400 font-mono animate-pulse text-[10px]">≪ ✖ COMBINE ✖ ≫</span>
                      <span className="text-2xl animate-bounce">🤖</span>
                    </div>

                    <div className="text-center text-[10px] text-cyan-300 font-cute-chinese font-black tracking-wide bg-cyan-500/10 py-0.5 rounded border border-cyan-500/20">
                      AI生产力爆发：十倍速脑暴编译器启动! ⚡
                    </div>
                  </div>
                )}

                {/* LEVEL 6: Lanyards side-by-side */}
                {level.id === 6 && (
                  <div className="w-full h-full flex justify-between items-stretch p-1.5 bg-gradient-to-b from-amber-950/20 via-slate-900 to-amber-950/20">
                    {/* 2018 Horizontal Lanyard badge */}
                    <div className="flex-1 flex flex-col justify-between p-1 bg-white rounded border border-blue-900/30 text-[7px] font-mono text-blue-900 mr-1 shadow-md">
                      <div className="bg-red-650 h-1.5 w-full bg-red-600 rounded-sm mb-1" />
                      <div className="font-extrabold text-center uppercase tracking-tighter text-[8px]">字节跳动</div>
                      <div className="text-center font-bold text-slate-800 text-[8px] my-1">YOANA</div>
                      <div className="text-[6px] text-slate-400 font-sans text-center">CAMPUS 2018</div>
                    </div>

                    {/* 2026 Vertical PR Singapore Lanyard badge */}
                    <div className="flex-1 flex flex-col justify-between p-1 bg-slate-950 rounded border border-amber-500/30 text-[7px] font-mono text-amber-400 ml-1 shadow-md">
                      <div className="bg-cyan-600 h-1 w-full rounded-sm mb-1" />
                      <div className="text-center font-black tracking-tight text-[8px]">LARK SGP</div>
                      <div className="text-center font-extrabold text-[#FDE047] text-[8px] my-0.5">YOANA XIAO</div>
                      <div className="text-[5.5px] text-slate-500 font-sans text-center">SINGAPORE HQ VIP</div>
                    </div>
                  </div>
                )}

              </div>

              {/* Polaroid White Margin and handwritten commentary caption underneath */}
              <div className="mt-2.5 pt-2 border-t border-stone-200/60 pb-1 flex flex-col justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block font-retro-header mb-1 text-center">
                  -- ARCHIVAL ALBUM FRAME --
                </span>
                <p className="text-[11px] font-cute-chinese font-black text-slate-800 leading-normal text-justify tracking-wide italic">
                  {level.id === 1 && "“2018 新人报到第一个办公工位！工位挺宽敞，看着那张崭新的工牌，我告诉自己要勇敢出发！”"}
                  {level.id === 2 && "“‘等下哈我上个活动’... 那些通宵等北京上线大campaign、伴随着雨夜声音拼搏的日子，成了心中滚烫的荣光。”"}
                  {level.id === 3 && "“从个人冲锋到带领跨国团队。同理心一页通文档成了多国业务最坚强的桥梁，解决‘人与人’的隔阂偏见。”"}
                  {level.id === 4 && "“2025在最迷茫、最自省的迷雾关卡：失去晋升赞同和外界光环的我，发现真正的底气深藏在打不倒的‘韧性’底座。”"}
                  {level.id === 5 && "“AI风潮大爆发！风神AI智能营销与脑暴编译器开始爆发式增长。工具赋予我们的创意闪耀翅膀，十倍提效飞跃！”"}
                  {level.id === 6 && "“翻山越岭，没有繁密财富礼券与赞誉晋升指标。两只工作牌相对的那一刻，我收获了内心至高无上的平静安和。”"}
                </p>
              </div>

            </motion.div>
          </div>

          {/* Interactive narration analysis (6 columns) */}
          <div className="lg:col-span-6 space-y-3 font-sans text-xs">
            <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-amber-400 block tracking-widest font-retro-header">💡 YOYO'S RETROSPECTIVE / Yoyo 的心语</span>
              <p className="text-slate-300 leading-relaxed font-sans text-justify">
                {level.id === 1 && "“2018年，我是一个刚刚走出校园、背着双肩包的北京小白。全球化复杂的英语业务冷启动，像极了马里奥的第一关新手村，满是迷雾与‘未知怪兽’！唯有依靠着强烈的好奇心去吸收多维知识库，在碰撞与弹跳中收获成长经验值。”"}
                {level.id === 2 && "“在2019-2022年‘活动运营王国’章节，我见证了中东与东南亚两块流量战场的飞速膨胀。每一个PK促合活动上线，背后都是与多方团队的通宵周旋对齐。我用多维表格理顺繁杂指标，熬过暴雨夜，打倒‘混乱怪’！”"}
                {level.id === 3 && "“2023-2025年，我踏上了‘领导力高塔’。带团队后，我惊异地发现在跨背景、多元立场的重合业务中，硬性指标并不是最难的，跨立场的偏见、执行的拖延才是一堵墙。我们高擎‘同理心徽章’，建立无国界信任！”"}
                {level.id === 4 && "“2025年‘迷雾森林’是我攀越的最大关口。大环境转变下的不确定感，犹如铺天盖地的‘恐惧心魔’。在心跳的紧缩声中，我领略了在虚名、职级的光环之外，自我的本心力量——用眼泪浇灌出最刺穿风暴的防雷韧性长盾。”"}
                {level.id === 5 && "“踏入2026年，AI智能化之水注入冒险。智能风神与高级脑暴编译器大快步铺开。掌握‘人机共创’，让我们在智能洪荒狂潮里飞上了十倍效能的巅峰！”"}
                {level.id === 6 && "“终于到达了双子高巅，与八年前后的自我握手、融合。这八年不仅是我一路打怪升级、为客户创造无限价值、积累硬实力勋章的足印，更是在这场冒险中探索本真自由、收获幸福和弦的时光赞誉！”"}
              </p>
            </div>
            
            <div className="flex items-center space-x-2 text-indigo-400 text-[11px] font-black px-1">
              <span>➔</span>
              <span>翻阅上面这帧 Polaroid 尘封底片，点击下方快速跳跃大冒险目标：</span>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Level Objectives Grid */}
      <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-3 sm:grid-cols-2">
        
        {/* Objectives / Goals */}
        <div 
          style={{ backgroundColor: '#eef4e8' }}
          className="space-y-2 rounded-xl p-3.5 border-3 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]"
        >
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center space-x-2 font-cute-chinese">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>关卡挑战任务 (Goals)</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-350">
            {level.id === 1 && (
              <>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold">✔</span>
                  <span>顶起黄色砖块 <b>？</b> 获得飞书知识库</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold">✔</span>
                  <span>绕开或踩扁 <b>未知怪 (Unknown)</b> 冲破迷茫</span>
                </li>
              </>
            )}
            {level.id === 2 && (
              <>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-purple-400 font-bold">✔</span>
                  <span>收集 <b>运营榜单、数据看板</b> 等提效利器</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-purple-400 font-bold">✔</span>
                  <span>踩踏消灭 <b>混乱怪 (Chaos)</b> 与繁琐杂务</span>
                </li>
              </>
            )}
            {level.id === 3 && (
              <>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold">✔</span>
                  <span>获取 <b>同理心徽章</b> 和 <b>一页通文档</b></span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-emerald-400 font-bold">✔</span>
                  <span>凝聚全球多文化团队，消灭 <b>冲突怪与拖延怪</b></span>
                </li>
              </>
            )}
            {level.id === 4 && (
              <>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-zinc-400 font-bold">✔</span>
                  <span>拾取 <b>独立精神</b>、流着泪水勇敢朝右前进</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-red-400 font-bold">✔</span>
                  <span>寻找并直面 <b>恐惧心魔 (Fear)</b>，在沉默中突破它</span>
                </li>
              </>
            )}
            {level.id === 5 && (
              <>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-cyan-400 font-bold">✔</span>
                  <span>解锁 <b>风神、AIME、AI Coding 编译器</b> 插件</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-cyan-400 font-bold">✔</span>
                  <span>与AI伙伴紧密合击，彻底打败 <b>信息洪荒怪</b></span>
                </li>
              </>
            )}
            {level.id === 6 && (
              <>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-amber-400 font-bold">✔</span>
                  <span>向前方高耸的绝顶大步进军，寻找 <b>镜像 Yoyo</b></span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[10px] text-amber-400 font-bold">✔</span>
                  <span>面对其关于自我选择与人生价值的终极灵魂提问</span>
                </li>
              </>
            )}
            <li className="flex items-start space-x-1.5 text-[11px] text-slate-500 font-mono">
              <span>➔</span>
              <span>走至最右方边缘或触碰终点过关</span>
            </li>
          </ul>
        </div>

        {/* Level obstacles mapping explanation */}
        <div 
          style={{ backgroundColor: '#f9f5f5' }}
          className="space-y-2 rounded-xl p-3.5 border-3 border-slate-950 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.4)]"
        >
          <h4 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center space-x-2 font-cute-chinese">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <span>职场隐喻 (Intangible Obstacles)</span>
          </h4>
          <div className="space-y-1.5 text-xs text-slate-350">
            {level.id === 1 && (
              <p><b>未知怪 (Unknown)</b>：第一天接触全球化业务冷启动以及全英文复杂环境的焦灼与自省。我们需要用【好奇心】将未知转为深知。</p>
            )}
            {level.id === 2 && (
              <p><b>混乱怪 (Chaos)</b>：跨国跨语种复杂多项目并发。需要通过【系统思维】重塑规范流程，将创意通过工具规模化推广。</p>
            )}
            {level.id === 3 && (
              <p><b>People (组织障碍)</b>：业务越往上，真正的天花板不在逻辑，而在跨国多元背景人员之间的沟通偏见。需要凝聚与共情力。</p>
            )}
            {level.id === 4 && (
              <p><b>自我恐惧 (Fear)</b>：在不确定性、生活变故与重度职业压力下泛起的失落与怀疑。唯一的通路是和它共处，锤炼【韧性】。</p>
            )}
            {level.id === 5 && (
              <p><b>信息过载/旧流程</b>：AI时代的重构痛苦。我们要抛弃对肌肉记忆式繁杂手工流程的贪恋爱惜，掌握【人机共创】技能。</p>
            )}
            {level.id === 6 && (
              <p><b>双生镜像 (The Self)</b>：名利赞誉与真正的创造精神之间的反差冲突。只有拥抱本心、回归创造的喜悦方能一窥答案。</p>
            )}
          </div>
        </div>

      </div>

      {/* Success Clearance modal overlay inside screen panel */}
      {gameState === 'level_complete' && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4 text-emerald-250 animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Award className="h-5 w-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-300 uppercase tracking-wide">
                LEVEL CLEAR! 顺利通关
              </h4>
              <p className="mt-0.5 text-xs text-emerald-200">
                {level.completedQuote}
              </p>
            </div>
          </div>
          
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-500/20 pt-3">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] bg-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                获得技能点: +1
              </span>
              <span className="text-xs font-bold text-slate-100">
                【{level.acquiredSkill.name}】
              </span>
            </div>
            <button
              onClick={onNextLevel}
              className="flex items-center space-x-1 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400"
            >
              <span>{level.id === 6 ? '进入终局反思 ➔' : '进入下一关 ➔'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
