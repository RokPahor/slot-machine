export interface CreditTextOptions {
  startValue: number
  x: number
  y: number
  fontSize: string
  color: string
}
export interface RoundOption {
  name: "round_win" | "round_loss"
  creditColor: string
  wrapperColor: number
  wrapperStroke: number
  reward: number
  effectDuration: number
}
export interface WrapperElementOptions {
  defaultWrapperBorderColor: number
  defaultWrapperBackgroundColor: number
  defaultStroke: number
}
export interface HighlightElementOptions {
  color: number
  stroke: number
}
export interface SpinButtonOptions {
  defaultText: string
  spinningStateText: string
  x: number
  y: number
  fontSize: string
  color: string
  animationConfigWhenSpinning: {
    scaleX: number
    scaleY: number
    duration: number
    yoyo: boolean
    repeat: number
    ease: string | Function
  }
}
