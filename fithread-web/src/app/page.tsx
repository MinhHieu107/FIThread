export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-brand-darker text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm">
              Faculty of Information Technology · HANU
            </p>

            <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
              Chào mừng đến với FIThread
            </h1>

            <p className="mb-8 max-w-xl text-base leading-7 text-white/80 md:text-lg">
              Không gian kết nối sinh viên, cựu sinh viên và cộng đồng
              Công nghệ thông tin – nơi chia sẻ kiến thức, đánh giá môn học
              và giải đáp thắc mắc.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="/forum"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-brand-darker transition hover:bg-white/90"
              >
                Khám phá diễn đàn
              </a>

              <a
                href="#about"
                className="rounded-lg border border-white/40 px-6 py-3 font-semibold transition hover:bg-white/10"
              >
                Tìm hiểu về khoa
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-white/10 blur-xl" />
            <img
              src="/images/it-banner.webp"
              alt="Không gian học tập và làm việc trong lĩnh vực Công nghệ thông tin"
              className="relative h-72 w-full rounded-2xl object-cover shadow-2xl md:h-96"
            />
          </div>
        </div>
      </section>

      {/* Introduction section */}
      <section id="about" className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-darker">
            About the Faculty
          </p>

          <h2 className="mb-5 text-3xl font-bold text-brand-darker md:text-4xl">
            Giới thiệu Khoa Công nghệ thông tin
          </h2>

          <p className="leading-8 text-ink-muted">
            Được thành lập năm 2006, Khoa Công nghệ thông tin – Trường Đại học
            Hà Nội từng bước phát triển và khẳng định uy tín, trở thành một
            trong những khoa chiến lược của nhà trường.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-xl text-brand-darker">
              <span aria-hidden="true">🌐</span>
            </div>
            <h3 className="mb-3 text-lg font-bold text-brand-darker">
              Đào tạo bằng tiếng Anh
            </h3>
            <p className="leading-7 text-ink-muted">
              Chuyên ngành Công nghệ thông tin được giảng dạy hoàn toàn bằng
              tiếng Anh, giúp sinh viên phát triển kiến thức chuyên môn cùng
              khả năng giao tiếp và thuyết trình.
            </p>
          </article>

          <article className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-xl text-brand-darker">
              <span aria-hidden="true">📚</span>
            </div>
            <h3 className="mb-3 text-lg font-bold text-brand-darker">
              Chương trình chuẩn quốc tế
            </h3>
            <p className="leading-7 text-ink-muted">
              Chương trình đào tạo được thiết kế theo tiêu chuẩn quốc tế,
              có tính liên thông cao và tham khảo các chương trình giáo dục
              của Hiệp hội Máy tính Hoa Kỳ (ACM).
            </p>
          </article>

          <article className="rounded-2xl border border-gray-100 bg-gray-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-xl text-brand-darker">
              <span aria-hidden="true">💡</span>
            </div>
            <h3 className="mb-3 text-lg font-bold text-brand-darker">
              Gắn với nhu cầu xã hội
            </h3>
            <p className="leading-7 text-ink-muted">
              Khoa hướng tới môi trường học tập và nghiên cứu chuyên nghiệp,
              chú trọng kiến thức công nghệ, hệ thống thông tin doanh nghiệp
              và khả năng đáp ứng yêu cầu thực tế.
            </p>
          </article>
        </div>
      </section>

      {/* Career section */}
      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand-darker">
              Future Opportunities
            </p>

            <h2 className="mb-5 text-3xl font-bold text-brand-darker">
              Sẵn sàng cho hành trình nghề nghiệp
            </h2>

            <p className="mb-4 leading-8 text-ink-muted">
              Với kiến thức vững vàng về công nghệ và hệ thống thông tin
              doanh nghiệp, cùng khả năng giao tiếp và thuyết trình bằng
              tiếng Anh, sinh viên có cơ hội phát triển nghề nghiệp trong
              lĩnh vực Công nghệ thông tin.
            </p>

            <p className="leading-8 text-ink-muted">
              Nội dung giới thiệu của khoa đề cập đến các tập đoàn công nghệ
              lớn như IBM, Microsoft và Intel như những ví dụ về môi trường
              nghề nghiệp tiềm năng.
            </p>
          </div>

          <div className="rounded-2xl bg-brand-darker p-8 text-white md:p-10">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-white/60">
              FIThread Community
            </p>

            <h3 className="mb-4 text-2xl font-bold">
              Kết nối để học hỏi và phát triển
            </h3>

            <p className="mb-7 leading-7 text-white/80">
              Chia sẻ trải nghiệm học tập, tham khảo đánh giá môn học,
              kết nối với cựu sinh viên và tìm kiếm câu trả lời cho
              những thắc mắc của bạn.
            </p>

            <a
              href="/forum"
              className="inline-flex rounded-lg bg-white px-5 py-3 font-semibold text-brand-darker transition hover:bg-white/90"
            >
              Đến với cộng đồng →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-6 text-center text-sm text-ink-muted">
        FIThread · Khoa Công nghệ thông tin – Trường Đại học Hà Nội
      </footer>
    </main>
  );
}