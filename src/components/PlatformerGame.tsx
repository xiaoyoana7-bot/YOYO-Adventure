import React, { useRef, useEffect, useState } from 'react';
import { PlayerState, GameLevel, Platform, Collectible, Enemy, DialogueTrigger } from '../types';
import { playSound } from '../utils/audio';
import { 
  ArrowLeft, ArrowRight, ArrowUp, Zap, HelpCircle, ShieldAlert,
  Play, Compass, GitFork, Users, Sparkles, Cpu, Eye, Award, MessageSquare
} from 'lucide-react';

interface PlatformerGameProps {
  level: GameLevel;
  playerState: PlayerState;
  setPlayerState: React.Dispatch<React.SetStateAction<PlayerState>>;
  isAutoPlay: boolean;
  onLevelComplete: () => void;
  onTriggerDialogue: (dialogue: DialogueTrigger) => void;
  activeDialogue: DialogueTrigger | null;
  onCloseDialogue: () => void;
  triggerBossChoice: () => void;
  onBossDefeated: () => void;
}

export default function PlatformerGame({
  level,
  playerState,
  setPlayerState,
  isAutoPlay,
  onLevelComplete,
  onTriggerDialogue,
  activeDialogue,
  onCloseDialogue,
  triggerBossChoice,
  onBossDefeated
}: PlatformerGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const dimensionsRef = useRef(dimensions);
  const cameraRef = useRef(0);
  const keysHeldRef = useRef<{ [key: string]: boolean }>({});
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; maxLife: number; life: number }[]>([]);
  const bouncedBrickRef = useRef<{ id: string; offset: number } | null>(null);

  // Sync dimensions ref to avoid React delay inside high-frequency animation loop
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);
  
  // High-precision references for physics loop (to avoid closure stale state)
  const playerRef = useRef<any>({
    x: 100,
    y: 300,
    vx: 0,
    vy: 0,
    width: 28,
    height: 48,
    isGrounded: false,
    isJumping: false,
    facing: 'right',
    energy: playerState.energy,
    skills: playerState.skills,
    collectedTools: playerState.collectedTools,
    growth: playerState.growth,
  });

  const levelRef = useRef<GameLevel>(level);
  const isAutoPlayRef = useRef<boolean>(isAutoPlay);
  const activeDialogueRef = useRef<DialogueTrigger | null>(activeDialogue);

  // Sync state refs to avoid React delay inside high-frequency animation loop
  useEffect(() => {
    levelRef.current = level;
    // When level changes, reset player position to drop down like Mario from the sky
    playerRef.current.x = 80;
    playerRef.current.y = -80; 
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
    cameraRef.current = 0;
    particlesRef.current = [];
  }, [level]);

  useEffect(() => {
    isAutoPlayRef.current = isAutoPlay;
  }, [isAutoPlay]);

  useEffect(() => {
    activeDialogueRef.current = activeDialogue;
  }, [activeDialogue]);

  // Handle ResizeObserver to support fluid responsive layout
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      // Maintain fixed height aspect ratio where applicable
      const targetHeight = Math.max(380, Math.min(500, width * 0.5));
      setDimensions({ width, height: targetHeight });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Set up Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeDialogueRef.current) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onCloseDialogue();
        }
        return;
      }
      
      const key = e.key.toLowerCase();
      keysHeldRef.current[key] = true;

      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        keysHeldRef.current['space'] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysHeldRef.current[key] = false;
      if (e.key === ' ' || e.key === 'ArrowUp') {
        keysHeldRef.current['space'] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onCloseDialogue]);

  // Touch control trigger actions
  const triggerKeyPress = (key: string, isDown: boolean) => {
    if (activeDialogueRef.current) {
      if (isDown && (key === 'space' || key === 'right')) {
        onCloseDialogue();
      }
      return;
    }
    keysHeldRef.current[key] = isDown;
  };

  // Particle creator helper
  const addParticles = (x: number, y: number, color: string, count = 8) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 1.5), // upward drift bias
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        maxLife: Math.random() * 20 + 15,
        life: 0
      });
    }
    particlesRef.current.push(...newParticles);
  };

  // Main high-precision physics and drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const updatePhysics = () => {
      const p = playerRef.current;
      const lvl = levelRef.current;
      
      // Pause physics during dialogues (except gentle gravity deceleration to avoid freeze-frame hanging)
      if (activeDialogueRef.current) {
        p.vx = 0;
        if (!p.isGrounded) {
          p.vy += 0.8; // settle down on nearest ground
        } else {
          p.vy = 0;
        }
        resolveCollisions(p, lvl);
        return;
      }

      // 1. INPUT HANDLING
      let moveLeft = keysHeldRef.current['a'] || keysHeldRef.current['arrowleft'];
      let moveRight = keysHeldRef.current['d'] || keysHeldRef.current['arrowright'];
      let jumpPressed = keysHeldRef.current[' '] || keysHeldRef.current['space'] || keysHeldRef.current['w'] || keysHeldRef.current['arrowup'];

      // AUTO-PLAY BOT SIMULATOR
      if (isAutoPlayRef.current) {
        // Look ahead for next platform obstacles or collectibles
        moveRight = true;
        moveLeft = false;

        // Auto jump when near an obstacle or when trying to reach a brick overhead
        let shouldJump = false;
        
        // Scan for obstacles directly in front
        lvl.platforms.forEach((platform) => {
          const distToCol = platform.x - p.x;
          if (distToCol > 0 && distToCol < 70) {
            // If obstacle is high or requires hopping
            if (p.isGrounded && platform.y < p.y + p.height) {
              shouldJump = true;
            }
          }
        });

        // Scan for bricks directly overhead
        lvl.platforms.forEach((platform) => {
          if (platform.type === 'brick' && Math.abs(platform.x + platform.width / 2 - (p.x + p.width / 2)) < 30) {
            if (p.isGrounded && !platform.isHit) {
              shouldJump = true;
            }
          }
        });

        // Jump over enemies nearby
        lvl.enemies.forEach((enemy) => {
          if (!enemy.isDefeated) {
            const dist = enemy.x - p.x;
            if (dist > 0 && dist < 120 && p.isGrounded) {
              shouldJump = true;
            }
          }
        });

        // Auto jump near collectibles
        lvl.collectibles.forEach((col) => {
          if (!col.pickedUp) {
            const dist = col.x - p.x;
            if (dist > -20 && dist < 80 && col.y < p.y && p.isGrounded) {
              shouldJump = true;
            }
          }
        });

        if (shouldJump) {
          jumpPressed = true;
        }
      }

      // APPLIED FORCES (Movement & Friction)
      const walkSpeed = 3.8;
      const acceleration = 0.5;
      const friction = 0.82;

      if (moveLeft) {
        p.vx -= acceleration;
        p.facing = 'left';
      } else if (moveRight) {
        p.vx += acceleration;
        p.facing = 'right';
      } else {
        p.vx *= friction; // slide slow down
      }

      // Cap horizontal speed
      if (p.vx > walkSpeed) p.vx = walkSpeed;
      if (p.vx < -walkSpeed) p.vx = -walkSpeed;

      // Gravity force
      const gravity = 0.65;
      p.vy += gravity;

      // Cap vertical terminal velocity
      if (p.vy > 12) p.vy = 12;

      // Jump Action
      if (jumpPressed && p.isGrounded && !p.isJumping) {
        p.vy = -11.0; // Retro spring height
        p.isGrounded = false;
        p.isJumping = true;
        playSound.jump();
        addParticles(p.x + p.width / 2, p.y + p.height, 'rgba(255,255,255,0.7)', 5);
      }

      // APPLY POSITION
      p.x += p.vx;
      p.y += p.vy;

      // Map boundary clamps
      if (p.x < 0) {
        p.x = 0;
        p.vx = 0;
      }
      if (p.x > lvl.mapWidth - p.width) {
        p.x = lvl.mapWidth - p.width;
        p.vx = 0;
        
        // REACHED END OF LEVEL!
        // Level 6 is cleared strictly after mirror choice
        if (lvl.id === 6) {
          // Special climax trigger on approaching the mirror
          const boss = lvl.enemies.find(e => e.type === 'mirror');
          if (boss && !boss.isDefeated) {
            // Cannot cross boss on Level 6 without choice triggering
            p.x = boss.x - p.width - 20;
            p.vx = 0;
          }
        } else {
          // Normal Level Completed
          onLevelComplete();
        }
      }

      // COLLISION DETECTION / RESOLUTION
      resolveCollisions(p, lvl);

      // DIALOGUE TRIGGERS EVALUATION
      lvl.dialogues.forEach((d) => {
        if (!d.hasTriggered && p.x >= d.triggerX) {
          d.hasTriggered = true;
          p.vx = 0;
          onTriggerDialogue(d);
        }
      });
    };

    const resolveCollisions = (p: any, lvl: GameLevel) => {
      p.isGrounded = false;

      // Ground plane fallback (safety valve)
      const floorLevel = dimensionsRef.current.height - 30; // buffer margin
      if (p.y + p.height >= floorLevel) {
        p.y = floorLevel - p.height;
        p.vy = 0;
        p.isGrounded = true;
        p.isJumping = false;
      }

      lvl.platforms.forEach((plat) => {
        // Standard AABB overlap check
        const overlapX = (p.x < plat.x + plat.width) && (p.x + p.width > plat.x);
        const overlapY = (p.y < plat.y + plat.height) && (p.y + p.height > plat.y);

        if (overlapX && overlapY) {
          // Find side of collision with minimal overlap penetration
          const overlapLeft = (p.x + p.width) - plat.x;
          const overlapRight = (plat.x + plat.width) - p.x;
          const overlapTop = (p.y + p.height) - plat.y;
          const overlapBottom = (plat.y + plat.height) - p.y;

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

          if (minOverlap === overlapTop) {
            if (p.vy > 0) {
              // Landing on top of platform
              p.y = plat.y - p.height;
              p.vy = 0;
              p.isGrounded = true;
              p.isJumping = false;
            } else {
              // Running into side if not falling
              if (overlapLeft < overlapRight) {
                p.x = plat.x - p.width;
                p.vx = 0;
              } else {
                p.x = plat.x + plat.width;
                p.vx = 0;
              }
            }
          } else if (minOverlap === overlapBottom) {
            if (p.vy < 0) {
              // Hitting bottom of platform (Headdbutt Brick mechanic!)
              p.y = plat.y + plat.height;
              p.vy = 0.5; // bounce bounce back down

              if (plat.type === 'brick' && !plat.isHit) {
                plat.isHit = true;
                playSound.bounce();
                bouncedBrickRef.current = { id: plat.id, offset: -8 };
                setTimeout(() => { bouncedBrickRef.current = null; }, 100);

                // Spawn corresponding collectible or skill tool on hitting brick
                playSound.powerUp();
                addParticles(plat.x + plat.width / 2, plat.y, '#FBBF24', 20); // Golden sparks!

                // Drop matching tools directly into collection
                if (plat.content) {
                  if (!p.collectedTools.includes(plat.content)) {
                    p.collectedTools.push(plat.content);
                    p.growth += 15;
                    // Append items details in the collectible arrays
                    const correspondingCol = lvl.collectibles.find(c => c.name.includes(plat.content!.substring(0, 3)));
                    if (correspondingCol) {
                      correspondingCol.pickedUp = true;
                    }
                  }
                }
              }
            } else {
              // Running into side if not jumping up
              if (overlapLeft < overlapRight) {
                p.x = plat.x - p.width;
                p.vx = 0;
              } else {
                p.x = plat.x + plat.width;
                p.vx = 0;
              }
            }
          } else if (minOverlap === overlapLeft) {
            // Running into side from left
            p.x = plat.x - p.width;
            p.vx = 0;
          } else if (minOverlap === overlapRight) {
            // Running into side from right
            p.x = plat.x + plat.width;
            p.vx = 0;
          }
        }
      });

      // COLLECTIBLES CHECK
      lvl.collectibles.forEach((col) => {
        if (!col.pickedUp) {
          const colCenterX = col.x + col.width / 2;
          const colCenterY = col.y + col.height / 2;
          const playerCenterX = p.x + p.width / 2;
          const playerCenterY = p.y + p.height / 2;

          const dist = Math.hypot(colCenterX - playerCenterX, colCenterY - playerCenterY);
          if (dist < 35) {
            col.pickedUp = true;
            p.growth += 10;
            
            // Check special item type triggers
            if (col.type === 'tool' || col.type === 'knowledge') {
              if (!p.collectedTools.includes(col.name)) {
                p.collectedTools.push(col.name);
              }
            }
            p.energy = Math.min(100, p.energy + 15); // heal energies
            playSound.collect();
            addParticles(col.x + 15, col.y + 15, '#34D399', 15);
          }
        }
      });

      // Special chest interaction in Level 6
      if (lvl.id === 6) {
        const chest = lvl.collectibles.find(c => c.id === 'l6-chest');
        const bossMirror = lvl.enemies.find(e => e.type === 'mirror');
        if (chest && !chest.pickedUp && bossMirror?.isDefeated) {
          const dist = Math.hypot(chest.x + 25 - (p.x + p.width/2), chest.y + 25 - (p.y + p.height/2));
          if (dist < 40) {
            chest.pickedUp = true;
            onLevelComplete(); // triggers finale credits screen!
          }
        }
      }

      // ENEMIES INTERACTION
      lvl.enemies.forEach((enemy) => {
        if (!enemy.isDefeated) {
          // AABB check
          const overlapX = (p.x < enemy.x + enemy.width) && (p.x + p.width > enemy.x);
          const overlapY = (p.y < enemy.y + enemy.height) && (p.y + p.height > enemy.y);

          if (overlapX && overlapY) {
            // Special Level 6 boss mirror trigger
            if (enemy.type === 'mirror') {
              p.vx = 0;
              p.x = enemy.x - p.width - 25;
              triggerBossChoice();
              return;
            }

            // Normal enemy layout squash vs hurt
            const squashRange = p.y + p.height - enemy.y;
            if (p.vy > 0 && squashRange < 18 && p.y + p.height - p.vy <= enemy.y) {
              // Squash victory!
              enemy.hp -= 1;
              p.vy = -7.5; // bouncy hop up
              addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#EF4444', 25);
              playSound.bounce();

              if (enemy.hp <= 0) {
                enemy.isDefeated = true;
                p.growth += 25;
                playSound.powerUp();
                
                // If it is Level 4 fear boss trigger victory dialogue
                if (enemy.type === 'fear') {
                  onBossDefeated();
                }
              }
            } else {
              // Normal collision = Player hit hurt recoil
              p.energy = Math.max(0, p.energy - 15);
              playSound.hurt();
              addParticles(p.x + p.width / 2, p.y + p.height / 2, '#F87171', 12);

              // Recoil pushback physics
              if (p.x + p.width / 2 < enemy.x + enemy.width / 2) {
                p.vx = -4.5;
                p.x -= 10;
              } else {
                p.vx = 4.5;
                p.x += 10;
              }
              p.vy = -3;

              // Safe resurrection trigger to avoid frustrated soft locking
              if (p.energy <= 0) {
                playSound.defeat();
                p.energy = 80;
                p.x = 80; // Teleport back safely to checkpoint
                p.y = 200;
                addParticles(80, 200, '#60A5FA', 15);
              }
            }
          }
        }
      });
    };

    // Passive animation update (moving enemies patrol paths)
    const updateEnemyPatrols = () => {
      const lvl = levelRef.current;
      if (activeDialogueRef.current) return; // Freeze during speak times

      lvl.enemies.forEach((enemy) => {
        if (!enemy.isDefeated && enemy.speed > 0) {
          enemy.x += enemy.speed * enemy.direction;
          
          if (enemy.x > enemy.maxX) {
            enemy.direction = -1;
            enemy.x = enemy.maxX;
          } else if (enemy.x < enemy.minX) {
            enemy.direction = 1;
            enemy.x = enemy.minX;
          }
        }
      });
    };

    const drawGame = () => {
      const p = playerRef.current;
      const lvl = levelRef.current;
      const dimensions = dimensionsRef.current;
      const cameraX = cameraRef.current;

      // 1. DYNAMIC CAMERA OFFSET TRACKING
      // Standard camera follows player in middle, clamped to level map bounds
      let targetCameraX = p.x - dimensions.width * 0.35;
      if (targetCameraX < 0) targetCameraX = 0;
      const maxCameraX = lvl.mapWidth - dimensions.width;
      if (targetCameraX > maxCameraX) targetCameraX = maxCameraX;

      // Smooth horizontal camera lerp
      cameraRef.current = cameraRef.current + (targetCameraX - cameraRef.current) * 0.12;
      const easedCameraX = cameraRef.current;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // 2. PARALLAX SKY & BACKGROUND gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      if (lvl.id === 1) {
        gradient.addColorStop(0, '#020617'); // Pitch space
        gradient.addColorStop(0.6, '#0B1528'); // Deep blue
        gradient.addColorStop(1, '#1E293B'); // Slate
      } else if (lvl.id === 2) {
        gradient.addColorStop(0, '#0F052D'); // Deep indigo dark
        gradient.addColorStop(0.7, '#2F0854'); // Royal violet
        gradient.addColorStop(1, '#1A0B2E'); // Base
      } else if (lvl.id === 3) {
        gradient.addColorStop(0, '#022C22'); // Forest dark emerald
        gradient.addColorStop(0.7, '#064E3B'); // Emerald
        gradient.addColorStop(1, '#091811'); // Dark footer
      } else if (lvl.id === 4) {
        // LEVEL 4 - Pure Dark Mist theme
        gradient.addColorStop(0, '#020617');
        gradient.addColorStop(0.5, '#0F172A');
        gradient.addColorStop(1, '#090514');
      } else if (lvl.id === 5) {
        // LEVEL 5 - Bright Blue Neon Grid Digital wave
        gradient.addColorStop(0, '#00182E');
        gradient.addColorStop(0.7, '#023152');
        gradient.addColorStop(1, '#000A13');
      } else {
        // LEVEL 6 - Cosmic amber violet top stars
        gradient.addColorStop(0, '#0D0221');
        gradient.addColorStop(0.4, '#1A0C30');
        gradient.addColorStop(0.8, '#411530');
        gradient.addColorStop(1, '#561625');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Background decorative Parallax Mountains/Towers/Office cubes
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      // Stars layout
      for (let i = 0; i < 40; i++) {
        const starX = ((i * 123) - easedCameraX * 0.1) % dimensions.width;
        const starY = (i * 37) % (dimensions.height - 100);
        ctx.fillRect(starX, starY, i%3===0 ? 3 : 1.5, i%3===0 ? 3 : 1.5);
      }
      ctx.restore();

      // Draw background fluffy clouds with cute smiling faces! (Extremely cute Mario style)
      if (lvl.id === 1 || lvl.id === 2 || lvl.id === 3 || lvl.id === 5 || lvl.id === 6) {
        ctx.save();
        for (let i = 0; i < 5; i++) {
          const cloudX = ((i * 320) - easedCameraX * 0.08) % 1800;
          const screenCloudX = cloudX < 0 ? cloudX + 1800 : cloudX;
          const cloudY = 35 + (i * 30) % 90;
          
          // Draw fluffy clouds
          ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
          ctx.beginPath();
          ctx.arc(screenCloudX, cloudY, 14, 0, Math.PI * 2);
          ctx.arc(screenCloudX + 10, cloudY - 6, 18, 0, Math.PI * 2);
          ctx.arc(screenCloudX + 22, cloudY, 14, 0, Math.PI * 2);
          ctx.arc(screenCloudX + 11, cloudY + 4, 13, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw cute little blushing cheeks
          ctx.fillStyle = 'rgba(251, 113, 133, 0.3)'; // Pink blush
          ctx.beginPath();
          ctx.arc(screenCloudX + 4, cloudY + 1, 2, 0, Math.PI * 2);
          ctx.arc(screenCloudX + 18, cloudY + 1, 2, 0, Math.PI * 2);
          ctx.fill();

          // Draw cute little dot eyes: `• •`
          ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
          ctx.fillRect(screenCloudX + 7, cloudY - 4, 2, 5);
          ctx.fillRect(screenCloudX + 13, cloudY - 4, 2, 5);
        }
        ctx.restore();
      }

      // Parallax silhouette hills
      ctx.fillStyle = lvl.id === 4 ? 'rgba(15, 23, 42, 0.35)' : 'rgba(30, 41, 59, 0.25)';
      ctx.beginPath();
      ctx.moveTo(0, dimensions.height);
      for (let x = 0; x <= dimensions.width; x += 50) {
        const pX = x + easedCameraX * 0.25;
        const hillY = dimensions.height - 100 - Math.sin(pX * 0.003) * 40 - Math.cos(pX * 0.001) * 20;
        ctx.lineTo(x, hillY);
      }
      ctx.lineTo(dimensions.width, dimensions.height);
      ctx.closePath();
      ctx.fill();

      // 3. DRAW PLATFORMS
      lvl.platforms.forEach((plat) => {
        const screenX = plat.x - easedCameraX;
        let drawY = plat.y;

        // Apply bounce animation offsets on brick headdbutts
        const bb = bouncedBrickRef.current;
        if (bb && bb.id === plat.id) {
          drawY += bb.offset;
        }

        ctx.save();
        if (plat.type === 'ground') {
          if (lvl.id === 1) {
            // Level 1: Newbie Village - Soft green grass with pixel grass blades over dirt
            ctx.fillStyle = '#22C55E'; // Bright grass green
            ctx.fillRect(screenX, drawY, plat.width, 10);
            ctx.fillStyle = '#78350F'; // Warm wooden soil dirt
            ctx.fillRect(screenX, drawY + 10, plat.width, plat.height - 10);
            
            // Draw cute grass tufts
            ctx.fillStyle = '#4ADE80';
            for (let gx = 10; gx < plat.width; gx += 40) {
              ctx.fillRect(screenX + gx, drawY - 4, 3, 4);
              ctx.fillRect(screenX + gx + 3, drawY - 2, 2, 2);
            }
          } else if (lvl.id === 2) {
            // Level 2: Campaign Kingdom - Neon-purple matrix wireframe blocks
            ctx.fillStyle = '#A855F7'; // Neon purple
            ctx.fillRect(screenX, drawY, plat.width, 8);
            ctx.fillStyle = '#2E1065'; // Dark purple base
            ctx.fillRect(screenX, drawY + 8, plat.width, plat.height - 8);
            
            // Draw glowing matrix line grid inside the ground
            ctx.strokeStyle = '#D8B4FE';
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 4, drawY + 12, plat.width - 8, plat.height - 20);
          } else if (lvl.id === 3) {
            // Level 3: Leadership Tower - Medieval stone brick fortress blocks
            ctx.fillStyle = '#10B981'; // Fresh mossy stone cap green
            ctx.fillRect(screenX, drawY, plat.width, 10);
            ctx.fillStyle = '#374151'; // Slate grey stone
            ctx.fillRect(screenX, drawY + 10, plat.width, plat.height - 10);
            
            // Draw stone block joint segment lines
            ctx.strokeStyle = '#1F2937';
            ctx.lineWidth = 2;
            for (let brickX = 40; brickX < plat.width; brickX += 40) {
              ctx.beginPath();
              ctx.moveTo(screenX + brickX, drawY + 10);
              ctx.lineTo(screenX + brickX, drawY + plat.height);
              ctx.stroke();
            }
          } else if (lvl.id === 4) {
            // Level 4: Mist Forest - Spooky dark charcoal bark with mist accents
            ctx.fillStyle = '#4B5563'; // Dark bark
            ctx.fillRect(screenX, drawY, plat.width, 10);
            ctx.fillStyle = '#1F2937'; // Deep shadow slate
            ctx.fillRect(screenX, drawY + 10, plat.width, plat.height - 10);
            
            // Spooky wood knots
            ctx.fillStyle = '#111827';
            for (let wx = 30; wx < plat.width; wx += 60) {
              ctx.beginPath();
              ctx.arc(screenX + wx, drawY + 22, 6, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (lvl.id === 5) {
            // Level 5: AI Future City - Cyan circuit glowing lane panel
            ctx.fillStyle = '#06B6D4'; // Glowing neon cyan
            ctx.fillRect(screenX, drawY, plat.width, 8);
            ctx.fillStyle = '#0F172A'; // Dark slate
            ctx.fillRect(screenX, drawY + 8, plat.width, plat.height - 8);
            
            // Draw motherboard circuit trails
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(screenX + 20, drawY + 15);
            ctx.lineTo(screenX + 60, drawY + 15);
            ctx.lineTo(screenX + 80, drawY + 25);
            ctx.stroke();
            // Draw a circuit connection node dot
            ctx.fillStyle = '#E0F2FE';
            ctx.beginPath();
            ctx.arc(screenX + 80, drawY + 25, 3, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Level 6: Peak of Creativity - Golden celestial peak
            ctx.fillStyle = '#F59E0B'; // Sparkling gold
            ctx.fillRect(screenX, drawY, plat.width, 12);
            ctx.fillStyle = '#451A03'; // Deep amber-black base
            ctx.fillRect(screenX, drawY + 12, plat.width, plat.height - 12);
            
            // Draw golden stardust specks
            ctx.fillStyle = '#FDE047';
            for (let sx = 15; sx < plat.width; sx += 50) {
              ctx.fillRect(screenX + sx, drawY + 16, 3, 3);
              ctx.fillRect(screenX + sx + 10, drawY + 25, 2, 2);
            }
          }
        } else if (plat.type === 'office') {
          // Corporate office table design cubicle
          ctx.strokeStyle = lvl.platformColor;
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(screenX, drawY, plat.width, plat.height);
          ctx.strokeRect(screenX, drawY, plat.width, plat.height);

          // Draw neon monitor/cubicle elements on desk
          ctx.fillStyle = 'rgba(37, 99, 235, 0.5)';
          ctx.fillRect(screenX + 30, drawY - 20, 30, 16); // desk screens
          ctx.fillStyle = '#D1D5DB';
          ctx.fillRect(screenX + 42, drawY - 4, 6, 4); // stand
        } else if (plat.type === 'brick') {
          // Special retro pixel-art Mario-style question blocks!
          if (plat.isHit) {
            // Empty struck brick box (brownish grey with corner nails)
            ctx.fillStyle = '#78350F'; // Darker brick base outline
            ctx.fillRect(screenX, drawY, plat.width, plat.height);
            ctx.fillStyle = '#78716C'; // Struck stone brown-grey body
            ctx.fillRect(screenX + 2, drawY + 2, plat.width - 4, plat.height - 4);
            
            // Draw four metal rivets at corners
            ctx.fillStyle = '#44403C';
            ctx.fillRect(screenX + 4, drawY + 4, 3, 3);
            ctx.fillRect(screenX + plat.width - 7, drawY + 4, 3, 3);
            ctx.fillRect(screenX + 4, drawY + plat.height - 7, 3, 3);
            ctx.fillRect(screenX + plat.width - 7, drawY + plat.height - 7, 3, 3);
          } else {
            // Glowing rich golden question block!
            ctx.fillStyle = '#78350F'; // Deep brown outline
            ctx.fillRect(screenX, drawY, plat.width, plat.height);
            
            // Rich golden/orange face
            ctx.fillStyle = '#FBBF24';
            ctx.fillRect(screenX + 2, drawY + 2, plat.width - 4, plat.height - 4);
            
            // High-contrast highlighting at top and left edges
            ctx.fillStyle = '#FEF08A'; // shining yellow
            ctx.fillRect(screenX + 2, drawY + 2, plat.width - 4, 2);
            ctx.fillRect(screenX + 2, drawY + 2, 2, plat.height - 4);
            
            // Custom pixel nails at the four corners
            ctx.fillStyle = '#D97706'; // darker orange screw dots
            ctx.fillRect(screenX + 4, drawY + 4, 2, 2);
            ctx.fillRect(screenX + plat.width - 6, drawY + 4, 2, 2);
            ctx.fillRect(screenX + 4, drawY + plat.height - 6, 2, 2);
            ctx.fillRect(screenX + plat.width - 6, drawY + plat.height - 6, 2, 2);

            // Shimmering star sparkles bobbing!
            const glint = Math.sin(Date.now() * 0.015 + screenX) > 0.7;
            if (glint) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(screenX + 6, drawY + 6, 2, 2);
              ctx.fillRect(screenX + plat.width - 8, drawY + plat.height - 8, 2, 2);
            }

            // Big retro pixelated bold "?" question mark in center
            ctx.fillStyle = '#78350F'; // dark contrast brown
            ctx.font = 'bold 16px "Press Start 2P", "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('?', screenX + plat.width / 2, drawY + plat.height / 2 + 1);
          }
        } else {
          // Floating platforms: custom styling per level for maximum variety!
          if (lvl.id === 1) {
            // Level 1: Soft cloud platforms (semi-translucent white with cheeks)
            ctx.strokeStyle = '#CBD5E1';
            ctx.lineWidth = 2.5;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.roundRect(screenX, drawY, plat.width, plat.height, 12);
            ctx.fill();
            ctx.stroke();

            // Draw a tiny cute flower design on floating cloud platforms
            ctx.fillStyle = '#FB7185';
            ctx.beginPath();
            ctx.arc(screenX + 16, drawY + plat.height/2, 3, 0, Math.PI * 2);
            ctx.fill();
          } else if (lvl.id === 2) {
            // Level 2: Glowing grids
            ctx.strokeStyle = '#F472B6'; // Pink laser border
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.beginPath();
            ctx.roundRect(screenX, drawY, plat.width, plat.height, 4);
            ctx.fill();
            ctx.stroke();

            // Inner retro circuit line
            ctx.strokeStyle = 'rgba(244,114,182,0.3)';
            ctx.strokeRect(screenX + 4, drawY + 4, plat.width - 8, plat.height - 8);
          } else if (lvl.id === 3) {
            // Level 3: Grey stone brick floating segments
            ctx.strokeStyle = '#1F2937';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#4B5563';
            ctx.beginPath();
            ctx.roundRect(screenX, drawY, plat.width, plat.height, 4);
            ctx.fill();
            ctx.stroke();
            
            // Stone texture lines
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.beginPath();
            ctx.moveTo(screenX + 15, drawY + 2);
            ctx.lineTo(screenX + 15, drawY + plat.height - 2);
            ctx.moveTo(screenX + plat.width - 15, drawY + 2);
            ctx.lineTo(screenX + plat.width - 15, drawY + plat.height - 2);
            ctx.stroke();
          } else if (lvl.id === 4) {
            // Level 4: Bark wood branch panels
            ctx.strokeStyle = '#1E293B';
            ctx.lineWidth = 3;
            ctx.fillStyle = '#1F2937';
            ctx.beginPath();
            ctx.roundRect(screenX, drawY, plat.width, plat.height, 6);
            ctx.fill();
            ctx.stroke();
          } else if (lvl.id === 5) {
            // Level 5: Translucent holograms
            ctx.strokeStyle = '#22D3EE';
            ctx.lineWidth = 2.5;
            ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
            ctx.beginPath();
            ctx.roundRect(screenX, drawY, plat.width, plat.height, 8);
            ctx.fill();
            ctx.stroke();

            // Scanning scanner laser beam line moving left-to-right
            const beamX = (Date.now() * 0.1) % (plat.width + 40) - 20;
            if (beamX > 0 && beamX < plat.width) {
              ctx.strokeStyle = 'rgba(34, 211, 238, 0.45)';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(screenX + beamX, drawY);
              ctx.lineTo(screenX + beamX, drawY + plat.height);
              ctx.stroke();
            }
          } else {
            // Level 6: Golden cosmic steps
            ctx.strokeStyle = '#FDE047';
            ctx.lineWidth = 2.5;
            ctx.fillStyle = 'rgba(217, 119, 6, 0.85)';
            ctx.beginPath();
            ctx.roundRect(screenX, drawY, plat.width, plat.height, 10);
            ctx.fill();
            ctx.stroke();
          }
        }
        ctx.restore();
      });

      // 4. DRAW COLLECTIBLES
      lvl.collectibles.forEach((col) => {
        if (!col.pickedUp) {
          const screenX = col.x - easedCameraX;
          const wobble = Math.sin(Date.now() * 0.005 + col.x) * 6; // Sweet floating bob animation

          ctx.save();
          // Draw soft glowing orb
          const glowRad = 15 + Math.sin(Date.now() * 0.01) * 3;
          const glowGrad = ctx.createRadialGradient(screenX + 15, col.y + 15 + wobble, 2, screenX + 15, col.y + 15 + wobble, glowRad);
          if (col.type === 'knowledge' || col.type === 'tool') {
            glowGrad.addColorStop(0, 'rgba(57, 181, 224, 0.4)');
            glowGrad.addColorStop(1, 'rgba(57, 181, 224, 0)');
          } else if (col.type === 'energy') {
            glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          } else {
            glowGrad.addColorStop(0, 'rgba(251, 191, 36, 0.45)');
            glowGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
          }
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(screenX + 15, col.y + 15 + wobble, glowRad, 0, Math.PI*2);
          ctx.fill();

          // Draw retro gemstone diamond boundary
          ctx.fillStyle = col.type === 'energy' ? '#EF4444' : col.type === 'badge' ? '#FBBF24' : '#60A5FA';
          ctx.beginPath();
          ctx.moveTo(screenX + 15, col.y + 4 + wobble);
          ctx.lineTo(screenX + 26, col.y + 15 + wobble);
          ctx.lineTo(screenX + 15, col.y + 26 + wobble);
          ctx.lineTo(screenX + 4, col.y + 15 + wobble);
          ctx.closePath();
          ctx.fill();

          // Sparkle line overlays
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.3;
          ctx.stroke();

          // Little item labels overlay on hover proximity
          if (Math.abs(p.x - col.x) < 140) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '500 10px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(col.name, screenX + 15, col.y - 12 + wobble);
          }

          ctx.restore();
        }
      });

      // Special Golden Chest on Summit
      if (lvl.id === 6) {
        const chest = lvl.collectibles.find(c => c.id === 'l6-chest');
        const bossMirror = lvl.enemies.find(e => e.type === 'mirror');
        if (chest) {
          const screenChestX = chest.x - easedCameraX;
          const isLidOpen = chest.pickedUp;

          ctx.save();
          // Draw neat pixel trunk retro styling
          // Glow if boss is defeated!
          if (bossMirror?.isDefeated && !isLidOpen) {
            const glow = ctx.createRadialGradient(screenChestX+25, chest.y+20, 5, screenChestX+25, chest.y+20, 40);
            glow.addColorStop(0, 'rgba(251, 191, 36, 0.5)');
            glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(screenChestX+25, chest.y+20, 40, 0, Math.PI*2);
            ctx.fill();
          }

          // Main chest body
          ctx.fillStyle = '#854D0E'; // brown
          ctx.fillRect(screenChestX + 5, chest.y + 16, 40, 24);
          
          if (!isLidOpen) {
            // Closed lid
            ctx.fillStyle = '#A16207'; // lighter lid brown
            ctx.fillRect(screenChestX + 5, chest.y + 5, 40, 12);
            ctx.fillStyle = '#FBBF24'; // brass golden latch locking
            ctx.fillRect(screenChestX + 22, chest.y + 13, 6, 8);
          } else {
            // Open lid - thrown back
            ctx.fillStyle = '#A16207';
            ctx.fillRect(screenChestX + 5, chest.y - 7, 40, 10);
            ctx.fillStyle = '#FEF08A'; // shining particles bursting inside!
            ctx.fillRect(screenChestX + 8, chest.y + 6, 34, 10);
          }
          // Iron gold borders
          ctx.fillStyle = '#CA8A04';
          ctx.fillRect(screenChestX + 5, chest.y + 16, 4, 24);
          ctx.fillRect(screenChestX + 41, chest.y + 16, 4, 24);

          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.font = '500 11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(isLidOpen ? '[已开启]' : bossMirror?.isDefeated ? '★ 点击或触碰宝箱 ★' : '神秘木箱', screenChestX + 25, chest.y - 15);
          ctx.restore();
        }
      }

      // Draw active classic green Mario pipe as completion gateway (For levels 1 to 5)
      if (lvl.id < 6) {
        const exitPipeX = lvl.mapWidth - 100;
        const screenPipeX = exitPipeX - easedCameraX;
        const pipeY = dimensions.height - 95; // perfectly ground-based

        ctx.save();
        // Pipe outer shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(screenPipeX + 4, pipeY + 4, 52, 65);

        // Green Pipe body
        ctx.fillStyle = '#16A34A'; // Rich forest green
        ctx.fillRect(screenPipeX + 6, pipeY + 18, 48, 47);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#14532D'; // Deep dark rim
        ctx.strokeRect(screenPipeX + 6, pipeY + 18, 48, 47);

        // Pipe rim cap
        ctx.fillStyle = '#22C55E'; // Bright green cap
        ctx.fillRect(screenPipeX, pipeY, 60, 18);
        ctx.strokeRect(screenPipeX, pipeY, 60, 18);

        // Highlights for cylindrical metal appearance
        ctx.fillStyle = '#86EFAC'; // highlight shine tube
        ctx.fillRect(screenPipeX + 6, pipeY + 2, 8, 14); // cap light highlight
        ctx.fillRect(screenPipeX + 12, pipeY + 20, 6, 43); // body light highlight

        ctx.fillStyle = '#15803D'; // shadow side
        ctx.fillRect(screenPipeX + 48, pipeY + 2, 6, 14); // cap shadows
        ctx.fillRect(screenPipeX + 42, pipeY + 20, 6, 43); // body shadows

        // Cute glowing navigation instruction text above pipe
        ctx.fillStyle = '#FBBF24';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 3;
        ctx.fillText('EXIT', screenPipeX + 30, pipeY - 18);
        ctx.shadowBlur = 0;

        // Bouncing arrow sign
        const arrowOffset = Math.sin(Date.now() * 0.012) * 4;
        ctx.fillStyle = '#FDE047';
        ctx.beginPath();
        ctx.moveTo(screenPipeX + 30, pipeY - 6 + arrowOffset);
        ctx.lineTo(screenPipeX + 24, pipeY - 12 + arrowOffset);
        ctx.lineTo(screenPipeX + 28, pipeY - 12 + arrowOffset);
        ctx.lineTo(screenPipeX + 28, pipeY - 18 + arrowOffset);
        ctx.lineTo(screenPipeX + 32, pipeY - 18 + arrowOffset);
        ctx.lineTo(screenPipeX + 32, pipeY - 12 + arrowOffset);
        ctx.lineTo(screenPipeX + 36, pipeY - 12 + arrowOffset);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // 5. DRAW ENEMIES
      lvl.enemies.forEach((enemy) => {
        if (!enemy.isDefeated) {
          const screenX = enemy.x - easedCameraX;
          ctx.save();

          if (enemy.type === 'unknown') {
            // LEVEL 1: Shadow迷茫 blob with pulsing eyes
            const sizePulse = 2 + Math.sin(Date.now() * 0.008) * 35 * 0.08;
            ctx.fillStyle = 'rgba(30, 41, 59, 0.9)'; // Dark navy grey
            ctx.beginPath();
            ctx.arc(screenX + enemy.width/2, enemy.y + enemy.height/2, (enemy.width/2) + sizePulse, 0, Math.PI*2);
            ctx.fill();

            // Glowing red confusion eyes
            ctx.fillStyle = '#EF4444';
            ctx.beginPath();
            ctx.arc(screenX + enemy.width/2 - 6, enemy.y + enemy.height/2 - 2, 3, 0, Math.PI*2);
            ctx.arc(screenX + enemy.width/2 + 6, enemy.y + enemy.height/2 - 2, 3, 0, Math.PI*2);
            ctx.fill();

            // Label text over monster
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('迷茫 · UNKNOWN', screenX + enemy.width/2, enemy.y - 10);
          } else if (enemy.type === 'chaos') {
            // LEVEL 2 & 3: Violet spiky Chaos or Misunderstanding monster
            const spikesCount = 8;
            const wCenter = screenX + enemy.width/2;
            const hCenter = enemy.y + enemy.height/2;
            const outerRad = enemy.width/2 + Math.sin(Date.now() * 0.01) * 3;
            const innerRad = 10;

            ctx.fillStyle = '#8B5CF6'; // purple spikes
            ctx.beginPath();
            for (let i = 0; i < spikesCount * 2; i++) {
              const alpha = (i * Math.PI) / spikesCount;
              const r = i % 2 === 0 ? outerRad : innerRad;
              ctx.lineTo(wCenter + Math.cos(alpha) * r, hCenter + Math.sin(alpha) * r);
            }
            ctx.closePath();
            ctx.fill();

            // Little angry yellow pupil eyes
            ctx.fillStyle = '#FBBF24';
            ctx.fillRect(wCenter - 7, hCenter - 4, 4, 3);
            ctx.fillRect(wCenter + 3, hCenter - 4, 4, 3);

            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(enemy.name, wCenter, enemy.y - 10);
          } else if (enemy.type === 'fear') {
            // LEVEL 4 - Deep shadowy giant FEAR monster
            const shadowRad = 35 + Math.sin(Date.now() * 0.007) * 4;
            const glowGrad = ctx.createRadialGradient(screenX + 35, enemy.y + 35, 5, screenX + 35, enemy.y + 35, shadowRad);
            glowGrad.addColorStop(0, 'rgba(0,0,0,1)');
            glowGrad.addColorStop(0.5, 'rgba(220,38,38,0.25)'); // Red aura fear
            glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath();
            ctx.arc(screenX + 35, enemy.y + 35, shadowRad, 0, Math.PI*2);
            ctx.fill();

            // Draw ominous mask
            ctx.fillStyle = '#111322';
            ctx.beginPath();
            ctx.roundRect(screenX + 15, enemy.y + 15, 40, 40, 10);
            ctx.fill();

            // Piercing crimson vertical eyes
            ctx.fillStyle = '#DC2626';
            ctx.fillRect(screenX + 24, enemy.y + 25, 4, 16);
            ctx.fillRect(screenX + 42, enemy.y + 25, 4, 16);

            ctx.fillStyle = 'rgba(248,113,113,0.9)';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('心魔 (FEAR)', screenX + 35, enemy.y - 12);
            // Health indicator bar
            const barW = 50;
            const filledW = (enemy.hp / enemy.maxHp) * barW;
            ctx.fillStyle = '#374151';
            ctx.fillRect(screenX + 10, enemy.y - 5, barW, 4);
            ctx.fillStyle = '#EF4444';
            ctx.fillRect(screenX + 10, enemy.y - 5, filledW, 4);
          } else if (enemy.type === 'mirror') {
            // LEVEL 6: Mirror glitchy Yoyo
            const isFading = enemy.isDefeated;
            ctx.globalAlpha = isFading ? 0.2 : 0.75 + Math.sin(Date.now() * 0.01) * 0.12;

            // Draw holographic blue outline clone
            ctx.strokeStyle = '#FBBF24'; // Golden shimmer
            ctx.lineWidth = 2.5;
            ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';

            // Draw figure silhouette
            ctx.beginPath();
            ctx.roundRect(screenX, enemy.y, enemy.width, enemy.height, 12);
            ctx.fill();
            ctx.stroke();

            // Glitchy horizontal lines going through clone
            const scanLineY = (Date.now() * 0.05) % enemy.height;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(screenX, enemy.y + scanLineY);
            ctx.lineTo(screenX + enemy.width, enemy.y + scanLineY);
            ctx.stroke();

            ctx.fillStyle = '#FEF3C7';
            ctx.font = 'bold 11px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('镜像 Yoyo', screenX + enemy.width/2, enemy.y - 15);
          }
          ctx.restore();
        }
      });

      // 6. DRAW PARTICLES
      const activeParticles = particlesRef.current;
      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const part = activeParticles[i];
        part.life += 1;
        part.x += part.vx;
        part.y += part.vy;
        part.alpha = 1 - (part.life / part.maxLife);

        if (part.life >= part.maxLife) {
          activeParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }

      // 7. DRAW PLAYER character representation (Yoyo)
      const screenPlayerX = p.x - easedCameraX;
      ctx.save();

      // Resilience Shield bubble overlay
      if (p.skills.includes('韧性 (Resilience)') || p.skills.includes('韧性')) {
        const shieldRad = 34 + Math.sin(Date.now() * 0.01) * 2;
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.45)'; // Soft blue bubble
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(screenPlayerX + p.width/2, p.y + p.height/2, shieldRad, 0, Math.PI*2);
        ctx.stroke();
      }

      // AI sprites floating around in Level 5
      if (lvl.id === 5) {
        const angle = Date.now() * 0.005;
        const orbitX = screenPlayerX + p.width/2 + Math.cos(angle) * 36;
        const orbitY = p.y + p.height/2 - 15 + Math.sin(angle * 1.5) * 12;
        
        ctx.fillStyle = '#67E8F9'; // bright cyan cyber fairy
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw avatar body block (Polished, Adorable Chibi Vector Style - No more blocky pixel larping!)
      // Base clothing maintains the vibrant red jacket theme matching the beautiful reference illustration!
      let jacketColor = '#EF4444'; // Iconic red hoodie jacket (from reference)
      let innerShirtColor = '#FBBF24'; // Warm yellow inner shirt (from reference)
      let pantsColor = '#F1F5F9'; // White/light-gray shorts (from reference)

      if (lvl.id === 1) {
        jacketColor = '#F87171'; // Lighter red sporty jacket for recruit
      } else if (lvl.id === 4) {
        jacketColor = '#4B5563'; // Darker jacket for deep protective coat look
      } else if (lvl.id === 5) {
        jacketColor = '#EC4899'; // Cyber-tech neon pink jacket
      } else if (lvl.id === 6) {
        jacketColor = '#DC2626'; // Pure premium warm cherry-red jacket
      }

      // 1. INPUT CYCLE ACTIONS
      const isWalking = (keysHeldRef.current['a'] || keysHeldRef.current['d'] || keysHeldRef.current['arrowleft'] || keysHeldRef.current['arrowright'] || (isAutoPlayRef.current && !activeDialogueRef.current)) && !p.isJumping;
      const walkBob = isWalking ? Math.sin(Date.now() * 0.015) * 2.5 : 0;
      
      const headY = p.y + 3.5 + walkBob;

      // 2. FACE (Sweet rounded cheeks)
      ctx.fillStyle = '#FECACA'; // Adorable warm peach skin tone
      ctx.beginPath();
      ctx.roundRect(screenPlayerX + 4.5, headY, 19, 15, 6);
      ctx.fill();

      // Rosy blush circles underneath her eyes!
      ctx.fillStyle = 'rgba(251, 113, 133, 0.65)';
      ctx.beginPath();
      ctx.arc(screenPlayerX + 7.5, headY + 11.5, 2.2, 0, Math.PI * 2);
      ctx.arc(screenPlayerX + 20.5, headY + 11.5, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // 3. ADORABLE LARGE ANME EYES (Expressive circular eyes with white highlight reflections!)
      const eyeY = headY + 7.5;
      const leftEyeX = p.facing === 'right' ? screenPlayerX + 11.0 : screenPlayerX + 8.0;
      const rightEyeX = p.facing === 'right' ? screenPlayerX + 18.0 : screenPlayerX + 15.0;

      // Left eye
      ctx.fillStyle = '#0F172A'; // Black pupil
      ctx.beginPath();
      ctx.arc(leftEyeX, eyeY, 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.arc(rightEyeX, eyeY, 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Gleaming white anime highlights
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(leftEyeX + 0.8, eyeY - 0.7, 0.8, 0, Math.PI * 2);
      ctx.arc(rightEyeX + 0.8, eyeY - 0.7, 0.8, 0, Math.PI * 2);
      ctx.fill();

      // 4. SMILEY OPEN MOUTH WITH CUTE TONGUE (Very happy, just like the reference drawing!)
      const mouthX = screenPlayerX + 13.5;
      const mouthY = headY + 11.0;
      
      // Draw smiley mouth
      ctx.fillStyle = '#B91C1C'; // Red mouth contour
      ctx.beginPath();
      ctx.arc(mouthX, mouthY, 2.0, 0, Math.PI, false);
      ctx.fill();

      // Draw cute little tongue overlay
      ctx.fillStyle = '#FB7185'; // soft pink tongue
      ctx.beginPath();
      ctx.arc(mouthX, mouthY + 0.8, 1.2, 0, Math.PI, false);
      ctx.fill();

      // 5. HAIR & HIGH BOUNCY PONYTAIL (Chocolate brown with red hair tie)
      ctx.fillStyle = '#78350F'; // Beautiful rich chocolate hair color!
      
      // Hair core scalp cover
      ctx.beginPath();
      ctx.roundRect(screenPlayerX + 3.0, headY - 1.5, 22.0, 7.0, 3);
      ctx.fill();

      // Bangs / Fringe frames
      ctx.beginPath();
      if (p.facing === 'right') {
        ctx.roundRect(screenPlayerX + 3.5, headY, 6.0, 9.5, 2); // back hair
        ctx.roundRect(screenPlayerX + 19.0, headY, 4.5, 5.5, 2); // fringe
        ctx.roundRect(screenPlayerX + 16.5, headY + 1, 2.5, 8.5, 1); // side lock
      } else {
        ctx.roundRect(screenPlayerX + 18.5, headY, 6.0, 9.5, 2); // back hair
        ctx.roundRect(screenPlayerX + 4.5, headY, 4.5, 5.5, 2); // fringe
        ctx.roundRect(screenPlayerX + 9.0, headY + 1, 2.5, 8.5, 1); // side lock
      }
      ctx.fill();

      // Ponytail hair tie & fluffy tail that sways
      const tieX = p.facing === 'right' ? screenPlayerX + 5.0 : screenPlayerX + 23.0;
      const tieY = headY + 1.5;

      // Red Hair Ribbon
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(tieX, tieY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Fluffy bouncy ponytail shape
      const ponySway = Math.sin(Date.now() * 0.015) * 2.5;
      const tailX = p.facing === 'right' ? tieX - 6.5 : tieX + 6.5;
      const tailY = tieY + 2.0 + ponySway;

      ctx.fillStyle = '#78350F';
      ctx.beginPath();
      ctx.arc(tailX, tailY, 5.5, 0, Math.PI * 2); // main fluff
      ctx.arc(tailX + (p.facing === 'right' ? -2.5 : 2.5), tailY + 3.0, 4.0, 0, Math.PI * 2); // tail end
      ctx.fill();

      // Cute employee lanyard hanging around neck (ByteDance ID card for 2019-2026 levels)
      if (lvl.id >= 2) {
        ctx.fillStyle = '#E11D48'; // Bright red lanyard neck loop
        ctx.fillRect(screenPlayerX + 6.0, p.y + 19.5 + walkBob, 16.0, 1.5);
        ctx.fillStyle = '#FFFFFF'; // Clean white badge card
        ctx.fillRect(screenPlayerX + 12.0, p.y + 21.0 + walkBob, 4.5, 5.5);
        ctx.fillStyle = '#2563EB'; // Blue decorative strip of ByteDance Lanyard
        ctx.fillRect(screenPlayerX + 12.0, p.y + 21.0 + walkBob, 4.5, 1.2);
      }

      // 6. RED HOODIE JACKET TORSO & OPEN COLLAR (With warm yellow shirt underneath)
      ctx.fillStyle = jacketColor;
      ctx.beginPath();
      ctx.roundRect(screenPlayerX + 2.0, p.y + 18.5 + walkBob, 24.0, 19.5, 5); // soft rounded hoodie
      ctx.fill();

      // Yellow inner shirt
      ctx.fillStyle = innerShirtColor;
      ctx.fillRect(screenPlayerX + 9.5, p.y + 18.5 + walkBob, 9.0, 10.0);

      // Hoodie drawstrings (cute little details)
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(screenPlayerX + 9.5, p.y + 25.5 + walkBob, 1.5, 4.5);
      ctx.fillRect(screenPlayerX + 17.0, p.y + 25.5 + walkBob, 1.5, 4.5);

      // Jacket outer sleeves
      ctx.fillStyle = jacketColor;
      if (lvl.id === 1) {
        // Short skin sleeves for recruit look
        ctx.fillStyle = '#FECACA';
        ctx.fillRect(screenPlayerX, p.y + 21.5 + walkBob, 2.5, 11);
        ctx.fillRect(screenPlayerX + 25.5, p.y + 21.5 + walkBob, 2.5, 11);
        ctx.fillStyle = jacketColor;
        ctx.fillRect(screenPlayerX, p.y + 18.5 + walkBob, 2.5, 3.5);
        ctx.fillRect(screenPlayerX + 25.5, p.y + 18.5 + walkBob, 2.5, 3.5);
      } else {
        // Long sleeves jacket
        ctx.fillRect(screenPlayerX, p.y + 21.0 + walkBob, 2.5, 11.5);
        ctx.fillRect(screenPlayerX + 25.5, p.y + 21.0 + walkBob, 2.5, 11.5);
        // Cute skin matching hands peeking out
        ctx.fillStyle = '#FECACA';
        ctx.beginPath();
        ctx.arc(screenPlayerX + 1.25, p.y + 33.0 + walkBob, 1.5, 0, Math.PI * 2);
        ctx.arc(screenPlayerX + 26.75, p.y + 33.0 + walkBob, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 7. SHORTS (Off-white sporty shorts)
      ctx.fillStyle = pantsColor;
      ctx.beginPath();
      ctx.roundRect(screenPlayerX + 4.5, p.y + 37.0 + walkBob, 19.0, 5.0, 2.0);
      ctx.fill();

      // Center shorts partition
      ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
      ctx.fillRect(screenPlayerX + 13.5, p.y + 37.0 + walkBob, 1.0, 5.0);

      // Rounded bare legs
      ctx.fillStyle = '#FECACA';
      ctx.fillRect(screenPlayerX + 6.0, p.y + 41.5 + walkBob, 4.0, 3.5);
      ctx.fillRect(screenPlayerX + 18.0, p.y + 41.5 + walkBob, 4.0, 3.5);

      // 8. SNEAKERS (Sporty white shoes with tiny cute red design decals!)
      const leftFootExtend = isWalking ? Math.sin(Date.now() * 0.015) * 6 : 0;
      const rightFootExtend = isWalking ? -Math.sin(Date.now() * 0.015) * 6 : 0;

      // Left white sneaker
      const leftShoeX = screenPlayerX + 3.5 + (leftFootExtend > 0 ? leftFootExtend : 0);
      const leftShoeY = p.y + 44.5 + (leftFootExtend < 0 ? 1.0 : 0);
      ctx.fillStyle = '#FFFFFF'; // Sneaker body
      ctx.beginPath();
      ctx.roundRect(leftShoeX, leftShoeY, 9.0, 3.8, 1.8);
      ctx.fill();
      // Red stripe decal
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(leftShoeX + 2.0, leftShoeY + 1.2, 5.0, 1.0);

      // Right white sneaker
      const rightShoeX = screenPlayerX + 15.5 + (rightFootExtend > 0 ? rightFootExtend : 0);
      const rightShoeY = p.y + 44.5 + (rightFootExtend < 0 ? 1.0 : 0);
      ctx.fillStyle = '#FFFFFF'; // Sneaker body
      ctx.beginPath();
      ctx.roundRect(rightShoeX, rightShoeY, 9.0, 3.8, 1.8);
      ctx.fill();
      // Red stripe decal
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(rightShoeX + 2.0, rightShoeY + 1.2, 5.0, 1.0);

      // Floating Retro Overhead Mario-Style HUD
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      // Draw small background pill behind floating status details
      ctx.roundRect(screenPlayerX - 25, headY - 32, 78, 18, 4);
      ctx.fill();

      // Display Hearts and Stats on Canvas
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      
      // Hearts: ❤️ ❤️ ❤️
      ctx.fillStyle = '#F43F5E'; // Red-pink hearts
      ctx.fillText('♥♥♥', screenPlayerX + p.width/2, headY - 24);
      
      // Status string
      ctx.fillStyle = '#FBBF24'; // Yellow retro text
      ctx.fillText(`SKILLS:${p.skills.length} XP:${p.growth}`, screenPlayerX + p.width/2, headY - 16);
      ctx.restore();

      // If jumping, draw trailing particles or wind lines
      if (p.isJumping) {
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenPlayerX + p.width/2, p.y + p.height);
        ctx.lineTo(screenPlayerX + p.width/2, p.y + p.height + 10);
        ctx.stroke();
      }

      ctx.restore();
    };

    // Loop driver with 60 FPS cap to normalize speed on high-refresh-rate monitors (120Hz, 144Hz, etc.)
    let lastTime = performance.now();
    const fpsInterval = 1000 / 60; // 16.67ms per frame for a perfectly normal speed

    const tick = (currentTime: number) => {
      animId = requestAnimationFrame(tick);
      const elapsed = currentTime - lastTime;

      // When 16.67ms or more have elapsed, run the physics tick and drawing
      if (elapsed >= fpsInterval) {
        lastTime = currentTime - (elapsed % fpsInterval);
        updatePhysics();
        updateEnemyPatrols();
        drawGame();
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="w-full select-none flex flex-col items-center">
      
      {/* Dynamic Game Port Stage */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
        style={{ height: `${dimensions.height}px` }}
      >
        {/* HTML5 Canvas */}
        <canvas 
          ref={canvasRef} 
          width={dimensions.width} 
          height={dimensions.height}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Dynamic Fog effect overlay for LEVEL 4 迷雾森林 */}
        {level.id === 4 && (
          <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(0,0,0,0.85)_95%] opacity-90 transition-opacity duration-1000" />
        )}

        {/* Auto Play Overlay Label */}
        {isAutoPlay && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 rounded-full border border-orange-500/30 bg-orange-950/80 px-3 py-1 text-xs font-bold text-orange-400 backdrop-blur-md animate-pulse">
            <Zap className="h-3 w-3 fill-orange-400" />
            <span>自动漫游探索模式 (演示中)</span>
          </div>
        )}

        {/* Narrative dialogue bubble layers synced directly on trigger coordinates */}
        {activeDialogue && (
          <div className="absolute inset-x-4 bottom-6 z-30 mx-auto max-w-xl rounded-xl border border-white/10 bg-slate-950/90 p-4 text-xs shadow-2xl backdrop-blur-lg md:text-sm animate-fade-in">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                activeDialogue.speaker === 'Yoyo' ? 'bg-blue-600/20 text-blue-400' :
                activeDialogue.speaker === 'Mirror' ? 'bg-amber-600/20 text-amber-400' :
                activeDialogue.speaker === 'Fear' ? 'bg-red-600/20 text-red-400' :
                'bg-slate-800 text-slate-300'
              }`}>
                {activeDialogue.speaker === 'Yoyo' ? <Award className="h-4 w-4" /> : 
                 activeDialogue.speaker === 'Mirror' ? <Eye className="h-4 w-4" /> :
                 activeDialogue.speaker === 'Fear' ? <ShieldAlert className="h-4 w-4" /> :
                 <MessageSquare className="h-4 w-4" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <span>{activeDialogue.speaker === 'Yoyo' ? 'Yoyo' : 
                         activeDialogue.speaker === 'Mirror' ? '镜像 Yoyo (内心本源发问)' :
                         activeDialogue.speaker === 'Fear' ? '恐惧心魔' :
                         activeDialogue.speaker === 'Senior' ? '业务导师 / 前辈' : '系统提示'}</span>
                  <span className="text-[10px] font-normal text-slate-500">[{level.year}]</span>
                </div>
                <div className="space-y-1 text-slate-300 leading-relaxed font-sans">
                  {activeDialogue.text.map((t, index) => (
                    <p key={index}>{t}</p>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button 
                onClick={onCloseDialogue}
                className="flex items-center space-x-1 rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-500 focus:outline-none"
              >
                <span>点击或空格继续</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-Screen Touch Controls (Extremely handy for iframe usability, and mobile tests) */}
      <div className="mt-4 flex w-full flex-wrap items-center justify-between gap-4 px-2">
        <div className="text-[11px] text-slate-400 flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs font-mono">←</kbd>
            <kbd className="px-2 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs font-mono">→</kbd>
            <span>左右移动</span>
          </div>
          <div className="flex items-center space-x-1">
            <kbd className="px-3.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-xs font-mono">空格 Space</kbd>
            <span>跳跃</span>
          </div>
        </div>

        {/* Touch panel actions */}
        <div className="flex items-center space-x-2">
          <button 
            type="button"
            onMouseDown={() => triggerKeyPress('arrowleft', true)}
            onMouseUp={() => triggerKeyPress('arrowleft', false)}
            onMouseLeave={() => triggerKeyPress('arrowleft', false)}
            onTouchStart={(e) => { e.preventDefault(); triggerKeyPress('arrowleft', true); }}
            onTouchEnd={() => triggerKeyPress('arrowleft', false)}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-250 active:bg-slate-700 active:scale-95 touch-none"
            aria-label="Move left"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <button 
            type="button"
            onMouseDown={() => triggerKeyPress('arrowright', true)}
            onMouseUp={() => triggerKeyPress('arrowright', false)}
            onMouseLeave={() => triggerKeyPress('arrowright', false)}
            onTouchStart={(e) => { e.preventDefault(); triggerKeyPress('arrowright', true); }}
            onTouchEnd={() => triggerKeyPress('arrowright', false)}
            className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-250 active:bg-slate-700 active:scale-95 touch-none"
            aria-label="Move right"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          <button 
            type="button"
            onMouseDown={() => triggerKeyPress('space', true)}
            onMouseUp={() => triggerKeyPress('space', false)}
            onMouseLeave={() => triggerKeyPress('space', false)}
            onTouchStart={(e) => { e.preventDefault(); triggerKeyPress('space', true); }}
            onTouchEnd={() => triggerKeyPress('space', false)}
            className="flex h-11 px-5 items-center justify-center space-x-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg shadow-blue-500/20 active:bg-blue-700 active:scale-95 touch-none"
            aria-label="Jump"
          >
            <ArrowUp className="h-5 w-5" />
            <span className="text-xs">跳 跃</span>
          </button>
        </div>
      </div>
    </div>
  );
}
