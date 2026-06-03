export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isGrounded: boolean;
  isJumping: boolean;
  facing: 'left' | 'right';
  energy: number; // 0 to 100
  skills: string[]; // ['好奇心', '系统思维', ...]
  collectedTools: string[]; // ['飞书知识库', '飞书文档', ...]
  growth: number; // growth score or exp
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ground' | 'normal' | 'brick' | 'cloud' | 'office';
  content?: string; // e.g. "飞书知识库" to be spawned on hit
  isHit?: boolean;
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'badge' | 'tool' | 'flybook' | 'knowledge' | 'energy';
  name: string;
  description: string;
  icon: string; // lucide icon name
  pickedUp: boolean;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'unknown' | 'chaos' | 'manager' | 'fear' | 'mirror';
  name: string;
  hp: number;
  maxHp: number;
  speed: number;
  minX: number;
  maxX: number;
  direction: 1 | -1;
  isDefeated: boolean;
  description: string;
}

export interface DialogueTrigger {
  id: string;
  triggerX: number;
  text: string[];
  speaker: 'Yoyo' | 'System' | 'Senior' | 'Fear' | 'Mirror';
  hasTriggered: boolean;
}

export interface GameLevel {
  id: number;
  year: string;
  title: string;
  subtitle: string;
  ambientColor: string; // CSS bg-gradient
  secondaryColor: string; // border/text accent
  platformColor: string; // platform fill style
  introQuote: string;
  completedQuote: string;
  mapWidth: number; // usually 3000px for scrolling
  platforms: Platform[];
  collectibles: Collectible[];
  enemies: Enemy[];
  dialogues: DialogueTrigger[];
  acquiredSkill: {
    name: string;
    description: string;
    icon: string;
  };
}

export interface GameState {
  currentLevelIndex: number;
  gameState: 'start' | 'playing' | 'level_intro' | 'level_complete' | 'boss_choice' | 'credits';
  isAutoPlay: boolean;
  muted: boolean;
}
