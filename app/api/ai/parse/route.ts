import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const PARSE_SYSTEM_PROMPT = `당신은 생활 재정 책임 관리 앱의 AI 파싱 엔진입니다.
사용자 입력에서 정기 지출, 계약, 구독, 보험, 세금 등의 항목을 추출합니다.

카테고리 분류 기준:
- telecom: 휴대폰, 인터넷, IPTV, 알뜰폰, 통신 관련
- utility: 전기, 수도, 도시가스, 관리비, 주차료
- insurance: 실손, 건강, 암, 치아, 운전자, 자동차보험, 화재, 생명
- subscription: OTT(넷플릭스/유튜브/티빙), 음악, 클라우드, AI, 소프트웨어
- rental: 정수기, 공기청정기, 비데, 안마의자, 렌터카
- tax: 재산세, 자동차세, 종합소득세, 부가세, 주민세
- penalty: 주정차, 속도위반, 신호위반, 과태료
- vehicle: 자동차보험, 자동차세, 정기검사, 하이패스
- housing: 월세, 전세대출이자, 관리비, 장기수선충당금
- finance: 대출이자, 카드연회비
- business: 도메인, 서버, 클라우드, SaaS, 임대료
- other: 위 카테고리에 해당하지 않는 것

응답 형식: 순수 JSON만. 마크다운 코드블록 없이, 설명 텍스트 없이 JSON만 출력.
{
  "items": [
    {
      "name": "항목명",
      "category": "카테고리 슬러그",
      "provider": "공급업체명 또는 null",
      "amount": 숫자 또는 null,
      "cycle": "monthly|bimonthly|quarterly|semiannual|yearly|once",
      "dayOfMonth": 숫자 또는 null,
      "contractEndDate": "YYYY-MM-DD 또는 null",
      "autoRenews": true|false|null,
      "paymentMethod": "카드/수단명 또는 null",
      "owner": "명의자 또는 null",
      "memo": "추가 정보 또는 null"
    }
  ],
  "confidence": 0.0~1.0,
  "missingFields": [["항목0의 누락 필드들"], ["항목1의 누락 필드들"]],
  "followUpQuestions": ["후속 질문1", "후속 질문2"]
}`

export async function POST(req: NextRequest) {
  try {
    const { type, content } = await req.json()

    let prompt: string
    let imagePart: any = null

    if (type === 'image') {
      prompt = '이 이미지에서 정기 지출/계약 항목을 추출해주세요.\n\n' + PARSE_SYSTEM_PROMPT
      imagePart = {
        inlineData: { data: content, mimeType: 'image/jpeg' },
      }
    } else {
      prompt = `${PARSE_SYSTEM_PROMPT}\n\n다음 텍스트에서 정기 지출/계약 항목들을 추출해주세요:\n\n${content}`
    }

    const parts = imagePart ? [imagePart, { text: prompt }] : [{ text: prompt }]
    const result = await model.generateContent(parts)
    const raw = result.response.text().replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('AI parse error:', err)
    return NextResponse.json({ error: 'AI 파싱 실패' }, { status: 500 })
  }
}
