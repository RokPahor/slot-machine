import * as Phaser from "phaser"
import {
  CreditTextOptions,
  HighlightElementOptions,
  RoundOption,
  SpinButtonOptions,
  WrapperElementOptions,
} from "./types"

// Game options
const reelWidth = 150
const reelX = 125
const reelHeight = 450
const symbolHeight = 150
const spinDurationMs = 2500
const reelsYVelocityWhenSpinning = 1200
const reels: Phaser.Physics.Arcade.Group[] = []
const symbols = [
  "slot-symbol-seven",
  "slot-symbol-cherry",
  "slot-symbol-bell",
  "slot-symbol-bar",
  "slot-symbol-lemon",
]
let isSlotSpinning: boolean = false
const spinButtonOptions: SpinButtonOptions = {
  defaultText: "Spin",
  spinningStateText: "Spinning",
  x: 630,
  y: 500,
  fontSize: "32px",
  color: "#ffffff",
  animationConfigWhenSpinning: {
    scaleX: 1.3,
    scaleY: 1.2,
    duration: 300,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  },
}

const creditTextOptions: CreditTextOptions = {
  startValue: 100,
  x: 630,
  y: 50,
  fontSize: "32px",
  color: "#ffffff",
}

const roundWinOptions: RoundOption = {
  name: "round_win",
  creditColor: "green",
  wrapperColor: 0x008000,
  wrapperStroke: 12,
  reward: 100,
  effectDuration: 2000,
}
const roundLossOptions: RoundOption = {
  name: "round_loss",
  creditColor: "red",
  wrapperColor: 0xff0000,
  wrapperStroke: 10,
  reward: -20,
  effectDuration: 1000,
}

const wrapperElementOptions: WrapperElementOptions = {
  defaultWrapperBorderColor: 0xc0c0c0,
  defaultWrapperBackgroundColor: 0x9c9cf2,
  defaultStroke: 5,
}

const highlightRowOptions: HighlightElementOptions = {
  color: 0xffcc00,
  stroke: 7,
}

// Phaser elements
let slotWrapperElement: Phaser.GameObjects.Rectangle
let spinButtonElement: Phaser.GameObjects.Text
let userCreditTextElement: Phaser.GameObjects.Text
let rowHighlightElement: Phaser.GameObjects.Graphics

// Sound
let reelSpinningSound: Phaser.Sound.BaseSound
let roundWinSound: Phaser.Sound.BaseSound

// Scene
class Game extends Phaser.Scene {
  constructor() {
    super({ key: "Game" })
  }

  public init(): void {}

  preload(): void {
    // Load symbols
    symbols.forEach((symbol) => {
      this.load.image(symbol, `assets/${symbol}.png`)
    })
    // Load audio
    this.load.audio("reelsSound", "assets/slot-machine-reels.mp3")
    this.load.audio("roundWinSound", "assets/slot-machine-win.mp3")
  }

  create(): void {
    this.createReels()
    this.addHighlightToMainRow()
    this.createCreditText()
    this.createSpinButton()
    this.setupKeyBoardEvents()
    this.createSoundBoard()
  }

  //SETUP FUNCTIONS
  setupKeyBoardEvents(): void {
    // Spin the reels also on space bar or enter click
    this.input.keyboard.on("keydown", (e: KeyboardEvent) => {
      debugger
      if (e.key == " " || e.key === "Enter") this.spinReels()
    })
  }
  createSoundBoard(): void {
    reelSpinningSound = this.sound.add("reelsSound", {
      loop: true,
      volume: 1,
      rate: 7,
    })
    roundWinSound = this.sound.add("roundWinSound", {
      loop: true,
      volume: 1,
    })
  }

  addHighlightToMainRow(): void {
    rowHighlightElement = this.add.graphics()
    rowHighlightElement.lineStyle(
      highlightRowOptions.stroke,
      highlightRowOptions.color
    )
    rowHighlightElement.strokeRect(
      reelWidth - 25,
      240,
      reelWidth * 3,
      symbolHeight
    )
  }
  createCreditText(): void {
    userCreditTextElement = this.add
      .text(
        creditTextOptions.x,
        creditTextOptions.y,
        `Credit: ${creditTextOptions.startValue}€`,
        {
          fontSize: creditTextOptions.fontSize,
          color: creditTextOptions.color,
        }
      )
      .setData("credit", creditTextOptions.startValue)
  }

  createSpinButton(): void {
    spinButtonElement = this.add
      .text(
        spinButtonOptions.x,
        spinButtonOptions.y,
        spinButtonOptions.defaultText,
        {
          fontSize: spinButtonOptions.fontSize,
          color: spinButtonOptions.color,
        }
      )
      .setInteractive({ useHandCursor: true })
    spinButtonElement.on("pointerdown", this.spinReels, this)
  }

  createReels(): void {
    slotWrapperElement = this.add
      .rectangle(
        reelX,
        90,
        reelWidth * 3,
        reelHeight,
        wrapperElementOptions.defaultWrapperBackgroundColor
      )
      .setOrigin(0, 0)
    slotWrapperElement.setStrokeStyle(
      wrapperElementOptions.defaultStroke,
      wrapperElementOptions.defaultWrapperBorderColor
    )

    // Create 3 reels
    for (let i = 0; i < 3; i++) {
      const reel = this.physics.add.group()
      reel.setVelocityX(reelX + reelWidth / 2 + i * reelWidth)

      //Symbols setup
      for (let j = 0; j < 3; j++) {
        const randomSymbol = Phaser.Utils.Array.GetRandom(symbols)

        const symbolImage = this.add.image(
          reelX + reelWidth / 2 + i * reelWidth,
          150 + j * symbolHeight,
          randomSymbol
        )
        reel.add(symbolImage)
      }

      reels.push(reel)
    }
  }

  // SPINNING FUNCTIONALITY
  startSpin(reel: Phaser.Physics.Arcade.Group): void {
    reel.getChildren().forEach((symbol) => {
      symbol.body.velocity.y = reelsYVelocityWhenSpinning
    })
  }

  stopSpin(reel: Phaser.Physics.Arcade.Group): void {
    reel.getChildren().forEach((symbol, index: number) => {
      symbol.body.velocity.y = 0
      ;(symbol as Phaser.GameObjects.Image).y = 160 + index * symbolHeight
      ;(symbol as Phaser.GameObjects.Image).setTexture(
        Phaser.Utils.Array.GetRandom(symbols)
      )

      // Add a small bounce when the spining stops
      this.tweens.add({
        targets: symbol,
        y: (symbol as Phaser.GameObjects.Image).y - 40,
        duration: 150,
        yoyo: true,
        ease: "Sine.easeOut",
      })
    })
  }

  spinReels(): void {
    if (isSlotSpinning) return
    isSlotSpinning = true
    reelSpinningSound.play()
    spinButtonElement.text = spinButtonOptions.spinningStateText

    this.tweens.add({
      targets: spinButtonElement,
      scaleX: spinButtonOptions.animationConfigWhenSpinning.scaleX,
      scaleY: spinButtonOptions.animationConfigWhenSpinning.scaleY,
      duration: spinButtonOptions.animationConfigWhenSpinning.duration,
      yoyo: spinButtonOptions.animationConfigWhenSpinning.yoyo,
      repeat: spinButtonOptions.animationConfigWhenSpinning.repeat,
      ease: spinButtonOptions.animationConfigWhenSpinning.ease,
    })

    reels.forEach((reel, index: number) => {
      this.time.delayedCall(index * 300, () => {
        this.startSpin(reel)
      })
    })

    // Stop the spin
    this.time.delayedCall(spinDurationMs, () => {
      reels.forEach((reel) => {
        this.stopSpin(reel)
      })
      reelSpinningSound.stop()
      isSlotSpinning = false
      spinButtonElement.text = spinButtonOptions.defaultText
      this.tweens.killAll()
      this.checkResult()
    })
  }

  update(): void {
    reels.forEach((reel) => {
      reel.getChildren().forEach((symbol) => {
        // Symbol leaves the area -> send to top
        if ((symbol as Phaser.GameObjects.Image).y > 480) {
          ;(symbol as Phaser.GameObjects.Image).y = 260 - symbolHeight
          ;(symbol as Phaser.GameObjects.Image).setTexture(
            Phaser.Utils.Array.GetRandom(symbols)
          )
        }
      })
    })
  }

  // RESULT CHECKING FUNCTIONALITY
  checkResult(): void {
    const firstColumnResultAfterSpin = (
      reels[0]?.children?.entries[1] as Phaser.GameObjects.Image
    )?.texture?.key
    const secondColumnResultAfterSpin = (
      reels[1]?.children?.entries[1] as Phaser.GameObjects.Image
    )?.texture?.key
    const thirdColumnResultAfterSpin = (
      reels[2]?.children?.entries[1] as Phaser.GameObjects.Image
    )?.texture?.key
    const creditBeforeSpin = userCreditTextElement.getData("credit")
    const isRoundWon =
      new Set([
        firstColumnResultAfterSpin,
        secondColumnResultAfterSpin,
        thirdColumnResultAfterSpin,
      ]).size === 1

    const optionToUse = isRoundWon ? roundWinOptions : roundLossOptions

    // If win -> Play win sound
    if (isRoundWon) roundWinSound.play()
    // Update slot wrapper style
    slotWrapperElement.setStrokeStyle(
      optionToUse.wrapperStroke,
      optionToUse.wrapperColor
    )
    this.time.delayedCall(optionToUse.effectDuration, () =>
      //Reset style after defined time
      slotWrapperElement.setStrokeStyle(
        wrapperElementOptions.defaultStroke,
        wrapperElementOptions.defaultWrapperBorderColor
      )
    )

    // Update user credit value and style
    userCreditTextElement.setData(
      "credit",
      creditBeforeSpin + optionToUse.reward
    )
    // Show change in credit for the defined time
    userCreditTextElement.text = `Credit: ${optionToUse.reward > 0 ? "+" : ""}${
      optionToUse.reward
    }€`
    userCreditTextElement.setStyle({ color: optionToUse.creditColor })
    this.time.delayedCall(optionToUse.effectDuration, () => {
      //reset style after defined time
      userCreditTextElement.setStyle({ color: creditTextOptions.color })
      userCreditTextElement.text = `Credit: ${userCreditTextElement.getData(
        "credit"
      )}€`
      // Stop win sound
      if (roundWinSound.isPlaying) roundWinSound.stop()
    })

    // Check if game over
    if (userCreditTextElement.getData("credit") === 0) this.endGame()
  }

  endGame(): void {
    // Stop the current game
    spinButtonElement.setActive(false)
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: "gameContainer",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: [Game],
}

const game = new Phaser.Game(gameConfig)
