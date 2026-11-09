package com.FIThread.FIThread.forum;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ForumImageRepository extends JpaRepository<ForumImage, Long> {

    List<ForumImage> findByPostIdInOrderBySortOrderAscIdAsc(Collection<Long> postIds);

    List<ForumImage> findByPostId(Long postId);

    boolean existsByPostId(Long postId);
}