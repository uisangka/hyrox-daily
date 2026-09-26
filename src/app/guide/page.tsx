import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'HYROX Daily — 가이드',
  description: 'HYROX DAILY 프로그램 구조, 레이스 무게, 강도 용어, 페이스 기준표, 장비 대체, 시합 주 가이드',
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
          <a href="#weight" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ② 내 레이스 무게
          </a>
          <a href="#pace" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ③ 강도 용어 &amp; 페이스 기준표
          </a>
          <a href="#equipment" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ④ 장비 대체
          </a>
          <a href="#race" className="block px-4 py-3 border border-gray-800 rounded hover:border-accent hover:text-accent transition text-gray-300">
            ⑤ 시합 주 &amp; 시합 당일
          </a>
        </nav>

        {/* ① 프로그램 소개 */}
        <section id="program" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ① 프로그램 소개
          </h2>

          <p className="text-lg leading-relaxed mb-6">
            <B>혼자 훈련하는 사람을 위한 주 6일 HYROX 프로그램이에요.</B> 세 가지를 키워요.
          </p>

          <ol className="space-y-3 mb-10 border-l-4 border-accent pl-6">
            <li className="leading-relaxed">
              1. <B>유산소 엔진:</B> 편하게 오래 달리는 날이 주 3번 있어요.
            </li>
            <li className="leading-relaxed">
              2. <B>근력:</B> 주 2번. 슬레드, 캐리, 런지, 월볼을 버티는 힘을 만들어요.
            </li>
            <li className="leading-relaxed">
              3. <B>스테이션 뒤에 뛰는 힘:</B> 시합에서 제일 힘든 부분이에요. 토요일마다 연습해요.
            </li>
          </ol>

          <h3 className="font-bebas text-2xl mb-4">한 주 구성</h3>
          <div className="mb-4">
            <Table
              headers={['요일', '세션', '내용']}
              rows={[
                ['월', 'Easy Run + Machine', '편한 러닝 + 스키·로우·바이크'],
                ['화', <B key="t">[필수] Threshold Run + Upper</B>, '숨찬 강도로 오래 버티기 + 짧은 상체 근력'],
                ['수', 'Recovery Run', '길고 느리게'],
                ['목', 'Easy Run + Core', '편한 러닝 + 코어'],
                ['금', 'Strength + Station Finisher', '근력 + 짧은 스테이션'],
                ['토', <B key="k">[필수] HYROX Key Session</B>, '런 + 스테이션. 그 주에서 제일 중요한 날'],
                ['일', 'Rest', '쉬세요'],
              ]}
            />
          </div>

          <p className="leading-relaxed mb-10 text-gray-300">
            요일마다 목적은 같지만 방식은 매주 달라요. <B>바쁜 주엔 화요일과 토요일 [필수] 두 개만 하세요.</B>
          </p>

          <h3 className="font-bebas text-2xl mb-4">토요일 스테이션 양</h3>
          <p className="leading-relaxed mb-4 text-gray-300">
            토요일 스테이션은 <B>대회 1회분 이상</B>이 기본이에요. 쉬어가는 주만 적게 해요.
          </p>
          <div className="mb-10">
            <Table
              headers={['종목', '대회 1회분']}
              rows={[
                ['SkiErg', '1000m'],
                ['Sled Push', '50m'],
                ['Sled Pull', '50m'],
                ['Burpee Broad Jump', '80m'],
                ['Row', '1000m'],
                ["Farmer's Carry", '200m'],
                ['Sandbag Lunge', '100m'],
                ['Wall Ball', '100개'],
              ]}
              minWidth="min-w-[300px]"
            />
          </div>

          <h3 className="font-bebas text-2xl mb-4">11/15 HYROX 서울까지 7주</h3>
          <div className="mb-4">
            <Table
              headers={['주', '기간', '단계', '토요일']}
              rows={[
                ['1', '9/28–10/4', '다시 시작', '대회 양 100%'],
                ['2', '10/5–10/11', '빌드', '대회 양 110~120%'],
                ['3', '10/12–10/18', <B key="3">하드 빌드</B>, '대회 양 130~150%'],
                ['4', '10/19–10/25', '쉬어가는 주', '짧고 가볍게'],
                ['5', '10/26–11/1', <B key="5">실전 피크</B>, '풀 시뮬레이션'],
                ['6', '11/2–11/8', '다듬기', '하프 시뮬레이션'],
                ['7', '11/9–11/15', <B key="7">시합 주</B>, '토: 가볍게 / 일: 시합'],
              ]}
              minWidth="min-w-[400px]"
            />
          </div>
          <p className="leading-relaxed text-gray-300">
            4주 차에 몸이 무겁게 느껴지는 건 정상이에요. 그 주는 양을 줄였으니 욕심내지 말고 가볍게 가세요.
          </p>
        </section>

        {/* ② 레이스 무게 */}
        <section id="weight" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ② 내 레이스 무게
          </h2>

          <p className="text-lg leading-relaxed mb-6">
            와드에 <B>&quot;레이스 무게&quot;</B>라고 적혀 있으면 본인이 나가는 부문 무게로 하세요.
          </p>

          <div className="mb-4">
            <Table
              headers={['종목', '일반부 남', '일반부 여', '프로 남', '프로 여']}
              rows={[
                ['Sled Push', '152kg', '102kg', '202kg', '152kg'],
                ['Sled Pull', '103kg', '78kg', '153kg', '103kg'],
                ["Farmer's Carry", '2×24kg', '2×16kg', '2×32kg', '2×24kg'],
                ['Sandbag Lunge', '20kg', '10kg', '30kg', '20kg'],
                ['Wall Ball', '6kg', '4kg', '9kg', '6kg'],
              ]}
              minWidth="min-w-[460px]"
            />
          </div>

          <p className="leading-relaxed text-gray-300">
            슬레드 무게는 썰매 무게를 포함한 값이에요. 체육관 슬레드마다 마찰이 달라서 같은 무게도 느낌이 달라요. <B>&quot;레이스 무게의 75%&quot;</B>처럼 적혀 있으면 위 무게에서 계산하세요.
          </p>
        </section>

        {/* ③ 강도 용어 & 페이스 기준표 */}
        <section id="pace" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ③ 강도 용어 &amp; 페이스 기준표
          </h2>

          <p className="text-lg leading-relaxed mb-4">
            페이스는 전부 <B>본인 기록 기준</B>이에요. 두 가지만 알면 돼요.
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
                [<B key="r">Race Pace</B>, '스테이션 끝나고 지친 상태에서 뛰는 속도', '시합 때 1km마다 뛸 목표 페이스'],
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
            Sub-threshold와 Race Pace는 숫자가 같아요. 다른 점은 Race Pace는 <B>스테이션 바로 뒤, 지친 상태에서</B> 그 속도를 내는 거예요.
          </p>

          <p className="leading-relaxed mb-10 text-gray-300">
            <B>10K 기록이 없다면:</B> 5K 페이스 +10~15초/km를 10K 페이스로 쓰세요. 둘 다 없으면 30분을 최대한 뛰고, 마지막 20분 평균을 Threshold로 삼으면 돼요.
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
            2k 기록이 없으면 5k 평균 스플릿에서 8~10초를 빼세요. 바이크는 easy / steady / hard 느낌으로 맞추면 돼요.
          </p>
        </section>

        {/* ④ 장비 대체 */}
        <section id="equipment" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ④ 장비 대체
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
                ['러닝 불가 (부상·날씨)', '머신으로 대체. 같은 시간, 같은 강도로'],
              ]}
              minWidth="min-w-[440px]"
            />
          </div>

          <p className="leading-relaxed text-gray-300">
            와드에 따로 대체 방법이 적혀 있으면 <B>그걸 먼저 따르세요.</B>
          </p>
        </section>

        {/* ⑤ 시합 주 & 시합 당일 */}
        <section id="race" className="mb-20 scroll-mt-8">
          <h2 className="font-bebas text-3xl text-gray-400 mb-8 border-t border-gray-700 pt-8">
            ⑤ 시합 주 &amp; 시합 당일
          </h2>

          <h3 className="font-bebas text-2xl mb-4">시합 주</h3>
          <ul className="space-y-3 mb-10 border-l-4 border-accent pl-6">
            <li className="leading-relaxed">
              운동량이 확 줄어요. <B>불안해서 더 하고 싶어져도 참으세요.</B> 이 주에 체력이 더 늘지는 않아요. 피로만 빼면 돼요.
            </li>
            <li className="leading-relaxed">
              새로운 운동, 새 신발, 새 보충제는 시합 주에 시작하지 마세요.
            </li>
            <li className="leading-relaxed">
              잠을 평소보다 많이 자는 게 제일 좋은 훈련이에요.
            </li>
          </ul>

          <h3 className="font-bebas text-2xl mb-4">시합 당일</h3>
          <ul className="space-y-3 mb-4 border-l-4 border-accent pl-6">
            <li className="leading-relaxed">
              <B>첫 1km가 제일 위험해요.</B> 몸이 가벼워서 빨리 나가기 쉬워요. 목표 페이스보다 살짝 느리게 시작하세요.
            </li>
            <li className="leading-relaxed">
              스테이션 끝나고 첫 200m는 다리가 안 움직이는 게 정상이에요. 페이스는 그다음에 맞추면 돼요.
            </li>
            <li className="leading-relaxed">
              월볼 100개는 미리 끊는 계획을 세우고 들어가세요. 예: 25-25-20-15-15.
            </li>
            <li className="leading-relaxed">
              슬레드는 스테이션 들어가기 전에 호흡부터 정리하세요. 급하게 밀면 중간에 멈춰요.
            </li>
            <li className="leading-relaxed">
              아침은 시합 3시간 전에, 평소 먹던 걸로 드세요.
            </li>
          </ul>
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
