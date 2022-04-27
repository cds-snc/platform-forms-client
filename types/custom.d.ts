declare module "*.md" {
  const content: string;
  export default content;
}

declare module "*/VERSION" {
  const content: string;
  export default content;
}
