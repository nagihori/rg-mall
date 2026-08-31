'use client'
import { createContext, useContext, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

type Slide = { src: string; alt: string }
const OpenLightboxContext = createContext<((index: number) => void) | null>(null)

// メイン画像・ギャラリー画像をまとめて1つのライトボックスで次へ/前へ送れるようにする。
// Provider配下ならどこに置いたトリガーからでも同じスライド列を開閉できる(DOM上の位置がバラバラでもOK)。
export function LightboxProvider({ slides, children }: { slides: Slide[]; children: React.ReactNode }) {
  const [index, setIndex] = useState(-1)
  return (
    <OpenLightboxContext.Provider value={setIndex}>
      {children}
      <Lightbox open={index >= 0} index={index} close={() => setIndex(-1)} slides={slides} />
    </OpenLightboxContext.Provider>
  )
}

export function LightboxTrigger({ index, className, children }: { index: number; className?: string; children: React.ReactNode }) {
  const open = useContext(OpenLightboxContext)
  return (
    <button type="button" className={className} onClick={() => open?.(index)}>
      {children}
    </button>
  )
}
