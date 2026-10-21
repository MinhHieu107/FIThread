package com.FIThread.FIThread.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    @Query("""
            select u from User u
            where (:pattern is null or lower(u.fullName) like :pattern or lower(u.email) like :pattern)
              and (:role is null or u.role = :role)
              and (:status is null or u.status = :status)
              and (:status is not null or u.status <> :deleted)
            """)
    Page<User> search(@Param("pattern") String pattern,
                      @Param("role") Role role,
                      @Param("status") UserStatus status,
                      @Param("deleted") UserStatus deleted,
                      Pageable pageable);

    @Query("""
            select u.cohort, count(u) from User u
            where u.role = :role and u.status = :status and u.cohort is not null and u.cohort <> ''
            group by u.cohort order by u.cohort
            """)
    List<Object[]> countStudentsByCohort(@Param("role") Role role, @Param("status") UserStatus status);

    List<User> findByRoleAndStatusAndCohortIgnoreCase(Role role, UserStatus status, String cohort);
}