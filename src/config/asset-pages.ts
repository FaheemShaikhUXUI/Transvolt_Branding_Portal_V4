export interface AssetPageConfig {
  slug: string
  title: string
  description: string
  emptyStateTitle: string
  emptyStateDescription: string
}

export const assetPagesConfig: Record<string, AssetPageConfig> = {
  "logo-color": {
    slug: "logo-color",
    title: "Official Logo & Color theme",
    description: "The Transvolt logo is the most important visual asset of the brand and must be used consistently across all digital and print applications. Always use only the officially approved logo files provided by Transvolt. Do not recreate, redraw, modify, or substitute the logo with any alternative version. The logo's colors, proportions, dimensions, spacing, typography, and overall composition must remain exactly as approved. Never alter the logo by changing its colors, stretching, compressing, rotating, adding effects, outlines, shadows, gradients, or any other visual modifications.\n\nUse the logo only in its approved formats and maintain the original aspect ratio at all times while resizing. Ensure sufficient clear space around the logo so that it remains prominent and legible without interference from surrounding elements. Select the appropriate logo version based on the background to achieve maximum visibility and brand consistency. The logos listed below represent the final approved versions and are the only authorized assets for use across websites, mobile applications, presentations, marketing materials, social media, vehicle branding, signage, merchandise, and all other brand touchpoints. Any deviation from these approved standards is not permitted.",
    emptyStateTitle: "No logos or colors found",
    emptyStateDescription: "Get started by adding your first logo or color asset.",
  },
  "typography": {
    slug: "typography",
    title: "Typography",
    description: "Official corporate typefaces, font standards, and usage guidelines across Transvolt.",
    emptyStateTitle: "No typography assets found",
    emptyStateDescription: "Review approved fonts and type specifications.",
  },
  "brand-philosophy": {
    slug: "brand-philosophy",
    title: "Brand Philosophy",
    description: "Powering the transition to a cleaner future through zero-emission mobility, sustainable innovation, and continuous progress.",
    emptyStateTitle: "Brand Philosophy",
    emptyStateDescription: "Core values, logo symbolism, and future vision.",
  },
  "letterhead": {
    slug: "letterhead",
    title: "Official Letterhead",
    description: "The Transvolt letterhead is an official corporate identity asset used for formal communication across all departments, business units, subsidiaries, and authorized representatives of the company. Since Transvolt operates through multiple functions and locations, there may be different approved letterhead designs for specific legal entities, departments, regional offices, or business purposes. Each letterhead has been officially designed and approved for its intended use and must be used only in the appropriate context.\n\nAlways use the officially approved Transvolt letterhead provided by the Branding or Corporate Communications team. Do not create, redesign, modify, or replicate the letterhead using your own layouts, colors, logos, typography, or graphic elements. Any alteration to the approved design—including changes to the logo, colors, margins, header, footer, contact details, typography, spacing, or document structure—is strictly prohibited.\n\nBefore issuing any official communication, ensure that the correct letterhead version is selected based on the company entity, department, office location, or business purpose. Using an incorrect or unauthorized letterhead may result in misrepresentation of the company and could lead to the document being considered unofficial or invalid.\n\nOnly documents issued on approved Transvolt letterheads should be treated as official corporate communications. Any document prepared on an unapproved, modified, or self-designed letterhead shall not be considered an official Transvolt document and may be rejected by internal teams, clients, vendors, government authorities, or other stakeholders.",
    emptyStateTitle: "No letterheads found",
    emptyStateDescription: "Add official letterheads for company correspondence.",
  },
  "presentation": {
    slug: "presentation",
    title: "Transvolt's Official Presentation",
    description: "Presentations are one of the primary communication tools used by Transvolt to represent the company before clients, investors, government authorities, partners, vendors, employees, and other stakeholders. Every presentation should reflect a consistent, professional, and unified brand identity while effectively communicating information. Whether it is a corporate profile, business proposal, investor deck, project update, sales presentation, technical presentation, training material, or internal meeting, all presentations must follow the official Transvolt presentation standards.\n\nAlways use the officially approved Transvolt PowerPoint (PPT) template provided by the Branding or Corporate Communications team. The approved template includes the correct logo placement, brand colors, typography, layouts, icons, and graphic elements that represent the company's visual identity. Do not create your own presentation design or modify the approved template by changing its layout, colors, fonts, logo position, or branding elements.\n\nPresentations should maintain a clean, modern, and professional appearance. Content should be concise, well-structured, and supported by high-quality visuals, diagrams, icons, charts, and images wherever appropriate. Avoid overcrowding slides with excessive text, inconsistent formatting, or unapproved design elements. Every presentation should be easy to read, visually balanced, and aligned with Transvolt's brand standards.\n\nWhen creating presentations, use the approved Poppins typeface for headings, sub-headings, and body content, along with the official brand color palette. Maintain consistent spacing, alignment, typography hierarchy, and visual style throughout the presentation. Images, illustrations, and graphics should be high resolution and relevant to the subject matter, while ensuring they reinforce the company's innovation, sustainability, and technology-driven identity.",
    emptyStateTitle: "No presentations found",
    emptyStateDescription: "Upload your first presentation template.",
  },
  "digital-assets": {
    slug: "digital-assets",
    title: "Digital Assets",
    description: "Digital assets play a vital role in maintaining Transvolt's brand presence across online platforms and digital communication channels. Every digital creative represents the company's identity and should communicate a consistent, professional, and modern visual experience. Whether the asset is published internally or externally, it must align with the official Transvolt Brand Guidelines to ensure brand consistency and credibility.\n\nThe Digital Assets library includes all approved graphics and templates used for digital communication, such as social media posts, emailers, newsletters, website banners, digital advertisements, web graphics, app banners, presentation visuals, digital brochures, event creatives, recruitment posts, festive greetings, announcements, corporate updates, and other online marketing materials. These assets have been designed using the official Transvolt logo, color palette, typography, icons, and visual elements to maintain a unified brand identity.\n\nAlways use the officially approved digital asset templates available through the Transvolt Brand Portal or internal repository. Do not create your own design style or modify the approved templates by changing the logo, colors, typography, icons, layouts, or other branding elements without prior approval from the Branding or Corporate Communications team.\n\nAll digital creatives should be visually clean, high quality, and optimized for their intended platform while preserving the consistency of the Transvolt brand. Images, illustrations, icons, and graphics should be relevant, professional, and support the company's vision of innovation, sustainability, and technology.",
    emptyStateTitle: "No digital assets found",
    emptyStateDescription: "Add your digital marketing assets here.",
  },
  "printing-assets": {
    slug: "printing-assets",
    title: "Printing Assets",
    description: "Manage brochures, flyers, and other print-ready materials.",
    emptyStateTitle: "No printing assets found",
    emptyStateDescription: "Upload print-ready files here.",
  },
  "id-business-cards": {
    slug: "id-business-cards",
    title: "ID Cards & Business Cards",
    description: "Official identification cards and business card templates for authorized Transvolt personnel.",
    emptyStateTitle: "No ID cards or business cards found",
    emptyStateDescription: "Add official ID cards and business card templates here.",
  },
  "vehicle-branding": {
    slug: "vehicle-branding",
    title: "Vehicle Branding",
    description: "Manage decals, wraps, and guidelines for vehicle branding.",
    emptyStateTitle: "No vehicle branding found",
    emptyStateDescription: "Add vehicle branding assets.",
  },
  "charger-branding": {
    slug: "charger-branding",
    title: "Charger Branding",
    description: "Manage EV charger branding designs and specifications.",
    emptyStateTitle: "No charger branding found",
    emptyStateDescription: "Add EV charger branding assets.",
  },
  "photos": {
    slug: "photos",
    title: "Photos and Videos Repository",
    description: "Manage official company photography, video libraries and media assets.",
    emptyStateTitle: "No photos or videos found",
    emptyStateDescription: "Upload official company photography and video assets.",
  },
}
