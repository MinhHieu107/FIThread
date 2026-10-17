package com.FIThread.FIThread.alumni;

import com.FIThread.FIThread.user.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, Long> {

    Optional<AlumniProfile> findByUserId(Long userId);

    Optional<AlumniProfile> findByIdAndUserStatus(Long id, UserStatus status);

    List<AlumniProfile> findByUserStatusOrderByCreatedAtAsc(UserStatus status);

    @Query(value = """
            select p from AlumniProfile p join fetch p.user u
            where u.status = :status
              and (:pattern is null or lower(u.fullName) like :pattern
                   or lower(p.company) like :pattern or lower(p.positionTitle) like :pattern)
              and (:industry is null or p.industry = :industry)
              and (:year is null or p.graduationYear = :year)
            """,
            countQuery = """
            select count(p) from AlumniProfile p join p.user u
            where u.status = :status
              and (:pattern is null or lower(u.fullName) like :pattern
                   or lower(p.company) like :pattern or lower(p.positionTitle) like :pattern)
              and (:industry is null or p.industry = :industry)
              and (:year is null or p.graduationYear = :year)
            """)
    Page<AlumniProfile> search(@Param("status") UserStatus status,
                               @Param("pattern") String pattern,
                               @Param("industry") String industry,
                               @Param("year") Integer year,
                               Pageable pageable);
}