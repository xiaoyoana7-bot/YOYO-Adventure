import { GameLevel } from '../types';

export const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    year: '2018',
    title: 'LEVEL 1：新手村',
    subtitle: '第一次进入字节跳动',
    ambientColor: 'from-blue-900/40 via-[#0e1726]/90 to-[#0B0F19]',
    secondaryColor: 'text-blue-400 border-blue-500/30',
    platformColor: '#2563EB', // Blue theme
    introQuote: '“第一天入职，感到有些紧张和迷茫，对未来充满了未知。”',
    completedQuote: '解锁技能【好奇心】！你通过获取飞书知识库，掌握了快速学习的能力。',
    mapWidth: 1600,
    acquiredSkill: {
      name: '好奇心',
      description: '保持对事务的探索渴望，点亮快速学习（飞书知识库）的能力。',
      icon: 'Compass'
    },
    platforms: [
      { id: 'l1-p1', x: 0, y: 400, width: 400, height: 60, type: 'ground' },
      { id: 'l1-brick1', x: 280, y: 260, width: 60, height: 30, type: 'brick', content: '飞书知识库' },
      { id: 'l1-p2', x: 480, y: 350, width: 300, height: 120, type: 'office' },
      { id: 'l1-p3', x: 850, y: 280, width: 250, height: 30, type: 'cloud' },
      { id: 'l1-p4', x: 1150, y: 380, width: 450, height: 80, type: 'ground' }
    ],
    collectibles: [
      { id: 'l1-c1', x: 295, y: 210, width: 30, height: 30, type: 'knowledge', name: '校招生训练营手册', description: '记录了字节范儿与新人之旅的必备手册。', icon: 'BookOpen', pickedUp: false },
      { id: 'l1-c2', x: 600, y: 290, width: 30, height: 30, type: 'energy', name: '第一张工牌', description: '2018年校招生工牌，冒险之旅的证明。', icon: 'IdCard', pickedUp: false },
      { id: 'l1-c3', x: 970, y: 220, width: 30, height: 30, type: 'badge', name: '全球视野', description: '飞越地图，胸怀全球业务。', icon: 'Globe', pickedUp: false }
    ],
    enemies: [
      { id: 'l1-e1', x: 550, y: 310, width: 40, height: 40, type: 'unknown', name: '未知怪', hp: 1, maxHp: 1, speed: 1.5, minX: 490, maxX: 750, direction: 1, isDefeated: false, description: '对全新环境、工作职责以及未来的迷茫。' },
      { id: 'l1-e2', x: 1250, y: 340, width: 40, height: 40, type: 'unknown', name: '未知怪', hp: 1, maxHp: 1, speed: 2, minX: 1180, maxX: 1450, direction: -1, isDefeated: false, description: '对陌生业务和全球化冷启动的畏惧。' }
    ],
    dialogues: [
      { id: 'l1-d1', triggerX: 10, text: ['“欢迎来到字节跳动。这里一切都是全新的。”', '“你的冒险正式开始。用好奇心去探索一切吧！”'], speaker: 'System', hasTriggered: false },
      { id: 'l1-d2', triggerX: 250, text: ['“哇，上面有一个闪闪发光的砖块，跳起来顶它试试！”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l1-d3', triggerX: 750, text: ['“新人不要怕，有不懂的就在飞书知识库搜索！”'], speaker: 'Senior', hasTriggered: false }
    ]
  },
  {
    id: 2,
    year: '2019-2022',
    title: 'LEVEL 2：Campaign王国',
    subtitle: '学习创造业务价值',
    ambientColor: 'from-[#1e1b4b]/50 via-[#311042]/50 to-[#0B0F19]',
    secondaryColor: 'text-purple-400 border-purple-500/30',
    platformColor: '#7C3AED', // Purple Theme
    introQuote: '“投身国际化业务，经历中东及东南亚的冷启动、PK赛与大型 Campaign。我们需要学会掌控复杂性。”',
    completedQuote: '解锁技能【系统思维】！你获得了【数据看板】等工具，学会了把复杂的大型项目拆解清楚，批量复制。',
    mapWidth: 1600,
    acquiredSkill: {
      name: '系统思维',
      description: '掌握拆解复杂多线程项目的核心思维，让创意能够通过规模化来放大价值。',
      icon: 'GitFork'
    },
    platforms: [
      { id: 'l2-p1', x: 0, y: 400, width: 350, height: 60, type: 'ground' },
      { id: 'l2-p2', x: 420, y: 320, width: 250, height: 40, type: 'normal' },
      { id: 'l2-brick1', x: 500, y: 180, width: 60, height: 30, type: 'brick', content: '数据看板' },
      { id: 'l2-p3', x: 740, y: 240, width: 250, height: 40, type: 'normal' },
      { id: 'l2-brick2', x: 800, y: 120, width: 60, height: 30, type: 'brick', content: '飞书文档' },
      { id: 'l2-p4', x: 1080, y: 350, width: 520, height: 100, type: 'ground' }
    ],
    collectibles: [
      { id: 'l2-c1', x: 450, y: 270, width: 30, height: 30, type: 'tool', name: '运营榜单', description: '实现用户PK赛与活跃度增长的强大利器。', icon: 'Sliders', pickedUp: false },
      { id: 'l2-c2', x: 920, y: 190, width: 30, height: 30, type: 'energy', name: '国际化能量', description: '中东与东南亚市场拓展中积攒的庞大经验值。', icon: 'Sparkles', pickedUp: false },
      { id: 'l2-c3', x: 1250, y: 300, width: 30, height: 30, type: 'tool', name: '大型 Campaign 方案', description: '实现业务几何级增长和创意规模化的核心底牌。', icon: 'Rocket', pickedUp: false }
    ],
    enemies: [
      { id: 'l2-e1', x: 500, y: 280, width: 45, height: 45, type: 'chaos', name: '混乱怪', hp: 2, maxHp: 2, speed: 1.8, minX: 430, maxX: 630, direction: 1, isDefeated: false, description: '面对跨时区协作、各语种需求和瞬息万变的突发状况。' },
      { id: 'l2-e2', x: 1210, y: 300, width: 50, height: 50, type: 'chaos', name: '繁琐怪', hp: 1, maxHp: 1, speed: 2.2, minX: 1100, maxX: 1480, direction: -1, isDefeated: false, description: '多线并发的操作细节，缺乏系统化沉淀时的手忙脚乱。' }
    ],
    dialogues: [
      { id: 'l2-d1', triggerX: 10, text: ['“我们的业务正飞速往中东和东南亚扩展！”', '“创意很重要，但让创意规模化更重要。”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l2-d2', triggerX: 430, text: ['“面对多线程混乱的活动，我更需要建立规范化的工具。”', '“跳起来顶开那块砖，也许有可以提效的工具落下来。”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l2-d3', triggerX: 1080, text: ['“这不仅是一场本地作战，更是一次打通多国协作的系统性攻坚！”'], speaker: 'System', hasTriggered: false }
    ]
  },
  {
    id: 3,
    year: '2023-2025',
    title: 'LEVEL 3：领导力高塔',
    subtitle: '开启带团队、多方组织协作之路',
    ambientColor: 'from-[#064e3b]/40 via-[#111827]/90 to-[#0B0F19]',
    secondaryColor: 'text-emerald-400 border-emerald-500/30',
    platformColor: '#059669', // Emerald Theme
    introQuote: '“从个人创造力到带领团队冲锋。在这座高塔里，我们要解决的最难的问题，不再是业务，而是人与人之间的共识。”',
    completedQuote: '解锁技能组合【领导力 · 共情力 · 沟通力】！你学会了通过同理心与清晰的目标，凝聚全球团队力量。',
    mapWidth: 1600,
    acquiredSkill: {
      name: '领导力、共情与沟通',
      description: '理解人的需求，统一语言与使命，在多文化背景下达成一致目标。',
      icon: 'Users'
    },
    platforms: [
      { id: 'l3-p1', x: 0, y: 400, width: 350, height: 60, type: 'ground' },
      { id: 'l3-p2', x: 400, y: 310, width: 220, height: 30, type: 'normal' },
      { id: 'l3-p3', x: 680, y: 220, width: 220, height: 30, type: 'normal' },
      { id: 'l3-p4', x: 960, y: 320, width: 200, height: 30, type: 'normal' },
      { id: 'l3-p5', x: 1220, y: 400, width: 380, height: 60, type: 'ground' }
    ],
    collectibles: [
      { id: 'l3-c1', x: 490, y: 260, width: 30, height: 30, type: 'badge', name: '同理心徽章', description: '设身处地理解团队成员和跨部门伙伴的感受。', icon: 'Heart', pickedUp: false },
      { id: 'l3-c2', x: 770, y: 170, width: 30, height: 30, type: 'badge', name: '一页通文档 (1-Pager)', description: '对齐多方共识的终极极简武器。', icon: 'FileText', pickedUp: false },
      { id: 'l3-c3', x: 1400, y: 340, width: 30, height: 30, type: 'tool', name: '团队愿景', description: '激励和凝聚全员向终点持续攀登的火炬。', icon: 'Target', pickedUp: false }
    ],
    enemies: [
      { id: 'l3-e1', x: 450, y: 265, width: 45, height: 45, type: 'chaos', name: '冲突怪', hp: 2, maxHp: 2, speed: 1.4, minX: 410, maxX: 590, direction: 1, isDefeated: false, description: '多国团队对策略的意见不合，或者跨组资源争夺。' },
      { id: 'l3-e2', x: 780, y: 175, width: 45, height: 45, type: 'chaos', name: '拖延怪', hp: 2, maxHp: 2, speed: 1.6, minX: 690, maxX: 870, direction: -1, isDefeated: false, description: '面对跨国长周期项目时的行动迟缓与动力不足。' },
      { id: 'l3-e3', x: 1020, y: 275, width: 45, height: 45, type: 'chaos', name: '误解怪', hp: 2, maxHp: 2, speed: 2.0, minX: 970, maxX: 1140, direction: 1, isDefeated: false, description: '因语言阻碍、文化差异和非对口协作导致的理解跑偏。' }
    ],
    dialogues: [
      { id: 'l3-d1', triggerX: 10, text: ['“带团队和推跨组织协作后，挑战截然不同了。”', '“最难解决的不是硬性的业务，而是软性的人心与共识。”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l3-d2', triggerX: 500, text: ['“我们需要用沟通、倾听和同理心，而非‘命令’去带领伙伴。”'], speaker: 'Senior', hasTriggered: false },
      { id: 'l3-d3', triggerX: 1250, text: ['“把大家都召集起来吧，写下共同的愿景，一同勇攀高峰！”'], speaker: 'Yoyo', hasTriggered: false }
    ]
  },
  {
    id: 4,
    year: '2025',
    title: 'LEVEL 4：迷雾森林',
    subtitle: '直面人生的低谷与内心恐惧',
    ambientColor: 'from-[#0f172a] via-[#020617] to-[#020617]', // Extremely dark
    secondaryColor: 'text-zinc-500 border-zinc-700',
    platformColor: '#3F3F46', // Cool gray Theme
    introQuote: '“当遭遇未来规划、迷茫与内心深处压力的重重交织，森林升起了迷雾。这是一场与自己心魔的对峙。”',
    completedQuote: '解锁至关重要的基础能力【韧性】！在最漆黑的迷雾中，即使看不见终点，你依旧坚定地迈出了每一步。',
    mapWidth: 1600,
    acquiredSkill: {
      name: '韧性 (Resilience)',
      description: '在被重压逼到极限时，保持自省，哪怕步履维艰，也绝不放弃向前的力量。',
      icon: 'ShieldAlert'
    },
    platforms: [
      { id: 'l4-p1', x: 0, y: 400, width: 400, height: 60, type: 'ground' },
      { id: 'l4-p2', x: 480, y: 320, width: 300, height: 30, type: 'normal' },
      { id: 'l4-p3', x: 840, y: 250, width: 350, height: 30, type: 'normal' },
      { id: 'l4-p4', x: 1250, y: 400, width: 350, height: 60, type: 'ground' }
    ],
    collectibles: [
      { id: 'l4-c1', x: 620, y: 260, width: 30, height: 30, type: 'energy', name: '独立自强的心灵', description: '在迷航的夜晚，学会和寂寞与迷茫握手言和。', icon: 'Flame', pickedUp: false },
      { id: 'l4-c2', x: 1000, y: 190, width: 30, height: 30, type: 'badge', name: '勇气之泪', description: '接受生命中可能出现的脆弱与不完美。', icon: 'Shield', pickedUp: false }
    ],
    enemies: [
      // Fear boss placed at near end
      { id: 'l4-boss-fear', x: 1350, y: 310, width: 70, height: 70, type: 'fear', name: '恐惧心魔', hp: 3, maxHp: 3, speed: 0.5, minX: 1300, maxX: 1550, direction: -1, isDefeated: false, description: '内心的恐惧。它不会主动攻击你，但它说的话会让你窒息。' }
    ],
    dialogues: [
      { id: 'l4-d1', triggerX: 10, text: ['“好黑……周围的景象变得好荒凉。”', '“我做的一切选择都有意义吗？”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l4-d2', triggerX: 600, text: ['“有些路，必须在看不见终点的时候继续向前走。”', '“不要停下，Yoyo。”'], speaker: 'System', hasTriggered: false },
      { id: 'l4-d3', triggerX: 1200, text: [
        '“‘你是不是其实根本不够优秀？’”，虚空中传来冷笑。',
        '“‘如果你失去了目前的职级和光环，你还是谁？’”，心魔贴着耳朵低语。',
        '“……别听它的！勇敢面对它，用脚下的坚实步伐超越它！”'
      ], speaker: 'Fear', hasTriggered: false }
    ]
  },
  {
    id: 5,
    year: '2025-2026',
    title: 'LEVEL 5：AI未来城',
    subtitle: '技术革命大爆炸，寻找新的协作者',
    ambientColor: 'from-[#1e3a8a]/40 via-[#0369a1]/40 to-[#0B0F19]',
    secondaryColor: 'text-sky-400 border-sky-500/30',
    platformColor: '#0EA5E9', // Sky blue cyan theme
    introQuote: '“2025年AI浪潮呼啸而至。在这里，各种各样的AI精灵出现在你身边。你无需对抗科技，而应与之执手同行。”',
    completedQuote: '解锁前沿技能【人机共创力】！你成功驾驭了 AIME、风神、AI coding 及 Search 工具，获得了十倍效率的放大增幅。',
    mapWidth: 1600,
    acquiredSkill: {
      name: '人机共创 (Co-Creation)',
      description: '掌握利用AI精灵（AIME、风神等）重构工作流，让AI放大你的无边界想象力。',
      icon: 'Cpu'
    },
    platforms: [
      { id: 'l5-p1', x: 0, y: 400, width: 350, height: 60, type: 'ground' },
      { id: 'l5-brick1', x: 260, y: 250, width: 60, height: 30, type: 'brick', content: 'AIME/风神精灵' },
      { id: 'l5-p2', x: 420, y: 310, width: 300, height: 40, type: 'normal' },
      { id: 'l5-brick2', x: 550, y: 160, width: 60, height: 30, type: 'brick', content: 'AI Coding伙伴' },
      { id: 'l5-p3', x: 790, y: 220, width: 280, height: 40, type: 'normal' },
      { id: 'l5-p4', x: 1140, y: 380, width: 460, height: 80, type: 'ground' }
    ],
    collectibles: [
      { id: 'l5-c1', x: 275, y: 190, width: 30, height: 30, type: 'tool', name: '风神智能引擎', description: '赋能国际化业务，实现前沿营销、高效出海的多模态助手。', icon: 'Wind', pickedUp: false },
      { id: 'l5-c2', x: 565, y: 100, width: 30, height: 30, type: 'tool', name: 'AI Coding 编译器', description: '代码生成及部署调试，以前要花数周的开发现在可在转瞬完成。', icon: 'Code', pickedUp: false },
      { id: 'l5-c3', x: 920, y: 160, width: 30, height: 30, type: 'tool', name: 'AI 搜索 & 智能写作', description: '海量深度信息凝练，激发文字无限文采。', icon: 'Sparkles', pickedUp: false }
    ],
    enemies: [
      { id: 'l5-e1', x: 500, y: 260, width: 40, height: 40, type: 'unknown', name: '信息洪荒怪', hp: 2, maxHp: 2, speed: 1.6, minX: 430, maxX: 700, direction: 1, isDefeated: false, description: 'AI席卷而来带来极其庞大的新信息量负载。' },
      { id: 'l5-e2', x: 1220, y: 320, width: 40, height: 40, type: 'unknown', name: '习惯阻碍壁垒', hp: 2, maxHp: 2, speed: 2.0, minX: 1160, maxX: 1450, direction: -1, isDefeated: false, description: '固守陈旧流程、拒不使用智能提效方式的思维惯性。' }
    ],
    dialogues: [
      { id: 'l5-d1', triggerX: 10, text: ['“那是……未来的空中光轨吗？！”', '“这个时代充满了新奇而璀璨的AI精灵。我们要和它们共生协创！”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l5-d2', triggerX: 450, text: ['“AI不会替代创造力。”', '“它是用来成倍甚至是十倍放大你的创造力的放大器。”'], speaker: 'System', hasTriggered: false },
      { id: 'l5-d3', triggerX: 1150, text: ['“我已经和AI融合了！现在，我更加有底气去登上属于我的‘创造力之巅’！”'], speaker: 'Yoyo', hasTriggered: false }
    ]
  },
  {
    id: 6,
    year: '2026',
    title: 'LEVEL 6：创造力之巅',
    subtitle: '终极镜像自省，寻找登高真谛',
    ambientColor: 'from-[#020617] via-[#1e1b4b]/80 to-[#311042]/40', // Beautiful cosmic sunset stars
    secondaryColor: 'text-amber-400 border-amber-500/30',
    platformColor: '#D97706', // Gold Theme
    introQuote: '“你终于攀登上了绝顶。在这里，没有别的怪物了，唯有漫天星幕下你的倒影。她静静凝视着你，问出了那些最初的终极问题。”',
    completedQuote: '你作出了选择！解开心结，通向自我的完整。你完成了 LEVEL 8 等级超越！',
    mapWidth: 1200,
    acquiredSkill: {
      name: '本源创造力 (Pure Creativity)',
      description: '抛开一切外界框架枷锁，为了内心深处纯粹的渴望去探索世界、终身攀登。',
      icon: 'Eye'
    },
    platforms: [
      { id: 'l6-p1', x: 0, y: 400, width: 600, height: 60, type: 'ground' },
      // Boss platform
      { id: 'l6-p2', x: 700, y: 350, width: 500, height: 110, type: 'ground' }
    ],
    collectibles: [
      // Only chest
      { id: 'l6-chest', x: 980, y: 280, width: 50, height: 50, type: 'badge', name: '神秘的成长宝箱', description: '静静放置在山巅之上的老木质宝箱。它并没有锁，但是只有你拥抱真相时方可开启。', icon: 'Gift', pickedUp: false }
    ],
    enemies: [
      // Mirror Yoyo boss (does not move, just talks)
      { id: 'l6-boss-mirror', x: 820, y: 260, width: 60, height: 90, type: 'mirror', name: '镜像 Yoyo', hp: 999, maxHp: 999, speed: 0, minX: 810, maxX: 830, direction: 1, isDefeated: false, description: '你的镜中双生自我。' }
    ],
    dialogues: [
      { id: 'l6-d1', triggerX: 10, text: ['“呼……风越来越大了。我，真的登上最高峰了……”', '“这里，静得只能听见自己的心跳。”'], speaker: 'Yoyo', hasTriggered: false },
      { id: 'l6-d2', triggerX: 620, text: [
        '“‘八年了，Yoyo。你确实走到了很高的阶梯。’”，星空里的镜像轻声说。',
        '“‘可我问你：如果没有职级呢？’”，她微笑着发问。',
        '“‘如果没有绩效、没有这些光环、没有外界评定的标签与评级……’”，字字敲在心灵。',
        '“‘你是否，还会继续留在这里，一如既往，充满热忱地继续大步创造？’”，她抬眼看你。'
      ], speaker: 'Mirror', hasTriggered: false }
    ]
  }
];
