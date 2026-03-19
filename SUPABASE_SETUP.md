# Supabase Setup Guide

## 1. Create Workouts Table

Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행하세요:

```sql
-- Create workouts table
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  title TEXT,
  format TEXT,
  exercises TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index for faster queries
CREATE INDEX idx_workouts_date ON workouts(date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 2. Set RLS Policies

다음 정책들을 설정하세요:

### Public Read Policy (모두 읽기 가능)

```sql
CREATE POLICY "Public Read Access"
ON workouts
FOR SELECT
USING (true);
```

### Admin Only Write Policy (관리자만 쓰기 가능)

나중에 관리자 인증을 구현할 때 사용할 정책입니다.

```sql
CREATE POLICY "Admin Insert"
ON workouts
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin Update"
ON workouts
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin Delete"
ON workouts
FOR DELETE
USING (auth.uid() IS NOT NULL);
```

## 3. Environment Variables

프로젝트의 `.env.local` 파일을 업데이트하세요:

1. Supabase 대시보드로 이동
2. Settings → API 로 이동
3. 다음 값들을 복사하여 `.env.local`에 붙여넣기:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Sample Data

테스트용 데이터를 추가하는 SQL:

```sql
INSERT INTO workouts (date, title, format, exercises) VALUES
(
  CURRENT_DATE,
  'HYROX Simulation',
  'For Time',
  ARRAY[
    '1 km Run',
    '50m Sled Push',
    '75m Sled Backwards',
    '',
    '1 km Run',
    '50m Sled Push'
  ]
),
(
  CURRENT_DATE - INTERVAL '1 day',
  'Strength Day',
  'AMRAP 20:00',
  ARRAY[
    '5 Snatches (70%)',
    '10 Box Jumps (24 in)',
    '15 Wall Balls (14/10 lb)',
    '',
    'Rest 3:00',
    '',
    'EMOM 12:00',
    'Minute 1-4: 3 Turkish Get-ups (each side)',
    'Minute 5-8: 6 Burpees',
    'Minute 9-12: 12 Kettlebell Swings'
  ]
);
```

## 테이블 구조 설명

| 필드 | 타입 | 설명 |
|-----|------|------|
| id | UUID | 고유 식별자 (자동 생성) |
| date | DATE | 운동 날짜 (유니크) |
| title | TEXT | 운동 제목 (선택) |
| format | TEXT | 운동 포맷: "For Time", "AMRAP", "EMOM" 등 (선택) |
| exercises | TEXT[] | 운동 목록 배열 (빈 문자열로 그룹 구분) |
| created_at | TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | 마지막 수정 시간 |

## 주의사항

1. **Date 컬럼**: 하루에 하나의 운동만 저장할 수 있도록 UNIQUE 제약이 있습니다.
2. **Exercises 배열**: 빈 문자열(`""`)로 운동 그룹을 구분합니다.
3. **숫자 강조**: 프론트엔드에서 자동으로 숫자를 노란색(`#E5FE3D`)으로 강조합니다.

## 다음 단계

- [ ] 관리자 패널 구축 (워크아웃 생성/편집/삭제)
- [ ] Supabase Auth 인증 추가
- [ ] 관리자 인증 토큰 검증
- [ ] API 라우트 생성 (/api/workouts)
