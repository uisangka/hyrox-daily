import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HYROX Daily — 가이드',
  description: 'HYROX DAILY 프로그램 구조, 강도 용어, 페이스 기준표, 장비 대체 가이드',
}

function Table({ headers, rows, minWidth }: { headers: string[]; rows: React.ReactNode[][]; minWidth?: string }) {
  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <table className={`w-full text-sm border-collapse ${minWidth ?? 'min-w-[420px]'}`}>
        <thead>
          <tr className="border-b border-gray-700">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-2 pr-4 text-gray-400 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-800 align-top">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 text-gray-300 leading-relaxed">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const B = ({ children }: { children: React.ReactNode }) => (
  <strong className="font-bold text-white">{children}</strong>
)

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-dark text-white px-4 py-8 scroll-smooth">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 border-b border-accent pb-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="font-bebas text-4xl tracking-wider">
              <span className="text-accent">HYROX</span> DAILY
            </h1>
          </Link>
        </div>

        <h2 className="font-bebas text-5xl mb-8 leading-tight">HYROX DAILY 가이드</h2>

        {/* 앵커 목차 */}
        <nav className="mb-16 space-y-2">
          <a href="#program" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ① 프로그램 소개
          </a>
          <a href="#pace" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ② 강도 용어 &amp; 페이스 기준표
          </a>
          <a href="#equipment" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ③ 장비 대체
          </a>
        </nav>

        {/* ① 프로그램 소개 */}
        <section id="program" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ① 이 프로그램은 — 구조와 목표
          </h2>

          <p className="text-lg leading-relaxed mb-6">
            <B>HYROX 완주와 기록 단축을 위한 주 6일 프로그램입니다.</B> 핵심은 세 가지:
          </p>

          <ol className="space-y-3 mb-10 border-l-4 border-accent pl-6">
            <li className="leading-relaxed">
              1. <B>유산소 엔진</B> — 주중 러닝 볼륨으로 레이스의 기반이 되는 유산소 능력을 쌓습니다.
            </li>
            <li className="leading-relaxed">
              2. <B>스트렝스</B> — 주 2회. 슬레드·캐리·런지·월볼을 버티는 힘을 만듭니다.
            </li>
            <li className="leading-relaxed">
              3. <B>Compromised Running</B> — 스테이션 직후에도 페이스를 유지하는 능력. HYROX의 본질이며, 주말 키세션이 이걸 훈련합니다.
            </li>
          </ol>

          <h3 className="font-bebas text-2xl mb-4">주간 구조 (고정)</h3>
          <div className="mb-4">
            <Table
              headers={['요일', '세션', '목적']}
              rows={[
                ['월', 'Easy Run + Machine Conditioning', 'zone 2 이지런 + 머신 라운드. 유산소 기반'],
                ['화', 'Strength (또는 Threshold Intervals + 리프트)', '근력 / 역치 자극'],
                ['수', 'Recovery Run 또는 Tempo Run + Station', '이지런 / 격주로 템포+스테이션'],
                ['목', 'Recovery Run', '60–75분 zone 1–2. 볼륨 축적'],
                ['금', 'Strength + Finisher', '근력 + 짧은 컨디셔닝'],
                ['토', <B key="k">[필수세션] HYROX Key Session</B>, '그 주의 핵심. 레이스 특이적 훈련'],
                ['일', 'Rest', '완전 휴식 권장'],
              ]}
            />
          </div>

          <p className="leading-relaxed mb-10 text-gray-300">
            <B>시간이 없는 주엔 [필수세션] 2개만 하세요.</B> (토요일 키세션 + 주중 역치 계열 1개) — 이 둘이 그 주 자극의 핵심입니다.
          </p>

          <h3 className="font-bebas text-2xl mb-4">토요일 키세션 — 4가지 타입 로테이션</h3>
          <div className="mb-10">
            <Table
              headers={['타입', '훈련하는 것']}
              rows={[
                [<B key="c">Capacity</B>, '레이스 강도에서의 총 작업량. 런+스테이션 라운드 반복'],
                [<B key="i">Intervals</B>, '레이스보다 짧고 빠르게 — 페이스 상한 끌어올리기'],
                [<B key="t">Threshold</B>, '고피로 스테이션 직후에도 레이스 페이스 유지'],
                [<B key="s">Simulation</B>, '대회 순서 그대로 리허설. 레이스 플랜 실행 연습'],
              ]}
              minWidth="min-w-[360px]"
            />
          </div>

          <h3 className="font-bebas text-2xl mb-4">8주 사이클</h3>
          <p className="leading-relaxed text-gray-300">
            프로그램은 8주 단위로 흐릅니다: <B>3주 빌드 → 1주 라이트 디로드</B>(강도만 낮춤) → <B>3주 하드 빌드 → 1주 풀 디로드</B>(볼륨·강도 모두 낮춤). 아무 주에 시작해도 되지만, 몸이 무거운 주가 디로드 주라면 그게 정상입니다 — 프로그램을 믿고 가볍게 가세요.
          </p>
        </section>

        {/* ② 강도 용어 & 페이스 기준표 */}
        <section id="pace" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ② 강도 용어 &amp; 페이스 기준표
          </h2>

          <p className="text-lg leading-relaxed mb-4">
            모든 와드의 페이스는 <B>본인 기록 기준 상대값</B>입니다. 앵커 두 개만 알면 됩니다:
          </p>
          <ul className="space-y-2 mb-10 border-l-4 border-accent pl-6">
            <li className="leading-relaxed">
              <B>러닝 = 최근 10K 기록의 평균 페이스 (분/km)</B>
            </li>
            <li className="leading-relaxed">
              <B>머신 = 2k 기록의 평균 /500m 스플릿 (SkiErg·Row)</B>
            </li>
          </ul>

          <h3 className="font-bebas text-2xl mb-4">강도 용어 5개</h3>
          <div className="mb-10">
            <Table
              headers={['용어', '몸의 느낌', '기준']}
              rows={[
                [<B key="e">Easy</B>, '대화가 편하게 가능', 'zone 1–2. 유산소 기반·회복'],
                [<B key="t">Tempo</B>, '힘들지만 여유 있음', 'zone 3 상단. 역치보다 확실히 아래'],
                [<B key="st">Sub-threshold</B>, '역치 직전. 오래 버틸 수 있는 상한', 'Threshold pace +15~25초/km'],
                [<B key="th">Threshold</B>, '말은 못 하고 단어만 뱉는 강도', '≈ 10K 레이스 페이스. 최대심박 88~92%'],
                [<B key="r">Race Pace</B>, '본인 HYROX 목표 런 페이스', '스테이션 직후(compromised) 상태의 목표치'],
              ]}
              minWidth="min-w-[520px]"
            />
          </div>

          <h3 className="font-bebas text-2xl mb-4">러닝 페이스 환산</h3>
          <div className="mb-4">
            <Table
              headers={['강도', '내 페이스']}
              rows={[
                ['Easy', <span key="e">10K pace <B>+60~90초/km</B></span>],
                ['Tempo', <span key="t">10K pace <B>+30~45초/km</B></span>],
                ['Sub-threshold', <span key="st">10K pace <B>+15~25초/km</B></span>],
                ['Threshold', <span key="th">10K pace <B>±0</B> (동호인 +5초/km)</span>],
                ['HYROX Race Pace', <span key="r">10K pace <B>+15~25초/km</B></span>],
                ['Interval (fast)', <span key="i">10K pace <B>−10~20초/km</B> (≈5K pace)</span>],
              ]}
              minWidth="min-w-[380px]"
            />
          </div>

          <p className="leading-relaxed mb-10 text-gray-300">
            <B>10K 기록이 없다면:</B> 5K 기록 → 10K pace ≈ 5K pace +10~15초/km. 둘 다 없으면 30분 타임트라이얼의 마지막 20분 평균을 Threshold로 삼아 역산.
          </p>

          <h3 className="font-bebas text-2xl mb-4">머신 스플릿 환산 (SkiErg / Row)</h3>
          <div className="mb-4">
            <Table
              headers={['강도', '내 스플릿 (/500m)']}
              rows={[
                ['Easy / Recovery', <span key="e">2k split <B>+20~25초</B></span>],
                ['Steady', <span key="s">2k split <B>+13~18초</B></span>],
                ['Race Effort', <span key="r">2k split <B>+8~12초</B></span>],
                ['Hard Interval', <span key="h">2k split <B>+4~7초</B></span>],
                ['Max / Sprint', <span key="m">2k split <B>±0 이하</B></span>],
              ]}
              minWidth="min-w-[340px]"
            />
          </div>

          <p className="leading-relaxed text-gray-300">
            2k 기록이 없으면: 5k 평균 스플릿 −8~10초. Assault/Echo Bike는 easy / steady / hard 서술 기준으로.
          </p>
        </section>

        {/* ③ 장비 대체 */}
        <section id="equipment" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ③ 장비 대체 가이드 — 없으면 이렇게
          </h2>

          <div className="mb-4">
            <Table
              headers={['장비/종목', '없을 때 대체']}
              rows={[
                ['SkiErg', 'Row 동일 거리, 또는 Assault Bike (시간 기준 동일 강도)'],
                ['Sled Push', 'Heavy Carry, 또는 오르막 스프린트'],
                ['Sled Pull', 'Row 스프린트 (hard), 또는 Bent-over Row + 러닝'],
                ['Row Erg', 'SkiErg 동일 거리, 또는 Assault Bike'],
                ["Farmer's Carry", '덤벨·케틀벨 아무거나. 좌우 같은 무게면 됨'],
                ['Sandbag Lunge', 'DB 또는 바벨 런지 (같은 총 거리/reps)'],
                ['Wall Ball', 'DB Thruster (같은 reps)'],
                ['Burpee Broad Jump', '공간 없으면 Burpee + Tuck Jump'],
                ['러닝 불가 (부상·날씨)', '머신으로 대체 — 같은 시간, 같은 강도 구간 (각 와드의 대체 룰 우선)'],
              ]}
              minWidth="min-w-[440px]"
            />
          </div>

          <p className="leading-relaxed text-gray-300">
            각 와드에 개별 대체 룰이 적혀 있으면 <B>그 지시가 이 표보다 우선</B>입니다.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-800 pt-6 pb-4">
          <Link href="/" className="text-gray-500 text-sm hover:text-accent transition">
            ← HYROX DAILY 홈으로
          </Link>
        </div>
      </div>
    </main>
  )
}
