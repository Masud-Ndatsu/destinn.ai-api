export interface ParsedOpportunity {
  title: string;
  description: string;
  deadline: string | boolean;
  application_url: string;
  location: string;
  tags: string[];
  category_id: string;
  thumbnail_url: string;
}
