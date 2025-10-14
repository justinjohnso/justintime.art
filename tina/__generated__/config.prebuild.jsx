// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  // Get this from tina.io
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public"
    }
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      {
        name: "projects",
        label: "Projects",
        path: "src/content/projects",
        format: "mdx",
        ui: {
          router: ({ document }) => {
            const slug = document._sys.filename.replace(/\.mdx$/, "");
            return `/projects/${slug}`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "image",
            name: "image",
            label: "Featured Image"
          },
          {
            type: "string",
            name: "mediaEmbed",
            label: "Media Embed URL",
            description: "Full embed URL for Vimeo, YouTube, or SoundCloud (e.g., https://w.soundcloud.com/player/?url=...)",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "categories",
            label: "Categories",
            list: true
          },
          {
            type: "boolean",
            name: "featured",
            label: "Featured Project"
          },
          {
            type: "datetime",
            name: "dateCompleted",
            label: "Date Completed",
            ui: {
              dateFormat: "YYYY-MM-DD"
            }
          },
          {
            type: "number",
            name: "yearCompleted",
            label: "Year Completed"
          },
          {
            type: "object",
            name: "links",
            label: "Project Links",
            list: true,
            fields: [
              {
                type: "string",
                name: "title",
                label: "Link Title"
              },
              {
                type: "string",
                name: "url",
                label: "URL"
              },
              {
                type: "string",
                name: "type",
                label: "Link Type",
                options: ["github", "live", "demo", "other"]
              }
            ]
          },
          {
            type: "image",
            name: "additionalImages",
            label: "Additional Images",
            list: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content",
            isBody: true,
            templates: [
              {
                name: "Banner",
                label: "Banner",
                fields: [
                  {
                    type: "string",
                    name: "heading",
                    label: "Heading"
                  },
                  {
                    type: "string",
                    name: "subheading",
                    label: "Subheading"
                  }
                ]
              },
              {
                name: "MediaBlock",
                label: "Media Block",
                fields: [
                  {
                    type: "image",
                    name: "media",
                    label: "Media"
                  },
                  {
                    type: "string",
                    name: "caption",
                    label: "Caption"
                  }
                ]
              },
              {
                name: "CodeBlock",
                label: "Code Block",
                fields: [
                  {
                    type: "string",
                    name: "language",
                    label: "Language"
                  },
                  {
                    type: "string",
                    name: "code",
                    label: "Code",
                    ui: {
                      component: "textarea"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "posts",
        label: "Posts",
        path: "src/content/posts",
        format: "mdx",
        ui: {
          router: ({ document }) => {
            const slug = document._sys.filename.replace(/\.mdx$/, "");
            return `/posts/${slug}`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea"
            }
          },
          {
            type: "image",
            name: "heroImage",
            label: "Hero Image"
          },
          {
            type: "datetime",
            name: "publishedAt",
            label: "Published Date",
            ui: {
              dateFormat: "YYYY-MM-DD"
            }
          },
          {
            type: "string",
            name: "categories",
            label: "Categories",
            list: true
          },
          {
            type: "string",
            name: "relatedPosts",
            label: "Related Posts",
            list: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content",
            isBody: true,
            templates: [
              {
                name: "Banner",
                label: "Banner",
                fields: [
                  {
                    type: "string",
                    name: "heading",
                    label: "Heading"
                  },
                  {
                    type: "string",
                    name: "subheading",
                    label: "Subheading"
                  }
                ]
              },
              {
                name: "MediaBlock",
                label: "Media Block",
                fields: [
                  {
                    type: "image",
                    name: "media",
                    label: "Media"
                  },
                  {
                    type: "string",
                    name: "caption",
                    label: "Caption"
                  }
                ]
              },
              {
                name: "CodeBlock",
                label: "Code Block",
                fields: [
                  {
                    type: "string",
                    name: "language",
                    label: "Language"
                  },
                  {
                    type: "string",
                    name: "code",
                    label: "Code",
                    ui: {
                      component: "textarea"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "categories",
        label: "Categories",
        path: "src/content/categories",
        format: "md",
        ui: {
          router: ({ document }) => {
            const slug = document._sys.filename.replace(/\.md$/, "");
            return `/categories/${slug}`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: {
              component: "textarea"
            }
          }
        ]
      },
      {
        name: "pages",
        label: "Pages",
        path: "src/content/pages",
        format: "mdx",
        ui: {
          router: ({ document }) => {
            const slug = document._sys.filename.replace(/\.mdx$/, "");
            if (slug === "home") {
              return "/";
            }
            return `/${slug}`;
          }
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            required: true,
            ui: {
              component: "textarea"
            }
          },
          {
            type: "string",
            name: "featuredProjects",
            label: "Featured Projects",
            description: "Select projects to feature on the homepage (only visible on home page)",
            list: true,
            ui: {
              component: "list"
            }
          },
          {
            type: "rich-text",
            name: "body",
            label: "Page Content",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
