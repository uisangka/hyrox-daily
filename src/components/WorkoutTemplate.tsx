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
type TextStyleId = 'minimal' | 'bold' | 'editorial' | 'clean' | 'outline' | 'poster' | 'box' | 'mono'
type FontId = 'bebas' | 'anton' | 'archivo' | 'oswald' | 'blackhan' | 'dohyeon'

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
  { id: 'outline',   label: 'OUTLINE'   },
  { id: 'poster',    label: 'POSTER'    },
  { id: 'box',       label: 'BOX'       },
  { id: 'mono',      label: 'MONO'      },
]

const FONTS: { id: FontId; label: string; family: string }[] = [
  { id: 'bebas',    label: 'BEBAS',   family: '"Bebas Neue", Impact, sans-serif' },
  { id: 'anton',    label: 'ANTON',   family: '"Anton", Impact, sans-serif' },
  { id: 'archivo',  label: 'ARCHIVO', family: '"Archivo Black", sans-serif' },
  { id: 'oswald',   label: 'OSWALD',  family: '"Oswald", sans-serif' },
  { id: 'blackhan', label: '블랙한',   family: '"Black Han Sans", sans-serif' },
  { id: 'dohyeon',  label: '도현체',   family: '"Do Hyeon", sans-serif' },
]

const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Archivo+Black&family=Oswald:wght@500;700&family=Black+Han+Sans&family=Do+Hyeon&display=swap'

const ACCENTS: { id: string; color: string }[] = [
  { id: 'yellow', color: '#E5FE3D' },
  { id: 'white',  color: '#FFFFFF' },
  { id: 'red',    color: '#FF3B30' },
  { id: 'orange', color: '#FF9F0A' },
  { id: 'cyan',   color: '#00E5FF' },
  { id: 'pink',   color: '#FF2D78' },
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

function filterTextOnlyExercises(exercises: string[]) {
  return exercises.filter(line => !/^(\s*)(Intent|Sub|Notes?|Note)\b/i.test(line))
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-')
  return `${year}.${month}.${day}`
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function applyOverlay(ctx: CanvasRenderingContext2D, overlay: OverlayId, accent: string) {
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
    ctx.fillStyle = accent
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
  dark: boolean = false,
  font: string = '"Bebas Neue", Impact, sans-serif',
  accent: string = '#E5FE3D'
) {
  const groups = parseExercises(workout.exercises)
  let y = ty
  const s = scale
  const titleColor = dark ? 'rgba(0,0,0,0.92)' : 'rgba(255,255,255,0.95)'
  const accentColor = dark && accent === '#E5FE3D' ? '#b8a800' : accent
  const bodyColor = dark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.6)'

  if (style === 'minimal') {
    if (workout.title) {
      ctx.font = `700 ${Math.round(56*s)}px ${font}`
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
      ctx.font = `700 ${Math.round(120*s)}px ${font}`
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.92)' : 'white'
      for (const line of wrapText(ctx, workout.title, W - tx - 56)) {
        ctx.fillText(line, tx, y); y += Math.round(124*s)
      }
    }
    if (workout.format) {
      ctx.font = `700 ${Math.round(52*s)}px ${font}`
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
      ctx.font = `700 ${Math.round(70*s)}px ${font}`
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
      ctx.font = `700 ${Math.round(82*s)}px ${font}`
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

  } else if (style === 'outline') {
    if (workout.title) {
      ctx.font = `700 ${Math.round(116*s)}px ${font}`
      ctx.lineWidth = Math.max(2, Math.round(3*s))
      ctx.strokeStyle = dark ? 'rgba(0,0,0,0.92)' : 'white'
      for (const line of wrapText(ctx, workout.title.toUpperCase(), W - tx - 56)) {
        if (y > H - 80) break
        ctx.strokeText(line, tx, y); y += Math.round(120*s)
      }
    }
    if (workout.format) {
      ctx.font = `700 ${Math.round(46*s)}px ${font}`
      ctx.fillStyle = accentColor
      ctx.fillText(workout.format, tx, y); y += Math.round(56*s)
    }
    ctx.font = `400 ${Math.round(28*s)}px -apple-system, sans-serif`
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.82)'
    for (const group of groups) {
      for (const ex of group) { if (y > H - 60) break; ctx.fillText(ex, tx, y); y += Math.round(38*s) }
      y += Math.round(12*s)
    }

  } else if (style === 'poster') {
    if (workout.title) {
      ctx.font = `700 ${Math.round(140*s)}px ${font}`
      ctx.fillStyle = dark ? 'rgba(0,0,0,0.92)' : 'white'
      for (const word of workout.title.toUpperCase().split(' ')) {
        if (y > H - 80) break
        ctx.fillText(word, tx, y, W - tx - 56); y += Math.round(136*s)
      }
      ctx.fillStyle = accentColor
      ctx.fillRect(tx + 6, y - Math.round(96*s), Math.round(120*s), Math.round(8*s))
      y += Math.round(4*s)
    }
    if (workout.format) {
      ctx.font = `700 ${Math.round(48*s)}px ${font}`
      ctx.fillStyle = accentColor
      ctx.fillText(workout.format, tx, y); y += Math.round(58*s)
    }
    ctx.font = `400 ${Math.round(28*s)}px -apple-system, sans-serif`
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.82)'
    for (const group of groups) {
      for (const ex of group) { if (y > H - 60) break; ctx.fillText(ex, tx, y); y += Math.round(38*s) }
      y += Math.round(12*s)
    }

  } else if (style === 'box') {
    ctx.shadowBlur = 0
    const titleFontStr = `700 ${Math.round(60*s)}px ${font}`
    const formatFontStr = `400 ${Math.round(26*s)}px -apple-system, sans-serif`
    const bodyFontStr = `300 ${Math.round(24*s)}px -apple-system, sans-serif`
    const maxTextW = W - tx - 80
    const lines: { text: string; font: string; color: string; gap: number }[] = []
    if (workout.title) {
      ctx.font = titleFontStr
      for (const l of wrapText(ctx, workout.title, maxTextW)) {
        lines.push({ text: l, font: titleFontStr, color: titleColor, gap: Math.round(68*s) })
      }
    }
    if (workout.format) {
      lines.push({ text: workout.format, font: formatFontStr, color: accentColor, gap: Math.round(42*s) })
    }
    for (const group of groups) {
      for (const ex of group) {
        lines.push({ text: ex, font: bodyFontStr, color: dark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)', gap: Math.round(32*s) })
      }
      lines.push({ text: '', font: bodyFontStr, color: '', gap: Math.round(8*s) })
    }
    while (lines.length && lines[lines.length - 1].text === '') lines.pop()
    let boxW = 0
    let contentH = 0
    for (const l of lines) {
      if (l.text) { ctx.font = l.font; boxW = Math.max(boxW, ctx.measureText(l.text).width) }
      contentH += l.gap
    }
    const padX = 32
    const boxTop = y - Math.round(54*s)
    const boxH = contentH + Math.round(54*s) + 12
    ctx.fillStyle = dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.6)'
    roundRect(ctx, tx - padX, boxTop, Math.min(boxW, maxTextW) + padX * 2, boxH, 20)
    ctx.fill()
    ctx.fillStyle = accentColor
    ctx.fillRect(tx - padX, boxTop, 6, boxH)
    for (const l of lines) {
      if (l.text && y < H - 40) {
        ctx.font = l.font
        ctx.fillStyle = l.color
        ctx.fillText(l.text, tx, y, maxTextW)
      }
      y += l.gap
    }

  } else if (style === 'mono') {
    const monoFamily = 'Consolas, "Courier New", monospace'
    if (workout.title) {
      ctx.font = `700 ${Math.round(48*s)}px ${monoFamily}`
      ctx.fillStyle = titleColor
      for (const line of wrapText(ctx, workout.title, W - tx - 56)) {
        if (y > H - 80) break
        ctx.fillText(line, tx, y); y += Math.round(58*s)
      }
    }
    if (workout.format) {
      ctx.font = `700 ${Math.round(26*s)}px ${monoFamily}`
      ctx.fillStyle = accentColor
      ctx.fillText('// ' + workout.format.toUpperCase(), tx, y); y += Math.round(44*s)
    }
    ctx.font = `400 ${Math.round(24*s)}px ${monoFamily}`
    ctx.fillStyle = dark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.75)'
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
      font?: FontId
      accent?: string
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
  const [fontId, setFontId] = useState<FontId>(saved?.font ?? 'bebas')
  const [accent, setAccent] = useState(saved?.accent ?? '#E5FE3D')
  const [fontTick, setFontTick] = useState(0)
  const [textOnlyMode, setTextOnlyMode] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveImageUrl, setSaveImageUrl] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(workout.title || '')
  const [editFormat, setEditFormat] = useState(workout.format || '')
  const [editExercises, setEditExercises] = useState(workout.exercises.join('\n'))

  const fontFamily = FONTS.find(f => f.id === fontId)!.family

  // Google Fonts 스타일시트 1회 주입
  useEffect(() => {
    if (document.getElementById('share-template-fonts')) return
    const link = document.createElement('link')
    link.id = 'share-template-fonts'
    link.rel = 'stylesheet'
    link.href = GOOGLE_FONTS_URL
    document.head.appendChild(link)
  }, [])

  // 선택한 폰트 로드 완료 시 다시 그리기
  useEffect(() => {
    let alive = true
    document.fonts.load(`700 100px ${fontFamily}`, '가나다 ABC 123')
      .then(() => { if (alive) setFontTick(t => t + 1) })
      .catch(() => {})
    return () => { alive = false }
  }, [fontFamily])

  const saveTemplate = () => {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify({ overlay, textStyle, textPos, fontSize, darkText, font: fontId, accent }))
    setSaveMsg('템플릿 저장됨!')
    setTimeout(() => setSaveMsg(null), 2000)
  }

  const drawText = useCallback((ts: TextStyleId, pos: { x: number; y: number }, w: typeof workout, scale: number, isDark: boolean, family: string, accentColor: string) => {
    const canvas = canvasRef.current
    if (!canvas || !bgCacheRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.putImageData(bgCacheRef.current, 0, 0)
    applyTextStyle(ctx, w, ts, pos.x * W, pos.y * H, scale, isDark, family, accentColor)
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

  const drawBg = useCallback(async (src: string, ov: OverlayId, accentColor: string) => {
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
        applyOverlay(ctx, ov, accentColor)
        ctx.shadowBlur = 0
        resolve()
      }
      img.src = src
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
    const w = {
      ...workout,
      title: editTitle,
      format: editFormat,
      exercises: filterTextOnlyExercises(editExercises.split('\n'))
    }
    drawBg(uploadedImage, overlay, accent).then(() => drawText(textStyle, textPos, w, fontSize, darkText, fontFamily, accent))
  }, [uploadedImage, overlay, accent, drawBg])

  // 텍스트 전용 모드 진입 시 어두운 배경 생성
  useEffect(() => {
    if (!textOnlyMode || uploadedImage) return
    const w = {
      ...workout,
      title: editTitle,
      format: editFormat,
      exercises: filterTextOnlyExercises(editExercises.split('\n'))
    }
    drawDarkBg().then(() => drawText(textStyle, textPos, w, fontSize, darkText, fontFamily, accent))
  }, [textOnlyMode, drawDarkBg])

  // 텍스트 관련 변경 시 배경 재사용하고 텍스트만 다시 그리기
  useEffect(() => {
    if ((!uploadedImage && !textOnlyMode) || !bgCacheRef.current) return
    const w = {
      ...workout,
      title: editTitle,
      format: editFormat,
      exercises: textOnlyMode ? filterTextOnlyExercises(editExercises.split('\n')) : editExercises.split('\n')
    }
    drawText(textStyle, textPos, w, fontSize, darkText, fontFamily, accent)
  }, [textStyle, textPos, fontSize, darkText, fontFamily, accent, fontTick, editTitle, editFormat, editExercises, drawText, textOnlyMode])

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
        const w = {
          ...workout,
          title: editTitle,
          format: editFormat,
          exercises: textOnlyMode ? filterTextOnlyExercises(editExercises.split('\n')) : editExercises.split('\n')
        }
        drawText(textStyle, p, w, fontSize, darkText, fontFamily, accent)
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
  }, [dragging, drawText, textStyle, fontSize, darkText, fontFamily, accent, editTitle, editFormat, editExercises, workout])

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
    try { await document.fonts.load(`700 100px ${fontFamily}`, '가나다 ABC 123') } catch {}

    // 투명 배경에 텍스트만 그리기
    ctx.clearRect(0, 0, W, H)
    const w = {
      ...workout,
      title: editTitle,
      format: editFormat,
      exercises: filterTextOnlyExercises(editExercises.split('\n'))
    }
    applyTextStyle(ctx, w, textStyle, textPos.x * W, textPos.y * H, fontSize, darkText, fontFamily, accent)
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

    const blob = await new Promise<Blob | null>(resolve => offscreen.toBlob(resolve, 'image/png'))
    if (!blob) return

    const link = document.createElement('a')
    link.download = `hyrox-text-${workout.date}.png`
    link.href = offscreen.toDataURL('image/png')
    link.click()
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

    const link = document.createElement('a')
    link.download = `hyrox-${workout.date}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setSaveMsg('저장 완료!')
    setTimeout(() => setSaveMsg(null), 3000)
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

            {/* 폰트 선택 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 tracking-widest uppercase">폰트</p>
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map(f => (
                  <button key={f.id} onClick={() => setFontId(f.id)}
                    className={`py-2 rounded text-xs tracking-wider transition ${
                      fontId === f.id ? 'bg-accent text-dark' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}>
                    {f.label}
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

            {/* 포인트 색상 */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 tracking-widest uppercase">포인트 색상</p>
              <div className="grid grid-cols-6 gap-2">
                {ACCENTS.map(a => (
                  <button key={a.id} onClick={() => setAccent(a.color)}
                    aria-label={a.id}
                    className={`h-8 rounded transition border-2 ${accent === a.color ? 'border-white scale-105' : 'border-gray-700'}`}
                    style={{ backgroundColor: a.color }} />
                ))}
              </div>
            </div>

            {/* 글자 크기 */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-500 tracking-widest uppercase">글자 크기</p>
                <span className="text-xs text-gray-500">{Math.round(fontSize * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(v => Math.max(0.3, +(v - 0.1).toFixed(2)))}
                  className="w-8 h-8 bg-gray-800 rounded text-white hover:bg-gray-700 transition text-lg">−</button>
                <input type="range" min="0.3" max="3" step="0.05"
                  value={fontSize}
                  onChange={e => setFontSize(parseFloat(e.target.value))}
                  className="flex-1 accent-yellow-400" />
                <button onClick={() => setFontSize(v => Math.min(3, +(v + 0.1).toFixed(2)))}
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
