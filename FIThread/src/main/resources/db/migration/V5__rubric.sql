CREATE TABLE rubric_criteria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rubric_criteria (code, name, description, sort_order) VALUES
('CONTENT',    'Nội dung & mục tiêu môn học', 'Mục tiêu rõ ràng; nội dung đầy đủ, logic, cập nhật và phù hợp với mục tiêu', 1),
('TEACHING',   'Phương pháp giảng dạy',       'Cách giảng dễ hiểu, đa dạng, khuyến khích sinh viên tham gia', 2),
('MATERIALS',  'Tài liệu học tập',            'Slide, giáo trình, tài liệu tham khảo đầy đủ và dễ sử dụng', 3),
('PRACTICE',   'Hoạt động thực hành',         'Bài tập, lab, project có tính thực tế và giúp áp dụng kiến thức', 4),
('ASSESSMENT', 'Đánh giá & kiểm tra',         'Quiz, assignment, giữa kỳ, cuối kỳ phù hợp với nội dung đã học và đánh giá đúng năng lực', 5),
('SUPPORT',    'Tương tác & hỗ trợ',          'Giảng viên giải đáp thắc mắc, phản hồi bài tập và hỗ trợ sinh viên', 6);