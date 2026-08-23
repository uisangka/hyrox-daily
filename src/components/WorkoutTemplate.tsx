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

const FONT_FAMILY = '"Bebas Neue", Impact, sans-serif'

const ACCENTS: { id: string; color: string }[] = [
  { id: 'yellow', color: '#E5FE3D' },
  { id: 'white',  color: '#FFFFFF' },
  { id: 'red',    color: '#FF3B30' },
  { id: 'orange', color: '#FF9F0A' },
  { id: 'cyan',   color: '#00E5FF' },
  { id: 'pink',   color: '#FF2D78' },
]
/* ────────────────────────────────────────────────────────────
   레이아웃 엔진 — measure → layout → paint
   스타일 8종은 토큰만 다르고 렌더 경로는 하나를 공유한다.
   ──────────────────────────────────────────────────────────── */

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Malgun Gothic", sans-serif'
const MONO = 'Consolas, "Courier New", monospace'

const SAFE_TOP = 160      // 상단 TODAY WORKOUT 헤더 영역
const SAFE_BOTTOM = 96    // 하단 @HYROX_DAILY 영역
const SPEC_GAP = 28       // 동작명과 수치 사이 최소 간격
const MIN_SHRINK = 0.62   // 오토핏 최소 축소율

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

/** 공백 기준 줄바꿈 + 공백 없는 긴 토큰(한글 등)은 글자 단위로 분해 */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  const push = () => { if (line) { lines.push(line); line = '' } }
  for (const word of text.split(' ')) {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width <= maxWidth) { line = test; continue }
    push()
    if (ctx.measureText(word).width <= maxWidth) { line = word; continue }
    let chunk = ''
    for (const ch of word) {
      if (ctx.measureText(chunk + ch).width > maxWidth && chunk) { lines.push(chunk); chunk = ch }
      else chunk += ch
    }
    line = chunk
  }
  push()
  return lines.length ? lines : ['']
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

/* ── 1. 라인 파서 ─────────────────────────────────────────── */

type LineKind = 'part' | 'lead' | 'move' | 'rest' | 'split' | 'text'

interface ParsedLine {
  kind: LineKind
  left: string
  right?: string
}

const RE_PART = /^(WORKOUT|PART\s+[A-Z0-9]|THEN\b|ROUNDS?\b|\d+\s*ROUNDS?\b|BLOCK\b|BUY[-\s]?IN|CASH[-\s]?OUT|FINISHER|WARM[-\s]?UP|COOL[-\s]?DOWN|EMOM|AMRAP|FOR\s+TIME|CHIPPER|SUPERSET|STRAIGHT\s+SETS)/i
const RE_REST = /^\(?\s*REST\b/i
const RE_SPLIT = /^[—–\-•]?\s*(\d{1,2}:\d{2}\s*[–—-]\s*\d{1,2}:\d{2})\s+(.+)$/
const RE_BULLET = /^[—–\-•*]\s+/
const RE_SPEC_TAIL = /^(.+?)\s+((?:\d+(?:\.\d+)?\s*[×xX]\s*\d+.*)|(?:@\s*\S.*)|(?:\d+(?:\.\d+)?\s*(?:reps?|m|km|cal|sec|s|min|kg|lb)\b.*))$/
/** 파트 헤더에서 '제목 — 상세' 를 분리 */
const RE_PART_SPLIT = /^(.{2,28}?)\s+[—–]\s+(.+)$/

function classifyLines(lines: string[]): ParsedLine[] {
  const out: ParsedLine[] = []
  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue
    if (/^WORKOUT$/i.test(line)) continue   // 원문 섹션 마커 — 이미지에선 군더더기

    const sp = line.match(RE_SPLIT)
    if (sp) { out.push({ kind: 'split', left: sp[2].trim(), right: sp[1].replace(/\s+/g, '') }); continue }

    if (RE_REST.test(line)) { out.push({ kind: 'rest', left: line }); continue }

    const bulleted = RE_BULLET.test(line)
    const body = line.replace(RE_BULLET, '').trim()

    // 파트 헤더 — 'Part A — 5 × 5min Run' 은 헤더 + 리드 두 줄로 분리
    if (!bulleted && RE_PART.test(line)) {
      const ps = line.match(RE_PART_SPLIT)
      if (ps) { out.push({ kind: 'part', left: ps[1].trim() }); out.push({ kind: 'lead', left: ps[2].trim() }) }
      else out.push({ kind: 'part', left: line })
      continue
    }
    // '20min continuous machine (...):' 같은 소제목
    if (!bulleted && /:$/.test(line) && line.length <= 64) { out.push({ kind: 'part', left: line.replace(/:$/, '') }); continue }

    // 2칸 이상 공백 = 이미 정렬된 동작/수치 쌍
    const m2 = body.match(/^(.*?)\s{2,}(.+)$/)
    if (m2 && /[\d×xX@]/.test(m2[2])) {
      let l = m2[1].trim()
      let r = m2[2].trim()
      // 'Pull-up / Lat Pulldown 4 × 6' 처럼 왼쪽에 남은 수치도 오른쪽 열로 넘긴다
      const t = l.match(RE_SPEC_TAIL)
      if (t) { l = t[1].trim(); r = t[2].trim() + '  ' + r }
      out.push({ kind: 'move', left: l, right: r })
      continue
    }

    const m3 = body.match(RE_SPEC_TAIL)
    if (m3 && (bulleted || /^\d/.test(body))) { out.push({ kind: 'move', left: m3[1].trim(), right: m3[2].trim() }); continue }

    out.push({ kind: bulleted ? 'move' : 'text', left: body })
  }
  // 원문 정렬용 다중 공백은 분류에는 필요했지만 렌더 단계에서는 정리한다
  return out.map(p => ({
    ...p,
    left: p.left.replace(/\s{2,}/g, ' '),
    right: p.right ? p.right.replace(/\s{2,}/g, ' ') : undefined,
  }))
}

/* ── 2. 스타일 토큰 ───────────────────────────────────────── */

interface Tokens {
  titleSize: number
  titleWeight: number
  titleUpper: boolean
  titleOutline: boolean
  titleMono: boolean
  bodyMono: boolean
  formatSize: number
  partSize: number
  moveSize: number
  restSize: number
  rule: 'none' | 'left' | 'bar' | 'underline'
  box: boolean
  scrim: boolean
}

const BASE: Tokens = {
  titleSize: 68, titleWeight: 700, titleUpper: false, titleOutline: false,
  titleMono: false, bodyMono: false,
  formatSize: 32, partSize: 28, moveSize: 38, restSize: 26,
  rule: 'none', box: false, scrim: true,
}

const TOKENS: Record<TextStyleId, Tokens> = {
  minimal:   { ...BASE, titleSize: 62, formatSize: 30, moveSize: 36 },
  bold:      { ...BASE, titleSize: 76, titleUpper: true, rule: 'underline', moveSize: 40, partSize: 30 },
  editorial: { ...BASE, titleSize: 68, rule: 'left' },
  clean:     { ...BASE, titleSize: 70, moveSize: 38 },
  outline:   { ...BASE, titleSize: 78, titleUpper: true, titleOutline: true },
  poster:    { ...BASE, titleSize: 82, titleUpper: true, rule: 'bar' },
  box:       { ...BASE, titleSize: 62, box: true, scrim: false, moveSize: 36 },
  mono:      { ...BASE, titleSize: 52, titleMono: true, bodyMono: true, formatSize: 28, partSize: 24, moveSize: 30, restSize: 22 },
}

interface Palette {
  title: string
  accent: string
  move: string
  text: string
  sub: string
}

function palette(dark: boolean, accent: string): Palette {
  return {
    title:  dark ? 'rgba(0,0,0,0.94)' : '#FFFFFF',
    accent: dark && accent === '#E5FE3D' ? '#8C8100' : accent,
    move:   dark ? 'rgba(0,0,0,0.90)' : 'rgba(255,255,255,0.96)',
    text:   dark ? 'rgba(0,0,0,0.76)' : 'rgba(255,255,255,0.88)',
    sub:    dark ? 'rgba(0,0,0,0.52)' : 'rgba(255,255,255,0.60)',
  }
}

/* ── 3. 측정 (rows 생성) ──────────────────────────────────── */

interface Row {
  text: string
  right?: string
  font: string
  rightFont?: string
  color: string
  rightColor?: string
  advance: number
  marginTop: number
  indent: number
  stroke?: boolean
  ruleAfter?: boolean
  ruleGap?: number   // 룰 라인이 차지하는 추가 높이 (측정에 포함되어야 한다)
}

function buildRows(
  ctx: CanvasRenderingContext2D,
  workout: Workout,
  tok: Tokens,
  s: number,
  pal: Palette,
  displayFont: string,
  maxW: number
): Row[] {
  const rows: Row[] = []
  const bodyFam = tok.bodyMono ? MONO : SANS
  const titleFam = tok.titleMono ? MONO : displayFont
  const px = (n: number) => Math.max(11, Math.round(n * s))

  // 제목 — 한 급만 크게, 본문과 2배 이내
  if (workout.title) {
    const size = px(tok.titleSize)
    const f = `${tok.titleWeight} ${size}px ${titleFam}`
    ctx.font = f
    const raw = tok.titleUpper ? workout.title.toUpperCase() : workout.title
    const lines = wrapText(ctx, raw, maxW)
    const ruled = tok.rule === 'bar' || tok.rule === 'underline'
    lines.forEach((line, i) => rows.push({
      text: line, font: f, color: pal.title, indent: 0,
      advance: Math.round(size * 1.02), marginTop: 0,
      stroke: tok.titleOutline,
      ruleAfter: ruled && i === lines.length - 1,
      ruleGap: ruled && i === lines.length - 1 ? Math.round(size * 0.34) : 0,
    }))
  }

  // 포맷
  if (workout.format) {
    const size = px(tok.formatSize)
    const f = `700 ${size}px ${tok.bodyMono ? MONO : titleFam}`
    rows.push({
      text: tok.bodyMono ? '// ' + workout.format.toUpperCase() : workout.format.toUpperCase(),
      font: f, color: pal.accent, indent: 0,
      advance: Math.round(size * 1.22), marginTop: px(14),
    })
  }

  const groups = parseExercises(workout.exercises)
  let firstBody = true

  for (const group of groups) {
    const parsed = classifyLines(group)
    let firstOfGroup = true

    for (const p of parsed) {
      const groupGap = firstOfGroup ? px(20) : 0
      firstOfGroup = false

      if (p.kind === 'part') {
        const size = px(tok.partSize)
        const f = `700 ${size}px ${bodyFam}`
        ctx.font = f
        wrapText(ctx, p.left.toUpperCase(), maxW).forEach((line, i) => rows.push({
          text: line, font: f, color: pal.accent, indent: 0,
          advance: Math.round(size * 1.32),
          marginTop: i === 0 ? (firstBody ? px(24) : px(28)) + groupGap : 0,
        }))
      } else if (p.kind === 'lead') {
        const size = px(tok.moveSize)
        const f = `600 ${size}px ${bodyFam}`
        ctx.font = f
        wrapText(ctx, p.left, maxW).forEach((line, i) => rows.push({
          text: line, font: f, color: pal.move, indent: i === 0 ? 0 : px(18),
          advance: Math.round(size * 1.30),
          marginTop: i === 0 ? px(6) + groupGap : 0,
        }))
      } else if (p.kind === 'move' || p.kind === 'split') {
        const size = px(tok.moveSize)
        const specSize = px(tok.moveSize * 0.86)
        const nameFont = `600 ${size}px ${bodyFam}`
        const specFont = p.kind === 'split' ? `600 ${specSize}px ${MONO}` : `700 ${specSize}px ${bodyFam}`
        let leftMax = maxW
        if (p.right) { ctx.font = specFont; leftMax = maxW - ctx.measureText(p.right).width - SPEC_GAP }
        ctx.font = nameFont
        const lines = wrapText(ctx, p.left, Math.max(leftMax, maxW * 0.4))
        lines.forEach((line, i) => rows.push({
          text: line, font: nameFont, color: pal.move,
          right: i === 0 ? p.right : undefined,
          rightFont: specFont,
          rightColor: p.kind === 'split' ? pal.sub : pal.accent,
          indent: i === 0 ? 0 : px(18),
          advance: Math.round(size * 1.30),
          marginTop: i === 0 ? px(8) + groupGap : 0,
        }))
      } else if (p.kind === 'rest') {
        const size = px(tok.restSize)
        const f = `400 ${size}px ${bodyFam}`
        ctx.font = f
        wrapText(ctx, p.left, maxW).forEach((line, i) => rows.push({
          text: line, font: f, color: pal.sub, indent: 0,
          advance: Math.round(size * 1.36),
          marginTop: i === 0 ? px(4) + groupGap : 0,
        }))
      } else {
        const size = px(tok.moveSize * 0.88)
        const f = `400 ${size}px ${bodyFam}`
        ctx.font = f
        wrapText(ctx, p.left, maxW).forEach((line, i) => rows.push({
          text: line, font: f, color: pal.text, indent: 0,
          advance: Math.round(size * 1.38),
          marginTop: i === 0 ? px(8) + groupGap : 0,
        }))
      }
      firstBody = false
    }
  }

  return rows
}

const totalH = (rows: Row[]) => rows.reduce((a, r) => a + r.marginTop + r.advance + (r.ruleGap || 0), 0)

function measureCol(ctx: CanvasRenderingContext2D, rows: Row[], maxW: number) {
  let w = 0
  for (const r of rows) {
    ctx.font = r.font
    let rw = r.indent + ctx.measureText(r.text).width
    if (r.right && r.rightFont) { ctx.font = r.rightFont; rw += SPEC_GAP + ctx.measureText(r.right).width }
    w = Math.max(w, rw)
  }
  return Math.min(Math.max(w, 120), maxW)
}

/* ── 4. 레이아웃 (오토핏 + 안전영역 클램프) ───────────────── */

function layoutBlock(
  ctx: CanvasRenderingContext2D,
  workout: Workout,
  tok: Tokens,
  s: number,
  pal: Palette,
  displayFont: string,
  maxW: number,
  availH: number
) {
  let rows = buildRows(ctx, workout, tok, s, pal, displayFont, maxW)
  let h = totalH(rows)

  // 1차: 잘라내는 대신 축소
  if (h > availH) {
    const shrink = Math.max(MIN_SHRINK, availH / h)
    rows = buildRows(ctx, workout, tok, s * shrink, pal, displayFont, maxW)
    h = totalH(rows)
  }

  // 2차: 그래도 넘치면 잘라내되 반드시 표시한다 (묵음 손실 금지)
  let dropped = 0
  if (h > availH) {
    while (rows.length > 2 && totalH(rows) > availH - 44) { rows.pop(); dropped++ }
    if (dropped > 0) {
      const size = Math.max(18, Math.round(tok.restSize * s * 0.9))
      rows.push({
        text: `+ ${dropped} MORE`, font: `700 ${size}px ${tok.bodyMono ? MONO : SANS}`,
        color: pal.accent, indent: 0, advance: Math.round(size * 1.3), marginTop: Math.round(14 * s),
      })
    }
    h = totalH(rows)
  }

  const colW = measureCol(ctx, rows, maxW)
  const firstAscent = rows.length ? rows[0].advance * 0.78 : 0
  // 마지막 줄은 advance 전체가 아니라 디센더만 차지한다 — 실제 시각 높이로 보정
  const last = rows[rows.length - 1]
  const height = last ? h - last.advance + Math.round(last.advance * 0.26) : h
  return { rows, height, colW, firstAscent, dropped }
}

/* ── 5. 페인트 ────────────────────────────────────────────── */

function paintBlock(
  ctx: CanvasRenderingContext2D,
  block: ReturnType<typeof layoutBlock>,
  x: number,
  baseline0: number,
  tok: Tokens,
  pal: Palette,
  dark: boolean,
  scrim: boolean
) {
  const { rows, height, colW, firstAscent } = block
  const top = baseline0 - firstAscent
  const boxH = firstAscent + height   // 첫 줄 어센더 ~ 마지막 줄 디센더
  const savedShadowColor = ctx.shadowColor
  const savedShadowBlur = ctx.shadowBlur

  // 텍스트 뒤 국소 스크림 / 박스 — 밝은 사진 위에서도 대비 확보
  if (tok.box || scrim) {
    ctx.shadowBlur = 0
    const padX = tok.box ? 34 : 26
    const padY = tok.box ? 30 : 22
    ctx.fillStyle = tok.box
      ? (dark ? 'rgba(255,255,255,0.90)' : 'rgba(0,0,0,0.66)')
      : (dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.42)')
    roundRect(ctx, x - padX, top - padY, colW + padX * 2, boxH + padY * 2, tok.box ? 22 : 18)
    ctx.fill()
    if (tok.box) {
      ctx.fillStyle = pal.accent
      ctx.fillRect(x - padX, top - padY, 6, boxH + padY * 2)
    }
    ctx.shadowColor = savedShadowColor
    ctx.shadowBlur = savedShadowBlur
  }

  // 세로 룰 (editorial)
  if (tok.rule === 'left') {
    ctx.shadowBlur = 0
    ctx.fillStyle = pal.accent
    ctx.fillRect(x - 22, top, 3, boxH)
    ctx.shadowColor = savedShadowColor
    ctx.shadowBlur = savedShadowBlur
  }

  let y = baseline0
  for (const row of rows) {
    y += row.marginTop
    ctx.font = row.font
    if (row.stroke) {
      ctx.lineWidth = Math.max(2, Math.round(row.advance * 0.045))
      ctx.strokeStyle = row.color
      ctx.strokeText(row.text, x + row.indent, y)
    } else {
      ctx.fillStyle = row.color
      ctx.fillText(row.text, x + row.indent, y)
    }
    if (row.right && row.rightFont) {
      ctx.font = row.rightFont
      ctx.fillStyle = row.rightColor || pal.accent
      ctx.textAlign = 'right'
      ctx.fillText(row.right, x + colW, y)
      ctx.textAlign = 'left'
    }
    if (row.ruleAfter) {
      const blur = ctx.shadowBlur
      ctx.shadowBlur = 0
      ctx.fillStyle = pal.accent
      if (tok.rule === 'bar') ctx.fillRect(x, y + row.advance * 0.24, Math.min(140, colW), 8)
      else if (tok.rule === 'underline') ctx.fillRect(x, y + row.advance * 0.26, colW, 4)
      ctx.shadowBlur = blur
      y += row.ruleGap || 0
    }
    y += row.advance
  }
}

/* ── 6. 진입점 ────────────────────────────────────────────── */

function applyTextStyle(
  ctx: CanvasRenderingContext2D,
  workout: Workout,
  style: TextStyleId,
  tx: number,
  ty: number,
  scale: number = 1,
  dark: boolean = false,
  font: string = '"Bebas Neue", Impact, sans-serif',
  accent: string = '#E5FE3D',
  opts: { scrim?: boolean } = {}
) {
  const tok = TOKENS[style] ?? TOKENS.minimal
  const pal = palette(dark, accent)
  const maxW = W - tx - 56
  const availH = H - SAFE_BOTTOM - SAFE_TOP

  const block = layoutBlock(ctx, workout, tok, scale, pal, font, maxW, availH)

  // 안전영역 클램프 — 아래로 흘러넘치는 대신 블록을 위로 밀어 올린다
  const minBaseline = SAFE_TOP + block.firstAscent
  const maxBaseline = H - SAFE_BOTTOM - block.height
  const baseline0 = Math.max(minBaseline, Math.min(ty, Math.max(minBaseline, maxBaseline)))

  paintBlock(ctx, block, tx, baseline0, tok, pal, dark, (opts.scrim ?? false) && tok.scrim)
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
  const [accent, setAccent] = useState(saved?.accent ?? '#E5FE3D')
  const [textOnlyMode, setTextOnlyMode] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveImageUrl, setSaveImageUrl] = useState<string | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const [editTitle, setEditTitle] = useState(workout.title || '')
  const [editFormat, setEditFormat] = useState(workout.format || '')
  const [editExercises, setEditExercises] = useState(workout.exercises.join('\n'))

  const fontFamily = FONT_FAMILY

  const saveTemplate = () => {
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify({ overlay, textStyle, textPos, fontSize, darkText, accent }))
    setSaveMsg('템플릿 저장됨!')
    setTimeout(() => setSaveMsg(null), 2000)
  }

  const drawText = useCallback((ts: TextStyleId, pos: { x: number; y: number }, w: typeof workout, scale: number, isDark: boolean, family: string, accentColor: string) => {
    const canvas = canvasRef.current
    if (!canvas || !bgCacheRef.current) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.putImageData(bgCacheRef.current, 0, 0)
    // 밝은 사진 위 대비 보강: 그라디언트가 얕은 오버레이에서만 국소 스크림을 깐다
    const useScrim = !!uploadedImage && (overlay === 'none' || overlay === 'soft' || overlay === 'bw')
    if (uploadedImage) { ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 14 }
    applyTextStyle(ctx, w, ts, pos.x * W, pos.y * H, scale, isDark, family, accentColor, { scrim: useScrim })
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
  }, [workout, uploadedImage, overlay])

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
      exercises: filterTextOnlyExercises(editExercises.split('\n'))
    }
    drawText(textStyle, textPos, w, fontSize, darkText, fontFamily, accent)
  }, [textStyle, textPos, fontSize, darkText, fontFamily, accent, editTitle, editFormat, editExercises, drawText, textOnlyMode])

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
          exercises: filterTextOnlyExercises(editExercises.split('\n'))
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
              <p className="text-xs text-gray-500 mb-2 tracking-widest uppercase">템플릿</p>
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
