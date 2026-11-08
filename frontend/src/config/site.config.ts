export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  links: Record<string, string>;
};

export const siteConfig: SiteConfig = {
  name: "Travora",
  description: "Discover trusted travel agencies and unforgettable journeys.",
  url: "https://www.travora.com",
  links: {
    github: "https://github.com/travora/travora",
  },
};
