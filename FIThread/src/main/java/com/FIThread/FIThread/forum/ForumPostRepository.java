package com.FIThread.FIThread.forum;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.PageRequest;
import java.util.Collection;
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {

    @Query(value = """
            select distinct p from ForumPost p left join p.tags t
            where p.parentId is null and p.status = :status
              and (:pattern is null or lower(p.content) like :pattern)
              and (:tag is null or t = :tag)
            """,
            countQuery = """
            select count(distinct p) from ForumPost p left join p.tags t
            where p.parentId is null and p.status = :status
              and (:pattern is null or lower(p.content) like :pattern)
              and (:tag is null or t = :tag)
            """)
    Page<ForumPost> searchRoots(@Param("status") ForumPostStatus status,
                                @Param("pattern") String pattern,
                                @Param("tag") String tag,
                                Pageable pageable);

    @Query("""
            select p from ForumPost p
            where p.author.id = :userId and p.parentId is null and p.status <> :deleted
            """)
    Page<ForumPost> findMineRoots(@Param("userId") Long userId,
                                  @Param("deleted") ForumPostStatus deleted,
                                  Pageable pageable);

    List<ForumPost> findByRootIdAndStatusInOrderByCreatedAtAscIdAsc(Long rootId, Collection<ForumPostStatus> statuses);

    boolean existsByParentId(Long parentId);

    List<ForumPost> findByAuthorId(Long authorId);

    /** [rootId, so tra loi dang hien thi] */
    @Query("""
            select p.rootId, count(p) from ForumPost p
            where p.rootId in :ids and p.status = :status
            group by p.rootId
            """)
    List<Object[]> countRepliesByRoot(@Param("ids") Collection<Long> ids, @Param("status") ForumPostStatus status);

    /** [tag, so bai goc] */
    @Query("""
            select t, count(p) from ForumPost p join p.tags t
            where p.parentId is null and p.status = :status
            group by t order by count(p) desc, t asc
            """)
    List<Object[]> trendingTags(@Param("status") ForumPostStatus status, Pageable pageable);

    List<ForumPost> findByStatusOrderByCreatedAtDesc(ForumPostStatus status, Pageable pageable);

    @Query("""
            select p from ForumPost p
            where p.status = :status and exists (select 1 from ForumReport r where r.postId = p.id)
            order by p.createdAt desc
            """)
    List<ForumPost> findReported(@Param("status") ForumPostStatus status, Pageable pageable);

    /**
     * Bình luận đã xuất bản, thuộc bài viết gốc đã xuất bản,
     * sắp xếp theo số lượt thích giảm dần.
     */
    @Query("""
        select p, (
            select count(l)
            from ForumLike l
            where l.postId = p.id
        )
        from ForumPost p
        where p.parentId is not null
          and p.rootId is not null
          and p.status = :replyStatus
          and (
                  select count(l)
                  from ForumLike l
                  where l.postId = p.id
              ) > 0
          and exists (
              select r.id
              from ForumPost r
              where r.id = p.rootId
                and r.parentId is null
                and r.status = :rootStatus
          )
        order by (
            select count(l)
            from ForumLike l
            where l.postId = p.id
        ) desc, p.createdAt desc, p.id desc
        """)
    List<Object[]> findFeaturedComments(
            @Param("replyStatus") ForumPostStatus replyStatus,
            @Param("rootStatus") ForumPostStatus rootStatus,
            Pageable pageable
    );
}