import { neon } from "@neondatabase/serverless";

// 연결 문자열이 없으면 라우트가 500 을 던지는 대신 여기서 바로 실패시킨다.
// 배포 시 환경변수 누락은 조용히 넘어가면 안 되는 종류의 사고다.
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL 이 설정되지 않았습니다. .env.example 을 참고하세요.");

export const sql = neon(url);
