'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import type { Workout } from '@/types'

interface Props {
  workout: Workout
  onClose: () => void
}

const W = 1080
const H = 1350

type OverlayId = 'none' | 'soft' | 'strong' | 'frame' | 'bw'
type TextStyleId = 'minimal' | 'bold' | 'editorial' | 'clean'

const OVERLAYS: { id: OverlayId; label: string }[] = [
  { id: 'none',   label: '없음'   },
  { id: 'soft',   label: 'SOFT'   },
  { id: 'strong', label: 'STRONG' },
  { id: 'frame',  label: 'FRAME'  },
  { id: 'bw',     label: 'B&W'    },
]

const TEXT_STYLES: { id: TextStyleId; label: string }[] = [
  { id: 'minimal',   label: 'MINIMAL'   },
  { id: 'bold',      label: 'BOLD'      },
  { id: 'editorial', label: 'EDITORIAL' },
  { id: 'clean',     label: 'CLEAN'     },
]

function parseExercises(exercises: string[]) {
  const groups: string[][] = [[]]
  for (const line of exercises) {
    if (line.trim() === '') {
      if (groups[groups.length - 1].length > 0) groups.push([])
    } else {
      groups[groups.length - 1].push(line)
    }
  }
  return groups.filter(g => g.length > 0)
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${year}.${month}.${day}`
}

function applyOverlay(ctx: CanvasRenderingContext2D, overlay: OverlayId) {
  if (overlay === 'none') {
    ctx.shadowColor = 'rgba(0,0,0,0.9)'
    ctx.shadowBlur = 20
  } else if (overlay === 'soft') {
    const grad = ctx.createLinearGradient(0, H * 0.5, 0, H)
    grad.addColorStop(0, 'rgba(12,12,12,0)')
    grad.addColorStop(0.45, 'rgba(12,12,12,0.55)')
    grad.addColorStop(1, 'rgba(12,12,12,0.9)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  } else if (overlay === 'strong') {
    const grad = ctx.createLinearGradient(0, H * 0.2, 0, H)
    grad.addColorStop(0, 'rgba(12,12,12,0)')
    grad.addColorStop(0.25, 'rgba(12,12,12,0.75)')
    grad.addColorStop(1, 'rgba(12,12,12,0.98)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  } else if (overlay === 'bw') {
    const grad = ctx.createLinearGradient(0, H * 0.5, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.7)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
  } else if (overlay === 'frame') {
    ctx.fillStyle = 'rgba(12,12,12,0.97)'
    ctx.fillRect(0, H - 420, W, 420)
    ctx.fillStyle = '#E5FE3D'
    ctx.fillRect(0, H - 420, W, 2)
  }
}

function applyTextStyle(
  ctx: CanvasRenderingContext2D,
  workout: Workout,
  style: TextStyleId,
  tx: number,
  ty: number,
  scale: number = 1,
  dark: boolean = false
) {
  const groups = parseExercises(workout.exercises)
  let y = ty
  const s = scale
  const titleColor = dark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.95)'
  const accentColor = dark ? '#b8a800' : '#E5FE3D'
  const bodyColor = dark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.6)'

  if (style === 'minimal') {
    if (workout.title) {
      ctx.font = `700 ${Math.round(56*s)}px "Bebas Neue", Impact, sans-serif`
      ctx.fillStyle = titleColor
      ctx.fillText(workout.title, tx, y); y += Math.round(64*s)
    }
    if (workout.format) {
      ctx.font = `300 ${Math.round(24*s)}px -apple-system, sans-serif`
      ctx.fillStyle = accentColor
      ctx.fillText(workout.format, tx, y); y += Math.round(36*s)
    }
    y += 4
    ctx.font = `300 ${Math.round(22*s)}px -apple-system, sans-serif`
    ctx.fillStyle = bodyColor
    for (const group of groups) {
      for (const ex of group) { if (y > H - 60) break; ctx.fillText(ex, tx, y); y += Math.round(30*s) }
      y += Math.round(10*s)
    }

  } else if (style === 'bold') {
    if (workout.title) {
      ctx.font = `700 ${Math.round(120*s)}px "Bebas Neue", Impact, sans-serif`
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.92)' : 'white'
      const words = workout.title.split(' ')
      let line = ''
      for (const word of words) {
        const test = line + (line ? ' ' : '') + word
        if (ctx.measureText(test).width > W - tx - 56 && line) {
          ctx.fillText(line, tx, y); y += Math.round(124*s); line = word
        } else line = test
      }
      if (line) { ctx.fillText(line, tx, y); y += Math.round(124*s) }
    }
    if (workout.format) {
      ctx.font = `700 ${Math.round(52*s)}px "Bebas Neue", Impact, sans-serif`
      ctx.fillStyle = accentColor
      ctx.fillText(workout.format, tx, y); y += Math.round(62*s)
    }
    ctx.font = `400 ${Math.round(30*s)}px -apple-system, sans-serif`
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.82)'
    for (const group of groups) {
      for (const ex of group) { if (y > H - 60) break; ctx.fillText(ex, tx, y); y += Math.round(40*s) }
      y += Math.round(14*s)
    }

  } else if (style === 'editorial') {
    const x = tx + 20
    ctx.shadowBlur = 0
    ctx.fillStyle = accentColor
    ctx.fillRect(tx, y - 14, 2, Math.round(240*s))
    if (workout.title) {
      ctx.font = `700 ${Math.round(70*s)}px "Bebas Neue", Impact, sans-serif`
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.92)' : 'white'
      ctx.fillText(workout.title, x, y); y += Math.round(78*s)
    }
    if (workout.format) {
      ctx.font = `300 ${Math.round(26*s)}px -apple-system, sans-serif`
      ctx.fillStyle = accentColor
      ctx.fillText(workout.format.toUpperCase(), x, y); y += Math.round(38*s)
    }
    y += 10
    ctx.font = `300 ${Math.round(24*s)}px -apple-system, sans-serif`
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.65)'
    for (const group of groups) {
      for (const ex of group) { if (y > H - 60) break; ctx.fillText(ex, x, y); y += Math.round(32*s) }
      y += Math.round(12*s)
    }

  } else if (style === 'clean') {
    if (workout.title) {
      ctx.font = `700 ${Math.round(82*s)}px "Bebas Neue", Impact, sans-serif`
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.92)' : 'white'
      ctx.fillText(workout.title, tx, y); y += Math.round(90*s)
    }
    if (workout.format) {
      ctx.font = `400 ${Math.round(28*s)}px -apple-system, sans-serif`
      ctx.fillStyle = accentColor
      ctx.fillText(workout.format, tx, y); y += Math.round(42*s)
    }
    y += 8
    ctx.font = `300 ${Math.round(26*s)}px -apple-system, sans-serif`
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.75)'
    for (const group of groups) {
      for (const ex of group) { if (y > H - 60) break; ctx.fillText(ex, tx, y); y += Math.round(34*s) }
      y += Math.round(12*s)
    }
  }
}

const TEMPLATE_KEY = 'hyrox_template'

function loadTemplate() {
  try {
    const raw = localStorage.getItem(TEMPLATE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as {
      overlay: OverlayId
      textStyle: TextStyleId
      textPos: { x: number; y: number }
      fontSize: number
      darkText: boolean
    }
  } catch { return null }
}

export default function WorkoutTemplate({ workout, onClose }: Props) {
  const saved = loadTemplate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const drawIdRef = useRef(0)
  const bgCacheRef = useRef<ImageData | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [overlay, setOverlay] = useState<OverlayId>(saved?.overlay ?? 'soft')
  const [textStyle, setTextStyle] = useState<TextStyleId>(saved?.textStyle ?? 'minimal')
  const [textPos, setTextPos] = useState(saved?.textPos ?? { x: 0.052, y: 0.72 })
  const [dragging, setDragging] = useState(false)
  const [fontSize, setFontSize] = useState(saved?.fontSize ?? 1)
  const [darkText, setDarkText] = useState(saved?.darkText ?? false)
  const [textOnlyMode, setTextOnlyMode] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveImageUrl, setSaveImageUrl] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(workout.title || '')
  const [editFormat, setEditFormat] = useState(workout.format || '')
  const [editExercises, setEditExercises] = useState(workout.exercises.join('\n'))

  const saveTemplate = () => {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify({ overlay, textStyle, textPos, fontSize, darkText }))
    setSaveMsg('템플릿 저장됨!')
    setTimeout(() => setSaveMsg(null), 2000)
  }

  const drawText = useCallback((ts: TextStyleId, pos: { x: number; y: number }, w: typeof workout, scale: number, isDark: boolean) => {
    const canvas = canvasRef.current
    if (!canvas || !bgCacheRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.putImageData(bgCacheRef.current, 0, 0)
    applyTextStyle(ctx, w, ts, pos.x * W, pos.y * H, scale, isDark)
    ctx.shadowBlur = 0
    ctx.font = `700 46px "Bebas Neue", Impact, sans-serif`
    ctx.fillStyle = 'white'
    ctx.fillText('TODAY', 56, 68)
    const tw = ctx.measureText('TODAY ').width
    ctx.fillStyle = '#E5FE3D'
    ctx.fillText('WORKOUT', 56 + tw, 68)
    ctx.font = '600 28px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText(formatDate(w.date), 58, 100)
    ctx.font = `700 32px "Bebas Neue", Impact, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('@HYROX_DAILY', 56, H - 32)
  }, [workout])

  const drawBg = useCallback(async (src: string, ov: OverlayId) => {
    const drawId = ++drawIdRef.current
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = W
    canvas.height = H

    try {
      const font = new FontFace('Bebas Neue', 'url(https://fonts.gstatic.com/s/bebasneu/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2)')
      await font.load()
      document.fonts.add(font)
    } catch {}

    await new Promise<void>((resolve) => {
      const img = new Image()
      img.onload = () => {
        if (drawIdRef.current !== drawId) return
        const cr = W / H, ir = img.width / img.height
        let sx = 0, sy = 0, sw = img.width, sh = img.height
        if (ir > cr) { sw = img.height * cr; sx = (img.width - sw) / 2 }
        else { sh = img.width / cr; sy = (img.height - sh) / 2 }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
        if (ov === 'bw') {
          const imageData = ctx.getImageData(0, 0, W, H)
          const d = imageData.data
          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2]
            d[i] = d[i+1] = d[i+2] = gray
          }
          ctx.putImageData(imageData, 0, 0)
        }
        applyOverlay(ctx, ov)
        ctx.shadowBlur = 0
        const symbol = new Image()
        symbol.onload = () => {
          const sw2 = 44, sh2 = 44
          const off = document.createElement('canvas')
          off.width = sw2; off.height = sh2
          const offCtx = off.getContext('2d')!
          offCtx.drawImage(symbol, 0, 0, sw2, sh2)
          offCtx.globalCompositeOperation = 'difference'
          offCtx.fillStyle = 'white'
          offCtx.fillRect(0, 0, sw2, sh2)
          ctx.globalAlpha = 0.25
          ctx.globalCompositeOperation = 'screen'
          ctx.drawImage(off, W - sw2 - 40, 28, sw2, sh2)
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 1
          resolve()
        }
        symbol.onerror = () => resolve()
        symbol.src = '/lagom-symbol.png'
      }
      img.src = src
    })

    await new Promise<void>((resolve) => {
      const logo = new Image()
      logo.onload = () => {
        const lw = 260, lh = 42
        const off = document.createElement('canvas')
        off.width = lw; off.height = lh
        const offCtx = off.getContext('2d')!
        offCtx.drawImage(logo, 0, 0, lw, lh)
        offCtx.globalCompositeOperation = 'difference'
        offCtx.fillStyle = 'white'
        offCtx.fillRect(0, 0, lw, lh)
        ctx.globalAlpha = 0.2
        ctx.globalCompositeOperation = 'screen'
        ctx.drawImage(off, (W - lw) / 2, H - lh - 28, lw, lh)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
        resolve()
      }
      logo.onerror = () => resolve()
      logo.src = '/lagom-logo.png'
    })

    if (drawIdRef.current !== drawId) return
    bgCacheRef.current = ctx.getImageData(0, 0, W, H)
  }, [])

  const drawDarkBg = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = W
    canvas.height = H
    try {
      const font = new FontFace('Bebas Neue', 'url(https://fonts.gstatic.com/s/bebasneu/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2)')
      await font.load()
      document.fonts.add(font)
    } catch {}
    ctx.fillStyle = '#0c0c0c'
    ctx.fillRect(0, 0, W, H)
    bgCacheRef.current = ctx.getImageData(0, 0, W, H)
  }, [])

  // 이미지/오버레이 변경 시 배경 재생성 후 텍스트 그리기
  useEffect(() => {
    if (!uploadedImage) return
    const w = { ...workout, title: editTitle, format: editFormat, exercises: editExercises.split('\n') }
    drawBg(uploadedImage, overlay).then(() => drawText(textStyle, textPos, w, fontSize, darkText))
  }, [uploadedImage, overlay, drawBg])

  // 텍스트 전용 모드 진입 시 어두운 배경 생성
  useEffect(() => {
    if (!textOnlyMode || uploadedImage) return
    const w = { ...workout, title: editTitle, format: editFormat, exercises: editExercises.split('\n') }
    drawDarkBg().then(() => drawText(textStyle, textPos, w, fontSize, darkText))
  }, [textOnlyMode, drawDarkBg])

  // 텍스트 관련 변경 시 배경 재사용하고 텍스트만 다시 그리기
  useEffect(() => {
    if ((!uploadedImage && !textOnlyMode) || !bgCacheRef.current) return
    const w = { ...workout, title: editTitle, format: editFormat, exercises: editExercises.split('\n') }
    drawText(textStyle, textPos, w, fontSize, darkText)
  }, [textStyle, textPos, fontSize, darkText, editTitle, editFormat, editExercises, drawText])

  const getPos = (clientX: number, clientY: number) => {
    const el = previewRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      x: Math.max(0.02, Math.min(0.85, (clientX - r.left) / r.width)),
      y: Math.max(0.05, Math.min(0.96, (clientY - r.top) / r.height)),
    }
  }

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return
      if ('touches' in e) e.preventDefault()
      const { clientX, clientY } = 'touches' in e ? e.touches[0] : e
      const p = getPos(clientX, clientY)
      if (p) {
        setTextPos(p)
        const w = { ...workout, title: editTitle, format: editFormat, exercises: editExercises.split('\n') }
        drawText(textStyle, p, w, fontSize, darkText)
      }
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, drawText, textStyle, fontSize, darkText, editTitle, editFormat, editExercises, workout])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setUploadedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleTextOnly = async () => {
    const offscreen = document.createElement('canvas')
    offscreen.width = W
    offscreen.height = H
    const ctx = offscreen.getContext('2d')
    if (!ctx) return

    try {
      const font = new FontFace('Bebas Neue', 'url(https://fonts.gstatic.com/s/bebasneu/v14/JTUSjIg69CK48gW7PXooxW5rygbi49c.woff2)')
      await font.load()
      document.fonts.add(font)
    } catch {}

    // 투명 배경에 텍스트만 그리기
    ctx.clearRect(0, 0, W, H)
    const w = { ...workout, title: editTitle, format: editFormat, exercises: editExercises.split('\n') }
    applyTextStyle(ctx, w, textStyle, textPos.x * W, textPos.y * H, fontSize, darkText)
    ctx.shadowBlur = 0
    ctx.font = `700 46px "Bebas Neue", Impact, sans-serif`
    ctx.fillStyle = 'white'
    ctx.fillText('TODAY', 56, 68)
    const tw = ctx.measureText('TODAY ').width
    ctx.fillStyle = '#E5FE3D'
    ctx.fillText('WORKOUT', 56 + tw, 68)
    ctx.font = '600 28px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText(formatDate(w.date), 58, 100)
    ctx.font = `700 32px "Bebas Neue", Impact, sans-serif`
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    ctx.fillText('@HYROX_DAILY', 56, H - 32)

    // 워터마크 (difference 트릭으로 흰색 반전 후 그리기)
    await new Promise<void>((resolve) => {
      const symbol = new Image()
      symbol.onload = () => {
        const sw = 44, sh = 44
        const off = document.createElement('canvas')
        off.width = sw; off.height = sh
        const offCtx = off.getContext('2d')!
        offCtx.drawImage(symbol, 0, 0, sw, sh)
        offCtx.globalCompositeOperation = 'difference'
        offCtx.fillStyle = 'white'
        offCtx.fillRect(0, 0, sw, sh)
        ctx.globalAlpha = 0.35
        ctx.drawImage(off, W - sw - 40, 28, sw, sh)
        ctx.globalAlpha = 1
        resolve()
      }
      symbol.onerror = () => resolve()
      symbol.src = '/lagom-symbol.png'
    })
    await new Promise<void>((resolve) => {
      const logo = new Image()
      logo.onload = () => {
        const lw = 260, lh = 42
        const off = document.createElement('canvas')
        off.width = lw; off.height = lh
        const offCtx = off.getContext('2d')!
        offCtx.drawImage(logo, 0, 0, lw, lh)
        offCtx.globalCompositeOperation = 'difference'
        offCtx.fillStyle = 'white'
        offCtx.fillRect(0, 0, lw, lh)
        ctx.globalAlpha = 0.3
        ctx.drawImage(off, (W - lw) / 2, H - lh - 28, lw, lh)
        ctx.globalAlpha = 1
        resolve()
      }
      logo.onerror = () => resolve()
      logo.src = '/lagom-logo.png'
    })

    const isInstagram = /Instagram/.test(navigator.userAgent)
    if (isInstagram) {
      setSaveImageUrl(offscreen.toDataURL('image/png'))
      return
    }

    const blob = await new Promise<Blob | null>(resolve => offscreen.toBlob(resolve, 'image/png'))
    if (!blob) return

    const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent)
    const file = new File([blob], `hyrox-text-${workout.date}.png`, { type: 'image/png' })
    if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
      } catch {}
    } else {
      const link = document.createElement('a')
      link.download = `hyrox-text-${workout.date}.png`
      link.href = offscreen.toDataURL('image/png')
      link.click()
    }
    setSaveMsg('텍스트 저장 완료!')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  const handleDownload = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isInstagram = /Instagram/.test(navigator.userAgent)
    if (isInstagram) {
      setSaveImageUrl(canvas.toDataURL('image/png'))
      return
    }

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return

    const isMobile = /Android|iPhone|iPad|iPod/.test(navigator.userAgent)
    const file = new File([blob], `hyrox-${workout.date}.png`, { type: 'image/png' })
    if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        setSaveMsg('저장 완료!')
        setTimeout(() => setSaveMsg(null), 3000)
      } catch {
        // 사용자가 취소한 경우
      }
    } else {
      const link = document.createElement('a')
      link.download = `hyrox-${workout.date}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setSaveMsg('저장 완료!')
      setTimeout(() => setSaveMsg(null), 3000)
    }
  }

  return (
    <>
    {saveImageUrl && (() => {
      const isAndroid = /Android/.test(navigator.userAgent)
      return (
      <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center p-6 gap-6">
        <button onClick={() => setSaveImageUrl(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl leading-none">×</button>
        <p className="font-bebas text-2xl tracking-wider text-white text-center">{isAndroid ? 'Chrome에서 저장하세요' : 'Safari에서 저장하세요'}</p>
        <div className="w-full bg-gray-900 rounded-xl p-5 flex flex-col gap-4 text-sm text-gray-300 leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bebas text-lg leading-none">1</span>
            <span>화면 {isAndroid ? '상단' : '하단'} <span className="text-white font-bold">···</span> 버튼 탭</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bebas text-lg leading-none">2</span>
            <span><span className="text-white font-bold">{isAndroid ? '삼성 인터넷 또는 Chrome으로 열기' : 'Safari로 열기'}</span> 선택</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bebas text-lg leading-none">3</span>
            <span>브라우저에서 <span className="text-white font-bold">저장하기</span> 버튼 탭</span>
          </div>
        </div>
        <p className="text-gray-600 text-xs text-center">인스타그램 내 브라우저는 파일 저장을<br/>지원하지 않습니다</p>
      </div>
      )
    })()}
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-start p-4 overflow-y-auto">
      <div className="w-full max-w-sm py-4">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bebas text-2xl tracking-wider">SHARE YOUR WORKOUT</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-3xl leading-none">×</button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

        {!uploadedImage && !textOnlyMode ? (
          <>
            <canvas ref={canvasRef} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-900 rounded-lg mb-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-700 hover:border-accent transition cursor-pointer"
              style={{ aspectRatio: '4/5' }}
            >
              <span className="text-5xl mb-4">📷</span>
              <span className="text-white font-bebas text-xl">사진 선택</span>
              <span className="text-gray-500 text-sm mt-1">탭하여 업로드</span>
            </button>
            {saveMsg && (
              <div className="mb-3 py-2 px-3 bg-accent/20 border border-accent rounded text-accent text-sm text-center font-bebas tracking-wider">
                {saveMsg}
              </div>
            )}
            <button onClick={() => setTextOnlyMode(true)}
              className="w-full py-3 bg-gray-800 text-white font-bebas text-lg rounded hover:bg-gray-700 transition">
              글자만 저장 (투명 배경)
            </button>
          </>
        ) : (
          <>
            {/* 오버레이 선택 — 사진 있을 때만 */}
            {uploadedImage && <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 tracking-widest uppercase">오버레이</p>
              <div className="grid grid-cols-5 gap-2">
                {OVERLAYS.map(o => (
                  <button key={o.id} onClick={() => setOverlay(o.id)}
                    className={`py-2 rounded text-xs font-bebas tracking-wider transition ${
                      overlay === o.id ? 'bg-accent text-dark' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>}

            {/* 텍스트 스타일 선택 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 tracking-widest uppercase">텍스트</p>
              <div className="grid grid-cols-4 gap-2">
                {TEXT_STYLES.map(t => (
                  <button key={t.id} onClick={() => setTextStyle(t.id)}
                    className={`py-2 rounded text-xs font-bebas tracking-wider transition ${
                      textStyle === t.id ? 'bg-accent text-dark' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 글자 색상 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 tracking-widest uppercase">글자 색상</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setDarkText(false)}
                  className={`py-2 rounded text-xs font-bebas tracking-wider transition ${!darkText ? 'bg-accent text-dark' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  WHITE
                </button>
                <button onClick={() => setDarkText(true)}
                  className={`py-2 rounded text-xs font-bebas tracking-wider transition ${darkText ? 'bg-accent text-dark' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                  BLACK
                </button>
              </div>
            </div>

            {/* 글자 크기 */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500 tracking-widest uppercase">글자 크기</p>
                <span className="text-xs text-gray-500">{Math.round(fontSize * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(v => Math.max(0.5, +(v - 0.1).toFixed(1)))}
                  className="w-8 h-8 bg-gray-800 rounded text-white hover:bg-gray-700 transition text-lg">−</button>
                <input type="range" min="0.5" max="1.8" step="0.05"
                  value={fontSize}
                  onChange={e => setFontSize(parseFloat(e.target.value))}
                  className="flex-1 accent-yellow-400" />
                <button onClick={() => setFontSize(v => Math.min(1.8, +(v + 0.1).toFixed(1)))}
                  className="w-8 h-8 bg-gray-800 rounded text-white hover:bg-gray-700 transition text-lg">+</button>
              </div>
            </div>

            {/* 내용 수정 */}
            <div className="mb-3">
              <button
                onClick={() => setShowEdit(v => !v)}
                className="w-full py-2 bg-gray-800 text-gray-400 text-xs font-bebas tracking-widest rounded hover:bg-gray-700 transition"
              >
                {showEdit ? '▲ 내용 닫기' : '✏️ 내용 수정'}
              </button>
              {showEdit && (
                <div className="mt-2 space-y-2">
                  <input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="제목"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-accent"
                  />
                  <input
                    value={editFormat}
                    onChange={e => setEditFormat(e.target.value)}
                    placeholder="포맷 (For Time, AMRAP 등)"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm focus:outline-none focus:border-accent"
                  />
                  <textarea
                    value={editExercises}
                    onChange={e => setEditExercises(e.target.value)}
                    rows={5}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white text-sm font-mono focus:outline-none focus:border-accent"
                  />
                </div>
              )}
            </div>

            {/* 캔버스 */}
            <div
              ref={previewRef}
              className="w-full rounded-lg overflow-hidden mb-2"
              style={{ aspectRatio: '4/5', cursor: dragging ? 'grabbing' : 'grab' }}
              onMouseDown={(e) => { e.preventDefault(); setDragging(true) }}
              onTouchStart={() => setDragging(true)}
            >
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
            <p className="text-center text-gray-600 text-xs mb-4">드래그해서 텍스트 위치 조정</p>

            {saveMsg && (
              <div className="mb-3 py-2 px-3 bg-accent/20 border border-accent rounded text-accent text-sm text-center font-bebas tracking-wider">
                {saveMsg}
              </div>
            )}
            <div className="flex gap-2 mb-2">
              {textOnlyMode ? (
                <button type="button" onClick={() => setTextOnlyMode(false)}
                  className="flex-1 py-3 bg-gray-800 text-white font-bebas text-lg rounded text-center cursor-pointer hover:bg-gray-700 transition">
                  ← 돌아가기
                </button>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 bg-gray-800 text-white font-bebas text-lg rounded text-center cursor-pointer hover:bg-gray-700 transition">
                  사진 변경
                </button>
              )}
              <button onClick={saveTemplate}
                className="flex-1 py-3 bg-gray-800 text-gray-300 font-bebas text-lg rounded hover:bg-gray-700 transition">
                템플릿 저장
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleTextOnly}
                className="flex-1 py-3 bg-gray-700 text-white font-bebas text-lg rounded hover:bg-gray-600 transition">
                글자만 저장
              </button>
              {!textOnlyMode && (
                <button onClick={handleDownload}
                  className="flex-1 py-3 bg-accent text-dark font-bebas text-lg rounded hover:bg-yellow-400 transition">
                  저장하기
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}
