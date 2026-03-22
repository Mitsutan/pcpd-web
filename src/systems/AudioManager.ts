// Audio system placeholder
// Provides sound effect and BGM playback infrastructure
// Actual audio files can be added later by placing them in public/assets/audio/

export type SoundEffectId =
  | 'shoot'
  | 'reload'
  | 'hit'
  | 'explosion'
  | 'arrest'
  | 'pickup'
  | 'radio_beep'
  | 'death'
  | 'cqc_success'
  | 'cqc_fail';

export type BGMId = 'title' | 'game' | 'boss' | 'gameover' | 'score';

export class AudioManager {
  private scene: Phaser.Scene;
  private sfxVolume: number = 0.5;
  private bgmVolume: number = 0.3;
  private currentBGM: Phaser.Sound.BaseSound | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Play a sound effect (non-blocking) */
  playSFX(id: SoundEffectId): void {
    // Placeholder: no actual audio files loaded
    // When audio files are added to public/assets/audio/sfx/, uncomment:
    // if (this.scene.sound.get(id)) {
    //   this.scene.sound.play(id, { volume: this.sfxVolume });
    // }
  }

  /** Play background music (loops) */
  playBGM(id: BGMId, fadeIn: boolean = false): void {
    this.stopBGM();

    // Placeholder: no actual audio files loaded
    // When audio files are added to public/assets/audio/bgm/, uncomment:
    // if (this.scene.sound.get(id)) {
    //   this.currentBGM = this.scene.sound.play(id, {
    //     loop: true,
    //     volume: fadeIn ? 0 : this.bgmVolume,
    //   });
    //   if (fadeIn && this.currentBGM) {
    //     this.scene.tweens.add({
    //       targets: this.currentBGM,
    //       volume: this.bgmVolume,
    //       duration: 2000,
    //     });
    //   }
    // }
  }

  /** Stop current background music */
  stopBGM(fadeOut: boolean = false): void {
    if (!this.currentBGM) return;

    if (fadeOut) {
      this.scene.tweens.add({
        targets: this.currentBGM,
        volume: 0,
        duration: 1000,
        onComplete: () => {
          this.currentBGM?.stop();
          this.currentBGM = null;
        },
      });
    } else {
      this.currentBGM.stop();
      this.currentBGM = null;
    }
  }

  /** Set SFX volume (0-1) */
  setSFXVolume(volume: number): void {
    this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
  }

  /** Set BGM volume (0-1) */
  setBGMVolume(volume: number): void {
    this.bgmVolume = Phaser.Math.Clamp(volume, 0, 1);
    if (this.currentBGM && 'setVolume' in this.currentBGM) {
      (this.currentBGM as Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound).setVolume(
        this.bgmVolume,
      );
    }
  }

  /** Preload audio files (call from BootScene) */
  static preload(scene: Phaser.Scene): void {
    // Placeholder: no actual audio files to load
    // When audio files are available, add:
    // scene.load.audio('shoot', 'assets/audio/sfx/shoot.mp3');
    // scene.load.audio('reload', 'assets/audio/sfx/reload.mp3');
    // ... etc.
    // scene.load.audio('title', 'assets/audio/bgm/title.mp3');
    // ... etc.
  }
}
