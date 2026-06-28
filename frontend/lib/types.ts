// TypeScript types mirroring backend Pydantic models

export interface Source {
  id: string;
  user_id: string;
  title: string;
  source_type: "write" | "paste" | "upload";
  raw_content: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  source_url: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface Note {
  id: string;
  user_id: string;
  source_id: string | null;
  title: string;
  content: string;
  word_count: number;
  created_at: string;
  updated_at: string;
  tags: string[];
  source_title: string | null;
}

export interface Summary {
  id: string;
  user_id: string;
  source_id: string;
  prompt_template_id: string | null;
  prompt_text_used: string | null;
  content: string;
  created_at: string;
  prompt_name: string | null;
}

export interface PromptTemplate {
  id: string;
  user_id: string;
  name: string;
  prompt_text: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Concept {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  synthesized_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  user_id: string;
  node_a_id: string;
  node_a_type: NodeType;
  node_b_id: string;
  node_b_type: NodeType;
  relationship_type: string | null;
  strength: "strong" | "moderate" | "weak";
  status: "suggested" | "confirmed" | "rejected";
  ai_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  slug: string | null;
  status: ArticleStatus;
  visibility: "public" | "unlisted";
  excerpt: string | null;
  cover_image_path: string | null;
  published_at: string | null;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleSection {
  id: string;
  user_id: string;
  article_id: string;
  position: number;
  title: string;
  brief: string | null;
  content: string | null;
  status: SectionStatus;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export interface ArticleSectionRef {
  id: string;
  section_id: string;
  ref_id: string;
  ref_type: "source" | "note" | "summary";
  position: number;
  created_at: string;
}

export interface Engagement {
  id: string;
  article_id: string;
  engagement_type: EngagementType;
  format: string | null;
  platform: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_notes: number;
  total_sources: number;
  total_connections: number;
  total_articles: number;
  total_views: number;
}

// Enums
export type NodeType = "source" | "note" | "summary" | "article" | "concept";
export type ArticleStatus = "outline" | "draft" | "review" | "published";
export type SectionStatus = "outline" | "writing" | "ai_drafted" | "written";
export type EngagementType = "view" | "like" | "save" | "share" | "download";
