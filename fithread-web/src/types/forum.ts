export interface PostView {
  id: number;
  parentId: number | null;
  rootId: number;
  authorId: number | null;
  authorName: string;
  authorRole: string | null;
  authorCohort: string | null;
  content: string;
  tags: string[];
  createdAt: string;
  edited: boolean;
  likeCount: number;
  likedByMe: boolean;
  replyCount: number;
  mine: boolean;
  status: string;
    imageIds: number[];
}

export interface PostPage {
  content: PostView[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface ThreadView {
  root: PostView;
  replies: PostView[];
}

export interface LikeResult {
  liked: boolean;
  likeCount: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface ForumModerationRow {
  id: number;
  rootId: number;
  authorName: string;
  content: string;
  status: string;
  createdAt: string;
  reportCount: number;
  reasons: string[];
  history: { action: string; reason: string | null; adminName: string; createdAt: string }[];
    imageIds: number[];
}
export interface FeaturedThread {
  root: PostView;
  featuredComment: PostView;
}