package com.FIThread.FIThread.forum;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ForumLikeRepository extends JpaRepository<ForumLike, Long> {

    boolean existsByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostIdAndUserId(Long postId, Long userId);

    void deleteByPostId(Long postId);

    void deleteByUserId(Long userId);

    long countByPostId(Long postId);

    @Query("select l.postId, count(l) from ForumLike l where l.postId in :ids group by l.postId")
    List<Object[]> countByPostIds(@Param("ids") Collection<Long> ids);

    @Query("select l.postId from ForumLike l where l.userId = :userId and l.postId in :ids")
    List<Long> likedPostIds(@Param("userId") Long userId, @Param("ids") Collection<Long> ids);
}