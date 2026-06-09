import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const PARSE_SYSTEM_PROMPT = `당신은 생활 재정 책임 관리 앱의 AI 파싱 엔진입니다.
사용자 입력에서 정기 지출, 계약, 구독, 보험, 세금, 과태료, 고지서 등 모든 납부 항목을 추출합니다.
이미지가 고지서, 청구서, 영수증, 과태료 통지서인 경우에도 납부 금액과 기한을 반드시 추출하세요.
이미지가 회전되어 있어도 텍스트를 최대한 인식하세요.

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
    const body = await req.json()

    // 신형: { text?, images: [{ data, mimeType }] }
    // 구형 호환: { type: 'image'|'text', content }
    let textContent: string | undefined
    let imageList: { data: string; mimeType: string }[] = []

    if (body.images !== undefined) {
      textContent = body.text
      imageList = body.images ?? []
    } else if (body.type === 'image') {
      imageList = [{ data: body.content, mimeType: body.mimeType ?? 'image/jpeg' }]
    } else {
      textContent = body.content
    }

    const imageParts = imageList.map((img) => ({
      inlineData: { data: img.data, mimeType: img.mimeType },
    }))

    const userText = textContent
      ? `사용자 부연설명: ${textContent}\n\n`
      : ''
    const prompt =
      imageParts.length > 0
        ? `${userText}이 이미지(들)에서 정기 지출/계약 항목을 추출해주세요.\n\n` + PARSE_SYSTEM_PROMPT
        : `${PARSE_SYSTEM_PROMPT}\n\n다음 텍스트에서 정기 지출/계약 항목들을 추출해주세요:\n\n${textContent}`

    const parts = [...imageParts, { text: prompt }]
    const result = await model.generateContent(parts)
    const raw = result.response.text().replace(/```json|```/g, '').trim()

    const parsed = JSON.parse(raw)
    // 응답 필드 기본값 보장
    return NextResponse.json({
      items: parsed.items ?? [],
      confidence: parsed.confidence ?? 0,
      missingFields: parsed.missingFields ?? [],
      followUpQuestions: parsed.followUpQuestions ?? [],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('AI parse error:', msg)
    return NextResponse.json(
      { items: [], confidence: 0, missingFields: [], followUpQuestions: [], error: msg },
      { status: 500 }
    )
  }
}
