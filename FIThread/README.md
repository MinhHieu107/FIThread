# FIThread

> Sợi chỉ kết nối các thế hệ FIT: nền tảng **đánh giá môn học**, **kết nối cựu sinh viên (alumni)**, **AI phân tích cảm xúc phản hồi** và **chatbot hỏi đáp về khoa, trường** dành cho Khoa CNTT – Đại học Hà Nội.
> Dự án dự thi *Hành trình FIT 20 năm: Dấu ấn sáng tạo* (2006–2026).

- **Ngày bắt đầu:** 01/10/2026
- **Mốc 80–90% hoàn thành:** 20/10/2026 (hết Phase 0–6, tức toàn bộ tính năng lõi)
- **Deadline nộp sản phẩm thật:** `__ / __ / ____` — Phase 7 (triển khai, demo, đánh bóng — phần 10–20% còn lại) làm **sau 20/10**, điền ngày khi biết deadline chính thức
- **Nhịp làm việc:** khoảng 2–3 giờ mỗi ngày cho cả đội, không nghỉ ngày nào trong 20 ngày đầu (lịch khá chặt để kịp mốc). Nếu đội có ít thời gian hơn dự kiến, xem mục [Nếu bị trễ](#9-nếu-bị-trễ-thứ-tự-cắt-giảm) — thứ tự các phase giữ nguyên, chỉ cắt bớt việc.

---

## 0. Cách dùng file này

1. Mỗi ngày mở mục **Kế hoạch theo ngày** (mục 6), làm đúng các việc của ngày đó theo thứ tự từ trên xuống.
2. Làm xong việc nào thì đổi `[ ]` thành `[x]` ở việc đó, rồi commit và push ngay (ví dụ commit: `docs: tick day 5`). Cả đội `git pull` đầu buổi để thấy tiến độ mới nhất; GitHub hiển thị checkbox trực tiếp trên trang README.
3. Chỉ tick các việc **của mình** để tránh xung đột khi merge. Việc nào bị vướng thì ghi chú ngắn ngay dưới dòng đó, ví dụ `> Vướng: SMTP bị chặn`.
4. Cuối ngày chạy lệnh dưới đây (Git Bash hoặc terminal) để xem % tiến độ:

```bash
done=$(grep -cE '^\s*- \[x\]' README.md); total=$(grep -cE '^\s*- \[( |x)\]' README.md)
echo "Tiến độ: $done/$total ($((100*done/total))%)"
```

5. Cuối mỗi phase có một **Cột mốc (Milestone)**. Đạt cột mốc thì cập nhật bảng tiến độ bên dưới và gắn tag Git.

## 1. Bảng tiến độ tổng quan

Trạng thái: ⬜ chưa bắt đầu · 🟡 đang làm · ✅ xong

| Phase | Nội dung | Ngày (2026) | Cột mốc | Trạng thái |
|---|---|---|---|---|
| 0 | Khởi tạo & nền tảng | D1 · 01/10 | App chạy, kết nối MySQL, có khung giao diện | Xong |
| 1 | Đăng ký, xác thực email, đăng nhập | D2–4 · 02–04/10 | Đăng ký → OTP → đăng nhập chạy được | Xong |
| 2 | Danh mục môn học & giảng viên | D5–6 · 05–06/10 | Xem/tìm môn học, có dữ liệu mẫu | Đang làm |
| 3 | Đánh giá môn học theo rubric | D7–9 · 07–09/10 | Gửi và xem đánh giá ẩn danh | ⬜ |
| 4 | AI phân tích cảm xúc & dashboard | D10–12 · 10–12/10 | Dashboard khoa hiển thị insight từ AI | ⬜ |
| 5 | Chatbot hỏi đáp về khoa, trường | D13–15 · 13–15/10 | Chatbot trả lời đúng từ kho tri thức | ⬜ |
| 6 | Alumni network | D16–17 · 16–17/10 | Tìm alumni, xem dòng thời gian 20 năm | ⬜ |
| — | Đệm, test tổng thể, sửa lỗi | D18–19 · 18–19/10 | Chạy hết checklist demo không lỗi nặng | ⬜ |
| — | **Chốt mốc 80–90%** | D20 · 20/10 | Gắn tag `v0.9`, liệt kê rõ 10–20% còn thiếu | ⬜ |
| 7 | Hoàn thiện, triển khai, demo | sau 20/10 | Bản chạy online + kịch bản demo | ⬜ |

## 2. Phân công (điền tên)

| Mảng | Phụ trách | Phase chính |
|---|---|---|
| Auth, Security, Email | `@...` | 1 |
| Catalog, Review | `@...` | 2, 3 |
| AI cảm xúc, Dashboard | `@...` | 4 |
| Chatbot & kho tri thức | `@...` | 5 |
| Alumni, Timeline | `@...` | 6 |
| Giao diện, Triển khai, Demo | `@...` | xuyên suốt, 7 |
| **Thu thập nội dung cho chatbot** (tài liệu về khoa, trường) | `@...` | bắt đầu từ Ngày 2, chạy song song |

Mỗi người sở hữu một package backend và các trang giao diện tương ứng, review chéo code của nhau qua Pull Request.

## 3. Công nghệ

| Thành phần | Lựa chọn |
|---|---|
| Ngôn ngữ / framework | Java 17+ (khuyến nghị 21), Spring Boot 3.x, Maven |
| Kiểu ứng dụng | **REST API** (Spring Boot trả JSON) + **frontend HTML/CSS/JavaScript thuần** đặt trong `src/main/resources/static`, Spring Boot phục vụ luôn nên chỉ có **một ứng dụng để chạy và triển khai**, không cần cấu hình CORS |
| Bảo mật | Spring Security, xác thực bằng **JWT** (thư viện `jjwt`), BCrypt cho mật khẩu |
| Dữ liệu | **MySQL 8**, Spring Data JPA, Flyway (quản lý migration; nhớ thêm dependency `flyway-mysql`) |
| Email | Spring Mail; dev dùng Mailtrap (sandbox) hoặc Gmail SMTP với App Password; production dùng dịch vụ SMTP miễn phí |
| AI | Gọi LLM API qua `RestClient`; phân tích cảm xúc chạy nền bằng `@Async` + bảng trạng thái + `@Scheduled` để thử lại |
| Chatbot | Tìm kiếm ngữ cảnh bằng **MySQL FULLTEXT** trên kho tri thức, rồi đưa đoạn liên quan vào prompt cho LLM (kỹ thuật RAG đơn giản, không cần vector database) |
| Biểu đồ | Chart.js (nhúng qua CDN) |
| Test | JUnit 5, Mockito; test tích hợp dùng một schema MySQL riêng `fithread_test` trên máy |
| Triển khai | **Không dùng Docker**: đóng gói file `.jar`, chạy bằng `java -jar` |

Quy ước package: đặt tên gốc `vn.edu.hanu.fit.fithread`, **chia theo tính năng** (feature), không gom mọi controller/service vào một chỗ.

## 4. Cấu trúc dự án (kèm thứ tự tạo file)

Số trong ngoặc `[D5]` là **thứ tự** tạo file (D5 = việc thuộc nhóm ngày thứ 5 theo trình tự công việc), không phải số ngày lịch thực tế — lịch lịch thực tế 20 ngày đã dồn nhiều bước vào cùng một ngày, xem đối chiếu chính xác ở mục 6. Thứ tự trước–sau giữa các file (file nào phải có trước file nào) vẫn đúng.

```
fithread/
├── README.md                                   [D1]
├── pom.xml                                     [D1]
├── .gitignore  (có application-local.yml)      [D1]
├── src/
│   ├── main/
│   │   ├── java/vn/edu/hanu/fit/fithread/
│   │   │   ├── FIThreadApplication.java        [D1]
│   │   │   │
│   │   │   ├── common/
│   │   │   │   ├── BaseEntity.java             [D2]
│   │   │   │   └── exception/
│   │   │   │       ├── BusinessException.java, ApiError.java  [D2]
│   │   │   │       └── GlobalExceptionHandler.java            [D2]
│   │   │   │
│   │   │   ├── config/
│   │   │   │   ├── AppProperties.java          [D2]  domain email, TTL OTP, cấu hình AI
│   │   │   │   ├── SecurityConfig.java         [D5]
│   │   │   │   └── AsyncConfig.java            [D19]
│   │   │   │
│   │   │   ├── user/
│   │   │   │   ├── Role.java                   [D3]  STUDENT, ALUMNI, FACULTY, ADMIN
│   │   │   │   ├── UserStatus.java             [D3]  PENDING_EMAIL, PENDING_APPROVAL, ACTIVE, BANNED
│   │   │   │   ├── User.java, UserRepository.java, UserService.java [D3]
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── dto/RegisterRequest.java    [D3]
│   │   │   │   ├── SchoolEmail.java + Validator [D3]
│   │   │   │   ├── EmailVerificationToken.java + Repository [D4]
│   │   │   │   ├── MailService.java            [D4]
│   │   │   │   ├── EmailVerificationService.java [D4]
│   │   │   │   ├── JwtService.java, JwtAuthFilter.java [D5]
│   │   │   │   ├── CustomUserDetailsService.java [D5]
│   │   │   │   └── AuthController.java         [D6]
│   │   │   │
│   │   │   ├── course/
│   │   │   │   ├── Lecturer, Course, CourseOffering + Repositories [D8]
│   │   │   │   ├── CatalogImportService.java, AdminCatalogController.java [D9]
│   │   │   │   ├── RubricCriterion.java + Repository [D10]
│   │   │   │   ├── CourseService.java, CourseController.java [D10]
│   │   │   │
│   │   │   ├── review/
│   │   │   │   ├── Review, ReviewScore, ReviewReport + Repositories [D12]
│   │   │   │   ├── ReviewService.java, ReviewView.java [D13]
│   │   │   │   ├── ReviewController.java       [D14]
│   │   │   │   ├── ReviewStatsRepository.java  [D15]
│   │   │   │   └── ModerationService.java + AdminModerationController [D16]
│   │   │   │
│   │   │   ├── analysis/                        (AI phân tích cảm xúc)
│   │   │   │   ├── AiClient.java (interface), LlmAiClient.java [D18]
│   │   │   │   ├── PromptTemplates.java        [D18]
│   │   │   │   ├── ReviewAnalysis.java + Repository [D19]
│   │   │   │   ├── AnalysisService.java        [D19]
│   │   │   │   ├── AnalysisScheduler.java      [D20]
│   │   │   │   ├── CourseSummary.java + Repository + Service [D21]
│   │   │   │   └── DashboardController.java    [D22]
│   │   │   │
│   │   │   ├── chat/                            (chatbot hỏi đáp)
│   │   │   │   ├── KbDocument.java, KbChunk.java + Repositories [D23]
│   │   │   │   ├── KnowledgeService.java       [D23]  chia nhỏ tài liệu thành đoạn
│   │   │   │   ├── AdminKnowledgeController.java [D23]
│   │   │   │   ├── RetrievalService.java       [D24]  MySQL FULLTEXT
│   │   │   │   ├── ChatService.java            [D24]
│   │   │   │   ├── ChatConversation, ChatMessage, UnansweredQuestion + Repositories [D25]
│   │   │   │   ├── RateLimiter.java            [D25]
│   │   │   │   └── ChatController.java         [D25]
│   │   │   │
│   │   │   └── alumni/
│   │   │       ├── AlumniProfile.java + Repository [D27]
│   │   │       ├── AlumniService.java, AdminAlumniController.java [D27]
│   │   │       ├── AlumniController.java       [D28]
│   │   │       └── TimelineEvent.java + Repository + Controller [D29]
│   │   │
│   │   └── resources/
│   │       ├── application.yml                 [D1]
│   │       ├── application-dev.yml             [D1]
│   │       ├── application-local.yml           (cá nhân, KHÔNG commit) [D1]
│   │       ├── application-prod.yml            [D31]
│   │       ├── moderation/blocked_words.txt    [D16]
│   │       ├── db/migration/
│   │       │   ├── V1__init_users.sql          [D2]
│   │       │   ├── V2__email_verification.sql  [D4]
│   │       │   ├── V3__catalog.sql             [D8]
│   │       │   ├── V4__rubric.sql              [D10]
│   │       │   ├── V5__reviews.sql             [D12]
│   │       │   ├── V6__review_analysis.sql     [D19]
│   │       │   ├── V7__course_summary.sql      [D21]
│   │       │   ├── V8__knowledge_base.sql      [D23]
│   │       │   ├── V9__chat.sql                [D25]
│   │       │   └── V10__alumni.sql             [D27]
│   │       └── static/                          (frontend HTML/CSS/JS)
│   │           ├── index.html                  [D2]
│   │           ├── css/style.css               [D2]
│   │           ├── js/
│   │           │   ├── api.js       (bọc fetch, gắn token, xử lý 401) [D2]
│   │           │   ├── layout.js    (thanh điều hướng dùng chung)    [D2]
│   │           │   ├── auth.js                 [D6]
│   │           │   ├── courses.js              [D10]
│   │           │   ├── review.js               [D14]
│   │           │   ├── dashboard.js            [D22]
│   │           │   ├── chat-widget.js          [D26]
│   │           │   └── alumni.js               [D28]
│   │           ├── register.html, verify.html, login.html [D6]
│   │           ├── courses.html, course-detail.html      [D10]
│   │           ├── dashboard.html                        [D22]
│   │           ├── alumni.html, alumni-profile.html      [D28]
│   │           ├── timeline.html                         [D29]
│   │           └── admin/
│   │               ├── import.html                       [D9]
│   │               ├── moderation.html                   [D16]
│   │               ├── knowledge.html, unanswered.html   [D23, D26]
│   │               └── alumni-approval.html              [D27]
│   └── test/java/vn/edu/hanu/fit/fithread/     [viết cùng từng phase]
└── docs/
    ├── demo_seed.sql                           [D30]
    └── chatbot_test_questions.md               [D26]
```

## 5. Mô hình dữ liệu và các route chính

### 5.1 Bảng dữ liệu

Tất cả bảng dùng `utf8mb4` và collation `utf8mb4_unicode_ci` (hỗ trợ tiếng Việt đầy đủ, tìm không dấu cũng khớp phần lớn trường hợp).

| Bảng | Cột chính | Ghi chú |
|---|---|---|
| `users` | id, email (unique), password_hash, full_name, role, status, cohort (khóa), created_at | `status` quyết định có được đăng nhập hay không |
| `email_verifications` | id, user_id, code_hash, expires_at, attempts, verified_at | OTP 6 số, hết hạn 15 phút, tối đa 5 lần thử |
| `lecturers` | id, full_name, department | |
| `courses` | id, code (unique), name, credits, description | |
| `course_offerings` | id, course_id, lecturer_id, semester (vd `2025-1`) | Đánh giá gắn vào một lần mở lớp cụ thể |
| `rubric_criteria` | id, code, name, description, sort_order | Ví dụ: nội dung, phương pháp, khối lượng bài tập, đánh giá công bằng, tính hữu ích |
| `reviews` | id, user_id, offering_id, comment, status, created_at | unique (user_id, offering_id); `user_id` không bao giờ ra giao diện |
| `review_scores` | review_id, criterion_id, score (1–5) | |
| `review_reports` | id, review_id, reporter_id, reason, created_at | Báo cáo nội dung không phù hợp |
| `review_analysis` | review_id, status (PENDING/DONE/FAILED), sentiment, score (-1..1), themes (JSON), summary, flagged | Kết quả AI cho từng đánh giá |
| `course_summaries` | course_id, semester, overall_sentiment, top_themes (JSON), summary, updated_at | Tổng hợp cho dashboard |
| `kb_documents` | id, title, category, source, content, updated_at | Kho tri thức cho chatbot (giới thiệu khoa, chương trình đào tạo, tuyển sinh, quy chế, lịch sử, giảng viên, hỏi đáp thường gặp...) |
| `kb_chunks` | id, document_id, chunk_index, content | Có **FULLTEXT index** trên `content` |
| `chat_conversations` | id (UUID), user_id (nullable), created_at | Khách chưa đăng nhập vẫn hỏi được |
| `chat_messages` | id, conversation_id, role (USER/BOT), content, sources (JSON), helpful (nullable), created_at | |
| `unanswered_questions` | id, question, created_at, resolved | Câu chatbot không trả lời được, để khoa bổ sung kho tri thức |
| `alumni_profiles` | user_id, company, position, industry, graduation_year, bio, linkedin_url, contact_visible | Chỉ hiển thị liên hệ khi alumni đồng ý |
| `timeline_events` | id, year, title, description | Dòng thời gian 20 năm |

### 5.2 Route chính

| Route | Quyền | Ngày |
|---|---|---|
| `POST /api/auth/register`, `/verify`, `/resend-otp`, `/login`, `GET /api/auth/me` | công khai (trừ `me`) | D4 · 04/10 |
| `GET /api/courses`, `GET /api/courses/{id}`, `GET /api/rubric` | đã đăng nhập | D6 · 06/10 |
| `POST /api/offerings/{id}/reviews`, `GET /api/courses/{id}/reviews`, `GET /api/courses/{id}/stats` | STUDENT, ALUMNI | D8 · 08/10 |
| `POST /api/reviews/{id}/report` | đã đăng nhập | D9 · 09/10 |
| `GET /api/dashboard/overview`, `GET /api/dashboard/courses/{id}` | FACULTY, ADMIN | D12 · 12/10 |
| `POST /api/chat`, `GET /api/chat/{conversationId}`, `POST /api/chat/messages/{id}/feedback` | công khai (có giới hạn tần suất) | D14 · 14/10 |
| `GET /api/alumni`, `GET /api/alumni/{id}`, `PUT /api/alumni/me` | đã đăng nhập | D16 · 16/10 |
| `GET /api/timeline` | công khai | D17 · 17/10 |
| `/api/admin/**` (nhập CSV, kiểm duyệt, kho tri thức, câu hỏi chưa trả lời, duyệt alumni) | ADMIN | D5, D9, D13, D15, D16 |

## 6. Kế hoạch theo ngày (20 ngày, 01/10 → 20/10)

Lịch này dồn hai đến ba ngày của bản kế hoạch gốc vào một ngày, nên mỗi ngày sẽ nặng hơn — nếu một ngày không xong hết, làm bù ngay hôm sau, đừng để dồn đến cuối tuần.

### Phase 0: Khởi tạo & nền tảng

**Ngày 1 – 01/10: Khởi tạo dự án + nền tảng chung**
- [ ] Tạo repo GitHub `fithread`, mời thành viên, bật bảo vệ nhánh `main` (bắt buộc Pull Request)
- [ ] Cả đội cài JDK 21, MySQL 8 (kèm MySQL Workbench/DBeaver) và IDE
- [ ] Mỗi người tạo database cục bộ `fithread` và `fithread_test` (utf8mb4, utf8mb4_unicode_ci)
- [ ] Tạo project tại start.spring.io: Web, Security, Data JPA, Validation, Mail, MySQL Driver, Flyway, Lombok, DevTools; thêm `flyway-mysql`
- [ ] `.gitignore` có `application-local.yml` (chứa mật khẩu DB, khóa API — không commit)
- [ ] `application.yml`, `application-dev.yml`, `application-local.yml`
- [ ] Chạy được `./mvnw spring-boot:run`, mở được `localhost:8080`
- [ ] `common/BaseEntity.java`, `BusinessException`, `ApiError`, `GlobalExceptionHandler`
- [ ] `config/AppProperties.java` (domain email, TTL OTP, cấu hình AI)
- [ ] `V1__init_users.sql`, kiểm tra Flyway chạy; endpoint thử `GET /api/health`
- [ ] Khung frontend: `static/index.html`, `css/style.css`, `js/api.js`, `js/layout.js`
- [ ] Đưa README này vào repo, điền bảng phân công (mục 2)
- [ ] Giao một bạn **thu thập nội dung cho chatbot** (giới thiệu khoa, chương trình đào tạo, tuyển sinh, quy chế, lịch sử 20 năm, giảng viên, hỏi đáp thường gặp); việc này chạy song song suốt các ngày sau, không chiếm ngày riêng

> **Cột mốc 0:** app chạy, kết nối MySQL, Flyway migrate thành công. Cập nhật bảng tiến độ.

### Phase 1: Đăng ký, xác thực email, đăng nhập

**Ngày 2 – 02/10: Người dùng, đăng ký, xác thực email**
- [ ] `user/Role.java`, `user/UserStatus.java`, `User`, `UserRepository`
- [ ] `auth/SchoolEmail.java` + validator kiểm tra domain (xác nhận domain thật với khoa)
- [ ] `RegisterRequest`, `UserService.register(...)` (BCrypt, trạng thái `PENDING_EMAIL`)
- [ ] `V2__email_verification.sql`, `EmailVerificationToken` + repository
- [ ] `MailService` (`@Async`), `EmailVerificationService` (OTP 6 số, băm, hết hạn 15 phút, tối đa 5 lần thử)
- [ ] Kiểm tra OTP nhận được qua Mailtrap/Gmail SMTP

**Ngày 3 – 03/10: Spring Security + JWT**
- [ ] Thêm `jjwt-api/impl/jackson`
- [ ] `JwtService`, `JwtAuthFilter`, `CustomUserDetailsService`
- [ ] `SecurityConfig`: stateless, mở `/api/auth/**` và file tĩnh, phân quyền theo mục 5.2
- [ ] Chỉ cho đăng nhập khi `status = ACTIVE`

**Ngày 4 – 04/10: API + giao diện xác thực, kiểm thử**
- [ ] `AuthController`: register, verify, resend-otp (cooldown 60s), login, me
- [ ] `register.html`, `verify.html`, `login.html`, `js/auth.js`
- [ ] Thanh điều hướng đổi theo trạng thái đăng nhập
- [ ] Unit test + test tích hợp luồng đăng ký → xác thực → đăng nhập
- [ ] Review chéo, merge vào `main`

> **Cột mốc 1:** đăng ký bằng email trường, nhận OTP, đăng nhập được. Tag `v0.1-auth`.

### Phase 2: Danh mục môn học & giảng viên

**Ngày 5 – 05/10: Mô hình danh mục + nhập dữ liệu**
- [ ] `V3__catalog.sql` (lecturers, courses, course_offerings) + entity + repository
- [ ] `CatalogImportService` đọc CSV, `AdminCatalogController`, `admin/import.html`
- [ ] Chuẩn bị `sample_courses.csv` (xin dữ liệu thật từ khoa nếu có)

**Ngày 6 – 06/10: Rubric, tìm kiếm môn học, kiểm thử**
- [ ] `V4__rubric.sql` (5 tiêu chí mặc định), `RubricCriterion` + repository
- [ ] `CourseService` (tìm kiếm, lọc học kỳ, phân trang), `CourseController`
- [ ] `courses.html`, `course-detail.html`, `js/courses.js`
- [ ] Test `CourseService` và import CSV; review chéo, merge

> **Cột mốc 2:** có vài chục môn/giảng viên mẫu, tìm kiếm chạy mượt. Tag `v0.2-catalog`.

### Phase 3: Đánh giá môn học theo rubric

**Ngày 7 – 07/10: Mô hình + nghiệp vụ đánh giá**
- [ ] `V5__reviews.sql` (reviews, review_scores, review_reports) + entity + repository
- [ ] `ReviewService`: một người/một đánh giá mỗi offering, đủ điểm mọi tiêu chí, nhận xét 20–2000 ký tự
- [ ] `ReviewView` (DTO **không chứa thông tin người viết**); trạng thái `PUBLISHED`/`PENDING_MODERATION`/`HIDDEN`

**Ngày 8 – 08/10: API, form, hiển thị thống kê**
- [ ] `ReviewController`: gửi đánh giá, xem đánh giá theo môn
- [ ] Form đánh giá trong `course-detail.html`, `js/review.js`
- [ ] `ReviewStatsRepository`, biểu đồ Chart.js, ngưỡng ≥5 đánh giá mới hiện thống kê theo giảng viên

**Ngày 9 – 09/10: Kiểm duyệt, kiểm thử**
- [ ] `moderation/blocked_words.txt`, `ModerationService`
- [ ] Nút báo cáo đánh giá, `AdminModerationController`, `admin/moderation.html`
- [ ] Test quy tắc một-người-một-đánh-giá, ẩn danh, ngưỡng hiển thị; review chéo, merge

> **Cột mốc 3:** gửi/xem đánh giá ẩn danh, admin kiểm duyệt được. Tag `v0.3-review`.

### Phase 4: AI phân tích cảm xúc & dashboard

**Ngày 10 – 10/10: Kết nối AI + phân tích bất đồng bộ**
- [ ] `AiClient`, `LlmAiClient` (`RestClient`), khóa API trong `application-local.yml`
- [ ] `PromptTemplates`: trả JSON `sentiment`, `score`, `themes`, `summary`, `flagged`
- [ ] `V6__review_analysis.sql`, `ReviewAnalysis` + repository
- [ ] `AsyncConfig`, `AnalysisService` (tạo `PENDING` sau khi commit đánh giá, xử lý nền); lỗi AI không được làm hỏng việc gửi đánh giá

**Ngày 11 – 11/10: Độ tin cậy + tổng hợp theo môn**
- [ ] `AnalysisScheduler` (`@Scheduled`) thử lại `PENDING`/`FAILED`, timeout, giới hạn số lần thử
- [ ] Unit test `AnalysisService` với `AiClient` giả
- [ ] `V7__course_summary.sql`, `CourseSummary` + repository + service (gộp chủ đề, xếp hạng)

**Ngày 12 – 12/10: Dashboard cho khoa**
- [ ] `DashboardController` (chỉ FACULTY/ADMIN)
- [ ] `dashboard.html`, `js/dashboard.js`: cảm xúc theo học kỳ, top chủ đề, môn cần chú ý
- [ ] Review chéo, merge

> **Cột mốc 4:** đánh giá mới tự động được AI phân tích, hiện trên dashboard. Tag `v0.4-ai`.

### Phase 5: Chatbot hỏi đáp về khoa, trường

**Ngày 13 – 13/10: Kho tri thức + truy xuất**
- [ ] `V8__knowledge_base.sql` (`kb_documents`, `kb_chunks` có FULLTEXT index)
- [ ] `KnowledgeService` (chia tài liệu thành đoạn ~500–800 từ), `AdminKnowledgeController`, `admin/knowledge.html`
- [ ] Nạp tài liệu đã thu thập từ Ngày 1 vào kho tri thức
- [ ] `RetrievalService` (`MATCH...AGAINST`, lấy 3–5 đoạn tốt nhất)

**Ngày 14 – 14/10: Trả lời + API chatbot**
- [ ] Prompt hệ thống: chỉ trả lời dựa trên ngữ cảnh, tiếng Việt, nêu nguồn, nói thẳng khi chưa có thông tin, không bịa
- [ ] `ChatService.ask(...)`: truy xuất → ghép prompt → gọi AI
- [ ] `V9__chat.sql` (`chat_conversations`, `chat_messages`, `unanswered_questions`)
- [ ] `RateLimiter`, `ChatController` (hỏi, lấy lịch sử, phản hồi hữu ích/không); câu không trả lời được ghi vào `unanswered_questions`

**Ngày 15 – 15/10: Giao diện + kiểm thử chatbot**
- [ ] `js/chat-widget.js` + CSS (nút chat nổi, cửa sổ hội thoại, hiển thị nguồn)
- [ ] Nhúng widget vào mọi trang qua `layout.js`
- [ ] `admin/unanswered.html`
- [ ] `docs/chatbot_test_questions.md` (~20 câu hỏi mẫu), kiểm tra chất lượng, chỉnh prompt; review chéo, merge

> **Cột mốc 5:** chatbot trả lời đúng từ kho tri thức, biết từ chối khi không có thông tin. Tag `v0.5-chatbot`.

### Phase 6: Alumni network

**Ngày 16 – 16/10: Hồ sơ + danh bạ alumni**
- [ ] `V10__alumni.sql`, `AlumniProfile` + repository
- [ ] Đăng ký alumni bằng email cá nhân (`PENDING_APPROVAL`), `AdminAlumniController`, `admin/alumni-approval.html`
- [ ] `AlumniController` (tìm kiếm, lọc ngành nghề/công ty/năm tốt nghiệp), `alumni.html`, `alumni-profile.html`, `js/alumni.js`
- [ ] Tùy chọn hiển thị liên hệ (`contact_visible`)

**Ngày 17 – 17/10: Dòng thời gian + kiểm thử**
- [ ] `TimelineEvent` + repository + controller, `timeline.html`
- [ ] Test luồng duyệt alumni và tìm kiếm; review chéo, merge

> **Cột mốc 6:** tìm được alumni, xem được dòng thời gian 20 năm. Tag `v0.6-alumni`.

### Đệm, test tổng thể (Ngày 18–19)

**Ngày 18 – 18/10: Rà soát toàn bộ**
- [ ] Chạy hết [Checklist demo](#8-checklist-demo), ghi lại mọi lỗi gặp phải
- [ ] Sửa lỗi ưu tiên theo mức nghiêm trọng (lỗi chặn luồng chính trước)
- [ ] Rà giao diện trên điện thoại, các trạng thái rỗng/lỗi

**Ngày 19 – 19/10: Sửa lỗi còn lại + dữ liệu demo**
- [ ] Tiếp tục sửa lỗi từ Ngày 18
- [ ] `docs/demo_seed.sql`: tài khoản mẫu, môn học, đánh giá, alumni, kho tri thức
- [ ] Chạy lại toàn bộ checklist demo một lần cuối

### Chốt mốc 80–90% (Ngày 20 – 20/10)

- [ ] Chạy checklist demo lần cuối, xác nhận toàn bộ Phase 0–6 hoạt động ổn định
- [ ] Gắn tag Git `v0.9`
- [ ] Liệt kê rõ trong Issues (hoặc dưới đây) phần 10–20% còn thiếu — thường là: triển khai lên máy chủ thật, chuẩn bị kịch bản demo, đánh bóng giao diện cuối, sao lưu dữ liệu
- [ ] Họp cả đội: xác nhận deadline nộp thật, lên lịch Phase 7 cho những ngày còn lại

> Việc còn thiếu sau mốc này (điền tay khi biết):
> - `______________________________`
> - `______________________________`

### Phase 7: Hoàn thiện, triển khai, demo (sau 20/10)

Nội dung Phase 7 giữ nguyên như phần dưới, làm trong số ngày còn lại tới deadline nộp thật:

- [ ] **Triển khai (không Docker):** build `./mvnw -DskipTests package`; chuẩn bị máy chủ (VPS hoặc máy khoa) cài Java 21 + MySQL 8; `application-prod.yml` + biến môi trường; chạy `java -jar` qua `systemd`; Nginx + HTTPS; kiểm tra email thật. *Dự phòng:* chạy trên laptop một thành viên nếu chưa có máy chủ
- [ ] **Kiểm thử cuối:** chạy lại checklist demo trên bản chạy thật; `mysqldump` sao lưu và thử khôi phục
- [ ] **Chuẩn bị trình bày:** kịch bản demo 3–5 phút, chia người nói, quay video demo dự phòng, hoàn thiện slide/báo cáo nộp

> **Cột mốc 7:** bản chạy ổn định, có video và kịch bản demo. Tag `v1.0`.

## 7. Quy ước làm việc

- **Nhánh:** `feature/<ten-tinh-nang>` cho mỗi việc; không commit trực tiếp vào `main`.
- **Commit:** `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`, `refactor: ...`.
- **Pull Request:** ít nhất một người khác review trước khi merge.
- **Họp nhanh 10–15 phút** mỗi ngày: hôm qua xong gì, hôm nay làm gì, đang vướng gì.
- **Migration Flyway:** số phiên bản đã được ấn định sẵn ở mục 4. **Không sửa file migration đã merge**, cần đổi thì tạo migration mới. Tránh hai người cùng tạo một số phiên bản.
- **Bảo mật frontend thuần JS:** mọi nội dung do người dùng nhập (đánh giá, hồ sơ alumni, câu hỏi chatbot) khi hiển thị phải dùng `textContent`, **không dùng `innerHTML`**, để tránh tấn công XSS.
- **Bảo mật chung:** không commit khóa API hay mật khẩu; mật khẩu chỉ lưu BCrypt; không log nội dung đánh giá hay email; không trả `user_id` của người viết đánh giá ra bất kỳ JSON nào.
- **Chi phí AI:** đặt giới hạn số lần gọi mỗi ngày, giới hạn tần suất chatbot, cache kết quả và không phân tích lại đánh giá đã có kết quả.
- **Nội dung chatbot:** chỉ dùng thông tin công khai hoặc đã được khoa cho phép; chatbot phải trả lời kèm nguồn và biết nói "chưa có thông tin".

## 8. Checklist demo

- [ ] Đăng ký bằng email trường, nhận OTP, đăng nhập
- [ ] Tìm một môn học, xem chi tiết
- [ ] Gửi một đánh giá có rubric và nhận xét
- [ ] Đánh giá mới được AI phân tích, xuất hiện trên dashboard
- [ ] Dashboard hiển thị cảm xúc, chủ đề nổi bật, môn cần chú ý
- [ ] Chatbot trả lời đúng ít nhất 5 câu hỏi về khoa, trường và từ chối hợp lý một câu ngoài phạm vi
- [ ] Câu hỏi chatbot không trả lời được xuất hiện trong trang admin
- [ ] Tìm alumni theo ngành nghề và xem hồ sơ
- [ ] Trang dòng thời gian 20 năm hoạt động
- [ ] Admin kiểm duyệt được một đánh giá bị báo cáo
- [ ] Không có chỗ nào lộ danh tính người viết đánh giá
- [ ] Bản chạy online truy cập được từ điện thoại

## 9. Nếu bị trễ (thứ tự cắt giảm)

Cắt từ trên xuống, dừng khi kịp tiến độ:

1. Nút phản hồi hữu ích/không và trang `unanswered.html` của chatbot
2. Trang dòng thời gian 20 năm
3. Tóm tắt tổng hợp theo môn (`CourseSummary`), dashboard chỉ dùng kết quả từng đánh giá
4. Trang admin kiểm duyệt (giữ lọc từ ngữ tự động)
5. Chỉnh sửa hồ sơ alumni và tùy chọn hiển thị liên hệ (giữ danh bạ chỉ để xem)

**Không được cắt:** xác thực email, đánh giá theo rubric ẩn danh, AI phân tích cảm xúc, dashboard cơ bản, chatbot hỏi đáp cơ bản, danh bạ alumni. Đây là lõi của sản phẩm.
